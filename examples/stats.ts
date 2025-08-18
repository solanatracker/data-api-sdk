/**
 * Stats-related examples for the Solana Tracker API
 */
import { Client, processEventsAsync } from '@solana-tracker/data-api'
import { handleError } from './utils';

// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY',
});

/**
 * Example 1: Get detailed token stats across various time intervals
 */
export async function getTokenDetailedStats(tokenAddress: string) {
  try {
    const stats = await client.getTokenStats(tokenAddress);
    
    console.log(`\n=== Detailed Stats for ${tokenAddress} ===`);
    
    // Display stats for different timeframes
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '24h'];
    
    timeframes.forEach(timeframe => {
      if (stats[timeframe]) {
        const tfStats = stats[timeframe];
        console.log(`\n${timeframe.toUpperCase()} Stats:`);
        console.log(`Price: $${tfStats.price.toFixed(6)}`);
        console.log(`Price Change: ${tfStats.priceChangePercentage.toFixed(2)}%`);
        console.log(`Transactions: ${tfStats.transactions} (${tfStats.buys} buys, ${tfStats.sells} sells)`);
        console.log(`Unique Wallets: ${tfStats.wallets}`);
        console.log(`Volume: Buy $${tfStats.volume.buys.toFixed(2)}, Sell $${tfStats.volume.sells.toFixed(2)}, Total $${tfStats.volume.total.toFixed(2)}`);
        console.log(`Unique Buyers: ${tfStats.buyers}`);
        console.log(`Unique Sellers: ${tfStats.sellers}`);
      }
    });
    
    // Extract most recent timeframe for detailed analysis
    const mostRecentTimeframe = stats['24h'] || stats['4h'] || stats['1h'] || stats['15m'] || stats['5m'] || stats['1m'];
    
    if (mostRecentTimeframe) {
      console.log('\nDetailed Analysis:');
      console.log(`Buy/Sell Ratio: ${(mostRecentTimeframe.buys / (mostRecentTimeframe.sells || 1)).toFixed(2)}`);
      console.log(`Average Buy Size: $${(mostRecentTimeframe.volume.buys / (mostRecentTimeframe.buys || 1)).toFixed(2)}`);
      console.log(`Average Sell Size: $${(mostRecentTimeframe.volume.sells / (mostRecentTimeframe.sells || 1)).toFixed(2)}`);
      
      const buyPercentage = (mostRecentTimeframe.buys / mostRecentTimeframe.transactions) * 100;
      const sellPercentage = (mostRecentTimeframe.sells / mostRecentTimeframe.transactions) * 100;
      
      console.log(`Buy Percentage: ${buyPercentage.toFixed(2)}%`);
      console.log(`Sell Percentage: ${sellPercentage.toFixed(2)}%`);
      
      const uniqueTraderPercentage = (mostRecentTimeframe.wallets / mostRecentTimeframe.transactions) * 100;
      console.log(`Unique Trader Percentage: ${uniqueTraderPercentage.toFixed(2)}%`);
    }
    
    return stats;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get detailed pool-specific stats
 */
export async function getPoolDetailedStats(tokenAddress: string, poolAddress: string) {
  try {
    const stats = await client.getPoolStats(tokenAddress, poolAddress);
    
    console.log(`\n=== Detailed Pool Stats for ${tokenAddress} (Pool: ${poolAddress}) ===`);
    
    // Display stats for different timeframes
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '24h'];
    
    timeframes.forEach(timeframe => {
      if (stats[timeframe]) {
        const tfStats = stats[timeframe];
        console.log(`\n${timeframe.toUpperCase()} Stats:`);
        console.log(`Price: $${tfStats.price.toFixed(6)}`);
        console.log(`Price Change: ${tfStats.priceChangePercentage.toFixed(2)}%`);
        console.log(`Transactions: ${tfStats.transactions} (${tfStats.buys} buys, ${tfStats.sells} sells)`);
        console.log(`Volume: $${tfStats.volume.total.toFixed(2)}`);
      }
    });
    
    return stats;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Compare stats across different time periods
 */
export async function compareTokenStats(tokenAddress: string) {
  try {
    const stats = await client.getTokenStats(tokenAddress);
    
    console.log(`\n=== Comparative Analysis for ${tokenAddress} ===`);
    
    // Extract stats from different timeframes
    const timeframes = ['1h', '4h', '24h'];
    const availableStats = timeframes.filter(tf => stats[tf]).map(tf => ({
      timeframe: tf,
      stats: stats[tf]
    }));
    
    if (availableStats.length < 2) {
      console.log('Not enough timeframes available for comparison');
      return stats;
    }
    
    console.log('\nPrice Movement:');
    availableStats.forEach(({ timeframe, stats: tfStats }) => {
      console.log(`${timeframe.toUpperCase()}: ${tfStats.priceChangePercentage > 0 ? '+' : ''}${tfStats.priceChangePercentage.toFixed(2)}%`);
    });
    
    console.log('\nVolume Comparison:');
    availableStats.forEach(({ timeframe, stats: tfStats }) => {
      console.log(`${timeframe.toUpperCase()}: $${tfStats.volume.total.toFixed(2)}`);
    });
    
    console.log('\nTransaction Count:');
    availableStats.forEach(({ timeframe, stats: tfStats }) => {
      console.log(`${timeframe.toUpperCase()}: ${tfStats.transactions} (${tfStats.buys} buys, ${tfStats.sells} sells)`);
    });
    
    console.log('\nUnique Wallet Count:');
    availableStats.forEach(({ timeframe, stats: tfStats }) => {
      console.log(`${timeframe.toUpperCase()}: ${tfStats.wallets}`);
    });
    
    // Calculate trends
    if (availableStats.length >= 2) {
      const shortTerm = availableStats[0].stats;
      const longTerm = availableStats[availableStats.length - 1].stats;
      
      console.log('\nTrend Analysis:');
      
      // Volume trend
      const volumeTrend = (shortTerm.volume.total / (longTerm.volume.total / getTimeframeHours(availableStats[availableStats.length - 1].timeframe) * getTimeframeHours(availableStats[0].timeframe)) - 1) * 100;
      console.log(`Volume Trend: ${volumeTrend > 0 ? '+' : ''}${volumeTrend.toFixed(2)}% (relative to timeframe)`);
      
      // Transaction trend
      const txTrend = (shortTerm.transactions / (longTerm.transactions / getTimeframeHours(availableStats[availableStats.length - 1].timeframe) * getTimeframeHours(availableStats[0].timeframe)) - 1) * 100;
      console.log(`Transaction Trend: ${txTrend > 0 ? '+' : ''}${txTrend.toFixed(2)}% (relative to timeframe)`);
      
      // Buy/Sell ratio trend
      const shortTermRatio = shortTerm.buys / (shortTerm.sells || 1);
      const longTermRatio = longTerm.buys / (longTerm.sells || 1);
      const ratioDiff = ((shortTermRatio / longTermRatio) - 1) * 100;
      console.log(`Buy/Sell Ratio Trend: ${ratioDiff > 0 ? '+' : ''}${ratioDiff.toFixed(2)}%`);
    }
    
    return stats;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get token events for live updates. 
 */
export async function getTokenEvents() {
  const events = await client.getEvents('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN');
  console.log(`\n=== Token Events ===`);
  console.log(events)

  // In real life applications you store events and add new trades from Datastream to it. Then run processEventsAsync to get live statistics
  console.log(`\nProcessing events...`);
  const stats = await processEventsAsync(events);
  console.log(stats['24h'])
}


/**
 * Helper function to convert timeframe to hours
 */
function getTimeframeHours(timeframe: string): number {
  switch (timeframe) {
    case '1m': return 1/60;
    case '5m': return 5/60;
    case '15m': return 15/60;
    case '30m': return 30/60;
    case '1h': return 1;
    case '4h': return 4;
    case '24h': return 24;
    default: return 1;
  }
}