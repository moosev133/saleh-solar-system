import { assets } from './assets.js';
import { database, owner, item, serialize } from './database.js';

const PUBLIC_ORIGIN = 'https://moosev133.github.io';
const MAX_IMAGE = 12 * 1024 * 1024;
const MAX_VIDEO = 40 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']);
class HttpError extends Error { constructor(status, code) { super(code); this.status = status; } }
const fail = (status, code) => { throw new HttpError(status, code); };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
// The Sites dispatcher verifies identity and strips spoofed authentication headers.
function identity(request) { return request.headers.get('oai-authenticated-user-id'); }
async function authorized(request, env) {
  const id = identity(request);
  if (!id) return false;
  return (await owner(env))?.user_id === id;
}
function sameOrigin(request) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) fail(403, 'origin');
}
async function bytes(request, limit) {
  const declared = Number(request.headers.get('Content-Length'));
  if (declared > limit) fail(413, 'too_large');
  if (!request.body) fail(400, 'empty');
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); fail(413, 'too_large'); }
    chunks.push(value);
  }
  const result = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
async function bodyJSON(request) {
  if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) fail(415, 'json_required');
  try { const data=JSON.parse(new TextDecoder().decode(await bytes(request, 8192))); if(!data || typeof data!=='object' || Array.isArray(data)) fail(400,'invalid'); return data; }
  catch (error) { if (error instanceof HttpError) throw error; fail(400, 'invalid'); }
}
function signature(data, mime) {
  const hex = (...values) => values.every((value, i) => data[i] === value);
  const ascii = (a, b) => new TextDecoder().decode(data.subarray(a, b));
  if (mime === 'image/jpeg') return hex(255,216,255);
  if (mime === 'image/png') return hex(137,80,78,71,13,10,26,10);
  if (mime === 'image/webp') return ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP';
  if (mime === 'video/webm') return hex(26,69,223,163);
  if (mime === 'video/mp4') return ascii(4,8) === 'ftyp' && ['isom','iso2','mp41','mp42','avc1','M4V ','MSNV','dash'].includes(ascii(8,12));
  return false;
}
async function hash(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2,'0')).join('');
}
function publicCors(response, request) {
  const headers = new Headers(response.headers);
  if (request.headers.get('Origin') === PUBLIC_ORIGIN) headers.set('Access-Control-Allow-Origin', PUBLIC_ORIGIN);
  headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}
