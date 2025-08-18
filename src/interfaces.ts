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
  [key: string]: any; // Allow any additional properties
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

export interface TokenRisk {
  snipers: RiskCategory;
  insiders: RiskCategory;
  top10: number;
  rugged: boolean;
  risks: TokenRiskFactor[];
  score: number;
  jupiterVerified?: boolean;
}

export interface TokenRiskFactor {
  name: string;
  description: string;
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
  accounts: Holder[];
}

export interface AthPrice {
  highest_price: number;
  timestamp: number;
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

export interface DeployerTokensResponse {
  total: number;
  tokens: DeployerToken[];
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  showAllPools?: boolean;
  minCreatedAt?: number;
  maxCreatedAt?: number;
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  maxVolume?: number;
  volumeTimeframe?: string;
  minBuys?: number;
  maxBuys?: number;
  minSells?: number;
  maxSells?: number;
  minTotalTransactions?: number;
  maxTotalTransactions?: number;
  lpBurn?: number;
  market?: string;
  freezeAuthority?: string;
  mintAuthority?: string;
  deployer?: string;
  status?: string;
  showPriceChanges?: boolean;
  [key: string]: string | number | boolean | undefined;
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
  tokenDetails?: {
    creator: string;
    tx: string;
    time: number;
  };
}

export interface SearchResponse {
  status: string;
  data: SearchResult[];
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

export interface TradeMetadata {
  from: {
    name: string;
    symbol: string;
    image: string;
    decimals: number;
    amount: number;
    address: string;
  };
  to: {
    name: string;
    symbol: string;
    image: string;
    decimals: number;
    amount: number;
    address: string;
  };
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
}

