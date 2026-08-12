/**
 * Prediction Markets REST types — aligned with prediction-markets/openapi.json (Beta).
 * Response bodies use camelCase; query parameters generally use snake_case on the wire.
 */

/** Lifecycle phase for a crypto up/down window. */
export type CryptoUpDownPhase = "upcoming" | "live" | "determining" | "resolved";

export type Exchange = "polymarket" | "kalshi";

export type MarketKind = "binary" | "categorical" | "combo";

export type MarketLegSide = "yes" | "no";

export type MarketStatus = "active" | "closed_pending_resolution" | "resolved" | "inactive";

export type PositionStatus = "active" | "closed" | "closed_pending_resolution" | "resolved_won" | "resolved_lost" | "resolved" | "redeemed";

export type PricingMode = "orderbook" | "rfq";

/** Standard API error response envelope. */
export interface ApiErrorBody {
  /** HTTP status code (duplicated for convenience). */
  code: number;
  error: string;
  /** Stable machine-readable code: RATE_LIMITED, SERVICE_BUSY, BAD_REQUEST, NOT_FOUND, INTERNAL. */
  errorCode?: string | null;
}

/** OHLCV series for one market in a batch candlesticks response. */
export interface BatchCandlestickSeries {
  data: Array<Candlestick>;
  exchange: Exchange;
  ticker: string;
}

/** Batch candlesticks response. */
export interface BatchCandlesticksResponse {
  series: Array<BatchCandlestickSeries>;
}

/** Single entry in a batch event lookup. */
export interface BatchEventResult {
  event?: UnifiedEvent | null;
  requestedId: string;
}

/** Batch event lookup response. */
export interface BatchEventsResponse {
  notFound: Array<string>;
  results: Array<BatchEventResult>;
}

/** Single entry in a batch market lookup (1:1 with requested id). */
export interface BatchMarketResult {
  market?: UnifiedMarket | null;
  requestedId: string;
}

export interface BatchMarketsBody {
  exchange?: string | null;
  /** Market ids (max 100). Meaning depends on `lookup_by` / exchange defaults. */
  ids: Array<string>;
  /** Lookup strategy: `asset_id`, `condition_id`, `ticker`, or `slug`. */
  lookupBy?: string | null;
}

/** Batch market lookup response with per-id mapping. */
export interface BatchMarketsResponse {
  notFound: Array<string>;
  results: Array<BatchMarketResult>;
}

/** Browse hub bootstrap response. */
export interface BrowseHubResponse {
  categories: Array<Category>;
  exchangeStatus: Record<string, unknown>;
  recentTrades: TradesEnrichedResponse;
  stats: CombinedStats;
  trending: PaginatedMarkets;
}

/** A single OHLCV candlestick bar. */
export interface Candlestick {
  close: number;
  exchange: string;
  high: number;
  low: number;
  open: number;
  periodInterval: string;
  ticker: string;
  /** Start of the candle period (ISO-8601 or unix seconds). */
  timestamp: string;
  tradeCount: number;
  volume: number;
}

/** A market category (derived from exchange data). */
export interface Category {
  /** Source exchange for this category grouping. */
  exchange: Exchange;
  /** Category icon URL when available (Kalshi structured icon / Polymarket event icon). */
  icon?: string | null;
  /** Representative image URL (often a high-volume event image in the category). */
  image?: string | null;
  /** Number of markets in this category. */
  marketCount: number;
  /** Category slug/name (e.g., "PRES", "KXBTC", "crypto", "politics"). */
  slug: string;
  /** Total volume across all markets in this category. */
  totalVolume: number;
}

/** Combined platform statistics across exchanges. */
export interface CombinedStats {
  kalshi: PlatformStats;
  polymarket: PlatformStats;
  totalMarkets: number;
  totalTrades: number;
  totalVolumeUsd: number;
  volume24hUsd: number;
}

export interface ComboMarketGroup {
  id: string;
  label: string;
  lines: Array<ComboMarketLine>;
  period?: string | null;
  section: string;
}

export interface ComboMarketLine {
  line?: number | null;
  marketId: string;
  marketType: string;
  selections: Array<ComboSelection>;
  status: string;
  title: string;
}

export interface ComboSelection {
  label: string;
  outcomeIndex: number;
  price: number;
  selectable: boolean;
  tokenId?: string | null;
}

/** Bundled crypto page payload for one event. */
export interface CryptoEventResponse {
  crypto: CryptoUpDown;
  eventId: string;
  history?: Array<CryptoPricePoint>;
  price?: CryptoPriceSnapshot | null;
  slug?: string | null;
  windows?: Array<CryptoSeriesWindow>;
}

/** One underlying-price point for the window chart. */
export interface CryptoPricePoint {
  /** Unix epoch milliseconds. */
  timestamp: number;
  value: number;
}

/** Open/close oracle snapshot from Polymarket `/api/crypto/crypto-price`. */
export interface CryptoPriceSnapshot {
  cached?: boolean;
  closePrice?: number | null;
  completed: boolean;
  incomplete: boolean;
  openPrice?: number | null;
  timestamp?: number | null;
}

/** Sibling window in the same crypto series (for the interval strip). */
export interface CryptoSeriesWindow {
  closed: boolean;
  eventId: string;
  finalPrice?: number | null;
  percentChange?: number | null;
  priceToBeat?: number | null;
  /** `up` / `down` when resolved. */
  result?: string | null;
  slug: string;
  title: string;
  url?: string | null;
  windowEnd?: string | null;
  windowStart?: string | null;
}

/** Wallet performance aggregated across supported Polymarket crypto events. */
export interface CryptoTrader {
  address: string;
  buyCount: number;
  buyVolumeUsd: number;
  /** Mark-to-market P&L: sale proceeds + current positions − buys − fees. */
  estimatedPnlUsd: number;
  exchange: Exchange;
  lastTradeAt?: string | null;
  marketsTraded: number;
  rank: number;
  returnPct: number;
  sellCount: number;
  sellVolumeUsd: number;
  totalTrades: number;
  totalVolumeUsd: number;
  username?: string | null;
}

