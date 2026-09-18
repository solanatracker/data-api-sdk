import { requireEnv } from './config';
import { Client } from '@solana-tracker/data-api'
import { handleError } from './utils';

const client = new Client({
  apiKey: requireEnv('SOLANA_TRACKER_API_KEY')
});

const EXAMPLE_WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';

// Quick overview of a wallet
export async function getWalletBasicInfo(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const wallet = await client.getWalletBasic(walletAddress);
    
    console.log('\n💼 Wallet Overview:');
    console.log('Total Value:', `$${wallet.total.toFixed(2)}`);
    console.log('Holdings:', wallet.tokens.length, 'tokens');
    
    const sorted = [...wallet.tokens].sort((a, b) => b.value - a.value);
    console.log('\nTop 3:');
    sorted.slice(0, 3).forEach((token, i) => {
      console.log(`${i + 1}. $${token.value.toFixed(2)} - ${token.address.slice(0, 8)}...`);
    });
    
    return wallet;
  } catch (error) {
    handleError(error);
  }
}

// Detailed portfolio view
export async function getWalletDetailedInfo(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const wallet = await client.getWallet(walletAddress);
    
    console.log('\n📊 Portfolio Details:');
    console.log('Total:', `$${wallet.total.toFixed(2)}`);
    console.log('SOL:', `${wallet.totalSol.toFixed(4)}`);
    
    const sorted = [...wallet.tokens].sort((a, b) => b.value - a.value);
    console.log('\nAll Holdings:');
    sorted.slice(0, 10).forEach((token, i) => {
      const symbol = token.token.symbol || 'Unknown';
      console.log(`${i + 1}. ${symbol} - $${token.value.toFixed(2)} (${token.balance.toFixed(2)} tokens)`);
    });
    
    return wallet;
  } catch (error) {
    handleError(error);
  }
}

// Paginated wallet view
export async function getWalletWithPagination(walletAddress: string = EXAMPLE_WALLET, page: number = 1) {
  try {
    const wallet = await client.getWalletPage(walletAddress, page);
    
    console.log(`\n📄 Portfolio (page ${page}):`);
    console.log(`${wallet.tokens.length} tokens shown`);
    
    wallet.tokens.forEach((token, i) => {
      const symbol = token.token.symbol || token.token.mint;
      console.log(`${i + 1}. ${symbol}: $${token.value.toFixed(2)}`);
    });
    
    return wallet;
  } catch (error) {
    handleError(error);
  }
}

// Trading activity
export async function getWalletTrades(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const trades = await client.getWalletTrades(walletAddress, undefined, true, true);
    
    console.log(`\n📈 Recent Trades (${trades.trades.length} found):`);
    
    trades.trades.slice(0, 10).forEach((trade, i) => {
      const date = new Date(trade.time).toLocaleTimeString();
      const type = 'SWAP';
      console.log(`${i + 1}. [${date}] ${type} - Tx: ${trade.tx.slice(0, 8)}...`);
    });
    
    return trades;
  } catch (error) {
    handleError(error);
  }
}

// Get wallet PnL chart
export async function getWalletChart(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const chart = await client.getWalletChart(walletAddress);
    
    console.log('\n📉 Portfolio Performance:');
    if (chart.pnl) {
      console.log('24h:', chart.pnl['24h'] ? `${chart.pnl['24h'].percentage.toFixed(2)}%` : 'N/A');
      console.log('30d:', chart.pnl['30d'] ? `${chart.pnl['30d'].percentage.toFixed(2)}%` : 'N/A');
    }
    
    return chart;
  } catch (error) {
    handleError(error);
  }
}