async function mediaResponse(request, env, id) {
  const row = await item(env, id);
  if (!row || (!row.published && !(await authorized(request, env)))) fail(404, 'not_found');
  const headers = new Headers({ 'Content-Type': row.mime, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' });
  const range = request.headers.get('Range');
  let offset = 0, length = row.size;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${row.size}` } });
    offset = match[1] ? Number(match[1]) : Math.max(0, row.size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]), row.size - 1) : row.size - 1;
    if (offset >= row.size || offset > end || !Number.isSafeInteger(offset)) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${row.size}` } });
    length = end - offset + 1;
    headers.set('Content-Range', `bytes ${offset}-${end}/${row.size}`);
  }
  const object = await env.BUCKET.get(row.object_key, range ? { range: { offset, length } } : {});
  if (!object) fail(404, 'not_found');
  headers.set('Content-Length', String(length));
  return new Response(request.method === 'HEAD' ? null : object.body, { status: range ? 206 : 200, headers });
}
async function route(request, env) {
  const url = new URL(request.url), path = url.pathname;
  const method = request.method;
  if (path === '/api/gallery' && method === 'GET') {
    const rows = await database(env).prepare('SELECT * FROM media WHERE published = 1 ORDER BY position DESC, created_at DESC LIMIT 200').all();
    return publicCors(json({ items: rows.results.map(serialize) }), request);
  }
  const mediaMatch = /^\/media\/([a-f0-9-]{36})$/.exec(path);
  if (mediaMatch && ['GET','HEAD'].includes(method)) return publicCors(await mediaResponse(request, env, mediaMatch[1]), request);
  if (path === '/api/session' && method === 'GET') {
    const admin = await owner(env);
    return json({ signedIn: Boolean(identity(request)), admin: Boolean(identity(request) && admin?.user_id === identity(request)), setupAvailable: !admin });
  }
  if (path === '/api/claim' && method === 'POST') {
    sameOrigin(request);
    const userId = identity(request); if (!userId) fail(401, 'signin');
    const data = await bodyJSON(request);
    if (typeof data.token !== 'string' || data.token.length !== 64 || !env.ADMIN_SETUP_HASH || await hash(data.token) !== env.ADMIN_SETUP_HASH) fail(403, 'setup_invalid');
    const result = await database(env).prepare('INSERT OR IGNORE INTO admin (slot, user_id, created_at) VALUES (1, ?, ?)').bind(userId, Date.now()).run();
    if (result.meta.changes !== 1) fail(409, 'setup_used');
    return json({ ok: true });
  }
  if (path.startsWith('/api/admin/')) {
    if (!(await authorized(request, env))) fail(identity(request) ? 403 : 401, 'access');
    if (method !== 'GET') sameOrigin(request);
    if (path === '/api/admin/media' && method === 'GET') {
      const rows = await database(env).prepare('SELECT * FROM media ORDER BY position DESC, created_at DESC LIMIT 200').all();
      return json({ items: rows.results.map(serialize) });
    }
    if (path === '/api/admin/media' && method === 'POST') {
      const count = await database(env).prepare('SELECT count(*) AS total FROM media').first();
      if (count.total >= 200) fail(409, 'library_full');
      const mime = request.headers.get('Content-Type')?.split(';')[0];
      if (!TYPES.has(mime)) fail(415, 'type');
      const data = await bytes(request, mime.startsWith('video/') ? MAX_VIDEO : MAX_IMAGE);
      if (!signature(data, mime)) fail(415, 'type');
      const id = crypto.randomUUID(), key = `uploads/${id}`, now = Date.now();
      await env.BUCKET.put(key, data, { httpMetadata: { contentType: mime } });
      try {
        await database(env).prepare('INSERT INTO media (id, object_key, mime, size, created_at, updated_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, key, mime, data.byteLength, now, now, now).run();
      } catch (error) { await env.BUCKET.delete(key); throw error; }
      return json({ item: serialize(await item(env, id)) }, 201);
    }
    const match = /^\/api\/admin\/media\/([a-f0-9-]{36})$/.exec(path);
    if (match && ['PATCH','DELETE'].includes(method)) {
      const row = await item(env, match[1]); if (!row) fail(404, 'not_found');
      if (method === 'DELETE') {
        // Keep the row as an unpublished tombstone until object deletion succeeds.
        await database(env).prepare('UPDATE media SET published = 0 WHERE id = ?').bind(row.id).run();
        await env.BUCKET.delete(row.object_key);
        await database(env).prepare('DELETE FROM media WHERE id = ?').bind(row.id).run();
        return json({ ok: true });
      }
      const data = await bodyJSON(request);
      if (typeof data.title !== 'string' || data.title.trim().length > 120 || typeof data.caption !== 'string' || data.caption.trim().length > 1200 || typeof data.published !== 'boolean') fail(400, 'invalid');
      if (data.published && !data.title.trim()) fail(400, 'title_required');
      const position = data.first === true ? Date.now() : row.position;
      await database(env).prepare('UPDATE media SET title = ?, caption = ?, published = ?, position = ?, updated_at = ? WHERE id = ?').bind(data.title.trim(), data.caption.trim(), data.published ? 1 : 0, position, Date.now(), row.id).run();
      return json({ item: serialize(await item(env, row.id)) });
    }
    fail(405, 'method');
  }
  if (path.startsWith('/api/')) fail(404, 'not_found');
  if (!['GET','HEAD'].includes(method)) fail(405, 'method');
  const file = assets[path === '/' ? '/index.html' : path === '/admin' || path === '/admin/' ? '/admin.html' : path];
  if (!file) return new Response('Not found', { status: 404 });
  const data = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
  return new Response(method === 'HEAD' ? null : data, { headers: { 'Content-Type': file.type, 'Cache-Control': file.type.startsWith('text/html') ? 'no-store' : 'public, max-age=300' } });
}
export default {
  async fetch(request, env) {
    let response;
    try { response = await route(request, env); }
    catch (error) {
      if (!(error instanceof HttpError)) console.error('Content request failed', new URL(request.url).pathname, error.message);
      response = json({ error: error instanceof HttpError ? error.message : 'unavailable' }, error.status || 503);
      if (new URL(request.url).pathname === '/api/gallery') response = publicCors(response, request);
    }
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('X-Frame-Options', 'DENY');
    if (new URL(request.url).pathname.startsWith('/admin')) {
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return new Response(response.body, { status: response.status, headers });
  }
};
