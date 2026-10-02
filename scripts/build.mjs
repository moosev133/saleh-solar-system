import { readdir, readFile, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.txt':'text/plain' };
const assets = {};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes:true })) {
    if (entry.name.startsWith('.') || entry.name === 'server') continue;
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(filename);
    else assets['/' + path.relative('dist', filename).split(path.sep).join('/')] = { type:types[path.extname(filename)] || 'application/octet-stream', data:(await readFile(filename)).toString('base64') };
  }
}
await walk('dist');
await rm('dist/server', { recursive:true, force:true });
await mkdir('dist/server', { recursive:true });
await mkdir('dist/.openai', { recursive:true });
await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json');
const modules = await Promise.all(['http', 'database', 'auth', 'index'].map(async name => {
  const source = await readFile(`worker/${name}.js`, 'utf8');
  return source.replace(/^import .*;\n/gm, '').replace(/^export (?!default)/gm, '');
}));
await writeFile('dist/server/index.js', 'const assets = ' + JSON.stringify(assets) + ';\n' + modules.join('\n'));
console.log(`Built content Worker with ${Object.keys(assets).length} website assets.`);
