/**
 * OPTIMIZED Custom Hook: Multi-Timeframe Checklist State Management
 *
 * Performance Optimizations:
 * 1. Debounced localStorage writes (only save after 2 seconds of inactivity)
 * 2. Memoized callbacks to prevent unnecessary re-renders
 * 3. Memoized derived state
 * 4. Manual save triggers for important actions
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getTimeframeConfig } from '../utils/TimeframeConfig';
import { useDebouncedCallback } from './useDebounce';
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

// Initial state factories (memoized outside component)
const createEmptyTimeframeState = () => ({
    uptrendConfirmed: false,
    above50EMA: false,
    emaAlignment: false,
    notConsolidating: false,
    clearFromResistance: false,
    isComplete: false,
    isPassed: false
});

const createEmptyMidTimeframeState = () => ({
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

const createEmptyLowerTimeframeState = () => ({
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

const createInitialStateForStyle = (styleId) => {
    const config = getTimeframeConfig(styleId);
    return {
        tradingStyle: styleId,
        timeframeConfig: {
            higher: config.higher.code,
            mid: config.mid.code,
            lower: config.lower.code
        },
        currentStep: 'higher',
        higherTF: createEmptyTimeframeState(),
        midTF: createEmptyMidTimeframeState(),
        lowerTF: createEmptyLowerTimeframeState(),
        consolidationDetected: false,
        positionSizeRecommendation: 100,
        finalDecision: null
    };
};

const getInitialState = () => {
    const savedState = loadChecklistState();
    const savedStyle = loadTradingStyle();

    if (savedState && savedState.tradingStyle) {
        return savedState;
    }

    if (savedStyle) {
        return createInitialStateForStyle(savedStyle.style);
    }

    return {
        tradingStyle: null,
        timeframeConfig: null,
        currentStep: 'styleSelection',
        higherTF: createEmptyTimeframeState(),
        midTF: createEmptyMidTimeframeState(),
        lowerTF: createEmptyLowerTimeframeState(),
        consolidationDetected: false,
        positionSizeRecommendation: 100,
        finalDecision: null
    };
};

/**
 * OPTIMIZED hook for MTF Checklist state management
 */
