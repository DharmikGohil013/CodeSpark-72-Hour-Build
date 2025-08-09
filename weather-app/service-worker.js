/**
 * Service Worker for Weather App PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'weather-app-v1';
const CACHE_VERSION = '1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  
  // CSS Files
  '/src/css/variables.css',
  '/src/css/base.css',
  '/src/css/layout.css',
  '/src/css/animations.css',
  '/src/css/components/header.css',
  '/src/css/components/search.css',
  '/src/css/components/current-card.css',
  '/src/css/components/hourly.css',
  '/src/css/components/forecast.css',
  '/src/css/components/unit-toggle.css',
  '/src/css/components/theme-toggle.css',
  '/src/css/components/toast.css',
  '/src/css/themes/light.css',
  '/src/css/themes/dark.css',
  
  // JavaScript Files
  '/src/js/main.js',
  '/src/js/config.js',
  '/src/js/store/state.js',
  '/src/js/services/openMeteo.js',
  '/src/js/services/geocoding.js',
  '/src/js/services/cache.js',
  '/src/js/utils/dom.js',
  '/src/js/utils/format.js',
  '/src/js/utils/units.js',
  '/src/js/utils/debounce.js',
  '/src/js/utils/error.js',
  '/src/js/components/Header.js',
  '/src/js/components/SearchBar.js',
  '/src/js/components/CurrentWeatherCard.js',
  '/src/js/components/HourlyScroller.js',
  '/src/js/components/ForecastGrid.js',
  '/src/js/components/UnitToggle.js',
  '/src/js/components/ThemeToggle.js',
  '/src/js/components/Loader.js',
  '/src/js/components/Toast.js',
  '/src/js/workers/sw-register.js',
  
  // Fonts (Google Fonts)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
  
  // Weather Icons (will be cached as they are requested)
  // API responses will be cached separately with different strategies
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.weatherapi\.com\/v1\/current\.json/,
  /^https:\/\/api\.weatherapi\.com\/v1\/forecast\.json/,
  /^https:\/\/api\.weatherapi\.com\/v1\/search\.json/
];

// Network-first patterns (always try network first, fallback to cache)
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/api\.weatherapi\.com/
];

// Cache-first patterns (try cache first, fallback to network)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:css|js)$/,
  /^https:\/\/fonts\./
];

/**
 * Service Worker Install Event
 * Pre-cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('📦 Service Worker: Caching static assets');
        
        // Cache static assets in chunks to avoid overwhelming the browser
        const chunkSize = 10;
        for (let i = 0; i < STATIC_ASSETS.length; i += chunkSize) {
          const chunk = STATIC_ASSETS.slice(i, i + chunkSize);
          await cache.addAll(chunk);
        }
        
        console.log('✅ Service Worker: Static assets cached successfully');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('❌ Service Worker: Failed to cache assets:', error);
      }
    })()
  );
});

/**
 * Service Worker Activate Event
 * Clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('weather-app-') && name !== CACHE_NAME
        );
        
        if (oldCaches.length > 0) {
          console.log('🧹 Service Worker: Cleaning up old caches:', oldCaches);
          await Promise.all(oldCaches.map(name => caches.delete(name)));
        }
        
        // Take control of all clients immediately
        await self.clients.claim();
        
        console.log('✅ Service Worker: Activated successfully');
      } catch (error) {
        console.error('❌ Service Worker: Activation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Fetch Event
 * Handle network requests with appropriate caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle different types of requests with appropriate strategies
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // API Requests - Network First with Cache Fallback
    if (isApiRequest(url)) {
      return await networkFirstStrategy(request);
    }
    
    // Static Assets - Cache First with Network Fallback  
    if (isCacheFirstRequest(url)) {
      return await cacheFirstStrategy(request);
    }
    
    // HTML Pages - Network First with Cache Fallback
    if (isHTMLRequest(request)) {
      return await networkFirstStrategy(request, '/offline.html');
    }
    
    // Default - Network First
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('❌ Service Worker: Request failed:', error);
    
    // Return offline page for navigation requests
    if (isHTMLRequest(request)) {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request, fallbackUrl = null) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses (except for opaque responses)
    if (response.status === 200) {
      // Clone the response before caching (responses can only be consumed once)
      const responseClone = response.clone();
      
      // Don't wait for cache.put to complete
      cache.put(request, responseClone).catch(error => {
        console.warn('⚠️ Service Worker: Failed to cache response:', error);
      });
    }
    
    return response;
    
  } catch (error) {
    console.log('📦 Service Worker: Network failed, trying cache for:', request.url);
    
    // Try cache fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try fallback URL if provided
    if (fallbackUrl) {
      const fallbackResponse = await cache.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Cache First Strategy  
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to network
  const response = await fetch(request);
  
  // Cache successful responses
  if (response.status === 200) {
    const responseClone = response.clone();
    cache.put(request, responseClone).catch(error => {
      console.warn('⚠️ Service Worker: Failed to cache response:', error);
    });
  }
  
  return response;
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try to get cached response first
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      const responseClone = response.clone();
      cache.put(request, responseClone).catch(error => {
        console.warn('⚠️ Service Worker: Failed to update cache:', error);
      });
    }
    return response;
  }).catch(error => {
    console.warn('⚠️ Service Worker: Background fetch failed:', error);
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || await fetchPromise;
}

/**
 * Helper Functions
 */

function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

function isCacheFirstRequest(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

function isHTMLRequest(request) {
  return request.headers.get('Accept')?.includes('text/html');
}

/**
 * Background Sync Event
 * Handle background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'weather-sync') {
    event.waitUntil(syncWeatherData());
  }
});

/**
 * Sync weather data when back online
 */
async function syncWeatherData() {
  try {
    // Get stored location from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      // Notify clients to refresh weather data
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_WEATHER',
          message: 'Syncing weather data...'
        });
      });
    }
    
    console.log('✅ Service Worker: Weather data sync completed');
  } catch (error) {
    console.error('❌ Service Worker: Weather sync failed:', error);
  }
}

/**
 * Push Event
 * Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push event received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Weather update available',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'weather-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Weather App', options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Message Event
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_VERSION
      });
      break;
      
    case 'CACHE_WEATHER_DATA':
      cacheWeatherData(payload).then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    default:
      console.warn('⚠️ Service Worker: Unknown message type:', type);
  }
});

/**
 * Cache weather data manually
 */
async function cacheWeatherData(data) {
  const cache = await caches.open(CACHE_NAME);
  
  // Create a synthetic response for the weather data
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=300' // 5 minutes
    }
  });
  
  await cache.put('weather-data-manual', response);
  console.log('✅ Service Worker: Weather data cached manually');
}

/**
 * Periodic Background Sync (future feature)
 */
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Service Worker: Periodic sync event:', event.tag);
  
  if (event.tag === 'weather-update') {
    event.waitUntil(updateWeatherInBackground());
  }
});

/**
 * Update weather data in background
 */
async function updateWeatherInBackground() {
  try {
    console.log('🔄 Service Worker: Updating weather in background...');
    
    // This would trigger the app to refresh weather data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_UPDATE',
        message: 'Updating weather data in background...'
      });
    });
    
    console.log('✅ Service Worker: Background weather update completed');
  } catch (error) {
    console.error('❌ Service Worker: Background update failed:', error);
  }
}

console.log(`🚀 Service Worker ${CACHE_VERSION} loaded`);

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker: Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker: Error:', event.error);
});

export default self;