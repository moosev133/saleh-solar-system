import { build } from 'esbuild';
import { readdir, readFile, mkdir, copyFile, rm } from 'node:fs/promises';
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
await build({
  entryPoints:['worker/index.js'], outfile:'dist/server/index.js', bundle:true,
  format:'esm', platform:'browser', target:'es2022', legalComments:'inline',
  plugins:[{ name:'website-assets', setup(plugin) {
    plugin.onResolve({filter:/^\.\/assets\.js$/}, () => ({path:'website-assets',namespace:'embedded'}));
    plugin.onLoad({filter:/.*/,namespace:'embedded'}, () => ({contents:'export const assets = ' + JSON.stringify(assets) + ';',loader:'js'}));
  }}],
});
console.log(`Built content Worker with ${Object.keys(assets).length} website assets.`);
