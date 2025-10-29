/**
 * Centralized API handler for trading calculations
 * Following the API handler pattern for centralized logic
 */

import type {
  RiskRewardInputs,
  RiskRewardResponse,
  PositionSizeInputs,
  PositionSizeResponse
} from '../types/trading';

/**
 * Calculate Risk/Reward metrics with comprehensive validation
 */
export function calculateRiskReward({ entryPrice, stopLoss, targetPrice }: RiskRewardInputs): RiskRewardResponse {
    try {
        // Step 1: Type checking and conversion
        const entry = parseFloat(String(entryPrice));
        const stop = parseFloat(String(stopLoss));
        const target = parseFloat(String(targetPrice));

        // Step 2: Check for invalid numbers
        if (isNaN(entry) || isNaN(stop) || isNaN(target)) {
            return {
                success: false,
                error: 'All fields must contain valid numbers',
                field: 'all'
            };
        }

        // Step 3: Check for infinity (division by zero upstream)
        if (!isFinite(entry) || !isFinite(stop) || !isFinite(target)) {
            return {
                success: false,
                error: 'Values must be finite numbers',
                field: 'all'
            };
        }

        // Step 4: Range validation
        if (entry <= 0 || stop <= 0 || target <= 0) {
            return {
                success: false,
                error: 'All prices must be greater than zero',
                field: entry <= 0 ? 'entry' : stop <= 0 ? 'stop' : 'target'
            };
        }

        // Step 5: Reasonable limits (prevent abuse)
        const MAX_PRICE = 1000000; // $1M per share is absurd
        if (entry > MAX_PRICE || stop > MAX_PRICE || target > MAX_PRICE) {
            return {
                success: false,
                error: `Prices must be below $${MAX_PRICE.toLocaleString()}`,
                field: 'all'
            };
        }

        // Step 6: Business logic validation
        const isLongPosition = stop < entry && target > entry;
        const isShortPosition = stop > entry && target < entry;

        if (!isLongPosition && !isShortPosition) {
            return {
                success: false,
                error: 'Invalid setup. Long: Stop < Entry < Target. Short: Target < Entry < Stop',
                field: 'relationship'
            };
        }

        // Step 7: Calculate (now safe)
        const riskPerShare = Math.abs(entry - stop);
        const rewardPerShare = Math.abs(target - entry);

        // Step 8: Check for division by zero
        if (riskPerShare === 0) {
            return {
                success: false,
                error: 'Stop loss cannot equal entry price',
                field: 'stop'
            };
        }

        const rrRatio = rewardPerShare / riskPerShare;

        return {
            success: true,
            data: {
                riskPerShare: riskPerShare.toFixed(2),
                rewardPerShare: rewardPerShare.toFixed(2),
                rrRatio: rrRatio.toFixed(2),
                positionType: isLongPosition ? 'Long' : 'Short',
                isValidTrade: rrRatio >= 1
            }
        };

    } catch (error) {
        // Unexpected errors
        return {
            success: false,
            error: 'Calculation failed. Please check your inputs.',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Calculate Position Size with comprehensive validation
 */
export function calculatePositionSize({ accountSize, riskPercent, entryPrice, stopLoss }: PositionSizeInputs): PositionSizeResponse {
    try {
        // Step 1: Type checking and conversion
        const account = parseFloat(String(accountSize));
        const riskPct = parseFloat(String(riskPercent));
        const entry = parseFloat(String(entryPrice));
        const stop = parseFloat(String(stopLoss));

        // Step 2: Check for invalid numbers
        if (isNaN(account) || isNaN(riskPct) || isNaN(entry) || isNaN(stop)) {
            return {
                success: false,
                error: 'All fields must contain valid numbers',
                field: 'all'
            };
        }

        // Step 3: Check for infinity
        if (!isFinite(account) || !isFinite(riskPct) || !isFinite(entry) || !isFinite(stop)) {
            return {
                success: false,
                error: 'Values must be finite numbers',
                field: 'all'
            };
        }

        // Step 4: Range validation - Account size
        if (account <= 0) {
            return {
                success: false,
                error: 'Account size must be greater than zero',
                field: 'accountSize'
            };
        }

        const MAX_ACCOUNT = 100000000; // $100M is reasonable max
        if (account > MAX_ACCOUNT) {
            return {
                success: false,
                error: `Account size must be below $${MAX_ACCOUNT.toLocaleString()}`,
                field: 'accountSize'
            };
        }

        // Step 5: Range validation - Risk percent
        if (riskPct <= 0 || riskPct > 100) {
            return {
                success: false,
                error: 'Risk percent must be between 0 and 100',
                field: 'riskPercent'
            };
        }

        // Warn about high risk (optional, but good practice)
        if (riskPct > 10) {
            console.warn('Risk percent exceeds 10% - high risk detected');
        }

        // Step 6: Range validation - Prices
        if (entry <= 0 || stop <= 0) {
            return {
                success: false,
                error: 'Entry price and stop loss must be greater than zero',
                field: entry <= 0 ? 'entryPrice' : 'stopLoss'
            };
        }

        const MAX_PRICE = 1000000; // $1M per share
        if (entry > MAX_PRICE || stop > MAX_PRICE) {
            return {
                success: false,
                error: `Prices must be below $${MAX_PRICE.toLocaleString()}`,
                field: 'all'
            };
        }

        // Step 7: Business logic validation (long position only)
        if (entry <= stop) {
            return {
                success: false,
                error: 'Entry price must be greater than stop loss (long position)',
                field: 'relationship'
            };
        }

        // Step 8: Calculate (now safe)
        const risk = riskPct / 100;
        const riskAmount = account * risk;
        const riskPerShare = Math.abs(entry - stop);

        // Step 9: Check for division by zero
        if (riskPerShare === 0) {
            return {
                success: false,
                error: 'Stop loss cannot equal entry price',
                field: 'stopLoss'
            };
        }

        // Step 10: Calculate position size
        const shares = Math.floor(riskAmount / riskPerShare);
        const positionValue = shares * entry;

        // Step 11: Sanity check - position size
        if (shares === 0) {
            return {
                success: false,
                error: 'Risk amount too small to buy any shares. Increase account size or risk percent.',
                field: 'calculation'
            };
        }

        if (positionValue > account) {
            return {
                success: false,
                error: 'Position value exceeds account size. Check your inputs.',
                field: 'calculation'
            };
        }

        return {
            success: true,
            data: {
                shares,
                positionValue: positionValue.toFixed(2),
                riskAmount: riskAmount.toFixed(2),
                riskPerShare: riskPerShare.toFixed(2),
                percentOfAccount: ((positionValue / account) * 100).toFixed(2)
            }
        };

    } catch (error) {
        // Unexpected errors
        return {
            success: false,
            error: 'Calculation failed. Please check your inputs.',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
