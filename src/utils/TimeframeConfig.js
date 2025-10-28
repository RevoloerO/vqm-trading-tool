/**
 * Trading Style and Timeframe Configuration
 * Defines the three trading styles and their associated timeframes
 */

export const TIMEFRAME_CONFIGS = {
    day: {
        id: 'day',
        label: 'Day Trader',
        higher: { name: 'Daily', code: 'daily' },
        mid: { name: '1-Hour', code: '1hour' },
        lower: { name: '15-Minute', code: '15min' },
        holdTime: 'Minutes to Hours',
        tradesPerWeek: '5-20',
        riskPerTrade: 1, // 1% for day traders
        riskConsolidation: 0.5, // 0.5% when consolidating
        icon: '📊',
        description: 'Fast-paced intraday trading. Multiple trades per day. Hold time: minutes to hours.'
    },
    swing: {
        id: 'swing',
        label: 'Swing Trader',
        higher: { name: 'Weekly', code: 'weekly' },
        mid: { name: 'Daily', code: 'daily' },
        lower: { name: '4-Hour', code: '4hour' },
        holdTime: '2-10 Days',
        tradesPerWeek: '1-3',
        riskPerTrade: 2, // 2% standard
        riskConsolidation: 1, // 1% when consolidating
        icon: '📈',
        description: 'Multi-day position holds. 1-3 trades per week. Hold time: 2-10 days.'
    },
    position: {
        id: 'position',
        label: 'Position Trader',
        higher: { name: 'Monthly', code: 'monthly' },
        mid: { name: 'Weekly', code: 'weekly' },
        lower: { name: 'Daily', code: 'daily' },
        holdTime: 'Weeks to Months',
        tradesPerWeek: '0.25-1',
        riskPerTrade: 2, // 2% standard
        riskConsolidation: 1, // 1% when consolidating
        icon: '🎯',
        description: 'Long-term trend following. Few trades per month. Hold time: weeks to months.'
    }
};

/**
 * Validation Rules Matrix
 * Rules adjust based on timeframe scale
 */
export const VALIDATION_RULES = {
    consolidationPeriod: {
        '15min': { bars: 30, label: '30-60 minutes', description: 'Has price been chopping sideways for 30+ minutes?' },
        '1hour': { bars: 8, label: '8-12 hours', description: 'Has price been ranging sideways for 8+ hours?' },
        '4hour': { bars: 6, label: '1-2 days', description: 'Has price been consolidating for 6+ bars (1-2 days)?' },
        daily: { bars: 4, label: '4-6 days', description: 'Has price been sideways for 4+ days?' },
        weekly: { bars: 8, label: '8-12 weeks', description: 'Has price been sideways for 8+ weeks?' },
        monthly: { bars: 3, label: '3-4 months', description: 'Has price been sideways for 3+ months?' }
    },

    gapTolerance: {
        '15min': { percent: 0.5, description: 'Gap should be less than 0.5% for 15-minute breakouts' },
        '1hour': { percent: 1.0, description: 'Gap should be less than 1% for 1-hour breakouts' },
        '4hour': { percent: 1.5, description: 'Gap should be less than 1.5% for 4-hour breakouts' },
        daily: { percent: 2.0, description: 'Gap should be less than 2% for daily breakouts' },
        weekly: { percent: 3.0, description: 'Gap should be less than 3% for weekly breakouts' },
        monthly: { percent: 4.0, description: 'Gap should be less than 4% for monthly breakouts' }
    },

    volumeMultiplier: {
        '15min': { multiplier: 2.0, description: '15-minute breakouts need 2x+ average volume' },
        '1hour': { multiplier: 2.0, description: '1-hour breakouts need 2x+ average volume' },
        '4hour': { multiplier: 1.5, description: '4-hour breakouts need 1.5x+ average volume' },
        daily: { multiplier: 1.5, description: 'Daily breakouts need 1.5x+ average volume' },
        weekly: { multiplier: 1.25, description: 'Weekly breakouts need 1.25x+ average volume' },
        monthly: { multiplier: 1.25, description: 'Monthly breakouts need 1.25x+ average volume' }
    },

    rrMinimum: {
        '15min': 2.0, // Intraday requires tight R:R
        '1hour': 2.0,
        '4hour': 2.0,
        daily: 2.0,
        weekly: 2.0,
        monthly: 2.0 // Can accept slightly lower due to trend strength
    }
};

