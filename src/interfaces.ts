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

export interface RiskWallet {
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

export interface TokenHoldersResponse {
  total: number;
  enrich?: string[];
  accounts: (Holder & {
    pnl?: {
      wallet?: PnlV2WalletLifetimePnl;
      token?: { realized: number | null; unrealized: number | null; total: number | null };
    };
    identity?: PnlV2Identity;
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

export interface PriceData {
  price: number;
  liquidity: number;
  marketCap: number;
  lastUpdated: number;
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

export interface PnlV2Identity {
  name?: string | null;
  twitter?: string | null;
  avatar?: string | null;
  type?: string | null;
  tags?: string[];
  platforms?: string[];
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
  position: {
    balance: number | null;
    costBasis: number | null;
    value: number | null;
    price: number | null;
  };
  buyUsd: number | null;
  sellUsd: number | null;
  counts: {
    buys: number;
    sells: number;
    total: number;
  };
  roi: number | null;
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
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
}

export interface PnlV2WalletPerformanceParams {
  period?: '1d' | '7d' | '14d' | '30d' | '90d' | 'all';
  days?: number;
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
}

export interface PnlV2WalletTokenPositionParams {
  pnlMode?: PnlMode;
}

export interface PnlV2BatchParams {
  pnlMode?: PnlMode;
}

// -- Wallet status / refresh types --

export interface PnlV2WalletStatusNotFound {
  exists: false;
  status: 'not_found';
}

export interface PnlV2WalletStatusFound {
  exists: true;
  status: string;
  updatedAt: string | null;
  timing: {
    firstTrade: number | null;
    lastTrade: number | null;
  };
  counts: {
    positions: number;
    snapshots: number;
  };
  latestSnapshotDate: string | null;
}

export type PnlV2WalletStatusResponse = PnlV2WalletStatusNotFound | PnlV2WalletStatusFound;

export interface PnlV2WalletRefreshResponse {
  queued: boolean;
  message: string;
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
  trades: number;
}

export interface PnlV2WalletPerformanceResponse {
  wallet?: string;
  identity?: PnlV2Identity | null;
  window: number;
  totals: {
    realizedPnl: number | null;
    volume: number | null;
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
