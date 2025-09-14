# Solana Tracker - Data API SDK

Official JavaScript/TypeScript client for the [Solana Tracker Data API](https://www.solanatracker.io/data-api).

[![npm version](https://badge.fury.io/js/@solana-tracker%2Fdata-api.svg)](https://badge.fury.io/js/@solana-tracker%2Fdata-api)

## Features

- Full TypeScript support with detailed interfaces for all API responses
- Comprehensive coverage of all Solana Tracker Data API endpoints
- Real-time data streaming via WebSocket (Datastream)
- Built-in error handling with specific error types
- Compatible with both Node.js and browser environments
- **NEW**: (Global Fees) Platform and network fees tracking via WebSocket and API
- **NEW**: Developer/creator holdings tracking via WebSocket
- **NEW**: Top 10 holders monitoring with real-time percentage updates
- Live stats subscriptions for tokens and pools
- Primary pool subscriptions for token updates
- Wallet balance subscription API
- Snipers and insiders tracking via WebSocket
- Support for all pool types including launchpad and meteora curve pools (Shows which platform token is released on, Moonshot, Bonk, Jupiter Studio etc)

## Installation

Install the package using npm:

```bash
npm install @solana-tracker/data-api
```

Or with yarn:

```bash
yarn add @solana-tracker/data-api
```

## Quick Start

```typescript
import { Client } from '@solana-tracker/data-api';

// Initialize the client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY',
});

// Fetch token information
const fetchTokenInfo = async () => {
  try {
    const tokenInfo = await client.getTokenInfo(
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
    );
    console.log('Token info:', tokenInfo);
  } catch (error) {
    console.error('Error:', error);
  }
};

fetchTokenInfo();
```

## Real-Time Data Streaming (Premium plan or higher only)

The library includes a `Datastream` class for real-time data updates with an improved, intuitive API:

```typescript
import { Datastream } from '@solana-tracker/data-api';

// Initialize the Datastream with your API key
const dataStream = new Datastream({
  wsUrl: 'YOUR_WS_URL',
});

// Connect to the WebSocket server
dataStream.connect();

// Handle connection events
dataStream.on('connected', () => console.log('Connected to datastream'));
dataStream.on('disconnected', () =>
  console.log('Disconnected from datastream')
);
dataStream.on('error', (error) => console.error('Datastream error:', error));

// Example 1: Subscribe to latest tokens with chained listener
dataStream.subscribe.latest().on((tokenData) => {
  console.log('New token created:', tokenData.token.name);
});

// Example 2: Track a specific token's price with type-safe data
const tokenAddress = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'; // TRUMP token
dataStream.subscribe.price.token(tokenAddress).on((priceData) => {
  console.log(`New price: $${priceData.price}`);
  console.log(`Time: ${new Date(priceData.time).toLocaleTimeString()}`);
});

// Example 3: Subscribe to token transactions with stored subscription reference
const txSubscription = dataStream.subscribe.tx
  .token(tokenAddress)
  .on((transaction) => {
    console.log(`Transaction type: ${transaction.type}`);
    console.log(`Amount: ${transaction.amount}`);
    console.log(`Price: $${transaction.priceUsd}`);
  });

// Later, unsubscribe from transactions
txSubscription.unsubscribe();

// Example 4: Monitor holder count for a token
dataStream.subscribe.holders(tokenAddress).on((holderData) => {
  console.log(`Total holders: ${holderData.total}`);
});

// Example 5: Watch for wallet transactions
const walletAddress = 'YourWalletAddressHere';
dataStream.subscribe.tx.wallet(walletAddress).on((walletTx) => {
  console.log(`${walletTx.type === 'buy' ? 'Bought' : 'Sold'} token`);
  console.log(`Volume: ${walletTx.volume} USD`);
});

// Example 6: Subscribe to curve percentage updates
dataStream.subscribe.curvePercentage('pumpfun', 30).on((data) => {
  console.log(`Token ${data.token.symbol} reached 30% on Pump.fun`);
  console.log(`Market cap: ${data.pools[0].marketCap.usd}`);
});

// Different markets and percentages
dataStream.subscribe.curvePercentage('meteora-curve', 75).on((data) => {
  console.log(`Meteora token at 75%: ${data.token.name}`);
});

// Example 7: NEW - Monitor snipers for a token
dataStream.subscribe.snipers(tokenAddress).on((sniperUpdate) => {
  console.log(`Sniper wallet: ${sniperUpdate.wallet}`);
  console.log(`Token amount: ${sniperUpdate.tokenAmount.toLocaleString()}`);
  console.log(`Percentage: ${sniperUpdate.percentage.toFixed(2)}%`);
  console.log(
    `Total snipers hold: ${sniperUpdate.totalSniperPercentage.toFixed(2)}%`
  );
});

// Example 8: NEW - Monitor insiders for a token
dataStream.subscribe.insiders(tokenAddress).on((insiderUpdate) => {
  console.log(`Insider wallet: ${insiderUpdate.wallet}`);
  console.log(`Token amount: ${insiderUpdate.tokenAmount.toLocaleString()}`);
  console.log(`Percentage: ${insiderUpdate.percentage.toFixed(2)}%`);
  console.log(
    `Total insiders hold: ${insiderUpdate.totalInsiderPercentage.toFixed(2)}%`
  );
});

// Example 9: NEW - Monitor wallet balance changes (new API location)
const walletAddress = 'YourWalletAddressHere';

// Watch all token balance changes for a wallet
dataStream.subscribe
  .wallet(walletAddress)
  .balance()
  .on((balanceUpdate) => {
    console.log(`Balance update for wallet ${balanceUpdate.wallet}`);
    console.log(`Token: ${balanceUpdate.token}`);
    console.log(`New balance: ${balanceUpdate.amount}`);
  });

// Watch specific token balance for a wallet
dataStream.subscribe
  .wallet(walletAddress)
  .tokenBalance('tokenMint')
  .on((balanceUpdate) => {
    console.log(`Token balance changed to: ${balanceUpdate.amount}`);
  });

// Example 10: NEW - Subscribe to primary pool updates for a token
dataStream.subscribe
  .token(tokenAddress)
  .primary()
  .on((poolUpdate) => {
    console.log('Primary pool update:');
    console.log(`Price: $${poolUpdate.price.usd}`);
    console.log(`Liquidity: $${poolUpdate.liquidity.usd}`);
    console.log(`Market Cap: $${poolUpdate.marketCap.usd}`);
  });

// Can also subscribe to all pools (default behavior)
dataStream.subscribe
  .token(tokenAddress)
  .all()
  .on((poolUpdate) => {
    console.log(`Pool ${poolUpdate.poolId} updated`);
  });

// Example 11: NEW - Subscribe to live stats for tokens and pools
// Get real-time statistics across all timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h)
dataStream.subscribe.stats.token(tokenAddress).on((stats) => {
  console.log('Live token stats update:');

  // Access specific timeframe stats
  if (stats['24h']) {
    console.log('24h Stats:');
    console.log(`  Volume: $${stats['24h'].volume.total.toLocaleString()}`);
    console.log(`  Buys: ${stats['24h'].buys}, Sells: ${stats['24h'].sells}`);
    console.log(`  Unique wallets: ${stats['24h'].wallets}`);
    console.log(
      `  Price change: ${stats['24h'].priceChangePercentage.toFixed(2)}%`
    );
  }

  if (stats['1h']) {
    console.log('1h Stats:');
    console.log(
      `  Buyers: ${stats['1h'].buyers}, Sellers: ${stats['1h'].sellers}`
    );
    console.log(`  Buy volume: $${stats['1h'].volume.buys.toLocaleString()}`);
    console.log(`  Sell volume: $${stats['1h'].volume.sells.toLocaleString()}`);
  }

  // Iterate through all available timeframes
  Object.entries(stats).forEach(([timeframe, data]) => {
    console.log(
      `${timeframe}: ${data.transactions} txns, ${data.wallets} wallets`
    );
  });
});

// Subscribe to live stats for a specific pool
dataStream.subscribe.stats.pool('poolId').on((stats) => {
  console.log('Pool stats update:');

  if (stats['5m']) {
    console.log('Last 5 minutes:');
    console.log(`  Transactions: ${stats['5m'].transactions}`);
    console.log(`  Volume: $${stats['5m'].volume.total.toLocaleString()}`);
    console.log(`  Price: $${stats['5m'].price}`);
  }
});

// Example 12: NEW - Monitor developer/creator holdings for a token
dataStream.subscribe
  .token(tokenAddress)
  .dev.holding()
  .on((devUpdate) => {
    console.log(`Developer ${devUpdate.creator} holdings update:`);
    console.log(`  Amount: ${devUpdate.amount}`);
    console.log(`  Percentage: ${devUpdate.percentage.toFixed(4)}%`);
    console.log(`  Previous: ${devUpdate.previousPercentage.toFixed(4)}%`);
    const change = devUpdate.percentage - devUpdate.previousPercentage;
    console.log(`  Change: ${change > 0 ? '+' : ''}${change.toFixed(4)}%`);
  });

// Example 13: NEW - Monitor top 10 holders for a token
dataStream.subscribe
  .token(tokenAddress)
  .top10()
  .on((top10Update) => {
    console.log(
      `Top 10 holders control ${top10Update.totalPercentage.toFixed(2)}% of supply`
    );

    if (top10Update.previousPercentage !== null) {
      const change =
        top10Update.totalPercentage - top10Update.previousPercentage;
      console.log(
        `Change from previous: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`
      );
    }

    console.log('Top 10 holders:');
    top10Update.holders.forEach((holder, index) => {
      console.log(
        `  #${index + 1}: ${holder.address.slice(0, 8)}... - ${holder.percentage.toFixed(2)}%`
      );
    });
  });

