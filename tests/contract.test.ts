/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Client,
  PredictionMarketsClient,
  Datastream,
  pmRoomSegment,
  type WhaleMinVolume,
  type LighthouseResponse,
  type PriceData,
  type RiskWallet,
  type RiskWalletWire,
  type TokenRisk,
  type TokenTransaction,
  type WhaleKolTransaction,
} from '../src/index';

describe('public exports', () => {
  it('exports Client and PredictionMarketsClient', () => {
    expect(typeof Client).toBe('function');
    expect(typeof PredictionMarketsClient).toBe('function');
    expect(typeof Datastream).toBe('function');
  });

  it('types compile for new Data API shapes', () => {
    const riskWallet: RiskWalletWire = {
      wallet: 'Abc',
      balance: 1,
      percentage: 0.1,
    };
    expect(riskWallet.wallet).toBe('Abc');

    const legacyRiskWallet: RiskWallet = {
      address: 'Abc',
      balance: 1,
      percentage: 0.1,
    };
    expect(legacyRiskWallet.address).toBe('Abc');

    const price: PriceData = {
      price: 1,
      priceQuote: 2,
      liquidity: 3,
      marketCap: 4,
      lastUpdated: 5,
      priceChanges: { '1h': { priceChangePercentage: -1.5 } },
    };
    expect(price.priceChanges?.['1h']?.priceChangePercentage).toBe(-1.5);

    const lighthouse = [] as LighthouseResponse;
    expect(Array.isArray(lighthouse)).toBe(true);

    const vol: WhaleMinVolume = 5000;
    expect(vol).toBe(5000);

    // Existing 0.3.x consumers retain non-null transaction prices.
    const legacyPrice = (tx: TokenTransaction): number => tx.priceUsd;
    expect(typeof legacyPrice).toBe('function');

    // New whale/KOL callbacks expose the exact nullable contract separately.
    const whalePrice = (tx: WhaleKolTransaction): number | null => tx.priceUsd;
    expect(typeof whalePrice).toBe('function');

    // Existing direct access remains source-compatible after SDK normalization.
    const bundlerCount = (risk: TokenRisk): number => risk.bundlers.count;
    expect(typeof bundlerCount).toBe('function');
  });
});

describe('Client query construction', () => {
  const client = new Client({ apiKey: 'test-key', baseUrl: 'https://example.test' });

  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string) => ({
      ok: true,
      json: async () => ({ url }),
    }));
  });

  it('getLighthouse hits /lighthouse', async () => {
    await client.getLighthouse();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/lighthouse',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-api-key': 'test-key' }),
      })
    );
  });

  it('normalizes corrected risk fields for 0.3.x consumers', async () => {
    const mint = 'So11111111111111111111111111111111111111112';
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        token: {},
        pools: [],
        events: {},
        risk: {
          snipers: {
            count: 1,
            totalBalance: 2,
            totalPercentage: 3,
            wallets: [{ wallet: 'legacy-wallet', balance: 2, percentage: 3 }],
          },
          insiders: {
            count: 0,
            totalBalance: 0,
            totalPercentage: 0,
            wallets: [],
          },
          top10: 0,
          dev: {},
          rugged: false,
          risks: [],
          score: 0,
        },
      }),
    }));

    const response = await client.getTokenInfo(mint);
    expect(response.risk.snipers.wallets[0].wallet).toBe('legacy-wallet');
    expect(response.risk.snipers.wallets[0].address).toBe('legacy-wallet');
    expect(response.risk.bundlers).toEqual({
      count: 0,
      totalBalance: 0,
      totalPercentage: 0,
      totalInitialBalance: 0,
      totalInitialPercentage: 0,
      wallets: [],
    });
  });

  it('getWhaleTrades serializes all filters', async () => {
    await client.getWhaleTrades({
      minVolume: 2500,
      limit: 10,
      showMeta: true,
      hideArb: true,
    });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/trades/whales?');
    expect(url).toContain('minVolume=2500');
    expect(url).toContain('limit=10');
    expect(url).toContain('showMeta=true');
    expect(url).toContain('hideArb=true');
  });

  it('getKolTrades serializes hideArb on the global feed', async () => {
    await client.getKolTrades({ minVolume: 0, hideArb: true });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/trades/kols?');
    expect(url).toContain('minVolume=0');
    expect(url).toContain('hideArb=true');
  });

  it('getKolTradesByToken validates mint and builds path', async () => {
    const mint = 'So11111111111111111111111111111111111111112';
    await client.getKolTradesByToken(mint, { minVolume: 0, hideArb: true });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain(`/trades/kols/${mint}?`);
    expect(url).toContain('minVolume=0');
    expect(url).toContain('hideArb=true');
  });

  it('rejects invalid whale minVolume', async () => {
    await expect(
      client.getWhaleTrades({ minVolume: 123 as WhaleMinVolume })
    ).rejects.toThrow(/minVolume/);
  });

  it('passes PnL currency on wallet overview', async () => {
    const wallet = 'FbMxP3GVq8TQ36nbYgx4NP9iygMpwAwFWJwW81ioCiSF';
    await client.getPnlV2WalletOverview(wallet, { currency: 'sol', pnlMode: 'strict' });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain(`/v2/pnl/wallets/${wallet}?`);
    expect(url).toContain('currency=sol');
    expect(url).toContain('pnlMode=strict');
  });
});

