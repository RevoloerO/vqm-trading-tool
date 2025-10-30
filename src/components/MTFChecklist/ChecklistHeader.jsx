/**
 * Presentation Component: Checklist Header
 * Pure UI component for the MTF checklist header
 */

import Button from '../Button';

export default function ChecklistHeader({
    styleConfig,
    timeframeLabels,
    showChangeStyleConfirm,
    onChangeStyle,
    onCancelChange
}) {
    if (!styleConfig || !timeframeLabels) {
        return (
            <div className="calculator-header">
                <h2 className="calculator-title">Multi-Timeframe Entry Checklist</h2>
                <p className="calculator-subtitle">
                    Step-by-step validation across multiple timeframes for disciplined trade entry
                </p>
            </div>
        );
    }

    return (
        <div className="calculator-header">
            <div className="header-content">
                <div className="header-left">
                    <h2 className="calculator-title">Multi-Timeframe Entry Checklist</h2>
                    <p className="calculator-subtitle">
                        Step-by-step validation across {timeframeLabels.higher} → {timeframeLabels.mid} → {timeframeLabels.lower}
                    </p>
                </div>
                <div className="header-right">
                    <div className="style-badge-header">
                        <span className="style-badge-icon">{styleConfig.icon}</span>
                        <div className="style-badge-text">
                            <strong>{styleConfig.label}</strong>
                            <span className="style-badge-subtitle">{styleConfig.holdTime}</span>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={onChangeStyle}
                        variant="secondary"
                        className="btn-change-style"
                    >
                        {showChangeStyleConfirm ? 'Confirm Change?' : 'Change Style'}
                    </Button>
                    {showChangeStyleConfirm && (
                        <Button
                            type="button"
                            onClick={onCancelChange}
                            variant="secondary"
                            className="btn-cancel-change"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
