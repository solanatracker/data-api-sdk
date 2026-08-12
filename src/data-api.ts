import {
  TokenDetailResponse,
  MultiTokensResponse,
  TokenHoldersResponse,
  TopHolder,
  AthPrice,
  BundlersResponse,
  DeployerTokensResponse,
  DeployerParams,
  SearchParams,
  SearchResponse,
  TokenOverview,
  PriceData,
  PriceHistoryData,
  PriceTimestampData,
  PriceRangeData,
  MultiPriceResponse,
  WalletBasicResponse,
  TradesResponse,
  WalletResponse,
  ChartResponse,
  HoldersChartResponse,
  SnipersChartResponse,
  InsidersChartResponse,
  BundlersChartResponse,
  PnLResponse,
  TokenPnLResponse,
  FirstBuyerData,
  TopTradersResponse,
  TokenStats,
  WalletChartResponse,
  CreditsResponse,
  WalletTradesResponse,
  ProcessedEvent,
  SubscriptionResponse,
  ChartDataParams,
  PaginatedTokenHoldersResponse,
  PnlV2KOLLeaderboardParams,
  PnlV2KOLLeaderboardResponse,
  PnlV2KOLPeriodParams,
  PnlV2KOLPeriodResponse,
  PnlV2KOLCalendarParams,
  PnlV2KOLCalendarResponse,
  PnlV2KOLByDateParams,
  PnlV2KOLByDateResponse,
  PnlV2TopTradersParams,
  PnlV2TopTradersResponse,
  PnlV2TokenTradersParams,
  PnlV2TokenTradersResponse,
  PnlV2TokenFirstBuyersParams,
  PnlV2WalletHistoryParams,
  PnlV2WalletHistoryResponse,
  PnlV2WalletPerformanceParams,
  PnlV2WalletPerformanceResponse,
  PnlV2WalletTokenPositionResponse,
  PnlV2WalletHighlightsResponse,
  PnlV2WalletRiskResponse,
  PnlV2WalletPositionsParams,
  PnlV2WalletPositionsResponse,
  PnlV2WalletChartParams,
  PnlV2WalletChartResponse,
  PnlV2WalletOverviewParams,
  PnlV2WalletOverviewResponse,
  PnlV2WalletTokenPositionParams,
  PnlV2BatchWalletPositionsResponse,
  PnlV2BatchWalletSummariesResponse,
  PnlV2BatchTokenPositionsResponse,
  PnlV2BatchPositionPairsResponse,
  PnlV2BatchParams,
  PnlV2WalletQueued,
  DcaListParams,
  DcaProgramParams,
  DcaProgramsResponse,
  DcaWalletResponse,
  DcaOrdersListResponse,
  DcaOrder,
  DcaTokenFlowResponse,
  DcaTokenOrdersResponse,
  DcaTokenUsersResponse,
  DcaPairResponse,
  LighthouseResponse,
  WhaleTradesParams,
  KolTradesParams,
  KolTokenTradesParams,
  WhaleKolTradesResponse,
  WhaleMinVolume,
} from './interfaces';

import { decodeBinaryEvents } from './event-processor';

export class DataApiError extends Error {
  public details?: any;

  constructor(
    message: string,
    public status?: number,
    public code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'DataApiError';
    this.details = details;
  }
}

export class RateLimitError extends DataApiError {
  constructor(message: string, public retryAfter?: number, details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends DataApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Config options for the Solana Tracker Data API
 */
export interface DataApiConfig {
  /** Your API key from solanatracker.io */
  apiKey: string;
  /** Optional base URL override */
  baseUrl?: string;
}

export interface RequestOptions {
  method: string;
  body?: any;
  /** Optional headers to include in the request */
  headers?: Record<string, string>;
  /** Disable logs for rate limit warnings */
  disableLogs?: boolean;
}

/**
 * Parameters for token overview endpoint (/tokens/multi/all)
 */
export interface TokenOverviewParams {
  /** Number of tokens per category (default: 100, max: 500) */
  limit?: number;
  /** Minimum curve percentage for graduating tokens (default: 40) */
  minCurve?: number;
  /** Minimum number of holders for graduating tokens (default: 20) */
  minHolders?: number;
  /** Maximum number of holders for graduating tokens */
  maxHolders?: number;
  /** Reduce spam by filtering out quick graduated tokens */
  reduceSpam?: boolean;
  
  // Filters from buildWhereClause
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  markets?: string[];
  minRiskScore?: number;
  maxRiskScore?: number;
  rugged?: boolean;
}

/**
 * Parameters for graduated tokens endpoint (/tokens/multi/graduated)
 */
export interface GraduatedTokensParams {
  /** Number of tokens to return (default: 100, max: 500) */
  limit?: number;
  /** Page number for pagination (default: 1) */
  page?: number;
  /** Reduce spam by filtering out quick graduated tokens */
  reduceSpam?: boolean;
  
  // Filters from buildWhereClause
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  markets?: string[];
  minRiskScore?: number;
  maxRiskScore?: number;
  rugged?: boolean;
}

/**
 * Parameters for graduating tokens endpoint (/tokens/multi/graduating)
 */
export interface GraduatingTokensParams {
  /** Number of tokens to return (default: 100, max: 500) */
  limit?: number;
  /** Minimum curve percentage (default: 40) */
  minCurve?: number;
  /** Maximum curve percentage (default: 100) */
  maxCurve?: number;
  /** Minimum number of holders (default: 20) */
  minHolders?: number;
  /** Maximum number of holders */
  maxHolders?: number;
  
  // Filters from buildWhereClause
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  markets?: string[];
  minRiskScore?: number;
  maxRiskScore?: number;
  rugged?: boolean;
}

/**
 * Solana Tracker Data API client
 */
export class Client {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new instance of the Solana Tracker Data API client
   * @param config Configuration options including API key
   */
  constructor(config: DataApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://data.solanatracker.io';
  }

  /**
   * Makes a request to the API
   * @param endpoint The API endpoint
   * @param options Additional fetch options
   * @returns The API response
   */
  private async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Default error message
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        let errorDetails: any = null;

        try {
          // Attempt to parse error response as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorDetails = await response.json();

            // Extract error message from various possible fields
            if (typeof errorDetails === 'string') {
              errorMessage = errorDetails;
            } else if (errorDetails && typeof errorDetails === 'object') {
              // Try different common error message fields
              if (typeof errorDetails.message === 'string') {
                errorMessage = errorDetails.message;
              } else if (typeof errorDetails.error === 'string') {
                errorMessage = errorDetails.error;
              } else if (typeof errorDetails.detail === 'string') {
                errorMessage = errorDetails.detail;
              } else if (typeof errorDetails.msg === 'string') {
                errorMessage = errorDetails.msg;
              } else if (errorDetails.error && typeof errorDetails.error === 'object') {
                // If error is an object, try to extract message from it
                if (typeof errorDetails.error.message === 'string') {
                  errorMessage = errorDetails.error.message;
                } else if (typeof errorDetails.error.detail === 'string') {
                  errorMessage = errorDetails.error.detail;
                } else {
                  // If we can't find a string message, stringify the error object
                  errorMessage = `API error: ${JSON.stringify(errorDetails.error)}`;
                }
              } else {
                // Last resort: stringify the entire error response
                errorMessage = `API error: ${JSON.stringify(errorDetails)}`;
              }
            }
          }
        } catch (parseError) {
          // If parsing fails, we'll use the default error message
          console.error('Failed to parse error response:', parseError);
        }

        // Handle specific error codes
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          if (!options?.disableLogs) {
            console.warn(`Rate limit exceeded for ${endpoint}. Retry after: ${retryAfter || '1'} seconds`);
          }
          const error = new RateLimitError(errorMessage, retryAfter ? parseInt(retryAfter) : undefined);
          // Attach error details if available
          if (errorDetails) {
            (error as any).details = errorDetails;
          }
          throw error;
        }

