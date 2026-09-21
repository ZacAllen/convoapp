/**
 * Service worker — cache-first over a fixed asset list.
 *
 * The app has no network dependencies at all, so there is no runtime fetching
 * to be clever about: everything it needs is in ASSETS. Bump CACHE when any of
 * those files change, or the old copies will keep being served.
 */
const CACHE = "convoapp-v2";

const ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "prompts.js",
  "settings.js",
  "deck.js",
  "speech.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).catch(() => caches.match("index.html"));
    })
  );
});
