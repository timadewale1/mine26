'use strict';

const IMAGE_CACHE = 'mine-2026-images-v1';

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin || !requestUrl.pathname.includes('/optimized/')) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })().catch(() => caches.match(request).then(response => response || Response.error())));
});