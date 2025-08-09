/**
 * DOM Utility Module
 * 
 * This module provides DOM manipulation utilities, element creation,
 * animation helpers, and other DOM-related functions.
 */

/**
 * Create element with attributes and children
 */
export function createElement(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className' || key === 'class') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else if (key.startsWith('aria-')) {
            element.setAttribute(key, value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element[key] = value;
        }
    });
    
    // Append children
    children.forEach(child => {
        if (child) {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        }
    });
    
    return element;
}

/**
 * Query selector with error handling
 */
export function $(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.error('Invalid selector:', selector, error);
        return null;
    }
}

/**
 * Query selector all with error handling
 */
export function $$(selector, context = document) {
    try {
        return Array.from(context.querySelectorAll(selector));
    } catch (error) {
        console.error('Invalid selector:', selector, error);
        return [];
    }
}

/**
 * Add event listener with cleanup
 */
export function addEventListener(element, event, handler, options = {}) {
    if (!element || typeof handler !== 'function') return null;
    
    element.addEventListener(event, handler, options);
    
    // Return cleanup function
    return () => {
        element.removeEventListener(event, handler, options);
    };
}

/**
 * Add multiple event listeners
 */
export function addEventListeners(element, events) {
    const cleanupFunctions = [];
    
    Object.entries(events).forEach(([event, handler]) => {
        const cleanup = addEventListener(element, event, handler);
        if (cleanup) cleanupFunctions.push(cleanup);
    });
    
    // Return cleanup function for all listeners
    return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
}

/**
 * Delegate event handling
 */
export function delegate(parent, selector, event, handler) {
    return addEventListener(parent, event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e, target);
        }
    });
}

/**
 * Check if element is visible
 */
export function isVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    return (
        rect.top <= windowHeight - threshold &&
        rect.bottom >= threshold &&
        rect.left <= windowWidth - threshold &&
        rect.right >= threshold
    );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element, options = {}) {
    if (!element) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Get element position relative to document
 */
export function getElementPosition(element) {
    if (!element) return { top: 0, left: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Add CSS classes with animation support
 */
export function addClass(element, className, duration = 0) {
    if (!element) return Promise.resolve();
    
    element.classList.add(className);
    
    if (duration > 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
    
    return Promise.resolve();
}

/**
 * Remove CSS classes with animation support
 */
export function removeClass(element, className, duration = 0) {
    if (!element) return Promise.resolve();
    
    if (duration > 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                element.classList.remove(className);
                resolve();
            }, duration);
        });
    }
    
    element.classList.remove(className);
    return Promise.resolve();
}

/**
 * Toggle CSS class with animation support
 */
export function toggleClass(element, className, force = null) {
    if (!element) return false;
    
    if (force !== null) {
        if (force) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
        return force;
    }
    
    return element.classList.toggle(className);
}

/**
 * Fade in animation
 */
export function fadeIn(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // Trigger reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        
        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Fade out animation
 */
export function fadeOut(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // Trigger reflow
        element.offsetHeight;
        
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide down animation
 */
export function slideDown(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        const originalHeight = element.scrollHeight;
        
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        element.style.display = 'block';
        
        // Trigger reflow
        element.offsetHeight;
        
        element.style.height = originalHeight + 'px';
        
        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide up animation
 */
export function slideUp(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        const originalHeight = element.scrollHeight;
        
        element.style.height = originalHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        // Trigger reflow
        element.offsetHeight;
        
        element.style.height = '0px';
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Create loading spinner element
 */
export function createSpinner(size = 'medium', color = 'currentColor') {
    const sizeMap = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };
    
    const spinnerSize = sizeMap[size] || size;
    
    return createElement('div', {
        className: 'loading-spinner',
        style: {
            width: spinnerSize,
            height: spinnerSize,
            border: '2px solid transparent',
            borderTop: `2px solid ${color}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    });
}

/**
 * Show loading state on element
 */
export function showLoading(element, text = 'Loading...') {
    if (!element) return;
    
    const spinner = createSpinner();
    const loadingEl = createElement('div', {
        className: 'loading-state',
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '20px'
        }
    }, spinner, text);
    
    element.innerHTML = '';
    element.appendChild(loadingEl);
}

/**
 * Hide loading state
 */
export function hideLoading(element) {
    if (!element) return;
    
    const loadingEl = element.querySelector('.loading-state');
    if (loadingEl) {
        loadingEl.remove();
    }
}

/**
 * Create toast notification
 */
export function createToast(message, type = 'info', duration = 5000) {
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '350px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }
    }, message);
    
    // Set background color based on type
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove
    if (duration > 0) {
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
    
    return toast;
}

/**
 * Debounced resize observer
 */
export function observeResize(element, callback, debounceMs = 100) {
    if (!element || !ResizeObserver) return null;
    
    let timeout;
    const debouncedCallback = (entries) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(entries), debounceMs);
    };
    
    const observer = new ResizeObserver(debouncedCallback);
    observer.observe(element);
    
    return () => observer.disconnect();
}

/**
 * Intersection observer for lazy loading
 */
export function observeIntersection(element, callback, options = {}) {
    if (!element || !IntersectionObserver) return null;
    
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };
    
    const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
    observer.observe(element);
    
    return () => observer.disconnect();
}

/**
 * Create modal backdrop
 */
export function createModalBackdrop(onClose = null) {
    const backdrop = createElement('div', {
        className: 'modal-backdrop',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        }
    });
    
    // Click outside to close
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop && onClose) {
            onClose();
        }
    });
    
    // Escape key to close
    const handleEscape = (e) => {
        if (e.key === 'Escape' && onClose) {
            onClose();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    document.body.appendChild(backdrop);
    
    // Animate in
    setTimeout(() => {
        backdrop.style.opacity = '1';
    }, 10);
    
    return backdrop;
}

/**
 * Remove element with animation
 */
export function removeElement(element, animation = 'fade') {
    if (!element) return Promise.resolve();
    
    const animations = {
        fade: () => fadeOut(element, 300),
        slide: () => slideUp(element, 300),
        none: () => Promise.resolve()
    };
    
    const animationFn = animations[animation] || animations.fade;
    
    return animationFn().then(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

/**
 * Get computed style value
 */
export function getStyle(element, property) {
    if (!element) return null;
    
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Set multiple CSS properties
 */
export function setStyles(element, styles) {
    if (!element || !styles) return;
    
    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }
    
    // Fallback for older browsers
    try {
        const textArea = createElement('textarea', {
            value: text,
            style: {
                position: 'fixed',
                left: '-9999px',
                top: '-9999px'
            }
        });
        
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return true;
    } catch (error) {
        console.error('Fallback copy failed:', error);
        return false;
    }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHTML(str) {
    if (!str) return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Parse HTML string safely
 */
export function parseHTML(htmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(htmlString, 'text/html');
}

/**
 * Get element data attributes as object
 */
export function getDataAttributes(element) {
    if (!element) return {};
    
    const data = {};
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
            const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            data[key] = attr.value;
        }
    });
    
    return data;
}

/**
 * Wait for DOM to be ready
 */
export function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}