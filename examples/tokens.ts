import { Client } from '@solana-tracker/data-api'
import { handleError } from './utils';

const client = new Client({
  apiKey: process.env.SOLANA_TRACKER_API_KEY || 'YOUR_API_KEY'
});

// Get info for a single token
export async function getTokenInfo() {
  try {
    const solAddress = 'So11111111111111111111111111111111111111112';
    const tokenInfo = await client.getTokenInfo(solAddress);
    
    console.log('\nToken: ', tokenInfo.token.name, `(${tokenInfo.token.symbol})`);
    
    if (tokenInfo.pools.length > 0) {
      const pool = tokenInfo.pools[0];
      console.log('Price:', `$${pool.price.usd.toFixed(6)}`);
      console.log('Market Cap:', `$${(pool.marketCap.usd / 1000000).toFixed(2)}M`);
      console.log('Liquidity:', `$${(pool.liquidity.usd / 1000000).toFixed(2)}M`);
      console.log('Holders:', tokenInfo.holders);
    }
    
    return tokenInfo;
  } catch (error) {
    handleError(error);
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
// Find trending tokens
export async function getTrendingTokens() {
  try {
    const trending = await client.getTrendingTokens('1h');
    
    console.log('\n📈 Top Trending (1h):');
    trending.slice(0, 5).forEach((token, i) => {
      const pool = token.pools[0];
      const change = token.events['1h']?.priceChangePercentage || 0;
      console.log(`${i + 1}. ${token.token.symbol} - $${pool.price.usd.toFixed(6)} (${change.toFixed(1)}%)`);
    });
    
    return trending;
  } catch (error) {
    handleError(error);
  }
}

// Find best performers
export async function getTopPerformers() {
  try {
    const performers = await client.getTopPerformers('1h');
    
    console.log('\n🚀 Top Performers (1h):');
    performers.slice(0, 5).forEach((token, i) => {
      const pool = token.pools[0];
      const change = token.events['1h']?.priceChangePercentage || 0;
      console.log(`${i + 1}. ${token.token.symbol} - ${change.toFixed(1)}% gain at $${pool.price.usd.toFixed(6)}`);
    });
    
    return performers;
  } catch (error) {
    handleError(error);
  }
}

// Search for tokens by criteria
export async function searchTokens(query: string) {
  try {
    const results = await client.searchTokens({
      query,
      minLiquidity: 10000,
      sortBy: 'marketCapUsd',
      sortOrder: 'desc',
      limit: 10
    });
    
    console.log(`\n🔍 Search results for "${query}":`);
    results.data.forEach((token, i) => {
      console.log(`${i + 1}. ${token.name} (${token.symbol})`);
      console.log(`   Market Cap: $${(token.marketCapUsd / 1000000).toFixed(2)}M - Liquidity: $${(token.liquidityUsd / 1000).toFixed(2)}k`);
    });
    
    return results;
  } catch (error) {
    handleError(error);
  }
}

// Check token holders
export async function getTokenHolders(tokenAddress: string) {
  try {
    const holders = await client.getTokenHolders(tokenAddress);
    
    console.log(`\n👥 Holder info for ${tokenAddress}:`);
    console.log(`Total holders: ${holders.total}`);
    console.log('\nTop 5:');
    
    holders.accounts.slice(0, 5).forEach((holder, i) => {
      console.log(`${i + 1}. ${holder.wallet.slice(0, 8)}... - ${holder.percentage.toFixed(2)}% (${holder.amount.toLocaleString()} tokens)`);
    });
    
    return holders;
  } catch (error) {
    handleError(error);
  }
}

// Get multiple tokens at once
export async function getMultipleTokens() {
  try {
    const addresses = [
      'So11111111111111111111111111111111111111112', // SOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
    ];
    
    const tokens = await client.getMultipleTokens(addresses);
    
    console.log('\n📊 Token batch:');
    Object.entries(tokens.tokens).forEach(([address, token]) => {
      const pool = token.pools[0];
      console.log(`${token.token.symbol}: $${pool.price.usd.toFixed(6)} - ${token.holders} holders`);
    });
    
    return tokens;
  } catch (error) {
    handleError(error);
  }
}

// View token overview / memescope style
export async function getTokenOverview() {
  try {
    const overview = await client.getTokenOverview({
      limit: 50,
      minLiquidity: 50000,
      reduceSpam: true
    });
    
    console.log('\n📋 Token Overview:');
    console.log(`Latest tokens: ${overview.latest.length}`);
    console.log(`Graduating: ${overview.graduating.length}`);
    console.log(`Graduated: ${overview.graduated.length}`);
    
    return overview;
  } catch (error) {
    handleError(error);
  }
}

// Get tokens by a specific creator/deployer
export async function getTokensByDeployer(deployer: string) {
  try {
    const tokens = await client.getTokensByDeployer(deployer);
    
    console.log(`\n🔧 Tokens by ${deployer.slice(0, 8)}...:`);
    console.log(`Found ${tokens.length} tokens`);
    
    tokens.slice(0, 5).forEach((token, i) => {
      const pool = token.pools[0];
      console.log(`${i + 1}. ${token.token.symbol} - $${pool.price.usd.toFixed(6)}`);
    });
    
    return tokens;
  } catch (error) {
    handleError(error);
  }
}

// Pagination example for token holders
export async function getPaginatedHolders(tokenAddress: string) {
  try {
    let cursor: string | undefined;
    let page = 1;
    
    console.log(`\n📄 Paginated holders for ${tokenAddress.slice(0, 8)}...:`);
    
    do {
      const result = await client.getTokenHoldersPaginated(tokenAddress, 100, cursor);
      
      console.log(`\nPage ${page} (${result.accounts.length} holders):`);
      result.accounts.forEach((holder, i) => {
        console.log(`${i + 1}. ${holder.percentage.toFixed(2)}% - $${holder.value.usd.toFixed(2)}`);
      });
      
      cursor = result.cursor;
      page++;
      
      if (!result.hasMore) break;
    } while (cursor);
    
    return true;
  } catch (error) {
    handleError(error);
  }
}