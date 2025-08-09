/**
 * Debounce Utility Module
 * 
 * This module provides debouncing and throttling functions to optimize
 * performance by limiting the rate of function execution.
 */

/**
 * Debounce function - delays execution until after wait time has passed
 * since the last time it was invoked
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function - ensures function is called at most once per specified time period
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle
 * @returns {Function} - The throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Advanced debounce with options
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge
 * @param {boolean} options.trailing - Execute on trailing edge
 * @param {number} options.maxWait - Maximum time func is allowed to be delayed
 * @returns {Function} - The debounced function
 */
export function advancedDebounce(func, wait, options = {}) {
    let lastCallTime;
    let lastInvokeTime = 0;
    let leadingTimeout;
    let maxingTimeout;
    let trailingTimeout;
    let result;
    
    const {
        leading = false,
        trailing = true,
        maxWait
    } = options;
    
    const useMaxWait = maxWait !== undefined;
    
    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }
    
    function leadingEdge(time) {
        lastInvokeTime = time;
        leadingTimeout = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
    }
    
    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;
        
        return useMaxWait
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }
    
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        
        return (lastCallTime === undefined ||
                (timeSinceLastCall >= wait) ||
                (timeSinceLastCall < 0) ||
                (useMaxWait && timeSinceLastInvoke >= maxWait));
    }
    
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        leadingTimeout = setTimeout(timerExpired, remainingWait(time));
    }
    
    function trailingEdge(time) {
        leadingTimeout = undefined;
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }
    
    function cancel() {
        if (leadingTimeout !== undefined) {
            clearTimeout(leadingTimeout);
        }
        if (maxingTimeout !== undefined) {
            clearTimeout(maxingTimeout);
        }
        if (trailingTimeout !== undefined) {
            clearTimeout(trailingTimeout);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = leadingTimeout = maxingTimeout = trailingTimeout = undefined;
    }
    
    function flush() {
        return leadingTimeout === undefined ? result : trailingEdge(Date.now());
    }
    
    let lastArgs, lastThis;
    
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        
        if (isInvoking) {
            if (leadingTimeout === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (useMaxWait) {
                leadingTimeout = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (leadingTimeout === undefined) {
            leadingTimeout = setTimeout(timerExpired, wait);
        }
        return result;
    }
    
    debounced.cancel = cancel;
    debounced.flush = flush;
    
    return debounced;
}

/**
 * Create a debounced search function
 * 
 * @param {Function} searchFunc - The search function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} - Debounced search function
 */
export function createDebouncedSearch(searchFunc, delay = 300) {
    return debounce(searchFunc, delay, false);
}

/**
 * Create a throttled scroll handler
 * 
 * @param {Function} scrollFunc - The scroll handler function
 * @param {number} limit - Throttle limit in milliseconds (default: 16)
 * @returns {Function} - Throttled scroll function
 */
export function createThrottledScroll(scrollFunc, limit = 16) {
    return throttle(scrollFunc, limit);
}

/**
 * Create a debounced resize handler
 * 
 * @param {Function} resizeFunc - The resize handler function
 * @param {number} delay - Delay in milliseconds (default: 250)
 * @returns {Function} - Debounced resize function
 */
export function createDebouncedResize(resizeFunc, delay = 250) {
    return debounce(resizeFunc, delay, false);
}

/**
 * Create a debounced input handler
 * 
 * @param {Function} inputFunc - The input handler function
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} - Debounced input function
 */
export function createDebouncedInput(inputFunc, delay = 300) {
    return advancedDebounce(inputFunc, delay, {
        leading: false,
        trailing: true,
        maxWait: delay * 3
    });
}

/**
 * Create a throttled API call function
 * 
 * @param {Function} apiFunc - The API function to throttle
 * @param {number} limit - Throttle limit in milliseconds (default: 1000)
 * @returns {Function} - Throttled API function
 */
export function createThrottledAPI(apiFunc, limit = 1000) {
    return throttle(apiFunc, limit);
}

/**
 * Frame-based throttle using requestAnimationFrame
 * 
 * @param {Function} func - The function to throttle
 * @returns {Function} - Frame-throttled function
 */
export function frameThrottle(func) {
    let requestId = null;
    let lastArgs = null;
    
    return function throttled(...args) {
        lastArgs = args;
        
        if (requestId === null) {
            requestId = requestAnimationFrame(() => {
                requestId = null;
                func.apply(this, lastArgs);
            });
        }
    };
}

/**
 * Create a debounced function with cancel and flush methods
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {Object} options - Options object
 * @returns {Function} - The debounced function with cancel and flush methods
 */
export function createAdvancedDebounce(func, wait, options = {}) {
    const debouncedFunc = advancedDebounce(func, wait, options);
    
    // Add utility methods
    debouncedFunc.isPending = function() {
        return this.leadingTimeout !== undefined;
    };
    
    return debouncedFunc;
}

/**
 * Batch function calls and execute them together
 * 
 * @param {Function} func - The function to batch
 * @param {number} delay - Delay before executing batch (default: 0)
 * @returns {Function} - Batched function
 */
export function batchCalls(func, delay = 0) {
    let callQueue = [];
    let timeoutId = null;
    
    return function(...args) {
        callQueue.push({ args, context: this });
        
        if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                const calls = [...callQueue];
                callQueue = [];
                timeoutId = null;
                
                calls.forEach(call => {
                    func.apply(call.context, call.args);
                });
            }, delay);
        }
    };
}

