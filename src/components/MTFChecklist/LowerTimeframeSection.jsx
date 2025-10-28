import React, { useState, useEffect } from 'react';
import ChecklistCheckbox from './ChecklistCheckbox';
import Button from '../Button';
import FormInput from '../FormInput';
import { calculatePositionSize } from '../../utils/tradingCalculators';
import { shouldAutoCheckPositionSize } from '../../utils/checklistValidation';

/**
 * Lower Timeframe Check Section Component (Generic)
 * Works for 15-Min, 4-Hour, or Daily charts depending on trading style
 * 6 checks plus position size calculator integration
 * @param {Object} props - Component properties
 * @param {string} props.timeframeName - Name of timeframe (e.g., "15-Minute", "4-Hour", "Daily")
 * @param {string} props.timeframeCode - Code of timeframe (e.g., "15min", "4hour", "daily")
 * @param {string} props.midTimeframeName - Name of mid timeframe for back button
 * @param {string} props.tradingStyle - Trading style ID
 * @param {Object} props.checks - Timeframe check state
 * @param {Function} props.onCheckChange - Check change handler
 * @param {Object} props.positionData - Position size calculation inputs
 * @param {Function} props.onPositionDataChange - Position data change handler
 * @param {number} props.recommendedRiskPercent - Recommended risk % based on higher timeframe
 * @param {Function} props.onContinue - Continue button handler
 * @param {Function} props.onBack - Back button handler
 * @param {Object} props.validation - Validation result
 * @param {boolean} props.isLocked - Whether section is locked
 */
