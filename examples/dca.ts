/**
 * Jupiter DCA (recurring orders) REST examples.
 *
 * Covers every `/dca/*` endpoint. All endpoints accept an optional `program`
 * query (default `"jupiter"`) — currently only Jupiter is supported but the
 * shape is forward-compatible.
 */
import {
  Client,
  type DcaOrder,
  type DcaListParams,
} from '@solana-tracker/data-api';
import { handleError, formatCurrency, truncateAddress } from './utils';

const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE',
});

/** Replace with real addresses for your tests. */
const WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';
const SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const TOKEN = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

function formatOrder(o: DcaOrder): string {
  const usd = o.depositedUsd != null ? ` (${formatCurrency(o.depositedUsd)} deposited)` : '';
  return `  ${truncateAddress(o.address)} • ${o.pair} • ${o.status} • ${o.progressPercent.toFixed(1)}% done${usd}`;
}

// 1. List supported DCA programs
export async function exampleDcaPrograms() {
  try {
    const res = await client.getDcaPrograms();
    console.log(`\n[Programs] ${res.programs.length} supported`);
    for (const p of res.programs) {
      console.log(`  • ${p.label} (${p.id}) — ${p.programId}`);
    }
  } catch (e) {
    handleError(e);
  }
}

// 2. All DCA orders for a wallet (with status summary)
export async function exampleWalletDca(wallet: string = WALLET) {
  try {
    const res = await client.getDcaWallet(wallet, { status: 'active', limit: 25 });
    console.log(`\n[Wallet ${truncateAddress(wallet)}] active=${res.summary.active} paused=${res.summary.paused} completed=${res.summary.completed} pending=${res.summary.pending}`);
    res.orders.forEach((o) => console.log(formatOrder(o)));
    if (res.pagination.hasMore) {
      console.log(`  … nextCursor=${res.pagination.nextCursor}`);
    }
  } catch (e) {
    handleError(e);
  }
}

// 3. Paginated wallet orders (no summary)
export async function exampleWalletDcaOrders(wallet: string = WALLET) {
  try {
    const params: DcaListParams = { sort: 'recent', limit: 10 };
    const res = await client.getDcaWalletOrders(wallet, params);
    console.log(`\n[Wallet orders] ${res.pagination.count}/${res.pagination.total}`);
    res.orders.forEach((o) => console.log(formatOrder(o)));
  } catch (e) {
    handleError(e);
  }
}

// 4. Single DCA order by account address
export async function exampleSingleOrder(address: string) {
  try {
    const order = await client.getDcaOrder(address);
    console.log(`\n[Order ${truncateAddress(order.address)}]`);
    console.log(`  pair:       ${order.pair}`);
    console.log(`  status:     ${order.status} (${order.direction})`);
    console.log(`  cycle:      ${order.frequency}`);
    console.log(`  perCycle:   ${order.perCycle} ${order.input.symbol}`);
    console.log(`  used:       ${order.used} / ${order.deposited} (${order.progressPercent.toFixed(1)}%)`);
    console.log(`  received:   ${order.received} ${order.output.symbol}`);
    if (order.nextCycleAt) {
      console.log(`  next cycle: ${order.nextCycleAt}`);
    }
  } catch (e) {
    handleError(e);
  }
}

// 5. Aggregated buy/sell flow on a token
export async function exampleTokenFlow(mint: string = TOKEN) {
  try {
    const res = await client.getDcaTokenFlow(mint);
    console.log(`\n[Token flow ${truncateAddress(mint)}]`);
    console.log(`  buyers:  ${res.buyers.count} (volume ${formatCurrency(res.buyers.volumeUsd ?? 0)})`);
    console.log(`  sellers: ${res.sellers.count} (volume ${formatCurrency(res.sellers.volumeUsd ?? 0)})`);
  } catch (e) {
    handleError(e);
  }
}

// 6. Orders buying a token (token = output mint)
export async function exampleTokenBuyers(mint: string = TOKEN) {
  try {
    const res = await client.getDcaTokenBuyers(mint, { sort: 'volume', limit: 10 });
    console.log(`\n[Buyers of ${truncateAddress(mint)}] ${res.pagination.count}/${res.pagination.total}`);
    res.orders.forEach((o) => console.log(formatOrder(o)));
  } catch (e) {
    handleError(e);
  }
}

// 7. Orders selling a token (token = input mint)
export async function exampleTokenSellers(mint: string = TOKEN) {
  try {
    const res = await client.getDcaTokenSellers(mint, { sort: 'volume', limit: 10 });
    console.log(`\n[Sellers of ${truncateAddress(mint)}] ${res.pagination.count}/${res.pagination.total}`);
    res.orders.forEach((o) => console.log(formatOrder(o)));
  } catch (e) {
    handleError(e);
  }
}

// 8. Top wallets by DCA activity on a token
export async function exampleTokenUsers(mint: string = TOKEN) {
  try {
    const res = await client.getDcaTokenUsers(mint, { limit: 10 });
    console.log(`\n[Top DCA users on ${truncateAddress(mint)}]`);
    res.users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${truncateAddress(u.wallet)} • ${u.orderCount} orders • ${formatCurrency(u.volumeUsd ?? 0)}`);
    });
  } catch (e) {
    handleError(e);
  }
}

// 9. Orders for a specific input → output pair
export async function examplePair(input: string = USDC, output: string = SOL) {
  try {
    const res = await client.getDcaPair(input, output, { sort: 'volume', limit: 10 });
    console.log(`\n[Pair ${res.pair}] ${res.pagination.count}/${res.pagination.total}`);
    res.orders.forEach((o) => console.log(formatOrder(o)));
  } catch (e) {
    handleError(e);
  }
}

export async function runAll() {
  await exampleDcaPrograms();
  await exampleWalletDca();
  await exampleWalletDcaOrders();
  await exampleTokenFlow();
  await exampleTokenBuyers();
  await exampleTokenSellers();
  await exampleTokenUsers();
  await examplePair();
}

if (require.main === module) {
  runAll().catch(handleError);
}
