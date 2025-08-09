/**
 * Format Utility Module
 * 
 * This module provides formatting functions for weather data, dates, numbers,
 * and other display values used throughout the application.
 */

/**
 * Format temperature with unit
 */
export function formatTemperature(temp, unit = 'metric', showUnit = true) {
    if (temp === null || temp === undefined || isNaN(temp)) {
        return '--';
    }
    
    let temperature = Math.round(temp);
    
    // Convert if needed
    if (unit === 'imperial') {
        temperature = Math.round((temp * 9/5) + 32);
    }
    
    return showUnit ? `${temperature}°${unit === 'imperial' ? 'F' : 'C'}` : temperature;
}

/**
 * Format wind speed with unit
 */
export function formatWindSpeed(speed, unit = 'metric', showUnit = true) {
    if (speed === null || speed === undefined || isNaN(speed)) {
        return '--';
    }
    
    let windSpeed = speed;
    let unitLabel = 'km/h';
    
    if (unit === 'imperial') {
        windSpeed = Math.round(speed * 0.621371); // km/h to mph
        unitLabel = 'mph';
    } else {
        windSpeed = Math.round(speed);
    }
    
    return showUnit ? `${windSpeed} ${unitLabel}` : windSpeed;
}

/**
 * Format pressure with unit
 */
export function formatPressure(pressure, unit = 'metric', showUnit = true) {
    if (pressure === null || pressure === undefined || isNaN(pressure)) {
        return '--';
    }
    
    let pressureValue = pressure;
    let unitLabel = 'hPa';
    
    if (unit === 'imperial') {
        pressureValue = (pressure * 0.02953).toFixed(2); // hPa to inHg
        unitLabel = 'inHg';
    } else {
        pressureValue = Math.round(pressure);
    }
    
    return showUnit ? `${pressureValue} ${unitLabel}` : pressureValue;
}

/**
 * Format visibility with unit
 */
export function formatVisibility(visibility, unit = 'metric', showUnit = true) {
    if (visibility === null || visibility === undefined || isNaN(visibility)) {
        return '--';
    }
    
    let visibilityValue = visibility;
    let unitLabel = 'km';
    
    if (unit === 'imperial') {
        visibilityValue = (visibility * 0.621371).toFixed(1); // km to miles
        unitLabel = 'mi';
    } else {
        visibilityValue = visibility % 1 === 0 ? Math.round(visibility) : visibility.toFixed(1);
    }
    
    return showUnit ? `${visibilityValue} ${unitLabel}` : visibilityValue;
}

/**
 * Format humidity percentage
 */
export function formatHumidity(humidity, showUnit = true) {
    if (humidity === null || humidity === undefined || isNaN(humidity)) {
        return '--';
    }
    
    const humidityValue = Math.round(humidity);
    return showUnit ? `${humidityValue}%` : humidityValue;
}

/**
 * Format UV Index
 */
export function formatUVIndex(uvIndex, showLabel = false) {
    if (uvIndex === null || uvIndex === undefined || isNaN(uvIndex)) {
        return '--';
    }
    
    const uv = Math.round(uvIndex);
    
    if (!showLabel) {
        return uv;
    }
    
    let label = '';
    if (uv <= 2) label = 'Low';
    else if (uv <= 5) label = 'Moderate';
    else if (uv <= 7) label = 'High';
    else if (uv <= 10) label = 'Very High';
    else label = 'Extreme';
    
    return `${uv} (${label})`;
}

/**
 * Format air quality index
 */
