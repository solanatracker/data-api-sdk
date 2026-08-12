/**
 * Whale & KOL trades — REST and Datastream examples.
 */
import { Client, Datastream } from '@solana-tracker/data-api';
import { handleError, truncateAddress } from './utils';

const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE',
});

const TOKEN = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

/** Latest whale trades at or above $5,000 USD volume. */
export async function getWhaleTradesExample() {
  try {
    const page = await client.getWhaleTrades({
      minVolume: 5000,
      limit: 25,
      showMeta: true,
    });

    console.log(`\n=== Whale trades (>= $5k) ===`);
    console.log(`Count: ${page.trades.length} | hasNextPage: ${page.hasNextPage}`);
    page.trades.slice(0, 5).forEach((t, i) => {
      const who = t.identity?.name ?? truncateAddress(t.wallet);
      console.log(`${i + 1}. ${t.type.toUpperCase()} $${t.volume.toFixed(0)} by ${who}`);
      console.log(`   ${t.tx.slice(0, 12)}… @ ${new Date(t.time).toISOString()}`);
    });

    return page;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/** All KOL roster trades (minVolume=0). */
export async function getKolTradesExample() {
  try {
    const page = await client.getKolTrades({ minVolume: 0, limit: 25 });
    console.log(`\n=== KOL trades ===`);
    page.trades.slice(0, 5).forEach((t, i) => {
      const who = t.identity?.name ?? truncateAddress(t.wallet);
      const tw = t.identity?.twitter ? ` (${t.identity.twitter})` : '';
      console.log(`${i + 1}. ${who}${tw} ${t.type} $${t.volume.toFixed(2)}`);
    });
    return page;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/** KOL activity for one token mint. */
export async function getKolTradesByTokenExample(tokenMint = TOKEN) {
  try {
    const page = await client.getKolTradesByToken(tokenMint, {
      minVolume: 0,
      hideArb: true,
      limit: 25,
    });
    console.log(`\n=== KOL trades for ${truncateAddress(tokenMint)} ===`);
    console.log(`Count: ${page.trades.length}`);
    return page;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/** Live whale + KOL Datastream rooms. */
export async function subscribeWhaleKol(wsUrl = 'YOUR_WS_URL') {
  const ds = new Datastream({ wsUrl });
  await ds.connect();

  ds.subscribe.tx.whale(5000).on((trade) => {
    const who = trade.identity?.name ?? truncateAddress(trade.wallet);
    console.log(`[whale:$5k+] ${trade.type} $${trade.volume} by ${who}`);
  });

  ds.subscribe.tx.kol().on((trade) => {
    const who = trade.identity?.name ?? truncateAddress(trade.wallet);
    console.log(`[kol] ${trade.type} $${trade.volume} by ${who}`);
  });

  ds.subscribe.tx.kol(10000).on((trade) => {
    console.log(`[kol:$10k+] $${trade.volume}`);
  });
}

if (require.main === module) {
  (async () => {
    await getWhaleTradesExample();
    await getKolTradesExample();
    await getKolTradesByTokenExample();
  })();
}
