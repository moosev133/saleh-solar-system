import { Miniflare } from 'miniflare';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export const LOCAL_SETUP = '1'.repeat(64);
export async function runtime(persist = false) {
  const mf = new Miniflare({ modules:true, modulesRules:[{type:'ESModule',include:['**/*.js']}], scriptPath:'dist/server/index.js',
    compatibilityDate:'2026-05-15', d1Databases:['DB'], r2Buckets:['BUCKET'],
    d1Persist:persist ? '.local-data/d1' : false, r2Persist:persist ? '.local-data/r2' : false,
    bindings:{ADMIN_SETUP_HASH:createHash('sha256').update(LOCAL_SETUP).digest('hex')},
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
