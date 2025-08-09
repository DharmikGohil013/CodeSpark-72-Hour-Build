/**
 * SearchBar Component
 * 
 * This component manages location search functionality with autocomplete,
 * recent searches, and geolocation detection.
 */

import { createElement, addClass, removeClass, fadeIn, fadeOut, $, $$ } from '../utils/dom.js';
import { createDebouncedSearch } from '../utils/debounce.js';
import { formatLocationName } from '../utils/format.js';
import geocodingService from '../services/geocoding.js';
import weatherState from '../store/state.js';

export default class SearchBar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            placeholder: 'Search for a city...',
            showLocationButton: true,
            showRecentSearches: true,
            maxSuggestions: 8,
            debounceMs: 300,
            ...options
        };
        
        this.element = null;
        this.input = null;
        this.locationButton = null;
        this.suggestionsContainer = null;
        this.clearButton = null;
        
        this.isSearching = false;
        this.suggestions = [];
        this.activeSuggestionIndex = -1;
        
        // Create debounced search function
        this.debouncedSearch = createDebouncedSearch(
            this.performSearch.bind(this),
            this.options.debounceMs
        );
        
        this.init();
        this.bindEvents();
        this.subscribeToState();
        
        console.log('🔍 SearchBar component initialized');
    }
    
    init() {
        this.element = this.createSearchBar();
        if (this.container) {
            this.container.appendChild(this.element);
        }
    }
    
    createSearchBar() {
        const searchContainer = createElement('div', {
            className: 'search-container relative',
            role: 'search'
        });
        
        // Search input wrapper
        const inputWrapper = createElement('div', {
            className: 'search-input-wrapper glass-card flex items-center gap-2 p-3'
        });
        
        // Search icon
        const searchIcon = createElement('i', {
            className: 'fas fa-search text-text-muted',
            'aria-hidden': 'true'
        });
        
        // Search input
        this.input = createElement('input', {
            type: 'text',
            className: 'search-input flex-1 bg-transparent outline-none text-text-primary',
            placeholder: this.options.placeholder,
            autocomplete: 'off',
            spellcheck: 'false',
            'aria-label': 'Search for location',
            'aria-describedby': 'search-instructions',
            'aria-expanded': 'false',
            'aria-owns': 'search-suggestions'
        });
        
        // Clear button
        this.clearButton = createElement('button', {
            type: 'button',
            className: 'clear-button btn-icon opacity-0 transition-opacity duration-200',
            'aria-label': 'Clear search',
            title: 'Clear search'
        });
        
        const clearIcon = createElement('i', {
            className: 'fas fa-times text-sm',
            'aria-hidden': 'true'
        });
        this.clearButton.appendChild(clearIcon);
        
        // Location button
        if (this.options.showLocationButton) {
            this.locationButton = createElement('button', {
                type: 'button',
                className: 'location-button btn-icon',
                'aria-label': 'Use my current location',
                title: 'Use my current location'
            });
            
            const locationIcon = createElement('i', {
                className: 'fas fa-location-arrow',
                'aria-hidden': 'true'
            });
            this.locationButton.appendChild(locationIcon);
        }
        
        // Assemble input wrapper
        inputWrapper.appendChild(searchIcon);
        inputWrapper.appendChild(this.input);
        inputWrapper.appendChild(this.clearButton);
        if (this.locationButton) {
            inputWrapper.appendChild(this.locationButton);
        }
        
        // Search instructions (for screen readers)
        const instructions = createElement('div', {
            id: 'search-instructions',
            className: 'sr-only',
            textContent: 'Type to search for a city or location. Use arrow keys to navigate suggestions.'
        });
        
        // Suggestions container
        this.suggestionsContainer = createElement('div', {
            id: 'search-suggestions',
            className: 'search-suggestions absolute top-full left-0 right-0 z-50 hidden',
            role: 'listbox',
            'aria-label': 'Location suggestions'
        });
        
        // Assemble search container
        searchContainer.appendChild(instructions);
        searchContainer.appendChild(inputWrapper);
        searchContainer.appendChild(this.suggestionsContainer);
        
        return searchContainer;
    }
    
    bindEvents() {
        // Input events
        this.input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });
        
        this.input.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.input.addEventListener('focus', () => {
            this.handleFocus();
        });
        
        this.input.addEventListener('blur', (e) => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => this.handleBlur(e), 150);
        });
        
        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Location button
        if (this.locationButton) {
            this.locationButton.addEventListener('click', () => {
                this.handleLocationRequest();
            });
        }
        
        // Suggestions container
        this.suggestionsContainer.addEventListener('click', (e) => {
            this.handleSuggestionClick(e);
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }
    
    subscribeToState() {
        // Listen for search state changes
        weatherState.subscribe('ui.isSearching', (isSearching) => {
            this.updateSearchingState(isSearching);
        });
        
        // Listen for location detection state
        weatherState.subscribe('location.isDetecting', (isDetecting) => {
            this.updateLocationButton(isDetecting);
        });
    }
    
    async handleInput(value) {
        const trimmedValue = value.trim();
        
        // Update clear button visibility
        if (trimmedValue) {
            addClass(this.clearButton, 'opacity-100');
            removeClass(this.clearButton, 'opacity-0');
        } else {
            addClass(this.clearButton, 'opacity-0');
            removeClass(this.clearButton, 'opacity-100');
        }
        
        // Update search query in state
        weatherState.updateState('ui.searchQuery', trimmedValue);
        
        // Perform debounced search
        if (trimmedValue.length >= 2) {
            this.debouncedSearch(trimmedValue);
        } else {
            this.clearSuggestions();
            if (this.options.showRecentSearches) {
                this.showRecentSearches();
            }
        }
    }
    
    async performSearch(query) {
        if (!query || query.length < 2) return;
        
        try {
            this.isSearching = true;
            weatherState.updateState('ui.isSearching', true);
            
            const suggestions = await geocodingService.getLocationSuggestions(query);
            
            this.suggestions = suggestions;
            this.activeSuggestionIndex = -1;
            
            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
            } else {
                this.showNoResults();
            }
            
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('Unable to search for locations. Please try again.');
        } finally {
            this.isSearching = false;
            weatherState.updateState('ui.isSearching', false);
        }
    }
    
    handleKeyDown(e) {
        const { key } = e;
        
        switch (key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions(1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions(-1);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.activeSuggestionIndex >= 0) {
                    this.selectSuggestion(this.activeSuggestionIndex);
                } else if (this.input.value.trim()) {
                    this.handleDirectSearch(this.input.value.trim());
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                this.input.blur();
                break;
                
            case 'Tab':
                if (this.activeSuggestionIndex >= 0) {
                    e.preventDefault();
                    this.selectSuggestion(this.activeSuggestionIndex);
                }
                break;
        }
    }
    
    handleFocus() {
        if (this.input.value.trim()) {
            this.debouncedSearch(this.input.value.trim());
        } else if (this.options.showRecentSearches) {
            this.showRecentSearches();
        }
    }
    
    handleBlur(e) {
        // Only hide if not clicking on suggestions
        if (!this.suggestionsContainer.contains(e.relatedTarget)) {
            this.hideSuggestions();
        }
    }
    
    navigateSuggestions(direction) {
        if (!this.suggestions.length) return;
        
        const previousIndex = this.activeSuggestionIndex;
        
        if (direction > 0) {
            this.activeSuggestionIndex = Math.min(
                this.activeSuggestionIndex + 1,
                this.suggestions.length - 1
            );
        } else {
            this.activeSuggestionIndex = Math.max(
                this.activeSuggestionIndex - 1,
                -1
            );
        }
        
        this.updateSuggestionHighlight(previousIndex, this.activeSuggestionIndex);
        this.updateInputValue();
    }
    
    updateSuggestionHighlight(previousIndex, currentIndex) {
        const suggestions = $$('.suggestion-item', this.suggestionsContainer);
        
        // Remove previous highlight
        if (previousIndex >= 0 && suggestions[previousIndex]) {
            removeClass(suggestions[previousIndex], 'active');
            suggestions[previousIndex].setAttribute('aria-selected', 'false');
        }
        
        // Add new highlight
        if (currentIndex >= 0 && suggestions[currentIndex]) {
            addClass(suggestions[currentIndex], 'active');
            suggestions[currentIndex].setAttribute('aria-selected', 'true');
            suggestions[currentIndex].scrollIntoView({ block: 'nearest' });
        }
        
        // Update input aria attributes
        if (currentIndex >= 0) {
            this.input.setAttribute('aria-activedescendant', `suggestion-${currentIndex}`);
        } else {
            this.input.removeAttribute('aria-activedescendant');
        }
    }
    
    updateInputValue() {
        if (this.activeSuggestionIndex >= 0) {
            const suggestion = this.suggestions[this.activeSuggestionIndex];
            if (suggestion) {
                this.input.value = suggestion.displayName || suggestion.name;
            }
        }
    }
    
    selectSuggestion(index) {
        const suggestion = this.suggestions[index];
        if (!suggestion) return;
        
        this.input.value = suggestion.displayName || suggestion.name;
        this.hideSuggestions();
        
        // Add to recent searches
        weatherState.addRecentLocation(suggestion);
        
        // Emit selection event
        this.element.dispatchEvent(new CustomEvent('location-selected', {
            detail: suggestion
        }));
        
        console.log('📍 Location selected:', suggestion);
    }
    
    handleSuggestionClick(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (!suggestionItem) return;
        
        const index = Array.from(suggestionItem.parentNode.children).indexOf(suggestionItem);
        this.selectSuggestion(index);
    }
    
    async handleLocationRequest() {
        try {
            addClass(this.locationButton, 'loading');
            weatherState.updateState('location.isDetecting', true);
            
            const location = await geocodingService.getCurrentLocation();
            
            this.input.value = formatLocationName(location, 'medium');
            this.hideSuggestions();
            
            // Add to recent searches
            weatherState.addRecentLocation(location);
            
            // Emit location event
            this.element.dispatchEvent(new CustomEvent('location-detected', {
                detail: location
            }));
            
            console.log('📍 Current location detected:', location);
            
        } catch (error) {
            console.error('❌ Location detection error:', error);
            this.showError('Unable to detect your location. Please check permissions.');
        } finally {
            removeClass(this.locationButton, 'loading');
            weatherState.updateState('location.isDetecting', false);
        }
    }
    
    async handleDirectSearch(query) {
        // Search for exact location
        try {
            const suggestions = await geocodingService.searchLocations(query);
            if (suggestions.length > 0) {
                this.selectSuggestion(0);
            } else {
                this.showError(`No results found for "${query}"`);
            }
        } catch (error) {
            console.error('❌ Direct search error:', error);
            this.showError('Unable to search for location. Please try again.');
        }
    }
    
    showSuggestions(suggestions) {
        this.clearSuggestions();
        
        const suggestionsList = createElement('div', {
            className: 'suggestions-list glass-card',
            role: 'group'
        });
        
        suggestions.forEach((suggestion, index) => {
            const item = this.createSuggestionItem(suggestion, index);
            suggestionsList.appendChild(item);
        });
        
        this.suggestionsContainer.appendChild(suggestionsList);
        removeClass(this.suggestionsContainer, 'hidden');
        
        this.input.setAttribute('aria-expanded', 'true');
        
        console.log(`🔍 Showing ${suggestions.length} suggestions`);
    }
    
    showRecentSearches() {
        const recentLocations = weatherState.getState().location.recent;
        if (!recentLocations.length) return;
        
        this.clearSuggestions();
        
        const suggestionsList = createElement('div', {
            className: 'suggestions-list glass-card',
            role: 'group'
        });
        
        // Recent searches header
        const header = createElement('div', {
            className: 'suggestions-header p-2 border-b border-glass-border',
            textContent: 'Recent Searches'
        });
        suggestionsList.appendChild(header);
        
        recentLocations.slice(0, 5).forEach((location, index) => {
            const item = this.createSuggestionItem(location, index, true);
            suggestionsList.appendChild(item);
        });
        
        this.suggestionsContainer.appendChild(suggestionsList);
        removeClass(this.suggestionsContainer, 'hidden');
        
        this.input.setAttribute('aria-expanded', 'true');
    }
    
    createSuggestionItem(suggestion, index, isRecent = false) {
        const item = createElement('div', {
            className: 'suggestion-item flex items-center gap-3 p-3 cursor-pointer hover:bg-glass-bg transition-colors',
            id: `suggestion-${index}`,
            role: 'option',
            'aria-selected': 'false',
            tabIndex: -1
        });
        
        // Icon
        const icon = createElement('i', {
            className: isRecent ? 'fas fa-history text-text-muted' : 'fas fa-map-marker-alt text-text-muted',
            'aria-hidden': 'true'
        });
        
        // Location info
        const info = createElement('div', {
            className: 'suggestion-info flex-1'
        });
        
        const name = createElement('div', {
            className: 'suggestion-name font-medium text-text-primary',
            textContent: suggestion.name
        });
        
        const details = createElement('div', {
            className: 'suggestion-details text-sm text-text-muted',
            textContent: `${suggestion.region || ''} ${suggestion.country || ''}`.trim()
        });
        
        info.appendChild(name);
        if (details.textContent) {
            info.appendChild(details);
        }
        
        item.appendChild(icon);
        item.appendChild(info);
        
        return item;
    }
    
    showNoResults() {
        this.clearSuggestions();
        
        const noResults = createElement('div', {
            className: 'no-results glass-card p-4 text-center text-text-muted',
            textContent: 'No locations found'
        });
        
        this.suggestionsContainer.appendChild(noResults);
        removeClass(this.suggestionsContainer, 'hidden');
        
        this.input.setAttribute('aria-expanded', 'true');
    }
    
    showError(message) {
        this.clearSuggestions();
        
        const error = createElement('div', {
            className: 'search-error glass-card p-4 text-center text-red-400',
            textContent: message
        });
        
        this.suggestionsContainer.appendChild(error);
        removeClass(this.suggestionsContainer, 'hidden');
        
        this.input.setAttribute('aria-expanded', 'true');
    }
    
    clearSuggestions() {
        this.suggestionsContainer.innerHTML = '';
        this.suggestions = [];
        this.activeSuggestionIndex = -1;
    }
    
    hideSuggestions() {
        addClass(this.suggestionsContainer, 'hidden');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');
        this.activeSuggestionIndex = -1;
    }
    
    clearSearch() {
        this.input.value = '';
        this.input.focus();
        this.clearSuggestions();
        addClass(this.clearButton, 'opacity-0');
        removeClass(this.clearButton, 'opacity-100');
        weatherState.updateState('ui.searchQuery', '');
        
        if (this.options.showRecentSearches) {
            this.showRecentSearches();
        }
        
        // Emit clear event
        this.element.dispatchEvent(new CustomEvent('search-cleared'));
    }
    
    updateSearchingState(isSearching) {
        const searchIcon = $('.fas', this.element);
        if (!searchIcon) return;
        
        if (isSearching) {
            searchIcon.className = 'fas fa-spinner fa-spin text-text-muted';
        } else {
            searchIcon.className = 'fas fa-search text-text-muted';
        }
    }
    
    updateLocationButton(isDetecting) {
        if (!this.locationButton) return;
        
        const icon = this.locationButton.querySelector('i');
        if (!icon) return;
        
        if (isDetecting) {
            addClass(this.locationButton, 'loading');
            icon.className = 'fas fa-spinner fa-spin';
        } else {
            removeClass(this.locationButton, 'loading');
            icon.className = 'fas fa-location-arrow';
        }
    }
    
    /**
     * Set search value programmatically
     */
    setValue(value) {
        this.input.value = value;
        this.handleInput(value);
    }
    
    /**
     * Get current search value
     */
    getValue() {
        return this.input.value;
    }
    
    /**
     * Focus the search input
     */
    focus() {
        this.input.focus();
    }
    
    /**
     * Enable/disable the search bar
     */
    setEnabled(enabled) {
        this.input.disabled = !enabled;
        if (this.locationButton) {
            this.locationButton.disabled = !enabled;
        }
    }
    
    /**
     * Get search bar element
     */
    getElement() {
        return this.element;
    }
    
    /**
     * Destroy component
     */
    destroy() {
        // Cancel any pending searches
        if (this.debouncedSearch.cancel) {
            this.debouncedSearch.cancel();
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up references
        this.element = null;
        this.input = null;
        this.locationButton = null;
        this.suggestionsContainer = null;
        this.clearButton = null;
        this.suggestions = [];
        
        console.log('🧹 SearchBar component destroyed');
    }
}