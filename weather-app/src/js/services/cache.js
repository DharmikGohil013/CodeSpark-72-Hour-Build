/**
 * Cache Service Module
 * 
 * This service provides intelligent caching for weather data, location data,
 * and other app resources with automatic expiration and storage management.
 */

class CacheService {
    constructor() {
        this.dbName = 'WeatherAppCache';
        this.dbVersion = 1;
        this.db = null;
        
        // Cache stores
        this.stores = {
            weather: 'weather-data',
            locations: 'location-data',
            images: 'image-cache',
            settings: 'app-settings'
        };
        
        // Default expiration times (in milliseconds)
        this.expirationTimes = {
            weather: 10 * 60 * 1000, // 10 minutes
            forecast: 30 * 60 * 1000, // 30 minutes
            location: 60 * 60 * 1000, // 1 hour
            search: 60 * 60 * 1000, // 1 hour
            image: 24 * 60 * 60 * 1000, // 24 hours
            setting: Infinity // Never expire
        };
        
        this.isReady = false;
        this.init();
        
        console.log('💾 Cache service initializing...');
    }
    
    /**
     * Initialize IndexedDB
     */
    async init() {
        try {
            this.db = await this.openDatabase();
            this.isReady = true;
            console.log('✅ Cache service initialized');
            
            // Clean up expired entries on startup
            this.cleanupExpiredEntries();
            
        } catch (error) {
            console.error('❌ Failed to initialize cache service:', error);
            
            // Fallback to localStorage for basic caching
            this.fallbackToLocalStorage();
        }
    }
    
    /**
     * Open IndexedDB database
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                Object.values(this.stores).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        store.createIndex('expires', 'expires', { unique: false });
                        console.log(`📦 Created object store: ${storeName}`);
                    }
                });
            };
        });
    }
    
    /**
     * Fallback to localStorage when IndexedDB is not available
     */
    fallbackToLocalStorage() {
        console.log('⚠️ Falling back to localStorage for caching');
        this.useLocalStorage = true;
        this.isReady = true;
    }
    
