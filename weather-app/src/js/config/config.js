/**
 * Weather App Configuration
 * Premium Glassmorphism Weather Application
 */

export const CONFIG = {
  // OpenWeatherMap API Configuration
  API: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    ICON_URL: 'https://openweathermap.org/img/wn',
    KEY: '', // Add your OpenWeatherMap API key here
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },

  // Default Settings
  DEFAULTS: {
    UNITS: 'metric', // 'metric', 'imperial', 'kelvin'
    THEME: 'auto', // 'light', 'dark', 'auto'
    LANGUAGE: 'en',
    LOCATION: {
      lat: 40.7128,
      lon: -74.0060,
      name: 'New York',
      country: 'US'
    },
    REFRESH_INTERVAL: 300000, // 5 minutes
    GEOLOCATION_TIMEOUT: 10000, // 10 seconds
    GEOLOCATION_MAX_AGE: 300000 // 5 minutes
  },

  // UI Configuration
  UI: {
    ANIMATIONS: {
      DURATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500,
        VERY_SLOW: 800
      },
      EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
      STAGGER_DELAY: 100
    },
    
    BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
      '2XL': 1536
    },

    TOAST: {
      DURATION: {
        SUCCESS: 4000,
        ERROR: 6000,
        WARNING: 5000,
        INFO: 4000
      },
      MAX_TOASTS: 3,
      POSITION: 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    },

    SEARCH: {
      MIN_CHARS: 2,
      DEBOUNCE_DELAY: 300,
      MAX_RESULTS: 8,
      SHOW_COUNTRY: true,
      SHOW_STATE: true
    },

    FORECAST: {
      HOURLY_ITEMS: 24,
      DAILY_ITEMS: 7,
      SCROLL_BEHAVIOR: 'smooth'
    }
  },

  // Weather Conditions Mapping
  WEATHER_CONDITIONS: {
    // Thunderstorm
    200: { icon: '11d', name: 'Thunderstorm with Light Rain', category: 'thunderstorm' },
    201: { icon: '11d', name: 'Thunderstorm with Rain', category: 'thunderstorm' },
    202: { icon: '11d', name: 'Thunderstorm with Heavy Rain', category: 'thunderstorm' },
    210: { icon: '11d', name: 'Light Thunderstorm', category: 'thunderstorm' },
    211: { icon: '11d', name: 'Thunderstorm', category: 'thunderstorm' },
    212: { icon: '11d', name: 'Heavy Thunderstorm', category: 'thunderstorm' },
    221: { icon: '11d', name: 'Ragged Thunderstorm', category: 'thunderstorm' },
    230: { icon: '11d', name: 'Thunderstorm with Light Drizzle', category: 'thunderstorm' },
    231: { icon: '11d', name: 'Thunderstorm with Drizzle', category: 'thunderstorm' },
    232: { icon: '11d', name: 'Thunderstorm with Heavy Drizzle', category: 'thunderstorm' },

    // Drizzle
    300: { icon: '09d', name: 'Light Drizzle', category: 'drizzle' },
    301: { icon: '09d', name: 'Drizzle', category: 'drizzle' },
    302: { icon: '09d', name: 'Heavy Drizzle', category: 'drizzle' },
    310: { icon: '09d', name: 'Light Drizzle Rain', category: 'drizzle' },
    311: { icon: '09d', name: 'Drizzle Rain', category: 'drizzle' },
    312: { icon: '09d', name: 'Heavy Drizzle Rain', category: 'drizzle' },
    313: { icon: '09d', name: 'Shower Rain and Drizzle', category: 'drizzle' },
    314: { icon: '09d', name: 'Heavy Shower Rain and Drizzle', category: 'drizzle' },
    321: { icon: '09d', name: 'Shower Drizzle', category: 'drizzle' },

    // Rain
    500: { icon: '10d', name: 'Light Rain', category: 'rain' },
    501: { icon: '10d', name: 'Moderate Rain', category: 'rain' },
    502: { icon: '10d', name: 'Heavy Rain', category: 'rain' },
    503: { icon: '10d', name: 'Very Heavy Rain', category: 'rain' },
    504: { icon: '10d', name: 'Extreme Rain', category: 'rain' },
    511: { icon: '13d', name: 'Freezing Rain', category: 'rain' },
    520: { icon: '09d', name: 'Light Shower Rain', category: 'rain' },
    521: { icon: '09d', name: 'Shower Rain', category: 'rain' },
    522: { icon: '09d', name: 'Heavy Shower Rain', category: 'rain' },
    531: { icon: '09d', name: 'Ragged Shower Rain', category: 'rain' },

    // Snow
    600: { icon: '13d', name: 'Light Snow', category: 'snow' },
    601: { icon: '13d', name: 'Snow', category: 'snow' },
    602: { icon: '13d', name: 'Heavy Snow', category: 'snow' },
    611: { icon: '13d', name: 'Sleet', category: 'snow' },
    612: { icon: '13d', name: 'Light Shower Sleet', category: 'snow' },
    613: { icon: '13d', name: 'Shower Sleet', category: 'snow' },
    615: { icon: '13d', name: 'Light Rain and Snow', category: 'snow' },
    616: { icon: '13d', name: 'Rain and Snow', category: 'snow' },
    620: { icon: '13d', name: 'Light Shower Snow', category: 'snow' },
    621: { icon: '13d', name: 'Shower Snow', category: 'snow' },
    622: { icon: '13d', name: 'Heavy Shower Snow', category: 'snow' },

    // Atmosphere
    701: { icon: '50d', name: 'Mist', category: 'atmosphere' },
    711: { icon: '50d', name: 'Smoke', category: 'atmosphere' },
    721: { icon: '50d', name: 'Haze', category: 'atmosphere' },
    731: { icon: '50d', name: 'Sand/Dust Whirls', category: 'atmosphere' },
    741: { icon: '50d', name: 'Fog', category: 'atmosphere' },
    751: { icon: '50d', name: 'Sand', category: 'atmosphere' },
    761: { icon: '50d', name: 'Dust', category: 'atmosphere' },
    762: { icon: '50d', name: 'Volcanic Ash', category: 'atmosphere' },
    771: { icon: '50d', name: 'Squalls', category: 'atmosphere' },
    781: { icon: '50d', name: 'Tornado', category: 'atmosphere' },

    // Clear
    800: { icon: '01d', name: 'Clear Sky', category: 'clear' },

    // Clouds
    801: { icon: '02d', name: 'Few Clouds', category: 'clouds' },
    802: { icon: '03d', name: 'Scattered Clouds', category: 'clouds' },
    803: { icon: '04d', name: 'Broken Clouds', category: 'clouds' },
    804: { icon: '04d', name: 'Overcast Clouds', category: 'clouds' }
  },

  // Unit Conversions
  UNITS: {
    TEMPERATURE: {
      CELSIUS: '°C',
      FAHRENHEIT: '°F',
      KELVIN: 'K'
    },
    SPEED: {
      METRIC: 'm/s',
      IMPERIAL: 'mph',
      KMPH: 'km/h'
    },
    PRESSURE: {
      HPA: 'hPa',
      INHG: 'inHg',
      MMHG: 'mmHg'
    },
    DISTANCE: {
      METRIC: 'km',
      IMPERIAL: 'mi'
    }
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    SETTINGS: 'weather-app-settings',
    FAVORITES: 'weather-app-favorites',
    RECENT_SEARCHES: 'weather-app-recent-searches',
    CACHE: 'weather-app-cache',
    LAST_UPDATE: 'weather-app-last-update'
  },

  // Error Messages
  ERRORS: {
    NETWORK: 'Network connection failed. Please check your internet connection.',
    API_KEY: 'Invalid API key. Please check your configuration.',
    LOCATION_NOT_FOUND: 'Location not found. Please try a different search term.',
    GEOLOCATION_DENIED: 'Location access denied. Please search for a location manually.',
    GEOLOCATION_UNAVAILABLE: 'Geolocation is not available in your browser.',
    GEOLOCATION_TIMEOUT: 'Location request timed out. Please try again.',
    DATA_PARSING: 'Error parsing weather data. Please try again later.',
    CACHE_ERROR: 'Error accessing cached data.',
    UNKNOWN: 'An unexpected error occurred. Please try again.'
  },

  // Success Messages
  SUCCESS: {
    LOCATION_UPDATED: 'Location updated successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    THEME_CHANGED: 'Theme changed successfully',
    UNITS_CHANGED: 'Units changed successfully',
    DATA_REFRESHED: 'Weather data refreshed'
  },

  // Features
  FEATURES: {
    PWA: true,
    OFFLINE: true,
    NOTIFICATIONS: true,
    GEOLOCATION: true,
    FAVORITES: true,
    RECENT_SEARCHES: true,
    AUTO_REFRESH: true,
    THEME_SWITCHING: true,
    UNIT_SWITCHING: true,
    SEARCH_SUGGESTIONS: true,
    WEATHER_ALERTS: true,
    ACCESSIBILITY: true
  },

  // PWA Configuration
  PWA: {
    UPDATE_CHECK_INTERVAL: 60000, // 1 minute
    CACHE_VERSION: '1.0.0',
    CACHE_NAME: 'weather-app-v1',
    OFFLINE_PAGES: ['/offline.html'],
    NOTIFICATION_ICON: '/icons/icon-192x192.png',
    NOTIFICATION_BADGE: '/icons/badge-72x72.png'
  },

  // Development/Debug
  DEBUG: {
    ENABLED: false,
    LOG_LEVEL: 'warn', // 'error', 'warn', 'info', 'debug'
    PERFORMANCE_MONITORING: false,
    MOCK_DATA: false
  }
};