function LowerTimeframeSection({
    timeframeName,
    timeframeCode,
    midTimeframeName,
    tradingStyle,
    checks,
    onCheckChange,
    positionData,
    onPositionDataChange,
    recommendedRiskPercent,
    onContinue,
    onBack,
    validation,
    isLocked
}) {
    const [positionResult, setPositionResult] = useState(null);
    const [positionError, setPositionError] = useState(null);

    // Calculate position size when inputs change
    useEffect(() => {
        if (positionData.accountSize && positionData.riskPercent && positionData.entry && positionData.stop) {
            const result = calculatePositionSize({
                accountSize: positionData.accountSize,
                riskPercent: positionData.riskPercent,
                entryPrice: positionData.entry,
                stopLoss: positionData.stop
            });

            if (result.success) {
                setPositionResult(result.data);
                setPositionError(null);

                // Auto-check position size if risk is within limits
                const actualRisk = parseFloat(positionData.riskPercent);
                const maxRisk = tradingStyle === 'day' ? 1.0 : 2.0;
                const shouldCheck = shouldAutoCheckPositionSize(actualRisk, maxRisk);
                if (shouldCheck && !checks.positionSizeValid) {
                    onCheckChange('positionSizeValid', true);
                }
            } else {
                setPositionResult(null);
                setPositionError(result.error);
            }
        }
    }, [positionData.accountSize, positionData.riskPercent, positionData.entry, positionData.stop, tradingStyle]);

    const checkItems = [
        {
            id: 'stopBelowStructure',
            label: `Can place stop below ${timeframeName} structure (swing low)`,
            tooltip: `Ensure you can place your stop loss below a clear ${timeframeName} swing low, providing proper structure protection without excessive distance.`
        },
        {
            id: 'stopDistanceOk',
            label: `Stop distance on ${timeframeName} allows proper position size`,
            tooltip: `The distance to your stop on ${timeframeName} should allow for a reasonable position size. If stop is too far, position size becomes too small to be worthwhile.`
        },
        {
            id: 'notAfterExtended',
            label: `NOT entering after 3+ consecutive up-bars on ${timeframeName}`,
            tooltip: `Avoid entering after 3 or more consecutive bullish bars on ${timeframeName}, as price may be overextended and due for a pullback or consolidation.`
        },
        {
            id: 'retestOrPullback',
            label: `Retest of breakout level OR first pullback on ${timeframeName}`,
            tooltip: `Entry should be on a retest of the breakout level or the first pullback after breakout on ${timeframeName}, not chasing extended moves.`
        },
        {
            id: 'rrStillValid',
            label: `R:R still 2:1+ after ${timeframeName} gap adjustment`,
            tooltip: `After accounting for any gap and final stop placement on ${timeframeName}, ensure risk-to-reward ratio is still at least 2:1.`
        },
        {
            id: 'positionSizeValid',
            label: `Position size calculated and within ${recommendedRiskPercent}% risk`,
            tooltip: `Calculated position size should keep total risk at or below ${recommendedRiskPercent}% of account. This is critical for long-term capital preservation.`
        }
    ];

    const maxRisk = tradingStyle === 'day' ? 1.0 : 2.0;

    return (
        <div className={`checklist-section ${isLocked ? 'locked' : ''}`}>
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">⏰</span>
                    {timeframeName} Chart (Entry Trigger)
                </h3>
                <p className="checklist-section-subtitle">
                    Fine-tune the entry - timing, structure, and position size
                </p>
                {validation && (
                    <div className="checklist-counter">
                        {validation.passedCount} of {validation.totalChecks} checks completed
                    </div>
                )}
            </div>

            <div className="checklist-section-body">
                {/* Position Size Calculator */}
                <div className="position-calculator-inline">
                    <h4 className="inline-calc-title">Position Size Calculator</h4>

                    {recommendedRiskPercent < maxRisk * 100 && (
                        <div className="risk-recommendation">
                            <span className="warning-icon">⚠️</span>
                            <span>Recommended risk: {recommendedRiskPercent}% (due to higher timeframe consolidation)</span>
                        </div>
                    )}

                    <div className="position-inputs-grid">
                        <FormInput
                            label="Account Size"
                            value={positionData.accountSize}
                            onChange={(e) => onPositionDataChange('accountSize', e.target.value)}
                            placeholder="10000"
                            prefix="$"
                            disabled={isLocked}
                        />
                        <FormInput
                            label="Risk Percent"
                            value={positionData.riskPercent}
                            onChange={(e) => onPositionDataChange('riskPercent', e.target.value)}
                            placeholder={recommendedRiskPercent.toString()}
                            step="0.1"
                            suffix="%"
                            disabled={isLocked}
                        />
                        <FormInput
                            label="Entry Price"
                            value={positionData.entry}
                            onChange={(e) => onPositionDataChange('entry', e.target.value)}
                            placeholder="50.00"
                            step="0.01"
                            prefix="$"
                            disabled={isLocked}
                        />
                        <FormInput
                            label="Stop Loss"
                            value={positionData.stop}
                            onChange={(e) => onPositionDataChange('stop', e.target.value)}
                            placeholder="48.00"
                            step="0.01"
                            prefix="$"
                            disabled={isLocked}
                        />
                    </div>

                    {/* Position Result Display */}
                    {positionResult && (
                        <div className="position-result-inline success">
                            <div className="position-result-item highlight">
                                <span className="position-label">Shares to Buy:</span>
                                <span className="position-value">{positionResult.shares}</span>
                            </div>
                            <div className="position-result-item">
                                <span className="position-label">Position Value:</span>
                                <span className="position-value">${positionResult.positionValue}</span>
                            </div>
                            <div className="position-result-item">
                                <span className="position-label">Dollar Risk:</span>
                                <span className="position-value risk">${positionResult.riskAmount}</span>
                            </div>
                            <div className="position-result-item">
                                <span className="position-label">% of Account:</span>
                                <span className="position-value">{positionResult.percentOfAccount}%</span>
                            </div>
                        </div>
                    )}

                    {positionError && (
                        <div className="field-error">{positionError}</div>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="checklist-items">
                    {checkItems.map((item) => (
                        <ChecklistCheckbox
                            key={item.id}
                            id={`lower-${item.id}`}
                            label={item.label}
                            checked={checks[item.id]}
                            onChange={() => onCheckChange(item.id)}
                            disabled={isLocked}
                            tooltip={item.tooltip}
                            autoChecked={
                                item.id === 'positionSizeValid' &&
                                positionResult &&
                                shouldAutoCheckPositionSize(parseFloat(positionData.riskPercent), maxRisk)
                            }
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
                    Back to {midTimeframeName}
                </Button>
                <Button
                    type="button"
                    onClick={onContinue}
                    variant="primary"
                    disabled={!validation?.isPassed || isLocked}
                >
                    View Final Decision
                </Button>
            </div>
        </div>
    );
}

export default LowerTimeframeSection;