/** Typed crypto up/down metadata attached to matching Polymarket events. */
export interface CryptoUpDown {
  /** Asset key (btc, eth, …). */
  asset: string;
  /** Closing / final oracle price when known. */
  finalPrice?: number | null;
  /** Human interval (`5m`, `15m`, `1h`, `4h`, `1d`). */
  interval: string;
  /** Derived UI phase. */
  phase: CryptoUpDownPhase;
  /** Opening reference price ("Price to Beat"). */
  priceToBeat?: number | null;
  /** Resolution source URL (typically Chainlink). */
  resolutionSource?: string | null;
  /** Resolved direction when known (`up` / `down`). */
  result?: string | null;
  /** Gamma series slug (`btc-up-or-down-5m`). */
  seriesSlug?: string | null;
  /** Series display title (`BTC Up or Down 5m`). */
  seriesTitle?: string | null;
  /** Chainlink / Polymarket symbol (BTC, ETH, …). */
  symbol: string;
  /** Polymarket crypto API variant (`fiveminute`, `hourly`, …). */
  variant: string;
  /** Window close (ISO-8601). */
  windowEnd?: string | null;
  /** Window open (ISO-8601). Price to Beat is the oracle price at this instant. */
  windowStart?: string | null;
}

/** Provenance for market-data responses. */
export interface DataProvenance {
  /** True when the value is derived/estimated rather than authoritative. */
  estimated: boolean;
  /** Local index timestamp when known. */
  indexedAt?: string | null;
  /** Serving source: `indexed`, `upstream`, `unavailable`. */
  source: string;
  /** Upstream/source event timestamp when known. */
  sourceUpdatedAt?: string | null;
  /** True when the payload is older than the freshness SLO. */
  stale: boolean;
  /** Why the payload is missing or incomplete. */
  unavailableReason?: string | null;
}

/** One market's candle series within a grouped Polymarket event. */
export interface EventCandlestickSeries {
  /** OHLCV bars for this market's primary Yes outcome. */
  candles: Array<Candlestick>;
  /** Polymarket Gamma numeric market id. */
  gammaMarketId?: string | null;
  /** Short label within the parent event (e.g. "USA", "France"). */
  groupItemTitle?: string | null;
  /** Polymarket condition_id or internal market id used for chart queries. */
  marketId: string;
  /** Market status: "active", "closed", or "inactive". */
  status: string;
  /** Full market question/title. */
  title: string;
}

/** Multi-series OHLCV for a Polymarket grouped event (e.g. World Cup Winner options). */
export interface EventCandlesticksResponse {
  /** Polymarket Gamma event id (numeric string). */
  eventId: string;
  /** URL slug for the parent event. */
  eventSlug?: string | null;
  exchange: Exchange;
  nextCursor?: string | null;
  /** Candle period: 1m, 1h, or 1d. */
  periodInterval: string;
  /** One series per market in the group. */
  series: Array<EventCandlestickSeries>;
  /** Parent event title. */
  title: string;
}

/** PnL rolled up by Gamma event for a wallet. */
export interface EventPnlSummary {
  eventId: string;
  eventSlug?: string | null;
  eventTitle?: string | null;
  marketsTraded: number;
  openPositions: number;
  positions: Array<WalletPosition>;
  realizedPnlUsd: number;
  totalPnlUsd: number;
  unrealizedPnlUsd: number;
}

/** Lightweight event summary embedded on trade feeds. */
export interface EventSummary {
  category?: string | null;
  id: string;
  image?: string | null;
  slug?: string | null;
  title: string;
}

export interface ExchangeStatusResponse {
  exchangeActive: boolean;
  exchanges: Array<string>;
  tradingActive: boolean;
}

/** Unified typeahead search across markets, events, and Polymarket traders. */
export interface GlobalSearchResponse {
  /** Ranked event matches (no nested markets). */
  events: Array<UnifiedEvent>;
  /** Ranked market matches. */
  markets: Array<UnifiedMarket>;
  /** Normalized search query. */
  query: string;
  /** Ranked Polymarket trader matches (Kalshi has no public wallet identities). */
  traders?: Array<TraderSearchHit>;
}

/** A single holder/trader with position size. */
export interface HolderResponse {
  /** Wallet address. */
  address: string;
  /** Total buy volume (USD). */
  buyVolumeUsd: number;
  /** Net token position (positive = long). */
  netTokens: number;
  /** Total sell volume (USD). */
  sellVolumeUsd: number;
  /** Number of trades. */
  tradeCount: number;
}

/** Real-time market snapshot (current bid/ask/last price). */
export type LiveMarketData = DataProvenance & {
  /** Current best ask price (0.0–1.0). */
  ask?: number | null;
  /** Current best bid price (0.0–1.0). */
  bid?: number | null;
  /** Source exchange. */
  exchange: Exchange;
  /** Last trade price (0.0–1.0). */
  lastPrice?: number | null;
  /** Available liquidity (if known). */
  liquidity?: number | null;
  /** Market identifier. */
  marketId: string;
  /** Open interest (if known). */
  openInterest?: number | null;
  /** Market status. */
  status: string;
  /** ISO-8601 snapshot timestamp. */
  timestamp: string;
  /** Total volume. */
  volume: number;
};

export interface MarketLeg {
  eventDate?: string | null;
  /** Exclusion/conflict group for mutually exclusive legs. */
  exclusionGroup?: string | null;
  label: string;
  /** Per-leg lifecycle: open, suspended, settled, void. */
  lifecycleStatus?: string | null;
  /** Official exchange leg/position identifier when available. */
  officialLegId?: string | null;
  /** Exchange-native position/outcome id for this leg. */
  positionId?: string | null;
  side: MarketLegSide;
  sport?: string | null;
  underlyingMarketId?: string | null;
  underlyingTitle?: string | null;
}

/** Size-aware fill quote from walking the live orderbook (VWAP). */
export type MarketQuoteResponse = DataProvenance & {
  /** Volume-weighted average fill price (0–1). */
  avgPrice?: number | null;
  bestAsk?: number | null;
  bestBid?: number | null;
  /** USD notional filled (`filledSize * avgPrice` when fully in shares). */
  cost: number;
  /** Polymarket UI chance (mid vs last-trade rule). */
  displayPrice?: number | null;
  exchange: Exchange;
  /** Shares filled. */
  filledSize: number;
  fullyFilled: boolean;
  levelsConsumed: number;
  marketId: string;
  midpoint?: number | null;
  requestedSize: number;
  /** `buy` walks asks; `sell` walks bids. */
  side: string;
  /** `shares` or `usd`. */
  sizeUnit: string;
  timestamp: string;
  /** CLOB token / outcome id used for the book walk when applicable. */
  tokenId?: string | null;
  unfilledSize: number;
  /** Worst (farthest) price touched while filling. */
  worstPrice?: number | null;
};

