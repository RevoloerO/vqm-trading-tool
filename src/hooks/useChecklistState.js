/**
 * REFACTORED Checklist State Hook
 *
 * Uses reducer pattern instead of monolithic setState
 * Benefits:
 * - Clear data flow
 * - Predictable state updates
 * - Easy to test
 * - Time-travel debugging
 * - Immutability enforced
 * - Separated concerns
 */

import { useReducer, useState, useEffect, useCallback, useMemo } from 'react';
import { getTimeframeConfig } from '../utils/TimeframeConfig';
import { useDebouncedCallback } from './useDebounce';
import {
    checklistReducer,
    checklistActions,
    createInitialChecklistState
} from '../reducers/checklistReducer';
import {
    saveChecklistState,
    loadChecklistState,
    clearChecklistState,
    saveTradingStyle,
    loadTradingStyle,
    clearTradingStyle,
    hasSavedState,
    getLastSaveTime
} from '../utils/checklistStorage';
import * as selectors from '../selectors/checklistSelectors';

/**
 * Main checklist state hook with reducer pattern
 */
export function useChecklistState() {
    // =========================================================================
    // SEPARATE STATE DOMAINS (Following best practices)
    // =========================================================================

    // 1. Trading Style (top-level choice)
    const [tradingStyle, setTradingStyle] = useState(null);

    // 2. Timeframe Configuration (derived from style)
    const [timeframeConfig, setTimeframeConfig] = useState(null);

    // 3. Checklist State (managed by reducer)
    const [checklistState, dispatch] = useReducer(
        checklistReducer,
        createInitialChecklistState()
    );

    // 4. UI State (local to this hook)
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [showChangeStyleConfirm, setShowChangeStyleConfirm] = useState(false);

    // =========================================================================
    // MEMOIZED SELECTORS
    // =========================================================================

    const styleConfig = useMemo(() =>
        tradingStyle ? getTimeframeConfig(tradingStyle) : null,
        [tradingStyle]
    );

    // Use selectors for derived state
    const currentStep = selectors.getCurrentStep(checklistState);
    const isHigherComplete = selectors.isHigherTFComplete(checklistState);
    const isMidComplete = selectors.isMidTFComplete(checklistState);
    const isLowerComplete = selectors.isLowerTFComplete(checklistState);
    const isMidLocked = selectors.isMidTFLocked(checklistState);
    const isLowerLocked = selectors.isLowerTFLocked(checklistState);

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    useEffect(() => {
        const savedState = loadChecklistState();
        const savedStyle = loadTradingStyle();

        if (savedState && savedState.tradingStyle) {
            // Restore full state
            setTradingStyle(savedState.tradingStyle);
            const config = getTimeframeConfig(savedState.tradingStyle);
            setTimeframeConfig(savedState.timeframeConfig);
            dispatch(checklistActions.restoreState(savedState.checklistState));
        } else if (savedStyle) {
            // Restore style only
            setTradingStyle(savedStyle.style);
            const config = getTimeframeConfig(savedStyle.style);
            setTimeframeConfig({
                higher: config.higher.code,
                mid: config.mid.code,
                lower: config.lower.code
            });
        } else if (hasSavedState()) {
            setShowRestorePrompt(true);
        }
    }, []); // Run once on mount

    // =========================================================================
    // DEBOUNCED AUTO-SAVE (2 seconds after last change)
    // =========================================================================

    const debouncedSave = useDebouncedCallback((styleId, tfConfig, clState) => {
        if (styleId) {
            const stateToSave = {
                tradingStyle: styleId,
                timeframeConfig: tfConfig,
                checklistState: selectors.getSerializableState(clState)
            };
            saveChecklistState(stateToSave);
        }
    }, 2000);

    useEffect(() => {
        if (tradingStyle) {
            debouncedSave(tradingStyle, timeframeConfig, checklistState);
        }
    }, [tradingStyle, timeframeConfig, checklistState, debouncedSave]);

    // =========================================================================
    // MANUAL SAVE (for important actions)
    // =========================================================================

    const saveImmediately = useCallback(() => {
        if (tradingStyle) {
            const stateToSave = {
                tradingStyle,
                timeframeConfig,
                checklistState: selectors.getSerializableState(checklistState)
            };
            saveChecklistState(stateToSave);
        }
    }, [tradingStyle, timeframeConfig, checklistState]);

    // =========================================================================
    // STYLE SELECTION ACTIONS
    // =========================================================================

    const handleStyleSelect = useCallback((styleId) => {
        const config = getTimeframeConfig(styleId);

        // Set separated state
        setTradingStyle(styleId);
        setTimeframeConfig({
            higher: config.higher.code,
            mid: config.mid.code,
            lower: config.lower.code
        });

        // Reset checklist
        dispatch(checklistActions.resetChecklist());

        // Save style preference
        saveTradingStyle(styleId, config);

        // Immediate save
        setTimeout(() => {
            const stateToSave = {
                tradingStyle: styleId,
                timeframeConfig: {
                    higher: config.higher.code,
                    mid: config.mid.code,
                    lower: config.lower.code
                },
                checklistState: createInitialChecklistState()
            };
            saveChecklistState(stateToSave);
        }, 0);
    }, []);

    const handleChangeStyle = useCallback(() => {
        if (!showChangeStyleConfirm) {
            setShowChangeStyleConfirm(true);
            return;
        }

        // Clear everything
        clearChecklistState();
        clearTradingStyle();
        setTradingStyle(null);
        setTimeframeConfig(null);
        dispatch(checklistActions.resetToStyleSelection());
        setShowChangeStyleConfirm(false);
    }, [showChangeStyleConfirm]);

    const cancelChangeStyle = useCallback(() => {
        setShowChangeStyleConfirm(false);
    }, []);

    // =========================================================================
    // HIGHER TIMEFRAME ACTIONS
    // =========================================================================

    const updateHigherTF = useCallback((checkId) => {
        dispatch(checklistActions.toggleHigherCheck(checkId));
    }, []);

    const proceedToMid = useCallback(() => {
        dispatch(checklistActions.proceedToMid());
        saveImmediately();
    }, [saveImmediately]);

    // =========================================================================
    // MID TIMEFRAME ACTIONS
    // =========================================================================

    const updateMidTF = useCallback((checkId, value) => {
        if (value !== undefined) {
            dispatch(checklistActions.updateMidCheck(checkId, value));
        } else {
            dispatch(checklistActions.toggleMidCheck(checkId));
        }
    }, []);

    const updatePatternType = useCallback((type) => {
        dispatch(checklistActions.setPatternType(type));
    }, []);

    const updateGapPercentage = useCallback((value) => {
        dispatch(checklistActions.setGapPercentage(value));
    }, []);

    const updateMidPrice = useCallback((field, value) => {
        dispatch(checklistActions.updateMidPrice(field, value));
    }, []);

    const proceedToLower = useCallback(() => {
        dispatch(checklistActions.proceedToLower());
        saveImmediately();
    }, [saveImmediately]);

    const backToHigher = useCallback(() => {
        dispatch(checklistActions.backToHigher());
    }, []);

    // =========================================================================
    // LOWER TIMEFRAME ACTIONS
    // =========================================================================

    const updateLowerTF = useCallback((checkId, value) => {
        if (value !== undefined) {
            dispatch(checklistActions.updateLowerCheck(checkId, value));
        } else {
            dispatch(checklistActions.toggleLowerCheck(checkId));
        }
    }, []);

    const updatePositionData = useCallback((field, value) => {
        dispatch(checklistActions.updatePositionData(field, value));
    }, []);

    const proceedToFinal = useCallback(() => {
        dispatch(checklistActions.proceedToFinal());
        saveImmediately();
    }, [saveImmediately]);

    const backToMid = useCallback(() => {
        dispatch(checklistActions.backToMid());
    }, []);

    // =========================================================================
    // FINAL DECISION ACTIONS
    // =========================================================================

    const executeTrade = useCallback(() => {
        clearChecklistState();
        clearTradingStyle();
        setTradingStyle(null);
        setTimeframeConfig(null);
        dispatch(checklistActions.resetToStyleSelection());
    }, []);

    const passTrade = useCallback((decision) => {
        dispatch(checklistActions.setFinalDecision(decision));
        saveImmediately();
    }, [saveImmediately]);

    const resetChecklist = useCallback(() => {
        clearChecklistState();
        dispatch(checklistActions.resetChecklist());
        setTimeout(() => {
            const stateToSave = {
                tradingStyle,
                timeframeConfig,
                checklistState: createInitialChecklistState()
            };
            saveChecklistState(stateToSave);
        }, 0);
    }, [tradingStyle, timeframeConfig]);

    // =========================================================================
    // RESTORE ACTIONS
    // =========================================================================

    const restoreSavedState = useCallback(() => {
        const savedState = loadChecklistState();
        if (savedState) {
            setTradingStyle(savedState.tradingStyle);
            setTimeframeConfig(savedState.timeframeConfig);
            dispatch(checklistActions.restoreState(savedState.checklistState));
        }
        setShowRestorePrompt(false);
    }, []);

    const dismissRestorePrompt = useCallback(() => {
        clearChecklistState();
        setShowRestorePrompt(false);
    }, []);

    // =========================================================================
    // VALIDATION UPDATER
    // =========================================================================

    const updateValidationResults = useCallback((results) => {
        if (results.higher) {
            dispatch(checklistActions.updateHigherValidation(results.higher));
        }
        if (results.mid) {
            dispatch(checklistActions.updateMidValidation(results.mid));
        }
        if (results.lower) {
            dispatch(checklistActions.updateLowerValidation(results.lower));
        }
    }, []);

    // =========================================================================
    // RETURN API
    // =========================================================================

    return {
        // Separated state domains
        tradingStyle,
        timeframeConfig,
        checklistState,
        styleConfig,

        // UI state
        showRestorePrompt,
        showChangeStyleConfirm,

        // Derived state (via selectors)
        currentStep,
        isHigherComplete,
        isMidComplete,
        isLowerComplete,
        isMidLocked,
        isLowerLocked,

        // Style actions
        handleStyleSelect,
        handleChangeStyle,
        cancelChangeStyle,

        // Higher TF actions
        updateHigherTF,
        proceedToMid,

        // Mid TF actions
        updateMidTF,
        updatePatternType,
        updateGapPercentage,
        updateMidPrice,
        proceedToLower,
        backToHigher,

        // Lower TF actions
        updateLowerTF,
        updatePositionData,
        proceedToFinal,
        backToMid,

        // Final actions
        executeTrade,
        passTrade,
        resetChecklist,

        // Restore actions
        restoreSavedState,
        dismissRestorePrompt,

        // Validation updater
        updateValidationResults,

        // Manual save
        saveImmediately
    };
}
