# Solana Tracker - Data API SDK

Official JavaScript/TypeScript client for the [Solana Tracker Data API](https://www.solanatracker.io/data-api).

[![npm version](https://badge.fury.io/js/@solana-tracker%2Fdata-api.svg)](https://badge.fury.io/js/@solana-tracker%2Fdata-api)

## Features

- Full TypeScript support with detailed interfaces for all API responses
- Comprehensive coverage of all Solana Tracker Data API endpoints
- Real-time data streaming via WebSocket (Datastream)
- Built-in error handling with specific error types
- Compatible with both Node.js and browser environments

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
    const tokenInfo = await client.getTokenInfo('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R');
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
import { Datastream } from '@solanatracker/data-api';

// Initialize the Datastream with your API key
const dataStream = new Datastream({
  wsUrl: 'YOUR_WS_URL'
});

// Connect to the WebSocket server
dataStream.connect();

// Handle connection events
dataStream.on('connected', () => console.log('Connected to datastream'));
dataStream.on('disconnected', () => console.log('Disconnected from datastream'));
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
const txSubscription = dataStream.subscribe.tx.token(tokenAddress).on((transaction) => {
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
```

Available subscription methods are organized in a clean, intuitive namespace structure:

```typescript
// Token and pool updates
dataStream.subscribe.latest();                  // Latest tokens and pools
dataStream.subscribe.token(tokenAddress);       // Token changes (any pool)
dataStream.subscribe.pool(poolId);              // Pool changes

// Price updates
dataStream.subscribe.price.token(tokenAddress); // Token price (main pool)
dataStream.subscribe.price.allPoolsForToken(tokenAddress); // All price updates for a token
dataStream.subscribe.price.pool(poolId);        // Pool price

// Transactions
dataStream.subscribe.tx.token(tokenAddress);    // Token transactions
dataStream.subscribe.tx.pool(tokenAddress, poolId); // Pool transactions
dataStream.subscribe.tx.wallet(walletAddress);  // Wallet transactions

// Pump.fun stages
dataStream.subscribe.graduating();              // Graduating tokens
dataStream.subscribe.graduated();               // Graduated tokens

// Metadata and holders
dataStream.subscribe.metadata(tokenAddress);    // Token metadata
dataStream.subscribe.holders(tokenAddress);     // Holder updates
```

Each subscription method returns a response object with:
- `room`: The subscription channel name
- `on()`: Method to attach a listener with proper TypeScript types
  - Returns an object with `unsubscribe()` method for easy cleanup

## WebSocket Data Stream

The `Datastream` class provides real-time access to Solana Tracker data:

### Events

The Datastream extends the standard EventEmitter interface, allowing you to listen for various events:

```typescript
// Connection events
dataStream.on('connected', () => console.log('Connected to WebSocket server'));
dataStream.on('disconnected', (socketType) => console.log(`Disconnected: ${socketType}`));
dataStream.on('reconnecting', (attempt) => console.log(`Reconnecting: attempt ${attempt}`));
dataStream.on('error', (error) => console.error('Error:', error));

// Data events - Standard approach
dataStream.on('latest', (data) => console.log('New token:', data));
dataStream.on(`price-by-token:${tokenAddress}`, (data) => console.log('Price update:', data));
dataStream.on(`transaction:${tokenAddress}`, (data) => console.log('New transaction:', data));

// New approach - Chain .on() directly to subscription
dataStream.subscribe.latest().on((data) => console.log('New token:', data));
dataStream.subscribe.price.token(tokenAddress).on((data) => console.log('Price update:', data));
dataStream.subscribe.tx.token(tokenAddress).on((data) => console.log('Transaction:', data));
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
const latestTokens = await client.getLatestTokens(1);

// Get information about multiple tokens
const multipleTokens = await client.getMultipleTokens([
  'So11111111111111111111111111111111111111112',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
]);

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
const timestampPrice = await client.getPriceAtTimestamp('tokenAddress', 1690000000);

// Get price range (lowest/highest in time range)
const priceRange = await client.getPriceRange('tokenAddress', 1690000000, 1695000000);

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

// Get wallet trades
const walletTrades = await client.getWalletTrades('walletAddress', undefined, true, true, false);
```

### Trade Endpoints

```typescript
// Get trades for a token
const tokenTrades = await client.getTokenTrades('tokenAddress');

// Get trades for a specific token and pool
const poolTrades = await client.getPoolTrades('tokenAddress', 'poolAddress');

// Get trades for a specific token, pool, and wallet
const userPoolTrades = await client.getUserPoolTrades('tokenAddress', 'poolAddress', 'walletAddress');

// Get trades for a specific token and wallet
const userTokenTrades = await client.getUserTokenTrades('tokenAddress', 'walletAddress');
```

### Chart Endpoints

```typescript
// Get OHLCV data for a token
const chartData = await client.getChartData('tokenAddress', '1h', 1690000000, 1695000000);

// Get OHLCV data for a specific token and pool
const poolChartData = await client.getPoolChartData('tokenAddress', 'poolAddress', '15m');

// Get holder count chart data
const holdersChart = await client.getHoldersChart('tokenAddress', '1d');
```

### PnL Endpoints

```typescript
// Get PnL data for all positions of a wallet
const walletPnL = await client.getWalletPnL('walletAddress', true, true, false);

// Get the first 100 buyers of a token with PnL data
const firstBuyers = await client.getFirstBuyers('tokenAddress');

// Get PnL data for a specific token in a wallet
const tokenPnL = await client.getTokenPnL('walletAddress', 'tokenAddress');
```

### Top Traders Endpoints

```typescript
// Get the most profitable traders across all tokens
const topTraders = await client.getTopTraders(1, true, 'total');

// Get top 100 traders by PnL for a token
const tokenTopTraders = await client.getTokenTopTraders('tokenAddress');
```

### Additional Endpoints

```typescript
// Get detailed stats for a token
const tokenStats = await client.getTokenStats('tokenAddress');

// Get detailed stats for a specific token and pool
const poolStats = await client.getPoolStats('tokenAddress', 'poolAddress');
```

## Error Handling

The library includes specific error types for robust error handling:

```typescript
import { Client, DataApiError, RateLimitError, ValidationError } from '@solana-tracker/data-api';

try {
  const tokenInfo = await client.getTokenInfo('invalid-address');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded. Retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof DataApiError) {
    console.error('API error:', error.message, 'Status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```


## WebSocket Data Stream

The `Datastream` class provides real-time access to Solana Tracker data:

### Events

The Datastream extends the standard EventEmitter interface, allowing you to listen for various events:

```typescript
// Connection events
dataStream.on('connected', () => console.log('Connected to WebSocket server'));
dataStream.on('disconnected', (socketType) => console.log(`Disconnected: ${socketType}`));
dataStream.on('reconnecting', (attempt) => console.log(`Reconnecting: attempt ${attempt}`));
dataStream.on('error', (error) => console.error('Error:', error));

// Data events
dataStream.on('latest', (data) => console.log('New token:', data));
dataStream.on(`price-by-token:${tokenAddress}`, (data) => console.log('Price update:', data));
dataStream.on(`price:${tokenAddress}`, (data) => console.log('Price update:', data));
dataStream.on(`price:${poolAddress}`, (data) => console.log('Price update:', data));
dataStream.on(`transaction:${tokenAddress}`, (data) => console.log('New transaction:', data));
dataStream.on(`wallet:${walletAddress}`, (data) => console.log('Wallet transaction:', data));
dataStream.on('graduating', (data) => console.log('Graduating token:', data));
dataStream.on('graduated', (data) => console.log('Graduated token:', data));
dataStream.on(`metadata:${tokenAddress}`, (data) => console.log('Metadata update:', data));
dataStream.on(`holders:${tokenAddress}`, (data) => console.log('Holders update:', data));
dataStream.on(`token:${tokenAddress}`, (data) => console.log('Token update:', data));
dataStream.on(`pool:${poolId}`, (data) => console.log('Pool update:', data));
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

| Plan            | Price         | Requests/Month | Rate Limit |
|-----------------|---------------|----------------|------------|
| Free            | Free          | 10,000         | 1/second   |
| Starter         | €14.99/month  | 50,000         | None       |
| Advanced        | €50/month     | 200,000        | None       |
| Pro             | €200/month    | 1,000,000      | None       |
| Premium         | €397/month    | 10,000,000     | None       |
| Business        | €599/month    | 25,000,000     | None       |
| Enterprise      | €1499/month   | 100,000,000    | None       |
| Enterprise Plus | Custom        | Unlimited      | None       |

Visit [Solana Tracker](https://www.solanatracker.io/account/data-api) to sign up and get your API key.

## WebSocket Access

WebSocket access (via the Datastream) is available for Premium, Business, and Enterprise plans.

## License

This project is licensed under the [MIT License](LICENSE).