/**
 * Price-related examples for the Solana Tracker API
 */
import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';

// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE'
});

/**
 * Example 1: Get current price of a token
 */
export async function getTokenPrice(tokenAddress: string) {
  try {
    const priceData = await client.getPrice(tokenAddress, true);
    
    console.log('\n=== Token Price Information ===');
    console.log(`Price: $${priceData.price.toFixed(6)}`);
    console.log(`Liquidity: $${priceData.liquidity.toLocaleString()}`);
    console.log(`Market Cap: $${priceData.marketCap.toLocaleString()}`);
    console.log(`Last Updated: ${new Date(priceData.lastUpdated).toLocaleString()}`);
    
    return priceData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get historical price data
 */
export async function getHistoricalPrices(tokenAddress: string) {
  try {
    const historyData = await client.getPriceHistory(tokenAddress);
    
    console.log('\n=== Historical Price Information ===');
    console.log(`Current Price: $${historyData.current.toFixed(6)}`);
    
    if (historyData['3d']) {
      console.log(`3 Days Ago: $${historyData['3d'].toFixed(6)}`);
      const change3d = ((historyData.current - historyData['3d']) / historyData['3d']) * 100;
      console.log(`3-Day Change: ${change3d.toFixed(2)}%`);
    }
    
    if (historyData['7d']) {
      console.log(`7 Days Ago: $${historyData['7d'].toFixed(6)}`);
      const change7d = ((historyData.current - historyData['7d']) / historyData['7d']) * 100;
      console.log(`7-Day Change: ${change7d.toFixed(2)}%`);
    }
    
    if (historyData['30d']) {
      console.log(`30 Days Ago: $${historyData['30d'].toFixed(6)}`);
      const change30d = ((historyData.current - historyData['30d']) / historyData['30d']) * 100;
      console.log(`30-Day Change: ${change30d.toFixed(2)}%`);
    }
    
    return historyData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get price at a specific timestamp
 */
export async function getPriceAtTimestamp(tokenAddress: string, timestamp: number) {
  try {
    const timestampPrice = await client.getPriceAtTimestamp(tokenAddress, timestamp);
    
    console.log('\n=== Price at Specific Timestamp ===');
    console.log(`Token: ${tokenAddress}`);
    console.log(`Date: ${new Date(timestamp * 1000).toLocaleString()}`);
    console.log(`Price: $${timestampPrice.price.toFixed(6)}`);
    console.log(`Used Pool: ${timestampPrice.pool}`);
    
    return timestampPrice;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Get price range (highest/lowest) in a time period
 */
export async function getPriceRange(tokenAddress: string, daysAgo: number) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const past = now - (daysAgo * 24 * 60 * 60);
    
    const rangeData = await client.getPriceRange(tokenAddress, past, now);
    
    console.log(`\n=== Price Range (Last ${daysAgo} Days) ===`);
    console.log(`Token: ${rangeData.token}`);
    
    console.log(`\nLowest Price: $${rangeData.price.lowest.price.toFixed(6)}`);
    console.log(`  Date: ${new Date(rangeData.price.lowest.time * 1000).toLocaleString()}`);
    
    console.log(`\nHighest Price: $${rangeData.price.highest.price.toFixed(6)}`);
    console.log(`  Date: ${new Date(rangeData.price.highest.time * 1000).toLocaleString()}`);
    
    const priceChange = ((rangeData.price.highest.price - rangeData.price.lowest.price) / rangeData.price.lowest.price) * 100;
    console.log(`\nMax Range: ${priceChange.toFixed(2)}%`);
    
    return rangeData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 5: Get prices for multiple tokens at once
 */
export async function getMultipleTokenPrices() {
  try {
    // Example token addresses
    const tokenAddresses = [
      'So11111111111111111111111111111111111111112', // SOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
    ];
    
    const prices = await client.getMultiplePrices(tokenAddresses, true);
    
    console.log('\n=== Multiple Token Prices ===');
    
    for (const [address, data] of Object.entries(prices)) {
      console.log(`\nToken: ${address}`);
      console.log(`  Price: $${data.price.toFixed(6)}`);
      console.log(`  Market Cap: $${(data.marketCap / 1000000).toFixed(2)}M`);
      console.log(`  Liquidity: $${(data.liquidity / 1000).toFixed(2)}k`);
    }
    
    return prices;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 6: Using POST for getting prices (useful for large token lists)
 */
export async function postMultipleTokenPrices() {
  try {
    // Example token addresses
    const tokenAddresses = [
      'So11111111111111111111111111111111111111112', // SOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
    ];
    
    const prices = await client.postMultiplePrices(tokenAddresses, true);
    
    console.log('\n=== Multiple Token Prices (POST) ===');
    
    for (const [address, data] of Object.entries(prices)) {
      console.log(`\nToken: ${address}`);
      console.log(`  Price: $${data.price.toFixed(6)}`);
      console.log(`  Market Cap: $${(data.marketCap / 1000000).toFixed(2)}M`);
      console.log(`  Liquidity: $${(data.liquidity / 1000).toFixed(2)}k`);
    }
    
    return prices;
  } catch (error) {
    handleError(error);
    return null;
  }
}

// For individual usage
if (require.main === module) {
  (async () => {
    // SOL token
    await getTokenPrice('So11111111111111111111111111111111111111112');
    await getHistoricalPrices('So11111111111111111111111111111111111111112');
    
    // Get price from one week ago
    const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    await getPriceAtTimestamp('So11111111111111111111111111111111111111112', oneWeekAgo);
    
    // Get price range for the last 30 days
    await getPriceRange('So11111111111111111111111111111111111111112', 30);
    
    await getMultipleTokenPrices();
    await postMultipleTokenPrices();
  })();
}