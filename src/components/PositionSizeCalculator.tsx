import React, { useState, FormEvent, ChangeEvent } from 'react';
import { calculatePositionSize } from '../utils/tradingCalculators';
import type { PositionSizeResult } from '../types/trading';
import Button from './Button';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';

function PositionSizeCalculator(): JSX.Element {
    // State management
    const [accountSize, setAccountSize] = useState<string>('');
    const [riskPercent, setRiskPercent] = useState<string>('');
    const [entryPrice, setEntryPrice] = useState<string>('');
    const [stopLoss, setStopLoss] = useState<string>('');
    const [result, setResult] = useState<PositionSizeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Calculation logic using centralized API handler
    const calculatePosition = (): void => {
        const response = calculatePositionSize({
            accountSize: parseFloat(accountSize),
            riskPercent: parseFloat(riskPercent),
            entryPrice: parseFloat(entryPrice),
            stopLoss: parseFloat(stopLoss)
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
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        calculatePosition();
    };

    function clearData(e?: React.MouseEvent<HTMLButtonElement>): void {
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountSize(e.target.value)}
                    placeholder="10000"
                    prefix="$"
                    required
                />

                <FormInput
                    label="Risk Percent"
                    value={riskPercent}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRiskPercent(e.target.value)}
                    placeholder="2"
                    step="0.1"
                    suffix="%"
                    required
                />

                <FormInput
                    label="Entry Price"
                    value={entryPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEntryPrice(e.target.value)}
                    placeholder="50.00"
                    step="0.01"
                    prefix="$"
                    required
                />

                <FormInput
                    label="Stop Loss"
                    value={stopLoss}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setStopLoss(e.target.value)}
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
