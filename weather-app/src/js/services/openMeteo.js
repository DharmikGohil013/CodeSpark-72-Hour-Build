/**
 * WeatherAPI.com Service Module
 * 
 * This service handles all interactions with the WeatherAPI.com API
 * including current weather, forecasts, and location search.
 */

import { API_CONFIG, WEATHER_CONDITIONS } from '../config.js';

class OpenMeteoService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.apiKey = API_CONFIG.API_KEY;
        this.requestCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        console.log('🌤️ WeatherAPI service initialized');
    }
    
    /**
     * Get current weather data for a location
     */
    async getCurrentWeather(lat, lon) {
        const cacheKey = `current_${lat}_${lon}`;
        
        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Using cached current weather data');
                return cached.data;
            }
        }
        
        try {
            const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lon}&aqi=yes&alerts=yes`;
            console.log('🌐 Fetching current weather:', { lat, lon });
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transform data to our format
            const transformedData = this.transformCurrentWeather(data);
            
            // Cache the result
            this.requestCache.set(cacheKey, {
                data: transformedData,
                timestamp: Date.now()
            });
            
            console.log('✅ Current weather data fetched successfully');
            return transformedData;
            
        } catch (error) {
            console.error('❌ Error fetching current weather:', error);
            throw new Error(`Failed to fetch current weather: ${error.message}`);
        }
    }
    
    /**
     * Get forecast data for a location
     */
    async getForecast(lat, lon, days = 7) {
        const cacheKey = `forecast_${lat}_${lon}_${days}`;
        
        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Using cached forecast data');
                return cached.data;
            }
        }
        
        try {
            const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=${days}&aqi=yes&alerts=yes`;
            console.log('🌐 Fetching forecast:', { lat, lon, days });
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transform data to our format
            const transformedData = this.transformForecast(data);
            
            // Cache the result
            this.requestCache.set(cacheKey, {
                data: transformedData,
                timestamp: Date.now()
            });
            
            console.log('✅ Forecast data fetched successfully');
            return transformedData;
            
        } catch (error) {
            console.error('❌ Error fetching forecast:', error);
            throw new Error(`Failed to fetch forecast: ${error.message}`);
        }
    }
    
    /**
     * Get complete weather data (current + forecast)
     */
    async getCompleteWeatherData(lat, lon) {
        try {
            console.log('🌐 Fetching complete weather data:', { lat, lon });
            
            // Fetch both current weather and forecast in parallel
            const [currentData, forecastData] = await Promise.all([
                this.getCurrentWeather(lat, lon),
                this.getForecast(lat, lon, 7)
            ]);
            
            // Combine the data
            const completeData = {
                current: currentData.current,
                location: currentData.location,
                hourly: forecastData.hourly,
                daily: forecastData.daily,
                alerts: forecastData.alerts || [],
                lastUpdated: new Date().toISOString()
            };
            
            console.log('✅ Complete weather data fetched successfully');
            return completeData;
            
        } catch (error) {
            console.error('❌ Error fetching complete weather data:', error);
            throw error;
        }
    }
    
    /**
     * Search for locations
     */
    async searchLocations(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const cacheKey = `search_${query.toLowerCase()}`;
        
        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Using cached search results');
                return cached.data;
            }
        }
        
        try {
            const url = `${this.baseUrl}/search.json?key=${this.apiKey}&q=${encodeURIComponent(query)}`;
            console.log('🔍 Searching locations:', query);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Search API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transform search results
            const transformedData = data.map(this.transformLocationResult);
            
            // Cache the results
            this.requestCache.set(cacheKey, {
                data: transformedData,
                timestamp: Date.now()
            });
            
            console.log(`✅ Found ${transformedData.length} locations`);
            return transformedData;
            
        } catch (error) {
            console.error('❌ Error searching locations:', error);
            throw new Error(`Failed to search locations: ${error.message}`);
        }
    }
    
    /**
     * Transform current weather data from WeatherAPI format
     */
    transformCurrentWeather(data) {
        const { location, current } = data;
        
        return {
            location: {
                name: location.name,
                region: location.region,
                country: location.country,
                lat: location.lat,
                lon: location.lon,
                timezone: location.tz_id,
                localTime: location.localtime
            },
            current: {
                temperature: Math.round(current.temp_c),
                feelsLike: Math.round(current.feelslike_c),
                condition: current.condition.text,
                conditionCode: current.condition.code,
                icon: this.getWeatherIcon(current.condition.code, current.is_day),
                humidity: current.humidity,
                pressure: current.pressure_mb,
                visibility: current.vis_km,
                uvIndex: current.uv,
                windSpeed: current.wind_kph,
                windDirection: current.wind_dir,
                windDegree: current.wind_degree,
                cloudCover: current.cloud,
                isDay: Boolean(current.is_day),
                lastUpdated: current.last_updated,
                // Air Quality (if available)
                airQuality: data.current.air_quality ? {
                    co: data.current.air_quality.co,
                    no2: data.current.air_quality.no2,
                    o3: data.current.air_quality.o3,
                    so2: data.current.air_quality.so2,
                    pm2_5: data.current.air_quality.pm2_5,
                    pm10: data.current.air_quality.pm10,
                    usEpaIndex: data.current.air_quality['us-epa-index'],
                    gbDefraIndex: data.current.air_quality['gb-defra-index']
                } : null
            }
        };
    }
    
    /**
     * Transform forecast data from WeatherAPI format
     */
    transformForecast(data) {
        const { location, forecast } = data;
        
        const hourly = [];
        const daily = [];
        
        // Process forecast days
        forecast.forecastday.forEach(day => {
            // Daily forecast
            daily.push({
                date: day.date,
                day: {
                    maxTemp: Math.round(day.day.maxtemp_c),
                    minTemp: Math.round(day.day.mintemp_c),
                    avgTemp: Math.round(day.day.avgtemp_c),
                    condition: day.day.condition.text,
                    conditionCode: day.day.condition.code,
                    icon: this.getWeatherIcon(day.day.condition.code, 1), // Day icon
                    chanceOfRain: day.day.daily_chance_of_rain,
                    chanceOfSnow: day.day.daily_chance_of_snow,
                    totalPrecip: day.day.totalprecip_mm,
                    avgHumidity: day.day.avghumidity,
                    maxWindSpeed: day.day.maxwind_kph,
                    avgVisibility: day.day.avgvis_km,
                    uvIndex: day.day.uv,
                    sunrise: day.astro.sunrise,
                    sunset: day.astro.sunset,
                    moonPhase: day.astro.moon_phase,
                    moonrise: day.astro.moonrise,
                    moonset: day.astro.moonset
                }
            });
            
            // Hourly forecast (only for next 24 hours)
            if (hourly.length < 24) {
                day.hour.forEach(hour => {
                    if (hourly.length < 24) {
                        hourly.push({
                            time: hour.time,
                            temperature: Math.round(hour.temp_c),
                            feelsLike: Math.round(hour.feelslike_c),
                            condition: hour.condition.text,
                            conditionCode: hour.condition.code,
                            icon: this.getWeatherIcon(hour.condition.code, hour.is_day),
                            chanceOfRain: hour.chance_of_rain,
                            chanceOfSnow: hour.chance_of_snow,
                            precip: hour.precip_mm,
                            humidity: hour.humidity,
                            windSpeed: hour.wind_kph,
                            windDirection: hour.wind_dir,
                            windDegree: hour.wind_degree,
                            pressure: hour.pressure_mb,
                            visibility: hour.vis_km,
                            cloudCover: hour.cloud,
                            isDay: Boolean(hour.is_day)
                        });
                    }
                });
            }
        });
        
        return {
            location: {
                name: location.name,
                region: location.region,
                country: location.country,
                lat: location.lat,
                lon: location.lon,
                timezone: location.tz_id,
                localTime: location.localtime
            },
            hourly: hourly.slice(0, 24), // Ensure max 24 hours
            daily: daily.slice(0, 7), // Ensure max 7 days
            alerts: data.alerts?.alert || []
        };
    }
    
    /**
     * Transform location search result
     */
    transformLocationResult(result) {
        return {
            name: result.name,
            region: result.region,
            country: result.country,
            lat: result.lat,
            lon: result.lon,
            displayName: `${result.name}, ${result.region || result.country}`
        };
    }
    
    /**
     * Get weather icon based on condition code and time of day
     */
    getWeatherIcon(code, isDay) {
        // Map WeatherAPI condition codes to our icons
        const conditionMap = {
            1000: isDay ? 'sun' : 'moon', // Clear
            1003: isDay ? 'cloud-sun' : 'cloud-moon', // Partly cloudy
            1006: 'cloud', // Cloudy
            1009: 'clouds', // Overcast
            1030: 'smog', // Mist
            1063: isDay ? 'cloud-sun-rain' : 'cloud-moon-rain', // Patchy rain
            1066: isDay ? 'cloud-snow' : 'cloud-snow', // Patchy snow
            1069: 'cloud-sleet', // Patchy sleet
            1072: 'cloud-sleet', // Patchy freezing drizzle
            1087: 'bolt', // Thundery outbreaks
            1114: 'wind', // Blowing snow
            1117: 'snowflake', // Blizzard
            1135: 'smog', // Fog
            1147: 'smog', // Freezing fog
            1150: 'cloud-drizzle', // Patchy light drizzle
            1153: 'cloud-drizzle', // Light drizzle
            1168: 'cloud-sleet', // Freezing drizzle
            1171: 'cloud-sleet', // Heavy freezing drizzle
            1180: isDay ? 'cloud-sun-rain' : 'cloud-moon-rain', // Patchy light rain
            1183: 'cloud-rain', // Light rain
            1186: isDay ? 'cloud-sun-rain' : 'cloud-moon-rain', // Moderate rain at times
            1189: 'cloud-rain', // Moderate rain
            1192: 'cloud-rain', // Heavy rain at times
            1195: 'cloud-rain', // Heavy rain
            1198: 'cloud-sleet', // Light freezing rain
            1201: 'cloud-sleet', // Moderate/heavy freezing rain
            1204: 'cloud-sleet', // Light sleet
            1207: 'cloud-sleet', // Moderate/heavy sleet
            1210: isDay ? 'cloud-snow' : 'cloud-snow', // Patchy light snow
            1213: 'snowflake', // Light snow
            1216: isDay ? 'cloud-snow' : 'cloud-snow', // Patchy moderate snow
            1219: 'snowflake', // Moderate snow
            1222: isDay ? 'cloud-snow' : 'cloud-snow', // Patchy heavy snow
            1225: 'snowflake', // Heavy snow
            1237: 'cloud-hail', // Ice pellets
            1240: isDay ? 'cloud-sun-rain' : 'cloud-moon-rain', // Light rain shower
            1243: 'cloud-rain', // Moderate/heavy rain shower
            1246: 'cloud-rain', // Torrential rain shower
            1249: 'cloud-sleet', // Light sleet showers
            1252: 'cloud-sleet', // Moderate/heavy sleet showers
            1255: isDay ? 'cloud-snow' : 'cloud-snow', // Light snow showers
            1258: 'snowflake', // Moderate/heavy snow showers
            1261: 'cloud-hail', // Light showers of ice pellets
            1264: 'cloud-hail', // Moderate/heavy showers of ice pellets
            1273: isDay ? 'cloud-bolt-sun' : 'cloud-bolt', // Patchy light rain with thunder
            1276: 'cloud-bolt', // Moderate/heavy rain with thunder
            1279: isDay ? 'cloud-bolt' : 'cloud-bolt', // Patchy light snow with thunder
            1282: 'cloud-bolt' // Moderate/heavy snow with thunder
        };
        
        return conditionMap[code] || (isDay ? 'sun' : 'moon');
    }
    
    /**
     * Get weather gradient for condition
     */
    getWeatherGradient(code, isDay) {
        // Get the condition info from our config
        for (const [key, condition] of Object.entries(WEATHER_CONDITIONS)) {
            if (condition.codes && condition.codes.includes(code)) {
                return isDay ? condition.gradient.day : condition.gradient.night;
            }
        }
        
        // Default gradient
        return isDay 
            ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
            : 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)';
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.requestCache.clear();
        console.log('🗑️ Weather API cache cleared');
    }
    
    /**
     * Get cache size
     */
    getCacheSize() {
        return this.requestCache.size;
    }
    
    /**
     * Get cache info
     */
    getCacheInfo() {
        const entries = Array.from(this.requestCache.entries()).map(([key, value]) => ({
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
}

// Create singleton instance
const openMeteoService = new OpenMeteoService();

export default openMeteoService;