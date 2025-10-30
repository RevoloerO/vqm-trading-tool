/**
 * Checklist State Reducer
 *
 * Replaces monolithic setState with predictable state transitions
 * Benefits:
 * - Clear data flow
 * - Easy to test
 * - Time-travel debugging
 * - Immutability enforced
 * - Single source of truth for state updates
 */

// Action Types
export const CHECKLIST_ACTIONS = {
    // Higher Timeframe
    TOGGLE_HIGHER_CHECK: 'TOGGLE_HIGHER_CHECK',
    UPDATE_HIGHER_VALIDATION: 'UPDATE_HIGHER_VALIDATION',

    // Mid Timeframe
    TOGGLE_MID_CHECK: 'TOGGLE_MID_CHECK',
    UPDATE_MID_CHECK: 'UPDATE_MID_CHECK',
    SET_PATTERN_TYPE: 'SET_PATTERN_TYPE',
    SET_GAP_PERCENTAGE: 'SET_GAP_PERCENTAGE',
    UPDATE_MID_PRICE: 'UPDATE_MID_PRICE',
    UPDATE_MID_VALIDATION: 'UPDATE_MID_VALIDATION',

    // Lower Timeframe
    TOGGLE_LOWER_CHECK: 'TOGGLE_LOWER_CHECK',
    UPDATE_LOWER_CHECK: 'UPDATE_LOWER_CHECK',
    UPDATE_POSITION_DATA: 'UPDATE_POSITION_DATA',
    UPDATE_LOWER_VALIDATION: 'UPDATE_LOWER_VALIDATION',

    // Navigation
    PROCEED_TO_MID: 'PROCEED_TO_MID',
    PROCEED_TO_LOWER: 'PROCEED_TO_LOWER',
    PROCEED_TO_FINAL: 'PROCEED_TO_FINAL',
    BACK_TO_HIGHER: 'BACK_TO_HIGHER',
    BACK_TO_MID: 'BACK_TO_MID',

    // Final Decision
    SET_FINAL_DECISION: 'SET_FINAL_DECISION',

    // Reset
    RESET_CHECKLIST: 'RESET_CHECKLIST',
    RESET_TO_STYLE_SELECTION: 'RESET_TO_STYLE_SELECTION',

    // Restore
    RESTORE_STATE: 'RESTORE_STATE'
};

// Initial State Factories
export const createEmptyTimeframeState = () => ({
    uptrendConfirmed: false,
    above50EMA: false,
    emaAlignment: false,
    notConsolidating: false,
    clearFromResistance: false,
    isComplete: false,
    isPassed: false
});

export const createEmptyMidTimeframeState = () => ({
    breakoutOrPullback: false,
    aboveEMA: false,
    volumeConfirmation: false,
    gapAcceptable: false,
    cleanHigherLow: false,
    rrAtLeast2to1: false,
    patternType: 'breakout',
    gapPercentage: '',
    prices: { entry: '', stop: '', target: '' },
    isComplete: false,
    isPassed: false
});

export const createEmptyLowerTimeframeState = () => ({
    stopBelowStructure: false,
    stopDistanceOk: false,
    notAfterExtended: false,
    retestOrPullback: false,
    rrStillValid: false,
    positionSizeValid: false,
    positionData: { accountSize: '', riskPercent: '', entry: '', stop: '' },
    isComplete: false,
    isPassed: false
});

export const createInitialChecklistState = () => ({
    currentStep: 'higher',
    higherTF: createEmptyTimeframeState(),
    midTF: createEmptyMidTimeframeState(),
    lowerTF: createEmptyLowerTimeframeState(),
    consolidationDetected: false,
    positionSizeRecommendation: 100,
    finalDecision: null
});

/**
 * Checklist Reducer
 * Handles all state transitions for the checklist
 */
