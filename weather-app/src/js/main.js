/**
 * Weather App - Main Application Controller
 * Modern Glassmorphism + Neumorphism Weather PWA
 */

import { 
  API_CONFIG, 
  DEFAULT_SETTINGS, 
  UI_CONFIG, 
  STORAGE_KEYS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UTILS 
} from './config.js';

import { WeatherState } from './store/state.js';
import { WeatherService } from './services/openMeteo.js';
import { GeocodingService } from './services/geocoding.js';
import { CacheService } from './services/cache.js';
import { debounce } from './utils/debounce.js';
import { formatTemperature, formatWindSpeed } from './utils/format.js';
import { convertUnits } from './utils/units.js';
import { handleError, showToast } from './utils/error.js';
import { $ } from './utils/dom.js';

// Component imports
import { Header } from './components/Header.js';
import { SearchBar } from './components/SearchBar.js';
import { CurrentWeatherCard } from './components/CurrentWeatherCard.js';
import { HourlyScroller } from './components/HourlyScroller.js';
import { ForecastGrid } from './components/ForecastGrid.js';
import { UnitToggle } from './components/UnitToggle.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { Loader } from './components/Loader.js';
import { Toast } from './components/Toast.js';

class WeatherApp {
  constructor() {
    // Initialize services
    this.state = new WeatherState();
    this.weatherService = new WeatherService();
    this.geocodingService = new GeocodingService();
    this.cacheService = new CacheService();
    
    // Initialize components
    this.header = new Header();
    this.searchBar = new SearchBar();
    this.currentWeatherCard = new CurrentWeatherCard();
    this.hourlyScroller = new HourlyScroller();
    this.forecastGrid = new ForecastGrid();
    this.unitToggle = new UnitToggle();
    this.themeToggle = new ThemeToggle();
    this.loader = new Loader();
    this.toast = new Toast();
    
    // Bind methods
    this.handleLocationUpdate = this.handleLocationUpdate.bind(this);
    this.handleUnitChange = this.handleUnitChange.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLocationClick = this.handleLocationClick.bind(this);
    this.handleSearch = debounce(this.handleSearch.bind(this), UI_CONFIG.SEARCH.DEBOUNCE_DELAY);
    
    // Initialize app
    this.init();
  }

  async init() {
    try {
      console.log('🌤️ Initializing Weather App...');
      
      // Show initial loading
      this.loader.show('Loading weather app...');
      
      // Load settings from localStorage
      await this.loadSettings();
      
      // Initialize theme
      this.initializeTheme();
      
      // Initialize components
      await this.initializeComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial weather data
      await this.loadInitialData();
      
      // Start auto-refresh
      this.startAutoRefresh();
      
      // Hide loading
      this.loader.hide();
      
      console.log('✅ Weather App initialized successfully');
      
      // Show welcome toast
      this.toast.show({
        type: 'success',
        message: 'Weather app loaded successfully!',
        duration: 3000
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.loader.hide();
      handleError(error, 'Failed to load weather app');
    }
  }

  async loadSettings() {
    try {
      // Load settings from localStorage
      const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      
      // Merge with defaults
      const settings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
      
      // Update state
      this.state.updateSettings(settings);
      
      console.log('📋 Settings loaded:', settings);
    } catch (error) {
      console.warn('⚠️ Failed to load settings, using defaults:', error);
      this.state.updateSettings(DEFAULT_SETTINGS);
    }
  }

  initializeTheme() {
    const theme = this.state.getSettings().THEME;
    
    if (theme === 'auto') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      if (this.state.getSettings().THEME === 'auto') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  async initializeComponents() {
    // Initialize all components
    await Promise.all([
      this.header.init(),
      this.searchBar.init(),
      this.currentWeatherCard.init(),
      this.hourlyScroller.init(),
      this.forecastGrid.init(),
      this.unitToggle.init(),
      this.themeToggle.init(),
      this.loader.init(),
      this.toast.init()
    ]);
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = $('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch);
      searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    }
    
    // Location button
    const locationBtn = $('#location-btn');
    if (locationBtn) {
      locationBtn.addEventListener('click', this.handleLocationClick);
    }
    
    // Unit toggle
    const unitToggle = $('#unit-toggle');
    if (unitToggle) {
      unitToggle.addEventListener('change', this.handleUnitChange);
    }
    
    // Theme toggle
    const themeToggle = $('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.handleThemeChange);
    }
    
    // Refresh button
    const refreshBtn = $('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', this.handleRefresh);
    }
    
    // Window events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    window.addEventListener('resize', debounce(this.handleResize.bind(this), 250));
    
    // Visibility change for auto-refresh
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  async loadInitialData() {
    try {
      const settings = this.state.getSettings();
      let location = settings.LOCATION;
      
      // Try to get user's current location first
      if (navigator.geolocation && !localStorage.getItem(STORAGE_KEYS.LOCATION)) {
        try {
          location = await this.getCurrentLocation();
          this.state.updateLocation(location);
          this.saveSettings();
        } catch (error) {
          console.warn('⚠️ Geolocation failed, using default location:', error);
        }
      }
      
      // Load weather data
      await this.loadWeatherData(location);
      
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      handleError(error, 'Failed to load weather data');
    }
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE));
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: DEFAULT_SETTINGS.GEOLOCATION_TIMEOUT,
        maximumAge: DEFAULT_SETTINGS.GEOLOCATION_MAX_AGE
      };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude: lat, longitude: lon } = position.coords;
            
