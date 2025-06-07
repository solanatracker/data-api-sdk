// Import the interfaces from your main interfaces file
import { ProcessedEvent, ProcessedStats, TimeframeStats } from './interfaces';

const timeframes = {
  "1m": { time: 60 },
  "5m": { time: 300 },
  "15m": { time: 900 },
  "30m": { time: 1800 },
  "1h": { time: 3600 },
  "2h": { time: 7200 },
  "3h": { time: 10800 },
  "4h": { time: 14400 },
  "5h": { time: 18000 },
  "6h": { time: 21600 },
  "12h": { time: 43200 },
  "24h": { time: 86400 },
};

// Pre-calculate timeframe boundaries for faster lookup
const timeframeBoundaries = Object.entries(timeframes).map(([key, value]) => ({
  key,
  seconds: value.time
})).sort((a, b) => a.seconds - b.seconds);

/**
 * Decode binary data into events array
 * @param binaryData The binary data to decode
 * @returns Array of decoded events
 */
export function decodeBinaryEvents(binaryData: ArrayBuffer | Uint8Array): ProcessedEvent[] {
  const data = binaryData instanceof ArrayBuffer ? new Uint8Array(binaryData) : binaryData;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;

  const walletCount = view.getUint32(offset, true);
  offset += 4;

  const wallets: string[] = [];
  for (let i = 0; i < walletCount; i++) {
    const length = view.getUint8(offset++);
    const walletBytes = data.slice(offset, offset + length);
    const wallet = new TextDecoder().decode(walletBytes);
    wallets.push(wallet);
    offset += length;
  }

  const tradeCount = view.getUint32(offset, true);
  offset += 4;

  const events: ProcessedEvent[] = [];
  for (let i = 0; i < tradeCount; i++) {
    const walletIndex = view.getUint32(offset, true);
    const amount = view.getFloat32(offset + 4, true);
    const priceUsd = view.getFloat32(offset + 8, true);
    const volume = view.getFloat32(offset + 12, true);
    const typeCode = view.getUint8(offset + 16);
    const timeInSeconds = view.getUint32(offset + 17, true);

    events.push({
      wallet: wallets[walletIndex],
      amount: amount,
      priceUsd: priceUsd,
      volume: volume,
      type: typeCode === 0 ? 'buy' : 'sell',
      time: timeInSeconds * 1000
    });

    offset += 21;
  }

  return events;
}

/**
 * Process events synchronously
 * @param binaryData Binary data or decoded events array
 * @returns Processed statistics by timeframe
 */
export function processEvents(binaryData: ArrayBuffer | Uint8Array | ProcessedEvent[]): ProcessedStats {
  let events: ProcessedEvent[];
  if (binaryData instanceof ArrayBuffer || binaryData instanceof Uint8Array) {
    events = decodeBinaryEvents(binaryData);
  } else if (Array.isArray(binaryData)) {
    events = binaryData;
  } else {
    throw new Error('Invalid input: expected binary data or events array');
  }

  if (events.length === 0) return {};

  const currentPrice = parseFloat(events[0].priceUsd.toString());
  const currentTimestamp = Date.now() / 1000;

  // Initialize stats structure
  const stats: Record<string, any> = {};
  timeframeBoundaries.forEach(({ key }) => {
    stats[key] = {
      buys: 0,
      sells: 0,
      buyVolume: 0,
      sellVolume: 0,
      buyers: new Map<string, boolean>(),
      sellers: new Map<string, boolean>(),
      totalTransactions: 0,
      totalVolume: 0,
      totalWallets: new Map<string, boolean>(),
      initialPrice: 0,
      lastPrice: 0,
      hasData: false
    };
  });

  // Single pass through events
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const { time: timestamp, type, volume, wallet, priceUsd } = event;
    
    if (type !== "buy" && type !== "sell") continue;
    
    const eventTime = timestamp / 1000;
    const timeDiff = currentTimestamp - eventTime;

    // Find applicable timeframes
    for (let j = 0; j < timeframeBoundaries.length; j++) {
      const { key, seconds } = timeframeBoundaries[j];
      
      if (timeDiff > seconds) continue;
      
      const period = stats[key];
      
      if (!period.hasData) {
        period.initialPrice = parseFloat(priceUsd.toString());
        period.hasData = true;
      }

      period.totalTransactions++;
      period.totalVolume += parseFloat(volume.toString() || '0');
      period.totalWallets.set(wallet, true);
      period.lastPrice = parseFloat(priceUsd.toString());

      if (type === "buy") {
        period.buys++;
        period.buyVolume += parseFloat(volume.toString() || '0');
        period.buyers.set(wallet, true);
      } else {
        period.sells++;
        period.sellVolume += parseFloat(volume.toString() || '0');
        period.sellers.set(wallet, true);
      }
    }
  }

  // Transform final stats
  const sortedStats: ProcessedStats = {};
  Object.keys(timeframes).forEach((timeframe) => {
    const period = stats[timeframe];
    
    if (!period.hasData) return;
    
    const priceChangePercent = period.initialPrice > 0 
      ? 100 * ((currentPrice - period.lastPrice) / period.lastPrice)
      : 0;

    const timeframeStats: TimeframeStats = {
      buyers: period.buyers.size,
      sellers: period.sellers.size,
      volume: {
        buys: period.buyVolume,
        sells: period.sellVolume,
        total: period.totalVolume,
      },
      transactions: period.totalTransactions,
      buys: period.buys,
      sells: period.sells,
      wallets: period.totalWallets.size,
      price: period.initialPrice,
      priceChangePercentage: priceChangePercent,
    };

    sortedStats[timeframe as keyof ProcessedStats] = timeframeStats;
  });

  return sortedStats;
}