describe('PredictionMarketsClient', () => {
  const pm = new PredictionMarketsClient({
    apiKey: 'test-key',
    baseUrl: 'https://pm.example.test',
  });

  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string, init?: RequestInit) => ({
      ok: true,
      json: async () => ({ url, method: init?.method || 'GET', body: init?.body }),
    }));
  });

  it('defaults to prediction-market-api host', () => {
    const def = new PredictionMarketsClient({ apiKey: 'k' });
    expect((def as any).baseUrl).toBe('https://prediction-market-api.solanatracker.io');
  });

  it('getMarkets uses snake_case query params', async () => {
    await pm.getMarkets({ exchange: 'polymarket', min_volume: 100, limit: 5 });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toBe(
      'https://pm.example.test/v1/markets?exchange=polymarket&min_volume=100&limit=5'
    );
  });

  it('getMarket encodes ticker path segment', async () => {
    await pm.getMarket('TICKER/WITH SPACE');
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/v1/markets/TICKER%2FWITH%20SPACE');
  });

  it('postMarketsBatch sends JSON body', async () => {
    await pm.postMarketsBatch({ ids: ['a', 'b'], exchange: 'kalshi' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ ids: ['a', 'b'], exchange: 'kalshi' });
  });
});

describe('Datastream room builders', () => {
  it('lowercases pm room segments', () => {
    expect(pmRoomSegment('PolyMarket')).toBe('polymarket');
    expect(pmRoomSegment('  BTC ')).toBe('btc');
  });

  it('builds whale/kol/pm subscription rooms', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const rooms: string[] = [];
    (ds as any)._subscribe = (room: string) => {
      rooms.push(room);
      return {
        room,
        on: () => ({ unsubscribe: () => undefined }),
      };
    };

    ds.subscribe.tx.whale(5000);
    ds.subscribe.tx.kol();
    ds.subscribe.tx.kol(1000);
    ds.subscribe.tx.poolWallet('tok', 'pool', 'wal');
    ds.subscribe.pm.trades();
    ds.subscribe.pm.significantTrades();
    ds.subscribe.pm.exchange('PolyMarket' as any).trades();
    ds.subscribe.pm.market('kalshi', 'TICKER').prices();
    ds.subscribe.pm.event('polymarket', 'EventSlug').volume();
    ds.subscribe.pm.crypto('BTC').prices();
    ds.subscribe.pm.category('Politics');
    ds.subscribe.pm.type('trade');

    expect(rooms).toEqual(
      expect.arrayContaining([
        'transaction:whale:5000',
        'transaction:kol',
        'transaction:kol:1000',
        'transaction:tok:pool:wal',
        'pm:trades',
        'pm:trades:significant',
        'pm:polymarket:trades',
        'pm:market:kalshi:ticker:prices',
        'pm:event:polymarket:eventslug:volume',
        'pm:crypto:btc:prices',
        'pm:category:politics',
        'pm:type:trade',
      ])
    );
  });

  it('replies to JSON ping with pong', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const sent: string[] = [];
    const socket: any = {
      readyState: 1,
      send: (msg: string) => sent.push(msg),
      onmessage: null as any,
      onclose: null as any,
    };
    (global as any).WebSocket = { OPEN: 1 };
    (ds as any).setupSocketListeners(socket, 'main');
    socket.onmessage({ data: JSON.stringify({ type: 'ping' }) });
    expect(sent).toEqual([JSON.stringify({ type: 'pong' })]);
  });

  it('unwraps transaction arrays and dedupes by tx', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const seen: string[] = [];
    const socket: any = {
      readyState: 1, // WebSocket.OPEN
      send: () => undefined,
      onmessage: null as any,
      onclose: null as any,
    };
    (global as any).WebSocket = { OPEN: 1 };
    (ds as any).transactionSocket = socket;
    (ds as any).setupSocketListeners(socket, 'transaction');

    ds.subscribe.tx.whale(1000).on((trade) => {
      seen.push(trade.tx);
    });

    const trade = {
      tx: 'sig1',
      amount: 1,
      priceUsd: null,
      volume: 2000,
      solVolume: 10,
      type: 'buy',
      wallet: 'wallet1',
      time: 1,
      program: 'test',
      token: { from: {}, to: {} },
    };

    socket.onmessage({
      data: JSON.stringify({
        type: 'message',
        room: 'transaction:whale:1000',
        data: [trade],
      }),
    });
    // duplicate delivery
    socket.onmessage({
      data: JSON.stringify({
        type: 'message',
        room: 'transaction:whale:1000',
        data: [trade],
      }),
    });

    expect(seen).toEqual(['sig1']);
  });

  it('dedupes transactions per room without suppressing cumulative tiers', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const seen: string[] = [];
    const socket: any = {
      readyState: 1,
      send: () => undefined,
      onmessage: null as any,
      onclose: null as any,
    };
    (global as any).WebSocket = { OPEN: 1 };
    (ds as any).transactionSocket = socket;
    (ds as any).setupSocketListeners(socket, 'transaction');

    ds.subscribe.tx.whale(1000).on((trade) => seen.push(`1k:${trade.tx}`));
    ds.subscribe.tx.whale(5000).on((trade) => seen.push(`5k:${trade.tx}`));

    const trade = {
      tx: 'shared-sig',
      amount: 1,
      priceUsd: 1,
      volume: 10000,
      solVolume: 50,
      type: 'buy',
      wallet: 'wallet1',
      time: 1,
      program: 'test',
      token: { from: {}, to: {} },
    };
    for (const room of ['transaction:whale:1000', 'transaction:whale:5000']) {
      socket.onmessage({
        data: JSON.stringify({ type: 'message', room, data: [trade] }),
      });
    }

    expect(seen).toEqual(['1k:shared-sig', '5k:shared-sig']);
  });

  it('preserves 0.3.x delivery semantics for legacy transaction rooms', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const seen: string[] = [];
    const socket: any = {
      readyState: 1,
      send: () => undefined,
      onmessage: null as any,
      onclose: null as any,
    };
    (global as any).WebSocket = { OPEN: 1 };
    (ds as any).transactionSocket = socket;
    (ds as any).setupSocketListeners(socket, 'transaction');

    const mint = 'So11111111111111111111111111111111111111112';
    ds.subscribe.tx.token(mint).on((trade) => seen.push(trade.tx));
    const trade = {
      tx: 'legacy-array-sig',
      amount: 1,
      priceUsd: 1,
      volume: 10,
      solVolume: 0.1,
      type: 'buy',
      wallet: 'wallet1',
      time: 1,
      program: 'test',
      token: { from: {}, to: {} },
    };
    const delivery = JSON.stringify({
      type: 'message',
      room: `transaction:${mint}`,
      data: [trade],
    });
    socket.onmessage({ data: delivery });
    socket.onmessage({ data: delivery });

    // Legacy array payloads were not deduplicated in 0.3.x.
    expect(seen).toEqual(['legacy-array-sig', 'legacy-array-sig']);
  });

  it('covers all 28 canonical pm room patterns', () => {
    const ds = new Datastream({ wsUrl: 'wss://example.test', autoReconnect: false });
    const rooms: string[] = [];
    (ds as any)._subscribe = (room: string) => {
      rooms.push(room);
      return { room, on: () => ({ unsubscribe: () => undefined }) };
    };

    ds.subscribe.pm.all();
    ds.subscribe.pm.trades();
    ds.subscribe.pm.significantTrades();
    ds.subscribe.pm.marketLifecycle();
    ds.subscribe.pm.resolution();
    const ex = ds.subscribe.pm.exchange('kalshi');
    ex.all();
    ex.trades();
    ex.marketLifecycle();
    ex.resolution();
    ex.type('trade');
    const m = ds.subscribe.pm.market('polymarket', '123');
    m.all();
    m.trades();
    m.prices();
    m.quotes();
    m.orderbook();
    m.volume();
    m.marketLifecycle();
    m.resolution();
    const ev = ds.subscribe.pm.event('polymarket', 'evt');
    ev.all();
    ev.trades();
    ev.volume();
    ds.subscribe.pm.type('trade');
    ds.subscribe.pm.category('crypto');
    ds.subscribe.pm.series('polymarket', 'series-1');
    ds.subscribe.pm.status('open');
    ds.subscribe.pm.sport('nba');
    const c = ds.subscribe.pm.crypto('btc');
    c.all();
    c.prices();

    expect(new Set(rooms).size).toBe(28);
    expect(rooms).toEqual(
      expect.arrayContaining([
        'pm:all',
        'pm:trades',
        'pm:trades:significant',
        'pm:market_lifecycle',
        'pm:resolution',
        'pm:kalshi',
        'pm:kalshi:trades',
        'pm:kalshi:market_lifecycle',
        'pm:kalshi:resolution',
        'pm:kalshi:type:trade',
        'pm:market:polymarket:123',
        'pm:market:polymarket:123:trades',
        'pm:market:polymarket:123:prices',
        'pm:market:polymarket:123:quotes',
        'pm:market:polymarket:123:orderbook',
        'pm:market:polymarket:123:volume',
        'pm:market:polymarket:123:market_lifecycle',
        'pm:market:polymarket:123:resolution',
        'pm:event:polymarket:evt',
        'pm:event:polymarket:evt:trades',
        'pm:event:polymarket:evt:volume',
        'pm:type:trade',
        'pm:category:crypto',
        'pm:series:polymarket:series-1',
        'pm:status:open',
        'pm:sport:nba',
        'pm:crypto:btc',
        'pm:crypto:btc:prices',
      ])
    );
  });
});

