// Export main class and interfaces
export { Client, DataApiError, RateLimitError, ValidationError } from './data-api';
export type { DataApiConfig } from './data-api';

// Export Datastream for real-time updates
export { 
  Datastream, 
  DatastreamRoom,
  type DatastreamConfig,
  type PriceUpdate,
  type TokenTransaction,
  type WhaleKolTransaction,
  type WhaleKolTransactionTokenSide,
  type PoolUpdate,
  type HolderUpdate,
  type WalletTransaction,
  type TokenMetadata,
  type BundlerUpdate,
  type VolumePoolUpdate,
  type VolumeTokenUpdate,
  type PnlTradeUpdate,
  type PnlBalanceUpdate,
  type PnlPriceUpdate,
  type PnlPositionUpdate,
  type PnlWalletUpdate,
  type PnlWalletPosition
} from './datastream';

// Export Prediction Markets REST client
export {
  PredictionMarketsClient,
  type PredictionMarketsConfig,
} from './prediction-markets';

// Export all Data API / shared interfaces
export * from './interfaces';

// Export Prediction Markets REST types
export * from './prediction-markets-interfaces';

// Export Prediction Markets Datastream types
export * from './prediction-markets-stream';

// Export event processor helpers
export * from './event-processor';
