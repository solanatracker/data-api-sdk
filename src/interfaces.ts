// Core interfaces for the Solana Tracker Data API

export interface TokenInfo {
  name: string;
  symbol: string;
  mint: string;
  uri?: string;
  decimals: number;
  description?: string;
  image?: string;
  hasFileMetaData?: boolean;
  strictSocials?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
  showName?: boolean;
  twitter?: string;
  telegram?: string;
  website?: string;
  discord?: string;
  createdOn?: string;
  creation?: {
    creator: string;
    created_tx: string;
    created_time: number;
  };
  [key: string]: any;
}

export interface TokenSecurity {
  freezeAuthority: string | null;
  mintAuthority: string | null;
}

export interface TokenPoolTxns {
  buys: number;
  sells: number;
  total: number;
  volume: number;
  volume24h: number;  // New field
}


export interface TokenValuePair {
  quote: number;
  usd: number;
}

export interface LaunchpadLiquidity {
  amount: number;
  usd: number;
}

export interface Launchpad {
  name: string;
  url: string;
  logo: string;
  baseLiquidity: LaunchpadLiquidity;
  quoteLiquidity: LaunchpadLiquidity;
}

export interface MeteoraCurveLiquidity {
  base?: number;  // For baseLiquidity
  quote?: number; // For quoteLiquidity
  usd: number;
}

export interface MeteoraCurve {
  baseLiquidity: MeteoraCurveLiquidity;
  quoteLiquidity: MeteoraCurveLiquidity;
  fee: number;
  name?: string;  // Optional
  url?: string;   // Optional
  logo?: string;  // Optional
}

/** Exact wallet entry returned on the Data API wire. */
export interface RiskWalletWire {
  /** Wallet public key */
  wallet: string;
  /** Token balance held by this wallet (UI amount) */
  balance: number;
  /** Percent of supply held by this wallet */
  percentage: number;
}

/** SDK-normalized risk wallet with the legacy `address` alias. */
export interface RiskWallet {
  /**
   * Correct wire field. Optional in this compatibility type so 0.3.x object
   * literals containing only `address` continue to compile. SDK responses
   * always populate it; use `RiskWalletWire` for the exact wire shape.
   */
  wallet?: string;
  /**
   * @deprecated Use `wallet`. Retained as a normalized SDK alias for 0.3.x
   * compatibility; the Data API wire response uses `wallet`.
   */
  address: string;
  balance: number;
  percentage: number;
}

export interface RiskCategory {
  count: number;
  totalBalance: number;
  totalPercentage: number;
  wallets: RiskWallet[];
}

export interface BundlerWallet {
  wallet: string;
  initialBalance: number;
  initialPercentage: number;
  balance: number;
  percentage: number;
  bundleTime: number;
}

export interface BundlersCategory {
  count: number;
  totalBalance: number;
  totalPercentage: number;
  totalInitialBalance: number;
  totalInitialPercentage: number;
  wallets: BundlerWallet[];
}

export interface BundlersResponse {
  total: number;
  balance: number;
  percentage: number;
  initialBalance: number;
  initialPercentage: number;
  wallets: BundlerWallet[];
}

export interface MultiTokensResponse {
  tokens: {
    [tokenAddress: string]: TokenDetailResponse;
  };
}

export interface PoolInfo {
  poolId: string;
  liquidity: TokenValuePair;
  price: TokenValuePair;
  tokenSupply: number;
  lpBurn: number;
  tokenAddress: string;
  marketCap: TokenValuePair;
  market: string;
  quoteToken: string;
  decimals: number;
  security: TokenSecurity;
  lastUpdated: number;
  deployer?: string;
  txns?: TokenPoolTxns;  // Now includes volume24h
  curvePercentage?: number;
  curve?: string;
  createdAt?: number;
  bundleId?: string;
  launchpad?: Launchpad;
  meteoraCurve?: MeteoraCurve;
  raydium?: {
    baseLiquidity: number;
    quoteLiquidity: number;
  };
  heaven?: {
    baseLiquidity: number;
    quoteLiquidity: number;
    is_migrated: boolean;
    migrationTime?: number; 
  };
  pumpfun?: {
    tokenProgram?: string;
    isMayhemMode?: boolean;
  };
  'pumpfun-amm'?: {
    tokenProgram?: string;
    isMayhemMode?: boolean;
  };
  /** Pool creation data - only present on new/graduated pool messages */
  creation?: {
    creator: string;
    created_tx: string;
    created_time: number;
  };
}

export interface PriceChangeData {
  priceChangePercentage: number;
}

export interface TokenEvents {
  "1m"?: PriceChangeData;
  "5m"?: PriceChangeData;
  "15m"?: PriceChangeData;
  "30m"?: PriceChangeData;
  "1h"?: PriceChangeData;
  "2h"?: PriceChangeData;
  "3h"?: PriceChangeData;
  "4h"?: PriceChangeData;
  "5h"?: PriceChangeData;
  "6h"?: PriceChangeData;
  "12h"?: PriceChangeData;
  "24h"?: PriceChangeData;
}

export interface DevHolding {
  percentage: number;
  amount: number;
}

export interface RiskFees {
  jito?: number;
  network?: number;
  bloom?: number;
  maestro?: number;
  soltradingbot?: number;
  bullx?: number;
  photon?: number;
  trojan?: number;
  padre?: number;
  nextblock?: number;
  totalTrading?: number;
  totalTips?: number;
  total?: number;
  [key: string]: number | undefined;
}

export interface TokenRisk {
  snipers: RiskCategory;
  insiders: RiskCategory;
  /**
   * The wire response may omit this summary. The SDK normalizes omission to an
   * empty category for 0.3.x compatibility; use the dedicated bundlers endpoint
   * for a complete list.
   */
  bundlers: BundlersCategory;
  top10: number;
  dev: DevHolding;
  fees?: RiskFees;
  rugged: boolean;
  risks: TokenRiskFactor[];
  score: number;
  jupiterVerified?: boolean;
}

export interface TokenRiskFactor {
  name: string;
  description: string;
  value?: string | number;
  level: "warning" | "danger";
  score: number;
}

export interface TokenDetailResponse {
  token: TokenInfo;
  pools: PoolInfo[];
  events: TokenEvents;
  risk: TokenRisk;
  buys: number;
  sells: number;
  txns: number;
  holders?: number;
}

export interface Holder {
  wallet: string;
  amount: number;
  value: TokenValuePair;
  percentage: number;
}

export interface TopHolder {
  address: string;
  amount: number;
  percentage: number;
  value: TokenValuePair;
}

/**
 * Flat per-token PnL returned in `/tokens/:tokenAddress/holders?enrich=walletPnl`.
 *
 * Distinct from the nested `PnlV2Position` shape: holder enrichment uses flat
 * field names (`buys`/`sells`, `totalBought`/`totalSold`, `avgBuy`/`avgSell`)
 * for backwards compatibility.
 */
export interface EnrichedTokenPnl {
  realized: number | null;
  unrealized: number | null;
  total: number | null;
  invested: number | null;
  proceeds: number | null;
  buys: number;
  sells: number;
  totalTrades: number;
  roi: number | null;
  /** Current token balance (native units). */
  balance: number | null;
  /** Cost basis of remaining held tokens (USD). */
  costBasis: number | null;
  /** Current USD value of held tokens. */
  value: number | null;
  /** Current token price (USD). */
  price: number | null;
  /** Total tokens purchased (native units). */
  totalBought: number | null;
  /** Total tokens sold (native units). */
  totalSold: number | null;
  /** Average buy size (USD). */
  avgBuy: number | null;
  /** Average sell size (USD). */
  avgSell: number | null;
  /** Average cost per token (USD). */
  avgCost?: number | null;
  /** Unix ms. */
  firstBuy: number | null;
  /** Unix ms. */
  lastBuy: number | null;
  /** Unix ms. */
  firstSell: number | null;
  /** Unix ms. */
  lastSell: number | null;
  /** Unix ms. */
  firstTrade: number | null;
  /** Unix ms. */
  lastTrade: number | null;
  /** Hold duration in seconds. */
  holdTimeSecs: number | null;
}

