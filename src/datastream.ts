import { EventEmitter } from 'events';
import './websocket-polyfill';
import {
  TokenInfo,
  PoolInfo,
  TokenEvents,
  TokenRisk,
  WalletBalanceUpdate,
  TokenStats
} from './interfaces';

/**
 * Room types for the WebSocket data stream
 */
export enum DatastreamRoom {
  // Token/pool updates
  LATEST = 'latest',
  // Price updates
  PRICE_BY_TOKEN = 'price-by-token',
  PRICE_BY_POOL = 'price',
  // Transactions
  TOKEN_TRANSACTIONS = 'transaction',
  // Wallet transactions
  WALLET_TRANSACTIONS = 'wallet',
  // Pump.fun stages
  GRADUATING = 'graduating',
  GRADUATED = 'graduated',
  CURVE_PERCENTAGE = 'curve',
  // Metadata and holders
  METADATA = 'metadata',
  HOLDERS = 'holders',
  // Token changes
  TOKEN_CHANGES = 'token',
  POOL_CHANGES = 'pool',
  // Snipers and insiders
  SNIPERS = 'sniper',
  INSIDERS = 'insider',
}

/**
 * Configuration for the Datastream client
 */
export interface DatastreamConfig {
  /**
   * WebSocket URL for the data stream found on your Dashboard.
   */
  wsUrl: string;
  /**
   * Whether to automatically reconnect on disconnect
   * @default true
   */
  autoReconnect?: boolean;
  /**
   * Initial reconnect delay in milliseconds
   * @default 2500
   */
  reconnectDelay?: number;
  /**
   * Maximum reconnect delay in milliseconds
   * @default 4500
   */
  reconnectDelayMax?: number;
  /**
   * Randomization factor for reconnect delay
   * @default 0.5
   */
  randomizationFactor?: number;
  /**
   * Whether to run WebSocket connections in a Web Worker
   * @default false
   */
  useWorker?: boolean;
  /**
   * Custom worker script URL (optional)
   * If not provided, will use inline worker
   */
  workerUrl?: string;
}

interface SubscribeResponse<T = any> {
  room: string;
  /**
   * Register a listener for this subscription
   * @param callback Function to handle incoming data
   * @returns Object with unsubscribe method
   */
  on(callback: (data: T) => void): {
    unsubscribe: () => void;
  };
}

/**
 * Message types for worker communication
 */
interface WorkerMessage {
  type: 'connect' | 'disconnect' | 'subscribe' | 'unsubscribe' | 'send';
  data?: any;
}

interface WorkerResponse {
  type: 'connected' | 'disconnected' | 'message' | 'error' | 'reconnecting';
  data?: any;
  socketType?: string;
}

/**
 * Token subscription methods interface
 */
export interface TokenSubscriptionMethods {
  /**
   * Subscribe to all pool updates for this token (default)
   */
  on(callback: (data: PoolUpdate) => void): {
    unsubscribe: () => void;
  };
  room: string;
  /**
   * Subscribe to all pool updates for this token
   */
  all(): SubscribeResponse<PoolUpdate>;
  /**
   * Subscribe to primary pool updates for this token
   */
  primary(): SubscribeResponse<PoolUpdate>;
}

/**
 * Wallet balance subscription methods interface
 */
export interface WalletBalanceSubscriptionMethods {
  /**
   * Subscribe to all balance updates for the wallet
   */
  balance(): SubscribeResponse<WalletBalanceUpdate>;
  /**
   * Subscribe to specific token balance updates for the wallet
   */
  tokenBalance(tokenAddress: string): SubscribeResponse<WalletBalanceUpdate>;
}

/**
 * Subscription methods for the Datastream client
 */
class SubscriptionMethods {
  private ds: Datastream;
  public price: PriceSubscriptions;
  public tx: TransactionSubscriptions;
  public stats: StatsSubscriptions;

  constructor(datastream: Datastream) {
    this.ds = datastream;
    this.price = new PriceSubscriptions(datastream);
    this.tx = new TransactionSubscriptions(datastream);
    this.stats = new StatsSubscriptions(datastream);
  }

  /**
   * Subscribe to latest tokens and pools
   */
  latest(): SubscribeResponse<TokenDetailWebsocket> {
    return this.ds._subscribe<TokenDetailWebsocket>('latest');
  }

