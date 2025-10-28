/**
 * Multi-Timeframe Checklist Validation Utilities
 * Provides validation logic for each section of the MTF checklist
 * UPDATED: Now supports multiple trading styles with generic timeframe validation
 */

import { calculateRiskPercent } from './TimeframeConfig';

/**
 * GENERIC: Validate Higher Timeframe checks (Daily, Weekly, or Monthly)
 * @param {Object} checks - Timeframe check state
 * @param {string} timeframeName - Name of timeframe (e.g., "Daily", "Weekly", "Monthly")
 * @param {string} styleId - Trading style ID for risk calculation
 * @returns {Object} Validation result with pass/fail, position adjustment, and message
 */
export function validateHigherTimeframe(checks, timeframeName = 'Weekly', styleId = 'swing') {
    const {
        uptrendConfirmed,
        above50EMA,
        emaAlignment,
        notConsolidating,
        clearFromResistance
    } = checks;

    // Count passed checks
    const checkedItems = [
        uptrendConfirmed,
        above50EMA,
        emaAlignment,
        notConsolidating,
        clearFromResistance
    ];
    const passedCount = checkedItems.filter(Boolean).length;

    // All checks must pass to proceed
    const isPassed = passedCount === 5;

    // Special case: consolidation detected
    const consolidationDetected = !notConsolidating;

    // Calculate recommended risk based on style and consolidation
    const fullRisk = calculateRiskPercent(styleId, false);
    const reducedRisk = calculateRiskPercent(styleId, true);

    // Determine position size adjustment
    let positionAdjustment = 100; // Default full position
    let message = '';

    // Consolidation warning message varies by timeframe and style
    const consolidationMessages = {
        daily: `Daily chart consolidating - reduce to ${reducedRisk}% risk`,
        weekly: `Weekly consolidation detected - reduce to ${reducedRisk}% risk`,
        monthly: `Monthly consolidation - reduce to ${reducedRisk}% risk`
    };

    if (!isPassed) {
        positionAdjustment = 0;
        message = `${timeframeName} checks incomplete (${passedCount}/5). Complete all checks to proceed.`;
    } else if (consolidationDetected) {
        positionAdjustment = 50;
        const tfCode = timeframeName.toLowerCase();
        message = consolidationMessages[tfCode] || `${timeframeName} consolidation detected - Recommend 50% position size`;
    } else {
        message = `✓ ${timeframeName} context validated - Full position approved (${fullRisk}% risk)`;
    }

    return {
        isPassed,
        consolidationDetected,
        positionAdjustment,
        message,
        passedCount,
        totalChecks: 5,
        recommendedRisk: consolidationDetected ? reducedRisk : fullRisk
    };
}

/**
 * GENERIC: Validate Mid Timeframe checks (1-Hour, Daily, or Weekly)
 * @param {Object} checks - Timeframe check state
 * @param {string} timeframeName - Name of timeframe
 * @param {string} lowerTimeframeName - Name of next timeframe for message
 * @returns {Object} Validation result
 */
export function validateMidTimeframe(checks, timeframeName = 'Daily', lowerTimeframeName = '4-Hour') {
    const {
        breakoutOrPullback,
        aboveEMA,
        volumeConfirmation,
        gapAcceptable,
        cleanHigherLow,
        rrAtLeast2to1
    } = checks;

    const checkedItems = [
        breakoutOrPullback,
        aboveEMA,
        volumeConfirmation,
        gapAcceptable,
        cleanHigherLow,
        rrAtLeast2to1
    ];

    const passedCount = checkedItems.filter(Boolean).length;
    const isPassed = passedCount === 6;

    // Collect missing checks
    const missingChecks = [];
    if (!breakoutOrPullback) missingChecks.push('Breakout/Pullback pattern');
    if (!aboveEMA) missingChecks.push('Price above 20 EMA');
    if (!volumeConfirmation) missingChecks.push('Volume confirmation');
    if (!gapAcceptable) missingChecks.push('Gap validation');
    if (!cleanHigherLow) missingChecks.push('Higher low structure');
    if (!rrAtLeast2to1) missingChecks.push('R:R minimum 2:1');

    let message = '';
    if (!isPassed) {
        message = `${timeframeName} setup incomplete (${passedCount}/6). Missing: ${missingChecks.join(', ')}`;
    } else {
        message = `✓ ${timeframeName} setup confirmed - Proceed to ${lowerTimeframeName} checks`;
    }

    return {
        isPassed,
        missingChecks,
        passedCount,
        totalChecks: 6,
        message
    };
}

