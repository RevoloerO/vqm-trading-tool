import React, { useState, useEffect } from 'react';
import TradingStyleSelector from './TradingStyleSelector';
import HigherTimeframeSection from './HigherTimeframeSection';
import MidTimeframeSection from './MidTimeframeSection';
import LowerTimeframeSection from './LowerTimeframeSection';
import FinalDecisionPanel from './FinalDecisionPanel';
import ProgressBar from './ProgressBar';
import Button from '../Button';
import {
    validateHigherTimeframe,
    validateMidTimeframe,
    validateLowerTimeframe,
    calculatePositionRecommendation
} from '../../utils/checklistValidation';
import {
    saveChecklistState,
    loadChecklistState,
    clearChecklistState,
    saveTradingStyle,
    loadTradingStyle,
    clearTradingStyle,
    hasSavedState,
    getLastSaveTime
} from '../../utils/checklistStorage';
import { TIMEFRAME_CONFIGS, getTimeframeConfig, calculateRiskPercent } from '../../utils/TimeframeConfig';
import './MTFChecklist.css';

/**
 * Main Multi-Timeframe Entry Checklist Component
 * COMPLETELY REFACTORED: Now supports 3 trading styles with dynamic timeframes
 *
 * Flow: Style Selection → Higher TF → Mid TF → Lower TF → Final Decision
 *
 * Trading Styles:
 * - Day Trader: Daily → 1-Hour → 15-Min
 * - Swing Trader: Weekly → Daily → 4-Hour
 * - Position Trader: Monthly → Weekly → Daily
 */
