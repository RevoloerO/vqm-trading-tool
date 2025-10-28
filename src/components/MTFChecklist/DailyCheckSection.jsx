import React, { useState, useEffect } from 'react';
import ChecklistCheckbox from './ChecklistCheckbox';
import Button from '../Button';
import FormInput from '../FormInput';
import { calculateRiskReward } from '../../utils/tradingCalculators';
import { validateGapPercent, shouldAutoCheckRR } from '../../utils/checklistValidation';

/**
 * Daily Timeframe Check Section Component
 * 6 checks plus additional inputs for pattern type and R:R calculation
 * @param {Object} props - Component properties
 * @param {Object} props.checks - Daily check state
 * @param {Function} props.onCheckChange - Check change handler
 * @param {string} props.patternType - Pattern type: 'breakout' or 'pullback'
 * @param {Function} props.onPatternTypeChange - Pattern type change handler
 * @param {string} props.gapPercentage - Gap percentage value
 * @param {Function} props.onGapPercentageChange - Gap percentage change handler
 * @param {Object} props.prices - Entry, stop, target prices
 * @param {Function} props.onPriceChange - Price change handler
 * @param {Function} props.onContinue - Continue button handler
 * @param {Function} props.onBack - Back button handler
 * @param {Object} props.validation - Validation result
 * @param {boolean} props.isLocked - Whether section is locked
 */
