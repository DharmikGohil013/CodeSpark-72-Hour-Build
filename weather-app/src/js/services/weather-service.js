/**
 * Weather Service
 * Handles all weather-related API calls and data processing
 */

import { CONFIG, ENDPOINTS } from '../config/config.js';
import { StorageService } from './storage-service.js';
import { Logger } from '../utils/logger.js';
import { fetchWithTimeout, retryRequest } from '../utils/api-helpers.js';

export class WeatherService {
  constructor() {
    this.logger = new Logger('WeatherService');
    this.storageService = new StorageService();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.isInitialized = false;
  }

  /**
   * Initialize the weather service
   */
  async init() {
    try {
      this.logger.info('Initializing Weather Service...');
      
      // Load cache from storage
      this.loadCacheFromStorage();
      
      // Verify API key
      if (!CONFIG.API.KEY) {
        throw new Error('API key not configured');
      }
      
      this.isInitialized = true;
      this.logger.info('Weather Service initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize Weather Service:', error);
      throw error;
    }
  }

  /**
   * Get current weather for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Units (metric, imperial, kelvin)
   * @param {string} lang - Language code
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(lat, lon, units = 'metric', lang = 'en') {
    try {
      this.logger.info(`Getting current weather for ${lat}, ${lon}`);
      
      // Check cache first
      const cacheKey = `current_${lat}_${lon}_${units}_${lang}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.logger.info('Returning cached current weather data');
        return cached;
      }
      
      // Fetch from API
      const url = ENDPOINTS.CURRENT_WEATHER(lat, lon, units, lang);
      const response = await retryRequest(() => fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }), CONFIG.API.RETRY_ATTEMPTS, CONFIG.API.RETRY_DELAY);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process and validate data
      const processedData = this.processCurrentWeatherData(data);
      
      // Cache the data
      this.setCachedData(cacheKey, processedData);
      
      this.logger.info('Current weather data fetched successfully');
      return processedData;
      
    } catch (error) {
      this.logger.error('Failed to get current weather:', error);
      
      // Try to return cached data as fallback
      const cacheKey = `current_${lat}_${lon}_${units}_${lang}`;
      const staleCache = this.getCachedData(cacheKey, true); // Allow stale data
      if (staleCache) {
        this.logger.warn('Returning stale cached data due to API error');
        return staleCache;
      }
      
      throw this.handleWeatherError(error);
    }
  }

  /**
   * Get weather forecast for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Units (metric, imperial, kelvin)
   * @param {string} lang - Language code
   * @returns {Promise<Object>} Forecast data
   */
  async getForecast(lat, lon, units = 'metric', lang = 'en') {
    try {
      this.logger.info(`Getting forecast for ${lat}, ${lon}`);
      
      // Check cache first
      const cacheKey = `forecast_${lat}_${lon}_${units}_${lang}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.logger.info('Returning cached forecast data');
        return cached;
      }
      
      // Fetch from API
      const url = ENDPOINTS.FORECAST(lat, lon, units, lang);
      const response = await retryRequest(() => fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }), CONFIG.API.RETRY_ATTEMPTS, CONFIG.API.RETRY_DELAY);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process and validate data
      const processedData = this.processForecastData(data);
      
      // Cache the data
      this.setCachedData(cacheKey, processedData);
      
      this.logger.info('Forecast data fetched successfully');
      return processedData;
      
    } catch (error) {
      this.logger.error('Failed to get forecast:', error);
      
      // Try to return cached data as fallback
      const cacheKey = `forecast_${lat}_${lon}_${units}_${lang}`;
      const staleCache = this.getCachedData(cacheKey, true); // Allow stale data
      if (staleCache) {
        this.logger.warn('Returning stale cached data due to API error');
        return staleCache;
      }
      
      throw this.handleWeatherError(error);
    }
  }

  /**
   * Get detailed weather data using One Call API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} exclude - Data to exclude
   * @param {string} units - Units (metric, imperial, kelvin)
   * @param {string} lang - Language code
   * @returns {Promise<Object>} Detailed weather data
   */
  async getDetailedWeather(lat, lon, exclude = 'minutely,alerts', units = 'metric', lang = 'en') {
    try {
      this.logger.info(`Getting detailed weather for ${lat}, ${lon}`);
      
      // Check cache first
      const cacheKey = `detailed_${lat}_${lon}_${exclude}_${units}_${lang}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.logger.info('Returning cached detailed weather data');
        return cached;
      }
      
      // Fetch from API
      const url = ENDPOINTS.ONE_CALL(lat, lon, exclude, units, lang);
      const response = await retryRequest(() => fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }), CONFIG.API.RETRY_ATTEMPTS, CONFIG.API.RETRY_DELAY);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process and validate data
      const processedData = this.processDetailedWeatherData(data);
      
      // Cache the data
      this.setCachedData(cacheKey, processedData);
      
      this.logger.info('Detailed weather data fetched successfully');
      return processedData;
      
    } catch (error) {
      this.logger.error('Failed to get detailed weather:', error);
      
      // Try to return cached data as fallback
      const cacheKey = `detailed_${lat}_${lon}_${exclude}_${units}_${lang}`;
      const staleCache = this.getCachedData(cacheKey, true); // Allow stale data
      if (staleCache) {
        this.logger.warn('Returning stale cached data due to API error');
        return staleCache;
      }
      
      throw this.handleWeatherError(error);
    }
  }

  /**
   * Process current weather data
   * @param {Object} data - Raw API data
   * @returns {Object} Processed data
   */
  processCurrentWeatherData(data) {
    return {
      ...data,
      dt: data.dt || Date.now() / 1000,
      main: {
        ...data.main,
        temp: this.roundTemperature(data.main.temp),
        feels_like: this.roundTemperature(data.main.feels_like),
        temp_min: this.roundTemperature(data.main.temp_min),
        temp_max: this.roundTemperature(data.main.temp_max)
      },
      weather: data.weather.map(item => ({
        ...item,
        description: this.capitalizeDescription(item.description)
      })),
      wind: {
        ...data.wind,
        speed: this.roundValue(data.wind.speed, 1),
        deg: Math.round(data.wind.deg || 0)
      },
      visibility: data.visibility || null,
      clouds: {
        ...data.clouds,
        all: Math.round(data.clouds?.all || 0)
      },
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      timezone: data.timezone || 0,
      // Add computed fields
      windDirection: this.getWindDirection(data.wind?.deg),
      uvIndex: data.uvi ? Math.round(data.uvi) : null,
      dewPoint: data.dew_point ? this.roundTemperature(data.dew_point) : null
    };
  }

  /**
   * Process forecast data
   * @param {Object} data - Raw API data
   * @returns {Object} Processed data
   */
  processForecastData(data) {
    return {
      ...data,
      list: data.list.map(item => ({
        ...item,
        dt: item.dt,
        main: {
          ...item.main,
          temp: this.roundTemperature(item.main.temp),
          feels_like: this.roundTemperature(item.main.feels_like),
          temp_min: this.roundTemperature(item.main.temp_min),
          temp_max: this.roundTemperature(item.main.temp_max)
        },
        weather: item.weather.map(weather => ({
          ...weather,
          description: this.capitalizeDescription(weather.description)
        })),
        wind: {
          ...item.wind,
          speed: this.roundValue(item.wind.speed, 1),
          deg: Math.round(item.wind.deg || 0)
        },
        clouds: {
          ...item.clouds,
          all: Math.round(item.clouds?.all || 0)
        },
        pop: this.roundValue(item.pop * 100, 0), // Convert to percentage
        // Add computed fields
        windDirection: this.getWindDirection(item.wind?.deg),
        date: new Date(item.dt * 1000),
        timeString: new Date(item.dt * 1000).toLocaleTimeString(),
        dateString: new Date(item.dt * 1000).toLocaleDateString()
      }))
    };
  }

  /**
   * Process detailed weather data
   * @param {Object} data - Raw API data
   * @returns {Object} Processed data
   */
  processDetailedWeatherData(data) {
    const processed = {
      ...data,
      current: this.processCurrentWeatherData({
        ...data.current,
        main: {
          temp: data.current.temp,
          feels_like: data.current.feels_like,
          pressure: data.current.pressure,
          humidity: data.current.humidity
        },
        weather: data.current.weather,
        wind: data.current.wind_speed ? {
          speed: data.current.wind_speed,
          deg: data.current.wind_deg
        } : {},
        visibility: data.current.visibility,
        clouds: { all: data.current.clouds }
      })
    };

    // Process hourly data if present
    if (data.hourly) {
      processed.hourly = data.hourly.map(item => ({
        ...item,
        temp: this.roundTemperature(item.temp),
        feels_like: this.roundTemperature(item.feels_like),
        weather: item.weather.map(weather => ({
          ...weather,
          description: this.capitalizeDescription(weather.description)
        })),
        wind_speed: this.roundValue(item.wind_speed, 1),
        wind_deg: Math.round(item.wind_deg || 0),
        pop: this.roundValue(item.pop * 100, 0),
        windDirection: this.getWindDirection(item.wind_deg)
      }));
    }

    // Process daily data if present
    if (data.daily) {
      processed.daily = data.daily.map(item => ({
        ...item,
        temp: {
          min: this.roundTemperature(item.temp.min),
          max: this.roundTemperature(item.temp.max),
          day: this.roundTemperature(item.temp.day),
          night: this.roundTemperature(item.temp.night),
          eve: this.roundTemperature(item.temp.eve),
          morn: this.roundTemperature(item.temp.morn)
        },
        feels_like: {
          day: this.roundTemperature(item.feels_like.day),
          night: this.roundTemperature(item.feels_like.night),
          eve: this.roundTemperature(item.feels_like.eve),
          morn: this.roundTemperature(item.feels_like.morn)
        },
        weather: item.weather.map(weather => ({
          ...weather,
          description: this.capitalizeDescription(weather.description)
        })),
        wind_speed: this.roundValue(item.wind_speed, 1),
        wind_deg: Math.round(item.wind_deg || 0),
        pop: this.roundValue(item.pop * 100, 0),
        windDirection: this.getWindDirection(item.wind_deg)
      }));
    }

    return processed;
  }

  /**
   * Get wind direction from degrees
   * @param {number} deg - Wind direction in degrees
   * @returns {string} Wind direction
   */
  getWindDirection(deg) {
    if (deg == null) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  }

  /**
   * Capitalize weather description
   * @param {string} description - Weather description
   * @returns {string} Capitalized description
   */
  capitalizeDescription(description) {
    return description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Round temperature to appropriate precision
   * @param {number} temp - Temperature
   * @returns {number} Rounded temperature
   */
  roundTemperature(temp) {
    if (temp == null) return null;
    return Math.round(temp * 10) / 10;
  }

  /**
   * Round value to specified decimal places
   * @param {number} value - Value to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded value
   */
  roundValue(value, decimals) {
    if (value == null) return null;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {boolean} allowStale - Allow stale data
   * @returns {Object|null} Cached data or null
   */
  getCachedData(key, allowStale = false) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isStale = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isStale && !allowStale) return null;
    
    return cached.data;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Save to persistent storage
    this.saveCacheToStorage();
  }

  /**
   * Load cache from storage
   */
  loadCacheFromStorage() {
    try {
      const cachedData = this.storageService.get(CONFIG.STORAGE_KEYS.CACHE);
      if (cachedData) {
        // Only load non-stale data
        Object.entries(cachedData).forEach(([key, value]) => {
          if (Date.now() - value.timestamp <= this.cacheTimeout) {
            this.cache.set(key, value);
          }
        });
        this.logger.info(`Loaded ${this.cache.size} items from cache`);
      }
    } catch (error) {
      this.logger.error('Failed to load cache from storage:', error);
    }
  }

  /**
   * Save cache to storage
   */
  saveCacheToStorage() {
    try {
      const cacheObject = {};
      this.cache.forEach((value, key) => {
        // Only save non-stale data
        if (Date.now() - value.timestamp <= this.cacheTimeout) {
          cacheObject[key] = value;
        }
      });
      
      this.storageService.set(CONFIG.STORAGE_KEYS.CACHE, cacheObject);
    } catch (error) {
      this.logger.error('Failed to save cache to storage:', error);
    }
  }

  /**
   * Clear cache
   * @param {string} pattern - Pattern to match keys (optional)
   */
  clearCache(pattern) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    this.saveCacheToStorage();
    this.logger.info(`Cache cleared ${pattern ? `(pattern: ${pattern})` : ''}`);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this.cache.size,
      entries: []
    };
    
    this.cache.forEach((value, key) => {
      const age = Date.now() - value.timestamp;
      const isStale = age > this.cacheTimeout;
      
      stats.entries.push({
        key,
        age,
        isStale,
        size: JSON.stringify(value.data).length
      });
    });
    
    return stats;
  }

  /**
   * Handle weather API errors
   * @param {Error} error - Error object
   * @returns {Error} Processed error
   */
  handleWeatherError(error) {
    if (error.name === 'AbortError') {
      return new Error(CONFIG.ERRORS.NETWORK);
    }
    
    if (error.message.includes('401')) {
      return new Error(CONFIG.ERRORS.API_KEY);
    }
    
    if (error.message.includes('404')) {
      return new Error(CONFIG.ERRORS.LOCATION_NOT_FOUND);
    }
    
    if (error.message.includes('Failed to fetch')) {
      return new Error(CONFIG.ERRORS.NETWORK);
    }
    
    return new Error(error.message || CONFIG.ERRORS.UNKNOWN);
  }

  /**
   * Convert temperature between units
   * @param {number} temp - Temperature value
   * @param {string} from - Source unit (metric, imperial, kelvin)
   * @param {string} to - Target unit (metric, imperial, kelvin)
   * @returns {number} Converted temperature
   */
  convertTemperature(temp, from, to) {
    if (from === to) return temp;
    
    let celsius = temp;
    
    // Convert to Celsius first
    switch (from) {
      case 'imperial':
        celsius = (temp - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = temp - 273.15;
        break;
      default:
        celsius = temp;
    }
    
    // Convert from Celsius to target unit
    switch (to) {
      case 'imperial':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return celsius;
    }
  }

  /**
   * Convert wind speed between units
   * @param {number} speed - Wind speed value
   * @param {string} from - Source unit (metric, imperial)
   * @param {string} to - Target unit (metric, imperial)
   * @returns {number} Converted wind speed
   */
  convertWindSpeed(speed, from, to) {
    if (from === to) return speed;
    
    // Convert m/s to mph or vice versa
    if (from === 'metric' && to === 'imperial') {
      return speed * 2.237; // m/s to mph
    } else if (from === 'imperial' && to === 'metric') {
      return speed / 2.237; // mph to m/s
    }
    
    return speed;
  }

  /**
   * Get weather icon URL
   * @param {string} iconCode - Icon code from API
   * @param {string} size - Icon size (@2x, @4x)
   * @returns {string} Icon URL
   */
  getWeatherIconUrl(iconCode, size = '@2x') {
    return ENDPOINTS.WEATHER_ICON(iconCode, size);
  }

  /**
   * Get weather condition info
   * @param {number} conditionId - Weather condition ID
   * @returns {Object} Condition info
   */
  getWeatherConditionInfo(conditionId) {
    return CONFIG.WEATHER_CONDITIONS[conditionId] || {
      icon: '01d',
      name: 'Unknown',
      category: 'unknown'
    };
  }

  /**
   * Validate coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean} True if valid
   */
  validateCoordinates(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clearCache();
    this.logger.info('Weather Service destroyed');
  }
}

export default WeatherService;
