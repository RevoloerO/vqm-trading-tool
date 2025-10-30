/**
 * Custom Hook: Position Size Calculation
 * Extracts position sizing logic from components
 */

import { useState, useEffect } from 'react';
import { calculatePositionSize } from '../utils/tradingCalculators';
import { shouldAutoCheckPositionSize } from '../utils/checklistValidation';

/**
 * Hook to handle position size calculation and validation
 * @param {Object} positionData - { accountSize, riskPercent, entry, stop }
 * @param {boolean} isPositionSizeChecked - Current checkbox state
 * @param {Function} onAutoCheck - Callback to auto-check when valid
 * @param {number} maxRisk - Maximum acceptable risk percentage
 * @returns {Object} { positionResult, isCalculating, error, riskPercent }
 */
export function usePositionSizeCalculation(
    positionData,
    isPositionSizeChecked,
    onAutoCheck,
    maxRisk = 2.0
) {
    const [positionResult, setPositionResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        // Reset if any field is empty
        if (!positionData.accountSize || !positionData.riskPercent ||
            !positionData.entry || !positionData.stop) {
            setPositionResult(null);
            setError(null);
            return;
        }

        setIsCalculating(true);

        // Calculate position size
        const result = calculatePositionSize({
            accountSize: parseFloat(positionData.accountSize),
            riskPercent: parseFloat(positionData.riskPercent),
            entryPrice: parseFloat(positionData.entry),
            stopLoss: parseFloat(positionData.stop)
        });

        setIsCalculating(false);

        if (result.success) {
            setPositionResult(result.data);
            setError(null);

            // Auto-check if risk is within limits
            const shouldCheck = shouldAutoCheckPositionSize(
                parseFloat(positionData.riskPercent),
                maxRisk
            );
            if (shouldCheck && !isPositionSizeChecked) {
                onAutoCheck(true);
            }
        } else {
            setPositionResult(null);
            setError(result.error);
        }
    }, [
        positionData.accountSize,
        positionData.riskPercent,
        positionData.entry,
        positionData.stop,
        isPositionSizeChecked,
        onAutoCheck,
        maxRisk
    ]);

    return {
        positionResult,
        error,
        isCalculating,
        riskPercent: positionData.riskPercent
    };
}
