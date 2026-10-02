import { scrypt } from '@noble/hashes/scrypt.js';
import { database } from './database.js';
import { HttpError, fail, json } from './http.js';

const COOKIE = '__Host-saleh-session';
const SESSION_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW = 15 * 60 * 1000;
const encoder = new TextEncoder();
const toHex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
const fromHex = hex => Uint8Array.from(hex.match(/../g), byte => parseInt(byte, 16));
async function digest(value) {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}
function equalBytes(a, b) {
  let difference = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
let cachedCredentials;
async function credentials(env) {
  const raw = env.ADMIN_CREDENTIALS;
  if (cachedCredentials && cachedCredentials.raw === raw) return cachedCredentials;
  let config;
  try { config = JSON.parse(raw); } catch { fail(503, 'unavailable'); }
  if (config.algorithm !== 'scrypt' || config.N !== 16384 || config.r !== 8 || config.p !== 5 ||
      typeof config.username !== 'string' || !config.username ||
      !/^[a-f0-9]{64}$/.test(config.salt) || !/^[a-f0-9]{64}$/.test(config.hash)) fail(503, 'unavailable');
  cachedCredentials = { ...config, raw, version: await digest(raw), usernameHash: await digest(config.username) };
  return cachedCredentials;
}
function sessionToken(request) {
  const value = (request.headers.get('Cookie') || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(value || '') ? value : null;
}
function cookie(value, maxAge = SESSION_SECONDS) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
export async function authorized(request, env) {
  const token = sessionToken(request);
  if (!token) return false;
  const config = await credentials(env);
  const session = await database(env).prepare('SELECT expires_at, credential_version FROM admin_sessions WHERE token_hash = ?')
    .bind(await digest(token)).first();
  return Boolean(session && session.expires_at > Date.now() && session.credential_version === config.version);
}
async function limitLogin(request, env) {
  const now = Date.now(), cutoff = now - LOGIN_WINDOW;
  // Cloudflare supplies CF-Connecting-IP. Never trust a client-supplied X-Forwarded-For.
  // Without that trusted edge header, use a shared bucket rather than bypassing limits.
  const ipKey = 'ip:' + await digest(request.headers.get('CF-Connecting-IP') || 'shared');
  const keys = [ipKey, 'all'];
  const results = await database(env).batch(keys.map(key => database(env).prepare(`
    INSERT INTO login_limits (bucket, attempts, started_at) VALUES (?, 1, ?)
    ON CONFLICT(bucket) DO UPDATE SET
      attempts = CASE WHEN started_at <= ? THEN 1 ELSE attempts + 1 END,
      started_at = CASE WHEN started_at <= ? THEN excluded.started_at ELSE started_at END
    RETURNING attempts, started_at`).bind(key, now, cutoff, cutoff)));
  for (let i = 0; i < results.length; i++) {
    const row = results[i].results[0];
    if (row.attempts > (i === 0 ? 10 : 100)) {
      throw new HttpError(429, 'rate_limited', { 'Retry-After': String(Math.max(1, Math.ceil((row.started_at + LOGIN_WINDOW - now) / 1000))) });
    }
  }
}
export async function login(request, env, data) {
  await limitLogin(request, env);
  if (typeof data.username !== 'string' || typeof data.password !== 'string' ||
      !data.username || data.username.length > 100 || !data.password || data.password.length > 256) fail(401, 'invalid_credentials');
  const config = await credentials(env);
  // Standard scrypt settings: 16 MiB, r=8, p=5. The bundled implementation also
  // works on production Workers with a lower native PBKDF2 iteration ceiling.
  const derived = scrypt(encoder.encode(data.password), fromHex(config.salt),
    { N:config.N, r:config.r, p:config.p, dkLen:32, maxmem:32 * 1024 * 1024 });
  // Always perform the expensive password check, even for an unknown username.
  const userMatches = equalBytes(fromHex(await digest(data.username.trim())), fromHex(config.usernameHash));
  const passwordMatches = equalBytes(derived, fromHex(config.hash));
  if (!userMatches || !passwordMatches) fail(401, 'invalid_credentials');
  const token = toHex(crypto.getRandomValues(new Uint8Array(32))), now = Date.now();
  const previous = sessionToken(request);
  const statements = [
    database(env).prepare('DELETE FROM admin_sessions WHERE expires_at <= ? OR credential_version != ?').bind(now, config.version),
    database(env).prepare('DELETE FROM login_limits WHERE started_at < ?').bind(now - LOGIN_WINDOW * 2),
  ];
  if (previous) statements.push(database(env).prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(previous)));
  statements.push(database(env).prepare('INSERT INTO admin_sessions (token_hash, credential_version, expires_at) VALUES (?, ?, ?)')
    .bind(await digest(token), config.version, now + SESSION_SECONDS * 1000));
  await database(env).batch(statements);
  return json({ signedIn: true, admin: true }, 200, { 'Set-Cookie': cookie(token) });
}
export async function logout(request, env) {
  const token = sessionToken(request);
  if (token) await database(env).prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
}
