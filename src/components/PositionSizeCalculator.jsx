import { useState } from 'react';
import { calculatePositionSize } from '../utils/tradingCalculators';
import Button from './Button';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';

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
                <FormInput
                    label="Account Size"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                    placeholder="10000"
                    prefix="$"
                    required
                />

                <FormInput
                    label="Risk Percent"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    placeholder="2"
                    step="0.1"
                    suffix="%"
                    required
                />

                <FormInput
                    label="Entry Price"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="50.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <FormInput
                    label="Stop Loss"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="48.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <div className="button-group">
                    <Button type="submit" variant="primary">
                        Calculate Position
                    </Button>
                    <Button type="button" onClick={clearData} variant="secondary">
                        Clear
                    </Button>
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

            <ErrorMessage message={error} />
        </div>
    );
}

export default PositionSizeCalculator;