export interface TokenHoldersResponse {
  total: number;
  enrich?: string[];
  accounts: (Holder & {
    pnl?: {
      wallet?: PnlV2WalletLifetimePnl;
      token?: EnrichedTokenPnl;
    };
    identity?: PnlV2Identity | null;
  })[];
}

export interface AthPrice {
  highest_price: number;
  highest_market_cap: number;
  timestamp: number;
  pool_id: string;
}

export interface DeployerToken {
  name: string;
  symbol: string;
  mint: string;
  image?: string;
  decimals: number;
  hasSocials: boolean;
  poolAddress?: string;
  liquidityUsd: number;
  marketCapUsd: number;
  priceUsd: number;
  lpBurn: number;
  market: string;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  createdAt: number;
  lastUpdated: number;
  buys: number;
  sells: number;
  totalTransactions: number;
}

export interface DeployerTokensResponse<T = DeployerToken> {
  total: number;
  tokens: T[];
}

/**
 * Parameters for the deployer endpoint (/deployer/:wallet)
 */
export interface DeployerParams {
  /** Page number (default: 1) */
  page?: number;
  /** Number of items per page (default: 250, max: 500, max: 100 when format=full) */
  limit?: number;
  /** Filter by market(s) - single value or array (e.g., 'raydium' or ['raydium', 'orca', 'pumpfun']) */
  market?: string | string[];
  /** Filter by launchpad(s) - single value or array (e.g., 'pumpfun' or ['pumpfun', 'boop']) */
  launchpad?: string | string[];
  /** Return full token objects (same shape as /tokens/:token). Max limit is capped at 100. */
  format?: 'full';
}

export interface SearchParams {
  // Search & Pagination
  query?: string;
  symbol?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: string;
  showAllPools?: boolean;
  showPriceChanges?: boolean;
  
  // Creation Filters
  minCreatedAt?: number;
  maxCreatedAt?: number;
  
  // Liquidity & Market Cap Filters
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  
  // Volume Filters
  minVolume?: number;
  maxVolume?: number;
  volumeTimeframe?: string;
  minVolume_5m?: number;
  maxVolume_5m?: number;
  minVolume_15m?: number;
  maxVolume_15m?: number;
  minVolume_30m?: number;
  maxVolume_30m?: number;
  minVolume_1h?: number;
  maxVolume_1h?: number;
  minVolume_6h?: number;
  maxVolume_6h?: number;
  minVolume_12h?: number;
  maxVolume_12h?: number;
  minVolume_24h?: number;
  maxVolume_24h?: number;
  
  // Transaction Filters
  minBuys?: number;
  maxBuys?: number;
  minSells?: number;
  maxSells?: number;
  minTotalTransactions?: number;
  maxTotalTransactions?: number;
  
  // Holder Filters
  minHolders?: number;
  maxHolders?: number;
  minTop10?: number;
  maxTop10?: number;
  minDev?: number;
  maxDev?: number;
  minInsiders?: number;
  maxInsiders?: number;
  minSnipers?: number;
  maxSnipers?: number;
  
  // Token Characteristics
  lpBurn?: number;
  /** Filter by market(s) - single value or array (e.g., 'raydium' or ['raydium', 'orca', 'pumpfun']) */
  market?: string | string[];
  freezeAuthority?: string;
  mintAuthority?: string;
  deployer?: string;
  creator?: string;
  status?: string;
  minCurvePercentage?: number;
  maxCurvePercentage?: number;
  
  // Social Media Filters
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  reddit?: string;
  tiktok?: string;
  github?: string;
  
  // Bundler Filters
  minBundlers?: number;
  maxBundlers?: number;
  minBundlerPercentage?: number;
  maxBundlerPercentage?: number;
  
  // Risk Score Filters
  minRiskScore?: number;
  maxRiskScore?: number;
  
  // Fees Filters
  minFeesTotal?: number;
  maxFeesTotal?: number;
  minFeesTrading?: number;
  maxFeesTrading?: number;
  minFeesTips?: number;
  maxFeesTips?: number;
  
  // Image Filters
  hasImage?: boolean;
  image?: string;
  
  // Socials Filter
  hasSocials?: boolean;

  // Coin Communities (live message counts from monitored community chat)
  /** When `true`, only tokens with at least one monitored community message. When `false`, only tokens with zero messages. */
  hasCoinCommunity?: boolean;
  /** Minimum live community message count (inclusive). */
  minCommunityMessages?: number;
  /** Maximum live community message count (inclusive). */
  maxCommunityMessages?: number;

  // Launchpad Filter
  /** Filter by launchpad(s) - single value or array (e.g., 'pumpfun' or ['pumpfun', 'boop']) */
  launchpad?: string | string[];
  
  // Graduated Filters
  minGraduatedAt?: number;
  maxGraduatedAt?: number;
  
  /** Return full token objects (same shape as /tokens/:token). Max limit is capped at 100. */
  format?: 'full';
  
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  mint: string;
  image?: string;
  decimals: number;
  hasSocials: boolean;
  poolAddress: string;
  liquidityUsd: number;
  marketCapUsd: number;
  priceUsd: number;
  lpBurn: number;
  market: string;
  quoteToken: string;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  deployer: string;
  status: string;
  createdAt: number;
  lastUpdated: number;
  holders: number;
  buys: number;
  sells: number;
  totalTransactions: number;
  volume: number;
  volume_5m: number;
  volume_15m: number;
  volume_30m: number;
  volume_1h: number;
  volume_6h: number;
  volume_12h: number;
  volume_24h: number;
  jupiter?: boolean;
  verified?: boolean;
  top10?: number;
  dev?: number;
  insiders?: number;
  snipers?: number;
  bundlers?: {
    count: number;
    balance: number;
    percentage: number;
  };
  riskScore?: number;
  socials?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    reddit?: string;
    tiktok?: string;
    github?: string;
  };
  fees?: {
    total?: number;
    totalTrading?: number;
    totalTips?: number;
  };
  tokenDetails?: {
    creator: string;
    tx: string;
    time: number;
  };
  launchpad?: {
    name: string;
    curvePercentage?: number;
  };
  graduatedAt?: number;
  /** Whether the token has monitored Coin Communities chat activity. */
  hasCoinCommunity?: boolean;
  /** Live community message count (messages observed since the feed monitor started). */
  communityMessages?: number;
  events?: {
    "1m"?: { priceChangePercentage: number };
    "5m"?: { priceChangePercentage: number };
    "15m"?: { priceChangePercentage: number };
    "30m"?: { priceChangePercentage: number };
    "1h"?: { priceChangePercentage: number };
    "2h"?: { priceChangePercentage: number };
    "3h"?: { priceChangePercentage: number };
    "4h"?: { priceChangePercentage: number };
    "5h"?: { priceChangePercentage: number };
    "6h"?: { priceChangePercentage: number };
    "12h"?: { priceChangePercentage: number };
    "24h"?: { priceChangePercentage: number };
  };
}

export interface SearchResponse<T = SearchResult> {
  status: string;
  data: T[];
  total?: number;
  pages?: number;
  page?: number;
  cursor?: string;
  nextCursor?: string;
  hasMore?: boolean;
}

export interface TokenOverview {
  latest: TokenDetailResponse[];
  graduating: TokenDetailResponse[];
  graduated: TokenDetailResponse[];
}

/** Price change percentage for a single timeframe (percent units, e.g. `-3.91`). */
export interface PriceChangePercentage {
  priceChangePercentage: number;
}

/**
 * Present when `priceChanges=true` on price endpoints.
 * Timeframe keys may be omitted when unavailable.
 */
