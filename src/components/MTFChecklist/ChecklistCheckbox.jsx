import { memo } from 'react';

/**
 * Reusable Checkbox Component for MTF Checklist
 * Features: Custom styling, tooltip support, larger touch targets
 * @param {Object} props - Component properties
 * @param {string} props.id - Unique checkbox ID
 * @param {string} props.label - Checkbox label text
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.tooltip - Optional tooltip text
 * @param {boolean} props.autoChecked - Whether this was auto-checked
 */
function ChecklistCheckbox({
    id,
    label,
    checked,
    onChange,
    disabled = false,
    tooltip = null,
    autoChecked = false
}) {
    return (
        <div className={`checklist-checkbox-wrapper ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
            <label htmlFor={id} className="checklist-checkbox-label">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="checklist-checkbox-input"
                    aria-label={label}
                />
                <span className="checklist-checkbox-custom">
                    <svg
                        className="checklist-checkbox-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </span>
                <span className="checklist-checkbox-text">
                    {label}
                    {autoChecked && (
                        <span className="auto-checked-badge" title="Auto-checked">
                            ⚡
                        </span>
                    )}
                </span>
                {tooltip && (
                    <button
                        type="button"
                        className="checklist-tooltip-trigger"
                        aria-label="More information"
                        title={tooltip}
                    >
                        ?
                    </button>
                )}
            </label>
        </div>
    );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(ChecklistCheckbox);
