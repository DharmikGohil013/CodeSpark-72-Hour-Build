/**
 * Units Conversion Utility Module
 * 
 * This module provides conversion functions between different unit systems
 * (metric/imperial) for weather data and measurements.
 */

/**
 * Temperature conversions
 */
export const temperature = {
    /**
     * Convert Celsius to Fahrenheit
     */
    celsiusToFahrenheit(celsius) {
        if (celsius === null || celsius === undefined || isNaN(celsius)) {
            return null;
        }
        return (celsius * 9/5) + 32;
    },
    
    /**
     * Convert Fahrenheit to Celsius
     */
    fahrenheitToCelsius(fahrenheit) {
        if (fahrenheit === null || fahrenheit === undefined || isNaN(fahrenheit)) {
            return null;
        }
        return (fahrenheit - 32) * 5/9;
    },
    
    /**
     * Convert temperature based on target unit
     */
    convert(temp, fromUnit, toUnit) {
        if (temp === null || temp === undefined || isNaN(temp)) {
            return null;
        }
        
        if (fromUnit === toUnit) {
            return temp;
        }
        
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
            return this.celsiusToFahrenheit(temp);
        } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
            return this.fahrenheitToCelsius(temp);
        }
        
        return temp;
    },
    
    /**
     * Get temperature unit symbol
     */
    getSymbol(unit) {
        const symbols = {
            celsius: '°C',
            fahrenheit: '°F',
            metric: '°C',
            imperial: '°F'
        };
        return symbols[unit] || '°C';
    }
};

/**
 * Speed conversions
 */
export const speed = {
    /**
     * Convert km/h to mph
     */
    kmhToMph(kmh) {
        if (kmh === null || kmh === undefined || isNaN(kmh)) {
            return null;
        }
        return kmh * 0.621371;
    },
    
    /**
     * Convert mph to km/h
     */
    mphToKmh(mph) {
        if (mph === null || mph === undefined || isNaN(mph)) {
            return null;
        }
        return mph * 1.609344;
    },
    
    /**
     * Convert m/s to km/h
     */
    msToKmh(ms) {
        if (ms === null || ms === undefined || isNaN(ms)) {
            return null;
        }
        return ms * 3.6;
    },
    
    /**
     * Convert km/h to m/s
     */
    kmhToMs(kmh) {
        if (kmh === null || kmh === undefined || isNaN(kmh)) {
            return null;
        }
        return kmh / 3.6;
    },
    
    /**
     * Convert speed based on target unit
     */
    convert(value, fromUnit, toUnit) {
        if (value === null || value === undefined || isNaN(value)) {
            return null;
        }
        
        if (fromUnit === toUnit) {
            return value;
        }
        
        // Normalize to km/h first
        let kmh = value;
        switch (fromUnit) {
            case 'mph':
                kmh = this.mphToKmh(value);
                break;
            case 'ms':
            case 'm/s':
                kmh = this.msToKmh(value);
                break;
            case 'kmh':
            case 'km/h':
                kmh = value;
                break;
        }
        
        // Convert from km/h to target unit
        switch (toUnit) {
            case 'mph':
                return this.kmhToMph(kmh);
            case 'ms':
            case 'm/s':
                return this.kmhToMs(kmh);
            case 'kmh':
            case 'km/h':
            default:
                return kmh;
        }
    },
    
    /**
     * Get speed unit symbol
     */
    getSymbol(unit) {
        const symbols = {
            kmh: 'km/h',
            'km/h': 'km/h',
            mph: 'mph',
            ms: 'm/s',
            'm/s': 'm/s',
            metric: 'km/h',
            imperial: 'mph'
        };
        return symbols[unit] || 'km/h';
    }
};

/**
 * Distance conversions
 */
export const distance = {
    /**
     * Convert kilometers to miles
     */
    kmToMiles(km) {
        if (km === null || km === undefined || isNaN(km)) {
            return null;
        }
        return km * 0.621371;
    },
    
    /**
     * Convert miles to kilometers
     */
    milesToKm(miles) {
        if (miles === null || miles === undefined || isNaN(miles)) {
            return null;
        }
        return miles * 1.609344;
    },
    
    /**
     * Convert meters to feet
     */
    metersToFeet(meters) {
        if (meters === null || meters === undefined || isNaN(meters)) {
            return null;
        }
        return meters * 3.28084;
    },
    
    /**
     * Convert feet to meters
     */
    feetToMeters(feet) {
        if (feet === null || feet === undefined || isNaN(feet)) {
            return null;
        }
        return feet * 0.3048;
    },
    
    /**
     * Convert distance based on target unit
     */
    convert(value, fromUnit, toUnit) {
        if (value === null || value === undefined || isNaN(value)) {
            return null;
        }
        
        if (fromUnit === toUnit) {
            return value;
        }
        
        // Handle different unit combinations
        if (fromUnit === 'km' && toUnit === 'miles') {
            return this.kmToMiles(value);
        } else if (fromUnit === 'miles' && toUnit === 'km') {
            return this.milesToKm(value);
        } else if (fromUnit === 'meters' && toUnit === 'feet') {
            return this.metersToFeet(value);
        } else if (fromUnit === 'feet' && toUnit === 'meters') {
            return this.feetToMeters(value);
        }
        
        return value;
    },
    
    /**
     * Get distance unit symbol
     */
    getSymbol(unit) {
        const symbols = {
            km: 'km',
            kilometers: 'km',
            miles: 'mi',
            mi: 'mi',
            meters: 'm',
            m: 'm',
            feet: 'ft',
            ft: 'ft',
            metric: 'km',
            imperial: 'mi'
        };
        return symbols[unit] || 'km';
    }
};

