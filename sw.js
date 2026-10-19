/* Service Worker - Recuperadora J&C PWA */
var CACHE_NAME = 'rjc-cache-v4';
var OFFLINE_URL = 'index.html';

var PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-32.png',
    './icons/favicon-16.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return Promise.all(
                PRECACHE_URLS.map(function (url) {
                    return cache.add(url).catch(function () {
                        return null;
                    });
                })
            );
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.map(function (key) {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                    return null;
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    var request = event.request;

    if (request.method !== 'GET') return;

    var url = new URL(request.url);

    /* Navegación: red primero, luego versión en caché */
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(OFFLINE_URL, copy);
                    });
                    return response;
                })
                .catch(function () {
                    return caches.match(OFFLINE_URL).then(function (cached) {
                        return cached || caches.match('./');
                    });
                })
        );
        return;
    }

    /* Recursos externos (fuentes, iconos, mapas): red primero, caché de respaldo */
    if (url.origin !== self.location.origin) {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    if (response && (response.ok || response.type === 'opaque')) {
                        var copy = response.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(request, copy);
                        });
                    }
                    return response;
                })
                .catch(function () {
                    return caches.match(request);
                })
        );
        return;
    }

    /* Estáticos propios: caché primero con actualización en segundo plano */
    event.respondWith(
        caches.match(request).then(function (cached) {
            var network = fetch(request)
                .then(function (response) {
                    if (response && response.ok) {
                        var copy = response.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(request, copy);
                        });
                    }
                    return response;
                })
                .catch(function () {
                    return cached;
                });

            return cached || network;
        })
    );
});
