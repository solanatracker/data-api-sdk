/**
 * Chart-related examples for the Solana Tracker API
 */
import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';

// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE'
});

/**
 * Example 1: Get OHLCV chart data for a token (with new parameters)
 */
export async function getTokenChartData(tokenAddress: string, timeframe: string = '1s') {
  try {
    // Calculate time range (e.g., past 7 days)
    const now = Math.floor(Date.now() / 1000);
    
    // Method 1: Using object syntax (recommended for multiple parameters)
    const chartData = await client.getChartData({
      tokenAddress: tokenAddress,
      type: timeframe,
      timeTo: now,
      marketCap: false,              // Get price data, not market cap
      removeOutliers: true,           // Remove outliers for cleaner chart
      dynamicPools: true,             // Use dynamic pool selection for best data
      timezone: 'current',            // Use user's current timezone
      fastCache: true                 // Enable fast cache for quicker response
    });
    
    // Method 2: Using traditional syntax (still supported)
    // const chartData = await client.getChartData(
    //   tokenAddress,
    //   timeframe,
    //   startTime,
    //   now,
    //   false,    // marketCap
    //   true,     // removeOutliers
    //   true,     // dynamicPools
    //   'current', // timezone
    //   true      // fastCache
    // );
    
    console.log(`\n=== ${timeframe} Chart Data for ${tokenAddress}`);
    console.log(`Data Points: ${chartData.oclhv.length}`);
    console.log(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    
    if (chartData.oclhv.length > 0) {
      // Display first and last candle
      const firstCandle = chartData.oclhv[0];
      const lastCandle = chartData.oclhv[chartData.oclhv.length - 1];
      
      console.log('\nFirst Candle:');
      console.log(`Time: ${new Date(firstCandle.time * 1000).toLocaleString()}`);
      console.log(`Open: $${firstCandle.open.toFixed(6)}`);
      console.log(`High: $${firstCandle.high.toFixed(6)}`);
      console.log(`Low: $${firstCandle.low.toFixed(6)}`);
      console.log(`Close: $${firstCandle.close.toFixed(6)}`);
      console.log(`Volume: ${firstCandle.volume.toFixed(2)}`);
      
      console.log('\nLast Candle:');
      console.log(`Time: ${new Date(lastCandle.time * 1000).toLocaleString()}`);
      console.log(`Open: $${lastCandle.open.toFixed(6)}`);
      console.log(`High: $${lastCandle.high.toFixed(6)}`);
      console.log(`Low: $${lastCandle.low.toFixed(6)}`);
      console.log(`Close: $${lastCandle.close.toFixed(6)}`);
      console.log(`Volume: ${lastCandle.volume.toFixed(2)}`);
      
      // Calculate price change over the period
      const priceChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
      console.log(`\nPrice Change: ${priceChange.toFixed(2)}%`);
      
      // Find highest and lowest prices
      let highestPrice = 0;
      let lowestPrice = Number.MAX_VALUE;
      let highestTime = 0;
      let lowestTime = 0;
      let totalVolume = 0;
      
      chartData.oclhv.forEach(candle => {
        if (candle.high > highestPrice) {
          highestPrice = candle.high;
          highestTime = candle.time;
        }
        if (candle.low < lowestPrice) {
          lowestPrice = candle.low;
          lowestTime = candle.time;
        }
        totalVolume += candle.volume;
      });
      
      console.log(`\nHighest Price: $${highestPrice.toFixed(6)} at ${new Date(highestTime * 1000).toLocaleString()}`);
      console.log(`Lowest Price: $${lowestPrice.toFixed(6)} at ${new Date(lowestTime * 1000).toLocaleString()}`);
      console.log(`Total Volume: $${totalVolume.toFixed(2)}`);
      console.log(`Average Volume per Candle: $${(totalVolume / chartData.oclhv.length).toFixed(2)}`);
    }
    
    return chartData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get OHLCV data for a specific token and pool
 */
export async function getPoolChartData(tokenAddress: string, poolAddress: string, timeframe: string = '1s') {
  try {
    // Calculate time range (e.g., past 7 days)
    const now = Math.floor(Date.now() / 1000);
    
    // Using object syntax with specific timezone
    const chartData = await client.getPoolChartData({
      tokenAddress: tokenAddress,
      poolAddress: poolAddress,
      type: timeframe,
      timeTo: now,
      timezone: 'current', // Use user's current timezone
      fastCache: false               // Disable fast cache for this request
    });
    
    console.log(`\n=== ${timeframe} Pool Chart Data for ${tokenAddress} in Pool ${poolAddress} (Last ${days} Days) ===`);
    console.log(`Data Points: ${chartData.oclhv.length}`);
    console.log(`Timezone: America/New_York`);
    
    if (chartData.oclhv.length > 0) {
      const firstCandle = chartData.oclhv[0];
      const lastCandle = chartData.oclhv[chartData.oclhv.length - 1];
      
      console.log('\nFirst Candle:');
      console.log(`Time: ${new Date(firstCandle.time * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
      console.log(`Open: $${firstCandle.open.toFixed(6)}`);
      console.log(`Close: $${firstCandle.close.toFixed(6)}`);
      
      console.log('\nLast Candle:');
      console.log(`Time: ${new Date(lastCandle.time * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
      console.log(`Open: $${lastCandle.open.toFixed(6)}`);
      console.log(`Close: $${lastCandle.close.toFixed(6)}`);
      
      // Calculate price change
      const priceChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
      console.log(`\nPrice Change: ${priceChange.toFixed(2)}%`);
    }
    
    return chartData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get different timeframe chart data
 */
export async function compareTimeframes(tokenAddress: string) {
  try {
    // Get data for different timeframes
    const timeframes = ['5m', '1h', '1d'];
    const days = [1, 7, 30]; // Corresponding days to fetch
    
    console.log(`\n=== Comparing Different Timeframes for ${tokenAddress} ===`);
    
    for (let i = 0; i < timeframes.length; i++) {
      const timeframe = timeframes[i];
      const daysToFetch = days[i];
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now - (daysToFetch * 24 * 60 * 60);
      
      const chartData = await client.getChartData(
        tokenAddress,
        timeframe,
        startTime,
        now
      );
      
      console.log(`\n${timeframe} Data (Last ${daysToFetch} Days):`);
      console.log(`Data Points: ${chartData.oclhv.length}`);
      
      if (chartData.oclhv.length > 0) {
        const firstCandle = chartData.oclhv[0];
        const lastCandle = chartData.oclhv[chartData.oclhv.length - 1];
        
        // Calculate price change
        const priceChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
        console.log(`Price Change: ${priceChange.toFixed(2)}%`);
        
        // Calculate volatility (standard deviation of returns)
        let returns: number[] = [];
        for (let j = 1; j < chartData.oclhv.length; j++) {
          const prevClose = chartData.oclhv[j-1].close;
          const currentClose = chartData.oclhv[j].close;
          returns.push((currentClose - prevClose) / prevClose);
        }
        
        const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
        const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);
        
        console.log(`Volatility: ${(volatility * 100).toFixed(2)}%`);
      }
    }
    
    return true;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Get holder count chart data
 */
export async function getHolderCountChart(tokenAddress: string, days: number = 30) {
  try {
    // Calculate time range
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (days * 24 * 60 * 60);
    
    const holdersData = await client.getHoldersChart(
      tokenAddress,
      '1d', // Daily data
      startTime,
      now
    );
    
    console.log(`\n=== Holder Count Chart for ${tokenAddress} (Last ${days} Days) ===`);
    console.log(`Data Points: ${holdersData.holders.length}`);
    
    if (holdersData.holders.length > 0) {
      const firstDataPoint = holdersData.holders[0];
      const lastDataPoint = holdersData.holders[holdersData.holders.length - 1];
      
      console.log(`\nFirst Data Point:`);
      console.log(`Date: ${new Date(firstDataPoint.time * 1000).toLocaleString()}`);
      console.log(`Holders: ${firstDataPoint.holders}`);
      
      console.log(`\nLast Data Point:`);
      console.log(`Date: ${new Date(lastDataPoint.time * 1000).toLocaleString()}`);
      console.log(`Holders: ${lastDataPoint.holders}`);
      
      // Calculate holder growth
      const holderChange = lastDataPoint.holders - firstDataPoint.holders;
      const holderChangePercent = (holderChange / firstDataPoint.holders) * 100;
      
      console.log(`\nHolder Change: ${holderChange > 0 ? '+' : ''}${holderChange} (${holderChangePercent.toFixed(2)}%)`);
      console.log(`Average Daily Growth: ${(holderChange / holdersData.holders.length).toFixed(2)} holders per day`);
    }
    
    return holdersData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 5: Get market cap chart data
 */
export async function getMarketCapChart(tokenAddress: string, timeframe: string = '1d', days: number = 30) {
  try {
    // Calculate time range
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (days * 24 * 60 * 60);
    
    const marketCapData = await client.getChartData(
      tokenAddress,
      timeframe,
      startTime,
      now,
      true // marketCap parameter set to true
    );
    
    console.log(`\n=== Market Cap Chart for ${tokenAddress} (Last ${days} Days) ===`);
    console.log(`Data Points: ${marketCapData.oclhv.length}`);
    
    if (marketCapData.oclhv.length > 0) {
      const firstDataPoint = marketCapData.oclhv[0];
      const lastDataPoint = marketCapData.oclhv[marketCapData.oclhv.length - 1];
      
      console.log(`\nFirst Data Point:`);
      console.log(`Date: ${new Date(firstDataPoint.time * 1000).toLocaleString()}`);
      console.log(`Market Cap: ${(firstDataPoint.close / 1000000).toFixed(2)}M`);
      
      console.log(`\nLast Data Point:`);
      console.log(`Date: ${new Date(lastDataPoint.time * 1000).toLocaleString()}`);
      console.log(`Market Cap: ${(lastDataPoint.close / 1000000).toFixed(2)}M`);
      
      // Calculate market cap change
      const mcapChange = ((lastDataPoint.close - firstDataPoint.close) / firstDataPoint.close) * 100;
      console.log(`\nMarket Cap Change: ${mcapChange.toFixed(2)}%`);
    }
    
    return marketCapData;
  } catch (error) {
    handleError(error);
    return null;
  }
}