/** Bundled market detail for the market detail page. */
export interface MarketSnapshotResponse {
  market: UnifiedMarket;
  midpoint?: MidpointResponse | null;
  openInterest?: OpenInterestResponse | null;
  orderbook?: OrderbookSnapshot | null;
  price?: PriceSnapshot | null;
  recentTrades?: PaginatedTrades | null;
  related?: Array<UnifiedMarket> | null;
  spread?: SpreadResponse | null;
}

/** Aggregate trade stats for a market (used when individual trader data is unavailable, e.g. Kalshi). */
export interface MarketTradeSummary {
  /** Source exchange. */
  exchange: Exchange;
  /** Market identifier. */
  marketId: string;
  /** Contracts traded on the "no" / sell side. */
  noContracts: number;
  /** Note: individual trader data unavailable for this exchange. */
  note?: string | null;
  /** Total contracts/tokens traded. */
  totalContracts: number;
  /** Total trades executed. */
  totalTrades: number;
  /** Contracts traded on the "yes" / buy side. */
  yesContracts: number;
}

/** A single trader's aggregated activity on a market. */
export interface MarketTrader {
  /** Trader wallet address. */
  address: string;
  /** Number of buy trades. */
  buyCount: number;
  /** Total volume bought (USD). */
  buyVolumeUsd: number;
  /** Source exchange. */
  exchange: Exchange;
  /** Current marked value of this trader's outcome tokens for the market. */
  positionValueUsd: number;
  /** FIFO profit/loss already locked in by sales or settlement on this market. */
  realizedPnlUsd: number;
  /** Total market P&L divided by lifetime buy cost, as a percentage. */
  returnPct: number;
  /** Number of sell trades. */
  sellCount: number;
  /** Total volume sold (USD). */
  sellVolumeUsd: number;
  /** Realized plus unrealized market-specific profit/loss. */
  totalPnlUsd: number;
  /** Total trade count. */
  totalTrades: number;
  /** Combined buy + sell volume (USD). */
  totalVolumeUsd: number;
  /** Mark-to-market profit/loss for currently held outcome tokens on this market. */
  unrealizedPnlUsd: number;
  /** Public Polymarket @username, when the trader has one. */
  username?: string | null;
}

/** Midpoint price for a market. */
export type MidpointResponse = DataProvenance & {
  exchange: Exchange;
  marketId: string;
  midpoint?: number | null;
  timestamp: string;
};

/** Aggregated open interest for a market. */
export type OpenInterestResponse = DataProvenance & {
  exchange: Exchange;
  marketId: string;
  /** Authoritative open interest when the exchange publishes it. */
  openInterest?: number | null;
  /** Total number of trades (activity proxy, not OI). */
  totalTrades: number;
  /** Total token volume traded (activity proxy, not OI). */
  totalVolumeTokens: number;
  /** Unique addresses that have traded this market (activity proxy, not OI). */
  uniqueHolders: number;
};

/** Orderbook snapshot for a market. */
export type OrderbookSnapshot = DataProvenance & {
  /** Best ask levels. */
  asks: Array<PriceLevel>;
  /** Best bid levels. */
  bids: Array<PriceLevel>;
  /** Source exchange. */
  exchange: Exchange;
  /** Market identifier. */
  marketId: string;
  /** Mid-price: (best_bid + best_ask) / 2. */
  midpoint?: number | null;
  /** Spread: best ask - best bid. */
  spread?: number | null;
  /** ISO-8601 timestamp of the snapshot. */
  timestamp: string;
};

export interface PaginatedCandlesticks {
  count: number;
  cursor?: string | null;
  data: Array<Candlestick>;
  hasMore: boolean;
}

export interface PaginatedCryptoTraders {
  count: number;
  cursor?: string | null;
  data: Array<CryptoTrader>;
  hasMore: boolean;
}

export interface PaginatedEvents {
  count: number;
  cursor?: string | null;
  data: Array<UnifiedEvent>;
  hasMore: boolean;
}

export interface PaginatedMarketTraders {
  count: number;
  cursor?: string | null;
  data: Array<MarketTrader>;
  hasMore: boolean;
}

export interface PaginatedMarkets {
  count: number;
  cursor?: string | null;
  data: Array<UnifiedMarket>;
  hasMore: boolean;
}

export interface PaginatedPnlLeaderboard {
  count: number;
  cursor?: string | null;
  data: Array<PnlLeaderboardEntry>;
  hasMore: boolean;
}

export interface PaginatedSeries {
  count: number;
  cursor?: string | null;
  data: Array<SeriesInfo>;
  hasMore: boolean;
}

export interface PaginatedTraders {
  count: number;
  cursor?: string | null;
  data: Array<TraderSearchHit>;
  hasMore: boolean;
}

export interface PaginatedTrades {
  count: number;
  cursor?: string | null;
  data: Array<UnifiedTrade>;
  hasMore: boolean;
}

export interface PaginatedWalletPositions {
  count: number;
  cursor?: string | null;
  data: Array<WalletPosition>;
  hasMore: boolean;
}

export interface PlatformStats {
  activeMarkets: number;
  exchange: Exchange;
  totalMarkets: number;
  totalTrades: number;
  totalVolumeUsd: number;
  uniqueTraders: number;
  volume24hUsd: number;
}

/** Leaderboard row for top wallet PnL. */
export interface PnlLeaderboardEntry {
  address: string;
  exchange: Exchange;
  lastTradeAt?: string | null;
  marketsTraded: number;
  openPositions: number;
  rank: number;
  realizedPnlUsd: number;
  totalPnlUsd: number;
  totalVolumeUsd: number;
  unrealizedPnlUsd: number;
  username?: string | null;
}

/** Total portfolio value for a wallet. */
export interface PortfolioValueResponse {
  address: string;
  /** Spendable Polymarket collateral balance (pUSD + USDC.e) in the wallet. */
  cashBalanceUsd?: number;
  exchange: Exchange;
  /** Backward-compatible name for the authoritative active-position count. */
  openPositionCount: number;
  /** Mark-to-market value of open / redeemable outcome tokens only. */
  positionsValueUsd?: number;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Positions mark value + spendable collateral (pUSD / USDC.e). */
  totalValueUsd: number;
}

/** A single price level in an orderbook. */
export interface PriceLevel {
  /** Price (0.0–1.0 probability). */
  price: number;
  /** Quantity available at this price. */
  size: number;
}