  /**
   * Subscribe to graduating tokens
   * @param marketCapThresholdSOL Optional market cap threshold in SOL
   */
  graduating(
    marketCapThresholdSOL?: number
  ): SubscribeResponse<TokenDetailWebsocket> {
    const room = marketCapThresholdSOL
      ? `graduating:sol:${marketCapThresholdSOL}`
      : 'graduating';
    return this.ds._subscribe<TokenDetailWebsocket>(room);
  }

  /**
   * Subscribe to tokens reaching a specific curve percentage for a market
   * @param market The market type: 'launchpad', 'pumpfun', 'boop', or 'meteora-curve'
   * @param percentage The curve percentage threshold (e.g., 30, 50, 75)
   * @returns Subscription response with curve percentage updates
   */
  curvePercentage(
    market: 'launchpad' | 'pumpfun' | 'boop' | 'meteora-curve',
    percentage: number
  ): SubscribeResponse<CurvePercentageUpdate> {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }

    const room = `${market}:curve:${percentage}`;
    return this.ds._subscribe<CurvePercentageUpdate>(room);
  }

  /**
   * Subscribe to graduated tokens
   */
  graduated(): SubscribeResponse<TokenDetailWebsocket> {
    return this.ds._subscribe<TokenDetailWebsocket>('graduated');
  }

  /**
   * Subscribe to token metadata updates
   * @param tokenAddress The token address
   */
  metadata(tokenAddress: string): SubscribeResponse<TokenMetadata> {
    return this.ds._subscribe<TokenMetadata>(`metadata:${tokenAddress}`);
  }

  /**
   * Subscribe to holder count updates for a token
   * @param tokenAddress The token address
   */
  holders(tokenAddress: string): SubscribeResponse<HolderUpdate> {
    return this.ds._subscribe<HolderUpdate>(`holders:${tokenAddress}`);
  }

  /**
   * Subscribe to token-related events (all pools or primary pool)
   *
   * @example
   * // For all pool updates:
   * datastream.subscribe.token('address').all().on(callback)
   * // Or using shorthand:
   * datastream.subscribe.token('address').on(callback)
   *
   * // For primary pool updates only:
   * datastream.subscribe.token('address').primary().on(callback)
   *
   * @param tokenAddress The token address
   */
  token(tokenAddress: string): TokenSubscriptionMethods {
    const ds = this.ds;

    // Create the base subscription for backward compatibility
    const baseSubscription = ds._subscribe<PoolUpdate>(`token:${tokenAddress}`);

    // Add the new methods to the subscription object
    const enhancedSubscription = {
      ...baseSubscription,

      // Keep the original on method for convenience
      on: (callback: (data: PoolUpdate) => void) => {
        return baseSubscription.on(callback);
      },

      // New methods
      all: () => {
        return ds._subscribe<PoolUpdate>(`token:${tokenAddress}`);
      },

      primary: () => {
        return ds._subscribe<PoolUpdate>(`token:${tokenAddress}:primary`);
      },
    };

    return enhancedSubscription;
  }

  /**
   * Subscribe to pool changes
   * @param poolId The pool address
   */
  pool(poolId: string): SubscribeResponse<PoolUpdate> {
    return this.ds._subscribe<PoolUpdate>(`pool:${poolId}`);
  }

  /**
   * Subscribe to sniper updates for a token
   * @param tokenAddress The token address
   */
  snipers(tokenAddress: string): SubscribeResponse<SniperInsiderUpdate> {
    return this.ds._subscribe<SniperInsiderUpdate>(`sniper:${tokenAddress}`);
  }

  /**
   * Subscribe to insider updates for a token
   * @param tokenAddress The token address
   */
  insiders(tokenAddress: string): SubscribeResponse<SniperInsiderUpdate> {
    return this.ds._subscribe<SniperInsiderUpdate>(`insider:${tokenAddress}`);
  }

  /**
   * Subscribe to wallet balance updates
   * 
   * @example
   * // For all balance updates:
   * datastream.subscribe.wallet('address').balance().on(callback)
   * 
   * // For specific token balance:
   * datastream.subscribe.wallet('address').tokenBalance('token').on(callback)
   * 
   * @param walletAddress The wallet address
   */
  wallet(walletAddress: string): WalletBalanceSubscriptionMethods {
    const ds = this.ds;
    
    return {
      balance: () => {
        return ds._subscribe<WalletBalanceUpdate>(
          `wallet:${walletAddress}:balance`
        );
      },
      
      tokenBalance: (tokenAddress: string) => {
        return ds._subscribe<WalletBalanceUpdate>(
          `wallet:${walletAddress}:${tokenAddress}:balance`
        );
      },
    };
  }
}

