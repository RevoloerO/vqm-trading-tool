import React, { useState, useEffect } from 'react';
import ChecklistCheckbox from './ChecklistCheckbox';
import Button from '../Button';
import FormInput from '../FormInput';
import { calculateRiskReward } from '../../utils/tradingCalculators';
import { validateGapPercent, shouldAutoCheckRR } from '../../utils/checklistValidation';
import { getValidationRule, getTooltipGuidance } from '../../utils/TimeframeConfig';

/**
 * Mid Timeframe Check Section Component (Generic)
 * Works for 1-Hour, Daily, or Weekly charts depending on trading style
 * 6 checks plus additional inputs for pattern type and R:R calculation
 * @param {Object} props - Component properties
 * @param {string} props.timeframeName - Name of timeframe (e.g., "1-Hour", "Daily", "Weekly")
 * @param {string} props.timeframeCode - Code of timeframe (e.g., "1hour", "daily", "weekly")
 * @param {string} props.higherTimeframeName - Name of higher timeframe for back button
 * @param {string} props.lowerTimeframeName - Name of lower timeframe for continue button
 * @param {string} props.tradingStyle - Trading style ID for tooltips
 * @param {Object} props.checks - Timeframe check state
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
function MidTimeframeSection({
    timeframeName,
    timeframeCode,
    higherTimeframeName,
    lowerTimeframeName,
    tradingStyle,
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

    // Get validation rules for this timeframe
    const gapRule = getValidationRule('gapTolerance', timeframeCode);
    const volumeRule = getValidationRule('volumeMultiplier', timeframeCode);

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
                // Auto-check R:R if >= 2:1 and not already checked
                const shouldCheck = shouldAutoCheckRR(result.data.rrRatio, 2.0);
                if (shouldCheck && !checks.rrAtLeast2to1) {
                    // Pass true as second parameter to set checked state
                    onCheckChange('rrAtLeast2to1', true);
                }
            } else {
                setRrResult(null);
            }
        } else {
            // Clear result if prices are incomplete
            setRrResult(null);
        }
    }, [prices.entry, prices.stop, prices.target, checks.rrAtLeast2to1, onCheckChange]);

    // Validate gap percentage
    useEffect(() => {
        if (gapPercentage && gapRule) {
            const gap = parseFloat(gapPercentage);
            if (!isNaN(gap)) {
                const isAcceptable = gap <= gapRule.percent;
                setGapValidation({
                    isValid: true,
                    isAcceptable,
                    warning: !isAcceptable ? `⚠️ Gap exceeds ${gapRule.percent}% - Higher risk entry` : null
                });
            }
        } else {
            setGapValidation(null);
        }
    }, [gapPercentage, gapRule]);

    const checkItems = [
        {
            id: 'breakoutOrPullback',
            label: `Clear consolidation breakout OR pullback to support on ${timeframeName}`,
            tooltip: `Identify either a clean breakout from a consolidation range on ${timeframeName} with volume, or a pullback to a support level (EMA, prior breakout level).`
        },
        {
            id: 'aboveEMA',
            label: `Price above ${timeframeName} 20 EMA`,
            tooltip: `Current price should be trading above the 20 EMA on ${timeframeName}, confirming short-term bullish momentum on this timeframe.`
        },
        {
            id: 'volumeConfirmation',
            label: `Volume ${volumeRule?.multiplier || '1.5'}x+ average on ${timeframeName} breakout bar`,
            tooltip: getTooltipGuidance('volumeConfirmation', tradingStyle) ||
                `${volumeRule?.description || `The breakout candle on ${timeframeName} should have strong volume`}, indicating institutional participation.`
        },
        {
            id: 'gapAcceptable',
            label: `Gap < ${gapRule?.percent || '2'}% from ${timeframeName} consolidation`,
            tooltip: getTooltipGuidance('gapValidation', tradingStyle) ||
                `${gapRule?.description || `If entering after a gap on ${timeframeName}, ensure gap is acceptable`} to avoid excessive risk.`
        },
        {
            id: 'cleanHigherLow',
            label: `Clean higher low if pullback setup on ${timeframeName}`,
            tooltip: `For pullback entries on ${timeframeName}, confirm a clean higher low has formed with price holding above the key support level.`
        },
        {
            id: 'rrAtLeast2to1',
            label: `R:R potential at least 2:1`,
            tooltip: `Risk-to-reward ratio should be at least 2:1, meaning potential profit is twice the risk amount. This is critical for profitable trading.`
        }
    ];

    return (
        <div className={`checklist-section ${isLocked ? 'locked' : ''}`}>
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">📈</span>
                    {timeframeName} Chart (Setup)
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
                    <label className="form-label">Pattern Type on {timeframeName}</label>
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
                    label={`Gap from ${timeframeName} Consolidation`}
                    value={gapPercentage}
                    onChange={(e) => onGapPercentageChange(e.target.value)}
                    placeholder={gapRule ? gapRule.percent.toString() : "1.5"}
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
                            id={`mid-${item.id}`}
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
                    Back to {higherTimeframeName}
                </Button>
                <Button
                    type="button"
                    onClick={onContinue}
                    variant="primary"
                    disabled={!validation?.isPassed || isLocked}
                >
                    Continue to {lowerTimeframeName} Checks
                </Button>
            </div>
        </div>
    );
}

export default MidTimeframeSection;