            // Get location name from coordinates
            const locationData = await this.geocodingService.reverseGeocode(lat, lon);
            
            resolve({
              lat,
              lon,
              name: locationData.name || 'Current Location',
              country: locationData.country || ''
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
              break;
            case error.TIMEOUT:
              errorMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
              break;
            default:
              errorMessage = ERROR_MESSAGES.UNKNOWN;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  async loadWeatherData(location) {
    if (!location) return;
    
    try {
      this.loader.show('Loading weather data...');
      
      const { lat, lon } = location;
      
      // Load current weather and forecast in parallel
      const [currentWeather, forecast] = await Promise.all([
        this.weatherService.getCurrentWeather(lat, lon),
        this.weatherService.getForecast(lat, lon, 7) // 7 days
      ]);
      
      // Update state
      this.state.updateWeather(currentWeather);
      this.state.updateForecast(forecast);
      this.state.updateLocation(location);
      
      // Update UI components
      this.updateCurrentWeatherDisplay(currentWeather);
      this.updateHourlyForecast(forecast.forecast.forecastday[0].hour);
      this.updateDailyForecast(forecast.forecast.forecastday);
      this.updateLocationDisplay(location);
      
      // Cache the data
      this.cacheService.set('current-weather', currentWeather);
      this.cacheService.set('forecast', forecast);
      this.cacheService.set('location', location);
      
      // Update last refresh time
      this.updateLastRefreshTime();
      
    } catch (error) {
      console.error('❌ Failed to load weather data:', error);
      
      // Try to load from cache
      const cachedWeather = this.cacheService.get('current-weather');
      const cachedForecast = this.cacheService.get('forecast');
      
      if (cachedWeather && cachedForecast) {
        console.log('📦 Loading weather data from cache');
        this.updateCurrentWeatherDisplay(cachedWeather);
        this.updateHourlyForecast(cachedForecast.forecast.forecastday[0].hour);
        this.updateDailyForecast(cachedForecast.forecast.forecastday);
        
        this.toast.show({
          type: 'warning',
          message: 'Showing cached weather data',
          duration: 4000
        });
      } else {
        handleError(error, 'Failed to load weather data');
      }
    } finally {
      this.loader.hide();
    }
  }

  updateCurrentWeatherDisplay(weather) {
    if (!weather) return;
    
    const settings = this.state.getSettings();
    const current = weather.current;
    
    // Update temperature
    const tempElement = $('#current-temp');
    if (tempElement) {
      const temp = formatTemperature(current.temp_c, settings.UNITS);
      tempElement.textContent = temp;
    }
    
    // Update description
    const descElement = $('#weather-description');
    if (descElement) {
      descElement.textContent = current.condition.text;
    }
    
    // Update weather icon
    const iconElement = $('#current-weather-icon');
    if (iconElement) {
      iconElement.src = current.condition.icon;
      iconElement.alt = current.condition.text;
    }
    
    // Update feels like
    const feelsLikeElement = $('#feels-like');
    if (feelsLikeElement) {
      const feelsLike = formatTemperature(current.feelslike_c, settings.UNITS);
      feelsLikeElement.textContent = feelsLike;
    }
    
    // Update humidity
    const humidityElement = $('#humidity');
    if (humidityElement) {
      humidityElement.textContent = `${current.humidity}%`;
    }
    
    // Update wind
    const windElement = $('#wind-speed');
    if (windElement) {
      const windSpeed = formatWindSpeed(current.wind_kph, 'KMH');
      windElement.textContent = windSpeed;
    }
    
    // Update precipitation
    const precipElement = $('#precipitation');
    if (precipElement) {
      precipElement.textContent = `${current.precip_mm}%`;
    }
    
    // Update pressure
    const pressureElement = $('#pressure');
    if (pressureElement) {
      pressureElement.textContent = `${current.pressure_mb} mb`;
    }
    
    // Update UV index
    const uvElement = $('#uv-index');
    if (uvElement) {
      uvElement.textContent = current.uv.toString();
    }
    
    // Update current time
    const timeElement = $('#current-time');
    if (timeElement) {
      const now = new Date();
      timeElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  updateHourlyForecast(hourlyData) {
    if (!hourlyData || !Array.isArray(hourlyData)) return;
    
    const container = $('#hourly-scroller');
    if (!container) return;
    
    const settings = this.state.getSettings();
    const currentHour = new Date().getHours();
    
    // Clear existing content
    container.innerHTML = '';
    
    // Take next 24 hours
    const next24Hours = hourlyData.slice(0, 24);
    
    next24Hours.forEach((hour, index) => {
      const hourElement = document.createElement('div');
      hourElement.className = 'hourly-item glass-card';
      
      const hourTime = new Date(hour.time).getHours();
      const isCurrent = index === 0;
      
      if (isCurrent) {
        hourElement.classList.add('current');
      }
      
      hourElement.innerHTML = `
        <div class="hourly-time">${hourTime === 0 ? '12 AM' : hourTime <= 12 ? `${hourTime} AM` : `${hourTime - 12} PM`}</div>
        <div class="hourly-icon">
          <img src="${hour.condition.icon}" alt="${hour.condition.text}" loading="lazy">
        </div>
        <div class="hourly-temp">${formatTemperature(hour.temp_c, settings.UNITS)}</div>
        <div class="hourly-precip">${Math.round(hour.chance_of_rain)}%</div>
      `;
      
      container.appendChild(hourElement);
    });
  }

  updateDailyForecast(forecastDays) {
    if (!forecastDays || !Array.isArray(forecastDays)) return;
    
    const container = $('#forecast-grid');
    if (!container) return;
    
    const settings = this.state.getSettings();
    
    // Clear existing content
    container.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
      const dayElement = document.createElement('div');
      dayElement.className = 'forecast-card glass-card';
      
      if (index === 0) {
        dayElement.classList.add('today');
      }
      
      const date = new Date(day.date);
      const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
      
      dayElement.innerHTML = `
        <div class="forecast-header">
          <h3 class="forecast-day">${dayName}</h3>
          <div class="forecast-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
        <div class="forecast-main">
          <div class="forecast-icon">
            <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" loading="lazy">
          </div>
          <div class="forecast-temps">
            <span class="temp-max">${formatTemperature(day.day.maxtemp_c, settings.UNITS)}</span>
            <span class="temp-min">${formatTemperature(day.day.mintemp_c, settings.UNITS)}</span>
          </div>
        </div>
        <div class="forecast-desc">${day.day.condition.text}</div>
        <div class="forecast-details">
          <div class="detail-item">
            <span>💧 ${Math.round(day.day.daily_chance_of_rain)}%</span>
          </div>
          <div class="detail-item">
            <span>💨 ${formatWindSpeed(day.day.maxwind_kph, 'KMH')}</span>
          </div>
        </div>
      `;
      
      container.appendChild(dayElement);
    });
  }

  updateLocationDisplay(location) {
    if (!location) return;
    
    const locationElement = $('#current-location');
    if (locationElement) {
      locationElement.textContent = location.name;
    }
    
    // Update search input
    const searchInput = $('#search-input');
    if (searchInput) {
      searchInput.value = location.name;
    }
  }

  updateLastRefreshTime() {
    const lastUpdateTime = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, lastUpdateTime.toString());
  }

  async handleSearch(event) {
    const query = event.target.value.trim();
    
    if (query.length < UI_CONFIG.SEARCH.MIN_CHARS) {
      this.hideSearchResults();
      return;
    }
    
    try {
      const results = await this.geocodingService.searchLocations(query);
      this.showSearchResults(results);
    } catch (error) {
      console.error('❌ Search failed:', error);
      this.hideSearchResults();
    }
  }

  showSearchResults(results) {
    const container = $('#search-results');
    if (!container) return;
    
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="search-no-results">No locations found</div>';
      container.classList.add('show');
      return;
    }
    
    const limitedResults = results.slice(0, UI_CONFIG.SEARCH.MAX_RESULTS);
    
    container.innerHTML = limitedResults.map(location => `
      <div class="search-result-item" 
           data-lat="${location.lat}" 
           data-lon="${location.lon}"
           data-name="${location.name}"
           data-country="${location.country}">
        <div class="result-main">${location.name}</div>
        <div class="result-sub">${location.region ? `${location.region}, ` : ''}${location.country}</div>
      </div>
    `).join('');
    
    // Add click listeners
    container.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', this.handleLocationSelect.bind(this));
    });
    
    container.classList.add('show');
  }

  hideSearchResults() {
    const container = $('#search-results');
    if (container) {
      container.classList.remove('show');
      setTimeout(() => {
        container.innerHTML = '';
      }, 300);
    }
  }

  async handleLocationSelect(event) {
    const item = event.currentTarget;
    const location = {
      lat: parseFloat(item.dataset.lat),
      lon: parseFloat(item.dataset.lon),
      name: item.dataset.name,
      country: item.dataset.country
    };
    
    this.hideSearchResults();
    
    try {
      await this.loadWeatherData(location);
      this.saveSettings();
      
      this.toast.show({
        type: 'success',
        message: `Weather loaded for ${location.name}`,
        duration: 3000
      });
    } catch (error) {
      handleError(error, 'Failed to load weather for selected location');
    }
  }

  async handleLocationClick() {
    try {
      this.loader.show('Getting your location...');
      
      const location = await this.getCurrentLocation();
      await this.loadWeatherData(location);
      this.saveSettings();
      
      this.toast.show({
        type: 'success',
        message: 'Location updated successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, 'Failed to get your location');
    } finally {
      this.loader.hide();
    }
  }

  handleUnitChange(event) {
    const newUnits = event.target.checked ? 'fahrenheit' : 'celsius';
    const settings = this.state.getSettings();
    
    settings.UNITS = newUnits;
    this.state.updateSettings(settings);
    this.saveSettings();
    
    // Update displays with new units
    const weather = this.state.getWeather();
    const forecast = this.state.getForecast();
    
    if (weather) {
      this.updateCurrentWeatherDisplay(weather);
    }
    
    if (forecast) {
      this.updateHourlyForecast(forecast.forecast.forecastday[0].hour);
      this.updateDailyForecast(forecast.forecast.forecastday);
    }
    
    this.toast.show({
      type: 'success',
      message: `Units changed to ${newUnits === 'celsius' ? 'Celsius' : 'Fahrenheit'}`,
      duration: 2000
    });
  }

  handleThemeChange() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const settings = this.state.getSettings();
    settings.THEME = newTheme;
    this.state.updateSettings(settings);
    this.saveSettings();
    
    this.toast.show({
      type: 'success',
      message: `Theme changed to ${newTheme}`,
      duration: 2000
    });
  }

  async handleRefresh() {
    const location = this.state.getLocation();
    if (!location) return;
    
    try {
      await this.loadWeatherData(location);
      
      this.toast.show({
        type: 'success',
        message: 'Weather data refreshed',
        duration: 2000
      });
    } catch (error) {
      handleError(error, 'Failed to refresh weather data');
    }
  }

  handleSearchKeydown(event) {
    if (event.key === 'Escape') {
      this.hideSearchResults();
      event.target.blur();
    }
  }

  handleOnline() {
    console.log('📶 App is online');
    this.toast.show({
      type: 'success',
      message: 'Connection restored',
      duration: 3000
    });
    
    // Refresh data when coming back online
    const location = this.state.getLocation();
    if (location) {
      this.loadWeatherData(location);
    }
  }

  handleOffline() {
    console.log('📵 App is offline');
    this.toast.show({
      type: 'warning',
      message: 'You are offline. Showing cached data.',
      duration: 5000
    });
  }

  handleResize() {
    // Handle responsive layout changes if needed
    this.hourlyScroller.handleResize();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
      // Refresh data when returning to the tab
      const location = this.state.getLocation();
      if (location) {
        this.loadWeatherData(location);
      }
    }
  }

  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r' && !event.shiftKey) {
      event.preventDefault();
      this.handleRefresh();
    }
    
    // Ctrl/Cmd + K: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = $('#search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Ctrl/Cmd + D: Toggle theme
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.handleThemeChange();
    }
  }

  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    this.autoRefreshInterval = setInterval(() => {
      if (!document.hidden) {
        const location = this.state.getLocation();
        if (location) {
          this.loadWeatherData(location);
        }
      }
    }, DEFAULT_SETTINGS.REFRESH_INTERVAL);
  }

  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  saveSettings() {
    try {
      const settings = this.state.getSettings();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
    }
  }

  destroy() {
    // Clean up resources
    this.stopAutoRefresh();
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('keydown', this.handleKeyboardShortcuts);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.weatherApp = new WeatherApp();
});

// Handle app installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button or notification
  showToast({
    type: 'info',
    message: 'Install this app for a better experience!',
    duration: 8000,
    action: {
      text: 'Install',
      callback: async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;
          if (result.outcome === 'accepted') {
            console.log('✅ PWA was installed');
          }
          deferredPrompt = null;
        }
      }
    }
  });
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA was installed');
  showToast({
    type: 'success',
    message: 'App installed successfully!',
    duration: 3000
  });
});

export default WeatherApp;