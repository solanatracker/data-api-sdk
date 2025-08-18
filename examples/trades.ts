/**
 * Trade-related examples for the Solana Tracker API
 */
import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';

// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE'
});

/**
 * Example 1: Get trades for a token
 */
export async function getTokenTrades(tokenAddress: string) {
  try {
    // Get trades with metadata and Jupiter parsing
    const trades = await client.getTokenTrades(tokenAddress, undefined, true, true);
    
    console.log(`\n=== Recent Trades for ${tokenAddress} ===`);
    console.log(`Trades Found: ${trades.trades.length}`);
    
    console.log('\nMost Recent Trades:');
    trades.trades.slice(0, 5).forEach((trade, index) => {
      console.log(`\n${index+1}. Transaction: ${trade.tx.slice(0, 8)}...`);
      console.log(`   Time: ${new Date(trade.time).toLocaleString()}`);
      console.log(`   Type: ${trade.type?.toUpperCase() || 'N/A'}`);
      console.log(`   Amount: ${trade.amount?.toLocaleString() || 'N/A'}`);
      console.log(`   Price: $${trade.priceUsd?.toFixed(6) || 'N/A'}`);
      
      if (trade.volume) {
        console.log(`   Volume: $${trade.volume.toFixed(2)}`);
      }
      
      console.log(`   Wallet: ${trade.wallet.slice(0, 6)}...${trade.wallet.slice(-4)}`);
      console.log(`   Program: ${trade.program}`);
    });
    
    // Calculate some statistics if there are trades
    if (trades.trades.length > 0) {
      let buyCount = 0;
      let sellCount = 0;
      let totalVolume = 0;
      
      trades.trades.forEach(trade => {
        if (trade.type === 'buy') buyCount++;
        if (trade.type === 'sell') sellCount++;
        if (trade.volume) totalVolume += trade.volume;
      });
      
      console.log('\nTrade Statistics:');
      console.log(`Buy Transactions: ${buyCount}`);
      console.log(`Sell Transactions: ${sellCount}`);
      console.log(`Buy/Sell Ratio: ${(buyCount / (sellCount || 1)).toFixed(2)}`);
      console.log(`Total Volume: $${totalVolume.toFixed(2)}`);
      console.log(`Average Transaction Size: $${(totalVolume / trades.trades.length).toFixed(2)}`);
    }
    
    if (trades.hasNextPage) {
      console.log(`\nMore trades available. Next cursor: ${trades.nextCursor}`);
    }
    
    return trades;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get trades for a specific token and pool
 */
export async function getPoolTrades(tokenAddress: string, poolAddress: string) {
  try {
    const trades = await client.getPoolTrades(tokenAddress, poolAddress, undefined, true);
    
    console.log(`\n=== Recent Trades for ${tokenAddress} in Pool ${poolAddress} ===`);
    console.log(`Trades Found: ${trades.trades.length}`);
    
    trades.trades.slice(0, 5).forEach((trade, index) => {
      console.log(`\n${index+1}. Transaction: ${trade.tx.slice(0, 8)}...`);
      console.log(`   Time: ${new Date(trade.time).toLocaleString()}`);
      console.log(`   Type: ${trade.type?.toUpperCase() || 'N/A'}`);
      console.log(`   Amount: ${trade.amount?.toLocaleString() || 'N/A'}`);
      console.log(`   Price: $${trade.priceUsd?.toFixed(6) || 'N/A'}`);
    });
    
    return trades;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get user-specific token trades
 */
export async function getUserTokenTrades(tokenAddress: string, walletAddress: string) {
  try {
    const trades = await client.getUserTokenTrades(tokenAddress, walletAddress, undefined, true);
    
    console.log(`\n=== Trades for ${tokenAddress} by Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} ===`);
    console.log(`Trades Found: ${trades.trades.length}`);
    
    if (trades.trades.length > 0) {
      trades.trades.forEach((trade, index) => {
        console.log(`\n${index+1}. Transaction: ${trade.tx.slice(0, 8)}...`);
        console.log(`   Time: ${new Date(trade.time).toLocaleString()}`);
        console.log(`   Type: ${trade.type?.toUpperCase() || 'N/A'}`);
        console.log(`   Amount: ${trade.amount?.toLocaleString() || 'N/A'}`);
        console.log(`   Price: $${trade.priceUsd?.toFixed(6) || 'N/A'}`);
        if (trade.volume) {
          console.log(`   Volume: $${trade.volume.toFixed(2)}`);
        }
      });
      
      // Calculate trade statistics
      let buyCount = 0;
      let sellCount = 0;
      let totalVolume = 0;
      let firstTradeTime = trades.trades[trades.trades.length - 1].time;
      let lastTradeTime = trades.trades[0].time;
      
      trades.trades.forEach(trade => {
        if (trade.type === 'buy') buyCount++;
        if (trade.type === 'sell') sellCount++;
        if (trade.volume) totalVolume += trade.volume;
      });
      
      const tradingPeriodDays = (lastTradeTime - firstTradeTime) / (1000 * 60 * 60 * 24);
      
      console.log('\nTrading Statistics:');
      console.log(`First Trade: ${new Date(firstTradeTime).toLocaleString()}`);
      console.log(`Last Trade: ${new Date(lastTradeTime).toLocaleString()}`);
      console.log(`Trading Period: ${tradingPeriodDays.toFixed(1)} days`);
      console.log(`Buy Transactions: ${buyCount}`);
      console.log(`Sell Transactions: ${sellCount}`);
      console.log(`Total Volume: $${totalVolume.toFixed(2)}`);
      console.log(`Average Transaction Size: $${(totalVolume / trades.trades.length).toFixed(2)}`);
    } else {
      console.log('\nNo trades found for this wallet and token combination.');
    }
    
    return trades;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Analyze token trading activity over time
 */
export async function analyzeTokenTradingActivity(tokenAddress: string) {
  try {
    // Get a large number of trades
    let allTrades: any[] = [];
    let cursor: number | undefined = undefined;
    let hasMore = true;
    
    // Fetch up to 3 pages of trades (adjust as needed)
    for (let i = 0; i < 3 && hasMore; i++) {
      const trades = await client.getTokenTrades(tokenAddress, cursor);
      allTrades = allTrades.concat(trades.trades);
      
      hasMore = trades.hasNextPage || false;
      cursor = trades.nextCursor;
      
      // Avoid rate limits
      if (hasMore) await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n=== Trading Activity Analysis for ${tokenAddress} ===`);
    console.log(`Total Trades Analyzed: ${allTrades.length}`);
    
    if (allTrades.length === 0) {
      console.log('No trades found to analyze.');
      return null;
    }
    
    // Group trades by hour
    const tradesByHour: { [hour: string]: any[] } = {};
    allTrades.forEach(trade => {
      const date = new Date(trade.time);
      const hourKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
      
      if (!tradesByHour[hourKey]) {
        tradesByHour[hourKey] = [];
      }
      
      tradesByHour[hourKey].push(trade);
    });
    
    // Analyze trading patterns
    console.log('\nHourly Trading Activity:');
    const hourlyStats = Object.entries(tradesByHour).map(([hour, trades]) => {
      const buyTrades = trades.filter(t => t.type === 'buy');
      const sellTrades = trades.filter(t => t.type === 'sell');
      const totalVolume = trades.reduce((sum, t) => sum + (t.volume || 0), 0);
      
      return {
        hour,
        totalTrades: trades.length,
        buyTrades: buyTrades.length,
        sellTrades: sellTrades.length,
        ratio: buyTrades.length / (sellTrades.length || 1),
        volume: totalVolume
      };
    });
    
    // Sort by date/hour
    hourlyStats.sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime());
    
    // Display the most active hours
    hourlyStats.slice(-5).forEach(stat => {
      console.log(`\nHour: ${stat.hour}`);
      console.log(`Total Trades: ${stat.totalTrades}`);
      console.log(`Buy/Sell: ${stat.buyTrades}/${stat.sellTrades} (Ratio: ${stat.ratio.toFixed(2)})`);
      console.log(`Volume: $${stat.volume.toFixed(2)}`);
    });
    
    // Overall statistics
    const totalBuys = allTrades.filter(t => t.type === 'buy').length;
    const totalSells = allTrades.filter(t => t.type === 'sell').length;
    const totalVolume = allTrades.reduce((sum, t) => sum + (t.volume || 0), 0);
    
    console.log('\nOverall Statistics:');
    console.log(`Total Buys: ${totalBuys} (${((totalBuys / allTrades.length) * 100).toFixed(1)}%)`);
    console.log(`Total Sells: ${totalSells} (${((totalSells / allTrades.length) * 100).toFixed(1)}%)`);
    console.log(`Buy/Sell Ratio: ${(totalBuys / (totalSells || 1)).toFixed(2)}`);
    console.log(`Total Volume: $${totalVolume.toFixed(2)}`);
    console.log(`Average Trade Size: $${(totalVolume / allTrades.length).toFixed(2)}`);
    
    return { trades: allTrades, hourlyStats };
  } catch (error) {
    handleError(error);
    return null;
  }
}