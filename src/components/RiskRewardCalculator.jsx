import { useState, useEffect, useRef } from 'react';
import { calculateRiskReward } from '../utils/tradingCalculators';
import { useDebounce } from '../hooks/useDebounce';
import { TRADING_LIMITS, VALIDATION_MESSAGES } from '../constants/tradingLimits';
import Button from './Button';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import InfoBadge from './InfoBadge';
import RelationshipError from './RelationshipError';

function RiskRewardCalculator() {
    // State management
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Refs for focus management
    const entryRef = useRef(null);
    const stopRef = useRef(null);
    const targetRef = useRef(null);

    // Debounced values - validation only runs after user stops typing (300ms delay)
    const debouncedEntry = useDebounce(entryPrice, 300);
    const debouncedStop = useDebounce(stopLoss, 300);
    const debouncedTarget = useDebounce(targetPrice, 300);

    // Field-specific error state
    const [errors, setErrors] = useState({
        entry: null,
        stop: null,
        target: null,
        relationship: null
    });

    // Real-time validation for Entry Price
    const validateEntry = (value) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return VALIDATION_MESSAGES.MUST_BE_NUMBER;
        if (!isFinite(num)) return VALIDATION_MESSAGES.MUST_BE_FINITE;
        if (num <= 0) return VALIDATION_MESSAGES.MUST_BE_POSITIVE;
        if (num < TRADING_LIMITS.MIN_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_LOW;
        if (num > TRADING_LIMITS.MAX_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_HIGH;

        return null;
    };

    // Real-time validation for Stop Loss
    const validateStop = (value, entryValue) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return VALIDATION_MESSAGES.MUST_BE_NUMBER;
        if (!isFinite(num)) return VALIDATION_MESSAGES.MUST_BE_FINITE;
        if (num <= 0) return VALIDATION_MESSAGES.MUST_BE_POSITIVE;
        if (num < TRADING_LIMITS.MIN_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_LOW;
        if (num > TRADING_LIMITS.MAX_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_HIGH;

        // Check if stop equals entry (division by zero)
        if (entryValue && parseFloat(entryValue) === num) {
            return VALIDATION_MESSAGES.STOP_EQUALS_ENTRY;
        }

        return null;
    };

    // Real-time validation for Target Price
    const validateTarget = (value) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return VALIDATION_MESSAGES.MUST_BE_NUMBER;
        if (!isFinite(num)) return VALIDATION_MESSAGES.MUST_BE_FINITE;
        if (num <= 0) return VALIDATION_MESSAGES.MUST_BE_POSITIVE;
        if (num < TRADING_LIMITS.MIN_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_LOW;
        if (num > TRADING_LIMITS.MAX_PRICE) return VALIDATION_MESSAGES.PRICE_TOO_HIGH;

        return null;
    };

    // Validate relationship between all three prices
    const validateRelationship = (entry, stop, target) => {
        if (!entry || !stop || !target) return null;

        const e = parseFloat(entry);
        const s = parseFloat(stop);
        const t = parseFloat(target);

        if (isNaN(e) || isNaN(s) || isNaN(t)) return null;

        const isLongPosition = s < e && t > e;
        const isShortPosition = s > e && t < e;

        if (!isLongPosition && !isShortPosition) {
            return VALIDATION_MESSAGES.INVALID_POSITION_SETUP;
        }

        return null;
    };

    // Debounced validation - only runs after user stops typing
    useEffect(() => {
        const entryError = validateEntry(debouncedEntry);
        const stopError = validateStop(debouncedStop, debouncedEntry);
        const targetError = validateTarget(debouncedTarget);
        const relationshipError = validateRelationship(debouncedEntry, debouncedStop, debouncedTarget);

        setErrors({
            entry: entryError,
            stop: stopError,
            target: targetError,
            relationship: relationshipError
        });
    }, [debouncedEntry, debouncedStop, debouncedTarget]);

    // Error focus management - focus first field with error
    useEffect(() => {
        if (errors.entry && entryRef.current) {
            entryRef.current.focus();
        } else if (errors.stop && stopRef.current) {
            stopRef.current.focus();
        } else if (errors.target && targetRef.current) {
            targetRef.current.focus();
        }
    }, [errors.entry, errors.stop, errors.target]);

    // Simplified handlers - just update state, validation happens automatically via debounce
    const handleEntryChange = (e) => {
        setEntryPrice(e.target.value);
    };

    const handleStopChange = (e) => {
        setStopLoss(e.target.value);
    };

    const handleTargetChange = (e) => {
        setTargetPrice(e.target.value);
    };

    // Check if form has any errors
    const hasErrors = () => {
        return errors.entry || errors.stop || errors.target || errors.relationship;
    };

    // Calculation logic using centralized API handler
    const calculateRR = async () => {
        // Set loading state
        setIsCalculating(true);

        // Small delay to show loading state (simulates processing)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Final validation before calculation
        const entryError = validateEntry(entryPrice);
        const stopError = validateStop(stopLoss, entryPrice);
        const targetError = validateTarget(targetPrice);
        const relationshipError = validateRelationship(entryPrice, stopLoss, targetPrice);

        if (entryError || stopError || targetError || relationshipError) {
            setErrors({
                entry: entryError,
                stop: stopError,
                target: targetError,
                relationship: relationshipError
            });
            setResult(null);
            setError('Please fix the errors above before calculating');
            setIsCalculating(false);
            return;
        }

        const response = calculateRiskReward({
            entryPrice,
            stopLoss,
            targetPrice
        });

        if (response.success) {
            setResult(response.data);
            setError(null);
        } else {
            setResult(null);
            setError(response.error);
        }

        setIsCalculating(false);
    };

    // Event handler
    const handleSubmit = (e) => {
        e.preventDefault();
        calculateRR();
    };

    // Clear form data
    function clearData(e) {
        if (e && e.preventDefault) e.preventDefault();
        setEntryPrice('');
        setStopLoss('');
        setTargetPrice('');
        setResult(null);
        setError(null);
        setErrors({
            entry: null,
            stop: null,
            target: null,
            relationship: null
        });
    }

    return (
        <div className="calculator-card">
            <div className="calculator-header">
                <h2 className="calculator-title">Risk/Reward Calculator</h2>
                <p className="calculator-subtitle">Analyze your trade setup with risk-to-reward ratio</p>
            </div>

            <form className="calculator-form" onSubmit={handleSubmit}>
                <FormInput
                    ref={entryRef}
                    label="Entry Price"
                    value={entryPrice}
                    onChange={handleEntryChange}
                    error={errors.entry}
                    placeholder="50.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <FormInput
                    ref={stopRef}
                    label="Stop Loss"
                    value={stopLoss}
                    onChange={handleStopChange}
                    error={errors.stop}
                    placeholder="48.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <FormInput
                    ref={targetRef}
                    label="Target Price"
                    value={targetPrice}
                    onChange={handleTargetChange}
                    error={errors.target}
                    placeholder="56.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <RelationshipError message={errors.relationship} />

                <div className="button-group">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={hasErrors() || isCalculating}
                    >
                        {isCalculating ? 'Calculating...' : 'Calculate R:R'}
                    </Button>
                    <Button
                        type="button"
                        onClick={clearData}
                        variant="secondary"
                        disabled={isCalculating}
                    >
                        Clear
                    </Button>
                </div>
            </form>

            {result && (
                <div className={`results-card ${result.isValidTrade ? 'success' : 'warning'}`}>
                    <h3 className="results-title">Results</h3>
                    <div className="results-grid">
                        <div className="result-item">
                            <span className="result-label">Position Type</span>
                            <span className="result-value">{result.positionType}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">R:R Ratio</span>
                            <span className={`result-value ${result.isValidTrade ? 'success' : 'warning'}`}>
                                1:{result.rrRatio}
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Risk Per Share</span>
                            <span className="result-value risk">${result.riskPerShare}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Reward Per Share</span>
                            <span className="result-value success">${result.rewardPerShare}</span>
                        </div>
                    </div>
                    <InfoBadge
                        message={!result.isValidTrade
                            ? "R:R ratio is below 1:1. Consider adjusting your targets for better risk management."
                            : "Favorable risk/reward ratio detected!"}
                        variant={result.isValidTrade ? "success" : "warning"}
                    />
                </div>
            )}

            <ErrorMessage message={error} />
        </div>
    );
}

export default RiskRewardCalculator;
