const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
    "",
    "index.html",
    "css/styles.css",
    "js/my_script.js",
    "images/icon-192x192.png",
    "images/icon-512x512.png"
];

// Install service worker and cache assets
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch from cache first, then network fallback
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Activate and remove old cache
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