describe('PredictionMarketsClient path coverage', () => {
  const pm = new PredictionMarketsClient({
    apiKey: 'test-key',
    baseUrl: 'https://pm.example.test',
  });

  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string) => ({
      ok: true,
      json: async () => ({ url }),
    }));
  });

  it('hits remaining high-traffic REST paths', async () => {
    await pm.getCategories();
    await pm.getSports();
    await pm.getLiveData({ tickers: 'a,b' });
    await pm.getCryptoPriceHistory({
      symbol: 'BTC',
      eventStartTime: '2026-01-01T00:00:00Z',
      endDate: '2026-01-01T00:05:00Z',
    });
    await pm.getRelatedMarkets('ticker');
    await pm.getMarketHolders('ticker');
    await pm.getEventHolders('event');
    await pm.getMarketBooks({ tickers: 'a,b' });

    const urls = (global.fetch as jest.Mock).mock.calls.map((c: any[]) => c[0] as string);
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://pm.example.test/v1/categories',
        'https://pm.example.test/v1/sports',
        expect.stringContaining('/v1/live_data?tickers=a%2Cb'),
        expect.stringContaining('/v1/crypto/price-history?'),
        expect.stringContaining('/v1/markets/ticker/related'),
        expect.stringContaining('/v1/markets/ticker/holders'),
        expect.stringContaining('/v1/events/event/holders'),
        expect.stringContaining('/v1/markets/books?tickers=a%2Cb'),
      ])
    );
  });

  it('serializes required search queries', async () => {
    await pm.searchMarkets({ q: 'election' });
    await pm.search({ q: 'bitcoin' });
    await pm.searchTraders({ q: '0xabc' });

    const urls = (global.fetch as jest.Mock).mock.calls.map((c: any[]) => c[0] as string);
    expect(urls).toEqual([
      'https://pm.example.test/v1/markets/search?q=election',
      'https://pm.example.test/v1/search?q=bitcoin',
      'https://pm.example.test/v1/traders/search?q=0xabc',
    ]);
  });
});