export function formatAirQuality(aqi, system = 'us') {
    if (aqi === null || aqi === undefined || isNaN(aqi)) {
        return { value: '--', label: 'N/A', color: '#gray' };
    }
    
    if (system === 'us') {
        // US EPA AQI
        if (aqi <= 50) return { value: aqi, label: 'Good', color: '#00E400' };
        if (aqi <= 100) return { value: aqi, label: 'Moderate', color: '#FFFF00' };
        if (aqi <= 150) return { value: aqi, label: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
        if (aqi <= 200) return { value: aqi, label: 'Unhealthy', color: '#FF0000' };
        if (aqi <= 300) return { value: aqi, label: 'Very Unhealthy', color: '#8F3F97' };
        return { value: aqi, label: 'Hazardous', color: '#7E0023' };
    } else {
        // UK DEFRA AQI (1-10 scale)
        const labels = ['', 'Low', 'Low', 'Low', 'Moderate', 'Moderate', 'Moderate', 'High', 'High', 'High', 'Very High'];
        const colors = ['', '#00E400', '#00E400', '#00E400', '#FFFF00', '#FFFF00', '#FFFF00', '#FF7E00', '#FF7E00', '#FF7E00', '#FF0000'];
        
        const index = Math.min(Math.max(Math.round(aqi), 1), 10);
        return { value: index, label: labels[index], color: colors[index] };
    }
}

/**
 * Format precipitation amount
 */
export function formatPrecipitation(precip, unit = 'metric', showUnit = true) {
    if (precip === null || precip === undefined || isNaN(precip)) {
        return '--';
    }
    
    let precipValue = precip;
    let unitLabel = 'mm';
    
    if (unit === 'imperial') {
        precipValue = (precip * 0.0393701).toFixed(2); // mm to inches
        unitLabel = 'in';
    } else {
        precipValue = precip < 1 ? precip.toFixed(1) : Math.round(precip);
    }
    
    return showUnit ? `${precipValue} ${unitLabel}` : precipValue;
}

/**
 * Format chance of precipitation
 */
export function formatChanceOfRain(chance, showUnit = true) {
    if (chance === null || chance === undefined || isNaN(chance)) {
        return '--';
    }
    
    const chanceValue = Math.round(chance);
    return showUnit ? `${chanceValue}%` : chanceValue;
}

/**
 * Format wind direction
 */
export function formatWindDirection(degrees, showDegrees = false) {
    if (degrees === null || degrees === undefined || isNaN(degrees)) {
        return '--';
    }
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    const direction = directions[index];
    
    return showDegrees ? `${direction} (${Math.round(degrees)}°)` : direction;
}

/**
 * Format date and time
 */
export function formatDate(date, format = 'full') {
    if (!date) return '--';
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '--';
    }
    
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    const isYesterday = dateObj.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    switch (format) {
        case 'time':
            return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
        case 'time-12':
            return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
            
        case 'date':
            return dateObj.toLocaleDateString();
            
        case 'short':
            if (isToday) return 'Today';
            if (isTomorrow) return 'Tomorrow';
            if (isYesterday) return 'Yesterday';
            return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
        case 'medium':
            if (isToday) return `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            if (isTomorrow) return 'Tomorrow';
            return dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            
        case 'weekday':
            if (isToday) return 'Today';
            if (isTomorrow) return 'Tomorrow';
            return dateObj.toLocaleDateString([], { weekday: 'long' });
            
        case 'relative':
            return formatRelativeTime(dateObj);
            
        case 'full':
        default:
            return dateObj.toLocaleString();
    }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date) {
    if (!date) return '--';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '--';
    
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    
    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
    } else if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    } else {
        return rtf.format(diffDays, 'day');
    }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return '--';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format number with thousand separators
 */
export function formatNumber(number, decimals = 0) {
    if (number === null || number === undefined || isNaN(number)) {
        return '--';
    }
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

/**
 * Format coordinates
 */
export function formatCoordinates(lat, lon, precision = 4) {
    if (lat === null || lat === undefined || lon === null || lon === undefined) {
        return '--';
    }
    
    if (isNaN(lat) || isNaN(lon)) {
        return '--';
    }
    
    const latFormatted = Math.abs(lat).toFixed(precision) + '°' + (lat >= 0 ? 'N' : 'S');
    const lonFormatted = Math.abs(lon).toFixed(precision) + '°' + (lon >= 0 ? 'E' : 'W');
    
    return `${latFormatted}, ${lonFormatted}`;
}

/**
 * Format location name
 */
export function formatLocationName(location, format = 'full') {
    if (!location) return '--';
    
    const { name, region, country } = location;
    
    switch (format) {
        case 'short':
            return name || '--';
            
        case 'medium':
            if (name && region && name !== region) {
                return `${name}, ${region}`;
            }
            return name || region || '--';
            
        case 'country':
            return country || '--';
            
        case 'full':
        default:
            if (name && region && country) {
                return region !== country && name !== region 
                    ? `${name}, ${region}, ${country}`
                    : `${name}, ${country}`;
            } else if (name && country) {
                return `${name}, ${country}`;
            } else if (name) {
                return name;
            }
            return '--';
    }
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str) {
    if (!str) return '';
    
    return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substr(0, maxLength - 3) + '...';
}

/**
 * Format duration (milliseconds to human readable)
 */
export function formatDuration(ms) {
    if (!ms || ms < 0) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Format distance
 */
export function formatDistance(km, unit = 'metric', precision = 1) {
    if (km === null || km === undefined || isNaN(km)) {
        return '--';
    }
    
    if (unit === 'imperial') {
        const miles = km * 0.621371;
        return `${miles.toFixed(precision)} mi`;
    }
    
    return `${km.toFixed(precision)} km`;
}

/**
 * Format moon phase
 */
export function formatMoonPhase(phase) {
    if (!phase) return 'Unknown';
    
    const phases = {
        'New Moon': '🌑',
        'Waxing Crescent': '🌒',
        'First Quarter': '🌓',
        'Waxing Gibbous': '🌔',
        'Full Moon': '🌕',
        'Waning Gibbous': '🌖',
        'Last Quarter': '🌗',
        'Waning Crescent': '🌘'
    };
    
    const emoji = phases[phase] || '🌙';
    return `${emoji} ${phase}`;
}

/**
 * Format alert severity
 */
export function formatAlertSeverity(severity) {
    const severityMap = {
        'minor': { label: 'Minor', color: '#FFEB3B', icon: '⚠️' },
        'moderate': { label: 'Moderate', color: '#FF9800', icon: '⚠️' },
        'severe': { label: 'Severe', color: '#F44336', icon: '🚨' },
        'extreme': { label: 'Extreme', color: '#9C27B0', icon: '🚨' }
    };
    
    return severityMap[severity?.toLowerCase()] || { 
        label: 'Unknown', 
        color: '#9E9E9E', 
        icon: 'ℹ️' 
    };
}