// Example 14: NEW - Monitor platform and network fees for a token
dataStream.subscribe
  .token(tokenAddress)
  .fees()
  .on((feesUpdate) => {
    console.log(
      `Total fees accumulated: ${feesUpdate.fees.total.toFixed(6)} SOL`
    );
    console.log(
      `MEV/Priority tips: ${feesUpdate.fees.totalTips.toFixed(6)} SOL`
    );

    console.log('Transaction tx', feesUpdate.tx);

    // Individual platforms (not all will be present)
    if (feesUpdate.fees.photon !== undefined) {
      console.log(`Photon fees: ${feesUpdate.fees.photon.toFixed(6)} SOL`);
    }
    if (feesUpdate.fees.axiom !== undefined) {
      console.log(`Axiom fees: ${feesUpdate.fees.axiom.toFixed(6)} SOL`);
    }
    if (feesUpdate.fees.bullx !== undefined) {
      console.log(`BullX fees: ${feesUpdate.fees.bullx.toFixed(6)} SOL`);
    }
    if (feesUpdate.fees.jito !== undefined) {
      console.log(`Jito tips: ${feesUpdate.fees.fees.jito.toFixed(6)} SOL`);
    }
    if (feesUpdate.fees.network !== undefined) {
      console.log(`Network fees: ${feesUpdate.fees.network.toFixed(6)} SOL`);
    }
  });
