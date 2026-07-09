// Service Worker, sorgt dafür, dass die App Oberflaeche auch ohne Internet startet.
// Karten und externe Bibliotheken (Leaflet) brauchen trotzdem eine Verbindung,
// die kommen deshalb bewusst weiterhin frisch aus dem Netz, nicht aus diesem Cache.
// REVISIONSSTAND, V6, Code Stand 09.07.2026
// Bei jeder Aenderung an index.html diesen Namen mit hochzaehlen,
// nur so verwirft Safari die alte zwischengespeicherte Version
const CACHE_NAME = 'baustellen-check-v6';
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
  // nur die eigene Seite kommt aus dem Cache, alles andere (Kartenkacheln,
  // externe Bibliotheken) wird ganz normal aus dem Internet geladen
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(gefunden => {
      if(gefunden) return gefunden;
      return fetch(event.request).then(antwort => {
        const kopie = antwort.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, kopie));
        return antwort;
      }).catch(() => caches.match(EIGENE_SEITE));
    })
  );
});
