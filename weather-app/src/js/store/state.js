/**
 * Global State Management for Weather App
 * 
 * This module provides centralized state management using the observer pattern.
 * It handles weather data, user preferences, UI state, and automatic persistence.
 */

class WeatherState {
    constructor() {
        // Initialize state with default values
        this.state = {
            // Weather Data
            weather: {
                current: null,
                hourly: [],
                daily: [],
                location: null,
                lastUpdated: null,
                isLoading: false,
                error: null
            },
            
            // User Preferences
            preferences: {
                units: 'metric', // metric (°C) or imperial (°F)
                theme: 'dark', // light or dark
                language: 'en',
                autoLocation: true,
                notifications: true,
                updateInterval: 300000 // 5 minutes
            },
            
            // UI State
            ui: {
                activeTab: 'current',
                searchQuery: '',
                isSearching: false,
                showSettings: false,
                isInstallPromptShown: false,
                lastInstallPrompt: null,
                connectionStatus: navigator.onLine ? 'online' : 'offline'
            },
            
            // Location Data
            location: {
                current: null,
                recent: [],
                favorites: [],
                isDetecting: false
            },
            
            // App State
            app: {
                version: '1.0.0',
                isInstalled: false,
                lastSync: null,
                cacheVersion: null,
                updateAvailable: false
            }
        };
        
        // Observer pattern for state changes
        this.observers = new Map();
        
        // Load persisted state
        this.loadState();
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup connection monitoring
        this.setupConnectionMonitoring();
        
        console.log('🗄️ WeatherState initialized');
    }
    
    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const savedState = localStorage.getItem('weather-app-state');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Merge with default state to handle new properties
                this.state = this.deepMerge(this.state, parsedState);
                
                // Clear old weather data if it's stale (older than 1 hour)
                if (this.state.weather.lastUpdated) {
                    const lastUpdate = new Date(this.state.weather.lastUpdated);
                    const now = new Date();
                    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
                    
                    if (hoursSinceUpdate > 1) {
                        this.state.weather.current = null;
                        this.state.weather.hourly = [];
                        this.state.weather.daily = [];
                        this.state.weather.error = null;
                    }
                }
                