/**
 * Pressure conversions
 */
export const pressure = {
    /**
     * Convert hPa/mbar to inHg
     */
    hpaToInhg(hpa) {
        if (hpa === null || hpa === undefined || isNaN(hpa)) {
            return null;
        }
        return hpa * 0.02953;
    },
    
    /**
     * Convert inHg to hPa/mbar
     */
    inhgToHpa(inhg) {
        if (inhg === null || inhg === undefined || isNaN(inhg)) {
            return null;
        }
        return inhg * 33.8639;
    },
    
    /**
     * Convert hPa to mmHg
     */
    hpaToMmhg(hpa) {
        if (hpa === null || hpa === undefined || isNaN(hpa)) {
            return null;
        }
        return hpa * 0.750062;
    },
    
    /**
     * Convert mmHg to hPa
     */
    mmhgToHpa(mmhg) {
        if (mmhg === null || mmhg === undefined || isNaN(mmhg)) {
            return null;
        }
        return mmhg * 1.33322;
    },
    
    /**
     * Convert pressure based on target unit
     */
    convert(value, fromUnit, toUnit) {
        if (value === null || value === undefined || isNaN(value)) {
            return null;
        }
        
        if (fromUnit === toUnit) {
            return value;
        }
        
        // Normalize to hPa first
        let hpa = value;
        switch (fromUnit) {
            case 'inhg':
            case 'inHg':
                hpa = this.inhgToHpa(value);
                break;
            case 'mmhg':
            case 'mmHg':
                hpa = this.mmhgToHpa(value);
                break;
            case 'hpa':
            case 'hPa':
            case 'mbar':
                hpa = value;
                break;
        }
        
        // Convert from hPa to target unit
        switch (toUnit) {
            case 'inhg':
            case 'inHg':
                return this.hpaToInhg(hpa);
            case 'mmhg':
            case 'mmHg':
                return this.hpaToMmhg(hpa);
            case 'hpa':
            case 'hPa':
            case 'mbar':
            default:
                return hpa;
        }
    },
    
    /**
     * Get pressure unit symbol
     */
    getSymbol(unit) {
        const symbols = {
            hpa: 'hPa',
            hPa: 'hPa',
            mbar: 'mbar',
            inhg: 'inHg',
            inHg: 'inHg',
            mmhg: 'mmHg',
            mmHg: 'mmHg',
            metric: 'hPa',
            imperial: 'inHg'
        };
        return symbols[unit] || 'hPa';
    }
};

/**
 * Precipitation conversions
 */
export const precipitation = {
    /**
     * Convert millimeters to inches
     */
    mmToInches(mm) {
        if (mm === null || mm === undefined || isNaN(mm)) {
            return null;
        }
        return mm * 0.0393701;
    },
    
    /**
     * Convert inches to millimeters
     */
    inchesToMm(inches) {
        if (inches === null || inches === undefined || isNaN(inches)) {
            return null;
        }
        return inches * 25.4;
    },
    
    /**
     * Convert precipitation based on target unit
     */
    convert(value, fromUnit, toUnit) {
        if (value === null || value === undefined || isNaN(value)) {
            return null;
        }
        
        if (fromUnit === toUnit) {
            return value;
        }
        
        if (fromUnit === 'mm' && toUnit === 'inches') {
            return this.mmToInches(value);
        } else if (fromUnit === 'inches' && toUnit === 'mm') {
            return this.inchesToMm(value);
        }
        
        return value;
    },
    
    /**
     * Get precipitation unit symbol
     */
    getSymbol(unit) {
        const symbols = {
            mm: 'mm',
            millimeters: 'mm',
            inches: 'in',
            in: 'in',
            metric: 'mm',
            imperial: 'in'
        };
        return symbols[unit] || 'mm';
    }
};

/**
 * Convert all weather data units
 */