```

Available subscription methods:

```typescript
// Token and pool updates
dataStream.subscribe.latest(); // Latest tokens and pools
dataStream.subscribe.token(tokenAddress); // Token changes (all pools - default)
dataStream.subscribe.token(tokenAddress).all(); // Token changes (all pools - explicit)
dataStream.subscribe.token(tokenAddress).primary(); // Token changes (primary pool only) - NEW
// Developer and Top Holders tracking
dataStream.subscribe.token(tokenAddress).dev.holding(); // Developer holdings updates
dataStream.subscribe.token(tokenAddress).top10(); // Top 10 holders updates
dataStream.subscribe.token(tokenAddress).fees(); 
dataStream.subscribe.pool(poolId); // Pool changes

// Price updates
dataStream.subscribe.price.token(tokenAddress); // Token price (main pool)
dataStream.subscribe.price.allPoolsForToken(tokenAddress); // All price updates for a token
dataStream.subscribe.price.pool(poolId); // Pool price

// Transactions
dataStream.subscribe.tx.token(tokenAddress); // Token transactions
dataStream.subscribe.tx.pool(tokenAddress, poolId); // Pool transactions
dataStream.subscribe.tx.wallet(walletAddress); // Wallet transactions

// Wallet balance updates (NEW location)
dataStream.subscribe.wallet(walletAddress).balance(); // All token balance changes
dataStream.subscribe.wallet(walletAddress).tokenBalance(tokenAddress); // Specific token balance

