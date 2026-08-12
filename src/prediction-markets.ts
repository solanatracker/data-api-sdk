import { DataApiError, RateLimitError } from './data-api';
import type {
  AccountActivityItem,
  BatchCandlesticksResponse,
  BatchEventsResponse,
  BatchMarketsBody,
  BatchMarketsResponse,
  BrowseHubResponse,
  Category,
  CombinedStats,
  CryptoEventResponse,
  CryptoPricePoint,
  CryptoPriceSnapshot,
  EventCandlesticksResponse,
  ExchangeScheduleResponse,
  ExchangeStatusResponse,
  GlobalSearchResponse,
  HolderResponse,
  LiveMarketData,
  MarketQuoteResponse,
  MarketSnapshotResponse,
  MidpointResponse,
  MilestonesResponse,
  OpenInterestResponse,
  OrderbookSnapshot,
  PaginatedCandlesticks,
  PaginatedCryptoTraders,
  PaginatedEvents,
  PaginatedMarketTraders,
  PaginatedMarkets,
  PaginatedPnlLeaderboard,
  PaginatedSeries,
  PaginatedTraders,
  PaginatedTrades,
  PaginatedWalletPositions,
  PlatformStats,
  PmGetAccountActivityParams,
  PmGetAccountOverviewParams,
  PmGetAccountPnlChartParams,
  PmGetAccountPnlParams,
  PmGetAccountTradesParams,
  PmGetBrowseHubParams,
  PmGetCandlesticksBatchParams,
  PmGetCategoriesParams,
  PmGetCryptoEventsParams,
  PmGetCryptoPriceHistoryParams,
  PmGetCryptoPriceParams,
  PmGetCryptoTradersParams,
  PmGetEventCandlesticksParams,
  PmGetEventCryptoParams,
  PmGetEventHoldersParams,
  PmGetEventParams,
  PmGetEventPnlLeaderboardParams,
  PmGetEventTradersParams,
  PmGetEventsBatchParams,
  PmGetEventsParams,
  PmGetGlobalTradesParams,
  PmGetLiveDataParams,
  PmGetMarketBooksParams,
  PmGetMarketBySlugParams,
  PmGetMarketCandlesticksParams,
  PmGetMarketHoldersParams,
  PmGetMarketMidpointParams,
  PmGetMarketOpenInterestParams,
  PmGetMarketOrderbookParams,
  PmGetMarketParams,
  PmGetMarketPriceParams,
  PmGetMarketQuoteParams,
  PmGetMarketSnapshotBySlugParams,
  PmGetMarketSnapshotParams,
  PmGetMarketSpreadParams,
  PmGetMarketTradersParams,
  PmGetMarketTradesParams,
  PmGetMarketsBatchParams,
  PmGetMarketsParams,
  PmGetMilestonesParams,
  PmGetNewMarketsParams,
  PmGetPnlLeaderboardParams,
  PmGetRelatedMarketsParams,
  PmGetSeriesParams,
  PmGetSportsParams,
  PmGetTraderLeaderboardParams,
  PmGetTrendingMarketsParams,
  PmSearchMarketsParams,
  PmSearchParams,
  PmSearchTradersParams,
  PortfolioValueResponse,
  PriceSnapshot,
  SportInfo,
  SpreadResponse,
  TradesEnrichedResponse,
  UnifiedEvent,
  UnifiedMarket,
  WalletEventPnlResponse,
  WalletOverviewResponse,
  WalletPnlChartResponse,
  WalletPnlSummary,
} from './prediction-markets-interfaces';

export interface PredictionMarketsConfig {
  /** Your API key from solanatracker.io (same Data API key). */
  apiKey: string;
  /** Optional base URL override. Defaults to the public beta host. */
  baseUrl?: string;
}

/**
 * Read-only Prediction Markets API client (Kalshi + Polymarket beta).
 * Base URL: `https://prediction-market-api.solanatracker.io`
 */
