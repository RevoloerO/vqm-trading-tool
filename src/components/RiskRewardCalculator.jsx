import React, { useState, useEffect } from 'react';
import { calculateRiskReward } from '../utils/tradingCalculators';

function RiskRewardCalculator() {
    // State management
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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

    // Handle Entry Price change
    const handleEntryChange = (e) => {
        const value = e.target.value;
        setEntryPrice(value);

        const entryError = validateEntry(value);
        const stopError = validateStop(stopLoss, value);
        const relationshipError = validateRelationship(value, stopLoss, targetPrice);

        setErrors({
            ...errors,
            entry: entryError,
            stop: stopError || errors.stop,
            relationship: relationshipError
        });
    };

    // Handle Stop Loss change
    const handleStopChange = (e) => {
        const value = e.target.value;
        setStopLoss(value);

        const stopError = validateStop(value, entryPrice);
        const relationshipError = validateRelationship(entryPrice, value, targetPrice);

        setErrors({
            ...errors,
            stop: stopError,
            relationship: relationshipError
        });
    };

    // Handle Target Price change
    const handleTargetChange = (e) => {
        const value = e.target.value;
        setTargetPrice(value);

        const targetError = validateTarget(value);
        const relationshipError = validateRelationship(entryPrice, stopLoss, value);

        setErrors({
            ...errors,
            target: targetError,
            relationship: relationshipError
        });
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
                <div className="form-group">
                    <label className="form-label">Entry Price</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className={`form-input ${errors.entry ? 'error' : ''}`}
                            step="0.01"
                            value={entryPrice}
                            onChange={handleEntryChange}
                            placeholder="50.00"
                            required
                        />
                    </div>
                    {errors.entry && <span className="field-error">{errors.entry}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Stop Loss</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className={`form-input ${errors.stop ? 'error' : ''}`}
                            step="0.01"
                            value={stopLoss}
                            onChange={handleStopChange}
                            placeholder="48.00"
                            required
                        />
                    </div>
                    {errors.stop && <span className="field-error">{errors.stop}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Target Price</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className={`form-input ${errors.target ? 'error' : ''}`}
                            step="0.01"
                            value={targetPrice}
                            onChange={handleTargetChange}
                            placeholder="56.00"
                            required
                        />
                    </div>
                    {errors.target && <span className="field-error">{errors.target}</span>}
                </div>

                {errors.relationship && (
                    <div className="relationship-error">
                        <span className="field-error">{errors.relationship}</span>
                    </div>
                )}

                <div className="button-group">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={hasErrors()}
                    >
                        <span className="btn-text">Calculate R:R</span>
                    </button>
                    <button type="button" onClick={clearData} className="btn btn-secondary">
                        <span className="btn-text">Clear</span>
                    </button>
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
                    {!result.isValidTrade && (
                        <div className="info-badge warning">
                            R:R ratio is below 1:1. Consider adjusting your targets for better risk management.
                        </div>
                    )}
                    {result.isValidTrade && (
                        <div className="info-badge success">
                            Favorable risk/reward ratio detected!
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="results-card error">
                    <h3 className="results-title">Error</h3>
                    <p className="error-message">{error}</p>
                </div>
            )}
        </div>
    );
}

export default RiskRewardCalculator;
