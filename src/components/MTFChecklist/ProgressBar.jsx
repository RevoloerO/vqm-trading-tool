import { memo } from 'react';

/**
 * Progress Bar Component showing checklist completion
 * UPDATED: Now supports dynamic timeframe labels based on trading style
 * @param {Object} props - Component properties
 * @param {string} props.currentStep - Current step: 'higher' | 'mid' | 'lower' | 'final'
 * @param {Object} props.validation - Validation states for each section
 * @param {Object} props.timeframeLabels - Dynamic labels: { higher, mid, lower }
 */
function ProgressBar({ currentStep, validation, timeframeLabels = null }) {
    // Use dynamic labels or fall back to defaults
    const labels = timeframeLabels || {
        higher: 'Weekly',
        mid: 'Daily',
        lower: '4-Hour'
    };

    const steps = [
        { id: 'higher', label: labels.higher, number: 1 },
        { id: 'mid', label: labels.mid, number: 2 },
        { id: 'lower', label: labels.lower, number: 3 },
        { id: 'final', label: 'Decision', number: 4 }
    ];

    const getStepStatus = (stepId) => {
        if (stepId === 'final') {
            // Final step is active when all previous steps are complete
            if (currentStep === 'final') return 'active';
            if (validation.higher?.isPassed && validation.mid?.isPassed && validation.lower?.isPassed) {
                return 'unlocked';
            }
            return 'locked';
        }

        // Check if this step is completed
        const stepValidation = validation[stepId];
        if (stepValidation?.isPassed) return 'completed';

        // Check if this is the current step
        if (currentStep === stepId) return 'active';

        // Check if this step is unlocked but not completed
        const stepIndex = steps.findIndex(s => s.id === stepId);
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        if (stepIndex < currentIndex) return 'unlocked';

        return 'locked';
    };

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-steps">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="progress-step-wrapper">
                            <div className={`progress-step ${status}`}>
                                <div className="progress-step-circle">
                                    {status === 'completed' ? (
                                        <svg
                                            className="progress-step-check"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <span className="progress-step-number">{step.number}</span>
                                    )}
                                </div>
                                <span className="progress-step-label">{step.label}</span>
                            </div>
                            {!isLast && (
                                <div className={`progress-connector ${status === 'completed' ? 'completed' : ''}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress percentage */}
            <div className="progress-summary">
                <div className="progress-summary-bar">
                    <div
                        className="progress-summary-fill"
                        style={{
                            width: `${calculateProgress(validation)}%`
                        }}
                    ></div>
                </div>
                <span className="progress-summary-text">
                    {calculateProgress(validation)}% Complete
                </span>
            </div>

            {/* Timeframe Flow Summary */}
            {timeframeLabels && (
                <div className="timeframe-flow-summary">
                    <span className="flow-label">Context:</span>
                    <span className="flow-value">{labels.higher}</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-label">Setup:</span>
                    <span className="flow-value">{labels.mid}</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-label">Entry:</span>
                    <span className="flow-value">{labels.lower}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Calculate overall progress percentage
 * @param {Object} validation - Validation states
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(validation) {
    let completedSteps = 0;
    const totalSteps = 3; // Higher, Mid, Lower (Final is not counted as a step)

    if (validation.higher?.isPassed) completedSteps++;
    if (validation.mid?.isPassed) completedSteps++;
    if (validation.lower?.isPassed) completedSteps++;

    return Math.round((completedSteps / totalSteps) * 100);
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(ProgressBar);
