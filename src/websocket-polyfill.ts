declare const require: undefined | ((id: string) => unknown);

function installWebSocket(ws: unknown): void {
  const module = ws as {
    WebSocket?: unknown;
    default?: unknown;
  };
  const WebSocketImpl = module.WebSocket ?? module.default ?? ws;
  (globalThis as typeof globalThis & { WebSocket: typeof WebSocket }).WebSocket =
    WebSocketImpl as unknown as typeof WebSocket;
}

// Preserve the 0.3.x CommonJS import side effect for consumers that relied on
// this package to install global WebSocket before constructing a Datastream.
if (typeof globalThis.WebSocket === 'undefined' && typeof require === 'function') {
  try {
    installWebSocket(require('ws'));
  } catch {
    // ESM and installations without optional dependencies use the lazy path.
  }
}

/**
 * Ensure a WebSocket implementation is available.
 *
 * Browsers provide WebSocket globally. ESM/older Node.js loads the optional
 * `ws` dependency lazily on `Datastream.connect()`.
 */
export async function ensureWebSocket(): Promise<void> {
  if (typeof globalThis.WebSocket !== 'undefined') {
    return;
  }

  try {
    const ws = await import('ws');
    installWebSocket(ws);
  } catch {
    throw new Error(
      'WebSocket implementation not found. If you are using Node.js, install the optional "ws" package.'
    );
  }
}