/**
 * Stats-related subscription methods
 */
class StatsSubscriptions {
  private ds: Datastream;

  constructor(datastream: Datastream) {
    this.ds = datastream;
  }

  /**
   * Subscribe to live stats updates for a token across all timeframes
   * @param tokenAddress The token address
   * @returns Subscription response with stats updates
   */
  token(tokenAddress: string): SubscribeResponse<TokenStats> {
    return this.ds._subscribe<TokenStats>(`stats:token:${tokenAddress}`);
  }

  /**
   * Subscribe to live stats updates for a specific pool across all timeframes
   * @param poolId The pool address
   * @returns Subscription response with stats updates
   */
  pool(poolId: string): SubscribeResponse<TokenStats> {
    return this.ds._subscribe<TokenStats>(`stats:pool:${poolId}`);
  }
}

/**
 * Price-related subscription methods
 */
class PriceSubscriptions {
  private ds: Datastream;

  constructor(datastream: Datastream) {
    this.ds = datastream;
  }

  /**
   * Subscribe to price updates for a token's primary/largest pool
   * @param tokenAddress The token address
   */
  token(tokenAddress: string): SubscribeResponse<PriceUpdate> {
    return this.ds._subscribe<PriceUpdate>(`price-by-token:${tokenAddress}`);
  }

  /**
   * Subscribe to all price updates for a token across all pools
   * @param tokenAddress The token address
   */
  allPoolsForToken(tokenAddress: string): SubscribeResponse<PriceUpdate> {
    return this.ds._subscribe<PriceUpdate>(`price:${tokenAddress}`);
  }

  /**
   * Subscribe to price updates for a specific pool
   * @param poolId The pool address
   */
  pool(poolId: string): SubscribeResponse<PriceUpdate> {
    return this.ds._subscribe<PriceUpdate>(`price:${poolId}`);
  }
}

/**
 * Wallet transaction subscription methods interface (under .tx namespace)
 */
interface WalletTransactionSubscriptionMethods {
  /**
   * Subscribe to wallet transactions (default)
   */
  on(callback: (data: WalletTransaction) => void): {
    unsubscribe: () => void;
  };
  room: string;
  /**
   * Explicitly subscribe to wallet transactions
   */
  transactions(): SubscribeResponse<WalletTransaction>;
  /**
   * @deprecated Use datastream.subscribe.wallet('address').balance() instead
   * This method will be removed in a future version
   */
  balance(): SubscribeResponse<WalletBalanceUpdate>;
  /**
   * @deprecated Use datastream.subscribe.wallet('address').tokenBalance('token') instead
   * This method will be removed in a future version
   */
  tokenBalance(tokenAddress: string): SubscribeResponse<WalletBalanceUpdate>;
}

/**
 * Transaction-related subscription methods
 */
class TransactionSubscriptions {
  private ds: Datastream;

  constructor(datastream: Datastream) {
    this.ds = datastream;
  }

  /**
   * Subscribe to transactions for a token across all pools
   * @param tokenAddress The token address
   */
  token(tokenAddress: string): SubscribeResponse<TokenTransaction> {
    return this.ds._subscribe<TokenTransaction>(`transaction:${tokenAddress}`);
  }

  /**
   * Subscribe to transactions for a specific token and pool
   * @param tokenAddress The token address
   * @param poolId The pool address
   */
  pool(
    tokenAddress: string,
    poolId: string
  ): SubscribeResponse<TokenTransaction> {
    return this.ds._subscribe<TokenTransaction>(
      `transaction:${tokenAddress}:${poolId}`
    );
  }