        // For all other errors (including 500)
        const error = new DataApiError(errorMessage, response.status);
        // Attach error details if available
        if (errorDetails) {
          (error as any).details = errorDetails;
        }
        throw error;
      }

      const data = await response.json();
      return this.normalizeLegacyRiskFields(data) as T;
    } catch (error) {
      if (error instanceof DataApiError) {
        throw error;
      }
      // For network errors or other unexpected errors
      throw new DataApiError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preserve the 0.3.x risk response surface while using the corrected wire
   * field names. The server now returns `wallet` and may omit `bundlers`.
   */
  private normalizeLegacyRiskFields(value: unknown): unknown {
    if (Array.isArray(value)) {
      value.forEach((item) => this.normalizeLegacyRiskFields(item));
      return value;
    }
    if (!value || typeof value !== 'object') {
      return value;
    }

    const record = value as Record<string, unknown>;
    const isTokenRisk =
      Array.isArray(record.risks) &&
      record.snipers !== null &&
      typeof record.snipers === 'object' &&
      record.insiders !== null &&
      typeof record.insiders === 'object';

    if (isTokenRisk) {
      for (const categoryName of ['snipers', 'insiders'] as const) {
        const category = record[categoryName] as Record<string, unknown>;
        if (Array.isArray(category.wallets)) {
          for (const walletValue of category.wallets) {
            if (walletValue && typeof walletValue === 'object') {
              const wallet = walletValue as Record<string, unknown>;
              if (typeof wallet.wallet === 'string' && wallet.address === undefined) {
                wallet.address = wallet.wallet;
              }
            }
          }
        }
      }

      if (record.bundlers === undefined) {
        record.bundlers = {
          count: 0,
          totalBalance: 0,
          totalPercentage: 0,
          totalInitialBalance: 0,
          totalInitialPercentage: 0,
          wallets: [],
        };
      }
    }

    Object.values(record).forEach((item) => this.normalizeLegacyRiskFields(item));
    return value;
  }

  /**
   * Validates a Solana public key
   * @param address The address to validate
   * @param paramName The parameter name for error messaging
   * @throws ValidationError if the address is invalid
   */
  private validatePublicKey(address: string, paramName: string) {
    // Basic validation - a more robust implementation would use the PublicKey class from @solana/web3.js
    if (!address || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      throw new ValidationError(`Invalid ${paramName}: ${address}`);
    }
  }

  /**
   * Builds query string from parameters object
   * @param params Parameters object
   * @returns Query string
   */
  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        // Handle arrays - convert to comma-separated string
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    }
    const query = queryParams.toString();
    return query ? `?${query}` : '';
  }

  // ======== TOKEN ENDPOINTS ========

  /**
   * Get comprehensive information about a specific token
   * @param tokenAddress The token's mint address
   * @returns Detailed token information
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenDetailResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<TokenDetailResponse>(`/tokens/${tokenAddress}`);
  }

  /**
   * Get token information by searching with a pool address
   * @param poolAddress The pool address
   * @returns Detailed token information
   */
  async getTokenByPool(poolAddress: string): Promise<TokenDetailResponse> {
    this.validatePublicKey(poolAddress, 'poolAddress');
    return this.request<TokenDetailResponse>(`/tokens/by-pool/${poolAddress}`);
  }

  /**
   * Get token holders information
   * @param tokenAddress The token's mint address
   * @returns Information about token holders
   */
  async getTokenHolders(tokenAddress: string, enrich?: 'identity' | 'walletPnl' | 'identity,walletPnl' | 'all' | '*'): Promise<TokenHoldersResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    const qs = enrich ? this.buildQueryString({ enrich }) : '';
    return this.request<TokenHoldersResponse>(`/tokens/${tokenAddress}/holders${qs}`);
  }

  /**
   * Get token holders with pagination support
   * @param tokenAddress The token's mint address
   * @param limit Number of holders to return per page (default: 100, max: 100)
   * @param cursor Pagination cursor from previous response
   * @returns Paginated token holders information
   */
  async getTokenHoldersPaginated(
    tokenAddress: string,
    limit?: number,
    cursor?: string
  ): Promise<PaginatedTokenHoldersResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (limit) {
      if (limit > 5000) {
        throw new ValidationError('Maximum limit is 5000');
      }
      params.append('limit', limit.toString());
    }
    if (cursor) params.append('cursor', cursor);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedTokenHoldersResponse>(
      `/tokens/${tokenAddress}/holders/paginated${query}`
    );
  }


  /**
   * Get top 20 token holders
   * @param tokenAddress The token's mint address
   * @returns Top holders information
   */
  async getTopHolders(tokenAddress: string): Promise<TopHolder[]> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<TopHolder[]>(`/tokens/${tokenAddress}/holders/top`);
  }

  /**
   * Get the all-time high price and market cap for a token
   * @param tokenAddress The token's mint address
   * @returns All-time high price and market cap data
   */
  async getAthPrice(tokenAddress: string): Promise<AthPrice> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<AthPrice>(`/tokens/${tokenAddress}/ath`);
  }

  /**
   * Get bundler information for a token
   * @param tokenAddress The token's mint address
   * @returns Bundler wallet stats including top 500 bundler wallets
   */
  async getTokenBundlers(tokenAddress: string): Promise<BundlersResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<BundlersResponse>(`/tokens/${tokenAddress}/bundlers`);
  }


  /**
   * Get tokens created by a specific wallet with pagination
   * @param wallet The deployer wallet address
   * @param pageOrParams Page number (legacy) or DeployerParams object
   * @param limit Number of items per page when using legacy positional args
   * @returns List of tokens created by the deployer (TokenDetailResponse items when format=full)
   */
  async getTokensByDeployer(
    wallet: string,
    params: DeployerParams & { format: 'full' }
  ): Promise<DeployerTokensResponse<TokenDetailResponse>>;
  async getTokensByDeployer(
    wallet: string,
    pageOrParams?: number | DeployerParams,
    limit?: number
  ): Promise<DeployerTokensResponse>;
  async getTokensByDeployer(
    wallet: string,
    pageOrParams?: number | DeployerParams,
    limit?: number
  ): Promise<DeployerTokensResponse | DeployerTokensResponse<TokenDetailResponse>> {
    this.validatePublicKey(wallet, 'wallet');

    let deployerParams: Record<string, any> = {};
    if (typeof pageOrParams === 'number') {
      if (pageOrParams) deployerParams.page = pageOrParams;
      if (limit) deployerParams.limit = limit;
    } else if (pageOrParams) {
      deployerParams = { ...pageOrParams };
    }

    const query = this.buildQueryString(deployerParams);
    return this.request(`/deployer/${wallet}${query}`);
  }

  /**
   * Search for tokens with flexible filtering options
   * @param params Search parameters and filters
   * @returns Search results (TokenDetailResponse items when format=full)
   */
  async searchTokens(params: SearchParams & { format: 'full' }): Promise<SearchResponse<TokenDetailResponse>>;
  async searchTokens(params: SearchParams): Promise<SearchResponse>;
  async searchTokens(params: SearchParams): Promise<SearchResponse | SearchResponse<TokenDetailResponse>> {
    return this.request<SearchResponse>(`/search${this.buildQueryString(params)}`);
  }

  /**
   * Get the latest tokens
   * @param page Page number (1-10)
   * @returns List of latest tokens
   */
  async getLatestTokens(page: number = 1): Promise<TokenDetailResponse[]> {
    if (page < 1 || page > 10) {
      throw new ValidationError('Page must be between 1 and 10');
    }
    return this.request<TokenDetailResponse[]>(`/tokens/latest?page=${page}`);
  }

  /**
   * Get information about multiple tokens
   * @param tokenAddresses Array of token addresses
   * @returns Information about multiple tokens
   */
  async getMultipleTokens(tokenAddresses: string[]): Promise<MultiTokensResponse> {
    if (tokenAddresses.length > 20) {
      throw new ValidationError('Maximum of 20 tokens per request');
    }
    tokenAddresses.forEach((addr) => this.validatePublicKey(addr, 'tokenAddress'));
    return this.request<MultiTokensResponse>('/tokens/multi', {
      method: 'POST',
      body: JSON.stringify({ tokens: tokenAddresses }),
    });
  }

  /**
   * Get trending tokens
   * @param timeframe Optional timeframe for trending calculation
   * @returns List of trending tokens
   */
  async getTrendingTokens(timeframe?: string): Promise<TokenDetailResponse[]> {
    const validTimeframes = ['5m', '15m', '30m', '1h', '2h', '3h', '4h', '5h', '6h', '12h', '24h'];
    if (timeframe && !validTimeframes.includes(timeframe)) {
      throw new ValidationError(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
    }
    const endpoint = timeframe ? `/tokens/trending/${timeframe}` : '/tokens/trending';
    return this.request<TokenDetailResponse[]>(endpoint);
  }

  /**
   * Get top performing tokens by price change percentage
   * @param timeframe Timeframe for performance calculation (5m, 15m, 30m, 1h, 6h, 12h, 24h)
   * @returns List of top performing tokens
   */
  async getTopPerformers(timeframe: string): Promise<TokenDetailResponse[]> {
    const validTimeframes = ['5m', '15m', '30m', '1h', '6h', '12h', '24h'];
    if (!validTimeframes.includes(timeframe)) {
      throw new ValidationError(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
    }
    return this.request<TokenDetailResponse[]>(`/top-performers/${timeframe}`);
  }

  /**
   * Get tokens sorted by volume
   * @param timeframe Optional timeframe for volume calculation
   * @returns List of tokens sorted by volume
   */
  async getTokensByVolume(timeframe?: string): Promise<TokenDetailResponse[]> {
    const validTimeframes = ['5m', '15m', '30m', '1h', '6h', '12h', '24h'];
    if (timeframe && !validTimeframes.includes(timeframe)) {
      throw new ValidationError(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
    }
    const endpoint = timeframe ? `/tokens/volume/${timeframe}` : '/tokens/volume';
    return this.request<TokenDetailResponse[]>(endpoint);
  }

  /**
   * Get an overview of latest, graduating, and graduated tokens
   * @param limit Number of tokens per category (or params object)
   * @returns Token overview (Memescope / Pumpvision style)
   */
  async getTokenOverview(limit?: number): Promise<TokenOverview>;
  async getTokenOverview(params?: TokenOverviewParams): Promise<TokenOverview>;
  async getTokenOverview(limitOrParams?: number | TokenOverviewParams): Promise<TokenOverview> {
    let params: TokenOverviewParams | undefined;
    
    if (typeof limitOrParams === 'number') {
      params = { limit: limitOrParams };
    } else {
      params = limitOrParams;
    }

    if (params?.limit !== undefined && (!Number.isInteger(params.limit) || params.limit <= 0)) {
      throw new ValidationError('Limit must be a positive integer');
    }

    if (params?.limit !== undefined && params.limit > 500) {
      throw new ValidationError('Maximum limit is 500');
    }

    const query = params ? this.buildQueryString(params) : '';
    return this.request<TokenOverview>(`/tokens/multi/all${query}`);
  }

  /**
   * Get graduated tokens
   * @param params Optional parameters including limit, page, and filters
   * @returns List of graduated tokens
   */
  async getGraduatedTokens(): Promise<TokenDetailResponse[]>;
  async getGraduatedTokens(params?: GraduatedTokensParams): Promise<TokenDetailResponse[]>;
  async getGraduatedTokens(params?: GraduatedTokensParams): Promise<TokenDetailResponse[]> {
    if (params?.limit !== undefined && (!Number.isInteger(params.limit) || params.limit <= 0)) {
      throw new ValidationError('Limit must be a positive integer');
    }

    if (params?.limit !== undefined && params.limit > 500) {
      throw new ValidationError('Maximum limit is 500');
    }

    if (params?.page !== undefined && (!Number.isInteger(params.page) || params.page < 1)) {
      throw new ValidationError('Page must be a positive integer');
    }

    const query = params ? this.buildQueryString(params) : '';
    return this.request<TokenDetailResponse[]>(`/tokens/multi/graduated${query}`);
  }

  /**
   * Get graduating tokens
   * @param params Optional parameters including limit, curve percentages, holders, and filters
   * @returns List of graduating tokens
   */
  async getGraduatingTokens(): Promise<TokenDetailResponse[]>;
  async getGraduatingTokens(params?: GraduatingTokensParams): Promise<TokenDetailResponse[]>;
  async getGraduatingTokens(params?: GraduatingTokensParams): Promise<TokenDetailResponse[]> {
    if (params?.limit !== undefined && (!Number.isInteger(params.limit) || params.limit <= 0)) {
      throw new ValidationError('Limit must be a positive integer');
    }

    if (params?.limit !== undefined && params.limit > 500) {
      throw new ValidationError('Maximum limit is 500');
    }

    if (params?.minCurve !== undefined && (params.minCurve < 0 || params.minCurve > 100)) {
      throw new ValidationError('minCurve must be between 0 and 100');
    }

    if (params?.maxCurve !== undefined && (params.maxCurve < 0 || params.maxCurve > 100)) {
      throw new ValidationError('maxCurve must be between 0 and 100');
    }

    if (params?.minCurve !== undefined && params?.maxCurve !== undefined && params.minCurve > params.maxCurve) {
      throw new ValidationError('minCurve must be less than or equal to maxCurve');
    }

    const query = params ? this.buildQueryString(params) : '';
    return this.request<TokenDetailResponse[]>(`/tokens/multi/graduating${query}`);
  }

  // ======== PRICE ENDPOINTS ========

  /**
   * Get price information for a token
   * @param tokenAddress The token's mint address
   * @param priceChanges Include price change percentages
   * @returns Price data
   */
  async getPrice(tokenAddress: string, priceChanges?: boolean): Promise<PriceData> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    const query = priceChanges ? '&priceChanges=true' : '';
    return this.request<PriceData>(`/price?token=${tokenAddress}${query}`);
  }

  /**
   * Get historic price information for a token
   * @param tokenAddress The token's mint address
   * @returns Historic price data
   */
  async getPriceHistory(tokenAddress: string): Promise<PriceHistoryData> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<PriceHistoryData>(`/price/history?token=${tokenAddress}`);
  }

  /**
   * Get price at a specific timestamp
   * @param tokenAddress The token's mint address
   * @param timestamp Unix timestamp
   * @returns Price at the specified timestamp
   */
  async getPriceAtTimestamp(tokenAddress: string, timestamp: number): Promise<PriceTimestampData> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<PriceTimestampData>(`/price/history/timestamp?token=${tokenAddress}&timestamp=${timestamp}`);
  }

  /**
   * Get lowest and highest price in a time range
   * @param tokenAddress The token's mint address
   * @param timeFrom Start time (unix timestamp)
   * @param timeTo End time (unix timestamp)
   * @returns Price range data
   */
  async getPriceRange(tokenAddress: string, timeFrom: number, timeTo: number): Promise<PriceRangeData> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<PriceRangeData>(`/price/history/range?token=${tokenAddress}&time_from=${timeFrom}&time_to=${timeTo}`);
  }

  /**
   * Get price information for a token (POST method)
   * @param tokenAddress The token's mint address
   * @param priceChanges Include price change percentages
   * @returns Price data
   */
  async postPrice(tokenAddress: string, priceChanges?: boolean): Promise<PriceData> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<PriceData>('/price', {
      method: 'POST',
      body: JSON.stringify({
        token: tokenAddress,
        priceChanges: priceChanges || false
      })
    });
  }

  /**
   * Get price information for multiple tokens
   * @param tokenAddresses Array of token addresses
   * @param priceChanges Include price change percentages
   * @returns Price data for multiple tokens
   */
  async getMultiplePrices(tokenAddresses: string[], priceChanges?: boolean): Promise<MultiPriceResponse> {
    if (tokenAddresses.length > 100) {
      throw new ValidationError('Maximum of 100 tokens per request');
    }
    tokenAddresses.forEach((addr) => this.validatePublicKey(addr, 'tokenAddress'));

    const query = priceChanges ? '&priceChanges=true' : '';
    return this.request<MultiPriceResponse>(`/price/multi?tokens=${tokenAddresses.join(',')}${query}`);
  }

  /**
   * Get price information for multiple tokens (POST method)
   * @param tokenAddresses Array of token addresses
   * @param priceChanges Include price change percentages
   * @returns Price data for multiple tokens
   */
  async postMultiplePrices(tokenAddresses: string[], priceChanges?: boolean): Promise<MultiPriceResponse> {
    if (tokenAddresses.length > 100) {
      throw new ValidationError('Maximum of 100 tokens per request');
    }
    tokenAddresses.forEach((addr) => this.validatePublicKey(addr, 'tokenAddress'));

    return this.request<MultiPriceResponse>('/price/multi', {
      method: 'POST',
      body: JSON.stringify({
        tokens: tokenAddresses,
        priceChanges: priceChanges || false
      })
    });
  }

  // ======== WALLET ENDPOINTS ========

  /**
   * Get basic wallet information
   * @param owner Wallet address
   * @returns Basic wallet data
   */
  async getWalletBasic(owner: string): Promise<WalletBasicResponse> {
    this.validatePublicKey(owner, 'owner');
    return this.request<WalletBasicResponse>(`/wallet/${owner}/basic`);
  }


  /**
   * Get all tokens in a wallet
   * @param owner Wallet address
   * @returns Detailed wallet data
   */
  async getWallet(owner: string): Promise<WalletResponse> {
    this.validatePublicKey(owner, 'owner');
    return this.request<WalletResponse>(`/wallet/${owner}`);
  }

  /**
   * Get wallet tokens with pagination
   * @param owner Wallet address
   * @param page Page number
   * @returns Paginated wallet data
   */
  async getWalletPage(owner: string, page: number): Promise<WalletResponse> {
    this.validatePublicKey(owner, 'owner');
    return this.request<WalletResponse>(`/wallet/${owner}/page/${page}`);
  }

  /**
 * Get wallet portfolio chart data with PnL information
 * @param wallet Wallet address
 * @returns Wallet chart data with historical values and PnL
 * @throws DataApiError if no data found for the wallet
 */
  async getWalletChart(wallet: string): Promise<WalletChartResponse> {
    this.validatePublicKey(wallet, 'wallet');
    return this.request<WalletChartResponse>(`/wallet/${wallet}/chart`);
  }

  /**
   * Get wallet trades
   * @param owner Wallet address
   * @param cursor Pagination cursor
   * @param showMeta Include token metadata
   * @param parseJupiter Parse Jupiter swaps
   * @param hideArb Hide arbitrage transactions
   * @returns Wallet trades data
   */
  async getWalletTrades(
    owner: string,
    cursor?: number,
    showMeta?: boolean,
    parseJupiter?: boolean,
    hideArb?: boolean
  ): Promise<WalletTradesResponse> {
    this.validatePublicKey(owner, 'owner');

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    if (showMeta) params.append('showMeta', 'true');
    if (parseJupiter) params.append('parseJupiter', 'true');
    if (hideArb) params.append('hideArb', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WalletTradesResponse>(`/wallet/${owner}/trades${query}`);
  }

  // ======== TRADE ENDPOINTS ========

  /**
   * Get trades for a token
   * @param tokenAddress Token address
   * @param cursor Pagination cursor
   * @param showMeta Include token metadata
   * @param parseJupiter Parse Jupiter swaps
   * @param hideArb Hide arbitrage transactions
   * @returns Token trades data
   */
  async getTokenTrades(
    tokenAddress: string,
    cursor?: number,
    showMeta?: boolean,
    parseJupiter?: boolean,
    hideArb?: boolean
  ): Promise<TradesResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    if (showMeta) params.append('showMeta', 'true');
    if (parseJupiter) params.append('parseJupiter', 'true');
    if (hideArb) params.append('hideArb', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TradesResponse>(`/trades/${tokenAddress}${query}`);
  }

  /**
   * Get trades for a specific token and pool
   * @param tokenAddress Token address
   * @param poolAddress Pool address
   * @param cursor Pagination cursor
   * @param showMeta Include token metadata
   * @param parseJupiter Parse Jupiter swaps
   * @param hideArb Hide arbitrage transactions
   * @returns Pool-specific token trades data
   */
  async getPoolTrades(
    tokenAddress: string,
    poolAddress: string,
    cursor?: number,
    showMeta?: boolean,
    parseJupiter?: boolean,
    hideArb?: boolean
  ): Promise<TradesResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(poolAddress, 'poolAddress');

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    if (showMeta) params.append('showMeta', 'true');
    if (parseJupiter) params.append('parseJupiter', 'true');
    if (hideArb) params.append('hideArb', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TradesResponse>(`/trades/${tokenAddress}/${poolAddress}${query}`);
  }

  /**
   * Get trades for a specific token, pool, and wallet
   * @param tokenAddress Token address
   * @param poolAddress Pool address
   * @param owner Wallet address
   * @param cursor Pagination cursor
   * @param showMeta Include token metadata
   * @param parseJupiter Parse Jupiter swaps
   * @param hideArb Hide arbitrage transactions
   * @returns User-specific pool trades data
   */
  async getUserPoolTrades(
    tokenAddress: string,
    poolAddress: string,
    owner: string,
    cursor?: number,
    showMeta?: boolean,
    parseJupiter?: boolean,
    hideArb?: boolean
  ): Promise<TradesResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(poolAddress, 'poolAddress');
    this.validatePublicKey(owner, 'owner');

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    if (showMeta) params.append('showMeta', 'true');
    if (parseJupiter) params.append('parseJupiter', 'true');
    if (hideArb) params.append('hideArb', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TradesResponse>(`/trades/${tokenAddress}/${poolAddress}/${owner}${query}`);
  }

  /**
   * Get trades for a specific token and wallet
   * @param tokenAddress Token address
   * @param owner Wallet address
   * @param cursor Pagination cursor
   * @param showMeta Include token metadata
   * @param parseJupiter Parse Jupiter swaps
   * @param hideArb Hide arbitrage transactions
   * @returns User-specific token trades data
   */
  async getUserTokenTrades(
    tokenAddress: string,
    owner: string,
    cursor?: number,
    showMeta?: boolean,
    parseJupiter?: boolean,
    hideArb?: boolean
  ): Promise<TradesResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(owner, 'owner');

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    if (showMeta) params.append('showMeta', 'true');
    if (parseJupiter) params.append('parseJupiter', 'true');
    if (hideArb) params.append('hideArb', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TradesResponse>(`/trades/${tokenAddress}/by-wallet/${owner}${query}`);
  }

  // ======== CHART DATA ENDPOINTS ========

  /**
  * Get OHLCV data for a token
  * @param params Chart parameters as an object or individual parameters
  * @returns OHLCV chart data
  */
  async getChartData(params: ChartDataParams): Promise<ChartResponse>;
  async getChartData(
    tokenAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number,
    marketCap?: boolean,
    removeOutliers?: boolean,
    dynamicPools?: boolean,
    timezone?: string | 'current',
    fastCache?: boolean,
    currency?: 'usd' | 'eur' | 'sol'
  ): Promise<ChartResponse>;
  async getChartData(
    tokenAddressOrParams: string | ChartDataParams,
    type?: string,
    timeFrom?: number,
    timeTo?: number,
    marketCap?: boolean,
    removeOutliers?: boolean,
    dynamicPools?: boolean,
    timezone?: string | 'current',
    fastCache?: boolean,
    currency?: 'usd' | 'eur' | 'sol'
  ): Promise<ChartResponse> {
    // Handle object parameter
    let tokenAddress: string;
    if (typeof tokenAddressOrParams === 'object') {
      const params = tokenAddressOrParams;
      tokenAddress = params.tokenAddress;
      type = params.type ?? type;
      timeFrom = params.timeFrom ?? timeFrom;
      timeTo = params.timeTo ?? timeTo;
      marketCap = params.marketCap ?? marketCap;
      removeOutliers = params.removeOutliers ?? removeOutliers;
      dynamicPools = params.dynamicPools ?? dynamicPools;
      timezone = params.timezone ?? timezone;
      fastCache = params.fastCache ?? fastCache;
      currency = params.currency ?? currency;
    } else {
      tokenAddress = tokenAddressOrParams;
    }

    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());
    if (marketCap) params.append('marketCap', 'true');
    if (removeOutliers === false) params.append('removeOutliers', 'false');
    if (dynamicPools === false) params.append('dynamicPools', 'false');
    if (timezone) {
      if (timezone === 'current') {
        // Get the current IANA timezone
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        params.append('timezone', currentTimezone);
      } else {
        params.append('timezone', timezone);
      }
    }
    if (fastCache) params.append('fastCache', 'true');
    if (currency && currency !== 'usd') params.append('currency', currency);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ChartResponse>(`/chart/${tokenAddress}${query}`);
  }

  /**
   * Get OHLCV data for a specific token and pool
   * @param params Chart parameters as an object or individual parameters
   * @returns OHLCV chart data for a specific pool
   */
  async getPoolChartData(params: ChartDataParams): Promise<ChartResponse>;
  async getPoolChartData(
    tokenAddress: string,
    poolAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number,
    marketCap?: boolean,
    removeOutliers?: boolean,
    timezone?: string | 'current',
    fastCache?: boolean,
    currency?: 'usd' | 'eur' | 'sol'
  ): Promise<ChartResponse>;
  async getPoolChartData(
    tokenAddressOrParams: string | ChartDataParams,
    poolAddress?: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number,
    marketCap?: boolean,
    removeOutliers?: boolean,
    timezone?: string | 'current',
    fastCache?: boolean,
    currency?: 'usd' | 'eur' | 'sol'
  ): Promise<ChartResponse> {
    // Handle object parameter
    let tokenAddress: string;
    let actualPoolAddress: string;

    if (typeof tokenAddressOrParams === 'object') {
      const params = tokenAddressOrParams;
      tokenAddress = params.tokenAddress;
      actualPoolAddress = params.poolAddress!;
      type = params.type ?? type;
      timeFrom = params.timeFrom ?? timeFrom;
      timeTo = params.timeTo ?? timeTo;
      marketCap = params.marketCap ?? marketCap;
      removeOutliers = params.removeOutliers ?? removeOutliers;
      timezone = params.timezone ?? timezone;
      fastCache = params.fastCache ?? fastCache;
      currency = params.currency ?? currency;
    } else {
      tokenAddress = tokenAddressOrParams;
      actualPoolAddress = poolAddress!;
    }

    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(actualPoolAddress, 'poolAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());
    if (marketCap) params.append('marketCap', 'true');
    if (removeOutliers === false) params.append('removeOutliers', 'false');
    if (timezone) {
      if (timezone === 'current') {
        // Get the current IANA timezone
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        params.append('timezone', currentTimezone);
      } else {
        params.append('timezone', timezone);
      }
    }
    if (fastCache) params.append('fastCache', 'true');
    if (currency && currency !== 'usd') params.append('currency', currency);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ChartResponse>(`/chart/${tokenAddress}/${actualPoolAddress}${query}`);
  }

  /**
   * Get holder count chart data
   * @param tokenAddress Token address
   * @param type Time interval (e.g., "1s", "1m", "1h", "1d")
   * @param timeFrom Start time (Unix timestamp in seconds)
   * @param timeTo End time (Unix timestamp in seconds)
   * @returns Holder count chart data
   */
  async getHoldersChart(
    tokenAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number
  ): Promise<HoldersChartResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<HoldersChartResponse>(`/holders/chart/${tokenAddress}${query}`);
  }

  /**
   * Get snipers percentage chart data
   * @param tokenAddress Token address
   * @param type Time interval (e.g., "1s", "1m", "1h", "1d")
   * @param timeFrom Start time (Unix timestamp in seconds)
   * @param timeTo End time (Unix timestamp in seconds)
   * @returns Snipers percentage chart data
   */
  async getSnipersChart(
    tokenAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number
  ): Promise<SnipersChartResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<SnipersChartResponse>(`/snipers/chart/${tokenAddress}${query}`);
  }

  /**
   * Get insiders percentage chart data
   * @param tokenAddress Token address
   * @param type Time interval (e.g., "1s", "1m", "1h", "1d")
   * @param timeFrom Start time (Unix timestamp in seconds)
   * @param timeTo End time (Unix timestamp in seconds)
   * @returns Insiders percentage chart data
   */
  async getInsidersChart(
    tokenAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number
  ): Promise<InsidersChartResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<InsidersChartResponse>(`/insiders/chart/${tokenAddress}${query}`);
  }

  /**
   * Get bundlers percentage chart data
   * @param tokenAddress Token address
   * @param type Time interval (e.g., "1s", "1m", "1h", "1d")
   * @param timeFrom Start time (Unix timestamp in seconds)
   * @param timeTo End time (Unix timestamp in seconds)
   * @returns Bundlers percentage chart data
   */
  async getBundlersChart(
    tokenAddress: string,
    type?: string,
    timeFrom?: number,
    timeTo?: number
  ): Promise<BundlersChartResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (timeFrom) params.append('time_from', timeFrom.toString());
    if (timeTo) params.append('time_to', timeTo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<BundlersChartResponse>(`/bundlers/chart/${tokenAddress}${query}`);
  }

  // ======== PNL DATA ENDPOINTS ========

  /**
   * Get PnL data for all positions of a wallet
   * @param wallet Wallet address
   * @param showHistoricPnL Add PnL data for 1d, 7d and 30d intervals (BETA)
   * @param holdingCheck Additional check for current holding value
   * @param hideDetails Return only summary without data for each token
   * @returns Wallet PnL data
   */
  async getWalletPnL(
    wallet: string,
    showHistoricPnL?: boolean,
    holdingCheck?: boolean,
    hideDetails?: boolean
  ): Promise<PnLResponse> {
    this.validatePublicKey(wallet, 'wallet');

    const params = new URLSearchParams();
    if (showHistoricPnL) params.append('showHistoricPnL', 'true');
    if (holdingCheck) params.append('holdingCheck', 'true');
    if (hideDetails) params.append('hideDetails', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<PnLResponse>(`/pnl/${wallet}${query}`);
  }

  /**
   * Get the first 100 buyers of a token with PnL data
   * @param tokenAddress Token address
   * @returns First buyers data with PnL
   */
  async getFirstBuyers(tokenAddress: string): Promise<FirstBuyerData[]> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<FirstBuyerData[]>(`/first-buyers/${tokenAddress}`);
  }

  /**
 * Get PnL data for a specific token in a wallet
 * @param wallet Wallet address
 * @param tokenAddress Token address
 * @param holdingCheck Additional check for current holding value in wallet
 * @returns Token-specific PnL data
 */
  async getTokenPnL(wallet: string, tokenAddress: string, holdingCheck?: boolean): Promise<TokenPnLResponse> {
    this.validatePublicKey(wallet, 'wallet');
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    const params = new URLSearchParams();
    if (holdingCheck) params.append('holdingCheck', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TokenPnLResponse>(`/pnl/${wallet}/${tokenAddress}${query}`);
  }

  // ======== TOP TRADERS ENDPOINTS ========

  /**
   * Get the most profitable traders across all tokens
   * @param page Page number (optional)
   * @param expandPnL Include detailed PnL data for each token
   * @param sortBy Sort results by metric ("total" or "winPercentage")
   * @returns Top traders data
   */
  async getTopTraders(
    page?: number,
    expandPnL?: boolean,
    sortBy?: 'total' | 'winPercentage'
  ): Promise<TopTradersResponse> {
    const params = new URLSearchParams();
    if (expandPnL) params.append('expandPnL', 'true');
    if (sortBy) params.append('sortBy', sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = page ? `/top-traders/all/${page}${query}` : `/top-traders/all${query}`;

    return this.request<TopTradersResponse>(endpoint);
  }

  /**
   * Get top 100 traders by PnL for a token
   * @param tokenAddress Token address
   * @returns Top traders for a specific token
   */
  async getTokenTopTraders(tokenAddress: string): Promise<FirstBuyerData[]> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<FirstBuyerData[]>(`/top-traders/${tokenAddress}`);
  }

  // ======== ADDITIONAL ENDPOINTS ========

  /**
   * Get detailed stats for a token over various time intervals
   * @param tokenAddress Token address
   * @returns Detailed token stats
   */
  async getTokenStats(tokenAddress: string): Promise<TokenStats> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<TokenStats>(`/stats/${tokenAddress}`);
  }

  /**
   * Get detailed stats for a specific token and pool
   * @param tokenAddress Token address
   * @param poolAddress Pool address
   * @returns Detailed token-pool stats
   */
  async getPoolStats(tokenAddress: string, poolAddress: string): Promise<TokenStats> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(poolAddress, 'poolAddress');
    return this.request<TokenStats>(`/stats/${tokenAddress}/${poolAddress}`);
  }

  /**
 * Get current subscription information including credits, plan, and billing details
 * @returns Subscription information
 */
  async getSubscription(): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('/subscription');
  }

  /**
 * Get remaining API credits for the current API key
 * @returns Credits information
 */
  async getCredits(): Promise<CreditsResponse> {
    return this.request<CreditsResponse>('/credits');
  }

  /**
   * Get events data for a token (all pools)
   * NOTE: For non-live statistics, use getTokenStats() instead which is more efficient
   * @param tokenAddress The token's mint address
   * @returns Decoded events array
   */
  async getEvents(tokenAddress: string): Promise<ProcessedEvent[]> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');

    // Make a custom request for binary data
    const response = await fetch(`${this.baseUrl}/events/${tokenAddress}`, {
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/octet-stream'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined
        );
      }
      throw new DataApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const binaryData = await response.arrayBuffer();
    const events = decodeBinaryEvents(binaryData);

    return events;
  }

  /**
   * Get events data for a specific token and pool
   * NOTE: For non-live statistics, use getPoolStats() instead which is more efficient
   * @param tokenAddress The token's mint address
   * @param poolAddress The pool's address
   * @returns Decoded events array
   */
  async getPoolEvents(tokenAddress: string, poolAddress: string): Promise<ProcessedEvent[]> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    this.validatePublicKey(poolAddress, 'poolAddress');

    // Make a custom request for binary data
    const response = await fetch(`${this.baseUrl}/events/${tokenAddress}/${poolAddress}`, {
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/octet-stream'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined
        );
      }
      throw new DataApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const binaryData = await response.arrayBuffer();
    const events = decodeBinaryEvents(binaryData);

    return events;
  }

  // ======== PNL V2 ENDPOINTS ========

  // -- Leaderboard --

  async getPnlV2KOLLeaderboard(params?: PnlV2KOLLeaderboardParams): Promise<PnlV2KOLLeaderboardResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2KOLLeaderboardResponse>(`/v2/pnl/leaderboard/kols${qs}`);
  }

  async getPnlV2KOLPeriodLeaderboard(params?: PnlV2KOLPeriodParams): Promise<PnlV2KOLPeriodResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2KOLPeriodResponse>(`/v2/pnl/leaderboard/kols/period${qs}`);
  }

  async getPnlV2KOLCalendar(params?: PnlV2KOLCalendarParams): Promise<PnlV2KOLCalendarResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2KOLCalendarResponse>(`/v2/pnl/leaderboard/kols/calendar${qs}`);
  }

  async getPnlV2KOLByDate(params?: PnlV2KOLByDateParams): Promise<PnlV2KOLByDateResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2KOLByDateResponse>(`/v2/pnl/leaderboard/kols/date${qs}`);
  }

  // -- Top Traders --

  async getPnlV2TopTraders(params?: PnlV2TopTradersParams): Promise<PnlV2TopTradersResponse> {
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2TopTradersResponse>(`/v2/pnl/leaderboard/top${qs}`);
  }

  // -- Token --

  async getPnlV2TokenTraders(token: string, params?: PnlV2TokenTradersParams): Promise<PnlV2TokenTradersResponse> {
    this.validatePublicKey(token, 'token');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2TokenTradersResponse>(`/v2/pnl/tokens/${token}/traders${qs}`);
  }

  async getPnlV2TokenFirstBuyers(token: string, params?: PnlV2TokenFirstBuyersParams): Promise<PnlV2TokenTradersResponse> {
    this.validatePublicKey(token, 'token');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2TokenTradersResponse>(`/v2/pnl/tokens/${token}/first-buyers${qs}`);
  }

  // -- Wallet --

  async getPnlV2WalletOverview(wallet: string, params?: PnlV2WalletOverviewParams): Promise<PnlV2WalletOverviewResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletOverviewResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}${qs}`);
  }

  async getPnlV2WalletHistory(wallet: string, params?: PnlV2WalletHistoryParams): Promise<PnlV2WalletHistoryResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletHistoryResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/history${qs}`);
  }

  async getPnlV2WalletPerformance(wallet: string, params?: PnlV2WalletPerformanceParams): Promise<PnlV2WalletPerformanceResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletPerformanceResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/performance${qs}`);
  }

  async getPnlV2WalletTokenPosition(wallet: string, token: string, params?: PnlV2WalletTokenPositionParams): Promise<PnlV2WalletTokenPositionResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    this.validatePublicKey(token, 'token');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletTokenPositionResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/tokens/${token}${qs}`);
  }

  async getPnlV2WalletHighlights(wallet: string): Promise<PnlV2WalletHighlightsResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    return this.request<PnlV2WalletHighlightsResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/highlights`);
  }

  async getPnlV2WalletRisk(wallet: string): Promise<PnlV2WalletRiskResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    return this.request<PnlV2WalletRiskResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/risk`);
  }

  async getPnlV2WalletPositions(wallet: string, params?: PnlV2WalletPositionsParams): Promise<PnlV2WalletPositionsResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletPositionsResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/positions${qs}`);
  }

  async getPnlV2WalletChart(wallet: string, params?: PnlV2WalletChartParams): Promise<PnlV2WalletChartResponse | PnlV2WalletQueued> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2WalletChartResponse | PnlV2WalletQueued>(`/v2/pnl/wallets/${wallet}/chart${qs}`);
  }

  // -- Batch --

  /**
   * Batch fetch lifetime PnL summaries for up to 100 wallets in one request.
   * Duplicates are deduped server-side; if more than 100 unique wallets are sent,
   * the server truncates and returns `truncated: true` in the response.
   */
  async batchPnlV2WalletSummaries(wallets: string[]): Promise<PnlV2BatchWalletSummariesResponse> {
    if (wallets.length === 0) {
      throw new ValidationError('At least one wallet is required');
    }
    if (wallets.length > 100) {
      throw new ValidationError('Maximum 100 wallets per batch request');
    }
    return this.request<PnlV2BatchWalletSummariesResponse>('/v2/pnl/wallets/batch', {
      method: 'POST',
      body: JSON.stringify({ wallets }),
    });
  }

  async batchPnlV2WalletTokenPositions(wallet: string, tokens: string[], params?: PnlV2BatchParams): Promise<PnlV2BatchWalletPositionsResponse> {
    this.validatePublicKey(wallet, 'wallet');
    if (tokens.length > 100) {
      throw new ValidationError('Maximum 100 tokens per batch request');
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2BatchWalletPositionsResponse>(`/v2/pnl/wallets/${wallet}/positions/batch${qs}`, {
      method: 'POST',
      body: JSON.stringify({ tokens }),
    });
  }

  async batchPnlV2TokenWalletPositions(token: string, wallets: string[], params?: PnlV2BatchParams): Promise<PnlV2BatchTokenPositionsResponse> {
    this.validatePublicKey(token, 'token');
    if (wallets.length > 200) {
      throw new ValidationError('Maximum 200 wallets per batch request');
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2BatchTokenPositionsResponse>(`/v2/pnl/tokens/${token}/positions/batch${qs}`, {
      method: 'POST',
      body: JSON.stringify({ wallets }),
    });
  }

  async batchPnlV2PositionPairs(pairs: Array<{ wallet: string; token: string }>, params?: PnlV2BatchParams): Promise<PnlV2BatchPositionPairsResponse> {
    if (pairs.length > 200) {
      throw new ValidationError('Maximum 200 pairs per batch request');
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<PnlV2BatchPositionPairsResponse>(`/v2/pnl/positions/batch${qs}`, {
      method: 'POST',
      body: JSON.stringify({ pairs }),
    });
  }

  // ==========================================================================
  // Jupiter DCA (Recurring Orders)
  // ==========================================================================

  /** List supported DCA programs (currently `jupiter`). */
  async getDcaPrograms(): Promise<DcaProgramsResponse> {
    return this.request<DcaProgramsResponse>('/dca/programs');
  }

  /**
   * Get a wallet's DCA orders with status counts and pagination.
   * @param wallet Wallet pubkey
   * @param params Optional `program`, `limit`, `cursor`, `sort`, `status`
   */
  async getDcaWallet(wallet: string, params?: DcaListParams): Promise<DcaWalletResponse> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaWalletResponse>(`/dca/wallet/${wallet}${qs}`);
  }

  /** Paginated DCA orders for a wallet (no status summary). */
  async getDcaWalletOrders(wallet: string, params?: DcaListParams): Promise<DcaOrdersListResponse> {
    this.validatePublicKey(wallet, 'wallet');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaOrdersListResponse>(`/dca/wallet/${wallet}/orders${qs}`);
  }

  /** Fetch a single DCA order by its account pubkey. */
  async getDcaOrder(address: string, params?: DcaProgramParams): Promise<DcaOrder> {
    this.validatePublicKey(address, 'address');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaOrder>(`/dca/order/${address}${qs}`);
  }

  /** Aggregate buyer/seller flow on a token across DCA orders. */
  async getDcaTokenFlow(mint: string, params?: DcaListParams): Promise<DcaTokenFlowResponse> {
    this.validatePublicKey(mint, 'mint');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaTokenFlowResponse>(`/dca/token/${mint}${qs}`);
  }

  /** DCA orders buying this token (token is the output mint). */
  async getDcaTokenBuyers(mint: string, params?: DcaListParams): Promise<DcaTokenOrdersResponse> {
    this.validatePublicKey(mint, 'mint');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaTokenOrdersResponse>(`/dca/token/${mint}/buyers${qs}`);
  }

  /** DCA orders selling this token (token is the input mint). */
  async getDcaTokenSellers(mint: string, params?: DcaListParams): Promise<DcaTokenOrdersResponse> {
    this.validatePublicKey(mint, 'mint');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaTokenOrdersResponse>(`/dca/token/${mint}/sellers${qs}`);
  }

  /** Top wallets by DCA activity on a token. */
  async getDcaTokenUsers(
    mint: string,
    params?: { program?: string; limit?: number },
  ): Promise<DcaTokenUsersResponse> {
    this.validatePublicKey(mint, 'mint');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaTokenUsersResponse>(`/dca/token/${mint}/users${qs}`);
  }

  /** DCA orders for a specific input → output trading pair. */
  async getDcaPair(
    inputMint: string,
    outputMint: string,
    params?: DcaListParams,
  ): Promise<DcaPairResponse> {
    this.validatePublicKey(inputMint, 'inputMint');
    this.validatePublicKey(outputMint, 'outputMint');
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<DcaPairResponse>(`/dca/pair/${inputMint}/${outputMint}${qs}`);
  }

  // ==========================================================================
  // Lighthouse (memecoin market activity)
  // ==========================================================================

  /**
   * Live activity overview across Solana launchpads and DEXs.
   * Returns buys, sells, traders, volume, new token launches, and migrations
   * over `5m`, `1h`, `6h`, and `24h` windows with period-over-period change.
   * @returns Array of market rows (DEX, launchpad, and aggregate)
   */
  async getLighthouse(): Promise<LighthouseResponse> {
    return this.request<LighthouseResponse>('/lighthouse');
  }

  // ==========================================================================
  // Whale & KOL Trades
  // ==========================================================================

  /**
   * Latest high-volume (whale) spot trades.
   * @param params Optional `minVolume` (1000|2500|5000|10000), `cursor`, `limit`, `showMeta`, `hideArb`
   */
  async getWhaleTrades(params?: WhaleTradesParams): Promise<WhaleKolTradesResponse> {
    if (params?.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 500) {
        throw new ValidationError('limit must be an integer between 1 and 500');
      }
    }
    if (params?.minVolume !== undefined) {
      const allowed: WhaleMinVolume[] = [1000, 2500, 5000, 10000];
      if (!allowed.includes(params.minVolume)) {
        throw new ValidationError(`minVolume must be one of: ${allowed.join(', ')}`);
      }
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WhaleKolTradesResponse>(`/trades/whales${qs}`);
  }

  /**
   * Latest trades from the tracked KOL wallet roster.
   * @param params Optional `minVolume` (0|1000|2500|5000|10000; default 0), `cursor`, `limit`, `showMeta`
   */
  async getKolTrades(params?: KolTradesParams): Promise<WhaleKolTradesResponse> {
    if (params?.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 500) {
        throw new ValidationError('limit must be an integer between 1 and 500');
      }
    }
    if (params?.minVolume !== undefined) {
      const allowed = [0, 1000, 2500, 5000, 10000];
      if (!allowed.includes(params.minVolume)) {
        throw new ValidationError(`minVolume must be one of: ${allowed.join(', ')}`);
      }
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WhaleKolTradesResponse>(`/trades/kols${qs}`);
  }

  /**
   * KOL trades for a specific token mint.
   * @param tokenMint Token mint address
   * @param params Optional filters including `hideArb` to keep rows matching the path token
   */
  async getKolTradesByToken(
    tokenMint: string,
    params?: KolTokenTradesParams,
  ): Promise<WhaleKolTradesResponse> {
    this.validatePublicKey(tokenMint, 'tokenMint');
    if (params?.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 500) {
        throw new ValidationError('limit must be an integer between 1 and 500');
      }
    }
    if (params?.minVolume !== undefined) {
      const allowed = [0, 1000, 2500, 5000, 10000];
      if (!allowed.includes(params.minVolume)) {
        throw new ValidationError(`minVolume must be one of: ${allowed.join(', ')}`);
      }
    }
    const qs = params ? this.buildQueryString(params) : '';
    return this.request<WhaleKolTradesResponse>(`/trades/kols/${tokenMint}${qs}`);
  }
}