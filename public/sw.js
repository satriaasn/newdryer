self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('agrodryer-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/login',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
