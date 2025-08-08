/**
 * Weather App - Main Application
 * Premium Glassmorphism Weather Application
 */

import { CONFIG, ENV, ENDPOINTS } from './config/config.js';
import { WeatherService } from './services/weather-service.js';
import { LocationService } from './services/location-service.js';
import { StorageService } from './services/storage-service.js';
import { ThemeManager } from './managers/theme-manager.js';
import { SettingsManager } from './managers/settings-manager.js';
import { UIManager } from './managers/ui-manager.js';
import { ToastManager } from './managers/toast-manager.js';
import { AnimationManager } from './managers/animation-manager.js';
import { EventManager } from './utils/event-manager.js';
import { Logger } from './utils/logger.js';
import { debounce, throttle } from './utils/helpers.js';

class WeatherApp {
  constructor() {
    this.isInitialized = false;
    this.isLoading = false;
    this.currentLocation = null;
    this.currentWeather = null;
    this.forecastData = null;
    this.searchTimeout = null;
    this.refreshInterval = null;
    
    // Initialize managers and services
    this.logger = new Logger('WeatherApp');
    this.eventManager = new EventManager();
    this.storageService = new StorageService();
    this.weatherService = new WeatherService();
    this.locationService = new LocationService();
    this.themeManager = new ThemeManager();
    this.settingsManager = new SettingsManager();
    this.uiManager = new UIManager();
    this.toastManager = new ToastManager();
    this.animationManager = new AnimationManager();
    
    // Bind methods
    this.handleSearch = debounce(this.handleSearch.bind(this), CONFIG.UI.SEARCH.DEBOUNCE_DELAY);
    this.handleResize = throttle(this.handleResize.bind(this), 250);
    this.refreshWeatherData = this.refreshWeatherData.bind(this);
    this.handleLocationClick = this.handleLocationClick.bind(this);
    this.handleUnitToggle = this.handleUnitToggle.bind(this);
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.logger.info('Initializing Weather App...');
      
      // Check API key
      if (!CONFIG.API.KEY) {
        this.showError('API key not configured. Please add your OpenWeatherMap API key to the config.');
        return;
      }
      
      // Initialize theme first (before UI rendering)
      await this.themeManager.init();
      
      // Initialize settings
      await this.settingsManager.init();
      
      // Initialize UI components
      await this.uiManager.init();
      
      // Initialize services
      await this.weatherService.init();
      await this.locationService.init();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Start auto-refresh
      this.startAutoRefresh();
      
      // Initialize PWA features
      if (ENV.SUPPORTS_SERVICE_WORKER) {
        this.initPWA();
      }
      
      this.isInitialized = true;
      this.logger.info('Weather App initialized successfully');
      
      // Show welcome message
      this.toastManager.show({
        type: 'success',
        title: 'Welcome!',
        message: 'Weather app loaded successfully',
        duration: 3000
      });
      
    } catch (error) {
      this.logger.error('Failed to initialize app:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const locationBtn = document.getElementById('location-btn');
    
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch);
      searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
      searchInput.addEventListener('blur', this.handleSearchBlur.bind(this));
      searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    }
    
    if (locationBtn) {
      locationBtn.addEventListener('click', this.handleLocationClick);
    }
    
    // Unit and theme toggles
    const unitToggle = document.getElementById('unit-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (unitToggle) {
      unitToggle.addEventListener('change', this.handleUnitToggle);
    }
    
    if (themeToggle) {
      themeToggle.addEventListener('click', this.handleThemeToggle);
    }
    
    // Window events
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Visibility change (for auto-refresh)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // Settings changes
    this.eventManager.on('settings:changed', this.handleSettingsChange);
    
    // Location changes
    this.eventManager.on('location:changed', this.handleLocationChange.bind(this));
    
    // Weather data updates
    this.eventManager.on('weather:updated', this.handleWeatherUpdate.bind(this));
    
