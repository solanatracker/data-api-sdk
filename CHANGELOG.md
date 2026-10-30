# Changelog

## 0.6.0

### Added

- `getAccountTransfers()` and `iterateAccountTransfers()` for `GET /account/{address}/transfers`: SOL and SPL transfers with every filter the API takes (time and slot ranges, direction, type, mint, status, DEX activity, address lists, amount and USD value ranges), historic prices, and grouping by transaction with in/out/net totals and swap detection. Filters are checked with the API's rules before the request is sent, and `{ grouped: true }` returns the grouped type. The iterator follows cursors through empty filtered pages and stops on a repeated cursor.
- `subscribe.transfers.wallet()`, `.token()` and `.tokenWallet()` for the `transfer:` Datastream rooms, with `{ enriched: true }` for token metadata, USD price, value, market cap and wallet identities. `token()` refuses SOL, which has no token room; `tokenWallet()` maps other SOL mint spellings to the wrapped SOL mint the rooms use.
- `TransferIdentity` (a `PnlV2Identity` with `platformProfiles`) on transfer parties and balance changes.
- `currency` (`usd`, `eur`, `sol`) and `marketCap` options on the four trade-history methods, with `price`, `marketCap` and the response `currency` in the types.
- Search filters `minTokenCreatedAt`/`maxTokenCreatedAt`, `minBundlerBalance`/`maxBundlerBalance`, `quoteToken`, and `minMigrationSeconds`/`maxMigrationSeconds`. `searchTokens()` results are typed as `SearchTokenResult`, which adds `migrationSeconds`; `SearchResult` keeps its keys.
- `quoteMint` and `quoteDepth` on Pump.fun pool details, and documentation of `5h` chart candles.
- Transfers example, tests built from the published examples and live messages, and package checks for the new methods.

## 0.5.0

### Added

- Four opt-in trade-history methods with swap, liquidity, and mixed event modes; identity enrichment; page limits; sorting; and exact numeric/string/null cursors.
- Five live liquidity scopes and enriched swap, wallet, whale, and KOL subscriptions. LP amounts remain exact strings, and distinct actions sharing a transaction signature are preserved.
- `PredictionMarketsClient.getMarketTradersByExchange()` with exchange-specific return types.
- Public overview parameter exports, liquidity examples, compatibility checks, package checks, and opt-in live tests.
- Separate `EnrichedTrade`, `EnrichedTokenTransaction`, and `EnrichedWalletTransaction` types so existing type property keys and `DatastreamRoom` members remain unchanged from 0.4.0.

### Fixed

- Subscriptions queued before a Datastream worker exists are forwarded after worker creation.
- The core JSON client uses the existing `node-fetch` dependency when native fetch is unavailable.
- Example type errors and credential configuration. Examples now read credentials from environment variables.
- Reorganized documentation around setup, workflows, and API examples.
