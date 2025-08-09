/**
 * Error Handling Utility Module
 * 
 * This module provides error handling, logging, and user-friendly error
 * messaging utilities for the weather application.
 */

/**
 * Custom error classes for different types of application errors
 */
export class WeatherAppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.name = 'WeatherAppError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export class APIError extends WeatherAppError {
    constructor(message, status = null, response = null) {
        super(message, 'API_ERROR');
        this.name = 'APIError';
        this.status = status;
        this.response = response;
    }
}

export class LocationError extends WeatherAppError {
    constructor(message, type = 'UNKNOWN') {
        super(message, `LOCATION_${type}`);
        this.name = 'LocationError';
        this.locationType = type;
    }
}

export class CacheError extends WeatherAppError {
    constructor(message, operation = 'UNKNOWN') {
        super(message, `CACHE_${operation}`);
        this.name = 'CacheError';
        this.operation = operation;
    }
}

export class NetworkError extends WeatherAppError {
    constructor(message, offline = false) {
        super(message, offline ? 'NETWORK_OFFLINE' : 'NETWORK_ERROR');
        this.name = 'NetworkError';
        this.offline = offline;
    }
}

/**
 * Error codes and their user-friendly messages
 */
export const ERROR_MESSAGES = {
    // API Errors
    API_ERROR: 'Unable to fetch weather data. Please try again.',
    API_RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    API_UNAUTHORIZED: 'API access denied. Please check your connection.',
    API_NOT_FOUND: 'Location not found. Please check the location name.',
    API_TIMEOUT: 'Request timed out. Please check your connection.',
    
    // Location Errors
    LOCATION_PERMISSION_DENIED: 'Location access denied. Please enable location permissions.',
    LOCATION_UNAVAILABLE: 'Unable to determine your location. Please try again.',
    LOCATION_TIMEOUT: 'Location request timed out. Please try again.',
    LOCATION_NOT_SUPPORTED: 'Geolocation is not supported by your browser.',
    
    // Network Errors
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    NETWORK_OFFLINE: 'You are offline. Some features may not be available.',
    
    // Cache Errors
    CACHE_READ: 'Unable to read cached data.',
    CACHE_WRITE: 'Unable to save data to cache.',
    CACHE_FULL: 'Storage is full. Some data may not be saved.',
    
    // General Errors
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    INVALID_DATA: 'Invalid data received. Please refresh the page.',
    FEATURE_NOT_SUPPORTED: 'This feature is not supported by your browser.'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error) {
    if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
    
    // If it's one of our custom errors, use the code
    if (error.code && ERROR_MESSAGES[error.code]) {
        return ERROR_MESSAGES[error.code];
    }
    
    // Check for common browser errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (error.name === 'AbortError') {
        return ERROR_MESSAGES.API_TIMEOUT;
    }
    
    // Check for geolocation errors
    if (error.code === 1) return ERROR_MESSAGES.LOCATION_PERMISSION_DENIED;
    if (error.code === 2) return ERROR_MESSAGES.LOCATION_UNAVAILABLE;
    if (error.code === 3) return ERROR_MESSAGES.LOCATION_TIMEOUT;
    
    // Check for API errors by status code
    if (error.status) {
        switch (error.status) {
            case 401:
            case 403:
                return ERROR_MESSAGES.API_UNAUTHORIZED;
            case 404:
                return ERROR_MESSAGES.API_NOT_FOUND;
            case 429:
                return ERROR_MESSAGES.API_RATE_LIMIT;
            case 500:
            case 502:
            case 503:
            case 504:
                return 'Server error. Please try again later.';
            default:
                return ERROR_MESSAGES.API_ERROR;
        }
    }
    
    // Check for offline status
    if (!navigator.onLine) {
        return ERROR_MESSAGES.NETWORK_OFFLINE;
    }
    
    // Return the original message if it looks user-friendly, otherwise use generic
    const message = error.message || error.toString();
    return message.length < 100 ? message : ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get error severity
 */
export function getErrorSeverity(error) {
    if (!error) return ERROR_SEVERITY.MEDIUM;
    
    // Critical errors
    if (error.name === 'SecurityError' || error.code === 'API_UNAUTHORIZED') {
        return ERROR_SEVERITY.CRITICAL;
    }
    
    // High severity errors
    if (error.name === 'NetworkError' || error.code?.includes('NETWORK')) {
        return ERROR_SEVERITY.HIGH;
    }
    
    // Medium severity errors
    if (error.name === 'APIError' || error.code?.includes('API')) {
        return ERROR_SEVERITY.MEDIUM;
    }
    
    // Low severity errors
    if (error.code?.includes('CACHE') || error.code?.includes('LOCATION')) {
        return ERROR_SEVERITY.LOW;
    }
    
    return ERROR_SEVERITY.MEDIUM;
}

/**
 * Error logger with different levels
 */
