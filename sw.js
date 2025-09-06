// /sw.js

self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/default-icon.png', // Un'icona di default se non specificata
    badge: '/badge-icon.png' // Icona per la barra di stato su Android
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Opzionale: gestisce il click sulla notifica per aprire l'app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Apre la pagina principale al click
  );
});