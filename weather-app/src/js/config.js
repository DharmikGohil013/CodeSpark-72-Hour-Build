/**
 * Weather App Configuration
 * Contains all constants, settings, and configuration for the weather app
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.weatherapi.com/v1',
  API_KEY: 'de871f762da24183a6c181748250908',
  ENDPOINTS: {
    CURRENT: '/current.json',
    FORECAST: '/forecast.json',
    SEARCH: '/search.json'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Default Settings
export const DEFAULT_SETTINGS = {
  UNITS: 'celsius', // 'celsius' or 'fahrenheit'
  THEME: 'auto', // 'light', 'dark', or 'auto'
  LANGUAGE: 'en',
  LOCATION: {
    lat: 28.6139,
    lon: 77.2090,
    name: 'New Delhi',
    country: 'India'
  },
  REFRESH_INTERVAL: 300000, // 5 minutes
  GEOLOCATION_TIMEOUT: 10000, // 10 seconds
  GEOLOCATION_MAX_AGE: 300000 // 5 minutes
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATIONS: {
    DURATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    STAGGER_DELAY: 100
  },
  
  SEARCH: {
    MIN_CHARS: 2,
    DEBOUNCE_DELAY: 300,
    MAX_RESULTS: 8
  },
  
  TOAST: {
    DURATION: {
      SUCCESS: 4000,
      ERROR: 6000,
      WARNING: 5000,
      INFO: 4000
    },
    MAX_TOASTS: 3
  },
  
  FORECAST: {
    HOURLY_ITEMS: 24,
    DAILY_ITEMS: 7
  }
};

// Weather Conditions Mapping
export const WEATHER_CONDITIONS = {
  // Clear
  1000: { 
    icon: '☀️', 
    name: 'Sunny', 
    category: 'clear',
    gradient: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)'
  },
  
  // Partly Cloudy
  1003: { 
    icon: '⛅', 
    name: 'Partly Cloudy', 
    category: 'partly-cloudy',
    gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)'
  },
  
  // Cloudy
  1006: { 
    icon: '☁️', 
    name: 'Cloudy', 
    category: 'cloudy',
    gradient: 'linear-gradient(135deg, #708090 0%, #2F4F4F 100%)'
  },
  
  1009: { 
    icon: '☁️', 
    name: 'Overcast', 
    category: 'cloudy',
    gradient: 'linear-gradient(135deg, #696969 0%, #2F2F2F 100%)'
  },
  
  // Mist/Fog
  1030: { 
    icon: '🌫️', 
    name: 'Mist', 
    category: 'mist',
    gradient: 'linear-gradient(135deg, #B0C4DE 0%, #778899 100%)'
  },
  
  1135: { 
    icon: '🌫️', 
    name: 'Fog', 
    category: 'fog',
    gradient: 'linear-gradient(135deg, #DCDCDC 0%, #A9A9A9 100%)'
  },
  
  1147: { 
    icon: '🌫️', 
    name: 'Freezing Fog', 
    category: 'fog',
    gradient: 'linear-gradient(135deg, #E6E6FA 0%, #9370DB 100%)'
  },
  
  // Rain
  1063: { 
    icon: '🌦️', 
    name: 'Patchy Rain Possible', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #4682B4 0%, #1E90FF 100%)'
  },
  
  1180: { 
    icon: '🌧️', 
    name: 'Light Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #6495ED 0%, #4169E1 100%)'
  },
  
  1183: { 
    icon: '🌧️', 
    name: 'Light Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #6495ED 0%, #4169E1 100%)'
  },
  
  1186: { 
    icon: '🌧️', 
    name: 'Moderate Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #4682B4 0%, #191970 100%)'
  },
  
  1189: { 
    icon: '🌧️', 
    name: 'Moderate Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #4682B4 0%, #191970 100%)'
  },
  
  1192: { 
    icon: '🌧️', 
    name: 'Heavy Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #191970 0%, #000080 100%)'
  },
  
  1195: { 
    icon: '🌧️', 
    name: 'Heavy Rain', 
    category: 'rain',
    gradient: 'linear-gradient(135deg, #191970 0%, #000080 100%)'
  },
  
  // Snow
  1066: { 
    icon: '🌨️', 
    name: 'Patchy Snow Possible', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #F0F8FF 0%, #E0E6FF 100%)'
  },
  
  1210: { 
    icon: '❄️', 
    name: 'Light Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #F0F8FF 0%, #D6EAF8 100%)'
  },
  
  1213: { 
    icon: '❄️', 
    name: 'Light Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #F0F8FF 0%, #D6EAF8 100%)'
  },
  
  1216: { 
    icon: '❄️', 
    name: 'Moderate Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #E6E6FA 0%, #B0C4DE 100%)'
  },
  
  1219: { 
    icon: '❄️', 
    name: 'Moderate Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #E6E6FA 0%, #B0C4DE 100%)'
  },
  
  1222: { 
    icon: '❄️', 
    name: 'Heavy Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #DCDCDC 0%, #A9A9A9 100%)'
  },
  
  1225: { 
    icon: '❄️', 
    name: 'Heavy Snow', 
    category: 'snow',
    gradient: 'linear-gradient(135deg, #DCDCDC 0%, #A9A9A9 100%)'
  },
  
  // Thunderstorm
  1087: { 
    icon: '⛈️', 
    name: 'Thundery Outbreaks Possible', 
    category: 'thunderstorm',
    gradient: 'linear-gradient(135deg, #483D8B 0%, #2F2F4F 100%)'
  },
  
  1273: { 
    icon: '⛈️', 
    name: 'Light Rain with Thunder', 
    category: 'thunderstorm',
    gradient: 'linear-gradient(135deg, #4B0082 0%, #2F2F4F 100%)'
  },
  
  1276: { 
    icon: '⛈️', 
    name: 'Moderate/Heavy Rain with Thunder', 
    category: 'thunderstorm',
    gradient: 'linear-gradient(135deg, #36013F 0%, #2F2F4F 100%)'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'weather-app-settings',
  LOCATION: 'weather-app-location',
  CACHE: 'weather-app-cache',
  THEME: 'weather-app-theme',
  UNITS: 'weather-app-units',
  LAST_UPDATE: 'weather-app-last-update'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network connection failed. Please check your internet connection.',
  API_KEY: 'Invalid API key. Please check configuration.',
  LOCATION_NOT_FOUND: 'Location not found. Please try a different search term.',
  GEOLOCATION_DENIED: 'Location access denied. Please search for a location manually.',
  GEOLOCATION_UNAVAILABLE: 'Geolocation is not available in your browser.',
  GEOLOCATION_TIMEOUT: 'Location request timed out. Please try again.',
  DATA_PARSING: 'Error parsing weather data. Please try again later.',
  CACHE_ERROR: 'Error accessing cached data.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOCATION_UPDATED: 'Location updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  THEME_CHANGED: 'Theme changed successfully',
  UNITS_CHANGED: 'Units changed successfully',
  DATA_REFRESHED: 'Weather data refreshed'
};

// Temperature Unit Conversion
export const TEMPERATURE_UNITS = {
  CELSIUS: {
    symbol: '°C',
    name: 'Celsius',
    convertFromCelsius: (temp) => temp,
    convertToCelsius: (temp) => temp
  },
  FAHRENHEIT: {
    symbol: '°F',
    name: 'Fahrenheit',
    convertFromCelsius: (temp) => (temp * 9/5) + 32,
    convertToCelsius: (temp) => (temp - 32) * 5/9
  }
};

// Wind Speed Units
export const WIND_SPEED_UNITS = {
  KMH: {
    symbol: 'km/h',
    name: 'Kilometers per hour',
    convertFromKmh: (speed) => speed
  },
  MPH: {
    symbol: 'mph',
    name: 'Miles per hour',
    convertFromKmh: (speed) => speed * 0.621371
  },
  MS: {
    symbol: 'm/s',
    name: 'Meters per second',
    convertFromKmh: (speed) => speed / 3.6
  }
};

// Pressure Units
export const PRESSURE_UNITS = {
  MB: {
    symbol: 'mb',
    name: 'Millibars',
    convertFromMb: (pressure) => pressure
  },
  INHG: {
    symbol: 'inHg',
    name: 'Inches of Mercury',
    convertFromMb: (pressure) => pressure * 0.02953
  },
  HPA: {
    symbol: 'hPa',
    name: 'Hectopascals',
    convertFromMb: (pressure) => pressure
  }
};

// App Features
export const FEATURES = {
  PWA: true,
  OFFLINE: true,
  NOTIFICATIONS: false, // Disabled by default
  GEOLOCATION: true,
  AUTO_REFRESH: true,
  THEME_SWITCHING: true,
  UNIT_SWITCHING: true,
  SEARCH_SUGGESTIONS: true
};

// PWA Configuration
export const PWA_CONFIG = {
  UPDATE_CHECK_INTERVAL: 60000, // 1 minute
  CACHE_VERSION: '1.0.0',
  CACHE_NAME: 'weather-app-v1',
  OFFLINE_PAGES: ['/offline.html'],
  CACHE_STRATEGIES: {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
  }
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Debug Configuration
export const DEBUG = {
  ENABLED: false,
  LOG_LEVEL: 'warn', // 'error', 'warn', 'info', 'debug'
  PERFORMANCE_MONITORING: false,
  MOCK_DATA: false
};

// Time Formats
export const TIME_FORMATS = {
  SHORT_TIME: { hour: '2-digit', minute: '2-digit' },
  LONG_TIME: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  SHORT_DATE: { month: 'short', day: 'numeric' },
  LONG_DATE: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  WEEKDAY: { weekday: 'long' },
  SHORT_WEEKDAY: { weekday: 'short' }
};

// Utility Functions
export const UTILS = {
  // Generate API URL with parameters
  buildApiUrl: (endpoint, params = {}) => {
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('key', API_CONFIG.API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  },
  
  // Get weather condition info
  getWeatherCondition: (code) => {
    return WEATHER_CONDITIONS[code] || {
      icon: '❓',
      name: 'Unknown',
      category: 'unknown',
      gradient: 'linear-gradient(135deg, #808080 0%, #404040 100%)'
    };
  },
  
  // Format temperature
  formatTemperature: (temp, units = DEFAULT_SETTINGS.UNITS) => {
    if (temp === null || temp === undefined) return '--°';
    
    const unit = TEMPERATURE_UNITS[units.toUpperCase()];
    if (!unit) return `${Math.round(temp)}°`;
    
    const convertedTemp = unit.convertFromCelsius(temp);
    return `${Math.round(convertedTemp)}${unit.symbol}`;
  },
  
  // Format wind speed
  formatWindSpeed: (speed, units = 'KMH') => {
    if (speed === null || speed === undefined) return '-- km/h';
    
    const unit = WIND_SPEED_UNITS[units.toUpperCase()];
    if (!unit) return `${Math.round(speed)} km/h`;
    
    const convertedSpeed = unit.convertFromKmh(speed);
    return `${Math.round(convertedSpeed)} ${unit.symbol}`;
  },
  
  // Format pressure
  formatPressure: (pressure, units = 'MB') => {
    if (pressure === null || pressure === undefined) return '-- mb';
    
    const unit = PRESSURE_UNITS[units.toUpperCase()];
    if (!unit) return `${Math.round(pressure)} mb`;
    
    const convertedPressure = unit.convertFromMb(pressure);
    return `${Math.round(convertedPressure)} ${unit.symbol}`;
  },
  
  // Format time
  formatTime: (timestamp, format = TIME_FORMATS.SHORT_TIME) => {
    if (!timestamp) return '--:--';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', format);
  },
  
  // Format date
  formatDate: (timestamp, format = TIME_FORMATS.SHORT_DATE) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', format);
  },
  
  // Get current timestamp
  getCurrentTimestamp: () => Math.floor(Date.now() / 1000),
  
  // Check if data is stale
  isDataStale: (timestamp, maxAge = 300000) => { // 5 minutes default
    return Date.now() - (timestamp * 1000) > maxAge;
  }
};

// Export default configuration object
export default {
  API_CONFIG,
  DEFAULT_SETTINGS,
  UI_CONFIG,
  WEATHER_CONDITIONS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TEMPERATURE_UNITS,
  WIND_SPEED_UNITS,
  PRESSURE_UNITS,
  FEATURES,
  PWA_CONFIG,
  BREAKPOINTS,
  DEBUG,
  TIME_FORMATS,
  UTILS
};