    // Error handling
    this.eventManager.on('error', this.handleError.bind(this));
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', this.refreshWeatherData);
    }
  }

  /**
   * Load initial weather data
   */
  async loadInitialData() {
    try {
      this.setLoading(true);
      
      // Try to get saved location first
      const savedLocation = this.storageService.get(CONFIG.STORAGE_KEYS.SETTINGS)?.location;
      
      if (savedLocation) {
        this.currentLocation = savedLocation;
        await this.loadWeatherData();
      } else {
        // Try to get user's location
        try {
          const location = await this.locationService.getCurrentLocation();
          this.currentLocation = location;
          await this.loadWeatherData();
          
          // Save the location
          this.settingsManager.updateSetting('location', location);
        } catch (error) {
          // Fallback to default location
          this.logger.warn('Could not get user location, using default:', error);
          this.currentLocation = CONFIG.DEFAULTS.LOCATION;
          await this.loadWeatherData();
          
          this.toastManager.show({
            type: 'info',
            title: 'Location',
            message: 'Using default location. Click the location button to use your current location.',
            duration: 5000
          });
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to load initial data:', error);
      this.showError('Failed to load weather data. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load weather data for current location
   */
  async loadWeatherData() {
    if (!this.currentLocation) {
      throw new Error('No location set');
    }
    
    try {
      this.setLoading(true);
      
      const { lat, lon } = this.currentLocation;
      const units = this.settingsManager.getSetting('units');
      
      // Load current weather and forecast in parallel
      const [currentWeather, forecast] = await Promise.all([
        this.weatherService.getCurrentWeather(lat, lon, units),
        this.weatherService.getForecast(lat, lon, units)
      ]);
      
      this.currentWeather = currentWeather;
      this.forecastData = forecast;
      
      // Update UI
      this.updateWeatherDisplay();
      this.updateForecastDisplay();
      
      // Update last refresh time
      this.updateLastRefreshTime();
      
      // Emit event
      this.eventManager.emit('weather:updated', {
        current: currentWeather,
        forecast: forecast
      });
      
    } catch (error) {
      this.logger.error('Failed to load weather data:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update current weather display
   */
  updateWeatherDisplay() {
    if (!this.currentWeather) return;
    
    const weather = this.currentWeather;
    const units = this.settingsManager.getSetting('units');
    
    // Update location
    const locationElement = document.getElementById('current-location');
    if (locationElement) {
      locationElement.textContent = this.currentLocation.name;
    }
    
    // Update temperature
    const tempElement = document.getElementById('current-temp');
    if (tempElement) {
      const temp = Math.round(weather.main.temp);
      const unit = units === 'metric' ? '°C' : '°F';
      tempElement.textContent = `${temp}${unit}`;
    }
    
    // Update description
    const descElement = document.getElementById('weather-description');
    if (descElement) {
      descElement.textContent = weather.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Update weather icon
    const iconElement = document.getElementById('weather-icon');
    if (iconElement) {
      const iconCode = weather.weather[0].icon;
      iconElement.src = ENDPOINTS.WEATHER_ICON(iconCode);
      iconElement.alt = weather.weather[0].description;
    }
    
    // Update feels like temperature
    const feelsLikeElement = document.getElementById('feels-like');
    if (feelsLikeElement) {
      const feelsLike = Math.round(weather.main.feels_like);
      const unit = units === 'metric' ? '°C' : '°F';
      feelsLikeElement.textContent = `${feelsLike}${unit}`;
    }
    
    // Update humidity
    const humidityElement = document.getElementById('humidity');
    if (humidityElement) {
      humidityElement.textContent = `${weather.main.humidity}%`;
    }
    
    // Update wind speed
    const windElement = document.getElementById('wind-speed');
    if (windElement) {
      const speed = weather.wind.speed;
      const unit = units === 'metric' ? 'm/s' : 'mph';
      windElement.textContent = `${speed} ${unit}`;
    }
    
    // Update pressure
    const pressureElement = document.getElementById('pressure');
    if (pressureElement) {
      pressureElement.textContent = `${weather.main.pressure} hPa`;
    }
    
    // Update visibility
    const visibilityElement = document.getElementById('visibility');
    if (visibilityElement && weather.visibility) {
      const visibility = units === 'metric' 
        ? `${(weather.visibility / 1000).toFixed(1)} km`
        : `${(weather.visibility * 0.000621371).toFixed(1)} mi`;
      visibilityElement.textContent = visibility;
    }
    
    // Update UV index (if available)
    const uvElement = document.getElementById('uv-index');
    if (uvElement && weather.uvi !== undefined) {
      uvElement.textContent = Math.round(weather.uvi);
    }
    
    // Update weather condition class for styling
    const weatherCard = document.querySelector('.current-weather-card');
    if (weatherCard) {
      const condition = CONFIG.WEATHER_CONDITIONS[weather.weather[0].id]?.category || 'clear';
      weatherCard.setAttribute('data-weather', condition);
    }
    
    // Animate the update
    this.animationManager.fadeIn('.current-weather-card', {
      duration: CONFIG.UI.ANIMATIONS.DURATION.NORMAL
    });
  }

  /**
   * Update forecast display
   */
  updateForecastDisplay() {
    if (!this.forecastData) return;
    
    this.updateHourlyForecast();
    this.updateDailyForecast();
  }

  /**
   * Update hourly forecast
   */
  updateHourlyForecast() {
    const hourlyContainer = document.getElementById('hourly-forecast');
    if (!hourlyContainer || !this.forecastData.list) return;
    
    const units = this.settingsManager.getSetting('units');
    const hourlyItems = this.forecastData.list.slice(0, CONFIG.UI.FORECAST.HOURLY_ITEMS);
    const currentHour = new Date().getHours();
    
    hourlyContainer.innerHTML = '';
    
    hourlyItems.forEach((item, index) => {
      const itemDate = new Date(item.dt * 1000);
      const hour = itemDate.getHours();
      const isCurrent = index === 0 || Math.abs(hour - currentHour) < 1;
      
      const hourlyItem = document.createElement('div');
      hourlyItem.className = `hourly-item${isCurrent ? ' current' : ''}`;
      
      const temp = Math.round(item.main.temp);
      const unit = units === 'metric' ? '°C' : '°F';
      const timeStr = itemDate.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        hour12: true 
      });
      
      hourlyItem.innerHTML = `
        <div class="hourly-time">${timeStr}</div>
        <div class="hourly-icon">
          <img src="${ENDPOINTS.WEATHER_ICON(item.weather[0].icon)}" 
               alt="${item.weather[0].description}"
               loading="lazy">
        </div>
        <div class="hourly-temp">${temp}${unit}</div>
        <div class="hourly-desc">${item.weather[0].main}</div>
      `;
      
      hourlyContainer.appendChild(hourlyItem);
    });
    
    // Animate hourly items
    this.animationManager.staggerIn('.hourly-item', {
      duration: CONFIG.UI.ANIMATIONS.DURATION.FAST,
      delay: CONFIG.UI.ANIMATIONS.STAGGER_DELAY
    });
  }

  /**
   * Update daily forecast
   */
  updateDailyForecast() {
    const dailyContainer = document.getElementById('daily-forecast');
    if (!dailyContainer || !this.forecastData.list) return;
    
    const units = this.settingsManager.getSetting('units');
    
    // Group forecast by day
    const dailyData = this.groupForecastByDay(this.forecastData.list);
    const dailyItems = Object.entries(dailyData).slice(0, CONFIG.UI.FORECAST.DAILY_ITEMS);
    
    dailyContainer.innerHTML = '';
    
    dailyItems.forEach(([date, dayData], index) => {
      const forecastCard = document.createElement('div');
      forecastCard.className = `forecast-card${index === 0 ? ' today' : ''}`;
      
      const dayName = index === 0 ? 'Today' : 
        new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      
      const maxTemp = Math.round(Math.max(...dayData.map(item => item.main.temp_max)));
      const minTemp = Math.round(Math.min(...dayData.map(item => item.main.temp_min)));
      const unit = units === 'metric' ? '°C' : '°F';
      
      // Get most common weather condition
      const weatherCounts = {};
      dayData.forEach(item => {
        const weather = item.weather[0].main;
        weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
      });
      const mainWeather = Object.entries(weatherCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      const icon = dayData.find(item => item.weather[0].main === mainWeather)?.weather[0].icon || '01d';
      
      forecastCard.innerHTML = `
        <div class="forecast-header">
          <h3 class="forecast-day">${dayName}</h3>
          <div class="forecast-date">${new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}</div>
        </div>
        <div class="forecast-main">
          <div class="forecast-icon">
            <img src="${ENDPOINTS.WEATHER_ICON(icon)}" 
                 alt="${mainWeather}"
                 loading="lazy">
          </div>
          <div class="forecast-temps">
            <span class="temp-max">${maxTemp}${unit}</span>
            <span class="temp-min">${minTemp}${unit}</span>
          </div>
        </div>
        <div class="forecast-desc">${mainWeather}</div>
      `;
      
      dailyContainer.appendChild(forecastCard);
    });
    
    // Animate forecast cards
    this.animationManager.staggerIn('.forecast-card', {
      duration: CONFIG.UI.ANIMATIONS.DURATION.NORMAL,
      delay: CONFIG.UI.ANIMATIONS.STAGGER_DELAY
    });
  }

  /**
   * Group forecast data by day
   */
  groupForecastByDay(forecastList) {
    const grouped = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    return grouped;
  }

  /**
   * Handle search input
   */
  async handleSearch(event) {
    const query = event.target.value.trim();
    const searchResults = document.getElementById('search-results');
    
    if (query.length < CONFIG.UI.SEARCH.MIN_CHARS) {
      this.hideSearchResults();
      return;
    }
    
    try {
      const locations = await this.locationService.searchLocations(query);
      this.showSearchResults(locations);
    } catch (error) {
      this.logger.error('Search failed:', error);
      this.hideSearchResults();
    }
  }

  /**
   * Show search results
   */
  showSearchResults(locations) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    if (locations.length === 0) {
      searchResults.innerHTML = `
        <div class="search-result-item no-results">
          <div class="result-main">No locations found</div>
          <div class="result-sub">Try a different search term</div>
        </div>
      `;
    } else {
      searchResults.innerHTML = locations
        .slice(0, CONFIG.UI.SEARCH.MAX_RESULTS)
        .map(location => `
          <div class="search-result-item" 
               data-lat="${location.lat}" 
               data-lon="${location.lon}"
               data-name="${location.name}"
               data-country="${location.country}"
               data-state="${location.state || ''}">
            <div class="result-main">${location.name}</div>
            <div class="result-sub">${location.state ? `${location.state}, ` : ''}${location.country}</div>
          </div>
        `).join('');
      
      // Add click listeners to search results
      searchResults.querySelectorAll('.search-result-item:not(.no-results)').forEach(item => {
        item.addEventListener('click', this.handleSearchResultClick.bind(this));
      });
    }
    
    searchResults.classList.add('show');
    
    // Animate results
    this.animationManager.staggerIn('.search-result-item', {
      duration: CONFIG.UI.ANIMATIONS.DURATION.FAST,
      delay: 50
    });
  }

  /**
   * Hide search results
   */
  hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.classList.remove('show');
      setTimeout(() => {
        searchResults.innerHTML = '';
      }, CONFIG.UI.ANIMATIONS.DURATION.FAST);
    }
  }

  /**
   * Handle search result click
   */
  async handleSearchResultClick(event) {
    const item = event.currentTarget;
    const location = {
      lat: parseFloat(item.dataset.lat),
      lon: parseFloat(item.dataset.lon),
      name: item.dataset.name,
      country: item.dataset.country,
      state: item.dataset.state
    };
    
    // Update current location
    this.currentLocation = location;
    
    // Update search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = location.name;
      searchInput.blur();
    }
    
    // Hide search results
    this.hideSearchResults();
    
    // Load weather data
    try {
      await this.loadWeatherData();
      
      // Save location to settings
      this.settingsManager.updateSetting('location', location);
      
      // Add to recent searches
      this.addToRecentSearches(location);
      
      this.toastManager.show({
        type: 'success',
        title: 'Location Updated',
        message: `Weather data loaded for ${location.name}`,
        duration: 3000
      });
      
    } catch (error) {
      this.logger.error('Failed to load weather for selected location:', error);
      this.showError('Failed to load weather data for the selected location.');
    }
  }

  /**
   * Handle current location button click
   */
  async handleLocationClick() {
    try {
      this.setLoading(true);
      
      const location = await this.locationService.getCurrentLocation();
      this.currentLocation = location;
      
      // Update search input
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = location.name;
      }
      
      // Load weather data
      await this.loadWeatherData();
      
      // Save location to settings
      this.settingsManager.updateSetting('location', location);
      
      this.toastManager.show({
        type: 'success',
        title: 'Location Updated',
        message: 'Using your current location',
        duration: 3000
      });
      
    } catch (error) {
      this.logger.error('Failed to get current location:', error);
      
      let message = 'Failed to get your current location.';
      if (error.code === 1) {
        message = 'Location access denied. Please enable location services.';
      } else if (error.code === 2) {
        message = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        message = 'Location request timed out. Please try again.';
      }
      
      this.toastManager.show({
        type: 'error',
        title: 'Location Error',
        message: message,
        duration: 5000
      });
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle unit toggle
   */
  async handleUnitToggle(event) {
    const newUnits = event.target.checked ? 'imperial' : 'metric';
    
    try {
      // Update settings
      this.settingsManager.updateSetting('units', newUnits);
      
      // Reload weather data with new units
      await this.loadWeatherData();
      
      const unitName = newUnits === 'metric' ? 'Celsius' : 'Fahrenheit';
      this.toastManager.show({
        type: 'success',
        title: 'Units Changed',
        message: `Temperature units changed to ${unitName}`,
        duration: 3000
      });
      
    } catch (error) {
      this.logger.error('Failed to change units:', error);
      this.showError('Failed to change temperature units.');
      
      // Revert toggle
      event.target.checked = !event.target.checked;
    }
  }

  /**
   * Handle theme toggle
   */
  handleThemeToggle() {
    const currentTheme = this.themeManager.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.themeManager.setTheme(newTheme);
    
    this.toastManager.show({
      type: 'success',
      title: 'Theme Changed',
      message: `Switched to ${newTheme} theme`,
      duration: 2000
    });
  }

  /**
   * Refresh weather data
   */
  async refreshWeatherData() {
    if (!this.currentLocation) return;
    
    try {
      await this.loadWeatherData();
      
      this.toastManager.show({
        type: 'success',
        title: 'Refreshed',
        message: 'Weather data updated',
        duration: 2000
      });
      
    } catch (error) {
      this.logger.error('Failed to refresh weather data:', error);
      this.showError('Failed to refresh weather data.');
    }
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.uiManager.setLoading(loading);
    
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.disabled = loading;
      refreshBtn.classList.toggle('loading', loading);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.toastManager.show({
      type: 'error',
      title: 'Error',
      message: message,
      duration: CONFIG.UI.TOAST.DURATION.ERROR
    });
  }

  /**
   * Start auto-refresh interval
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      if (!document.hidden && this.currentLocation) {
        this.refreshWeatherData();
      }
    }, CONFIG.DEFAULTS.REFRESH_INTERVAL);
  }

  /**
   * Stop auto-refresh interval
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Add location to recent searches
   */
  addToRecentSearches(location) {
    const recent = this.storageService.get(CONFIG.STORAGE_KEYS.RECENT_SEARCHES) || [];
    
    // Remove if already exists
    const filtered = recent.filter(item => 
      !(item.lat === location.lat && item.lon === location.lon)
    );
    
    // Add to beginning
    filtered.unshift(location);
    
    // Keep only last 10
    const updated = filtered.slice(0, 10);
    
    this.storageService.set(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, updated);
  }

  /**
   * Update last refresh time
   */
  updateLastRefreshTime() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
      const now = new Date();
      lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
    
    this.storageService.set(CONFIG.STORAGE_KEYS.LAST_UPDATE, Date.now());
  }

  /**
   * Handle search focus
   */
  handleSearchFocus() {
    // Could show recent searches here
  }

  /**
   * Handle search blur
   */
  handleSearchBlur() {
    // Hide search results after a delay to allow clicking
    setTimeout(() => {
      this.hideSearchResults();
    }, 200);
  }

  /**
   * Handle search keydown
   */
  handleSearchKeydown(event) {
    if (event.key === 'Escape') {
      event.target.blur();
      this.hideSearchResults();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Update UI layout if needed
    this.uiManager.handleResize();
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.logger.info('App is online');
    this.toastManager.show({
      type: 'success',
      title: 'Online',
      message: 'Internet connection restored',
      duration: 3000
    });
    
    // Refresh data when coming back online
    if (this.currentLocation) {
      this.refreshWeatherData();
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.logger.warn('App is offline');
    this.toastManager.show({
      type: 'warning',
      title: 'Offline',
      message: 'No internet connection. Showing cached data.',
      duration: 5000
    });
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
      // Refresh data when returning to the tab
      if (this.currentLocation) {
        this.refreshWeatherData();
      }
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r' && !event.shiftKey) {
      event.preventDefault();
      this.refreshWeatherData();
    }
    
    // Ctrl/Cmd + K: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Ctrl/Cmd + D: Toggle theme
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.handleThemeToggle();
    }
    
    // Ctrl/Cmd + U: Toggle units
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      const unitToggle = document.getElementById('unit-toggle');
      if (unitToggle) {
        unitToggle.checked = !unitToggle.checked;
        unitToggle.dispatchEvent(new Event('change'));
      }
    }
  }

  /**
   * Handle settings change
   */
  handleSettingsChange(settings) {
    this.logger.info('Settings changed:', settings);
    // React to settings changes if needed
  }

  /**
   * Handle location change
   */
  handleLocationChange(location) {
    this.currentLocation = location;
    this.loadWeatherData();
  }

  /**
   * Handle weather update
   */
  handleWeatherUpdate(data) {
    this.logger.info('Weather data updated');
    // Additional handling if needed
  }

  /**
   * Handle errors
   */
  handleError(error) {
    this.logger.error('Application error:', error);
    this.showError(error.message || 'An unexpected error occurred');
  }

  /**
   * Initialize PWA features
   */
  async initPWA() {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.logger.info('Service Worker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.toastManager.show({
                type: 'info',
                title: 'Update Available',
                message: 'A new version is available. Please refresh the page.',
                duration: 10000
              });
            }
          });
        });
      }
      
      // Handle install prompt
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.installPrompt = event;
        
        // Show install button or banner
        this.showInstallPrompt();
      });
      
    } catch (error) {
      this.logger.error('Failed to initialize PWA features:', error);
    }
  }

  /**
   * Show install prompt
   */
  showInstallPrompt() {
    // Could show an install button or banner
    this.toastManager.show({
      type: 'info',
      title: 'Install App',
      message: 'Install this app for a better experience!',
      duration: 8000,
      action: {
        label: 'Install',
        callback: this.handleInstallClick.bind(this)
      }
    });
  }

  /**
   * Handle install click
   */
  async handleInstallClick() {
    if (!this.installPrompt) return;
    
    try {
      const result = await this.installPrompt.prompt();
      if (result.outcome === 'accepted') {
        this.logger.info('App installed successfully');
      }
    } catch (error) {
      this.logger.error('Install failed:', error);
    }
    
    this.installPrompt = null;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAutoRefresh();
    this.eventManager.removeAllListeners();
    this.logger.info('Weather App destroyed');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new WeatherApp();
  app.init().catch(error => {
    console.error('Failed to initialize Weather App:', error);
  });
  
  // Make app globally available for debugging
  if (ENV.IS_DEV) {
    window.weatherApp = app;
  }
});

export default WeatherApp;
