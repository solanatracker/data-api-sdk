# Changelog

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
