/** Historical and live wallet transfers. Set SOLANA_TRACKER_API_KEY and SOLANA_TRACKER_WS_URL to run. */
import { requireEnv } from './config';
import { Client, Datastream, type AccountTransfersParams } from '@solana-tracker/data-api';

const client = new Client({ apiKey: requireEnv('SOLANA_TRACKER_API_KEY') });
const wallet = 'GachaNgyXTU3zFogQ8Z5jR2BLXs8215X2AtEH18VxJq3';
const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function main() {
  // Incoming USDC worth at least $10 at the time, over the last week.
  const filters: AccountTransfersParams = {
    direction: 'in', mint: usdc, minValue: 10, limit: 100,
    start: Math.floor(Date.now() / 1000) - 7 * 86400,
  };
  let pages = 0;
  for await (const page of client.iterateAccountTransfers(wallet, filters)) {
    for (const transfer of page.transfers) {
      // Amounts are exact strings; parties can be null and identities are only set when known.
      console.log(transfer.signature, transfer.uiAmount, transfer.token.symbol, transfer.value?.usd,
        transfer.from?.owner, transfer.from?.identity?.name);
    }
    // A filtered page can be empty while more remain; the iterator keeps going.
    if (++pages === 3) break;
  }

  // One entry per transaction, swaps included, with in/out/net totals.
  const grouped = await client.getAccountTransfers(wallet, { grouped: true, dex: 'include', historicPrices: true, limit: 50 });
  for (const tx of grouped.transactions) {
    console.log(tx.signature, tx.type, tx.direction, tx.totals.net?.usd, tx.swap?.out.token.symbol, tx.swap?.in.token.symbol);
  }

  const ds = new Datastream({ wsUrl: requireEnv('SOLANA_TRACKER_WS_URL') });
  ds.on('error', console.error);
  await ds.connect();
  // Transfers are sent at processed commitment; reconcile with REST after reconnecting.
  ds.subscribe.transfers.wallet(wallet, { enriched: true }).on(update => {
    for (const transfer of update.transfers) {
      console.log(transfer.direction, transfer.uiAmount, transfer.token.symbol, transfer.value.usd,
        transfer.from.identity?.name ?? transfer.from.owner, '->', transfer.to.identity?.name ?? transfer.to.owner);
    }
    if (update.enrichmentStatus === 'partial') console.log('Some prices or identities timed out');
  });
  ds.subscribe.transfers.token(usdc).on(update => console.log('USDC transfer', update.signature, update.transfers.length));
  process.once('SIGINT', () => { ds.disconnect(); process.exit(0); });
}

main().catch(console.error);
