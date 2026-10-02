import { Miniflare } from 'miniflare';
import { readdir, readFile } from 'node:fs/promises';
import { scryptSync } from 'node:crypto';
// Test-only credentials; production credentials are configured separately as a runtime secret.
export const LOCAL_USERNAME = 'preview';
export const LOCAL_PASSWORD = 'local-preview-only';
const salt = '12'.repeat(32);
export const LOCAL_CREDENTIALS = JSON.stringify({ algorithm:'scrypt', N:16384, r:8, p:5, username:LOCAL_USERNAME, salt, hash:scryptSync(LOCAL_PASSWORD, Buffer.from(salt,'hex'),32,{N:16384,r:8,p:5,maxmem:32*1024*1024}).toString('hex') });
export async function runtime(persist = false) {
  const mf = new Miniflare({ modules:true, modulesRules:[{type:'ESModule',include:['**/*.js']}], scriptPath:'dist/server/index.js',
    compatibilityDate:'2026-05-15', d1Databases:['DB'], r2Buckets:['BUCKET'],
    d1Persist:persist ? '.local-data/d1' : false, r2Persist:persist ? '.local-data/r2' : false,
    bindings:{ADMIN_CREDENTIALS:LOCAL_CREDENTIALS},
  });
  const db = await mf.getD1Database('DB');
  await db.prepare('CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)').run();
  for(const name of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort()) {
    if(await db.prepare('SELECT name FROM _local_migrations WHERE name=?').bind(name).first()) continue;
    const statements=(await readFile('drizzle/'+name,'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean);
    await db.batch(statements.map(sql=>db.prepare(sql)));
    await db.prepare('INSERT INTO _local_migrations (name) VALUES (?)').bind(name).run();
  }
  return mf;
}
