// Service Worker — آلة حاسبة المحطات (أوفلاين)
// يخزّن التطبيق كامل أول مرة، وبعدها يشتغل من غير نت نهائياً.
const CACHE = 'canal-app-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // نخزّن كل أصل لوحده حتى لو فشل واحد ما يوقّفش الباقى
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  // نتعامل فقط مع طلبات GET من نفس الأصل (التطبيق نفسه)
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // أى نداء خارجى يعدّى عادى

  // للتنقّل (فتح الصفحة): الكاش أولاً ثم index.html كخطة بديلة
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match(req).then(function (r) {
        return r || caches.match('./index.html').then(function (h) {
          return h || fetch(req);
        });
      })
    );
    return;
  }

  // باقى الأصول: الكاش أولاً، ولو مش موجود نجيبه من النت ونخزّنه
  e.respondWith(
    caches.match(req).then(function (r) {
      if (r) return r;
      return fetch(req).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return resp;
      }).catch(function () { return r; });
    })
  );
});
