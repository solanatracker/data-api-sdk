/**
 * PnL v2 REST API examples — every `/v2/pnl/*` endpoint has its own function.
 * Requires a Data API key with access to PnL v2 endpoints.
 *
 * PnL v2 is aimed at meme / tradable token positions — not SOL (native or wrapped).
 */
import {
  Client,
  type PnlV2WalletQueued,
  type PnlV2WalletOverviewResponse,
  type PnlV2WalletHistoryResponse,
  type PnlV2WalletPerformanceResponse,
  type PnlV2WalletTokenPositionResponse,
  type PnlV2WalletHighlightsResponse,
  type PnlV2WalletRiskResponse,
  type PnlV2WalletPositionsResponse,
  type PnlV2WalletChartResponse,
  type PnlV2Identity,
} from '@solana-tracker/data-api';
import { handleError, truncateAddress, formatCurrency, formatPercentage } from './utils';

const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE',
});

/** Example wallet and meme-token mint — replace with real addresses for your tests */
const WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';
/** Use an SPL meme token — PnL v2 does not track SOL */
const TOKEN = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isQueued(res: unknown): res is PnlV2WalletQueued {
  return (
    typeof res === 'object' &&
    res !== null &&
    'queued' in res &&
    (res as PnlV2WalletQueued).queued === true
  );
}

function guardQueued<T>(label: string, res: T | PnlV2WalletQueued): res is T {
  if (isQueued(res)) {
    console.log(`[${label}] Wallet queued for indexing: ${res.message}`);
    return false;
  }
  return true;
}

function formatIdentity(identity?: PnlV2Identity | null): string {
  if (!identity) return '';
  const parts: string[] = [];
  if (identity.name) parts.push(identity.name);
  if (identity.type) parts.push(`[${identity.type}]`);
  if (identity.tags?.length) parts.push(`tags=${identity.tags.join(',')}`);
  if (identity.pool) parts.push(`pool:${identity.pool.program}`);
  if (identity.developer) parts.push(`dev via ${identity.developer.via?.join(',')}`);
  return parts.length ? ` (${parts.join(' | ')})` : '';
}

