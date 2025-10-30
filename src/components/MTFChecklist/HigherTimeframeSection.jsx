import { memo } from 'react';
import ChecklistCheckbox from './ChecklistCheckbox';
import Button from '../Button';
import { getValidationRule, getTooltipGuidance } from '../../utils/TimeframeConfig';

/**
 * Higher Timeframe Check Section Component (Generic)
 * Works for Daily, Weekly, or Monthly charts depending on trading style
 * 5 checks for trend context validation
 * @param {Object} props - Component properties
 * @param {string} props.timeframeName - Name of timeframe (e.g., "Daily", "Weekly", "Monthly")
 * @param {string} props.timeframeCode - Code of timeframe (e.g., "daily", "weekly", "monthly")
 * @param {string} props.tradingStyle - Trading style ID for tooltips
 * @param {Object} props.checks - Timeframe check state
 * @param {Function} props.onCheckChange - Check change handler
 * @param {Function} props.onContinue - Continue button handler
 * @param {Object} props.validation - Validation result
 * @param {boolean} props.isLocked - Whether section is locked
 */
function HigherTimeframeSection({
    timeframeName,
    timeframeCode,
    tradingStyle,
    checks,
    onCheckChange,
    onContinue,
    validation,
    isLocked
}) {
    // Get consolidation period rule for this timeframe
    const consolidationRule = getValidationRule('consolidationPeriod', timeframeCode);

    const checkItems = [
        {
            id: 'uptrendConfirmed',
            label: `Price making higher highs AND higher lows on ${timeframeName}`,
            tooltip: `Confirm the ${timeframeName} chart shows a clear pattern of consecutively higher swing highs and higher swing lows, indicating a healthy uptrend.`
        },
        {
            id: 'above50EMA',
            label: `Price above ${timeframeName} 50 EMA`,
            tooltip: getTooltipGuidance('above50EMA', tradingStyle) ||
                `The current price should be trading above the 50 EMA on the ${timeframeName} chart, confirming trend momentum.`
        },
        {
            id: 'emaAlignment',
            label: `20 EMA above 50 EMA on ${timeframeName} (alignment)`,
            tooltip: getTooltipGuidance('emaAlignment', tradingStyle) ||
                `The 20 EMA should be above the 50 EMA on ${timeframeName}, showing short-term momentum aligns with long-term trend.`
        },
        {
            id: 'notConsolidating',
            label: `NOT in consolidation range on ${timeframeName} (${consolidationRule?.label || 'extended period'})`,
            tooltip: `${consolidationRule?.description || `Price should not be ranging sideways on ${timeframeName}.`} ${getTooltipGuidance('consolidation', tradingStyle) || 'If consolidating, reduce position size.'}`
        },
        {
            id: 'clearFromResistance',
            label: `Far enough from ${timeframeName} resistance`,
            tooltip: `Ensure price has sufficient room to move on ${timeframeName} before hitting major resistance levels. Minimum 1:2 R:R to next resistance.`
        }
    ];

    return (
        <div className={`checklist-section ${isLocked ? 'locked' : ''}`}>
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">📊</span>
                    {timeframeName} Chart (Context)
                </h3>
                <p className="checklist-section-subtitle">
                    Confirm the big picture - all 5 checks required to proceed
                </p>
                {validation && (
                    <div className="checklist-counter">
                        {validation.passedCount} of {validation.totalChecks} checks completed
                    </div>
                )}
            </div>

            <div className="checklist-section-body">
                {checkItems.map((item) => (
                    <ChecklistCheckbox
                        key={item.id}
                        id={`higher-${item.id}`}
                        label={item.label}
                        checked={checks[item.id]}
                        onChange={() => onCheckChange(item.id)}
                        disabled={isLocked}
                        tooltip={item.tooltip}
                    />
                ))}

                {/* Consolidation Warning */}
                {!checks.notConsolidating && validation?.consolidationDetected && (
                    <div className="checklist-warning">
                        <span className="warning-icon">⚠️</span>
                        <div className="warning-content">
                            <strong>{timeframeName} Consolidation Detected</strong>
                            <p>{validation.message}</p>
                        </div>
                    </div>
                )}

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
                    onClick={onContinue}
                    variant="primary"
                    disabled={!validation?.isPassed || isLocked}
                >
                    Continue to {timeframeName === 'Daily' ? '1-Hour' :
                        timeframeName === 'Weekly' ? 'Daily' : 'Weekly'} Checks
                </Button>
            </div>
        </div>
    );
}

export default HigherTimeframeSection;