export function convertWeatherData(data, targetUnit) {
    if (!data || !targetUnit) {
        return data;
    }
    
    const converted = { ...data };
    
    // Convert current weather
    if (converted.current) {
        const current = { ...converted.current };
        
        if (targetUnit === 'imperial') {
            current.temperature = temperature.celsiusToFahrenheit(current.temperature);
            current.feelsLike = temperature.celsiusToFahrenheit(current.feelsLike);
            current.windSpeed = speed.kmhToMph(current.windSpeed);
            current.visibility = distance.kmToMiles(current.visibility);
            current.pressure = pressure.hpaToInhg(current.pressure);
        }
        
        converted.current = current;
    }
    
    // Convert hourly forecast
    if (converted.hourly && Array.isArray(converted.hourly)) {
        converted.hourly = converted.hourly.map(hour => {
            const convertedHour = { ...hour };
            
            if (targetUnit === 'imperial') {
                convertedHour.temperature = temperature.celsiusToFahrenheit(convertedHour.temperature);
                convertedHour.feelsLike = temperature.celsiusToFahrenheit(convertedHour.feelsLike);
                convertedHour.windSpeed = speed.kmhToMph(convertedHour.windSpeed);
                convertedHour.visibility = distance.kmToMiles(convertedHour.visibility);
                convertedHour.pressure = pressure.hpaToInhg(convertedHour.pressure);
                convertedHour.precip = precipitation.mmToInches(convertedHour.precip);
            }
            
            return convertedHour;
        });
    }
    
    // Convert daily forecast
    if (converted.daily && Array.isArray(converted.daily)) {
        converted.daily = converted.daily.map(day => {
            const convertedDay = { ...day };
            
            if (convertedDay.day && targetUnit === 'imperial') {
                convertedDay.day.maxTemp = temperature.celsiusToFahrenheit(convertedDay.day.maxTemp);
                convertedDay.day.minTemp = temperature.celsiusToFahrenheit(convertedDay.day.minTemp);
                convertedDay.day.avgTemp = temperature.celsiusToFahrenheit(convertedDay.day.avgTemp);
                convertedDay.day.maxWindSpeed = speed.kmhToMph(convertedDay.day.maxWindSpeed);
                convertedDay.day.avgVisibility = distance.kmToMiles(convertedDay.day.avgVisibility);
                convertedDay.day.totalPrecip = precipitation.mmToInches(convertedDay.day.totalPrecip);
            }
            
            return convertedDay;
        });
    }
    
    return converted;
}

/**
 * Get appropriate units for display based on unit system
 */
export function getDisplayUnits(unitSystem = 'metric') {
    const units = {
        metric: {
            temperature: '°C',
            speed: 'km/h',
            distance: 'km',
            pressure: 'hPa',
            precipitation: 'mm',
            visibility: 'km'
        },
        imperial: {
            temperature: '°F',
            speed: 'mph',
            distance: 'mi',
            pressure: 'inHg',
            precipitation: 'in',
            visibility: 'mi'
        }
    };
    
    return units[unitSystem] || units.metric;
}

/**
 * Validate unit system
 */
export function isValidUnitSystem(unit) {
    return ['metric', 'imperial'].includes(unit);
}

/**
 * Get default unit system based on locale
 */
export function getDefaultUnitSystem() {
    const locale = navigator.language || 'en-US';
    const country = locale.split('-')[1];
    
    // Countries that primarily use imperial system
    const imperialCountries = ['US', 'LR', 'MM'];
    
    return imperialCountries.includes(country) ? 'imperial' : 'metric';
}

/**
 * Format value with appropriate unit
 */
export function formatWithUnit(value, type, unitSystem = 'metric', precision = 0) {
    if (value === null || value === undefined || isNaN(value)) {
        return '--';
    }
    
    const units = getDisplayUnits(unitSystem);
    const formattedValue = precision > 0 ? value.toFixed(precision) : Math.round(value);
    
    return `${formattedValue} ${units[type] || ''}`;
}

/**
 * Convert and format value in one step
 */
export function convertAndFormat(value, type, fromUnit, toUnit, precision = 0) {
    if (value === null || value === undefined || isNaN(value)) {
        return '--';
    }
    
    let convertedValue = value;
    
    switch (type) {
        case 'temperature':
            convertedValue = temperature.convert(value, fromUnit, toUnit);
            break;
        case 'speed':
            convertedValue = speed.convert(value, fromUnit, toUnit);
            break;
        case 'distance':
            convertedValue = distance.convert(value, fromUnit, toUnit);
            break;
        case 'pressure':
            convertedValue = pressure.convert(value, fromUnit, toUnit);
            break;
        case 'precipitation':
            convertedValue = precipitation.convert(value, fromUnit, toUnit);
            break;
        default:
            convertedValue = value;
    }
    
    if (convertedValue === null) {
        return '--';
    }
    
    const formattedValue = precision > 0 ? convertedValue.toFixed(precision) : Math.round(convertedValue);
    const unitSymbol = getDisplayUnits(toUnit === 'imperial' ? 'imperial' : 'metric')[type] || '';
    
    return `${formattedValue} ${unitSymbol}`;
}