  /**
   * Subscribe to wallet transactions
   * 
   * @example
   * // Subscribe to wallet transactions (default):
   * datastream.subscribe.tx.wallet('address').on(callback)
   * 
   * // Subscribe to wallet transactions (explicit):
   * datastream.subscribe.tx.wallet('address').transactions().on(callback)
   * 
   * @param walletAddress The wallet address
   */
  wallet(walletAddress: string): WalletTransactionSubscriptionMethods {
    const ds = this.ds;
    
    // Create the base subscription for transactions
    const baseSubscription = ds._subscribe<WalletTransaction>(`wallet:${walletAddress}`);
    
    return {
      ...baseSubscription,
      
      // Default on method for transactions
      on: (callback: (data: WalletTransaction) => void) => {
        return baseSubscription.on(callback);
      },
      
      // Explicit transactions method (not deprecated)
      transactions: () => {
        return ds._subscribe<WalletTransaction>(`wallet:${walletAddress}`);
      },
      
      // Deprecated balance methods
      balance: () => {
        console.warn(
          'datastream.subscribe.tx.wallet().balance() is deprecated. ' +
          'Please use datastream.subscribe.wallet().balance() instead. ' +
          'This method will be removed in a future version.'
        );
        return ds._subscribe<WalletBalanceUpdate>(
          `wallet:${walletAddress}:balance`
        );
      },
      
      tokenBalance: (tokenAddress: string) => {
        console.warn(
          'datastream.subscribe.tx.wallet().tokenBalance() is deprecated. ' +
          'Please use datastream.subscribe.wallet().tokenBalance() instead. ' +
          'This method will be removed in a future version.'
        );
        return ds._subscribe<WalletBalanceUpdate>(
          `wallet:${walletAddress}:${tokenAddress}:balance`
        );
      },
    };
  }
}

/**
 * WebSocket service for real-time data streaming from Solana Tracker
 */
export class Datastream extends EventEmitter {
  public subscribe: SubscriptionMethods;

  private wsUrl: string;
  private socket: WebSocket | null = null;
  private transactionSocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectDelay: number;
  private reconnectDelayMax: number;
  private randomizationFactor: number;
  private subscribedRooms = new Set<string>();
  private transactions = new Set<string>();
  private autoReconnect: boolean;
  private isConnecting = false;
  private useWorker: boolean;
  private worker: Worker | null = null;
  private workerUrl?: string;