/** Current price snapshot for a market. */
export type PriceSnapshot = DataProvenance & {
  /** Best ask price. */
  ask?: number | null;
  /** Best bid price. */
  bid?: number | null;
  /** 24h price change as decimal (-0.05 = -5%). */
  change24h?: number | null;
  exchange: Exchange;
  /** Last traded price. */
  lastTradePrice?: number | null;
  marketId: string;
  /** Display price (0.0–1.0). For Polymarket this is the UI chance: mid when spread ≤ 10¢, else last trade. */
  price?: number | null;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** 24h volume. */
  volume24h?: number | null;
};

/** Markets matched across exchanges for the same real-world event. */
export interface RelatedMarkets {
  /** Category of the matched event. */
  category?: string | null;
  /** The matched markets from different exchanges. */
  markets: Array<UnifiedMarket>;
  /** Descriptive title for the matched group. */
  title: string;
}

/** A series groups related markets together (similar to Kalshi events). */
export interface SeriesInfo {
  /** Source exchange. */
  exchange: Exchange;
  /** Number of markets in this series. */
  marketCount: number;
  /** Sample market title for context. */
  sampleTitle: string;
  /** Series slug identifier. */
  slug: string;
  /** Total volume across all markets. */
  totalVolume: number;
}

/** A sport category from Polymarket. */
export interface SportInfo {
  /** Source exchange for this sports taxonomy entry. */
  exchange?: Exchange;
  id: string;
  image?: string | null;
  resolutionSource?: string | null;
  seriesId?: string | null;
  sport: string;
  tags: Array<string>;
}

/** Spread for a market. */
export type SpreadResponse = DataProvenance & {
  ask?: number | null;
  bid?: number | null;
  exchange: Exchange;
  marketId: string;
  spread?: number | null;
  timestamp: string;
};

/** Polymarket trader search hit (profile + leaderboard stats when available). */
export interface TraderSearchHit {
  address: string;
  displayName?: string | null;
  exchange: Exchange;
  lastTradeAt?: string | null;
  marketsTraded: number;
  /** Relevance tier: 0 exact, 1 prefix, 2 substring, 3 fuzzy. */
  matchTier?: number | null;
  openPositions: number;
  profileImage?: string | null;
  realizedPnlUsd: number;
  totalPnlUsd: number;
  totalVolumeUsd: number;
  unrealizedPnlUsd: number;
  username?: string | null;
  xUsername?: string | null;
}

/** Trade feed with optional embedded market/event context. */
export interface TradesEnrichedResponse {
  count: number;
  cursor?: string | null;
  data: Array<UnifiedTrade>;
  events?: {
  [key: string]: EventSummary;
} | null;
  hasMore: boolean;
  markets?: {
  [key: string]: UnifiedMarket;
} | null;
}

/** A cross-exchange event grouping related markets (Kalshi event_ticker or Polymarket Gamma event). Polymarket grouped/negRisk events expose `image`, `icon`, `description`, `tags`, and nested markets with `groupItemTitle`. Kalshi events expose `image`, `description`, and `kalshi` metadata. */
export interface UnifiedEvent {
  /** Category/tag. */
  category?: string | null;
  /** Whether clients may build combos from this event's selections. */
  comboEnabled?: boolean;
  /** Structured groups/lines/options for a combo-builder UI. */
  comboGroups?: Array<ComboMarketGroup>;
  /** Gamma createdAt timestamp. */
  createdAt?: string | null;
  cryptoUpDown?: CryptoUpDown | null;
  /** Long-form description (Polymarket only). */
  description?: string | null;
  /** ISO-8601 end date. */
  endDate?: string | null;
  /** Source exchange. */
  exchange: Exchange;
  /** Event icon URL (Polymarket only). */
  icon?: string | null;
  /** Event identifier. */
  id: string;
  /** Event image URL (Polymarket only). */
  image?: string | null;
  /** Number of markets in this event. */
  marketCount: number;
  /** Event product shape. Combo-builder events expose `comboGroups`. */
  marketKind: MarketKind;
  /** Markets belonging to this event (if expanded). */
  markets?: Array<UnifiedMarket> | null;
  /** True for multi-outcome negRisk groups (Polymarket only). */
  negRisk?: boolean | null;
  /** Open interest (Polymarket only). */
  openInterest?: number | null;
  /** Resolution source URL/text (Polymarket only). */
  resolutionSource?: string | null;
  /** Slug for URL. */
  slug?: string | null;
  /** ISO-8601 start date. */
  startDate?: string | null;
  /** Gamma tag objects (JSON array). */
  tags?: unknown;
  /** Gamma ticker slug (Polymarket only). */
  ticker?: string | null;
  /** Event title. */
  title: string;
  /** Gamma updatedAt timestamp. */
  updatedAt?: string | null;
  /** URL to event. */
  url?: string | null;
  /** Total volume across all markets in event. */
  volume?: number | null;
  /** Rolling 24h volume across event markets (Polymarket only). */
  volume24h?: number | null;
}

