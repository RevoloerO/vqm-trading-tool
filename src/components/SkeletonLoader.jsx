import { memo } from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton Loader Component
 * Displays animated placeholder UI while components are loading
 * @param {Object} props - Component properties
 * @param {string} props.type - Type of skeleton ('calculator' or 'checklist')
 */
function SkeletonLoader({ type = 'calculator' }) {
    if (type === 'calculator') {
        return (
            <div className="skeleton-calculator">
                <div className="skeleton-header">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                </div>
                <div className="skeleton-form">
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-button-group">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'checklist') {
        return (
            <div className="skeleton-checklist">
                <div className="skeleton-header">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                </div>
                <div className="skeleton-tabs">
                    <div className="skeleton-tab"></div>
                    <div className="skeleton-tab"></div>
                    <div className="skeleton-tab"></div>
                </div>
                <div className="skeleton-content">
                    <div className="skeleton-section">
                        <div className="skeleton-section-title"></div>
                        <div className="skeleton-checkbox-group">
                            <div className="skeleton-checkbox"></div>
                            <div className="skeleton-checkbox"></div>
                            <div className="skeleton-checkbox"></div>
                            <div className="skeleton-checkbox"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default memo(SkeletonLoader);
