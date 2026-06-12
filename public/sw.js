self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, url, tag } = data;

    const options = {
      body: body || '',
      icon: icon || '/favicon.svg',
      badge: badge || '/favicon.svg',
      tag: tag || 'barsynergy',
      data: { url: url || '/' },
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const title = event.data.text() || 'BARSYNERGY';
    event.waitUntil(self.registration.showNotification(title, { icon: '/favicon.svg' }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
