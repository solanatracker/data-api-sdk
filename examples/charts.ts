import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';

const client = new Client({
  apiKey: process.env.SOLANA_TRACKER_API_KEY || 'YOUR_API_KEY_HERE'
});

// Get OHLCV chart data for a token
export async function getTokenChartData(tokenAddress: string, timeframe: string = '1h', currency: 'usd' | 'eur' | 'sol' = 'usd') {
  try {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (7 * 24 * 60 * 60); // Last 7 days
    
    const chart = await client.getChartData({
      tokenAddress,
      type: timeframe,
      timeFrom: startTime,
      timeTo: now,
      removeOutliers: true,
      dynamicPools: true,
      fastCache: true,
      currency
    });
    
    const currencySymbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : '';
    const currencySuffix = currency === 'sol' ? ' SOL' : '';
    
    console.log(`\n📈 Chart ${timeframe} in ${currency.toUpperCase()} (${chart.oclhv.length} candles):`);
    
    if (chart.oclhv.length > 0) {
      const first = chart.oclhv[0];
      const last = chart.oclhv[chart.oclhv.length - 1];
      const change = ((last.close - first.open) / first.open) * 100;
      
      console.log(`Start: ${currencySymbol}${first.open.toFixed(6)}${currencySuffix} → End: ${currencySymbol}${last.close.toFixed(6)}${currencySuffix} (${change.toFixed(1)}%)`);
      
      let high = Math.max(...chart.oclhv.map(c => c.high));
      let low = Math.min(...chart.oclhv.map(c => c.low));
      let volume = chart.oclhv.reduce((sum, c) => sum + c.volume, 0);
      
      console.log(`High: ${currencySymbol}${high.toFixed(6)}${currencySuffix} / Low: ${currencySymbol}${low.toFixed(6)}${currencySuffix}`);
      console.log(`Volume: $${volume.toFixed(0)}`);
    }
    
    return chart;
  } catch (error) {
    handleError(error);
  }
}

// Chart for specific pool
export async function getPoolChartData(tokenAddress: string, poolAddress: string, timeframe: string = '1h', currency: 'usd' | 'eur' | 'sol' = 'usd') {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const chart = await client.getPoolChartData({
      tokenAddress,
      poolAddress,
      type: timeframe,
      timeTo: now,
      fastCache: true,
      currency
    });
    
    const currencySymbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : '';
    const currencySuffix = currency === 'sol' ? ' SOL' : '';
    
    console.log(`\n📊 Pool Chart ${timeframe} in ${currency.toUpperCase()}:`);
    console.log(`Candles: ${chart.oclhv.length}`);
    
    if (chart.oclhv.length > 0) {
      const first = chart.oclhv[0];
      const last = chart.oclhv[chart.oclhv.length - 1];
      const change = ((last.close - first.open) / first.open) * 100;
      
      console.log(`${currencySymbol}${first.open.toFixed(6)}${currencySuffix} → ${currencySymbol}${last.close.toFixed(6)}${currencySuffix} (${change.toFixed(1)}%)`);
    }
    
    return chart;
  } catch (error) {
    handleError(error);
  }
}

// Compare different timeframes
export async function compareTimeframes(tokenAddress: string) {
  try {
    const timeframes = ['5m', '1h', '1d'];
    const days = [1, 7, 30];
    
    console.log(`\n⏱️ Timeframe Comparison:`);
    
    for (let i = 0; i < timeframes.length; i++) {
      const timeframe = timeframes[i];
      const daysToFetch = days[i];
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now - (daysToFetch * 24 * 60 * 60);
      
      const chart = await client.getChartData(tokenAddress, timeframe, startTime, now);
      
      if (chart.oclhv.length > 0) {
        const first = chart.oclhv[0];
        const last = chart.oclhv[chart.oclhv.length - 1];
        const change = ((last.close - first.open) / first.open) * 100;
        
        console.log(`${timeframe} (${daysToFetch}d): ${change.toFixed(1)}%`);
      }
    }
  } catch (error) {
    handleError(error);
  }
}

// Track holder growth
export async function getHolderCountChart(tokenAddress: string, days: number = 30) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (days * 24 * 60 * 60);
    
    const holders = await client.getHoldersChart(tokenAddress, '1d', startTime, now);
    
    console.log(`\n👥 Holder Growth (${days}d):`);
    
    if (holders.holders.length > 0) {
      const first = holders.holders[0];
      const last = holders.holders[holders.holders.length - 1];
      const change = last.holders - first.holders;
      const pct = (change / first.holders) * 100;
      
      console.log(`${first.holders} → ${last.holders} holders (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%)`);
    }
    
    return holders;
  } catch (error) {
    handleError(error);
  }
}

// Track market cap changes
export async function getMarketCapChart(tokenAddress: string, days: number = 30) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (days * 24 * 60 * 60);
    
    const chart = await client.getChartData(tokenAddress, '1d', startTime, now, true);
    
    console.log(`\n💹 Market Cap (${days}d):`);
    
    if (chart.oclhv.length > 0) {
      const first = chart.oclhv[0];
      const last = chart.oclhv[chart.oclhv.length - 1];
      const change = ((last.close - first.close) / first.close) * 100;
      
      console.log(`$${(first.close / 1000000).toFixed(2)}M → $${(last.close / 1000000).toFixed(2)}M (${change.toFixed(1)}%)`);
    }
    
    return chart;
  } catch (error) {
    handleError(error);
  }
}