/**
 * Profit and Loss (PnL) examples for the Solana Tracker API
 */
import { Client } from '@solana-tracker/data-api';
import { handleError } from './utils';


// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY_HERE'
});

// Replace with a real wallet address for testing
const EXAMPLE_WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';

/**
 * Example 1: Get PnL data for all positions in a wallet
 */
export async function getWalletProfitAndLoss(walletAddress: string = EXAMPLE_WALLET) {
  try {
    // Get detailed PnL data including historical PnL
    const pnlData = await client.getWalletPnL(walletAddress, true);
    
    console.log(`\n=== Profit and Loss for ${walletAddress} ===`);
    console.log(`Total Realized: $${pnlData.summary.realized.toFixed(2)}`);
    console.log(`Total Unrealized: $${pnlData.summary.unrealized.toFixed(2)}`);
    console.log(`Total P&L: $${pnlData.summary.total.toFixed(2)}`);
    console.log(`Total Invested: $${pnlData.summary.totalInvested.toFixed(2)}`);
    console.log(`Average Buy Amount: $${pnlData.summary.averageBuyAmount.toFixed(2)}`);
    
    console.log(`\nPerformance Metrics:`);
    console.log(`Win Rate: ${pnlData.summary.winPercentage.toFixed(2)}%`);
    console.log(`Loss Rate: ${pnlData.summary.lossPercentage.toFixed(2)}%`);
    
    if (pnlData.summary.neutralPercentage) {
      console.log(`Neutral Rate: ${pnlData.summary.neutralPercentage.toFixed(2)}%`);
    }
    
    console.log(`Total Wins: ${pnlData.summary.totalWins}`);
    console.log(`Total Losses: ${pnlData.summary.totalLosses}`);
    
    console.log('\nTop 5 Positions by Total P&L:');
    const tokenEntries = Object.entries(pnlData.tokens);
    const sortedPositions = tokenEntries.sort((a, b) => b[1].total - a[1].total);
    
    for (let i = 0; i < Math.min(5, sortedPositions.length); i++) {
      const [tokenAddress, position] = sortedPositions[i];
      console.log(`\n${i+1}. Token: ${tokenAddress}`);
      console.log(`   Total P&L: $${position.total.toFixed(2)}`);
      console.log(`   Realized: $${position.realized.toFixed(2)}`);
      console.log(`   Unrealized: $${position.unrealized.toFixed(2)}`);
      console.log(`   Current Holding: ${position.holding.toFixed(4)} tokens`);
      console.log(`   Total Held (all-time): ${position.held.toFixed(4)} tokens`);
      console.log(`   Total Sold: ${position.sold.toFixed(4)} tokens`);
      console.log(`   Current Value: $${position.current_value.toFixed(2)}`);
      console.log(`   Cost Basis: $${position.cost_basis.toFixed(6)}`);
      console.log(`   ROI: ${((position.total / position.total_invested) * 100).toFixed(2)}%`);
    }
    
    return pnlData;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 2: Get PnL for a specific token in a wallet
 */
export async function getTokenProfitAndLoss(walletAddress: string = EXAMPLE_WALLET, tokenAddress: string) {
  try {
    const tokenPnL = await client.getTokenPnL(walletAddress, tokenAddress);
    
    console.log(`\n=== Profit and Loss for ${tokenAddress} in Wallet ${walletAddress} ===`);
    console.log(`Current Holding: ${tokenPnL.holding.toFixed(4)} tokens`);
    console.log(`Total Held (all-time): ${tokenPnL.held.toFixed(4)} tokens`);
    console.log(`Total Sold: ${tokenPnL.sold.toFixed(4)} tokens`);
    
    console.log(`\nCurrent Position:`);
    console.log(`Current Value: $${tokenPnL.current_value.toFixed(2)}`);
    console.log(`Cost Basis: $${tokenPnL.cost_basis.toFixed(6)}`);
    
    console.log(`\nProfit/Loss:`);
    console.log(`Realized P&L: $${tokenPnL.realized.toFixed(2)}`);
    console.log(`Unrealized P&L: $${tokenPnL.unrealized.toFixed(2)}`);
    console.log(`Total P&L: $${tokenPnL.total.toFixed(2)}`);
    console.log(`Total Invested: $${tokenPnL.total_invested.toFixed(2)}`);
    console.log(`Average Buy Amount: $${tokenPnL.average_buy_amount.toFixed(2)}`);
    
    if (tokenPnL.first_buy_time) {
      console.log(`\nTrading History:`);
      console.log(`First Buy: ${new Date(tokenPnL.first_buy_time).toLocaleString()}`);
      
      if (tokenPnL.last_buy_time) {
        console.log(`Last Buy: ${new Date(tokenPnL.last_buy_time).toLocaleString()}`);
      }
      
      if (tokenPnL.last_sell_time) {
        console.log(`Last Sell: ${new Date(tokenPnL.last_sell_time).toLocaleString()}`);
      }
      
      if (tokenPnL.last_trade_time) {
        console.log(`Last Trade: ${new Date(tokenPnL.last_trade_time).toLocaleString()}`);
      }
      
      if (tokenPnL.buy_transactions) {
        console.log(`Buy Transactions: ${tokenPnL.buy_transactions}`);
      }
      
      if (tokenPnL.sell_transactions) {
        console.log(`Sell Transactions: ${tokenPnL.sell_transactions}`);
      }
      
      if (tokenPnL.total_transactions) {
        console.log(`Total Transactions: ${tokenPnL.total_transactions}`);
      }
    }
    
    // Calculate ROI
    const roi = (tokenPnL.total / tokenPnL.total_invested) * 100;
    console.log(`\nROI: ${roi.toFixed(2)}%`);
    
    return tokenPnL;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Get the first buyers of a token with PnL data
 */
export async function getFirstBuyers(tokenAddress: string) {
  try {
    const firstBuyers = await client.getFirstBuyers(tokenAddress);
    
    console.log(`\n=== First Buyers for ${tokenAddress} ===`);
    console.log(`Total First Buyers: ${firstBuyers.length}`);
    
    console.log('\nTop 5 First Buyers by P&L:');
    const sortedBuyers = [...firstBuyers].sort((a, b) => b.total - a.total);
    
    for (let i = 0; i < Math.min(5, sortedBuyers.length); i++) {
      const buyer = sortedBuyers[i];
      console.log(`\n${i+1}. Wallet: ${buyer.wallet.slice(0, 6)}...${buyer.wallet.slice(-4)}`);
      console.log(`   First Buy: ${new Date(buyer.first_buy_time).toLocaleString()}`);
      console.log(`   Last Transaction: ${new Date(buyer.last_transaction_time).toLocaleString()}`);
      console.log(`   Total P&L: ${buyer.total.toFixed(2)}`);
      console.log(`   Realized P&L: ${buyer.realized.toFixed(2)}`);
      console.log(`   Unrealized P&L: ${buyer.unrealized.toFixed(2)}`);
      console.log(`   Total Invested: ${buyer.total_invested.toFixed(2)}`);
      console.log(`   Current Holding: ${buyer.holding.toFixed(4)} tokens`);
      console.log(`   Total Held: ${buyer.held.toFixed(4)} tokens`);
      console.log(`   Total Sold: ${buyer.sold.toFixed(4)} tokens`);
      
      // Calculate ROI
      const roi = (buyer.total / buyer.total_invested) * 100;
      console.log(`   ROI: ${roi.toFixed(2)}%`);
    }
    
    // Calculate average statistics
    const avgPnL = firstBuyers.reduce((sum, buyer) => sum + buyer.total, 0) / firstBuyers.length;
    const profitableBuyers = firstBuyers.filter(buyer => buyer.total > 0);
    const profitPercentage = (profitableBuyers.length / firstBuyers.length) * 100;
    
    console.log('\nSummary Statistics:');
    console.log(`Average P&L: ${avgPnL.toFixed(2)}`);
    console.log(`Profitable Buyers: ${profitableBuyers.length} (${profitPercentage.toFixed(2)}%)`);
    console.log(`Average Investment: ${(firstBuyers.reduce((sum, buyer) => sum + buyer.total_invested, 0) / firstBuyers.length).toFixed(2)}`);
    
    return firstBuyers;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Get top traders for a token
 */
export async function getTopTradersForToken(tokenAddress: string) {
  try {
    const topTraders = await client.getTokenTopTraders(tokenAddress);
    
    console.log(`\n=== Top Traders for ${tokenAddress} ===`);
    console.log(`Total Traders: ${topTraders.length}`);
    
    console.log('\nTop 5 Traders by P&L:');
    for (let i = 0; i < Math.min(5, topTraders.length); i++) {
      const trader = topTraders[i];
      console.log(`\n${i+1}. Wallet: ${trader.wallet.slice(0, 6)}...${trader.wallet.slice(-4)}`);
      console.log(`   Total P&L: ${trader.total.toFixed(2)}`);
      console.log(`   Realized P&L: ${trader.realized.toFixed(2)}`);
      console.log(`   Unrealized P&L: ${trader.unrealized.toFixed(2)}`);
      console.log(`   Total Invested: ${trader.total_invested.toFixed(2)}`);
      console.log(`   Held: ${trader.held.toFixed(2)} tokens`);
      console.log(`   Sold: ${trader.sold.toFixed(2)} tokens`);
      console.log(`   Current Holding: ${trader.holding.toFixed(2)} tokens`);
      
      // Calculate ROI
      const roi = (trader.total / trader.total_invested) * 100;
      console.log(`   ROI: ${roi.toFixed(2)}%`);
    }
    
    return topTraders;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 5: Get top traders across all tokens
 */
export async function getTopTraders(page: number = 1) {
  try {
    const topTraders = await client.getTopTraders(page, true, 'total');
    
    console.log(`\n=== Top Traders Across All Tokens (Page ${page}) ===`);
    console.log(`Traders on this page: ${topTraders.wallets.length}`);
    
    topTraders.wallets.slice(0, 5).forEach((trader, index) => {
      console.log(`\n${index+1}. Wallet: ${trader.wallet.slice(0, 6)}...${trader.wallet.slice(-4)}`);
      console.log(`   Total P&L: ${trader.summary.total.toFixed(2)}`);
      console.log(`   Realized P&L: ${trader.summary.realized.toFixed(2)}`);
      console.log(`   Unrealized P&L: ${trader.summary.unrealized.toFixed(2)}`);
      console.log(`   Total Invested: ${trader.summary.totalInvested.toFixed(2)}`);
      console.log(`   Win Rate: ${trader.summary.winPercentage.toFixed(2)}%`);
      console.log(`   Win/Loss: ${trader.summary.totalWins}/${trader.summary.totalLosses}`);
      
      // Calculate ROI
      const roi = (trader.summary.total / trader.summary.totalInvested) * 100;
      console.log(`   ROI: ${roi.toFixed(2)}%`);
    });
    
    return topTraders;
  } catch (error) {
    handleError(error);
    return null;
  }
}