  /**
   * Creates a new Datastream client for real-time Solana Tracker data
   * @param config Configuration options
   */
  constructor(config: DatastreamConfig) {
    super();
    this.wsUrl = config.wsUrl || '';
    this.autoReconnect = config.autoReconnect !== false;
    this.reconnectDelay = config.reconnectDelay || 2500;
    this.reconnectDelayMax = config.reconnectDelayMax || 4500;
    this.randomizationFactor = config.randomizationFactor || 0.5;
    this.useWorker = config.useWorker || false;
    this.workerUrl = config.workerUrl;
    this.subscribe = new SubscriptionMethods(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.disconnect.bind(this));
    }
  }

  /**
   * Connects to the WebSocket server
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<void> {
    if (this.useWorker) {
      return this.connectWithWorker();
    }

    if (this.socket && this.transactionSocket) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      await Promise.all([
        this.createSocket('main'),
        this.createSocket('transaction'),
      ]);

      this.isConnecting = false;
      this.emit('connected');
    } catch (e) {
      this.isConnecting = false;
      this.emit('error', e);

      if (this.autoReconnect) {
        this.reconnect();
      }
    }
  }

  /**
   * Connects using Web Worker
   * @returns Promise that resolves when connected
   */
  private async connectWithWorker(): Promise<void> {
    if (this.worker) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      if (this.workerUrl) {
        this.worker = new Worker(this.workerUrl);
      } else {
        // Create inline worker
        const workerCode = this.getWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(workerUrl);
      }

      this.setupWorkerListeners();

      // Send connect message to worker
      this.worker.postMessage({
        type: 'connect',
        data: {
          wsUrl: this.wsUrl,
          autoReconnect: this.autoReconnect,
          reconnectDelay: this.reconnectDelay,
          reconnectDelayMax: this.reconnectDelayMax,
          randomizationFactor: this.randomizationFactor,
        },
      });

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker connection timeout'));
        }, 10000);

        const handler = (e: MessageEvent<WorkerResponse>) => {
          if (e.data.type === 'connected') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', handler);
            resolve();
          } else if (e.data.type === 'error') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', handler);
            reject(new Error(e.data.data));
          }
        };

        this.worker!.addEventListener('message', handler);
      });

      this.isConnecting = false;
      this.emit('connected');
    } catch (e) {
      this.isConnecting = false;
      this.emit('error', e);

      if (this.autoReconnect) {
        this.reconnect();
      }
    }
  }

  /**
   * Sets up worker event listeners
   */
  private setupWorkerListeners(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, data, socketType } = event.data;

      switch (type) {
        case 'message':
          this.handleWorkerMessage(data);
          break;
        case 'disconnected':
          this.emit('disconnected', socketType || 'all');
          if (socketType === 'all') {
            this.worker = null;
          }
          break;
        case 'error':
          this.emit('error', new Error(data));
          break;
        case 'reconnecting':
          this.emit('reconnecting', data);
          break;
      }
    };

    this.worker.onerror = (error) => {
      this.emit('error', error);
    };
  }

  /**
   * Handles messages from worker
   */
  private handleWorkerMessage(data: any): void {
    const { room, message } = data;

    // Deduplicate transactions
    if (message?.tx && this.transactions.has(message.tx)) {
      return;
    } else if (message?.tx) {
      this.transactions.add(message.tx);
    }

    // Special handling for price events
    if (room.includes('price:')) {
      this.emit(`price-by-token:${message.token}`, message);
    }

    this.emit(room, message);
  }

  /**
   * Gets the worker code as a string
   */
  private getWorkerCode(): string {
    return `
            let mainSocket = null;
            let transactionSocket = null;
            let config = {};
            let reconnectAttempts = 0;
            let subscribedRooms = new Set();
            let transactions = new Set();

            self.addEventListener('message', (event) => {
                const { type, data } = event.data;

                switch (type) {
                    case 'connect':
                        config = data;
                        connect();
                        break;
                    case 'disconnect':
                        disconnect();
                        break;
                    case 'subscribe':
                        subscribe(data.room);
                        break;
                    case 'unsubscribe':
                        unsubscribe(data.room);
                        break;
                    case 'send':
                        send(data.socket, data.message);
                        break;
                }
            });

            async function connect() {
                try {
                    await Promise.all([
                        createSocket('main'),
                        createSocket('transaction')
                    ]);
                    self.postMessage({ type: 'connected' });
                } catch (e) {
                    self.postMessage({ type: 'error', data: e.message });
                    if (config.autoReconnect) {
                        reconnect();
                    }
                }
            }

            function createSocket(type) {
                return new Promise((resolve, reject) => {
                    try {
                        const socket = new WebSocket(config.wsUrl);

                        socket.onopen = () => {
                            if (type === 'main') {
                                mainSocket = socket;
                            } else {
                                transactionSocket = socket;
                            }
                            reconnectAttempts = 0;
                            setupSocketListeners(socket, type);
                            resubscribeToRooms();
                            resolve();
                        };

                        socket.onerror = (error) => {
                            reject(error);
                        };
                    } catch (e) {
                        reject(e);
                    }
                });
            }

            function setupSocketListeners(socket, type) {
                socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'message') {
                            self.postMessage({
                                type: 'message',
                                data: {
                                    room: message.room,
                                    message: message.data
                                }
                            });
                        }
                    } catch (error) {
                        self.postMessage({ type: 'error', data: error.message });
                    }
                };

                socket.onclose = () => {
                    if (type === 'main') {
                        mainSocket = null;
                    } else if (type === 'transaction') {
                        transactionSocket = null;
                    }

                    self.postMessage({ type: 'disconnected', socketType: type });

                    if (config.autoReconnect) {
                        reconnect();
                    }
                };
            }

            function disconnect() {
                if (mainSocket) {
                    mainSocket.close();
                    mainSocket = null;
                }
                if (transactionSocket) {
                    transactionSocket.close();
                    transactionSocket = null;
                }
                subscribedRooms.clear();
                transactions.clear();
                self.postMessage({ type: 'disconnected', socketType: 'all' });
            }

            function reconnect() {
                self.postMessage({ type: 'reconnecting', data: reconnectAttempts });

                const delay = Math.min(
                    config.reconnectDelay * Math.pow(2, reconnectAttempts),
                    config.reconnectDelayMax
                );

                const jitter = delay * config.randomizationFactor;
                const reconnectDelay = delay + Math.random() * jitter;

                setTimeout(() => {
                    reconnectAttempts++;
                    connect();
                }, reconnectDelay);
            }

            function subscribe(room) {
                subscribedRooms.add(room);
                const socket = room.includes('transaction') ? transactionSocket : mainSocket;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'join', room }));
                }
            }

            function unsubscribe(room) {
                subscribedRooms.delete(room);
                const socket = room.includes('transaction') ? transactionSocket : mainSocket;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'leave', room }));
                }
            }

            function send(socketType, message) {
                const socket = socketType === 'transaction' ? transactionSocket : mainSocket;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                }
            }

            function resubscribeToRooms() {
                if (mainSocket && mainSocket.readyState === WebSocket.OPEN &&
                    transactionSocket && transactionSocket.readyState === WebSocket.OPEN) {
                    for (const room of subscribedRooms) {
                        const socket = room.includes('transaction') ? transactionSocket : mainSocket;
                        socket.send(JSON.stringify({ type: 'join', room }));
                    }
                }
            }
        `;
  }

  /**
   * Creates a WebSocket connection
   * @param type Socket type ('main' or 'transaction')
   * @returns Promise that resolves when connected
   */
  private createSocket(type: 'main' | 'transaction'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(this.wsUrl);

        socket.onopen = () => {
          if (type === 'main') {
            this.socket = socket;
          } else {
            this.transactionSocket = socket;
          }

          this.reconnectAttempts = 0;
          this.setupSocketListeners(socket, type);
          this.resubscribeToRooms();
          resolve();
        };

        socket.onerror = (error) => {
          reject(error);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Sets up WebSocket event listeners
   * @param socket The WebSocket connection
   * @param type Socket type ('main' or 'transaction')
   */
  private setupSocketListeners(
    socket: WebSocket,
    type: 'main' | 'transaction'
  ): void {
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          // Deduplicate transactions
          if (message.data?.tx && this.transactions.has(message.data.tx)) {
            return;
          } else if (message.data?.tx) {
            this.transactions.add(message.data.tx);
          }

          // Special handling for price events
          if (message.room.includes('price:')) {
            this.emit(`price-by-token:${message.data.token}`, message.data);
          }

          this.emit(message.room, message.data);
        }
      } catch (error) {
        this.emit('error', new Error(`Error processing message: ${error}`));
      }
    };

    socket.onclose = () => {
      this.emit('disconnected', type);

      if (type === 'main') {
        this.socket = null;
      } else if (type === 'transaction') {
        this.transactionSocket = null;
      }

      if (this.autoReconnect) {
        this.reconnect();
      }
    };
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    if (this.useWorker && this.worker) {
      this.worker.postMessage({ type: 'disconnect' });
      this.worker.terminate();
      this.worker = null;
    } else {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      if (this.transactionSocket) {
        this.transactionSocket.close();
        this.transactionSocket = null;
      }
    }

    this.subscribedRooms.clear();
    this.transactions.clear();
    this.emit('disconnected', 'all');
  }

  /**
   * Handles reconnection to the WebSocket server
   */
  private reconnect(): void {
    if (!this.autoReconnect) return;

    this.emit('reconnecting', this.reconnectAttempts);

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );

    const jitter = delay * this.randomizationFactor;
    const reconnectDelay = delay + Math.random() * jitter;

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }

  /**
   * Subscribes to a data room
   * @param room The room name to join
   * @returns Response with room name and on() method for listening
   * @internal Used by SubscriptionMethods
   */
  _subscribe<T = any>(room: string): SubscribeResponse<T> {
    this.subscribedRooms.add(room);

    if (this.useWorker && this.worker) {
      this.worker.postMessage({ type: 'subscribe', data: { room } });
    } else {
      const socket = room.includes('transaction')
        ? this.transactionSocket
        : this.socket;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'join', room }));
      } else {
        // If not connected, we'll subscribe when connection is established
        this.connect();
      }
    }

    return {
      room,
      on: (callback: (data: T) => void) => {
        // Create a wrapper that handles arrays automatically
        const wrappedCallback = (data: T | T[]) => {
          if (Array.isArray(data)) {
            // If data is an array, call the callback for each item
            data.forEach((item) => callback(item));
          } else {
            // If data is a single item, call the callback directly
            callback(data);
          }
        };

        this.on(room, wrappedCallback as any);

        return {
          unsubscribe: () => {
            this.removeListener(room, wrappedCallback as any);
          },
        };
      },
    };
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public once(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    return super.once(event, listener);
  }

  public off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  public removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    return super.removeListener(event, listener);
  }

  public removeAllListeners(event?: string | symbol): this {
    return super.removeAllListeners(event);
  }

  public listeners(event: string | symbol): Function[] {
    return super.listeners(event);
  }

  /**
   * Unsubscribes from a data room
   * @param room The room name to leave
   * @returns Reference to this instance for chaining
   */
  unsubscribe(room: string): Datastream {
    this.subscribedRooms.delete(room);

    if (this.useWorker && this.worker) {
      this.worker.postMessage({ type: 'unsubscribe', data: { room } });
    } else {
      const socket = room.includes('transaction')
        ? this.transactionSocket
        : this.socket;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'leave', room }));
      }
    }

    return this;
  }

  /**
   * Resubscribes to all previously subscribed rooms after reconnection
   */
  private resubscribeToRooms(): void {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.transactionSocket &&
      this.transactionSocket.readyState === WebSocket.OPEN
    ) {
      for (const room of this.subscribedRooms) {
        const socket = room.includes('transaction')
          ? this.transactionSocket
          : this.socket;

        socket.send(JSON.stringify({ type: 'join', room }));
      }
    }
  }

  /**
   * Get the current connection status
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    if (this.useWorker) {
      return !!this.worker;
    }

    return (
      !!this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      !!this.transactionSocket &&
      this.transactionSocket.readyState === WebSocket.OPEN
    );
  }
}

export interface TokenDetailWebsocket {
  token: TokenInfo;
  pools: PoolInfo[];
  events: TokenEvents;
  risk: TokenRisk;
}

export interface CurvePercentageUpdate {
  token: TokenInfo;
  pools: PoolInfo[];
  events: TokenEvents;
  risk: TokenRisk;
}

// Export types for specific data structures
export interface TokenTransaction {
  tx: string;
  amount: number;
  priceUsd: number;
  volume: number;
  volumeSol?: number;
  type: 'buy' | 'sell';
  wallet: string;
  time: number;
  program: string;
  pools?: string[];
}

export interface PriceUpdate {
  price: number;
  price_quote: number;
  pool: string;
  token: string;
  time: number;
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
  base?: number; // For baseLiquidity
  quote?: number; // For quoteLiquidity
  usd: number;
}

export interface MeteoraCurve {
  baseLiquidity: MeteoraCurveLiquidity;
  quoteLiquidity: MeteoraCurveLiquidity;
  fee: number;
  name?: string; // Optional
  url?: string; // Optional
  logo?: string; // Optional
}

export interface PoolUpdate {
  liquidity: {
    quote: number;
    usd: number;
  };
  price: {
    quote: number;
    usd: number;
  };
  tokenSupply: number;
  lpBurn: number;
  tokenAddress: string;
  marketCap: {
    quote: number;
    usd: number;
  };
  decimals: number;
  security: {
    freezeAuthority: string | null;
    mintAuthority: string | null;
  };
  quoteToken: string;
  market: string;
  deployer?: string;
  lastUpdated: number;
  createdAt?: number;
  poolId: string;
  curvePercentage?: number;
  curve?: string;
  txns?: {
    buys: number;
    total: number;
    volume: number;
    sells: number;
    volume24h: number; // Added the new field
  };
  bundleId?: string;

  // New fields for different market types
  launchpad?: Launchpad; // For raydium-launchpad market
  meteoraCurve?: MeteoraCurve; // For meteora-curve market
}

export interface HolderUpdate {
  total: number;
}

export interface WalletTransaction {
  tx: string;
  amount: number;
  priceUsd: number;
  solVolume: number;
  volume: number;
  type: 'buy' | 'sell';
  wallet: string;
  time: number;
  program: string;
  token?: {
    from: {
      name: string;
      symbol: string;
      image?: string;
      decimals: number;
      amount: number;
      priceUsd?: number;
      address: string;
    };
    to: {
      name: string;
      symbol: string;
      image?: string;
      decimals: number;
      amount: number;
      priceUsd?: number;
      address: string;
    };
  };
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  mint: string;
  uri?: string;
  decimals: number;
  hasFileMetaData?: boolean;
  createdOn?: string;
  description?: string;
  image?: string;
  showName?: boolean;
  twitter?: string;
  telegram?: string;
  website?: string;
  strictSocials?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

export interface SniperInsiderUpdate {
  wallet: string;
  amount: string; // raw_amount from the update
  tokenAmount: number;
  percentage: number;
  previousAmount: number;
  previousPercentage: number;
  totalSniperPercentage: number;
  totalInsiderPercentage: number;
}