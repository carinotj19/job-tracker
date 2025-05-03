const CACHE_NAME = 'job-tracker-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  if (request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      // Fall back to network
      const response = await fetch(request);

      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    } catch (err) {
      if (request.mode === 'navigate') {
        const offline = await cache.match('/offline.html');
        if (offline) return offline;
      }
      throw err;
    }
  })());
});