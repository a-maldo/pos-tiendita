// service-worker.js
const CACHE_NAME = "pos-tiendita-v1";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  // agrega aquí otras rutas si separas CSS/JS o usas imágenes propias
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Estrategia cache-first con fallback a red
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // cachea GETs del mismo origen
        const url = new URL(req.url);
        if (req.method === "GET" && url.origin === self.location.origin) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        }
        return res;
      }).catch(() => {
        // opcional: respuesta offline custom
        return cached || new Response("Offline", { status: 503 });
      });
    })
  );
});
