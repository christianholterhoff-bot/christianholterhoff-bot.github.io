// Service Worker, sorgt dafür, dass die App Oberflaeche auch ohne Internet startet.
// Netzwerk zuerst, Cache nur als Rueckfallebene ohne Internet, so ist beim naechsten
// Aufruf mit Internet immer automatisch die neueste Version zu sehen, ganz ohne
// Websitedaten loeschen oder zweimal neu laden
// REVISIONSSTAND, V18, Code Stand 09.07.2026
// Bei jeder Aenderung an index.html diesen Namen mit hochzaehlen
const CACHE_NAME = 'baustellen-check-v18';
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
  // fremde Adressen (Kartenkacheln, Firebase, externe Bibliotheken) ganz normal
  // aus dem Internet laden, die fasst dieser Cache nicht an
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(antwort => {
      const kopie = antwort.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, kopie));
      return antwort;
    }).catch(() => caches.match(event.request).then(gefunden => gefunden || caches.match(EIGENE_SEITE)))
  );
});