export interface PriceChanges {
  '1m'?: PriceChangePercentage;
  '5m'?: PriceChangePercentage;
  '15m'?: PriceChangePercentage;
  '30m'?: PriceChangePercentage;
  '1h'?: PriceChangePercentage;
  '2h'?: PriceChangePercentage;
  '3h'?: PriceChangePercentage;
  '4h'?: PriceChangePercentage;
  '5h'?: PriceChangePercentage;
  '6h'?: PriceChangePercentage;
  '12h'?: PriceChangePercentage;
  '24h'?: PriceChangePercentage;
}

export interface PriceData {
  /** Token price in USD */
  price: number;
  /** Token price in quote units when available */
  priceQuote?: number;
  /** Liquidity in USD */
  liquidity: number;
  /** Market cap in USD */
  marketCap: number;
  /** Unix timestamp in milliseconds */
  lastUpdated: number;
  /** Present when `priceChanges=true` */
  priceChanges?: PriceChanges;
}

export interface PriceHistoryData {
  current: number;
  "3d"?: number;
  "5d"?: number;
  "7d"?: number;
  "14d"?: number;
  "30d"?: number;
}

export interface PriceTimestampData {
  price: number;
  timestamp: number;
  timestamp_unix: number;
  pool: string;
}

export interface PriceRangeData {
  token: string;
  price: {
    lowest: {
      price: number;
      time: number;
    };
    highest: {
      price: number;
      time: number;
    };
  };
}

export interface PriceChange {
  timeframe: string;
  percentage: number;
}

export interface MultiPriceResponse {
  [tokenAddress: string]: PriceData;
}

export interface WalletTokenData {
  address: string;
  balance: number;
  value: number;
  price: TokenValuePair;
  marketCap: TokenValuePair;
  liquidity: TokenValuePair;
}

export interface WalletBasicResponse {
  tokens: WalletTokenData[];
  total: number;
  totalSol: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
}

export interface TradeTokenInfo {
  address: string;
  amount: number;
  token: TokenMetadata;
}

export interface TradeTransaction {
  tx: string;
  from?: TradeTokenInfo;
  to?: TradeTokenInfo;
  amount?: number;
  priceUsd?: number;
  volume?: number;
  solVolume?: number;
  type?: string;
  wallet: string;
  time: number;
  program: string;
  pools?: string[];
  token?: {
    from: TradeTokenInfo;
    to: TradeTokenInfo;
  };
}

export interface TradesResponse {
  trades: Trade[];
  nextCursor?: number;
  hasNextPage?: boolean;
}

export interface WalletTradesResponse {
  trades: WalletTrade[];
  nextCursor?: number;
  hasNextPage?: boolean;
}

export interface WalletTokenDetail {
  token: TokenInfo;
  pools?: PoolInfo[];
  events?: TokenEvents;
  risk?: TokenRisk;
  balance: number;
  value: number;
}

export interface WalletResponse {
  tokens: WalletTokenDetail[];
  total: number;
  totalSol: number;
  timestamp: string;
}

export interface OHLCVData {
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  time: number;
}

export interface ChartResponse {
  oclhv: OHLCVData[];
}

export interface HolderChartData {
  holders: number;
  time: number;
}

export interface HoldersChartResponse {
  holders: HolderChartData[];
}

export interface SnipersChartData {
  percentage: number;
  time: number;
}

export interface SnipersChartResponse {
  snipers: SnipersChartData[];
}

export interface InsidersChartData {
  percentage: number;
  time: number;
}

export interface InsidersChartResponse {
  insiders: InsidersChartData[];
}

export interface BundlersChartData {
  percentage: number;
  time: number;
}

export interface BundlersChartResponse {
  bundlers: BundlersChartData[];
}

export interface PnLData {
  holding: number;
  held: number;
  sold: number;
  realized: number;
  unrealized: number;
  total: number;
  total_sold: number;
  total_invested: number;
  average_buy_amount: number;
  current_value: number;
  cost_basis: number;
  sold_usd?: number;
  first_buy_time?: number;
  last_buy_time?: number;
  last_sell_time?: number;
  last_trade_time?: number;
  buy_transactions?: number;
  sell_transactions?: number;
  total_transactions?: number;
}

export interface PnLSummary {
  realized: number;
  unrealized: number;
  total: number;
  totalInvested: number;
  averageBuyAmount: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  lossPercentage: number;
  neutralPercentage?: number;
}

export interface PnLResponse {
  tokens: {
    [tokenAddress: string]: PnLData;
  };
  summary: PnLSummary;
}

export interface TokenPnLResponse extends PnLData { }

export interface FirstBuyTransaction {
  signature: string;
  amount: number;
  volume_usd: number;
  time: number;
}

export interface FirstBuyerData {
  wallet: string;
  first_buy_time: number;
  first_buy: FirstBuyTransaction;
  first_sell_time: number | null;
  last_transaction_time: number;
  held: number;
  sold: number;
  sold_usd: number;
  holding: number;
  realized: number;
  unrealized: number;
  total: number;
  total_invested: number;
  buy_transactions: number;
  sell_transactions: number;
  total_transactions: number;
  average_buy_amount: number;
  average_sell_amount: number;
  current_value: number;
  cost_basis: number;
}

export interface TopTrader {
  wallet: string;
  summary: PnLSummary;
}

export interface TopTradersResponse {
  wallets: TopTrader[];
}

export interface TimeframeStats {
  buyers: number;
  sellers: number;
  volume: {
    buys: number;
    sells: number;
    total: number;
  };
  transactions: number;
  buys: number;
  sells: number;
  wallets: number;
  price: number;
  priceChangePercentage: number;
}

export interface TokenStats {
  "1m"?: TimeframeStats;
  "5m"?: TimeframeStats;
  "15m"?: TimeframeStats;
  "30m"?: TimeframeStats;
  "1h"?: TimeframeStats;
  "4h"?: TimeframeStats;
  "24h"?: TimeframeStats;
}

export interface TokenStatsTotal {
  buys: number;
  sells: number;
  total: number;
  volume: number;
}

export interface WalletChartDataPoint {
  date: string;
  value: number;
  timestamp: number;
  pnlPercentage: number;
}

export interface WalletChartPnLPeriod {
  value: number;
  percentage: number;
}

export interface WalletChartResponse {
  chartData: WalletChartDataPoint[];
  pnl: {
    '24h': WalletChartPnLPeriod;
    '30d': WalletChartPnLPeriod;
  };
}

export interface CreditsResponse {
  credits: number;
}

export interface TradeMetadataToken {
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
  amount: number;
  address: string;
  priceUsd: number;
  // Additional fields that may be present from on-chain metadata
  mint?: string;
  uri?: string;
  isMutable?: boolean;
  description?: string;
  tags?: string[];
  extensions?: {
    website?: string;
    twitter?: string;
    telegram?: string;
  };
  hasFileMetaData?: boolean;
  [key: string]: any; // Allow any additional on-chain metadata fields
}

export interface TradeMetadata {
  from: TradeMetadataToken;
  to: TradeMetadataToken;
}

// Trade structure for /trades endpoint
export interface Trade {
  tx: string;
  amount: number;
  priceUsd: number;
  volume: number;
  volumeSol: number;
  type: "buy" | "sell";
  wallet: string;
  time: number;
  program: string;
  pools: string[];
  meta?: TradeMetadata; // Only present when showMeta is true
}

// Trade structure for /wallet/:wallet/trades endpoint
export interface WalletTrade {
  tx: string;
  from: {
    address: string;
    amount: number;
    token?: {
      name: string;
      symbol: string;
      image: string;
      decimals: number;
      price?: { usd: number };
    };
    priceUsd: number;
  };
  to: {
    address: string;
    amount: number;
    token?: {
      name: string;
      symbol: string;
      image: string;
      decimals: number;
      price?: { usd: number };
    };
    priceUsd: number;
  };
  price: {
    usd: number;
    sol?: string;
  };
  volume: {
    usd: number;
    sol?: number;
  };
  wallet: string;
  program: string;
  time: number;
}

