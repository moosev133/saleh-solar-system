import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { runtime, LOCAL_USERNAME, LOCAL_PASSWORD } from '../scripts/local-runtime.mjs';

test('password login, session revocation, expiry and former identity isolation', async t => {
  const mf = await runtime(); t.after(() => mf.dispose());
  const db = await mf.getD1Database('DB');
  const origin = 'https://saleh.example';
  const request = (path, body, cookie = '', headers = {}) => mf.dispatchFetch(origin + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Origin:origin, 'Content-Type':'application/json', 'CF-Connecting-IP':'192.0.2.1', Cookie:cookie, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const credentials = { username:LOCAL_USERNAME, password:LOCAL_PASSWORD };
  // Existing activation records must not authorize the former platform account.
  await db.prepare('INSERT INTO admin (slot, user_id, created_at) VALUES (1, ?, ?)').bind('previous-owner',Date.now()).run();
  assert.deepEqual(await (await request('/api/session',undefined,'',{'oai-authenticated-user-id':'previous-owner'})).json(), {signedIn:false,admin:false});
  assert.equal((await request('/api/admin/media',undefined,'',{'oai-authenticated-user-id':'previous-owner'})).status,401);
  assert.equal((await request('/api/claim',{token:'1'.repeat(64)},'',{'oai-authenticated-user-id':'previous-owner'})).status,404);
  assert.equal((await request('/api/login',credentials,'',{Origin:'https://evil.example'})).status,403);
  assert.equal((await request('/api/login',credentials,'',{Origin:''})).status,403);
  for (const attempt of [{...credentials,password:'wrong'}, {...credentials,username:'unknown'}]) {
    const result = await request('/api/login',attempt);
    assert.equal(result.status,401); assert.deepEqual(await result.json(),{error:'invalid_credentials'});
    assert.equal(result.headers.get('Set-Cookie'),null);
  }
  const response = await request('/api/login',credentials);
  assert.equal(response.status,200); assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(await response.json(),{signedIn:true,admin:true});
  const setCookie = response.headers.get('Set-Cookie');
  for (const attribute of ['HttpOnly','Secure','SameSite=Strict','Path=/','Max-Age=28800']) assert.ok(setCookie.includes(attribute));
  assert.ok(!setCookie.includes('Domain='));
  const cookie = setCookie.split(';')[0];
  const token = cookie.split('=')[1]; assert.match(token,/^[a-f0-9]{64}$/);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const stored = await db.prepare('SELECT * FROM admin_sessions').first();
  assert.equal(stored.token_hash,tokenHash); assert.notEqual(stored.token_hash,token);
  assert.equal((await request('/api/admin/media',undefined,cookie)).status,200);
  assert.equal((await request('/api/admin/media',undefined,'__Host-saleh-session='+'a'.repeat(64))).status,401);
  const renewed = await request('/api/login',credentials,cookie);
  const renewedCookie = renewed.headers.get('Set-Cookie').split(';')[0];
  assert.notEqual(renewedCookie,cookie);
  assert.equal((await request('/api/admin/media',undefined,cookie)).status,401);
  assert.equal((await request('/api/logout',{},renewedCookie,{Origin:'https://evil.example'})).status,403);
  assert.equal((await request('/api/admin/media',undefined,renewedCookie)).status,200);
  const signout = await request('/api/logout',{},renewedCookie);
  assert.equal(signout.status,200); assert.ok(signout.headers.get('Set-Cookie').includes('Max-Age=0'));
  assert.equal((await request('/api/admin/media',undefined,renewedCookie)).status,401);
  const expires = await request('/api/login',credentials);
  const expiredCookie = expires.headers.get('Set-Cookie').split(';')[0];
  await db.prepare('UPDATE admin_sessions SET expires_at = ?').bind(Date.now()-1).run();
  assert.equal((await request('/api/admin/media',undefined,expiredCookie)).status,401);
  const rotation = await request('/api/login',credentials);
  const rotatedCookie = rotation.headers.get('Set-Cookie').split(';')[0];
  await db.prepare("UPDATE admin_sessions SET credential_version = 'previous-verifier'").run();
  assert.equal((await request('/api/admin/media',undefined,rotatedCookie)).status,401);
  const page = await (await request('/admin')).text();
  assert.ok(page.includes('autocomplete="current-password"'));
  assert.ok(!page.includes('signin-with-chatgpt')); assert.ok(!page.includes('claim-form'));
});

test('persistent and atomic login limits include a global ceiling', async t => {
  const mf = await runtime(); t.after(() => mf.dispose());
  const db = await mf.getD1Database('DB');
  const request = (body = {}, ip = '192.0.2.10', extra = {}) => mf.dispatchFetch('https://saleh.example/api/login', {
    method:'POST', headers:{Origin:'https://saleh.example','Content-Type':'application/json','CF-Connecting-IP':ip,...extra}, body:JSON.stringify(body)
  });
  const attempts = await Promise.all(Array.from({length:12},() => request()));
  assert.equal(attempts.filter(response => response.status === 401).length,10);
  assert.equal(attempts.filter(response => response.status === 429).length,2);
  const limited = await request({username:LOCAL_USERNAME,password:LOCAL_PASSWORD});
  assert.equal(limited.status,429); assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  assert.ok(Number(limited.headers.get('Retry-After')) <= 900);
  assert.equal((await request({},'192.0.2.10',{'X-Forwarded-For':'198.51.100.1'})).status,429);
  assert.equal((await request({},'192.0.2.11')).status,401);
  await db.prepare('UPDATE login_limits SET started_at = ?').bind(Date.now()-900001).run();
  assert.equal((await request({username:LOCAL_USERNAME,password:LOCAL_PASSWORD})).status,200);
  await db.prepare("UPDATE login_limits SET attempts = 100 WHERE bucket = 'all'").run();
  assert.equal((await request({},'192.0.2.12')).status,429);
});
