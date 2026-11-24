/* TAMIR BILLING service worker.
   - The app page is always fetched fresh when you are online, and falls back to the saved copy when offline.
   - To release an update: change VERSION below, upload the files again. */
const VERSION='tamir-v14',SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const page=r=>r.mode==='navigate'||/\/(index\.html)?$/.test(new URL(r.url).pathname);
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
const own=u.origin===location.origin,lib=/(^|\.)gstatic\.com$|(^|\.)googleapis\.com$/.test(u.hostname)&&/firebasejs|fonts/.test(u.pathname+u.hostname);
if(!own&&!lib)return; /* Firestore / Auth traffic is left alone */
if(own&&page(r)){e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match('./index.html')||await c.match(r,{ignoreSearch:true});
try{const res=await Promise.race([fetch(r.url,{cache:'no-store'}),new Promise((_,j)=>setTimeout(()=>j(0),4000))]);if(res&&res.ok){c.put('./index.html',res.clone());return res}}catch(x){}
return hit||fetch(r)}));return}
e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(r,{ignoreSearch:own});
const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}))});