export interface EventsParams {
  /** Whether to decode the binary data into events array */
  decode?: boolean;
  /** Whether to process events into statistics */
  process?: boolean;
  /** Whether to process events asynchronously (for large datasets) */
  async?: boolean;
}

export interface ProcessedEvent {
  wallet: string;
  amount: number;
  priceUsd: number;
  volume: number;
  type: 'buy' | 'sell';
  time: number;
}

export interface TimeframeStats {
  buyers: number;
  sellers: number;
  volume: {
    buys: number;
    sells: number;
    total: number;
  };
  transactions: number;
  buys: number;
  sells: number;
  wallets: number;
  price: number;
  priceChangePercentage: number;
}

export interface ProcessedStats {
  '1m'?: TimeframeStats;
  '5m'?: TimeframeStats;
  '15m'?: TimeframeStats;
  '30m'?: TimeframeStats;
  '1h'?: TimeframeStats;
  '2h'?: TimeframeStats;
  '3h'?: TimeframeStats;
  '4h'?: TimeframeStats;
  '5h'?: TimeframeStats;
  '6h'?: TimeframeStats;
  '12h'?: TimeframeStats;
  '24h'?: TimeframeStats;
}


export interface ProcessedEvent {
  wallet: string;
  amount: number;
  priceUsd: number;
  volume: number;
  type: 'buy' | 'sell';
  time: number;
}

export interface SubscriptionResponse {
  credits: number;
  plan: string;
  next_billing_date: string;
  status: string;
}

export interface WalletBalanceUpdate {
  wallet: string;
  token: string;
  amount: number;
}

// ======== PNL V2 TYPES ========

export type PnlMode = 'strict' | 'adjusted' | 'raw';

export interface PnlV2Block {
  realized: number | null;
  realizedRaw?: number | null;
  unrealized: number | null;
  total: number | null;
}

export interface PnlV2Pagination {
  hasMore: boolean;
  nextCursor: string | null;
  count: number;
  total: number;
  pnlMode?: PnlMode;
  enrich?: string[];
}

export interface PnlV2IdentityBot {
  name: string | null;
  avatar: string | null;
}

export interface PnlV2IdentityPool {
  program: string | null;
  poolAddress: string | null;
  tokenA?: string | null;
  tokenB?: string | null;
}

export interface PnlV2IdentityDeveloper {
  token?: string | null;
  via?: string[];
  pools?: string[];
  creationTx?: string | null;
  createdAt?: number | null;
  tokens?: string[];
}

export interface PnlV2IdentityHacker {
  label: string | null;
}

export interface PnlV2IdentitySpamDusting {
  label: string | null;
}

export interface PnlV2IdentityExchange {
  name: string | null;
}

/** Primary `.sol` domain from Ridge (Solscan-style domain label). */
export interface PnlV2IdentitySns {
  domain: string;
}

export interface PnlV2Identity {
  /**
   * Display name. For SNS-only wallets this is the primary domain (e.g. `solanatracker.sol`).
   * When a higher-priority label exists (KOL, exchange, bot, etc.), that label keeps `name`
   * and the domain is still available on `sns.domain`.
   */
  name?: string | null;
  twitter?: string | null;
  avatar?: string | null;
  /** Primary label type, e.g. `kol`, `sns`, `bot`, `developer`, `pool`, `exchange`. */
  type?: string | null;
  /** All resolved labels, e.g. `['kol', 'sns']`. */
  tags?: string[];
  platforms?: string[];
  /** Present when the wallet has a primary `.sol` domain (may coexist with other tags). */
  sns?: PnlV2IdentitySns;
  bot?: PnlV2IdentityBot;
  pool?: PnlV2IdentityPool;
  developer?: PnlV2IdentityDeveloper;
  hacker?: PnlV2IdentityHacker;
  spamDusting?: PnlV2IdentitySpamDusting;
  exchange?: PnlV2IdentityExchange;
}

export interface PnlV2WalletLifetimePnl {
  realized: number | null;
  unrealized: number | null;
  total: number | null;
  invested: number | null;
  proceeds: number | null;
  totalTrades: number;
  tokensTraded: number;
}

export interface PnlV2TokenScopedPnl {
  token: PnlV2Block;
  /**
   * Lifetime wallet PnL summary. Only populated when the underlying response
   * is enriched with wallet PnL data (always on for `/v2/pnl/tokens/...` endpoints,
   * opt-in for `/tokens/:token/holders?enrich=walletPnl`).
   */
  wallet?: PnlV2WalletLifetimePnl;
}

export interface PnlV2PnlAdjustments {
  mode: PnlMode;
  invalidPnl: number | null;
  adjustedCorrection: number | null;
}

export interface PnlV2TokenMeta {
  symbol: string | null;
  name: string | null;
  image?: string;
  decimals: number | null;
  price: number | null;
  snapshotPrice?: number | null;
  marketCap: number | null;
  liquidity: number | null;
  primaryMarket: string | null;
}

export interface PnlV2WalletQueued {
  indexed: false;
  queued: true;
  message: string;
}

// -- Leaderboard Types --

export interface PnlV2Trader {
  wallet: string;
  pnl: PnlV2Block;
  invested: number | null;
  proceeds: number | null;
  openPositions: {
    cost: number | null;
    value: number | null;
  };
  counts: {
    buys: number;
    sells: number;
    trades: number;
    tokensTraded: number;
    tokensHeldEver: number;
  };
  averages: {
    buy: number | null;
    sell: number | null;
  };
  tokens: {
    profitable: number;
    losing: number;
    closed: number;
  };
  winRate: number | null;
  roi: number | null;
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
  };
  updatedAt: string | null;
}

export interface PnlV2TraderWithIdentity extends PnlV2Trader {
  identity: PnlV2Identity | null;
}

export interface PnlV2PeriodTrader {
  wallet: string;
  period: {
    realized: number | null;
    volume: number | null;
    tradingDays: number;
  };
  ending: {
    pnl: PnlV2Block;
  };
  lastSnapshotDate: string | null;
}

export interface PnlV2PeriodTraderWithIdentity extends PnlV2PeriodTrader {
  identity: PnlV2Identity | null;
}

export interface PnlV2DayTrader {
  wallet: string;
  day: {
    realized: number | null;
    volume: number | null;
    cost: number | null;
    buys: number;
    sells: number;
  };
  cumulative: {
    pnl: PnlV2Block;
    invested: number | null;
    proceeds: number | null;
  };
}

export interface PnlV2DayTraderWithIdentity extends PnlV2DayTrader {
  identity: PnlV2Identity | null;
}

export interface PnlV2Top90dTrader {
  wallet: string;
  period: {
    realized: number | null;
    realizedRaw?: number | null;
    volume: number | null;
    tradingDays: number;
    roi: number | null;
    days?: {
      profitable: number;
      losing: number;
      maxSinglePnl: number | null;
      winRate: number | null;
    };
  };
  pnlAdjustments?: PnlV2PnlAdjustments;
  ending: {
    pnl: {
      realized: number | null;
      total: number | null;
    };
  };
  invested: number | null;
  proceeds: number | null;
  counts: {
    buys: number;
    sells: number;
    trades: number;
    tokensTraded: number;
  };
  averages: {
    buy: number | null;
    sell: number | null;
  };
  tokens: {
    profitable: number;
    losing: number;
    closed: number;
  };
  winRate: number | null;
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
  };
  lastSnapshotDate: string | null;
  updatedAt: string | null;
  identity?: PnlV2Identity | null;
}

// -- Token Types --

