/**
 * Lighthouse — live memecoin market activity across Solana launchpads and DEXs.
 */
import { Client } from '@solana-tracker/data-api';
import { handleError, formatCurrency } from './utils';

const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE',
});

/**
 * Fetch buys, sells, traders, volume, new launches, and migrations
 * over 5m / 1h / 6h / 24h with period-over-period change.
 */
export async function getLighthouseOverview() {
  try {
    const markets = await client.getLighthouse();

    console.log(`\n=== Lighthouse (${markets.length} markets) ===`);
    for (const row of markets.slice(0, 10)) {
      const s24 = row.stats['24h'];
      console.log(`\n${row.label} (${row.market})`);
      if (row.parent) console.log(`  Parent: ${row.parent}`);
      console.log(`  24h volume: ${formatCurrency(s24.volume.total)} (${s24.volume.changePct.toFixed(1)}%)`);
      console.log(`  24h txns: ${s24.transactions.total} (buys ${s24.transactions.buys} / sells ${s24.transactions.sells})`);
      console.log(`  24h traders: ${s24.wallets.total}`);
      console.log(`  Tokens created: ${s24.tokensCreated.total} | Migrations: ${s24.migrations.total}`);
    }

    return markets;
  } catch (error) {
    handleError(error);
    return null;
  }
}

if (require.main === module) {
  getLighthouseOverview();
}
