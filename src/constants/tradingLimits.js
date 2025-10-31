/**
 * Trading Limits and Constants
 * Centralized configuration for validation limits across the application
 */

export const TRADING_LIMITS = {
    // Price limits
    MAX_PRICE: 1000000,              // Maximum price per share ($1M)
    MIN_PRICE: 0.01,                 // Minimum price per share ($0.01)

    // Account size limits
    MAX_ACCOUNT_SIZE: 100000000,     // Maximum account size ($100M)
    MIN_ACCOUNT_SIZE: 100,           // Minimum account size ($100)

    // Risk management
    MAX_RISK_PERCENT: 100,           // Maximum risk percentage (100%)
    MIN_RISK_PERCENT: 0.1,           // Minimum risk percentage (0.1%)
    RECOMMENDED_MAX_RISK: 10,        // Recommended maximum risk (10%)
    DEFAULT_RISK_SWING: 2,           // Default risk for swing trading (2%)
    DEFAULT_RISK_DAY: 1,             // Default risk for day trading (1%)
    DEFAULT_RISK_POSITION: 3,        // Default risk for position trading (3%)

    // Gap percentage for checklist
    MIN_GAP_PERCENT: 0.1,            // Minimum gap percentage (0.1%)
    MAX_GAP_PERCENT: 50,             // Maximum gap percentage (50%)

    // Decimal places for display
    PRICE_DECIMALS: 2,
    PERCENT_DECIMALS: 2,
    SHARES_DECIMALS: 0
};

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    MUST_BE_NUMBER: 'Must be a valid number',
    MUST_BE_POSITIVE: 'Must be greater than zero',
    MUST_BE_FINITE: 'Must be a finite number',
    PRICE_TOO_HIGH: `Cannot exceed $${TRADING_LIMITS.MAX_PRICE.toLocaleString()}`,
    PRICE_TOO_LOW: `Must be at least $${TRADING_LIMITS.MIN_PRICE}`,
    ACCOUNT_TOO_HIGH: `Cannot exceed $${TRADING_LIMITS.MAX_ACCOUNT_SIZE.toLocaleString()}`,
    ACCOUNT_TOO_LOW: `Must be at least $${TRADING_LIMITS.MIN_ACCOUNT_SIZE}`,
    RISK_TOO_HIGH: `Cannot exceed ${TRADING_LIMITS.MAX_RISK_PERCENT}%`,
    RISK_TOO_LOW: `Must be at least ${TRADING_LIMITS.MIN_RISK_PERCENT}%`,
    RISK_ABOVE_RECOMMENDED: `Risk above ${TRADING_LIMITS.RECOMMENDED_MAX_RISK}% is not recommended`,
    GAP_TOO_HIGH: `Gap percentage cannot exceed ${TRADING_LIMITS.MAX_GAP_PERCENT}%`,
    GAP_TOO_LOW: `Gap percentage must be at least ${TRADING_LIMITS.MIN_GAP_PERCENT}%`,
    STOP_EQUALS_ENTRY: 'Stop loss cannot equal entry price',
    INVALID_POSITION_SETUP: 'Invalid setup. Long: Stop < Entry < Target. Short: Target < Entry < Stop'
};

/**
 * Helper function to format currency
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = TRADING_LIMITS.PRICE_DECIMALS) {
    return Number(value).toFixed(decimals);
}

/**
 * Helper function to format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = TRADING_LIMITS.PERCENT_DECIMALS) {
    return Number(value).toFixed(decimals);
}

/**
 * Helper function to format shares
 * @param {number} value - Value to format
 * @returns {string} Formatted shares string
 */
export function formatShares(value) {
    return Math.floor(Number(value)).toString();
}
