/**
 * Custom Hook: Risk/Reward Calculation
 * Extracts R/R calculation logic from components
 * Follows Single Responsibility Principle
 */

import { useState, useEffect } from 'react';
import { calculateRiskReward } from '../utils/tradingCalculators';
import { shouldAutoCheckRR } from '../utils/checklistValidation';

/**
 * Hook to handle R/R calculation and auto-checking
 * @param {Object} prices - { entry, stop, target }
 * @param {boolean} isRRChecked - Current state of R/R checkbox
 * @param {Function} onAutoCheck - Callback to auto-check R/R when valid
 * @param {number} minRatio - Minimum R/R ratio required (default 2.0)
 * @returns {Object} { rrResult, isCalculating, error }
 */
export function useRiskRewardCalculation(prices, isRRChecked, onAutoCheck, minRatio = 2.0) {
    const [rrResult, setRrResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        // Reset if any price is empty
        if (!prices.entry || !prices.stop || !prices.target) {
            setRrResult(null);
            setError(null);
            return;
        }

        setIsCalculating(true);

        // Calculate R/R
        const result = calculateRiskReward({
            entryPrice: parseFloat(prices.entry),
            stopLoss: parseFloat(prices.stop),
            targetPrice: parseFloat(prices.target)
        });

        setIsCalculating(false);

        if (result.success) {
            setRrResult(result.data);
            setError(null);

            // Auto-check if meets minimum ratio and not already checked
            const shouldCheck = shouldAutoCheckRR(result.data.rrRatio, minRatio);
            if (shouldCheck && !isRRChecked) {
                onAutoCheck(true);
            }
        } else {
            setRrResult(null);
            setError(result.error);
        }
    }, [prices.entry, prices.stop, prices.target, isRRChecked, onAutoCheck, minRatio]);

    return {
        rrResult,
        error,
        isCalculating
    };
}
