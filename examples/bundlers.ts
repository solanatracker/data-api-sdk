import { Client, Datastream, BundlerUpdate } from '@solana-tracker/data-api';
import { handleError } from './utils';

const client = new Client({
  apiKey: process.env.SOLANA_TRACKER_API_KEY || 'YOUR_API_KEY_HERE'
});

const dataStream = new Datastream({
  wsUrl: 'YOUR_WS_URL', // Get this from your Solana Tracker Dashboard
  autoReconnect: true,
});

const subscribedTokens = new Set<string>();

async function getTokenBundlers() {
  try {
    const tokenAddress = '95JrMN6rJbQwy4iPCyW6sQxUPmn8eEecTLHWRNkCpump';
    console.log('\nFetching bundlers for:', tokenAddress);

    const bundlers = await client.getTokenBundlers(tokenAddress);

    console.log('\nBundler Stats:');
    console.log(`  Total wallets: ${bundlers.total}`);
    console.log(`  Total balance: ${bundlers.balance.toLocaleString()}`);
    console.log(`  Percentage: ${bundlers.percentage.toFixed(4)}%`);
    console.log(`  Initial balance: ${bundlers.initialBalance.toLocaleString()}`);
    console.log(`  Initial percentage: ${bundlers.initialPercentage.toFixed(4)}%`);

    console.log('\nTop 5 Bundler Wallets:');
    for (let i = 0; i < Math.min(5, bundlers.wallets.length); i++) {
      const wallet = bundlers.wallets[i];
      console.log(`\n  ${i + 1}. ${wallet.wallet}`);
      console.log(`     Current: ${wallet.balance.toLocaleString()} (${wallet.percentage.toFixed(4)}%)`);
      console.log(`     Initial: ${wallet.initialBalance.toLocaleString()} (${wallet.initialPercentage.toFixed(4)}%)`);
      console.log(`     Bundle time: ${new Date(wallet.bundleTime).toISOString()}`);
    }

    return bundlers;
  } catch (error) {
    handleError(error);
  }
}

function subscribeToBundlers(tokenAddress: string) {
  if (subscribedTokens.has(tokenAddress)) return;

  subscribedTokens.add(tokenAddress);
  console.log(`Subscribing to bundlers: ${tokenAddress}`);

  dataStream.subscribe.bundlers(tokenAddress).on((data: BundlerUpdate) => {
    console.log('\nBundler Update:');
    console.log(`  Wallet: ${data.wallet}`);
    console.log(`  Amount: ${data.previousAmount.toLocaleString()} → ${data.amount.toLocaleString()}`);
    console.log(`  Percentage: ${data.previousPercentage.toFixed(4)}% → ${data.percentage.toFixed(4)}%`);
    console.log(`  Total bundler %: ${data.totalBundlerPercentage.toFixed(4)}%`);
  });
}

function subscribeToLatestTokenBundlers() {
  console.log('Subscribing to latest tokens...\n');

  dataStream.subscribe.latest().on((data) => {
    const tokenAddress = data.pools[0]?.tokenAddress;
    if (tokenAddress) {
      console.log(`New token: ${data.token?.name || 'Unknown'} (${data.token?.symbol || '???'}) - ${tokenAddress}`);
      subscribeToBundlers(tokenAddress);
    }
  });
}

async function main() {
  console.log('Bundlers Example\n');

  console.log('1. Fetching bundlers via API...');
  await getTokenBundlers();

  console.log('\n\n2. Starting real-time bundler tracking...\n');
  
  try {
    await dataStream.connect();
    console.log('Connected to datastream\n');

    subscribeToLatestTokenBundlers();
    subscribeToBundlers('95JrMN6rJbQwy4iPCyW6sQxUPmn8eEecTLHWRNkCpump');

    console.log('\nListening for updates... (Ctrl+C to exit)\n');
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  dataStream.disconnect();
  process.exit(0);
});

main();
