/**
 * OPTIMIZED Custom Hook: Multi-Timeframe Validation Logic
 *
 * Performance Optimizations:
 * 1. Memoized validation results
 * 2. Memoized computed values
 * 3. Selective dependency tracking
 * 4. Batch validation updates
 */

import { useState, useEffect, useMemo } from 'react';
import {
    validateHigherTimeframe,
    validateMidTimeframe,
    validateLowerTimeframe,
    calculatePositionRecommendation
} from '../utils/checklistValidation';
import { calculateRiskPercent } from '../utils/TimeframeConfig';

/**
 * OPTIMIZED hook to manage all validation logic for MTF Checklist
 */
export function useMTFValidationOptimized(checklistState, styleConfig, tradingStyle, timeframeConfig) {
    const [higherValidation, setHigherValidation] = useState(null);
    const [midValidation, setMidValidation] = useState(null);
    const [lowerValidation, setLowerValidation] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    // OPTIMIZATION: Memoize timeframe labels
    const timeframeLabels = useMemo(() => {
        if (!styleConfig) return null;
        return {
            higher: styleConfig.higher.name,
            mid: styleConfig.mid.name,
            lower: styleConfig.lower.name
        };
    }, [styleConfig]);

    // OPTIMIZATION: Memoize higher TF validation dependencies
    const higherDeps = useMemo(() => ({
        uptrendConfirmed: checklistState.higherTF.uptrendConfirmed,
        above50EMA: checklistState.higherTF.above50EMA,
        emaAlignment: checklistState.higherTF.emaAlignment,
        notConsolidating: checklistState.higherTF.notConsolidating,
        clearFromResistance: checklistState.higherTF.clearFromResistance
    }), [
        checklistState.higherTF.uptrendConfirmed,
        checklistState.higherTF.above50EMA,
        checklistState.higherTF.emaAlignment,
        checklistState.higherTF.notConsolidating,
        checklistState.higherTF.clearFromResistance
    ]);

    // Validate Higher Timeframe
    useEffect(() => {
        if (!tradingStyle || !styleConfig) return;

        const validation = validateHigherTimeframe(
            checklistState.higherTF,
            styleConfig.higher.name,
            tradingStyle
        );
        setHigherValidation(validation);
    }, [higherDeps, tradingStyle, styleConfig, checklistState.higherTF]);

    // OPTIMIZATION: Memoize mid TF validation dependencies
    const midDeps = useMemo(() => ({
        breakoutOrPullback: checklistState.midTF.breakoutOrPullback,
        aboveEMA: checklistState.midTF.aboveEMA,
        volumeConfirmation: checklistState.midTF.volumeConfirmation,
        gapAcceptable: checklistState.midTF.gapAcceptable,
        cleanHigherLow: checklistState.midTF.cleanHigherLow,
        rrAtLeast2to1: checklistState.midTF.rrAtLeast2to1
    }), [
        checklistState.midTF.breakoutOrPullback,
        checklistState.midTF.aboveEMA,
        checklistState.midTF.volumeConfirmation,
        checklistState.midTF.gapAcceptable,
        checklistState.midTF.cleanHigherLow,
        checklistState.midTF.rrAtLeast2to1
    ]);

    // Validate Mid Timeframe
    useEffect(() => {
        if (!tradingStyle || !styleConfig) return;

        const validation = validateMidTimeframe(
            checklistState.midTF,
            styleConfig.mid.name,
            styleConfig.lower.name
        );
        setMidValidation(validation);
    }, [midDeps, tradingStyle, styleConfig, checklistState.midTF]);

    // OPTIMIZATION: Memoize lower TF validation dependencies
    const lowerDeps = useMemo(() => ({
        stopBelowStructure: checklistState.lowerTF.stopBelowStructure,
        stopDistanceOk: checklistState.lowerTF.stopDistanceOk,
        notAfterExtended: checklistState.lowerTF.notAfterExtended,
        retestOrPullback: checklistState.lowerTF.retestOrPullback,
        rrStillValid: checklistState.lowerTF.rrStillValid,
        positionSizeValid: checklistState.lowerTF.positionSizeValid
    }), [
        checklistState.lowerTF.stopBelowStructure,
        checklistState.lowerTF.stopDistanceOk,
        checklistState.lowerTF.notAfterExtended,
        checklistState.lowerTF.retestOrPullback,
        checklistState.lowerTF.rrStillValid,
        checklistState.lowerTF.positionSizeValid
    ]);

    // Validate Lower Timeframe
    useEffect(() => {
        if (!tradingStyle || !styleConfig) return;

        const maxRisk = tradingStyle === 'day' ? 1.0 : 2.0;
        const validation = validateLowerTimeframe(
            checklistState.lowerTF,
            styleConfig.lower.name,
            maxRisk
        );
        setLowerValidation(validation);
    }, [lowerDeps, tradingStyle, styleConfig, checklistState.lowerTF]);

    // Calculate Overall Recommendation
    useEffect(() => {
        if (higherValidation && midValidation && lowerValidation && timeframeLabels) {
            const rec = calculatePositionRecommendation(
                higherValidation,
                midValidation,
                lowerValidation,
                timeframeLabels.higher,
                timeframeLabels.mid,
                timeframeLabels.lower
            );
            setRecommendation(rec);
        }
    }, [higherValidation, midValidation, lowerValidation, timeframeLabels]);

    // OPTIMIZATION: Memoize computed values
    const isMidLocked = useMemo(() =>
        !higherValidation?.isPassed,
        [higherValidation]
    );

    const isLowerLocked = useMemo(() =>
        !midValidation?.isPassed,
        [midValidation]
    );

    const recommendedRiskPercent = useMemo(() =>
        higherValidation?.recommendedRisk ||
        calculateRiskPercent(tradingStyle || 'swing', checklistState.consolidationDetected),
        [higherValidation, tradingStyle, checklistState.consolidationDetected]
    );

    // OPTIMIZATION: Memoize validation results object
    const validationResults = useMemo(() => ({
        higher: higherValidation,
        mid: midValidation,
        lower: lowerValidation
    }), [higherValidation, midValidation, lowerValidation]);

    return {
        higherValidation,
        midValidation,
        lowerValidation,
        recommendation,
        isMidLocked,
        isLowerLocked,
        recommendedRiskPercent,
        timeframeLabels,
        validationResults
    };
}
