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
export function useMTFValidationOptimized(state, styleConfig) {
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
        uptrendConfirmed: state.higherTF.uptrendConfirmed,
        above50EMA: state.higherTF.above50EMA,
        emaAlignment: state.higherTF.emaAlignment,
        notConsolidating: state.higherTF.notConsolidating,
        clearFromResistance: state.higherTF.clearFromResistance
    }), [
        state.higherTF.uptrendConfirmed,
        state.higherTF.above50EMA,
        state.higherTF.emaAlignment,
        state.higherTF.notConsolidating,
        state.higherTF.clearFromResistance
    ]);

    // Validate Higher Timeframe
    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const validation = validateHigherTimeframe(
            state.higherTF,
            styleConfig.higher.name,
            state.tradingStyle
        );
        setHigherValidation(validation);
    }, [higherDeps, state.tradingStyle, styleConfig]);

    // OPTIMIZATION: Memoize mid TF validation dependencies
    const midDeps = useMemo(() => ({
        breakoutOrPullback: state.midTF.breakoutOrPullback,
        aboveEMA: state.midTF.aboveEMA,
        volumeConfirmation: state.midTF.volumeConfirmation,
        gapAcceptable: state.midTF.gapAcceptable,
        cleanHigherLow: state.midTF.cleanHigherLow,
        rrAtLeast2to1: state.midTF.rrAtLeast2to1
    }), [
        state.midTF.breakoutOrPullback,
        state.midTF.aboveEMA,
        state.midTF.volumeConfirmation,
        state.midTF.gapAcceptable,
        state.midTF.cleanHigherLow,
        state.midTF.rrAtLeast2to1
    ]);

    // Validate Mid Timeframe
    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const validation = validateMidTimeframe(
            state.midTF,
            styleConfig.mid.name,
            styleConfig.lower.name
        );
        setMidValidation(validation);
    }, [midDeps, state.tradingStyle, styleConfig]);

    // OPTIMIZATION: Memoize lower TF validation dependencies
    const lowerDeps = useMemo(() => ({
        stopBelowStructure: state.lowerTF.stopBelowStructure,
        stopDistanceOk: state.lowerTF.stopDistanceOk,
        notAfterExtended: state.lowerTF.notAfterExtended,
        retestOrPullback: state.lowerTF.retestOrPullback,
        rrStillValid: state.lowerTF.rrStillValid,
        positionSizeValid: state.lowerTF.positionSizeValid
    }), [
        state.lowerTF.stopBelowStructure,
        state.lowerTF.stopDistanceOk,
        state.lowerTF.notAfterExtended,
        state.lowerTF.retestOrPullback,
        state.lowerTF.rrStillValid,
        state.lowerTF.positionSizeValid
    ]);

    // Validate Lower Timeframe
    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const maxRisk = state.tradingStyle === 'day' ? 1.0 : 2.0;
        const validation = validateLowerTimeframe(
            state.lowerTF,
            styleConfig.lower.name,
            maxRisk
        );
        setLowerValidation(validation);
    }, [lowerDeps, state.tradingStyle, styleConfig]);

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
        calculateRiskPercent(state.tradingStyle || 'swing', state.consolidationDetected),
        [higherValidation, state.tradingStyle, state.consolidationDetected]
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
