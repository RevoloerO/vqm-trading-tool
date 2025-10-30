/**
 * localStorage Helper Functions for MTF Checklist
 * Handles persistent storage with automatic expiration
 * UPDATED: Now stores trading style preference separately
 */

const STORAGE_KEY = 'mtf_checklist_state';
const STYLE_KEY = 'mtf_checklist_style';
const EXPIRATION_HOURS = 24;

/**
 * Save checklist state to localStorage with timestamp
 * @param {Object} state - Checklist state to save
 * @returns {boolean} True if save successful, false otherwise
 */
export function saveChecklistState(state) {
    try {
        const dataToStore = {
            state,
            timestamp: new Date().getTime(),
            version: '1.0' // For future migrations
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        return true;
    } catch (error) {
        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
            // Try to clear old data and retry
            try {
                clearChecklistState();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
                return true;
            } catch (retryError) {
                // If still fails, notify user
                if (typeof window !== 'undefined' && window.alert) {
                    alert('Storage quota exceeded. Unable to save checklist. Please clear browser data or export your work.');
                }
                return false;
            }
        }

        // Log other errors but don't break the app
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to save checklist state:', error);
        }
        return false;
    }
}

/**
 * Validate loaded state structure to prevent corrupted data from breaking the app
 * @param {any} state - State to validate
 * @returns {boolean} True if state is valid
 */
function validateStateStructure(state) {
    if (!state || typeof state !== 'object') return false;

    // Check required properties exist
    if (!state.tradingStyle || !state.currentStep) return false;

    // Check timeframe objects exist
    if (!state.higherTF || !state.midTF || !state.lowerTF) return false;

    return true;
}

/**
 * Load checklist state from localStorage
 * Returns null if no valid state exists or if expired
 * @returns {Object|null} Saved state or null
 */
export function loadChecklistState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);

        // Validate data structure
        if (!data || typeof data !== 'object' || !data.state || !data.timestamp) {
            clearChecklistState();
            return null;
        }

        const currentTime = new Date().getTime();
        const expirationTime = EXPIRATION_HOURS * 60 * 60 * 1000; // Convert to milliseconds

        // Check if data has expired
        if (currentTime - data.timestamp > expirationTime) {
            clearChecklistState();
            return null;
        }

        // Validate state structure before returning
        if (!validateStateStructure(data.state)) {
            clearChecklistState();
            return null;
        }

        return data.state;
    } catch (error) {
        // Corrupted data - clear it and start fresh
        clearChecklistState();

        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load checklist state:', error);
        }
        return null;
    }
}

/**
 * Clear checklist state from localStorage
 */
export function clearChecklistState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear checklist state:', error);
    }
}

/**
 * Check if saved state exists and is valid
 * @returns {boolean} True if valid saved state exists
 */
export function hasSavedState() {
    const state = loadChecklistState();
    return state !== null;
}

/**
 * Get timestamp of last saved state
 * @returns {Date|null} Date of last save or null
 */
export function getLastSaveTime() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        return new Date(data.timestamp);
    } catch (error) {
        console.error('Failed to get last save time:', error);
        return null;
    }
}

/**
 * Get time remaining until expiration (in hours)
 * @returns {number|null} Hours remaining or null if no saved state
 */
export function getTimeUntilExpiration() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        const currentTime = new Date().getTime();
        const expirationTime = EXPIRATION_HOURS * 60 * 60 * 1000;
        const elapsed = currentTime - data.timestamp;
        const remaining = expirationTime - elapsed;

        if (remaining <= 0) return 0;

        return Math.ceil(remaining / (60 * 60 * 1000)); // Convert back to hours
    } catch (error) {
        console.error('Failed to calculate expiration time:', error);
        return null;
    }
}

/**
 * Save trading style preference
 * @param {string} styleId - Trading style ID: 'day' | 'swing' | 'position'
 * @param {Object} config - Timeframe configuration
 */
export function saveTradingStyle(styleId, config) {
    try {
        const styleData = {
            style: styleId,
            config: config,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(STYLE_KEY, JSON.stringify(styleData));
    } catch (error) {
        console.error('Failed to save trading style:', error);
    }
}

/**
 * Load trading style preference
 * @returns {Object|null} Style data: { style, config, timestamp } or null
 */
export function loadTradingStyle() {
    try {
        const stored = localStorage.getItem(STYLE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        return data;
    } catch (error) {
        console.error('Failed to load trading style:', error);
        return null;
    }
}

/**
 * Clear trading style preference
 */
export function clearTradingStyle() {
    try {
        localStorage.removeItem(STYLE_KEY);
    } catch (error) {
        console.error('Failed to clear trading style:', error);
    }
}

/**
 * Export checklist data as JSON string for download
 * UPDATED: Now includes trading style and timeframe configuration
 * @param {Object} state - Complete checklist state
 * @param {Object} finalDecision - Final decision data
 * @returns {string} JSON string
 */
export function exportTradeData(state, finalDecision) {
    const exportData = {
        exportDate: new Date().toISOString(),
        tradingStyle: state.tradingStyle || 'swing',
        timeframes: state.timeframeConfig || {
            higher: 'weekly',
            mid: 'daily',
            lower: '4hour'
        },
        riskPercent: finalDecision?.recommendation?.recommendedRisk || 2,
        holdTimeExpected: finalDecision?.expectedHoldTime || '2-10 days',
        higherTFChecks: state.higherTF || state.weekly,
        midTFChecks: state.midTF || state.daily,
        lowerTFChecks: state.lowerTF || state.fourHour,
        positionSize: state.positionSizeRecommendation,
        finalDecision: finalDecision,
        version: '2.0' // Updated version
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger download of trade data as JSON file
 * @param {Object} state - Complete checklist state
 * @param {Object} finalDecision - Final decision data
 */
export function downloadTradeData(state, finalDecision) {
    try {
        const jsonString = exportTradeData(state, finalDecision);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `trade-checklist-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download trade data:', error);
    }
}
