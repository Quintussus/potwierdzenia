/* Service worker: keeps the app working offline.
   Every file is served from the cache at once and refreshed in the
   background, so a new version uploaded to the server shows up on the
   next launch. Raise VERSION whenever the file list changes. */
const VERSION = "potwierdzenia-v4";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./zxing-reader.js",
  "./zxing_reader.wasm",
  "./icon-192.png",
  "./icon-512.png",
  "./maskable-512.png",
  "./apple-touch-icon.png",
  "./barlow-latin-400-normal.woff2",
  "./barlow-latin-ext-400-normal.woff2",
  "./barlow-latin-500-normal.woff2",
  "./barlow-latin-ext-500-normal.woff2",
  "./barlow-latin-600-normal.woff2",
  "./barlow-latin-ext-600-normal.woff2",
  "./barlow-semi-condensed-latin-600-normal.woff2",
  "./barlow-semi-condensed-latin-ext-600-normal.woff2",
  "./barlow-semi-condensed-latin-700-normal.woff2",
  "./barlow-semi-condensed-latin-ext-700-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req)
      .then((res) => { if (res && res.ok && res.type === "basic") cache.put(req, res.clone()); return res; })
      .catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const fresh = await network;
    if (fresh) return fresh;
    if (req.mode === "navigate") return (await cache.match("./index.html")) || (await cache.match("./"));
    return new Response("", { status: 504, statusText: "Offline" });
  })());
});