    /**
     * Wait for cache service to be ready
     */
    async waitForReady() {
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    /**
     * Store data in cache
     */
    async set(key, data, type = 'weather', customTTL = null) {
        await this.waitForReady();
        
        const now = Date.now();
        const ttl = customTTL || this.expirationTimes[type] || this.expirationTimes.weather;
        const expires = ttl === Infinity ? Infinity : now + ttl;
        
        const cacheEntry = {
            id: key,
            data: data,
            type: type,
            timestamp: now,
            expires: expires,
            size: this.calculateSize(data)
        };
        
        try {
            if (this.useLocalStorage) {
                return this.setLocalStorage(key, cacheEntry);
            }
            
            const store = this.getStore(type);
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            
            await new Promise((resolve, reject) => {
                const request = objectStore.put(cacheEntry);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`💾 Cached data: ${key} (${type})`);
            
        } catch (error) {
            console.error('❌ Failed to cache data:', error);
            
            // Fallback to localStorage
            this.setLocalStorage(key, cacheEntry);
        }
    }
    
    /**
     * Retrieve data from cache
     */
    async get(key, type = 'weather') {
        await this.waitForReady();
        
        try {
            if (this.useLocalStorage) {
                return this.getLocalStorage(key);
            }
            
            const store = this.getStore(type);
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            
            const cacheEntry = await new Promise((resolve, reject) => {
                const request = objectStore.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (!cacheEntry) {
                console.log(`📭 Cache miss: ${key}`);
                return null;
            }
            
            // Check if expired
            if (cacheEntry.expires !== Infinity && Date.now() > cacheEntry.expires) {
                console.log(`⏰ Cache expired: ${key}`);
                this.delete(key, type);
                return null;
            }
            
            console.log(`💾 Cache hit: ${key} (${type})`);
            return cacheEntry.data;
            
        } catch (error) {
            console.error('❌ Failed to retrieve cached data:', error);
            
            // Fallback to localStorage
            return this.getLocalStorage(key);
        }
    }
    
    /**
     * Delete data from cache
     */
    async delete(key, type = 'weather') {
        await this.waitForReady();
        
        try {
            if (this.useLocalStorage) {
                return this.deleteLocalStorage(key);
            }
            
            const store = this.getStore(type);
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            
            await new Promise((resolve, reject) => {
                const request = objectStore.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`🗑️ Deleted from cache: ${key}`);
            
        } catch (error) {
            console.error('❌ Failed to delete cached data:', error);
        }
    }
    
    /**
     * Clear all cache data for a specific type
     */
    async clearType(type = 'weather') {
        await this.waitForReady();
        
        try {
            if (this.useLocalStorage) {
                return this.clearLocalStorageType(type);
            }
            
            const store = this.getStore(type);
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            
            await new Promise((resolve, reject) => {
                const request = objectStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`🗑️ Cleared cache type: ${type}`);
            
        } catch (error) {
            console.error('❌ Failed to clear cache type:', error);
        }
    }
    
    /**
     * Clear all cache data
     */
    async clearAll() {
        await this.waitForReady();
        
        try {
            if (this.useLocalStorage) {
                return this.clearAllLocalStorage();
            }
            
            const promises = Object.values(this.stores).map(store => 
                new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([store], 'readwrite');
                    const objectStore = transaction.objectStore(store);
                    const request = objectStore.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                })
            );
            
            await Promise.all(promises);
            console.log('🗑️ All cache data cleared');
            
        } catch (error) {
            console.error('❌ Failed to clear all cache data:', error);
        }
    }
    
    /**
     * Get cache statistics
     */
    async getStats() {
        await this.waitForReady();
        
        const stats = {
            stores: {},
            totalEntries: 0,
            totalSize: 0,
            expiredEntries: 0
        };
        
        try {
            if (this.useLocalStorage) {
                return this.getLocalStorageStats();
            }
            
            for (const [key, storeName] of Object.entries(this.stores)) {
                const storeStats = await this.getStoreStats(storeName);
                stats.stores[key] = storeStats;
                stats.totalEntries += storeStats.entries;
                stats.totalSize += storeStats.size;
                stats.expiredEntries += storeStats.expired;
            }
            
            console.log('📊 Cache statistics:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get cache statistics:', error);
            return stats;
        }
    }
    
    /**
     * Get statistics for a specific store
     */
    async getStoreStats(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        
        return new Promise((resolve) => {
            const stats = { entries: 0, size: 0, expired: 0 };
            const request = objectStore.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    stats.entries++;
                    stats.size += cursor.value.size || 0;
                    
                    if (cursor.value.expires !== Infinity && Date.now() > cursor.value.expires) {
                        stats.expired++;
                    }
                    
                    cursor.continue();
                } else {
                    resolve(stats);
                }
            };
            
            request.onerror = () => resolve(stats);
        });
    }
    
    /**
     * Clean up expired entries
     */
    async cleanupExpiredEntries() {
        await this.waitForReady();
        
        try {
            console.log('🧹 Cleaning up expired cache entries...');
            
            if (this.useLocalStorage) {
                return this.cleanupLocalStorage();
            }
            
            let totalCleaned = 0;
            
            for (const storeName of Object.values(this.stores)) {
                const cleaned = await this.cleanupStore(storeName);
                totalCleaned += cleaned;
            }
            
            if (totalCleaned > 0) {
                console.log(`🗑️ Cleaned up ${totalCleaned} expired cache entries`);
            }
            
        } catch (error) {
            console.error('❌ Failed to cleanup expired entries:', error);
        }
    }
    
    /**
     * Clean up expired entries in a specific store
     */
    async cleanupStore(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const now = Date.now();
        let cleaned = 0;
        
        return new Promise((resolve) => {
            const request = objectStore.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.expires !== Infinity && now > cursor.value.expires) {
                        cursor.delete();
                        cleaned++;
                    }
                    cursor.continue();
                } else {
                    resolve(cleaned);
                }
            };
            
            request.onerror = () => resolve(cleaned);
        });
    }
    
    /**
     * Get appropriate store name for cache type
     */
    getStore(type) {
        return this.stores[type] || this.stores.weather;
    }
    
    /**
     * Calculate approximate size of data
     */
    calculateSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
        } catch {
            return 0;
        }
    }
    
    // LocalStorage fallback methods
    setLocalStorage(key, cacheEntry) {
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (error) {
            console.error('❌ LocalStorage cache set error:', error);
        }
    }
    
    getLocalStorage(key) {
        try {
            const item = localStorage.getItem(`cache_${key}`);
            if (!item) return null;
            
            const cacheEntry = JSON.parse(item);
            
            // Check expiration
            if (cacheEntry.expires !== Infinity && Date.now() > cacheEntry.expires) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }
            
            return cacheEntry.data;
        } catch (error) {
            console.error('❌ LocalStorage cache get error:', error);
            return null;
        }
    }
    
    deleteLocalStorage(key) {
        try {
            localStorage.removeItem(`cache_${key}`);
        } catch (error) {
            console.error('❌ LocalStorage cache delete error:', error);
        }
    }
    
    clearLocalStorageType(type) {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`cache_`) && key.includes(type)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('❌ LocalStorage cache clear type error:', error);
        }
    }
    
    clearAllLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('❌ LocalStorage cache clear all error:', error);
        }
    }
    
    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            let cleaned = 0;
            const now = Date.now();
            
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    try {
                        const item = localStorage.getItem(key);
                        const cacheEntry = JSON.parse(item);
                        
                        if (cacheEntry.expires !== Infinity && now > cacheEntry.expires) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    } catch {
                        // Remove corrupted entries
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            });
            
            return cleaned;
        } catch (error) {
            console.error('❌ LocalStorage cleanup error:', error);
            return 0;
        }
    }
    
    getLocalStorageStats() {
        try {
            const keys = Object.keys(localStorage);
            const stats = {
                stores: { localStorage: { entries: 0, size: 0, expired: 0 } },
                totalEntries: 0,
                totalSize: 0,
                expiredEntries: 0
            };
            
            const now = Date.now();
            
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    try {
                        const item = localStorage.getItem(key);
                        const cacheEntry = JSON.parse(item);
                        
                        stats.stores.localStorage.entries++;
                        stats.stores.localStorage.size += item.length * 2;
                        
                        if (cacheEntry.expires !== Infinity && now > cacheEntry.expires) {
                            stats.stores.localStorage.expired++;
                        }
                    } catch {
                        // Count corrupted entries as expired
                        stats.stores.localStorage.expired++;
                    }
                }
            });
            
            stats.totalEntries = stats.stores.localStorage.entries;
            stats.totalSize = stats.stores.localStorage.size;
            stats.expiredEntries = stats.stores.localStorage.expired;
            
            return stats;
        } catch (error) {
            console.error('❌ LocalStorage stats error:', error);
            return {
                stores: {},
                totalEntries: 0,
                totalSize: 0,
                expiredEntries: 0
            };
        }
    }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;