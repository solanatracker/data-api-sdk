# Solana Tracker Data API SDK

JavaScript and TypeScript clients for Solana token data, prices, wallets, trades, liquidity, and real-time activity. Includes PnL analytics, Jupiter DCA data, and a separate read-only client for Kalshi and Polymarket.

[API documentation](https://docs.solanatracker.io/) · [Get an API key](https://www.solanatracker.io/account/data-api) · [Examples](./examples/) · [Report an issue](https://github.com/solanatracker/data-api-sdk/issues)

Version **0.5.0** adds trade/liquidity history, enriched live activity, and compatibility fixes. See the [release notes](./CHANGELOG.md).

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Trades and liquidity](#trades-and-liquidity)
- [Real-time streams](#real-time-streams)
- [API and examples](#api-and-examples)
- [Prediction markets](#prediction-markets)
- [Errors](#errors)
- [Compatibility](#compatibility)
- [Development](#development)

## Installation

```sh
npm install @solana-tracker/data-api
```

The package includes TypeScript declarations, ES modules, and CommonJS exports. Use a supported Node.js LTS release. If you omit optional dependencies and your runtime has no native `WebSocket`, install `ws` to use Datastream.

```js
// CommonJS
const { Client, Datastream } = require('@solana-tracker/data-api');
```

Create an API key in your [dashboard](https://www.solanatracker.io/account/data-api). For streaming, use the full WebSocket URL provided there. Endpoint and Datastream access depend on your subscription; check the dashboard for current plans and limits.

Keep `SOLANA_TRACKER_API_KEY` and `SOLANA_TRACKER_WS_URL` in your server's environment or secret manager. The WebSocket URL contains a credential. Never commit either value or include it in browser bundles, screenshots, or logs. [`.env.example`](./.env.example) lists the variables; the SDK does not load environment files automatically.

## Quick start

This Node.js example reads a token and its current price:

```typescript
import { Client } from '@solana-tracker/data-api';

const apiKey = process.env.SOLANA_TRACKER_API_KEY;
if (!apiKey) throw new Error('Set SOLANA_TRACKER_API_KEY');

const client = new Client({ apiKey });
const mint = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

async function main() {
  const [token, price] = await Promise.all([
    client.getTokenInfo(mint),
    client.getPrice(mint),
  ]);

  console.log(token.token.name, price.price);
}

main().catch(() => {
  console.error('Unable to load token data');
  process.exitCode = 1;
});
```

`Client` defaults to `https://data.solanatracker.io`. Set `baseUrl` in the constructor when using another authorized Data API host. The client sends the API key to that host in the `x-api-key` header.

The following REST snippets reuse `client` and `mint` from this setup inside an async function.

## Trades and liquidity

Use the history methods to retrieve swaps, liquidity additions and removals, or both in one ordered feed:

```typescript
const filters = {
  events: 'all',
  enrich: 'identity',
  limit: 100,
  sortDirection: 'DESC',
} as const;

const page = await client.getTokenTradeHistory(mint, filters);

for (const event of page.trades) {
  switch (event.type) {
    case 'buy':
    case 'sell':
      console.log(event.type, event.amount, event.priceUsd);
      break;
    case 'add_liquidity':
    case 'remove_liquidity':
      console.log(event.type, event.pool, event.tokens);
      break;
  }
}

if (page.hasNextPage && page.nextCursor != null) {
  const nextPage = await client.getTokenTradeHistory(mint, {
    ...filters,
    cursor: page.nextCursor,
  });
  console.log(nextPage.trades.length);
}
```

### Scope and filters

All four methods accept the same options:

- `getTokenTradeHistory(mint, options)` — activity across a token's pools.
- `getPoolTradeHistory(mint, pool, options)` — activity in one pool.
- `getUserTokenTradeHistory(mint, wallet, options)` — one wallet's token activity.
- `getUserPoolTradeHistory(mint, pool, wallet, options)` — one wallet in one pool.

Set `events` to `'trades'` (the default), `'liquidity'`, or `'all'`. The result always uses a `trades` array, with TypeScript inferring the row type from the selected mode. `limit` accepts 1–500 rows and defaults to 250; `sortDirection` accepts `'ASC'` or `'DESC'` and defaults to descending.

`enrich: 'identity'` adds current wallet labels, such as KOL profiles, developer labels, pool identities, platforms, and SNS names. Unknown identities are `null`. The aliases `'all'`, `'*'`, `'pool'`, and `'developer'` also enable identity enrichment. `showMeta` adds swap metadata; `hideArb` filters swap legs while retaining LP activity. These options apply to the four history methods, not wallet-wide or whale/KOL REST feeds.

### Cursors and exact amounts

Mixed and liquidity feeds use opaque string cursors; swaps use timestamp cursors. Pass `nextCursor` back unchanged and keep the same scope, event mode, and sort direction. A final cursor can be `null`.

Liquidity rows contain `pool`, `program`, `programId`, `instruction`, `slot`, `time` in milliseconds, `amountBasis`, and `tokens[]`. Each token's `amount` and `amountRaw` are **strings**: preserve them to avoid precision loss. Optional `feeAmountRaw` and `transferredAmountRaw` preserve transfer details. `amountBasis: 'transfer'` describes gross transfers before Token-2022 withholding; `'principal'` separates principal from fees or internal reallocations. LP rows have no swap price, volume, or PnL fields.

See the [liquidity example](./examples/liquidity.ts) and [API liquidity guide](https://docs.solanatracker.io/guides/liquidity) for the complete workflow.

## Real-time streams

`Datastream` provides typed subscriptions, JSON heartbeat replies, and automatic reconnection. Subscribing starts the connection; you can also call `connect()` explicitly.

```typescript
import { Datastream } from '@solana-tracker/data-api';

const wsUrl = process.env.SOLANA_TRACKER_WS_URL;
if (!wsUrl) throw new Error('Set SOLANA_TRACKER_WS_URL');

const stream = new Datastream({ wsUrl, autoReconnect: false });
const mint = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

// Avoid logging connection errors verbatim: they can contain a private URL.
stream.on('error', () => console.error('Datastream connection error'));

const swaps = stream.subscribe.tx.token(mint, { enriched: true });
const liquidity = stream.subscribe.liquidity.token(mint, { enriched: true });

const swapListener = swaps.on((event) => {
  console.log(event.type, event.amount, event.identity);
});
const liquidityListener = liquidity.on((event) => {
  console.log(event.type, event.tokens, event.identity);
});

process.once('SIGINT', () => {
  swapListener.unsubscribe();
  liquidityListener.unsubscribe();
  stream.unsubscribe(swaps.room);
  stream.unsubscribe(liquidity.room);
  stream.disconnect();
});
```

The example disables automatic reconnection for a bounded connection lifecycle. By default, `autoReconnect` is `true`; its delay settings are `reconnectDelay` (2,500 ms), `reconnectDelayMax` (4,500 ms), and `randomizationFactor` (0.5). Browser worker support is available through `useWorker` and an optional `workerUrl`. See [`DatastreamConfig`](./src/datastream.ts) for the complete configuration.

Calling the listener's `unsubscribe()` removes that callback. Calling `stream.unsubscribe(room)` leaves the server room; `disconnect()` closes the connection and clears subscriptions.

### Liquidity and identity subscriptions

The five LP scopes are:

- `stream.subscribe.liquidity.token(mint, options)`
- `stream.subscribe.liquidity.tokenPool(mint, pool, options)`
- `stream.subscribe.liquidity.tokenPoolWallet(mint, pool, wallet, options)`
- `stream.subscribe.liquidity.pool(pool, options)`
- `stream.subscribe.liquidity.wallet(wallet, options)`

`options` is optional. Set `{ enriched: true }` to receive wallet identity. The same option works on `subscribe.tx.token`, `.pool`, `.poolWallet`, `.wallet`, `.whale`, and `.kol`. For all enriched KOL trades, use `stream.subscribe.tx.kol(undefined, { enriched: true })`.

Live LP events are provisional at processed commitment. Reconcile with REST history after reconnecting: timestamps can differ, and no rollback notifications are sent. Multiple LP actions can share a transaction signature, pool, and wallet; **do not deduplicate LP events by signature**. Overlapping subscriptions can each deliver the same activity.

Enriched notifications can arrive later or out of order. `identityStatus: 'partial'` means the lookup was incomplete; no later identity correction is sent for that notification. Swap subscriptions continue to carry swaps only, so a combined live feed needs both swap and liquidity subscriptions.

### Other streams

Use `subscribe.price.aggregated(mint)` for aggregate prices, `subscribe.price.pool(pool)` for a specific pool, and `subscribe.wallet(wallet).balance()` for wallet balances. The SDK also exposes token lifecycle, metadata, holders, pool updates, stats, volume, snipers, insiders, fees, PnL, DCA, and prediction-market subscriptions.

Explore the [Datastream examples](./examples/datastream.ts), [PnL streams](./examples/pnl-v2-datastream.ts), and [DCA streams](./examples/dca-datastream.ts).

## API and examples

Choose an example by the data you need. The [HTTP documentation](https://docs.solanatracker.io/) describes endpoint limits and response semantics; exported TypeScript types provide the SDK's method signatures and options.

For the complete method list, see [`Client`](./src/data-api.ts), [`PredictionMarketsClient`](./src/prediction-markets.ts), and [`Datastream`](./src/datastream.ts).

- **Tokens and discovery:** token details, holders, deployers, search, trending, and launch stages. [Token examples](./examples/tokens.ts) · [Bundlers](./examples/bundlers.ts)
- **Prices and charts:** current and historical prices, batch prices, OHLCV, and holder charts. [Prices](./examples/prices.ts) · [Charts](./examples/charts.ts)
- **Wallets and trades:** balances, portfolio data, swaps, and scoped activity history. [Wallets](./examples/wallets.ts) · [Trades](./examples/trades.ts) · [Liquidity](./examples/liquidity.ts)
- **PnL v2:** KOL leaderboards, token traders, wallet analytics, positions, and batch lookups. [REST](./examples/pnl-v2.ts) · [Streams](./examples/pnl-v2-datastream.ts)
- **Jupiter DCA:** programs, orders, token flows, buyers, sellers, users, and pairs. [REST](./examples/dca.ts) · [Streams](./examples/dca-datastream.ts)
- **Market activity:** token/pool stats, Lighthouse market summaries, whale trades, and KOL trades. [Stats](./examples/stats.ts) · [Lighthouse](./examples/lighthouse.ts) · [Whale/KOL feeds](./examples/whale-kol.ts)
- **Prediction markets:** markets, events, prices, orderbooks, traders, accounts, and live updates. [Prediction-market examples](./examples/prediction-markets.ts)
- **Legacy PnL:** existing wallet/token PnL and top-trader integrations. [Legacy examples](./examples/profit-loss.ts)

Some examples export functions instead of running automatically. Review the file, provide configuration through your environment, and call the function you need. Example addresses are public identifiers, not credentials.

### Search and holder enrichment

```typescript
const results = await client.searchTokens({
  query: 'SOL',
  market: ['raydium', 'orca'],
  minLiquidity: 10_000,
  limit: 10,
  format: 'full',
});
console.log(results.data);

const holders = await client.getTokenHolders(mint, 'all');
console.log(holders.accounts);
```

Search supports market and launchpad arrays, distribution and risk filters, social filters, and cursor pagination. `format: 'full'` returns full token objects on search and deployer queries. Holder enrichment accepts `'identity'`, `'walletPnl'`, `'identity,walletPnl'`, `'all'`, or `'*'`. See [`SearchParams` and response types](./src/interfaces.ts).

### PnL v2 behavior

PnL v2 covers meme and tradable SPL positions, not native or wrapped SOL. Wallet queries can return `PnlV2WalletQueued` while indexing; check `queued === true` before reading analytics. Supported endpoints accept `pnlMode: 'strict'` (default), `'adjusted'`, or `'raw'` to control how flagged positions contribute to PnL. Token-scoped responses distinguish `pnl.token` from `pnl.wallet`; identity is included on enriched rows. The [PnL example](./examples/pnl-v2.ts) demonstrates queue handling and all method families.

## Prediction markets

Use `PredictionMarketsClient` for the separate Kalshi and Polymarket API. It shares your Data API key and defaults to `https://prediction-market-api.solanatracker.io`.

```typescript
import { PredictionMarketsClient } from '@solana-tracker/data-api';

const apiKey = process.env.SOLANA_TRACKER_API_KEY;
if (!apiKey) throw new Error('Set SOLANA_TRACKER_API_KEY');
const markets = new PredictionMarketsClient({ apiKey });

async function main() {
  const page = await markets.getMarkets({
    exchange: 'polymarket',
    status: 'active',
    limit: 10,
  });
  console.log(page.data);
}

main().catch(() => {
  console.error('Unable to load prediction markets');
  process.exitCode = 1;
});
```

`getMarketTradersByExchange(ticker, { exchange })` returns a trader page for `'polymarket'` / `'poly'` and aggregate trade statistics for `'kalshi'`. When the exchange is not known at compile time, narrow the union with `'data' in result`. Live subscriptions use `stream.subscribe.pm.*`. This API is in beta; see the [examples](./examples/prediction-markets.ts) and [exported types](./src/prediction-markets-interfaces.ts).

## Errors

REST methods reject with typed errors. Check subclasses before `DataApiError`:

```typescript
import {
  DataApiError,
  RateLimitError,
  ValidationError,
} from '@solana-tracker/data-api';

try {
  await client.getTokenInfo(mint);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limited; retry after', error.retryAfter, 'seconds');
  } else if (error instanceof ValidationError) {
    console.error('Invalid request parameters');
  } else if (error instanceof DataApiError) {
    console.error('Data API request failed with status', error.status);
  } else {
    throw error;
  }
}
```

`DataApiError` exposes `message`, optional `status`, `code`, and `details`. `RateLimitError.retryAfter` can be undefined. The REST client does not automatically retry requests; apply your own bounded retry policy. Stream failures use the `error` event.

## Compatibility

The new activity API is opt-in. Existing `getTokenTrades`, `getPoolTrades`, `getUserTokenTrades`, and `getUserPoolTrades` retain their positional signatures, request serialization, and swaps-only behavior. `TradesResponse` keeps its legacy numeric cursor type; new history methods use `TradeHistoryResponse` with numeric, string, or null cursors.

Compatibility checks pass against the published 0.3.1, 0.3.2, and 0.4.0 packages. Earlier releases had migration changes before this update, including the removal of 0.3.0's PnL wallet status/refresh methods; see the [release notes](./CHANGELOG.md#compatibility).

For existing integrations:

- Existing transaction rooms remain swaps-only. Identity enrichment uses separate `:enriched` rooms.
- `getMarketTraders()` retains its existing signature; use `getMarketTradersByExchange()` for exchange-specific return types.
- Prefer `subscribe.wallet(wallet).balance()` and `.tokenBalance(mint)` over the deprecated helpers under `subscribe.tx.wallet(wallet)`.
- Prefer `subscribe.price.aggregated(mint)` over deprecated `subscribe.price.token(mint)`; pool-specific prices remain available.
- Risk entries use `wallet`; the deprecated `address` alias remains normalized for 0.3 consumers, and omitted bundler categories are normalized to empty categories.

## Development

From a local checkout:

```sh
npm install
npm run build
npm run typecheck
npm run typecheck:examples
npm test -- --runInBand
npm run test:compatibility
npm run test:compatibility:legacy
npm run test:package
```

The build writes CommonJS, ESM, and declarations to `dist/`. To use a local build in another project, run `npm pack` here and install the resulting tarball in that project.

`test:compatibility` compares public types, method signatures, REST behavior, and stream helpers with revision `4acef8e` (0.4.0). `test:compatibility:legacy` checks 0.3.1 and revision `42f931d` (0.3.2); keep those references available in your clone. You can also pass an extracted npm package directory to `node tests/compatibility.cjs` to check a published artifact. `test:package` checks the packed package's imports and TypeScript consumers. These checks run locally and do not require service credentials.

### Optional live checks

Live scripts require Node.js 18+ and authorized service access. They make read-only requests and are separate from the default test suite.

```sh
# Keyless REST host that you are authorized to access.
npm run test:live -- https://your-authorized-host.example /tmp/sdk-live-results.json

# Set SOLANA_TRACKER_WS_URL securely in your environment first.
npm run test:live:stream -- /tmp/sdk-live-stream-results.json
```

REST checks cover history filters, pagination, liquidity, legacy trades, and representative endpoint families. They send no key and refuse redirects to other hosts. The 90-second stream check validates received LP/enriched rows and heartbeat replies, reporting quiet rooms separately. It exercises the Node socket path; worker behavior has local test coverage. Prediction Markets requires separate live verification. Reports exclude the connection token; keep credentials out of committed test fixtures.

## License

MIT, as declared in [`package.json`](./package.json).