function DailyCheckSection({
    checks,
    onCheckChange,
    patternType,
    onPatternTypeChange,
    gapPercentage,
    onGapPercentageChange,
    prices,
    onPriceChange,
    onContinue,
    onBack,
    validation,
    isLocked
}) {
    const [rrResult, setRrResult] = useState(null);
    const [gapValidation, setGapValidation] = useState(null);

    // Calculate R:R when prices change
    useEffect(() => {
        if (prices.entry && prices.stop && prices.target) {
            const result = calculateRiskReward({
                entryPrice: prices.entry,
                stopLoss: prices.stop,
                targetPrice: prices.target
            });

            if (result.success) {
                setRrResult(result.data);
                // Auto-check R:R if >= 2:1
                const shouldCheck = shouldAutoCheckRR(result.data.rrRatio, 2.0);
                if (shouldCheck && !checks.rrAtLeast2to1) {
                    onCheckChange('rrAtLeast2to1', true);
                }
            } else {
                setRrResult(null);
            }
        }
    }, [prices.entry, prices.stop, prices.target]);

    // Validate gap percentage
    useEffect(() => {
        if (gapPercentage) {
            const result = validateGapPercent(gapPercentage);
            setGapValidation(result);
        } else {
            setGapValidation(null);
        }
    }, [gapPercentage]);

    const checkItems = [
        {
            id: 'breakoutOrPullback',
            label: 'Clear consolidation breakout OR pullback to support',
            tooltip: 'Identify either a clean breakout from a consolidation range with volume, or a pullback to a support level (EMA, prior breakout level).'
        },
        {
            id: 'aboveDaily20EMA',
            label: 'Price above daily 20 EMA',
            tooltip: 'Current price should be trading above the 20-day EMA, confirming short-term bullish momentum on the daily timeframe.'
        },
        {
            id: 'volumeConfirmation',
            label: 'Volume 1.5x+ average on breakout bar',
            tooltip: 'The breakout candle should have at least 1.5x the average volume, indicating strong participation and conviction.'
        },
        {
            id: 'gapUnder2Percent',
            label: 'Gap < 2% from consolidation',
            tooltip: 'If entering after a gap, ensure the gap is less than 2% from the consolidation range to avoid excessive risk.'
        },
        {
            id: 'cleanHigherLow',
            label: 'Clean higher low if pullback setup',
            tooltip: 'For pullback entries, confirm a clean higher low has formed with price holding above the key support level.'
        },
        {
            id: 'rrAtLeast2to1',
            label: 'R:R potential at least 2:1',
            tooltip: 'Risk-to-reward ratio should be at least 2:1, meaning potential profit is twice the risk amount.'
        }
    ];

    return (
        <div className={`checklist-section ${isLocked ? 'locked' : ''}`}>
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">📈</span>
                    Daily Timeframe Checks
                </h3>
                <p className="checklist-section-subtitle">
                    Identify the setup - pattern, structure, and risk/reward
                </p>
                {validation && (
                    <div className="checklist-counter">
                        {validation.passedCount} of {validation.totalChecks} checks completed
                    </div>
                )}
            </div>

            <div className="checklist-section-body">
                {/* Pattern Type Selection */}
                <div className="form-group">
                    <label className="form-label">Pattern Type</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="patternType"
                                value="breakout"
                                checked={patternType === 'breakout'}
                                onChange={(e) => onPatternTypeChange(e.target.value)}
                                disabled={isLocked}
                            />
                            <span>Breakout</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="patternType"
                                value="pullback"
                                checked={patternType === 'pullback'}
                                onChange={(e) => onPatternTypeChange(e.target.value)}
                                disabled={isLocked}
                            />
                            <span>Pullback</span>
                        </label>
                    </div>
                </div>

                {/* Gap Percentage Input */}
                <FormInput
                    label="Gap from Consolidation"
                    value={gapPercentage}
                    onChange={(e) => onGapPercentageChange(e.target.value)}
                    placeholder="1.5"
                    step="0.1"
                    suffix="%"
                    disabled={isLocked}
                    error={gapValidation && !gapValidation.isValid ? gapValidation.error : null}
                />

                {gapValidation?.warning && (
                    <div className="checklist-warning small">
                        <span className="warning-icon">⚠️</span>
                        <span>{gapValidation.warning}</span>
                    </div>
                )}

                {/* Price Inputs for R:R Calculation */}
                <div className="price-inputs-grid">
                    <FormInput
                        label="Entry Price"
                        value={prices.entry}
                        onChange={(e) => onPriceChange('entry', e.target.value)}
                        placeholder="50.00"
                        step="0.01"
                        prefix="$"
                        disabled={isLocked}
                    />
                    <FormInput
                        label="Stop Loss"
                        value={prices.stop}
                        onChange={(e) => onPriceChange('stop', e.target.value)}
                        placeholder="48.00"
                        step="0.01"
                        prefix="$"
                        disabled={isLocked}
                    />
                    <FormInput
                        label="Target Price"
                        value={prices.target}
                        onChange={(e) => onPriceChange('target', e.target.value)}
                        placeholder="56.00"
                        step="0.01"
                        prefix="$"
                        disabled={isLocked}
                    />
                </div>

                {/* R:R Result Display */}
                {rrResult && (
                    <div className={`rr-result-inline ${rrResult.isValidTrade ? 'success' : 'warning'}`}>
                        <div className="rr-result-item">
                            <span className="rr-label">R:R Ratio:</span>
                            <span className="rr-value">1:{rrResult.rrRatio}</span>
                        </div>
                        <div className="rr-result-item">
                            <span className="rr-label">Risk/Share:</span>
                            <span className="rr-value">${rrResult.riskPerShare}</span>
                        </div>
                        <div className="rr-result-item">
                            <span className="rr-label">Reward/Share:</span>
                            <span className="rr-value">${rrResult.rewardPerShare}</span>
                        </div>
                    </div>
                )}

                {/* Checkboxes */}
                <div className="checklist-items">
                    {checkItems.map((item) => (
                        <ChecklistCheckbox
                            key={item.id}
                            id={`daily-${item.id}`}
                            label={item.label}
                            checked={checks[item.id]}
                            onChange={() => onCheckChange(item.id)}
                            disabled={isLocked}
                            tooltip={item.tooltip}
                            autoChecked={item.id === 'rrAtLeast2to1' && rrResult && shouldAutoCheckRR(rrResult.rrRatio)}
                        />
                    ))}
                </div>

                {/* Validation Message */}
                {validation && (
                    <div className={`validation-message ${validation.isPassed ? 'success' : 'pending'}`}>
                        {validation.message}
                    </div>
                )}
            </div>

            <div className="checklist-section-footer">
                <Button
                    type="button"
                    onClick={onBack}
                    variant="secondary"
                    disabled={isLocked}
                >
                    Back to Weekly
                </Button>
                <Button
                    type="button"
                    onClick={onContinue}
                    variant="primary"
                    disabled={!validation?.isPassed || isLocked}
                >
                    Continue to 4-Hour Checks
                </Button>
            </div>
        </div>
    );
}

export default DailyCheckSection;