function MTFChecklist() {
    // =============================================================================
    // STATE INITIALIZATION
    // =============================================================================

    const getInitialState = () => {
        // Try to load saved state
        const savedState = loadChecklistState();
        const savedStyle = loadTradingStyle();

        // If we have a saved state with style info, use it
        if (savedState && savedState.tradingStyle) {
            return savedState;
        }

        // If we only have style saved, initialize with that style
        if (savedStyle) {
            return createInitialStateForStyle(savedStyle.style);
        }

        // Default: no style selected yet
        return {
            tradingStyle: null,
            timeframeConfig: null,
            currentStep: 'styleSelection', // Start with style selection
            higherTF: createEmptyTimeframeState(),
            midTF: createEmptyMidTimeframeState(),
            lowerTF: createEmptyLowerTimeframeState(),
            consolidationDetected: false,
            positionSizeRecommendation: 100,
            finalDecision: null
        };
    };

    // Helper to create empty timeframe state
    const createEmptyTimeframeState = () => ({
        uptrendConfirmed: false,
        above50EMA: false,
        emaAlignment: false,
        notConsolidating: false,
        clearFromResistance: false,
        isComplete: false,
        isPassed: false
    });

    const createEmptyMidTimeframeState = () => ({
        breakoutOrPullback: false,
        aboveEMA: false,
        volumeConfirmation: false,
        gapAcceptable: false,
        cleanHigherLow: false,
        rrAtLeast2to1: false,
        patternType: 'breakout',
        gapPercentage: '',
        prices: { entry: '', stop: '', target: '' },
        isComplete: false,
        isPassed: false
    });

    const createEmptyLowerTimeframeState = () => ({
        stopBelowStructure: false,
        stopDistanceOk: false,
        notAfterExtended: false,
        retestOrPullback: false,
        rrStillValid: false,
        positionSizeValid: false,
        positionData: { accountSize: '', riskPercent: '', entry: '', stop: '' },
        isComplete: false,
        isPassed: false
    });

    // Create initial state for a specific trading style
    const createInitialStateForStyle = (styleId) => {
        const config = getTimeframeConfig(styleId);
        return {
            tradingStyle: styleId,
            timeframeConfig: {
                higher: config.higher.code,
                mid: config.mid.code,
                lower: config.lower.code
            },
            currentStep: 'higher',
            higherTF: createEmptyTimeframeState(),
            midTF: createEmptyMidTimeframeState(),
            lowerTF: createEmptyLowerTimeframeState(),
            consolidationDetected: false,
            positionSizeRecommendation: 100,
            finalDecision: null
        };
    };

    // =============================================================================
    // COMPONENT STATE
    // =============================================================================

    const [state, setState] = useState(getInitialState);
    const [higherValidation, setHigherValidation] = useState(null);
    const [midValidation, setMidValidation] = useState(null);
    const [lowerValidation, setLowerValidation] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [showChangeStyleConfirm, setShowChangeStyleConfirm] = useState(false);

    // Get current style configuration
    const styleConfig = state.tradingStyle ? getTimeframeConfig(state.tradingStyle) : null;

    // Get timeframe labels for display
    const timeframeLabels = styleConfig ? {
        higher: styleConfig.higher.name,
        mid: styleConfig.mid.name,
        lower: styleConfig.lower.name
    } : null;

    // =============================================================================
    // LIFECYCLE: Check for saved state on mount
    // =============================================================================

    useEffect(() => {
        if (hasSavedState() && !state.tradingStyle) {
            const lastSave = getLastSaveTime();
            if (lastSave) {
                setShowRestorePrompt(true);
            }
        }
    }, []);

    // =============================================================================
    // LIFECYCLE: Save state to localStorage whenever it changes
    // =============================================================================

    useEffect(() => {
        if (state.tradingStyle) {
            saveChecklistState(state);
        }
    }, [state]);

    // =============================================================================
    // LIFECYCLE: Validate Higher Timeframe
    // =============================================================================

    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const validation = validateHigherTimeframe(
            state.higherTF,
            styleConfig.higher.name,
            state.tradingStyle
        );
        setHigherValidation(validation);

        // Update state with validation results
        setState(prev => ({
            ...prev,
            higherTF: {
                ...prev.higherTF,
                isComplete: validation.isPassed,
                isPassed: validation.isPassed
            },
            consolidationDetected: validation.consolidationDetected,
            positionSizeRecommendation: validation.positionAdjustment
        }));
    }, [
        state.higherTF.uptrendConfirmed,
        state.higherTF.above50EMA,
        state.higherTF.emaAlignment,
        state.higherTF.notConsolidating,
        state.higherTF.clearFromResistance,
        state.tradingStyle
    ]);

    // =============================================================================
    // LIFECYCLE: Validate Mid Timeframe
    // =============================================================================

    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const validation = validateMidTimeframe(
            state.midTF,
            styleConfig.mid.name,
            styleConfig.lower.name
        );
        setMidValidation(validation);

        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                isComplete: validation.isPassed,
                isPassed: validation.isPassed
            }
        }));
    }, [
        state.midTF.breakoutOrPullback,
        state.midTF.aboveEMA,
        state.midTF.volumeConfirmation,
        state.midTF.gapAcceptable,
        state.midTF.cleanHigherLow,
        state.midTF.rrAtLeast2to1,
        state.tradingStyle
    ]);

    // =============================================================================
    // LIFECYCLE: Validate Lower Timeframe
    // =============================================================================

    useEffect(() => {
        if (!state.tradingStyle || !styleConfig) return;

        const maxRisk = state.tradingStyle === 'day' ? 1.0 : 2.0;
        const validation = validateLowerTimeframe(
            state.lowerTF,
            styleConfig.lower.name,
            maxRisk
        );
        setLowerValidation(validation);

        setState(prev => ({
            ...prev,
            lowerTF: {
                ...prev.lowerTF,
                isComplete: validation.isPassed,
                isPassed: validation.isPassed
            }
        }));
    }, [
        state.lowerTF.stopBelowStructure,
        state.lowerTF.stopDistanceOk,
        state.lowerTF.notAfterExtended,
        state.lowerTF.retestOrPullback,
        state.lowerTF.rrStillValid,
        state.lowerTF.positionSizeValid,
        state.tradingStyle
    ]);

    // =============================================================================
    // LIFECYCLE: Calculate Overall Recommendation
    // =============================================================================

    useEffect(() => {
        if (higherValidation && midValidation && lowerValidation && timeframeLabels) {
            const rec = calculatePositionRecommendation(
                higherValidation,
                midValidation,
                lowerValidation,
                timeframeLabels.higher,
                timeframeLabels.mid,
                timeframeLabels.lower
            );
            setRecommendation(rec);
        }
    }, [higherValidation, midValidation, lowerValidation, timeframeLabels]);

    // =============================================================================
    // HANDLERS: Style Selection
    // =============================================================================

    const handleStyleSelect = (styleId) => {
        const config = getTimeframeConfig(styleId);

        // Save style preference
        saveTradingStyle(styleId, config);

        // Initialize state for this style
        setState(createInitialStateForStyle(styleId));
    };

    const handleChangeStyle = () => {
        if (!showChangeStyleConfirm) {
            setShowChangeStyleConfirm(true);
            return;
        }

        // Clear everything and start over
        clearChecklistState();
        clearTradingStyle();
        setState(getInitialState());
        setShowChangeStyleConfirm(false);
    };

    // =============================================================================
    // HANDLERS: Higher Timeframe
    // =============================================================================

    const handleHigherCheckChange = (checkId) => {
        setState(prev => ({
            ...prev,
            higherTF: {
                ...prev.higherTF,
                [checkId]: !prev.higherTF[checkId]
            }
        }));
    };

    const handleHigherContinue = () => {
        if (higherValidation?.isPassed) {
            setState(prev => ({ ...prev, currentStep: 'mid' }));
        }
    };

    // =============================================================================
    // HANDLERS: Mid Timeframe
    // =============================================================================

    const handleMidCheckChange = (checkId, value) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                [checkId]: value !== undefined ? value : !prev.midTF[checkId]
            }
        }));
    };

    const handlePatternTypeChange = (type) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                patternType: type
            }
        }));
    };

    const handleGapPercentageChange = (value) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                gapPercentage: value
            }
        }));
    };

    const handleMidPriceChange = (field, value) => {
        setState(prev => ({
            ...prev,
            midTF: {
                ...prev.midTF,
                prices: {
                    ...prev.midTF.prices,
                    [field]: value
                }
            }
        }));
    };

    const handleMidContinue = () => {
        if (midValidation?.isPassed) {
            setState(prev => ({ ...prev, currentStep: 'lower' }));
        }
    };

    const handleMidBack = () => {
        setState(prev => ({ ...prev, currentStep: 'higher' }));
    };

    // =============================================================================
    // HANDLERS: Lower Timeframe
    // =============================================================================

    const handleLowerCheckChange = (checkId, value) => {
        setState(prev => ({
            ...prev,
            lowerTF: {
                ...prev.lowerTF,
                [checkId]: value !== undefined ? value : !prev.lowerTF[checkId]
            }
        }));
    };

    const handlePositionDataChange = (field, value) => {
        setState(prev => ({
            ...prev,
            lowerTF: {
                ...prev.lowerTF,
                positionData: {
                    ...prev.lowerTF.positionData,
                    [field]: value
                }
            }
        }));
    };

    const handleLowerContinue = () => {
        if (lowerValidation?.isPassed) {
            setState(prev => ({ ...prev, currentStep: 'final' }));
        }
    };

    const handleLowerBack = () => {
        setState(prev => ({ ...prev, currentStep: 'mid' }));
    };

    // =============================================================================
    // HANDLERS: Final Decision
    // =============================================================================

    const handleExecuteTrade = () => {
        alert('Trade executed! Trade data has been downloaded as JSON.');
        clearChecklistState();
        clearTradingStyle();
        setState(getInitialState());
    };

    const handlePassTrade = (decision) => {
        setState(prev => ({
            ...prev,
            finalDecision: decision
        }));
        alert('Trade passed and recorded.');
    };

    const handleSaveForLater = () => {
        alert('Checklist saved! You can resume within 24 hours.');
    };

    const handleReset = () => {
        clearChecklistState();
        setState(createInitialStateForStyle(state.tradingStyle));
    };

    // =============================================================================
    // HANDLERS: Restore Prompt
    // =============================================================================

    const handleRestoreState = () => {
        const savedState = loadChecklistState();
        if (savedState) {
            setState(savedState);
        }
        setShowRestorePrompt(false);
    };

    const handleDismissRestore = () => {
        clearChecklistState();
        setShowRestorePrompt(false);
    };

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    // Determine which sections are locked
    const isMidLocked = !higherValidation?.isPassed;
    const isLowerLocked = !midValidation?.isPassed;

    // Get recommended risk percent for lower timeframe
    const recommendedRiskPercent = higherValidation?.recommendedRisk ||
        calculateRiskPercent(state.tradingStyle || 'swing', state.consolidationDetected);

    // Get position result for final panel (from lower timeframe section)
    const positionResult = state.lowerTF.positionData.accountSize ? {
        shares: 0, // Would be calculated in LowerTimeframeSection
        positionValue: '0.00',
        riskAmount: '0.00',
        riskPerShare: '0.00'
    } : null;

    // =============================================================================
    // RENDER
    // =============================================================================

    // If no style selected, show style selector
    if (state.currentStep === 'styleSelection' || !state.tradingStyle) {
        return (
            <div className="calculator-card mtf-checklist">
                <div className="calculator-header">
                    <h2 className="calculator-title">Multi-Timeframe Entry Checklist</h2>
                    <p className="calculator-subtitle">
                        Step-by-step validation across multiple timeframes for disciplined trade entry
                    </p>
                </div>

                <TradingStyleSelector
                    onStyleSelect={handleStyleSelect}
                    currentStyle={state.tradingStyle}
                />
            </div>
        );
    }

    return (
        <div className="calculator-card mtf-checklist">
            {/* Header with Style Badge */}
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
                            onClick={handleChangeStyle}
                            variant="secondary"
                            className="btn-change-style"
                        >
                            {showChangeStyleConfirm ? 'Confirm Change?' : 'Change Style'}
                        </Button>
                        {showChangeStyleConfirm && (
                            <Button
                                type="button"
                                onClick={() => setShowChangeStyleConfirm(false)}
                                variant="secondary"
                                className="btn-cancel-change"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Restore Prompt */}
            {showRestorePrompt && (
                <div className="restore-prompt">
                    <span className="restore-icon">💾</span>
                    <div className="restore-content">
                        <strong>Saved checklist found</strong>
                        <p>Last saved: {getLastSaveTime()?.toLocaleString()}</p>
                    </div>
                    <div className="restore-actions">
                        <button onClick={handleRestoreState} className="btn btn-primary btn-sm">
                            Restore
                        </button>
                        <button onClick={handleDismissRestore} className="btn btn-secondary btn-sm">
                            Start Fresh
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <ProgressBar
                currentStep={state.currentStep}
                validation={{
                    higher: higherValidation,
                    mid: midValidation,
                    lower: lowerValidation
                }}
                timeframeLabels={timeframeLabels}
            />

            {/* Higher Timeframe Section */}
            {(state.currentStep === 'higher' || higherValidation?.isPassed) && (
                <HigherTimeframeSection
                    timeframeName={timeframeLabels.higher}
                    timeframeCode={state.timeframeConfig.higher}
                    tradingStyle={state.tradingStyle}
                    checks={state.higherTF}
                    onCheckChange={handleHigherCheckChange}
                    onContinue={handleHigherContinue}
                    validation={higherValidation}
                    isLocked={state.currentStep !== 'higher'}
                />
            )}

            {/* Mid Timeframe Section */}
            {(state.currentStep === 'mid' || midValidation?.isPassed) && !isMidLocked && (
                <MidTimeframeSection
                    timeframeName={timeframeLabels.mid}
                    timeframeCode={state.timeframeConfig.mid}
                    higherTimeframeName={timeframeLabels.higher}
                    lowerTimeframeName={timeframeLabels.lower}
                    tradingStyle={state.tradingStyle}
                    checks={state.midTF}
                    onCheckChange={handleMidCheckChange}
                    patternType={state.midTF.patternType}
                    onPatternTypeChange={handlePatternTypeChange}
                    gapPercentage={state.midTF.gapPercentage}
                    onGapPercentageChange={handleGapPercentageChange}
                    prices={state.midTF.prices}
                    onPriceChange={handleMidPriceChange}
                    onContinue={handleMidContinue}
                    onBack={handleMidBack}
                    validation={midValidation}
                    isLocked={state.currentStep !== 'mid'}
                />
            )}

            {/* Lower Timeframe Section */}
            {state.currentStep === 'lower' && !isLowerLocked && (
                <LowerTimeframeSection
                    timeframeName={timeframeLabels.lower}
                    timeframeCode={state.timeframeConfig.lower}
                    midTimeframeName={timeframeLabels.mid}
                    tradingStyle={state.tradingStyle}
                    checks={state.lowerTF}
                    onCheckChange={handleLowerCheckChange}
                    positionData={state.lowerTF.positionData}
                    onPositionDataChange={handlePositionDataChange}
                    recommendedRiskPercent={recommendedRiskPercent}
                    onContinue={handleLowerContinue}
                    onBack={handleLowerBack}
                    validation={lowerValidation}
                    isLocked={false}
                />
            )}

            {/* Final Decision Panel */}
            {state.currentStep === 'final' && (
                <FinalDecisionPanel
                    higherValidation={higherValidation}
                    midValidation={midValidation}
                    lowerValidation={lowerValidation}
                    recommendation={recommendation}
                    positionResult={positionResult}
                    tradingStyle={state.tradingStyle}
                    timeframeLabels={timeframeLabels}
                    onExecuteTrade={handleExecuteTrade}
                    onPassTrade={handlePassTrade}
                    onSaveForLater={handleSaveForLater}
                    onReset={handleReset}
                    fullState={state}
                />
            )}
        </div>
    );
}

export default MTFChecklist;
