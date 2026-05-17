/**
 * PnL v2 Datastream examples — real-time `tradeUpdate`, `balanceUpdate`, `priceUpdate`, and wallet summary updates.
 * Requires a Premium+ plan WebSocket URL from your Solana Tracker dashboard.
 *
 * Use a meme / tradable token mint for `TOKEN` — PnL v2 is not for tracking SOL.
 */
import {
  Datastream,
  type PnlBalanceUpdate,
  type PnlPositionUpdate,
  type PnlPriceUpdate,
  type PnlTradeUpdate,
  type PnlWalletUpdate,
} from '@solana-tracker/data-api';

const WS_URL = 'YOUR_WS_URL';

/** Replace with addresses you want to watch */
const WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';
/** Meme-token mint */
const TOKEN = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';

function isTradeUpdate(msg: PnlPositionUpdate): msg is PnlTradeUpdate {
  return msg.type === 'tradeUpdate';
}

function isPriceUpdate(msg: PnlPositionUpdate): msg is PnlPriceUpdate {
  return msg.type === 'priceUpdate';
}

/**
 * Subscribe to a single wallet+token position stream.
 * Room: `pnl:{wallet}:{token}`
 */
export function subscribePnlPosition(ds: Datastream) {
  return ds.subscribe.pnl.position(WALLET, TOKEN).on((msg) => {
    if (isTradeUpdate(msg)) {
      console.log('[pnl position] tradeUpdate', {
        wallet: msg.wallet,
        token: msg.token,
        realizedPnl: msg.realizedPnl,
        unrealizedPnl: msg.unrealizedPnl,
        currentBalance: msg.currentBalance,
      });
    } else if (isPriceUpdate(msg)) {
      console.log('[pnl position] priceUpdate', {
        wallet: msg.wallet,
        token: msg.token,
        unrealizedPnl: msg.unrealizedPnl,
        currentValue: msg.currentValue,
      });
    } else {
      console.log('[pnl position] balanceUpdate', {
        wallet: msg.wallet,
        token: msg.token,
        unrealizedPnl: msg.unrealizedPnl,
        currentBalance: msg.currentBalance,
      });
    }
  });
}

/**
 * Subscribe to all token positions for a wallet.
 * Room: `pnl:{wallet}`
 */
export function subscribePnlWallet(ds: Datastream) {
  return ds.subscribe.pnl.wallet(WALLET).on((msg) => {
    if (isTradeUpdate(msg)) {
      console.log('[pnl wallet] tradeUpdate', msg.token, msg.realizedPnl);
    } else if (isPriceUpdate(msg)) {
      console.log('[pnl wallet] priceUpdate', msg.token, msg.unrealizedPnl);
    } else {
      console.log('[pnl wallet] balanceUpdate', msg.token);
    }
  });
}

/**
 * Subscribe to aggregated wallet summary.
 * Room: `pnl:{wallet}:summary`
 */
export function subscribePnlWalletSummary(ds: Datastream) {
  return ds.subscribe.pnl.summary(WALLET).on((msg: PnlWalletUpdate) => {
    console.log('[pnl summary] wallet summary', {
      totalPnl: msg.pnl.total,
      realizedPnl: msg.pnl.realized,
      unrealizedPnl: msg.pnl.unrealized,
      trades: msg.counts.trades,
      tokensTraded: msg.counts.tokensTraded,
    });
  });
}

/**
 * Run all three subscriptions after connecting (call `await ds.connect()` first).
 */
export async function runPnlDatastreamDemo(): Promise<void> {
  const ds = new Datastream({
    wsUrl: WS_URL,
    autoReconnect: true,
  });

  ds.on('connected', () => console.log('Datastream connected'));
  ds.on('error', (err) => console.error('Datastream error:', err));

  await ds.connect();

  const pos = ds.subscribe.pnl.position(WALLET, TOKEN);
  const wall = ds.subscribe.pnl.wallet(WALLET);
  const sum = ds.subscribe.pnl.summary(WALLET);

  pos.on((msg) => {
    if (isTradeUpdate(msg)) {
      console.log('[pnl position] tradeUpdate', msg.token, msg.realizedPnl);
    } else if (isPriceUpdate(msg)) {
      console.log('[pnl position] priceUpdate', msg.token, msg.unrealizedPnl);
    } else {
      console.log('[pnl position] balanceUpdate', msg.token);
    }
  });
  wall.on((msg) => {
    if (isTradeUpdate(msg)) {
      console.log('[pnl wallet] tradeUpdate', msg.token);
    } else if (isPriceUpdate(msg)) {
      console.log('[pnl wallet] priceUpdate', msg.token);
    } else {
      console.log('[pnl wallet] balanceUpdate', msg.token);
    }
  });
  sum.on((msg: PnlWalletUpdate) => {
    console.log('[pnl summary] total', msg.pnl.total, 'trades', msg.counts.trades);
  });

  console.log('PnL v2 subscriptions active. Press Ctrl+C to exit.');
  console.log('Rooms:', pos.room, wall.room, sum.room);
}