/**
 * Tooltip Guidance by Trading Style
 */
export const TOOLTIP_GUIDANCE = {
    above50EMA: {
        day: 'The 50 EMA on the Daily chart shows short-term trend bias. Price above = bullish context.',
        swing: 'The 50 EMA on the Weekly chart confirms intermediate trend direction. Price above = bullish.',
        position: 'The 50 EMA on the Monthly chart defines major trend direction. Price above = long-term bull market.'
    },

    emaAlignment: {
        day: '20 EMA above 50 EMA on Daily = short-term momentum aligns with context. Signals healthy uptrend.',
        swing: '20 EMA above 50 EMA on Weekly = intermediate momentum building. Strong trend confirmation.',
        position: '20 EMA above 50 EMA on Monthly = major trend acceleration. Very bullish long-term setup.'
    },

    consolidation: {
        day: 'Daily consolidation reduces position size. Use 0.5% risk instead of 1% until breakout confirmed.',
        swing: 'Weekly consolidation detected. Reduce to 1% risk (half size) until clear directional move.',
        position: 'Monthly consolidation requires patience. Use 1% risk and wait for monthly trend resumption.'
    },

    volumeConfirmation: {
        day: 'Intraday breakouts need strong volume (2x average) to confirm institutional participation.',
        swing: 'Daily breakout volume should be 1.5x average to validate setup. Check for climactic buying.',
        position: 'Weekly volume surge (1.25x+) signals major money entering. Less critical than lower timeframes.'
    },

    gapValidation: {
        day: 'Small gaps (<0.5% on 15-min, <1% on 1-hour) are acceptable. Larger gaps increase risk.',
        swing: 'Gaps under 2% on daily charts are workable. Larger gaps may lead to profit-taking pullbacks.',
        position: 'Weekly gaps under 3% are acceptable for position trades. Monthly trend can absorb larger gaps.'
    }
};

/**
 * Get timeframe configuration by style ID
 * @param {string} styleId - Trading style: 'day' | 'swing' | 'position'
 * @returns {Object} Timeframe configuration
 */
export function getTimeframeConfig(styleId) {
    return TIMEFRAME_CONFIGS[styleId] || TIMEFRAME_CONFIGS.swing; // Default to swing
}

/**
 * Get validation rule for specific timeframe
 * @param {string} ruleType - Type of rule: 'consolidationPeriod' | 'gapTolerance' | 'volumeMultiplier'
 * @param {string} timeframeCode - Timeframe code: '15min' | '1hour' | '4hour' | 'daily' | 'weekly' | 'monthly'
 * @returns {Object} Validation rule
 */
export function getValidationRule(ruleType, timeframeCode) {
    return VALIDATION_RULES[ruleType]?.[timeframeCode] || null;
}

/**
 * Get tooltip guidance for specific check and trading style
 * @param {string} checkType - Type of check
 * @param {string} styleId - Trading style ID
 * @returns {string} Tooltip text
 */
export function getTooltipGuidance(checkType, styleId) {
    return TOOLTIP_GUIDANCE[checkType]?.[styleId] || '';
}

/**
 * Calculate risk percentage based on style and consolidation state
 * @param {string} styleId - Trading style ID
 * @param {boolean} isConsolidating - Whether higher timeframe is consolidating
 * @returns {number} Risk percentage
 */
export function calculateRiskPercent(styleId, isConsolidating) {
    const config = getTimeframeConfig(styleId);
    return isConsolidating ? config.riskConsolidation : config.riskPerTrade;
}
