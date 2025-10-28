import React from 'react';
import ChecklistCheckbox from './ChecklistCheckbox';
import Button from '../Button';

/**
 * Weekly Timeframe Check Section Component
 * 5 checks for weekly trend validation
 * @param {Object} props - Component properties
 * @param {Object} props.checks - Weekly check state
 * @param {Function} props.onCheckChange - Check change handler
 * @param {Function} props.onContinue - Continue button handler
 * @param {Object} props.validation - Validation result
 * @param {boolean} props.isLocked - Whether section is locked
 */
function WeeklyCheckSection({ checks, onCheckChange, onContinue, validation, isLocked }) {
    const checkItems = [
        {
            id: 'higherHighsLows',
            label: 'Price making higher highs AND higher lows (uptrend)',
            tooltip: 'Confirm the weekly chart shows a clear pattern of consecutively higher swing highs and higher swing lows, indicating a healthy uptrend.'
        },
        {
            id: 'aboveWeekly50EMA',
            label: 'Price above weekly 50 EMA',
            tooltip: 'The current price should be trading above the 50-week Exponential Moving Average, confirming long-term bullish momentum.'
        },
        {
            id: 'emaAlignment',
            label: '20 EMA above 50 EMA (alignment)',
            tooltip: 'The 20-week EMA should be above the 50-week EMA, showing short-term momentum is aligned with long-term trend.'
        },
        {
            id: 'notConsolidating',
            label: 'NOT in consolidation range (8-12 weeks)',
            tooltip: 'Price should not be ranging sideways for 8-12 weeks. If consolidating, reduce position size to 50%.'
        },
        {
            id: 'farFromResistance',
            label: 'Far enough from weekly resistance',
            tooltip: 'Ensure price has sufficient room to move before hitting major weekly resistance levels. Minimum 1:2 R:R to next resistance.'
        }
    ];

    return (
        <div className={`checklist-section ${isLocked ? 'locked' : ''}`}>
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">📊</span>
                    Weekly Timeframe Checks
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
                        id={`weekly-${item.id}`}
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
                            <strong>Weekly Consolidation Detected</strong>
                            <p>Recommend reducing position size to 50% (1% risk instead of 2%).</p>
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
                    Continue to Daily Checks
                </Button>
            </div>
        </div>
    );
}

export default WeeklyCheckSection;
