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
  type PoolUpdate,
  type HolderUpdate,
  type WalletTransaction,
  type TokenMetadata
} from './datastream';

// Export all interfaces
export * from './interfaces';

// Export all interfaces
export * from './event-processor';