/** A single market in normalized form. Polymarket markets in grouped events include `eventId`, `eventSlug`, `groupItemTitle`, `description`, `image`, and `icon`. Kalshi markets include `eventTicker` and optional `kalshi` metadata. */
export interface UnifiedMarket {
  /** Category/tag for this market. */
  category?: string | null;
  /** Polymarket CLOB outcome token IDs, ordered to match `outcomes`. Use these IDs for `pm:market:polymarket:{tokenId}:*` realtime rooms. */
  clobTokenIds?: Array<string>;
  /** ISO-8601 market close / expiry time. */
  closeDate?: string | null;
  /** Official multivariate/collection id when present. */
  collectionId?: string | null;
  /** Whether this market can be selected as one leg in a combo builder. */
  comboEligible?: boolean;
  /** UI grouping key for combo builders. */
  comboGroup?: string | null;
  /** ISO-8601 creation time. */
  createdAt?: string | null;
  /** Long-form market description (Polymarket Gamma). */
  description?: string | null;
  /** Polymarket Gamma event id (numeric string, e.g. "30615"). */
  eventId?: string | null;
  /** Polymarket event slug (e.g. "world-cup-winner"). */
  eventSlug?: string | null;
  /** Kalshi event_ticker for grouping related markets. */
  eventTicker?: string | null;
  /** Canonical parent event title (distinct from the child market/group title). */
  eventTitle?: string | null;
  /** Source exchange. */
  exchange: Exchange;
  /** Polymarket Gamma numeric market id (distinct from condition_id). */
  gammaMarketId?: string | null;
  /** Label within a grouped Polymarket event (e.g. "France"). */
  groupItemTitle?: string | null;
  /** Whether the indexed orderbook currently has executable depth. */
  hasDepth: boolean;
  /** Market icon URL (Polymarket Gamma). */
  icon?: string | null;
  /** Unique identifier within its exchange (ticker for Kalshi, condition_id for Polymarket). */
  id: string;
  /** Market image URL (Polymarket Gamma). */
  image?: string | null;
  /** Whether the market can currently accept orders or RFQs. */
  isTradable: boolean;
  /** Number of component markets in a combo. */
  legCount?: number;
  /** Structured combo legs. Empty for ordinary markets. */
  legs?: Array<MarketLeg>;
  /** Numeric spread/total threshold where applicable. */
  line?: number | null;
  /** Available liquidity (Polymarket only). */
  liquidity?: number | null;
  /** Product shape. Kalshi multivariate/parlay products are `combo`. */
  marketKind: MarketKind;
  /** Materialization state for prebuilt/multivariate contracts. */
  materializationState?: string | null;
  /** Open interest in contracts (Kalshi only). */
  openInterest?: number | null;
  /** Selected outcome index when this market was resolved by outcome-token asset ID. */
  outcomeIndex?: number | null;
  /** Selected outcome label when this market was resolved by outcome-token asset ID. */
  outcomeLabel?: string | null;
  /** Possible outcomes with current prices (0.0–1.0 probability). */
  outcomes: Array<UnifiedOutcome>;
  /** Parent multivariate event URL for combo products. */
  parentEventUrl?: string | null;
  /** Price discovery mechanism. */
  pricingMode: PricingMode;
  /** Original exchange title when the API supplies a normalized display title. */
  rawTitle?: string | null;
  /** Machine series ticker supplied by Kalshi. */
  seriesTicker?: string | null;
  /** Canonical series title when supplied by the exchange. */
  seriesTitle?: string | null;
  /** Settlement semantics for combo products. */
  settlementRule?: string | null;
  /** URL-safe slug (Kalshi: lowercase ticker, Polymarket: slug field). */
  slug: string;
  /** Exchange-native sports market type (moneyline, totals, spread, etc.). */
  sportsMarketType?: string | null;
  /** Market status: "active", "closed", "settled". */
  status: string;
  /** Normalized discovery tags. */
  tags?: Array<string>;
  /** Raw Kalshi ticker. `id` remains the cross-exchange identifier. */
  ticker?: string | null;
  /** Human-readable title/question. */
  title: string;
  /** Rolling 24-hour trade count from the indexed tape (when available). */
  tradeCount24h?: number | null;
  /** Direct link to the market on its native platform. */
  url?: string | null;
  /** Total all-time volume (USD). */
  volume: number;
  /** Rolling 24-hour volume (USD, if available). */
  volume24h?: number | null;
}

/** A single binary or multi-category outcome with a price. */
export interface UnifiedOutcome {
  /** Outcome label (Yes/No, or custom e.g. country name in grouped markets). */
  label: string;
  /** Current probability (0.0–1.0). */
  price: number;
}

/** A single trade in normalized form. */
export interface UnifiedTrade {
  /** Official Kalshi count_fp string (lossless contract quantity). */
  countFp?: string | null;
  /** Parent event id (Polymarket Gamma id / Kalshi event_ticker). */
  eventId?: string | null;
  /** Parent event slug when available. */
  eventSlug?: string | null;
  /** Canonical parent event title. */
  eventTitle?: string | null;
  exchange: Exchange;
  /** Label within a grouped event (for example, "Spain"). */
  groupItemTitle?: string | null;
  /** Trade ID (Kalshi: trade_id, Polymarket: tx_hash:log_index). */
  id: string;
  /** Market or event image URL for feed cards. */
  image?: string | null;
  /** True for Polymarket combinatorial (combo) outcomes. */
  isCombo?: boolean | null;
  /** Market identifier (Kalshi ticker or Polymarket asset_id). */
  marketId: string;
  /** Kalshi no-leg reference price (same as `price` when side is no). */
  noPrice?: number | null;
  /** Official Kalshi no_price_dollars string (lossless). */
  noPriceDollars?: string | null;
  /** Direct outcome index for this traded outcome token. */
  outcomeIndex?: number | null;
  /** Direct outcome label for this traded outcome token. */
  outcomeLabel?: string | null;
  /** Execution price for the taker outcome (0.0–1.0). */
  price: number;
  /** Number of contracts / quantity. */
  quantity: number;
  /** Quantity in hundredths of a contract (Kalshi v2). */
  quantityE2?: number | null;
  /** Taker outcome: "yes" or "no" (Kalshi and Polymarket per-market), "buy"/"sell" (Polymarket global without enrichment). */
  side: string;
  /** Unix timestamp in milliseconds. */
  timestampMs: number;
  /** Wallet that initiated the trade (Polymarket taker; Kalshi is anonymous). */
  traderAddress?: string | null;
  /** Public Polymarket username for `traderAddress`; null for anonymous/private profiles. */
  traderUsername?: string | null;
  /** Transaction hash (Polymarket only). */
  txHash?: string | null;
  /** Kalshi yes-leg reference price (same as `price` when side is yes). */
  yesPrice?: number | null;
  /** Official Kalshi yes_price_dollars string (lossless). */
  yesPriceDollars?: string | null;
  /** Price in millionths of a dollar (Kalshi v2). */
  yesPriceE6?: number | null;
}

/** Wallet PnL grouped by event. */
export interface WalletEventPnlResponse {
  address: string;
  costMethod: string;
  events: Array<EventPnlSummary>;
  exchange: Exchange;
  realizedPnlUsd: number;
  totalPnlUsd: number;
  unrealizedPnlUsd: number;
}

/** Wallet overview bundle response. */
export interface WalletOverviewResponse {
  address: string;
  pnl: WalletPnlSummary;
  positions: PaginatedWalletPositions;
  recentTrades: TradesEnrichedResponse;
  value: PortfolioValueResponse;
}

export interface WalletPnlChartPoint {
  portfolioValueUsd: number;
  realizedPnlUsd: number;
  /** Bucket start as Unix milliseconds. */
  timestamp: number;
  totalPnlUsd: number;
  unrealizedPnlUsd: number;
}