// ---------------------------------------------------------------------------
// 1. getPnlV2KOLLeaderboard — GET /v2/pnl/leaderboard/kols
// ---------------------------------------------------------------------------
export async function exampleKolLeaderboard() {
  try {
    const data = await client.getPnlV2KOLLeaderboard({
      sort: 'total',
      direction: 'desc',
      limit: 10,
    });

    console.log('\n=== 1. KOL all-time leaderboard ===');
    console.log(`Total KOLs: ${data.pagination.total} | Page size: ${data.pagination.count}`);
    data.traders.forEach((t, i) => {
      const name = t.identity?.name ?? 'anon';
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)} (${name})` +
        ` — PnL ${formatCurrency(t.pnl.total ?? 0)}` +
        ` | ROI ${formatPercentage(t.roi ?? 0)}` +
        ` | Win ${formatPercentage(t.winRate ?? 0)}` +
        ` | ${t.counts.tokensTraded} tokens`
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 2. getPnlV2KOLPeriodLeaderboard — GET /v2/pnl/leaderboard/kols/period
// ---------------------------------------------------------------------------
export async function exampleKolPeriodLeaderboard() {
  try {
    const data = await client.getPnlV2KOLPeriodLeaderboard({
      period: '30d',
      sort: 'realized',
      direction: 'desc',
      limit: 10,
    });

    console.log('\n=== 2. KOL period leaderboard (30d) ===');
    console.log(`Page: ${data.pagination.count} / ${data.pagination.total}`);
    data.traders.forEach((t, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)} (${t.identity?.name ?? 'anon'})` +
        ` — realized ${formatCurrency(t.period.realized ?? 0)}` +
        ` | ${t.period.tradingDays} trading days`
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 3. getPnlV2KOLCalendar — GET /v2/pnl/leaderboard/kols/calendar
// ---------------------------------------------------------------------------
export async function exampleKolCalendar() {
  try {
    const data = await client.getPnlV2KOLCalendar({ year: 2026, month: 4 });

    console.log('\n=== 3. KOL calendar (2026-04) ===');
    console.log(`Trading days: ${data.summary.tradingDays}`);
    console.log(`Positive: ${data.summary.positiveDays} | Negative: ${data.summary.negativeDays}`);
    console.log(`Total realized: ${formatCurrency(data.summary.totalRealizedPnl ?? 0)}`);

    const dayKeys = Object.keys(data.days).sort();
    dayKeys.slice(0, 5).forEach((d) => {
      const day = data.days[d];
      console.log(`  ${d}: ${day.traders} traders, realized ${formatCurrency(day.realizedPnl ?? 0)}`);
    });
    if (dayKeys.length > 5) console.log(`  ... and ${dayKeys.length - 5} more days`);

    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 4. getPnlV2KOLByDate — GET /v2/pnl/leaderboard/kols/date
// ---------------------------------------------------------------------------
export async function exampleKolByDate() {
  try {
    const data = await client.getPnlV2KOLByDate({ date: '2026-04-01' });

    console.log('\n=== 4. KOL by date (2026-04-01) ===');
    console.log(`Date: ${data.date} | Traders: ${data.traders.length}`);
    console.log(`Summary — realized: ${formatCurrency(data.summary.totalRealizedPnl ?? 0)}`);
    data.traders.slice(0, 5).forEach((t, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)} (${t.identity?.name ?? 'anon'})` +
        ` — day realized ${formatCurrency(t.day.realized ?? 0)}` +
        ` | cumulative total ${formatCurrency(t.cumulative.pnl.total ?? 0)}`
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 5. getPnlV2TopTraders — GET /v2/pnl/leaderboard/top
// ---------------------------------------------------------------------------
export async function exampleTopTraders() {
  try {
    const data = await client.getPnlV2TopTraders({
      days: 90,
      sort: 'realized',
      direction: 'desc',
      limit: 10,
      minTrades: 10,
      minInvested: 100,
      pnlMode: 'adjusted',
    });

    console.log('\n=== 5. Top traders (90d, pnlMode=adjusted) ===');
    console.log(`Page: ${data.pagination.count} / ${data.pagination.total} | pnlMode: ${data.pagination.pnlMode}`);
    data.traders.forEach((t, i) => {
      const adj = t.pnlAdjustments;
      const days = t.period.days;
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)}${formatIdentity(t.identity)}` +
        `\n       realized ${formatCurrency(t.period.realized ?? 0)}` +
        ` (raw ${formatCurrency(t.period.realizedRaw ?? 0)})` +
        ` | ROI ${formatPercentage(t.period.roi ?? 0)}` +
        ` | win ${formatPercentage(t.winRate ?? 0)}` +
        ` | ${t.counts.tokensTraded} tokens in ${t.period.tradingDays}d` +
        (days ? `\n       days: ${days.profitable}W / ${days.losing}L (${formatPercentage(days.winRate ?? 0)} daily win) | best day ${formatCurrency(days.maxSinglePnl ?? 0)}` : '') +
        (adj ? `\n       adjustments: mode=${adj.mode} invalidPnl=${formatCurrency(adj.invalidPnl ?? 0)} correction=${formatCurrency(adj.adjustedCorrection ?? 0)}` : '')
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 6. getPnlV2TokenTraders — GET /v2/pnl/tokens/{token}/traders
// ---------------------------------------------------------------------------
export async function exampleTokenTraders(tokenAddress: string = TOKEN) {
  try {
    const data = await client.getPnlV2TokenTraders(tokenAddress, {
      sort: 'pnl',
      direction: 'desc',
      limit: 10,
    });

    console.log('\n=== 6. Token traders (enriched with identity + wallet PnL) ===');
    console.log(`Token: ${data.meta.symbol} (${data.meta.name}) | Price: $${data.meta.price}`);
    console.log(`Page: ${data.pagination.count} / ${data.pagination.total}`);
    data.traders.forEach((t, i) => {
      const walletLine = t.pnl.wallet
        ? `\n       wallet PnL: ${formatCurrency(t.pnl.wallet.total ?? 0)} (${t.pnl.wallet.tokensTraded} tokens traded)`
        : '';
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)}${formatIdentity(t.identity)}` +
        `\n       token PnL: ${formatCurrency(t.pnl.token.total ?? 0)} (realized ${formatCurrency(t.pnl.token.realized ?? 0)})` +
        walletLine +
        ` | ROI ${formatPercentage(t.roi ?? 0)}` +
        ` | buys ${t.counts.buys} sells ${t.counts.sells}`
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 7. getPnlV2TokenFirstBuyers — GET /v2/pnl/tokens/{token}/first-buyers
// ---------------------------------------------------------------------------
export async function exampleTokenFirstBuyers(tokenAddress: string = TOKEN) {
  try {
    const data = await client.getPnlV2TokenFirstBuyers(tokenAddress, {
      sort: 'first_trade',
      direction: 'asc',
      limit: 10,
    });

    console.log('\n=== 7. Token first buyers (enriched) ===');
    console.log(`Token: ${data.meta.symbol} | Page: ${data.pagination.count} / ${data.pagination.total}`);
    data.traders.forEach((t, i) => {
      const firstTrade = t.timing.firstTrade ? new Date(t.timing.firstTrade).toLocaleString() : 'n/a';
      const walletLine = t.pnl.wallet
        ? ` | wallet lifetime ${formatCurrency(t.pnl.wallet.total ?? 0)}`
        : '';
      console.log(
        `  ${i + 1}. ${truncateAddress(t.wallet)}${formatIdentity(t.identity)}` +
        ` — first trade ${firstTrade}` +
        ` | token PnL ${formatCurrency(t.pnl.token.total ?? 0)}` +
        walletLine +
        ` | holding ${t.position.balance ?? 0} tokens`
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 8. getPnlV2WalletOverview — GET /v2/pnl/wallets/{wallet}
// ---------------------------------------------------------------------------
export async function exampleWalletOverview(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletOverview(walletAddress, { pnlMode: 'adjusted' });
    if (!guardQueued<PnlV2WalletOverviewResponse>('WalletOverview', res)) return null;

    console.log('\n=== 8. Wallet overview (pnlMode=adjusted) ===');
    console.log(`Wallet: ${res.wallet} | pnlMode: ${res.pnlMode}`);
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`PnL: ${formatCurrency(res.summary.pnl.total ?? 0)} (realized ${formatCurrency(res.summary.pnl.realized ?? 0)})`);
    console.log(`Invested: ${formatCurrency(res.summary.invested ?? 0)} | Proceeds: ${formatCurrency(res.summary.proceeds ?? 0)}`);
    console.log(`ROI: ${formatPercentage(res.summary.roi ?? 0)} | Trades: ${res.summary.counts.trades}`);
    console.log(`Win rate: ${formatPercentage(res.analysis.winRate ?? 0)}`);
    console.log(`Tags: platforms=${res.tags.platforms.join(',')} isArbitrage=${res.tags.isArbitrage}`);
    console.log(`Positions: total=${res.stats.total} holding=${res.stats.holding} sold=${res.stats.sold}`);
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 9. getPnlV2WalletHistory — GET /v2/pnl/wallets/{wallet}/history
// ---------------------------------------------------------------------------
export async function exampleWalletHistory(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletHistory(walletAddress, {
      period: '30d',
      limit: 7,
    });
    if (!guardQueued<PnlV2WalletHistoryResponse>('WalletHistory', res)) return null;

    console.log('\n=== 9. Wallet history (30d, last 7 days) ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Total days: ${res.summary.totalDays} | Trading: ${res.summary.days.trading}`);
    console.log(`Win rate: ${formatPercentage(res.summary.winRate ?? 0)}`);
    res.days.forEach((d) => {
      console.log(
        `  ${d.date}` +
        ` — realized ${formatCurrency(d.activity.pnl.realized ?? 0)}` +
        ` | buys ${d.activity.counts.buys} sells ${d.activity.counts.sells}` +
        ` | volume ${formatCurrency(d.activity.volume.total ?? 0)}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 10. getPnlV2WalletPerformance — GET /v2/pnl/wallets/{wallet}/performance
// ---------------------------------------------------------------------------
export async function exampleWalletPerformance(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletPerformance(walletAddress, {
      period: '30d',
    });
    if (!guardQueued<PnlV2WalletPerformanceResponse>('WalletPerformance', res)) return null;

    console.log('\n=== 10. Wallet performance (30d) ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Window: ${res.window} days | Trades: ${res.totals.trades}`);
    console.log(`Realized PnL: ${formatCurrency(res.totals.realizedPnl ?? 0)}`);
    if (res.bestDay) {
      console.log(`Best day: ${res.bestDay.date} — ${formatCurrency(res.bestDay.realizedPnl ?? 0)}`);
    }
    if (res.worstDay) {
      console.log(`Worst day: ${res.worstDay.date} — ${formatCurrency(res.worstDay.realizedPnl ?? 0)}`);
    }
    console.log(`Streaks — positive: ${res.streaks.positive} | negative: ${res.streaks.negative}`);
    console.log(`Max drawdown: ${formatCurrency(res.drawdown.amount ?? 0)} (${formatPercentage(res.drawdown.percent ?? 0)})`);
    console.log(`Daily breakdown (first 3):`);
    res.days.slice(0, 3).forEach((d) => {
      console.log(`  ${d.date}: realized ${formatCurrency(d.realizedPnl ?? 0)} | ${d.trades} trades`);
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 11. getPnlV2WalletTokenPosition — GET /v2/pnl/wallets/{wallet}/tokens/{token}
// ---------------------------------------------------------------------------
export async function exampleWalletTokenPosition(
  walletAddress: string = WALLET,
  tokenAddress: string = TOKEN,
) {
  try {
    const res = await client.getPnlV2WalletTokenPosition(walletAddress, tokenAddress, { pnlMode: 'adjusted' });
    if (!guardQueued<PnlV2WalletTokenPositionResponse>('WalletTokenPosition', res)) return null;

    console.log('\n=== 11. Single token position (pnlMode=adjusted) ===');
    console.log(`Token: ${truncateAddress(res.token)}`);
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`PnL: ${formatCurrency(res.pnl.total ?? 0)} (realized ${formatCurrency(res.pnl.realized ?? 0)})`);
    console.log(`ROI: ${formatPercentage(res.roi ?? 0)}`);
    console.log(`Current balance: ${res.current.balance} | Value: ${formatCurrency(res.current.value ?? 0)}`);
    console.log(`Volume bought: ${formatCurrency(res.volume.buyUsd ?? 0)} | sold: ${formatCurrency(res.volume.sellUsd ?? 0)}`);
    console.log(`Trades: ${res.counts.buys} buys, ${res.counts.sells} sells`);
    if (res.meta) {
      console.log(`Meta: ${res.meta.symbol} (${res.meta.name}) price=$${res.meta.price}`);
    }
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 12. getPnlV2WalletHighlights — GET /v2/pnl/wallets/{wallet}/highlights
// ---------------------------------------------------------------------------
export async function exampleWalletHighlights(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletHighlights(walletAddress);
    if (!guardQueued<PnlV2WalletHighlightsResponse>('WalletHighlights', res)) return null;

    console.log('\n=== 12. Wallet highlights ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Positions: ${res.counts.positions} total | ${res.counts.open} open | ${res.counts.closed} closed`);
    const h = res.highlights;
    if (h.biggestWinner) {
      console.log(`Biggest winner: ${truncateAddress(h.biggestWinner.token)} — ${formatCurrency(h.biggestWinner.pnl.total ?? 0)}`);
    }
    if (h.biggestLoser) {
      console.log(`Biggest loser: ${truncateAddress(h.biggestLoser.token)} — ${formatCurrency(h.biggestLoser.pnl.total ?? 0)}`);
    }
    if (h.fastestFlip) {
      console.log(`Fastest flip: ${truncateAddress(h.fastestFlip.token)} — hold ${h.fastestFlip.timing.holdTimeSecs}s`);
    }
    if (h.longestHold) {
      console.log(`Longest hold: ${truncateAddress(h.longestHold.token)} — hold ${h.longestHold.timing.holdTimeSecs}s`);
    }
    if (h.mostActive) {
      console.log(`Most active: ${truncateAddress(h.mostActive.token)} — ${h.mostActive.counts.total} trades`);
    }
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 13. getPnlV2WalletRisk — GET /v2/pnl/wallets/{wallet}/risk
// ---------------------------------------------------------------------------
export async function exampleWalletRisk(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletRisk(walletAddress);
    if (!guardQueued<PnlV2WalletRiskResponse>('WalletRisk', res)) return null;

    console.log('\n=== 13. Wallet risk ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Open positions: ${res.openPositions.count} | Cost: ${formatCurrency(res.openPositions.cost ?? 0)} | Value: ${formatCurrency(res.openPositions.value ?? 0)}`);
    console.log(`Concentration — top1: ${formatPercentage(res.concentration.top1Percent ?? 0)} | top5: ${formatPercentage(res.concentration.top5Percent ?? 0)} | score: ${res.concentration.score}`);
    console.log(`PnL mix — realized: ${formatCurrency(res.pnlMix.realized ?? 0)} (${formatPercentage(res.pnlMix.realizedPercent ?? 0)}) | unrealized: ${formatCurrency(res.pnlMix.unrealized ?? 0)} (${formatPercentage(res.pnlMix.unrealizedPercent ?? 0)})`);
    console.log(`Largest positions (top 3):`);
    res.largestPositions.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${truncateAddress(p.token)} — value ${formatCurrency(p.current.value ?? 0)}`);
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 14. getPnlV2WalletPositions — GET /v2/pnl/wallets/{wallet}/positions
// ---------------------------------------------------------------------------
export async function exampleWalletPositions(walletAddress: string = WALLET) {
  try {
    const res = await client.getPnlV2WalletPositions(walletAddress, {
      sort: 'pnl',
      direction: 'desc',
      limit: 10,
      filter: 'holding',
      pnlMode: 'adjusted',
    });
    if (!guardQueued<PnlV2WalletPositionsResponse>('WalletPositions', res)) return null;

    console.log('\n=== 14. Wallet positions (holding, pnlMode=adjusted) ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Stats: total=${res.stats.total} holding=${res.stats.holding} sold=${res.stats.sold} profitable=${res.stats.profitable} losing=${res.stats.losing}`);
    console.log(`Pagination: ${res.pagination.count} / ${res.pagination.total} | hasMore: ${res.pagination.hasMore} | pnlMode: ${res.pagination.pnlMode}`);
    res.positions.forEach((p, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(p.token)}` +
        ` — PnL ${formatCurrency(p.pnl.total ?? 0)}` +
        ` | ROI ${formatPercentage(p.roi ?? 0)}` +
        ` | value ${formatCurrency(p.current.value ?? 0)}` +
        (p.meta ? ` (${p.meta.symbol})` : '')
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 15. getPnlV2WalletChart — GET /v2/pnl/wallets/{wallet}/chart
// ---------------------------------------------------------------------------
export async function exampleWalletChart(walletAddress: string = WALLET) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const res = await client.getPnlV2WalletChart(walletAddress, {
      time_from: now - 7 * 24 * 3600,
      time_to: now,
    });
    if (!guardQueued<PnlV2WalletChartResponse>('WalletChart', res)) return null;

    console.log('\n=== 15. Wallet chart (last 7 days) ===');
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Points: ${res.points.length} | hasMore: ${res.pagination.hasMore}`);
    const s = res.summary;
    console.log(`Trading days: ${s.days.trading} | Win rate: ${formatPercentage(s.winRate ?? 0)}`);
    console.log(`Totals — realized: ${formatCurrency(s.totals.realizedPnl ?? 0)} | volume: ${formatCurrency(s.totals.volume ?? 0)}`);
    if (s.bestDay) console.log(`Best day: ${s.bestDay.date} ${formatCurrency(s.bestDay.realizedPnl ?? 0)}`);
    if (s.worstDay) console.log(`Worst day: ${s.worstDay.date} ${formatCurrency(s.worstDay.realizedPnl ?? 0)}`);
    console.log(`First 3 data points:`);
    res.points.slice(0, 3).forEach((pt) => {
      console.log(
        `  ${pt.date}` +
        ` — realized ${formatCurrency(pt.pnl.realized ?? 0)}` +
        ` | volume ${formatCurrency(pt.activity.volume ?? 0)}` +
        ` | buys ${pt.counts.buys} sells ${pt.counts.sells}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 16. batchPnlV2WalletSummaries — POST /v2/pnl/wallets/batch
// ---------------------------------------------------------------------------
export async function exampleBatchWalletSummaries(
  wallets: string[] = [WALLET],
) {
  try {
    const res = await client.batchPnlV2WalletSummaries(wallets);

    console.log('\n=== 16. Batch: wallet summaries ===');
    console.log(`Found: ${res.count} | Not found: ${res.notFound?.length ?? 0} | Invalid: ${res.invalid?.length ?? 0}`);
    if (res.truncated) {
      console.log(`Truncated: requested ${res.truncated.requested}, processed limit ${res.truncated.limit}`);
    }
    res.wallets.forEach((w, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(w.wallet)}${formatIdentity(w.identity)}` +
        ` — total PnL ${formatCurrency(w.summary.pnl.total ?? 0)}` +
        ` | platforms ${w.tags.platforms.join(',') || 'none'}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 17. batchPnlV2WalletTokenPositions — POST /v2/pnl/wallets/{wallet}/positions/batch
// ---------------------------------------------------------------------------
export async function exampleBatchWalletTokenPositions(
  walletAddress: string = WALLET,
  tokens: string[] = [TOKEN],
) {
  try {
    const res = await client.batchPnlV2WalletTokenPositions(walletAddress, tokens, { pnlMode: 'adjusted' });

    console.log('\n=== 17. Batch: wallet → token positions ===');
    console.log(`Wallet: ${truncateAddress(res.wallet)} | pnlMode: ${res.pnlMode}`);
    if (res.identity) console.log(`Identity:${formatIdentity(res.identity)}`);
    console.log(`Found: ${res.count} | Not found: ${res.notFound.length}`);
    res.positions.forEach((p, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(p.token)}` +
        ` — PnL ${formatCurrency(p.pnl.total ?? 0)} | ROI ${formatPercentage(p.roi ?? 0)}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 18. batchPnlV2TokenWalletPositions — POST /v2/pnl/tokens/{token}/positions/batch
// ---------------------------------------------------------------------------
export async function exampleBatchTokenWalletPositions(
  tokenAddress: string = TOKEN,
  wallets: string[] = [WALLET],
) {
  try {
    const res = await client.batchPnlV2TokenWalletPositions(tokenAddress, wallets, { pnlMode: 'adjusted' });

    console.log('\n=== 18. Batch: token → wallet positions ===');
    console.log(`Token: ${truncateAddress(res.token)} | pnlMode: ${res.pnlMode} | Found: ${res.count} | Not found: ${res.notFound.length}`);
    res.positions.forEach((p, i) => {
      const walletLine = p.pnl.wallet
        ? ` | wallet PnL ${formatCurrency(p.pnl.wallet.total ?? 0)}`
        : '';
      console.log(
        `  ${i + 1}. ${truncateAddress(p.wallet)}${formatIdentity(p.identity)}` +
        `\n       token PnL ${formatCurrency(p.pnl.token.total ?? 0)}` +
        walletLine +
        ` | ROI ${formatPercentage(p.roi ?? 0)}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 19. batchPnlV2PositionPairs — POST /v2/pnl/positions/batch
// ---------------------------------------------------------------------------
export async function exampleBatchPositionPairs(
  pairs: Array<{ wallet: string; token: string }> = [{ wallet: WALLET, token: TOKEN }],
) {
  try {
    const res = await client.batchPnlV2PositionPairs(pairs, { pnlMode: 'raw' });

    console.log('\n=== 19. Batch: position pairs (pnlMode=raw) ===');
    console.log(`pnlMode: ${res.pnlMode} | Found: ${res.count} | Not found: ${res.notFound.length}`);
    res.positions.forEach((p, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(p.wallet)} × ${truncateAddress(p.token)}${formatIdentity(p.identity)}` +
        ` — PnL ${formatCurrency(p.pnl.total ?? 0)} | ROI ${formatPercentage(p.roi ?? 0)}`
      );
    });
    return res;
  } catch (e) { handleError(e); return null; }
}

// ---------------------------------------------------------------------------
// 20. getTokenHolders with enrichment — GET /tokens/{token}/holders?enrich=all
//     (Not a PnL v2 endpoint, but enrichment is new)
// ---------------------------------------------------------------------------
export async function exampleEnrichedTokenHolders(tokenAddress: string = TOKEN) {
  try {
    const data = await client.getTokenHolders(tokenAddress, 'all');

    console.log('\n=== 20. Token holders with enrichment ===');
    console.log(`Total holders: ${data.total} | Enrichment: ${data.enrich?.join(', ')}`);
    data.accounts.forEach((h, i) => {
      console.log(
        `  ${i + 1}. ${truncateAddress(h.wallet)}${formatIdentity(h.identity)}` +
        ` — ${h.amount} tokens (${h.percentage.toFixed(2)}%)` +
        ` | value ${formatCurrency(h.value.usd)}` +
        (h.pnl?.token ? ` | token PnL ${formatCurrency(h.pnl.token.total ?? 0)}` : '') +
        (h.pnl?.wallet ? ` | wallet PnL ${formatCurrency(h.pnl.wallet.total ?? 0)}` : '')
      );
    });
    return data;
  } catch (e) { handleError(e); return null; }
}
