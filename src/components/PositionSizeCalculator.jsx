import React, { useState } from 'react';
import { calculatePositionSize } from '../utils/tradingCalculators';

function PositionSizeCalculator() {
    // State management
    const [accountSize, setAccountSize] = useState('');
    const [riskPercent, setRiskPercent] = useState('');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Calculation logic using centralized API handler
    const calculatePosition = () => {
        const response = calculatePositionSize({
            accountSize,
            riskPercent,
            entryPrice,
            stopLoss
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
        calculatePosition();
    };

    function clearData(e) {
        if (e && e.preventDefault) e.preventDefault();
        setAccountSize("");
        setRiskPercent("");
        setEntryPrice("");
        setStopLoss("");
        setResult(null);
        setError(null);
    }

    return (
        <div className="calculator-card">
            <div className="calculator-header">
                <h2 className="calculator-title">Position Size Calculator</h2>
                <p className="calculator-subtitle">Calculate optimal position sizing based on your risk tolerance</p>
            </div>

            <form className="calculator-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Account Size</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className="form-input"
                            value={accountSize}
                            onChange={(e) => setAccountSize(e.target.value)}
                            placeholder="10000"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Risk Percent</label>
                    <div className="input-wrapper">
                        <input
                            type="number"
                            className="form-input"
                            step="0.1"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(e.target.value)}
                            placeholder="2"
                            required
                        />
                        <span className="input-suffix">%</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Entry Price</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className="form-input"
                            step="0.01"
                            value={entryPrice}
                            onChange={(e) => setEntryPrice(e.target.value)}
                            placeholder="50.00"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Stop Loss</label>
                    <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            className="form-input"
                            step="0.01"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            placeholder="48.00"
                            required
                        />
                    </div>
                </div>

                <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                        <span className="btn-text">Calculate Position</span>
                    </button>
                    <button type="button" onClick={clearData} className="btn btn-secondary">
                        <span className="btn-text">Clear</span>
                    </button>
                </div>
            </form>

            {result && (
                <div className="results-card success">
                    <h3 className="results-title">Results</h3>
                    <div className="results-grid">
                        <div className="result-item">
                            <span className="result-label">Shares to Buy</span>
                            <span className="result-value primary">{result.shares}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Position Value</span>
                            <span className="result-value">${result.positionValue}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Dollar Risk</span>
                            <span className="result-value risk">${result.riskAmount}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Risk Per Share</span>
                            <span className="result-value">${result.riskPerShare}</span>
                        </div>
                        {result.percentOfAccount && (
                            <div className="result-item">
                                <span className="result-label">% of Account</span>
                                <span className="result-value">{result.percentOfAccount}%</span>
                            </div>
                        )}
                    </div>
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

export default PositionSizeCalculator;