// Environment Detection
export const ENV = {
  IS_DEV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  IS_PROD: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
  IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  IS_TABLET: /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent),
  IS_TOUCH: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  IS_PWA: window.matchMedia('(display-mode: standalone)').matches,
  SUPPORTS_SERVICE_WORKER: 'serviceWorker' in navigator,
  SUPPORTS_NOTIFICATIONS: 'Notification' in window,
  SUPPORTS_GEOLOCATION: 'geolocation' in navigator,
  SUPPORTS_LOCAL_STORAGE: (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  })()
};

// API Endpoints
export const ENDPOINTS = {
  CURRENT_WEATHER: (lat, lon, units = 'metric', lang = 'en') =>
    `${CONFIG.API.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${CONFIG.API.KEY}`,
  
  FORECAST: (lat, lon, units = 'metric', lang = 'en') =>
    `${CONFIG.API.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${CONFIG.API.KEY}`,
  
  GEOCODING: (query, limit = 5) =>
    `${CONFIG.API.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${CONFIG.API.KEY}`,
  
  REVERSE_GEOCODING: (lat, lon, limit = 1) =>
    `${CONFIG.API.GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${CONFIG.API.KEY}`,
  
  WEATHER_ICON: (icon, size = '@2x') =>
    `${CONFIG.API.ICON_URL}/${icon}${size}.png`,
  
  ONE_CALL: (lat, lon, exclude = 'minutely,alerts', units = 'metric', lang = 'en') =>
    `${CONFIG.API.BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=${exclude}&units=${units}&lang=${lang}&appid=${CONFIG.API.KEY}`
};

export default CONFIG;
