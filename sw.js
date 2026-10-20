// غازتك — نسخة المحطة (تحديث برنامج الأوفلاين): تعمل بدون إنترنت + تحديث تلقائى عند توفر نسخة أحدث
const CACHE='canal-app-v23';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ const ks=await caches.keys(); await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))); await self.clients.claim();
  // الصفحات المفتوحة بالنسخة القديمة تُعاد تحميلها فوراً بالنسخة الجديدة
  const cls=await self.clients.matchAll({type:'window'}); for(const c of cls){ try{ if('navigate' in c) await c.navigate(c.url); }catch(e){} } })()); });
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; const u=new URL(e.request.url);
  if(u.origin===location.origin){ e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r; }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))); }
  else { e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r; }).catch(()=>new Response('',{status:503})))); } });