export class PredictionMarketsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PredictionMarketsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://prediction-market-api.solanatracker.io';
  }

  private buildQueryString(params: object): string {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
    const query = queryParams.toString();
    return query ? `?${query}` : '';
  }

  private async request<T>(
    endpoint: string,
    options?: { method?: string; body?: unknown }
  ): Promise<T> {
    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
    try {
      // Node 18+ and browsers provide fetch globally. Fall back to the package's
      // node-fetch dependency so the declared Node 14+ support remains valid.
      const fetchImpl: typeof fetch =
        typeof globalThis.fetch === 'function'
          ? globalThis.fetch.bind(globalThis)
          : ((await import('node-fetch')).default as unknown as typeof fetch);
      const response = await fetchImpl(`${this.baseUrl}${endpoint}`, {
        method: options?.method || 'GET',
        headers,
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        let errorDetails: unknown = null;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorDetails = await response.json();
            if (typeof errorDetails === 'string') {
              errorMessage = errorDetails;
            } else if (errorDetails && typeof errorDetails === 'object') {
              const details = errorDetails as Record<string, unknown>;
              if (typeof details.error === 'string') errorMessage = details.error;
              else if (typeof details.message === 'string') errorMessage = details.message;
            }
          }
        } catch {
          /* ignore parse errors */
        }
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(errorMessage, retryAfter ? parseInt(retryAfter) : undefined, errorDetails);
        }
        if (response.status === 503) {
          throw new DataApiError(errorMessage, 503, 'SERVICE_BUSY', errorDetails);
        }
        throw new DataApiError(errorMessage, response.status, undefined, errorDetails);
      }
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof DataApiError) throw error;
      throw new DataApiError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** Wallet activity feed (Polymarket) — `GET /v1/accounts/{address}/activity` */
  async getAccountActivity(address: string, params?: PmGetAccountActivityParams): Promise<AccountActivityItem[]> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<AccountActivityItem[]>(`/v1/accounts/${encodeURIComponent(address)}/activity${qs}`);
  }

  /** Closed or resolved positions (Polymarket) — `GET /v1/accounts/{address}/closed-positions` */
  async getAccountClosedPositions(address: string): Promise<PaginatedWalletPositions> {
    return this.request<PaginatedWalletPositions>(`/v1/accounts/${encodeURIComponent(address)}/closed-positions`);
  }

  /** Canonical wallet overview (Polymarket) — `GET /v1/accounts/{address}/overview` */
  async getAccountOverview(address: string, params?: PmGetAccountOverviewParams): Promise<WalletOverviewResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WalletOverviewResponse>(`/v1/accounts/${encodeURIComponent(address)}/overview${qs}`);
  }

  /** Wallet PnL summary (Polymarket, FIFO) — `GET /v1/accounts/{address}/pnl` */
  async getAccountPnl(address: string, params?: PmGetAccountPnlParams): Promise<WalletPnlSummary> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WalletPnlSummary>(`/v1/accounts/${encodeURIComponent(address)}/pnl${qs}`);
  }

  /** Fast authoritative wallet PnL chart — `GET /v1/accounts/{address}/pnl/chart` */
  async getAccountPnlChart(address: string, params?: PmGetAccountPnlChartParams): Promise<WalletPnlChartResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WalletPnlChartResponse>(`/v1/accounts/${encodeURIComponent(address)}/pnl/chart${qs}`);
  }

  /** Wallet PnL by event (Polymarket, FIFO) — `GET /v1/accounts/{address}/pnl/events` */
  async getAccountPnlEvents(address: string): Promise<WalletEventPnlResponse> {
    return this.request<WalletEventPnlResponse>(`/v1/accounts/${encodeURIComponent(address)}/pnl/events`);
  }

  /** Open positions (Polymarket) — `GET /v1/accounts/{address}/positions` */
  async getAccountPositions(address: string): Promise<PaginatedWalletPositions> {
    return this.request<PaginatedWalletPositions>(`/v1/accounts/${encodeURIComponent(address)}/positions`);
  }

  /** Wallet trade history (Polymarket) — `GET /v1/accounts/{address}/trades` */
  async getAccountTrades(address: string, params?: PmGetAccountTradesParams): Promise<TradesEnrichedResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<TradesEnrichedResponse>(`/v1/accounts/${encodeURIComponent(address)}/trades${qs}`);
  }

  /** Portfolio value (Polymarket) — `GET /v1/accounts/{address}/value` */
  async getAccountValue(address: string): Promise<PortfolioValueResponse> {
    return this.request<PortfolioValueResponse>(`/v1/accounts/${encodeURIComponent(address)}/value`);
  }

  /** Browse hub bootstrap — `GET /v1/browse` */
  async getBrowseHub(params?: PmGetBrowseHubParams): Promise<BrowseHubResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<BrowseHubResponse>(`/v1/browse${qs}`);
  }

  /** List market categories — `GET /v1/categories` */
  async getCategories(params?: PmGetCategoriesParams): Promise<Array<Category>> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<Array<Category>>(`/v1/categories${qs}`);
  }

  /** List crypto up/down series events — `GET /v1/crypto/events` */
  async getCryptoEvents(params?: PmGetCryptoEventsParams): Promise<PaginatedEvents> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedEvents>(`/v1/crypto/events${qs}`);
  }

  /** Crypto window open/close oracle price — `GET /v1/crypto/price` */
  async getCryptoPrice(params: PmGetCryptoPriceParams): Promise<CryptoPriceSnapshot> {
    const qs = this.buildQueryString(params);
    return this.request<CryptoPriceSnapshot>(`/v1/crypto/price${qs}`);
  }

  /** Underlying crypto price chart series — `GET /v1/crypto/price-history` */
  async getCryptoPriceHistory(params: PmGetCryptoPriceHistoryParams): Promise<Array<CryptoPricePoint>> {
    const qs = this.buildQueryString(params);
    return this.request<Array<CryptoPricePoint>>(`/v1/crypto/price-history${qs}`);
  }

  /** Top traders across crypto events — `GET /v1/crypto/traders` */
  async getCryptoTraders(params?: PmGetCryptoTradersParams): Promise<PaginatedCryptoTraders> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedCryptoTraders>(`/v1/crypto/traders${qs}`);
  }

  /** List grouped events — `GET /v1/events` */
  async getEvents(params?: PmGetEventsParams): Promise<PaginatedEvents> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedEvents>(`/v1/events${qs}`);
  }

  /** Batch fetch events by id — `GET /v1/events/batch` */
  async getEventsBatch(params: PmGetEventsBatchParams): Promise<BatchEventsResponse> {
    const qs = this.buildQueryString(params);
    return this.request<BatchEventsResponse>(`/v1/events/batch${qs}`);
  }

  /** Get grouped event with nested markets — `GET /v1/events/{event_id}` */
  async getEvent(eventId: string, params?: PmGetEventParams): Promise<UnifiedEvent> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<UnifiedEvent>(`/v1/events/${encodeURIComponent(eventId)}${qs}`);
  }

  /** Multi-series OHLCV for grouped Polymarket event — `GET /v1/events/{event_id}/candlesticks` */
  async getEventCandlesticks(eventId: string, params?: PmGetEventCandlesticksParams): Promise<EventCandlesticksResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<EventCandlesticksResponse>(`/v1/events/${encodeURIComponent(eventId)}/candlesticks${qs}`);
  }

  /** Crypto up/down page bundle — `GET /v1/events/{event_id}/crypto` */
  async getEventCrypto(eventId: string, params?: PmGetEventCryptoParams): Promise<CryptoEventResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<CryptoEventResponse>(`/v1/events/${encodeURIComponent(eventId)}/crypto${qs}`);
  }

  /** Top holders for an event — `GET /v1/events/{event_id}/holders` */
  async getEventHolders(eventId: string, params?: PmGetEventHoldersParams): Promise<Array<HolderResponse>> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<Array<HolderResponse>>(`/v1/events/${encodeURIComponent(eventId)}/holders${qs}`);
  }

  /** Top wallets by FIFO PnL on an event — `GET /v1/events/{event_id}/leaderboard/pnl` */
  async getEventPnlLeaderboard(eventId: string, params?: PmGetEventPnlLeaderboardParams): Promise<PaginatedPnlLeaderboard> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedPnlLeaderboard>(`/v1/events/${encodeURIComponent(eventId)}/leaderboard/pnl${qs}`);
  }

  /** Top traders for an event — `GET /v1/events/{event_id}/traders` */
  async getEventTraders(eventId: string, params?: PmGetEventTradersParams): Promise<PaginatedMarketTraders> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedMarketTraders>(`/v1/events/${encodeURIComponent(eventId)}/traders${qs}`);
  }

  /** Exchange trading schedule — `GET /v1/exchange/schedule` */
  async getExchangeSchedule(): Promise<ExchangeScheduleResponse> {
    return this.request<ExchangeScheduleResponse>(`/v1/exchange/schedule`);
  }

  /** Exchange connectivity status — `GET /v1/exchange/status` */
  async getExchangeStatus(): Promise<ExchangeStatusResponse> {
    return this.request<ExchangeStatusResponse>(`/v1/exchange/status`);
  }

  /** Top wallets by FIFO PnL — `GET /v1/leaderboard/pnl` */
  async getPnlLeaderboard(params?: PmGetPnlLeaderboardParams): Promise<PaginatedPnlLeaderboard> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedPnlLeaderboard>(`/v1/leaderboard/pnl${qs}`);
  }

  /** Top Polymarket traders by cumulative volume — `GET /v1/leaderboard/traders` */
  async getTraderLeaderboard(params?: PmGetTraderLeaderboardParams): Promise<PaginatedPnlLeaderboard> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedPnlLeaderboard>(`/v1/leaderboard/traders${qs}`);
  }

  /** Live market snapshots — `GET /v1/live_data` */
  async getLiveData(params: PmGetLiveDataParams): Promise<Array<LiveMarketData>> {
    const qs = this.buildQueryString(params);
    return this.request<Array<LiveMarketData>>(`/v1/live_data${qs}`);
  }

  /** List markets — `GET /v1/markets` */
  async getMarkets(params?: PmGetMarketsParams): Promise<PaginatedMarkets> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedMarkets>(`/v1/markets${qs}`);
  }

  /** Batch fetch markets by id — `GET /v1/markets/batch` */
  async getMarketsBatch(params: PmGetMarketsBatchParams): Promise<BatchMarketsResponse> {
    const qs = this.buildQueryString(params);
    return this.request<BatchMarketsResponse>(`/v1/markets/batch${qs}`);
  }

  /** Batch fetch markets by id (POST body) — `POST /v1/markets/batch` */
  async postMarketsBatch(body: BatchMarketsBody): Promise<BatchMarketsResponse> {
    return this.request<BatchMarketsResponse>(`/v1/markets/batch`, { method: 'POST', body });
  }

  /** Batch fetch orderbooks — `GET /v1/markets/books` */
  async getMarketBooks(params: PmGetMarketBooksParams): Promise<Array<OrderbookSnapshot>> {
    const qs = this.buildQueryString(params);
    return this.request<Array<OrderbookSnapshot>>(`/v1/markets/books${qs}`);
  }

  /** Batch fetch candlesticks — `GET /v1/markets/candlesticks/batch` */
  async getCandlesticksBatch(params: PmGetCandlesticksBatchParams): Promise<BatchCandlesticksResponse> {
    const qs = this.buildQueryString(params);
    return this.request<BatchCandlesticksResponse>(`/v1/markets/candlesticks/batch${qs}`);
  }

  /** Newest markets — `GET /v1/markets/new` */
  async getNewMarkets(params?: PmGetNewMarketsParams): Promise<PaginatedMarkets> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedMarkets>(`/v1/markets/new${qs}`);
  }

  /** Search markets — `GET /v1/markets/search` */
  async searchMarkets(params: PmSearchMarketsParams): Promise<PaginatedMarkets> {
    const qs = this.buildQueryString(params);
    return this.request<PaginatedMarkets>(`/v1/markets/search${qs}`);
  }

  /** Get market by slug — `GET /v1/markets/slug/{slug}` */
  async getMarketBySlug(slug: string, params?: PmGetMarketBySlugParams): Promise<UnifiedMarket> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<UnifiedMarket>(`/v1/markets/slug/${encodeURIComponent(slug)}${qs}`);
  }

  /** Bundled market snapshot by slug — `GET /v1/markets/slug/{slug}/snapshot` */
  async getMarketSnapshotBySlug(slug: string, params?: PmGetMarketSnapshotBySlugParams): Promise<MarketSnapshotResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<MarketSnapshotResponse>(`/v1/markets/slug/${encodeURIComponent(slug)}/snapshot${qs}`);
  }

  /** Global trade feed — `GET /v1/markets/trades` */
  async getGlobalTrades(params?: PmGetGlobalTradesParams): Promise<TradesEnrichedResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<TradesEnrichedResponse>(`/v1/markets/trades${qs}`);
  }

  /** Trending markets by 24h volume and trade count — `GET /v1/markets/trending` */
  async getTrendingMarkets(params?: PmGetTrendingMarketsParams): Promise<PaginatedMarkets> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedMarkets>(`/v1/markets/trending${qs}`);
  }

  /** Get market by ticker or condition id — `GET /v1/markets/{ticker}` */
  async getMarket(ticker: string, params?: PmGetMarketParams): Promise<UnifiedMarket> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<UnifiedMarket>(`/v1/markets/${encodeURIComponent(ticker)}${qs}`);
  }

  /** OHLCV candlesticks — `GET /v1/markets/{ticker}/candlesticks` */
  async getMarketCandlesticks(ticker: string, params?: PmGetMarketCandlesticksParams): Promise<PaginatedCandlesticks> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedCandlesticks>(`/v1/markets/${encodeURIComponent(ticker)}/candlesticks${qs}`);
  }

  /** Top holders (Polymarket only) — `GET /v1/markets/{ticker}/holders` */
  async getMarketHolders(ticker: string, params?: PmGetMarketHoldersParams): Promise<Array<HolderResponse>> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<Array<HolderResponse>>(`/v1/markets/${encodeURIComponent(ticker)}/holders${qs}`);
  }

  /** Midpoint price — `GET /v1/markets/{ticker}/midpoint` */
  async getMarketMidpoint(ticker: string, params?: PmGetMarketMidpointParams): Promise<MidpointResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<MidpointResponse>(`/v1/markets/${encodeURIComponent(ticker)}/midpoint${qs}`);
  }

  /** Open interest and holder stats — `GET /v1/markets/{ticker}/oi` */
  async getMarketOpenInterest(ticker: string, params?: PmGetMarketOpenInterestParams): Promise<OpenInterestResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<OpenInterestResponse>(`/v1/markets/${encodeURIComponent(ticker)}/oi${qs}`);
  }

  /** Orderbook snapshot — `GET /v1/markets/{ticker}/orderbook` */
  async getMarketOrderbook(ticker: string, params?: PmGetMarketOrderbookParams): Promise<OrderbookSnapshot> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<OrderbookSnapshot>(`/v1/markets/${encodeURIComponent(ticker)}/orderbook${qs}`);
  }

  /** Current price snapshot — `GET /v1/markets/{ticker}/price` */
  async getMarketPrice(ticker: string, params?: PmGetMarketPriceParams): Promise<PriceSnapshot> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PriceSnapshot>(`/v1/markets/${encodeURIComponent(ticker)}/price${qs}`);
  }

  /** Size-aware VWAP quote (walk the book) — `GET /v1/markets/{ticker}/quote` */
  async getMarketQuote(ticker: string, params?: PmGetMarketQuoteParams): Promise<MarketQuoteResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<MarketQuoteResponse>(`/v1/markets/${encodeURIComponent(ticker)}/quote${qs}`);
  }

  /** Related markets on other exchange — `GET /v1/markets/{ticker}/related` */
  async getRelatedMarkets(ticker: string, params?: PmGetRelatedMarketsParams): Promise<Array<UnifiedMarket>> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<Array<UnifiedMarket>>(`/v1/markets/${encodeURIComponent(ticker)}/related${qs}`);
  }

  /** Bundled market snapshot — `GET /v1/markets/{ticker}/snapshot` */
  async getMarketSnapshot(ticker: string, params?: PmGetMarketSnapshotParams): Promise<MarketSnapshotResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<MarketSnapshotResponse>(`/v1/markets/${encodeURIComponent(ticker)}/snapshot${qs}`);
  }

  /** Bid-ask spread — `GET /v1/markets/{ticker}/spread` */
  async getMarketSpread(ticker: string, params?: PmGetMarketSpreadParams): Promise<SpreadResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<SpreadResponse>(`/v1/markets/${encodeURIComponent(ticker)}/spread${qs}`);
  }

  /** Top traders on a market by total P&L — `GET /v1/markets/{ticker}/traders` */
  async getMarketTraders(ticker: string, params?: PmGetMarketTradersParams): Promise<PaginatedMarketTraders> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedMarketTraders>(`/v1/markets/${encodeURIComponent(ticker)}/traders${qs}`);
  }

  /** Market trade history — `GET /v1/markets/{ticker}/trades` */
  async getMarketTrades(ticker: string, params?: PmGetMarketTradesParams): Promise<PaginatedTrades> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedTrades>(`/v1/markets/${encodeURIComponent(ticker)}/trades${qs}`);
  }

  /** Event/sports milestones — `GET /v1/milestones` */
  async getMilestones(params?: PmGetMilestonesParams): Promise<MilestonesResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<MilestonesResponse>(`/v1/milestones${qs}`);
  }

  /** Unified typeahead search (markets + events) — `GET /v1/search` */
  async search(params: PmSearchParams): Promise<GlobalSearchResponse> {
    const qs = this.buildQueryString(params);
    return this.request<GlobalSearchResponse>(`/v1/search${qs}`);
  }

  /** List market series (Kalshi) — `GET /v1/series` */
  async getSeries(params?: PmGetSeriesParams): Promise<PaginatedSeries> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedSeries>(`/v1/series${qs}`);
  }

  /** List Polymarket sports categories — `GET /v1/sports` */
  async getSports(params?: PmGetSportsParams): Promise<Array<SportInfo>> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<Array<SportInfo>>(`/v1/sports${qs}`);
  }

  /** Combined platform statistics — `GET /v1/stats` */
  async getCombinedStats(): Promise<CombinedStats> {
    return this.request<CombinedStats>(`/v1/stats`);
  }

  /** Per-exchange statistics — `GET /v1/stats/{exchange}` */
  async getExchangeStats(exchange: string): Promise<PlatformStats> {
    return this.request<PlatformStats>(`/v1/stats/${encodeURIComponent(exchange)}`);
  }

  /** Search Polymarket traders — `GET /v1/traders/search` */
  async searchTraders(params: PmSearchTradersParams): Promise<PaginatedTraders> {
    const qs = this.buildQueryString(params);
    return this.request<PaginatedTraders>(`/v1/traders/search${qs}`);
  }

}
