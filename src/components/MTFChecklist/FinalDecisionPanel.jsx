import React, { useState } from 'react';
import Button from '../Button';
import { downloadTradeData } from '../../utils/checklistStorage';
import { TIMEFRAME_CONFIGS } from '../../utils/TimeframeConfig';

/**
 * Final Decision Panel Component
 * UPDATED: Now shows trading style context and dynamic timeframe labels
 * @param {Object} props - Component properties
 * @param {Object} props.higherValidation - Higher timeframe validation result
 * @param {Object} props.midValidation - Mid timeframe validation result
 * @param {Object} props.lowerValidation - Lower timeframe validation result
 * @param {Object} props.recommendation - Position size recommendation
 * @param {Object} props.positionResult - Position size calculation result
 * @param {string} props.tradingStyle - Trading style ID
 * @param {Object} props.timeframeLabels - Timeframe labels: { higher, mid, lower }
 * @param {Function} props.onExecuteTrade - Execute trade handler
 * @param {Function} props.onPassTrade - Pass trade handler
 * @param {Function} props.onSaveForLater - Save for later handler
 * @param {Function} props.onReset - Reset checklist handler
 * @param {Object} props.fullState - Complete checklist state for export
 */
function FinalDecisionPanel({
    higherValidation,
    midValidation,
    lowerValidation,
    recommendation,
    positionResult,
    tradingStyle = 'swing',
    timeframeLabels,
    onExecuteTrade,
    onPassTrade,
    onSaveForLater,
    onReset,
    fullState
}) {
    const [showPassConfirm, setShowPassConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const styleConfig = TIMEFRAME_CONFIGS[tradingStyle] || TIMEFRAME_CONFIGS['swing'];
    const labels = timeframeLabels || { higher: 'Weekly', mid: 'Daily', lower: '4-Hour' };

    const getStatusBadge = (validation, timeframeName) => {
        if (!validation) return null;

        let statusClass = 'status-badge ';
        let statusText = '';

        if (validation.isPassed) {
            statusClass += 'success';
            // Context timeframe shows UPTREND, setup shows SETUP CONFIRMED, entry shows ENTRY TRIGGER
            if (timeframeName === labels.higher) {
                statusText = 'UPTREND';
            } else if (timeframeName === labels.mid) {
                statusText = 'SETUP CONFIRMED';
            } else {
                statusText = 'ENTRY TRIGGER';
            }
        } else {
            statusClass += 'warning';
            // Show what's missing
            if (timeframeName === labels.higher) {
                statusText = 'NOT ALIGNED';
            } else if (timeframeName === labels.mid) {
                statusText = 'WAITING';
            } else {
                statusText = 'NO ENTRY';
            }
        }

        return <span className={statusClass}>{statusText}</span>;
    };

    const getRecommendationBadge = () => {
        if (!recommendation) return null;

        const badgeClass = `recommendation-badge ${recommendation.color}`;
        const riskPercent = higherValidation?.recommendedRisk || styleConfig?.riskPerTrade || 2;

        return (
            <div className={badgeClass}>
                <div className="recommendation-main">
                    <span className="recommendation-size">{recommendation.recommendation}%</span>
                    <span className="recommendation-status">{recommendation.status}</span>
                </div>
                <div className="recommendation-reason">{recommendation.reason}</div>
                <div className="recommendation-details">
                    <span className="detail-icon">🎲</span>
                    <span>Recommended Risk: {riskPercent}% ({styleConfig.label} standard)</span>
                </div>
            </div>
        );
    };

    const handleExecuteTrade = () => {
        const decision = {
            action: 'execute',
            timestamp: new Date().toISOString(),
            recommendation: recommendation,
            tradingStyle: tradingStyle,
            expectedHoldTime: styleConfig.holdTime
        };

        // Download trade data as JSON
        downloadTradeData(fullState, decision);

        // Call parent handler
        onExecuteTrade();
    };

    const handlePassTrade = () => {
        if (!showPassConfirm) {
            setShowPassConfirm(true);
            return;
        }

        const decision = {
            action: 'pass',
            timestamp: new Date().toISOString(),
            reason: 'Trade does not meet all criteria'
        };

        onPassTrade(decision);
        setShowPassConfirm(false);
    };

    const handleReset = () => {
        if (!showResetConfirm) {
            setShowResetConfirm(true);
            return;
        }

        onReset();
        setShowResetConfirm(false);
    };

    const canExecute = higherValidation?.isPassed && midValidation?.isPassed && lowerValidation?.isPassed;

    return (
        <div className="final-decision-panel">
            <div className="checklist-section-header">
                <h3 className="checklist-section-title">
                    <span className="section-icon">🎯</span>
                    Final Decision
                </h3>
                <p className="checklist-section-subtitle">
                    Review all timeframes and make your trading decision
                </p>
            </div>

            <div className="final-decision-body">
                {/* Trading Style Badge */}
                <div className="trading-style-badge">
                    <span className="badge-icon">{styleConfig.icon}</span>
                    <div className="badge-content">
                        <strong>Trading Style: {styleConfig.label.toUpperCase()}</strong>
                        <span className="badge-subtitle">
                            Hold Time: {styleConfig.holdTime} | Trades: {styleConfig.tradesPerWeek}/week
                        </span>
                    </div>
                </div>

                {/* Timeframe Status Summary */}
                <div className="status-summary">
                    <h4 className="status-summary-title">Timeframe Analysis</h4>
                    <div className="status-items">
                        <div className="status-item">
                            <span className="status-label">{labels.higher} Status:</span>
                            {getStatusBadge(higherValidation, labels.higher)}
                        </div>
                        <div className="status-item">
                            <span className="status-label">{labels.mid} Status:</span>
                            {getStatusBadge(midValidation, labels.mid)}
                        </div>
                        <div className="status-item">
                            <span className="status-label">{labels.lower} Status:</span>
                            {getStatusBadge(lowerValidation, labels.lower)}
                        </div>
                    </div>
                </div>

                {/* Position Recommendation */}
                <div className="recommendation-section">
                    <h4 className="recommendation-title">Position Size Recommendation</h4>
                    {getRecommendationBadge()}
                </div>

                {/* Position Details (if calculated) */}
                {positionResult && canExecute && (
                    <div className="position-details">
                        <h4 className="position-details-title">Position Details</h4>
                        <div className="position-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Shares:</span>
                                <span className="detail-value highlight">{positionResult.shares}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Position Value:</span>
                                <span className="detail-value">${positionResult.positionValue}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Dollar Risk:</span>
                                <span className="detail-value risk">${positionResult.riskAmount}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Risk Per Share:</span>
                                <span className="detail-value">${positionResult.riskPerShare}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning Messages */}
                {!canExecute && (
                    <div className="decision-warning">
                        <span className="warning-icon">⚠️</span>
                        <div className="warning-content">
                            <strong>Trade Not Ready</strong>
                            <p>Not all timeframe checks have passed. Review the incomplete sections above.</p>
                        </div>
                    </div>
                )}

                {/* Confidence Indicator */}
                {canExecute && (
                    <div className="confidence-indicator">
                        <div className="confidence-header">
                            <span className="confidence-label">Trade Confidence:</span>
                            <span className="confidence-value">
                                {higherValidation?.consolidationDetected ? 'MODERATE' : 'HIGH'}
                            </span>
                        </div>
                        <div className="confidence-bar">
                            <div
                                className={`confidence-fill ${higherValidation?.consolidationDetected ? 'moderate' : 'high'}`}
                                style={{
                                    width: higherValidation?.consolidationDetected ? '60%' : '100%'
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="decision-actions">
                    {canExecute ? (
                        <>
                            <Button
                                type="button"
                                onClick={handleExecuteTrade}
                                variant="primary"
                                className="btn-execute"
                            >
                                <span className="btn-icon">✓</span>
                                Execute Trade
                            </Button>
                            <Button
                                type="button"
                                onClick={onSaveForLater}
                                variant="secondary"
                                className="btn-save"
                            >
                                <span className="btn-icon">💾</span>
                                Save for Later
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                onClick={handlePassTrade}
                                variant="secondary"
                                className="btn-pass"
                            >
                                <span className="btn-icon">✗</span>
                                {showPassConfirm ? 'Confirm: Pass Trade' : 'Pass Trade'}
                            </Button>
                            {showPassConfirm && (
                                <Button
                                    type="button"
                                    onClick={() => setShowPassConfirm(false)}
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Reset Button */}
                <div className="reset-section">
                    <Button
                        type="button"
                        onClick={handleReset}
                        variant="secondary"
                        className="btn-reset"
                    >
                        {showResetConfirm ? 'Confirm: Reset Checklist' : 'Reset Checklist'}
                    </Button>
                    {showResetConfirm && (
                        <Button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FinalDecisionPanel;