/**
 * Rate limiter - limits function calls to a specific rate
 * 
 * @param {Function} func - The function to rate limit
 * @param {number} maxCalls - Maximum number of calls
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Rate limited function
 */
export function rateLimit(func, maxCalls, windowMs) {
    const calls = [];
    
    return function(...args) {
        const now = Date.now();
        
        // Remove calls outside the window
        while (calls.length > 0 && now - calls[0] > windowMs) {
            calls.shift();
        }
        
        // Check if we can make another call
        if (calls.length < maxCalls) {
            calls.push(now);
            return func.apply(this, args);
        } else {
            console.warn('Rate limit exceeded');
            return Promise.reject(new Error('Rate limit exceeded'));
        }
    };
}

/**
 * Utility to check if a function is debounced/throttled
 * 
 * @param {Function} func - The function to check
 * @returns {boolean} - True if function has debounce/throttle methods
 */
export function isDeferred(func) {
    return typeof func === 'function' && (
        typeof func.cancel === 'function' || 
        typeof func.flush === 'function'
    );
}

/**
 * Create a smart debounce that adapts delay based on input frequency
 * 
 * @param {Function} func - The function to debounce
 * @param {number} minWait - Minimum wait time
 * @param {number} maxWait - Maximum wait time
 * @returns {Function} - Adaptive debounced function
 */
export function adaptiveDebounce(func, minWait = 100, maxWait = 1000) {
    let lastCallTime = 0;
    let callCount = 0;
    let timeoutId = null;
    
    return function(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;
        
        // Reset call count if it's been a while
        if (timeSinceLastCall > maxWait) {
            callCount = 0;
        }
        
        callCount++;
        lastCallTime = now;
        
        // Calculate adaptive delay
        const adaptiveWait = Math.min(
            maxWait,
            Math.max(minWait, minWait * Math.log(callCount + 1))
        );
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
            callCount = Math.max(0, callCount - 1);
        }, adaptiveWait);
    };
}

// Export common pre-configured functions
export const debouncedSearch = (func) => createDebouncedSearch(func, 300);
export const throttledScroll = (func) => createThrottledScroll(func, 16);
export const debouncedResize = (func) => createDebouncedResize(func, 250);
export const debouncedInput = (func) => createDebouncedInput(func, 300);
export const throttledAPI = (func) => createThrottledAPI(func, 1000);