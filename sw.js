// REVISIONSSTAND, V24, Code Stand 11.07.2026
const CACHE_NAME = 'baustellen-check-v24';
const EIGENE_SEITE = './index.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./', EIGENE_SEITE]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(alteNamen =>
      Promise.all(alteNamen.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(antwort => {
      const kopie = antwort.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, kopie));
      return antwort;
    }).catch(() => caches.match(event.request).then(gefunden => gefunden || caches.match(EIGENE_SEITE)))
  );
});