export interface PnlV2Holder {
  wallet: string;
  pnl: PnlV2TokenScopedPnl;
  identity?: PnlV2Identity | null;
  /** Legacy current-position snapshot. Same values as `current` (kept for compatibility). */
  position: {
    balance: number | null;
    costBasis: number | null;
    value: number | null;
    price: number | null;
  };
  /** Legacy. Same as `volume.buyUsd` / `invested`. */
  buyUsd: number | null;
  /** Legacy. Same as `volume.sellUsd` / `proceeds`. */
  sellUsd: number | null;
  counts: {
    buys: number;
    sells: number;
    total: number;
  };
  roi: number | null;
  /** Total cost basis (USD spent buying). */
  invested: number | null;
  /** Total USD received from selling. */
  proceeds: number | null;
  volume: {
    tokensBought: number | null;
    tokensSold: number | null;
    buyUsd: number | null;
    sellUsd: number | null;
  };
  averages: {
    buy: number | null;
    sell: number | null;
  };
  current: {
    balance: number | null;
    costBasis: number | null;
    value: number | null;
    price: number | null;
    avgCost: number | null;
  };
  /** Trade timing. All values are unix ms except `holdTimeSecs` (seconds). */
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
    firstBuy: number | null;
    lastBuy: number | null;
    firstSell: number | null;
    lastSell: number | null;
    holdTimeSecs: number | null;
  };
}

// -- Wallet Types --

export interface PnlV2Summary {
  pnl: PnlV2Block;
  invested: number | null;
  proceeds: number | null;
  openPositions: {
    cost: number | null;
    value: number | null;
  };
  counts: {
    buys: number;
    sells: number;
    trades: number;
    tokensTraded: number;
    tokensHeldEver: number;
  };
  averages: {
    buy: number | null;
    sell: number | null;
  };
  roi: number | null;
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
    /** Average hold time in seconds across all positions with a first buy. */
    avgHoldTimeSecs?: number | null;
  };
}

export interface PnlV2Position {
  token: string;
  pnl: PnlV2Block;
  invested: number | null;
  proceeds: number | null;
  roi: number | null;
  current: {
    balance: number | null;
    costBasis: number | null;
    value: number | null;
    price: number | null;
    avgCost: number | null;
  };
  volume: {
    tokensBought: number | null;
    tokensSold: number | null;
    buyUsd: number | null;
    sellUsd: number | null;
  };
  averages: {
    buy: number | null;
    sell: number | null;
  };
  counts: {
    buys: number;
    sells: number;
    total: number;
  };
  timing: {
    firstBuy: number | null;
    lastBuy: number | null;
    firstSell: number | null;
    lastSell: number | null;
    firstTrade: number | null;
    lastTrade: number | null;
    holdTimeSecs: number | null;
  };
  meta?: PnlV2TokenMeta;
  portfolioPercent?: number | null;
}

export interface PnlV2PositionWithWallet extends PnlV2Position {
  wallet: string;
}

export interface PnlV2Snapshot {
  date: string;
  cumulative: {
    pnl: PnlV2Block;
    cost: number | null;
    proceeds: number | null;
    openPositions: {
      cost: number | null;
      value: number | null;
    };
    counts: {
      buys: number;
      sells: number;
      tokensTraded: number;
    };
  };
  activity: {
    pnl: {
      realized: number | null;
    };
    counts: {
      buys: number;
      sells: number;
    };
    volume: {
      costUsd: number | null;
      total: number | null;
    };
    averages: {
      buy: number | null;
      sell: number | null;
      realizedPnl: number | null;
      holdTimeSecs: number | null;
    };
  };
}

export interface PnlV2ChartPoint {
  date: string;
  time: number;
  pnl: {
    realized: number | null;
    total: number | null;
  };
  invested: number | null;
  proceeds: number | null;
  activity: {
    realizedPnl: number | null;
    buys: number;
    sells: number;
    volume: number | null;
    avgHoldTimeSecs: number | null;
  };
  counts: {
    buys: number;
    sells: number;
    tokensTraded: number;
  };
}

// -- Params Interfaces --

export interface PnlV2KOLLeaderboardParams {
  sort?: 'total' | 'realized' | 'unrealized' | 'invested' | 'proceeds' | 'value' | 'trades' | 'tokens' | 'roi' | 'win_percentage' | 'last_trade';
  direction?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
}

export interface PnlV2KOLPeriodParams {
  sort?: 'realized' | 'volume' | 'days' | 'ending_total';
  direction?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
  period?: '1d' | '7d' | '14d' | '30d' | '90d' | 'all';
  start?: string;
  end?: string;
}

export interface PnlV2KOLCalendarParams {
  year?: number;
  month?: number;
}

export interface PnlV2KOLByDateParams {
  date?: string;
}

export interface PnlV2TopTradersParams {
  sort?: 'realized' | 'volume' | 'days' | 'roi' | 'win_percentage' | 'trades' | 'tokens';
  direction?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
  platform?: string;
  excludeArbitrage?: string;
  pnlMode?: PnlMode;
  days?: number;
  minTrades?: number;
  minInvested?: number;
  minDays?: number;
  minWinRate?: number;
  minRoi?: number;
  minClosedTokens?: number;
  maxSingleTokenPct?: number;
}

export interface PnlV2TokenTradersParams {
  sort?: 'holding' | 'value' | 'pnl' | 'realized' | 'unrealized' | 'invested' | 'roi' | 'last_trade' | 'first_trade';
  direction?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
  platform?: string;
  excludeArbitrage?: string;
  excludeZeroBuys?: string;
  activeOnly?: string;
  minTrades?: number;
}

export interface PnlV2TokenFirstBuyersParams {
  sort?: 'first_trade';
  direction?: 'asc';
  limit?: number;
  cursor?: string;
  platform?: string;
  excludeArbitrage?: string;
  excludeZeroBuys?: string;
  activeOnly?: string;
  minTrades?: number;
}

export interface PnlV2WalletHistoryParams {
  period?: '1d' | '7d' | '14d' | '30d' | '90d' | 'all';
  start?: string;
  end?: string;
  limit?: number;
  /**
   * Denomination for monetary fields. Defaults to `usd`.
   * Pass `sol` or `eur` to convert USD snapshot values at read time.
   * Historical endpoints use the daily rate for each snapshot date.
   * Counts, percentages, timestamps, and ROI are not converted.
   */
  currency?: 'usd' | 'sol' | 'eur';
}

export interface PnlV2WalletPerformanceParams {
  period?: '1d' | '7d' | '14d' | '30d' | '90d' | 'all';
  days?: number;
  /**
   * Denomination for monetary fields. Defaults to `usd`.
   * Pass `sol` or `eur` to convert USD snapshot values at read time.
   * Counts, percentages, timestamps, and ROI are not converted.
   */
  currency?: 'usd' | 'sol' | 'eur';
}

export interface PnlV2WalletPositionsParams {
  sort?: 'last_trade' | 'pnl' | 'realized' | 'unrealized' | 'roi' | 'value' | 'holding' | 'invested' | 'cost' | 'proceeds' | 'buys' | 'sells';
  direction?: 'asc' | 'desc';
  cursor?: string;
  limit?: number;
  filter?: 'all' | 'holding' | 'active' | 'sold' | 'profitable' | 'losing';
  period?: '1d' | '7d' | '14d' | '30d' | '90d' | 'all';
  pnlMode?: PnlMode;
  tokens?: string;
  minValue?: number;
  maxValue?: number;
  minPnl?: number;
  maxPnl?: number;
  minInvested?: number;
  maxInvested?: number;
  minRoi?: number;
  maxRoi?: number;
  minTrades?: number;
  minHolding?: number;
  market?: string;
  minLiquidity?: number;
  minMarketCap?: number;
}

export interface PnlV2WalletChartParams {
  time_from?: number;
  time_to?: number;
}

