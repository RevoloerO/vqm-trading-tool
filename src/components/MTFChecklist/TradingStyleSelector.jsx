import React, { useState } from 'react';
import Button from '../Button';
import { TIMEFRAME_CONFIGS } from '../../utils/TimeframeConfig';

/**
 * Trading Style Selector Component
 * First step: User selects their trading style before checklist begins
 * @param {Object} props - Component properties
 * @param {Function} props.onStyleSelect - Callback when style is selected and confirmed
 * @param {string} props.currentStyle - Currently selected style (for change style flow)
 */
function TradingStyleSelector({ onStyleSelect, currentStyle = null }) {
    const [selectedStyle, setSelectedStyle] = useState(currentStyle);

    const styles = [
        TIMEFRAME_CONFIGS.day,
        TIMEFRAME_CONFIGS.swing,
        TIMEFRAME_CONFIGS.position
    ];

    const handleCardClick = (styleId) => {
        setSelectedStyle(styleId);
    };

    const handleStartChecklist = () => {
        if (selectedStyle) {
            onStyleSelect(selectedStyle);
        }
    };

    return (
        <div className="trading-style-selector">
            <div className="style-selector-header">
                <h3 className="style-selector-title">Select Your Trading Style</h3>
                <p className="style-selector-subtitle">
                    Choose your preferred timeframe combination. This determines which charts you'll analyze.
                </p>
            </div>

            <div className="style-cards-container">
                {styles.map((style) => (
                    <div
                        key={style.id}
                        className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`}
                        onClick={() => handleCardClick(style.id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleCardClick(style.id);
                            }
                        }}
                    >
                        {/* Selection Indicator */}
                        {selectedStyle === style.id && (
                            <div className="selected-indicator">
                                <svg
                                    className="selected-checkmark"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        )}

                        {/* Card Content */}
                        <div className="style-card-icon">{style.icon}</div>
                        <h4 className="style-card-title">{style.label}</h4>

                        {/* Timeframe Breakdown */}
                        <div className="style-timeframes">
                            <div className="timeframe-row">
                                <span className="timeframe-label">Context:</span>
                                <span className="timeframe-value">{style.higher.name}</span>
                            </div>
                            <div className="timeframe-row">
                                <span className="timeframe-label">Setup:</span>
                                <span className="timeframe-value">{style.mid.name}</span>
                            </div>
                            <div className="timeframe-row">
                                <span className="timeframe-label">Entry:</span>
                                <span className="timeframe-value">{style.lower.name}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="style-card-divider"></div>

                        {/* Style Details */}
                        <div className="style-details">
                            <div className="style-detail-row">
                                <span className="detail-icon">⏱️</span>
                                <span className="detail-text">Hold: {style.holdTime}</span>
                            </div>
                            <div className="style-detail-row">
                                <span className="detail-icon">📊</span>
                                <span className="detail-text">Trades: {style.tradesPerWeek}/week</span>
                            </div>
                            <div className="style-detail-row">
                                <span className="detail-icon">🎲</span>
                                <span className="detail-text">Risk: {style.riskPerTrade}% per trade</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="style-card-description">{style.description}</p>

                        {/* Recommended Badge for Swing */}
                        {style.id === 'swing' && (
                            <div className="recommended-badge">
                                Recommended
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Start Button */}
            <div className="style-selector-footer">
                <Button
                    type="button"
                    onClick={handleStartChecklist}
                    variant="primary"
                    disabled={!selectedStyle}
                    className="btn-start-checklist"
                >
                    {currentStyle ? 'Change Style & Reset' : 'Start Checklist'}
                </Button>

                {!selectedStyle && (
                    <p className="selection-hint">Select a trading style to continue</p>
                )}

                {selectedStyle && (
                    <p className="selection-confirmation">
                        ✓ {TIMEFRAME_CONFIGS[selectedStyle].label} selected
                    </p>
                )}
            </div>

            {/* Educational Note */}
            <div className="style-selector-note">
                <div className="note-icon">💡</div>
                <div className="note-content">
                    <strong>Not sure which to choose?</strong>
                    <p>
                        Start with <strong>Swing Trader</strong> if you're new. It balances trade frequency
                        with manageable hold times. Day trading requires constant monitoring, while position
                        trading demands patience through volatility.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TradingStyleSelector;