export interface WalletPnlChartResponse {
  address: string;
  /** First available bucket as Unix milliseconds. */
  dataStartAt?: number | null;
  points: Array<WalletPnlChartPoint>;
  /** `1h`, `1d`, `1w`, or `1mo`. */
  resolution: string;
}

/** Wallet-level PnL summary across all positions. */
export interface WalletPnlSummary {
  activePositionCount: number;
  /** The wallet address. */
  address: string;
  /** Cost basis method (`fifo`). */
  costMethod: string;
  /** Exchange (Polymarket on-chain; Kalshi has no public wallet addresses). */
  exchange: Exchange;
  heldTokenPositionCount: number;
  /** Number of distinct markets traded. */
  marketsTraded: number;
  /** Number of positions currently open (net_tokens > 0). */
  openPositions: number;
  /** Individual position details. */
  positions: Array<WalletPosition>;
  /** Sum of realized PnL across all closed/partially-closed positions. */
  realizedPnlUsd: number;
  redeemablePositionCount: number;
  resolvedPositionCount: number;
  /** Total USDC spent across all positions. */
  totalInvestedUsd: number;
  /** Net PnL (realized + unrealized). */
  totalPnlUsd: number;
  /** Total USDC received from sells. */
  totalProceedsUsd: number;
  /** Sum of unrealized PnL for open positions (where current price is known). */
  unrealizedPnlUsd: number;
}

/** A single position (holding) in a prediction market outcome token. */
export interface WalletPosition {
  /** The outcome token's asset ID. */
  assetId: string;
  /** Average cost basis per token (0.0–1.0 probability scale). */
  avgCostBasis: number;
  /** Number of buy fills. */
  buyCount: number;
  /** Cost basis method used (`fifo`). */
  costMethod?: string | null;
  /** Current market price for this outcome (0.0–1.0). */
  currentPrice?: number | null;
  /** Parent Gamma event id when known. */
  eventId?: string | null;
  /** Parent Gamma event slug when known. */
  eventSlug?: string | null;
  /** Parent event title when known. */
  eventTitle?: string | null;
  /** Exchange this position is on. */
  exchange: Exchange;
  /** ISO-8601 first trade time. */
  firstTradeAt: string;
  groupItemTitle?: string | null;
  isActive: boolean;
  isRedeemable: boolean;
  isRedeemed: boolean;
  isResolved: boolean;
  /** ISO-8601 last trade time. */
  lastTradeAt: string;
  /** Authoritative current or final settlement mark. */
  markPrice?: number | null;
  /** Polymarket condition id when resolved. */
  marketId?: string | null;
  marketStatus: MarketStatus;
  /** Human-readable market title/question (if we can resolve it). */
  marketTitle?: string | null;
  /** Net tokens held (positive = long, negative = short / oversold). */
  netTokens: number;
  outcomeIndex?: number | null;
  outcomeLabel?: string | null;
  positionStatus: PositionStatus;
  /** Value of remaining tokens at the authoritative mark. */
  positionValueUsd?: number | null;
  /** Realized FIFO PnL, including final settlement PnL once resolved. */
  realizedPnlUsd: number;
  /** Unsettled cost basis; zero after authoritative market settlement. */
  remainingCostBasisUsd?: number | null;
  /** True once the outcome has an authoritative settlement value. */
  resolved: boolean;
  /** Return on remaining FIFO cost basis. */
  returnPct?: number | null;
  /** Number of sell fills. */
  sellCount: number;
  /** Shares economically settled at the final payout (resolved positions only). */
  settledTokens?: number | null;
  /** Final payout value of the remaining shares when resolved. */
  settlementValueUsd?: number | null;
  /** Total USDC spent acquiring this position. */
  totalCostUsd: number;
  /** Total USDC received from partial sells. */
  totalProceedsUsd: number;
  /** Unrealized PnL for unresolved positions; zero after authoritative settlement. */
  unrealizedPnlUsd?: number | null;
}

/** Wallet activity feed item (schema not fully specified in OpenAPI). */
export type AccountActivityItem = Record<string, unknown>;

/** Exchange schedule payload (schema not fully specified in OpenAPI). */
export type ExchangeScheduleResponse = Record<string, unknown>;

/** Milestones payload (schema not fully specified in OpenAPI). */
export type MilestonesResponse = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Query parameter types (snake_case matches wire query names)
// ---------------------------------------------------------------------------

/** Query params for GET /v1/accounts/{address}/activity */
export interface PmGetAccountActivityParams {
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Block number cursor */
  cursor?: string;
  /** Optional filter: fill, transfer_in, transfer_out, split, merge, redeem, fee, reward */
  activity_type?: string;
}

/** Query params for GET /v1/accounts/{address}/overview */
export interface PmGetAccountOverviewParams {
  /** Bypass Redis and exercise the exact ClickHouse serving path */
  fresh?: boolean;
}

/** Query params for GET /v1/accounts/{address}/pnl */
export interface PmGetAccountPnlParams {
  /** Rolling window in days such as 7, 30, or 90 (omit for all-time) */
  period_days?: number;
  /** Bypass Redis; ClickHouse serving path remains exact and bounded */
  fresh?: boolean;
}

/** Query params for GET /v1/accounts/{address}/pnl/chart */
export interface PmGetAccountPnlChartParams {
  /** 1h/hourly, 1d/daily, 1w/weekly, or 1mo/monthly (default 1d) */
  resolution?: string;
  /** Inclusive Unix milliseconds */
  from?: number;
  /** Inclusive Unix milliseconds */
  to?: number;
  /** Maximum points (default 500, max 5000) */
  limit?: number;
}

/** Query params for GET /v1/accounts/{address}/trades */
export interface PmGetAccountTradesParams {
  /** Max results (default 100, max 1000) */
  limit?: number;
  /** Block number cursor */
  cursor?: string;
}

/** Query params for GET /v1/browse */
export interface PmGetBrowseHubParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Max trending markets (default 12, max 50) */
  trending_limit?: number;
  /** Max recent trades (default 40, max 100) */
  trades_limit?: number;
  /** Embed markets/events on recent trades (default true) */
  include_trade_markets?: boolean;
}

/** Query params for GET /v1/categories */
export interface PmGetCategoriesParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
}

/** Query params for GET /v1/crypto/events */
export interface PmGetCryptoEventsParams {
  /** Asset key: btc, eth, sol, xrp, doge, bnb, hype (required unless seriesSlug is set) */
  asset?: string;
  /** Window interval: 5m (default), 15m, 1h/hourly, 4h, 1d/daily, 1w/weekly */
  interval?: string;
  /** Gamma series slug override, e.g. btc-up-or-down-hourly or bitcoin-up-or-down-weekly */
  seriesSlug?: string;
  /** Max results (default 50, max 100) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
  /** Window start order: desc (default) or asc */
  order?: string;
}

