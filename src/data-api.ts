import {
  TokenDetailResponse,
  MultiTokensResponse,
  TokenHoldersResponse,
  TopHolder,
  AthPrice,
  BundlersResponse,
  DeployerTokensResponse,
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
  PaginatedTokenHoldersResponse
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
  body: any;
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

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof DataApiError) {
        throw error;
      }
      // For network errors or other unexpected errors
      throw new DataApiError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
  async getTokenHolders(tokenAddress: string): Promise<TokenHoldersResponse> {
    this.validatePublicKey(tokenAddress, 'tokenAddress');
    return this.request<TokenHoldersResponse>(`/tokens/${tokenAddress}/holders`);
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
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 250, max: 500)
   * @returns List of tokens created by the deployer
   */
  async getTokensByDeployer(
    wallet: string,
    page?: number,
    limit?: number
  ): Promise<DeployerTokensResponse> {
    this.validatePublicKey(wallet, 'wallet');

    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<DeployerTokensResponse>(`/deployer/${wallet}${query}`);
  }

  /**
   * Search for tokens with flexible filtering options
   * @param params Search parameters and filters
   * @returns Search results
   */
  async searchTokens(params: SearchParams): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    }
    return this.request<SearchResponse>(`/search?${queryParams}`);
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
}