// Live statistics (NEW)
dataStream.subscribe.stats.token(tokenAddress); // Live stats for a token
dataStream.subscribe.stats.pool(poolId); // Live stats for a pool

// Pump.fun stages
dataStream.subscribe.graduating(); // Graduating tokens
dataStream.subscribe.graduated(); // Graduated tokens

// Metadata and holders
dataStream.subscribe.metadata(tokenAddress); // Token metadata
dataStream.subscribe.holders(tokenAddress); // Holder updates

// Curve percentage updates
dataStream.subscribe.curvePercentage(market, percentage); // Market options: 'launchpad', 'pumpfun', 'boop', 'meteora-curve'

// Snipers and Insiders tracking
dataStream.subscribe.snipers(tokenAddress); // Track sniper wallets
dataStream.subscribe.insiders(tokenAddress); // Track insider wallets
```

Each subscription method returns a response object with:

- `room`: The subscription channel name
- `on()`: Method to attach a listener with proper TypeScript types
  - Returns an object with `unsubscribe()` method for easy cleanup

### Migration Guide for Balance Updates

The wallet balance subscriptions have been moved to a more intuitive location:

```typescript
// OLD (deprecated - will show warning)
dataStream.subscribe.tx.wallet(walletAddress).balance().on(callback);
dataStream.subscribe.tx
  .wallet(walletAddress)
  .tokenBalance(tokenAddress)
  .on(callback);

// NEW (recommended)
dataStream.subscribe.wallet(walletAddress).balance().on(callback);
dataStream.subscribe
  .wallet(walletAddress)
  .tokenBalance(tokenAddress)
  .on(callback);

// Note: Wallet transactions remain under .tx namespace
dataStream.subscribe.tx.wallet(walletAddress).on(callback); // Still the correct way for transactions
```

## WebSocket Data Stream

The `Datastream` class provides real-time access to Solana Tracker data:

### Events

The Datastream extends the standard EventEmitter interface, allowing you to listen for various events:

```typescript
// Connection events
dataStream.on('connected', () => console.log('Connected to WebSocket server'));
dataStream.on('disconnected', (socketType) =>
  console.log(`Disconnected: ${socketType}`)
);
dataStream.on('reconnecting', (attempt) =>
  console.log(`Reconnecting: attempt ${attempt}`)
);
dataStream.on('error', (error) => console.error('Error:', error));

// Data events - Standard approach
dataStream.on('latest', (data) => console.log('New token:', data));
dataStream.on(`price-by-token:${tokenAddress}`, (data) =>
  console.log('Price update:', data)
);
dataStream.on(`transaction:${tokenAddress}`, (data) =>
  console.log('New transaction:', data)
);
dataStream.on(`token:${tokenAddress}`, (data) =>
  console.log('Token update (all pools):', data)
);
dataStream.on(`token:${tokenAddress}:primary`, (data) =>
  console.log('Token update (primary pool):', data)
); // NEW
dataStream.on(`sniper:${tokenAddress}`, (data) =>
  console.log('Sniper update:', data)
);
dataStream.on(`insider:${tokenAddress}`, (data) =>
  console.log('Insider update:', data)
);
dataStream.on(`stats:token:${tokenAddress}`, (data) =>
  console.log('Token stats:', data)
); // NEW
dataStream.on(`stats:pool:${poolId}`, (data) =>
  console.log('Pool stats:', data)
); // NEW

// Developer and top holders events
dataStream.on(`dev_holding:${tokenAddress}`, (data) =>
  console.log('Dev holding update:', data)
);
dataStream.on(`top10:${tokenAddress}`, (data) =>
  console.log('Top 10 holders update:', data)
);
dataStream.on(`fees:${tokenAddress}`, (data) => console.log('Fees update:', data));

// New approach - Chain .on() directly to subscription
dataStream.subscribe.latest().on((data) => console.log('New token:', data));
dataStream.subscribe.price
  .token(tokenAddress)
  .on((data) => console.log('Price update:', data));
dataStream.subscribe.tx
  .token(tokenAddress)
  .on((data) => console.log('Transaction:', data));
dataStream.subscribe
  .snipers(tokenAddress)
  .on((data) => console.log('Sniper:', data));
dataStream.subscribe
  .insiders(tokenAddress)
  .on((data) => console.log('Insider:', data));
