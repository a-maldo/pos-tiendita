// service-worker.js
const BASE = "/pos-tiendita/";
const CACHE_NAME = "pos-tiendita-v1";
const APP_ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        try {
          const url = new URL(event.request.url);
          if (event.request.method === "GET" && url.origin === self.location.origin && url.pathname.startsWith(BASE)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
        } catch {}
        return res;
      }).catch(() => cached || new Response("Offline", { status: 503 }));
    })
  );
});
