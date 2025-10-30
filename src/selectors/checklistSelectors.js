/**
 * Checklist State Selectors
 *
 * Encapsulate derived state calculations
 * Benefits:
 * - Centralized business logic
 * - Easy to test
 * - Memoization opportunities
 * - Clear dependencies
 */

/**
 * Get current step
 */
export const getCurrentStep = (state) => state.currentStep;

/**
 * Get all higher timeframe checks
 */
export const getHigherTFState = (state) => state.higherTF;

/**
 * Get all mid timeframe checks
 */
export const getMidTFState = (state) => state.midTF;

/**
 * Get all lower timeframe checks
 */
export const getLowerTFState = (state) => state.lowerTF;

/**
 * Check if higher timeframe is complete
 */
export const isHigherTFComplete = (state) => state.higherTF.isPassed;

/**
 * Check if mid timeframe is complete
 */
export const isMidTFComplete = (state) => state.midTF.isPassed;

/**
 * Check if lower timeframe is complete
 */
export const isLowerTFComplete = (state) => state.lowerTF.isPassed;

/**
 * Check if mid timeframe is locked
 */
export const isMidTFLocked = (state) => !state.higherTF.isPassed;

/**
 * Check if lower timeframe is locked
 */
export const isLowerTFLocked = (state) => !state.midTF.isPassed;

/**
 * Get consolidation status
 */
export const getConsolidationDetected = (state) => state.consolidationDetected;

/**
 * Get position size recommendation
 */
export const getPositionSizeRecommendation = (state) => state.positionSizeRecommendation;

/**
 * Get final decision
 */
export const getFinalDecision = (state) => state.finalDecision;

/**
 * Get progress percentage (0-100)
 */
export const getProgressPercentage = (state) => {
    let completed = 0;
    const total = 3; // Three timeframes

    if (state.higherTF.isPassed) completed++;
    if (state.midTF.isPassed) completed++;
    if (state.lowerTF.isPassed) completed++;

    return Math.round((completed / total) * 100);
};

/**
 * Check if ready to proceed to next step
 */
export const canProceedFromHigher = (state) => state.higherTF.isPassed;

export const canProceedFromMid = (state) => state.midTF.isPassed;

export const canProceedFromLower = (state) => state.lowerTF.isPassed;

/**
 * Get mid timeframe prices
 */
export const getMidPrices = (state) => state.midTF.prices;

/**
 * Get lower timeframe position data
 */
export const getLowerPositionData = (state) => state.lowerTF.positionData;

/**
 * Check if all prices are filled (mid TF)
 */
export const areMidPricesFilled = (state) => {
    const { entry, stop, target } = state.midTF.prices;
    return entry && stop && target;
};

/**
 * Check if all position data is filled (lower TF)
 */
export const isPositionDataFilled = (state) => {
    const { accountSize, riskPercent, entry, stop } = state.lowerTF.positionData;
    return accountSize && riskPercent && entry && stop;
};

/**
 * Get checklist completion summary
 */
export const getCompletionSummary = (state) => ({
    higher: {
        completed: state.higherTF.isPassed,
        checks: [
            state.higherTF.uptrendConfirmed,
            state.higherTF.above50EMA,
            state.higherTF.emaAlignment,
            state.higherTF.notConsolidating,
            state.higherTF.clearFromResistance
        ].filter(Boolean).length,
        total: 5
    },
    mid: {
        completed: state.midTF.isPassed,
        checks: [
            state.midTF.breakoutOrPullback,
            state.midTF.aboveEMA,
            state.midTF.volumeConfirmation,
            state.midTF.gapAcceptable,
            state.midTF.cleanHigherLow,
            state.midTF.rrAtLeast2to1
        ].filter(Boolean).length,
        total: 6
    },
    lower: {
        completed: state.lowerTF.isPassed,
        checks: [
            state.lowerTF.stopBelowStructure,
            state.lowerTF.stopDistanceOk,
            state.lowerTF.notAfterExtended,
            state.lowerTF.retestOrPullback,
            state.lowerTF.rrStillValid,
            state.lowerTF.positionSizeValid
        ].filter(Boolean).length,
        total: 6
    }
});

/**
 * Check if user is on final decision step
 */
export const isOnFinalStep = (state) => state.currentStep === 'final';

/**
 * Check if checklist is complete (all timeframes passed)
 */
export const isChecklistComplete = (state) =>
    state.higherTF.isPassed &&
    state.midTF.isPassed &&
    state.lowerTF.isPassed;

/**
 * Get current step index (for progress tracking)
 */
export const getCurrentStepIndex = (state) => {
    const steps = ['higher', 'mid', 'lower', 'final'];
    return steps.indexOf(state.currentStep);
};

/**
 * Get all state for serialization (localStorage)
 */
export const getSerializableState = (state) => ({
    currentStep: state.currentStep,
    higherTF: state.higherTF,
    midTF: state.midTF,
    lowerTF: state.lowerTF,
    consolidationDetected: state.consolidationDetected,
    positionSizeRecommendation: state.positionSizeRecommendation,
    finalDecision: state.finalDecision
});