dataStream.subscribe.stats
  .token(tokenAddress)
  .on((data) => console.log('Stats:', data)); // NEW
dataStream.subscribe.stats
  .pool(poolId)
  .on((data) => console.log('Pool stats:', data)); // NEW
```

## API Documentation

The library provides methods for all endpoints in the Solana Tracker Data API.

### Token Endpoints

```typescript
// Get token information
const tokenInfo = await client.getTokenInfo('tokenAddress');

// Get token by pool address
const tokenByPool = await client.getTokenByPool('poolAddress');

// Get token holders
const tokenHolders = await client.getTokenHolders('tokenAddress');

// Get top token holders
const topHolders = await client.getTopHolders('tokenAddress');

// Get all-time high price for a token
const athPrice = await client.getAthPrice('tokenAddress');

// Get tokens by deployer wallet
const deployerTokens = await client.getTokensByDeployer('walletAddress');

// Search for tokens
const searchResults = await client.searchTokens({
  query: 'SOL',
  minLiquidity: 100000,
  sortBy: 'marketCapUsd',
  sortOrder: 'desc',
});

// Get latest tokens
const latestTokens = await client.getLatestTokens(100);

// Get information about multiple tokens (UPDATED: Now returns MultiTokensResponse)
const multipleTokens = await client.getMultipleTokens([
  'So11111111111111111111111111111111111111112',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
]);
// Access tokens like: multipleTokens.tokens['tokenAddress']

// Get trending tokens
const trendingTokens = await client.getTrendingTokens('1h');

// Get tokens by volume
const volumeTokens = await client.getTokensByVolume('24h');

// Get token overview (latest, graduating, graduated)
const tokenOverview = await client.getTokenOverview();

// Get graduated tokens
const graduatedTokens = await client.getGraduatedTokens();
```

### Price Endpoints

```typescript
// Get token price
const tokenPrice = await client.getPrice('tokenAddress', true); // Include price changes

// Get historic price information
const priceHistory = await client.getPriceHistory('tokenAddress');

// Get price at a specific timestamp
const timestampPrice = await client.getPriceAtTimestamp(
  'tokenAddress',
  1690000000
);

// Get price range (lowest/highest in time range)
const priceRange = await client.getPriceRange(
  'tokenAddress',
  1690000000,
  1695000000
);

// Get price using POST method
const postedPrice = await client.postPrice('tokenAddress');

// Get multiple token prices
const multiplePrices = await client.getMultiplePrices([
  'So11111111111111111111111111111111111111112',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
]);

// Get multiple token prices using POST
const postedMultiplePrices = await client.postMultiplePrices([
  'So11111111111111111111111111111111111111112',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
]);
```

### Wallet Endpoints

```typescript
// Get basic wallet information
const walletBasic = await client.getWalletBasic('walletAddress');

// Get all tokens in a wallet
const wallet = await client.getWallet('walletAddress');

// Get wallet tokens with pagination
const walletPage = await client.getWalletPage('walletAddress', 2);

// Get wallet portfolio chart data with historical values and PnL
const walletChart = await client.getWalletChart('walletAddress');
console.log('24h PnL:', walletChart.pnl['24h']);
console.log('30d PnL:', walletChart.pnl['30d']);
console.log('Chart data points:', walletChart.chartData.length);

// Get wallet trades
const walletTrades = await client.getWalletTrades(
  'walletAddress',
  undefined,
  true,
  true,
  false
);
```

### Trade Endpoints

```typescript
// Get trades for a token
const tokenTrades = await client.getTokenTrades('tokenAddress');

// Get trades for a specific token and pool
const poolTrades = await client.getPoolTrades('tokenAddress', 'poolAddress');

// Get trades for a specific token, pool, and wallet
const userPoolTrades = await client.getUserPoolTrades(
  'tokenAddress',
  'poolAddress',
  'walletAddress'
);

