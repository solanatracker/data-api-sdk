# Solana Tracker - Data API SDK

Official JavaScript/TypeScript client for the [Solana Tracker Data API](https://www.solanatracker.io/data-api).

[![npm version](https://badge.fury.io/js/@solana-tracker%2Fdata-api.svg)](https://badge.fury.io/js/@solana-tracker%2Fdata-api)

## Features (Summary)

- Full TypeScript support with detailed interfaces for all API responses
- Comprehensive coverage of all Solana Tracker Data API endpoints
- Real-time data streaming via WebSocket (Datastream)
- Built-in error handling with specific error types
- Compatible with both Node.js and browser environments
- Enhanced search with 60+ filter parameters including holder distribution, social media, fees, and more
- Cursor-based pagination for efficient deep searches
- Top performers endpoint - get the best performing tokens launched today
- Token filtering for overview endpoints (Memescope / Pulse overview) (graduated, graduating, latest)
- Paginated token holders endpoint for efficient holder data retrieval (5000 per page limit)
- Aggregated price updates across all pools for a token via WebSocket (min, median, max, average, top pools setc.)
- Smart primary pool routing - automatically switches to new main pool (price-by-token, token:{token}:primary rooms)
- (Global Fees) Platform and network fees tracking via WebSocket and API
- Developer/creator holdings tracking via WebSocket
- Top 10 holders monitoring with real-time percentage updates
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


## What's New

### Version Updates

#### Latest Features:

1. **Top Performers Endpoint**: Get the best performing tokens launched today:
   ```typescript
   const topPerformers = await client.getTopPerformers('1h');
   // Valid timeframes: '5m', '15m', '30m', '1h', '6h', '12h', '24h'
   console.log('Top performers:', topPerformers.map(t => t.token.symbol));
   ```

2. **Enhanced Token Overview with Advanced Filtering**: 
   - Filter latest, graduating, and graduated tokens by liquidity, market cap, risk score, and specific markets
   - Support for spam reduction and holder count filtering
   - Backward compatible with simple limit parameter

2. **Paginated Token Holders**:
   - Efficient pagination through large holder lists
   - Support for up to 5000 holders per request
   - Cursor-based navigation for seamless data retrieval

3. **Aggregated Price Updates (WebSocket)**:
   - Get accurate price data aggregated across all pools
   - Median, average, min, and max prices
   - Top pools by liquidity automatically identified
   - Replaces deprecated `price.token()` method

4. **Smart Primary Pool Routing**:
   - Automatic switching to new primary pools when liquidity migrates
   - Works for both `token:primary` and `price-by-token` subscriptions
   - No code changes needed - happens automatically

5. **Enhanced Search with 60+ Filters**: 
   - Holder distribution filters (top10, dev, insiders, snipers)
   - Social media filters (twitter, telegram, discord, etc.)
   - Fees filters (total fees, trading fees, priority tips)
   - Volume filters across multiple timeframes
   - Token characteristic filters (LP burn, authorities, curve percentage)
   - Cursor-based pagination for efficient deep searches

6. **Live Stats Subscriptions**: Subscribe to real-time statistics for tokens and pools across all timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h) using `.stats.token()` and `.stats.pool()` methods

7. **Developer Holdings Tracking**: Monitor developer/creator wallet holdings in real-time with `.dev.holding()` method

8. **Top 10 Holders Monitoring**: Track the top 10 holders and their combined percentage of token supply with `.top10()` method

9. **Global Fees Tracking**: Monitor platform and network fees via WebSocket and API


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

// Example 2: NEW - Get accurate aggregated price across all pools
const tokenAddress = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'; // TRUMP token
dataStream.subscribe.price.aggregated(tokenAddress).on((priceData) => {
  console.log(`Aggregated price: $${priceData.aggregated.median}`);
  console.log(`Price range: $${priceData.aggregated.min} - $${priceData.aggregated.max}`);
  console.log(`Active pools: ${priceData.aggregated.poolCount}`);
  console.log('Top pools by liquidity:', priceData.topPools);
});

// Example 3: Subscribe to primary pool updates (automatically switches to new main pool)
dataStream.subscribe.token(tokenAddress).primary().on((poolUpdate) => {
  console.log('Primary pool update (automatically switches to new main pool):');
  console.log(`Price: $${poolUpdate.price.usd}`);
  console.log(`Liquidity: $${poolUpdate.liquidity.usd}`);
  console.log(`Pool: ${poolUpdate.poolId}`);
});

// Example 4: Subscribe to token transactions with stored subscription reference
const txSubscription = dataStream.subscribe.tx
  .token(tokenAddress)
  .on((transaction) => {
    console.log(`Transaction type: ${transaction.type}`);
    console.log(`Amount: ${transaction.amount}`);
    console.log(`Price: $${transaction.priceUsd}`);
  });

// Later, unsubscribe from transactions
txSubscription.unsubscribe();

// Example 5: Monitor holder count for a token
dataStream.subscribe.holders(tokenAddress).on((holderData) => {
  console.log(`Total holders: ${holderData.total}`);
});

// Example 6: Watch for wallet transactions
const walletAddress = 'YourWalletAddressHere';
dataStream.subscribe.tx.wallet(walletAddress).on((walletTx) => {
  console.log(`${walletTx.type === 'buy' ? 'Bought' : 'Sold'} token`);
  console.log(`Volume: ${walletTx.volume} USD`);
});

// Example 7: Subscribe to curve percentage updates
dataStream.subscribe.curvePercentage('pumpfun', 30).on((data) => {
  console.log(`Token ${data.token.symbol} reached 30% on Pump.fun`);
  console.log(`Market cap: ${data.pools[0].marketCap.usd}`);
});

// Different markets and percentages
dataStream.subscribe.curvePercentage('meteora-curve', 75).on((data) => {
  console.log(`Meteora token at 75%: ${data.token.name}`);
});

// Example 8: NEW - Monitor snipers for a token
dataStream.subscribe.snipers(tokenAddress).on((sniperUpdate) => {
  console.log(`Sniper wallet: ${sniperUpdate.wallet}`);
  console.log(`Token amount: ${sniperUpdate.tokenAmount.toLocaleString()}`);
  console.log(`Percentage: ${sniperUpdate.percentage.toFixed(2)}%`);
  console.log(
    `Total snipers hold: ${sniperUpdate.totalSniperPercentage.toFixed(2)}%`
  );
});

// Example 9: NEW - Monitor insiders for a token
dataStream.subscribe.insiders(tokenAddress).on((insiderUpdate) => {
  console.log(`Insider wallet: ${insiderUpdate.wallet}`);
  console.log(`Token amount: ${insiderUpdate.tokenAmount.toLocaleString()}`);
  console.log(`Percentage: ${insiderUpdate.percentage.toFixed(2)}%`);
  console.log(
    `Total insiders hold: ${insiderUpdate.totalInsiderPercentage.toFixed(2)}%`
  );
});

// Example 10: NEW - Monitor wallet balance changes (new API location)
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
dataStream.subscribe.token(tokenAddress).primary(); // Token changes (primary pool only - auto-switches to new main pool)
// Developer and Top Holders tracking
dataStream.subscribe.token(tokenAddress).dev.holding(); // Developer holdings updates
dataStream.subscribe.token(tokenAddress).top10(); // Top 10 holders updates
dataStream.subscribe.token(tokenAddress).fees(); 
dataStream.subscribe.pool(poolId); // Pool changes

// Price updates
dataStream.subscribe.price.aggregated(tokenAddress); // NEW: Aggregated price across all pools (RECOMMENDED)
dataStream.subscribe.price.token(tokenAddress); // DEPRECATED: Token price (auto-switches to new main pool)
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

### Smart Primary Pool Routing

The `token:primary` and `price-by-token` subscriptions now automatically switch to the new primary pool when liquidity migrates:

```typescript
// Subscribe to primary pool - automatically switches when main pool changes
dataStream.subscribe.token(tokenAddress).primary().on((poolUpdate) => {
  console.log('Primary pool update (auto-switches to new main pool):');
  console.log(`Pool ID: ${poolUpdate.poolId}`);
  console.log(`Liquidity: $${poolUpdate.liquidity.usd}`);
  // When liquidity moves to a new pool, you'll automatically get updates from the new pool
});

// DEPRECATED: price.token() also auto-switches but use price.aggregated() instead
dataStream.subscribe.price.token(tokenAddress).on((priceData) => {
  console.log('Price from main pool (auto-switches):');
  console.log(`Price: $${priceData.price}`);
  console.log(`Pool: ${priceData.pool}`);
});

// RECOMMENDED: Use aggregated price for accurate data across all pools
dataStream.subscribe.price.aggregated(tokenAddress).on((priceData) => {
  console.log('Aggregated price data:');
  console.log(`Median: $${priceData.aggregated.median}`);
  console.log(`Average: $${priceData.aggregated.average}`);
  console.log(`Range: $${priceData.aggregated.min} - $${priceData.aggregated.max}`);
});
```

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

### Migration Guide for Price Updates

The `price.token()` method is deprecated in favor of `price.aggregated()`:

```typescript
// OLD (deprecated - will show warning)
dataStream.subscribe.price.token(tokenAddress).on(callback);

// NEW (recommended - more accurate across all pools)
dataStream.subscribe.price.aggregated(tokenAddress).on(callback);

// For specific pool price (still valid)
dataStream.subscribe.price.pool(poolId).on(callback);
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
dataStream.on(`price:aggregated:${tokenAddress}`, (data) =>
  console.log('Aggregated price update:', data)
); // NEW
dataStream.on(`price-by-token:${tokenAddress}`, (data) =>
  console.log('Price update (deprecated):', data)
);
dataStream.on(`transaction:${tokenAddress}`, (data) =>
  console.log('New transaction:', data)
);
dataStream.on(`token:${tokenAddress}`, (data) =>
  console.log('Token update (all pools):', data)
);
dataStream.on(`token:${tokenAddress}:primary`, (data) =>
  console.log('Token update (primary pool - auto-switches):', data)
);
dataStream.on(`sniper:${tokenAddress}`, (data) =>
  console.log('Sniper update:', data)
);
dataStream.on(`insider:${tokenAddress}`, (data) =>
  console.log('Insider update:', data)
);
dataStream.on(`stats:token:${tokenAddress}`, (data) =>
  console.log('Token stats:', data)
);
dataStream.on(`stats:pool:${poolId}`, (data) =>
  console.log('Pool stats:', data)
);

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
  .aggregated(tokenAddress)
  .on((data) => console.log('Aggregated price:', data)); // NEW
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
  .on((data) => console.log('Stats:', data));
dataStream.subscribe.stats
  .pool(poolId)
  .on((data) => console.log('Pool stats:', data));
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

// NEW: Get token holders with pagination (up to 5000 per request)
const paginatedHolders = await client.getTokenHoldersPaginated(
  'tokenAddress',
  100, // limit (optional, default: 100, max: 5000)
  'cursorFromPreviousRequest' // cursor (optional)
);

// Access the data
console.log('Total holders:', paginatedHolders.total);
console.log('Holders in this page:', paginatedHolders.accounts.length);
console.log('Has more pages:', paginatedHolders.hasMore);

// Get next page
if (paginatedHolders.hasMore) {
  const nextPage = await client.getTokenHoldersPaginated(
    'tokenAddress',
    100,
    paginatedHolders.cursor
  );
}

// Get top token holders
const topHolders = await client.getTopHolders('tokenAddress');

// Get all-time high price for a token
const athPrice = await client.getAthPrice('tokenAddress');

// Get tokens by deployer wallet
const deployerTokens = await client.getTokensByDeployer('walletAddress');

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

// Get top performing tokens by price change percentage
const topPerformers = await client.getTopPerformers('1h');
// Valid timeframes: '5m', '15m', '30m', '1h', '6h', '12h', '24h'

// Get tokens by volume
const volumeTokens = await client.getTokensByVolume('24h');

// NEW: Get token overview with advanced filtering
// Backward compatible - simple limit still works
const simpleOverview = await client.getTokenOverview(50);

// NEW: Advanced filtering with markets and risk scoring
const filteredOverview = await client.getTokenOverview({
  limit: 100,
  minCurve: 60,
  minHolders: 100,
  reduceSpam: true,
  minMarketCap: 100000,
  markets: ['pumpfun', 'raydium', 'meteora'],
  minRiskScore: 50,
  maxRiskScore: 80,
});

// Returns: { latest: [...], graduating: [...], graduated: [...] }

// NEW: Get graduated tokens with filtering and pagination
const graduatedTokens = await client.getGraduatedTokens({
  limit: 100,
  page: 1,
  reduceSpam: true,
  minLiquidity: 50000,
  markets: ['raydium'],
  minMarketCap: 1000000,
});

// NEW: Get graduating tokens with filtering
const graduatingTokens = await client.getGraduatingTokens({
  limit: 50,
  minCurve: 70,
  maxCurve: 95,
  minHolders: 50,
  maxHolders: 500,
  minMarketCap: 50000,
  markets: ['pumpfun', 'moonshot'],
});
```

### Token Overview Filtering Options

All token overview endpoints (`getTokenOverview`, `getGraduatedTokens`, `getGraduatingTokens`) support these filters:

```typescript
interface TokenOverviewParams {
  // Basic parameters
  limit?: number; // Max results (default: 100, max: 500)
  
  // Overview-specific
  minCurve?: number; // Min curve percentage for graduating tokens
  minHolders?: number; // Min number of holders for graduating
  maxHolders?: number; // Max number of holders for graduating
  reduceSpam?: boolean; // Filter out quick graduated tokens
  
  // Graduated-specific
  page?: number; // Page number for pagination
  
  // Graduating-specific
  minCurve?: number; // Min curve percentage (default: 40)
  maxCurve?: number; // Max curve percentage (default: 100)
  
  // Shared filters
  minLiquidity?: number; // Minimum liquidity in USD
  maxLiquidity?: number; // Maximum liquidity in USD
  minMarketCap?: number; // Minimum market cap in USD
  maxMarketCap?: number; // Maximum market cap in USD
  markets?: string[]; // Array of markets: ['pumpfun', 'raydium', 'meteora', etc]
  minRiskScore?: number; // Minimum risk score (0-100)
  maxRiskScore?: number; // Maximum risk score (0-100)
  rugged?: boolean; // Filter by rugged status
}
```

**Example: Find safe, high-liquidity graduated tokens**
```typescript
const safeTokens = await client.getGraduatedTokens({
  limit: 50,
  reduceSpam: true,
  minLiquidity: 100000,
  minMarketCap: 500000,
  markets: ['raydium', 'meteora'],
  maxRiskScore: 50,
  rugged: false,
});
```

**Example: Monitor tokens about to graduate**
```typescript
const nearGraduation = await client.getGraduatingTokens({
  minCurve: 85,
  maxCurve: 99,
  minHolders: 200,
  minMarketCap: 100000,
  markets: ['pumpfun'],
});
```

### Advanced Token Search (Enhanced!)

The `searchTokens` method now supports **60+ filter parameters** for precise token discovery:

```typescript
// Basic search with query
const basicSearch = await client.searchTokens({
  query: 'TRUMP',
  limit: 50,
  sortBy: 'marketCapUsd',
  sortOrder: 'desc',
});

// Search by exact symbol
const symbolSearch = await client.searchTokens({
  symbol: 'TRUMP',
  minLiquidity: 1000000,
});

// Filter by holder distribution - Find tokens with decentralized ownership
const decentralizedTokens = await client.searchTokens({
  maxDev: 5, // Dev holds max 5%
  maxTop10: 20, // Top 10 holders max 20%
  maxInsiders: 10, // Insiders max 10%
  maxSnipers: 5, // Snipers max 5%
  minHolders: 1000, // At least 1000 holders
  minLiquidity: 50000,
  sortBy: 'holders',
  sortOrder: 'desc',
});

// Find graduating Pump.fun tokens
const graduatingTokens = await client.searchTokens({
  market: 'pumpfun',
  minCurvePercentage: 80,
  maxCurvePercentage: 99,
  sortBy: 'curvePercentage',
  sortOrder: 'desc',
});

// Search by social media presence
const tokensWithTwitter = await client.searchTokens({
  twitter: 'https://x.com/realDonaldTrump',
  minLiquidity: 10000,
});

// Find highly active tokens by fees
const activeTokens = await client.searchTokens({
  minFeesTotal: 100, // At least 100 SOL in total fees
  minFeesTrading: 50, // At least 50 SOL in trading fees
  sortBy: 'fees.total',
  sortOrder: 'desc',
  limit: 20,
});

// Filter by volume across different timeframes
const highVolumeTokens = await client.searchTokens({
  minVolume_24h: 100000, // At least $100k volume in 24h
  minVolume_1h: 10000, // At least $10k volume in 1h
  minLiquidity: 50000,
  sortBy: 'volume_24h',
  sortOrder: 'desc',
});

// Filter by transaction activity
const popularTokens = await client.searchTokens({
  minBuys: 100,
  minSells: 50,
  minTotalTransactions: 150,
  minHolders: 500,
  sortBy: 'totalTransactions',
  sortOrder: 'desc',
});

// Find tokens with specific token characteristics
const safeTokens = await client.searchTokens({
  freezeAuthority: 'null', // No freeze authority
  mintAuthority: 'null', // No mint authority
  lpBurn: 100, // 100% LP burned
  minLiquidity: 25000,
  sortBy: 'liquidityUsd',
  sortOrder: 'desc',
});

// Search by creator wallet
const creatorTokens = await client.searchTokens({
  creator: 'CreatorWalletAddress',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Cursor-based pagination (faster for deep pagination)
let allResults = [];
let cursor = undefined;

do {
  const results = await client.searchTokens({
    minLiquidity: 5000,
    limit: 100,
    cursor: cursor,
  });

  allResults = allResults.concat(results.data);
  cursor = results.nextCursor;
} while (cursor && results.hasMore);

console.log(`Found ${allResults.length} tokens`);

// Complex multi-filter search
const customSearch = await client.searchTokens({
  // Liquidity and Market Cap
  minLiquidity: 100000,
  maxLiquidity: 10000000,
  minMarketCap: 500000,
  maxMarketCap: 50000000,

  // Holder Distribution
  minHolders: 500,
  maxTop10: 30,
  maxDev: 10,
  maxInsiders: 15,
  maxSnipers: 5,

  // Volume (24h)
  minVolume_24h: 50000,

  // Transaction Activity
  minBuys: 50,
  minTotalTransactions: 100,

  // Token Characteristics
  freezeAuthority: 'null',
  mintAuthority: 'null',
  lpBurn: 100,

  // Fees (indicates active trading)
  minFeesTotal: 10,

  // Sorting and Pagination
  sortBy: 'volume_24h',
  sortOrder: 'desc',
  limit: 50,
  showPriceChanges: true,
});
```

#### Search Parameters Reference

**Search & Pagination:**

- `query` - Search term for token symbol, name, or address
- `symbol` - Search for tokens with exact symbol match
- `page` - Page number for offset-based pagination (1-based)
- `limit` - Results per page (default: 100, max: 500)
- `cursor` - Cursor for cursor-based pagination (faster for deep searches)
- `sortBy` - Field to sort by (see sortable fields below)
- `sortOrder` - Sort order: `'asc'` or `'desc'`
- `showAllPools` - Return all pools for each token (default: false)
- `showPriceChanges` - Include price change data in response (default: false)

**Sortable Fields:**

- Market data: `liquidityUsd`, `marketCapUsd`, `priceUsd`, `volume`, `volume_5m`, `volume_15m`, `volume_30m`, `volume_1h`, `volume_6h`, `volume_12h`, `volume_24h`
- Holder distribution: `top10`, `dev`, `insiders`, `snipers`, `holders`
- Trading activity: `buys`, `sells`, `totalTransactions`
- Fees: `fees.total`, `fees.totalTrading`, `fees.totalTips`
- Other: `createdAt`, `lpBurn`, `curvePercentage`

**Creation Filters:**

- `minCreatedAt` - Minimum creation date (unix timestamp in ms)
- `maxCreatedAt` - Maximum creation date (unix timestamp in ms)

**Liquidity & Market Cap Filters:**

- `minLiquidity` - Minimum liquidity in USD
- `maxLiquidity` - Maximum liquidity in USD (capped at $100B)
- `minMarketCap` - Minimum market cap in USD
- `maxMarketCap` - Maximum market cap in USD (capped at $5T)

**Volume Filters:**

- `minVolume` / `maxVolume` - General volume filters
- `volumeTimeframe` - Timeframe for volume: `'5m'`, `'15m'`, `'30m'`, `'1h'`, `'6h'`, `'12h'`, `'24h'`
- Timeframe-specific: `minVolume_5m`, `maxVolume_5m`, `minVolume_15m`, `maxVolume_15m`, `minVolume_30m`, `maxVolume_30m`, `minVolume_1h`, `maxVolume_1h`, `minVolume_6h`, `maxVolume_6h`, `minVolume_12h`, `maxVolume_12h`, `minVolume_24h`, `maxVolume_24h`

**Transaction Filters:**

- `minBuys` / `maxBuys` - Filter by number of buy transactions
- `minSells` / `maxSells` - Filter by number of sell transactions
- `minTotalTransactions` / `maxTotalTransactions` - Filter by total transactions

**Holder Filters:**

- `minHolders` / `maxHolders` - Filter by total holder count
- `minTop10` / `maxTop10` - Filter by % held by top 10 holders (0-100)
- `minDev` / `maxDev` - Filter by % held by developer (0-100)
- `minInsiders` / `maxInsiders` - Filter by % held by insiders (0-100)
- `minSnipers` / `maxSnipers` - Filter by % held by snipers (0-100)

**Token Characteristics:**

- `lpBurn` - LP token burn percentage (0-100)
- `market` - Market identifier (e.g., `'pumpfun'`, `'raydium'`, `'meteora-dlmm'`)
- `freezeAuthority` - Freeze authority address (use `'null'` for none)
- `mintAuthority` - Mint authority address (use `'null'` for none)
- `deployer` - Deployer wallet address
- `creator` - Token creator wallet address
- `status` - Token status (`'graduating'`, `'graduated'`, `'default'`)
- `minCurvePercentage` / `maxCurvePercentage` - Bonding curve % (0-100)

**Social Media Filters (exact match):**

- `twitter` - Twitter/X profile URL
- `telegram` - Telegram channel/group URL
- `discord` - Discord server invite URL
- `website` - Official website URL
- `facebook` - Facebook page URL
- `instagram` - Instagram profile URL
- `youtube` - YouTube channel URL
- `reddit` - Reddit community URL
- `tiktok` - TikTok profile URL
- `github` - GitHub repository URL

**Fees Filters (in SOL):**

- `minFeesTotal` / `maxFeesTotal` - Total fees paid
- `minFeesTrading` / `maxFeesTrading` - Trading fees paid
- `minFeesTips` / `maxFeesTips` - Priority fees/tips paid

#### Search Response

The search response includes pagination information and detailed token data:

```typescript
interface SearchResponse {
  status: string;
  data: SearchResult[]; // Array of token results
  total?: number; // Total number of results
  pages?: number; // Total number of pages
  page?: number; // Current page number
  nextCursor?: string; // Cursor for next page (cursor-based pagination)
  hasMore?: boolean; // Whether there are more results
}

interface SearchResult {
  // Basic token info
  name: string;
  symbol: string;
  mint: string;
  image?: string;
  decimals: number;

  // Pool and market info
  poolAddress: string;
  market: string;
  quoteToken: string;

  // Price and liquidity
  liquidityUsd: number;
  marketCapUsd: number;
  priceUsd: number;

  // Trading activity
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

  // Holder information
  holders: number;
  top10?: number; // % held by top 10 holders
  dev?: number; // % held by developer
  insiders?: number; // % held by insiders
  snipers?: number; // % held by snipers

  // Verification
  jupiter?: boolean; // Jupiter verification status
  verified?: boolean; // General verification status

  // Token characteristics
  lpBurn: number;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  deployer: string;
  status: string;
  createdAt: number;
  lastUpdated: number;

  // Social media
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

  // Fees information
  fees?: {
    total?: number; // Total fees in SOL
    totalTrading?: number; // Trading fees in SOL
    totalTips?: number; // Priority fees/tips in SOL
  };

  // Token creation details
  tokenDetails?: {
    creator: string;
    tx: string;
    time: number;
  };
}
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
  currency: 'usd', // NEW: Currency for price data - 'usd' (default), 'eur', or 'sol'
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
  true, // fastCache
  'eur' // currency
);

// Get chart in different currencies
const chartInEur = await client.getChartData({
  tokenAddress: 'tokenAddress',
  type: '1h',
  currency: 'eur',
});

const chartInSol = await client.getChartData({
  tokenAddress: 'tokenAddress',
  type: '1h',
  currency: 'sol',
});

// Get OHLCV data for a specific token and pool
const poolChartData = await client.getPoolChartData({
  tokenAddress: 'tokenAddress',
  poolAddress: 'poolAddress',
  type: '15m',
  timezone: 'UTC',
  fastCache: false,
  currency: 'usd', // Also supports currency option
});

// Get holder count chart data
const holdersChart = await client.getHoldersChart('tokenAddress', '1d');

// Get snipers percentage chart data
const snipersChart = await client.getSnipersChart('tokenAddress', '1d');

// Get insiders percentage chart data
const insidersChart = await client.getInsidersChart('tokenAddress', '1d');

// Get bundlers percentage chart data
const bundlersChart = await client.getBundlersChart('tokenAddress', '1d');
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

// Get subscription information
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

    // Access detailed error information
    if (error.details) {
      console.error('Error details:', error.details);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Type Definitions

#### Type Updates:

```typescript
// Enhanced SearchResult with holder distribution
interface SearchResult {
  // ... existing fields
  top10?: number; // % held by top 10 holders
  dev?: number; // % held by developer
  insiders?: number; // % held by insiders
  snipers?: number; // % held by snipers
  jupiter?: boolean; // Jupiter verification
  verified?: boolean; // General verification
  
  socials?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    // ... more social media links
  };
  
  fees?: {
    total?: number; // Total fees in SOL
    totalTrading?: number; // Trading fees in SOL
    totalTips?: number; // Priority tips in SOL
  };
}

// Enhanced SearchResponse with pagination
interface SearchResponse {
  status: string;
  data: SearchResult[];
  total?: number;
  pages?: number;
  page?: number;
  nextCursor?: string; // For cursor-based pagination
  hasMore?: boolean;
}

// Paginated token holders response
interface PaginatedTokenHoldersResponse {
  total: number;
  accounts: PaginatedHolder[];
  cursor: string;
  hasMore: boolean;
  limit: number;
}

interface PaginatedHolder {
  wallet: string;
  account: string;
  amount: number;
  value: {
    quote: number;
    usd: number;
  };
  percentage: number;
}

// Aggregated price update structure
interface AggregatedPriceUpdate {
  token: string;
  timestamp: number;
  price: number;
  pool: string;
  aggregated: {
    median: number;
    average: number;
    min: number;
    max: number;
    poolCount: number;
  };
  topPools: Array<{
    poolId: string;
    price: number;
    liquidity: number;
    market: string;
  }>;
}

// Developer holding update structure
interface DevHoldingUpdate {
  token: string;
  creator: string;
  amount: string;
  percentage: number;
  previousPercentage: number;
  timestamp: number;
}

// Top holder information
interface TopHolder {
  address: string;
  amount: string;
  percentage: number;
}

// Top 10 holders update structure
interface Top10HoldersUpdate {
  token: string;
  holders: TopHolder[];
  totalPercentage: number;
  previousPercentage: number | null;
  timestamp: number;
}

// Snipers chart data
interface SnipersChartData {
  percentage: number;
  time: number;
}

interface SnipersChartResponse {
  snipers: SnipersChartData[];
}

// Insiders chart data
interface InsidersChartData {
  percentage: number;
  time: number;
}

interface InsidersChartResponse {
  insiders: InsidersChartData[];
}

// Bundlers chart data
interface BundlersChartData {
  percentage: number;
  time: number;
}

interface BundlersChartResponse {
  bundlers: BundlersChartData[];
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
dataStream.on(`price:aggregated:${tokenAddress}`, (data) =>
  console.log('Aggregated price update:', data)
); // NEW - RECOMMENDED
dataStream.on(`price-by-token:${tokenAddress}`, (data) =>
  console.log('Price update (deprecated - auto-switches to new main pool):', data)
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
  console.log('Token update (primary pool - auto-switches to new main pool):', data)
);
dataStream.on(`pool:${poolId}`, (data) => console.log('Pool update:', data));
dataStream.on(`sniper:${tokenAddress}`, (data) =>
  console.log('Sniper update:', data)
);
dataStream.on(`insider:${tokenAddress}`, (data) =>
  console.log('Insider update:', data)
);
dataStream.on(`stats:token:${tokenAddress}`, (data) =>
  console.log('Token stats:', data)
);
dataStream.on(`stats:pool:${poolId}`, (data) =>
  console.log('Pool stats:', data)
);
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