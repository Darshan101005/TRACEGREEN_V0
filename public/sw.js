// Enhanced service worker for localhost PWA support
const CACHE_NAME = 'tracegreen-v4-dev';
const urlsToCache = [
  '/',
  '/?utm_source=pwa',
  '/dashboard',
  '/dashboard?utm_source=shortcut',
  '/dashboard/track',
  '/dashboard/track?utm_source=shortcut',
  '/dashboard/achievements',
  '/dashboard/rewards',
  '/dashboard/rewards?utm_source=shortcut',
  '/dashboard/community',
  '/dashboard/learn',
  '/dashboard/profile',
  '/auth/login',
  '/auth/sign-up',
  '/images/trace-green-logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
  '/offline.html'
];

// Install event - optimized for localhost development
self.addEventListener('install', (event) => {
  console.log('TraceGreen PWA: Installing service worker for localhost...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('TraceGreen PWA: Cache opened for localhost');
        
        // For localhost, cache core files and ignore failures
        const coreUrls = [
          '/',
          '/manifest.json',
          '/images/trace-green-logo.png',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ];
        
        return Promise.allSettled(
          coreUrls.map(url => {
            return fetch(url)
              .then(response => {
                if (response.status === 200) {
                  return cache.put(url, response);
                }
                throw new Error(`Failed to fetch ${url}`);
              })
              .catch(err => {
                console.log(`TraceGreen PWA: Skipping ${url}:`, err.message);
                return Promise.resolve();
              });
          })
        );
      })
      .then(() => {
        console.log('TraceGreen PWA: Core files cached for localhost');
        return self.skipWaiting(); // Force activation immediately
      })
      .catch((error) => {
        console.log('TraceGreen PWA: Cache install failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('TraceGreen: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'You have a new update from TraceGreen!',
    icon: '/images/trace-green-logo.png',
    badge: '/images/trace-green-logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      url: '/dashboard'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Dashboard',
        icon: '/images/trace-green-logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/trace-green-logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TraceGreen', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

console.log('TraceGreen: Service Worker loaded');