export interface PnlV2WalletOverviewParams {
  pnlMode?: PnlMode;
  /**
   * Denomination for monetary fields. Defaults to `usd`.
   * Pass `sol` or `eur` to convert USD snapshot values at read time using current spot.
   * Counts, percentages, timestamps, and ROI are not converted.
   */
  currency?: 'usd' | 'sol' | 'eur';
}

export interface PnlV2WalletTokenPositionParams {
  pnlMode?: PnlMode;
}

export interface PnlV2BatchParams {
  pnlMode?: PnlMode;
}

// -- Response Interfaces --

export interface PnlV2KOLLeaderboardResponse {
  traders: PnlV2TraderWithIdentity[];
  pagination: PnlV2Pagination;
}

export interface PnlV2KOLPeriodResponse {
  traders: PnlV2PeriodTraderWithIdentity[];
  pagination: PnlV2Pagination;
}

export interface PnlV2KOLCalendarDayData {
  realizedPnl: number | null;
  volume: number | null;
  buys: number;
  sells: number;
  traders: number;
}

export interface PnlV2KOLCalendarResponse {
  year: number;
  month: number;
  days: { [day: string]: PnlV2KOLCalendarDayData };
  summary: {
    tradingDays: number;
    positiveDays: number;
    negativeDays: number;
    totalRealizedPnl: number | null;
    totalVolume: number | null;
  };
}

export interface PnlV2KOLByDateResponse {
  traders: PnlV2DayTraderWithIdentity[];
  summary: {
    totalRealizedPnl: number | null;
    totalVolume: number | null;
  };
  date: string;
}

export interface PnlV2TopTradersResponse {
  traders: PnlV2Top90dTrader[];
  pagination: PnlV2Pagination;
}

export interface PnlV2TokenTradersResponse {
  meta: PnlV2TokenMeta;
  traders: PnlV2Holder[];
  pagination: PnlV2Pagination;
}

export interface PnlV2WalletTokenPositionResponse extends PnlV2Position {
  wallet?: string;
  identity?: PnlV2Identity | null;
  pnlMode?: PnlMode;
}

export interface PnlV2WalletHistoryResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  /** Present when a non-USD `currency` was requested (`sol` or `eur`). */
  currency?: 'sol' | 'eur';
  days: PnlV2Snapshot[];
  summary: {
    days: {
      trading: number;
      positive: number;
      negative: number;
      breakEven: number;
    };
    totals: {
      realizedPnl: number | null;
      volume: number | null;
    };
    winRate: number | null;
    totalDays: number;
    deltas: {
      realized: number | null;
      total: number | null;
    } | null;
  };
}

export interface PnlV2WalletPerformanceDay {
  date: string;
  realizedPnl: number | null;
  unrealizedPnl: number | null;
  totalPnl: number | null;
  volume: number | null;
  /** Daily activity within the window (`day_buys + day_sells`), not cumulative lifetime totals. */
  trades: number;
}

export interface PnlV2WalletPerformanceResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  /** Present when a non-USD `currency` was requested (`sol` or `eur`). */
  currency?: 'sol' | 'eur';
  window: number;
  totals: {
    realizedPnl: number | null;
    volume: number | null;
    /** Sum of daily activity trades within the window (`day_buys + day_sells`). */
    trades: number;
  };
  bestDay: {
    date: string;
    realizedPnl: number | null;
    volume: number | null;
    totalPnl: number | null;
    trades: number;
  } | null;
  worstDay: {
    date: string;
    realizedPnl: number | null;
    volume: number | null;
    totalPnl: number | null;
    trades: number;
  } | null;
  streaks: {
    positive: number | null;
    negative: number | null;
    currentPositive: number | null;
    currentNegative: number | null;
  };
  drawdown: {
    /** Maximum drawdown in the response currency. */
    amount: number | null;
    percent: number | null;
  };
  days: PnlV2WalletPerformanceDay[];
  updatedAt: string | null;
}

export interface PnlV2WalletHighlightsResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  counts: {
    positions: number;
    open: number;
    closed: number;
  };
  highlights: {
    biggestWinner: PnlV2Position | null;
    biggestLoser: PnlV2Position | null;
    biggestBag: PnlV2Position | null;
    mostProfitableClosed: PnlV2Position | null;
    fastestFlip: PnlV2Position | null;
    longestHold: PnlV2Position | null;
    mostActive: PnlV2Position | null;
  };
  updatedAt: string | null;
}

export interface PnlV2WalletRiskResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  openPositions: {
    count: number;
    cost: number | null;
    value: number | null;
    profitableValue: number | null;
    profitableValuePercent: number | null;
  };
  concentration: {
    top1Percent: number | null;
    top5Percent: number | null;
    score: number | null;
  };
  pnlMix: {
    realized: number | null;
    unrealized: number | null;
    realizedPercent: number | null;
    unrealizedPercent: number | null;
  };
  largestPositions: PnlV2Position[];
  updatedAt: string | null;
}

export interface PnlV2WalletPositionsResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  positions: PnlV2Position[];
  stats: {
    total: number;
    filtered: number;
    holding: number;
    sold: number;
    profitable: number;
    losing: number;
  };
  pagination: PnlV2Pagination;
}

export interface PnlV2WalletChartResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  points: PnlV2ChartPoint[];
  summary: {
    days: {
      trading: number;
      positive: number;
      negative: number;
      breakEven: number;
    };
    totals: {
      realizedPnl: number | null;
      volume: number | null;
    };
    winRate: number | null;
    bestDay: { date: string; realizedPnl: number | null } | null;
    worstDay: { date: string; realizedPnl: number | null } | null;
    streaks: {
      positive: number;
      negative: number;
      currentPositive: number;
      currentNegative: number;
    };
    drawdown: {
      amount: number | null;
      percent: number | null;
    };
    averages: {
      dailyVolume: number | null;
      dailyRealizedPnl: number | null;
      holdTimeSecs: number | null;
    };
  };
  pagination: {
    count: number;
    hasMore: boolean;
    nextTimeTo: number | null;
  };
}

export interface PnlV2WalletOverviewResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  pnlMode?: PnlMode;
  /** Present when a non-USD `currency` was requested (`sol` or `eur`). */
  currency?: 'sol' | 'eur';
  summary: PnlV2Summary;
  analysis: {
    winRate: number | null;
    avgPnlPerAsset: number | null;
    avgBuyValue: number | null;
    tokens: {
      closed: number;
      winning: number;
      losing: number;
    };
    distribution: Array<{
      range: string;
      count: number;
      rate: number | null;
    }>;
  };
  stats: {
    total: number;
    holding: number;
    sold: number;
    profitable: number;
    losing: number;
  };
  tags: {
    isArbitrage: boolean;
    platforms: string[];
  };
  updatedAt: string | null;
}

export interface PnlV2BatchWalletPositionsResponse {
  wallet: string;
  identity?: PnlV2Identity | null;
  pnlMode?: PnlMode;
  count: number;
  positions: PnlV2Position[];
  notFound: string[];
  invalid?: string[];
}

export interface PnlV2BatchWalletSummary {
  wallet: string;
  identity?: PnlV2Identity | null;
  summary: PnlV2Summary;
  tags: {
    isArbitrage: boolean;
    platforms: string[];
  };
  updatedAt: string | number | null;
}

export interface PnlV2BatchWalletSummariesResponse {
  count: number;
  wallets: PnlV2BatchWalletSummary[];
  notFound?: string[];
  invalid?: string[];
  truncated?: {
    requested: number;
    limit: number;
  };
}

export interface PnlV2TokenScopedPositionWithWallet extends Omit<PnlV2Position, 'pnl'> {
  wallet: string;
  identity?: PnlV2Identity | null;
  pnl: PnlV2TokenScopedPnl;
}

export interface PnlV2BatchTokenPositionsResponse {
  token: string;
  pnlMode?: PnlMode;
  count: number;
  positions: PnlV2TokenScopedPositionWithWallet[];
  notFound: string[];
  invalid?: string[];
}

