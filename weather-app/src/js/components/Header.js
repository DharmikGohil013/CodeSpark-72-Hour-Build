/**
 * Header Component
 * 
 * This component manages the app header with logo, theme toggle,
 * units toggle, and other header controls.
 */

import { createElement, addClass, removeClass } from '../utils/dom.js';
import weatherState from '../store/state.js';

export default class Header {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showLogo: true,
            showToggles: true,
            showSettings: false,
            ...options
        };
        
        this.element = null;
        this.themeToggle = null;
        this.unitToggle = null;
        this.settingsButton = null;
        
        this.init();
        this.bindEvents();
        this.subscribeToState();
        
        console.log('🎯 Header component initialized');
    }
    
    init() {
        this.element = this.createHeader();
        if (this.container) {
            this.container.appendChild(this.element);
        }
    }
    
    createHeader() {
        const header = createElement('header', {
            className: 'app-header glass-card',
            'aria-label': 'Application header'
        });
        
        // Left section with logo
        const leftSection = createElement('div', {
            className: 'header-left flex items-center gap-4'
        });
        
        if (this.options.showLogo) {
            const logo = this.createLogo();
            leftSection.appendChild(logo);
        }
        
        // Right section with controls
        const rightSection = createElement('div', {
            className: 'header-right flex items-center gap-2'
        });
        
        if (this.options.showToggles) {
            // Unit toggle
            this.unitToggle = this.createUnitToggle();
            rightSection.appendChild(this.unitToggle);
            
            // Theme toggle
            this.themeToggle = this.createThemeToggle();
            rightSection.appendChild(this.themeToggle);
        }
        
        if (this.options.showSettings) {
            this.settingsButton = this.createSettingsButton();
            rightSection.appendChild(this.settingsButton);
        }
        
        header.appendChild(leftSection);
        header.appendChild(rightSection);
        
        return header;
    }
    
    createLogo() {
        const logo = createElement('div', {
            className: 'app-logo flex items-center gap-3'
        });
        
        // Weather icon
        const iconContainer = createElement('div', {
            className: 'logo-icon w-8 h-8 flex items-center justify-center'
        });
        
        const icon = createElement('i', {
            className: 'fas fa-cloud-sun text-2xl',
            style: {
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }
        });
        
        iconContainer.appendChild(icon);
        
        // App name
        const appName = createElement('h1', {
            className: 'logo-text text-xl font-semibold text-text-primary',
            textContent: 'WeatherApp'
        });
        
        logo.appendChild(iconContainer);
        logo.appendChild(appName);
        
        return logo;
    }
    
    createThemeToggle() {
        const button = createElement('button', {
            className: 'theme-toggle btn-icon',
            type: 'button',
            'aria-label': 'Toggle theme',
            title: 'Toggle between light and dark theme'
        });
        
        const icon = createElement('i', {
            className: 'fas fa-moon',
            'aria-hidden': 'true'
        });
        
        button.appendChild(icon);
        return button;
    }
    
    createUnitToggle() {
        const button = createElement('button', {
            className: 'unit-toggle btn-icon',
            type: 'button',
            'aria-label': 'Toggle temperature units',
            title: 'Switch between Celsius and Fahrenheit'
        });
        
        const text = createElement('span', {
            className: 'font-medium',
            textContent: '°C'
        });
        
        button.appendChild(text);
        return button;
    }
    
    createSettingsButton() {
        const button = createElement('button', {
            className: 'settings-toggle btn-icon',
            type: 'button',
            'aria-label': 'Open settings',
            title: 'Open application settings'
        });
        
        const icon = createElement('i', {
            className: 'fas fa-cog',
            'aria-hidden': 'true'
        });
        
        button.appendChild(icon);
        return button;
    }
    
    bindEvents() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleThemeToggle();
            });
        }
        
        if (this.unitToggle) {
            this.unitToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleUnitToggle();
            });
        }
        
        if (this.settingsButton) {
            this.settingsButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSettingsToggle();
            });
        }
    }
    
    subscribeToState() {
        // Listen for theme changes
        weatherState.subscribe('preferences.theme', (theme) => {
            this.updateThemeToggle(theme);
        });
        
        // Listen for unit changes
        weatherState.subscribe('preferences.units', (units) => {
            this.updateUnitToggle(units);
        });
        
        // Listen for UI state changes
        weatherState.subscribe('ui.showSettings', (showSettings) => {
            this.updateSettingsButton(showSettings);
        });
        
        // Initialize with current state
        const state = weatherState.getState();
        this.updateThemeToggle(state.preferences.theme);
        this.updateUnitToggle(state.preferences.units);
        this.updateSettingsButton(state.ui.showSettings);
    }
    
    handleThemeToggle() {
        try {
            weatherState.toggleTheme();
            
            // Add visual feedback
            addClass(this.themeToggle, 'btn-pressed');
            setTimeout(() => {
                removeClass(this.themeToggle, 'btn-pressed');
            }, 150);
            
            // Emit custom event
            this.element.dispatchEvent(new CustomEvent('theme-changed', {
                detail: { theme: weatherState.getState().preferences.theme }
            }));
            
        } catch (error) {
            console.error('❌ Error toggling theme:', error);
        }
    }
    
    handleUnitToggle() {
        try {
            weatherState.toggleUnits();
            
            // Add visual feedback
            addClass(this.unitToggle, 'btn-pressed');
            setTimeout(() => {
                removeClass(this.unitToggle, 'btn-pressed');
            }, 150);
            
            // Emit custom event
            this.element.dispatchEvent(new CustomEvent('units-changed', {
                detail: { units: weatherState.getState().preferences.units }
            }));
            
        } catch (error) {
            console.error('❌ Error toggling units:', error);
        }
    }
    
    handleSettingsToggle() {
        try {
            const currentState = weatherState.getState().ui.showSettings;
            weatherState.updateState('ui.showSettings', !currentState);
            
            // Add visual feedback
            addClass(this.settingsButton, 'btn-pressed');
            setTimeout(() => {
                removeClass(this.settingsButton, 'btn-pressed');
            }, 150);
            
            // Emit custom event
            this.element.dispatchEvent(new CustomEvent('settings-toggled', {
                detail: { showSettings: !currentState }
            }));
            
        } catch (error) {
            console.error('❌ Error toggling settings:', error);
        }
    }
    
    updateThemeToggle(theme) {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        if (!icon) return;
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            this.themeToggle.title = 'Switch to light theme';
            this.themeToggle.setAttribute('aria-label', 'Switch to light theme');
        } else {
            icon.className = 'fas fa-moon';
            this.themeToggle.title = 'Switch to dark theme';
            this.themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
    }
    
    updateUnitToggle(units) {
        if (!this.unitToggle) return;
        
        const text = this.unitToggle.querySelector('span');
        if (!text) return;
        
        if (units === 'metric') {
            text.textContent = '°C';
            this.unitToggle.title = 'Switch to Fahrenheit';
            this.unitToggle.setAttribute('aria-label', 'Switch to Fahrenheit');
        } else {
            text.textContent = '°F';
            this.unitToggle.title = 'Switch to Celsius';
            this.unitToggle.setAttribute('aria-label', 'Switch to Celsius');
        }
    }
    
    updateSettingsButton(showSettings) {
        if (!this.settingsButton) return;
        
        if (showSettings) {
            addClass(this.settingsButton, 'active');
        } else {
            removeClass(this.settingsButton, 'active');
        }
    }
    
    /**
     * Add custom content to header
     */
    addContent(content, position = 'right') {
        if (!content) return;
        
        const targetSection = position === 'left' 
            ? this.element.querySelector('.header-left')
            : this.element.querySelector('.header-right');
            
        if (targetSection) {
            targetSection.appendChild(content);
        }
    }
    
    /**
     * Set header title
     */
    setTitle(title) {
        const logoText = this.element.querySelector('.logo-text');
        if (logoText) {
            logoText.textContent = title;
        }
    }
    
    /**
     * Show/hide header
     */
    setVisible(visible) {
        if (visible) {
            removeClass(this.element, 'hidden');
        } else {
            addClass(this.element, 'hidden');
        }
    }
    
    /**
     * Add loading state to header
     */
    setLoading(loading) {
        if (loading) {
            addClass(this.element, 'loading');
        } else {
            removeClass(this.element, 'loading');
        }
    }
    
    /**
     * Update header with connection status
     */
    updateConnectionStatus(isOnline) {
        if (isOnline) {
            removeClass(this.element, 'offline');
            addClass(this.element, 'online');
        } else {
            removeClass(this.element, 'online');
            addClass(this.element, 'offline');
        }
    }
    
    /**
     * Get header element
     */
    getElement() {
        return this.element;
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
        this.themeToggle = null;
        this.unitToggle = null;
        this.settingsButton = null;
        
        console.log('🧹 Header component destroyed');
    }
}