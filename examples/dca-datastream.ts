/**
 * Jupiter DCA Datastream examples.
 *
 * Each event is delivered to:
 *   - the global room `dca:jupiter`
 *   - the matching event-type room (`dca:jupiter:filled`, etc.)
 *   - any scoped rooms that apply (token buyers/sellers, wallet, account)
 *
 * Available on Premium, Business, and Enterprise plans.
 */
import {
  Datastream,
  type DcaStreamEvent,
  type DcaPositionEvent,
  type DcaTransactionEvent,
} from '@solana-tracker/data-api';

const ds = new Datastream({
  wsUrl: 'wss://datastream.solanatracker.io/YOUR_API_KEY_HERE',
});

ds.connect();

const TOKEN = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN';
const WALLET = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';

/** Distinguish a position snapshot from a transaction event. */
function isPositionSnapshot(ev: DcaStreamEvent): ev is DcaPositionEvent {
  return 'writeVersion' in ev;
}

// 1. All Jupiter DCA events
export function subscribeAll() {
  const sub = ds.subscribe.dca.all();
  console.log('Subscribed to', sub.room);
  return sub.on((ev) => {
    if (isPositionSnapshot(ev)) {
      console.log(`[snapshot] ${ev.address} • ${ev.order.pair} • ${ev.order.progressPercent.toFixed(1)}%`);
    } else {
      const tx = ev as DcaTransactionEvent;
      console.log(`[${tx.eventName}] ${tx.address} • ${tx.signature.slice(0, 12)}…`);
    }
  });
}

// 2. Cycle fills only — useful for trade tracking
export function subscribeFills() {
  const sub = ds.subscribe.dca.filled();
  console.log('Subscribed to', sub.room);
  return sub.on((ev) => {
    const inUsd = ev.usd?.inAmountUsd ?? 0;
    const outUsd = ev.usd?.outAmountUsd ?? 0;
    console.log(`[fill] ${ev.address} • ${inUsd.toFixed(2)} USD in → ${outUsd.toFixed(2)} USD out`);
  });
}

// 3. New DCA opens
export function subscribeOpens() {
  const sub = ds.subscribe.dca.opened();
  return sub.on((ev) => {
    console.log(`[opened] ${ev.address} • cycle=${ev.cycleFrequency}s • by ${ev.userKey}`);
  });
}

// 4. Closed orders
export function subscribeCloses() {
  const sub = ds.subscribe.dca.closed();
  return sub.on((ev) => {
    console.log(`[closed] ${ev.address} • userClosed=${ev.userClosed}`);
  });
}

// 5. Deposits / withdraws / fees
export function subscribeBookkeeping() {
  ds.subscribe.dca.deposit().on((ev) => console.log(`[deposit] ${ev.address} • ${ev.amount}`));
  ds.subscribe.dca.withdraw().on((ev) => console.log(`[withdraw] ${ev.address} • in=${ev.inAmount} out=${ev.outAmount}`));
  ds.subscribe.dca.collectedFee().on((ev) => console.log(`[fee] ${ev.address} • ${ev.amount} of ${ev.mint}`));
}

// 6. Position snapshots only (throttled per account, no signature)
export function subscribePositions() {
  const sub = ds.subscribe.dca.position();
  return sub.on((ev) => {
    console.log(`[snapshot] ${ev.address} writeV=${ev.writeVersion} • ${ev.order.progressPercent.toFixed(1)}%`);
  });
}

// 7. All DCAs *buying* a token
export function subscribeTokenBuyers(mint: string = TOKEN) {
  const sub = ds.subscribe.dca.token(mint).buyers();
  console.log('Subscribed to', sub.room);
  return sub.on((ev) => console.log(`[buying ${mint.slice(0, 6)}…] ${'eventName' in ev ? ev.eventName : 'snapshot'}`));
}

// 8. All DCAs *selling* a token
export function subscribeTokenSellers(mint: string = TOKEN) {
  return ds.subscribe.dca.token(mint).sellers().on((ev) => {
    console.log(`[selling ${mint.slice(0, 6)}…]`, 'eventName' in ev ? ev.eventName : 'snapshot');
  });
}

// 9. All DCA events for a wallet owner
export function subscribeWallet(wallet: string = WALLET) {
  const sub = ds.subscribe.dca.wallet(wallet);
  return sub.on((ev) => {
    const kind = 'eventName' in ev ? ev.eventName : 'Snapshot';
    console.log(`[wallet ${wallet.slice(0, 6)}…] ${kind} on ${ev.address}`);
  });
}

// 10. All events for a single DCA account
export function subscribeOrder(dcaAddress: string) {
  return ds.subscribe.dca.order(dcaAddress).on((ev) => {
    const kind = 'eventName' in ev ? ev.eventName : 'Snapshot';
    console.log(`[order ${dcaAddress.slice(0, 6)}…] ${kind}`);
  });
}

if (require.main === module) {
  subscribeAll();
  subscribeFills();
}