/**
 * GENERIC: Validate Lower Timeframe checks (15-Min, 4-Hour, or Daily)
 * @param {Object} checks - Timeframe check state
 * @param {string} timeframeName - Name of timeframe
 * @param {number} maxRisk - Maximum risk percentage for this style
 * @returns {Object} Validation result
 */
export function validateLowerTimeframe(checks, timeframeName = '4-Hour', maxRisk = 2.0) {
    const {
        stopBelowStructure,
        stopDistanceOk,
        notAfterExtended,
        retestOrPullback,
        rrStillValid,
        positionSizeValid
    } = checks;

    const checkedItems = [
        stopBelowStructure,
        stopDistanceOk,
        notAfterExtended,
        retestOrPullback,
        rrStillValid,
        positionSizeValid
    ];

    const passedCount = checkedItems.filter(Boolean).length;
    const isPassed = passedCount === 6;
    const readyToExecute = isPassed;

    // Collect missing checks
    const missingChecks = [];
    if (!stopBelowStructure) missingChecks.push('Stop below structure');
    if (!stopDistanceOk) missingChecks.push('Stop distance validation');
    if (!notAfterExtended) missingChecks.push('Entry timing check');
    if (!retestOrPullback) missingChecks.push('Retest confirmation');
    if (!rrStillValid) missingChecks.push('R:R validation');
    if (!positionSizeValid) missingChecks.push('Position size within limits');

    let message = '';
    if (!isPassed) {
        message = `${timeframeName} entry checks incomplete (${passedCount}/6). Missing: ${missingChecks.join(', ')}`;
    } else {
        message = '✓ Entry trigger confirmed - Ready to execute';
    }

    return {
        isPassed,
        readyToExecute,
        missingChecks,
        passedCount,
        totalChecks: 6,
        message
    };
}

// =============================================================================
// LEGACY FUNCTIONS (Backward Compatibility)
// =============================================================================

/**
 * LEGACY: Validate Weekly timeframe checks
 * @deprecated Use validateHigherTimeframe instead
 */
export function validateWeekly(checks) {
    // Map old field names to new generic names
    const genericChecks = {
        uptrendConfirmed: checks.higherHighsLows,
        above50EMA: checks.aboveWeekly50EMA,
        emaAlignment: checks.emaAlignment,
        notConsolidating: checks.notConsolidating,
        clearFromResistance: checks.farFromResistance
    };

    return validateHigherTimeframe(genericChecks, 'Weekly', 'swing');
}

/**
 * LEGACY: Validate Daily timeframe checks
 * @deprecated Use validateMidTimeframe instead
 */
export function validateDaily(checks, rrData) {
    const genericChecks = {
        breakoutOrPullback: checks.breakoutOrPullback,
        aboveEMA: checks.aboveDaily20EMA,
        volumeConfirmation: checks.volumeConfirmation,
        gapAcceptable: checks.gapUnder2Percent,
        cleanHigherLow: checks.cleanHigherLow,
        rrAtLeast2to1: checks.rrAtLeast2to1
    };

    return validateMidTimeframe(genericChecks, 'Daily', '4-Hour');
}

/**
 * LEGACY: Validate 4-Hour timeframe checks
 * @deprecated Use validateLowerTimeframe instead
 */
export function validateFourHour(checks, positionData) {
    const genericChecks = {
        stopBelowStructure: checks.stopBelowStructure,
        stopDistanceOk: checks.stopDistanceOk,
        notAfterExtended: checks.notAfter3UpBars,
        retestOrPullback: checks.retestOrPullback,
        rrStillValid: checks.rrStillValid,
        positionSizeValid: checks.positionSizeValid
    };

    return validateLowerTimeframe(genericChecks, '4-Hour', 2.0);
}

// =============================================================================
// POSITION RECOMMENDATION
// =============================================================================

/**
 * Calculate overall position size recommendation (updated for generic timeframes)
 * @param {Object} higherValidation - Result from validateHigherTimeframe
 * @param {Object} midValidation - Result from validateMidTimeframe
 * @param {Object} lowerValidation - Result from validateLowerTimeframe
 * @param {string} higherTFName - Name of higher timeframe
 * @param {string} midTFName - Name of mid timeframe
 * @param {string} lowerTFName - Name of lower timeframe
 * @returns {Object} Position size recommendation
 */
