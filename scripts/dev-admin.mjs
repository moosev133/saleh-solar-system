// Development only: this loopback proxy is never part of the published Worker.
import http from 'node:http';
import { Readable } from 'node:stream';
import { runtime } from './local-runtime.mjs';
const mf = await runtime(true);
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost:4174');
    if(url.pathname==='/signin-with-chatgpt'||url.pathname==='/signout-with-chatgpt') {
      const signedIn=url.pathname==='/signin-with-chatgpt';
      res.writeHead(302,{'Set-Cookie':`sss-local=${signedIn?'yes':''}; Path=/; HttpOnly; SameSite=Lax${signedIn?'':'; Max-Age=0'}`,'Location':'/admin'});return res.end();
    }
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value && !key.startsWith('oai-'))headers.set(key,String(value));
    if((req.headers.cookie||'').split(';').some(value=>value.trim()==='sss-local=yes'))headers.set('oai-authenticated-user-id','local-preview-owner');
    const options={method:req.method,headers};
    if(!['GET','HEAD'].includes(req.method)){options.body=Readable.toWeb(req);options.duplex='half';}
    const response=await mf.dispatchFetch(url.toString(),options);
    const outgoing=Object.fromEntries(response.headers); outgoing['cache-control']='no-store';res.writeHead(response.status,outgoing);
    if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end();
  }catch(error){console.error(error);res.writeHead(500);res.end('Local preview unavailable');}
});
server.listen(4174,'127.0.0.1',()=>console.log('Content studio preview: http://localhost:4174/admin (development sign-in only)'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{server.close();await mf.dispose();process.exit(0);});