                console.log('✅ State loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading state:', error);
        }
    }
    
    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            localStorage.setItem('weather-app-state', JSON.stringify(this.state));
            console.log('💾 State saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving state:', error);
        }
    }
    
    /**
     * Setup automatic state saving
     */
    setupAutoSave() {
        // Debounced save function
        let saveTimeout;
        this.debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveState();
            }, 1000);
        };
    }
    
    /**
     * Setup connection status monitoring
     */
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.updateState('ui.connectionStatus', 'online');
            console.log('🌐 Connection restored');
        });
        
        window.addEventListener('offline', () => {
            this.updateState('ui.connectionStatus', 'offline');
            console.log('📴 Connection lost');
        });
    }
    
    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    /**
     * Get current state or specific path
     */
    getState(path = null) {
        if (!path) return { ...this.state };
        
        return this.getNestedValue(this.state, path);
    }
    
    /**
     * Update state and notify observers
     */
    updateState(path, value) {
        const oldValue = this.getNestedValue(this.state, path);
        
        // Update the state
        this.setNestedValue(this.state, path, value);
        
        // Auto-save state
        this.debouncedSave();
        
        // Notify observers
        this.notifyObservers(path, value, oldValue);
        
        console.log(`🔄 State updated: ${path}`, value);
    }
    
    /**
     * Batch update multiple state values
     */
    updateStates(updates) {
        const changes = [];
        
        for (const [path, value] of Object.entries(updates)) {
            const oldValue = this.getNestedValue(this.state, path);
            this.setNestedValue(this.state, path, value);
            changes.push({ path, value, oldValue });
        }
        
        // Auto-save state
        this.debouncedSave();
        
        // Notify observers for each change
        changes.forEach(({ path, value, oldValue }) => {
            this.notifyObservers(path, value, oldValue);
        });
        
        console.log('🔄 Batch state update:', updates);
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        if (!this.observers.has(path)) {
            this.observers.set(path, new Set());
        }
        
        this.observers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.observers.get(path)?.delete(callback);
        };
    }
    
    /**
     * Notify observers of state changes
     */
    notifyObservers(path, newValue, oldValue) {
        // Notify exact path observers
        if (this.observers.has(path)) {
            this.observers.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('❌ Observer error:', error);
                }
            });
        }
        
        // Notify wildcard observers for parent paths
        const pathParts = path.split('.');
        for (let i = 0; i < pathParts.length; i++) {
            const parentPath = pathParts.slice(0, i + 1).join('.') + '.*';
            if (this.observers.has(parentPath)) {
                this.observers.get(parentPath).forEach(callback => {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error('❌ Observer error:', error);
                    }
                });
            }
        }
    }
    
    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    /**
     * Set nested value in object using dot notation
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }
    
    /**
     * Clear all weather data
     */
    clearWeatherData() {
        this.updateStates({
            'weather.current': null,
            'weather.hourly': [],
            'weather.daily': [],
            'weather.error': null,
            'weather.lastUpdated': null
        });
    }
    
    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.updateState('weather.isLoading', isLoading);
        
        if (isLoading) {
            this.updateState('weather.error', null);
        }
    }
    
    /**
     * Set error state
     */
    setError(error) {
        this.updateStates({
            'weather.error': error,
            'weather.isLoading': false
        });
    }
    
    /**
     * Set weather data
     */
    setWeatherData(data) {
        const now = new Date().toISOString();
        
        this.updateStates({
            'weather.current': data.current,
            'weather.hourly': data.hourly || [],
            'weather.daily': data.daily || [],
            'weather.location': data.location,
            'weather.lastUpdated': now,
            'weather.isLoading': false,
            'weather.error': null
        });
    }
    
    /**
     * Add location to recent searches
     */
    addRecentLocation(location) {
        const recent = [...this.state.location.recent];
        
        // Remove if already exists
        const existingIndex = recent.findIndex(item => 
            item.lat === location.lat && item.lon === location.lon
        );
        if (existingIndex > -1) {
            recent.splice(existingIndex, 1);
        }
        
        // Add to beginning
        recent.unshift({
            ...location,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10
        recent.splice(10);
        
        this.updateState('location.recent', recent);
    }
    
    /**
     * Toggle favorite location
     */
    toggleFavoriteLocation(location) {
        const favorites = [...this.state.location.favorites];
        const existingIndex = favorites.findIndex(item => 
            item.lat === location.lat && item.lon === location.lon
        );
        
        if (existingIndex > -1) {
            // Remove from favorites
            favorites.splice(existingIndex, 1);
        } else {
            // Add to favorites
            favorites.push({
                ...location,
                timestamp: new Date().toISOString()
            });
        }
        
        this.updateState('location.favorites', favorites);
    }
    
    /**
     * Check if location is favorite
     */
    isFavoriteLocation(location) {
        return this.state.location.favorites.some(item => 
            item.lat === location.lat && item.lon === location.lon
        );
    }
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.state.preferences.theme === 'dark' ? 'light' : 'dark';
        this.updateState('preferences.theme', newTheme);
        
        // Update document class
        document.documentElement.className = newTheme;
    }
    
    /**
     * Toggle units
     */
    toggleUnits() {
        const newUnits = this.state.preferences.units === 'metric' ? 'imperial' : 'metric';
        this.updateState('preferences.units', newUnits);
    }
    
    /**
     * Reset all preferences to defaults
     */
    resetPreferences() {
        this.updateState('preferences', {
            units: 'metric',
            theme: 'dark',
            language: 'en',
            autoLocation: true,
            notifications: true,
            updateInterval: 300000
        });
    }
    
    /**
     * Clear all data (reset app)
     */
    clearAllData() {
        localStorage.removeItem('weather-app-state');
        
        // Reset to default state
        this.state = {
            weather: { current: null, hourly: [], daily: [], location: null, lastUpdated: null, isLoading: false, error: null },
            preferences: { units: 'metric', theme: 'dark', language: 'en', autoLocation: true, notifications: true, updateInterval: 300000 },
            ui: { activeTab: 'current', searchQuery: '', isSearching: false, showSettings: false, isInstallPromptShown: false, lastInstallPrompt: null, connectionStatus: navigator.onLine ? 'online' : 'offline' },
            location: { current: null, recent: [], favorites: [], isDetecting: false },
            app: { version: '1.0.0', isInstalled: false, lastSync: null, cacheVersion: null, updateAvailable: false }
        };
        
        // Notify all observers
        this.notifyObservers('*', this.state, {});
        
        console.log('🗑️ All data cleared');
    }
    
    /**
     * Get app statistics
     */
    getStats() {
        return {
            totalLocations: this.state.location.recent.length + this.state.location.favorites.length,
            favoriteLocations: this.state.location.favorites.length,
            lastUpdate: this.state.weather.lastUpdated,
            theme: this.state.preferences.theme,
            units: this.state.preferences.units,
            connectionStatus: this.state.ui.connectionStatus,
            version: this.state.app.version
        };
    }
}

// Create singleton instance
const weatherState = new WeatherState();

export default weatherState;