/**
 * Multi-Timeframe Entry Checklist - REFACTORED
 * Clean architecture with separated concerns:
 * - Custom hooks for state management
 * - Custom hooks for validation logic
 * - Presentation components for UI
 * - Utility functions for business logic
 */

import { useMemo, useEffect, useCallback } from 'react';
import { useMTFChecklistStateOptimized } from '../../hooks/useMTFChecklistStateOptimized';
import { useMTFValidationOptimized } from '../../hooks/useMTFValidationOptimized';
import ChecklistHeader from './ChecklistHeader';
import TradingStyleSelector from './TradingStyleSelector';
import HigherTimeframeSection from './HigherTimeframeSection';
import MidTimeframeSection from './MidTimeframeSection';
import LowerTimeframeSection from './LowerTimeframeSection';
import FinalDecisionPanel from './FinalDecisionPanel';
import ProgressBar from './ProgressBar';
import Button from '../Button';
import { getLastSaveTime } from '../../utils/checklistStorage';
import './MTFChecklist.css';

/**
 * Main container component - orchestrates the checklist flow
 */
function MTFChecklist() {
    // Custom hook for state management (OPTIMIZED)
    const {
        state,
        styleConfig,
        showRestorePrompt,
        showChangeStyleConfirm,
        handleStyleSelect,
        handleChangeStyle,
        cancelChangeStyle,
        updateHigherTF,
        proceedToMid,
        updateMidTF,
        updatePatternType,
        updateGapPercentage,
        updateMidPrice,
        proceedToLower,
        backToHigher,
        updateLowerTF,
        updatePositionData,
        proceedToFinal,
        backToMid,
        executeTrade,
        passTrade,
        resetChecklist,
        restoreSavedState,
        dismissRestorePrompt,
        updateValidationResults
    } = useMTFChecklistStateOptimized();

    // Custom hook for validation logic (OPTIMIZED)
    const {
        higherValidation,
        midValidation,
        lowerValidation,
        recommendation,
        isMidLocked,
        isLowerLocked,
        recommendedRiskPercent,
        timeframeLabels,
        validationResults
    } = useMTFValidationOptimized(state, styleConfig);

    // Update state with validation results
    useEffect(() => {
        if (validationResults.higher || validationResults.mid || validationResults.lower) {
            updateValidationResults(validationResults);
        }
    }, [validationResults, updateValidationResults]);

    // Memoized handlers for sections to prevent unnecessary re-renders
    const handleHigherContinue = useCallback(() => {
        if (higherValidation?.isPassed) {
            proceedToMid();
        }
    }, [higherValidation?.isPassed, proceedToMid]);

    const handleMidContinue = useCallback(() => {
        if (midValidation?.isPassed) {
            proceedToLower();
        }
    }, [midValidation?.isPassed, proceedToLower]);

    const handleLowerContinue = useCallback(() => {
        if (lowerValidation?.isPassed) {
            proceedToFinal();
        }
    }, [lowerValidation?.isPassed, proceedToFinal]);

    const handleExecuteTrade = useCallback(() => {
        alert('Trade executed! Trade data has been downloaded as JSON.');
        executeTrade();
    }, [executeTrade]);

    const handlePassTrade = useCallback((decision) => {
        passTrade(decision);
        alert('Trade passed and recorded.');
    }, [passTrade]);

    const handleSaveForLater = useCallback(() => {
        alert('Checklist saved! You can resume within 24 hours.');
    }, []);

    // Memoized position result for final panel - only recalculate when position data changes
    const positionResult = useMemo(() => {
        return state.lowerTF.positionData.accountSize ? {
            shares: 0,
            positionValue: '0.00',
            riskAmount: '0.00',
            riskPerShare: '0.00'
        } : null;
    }, [state.lowerTF.positionData.accountSize]);

    // =========================================================================
    // RENDER: Style Selection Screen
    // =========================================================================
    if (state.currentStep === 'styleSelection' || !state.tradingStyle) {
        return (
            <div className="calculator-card mtf-checklist">
                <ChecklistHeader />
                <TradingStyleSelector
                    onStyleSelect={handleStyleSelect}
                    currentStyle={state.tradingStyle}
                />
            </div>
        );
    }

    // =========================================================================
    // RENDER: Main Checklist Flow
    // =========================================================================
    return (
        <div className="calculator-card mtf-checklist">
            {/* Header */}
            <ChecklistHeader
                styleConfig={styleConfig}
                timeframeLabels={timeframeLabels}
                showChangeStyleConfirm={showChangeStyleConfirm}
                onChangeStyle={handleChangeStyle}
                onCancelChange={cancelChangeStyle}
            />

            {/* Restore Prompt */}
            {showRestorePrompt && (
                <div className="restore-prompt">
                    <span className="restore-icon">💾</span>
                    <div className="restore-content">
                        <strong>Saved checklist found</strong>
                        <p>Last saved: {getLastSaveTime()?.toLocaleString()}</p>
                    </div>
                    <div className="restore-actions">
                        <button onClick={restoreSavedState} className="btn btn-primary btn-sm">
                            Restore
                        </button>
                        <button onClick={dismissRestorePrompt} className="btn btn-secondary btn-sm">
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
                    onCheckChange={updateHigherTF}
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
                    onCheckChange={updateMidTF}
                    patternType={state.midTF.patternType}
                    onPatternTypeChange={updatePatternType}
                    gapPercentage={state.midTF.gapPercentage}
                    onGapPercentageChange={updateGapPercentage}
                    prices={state.midTF.prices}
                    onPriceChange={updateMidPrice}
                    onContinue={handleMidContinue}
                    onBack={backToHigher}
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
                    onCheckChange={updateLowerTF}
                    positionData={state.lowerTF.positionData}
                    onPositionDataChange={updatePositionData}
                    recommendedRiskPercent={recommendedRiskPercent}
                    onContinue={handleLowerContinue}
                    onBack={backToMid}
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
                    onReset={resetChecklist}
                    fullState={state}
                />
            )}
        </div>
    );
}

export default MTFChecklist;
