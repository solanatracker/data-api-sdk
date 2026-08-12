/**
 * Prediction Markets REST + Datastream examples (Beta).
 * REST host: https://prediction-market-api.solanatracker.io
 * Datastream: same hub/key as other products (`pm:*` rooms).
 */
import {
  PredictionMarketsClient,
  Datastream,
  type PmTradeUpdate,
} from '@solana-tracker/data-api';
import { handleError } from './utils';

const pm = new PredictionMarketsClient({
  apiKey: 'YOUR_API_KEY_HERE',
});

/** Browse hub bootstrap + trending markets. */
export async function predictionMarketsBrowse() {
  try {
    const hub = await pm.getBrowseHub();
    console.log('\n=== Prediction Markets browse hub ===');
    console.log(`Trending markets: ${hub.trending.data.length}`);
    console.log(`Categories: ${hub.categories.length}`);

    const markets = await pm.getMarkets({
      exchange: 'polymarket',
      status: 'active',
      limit: 10,
      sort: 'volume',
      order: 'desc',
    });
    console.log(`\nActive Polymarket markets page size: ${markets.data.length}`);

    return { hub, markets };
  } catch (error) {
    handleError(error);
    return null;
  }
}

/** Market detail + orderbook snapshot. */
export async function predictionMarketDetail(tickerOrTokenId: string) {
  try {
    const snapshot = await pm.getMarketSnapshot(tickerOrTokenId);
    console.log(`\n=== Market snapshot: ${snapshot.market.title} ===`);
    console.log(`Exchange: ${snapshot.market.exchange} | Status: ${snapshot.market.status}`);
    console.log(`Volume: ${snapshot.market.volume}`);

    const book = await pm.getMarketOrderbook(tickerOrTokenId);
    console.log(`Orderbook bids: ${book.bids.length} | asks: ${book.asks.length}`);
    return { snapshot, book };
  } catch (error) {
    handleError(error);
    return null;
  }
}

/** Polymarket wallet overview (accounts endpoints). */
export async function predictionWalletOverview(address: string) {
  try {
    const overview = await pm.getAccountOverview(address);
    console.log('\n=== Polymarket wallet overview ===');
    console.log(overview);
    return overview;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Live PM Datastream rooms.
 * Deduplicate at-least-once delivery with `sourceId` or `tradeId`.
 */
export async function subscribePredictionMarkets(wsUrl = 'YOUR_WS_URL') {
  const ds = new Datastream({ wsUrl });
  await ds.connect();

  const seen = new Set<string>();

  const onTrade = (ev: PmTradeUpdate) => {
    const key = ev.sourceId || ev.tradeId;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    console.log(
      `[pm trade] ${ev.exchange} ${ev.marketId} $${ev.notionalUsd?.toFixed?.(2) ?? '?'} ` +
        `${ev.eventTitle ?? ''} ${ev.outcomeLabel ?? ''}`
    );
  };

  ds.subscribe.pm.trades().on(onTrade);
  ds.subscribe.pm.significantTrades().on(onTrade);
  ds.subscribe.pm.exchange('polymarket').trades().on(onTrade);

  // Market-scoped (Polymarket marketId must be the decimal CLOB token id)
  // ds.subscribe.pm.market('polymarket', 'TOKEN_ID').prices().on((p) => console.log(p.price));
}

if (require.main === module) {
  predictionMarketsBrowse();
}
