/**
 * CurrentWeatherCard Component
 * 
 * This component displays the current weather information including
 * temperature, conditions, and detailed weather metrics.
 */

import { createElement, addClass, removeClass, fadeIn, fadeOut } from '../utils/dom.js';
import { formatTemperature, formatWindSpeed, formatPressure, formatHumidity, formatUVIndex, formatVisibility, formatAirQuality, formatDate } from '../utils/format.js';
import { WEATHER_CONDITIONS } from '../config.js';
import weatherState from '../store/state.js';

export default class CurrentWeatherCard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showDetails: true,
            showAirQuality: true,
            showLastUpdated: true,
            animateChanges: true,
            ...options
        };
        
        this.element = null;
        this.currentData = null;
        this.units = 'metric';
        
        this.init();
        this.subscribeToState();
        
        console.log('🌤️ CurrentWeatherCard component initialized');
    }
    
    init() {
        this.element = this.createCard();
        if (this.container) {
            this.container.appendChild(this.element);
        }
        
        // Show loading state initially
        this.showLoading();
    }
    
    createCard() {
        const card = createElement('div', {
            className: 'current-weather-card glass-card p-6',
            'aria-label': 'Current weather information'
        });
        
        // Main weather display
        const mainWeather = createElement('div', {
            className: 'main-weather-display flex items-center gap-6 mb-6'
        });
        
        // Weather icon container
        const iconContainer = createElement('div', {
            className: 'weather-icon-container flex-shrink-0'
        });
        
        // Temperature and condition
        const weatherInfo = createElement('div', {
            className: 'weather-info flex-1'
        });
        
        mainWeather.appendChild(iconContainer);
        mainWeather.appendChild(weatherInfo);
        
        // Weather details grid
        if (this.options.showDetails) {
            const detailsGrid = createElement('div', {
                className: 'weather-details-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'
            });
            card.appendChild(mainWeather);
            card.appendChild(detailsGrid);
        } else {
            card.appendChild(mainWeather);
        }
        
        // Air quality section
        if (this.options.showAirQuality) {
            const airQualitySection = createElement('div', {
                className: 'air-quality-section mb-4'
            });
            card.appendChild(airQualitySection);
        }
        
        // Last updated
        if (this.options.showLastUpdated) {
            const lastUpdated = createElement('div', {
                className: 'last-updated text-sm text-text-muted text-center'
            });
            card.appendChild(lastUpdated);
        }
        
        return card;
    }
    
    subscribeToState() {
        // Listen for weather data changes
        weatherState.subscribe('weather.current', (currentWeather) => {
            if (currentWeather) {
                this.updateWeatherData(currentWeather);
            }
        });
        
        // Listen for loading state changes
        weatherState.subscribe('weather.isLoading', (isLoading) => {
            if (isLoading) {
                this.showLoading();
            } else {
                this.hideLoading();
            }
        });
        
        // Listen for error state changes
        weatherState.subscribe('weather.error', (error) => {
            if (error) {
                this.showError(error);
            }
        });
        
        // Listen for unit changes
        weatherState.subscribe('preferences.units', (units) => {
            this.units = units;
            if (this.currentData) {
                this.updateWeatherData(this.currentData);
            }
        });
        
        // Initialize with current state
        const state = weatherState.getState();
        this.units = state.preferences.units;
        
        if (state.weather.current) {
            this.updateWeatherData(state.weather.current);
        } else if (state.weather.isLoading) {
            this.showLoading();
        } else if (state.weather.error) {
            this.showError(state.weather.error);
        }
    }
    
    async updateWeatherData(data) {
        if (!data) return;
        
        this.currentData = data;
        this.hideError();
        
        try {
            // Update main weather display
            this.updateMainWeather(data);
            
            // Update details grid
            if (this.options.showDetails) {
                this.updateDetailsGrid(data);
            }
            
            // Update air quality
            if (this.options.showAirQuality && data.airQuality) {
                this.updateAirQuality(data.airQuality);
            }
            
            // Update last updated time
            if (this.options.showLastUpdated) {
                this.updateLastUpdated(data.lastUpdated);
            }
            
            // Animate changes
            if (this.options.animateChanges) {
                addClass(this.element, 'updated');
                setTimeout(() => {
                    removeClass(this.element, 'updated');
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ Error updating weather card:', error);
        }
    }
    
    updateMainWeather(data) {
        const iconContainer = this.element.querySelector('.weather-icon-container');
        const weatherInfo = this.element.querySelector('.weather-info');
        
        if (!iconContainer || !weatherInfo) return;
        
        // Update weather icon
        this.updateWeatherIcon(iconContainer, data);
        
        // Update weather info
        this.updateWeatherInfo(weatherInfo, data);
    }
    
    updateWeatherIcon(container, data) {
        container.innerHTML = '';
        
        // Create animated weather icon
        const iconWrapper = createElement('div', {
            className: 'weather-icon-wrapper relative w-24 h-24 flex items-center justify-center'
        });
        
        const icon = createElement('i', {
            className: `weather-icon fas fa-${data.icon} text-6xl`,
            style: {
                background: this.getWeatherGradient(data.conditionCode, data.isDay),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            },
            'aria-hidden': 'true'
        });
        
        // Add animation based on weather condition
        this.addIconAnimation(icon, data.conditionCode);
        
        iconWrapper.appendChild(icon);
        container.appendChild(iconWrapper);
    }
    
    updateWeatherInfo(container, data) {
        container.innerHTML = '';
        
        // Temperature
        const temperature = createElement('div', {
            className: 'temperature-display mb-2'
        });
        
        const tempValue = createElement('span', {
            className: 'temperature-value text-5xl font-light text-text-primary',
            textContent: formatTemperature(data.temperature, this.units, false)
        });
        
        const tempUnit = createElement('span', {
            className: 'temperature-unit text-2xl text-text-muted ml-1',
            textContent: this.units === 'metric' ? '°C' : '°F'
        });
        
        temperature.appendChild(tempValue);
        temperature.appendChild(tempUnit);
        
        // Feels like temperature
        const feelsLike = createElement('div', {
            className: 'feels-like text-sm text-text-muted mb-3',
            textContent: `Feels like ${formatTemperature(data.feelsLike, this.units)}`
        });
        
        // Weather condition
        const condition = createElement('div', {
            className: 'weather-condition text-lg font-medium text-text-primary mb-2',
            textContent: data.condition
        });
        
        // Additional info
        const additionalInfo = createElement('div', {
            className: 'additional-info flex items-center gap-4 text-sm text-text-muted'
        });
        
        const windInfo = createElement('span', {
            innerHTML: `<i class="fas fa-wind mr-1" aria-hidden="true"></i>${formatWindSpeed(data.windSpeed, this.units)}`
        });
        
        const humidityInfo = createElement('span', {
            innerHTML: `<i class="fas fa-tint mr-1" aria-hidden="true"></i>${formatHumidity(data.humidity)}`
        });
        
        additionalInfo.appendChild(windInfo);
        additionalInfo.appendChild(humidityInfo);
        
        // Assemble weather info
        container.appendChild(temperature);
        container.appendChild(feelsLike);
        container.appendChild(condition);
        container.appendChild(additionalInfo);
    }
    
    updateDetailsGrid(data) {
        const detailsGrid = this.element.querySelector('.weather-details-grid');
        if (!detailsGrid) return;
        
        detailsGrid.innerHTML = '';
        
        const details = [
            {
                icon: 'fas fa-eye',
                label: 'Visibility',
                value: formatVisibility(data.visibility, this.units),
                id: 'visibility'
            },
            {
                icon: 'fas fa-thermometer-half',
                label: 'Pressure',
                value: formatPressure(data.pressure, this.units),
                id: 'pressure'
            },
            {
                icon: 'fas fa-sun',
                label: 'UV Index',
                value: formatUVIndex(data.uvIndex, true),
                id: 'uv-index'
            },
            {
                icon: 'fas fa-cloud',
                label: 'Cloud Cover',
                value: formatHumidity(data.cloudCover),
                id: 'cloud-cover'
            }
        ];
        
        details.forEach(detail => {
            const detailItem = this.createDetailItem(detail);
            detailsGrid.appendChild(detailItem);
        });
    }
    
    createDetailItem({ icon, label, value, id }) {
        const item = createElement('div', {
            className: 'detail-item bg-glass-bg rounded-lg p-3 text-center',
            id: id
        });
        
        const iconEl = createElement('i', {
            className: `${icon} text-text-muted mb-2 block text-lg`,
            'aria-hidden': 'true'
        });
        
        const labelEl = createElement('div', {
            className: 'detail-label text-xs text-text-muted mb-1',
            textContent: label
        });
        
        const valueEl = createElement('div', {
            className: 'detail-value text-sm font-medium text-text-primary',
            textContent: value
        });
        
        item.appendChild(iconEl);
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        
        return item;
    }
    
    updateAirQuality(airQuality) {
        let airQualitySection = this.element.querySelector('.air-quality-section');
        if (!airQualitySection) return;
        
        airQualitySection.innerHTML = '';
        
        // Use US EPA index if available, otherwise UK DEFRA
        const aqiData = airQuality.usEpaIndex 
            ? formatAirQuality(airQuality.usEpaIndex, 'us')
            : formatAirQuality(airQuality.gbDefraIndex, 'uk');
        
        const aqiContainer = createElement('div', {
            className: 'air-quality-container bg-glass-bg rounded-lg p-3'
        });
        
        const aqiHeader = createElement('div', {
            className: 'aqi-header flex items-center justify-between mb-2'
        });
        
        const aqiTitle = createElement('span', {
            className: 'text-sm font-medium text-text-primary',
            textContent: 'Air Quality'
        });
        
        const aqiValue = createElement('span', {
            className: 'aqi-value px-2 py-1 rounded text-xs font-medium',
            textContent: aqiData.label,
            style: {
                backgroundColor: aqiData.color + '20',
                color: aqiData.color
            }
        });
        
        aqiHeader.appendChild(aqiTitle);
        aqiHeader.appendChild(aqiValue);
        
        // AQI details
        const aqiDetails = createElement('div', {
            className: 'aqi-details grid grid-cols-3 gap-2 text-xs'
        });
        
        const pollutants = [
            { label: 'PM2.5', value: airQuality.pm2_5?.toFixed(1) || '--', unit: 'μg/m³' },
            { label: 'PM10', value: airQuality.pm10?.toFixed(1) || '--', unit: 'μg/m³' },
            { label: 'O₃', value: airQuality.o3?.toFixed(1) || '--', unit: 'μg/m³' }
        ];
        
        pollutants.forEach(pollutant => {
            const pollutantItem = createElement('div', {
                className: 'pollutant-item text-center'
            });
            
            const pollutantLabel = createElement('div', {
                className: 'text-text-muted',
                textContent: pollutant.label
            });
            
            const pollutantValue = createElement('div', {
                className: 'text-text-primary font-medium',
                textContent: `${pollutant.value} ${pollutant.unit}`
            });
            
            pollutantItem.appendChild(pollutantLabel);
            pollutantItem.appendChild(pollutantValue);
            aqiDetails.appendChild(pollutantItem);
        });
        
        aqiContainer.appendChild(aqiHeader);
        aqiContainer.appendChild(aqiDetails);
        airQualitySection.appendChild(aqiContainer);
    }
    
    updateLastUpdated(lastUpdated) {
        const lastUpdatedEl = this.element.querySelector('.last-updated');
        if (!lastUpdatedEl || !lastUpdated) return;
        
        const formattedTime = formatDate(lastUpdated, 'relative');
        lastUpdatedEl.textContent = `Updated ${formattedTime}`;
    }
    
    addIconAnimation(icon, conditionCode) {
        // Add CSS animation classes based on weather condition
        if (conditionCode >= 1000 && conditionCode < 1100) {
            // Clear/sunny - gentle pulse
            addClass(icon, 'animate-pulse-slow');
        } else if (conditionCode >= 1180 && conditionCode < 1300) {
            // Rain - bounce animation
            addClass(icon, 'animate-bounce-slow');
        } else if (conditionCode >= 1210 && conditionCode < 1300) {
            // Snow - float animation
            addClass(icon, 'animate-float');
        } else if (conditionCode >= 1273) {
            // Thunderstorm - flash animation
            addClass(icon, 'animate-flash');
        }
    }
    
    getWeatherGradient(conditionCode, isDay) {
        // Get gradient from config or default
        for (const [key, condition] of Object.entries(WEATHER_CONDITIONS)) {
            if (condition.codes && condition.codes.includes(conditionCode)) {
                return isDay ? condition.gradient.day : condition.gradient.night;
            }
        }
        
        // Default gradient
        return isDay 
            ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
            : 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)';
    }
    
    showLoading() {
        this.element.innerHTML = '';
        
        const loadingContainer = createElement('div', {
            className: 'loading-container flex flex-col items-center justify-center py-12'
        });
        
        const spinner = createElement('div', {
            className: 'loading-spinner w-8 h-8 border-2 border-glass-border border-t-primary rounded-full animate-spin mb-4'
        });
        
        const loadingText = createElement('div', {
            className: 'loading-text text-text-muted',
            textContent: 'Loading current weather...'
        });
        
        loadingContainer.appendChild(spinner);
        loadingContainer.appendChild(loadingText);
        this.element.appendChild(loadingContainer);
    }
    
    hideLoading() {
        const loadingContainer = this.element.querySelector('.loading-container');
        if (loadingContainer) {
            fadeOut(loadingContainer, 300).then(() => {
                if (loadingContainer.parentNode) {
                    loadingContainer.parentNode.removeChild(loadingContainer);
                }
            });
        }
    }
    
    showError(error) {
        this.element.innerHTML = '';
        
        const errorContainer = createElement('div', {
            className: 'error-container flex flex-col items-center justify-center py-12 text-center'
        });
        
        const errorIcon = createElement('i', {
            className: 'fas fa-exclamation-triangle text-4xl text-red-400 mb-4',
            'aria-hidden': 'true'
        });
        
        const errorMessage = createElement('div', {
            className: 'error-message text-text-muted mb-4',
            textContent: typeof error === 'string' ? error : 'Unable to load weather data'
        });
        
        const retryButton = createElement('button', {
            className: 'retry-button btn-primary',
            textContent: 'Try Again'
        });
        
        retryButton.addEventListener('click', () => {
            this.element.dispatchEvent(new CustomEvent('retry-weather'));
        });
        
        errorContainer.appendChild(errorIcon);
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(retryButton);
        this.element.appendChild(errorContainer);
    }
    
    hideError() {
        const errorContainer = this.element.querySelector('.error-container');
        if (errorContainer) {
            fadeOut(errorContainer, 300).then(() => {
                if (errorContainer.parentNode) {
                    errorContainer.parentNode.removeChild(errorContainer);
                }
            });
        }
    }
    
    /**
     * Get card element
     */
    getElement() {
        return this.element;
    }
    
    /**
     * Update card visibility
     */
    setVisible(visible) {
        if (visible) {
            removeClass(this.element, 'hidden');
        } else {
            addClass(this.element, 'hidden');
        }
    }
    
    /**
     * Destroy component
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up references
        this.element = null;
        this.currentData = null;
        
        console.log('🧹 CurrentWeatherCard component destroyed');
    }
}