export class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep last 100 errors
    }
    
    log(error, context = null, level = 'error') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            error: {
                name: error?.name || 'Unknown',
                message: error?.message || 'Unknown error',
                code: error?.code || null,
                stack: error?.stack || null,
                details: error?.details || null
            },
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            online: navigator.onLine,
            severity: getErrorSeverity(error)
        };
        
        this.logs.push(logEntry);
        
        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Console logging based on level
        const consoleMethods = {
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };
        
        const consoleMethod = consoleMethods[level] || console.log;
        consoleMethod('Weather App Error:', {
            message: error?.message,
            code: error?.code,
            context,
            severity: logEntry.severity
        });
        
        // Store in localStorage for debugging
        this.saveToStorage();
    }
    
    error(error, context = null) {
        this.log(error, context, 'error');
    }
    
    warn(error, context = null) {
        this.log(error, context, 'warn');
    }
    
    info(error, context = null) {
        this.log(error, context, 'info');
    }
    
    debug(error, context = null) {
        this.log(error, context, 'debug');
    }
    
    getLogs(level = null, limit = null) {
        let logs = this.logs;
        
        if (level) {
            logs = logs.filter(log => log.level === level);
        }
        
        if (limit) {
            logs = logs.slice(-limit);
        }
        
        return logs;
    }
    
    getRecentErrors(minutes = 5) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.logs.filter(log => new Date(log.timestamp) >= cutoff);
    }
    
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('weather-app-error-logs');
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('weather-app-error-logs', JSON.stringify({
                logs: this.logs.slice(-20), // Save last 20 errors
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Unable to save error logs to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('weather-app-error-logs');
            if (stored) {
                const { logs } = JSON.parse(stored);
                this.logs = logs || [];
            }
        } catch (e) {
            console.warn('Unable to load error logs from localStorage:', e);
            this.logs = [];
        }
    }
    
    exportLogs() {
        return {
            logs: this.logs,
            metadata: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                online: navigator.onLine
            }
        };
    }
}

// Create singleton error logger
export const errorLogger = new ErrorLogger();

// Load existing logs on initialization
errorLogger.loadFromStorage();

/**
 * Async error handler wrapper
 */
export function handleAsyncError(asyncFn, context = null) {
    return async function(...args) {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            errorLogger.error(error, { context, function: asyncFn.name, args });
            throw error;
        }
    };
}

/**
 * Promise error handler
 */
export function handlePromiseError(promise, context = null) {
    return promise.catch(error => {
        errorLogger.error(error, { context, type: 'promise' });
        throw error;
    });
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        errorLogger.error(event.reason, { type: 'unhandled-rejection' });
        console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
        errorLogger.error(event.error, { 
            type: 'javascript-error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });
    
    console.log('🛡️ Global error handling set up');
}

/**
 * Retry mechanism for failed operations
 */
export async function retry(fn, options = {}) {
    const {
        retries = 3,
        delay = 1000,
        backoff = 2,
        condition = () => true
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === retries || !condition(error)) {
                throw error;
            }
            
            const waitTime = delay * Math.pow(backoff, attempt);
            errorLogger.warn(error, { 
                type: 'retry-attempt', 
                attempt: attempt + 1, 
                maxRetries: retries,
                waitTime
            });
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    throw lastError;
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
    constructor(fn, options = {}) {
        this.fn = fn;
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000;
        this.monitor = options.monitor || (() => {});
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failures = 0;
        this.nextAttempt = null;
        this.successCount = 0;
    }
    
    async call(...args) {
        if (this.state === 'OPEN') {
            if (this.nextAttempt > Date.now()) {
                throw new WeatherAppError('Circuit breaker is OPEN', 'CIRCUIT_BREAKER_OPEN');
            }
            this.state = 'HALF_OPEN';
            this.successCount = 0;
        }
        
        try {
            const result = await this.fn(...args);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 3) { // Need 3 successes to close
                this.state = 'CLOSED';
                this.monitor({ state: this.state, failures: this.failures });
            }
        } else {
            this.state = 'CLOSED';
        }
    }
    
    onFailure() {
        this.failures++;
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            this.monitor({ state: this.state, failures: this.failures, nextAttempt: this.nextAttempt });
        }
    }
    
    getState() {
        return {
            state: this.state,
            failures: this.failures,
            nextAttempt: this.nextAttempt,
            successCount: this.successCount
        };
    }
}

/**
 * Create a safe version of a function that won't throw
 */
export function createSafeFunction(fn, fallbackValue = null, context = null) {
    return function(...args) {
        try {
            const result = fn.apply(this, args);
            
            // Handle async functions
            if (result && typeof result.then === 'function') {
                return result.catch(error => {
                    errorLogger.error(error, { context, function: fn.name, args });
                    return fallbackValue;
                });
            }
            
            return result;
        } catch (error) {
            errorLogger.error(error, { context, function: fn.name, args });
            return fallbackValue;
        }
    };
}

/**
 * Validate and sanitize error for display
 */
export function sanitizeError(error) {
    if (!error) return null;
    
    return {
        message: getUserFriendlyMessage(error),
        code: error.code || 'UNKNOWN_ERROR',
        severity: getErrorSeverity(error),
        timestamp: new Date().toISOString(),
        canRetry: !['LOCATION_PERMISSION_DENIED', 'API_UNAUTHORIZED'].includes(error.code)
    };
}