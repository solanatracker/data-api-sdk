/** Read example credentials from the environment, never from source files. */
export function requireEnv(
  name: 'SOLANA_TRACKER_API_KEY' | 'SOLANA_TRACKER_WS_URL'
): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in your environment`);
  return value;
}