/**
 * Process events asynchronously in chunks
 * @param binaryData Binary data or decoded events array
 * @param onProgress Optional progress callback
 * @returns Processed statistics by timeframe
 */
export async function processEventsAsync(
  binaryData: ArrayBuffer | Uint8Array | ProcessedEvent[], 
  onProgress?: (progress: number) => void
): Promise<ProcessedStats> {
  let events: ProcessedEvent[];
  if (binaryData instanceof ArrayBuffer || binaryData instanceof Uint8Array) {
    events = decodeBinaryEvents(binaryData);
  } else if (Array.isArray(binaryData)) {
    events = binaryData;
  } else {
    throw new Error('Invalid input: expected binary data or events array');
  }

  if (events.length === 0) return {};

  const CHUNK_SIZE = 100000;
  const currentPrice = parseFloat(events[0].priceUsd.toString());
  const currentTimestamp = Date.now() / 1000;

  // Initialize stats
  const stats: Record<string, any> = {};
  timeframeBoundaries.forEach(({ key }) => {
    stats[key] = {
      buys: 0,
      sells: 0,
      buyVolume: 0,
      sellVolume: 0,
      buyers: new Map<string, boolean>(),
      sellers: new Map<string, boolean>(),
      totalTransactions: 0,
      totalVolume: 0,
      totalWallets: new Map<string, boolean>(),
      initialPrice: 0,
      lastPrice: 0,
      hasData: false
    };
  });

  // Process in chunks
  for (let chunk = 0; chunk < events.length; chunk += CHUNK_SIZE) {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        const end = Math.min(chunk + CHUNK_SIZE, events.length);
        
        for (let i = chunk; i < end; i++) {
          const event = events[i];
          const { time: timestamp, type, volume, wallet, priceUsd } = event;
          
          if (type !== "buy" && type !== "sell") continue;
          
          const eventTime = timestamp / 1000;
          const timeDiff = currentTimestamp - eventTime;

          for (let j = 0; j < timeframeBoundaries.length; j++) {
            const { key, seconds } = timeframeBoundaries[j];
            
            if (timeDiff > seconds) continue;
            
            const period = stats[key];
            
            if (!period.hasData) {
              period.initialPrice = parseFloat(priceUsd.toString());
              period.hasData = true;
            }

            period.totalTransactions++;
            period.totalVolume += parseFloat(volume.toString() || '0');
            period.totalWallets.set(wallet, true);
            period.lastPrice = parseFloat(priceUsd.toString());

            if (type === "buy") {
              period.buys++;
              period.buyVolume += parseFloat(volume.toString() || '0');
              period.buyers.set(wallet, true);
            } else {
              period.sells++;
              period.sellVolume += parseFloat(volume.toString() || '0');
              period.sellers.set(wallet, true);
            }
          }
        }

        if (onProgress) {
          onProgress((end / events.length) * 100);
        }

        resolve();
      }, 0);
    });
  }

  // Transform final stats
  const sortedStats: ProcessedStats = {};
  Object.keys(timeframes).forEach((timeframe) => {
    const period = stats[timeframe];
    
    if (!period.hasData) return;
    
    const priceChangePercent = period.initialPrice > 0 
      ? 100 * ((currentPrice - period.lastPrice) / period.lastPrice)
      : 0;

    const timeframeStats: TimeframeStats = {
      buyers: period.buyers.size,
      sellers: period.sellers.size,
      volume: {
        buys: period.buyVolume,
        sells: period.sellVolume,
        total: period.totalVolume,
      },
      transactions: period.totalTransactions,
      buys: period.buys,
      sells: period.sells,
      wallets: period.totalWallets.size,
      price: period.initialPrice,
      priceChangePercentage: priceChangePercent,
    };

    sortedStats[timeframe as keyof ProcessedStats] = timeframeStats;
  });

  return sortedStats;
}