export interface PnlV2BatchPositionPairsResponse {
  pnlMode?: PnlMode;
  count: number;
  positions: (PnlV2PositionWithWallet & { identity?: PnlV2Identity | null })[];
  notFound: Array<{ wallet: string; token: string }>;
  invalid?: Array<{ wallet?: string; token?: string }>;
}

export interface ChartDataParams {
  /** Token address */
  tokenAddress: string;
  /** Pool address (only for pool-specific charts) */
  poolAddress?: string;
  /** Time interval (e.g., "1s", "1m", "1h", "1d") */
  type?: string;
  /** Start time (Unix timestamp in seconds) */
  timeFrom?: number;
  /** End time (Unix timestamp in seconds) */
  timeTo?: number;
  /** Return chart for market cap instead of pricing */
  marketCap?: boolean;
  /** Disable outlier removal if set to false (default: true) */
  removeOutliers?: boolean;
  /** Dynamically picks the main pool over time for consistent charts (default: true, only applies without pool) */
  dynamicPools?: boolean;
  /** Timezone for chart data - use "current" for auto-detection or specify timezone (e.g., "PST", "UTC", "America/New_York") */
  timezone?: string | 'current';
  /** Enable live cache for faster response times (default: false) */
  fastCache?: boolean;
  /** Currency for price data (default: "usd") */
  currency?: 'usd' | 'eur' | 'sol';
}

/**
 * Represents a holder in the paginated response with account address
 */
export interface PaginatedHolder {
  wallet: string;
  account: string;
  amount: number;
  value: TokenValuePair;
  percentage: number;
}

/**
 * Response for paginated token holders endpoint
 */
export interface PaginatedTokenHoldersResponse {
  total: number;
  accounts: PaginatedHolder[];
  cursor: string;
  hasMore: boolean;
  limit: number;
}

// ============================================================================
// Jupiter DCA (Recurring Orders)
// ============================================================================

/** Status of a single DCA order. */
export type DcaOrderStatus = 'active' | 'paused' | 'completed' | 'pending';

/** Status filter accepted by DCA list endpoints (adds `'all'`). */
export type DcaOrderStatusFilter = DcaOrderStatus | 'all';

/** Trade direction relative to the wallet across its DCA orders. */
export type DcaDirection = 'buying' | 'selling' | 'mixed';

/** Sort field accepted by DCA list endpoints. */
export type DcaSort =
  | 'volume'
  | 'deposited'
  | 'remaining'
  | 'progress'
  | 'recent'
  | 'created'
  | 'status';

/** A supported DCA program. */
export interface DcaProgram {
  id: string;
  label: string;
  programId: string;
}

export interface DcaProgramsResponse {
  programs: DcaProgram[];
}

/** Token metadata embedded on a DCA order. */
export interface DcaToken {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  image?: string | null;
  uri?: string | null;
  description?: string | null;
  twitter?: string | null;
  website?: string | null;
  hasFileMetaData?: boolean;
  /** Current USD price; null/omitted when unavailable. */
  priceUsd?: number | null;
}

/** Raw on-chain amounts (strings, base units). Keys depend on program. */
export type DcaOrderRaw = Record<string, string>;

/** A single DCA (recurring) order. */
export interface DcaOrder {
  program: string;
  programId: string;
  /** DCA account pubkey. */
  address: string;
  owner: string;
  status: DcaOrderStatus;
  direction: DcaDirection;
  /** Human readable pair, e.g. "USDC → SOL". */
  pair: string;
  input: DcaToken;
  output: DcaToken;
  deposited: number;
  depositedUsd?: number | null;
  used: number;
  usedUsd?: number | null;
  remaining: number;
  remainingUsd?: number | null;
  received: number;
  receivedUsd?: number | null;
  perCycle: number;
  perCycleUsd?: number | null;
  /** Cycle frequency, e.g. "1h". */
  frequency: string;
  progressPercent: number;
  volume: number;
  volumeUsd?: number | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp; null when no further cycle is scheduled. */
  nextCycleAt: string | null;
  raw: DcaOrderRaw;
}

/** Status counts for a wallet's DCA orders. */
export interface DcaSummary {
  total: number;
  active: number;
  paused: number;
  completed: number;
  pending: number;
}

/** Pagination block returned by paginated DCA endpoints. */
export interface DcaPagination {
  limit: number;
  /** Cursor to pass as `cursor` for the next page; null when no more results. */
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
  total: number;
}

/** Common query parameters for DCA list endpoints. */
export interface DcaListParams {
  /** DCA program id (default `"jupiter"`). */
  program?: string;
  /** Alias for `program`. */
  dex?: string;
  /** Alias for `program`. */
  platform?: string;
  /**
   * Page size. Defaults differ by endpoint:
   * - wallet / wallet orders / pair: default `50`, max `100`
   * - token buyers / sellers / users: default `200`, max `1000`
   */
  limit?: number;
  /** Opaque cursor (the previous page's last order `address`). */
  cursor?: string;
  sort?: DcaSort;
  /** Alias for `sort`. */
  sortBy?: DcaSort;
  status?: DcaOrderStatusFilter;
}

/** Query parameters accepted by single-order/program endpoints. */
export interface DcaProgramParams {
  /** DCA program id (default `"jupiter"`). */
  program?: string;
  /** Alias for `program`. */
  dex?: string;
  /** Alias for `program`. */
  platform?: string;
}

/** Standard error envelope returned by DCA endpoints on failure. */
export interface DcaErrorResponse {
  error: {
    code:
      | 'INVALID_WALLET'
      | 'INVALID_MINT'
      | 'INVALID_ORDER'
      | 'NOT_FOUND'
      | 'INVALID_SORT'
      | 'INVALID_STATUS'
      | 'INVALID_LIMIT'
      | 'INVALID_PROGRAM'
      | 'PROGRAM_PARAM_CONFLICT'
      | 'INVALID_CURSOR'
      | 'TIMEOUT'
      | 'SERVER_ERROR';
    message: string;
  };
}

export interface DcaWalletResponse {
  wallet: string;
  summary: DcaSummary;
  orders: DcaOrder[];
  pagination: DcaPagination;
}

export interface DcaOrdersListResponse {
  orders: DcaOrder[];
  pagination: DcaPagination;
}

export interface DcaTokenFlowResponse {
  mint: string;
  buyers: { count: number; volumeUsd: number | null };
  sellers: { count: number; volumeUsd: number | null };
}

export interface DcaTokenOrdersResponse {
  mint: string;
  orders: DcaOrder[];
  pagination: DcaPagination;
}

export interface DcaTokenUser {
  wallet: string;
  orderCount: number;
  volumeUsd: number | null;
}

export interface DcaTokenUsersResponse {
  mint: string;
  users: DcaTokenUser[];
}

export interface DcaPairResponse {
  inputMint: string;
  outputMint: string;
  pair: string;
  orders: DcaOrder[];
  pagination: DcaPagination;
}

// --- DCA Datastream events ---

/** Map of mint address → USD price at event time. */
export type DcaPricesMap = Record<string, number>;

/**
 * Order snapshot embedded on a DCA stream event.
 *
 * Position events carry the full {@link DcaOrder} shape; transaction events
 * (Filled, Deposit, etc.) often include only a subset of fields, so all
 * properties are typed as optional.
 */
export type DcaOrderSnapshot = Partial<DcaOrder>;

interface DcaEventBase {
  program: string;
  programId: string;
  /** DCA account address. */
  address: string;
  owner: string;
  signature: string;
  slot: number;
  /** Unix ms. */
  timestamp: number;
  eventIndex: number;
  dcaKey: string;
  /** Snapshot of the order at event time. */
  order: DcaOrderSnapshot;
}

