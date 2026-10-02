// Development only: this loopback proxy is never part of the published Worker.
import http from 'node:http';
import { Readable } from 'node:stream';
import { runtime } from './local-runtime.mjs';
const mf = await runtime(true);
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost:4174');
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value && !key.startsWith('oai-'))headers.set(key,String(value));
    const options={method:req.method,headers};
    if(!['GET','HEAD'].includes(req.method)){options.body=Readable.toWeb(req);options.duplex='half';}
    const response=await mf.dispatchFetch(url.toString(),options);
    const outgoing=Object.fromEntries(response.headers); outgoing['cache-control']='no-store';res.writeHead(response.status,outgoing);
    if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end();
  }catch(error){console.error(error);res.writeHead(500);res.end('Local preview unavailable');}
});
server.listen(4174,'127.0.0.1',()=>console.log('Content studio preview: http://localhost:4174/admin (username: preview; password: local-preview-only)'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{server.close();await mf.dispose();process.exit(0);});