/** Query params for GET /v1/crypto/price */
export interface PmGetCryptoPriceParams {
  /** BTC, ETH, SOL, XRP, DOGE, BNB, HYPE */
  symbol: string;
  /** Window open (ISO-8601) */
  eventStartTime: string;
  /** Window close (ISO-8601) */
  endDate: string;
  /** fiveminute (default), fifteenminute, hourly, fourhour, daily */
  variant?: string;
}

/** Query params for GET /v1/crypto/price-history */
export interface PmGetCryptoPriceHistoryParams {
  /** BTC, ETH, SOL, XRP, DOGE, BNB, HYPE */
  symbol: string;
  /** Window open (ISO-8601) */
  eventStartTime: string;
  /** Window close (ISO-8601) */
  endDate: string;
  /** fiveminute (default), fifteenminute, hourly, fourhour, daily */
  variant?: string;
}

/** Query params for GET /v1/crypto/traders */
export interface PmGetCryptoTradersParams {
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
  /** Minimum crypto-event trades per wallet (default 5) */
  minTrades?: number;
}

/** Query params for GET /v1/events */
export interface PmGetEventsParams {
  /** Filter: kalshi, polymarket, or poly */
  exchange?: string;
  /** active, closed, or all */
  status?: string;
  /** Topic/tag/category filter (e.g. Sports, crypto, politics) */
  topic?: string;
  /** Alias for topic */
  tag?: string;
  /** Alias for topic */
  category?: string;
  /** Product shape filter; use combo for combo-builder events (alias: marketKind) */
  market_kind?: string;
  /** volume (default) or marketCount */
  sort?: string;
  /** asc or desc (default desc) */
  order?: string;
  /** Max results (default 100, max 500) */
  limit?: number;
  /** Pagination cursor from previous response */
  cursor?: string;
  /** When true, include top markets per event for chance/leader bars */
  include_markets?: boolean;
}

/** Query params for GET /v1/events/batch */
export interface PmGetEventsBatchParams {
  /** Required comma-separated event ids (Kalshi event_ticker, Polymarket id, POLY-…, or slug) */
  ids: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/events/{event_id} */
export interface PmGetEventParams {
  /** Force exchange lookup; auto-detect if omitted */
  exchange?: string;
}

/** Query params for GET /v1/events/{event_id}/candlesticks */
export interface PmGetEventCandlesticksParams {
  /** Force exchange lookup; auto-detect if omitted */
  exchange?: string;
  /** 1m, 1h, or 1d (default 1h) */
  period_interval?: string;
  /** Range start (unix s or ms) */
  start_ts?: string;
  /** Range end */
  end_ts?: string;
  /** Max candles per series (default 200, max 2000) */
  limit?: number;
  /** Pagination cursor for older bars */
  cursor?: string;
  /** Market filter: all (default), active, closed, or inactive */
  status?: string;
}

/** Query params for GET /v1/events/{event_id}/crypto */
export interface PmGetEventCryptoParams {
  /** Force exchange; default auto */
  exchange?: string;
  /** Max sibling windows (default 24, max 48) */
  windows_limit?: number;
  /** Include chart points (default true) */
  include_history?: boolean;
}

/** Query params for GET /v1/events/{event_id}/holders */
export interface PmGetEventHoldersParams {
  /** Force exchange; default auto (Polymarket) */
  exchange?: string;
  /** Max results (default 25, max 100) */
  limit?: number;
}

/** Query params for GET /v1/events/{event_id}/leaderboard/pnl */
export interface PmGetEventPnlLeaderboardParams {
  /** polymarket */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
}

/** Query params for GET /v1/events/{event_id}/traders */
export interface PmGetEventTradersParams {
  /** Force exchange; default auto (Polymarket) */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
}

/** Query params for GET /v1/leaderboard/pnl */
export interface PmGetPnlLeaderboardParams {
  /** polymarket only (Kalshi has no public wallets) */
  exchange?: string;
  /** Max results (default 100, max 500) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
  /** totalPnl (default), realizedPnl, volume */
  sort?: string;
}

/** Query params for GET /v1/leaderboard/traders */
export interface PmGetTraderLeaderboardParams {
  /** Max results (default 100, max 500) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
}

/** Query params for GET /v1/live_data */
export interface PmGetLiveDataParams {
  /** Required comma-separated tickers (max 50) */
  tickers: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets */
export interface PmGetMarketsParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** active, closed, or all */
  status?: string;
  /** Kalshi event ticker filter */
  event_ticker?: string;
  /** Category/tag slug filter */
  tag?: string;
  /** Alias for tag */
  category?: string;
  /** Minimum volume in USD */
  min_volume?: number;
  /** volume, volume24h, liquidity, openInterest, createdAt */
  sort?: string;
  /** asc or desc */
  order?: string;
  /** Max results (default 100, max 500) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Include Kalshi combo/multivariate markets (default false) */
  includeCombos?: boolean;
  /** Product filter: binary, categorical, or combo (comma-separated) */
  marketKind?: string;
}

/** Query params for GET /v1/markets/batch */
export interface PmGetMarketsBatchParams {
  /** Required comma-separated ids (max 100) */
  ids: string;
  /** kalshi, polymarket, or poly (required with lookup_by) */
  exchange?: string;
  /** asset_id, condition_id, ticker, or slug (requires exchange) */
  lookup_by?: string;
}

/** Query params for GET /v1/markets/books */
export interface PmGetMarketBooksParams {
  /** Required comma-separated tickers (max 25) */
  tickers: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/candlesticks/batch */
export interface PmGetCandlesticksBatchParams {
  /** Required comma-separated tickers / condition ids (max 25) */
  tickers: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** 1m, 1h, or 1d (default 1h) */
  period_interval?: string;
  /** Max candles per series (default 200, max 2000) */
  limit?: number;
}

/** Query params for GET /v1/markets/new */
export interface PmGetNewMarketsParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Include Kalshi combo/multivariate markets (default false) */
  includeCombos?: boolean;
  /** Product filter: binary, categorical, or combo (comma-separated) */
  marketKind?: string;
}

/** Query params for GET /v1/markets/search */
export interface PmSearchMarketsParams {
  /** Required search query (min 2 characters) */
  q: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** active, closed, or all (default active) */
  status?: string;
  /** Category filter */
  category?: string;
  /** Minimum volume USD */
  min_volume?: number;
  /** Maximum volume USD */
  max_volume?: number;
  /** relevance (default), volume, volume24h, liquidity, openInterest, createdAt */
  sort?: string;
  /** asc or desc (ignored for relevance) */
  order?: string;
  /** Max results (default 20, max 50) */
  limit?: number;
  /** Opaque keyset cursor from a previous response (not a numeric offset) */
  cursor?: string;
  /** Include Kalshi combo/multivariate markets (default false) */
  includeCombos?: boolean;
  /** Product filter: binary, categorical, or combo (comma-separated) */
  marketKind?: string;
}

/** Query params for GET /v1/markets/slug/{slug} */
export interface PmGetMarketBySlugParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/slug/{slug}/snapshot */
export interface PmGetMarketSnapshotBySlugParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Comma-separated sections: price,midpoint,spread,oi,orderbook,trades,related — or all (default price,midpoint) */
  include?: string;
  /** Max recent trades when include has trades (default 50, max 200) */
  trades_limit?: number;
  /** Orderbook levels per side (default 10, max 50) */
  orderbook_depth?: number;
  /** Max related markets (default 10, max 50) */
  related_limit?: number;
}

/** Query params for GET /v1/markets/trades */
export interface PmGetGlobalTradesParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Optional market filter */
  ticker?: string;
  /** Min timestamp (ISO-8601 or unix) */
  min_ts?: string;
  /** Max timestamp (ISO-8601 or unix) */
  max_ts?: string;
  /** Minimum trade notional in USD (price × quantity) */
  min_volume?: number;
  /** Maximum trade notional in USD (price × quantity) */
  max_volume?: number;
  /** Max results (default 100, max 1000) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Embed resolved markets and parent events (default true) */
  include_markets?: boolean;
}