// Get trades for a specific token and wallet
const userTokenTrades = await client.getUserTokenTrades(
  'tokenAddress',
  'walletAddress'
);
```

### Chart Endpoints

```typescript
// Get OHLCV data for a token - NEW: Now supports object syntax
// Method 1: Object syntax (recommended for multiple parameters)
const chartData = await client.getChartData({
  tokenAddress: 'tokenAddress',
  type: '1h',
  timeFrom: 1690000000,
  timeTo: 1695000000,
  marketCap: false,
  removeOutliers: true,
  dynamicPools: true, // NEW: Dynamic pool selection
  timezone: 'current', // NEW: Use current timezone or specify like 'America/New_York'
  fastCache: true, // NEW: Enable fast cache for better performance
});

// Method 2: Traditional syntax (still supported)
const chartData = await client.getChartData(
  'tokenAddress',
  '1h',
  1690000000,
  1695000000,
  false, // marketCap
  true, // removeOutliers
  true, // dynamicPools
  'current', // timezone
  true // fastCache
);

// Get OHLCV data for a specific token and pool
const poolChartData = await client.getPoolChartData({
  tokenAddress: 'tokenAddress',
  poolAddress: 'poolAddress',
  type: '15m',
  timezone: 'UTC',
  fastCache: false,
});

// Get holder count chart data
const holdersChart = await client.getHoldersChart('tokenAddress', '1d');
```

### PnL Endpoints

```typescript
// Get PnL data for all positions of a wallet
const walletPnL = await client.getWalletPnL('walletAddress', true, true, false);

// Get the first 100 buyers of a token with PnL data
const firstBuyers = await client.getFirstBuyers('tokenAddress');

// Get PnL data for a specific token in a wallet - NEW: holdingCheck parameter
const tokenPnL = await client.getTokenPnL(
  'walletAddress',
  'tokenAddress',
  true
);

// Can also use object syntax
const tokenPnL = await client.getTokenPnL({
  wallet: 'walletAddress',
  tokenAddress: 'tokenAddress',
  holdingCheck: true,
});
```

### Top Traders Endpoints

```typescript
// Get the most profitable traders across all tokens
const topTraders = await client.getTopTraders(1, true, 'total');

// Get top 100 traders by PnL for a token
const tokenTopTraders = await client.getTokenTopTraders('tokenAddress');
```

### Events Endpoints (Live Data)

```typescript
// Get raw event data for live processing
// NOTE: For non-live statistics, use getTokenStats() instead which is more efficient
const events = await client.getEvents('tokenAddress');
console.log('Total events:', events.length);

// Get events for a specific pool
const poolEvents = await client.getPoolEvents('tokenAddress', 'poolAddress');

// Process events into statistics using the processEvents utility
import { processEventsAsync } from '@solana-tracker/data-api';

const stats = await processEvents(events);
console.log('1h stats:', stats['1h']);
console.log('24h volume:', stats['24h']?.volume.total);
```

### Additional Endpoints

```typescript
// Get detailed stats for a token
const tokenStats = await client.getTokenStats('tokenAddress');

// Get detailed stats for a specific token and pool
const poolStats = await client.getPoolStats('tokenAddress', 'poolAddress');

// Get remaining API credits
const credits = await client.getCredits();
console.log('Remaining credits:', credits.credits);

// NEW: Get subscription information
const subscription = await client.getSubscription();
console.log('Plan:', subscription.plan);
console.log('Credits:', subscription.credits);
console.log('Status:', subscription.status);
console.log('Next billing date:', subscription.next_billing_date);
```

## Error Handling

The library includes specific error types for robust error handling with enhanced error details:

```typescript
import {
  Client,
  DataApiError,
  RateLimitError,
  ValidationError,
} from '@solana-tracker/data-api';

