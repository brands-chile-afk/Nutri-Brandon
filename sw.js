const CACHE_NAME = "nutrilife-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
];

// Instalar Service Worker y almacenar en caché los activos estáticos
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de red primero (Network First) cayendo a caché si está offline
self.addEventListener("fetch", (e) => {
  // Evitar interceptar solicitudes a servicios de terceros o API de Gemini
  if (e.request.url.includes("generativelanguage.googleapis.com") || e.request.url.includes("chrome-extension")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clonar la respuesta y guardarla en caché si es válida
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