export function useMTFChecklistStateOptimized() {
    const [state, setState] = useState(getInitialState);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [showChangeStyleConfirm, setShowChangeStyleConfirm] = useState(false);

    // Track if we should auto-save
    const shouldAutoSave = useRef(true);

    // OPTIMIZATION: Memoize style config to prevent recalculation
    const styleConfig = useMemo(() =>
        state.tradingStyle ? getTimeframeConfig(state.tradingStyle) : null,
        [state.tradingStyle]
    );

    // Check for saved state on mount (only once)
    useEffect(() => {
        if (hasSavedState() && !state.tradingStyle) {
            const lastSave = getLastSaveTime();
            if (lastSave) {
                setShowRestorePrompt(true);
            }
        }
    }, []); // Empty deps - only run once

    // OPTIMIZATION: Debounced auto-save (2 seconds after last change)
    // This prevents 50+ localStorage writes during form filling
    const debouncedSave = useDebouncedCallback((stateToSave) => {
        if (shouldAutoSave.current && stateToSave.tradingStyle) {
            saveChecklistState(stateToSave);
            console.log('Auto-saved checklist state');
        }
    }, 2000);

    // Auto-save with debouncing
    useEffect(() => {
        if (state.tradingStyle) {
            debouncedSave(state);
        }
    }, [state, debouncedSave]);

    // OPTIMIZATION: Manual save function for important actions
    const saveImmediately = useCallback(() => {
        if (state.tradingStyle) {
            saveChecklistState(state);
            console.log('Immediate save triggered');
        }
    }, [state]);

    // OPTIMIZATION: Memoized callbacks prevent child component re-renders
    const handleStyleSelect = useCallback((styleId) => {
        const config = getTimeframeConfig(styleId);
        saveTradingStyle(styleId, config);
        setState(createInitialStateForStyle(styleId));
        // Immediate save for important action
        setTimeout(() => saveChecklistState(createInitialStateForStyle(styleId)), 0);
    }, []);

    const handleChangeStyle = useCallback(() => {
        if (!showChangeStyleConfirm) {
            setShowChangeStyleConfirm(true);
            return;
        }
        clearChecklistState();
        clearTradingStyle();
        setState(getInitialState());
        setShowChangeStyleConfirm(false);
    }, [showChangeStyleConfirm]);

    const cancelChangeStyle = useCallback(() => {
        setShowChangeStyleConfirm(false);
    }, []);

    // OPTIMIZATION: Batch state updates
    const updateHigherTF = useCallback((checkId) => {
        setState(prev => ({
            ...prev,
            higherTF: {
                ...prev.higherTF,
                [checkId]: !prev.higherTF[checkId]
            }
        }));
    }, []);

    const proceedToMid = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: 'mid' }));
        saveImmediately(); // Save on step change
    }, [saveImmediately]);

    const updateMidTF = useCallback((checkId, value) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                [checkId]: value !== undefined ? value : !prev.midTF[checkId]
            }
        }));
    }, []);

    const updatePatternType = useCallback((type) => {
        setState(prev => ({
            ...prev,
            midTF: { ...prev.midTF, patternType: type }
        }));
    }, []);

    const updateGapPercentage = useCallback((value) => {
        setState(prev => ({
            ...prev,
            midTF: { ...prev.midTF, gapPercentage: value }
        }));
    }, []);

    const updateMidPrice = useCallback((field, value) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                prices: { ...prev.midTF.prices, [field]: value }
            }
        }));
    }, []);

    const proceedToLower = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: 'lower' }));
        saveImmediately(); // Save on step change
    }, [saveImmediately]);

    const backToHigher = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: 'higher' }));
    }, []);

    const updateLowerTF = useCallback((checkId, value) => {
        setState(prev => ({
            ...prev,
            lowerTF: {
                ...prev.lowerTF,
                [checkId]: value !== undefined ? value : !prev.lowerTF[checkId]
            }
        }));
    }, []);

    const updatePositionData = useCallback((field, value) => {
        setState(prev => ({
            ...prev,
            lowerTF: {
                ...prev.lowerTF,
                positionData: { ...prev.lowerTF.positionData, [field]: value }
            }
        }));
    }, []);

    const proceedToFinal = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: 'final' }));
        saveImmediately(); // Save before final decision
    }, [saveImmediately]);

    const backToMid = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: 'mid' }));
    }, []);

    const executeTrade = useCallback(() => {
        clearChecklistState();
        clearTradingStyle();
        setState(getInitialState());
        shouldAutoSave.current = false; // Don't save after clearing
    }, []);

    const passTrade = useCallback((decision) => {
        setState(prev => ({ ...prev, finalDecision: decision }));
        saveImmediately(); // Save final decision
    }, [saveImmediately]);

    const resetChecklist = useCallback(() => {
        clearChecklistState();
        const newState = createInitialStateForStyle(state.tradingStyle);
        setState(newState);
        setTimeout(() => saveChecklistState(newState), 0);
    }, [state.tradingStyle]);

    const restoreSavedState = useCallback(() => {
        const savedState = loadChecklistState();
        if (savedState) {
            setState(savedState);
        }
        setShowRestorePrompt(false);
    }, []);

    const dismissRestorePrompt = useCallback(() => {
        clearChecklistState();
        setShowRestorePrompt(false);
    }, []);

    const updateValidationResults = useCallback((results) => {
        setState(prev => ({
            ...prev,
            higherTF: {
                ...prev.higherTF,
                isComplete: results.higher?.isPassed || false,
                isPassed: results.higher?.isPassed || false
            },
            midTF: {
                ...prev.midTF,
                isComplete: results.mid?.isPassed || false,
                isPassed: results.mid?.isPassed || false
            },
            lowerTF: {
                ...prev.lowerTF,
                isComplete: results.lower?.isPassed || false,
                isPassed: results.lower?.isPassed || false
            },
            consolidationDetected: results.higher?.consolidationDetected || false,
            positionSizeRecommendation: results.higher?.positionAdjustment || 100
        }));
    }, []);

    return {
        // State
        state,
        styleConfig,
        showRestorePrompt,
        showChangeStyleConfirm,

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

        // Manual save (for blur events, etc.)
        saveImmediately
    };
}