try {
  const tokenInfo = await client.getTokenInfo('invalid-address');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(
      'Rate limit exceeded. Retry after:',
      error.retryAfter,
      'seconds'
    );
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof DataApiError) {
    console.error('API error:', error.message, 'Status:', error.status);

    // NEW: Access detailed error information
    if (error.details) {
      console.error('Error details:', error.details);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## What's New

### Version Updates

#### New Features:

1. **Live Stats Subscriptions**: Subscribe to real-time statistics for tokens and pools across all timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h) using `.stats.token()` and `.stats.pool()` methods
2. **Primary Pool Subscriptions**: Subscribe to only the primary pool for a token using `.primary()` method
3. **Developer Holdings Tracking**: Monitor developer/creator wallet holdings in real-time with `.dev.holding()` method
4. **Top 10 Holders Monitoring**: Track the top 10 holders and their combined percentage of token supply with `.top10()` method

#### Type Updates:

```typescript
// NEW: Developer holding update structure
interface DevHoldingUpdate {
  token: string;
  creator: string;
  amount: string;
  percentage: number;
  previousPercentage: number;
  timestamp: number;
}

// NEW: Top holder information
interface TopHolder {
  address: string;
  amount: string;
  percentage: number;
}

// NEW: Top 10 holders update structure
interface Top10HoldersUpdate {
  token: string;
  holders: TopHolder[];
  totalPercentage: number;
  previousPercentage: number | null;
  timestamp: number;
}
```

## WebSocket Data Stream Events

The Datastream extends the standard EventEmitter interface, allowing you to listen for various events:

```typescript
// Connection events
dataStream.on('connected', () => console.log('Connected to WebSocket server'));
dataStream.on('disconnected', (socketType) =>
  console.log(`Disconnected: ${socketType}`)
);
dataStream.on('reconnecting', (attempt) =>
  console.log(`Reconnecting: attempt ${attempt}`)
);
dataStream.on('error', (error) => console.error('Error:', error));

// Data events
dataStream.on('latest', (data) => console.log('New token:', data));
dataStream.on(`price-by-token:${tokenAddress}`, (data) =>
  console.log('Price update:', data)
);
dataStream.on(`price:${tokenAddress}`, (data) =>
  console.log('Price update:', data)
);
dataStream.on(`price:${poolAddress}`, (data) =>
  console.log('Price update:', data)
);
dataStream.on(`transaction:${tokenAddress}`, (data) =>
  console.log('New transaction:', data)
);
dataStream.on(`wallet:${walletAddress}`, (data) =>
  console.log('Wallet transaction:', data)
);
dataStream.on(`wallet:${walletAddress}:balance`, (data) =>
  console.log('Wallet balance update:', data)
);
dataStream.on(`wallet:${walletAddress}:${tokenAddress}:balance`, (data) =>
  console.log('Token balance update:', data)
);
dataStream.on('graduating', (data) => console.log('Graduating token:', data));
dataStream.on('graduated', (data) => console.log('Graduated token:', data));
dataStream.on(`metadata:${tokenAddress}`, (data) =>
  console.log('Metadata update:', data)
);
dataStream.on(`holders:${tokenAddress}`, (data) =>
  console.log('Holders update:', data)
);
dataStream.on(`token:${tokenAddress}`, (data) =>
  console.log('Token update (all pools):', data)
);
dataStream.on(`token:${tokenAddress}:primary`, (data) =>
  console.log('Token update (primary pool):', data)
); // NEW
dataStream.on(`pool:${poolId}`, (data) => console.log('Pool update:', data));
dataStream.on(`sniper:${tokenAddress}`, (data) =>
  console.log('Sniper update:', data)
);
dataStream.on(`insider:${tokenAddress}`, (data) =>
  console.log('Insider update:', data)
);
dataStream.on(`stats:token:${tokenAddress}`, (data) =>
  console.log('Token stats:', data)
); // NEW
dataStream.on(`stats:pool:${poolId}`, (data) =>
  console.log('Pool stats:', data)
); // NEW
```

### Connection Management

```typescript
// Connect to the WebSocket server
await dataStream.connect();

// Check connection status
const isConnected = dataStream.isConnected();

// Disconnect
dataStream.disconnect();
```

## Subscription Plans

Solana Tracker offers a range of subscription plans with varying rate limits:

| Plan            | Price       | Requests/Month | Rate Limit |
| --------------- | ----------- | -------------- | ---------- |
| Free            | Free        | 10,000         | 1/second   |
| Advanced        | €50/month   | 200,000        | None       |
| Pro             | €200/month  | 1,000,000      | None       |
| Premium         | €397/month  | 10,000,000     | None       |
| Business        | €599/month  | 25,000,000     | None       |
| Enterprise      | €1499/month | 100,000,000    | None       |
| Enterprise Plus | Custom      | Unlimited      | None       |

Visit [Solana Tracker](https://www.solanatracker.io/account/data-api) to sign up and get your API key.

## WebSocket Access

WebSocket access (via the Datastream) is available for Premium, Business, and Enterprise plans.

## License

This project is licensed under the [MIT License](LICENSE).
