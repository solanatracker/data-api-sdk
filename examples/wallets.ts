/**
 * Wallet-related examples for the Solana Tracker API
 */
import { Client } from '@solanatracker/data-api'
import { handleError } from './utils';


// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

// Replace with a real wallet address for testing
const EXAMPLE_WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';

/**
 * Example 1: Get basic wallet information
 */
export async function getWalletBasicInfo(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const walletInfo = await client.getWalletBasic(walletAddress);
    
    console.log('\n=== Basic Wallet Information ===');
    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`Total Value: $${walletInfo.total.toFixed(2)}`);
    console.log(`Total SOL Value: ${walletInfo.totalSol.toFixed(4)} SOL`);
    console.log(`Total Tokens: ${walletInfo.tokens.length}`);
    
    console.log('\nTop 5 Holdings:');
    const sortedTokens = [...walletInfo.tokens].sort((a, b) => b.value - a.value);
    
    for (let i = 0; i < Math.min(5, sortedTokens.length); i++) {
      const token = sortedTokens[i];
      console.log(`\n${i+1}. ${token.address}`);
      console.log(`   Balance: ${token.balance.toFixed(6)}`);
      console.log(`   Value: $${token.value.toFixed(2)}`);
      console.log(`   Price: $${token.price.usd.toFixed(6)}`);
    }
    
    return walletInfo;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get detailed wallet information
 */
export async function getWalletDetailedInfo(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const walletInfo = await client.getWallet(walletAddress);
    
    console.log('\n=== Detailed Wallet Information ===');
    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`Total Value: $${walletInfo.total.toFixed(2)}`);
    console.log(`Total SOL Value: ${walletInfo.totalSol.toFixed(4)} SOL`);
    console.log(`Timestamp: ${walletInfo.timestamp}`);
    console.log(`Total Tokens: ${walletInfo.tokens.length}`);
    
    console.log('\nTop 5 Holdings (with details):');
    const sortedTokens = [...walletInfo.tokens].sort((a, b) => b.value - a.value);
    
    for (let i = 0; i < Math.min(5, sortedTokens.length); i++) {
      const token = sortedTokens[i];
      console.log(`\n${i+1}. ${token.token.name} (${token.token.symbol})`);
      console.log(`   Balance: ${token.balance.toFixed(6)}`);
      console.log(`   Value: $${token.value.toFixed(2)}`);
      
      if (token.pools && token.pools.length > 0) {
        const pool = token.pools[0];
        console.log(`   Price: $${pool.price.usd.toFixed(6)}`);
        console.log(`   Market Cap: $${(pool.marketCap.usd / 1000000).toFixed(2)}M`);
      }
      
      if (token.risk) {
        console.log(`   Risk Score: ${token.risk.score}/10`);
      }
    }
    
    return walletInfo;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get wallet information with pagination
 */
export async function getWalletWithPagination(walletAddress: string = EXAMPLE_WALLET, page: number = 1) {
  try {
    const walletInfo = await client.getWalletPage(walletAddress, page);
    
    console.log(`\n=== Wallet Information (Page ${page}) ===`);
    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`Total Value: $${walletInfo.total.toFixed(2)}`);
    console.log(`Total SOL Value: ${walletInfo.totalSol.toFixed(4)} SOL`);
    console.log(`Tokens on Page ${page}: ${walletInfo.tokens.length}`);
    
    console.log('\nTokens on This Page:');
    
    walletInfo.tokens.forEach((token, index) => {
      console.log(`\n${index+1}. ${token.token.name || token.token.mint} (${token.token.symbol || 'Unknown Symbol'})`);
      console.log(`   Balance: ${token.balance.toFixed(6)}`);
      console.log(`   Value: $${token.value.toFixed(2)}`);
    });
    
    return walletInfo;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Get wallet trade history
 */
export async function getWalletTrades(walletAddress: string = EXAMPLE_WALLET) {
  try {
    // Get with metadata and Jupiter parsing
    const trades = await client.getWalletTrades(walletAddress, undefined, true, true);
    
    console.log('\n=== Wallet Trade History ===');
    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`Trades Found: ${trades.trades.length}`);
    
    console.log('\nRecent Trades:');
    trades.trades.slice(0, 5).forEach((trade, index) => {
      console.log(`\n${index+1}. Transaction: ${trade.tx.slice(0, 8)}...`);
      console.log(`   Time: ${new Date(trade.time).toLocaleString()}`);
      
      if (trade.token) {
        // If trade has detailed token info
        console.log(`   From: ${trade.token.from.amount} ${trade.token.from.token?.symbol || trade.token.from.address.slice(0, 6)+'...'}`);
        console.log(`   To: ${trade.token.to.amount} ${trade.token.to.token?.symbol || trade.token.to.address.slice(0, 6)+'...'}`);
      } else if (trade.type) {
        // If trade has type info
        console.log(`   Type: ${trade.type.toUpperCase()}`);
        console.log(`   Amount: ${trade.amount}`);
        console.log(`   Price: $${trade.priceUsd?.toFixed(6) || 'N/A'}`);
      }
      
      if (trade.volume) {
        console.log(`   Volume: $${trade.volume.toFixed(2)}`);
      } else if (trade.solVolume) {
        console.log(`   Volume: ${trade.solVolume.toFixed(4)} SOL`);
      }
      
      console.log(`   Program: ${trade.program}`);
    });
    
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
 * Example 5: Get wallet trades with pagination using cursor
 */
export async function getWalletTradesWithCursor(walletAddress: string = EXAMPLE_WALLET, cursor?: number) {
  try {
    const trades = await client.getWalletTrades(walletAddress, cursor, true, true);
    
    console.log(`\n=== Wallet Trade History ${cursor ? '(With Cursor)' : ''} ===`);
    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`Trades Found: ${trades.trades.length}`);
    
    console.log('\nTrades:');
    trades.trades.slice(0, 5).forEach((trade, index) => {
      console.log(`\n${index+1}. Transaction: ${trade.tx.slice(0, 8)}...`);
      console.log(`   Time: ${new Date(trade.time).toLocaleString()}`);
      
      if (trade.token) {
        console.log(`   From: ${trade.token.from.amount} ${trade.token.from.token?.symbol || trade.token.from.address.slice(0, 6)+'...'}`);
        console.log(`   To: ${trade.token.to.amount} ${trade.token.to.token?.symbol || trade.token.to.address.slice(0, 6)+'...'}`);
      }
    });
    
    if (trades.hasNextPage) {
      console.log(`\nMore trades available. Next cursor: ${trades.nextCursor}`);
      console.log(`To get the next page, call this function with cursor: ${trades.nextCursor}`);
    } else {
      console.log(`\nNo more trades available.`);
    }
    
    return trades;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 6: Get wallet chart (PnL of total value over time)
 */
export async function getWalletChart(walletAddress: string = EXAMPLE_WALLET) {
  try {
    const chart = await client.getWalletChart(walletAddress);
  
    console.log('\n=== Wallet Chart (PnL Over Time) ===');
    console.log(chart);
    
    return chart;
  } catch (error) {
    handleError(error);
    return null;
  }
}
