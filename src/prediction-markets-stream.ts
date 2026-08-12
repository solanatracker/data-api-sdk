/**
 * Prediction Markets Datastream types — aligned with datastream/pm-*.json (Beta).
 * Room `data` is flat: envelope fields sit beside event-specific fields.
 * Delivery is at-least-once; deduplicate with `sourceId` or `tradeId`.
 */

export type PmExchange = 'kalshi' | 'polymarket';

export type PmChannel =
  | 'prices'
  | 'trades'
  | 'orderbook'
  | 'quotes'
  | 'volume'
  | 'market_lifecycle'
  | 'resolution';

export type PmPriceKind = 'mid' | 'last' | 'display';

/** Shared envelope fields on every `pm:*` room message. */
export interface PmRealtimeEnvelope {
  /** Event kind (trade, price, orderbook_snapshot, quote, crypto_price, …). */
  type: string;
  channel: PmChannel;
  exchange: PmExchange;
  marketId: string;
  /** Unix epoch milliseconds. */
  timestamp: number;
  eventId?: string;
  seriesId?: string;
  category?: string;
  sport?: string;
  /** Exchange/source idempotency key (omit when empty). */
  sourceId?: string;
  [key: string]: unknown;
}

export interface PmPriceLevel {
  price: number;
  size: number;
}

export interface PmQuoteLevel {
  side?: string;
  size?: number;
  sizeUnit?: string;
  avgPrice?: number;
  worstPrice?: number;
  filledSize?: number;
  cost?: number;
  unfilledSize?: number;
  fullyFilled?: boolean;
  levelsConsumed?: number;
  [key: string]: unknown;
}

export interface PmTradeFields {
  tradeId: string;
  price?: number;
  yesPrice?: number;
  noPrice?: number;
  quantity?: number;
  count?: number;
  side?: string;
  takerSide?: string;
  createdAt?: string;
  transactionHash?: string;
  /** price × quantity in USD. Used for `pm:trades:significant` (threshold $25). */
  notionalUsd?: number;
  eventId?: string;
  eventTicker?: string;
  eventSlug?: string;
  eventTitle?: string;
  groupItemTitle?: string;
  outcomeLabel?: string;
  outcomeIndex?: number;
  image?: string;
  [key: string]: unknown;
}

export interface PmPriceFields {
  price?: number;
  displayPrice?: number;
  priceKind?: PmPriceKind;
  yesPrice?: number;
  noPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  midpoint?: number;
  lastTradePrice?: number;
  spread?: number;
  tokenId?: string;
  [key: string]: unknown;
}

export interface PmQuoteFields {
  tokenId?: string;
  bestBid?: number;
  bestAsk?: number;
  midpoint?: number;
  displayPrice?: number;
  lastTradePrice?: number;
  buy?: PmQuoteLevel[];
  sell?: PmQuoteLevel[];
  [key: string]: unknown;
}

export interface PmOrderbookFields {
  sequence?: number;
  bids?: PmPriceLevel[];
  asks?: PmPriceLevel[];
  changes?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface PmVolumeFields {
  volume?: number;
  marketVolume?: number;
  delta?: number;
  eventId?: string;
  tokenId?: string;
  [key: string]: unknown;
}

/** Chainlink underlying USD tick delivered by `pm:crypto:{asset}[:prices]`. */
export interface PmCryptoPriceFields {
  type: 'crypto_price';
  channel: 'prices';
  exchange: 'polymarket';
  category: 'crypto';
  symbol: string;
  pair: string;
  asset: string;
  value: number;
  source: string;
  [key: string]: unknown;
}

export interface PmMarketLifecycleFields {
  status: string;
  previousStatus?: string;
  title?: string;
  eventId?: string;
  seriesId?: string;
  category?: string;
  [key: string]: unknown;
}

export interface PmResolutionFields {
  status?: string;
  result?: string;
  winningOutcome?: string;
  settlementPrice?: number;
  resolvedAt?: string;
  [key: string]: unknown;
}

/** Flat trade room message. */
export type PmTradeUpdate = PmRealtimeEnvelope & PmTradeFields;
/** Flat price room message. */
export type PmPriceUpdate = PmRealtimeEnvelope & PmPriceFields;
/** Flat quote room message. */
export type PmQuoteUpdate = PmRealtimeEnvelope & PmQuoteFields;
/** Flat orderbook room message. */
export type PmOrderbookUpdate = PmRealtimeEnvelope & PmOrderbookFields;
/** Flat volume room message. */
export type PmVolumeUpdate = PmRealtimeEnvelope & PmVolumeFields;
/** Flat Chainlink underlying crypto-price message. */
export type PmCryptoPriceUpdate = PmRealtimeEnvelope & PmCryptoPriceFields;
/** Flat market lifecycle room message. */
export type PmMarketLifecycleUpdate = PmRealtimeEnvelope & PmMarketLifecycleFields;
/** Flat resolution room message. */
export type PmResolutionUpdate = PmRealtimeEnvelope & PmResolutionFields;

/** Any prediction-markets room payload. */
export type PmStreamUpdate =
  | PmTradeUpdate
  | PmPriceUpdate
  | PmQuoteUpdate
  | PmOrderbookUpdate
  | PmVolumeUpdate
  | PmCryptoPriceUpdate
  | PmMarketLifecycleUpdate
  | PmResolutionUpdate
  | PmRealtimeEnvelope;

/** Lowercase a room segment (exchange, market id, event id, etc.). */
export function pmRoomSegment(value: string): string {
  return value.trim().toLowerCase();
}
