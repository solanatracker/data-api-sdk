/**
 * Token-related examples for the Solana Tracker API
 */
import { Client } from '@solanatracker/data-api'
import { handleError } from './utils';

// Initialize the API client with your API key
const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

/**
 * Example 1: Get token info
 */
export async function getTokenInfo() {
  try {
    // SOL token address
    const solAddress = 'So11111111111111111111111111111111111111112';
    const tokenInfo = await client.getTokenInfo(solAddress);
    
    console.log('\n=== Token Info ===');
    console.log(`Name: ${tokenInfo.token.name} (${tokenInfo.token.symbol})`);
    console.log(`Decimals: ${tokenInfo.token.decimals}`);
    
    if (tokenInfo.pools.length > 0) {
      console.log(`\nPool Information:`);
      console.log(`Price (USD): $${tokenInfo.pools[0].price.usd.toFixed(6)}`);
      console.log(`Market Cap (USD): $${(tokenInfo.pools[0].marketCap.usd / 1000000).toFixed(2)}M`);
      console.log(`Liquidity (USD): $${(tokenInfo.pools[0].liquidity.usd / 1000000).toFixed(2)}M`);
    }
    
    console.log(`\nHolders: ${tokenInfo.holders || 'Not available'}`);
    
    if (tokenInfo.risk) {
      console.log(`\nRisk Score: ${tokenInfo.risk.score}/10`);
      if (tokenInfo.risk.risks.length > 0) {
        console.log('Risk Factors:');
        tokenInfo.risk.risks.forEach(risk => {
          console.log(`- ${risk.name}: ${risk.description} (Level: ${risk.level})`);
        });
      }
    }
    
    return tokenInfo;
  } catch (error) {
    handleError(error);
    return null;
  }
}


/**
 * Example 2: Get trending tokens
 */
export async function getTrendingTokens() {
  try {
    const trendingTokens = await client.getTrendingTokens('1h');
    
    console.log('\n=== Top 5 Trending Tokens (1h) ===');
    
    for (let i = 0; i < Math.min(5, trendingTokens.length); i++) {
      const token = trendingTokens[i];
      console.log(`\n${i+1}. ${token.token.name} (${token.token.symbol})`);
      
      if (token.pools.length > 0) {
        const pool = token.pools[0];
        console.log(`   Price: $${pool.price.usd.toFixed(6)}`);
        console.log(`   Market Cap: $${(pool.marketCap.usd / 1000000).toFixed(2)}M`);
        console.log(`   Liquidity: $${(pool.liquidity.usd / 1000).toFixed(2)}k`);
      }
      
      if (token.events['24h']) {
        console.log(`   24h Change: ${token.events['24h'].priceChangePercentage.toFixed(2)}%`);
      }
    }
    
    return trendingTokens;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 3: Search for tokens
 */
export async function searchTokens(query: string) {
  try {
    const results = await client.searchTokens({
      query,
      minLiquidity: 10000,  // Minimum $10k liquidity
      sortBy: 'marketCapUsd',
      sortOrder: 'desc',
      limit: 5
    });
    
    console.log(`\n=== Search Results for "${query}" ===`);
    
    results.data.forEach((token, index) => {
      console.log(`\n${index+1}. ${token.name} (${token.symbol})`);
      console.log(`   Address: ${token.mint}`);
      console.log(`   Price: $${token.priceUsd.toFixed(6)}`);
      console.log(`   Market Cap: $${(token.marketCapUsd / 1000000).toFixed(2)}M`);
      console.log(`   Liquidity: $${(token.liquidityUsd / 1000).toFixed(2)}k`);
      console.log(`   Transactions: ${token.totalTransactions} (${token.buy} buys, ${token.sells} sells)`);
    });
    
    return results;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 4: Get token holders
 */
export async function getTokenHolders(tokenAddress: string) {
  try {
    const holders = await client.getTokenHolders(tokenAddress);
    
    console.log(`\n=== Holder Information for ${tokenAddress} ===`);
    console.log(`Total Holders: ${holders.total}`);
    
    console.log(`\nTop 5 Holders:`);
    for (let i = 0; i < Math.min(5, holders.accounts.length); i++) {
      const holder = holders.accounts[i];
      console.log(`${i+1}. Wallet: ${holder.wallet}`);
      console.log(`   Amount: ${holder.amount.toLocaleString()}`);
      console.log(`   Value: $${holder.value.usd.toLocaleString()}`);
      console.log(`   Percentage: ${holder.percentage.toFixed(2)}%`);
    }
    
    return holders;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 5: Get multiple tokens at once
 */
export async function getMultipleTokens() {
  try {
    // Example token addresses
    const tokenAddresses = [
      'So11111111111111111111111111111111111111112', // SOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
    ];
    
    const tokens = await client.getMultipleTokens(tokenAddresses);
    
    console.log('\n=== Multiple Tokens Information ===');
    
    tokenAddresses.forEach((address, index) => {
      const token = tokens.tokens[address];
      console.log(`\n${index+1}. ${token.token.name} (${token.token.symbol})`);
      
      if (token.pools.length > 0) {
        const pool = token.pools[0];
        console.log(`   Price: $${pool.price.usd.toFixed(6)}`);
        console.log(`   Market Cap: $${(pool.marketCap.usd / 1000000).toFixed(2)}M`);
      }
      
      console.log(`   Holders: ${token.holders || 'Not available'}`);
    });
    
    return tokens;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Example 6: Get a Pumpvision / Memescope style token overview
 */
export async function getTokenOverview() {
  try {

    const tokens = await client.getTokenOverview(100);
    
    console.log('\n=== Token Overview ===');
    console.log(tokens);
    
    return tokens;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getTokensByDeployer(deployer: string, page: number = 1, limit: number = 100) {
  try {
    const tokens = await client.getTokensByDeployer(deployer, page, limit);
    
    console.log(`\n=== Tokens by Deployer (${deployer}) - Page ${page} ===`);
   
    console.log(tokens);
    
    return tokens;
  } catch (error) {
    handleError(error);
    return null;
  }
}
