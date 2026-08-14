// sw.js — Service Worker mínimo.
// Chrome/Android exige uno registrado (con un manejador de "fetch") para
// considerar el sitio "instalable" y disparar el botón de "Agregar a inicio".
// Este es intencionalmente simple: no cachea nada agresivo, solo cumple el requisito
// y deja pasar todas las peticiones tal cual (para no romper los streams de radio/TV).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Deja pasar todo tal cual — no interceptamos streams de audio/video en vivo.
  event.respondWith(fetch(event.request));
});