/** Query params for GET /v1/markets/trending */
export interface PmGetTrendingMarketsParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Include Kalshi combo/multivariate markets (default false) */
  includeCombos?: boolean;
  /** Product filter: binary, categorical, or combo (comma-separated) */
  marketKind?: string;
}

/** Query params for GET /v1/markets/{ticker} */
export interface PmGetMarketParams {
  /** Force exchange; auto-detect if omitted */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/candlesticks */
export interface PmGetMarketCandlesticksParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Candle period (default 1h) */
  period_interval?: string;
  /** Start timestamp */
  start_ts?: string;
  /** End timestamp */
  end_ts?: string;
  /** Max candles (default 200, max 2000) */
  limit?: number;
  /** Pagination cursor (overrides start_ts) */
  cursor?: string;
}

/** Query params for GET /v1/markets/{ticker}/holders */
export interface PmGetMarketHoldersParams {
  /** Must be polymarket */
  exchange?: string;
  /** Max results (default 25, max 100) */
  limit?: number;
}

/** Query params for GET /v1/markets/{ticker}/midpoint */
export interface PmGetMarketMidpointParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/oi */
export interface PmGetMarketOpenInterestParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/orderbook */
export interface PmGetMarketOrderbookParams {
  /** Auto-detect if omitted */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/price */
export interface PmGetMarketPriceParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/quote */
export interface PmGetMarketQuoteParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** buy (default) or sell */
  side?: string;
  /** Stake size (default 100) */
  size?: number;
  /** shares (default) or usd (alias: sizeUnit) */
  size_unit?: string;
  /** Polymarket: yes/no or CLOB token id */
  outcome?: string;
}

/** Query params for GET /v1/markets/{ticker}/related */
export interface PmGetRelatedMarketsParams {
  /** Source exchange hint */
  exchange?: string;
  /** Max results (default 10, max 50) */
  limit?: number;
}

/** Query params for GET /v1/markets/{ticker}/snapshot */
export interface PmGetMarketSnapshotParams {
  /** Force exchange; auto-detect if omitted */
  exchange?: string;
  /** Comma-separated sections: price,midpoint,spread,oi,orderbook,trades,related — or all (default price,midpoint) */
  include?: string;
  /** Max recent trades when include has trades (default 50, max 200) */
  trades_limit?: number;
  /** Orderbook levels per side (default 10, max 50) */
  orderbook_depth?: number;
  /** Max related markets (default 10, max 50) */
  related_limit?: number;
}

/** Query params for GET /v1/markets/{ticker}/spread */
export interface PmGetMarketSpreadParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
}

/** Query params for GET /v1/markets/{ticker}/traders */
export interface PmGetMarketTradersParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination cursor (Polymarket only) */
  cursor?: string;
}

/** Query params for GET /v1/markets/{ticker}/trades */
export interface PmGetMarketTradesParams {
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** Minimum trade notional in USD (price × quantity) */
  min_volume?: number;
  /** Maximum trade notional in USD (price × quantity) */
  max_volume?: number;
  /** Max results (default 100, max 1000) */
  limit?: number;
  /** Kalshi: RFC3339 timestamp; Polymarket: block number */
  cursor?: string;
}

/** Query params for GET /v1/milestones */
export interface PmGetMilestonesParams {
  /** kalshi, polymarket, or omit for both */
  exchange?: string;
  /** Optional sport/category filter */
  sport?: string;
  /** Max results (default 50) */
  limit?: number;
}

/** Query params for GET /v1/search */
export interface PmSearchParams {
  /** Required search query (min 2 characters) */
  q: string;
  /** kalshi, polymarket, or poly */
  exchange?: string;
  /** active, closed, or all (default active) */
  status?: string;
  /** Max markets (default 12, max 30); events capped at 10; traders capped at 8 */
  limit?: number;
}

/** Query params for GET /v1/series */
export interface PmGetSeriesParams {
  /** Max results (default 50, max 200) */
  limit?: number;
  /** Pagination offset cursor */
  cursor?: string;
}

/** Query params for GET /v1/sports */
export interface PmGetSportsParams {
  /** Max results (default 50, max 200) */
  limit?: number;
}

/** Query params for GET /v1/traders/search */
export interface PmSearchTradersParams {
  /** Required search query (min 2 characters) */
  q: string;
  /** Max results (default 20, max 50) */
  limit?: number;
  /** Opaque keyset cursor from a previous response */
  cursor?: string;
  /** relevance (default), volume, or pnl */
  sort?: string;
}
