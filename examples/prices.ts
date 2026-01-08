import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';

const client = new Client({
  apiKey: process.env.SOLANA_TRACKER_API_KEY || 'YOUR_API_KEY_HERE'
});

// Get current price for a token
export async function getTokenPrice(tokenAddress: string) {
  try {
    const priceData = await client.getPrice(tokenAddress, true);
    
    console.log('\n💰 Price:', `$${priceData.price.toFixed(6)}`);
    console.log('Liquidity:', `$${(priceData.liquidity / 1000000).toFixed(2)}M`);
    console.log('Market Cap:', `$${(priceData.marketCap / 1000000).toFixed(2)}M`);
    
    return priceData;
  } catch (error) {
    handleError(error);
  }
}

// Track price history
export async function getHistoricalPrices(tokenAddress: string) {
  try {
    const history = await client.getPriceHistory(tokenAddress);
    
    console.log('\n📊 Price History:');
    console.log(`Now: $${history.current.toFixed(6)}`);
    
    if (history['3d']) {
      const change = ((history.current - history['3d']) / history['3d']) * 100;
      console.log(`3d ago: $${history['3d'].toFixed(6)} (${change.toFixed(1)}%)`);
    }
    
    if (history['7d']) {
      const change = ((history.current - history['7d']) / history['7d']) * 100;
      console.log(`7d ago: $${history['7d'].toFixed(6)} (${change.toFixed(1)}%)`);
    }
    
    if (history['30d']) {
      const change = ((history.current - history['30d']) / history['30d']) * 100;
      console.log(`30d ago: $${history['30d'].toFixed(6)} (${change.toFixed(1)}%)`);
    }
    
    return history;
  } catch (error) {
    handleError(error);
  }
}

// Get price at specific time
export async function getPriceAtTimestamp(tokenAddress: string, timestamp: number) {
  try {
    const priceData = await client.getPriceAtTimestamp(tokenAddress, timestamp);
    
    console.log('\n⏰ Price at', new Date(timestamp * 1000).toLocaleString());
    console.log(`Was: $${priceData.price.toFixed(6)}`);
    
    return priceData;
  } catch (error) {
    handleError(error);
  }
}

// Find high/low in a time period
export async function getPriceRange(tokenAddress: string, daysAgo: number) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const past = now - (daysAgo * 24 * 60 * 60);
    
    const range = await client.getPriceRange(tokenAddress, past, now);
    
    console.log(`\n📈 Price Range (Last ${daysAgo} days):`);
    console.log(`Low: $${range.price.lowest.price.toFixed(6)}`);
    console.log(`High: $${range.price.highest.price.toFixed(6)}`);
    
    const swingPercent = ((range.price.highest.price - range.price.lowest.price) / range.price.lowest.price) * 100;
    console.log(`Swing: ${swingPercent.toFixed(1)}%`);
    
    return range;
  } catch (error) {
    handleError(error);
  }
}

// Check multiple tokens
export async function getMultipleTokenPrices() {
  try {
    const addresses = [
      'So11111111111111111111111111111111111111112', // SOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
    ];
    
    const prices = await client.getMultiplePrices(addresses, true);
    
    console.log('\n🔗 Multiple prices:');
    Object.values(prices).forEach((data: any) => {
      console.log(`$${data.price.toFixed(6)} - Cap: $${(data.marketCap / 1000000).toFixed(2)}M`);
    });
    
    return prices;
  } catch (error) {
    handleError(error);
  }
}

// Batch query with POST
export async function postMultipleTokenPrices() {
  try {
    const addresses = [
      'So11111111111111111111111111111111111111112',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    ];
    
    const prices = await client.postMultiplePrices(addresses);
    
    console.log('\n✅ Batch prices fetched');
    return prices;
  } catch (error) {
    handleError(error);
  }
}