export function checklistReducer(state, action) {
    switch (action.type) {
        // =====================================================================
        // HIGHER TIMEFRAME ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.TOGGLE_HIGHER_CHECK:
            return {
                ...state,
                higherTF: {
                    ...state.higherTF,
                    [action.payload.checkId]: !state.higherTF[action.payload.checkId]
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_HIGHER_VALIDATION:
            return {
                ...state,
                higherTF: {
                    ...state.higherTF,
                    isComplete: action.payload.isPassed,
                    isPassed: action.payload.isPassed
                },
                consolidationDetected: action.payload.consolidationDetected,
                positionSizeRecommendation: action.payload.positionAdjustment
            };

        // =====================================================================
        // MID TIMEFRAME ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.TOGGLE_MID_CHECK:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    [action.payload.checkId]: !state.midTF[action.payload.checkId]
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_MID_CHECK:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    [action.payload.checkId]: action.payload.value
                }
            };

        case CHECKLIST_ACTIONS.SET_PATTERN_TYPE:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    patternType: action.payload.patternType
                }
            };

        case CHECKLIST_ACTIONS.SET_GAP_PERCENTAGE:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    gapPercentage: action.payload.value
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_MID_PRICE:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    prices: {
                        ...state.midTF.prices,
                        [action.payload.field]: action.payload.value
                    }
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_MID_VALIDATION:
            return {
                ...state,
                midTF: {
                    ...state.midTF,
                    isComplete: action.payload.isPassed,
                    isPassed: action.payload.isPassed
                }
            };

        // =====================================================================
        // LOWER TIMEFRAME ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.TOGGLE_LOWER_CHECK:
            return {
                ...state,
                lowerTF: {
                    ...state.lowerTF,
                    [action.payload.checkId]: !state.lowerTF[action.payload.checkId]
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_LOWER_CHECK:
            return {
                ...state,
                lowerTF: {
                    ...state.lowerTF,
                    [action.payload.checkId]: action.payload.value
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_POSITION_DATA:
            return {
                ...state,
                lowerTF: {
                    ...state.lowerTF,
                    positionData: {
                        ...state.lowerTF.positionData,
                        [action.payload.field]: action.payload.value
                    }
                }
            };

        case CHECKLIST_ACTIONS.UPDATE_LOWER_VALIDATION:
            return {
                ...state,
                lowerTF: {
                    ...state.lowerTF,
                    isComplete: action.payload.isPassed,
                    isPassed: action.payload.isPassed
                }
            };

        // =====================================================================
        // NAVIGATION ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.PROCEED_TO_MID:
            return {
                ...state,
                currentStep: 'mid'
            };

        case CHECKLIST_ACTIONS.PROCEED_TO_LOWER:
            return {
                ...state,
                currentStep: 'lower'
            };

        case CHECKLIST_ACTIONS.PROCEED_TO_FINAL:
            return {
                ...state,
                currentStep: 'final'
            };

        case CHECKLIST_ACTIONS.BACK_TO_HIGHER:
            return {
                ...state,
                currentStep: 'higher'
            };

        case CHECKLIST_ACTIONS.BACK_TO_MID:
            return {
                ...state,
                currentStep: 'mid'
            };

        // =====================================================================
        // FINAL DECISION ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.SET_FINAL_DECISION:
            return {
                ...state,
                finalDecision: action.payload.decision
            };

        // =====================================================================
        // RESET ACTIONS
        // =====================================================================
        case CHECKLIST_ACTIONS.RESET_CHECKLIST:
            return createInitialChecklistState();

        case CHECKLIST_ACTIONS.RESET_TO_STYLE_SELECTION:
            return {
                ...createInitialChecklistState(),
                currentStep: 'styleSelection'
            };

        // =====================================================================
        // RESTORE ACTION
        // =====================================================================
        case CHECKLIST_ACTIONS.RESTORE_STATE:
            return action.payload.state;

        default:
            console.warn(`Unknown action type: ${action.type}`);
            return state;
    }
}

/**
 * Action Creators
 * Encapsulate action creation logic
 */
export const checklistActions = {
    // Higher TF
    toggleHigherCheck: (checkId) => ({
        type: CHECKLIST_ACTIONS.TOGGLE_HIGHER_CHECK,
        payload: { checkId }
    }),

    updateHigherValidation: (validation) => ({
        type: CHECKLIST_ACTIONS.UPDATE_HIGHER_VALIDATION,
        payload: validation
    }),

    // Mid TF
    toggleMidCheck: (checkId) => ({
        type: CHECKLIST_ACTIONS.TOGGLE_MID_CHECK,
        payload: { checkId }
    }),

    updateMidCheck: (checkId, value) => ({
        type: CHECKLIST_ACTIONS.UPDATE_MID_CHECK,
        payload: { checkId, value }
    }),

    setPatternType: (patternType) => ({
        type: CHECKLIST_ACTIONS.SET_PATTERN_TYPE,
        payload: { patternType }
    }),

    setGapPercentage: (value) => ({
        type: CHECKLIST_ACTIONS.SET_GAP_PERCENTAGE,
        payload: { value }
    }),

    updateMidPrice: (field, value) => ({
        type: CHECKLIST_ACTIONS.UPDATE_MID_PRICE,
        payload: { field, value }
    }),

    updateMidValidation: (validation) => ({
        type: CHECKLIST_ACTIONS.UPDATE_MID_VALIDATION,
        payload: validation
    }),

    // Lower TF
    toggleLowerCheck: (checkId) => ({
        type: CHECKLIST_ACTIONS.TOGGLE_LOWER_CHECK,
        payload: { checkId }
    }),

    updateLowerCheck: (checkId, value) => ({
        type: CHECKLIST_ACTIONS.UPDATE_LOWER_CHECK,
        payload: { checkId, value }
    }),

    updatePositionData: (field, value) => ({
        type: CHECKLIST_ACTIONS.UPDATE_POSITION_DATA,
        payload: { field, value }
    }),

    updateLowerValidation: (validation) => ({
        type: CHECKLIST_ACTIONS.UPDATE_LOWER_VALIDATION,
        payload: validation
    }),

    // Navigation
    proceedToMid: () => ({
        type: CHECKLIST_ACTIONS.PROCEED_TO_MID
    }),

    proceedToLower: () => ({
        type: CHECKLIST_ACTIONS.PROCEED_TO_LOWER
    }),

    proceedToFinal: () => ({
        type: CHECKLIST_ACTIONS.PROCEED_TO_FINAL
    }),

    backToHigher: () => ({
        type: CHECKLIST_ACTIONS.BACK_TO_HIGHER
    }),

    backToMid: () => ({
        type: CHECKLIST_ACTIONS.BACK_TO_MID
    }),

    // Final Decision
    setFinalDecision: (decision) => ({
        type: CHECKLIST_ACTIONS.SET_FINAL_DECISION,
        payload: { decision }
    }),

    // Reset
    resetChecklist: () => ({
        type: CHECKLIST_ACTIONS.RESET_CHECKLIST
    }),

    resetToStyleSelection: () => ({
        type: CHECKLIST_ACTIONS.RESET_TO_STYLE_SELECTION
    }),

    // Restore
    restoreState: (state) => ({
        type: CHECKLIST_ACTIONS.RESTORE_STATE,
        payload: { state }
    })
};