export function calculatePositionRecommendation(
    higherValidation,
    midValidation,
    lowerValidation,
    higherTFName = 'Weekly',
    midTFName = 'Daily',
    lowerTFName = '4-Hour'
) {
    // If higher doesn't pass, no trade
    if (!higherValidation.isPassed) {
        return {
            recommendation: 0,
            status: 'NO TRADE',
            reason: `${higherTFName} timeframe not aligned`,
            color: 'error'
        };
    }

    // If mid doesn't pass, wait
    if (!midValidation.isPassed) {
        return {
            recommendation: 0,
            status: 'WAIT',
            reason: `${midTFName} setup not ready`,
            color: 'warning'
        };
    }

    // If lower doesn't pass, no entry
    if (!lowerValidation.isPassed) {
        return {
            recommendation: 0,
            status: 'NO ENTRY',
            reason: `${lowerTFName} entry not triggered`,
            color: 'warning'
        };
    }

    // All checks pass - use higher timeframe's position adjustment
    if (higherValidation.consolidationDetected) {
        return {
            recommendation: 50,
            status: 'HALF SIZE',
            reason: `${higherTFName} consolidation - reduced position`,
            color: 'warning'
        };
    }

    return {
        recommendation: 100,
        status: 'FULL SIZE',
        reason: 'All timeframes aligned',
        color: 'success'
    };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate gap percentage input
 * @param {string|number} gapPercent - Gap percentage value
 * @returns {Object} Validation result
 */
export function validateGapPercent(gapPercent) {
    const gap = parseFloat(gapPercent);

    if (isNaN(gap)) {
        return {
            isValid: false,
            error: 'Gap percentage must be a valid number'
        };
    }

    if (gap < 0) {
        return {
            isValid: false,
            error: 'Gap percentage cannot be negative'
        };
    }

    if (gap > 100) {
        return {
            isValid: false,
            error: 'Gap percentage cannot exceed 100%'
        };
    }

    const isAcceptable = gap <= 2;

    return {
        isValid: true,
        isAcceptable,
        warning: !isAcceptable ? '⚠️ Gap exceeds 2% - Higher risk entry' : null
    };
}

/**
 * Validate price relationship for R:R calculation
 * @param {number} entry - Entry price
 * @param {number} stop - Stop loss price
 * @param {number} target - Target price
 * @returns {Object} Validation result
 */
export function validatePriceRelationship(entry, stop, target) {
    const e = parseFloat(entry);
    const s = parseFloat(stop);
    const t = parseFloat(target);

    if (isNaN(e) || isNaN(s) || isNaN(t)) {
        return {
            isValid: false,
            error: 'All prices must be valid numbers'
        };
    }

    if (e <= 0 || s <= 0 || t <= 0) {
        return {
            isValid: false,
            error: 'All prices must be greater than zero'
        };
    }

    const isLongPosition = s < e && t > e;
    const isShortPosition = s > e && t < e;

    if (!isLongPosition && !isShortPosition) {
        return {
            isValid: false,
            error: 'Invalid setup. Long: Stop < Entry < Target. Short: Target < Entry < Stop'
        };
    }

    return {
        isValid: true,
        positionType: isLongPosition ? 'Long' : 'Short'
    };
}

/**
 * Auto-check R:R if ratio meets minimum threshold
 * @param {number} rrRatio - Calculated R:R ratio
 * @param {number} minRatio - Minimum required ratio (default 2.0)
 * @returns {boolean} Whether checkbox should be auto-checked
 */
export function shouldAutoCheckRR(rrRatio, minRatio = 2.0) {
    const ratio = parseFloat(rrRatio);
    return !isNaN(ratio) && ratio >= minRatio;
}

/**
 * Auto-check position size if risk is within acceptable range
 * @param {number} riskPercent - Calculated risk percentage
 * @param {number} maxRisk - Maximum acceptable risk (default 2.0)
 * @returns {boolean} Whether checkbox should be auto-checked
 */
export function shouldAutoCheckPositionSize(riskPercent, maxRisk = 2.0) {
    const risk = parseFloat(riskPercent);
    return !isNaN(risk) && risk > 0 && risk <= maxRisk;
}
