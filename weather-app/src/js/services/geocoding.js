/**
 * Geocoding Service Module
 * 
 * This service handles location detection, reverse geocoding, and location search.
 * It uses both browser geolocation API and WeatherAPI.com for location services.
 */

import openMeteoService from './openMeteo.js';

class GeocodingService {
    constructor() {
        this.lastKnownPosition = null;
        this.watchId = null;
        this.isWatching = false;
        this.locationCache = new Map();
        this.cacheTimeout = 60 * 60 * 1000; // 1 hour
        
        console.log('📍 Geocoding service initialized');
    }
    
    /**
     * Get current position using browser geolocation
     */
    async getCurrentPosition(options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000 // 5 minutes
        };
        
        const geoOptions = { ...defaultOptions, ...options };
        
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            
            console.log('📍 Requesting current position...');
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    
                    this.lastKnownPosition = location;
                    console.log('✅ Current position obtained:', { 
                        lat: location.lat, 
                        lon: location.lon,
                        accuracy: location.accuracy 
                    });
                    
                    resolve(location);
                },
                (error) => {
                    console.error('❌ Geolocation error:', error);
                    
                    const errorMessages = {
                        1: 'Permission denied. Please allow location access.',
                        2: 'Position unavailable. Please check your device settings.',
                        3: 'Request timeout. Please try again.'
                    };
                    
                    reject(new Error(errorMessages[error.code] || 'Unknown geolocation error'));
                },
                geoOptions
            );
        });
    }
    
    /**
     * Start watching position changes
     */
    startWatchingPosition(callback, options = {}) {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }
        
        if (this.isWatching) {
            this.stopWatchingPosition();
        }
        
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000 // 1 minute
        };
        
        const geoOptions = { ...defaultOptions, ...options };
        
        console.log('👀 Starting position watch...');
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };
                
                this.lastKnownPosition = location;
                console.log('📍 Position updated:', { 
                    lat: location.lat, 
                    lon: location.lon,
                    accuracy: location.accuracy 
                });
                
                callback(location);
            },
            (error) => {
                console.error('❌ Position watch error:', error);
                callback(null, error);
            },
            geoOptions
        );
        
        this.isWatching = true;
    }
    
    /**
     * Stop watching position changes
     */
    stopWatchingPosition() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
            console.log('⏹️ Position watch stopped');
        }
    }
    
    /**
     * Reverse geocoding - get location details from coordinates
     */
    async reverseGeocode(lat, lon) {
        const cacheKey = `reverse_${lat.toFixed(4)}_${lon.toFixed(4)}`;
        
        // Check cache first
        if (this.locationCache.has(cacheKey)) {
            const cached = this.locationCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Using cached reverse geocoding result');
                return cached.data;
            }
        }
        
        try {
            console.log('🌐 Reverse geocoding coordinates:', { lat, lon });
            
            // Use WeatherAPI.com to get location details
            const weatherData = await openMeteoService.getCurrentWeather(lat, lon);
            const location = weatherData.location;
            
            const result = {
                name: location.name,
                region: location.region,
                country: location.country,
                lat: location.lat,
                lon: location.lon,
                timezone: location.timezone,
                localTime: location.localTime,
                displayName: `${location.name}, ${location.region || location.country}`
            };
            
            // Cache the result
            this.locationCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            console.log('✅ Reverse geocoding successful:', result.displayName);
            return result;
            
        } catch (error) {
            console.error('❌ Reverse geocoding error:', error);
            throw new Error(`Failed to get location details: ${error.message}`);
        }
    }
    
    /**
     * Get current location with details
     */
    async getCurrentLocation() {
        try {
            console.log('📍 Getting current location with details...');
            
            // Get coordinates
            const position = await this.getCurrentPosition();
            
            // Get location details
            const locationDetails = await this.reverseGeocode(position.lat, position.lon);
            
            return {
                ...locationDetails,
                accuracy: position.accuracy,
                timestamp: position.timestamp
            };
            
        } catch (error) {
            console.error('❌ Error getting current location:', error);
            throw error;
        }
    }
    
    /**
     * Search for locations using query
     */
    async searchLocations(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        try {
            console.log('🔍 Searching for locations:', query);
            
            // Use the weather service search function
            const results = await openMeteoService.searchLocations(query);
            
            console.log(`✅ Found ${results.length} locations`);
            return results;
            
        } catch (error) {
            console.error('❌ Location search error:', error);
            throw new Error(`Failed to search locations: ${error.message}`);
        }
    }
    
    /**
     * Get location suggestions based on partial input
     */
    async getLocationSuggestions(partialQuery) {
        if (!partialQuery || partialQuery.length < 2) {
            return [];
        }
        
        try {
            // Search for locations
            const results = await this.searchLocations(partialQuery);
            
            // Limit results and add additional info
            return results.slice(0, 8).map(location => ({
                ...location,
                type: 'search',
                distance: null // Could calculate distance from current location
            }));
            
        } catch (error) {
            console.error('❌ Error getting location suggestions:', error);
            return [];
        }
    }
    
    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in kilometers
    }
    
    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * Check if geolocation is available
     */
    isGeolocationAvailable() {
        return 'geolocation' in navigator;
    }
    
    /**
     * Check if geolocation permission is granted
     */
    async checkGeolocationPermission() {
        if (!('permissions' in navigator)) {
            return 'unsupported';
        }
        
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.error('❌ Error checking geolocation permission:', error);
            return 'unsupported';
        }
    }
    
    /**
     * Request geolocation permission
     */
    async requestGeolocationPermission() {
        try {
            console.log('🔐 Requesting geolocation permission...');
            
            // Try to get position (this will trigger permission request)
            await this.getCurrentPosition({ timeout: 5000 });
            
            console.log('✅ Geolocation permission granted');
            return true;
            
        } catch (error) {
            console.log('❌ Geolocation permission denied or unavailable');
            return false;
        }
    }
    
    /**
     * Get the last known position
     */
    getLastKnownPosition() {
        return this.lastKnownPosition;
    }
    
    /**
     * Check if coordinates are valid
     */
    isValidCoordinates(lat, lon) {
        return (
            typeof lat === 'number' &&
            typeof lon === 'number' &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
        );
    }
    
    /**
     * Format coordinates for display
     */
    formatCoordinates(lat, lon, precision = 4) {
        if (!this.isValidCoordinates(lat, lon)) {
            return 'Invalid coordinates';
        }
        
        const latFormatted = Math.abs(lat).toFixed(precision) + '°' + (lat >= 0 ? 'N' : 'S');
        const lonFormatted = Math.abs(lon).toFixed(precision) + '°' + (lon >= 0 ? 'E' : 'W');
        
        return `${latFormatted}, ${lonFormatted}`;
    }
    
    /**
     * Clear location cache
     */
    clearCache() {
        this.locationCache.clear();
        console.log('🗑️ Location cache cleared');
    }
    
    /**
     * Get cache info
     */
    getCacheInfo() {
        const entries = Array.from(this.locationCache.entries()).map(([key, value]) => ({
            key,
            timestamp: value.timestamp,
            age: Date.now() - value.timestamp,
            expired: Date.now() - value.timestamp > this.cacheTimeout
        }));
        
        return {
            size: entries.length,
            entries,
            timeout: this.cacheTimeout
        };
    }
    
    /**
     * Cleanup - stop watching and clear resources
     */
    cleanup() {
        this.stopWatchingPosition();
        this.clearCache();
        this.lastKnownPosition = null;
        console.log('🧹 Geocoding service cleaned up');
    }
}

// Create singleton instance
const geocodingService = new GeocodingService();

export default geocodingService;