export interface DcaOpenedEvent extends DcaEventBase {
  eventName: 'Opened';
  openInstruction: 'openDca' | 'openDcaV2';
  userKey: string;
  inputMint: string;
  outputMint: string;
  /** Raw deposited amount as base-units string. */
  inDeposited: string;
  /** Cycle frequency in seconds, as string. */
  cycleFrequency: string;
  /** Raw amount per cycle as base-units string. */
  inAmountPerCycle: string;
  /** Created at as unix seconds string. */
  createdAt: string;
  usd: {
    inDepositedUsd?: number;
    inAmountPerCycleUsd?: number;
  };
  prices: DcaPricesMap;
}

export interface DcaFilledEvent extends DcaEventBase {
  eventName: 'Filled';
  userKey: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeMint: string;
  fee: string;
  fillInstruction: string;
  usd: {
    inAmountUsd?: number;
    outAmountUsd?: number;
    feeUsd?: number;
  };
  prices: DcaPricesMap;
}

export interface DcaClosedEvent extends DcaEventBase {
  eventName: 'Closed';
  userKey: string;
  inputMint: string;
  outputMint: string;
  inDeposited: string;
  totalInWithdrawn: string;
  totalOutWithdrawn: string;
  unfilledAmount: string;
  userClosed: boolean;
  usd: {
    totalInWithdrawnUsd?: number;
    totalOutWithdrawnUsd?: number;
    unfilledAmountUsd?: number;
  };
  prices: DcaPricesMap;
}

export interface DcaDepositEvent extends DcaEventBase {
  eventName: 'Deposit';
  amount: string;
  usd: { amountUsd?: number };
}

export interface DcaWithdrawEvent extends DcaEventBase {
  eventName: 'Withdraw';
  inAmount: string;
  outAmount: string;
  userWithdraw: boolean;
  usd: { inAmountUsd?: number; outAmountUsd?: number };
}

export interface DcaCollectedFeeEvent extends DcaEventBase {
  eventName: 'CollectedFee';
  userKey: string;
  mint: string;
  amount: string;
  usd: { amountUsd?: number };
  prices: DcaPricesMap;
}

/** DCA account snapshot. No transaction signature; throttled per account. */
export interface DcaPositionEvent {
  program: string;
  programId: string;
  /** DCA account pubkey (alias of `address`). */
  pubkey: string;
  address: string;
  owner: string;
  slot: number;
  /** Unix ms. */
  timestamp: number;
  /** Account write version. */
  writeVersion: number;
  order: DcaOrder;
}

/** Discriminated union over all DCA stream events. */
export type DcaStreamEvent =
  | DcaOpenedEvent
  | DcaFilledEvent
  | DcaClosedEvent
  | DcaDepositEvent
  | DcaWithdrawEvent
  | DcaCollectedFeeEvent
  | DcaPositionEvent;

/** Transaction events (everything except the position snapshot). */
export type DcaTransactionEvent = Exclude<DcaStreamEvent, DcaPositionEvent>;

// ============================================================================
// Lighthouse (memecoin market activity overview)
// ============================================================================

/** Metric with current-window total and percent change vs the previous equal-length window. */
export interface MetricWithChange {
  /** Value for the current window. */
  total: number;
  /** Percent change vs the previous equal-length window. `0` when the previous window total is `0`. */
  changePct: number;
}

/** Buy/sell split metric with percent change on `total`. */
export interface SideSplitMetric {
  /** Total for the current window. */
  total: number;
  /** Buy-side portion of the current window. */
  buys: number;
  /** Sell-side portion of the current window. */
  sells: number;
  /** Percent change of `total` vs the previous equal-length window. */
  changePct: number;
}

export interface LighthouseTimeframeStats {
  transactions: SideSplitMetric;
  /** Approximate unique trader wallets (HyperLogLog). */
  wallets: MetricWithChange;
  /** USD volume for the window. */
  volume: SideSplitMetric;
  tokensCreated: MetricWithChange;
  migrations: MetricWithChange;
}

export interface LighthouseMarketStats {
  '5m': LighthouseTimeframeStats;
  '1h': LighthouseTimeframeStats;
  '6h': LighthouseTimeframeStats;
  '24h': LighthouseTimeframeStats;
}

/** One DEX, launchpad, or aggregate market row from `GET /lighthouse`. */
export interface LighthouseMarket {
  /** Market key (e.g. `all`, `pumpfun`, `raydium-all`, `meteora-curve:bags`). */
  market: string;
  /** Human-readable display name. */
  label: string;
  /** Logo URL, or an empty string when unavailable. */
  icon: string;
  /** DEX or launchpad URL, or an empty string when unavailable. */
  url: string;
  /** Parent DEX/launchpad key for child markets. Omitted for top-level markets. */
  parent?: string;
  stats: LighthouseMarketStats;
}

/** Response for `GET /lighthouse` — top-level array of markets. */
export type LighthouseResponse = LighthouseMarket[];

// ============================================================================
// Whale & KOL Trades
// ============================================================================

/** Allowed minimum USD volume thresholds for whale trade feeds. */
export type WhaleMinVolume = 1000 | 2500 | 5000 | 10000;

/** Allowed minimum USD volume thresholds for KOL trade feeds (`0` = all eligible). */
export type KolMinVolume = 0 | 1000 | 2500 | 5000 | 10000;

/** KOL identity metadata when the wallet is on the shared KOL roster. */
export interface TradeIdentity {
  name?: string | null;
  twitter?: string | null;
  avatar?: string;
}

export interface WhaleKolTokenMetaSide {
  name?: string | null;
  symbol?: string | null;
  image?: string | null;
  decimals?: number | null;
  amount?: number;
  address?: string;
  priceUsd?: number | null;
  [key: string]: unknown;
}

/** A single whale or KOL trade row. */
export interface WhaleKolTrade {
  tx: string;
  amount: number;
  priceUsd: number | null;
  /** USD volume at or above `$minVolume`. */
  volume: number;
  volumeSol: number;
  type: 'buy' | 'sell';
  wallet: string;
  /** Unix timestamp in milliseconds. */
  time: number;
  program: string;
  pools: string[];
  /** Present when the wallet is on the shared KOL roster. */
  identity?: TradeIdentity;
  /** Present when `showMeta=true`. */
  meta?: {
    from?: WhaleKolTokenMetaSide;
    to?: WhaleKolTokenMetaSide;
  };
}

export interface WhaleTradesParams {
  /** Minimum absolute USD volume. Allowed: `1000`, `2500`, `5000`, `10000`. Default `1000`. */
  minVolume?: WhaleMinVolume;
  /** Opaque `nextCursor` from a previous response, or a raw millisecond timestamp. */
  cursor?: string;
  /** Page size. Default `250`, max `500`. */
  limit?: number;
  /** When true, attach `meta.from` / `meta.to` token metadata and historical prices. */
  showMeta?: boolean;
  /** Keep rows where either swap side matches the selected/main token. */
  hideArb?: boolean;
  /** Only `DESC` is supported. */
  sortDirection?: 'DESC';
}

export interface KolTradesParams {
  /** Minimum absolute USD volume. Use `0` or omit for all eligible KOL trades. Default `0`. */
  minVolume?: KolMinVolume;
  cursor?: string;
  limit?: number;
  showMeta?: boolean;
  /** Keep rows where either swap side matches the selected/main token. */
  hideArb?: boolean;
  sortDirection?: 'DESC';
}

/** Params for `GET /trades/kols/{token}`. */
export type KolTokenTradesParams = KolTradesParams;

export interface WhaleKolTradesResponse {
  trades: WhaleKolTrade[];
  /** Opaque base64url cursor for the next page. */
  nextCursor: string | null;
  hasNextPage: boolean;
  sortDirection: 'DESC';
  /** Echoed request filter when the effective threshold is at least $1,000. */
  minVolume?: WhaleMinVolume;
}