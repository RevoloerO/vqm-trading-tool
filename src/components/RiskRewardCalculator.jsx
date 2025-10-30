import { useState, useEffect, useMemo } from 'react';
import { calculateRiskReward } from '../utils/tradingCalculators';
import { useDebounce } from '../hooks/useDebounce';
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

    const MAX_PRICE = 100000; // Max $100k per share

    // Real-time validation for Entry Price
    const validateEntry = (value) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return 'Must be a valid number';
        if (!isFinite(num)) return 'Must be a finite number';
        if (num <= 0) return 'Must be greater than zero';
        if (num > MAX_PRICE) return `Cannot exceed $${MAX_PRICE.toLocaleString()}`;

        return null;
    };

    // Real-time validation for Stop Loss
    const validateStop = (value, entryValue) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return 'Must be a valid number';
        if (!isFinite(num)) return 'Must be a finite number';
        if (num <= 0) return 'Must be greater than zero';
        if (num > MAX_PRICE) return `Cannot exceed $${MAX_PRICE.toLocaleString()}`;

        // Check if stop equals entry (division by zero)
        if (entryValue && parseFloat(entryValue) === num) {
            return 'Cannot equal entry price';
        }

        return null;
    };

    // Real-time validation for Target Price
    const validateTarget = (value) => {
        if (!value || value === '') return null;

        const num = parseFloat(value);
        if (isNaN(num)) return 'Must be a valid number';
        if (!isFinite(num)) return 'Must be a finite number';
        if (num <= 0) return 'Must be greater than zero';
        if (num > MAX_PRICE) return `Cannot exceed $${MAX_PRICE.toLocaleString()}`;

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
            return 'Invalid setup. Long: Stop < Entry < Target. Short: Target < Entry < Stop';
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
    const calculateRR = () => {
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
                        disabled={hasErrors()}
                    >
                        Calculate R:R
                    </Button>
                    <Button type="button" onClick={clearData} variant="secondary">
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
