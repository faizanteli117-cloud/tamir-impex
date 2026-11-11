/* TAMIR BILLING service worker: opens instantly and works offline.
   To push an update to everyone, change VERSION below and upload the files again. */
const VERSION='tamir-v4',SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
const own=u.origin===location.origin,lib=/(^|\.)gstatic\.com$|(^|\.)googleapis\.com$/.test(u.hostname)&&/firebasejs|fonts/.test(u.pathname+u.hostname);
if(!own&&!lib)return; /* Firestore / Auth traffic is left alone */
e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(r,{ignoreSearch:own});
const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
return hit||net}))});
