/** Historical and live LP activity. Set SOLANA_TRACKER_API_KEY and SOLANA_TRACKER_WS_URL to run. */
import { requireEnv } from './config';
import { Client, Datastream, type TradeParams } from '@solana-tracker/data-api';

const apiKey = process.env.SOLANA_TRACKER_API_KEY;
if (!apiKey) throw new Error('Set SOLANA_TRACKER_API_KEY');
const client = new Client({ apiKey });
const mint = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

async function main() {
  const filters: TradeParams<'all'> = {
    events: 'all', enrich: 'identity', limit: 100, sortDirection: 'DESC',
  };
  const page = await client.getTokenTradeHistory(mint, filters);
  for (const event of page.trades) {
    if (event.type === 'add_liquidity' || event.type === 'remove_liquidity') {
      // Keep exact decimal and raw amounts as strings.
      console.log(event.type, event.pool, event.tokens, event.identity);
    } else if (event.type === 'buy' || event.type === 'sell') {
      console.log(event.type, event.amount, event.volume);
    }
  }
  if (page.hasNextPage && page.nextCursor != null) {
    const next = await client.getTokenTradeHistory(mint, { ...filters, cursor: page.nextCursor });
    console.log('Next page:', next.trades.length);
  }

  const ds = new Datastream({ wsUrl: requireEnv('SOLANA_TRACKER_WS_URL') });
  ds.on('error', console.error);
  ds.subscribe.liquidity.token(mint, { enriched: true }).on(event => {
    console.log(event.type, event.tokens, event.identity, event.identityStatus);
  });
  ds.subscribe.tx.token(mint, { enriched: true }).on(trade => {
    console.log(trade.type, trade.amount, trade.identity);
  });
  // LP notifications are provisional. Reconcile from REST after reconnecting.
  // Multiple actions can share a signature; do not deduplicate them by tx.
  process.once('SIGINT', () => { ds.disconnect(); process.exit(0); });
}

main().catch(console.error);
