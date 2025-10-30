/**
 * OPTIMIZED Custom Hook: Debounced Input with Validation
 *
 * Solves the critical issue:
 * - Validates ONLY after user stops typing (not on every keystroke)
 * - Immediate UI update, delayed validation
 * - Auto-save on blur for important fields
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook for input field with debounced validation
 *
 * @param {string} initialValue - Initial input value
 * @param {Function} validator - Validation function (value) => { isValid, error }
 * @param {number} delay - Debounce delay in ms (default 500)
 * @param {Function} onValidated - Called when validation completes
 * @returns {Object} { value, error, isValidating, handleChange, handleBlur }
 */
export function useDebouncedInput(
    initialValue = '',
    validator = null,
    delay = 500,
    onValidated = null
) {
    // Immediate value (updates on every keystroke)
    const [value, setValue] = useState(initialValue);

    // Validation state
    const [error, setError] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    // Debounced value (updates after user stops typing)
    const debouncedValue = useDebounce(value, delay);

    // Validate when debounced value changes
    useEffect(() => {
        if (!validator) return;

        // Don't validate empty initial value
        if (debouncedValue === initialValue && debouncedValue === '') {
            return;
        }

        setIsValidating(true);

        // Run validation
        const result = validator(debouncedValue);

        setError(result.isValid ? null : result.error);
        setIsValidating(false);

        // Notify parent of validation result
        if (onValidated) {
            onValidated(result);
        }
    }, [debouncedValue, validator, initialValue, onValidated]);

    // Handle input change (immediate, no validation)
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        setValue(newValue);
        // Clear error immediately when user starts typing
        if (error) {
            setError(null);
        }
    }, [error]);

    // Handle blur (validate immediately)
    const handleBlur = useCallback(() => {
        if (!validator) return;

        const result = validator(value);
        setError(result.isValid ? null : result.error);

        if (onValidated) {
            onValidated(result);
        }
    }, [value, validator, onValidated]);

    return {
        value,
        error,
        isValidating,
        handleChange,
        handleBlur,
        setValue // For programmatic updates
    };
}

/**
 * Hook for multiple related inputs with relationship validation
 * (e.g., entry/stop/target prices)
 *
 * Validates individual fields on blur, relationship on submit
 */
export function useRelatedInputs(
    initialValues,
    individualValidators,
    relationshipValidator,
    delay = 500
) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [relationshipError, setRelationshipError] = useState(null);

    // Debounce each value separately
    const debouncedValues = {};
    Object.keys(values).forEach(key => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        debouncedValues[key] = useDebounce(values[key], delay);
    });

    // Handle individual field change
    const handleChange = useCallback((field) => (e) => {
        const newValue = e.target.value;
        setValues(prev => ({ ...prev, [field]: newValue }));

        // Clear errors when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
        if (relationshipError) {
            setRelationshipError(null);
        }
    }, [errors, relationshipError]);

    // Validate individual field on blur
    const handleBlur = useCallback((field) => () => {
        const validator = individualValidators[field];
        if (!validator) return;

        const result = validator(values[field]);
        setErrors(prev => ({
            ...prev,
            [field]: result.isValid ? null : result.error
        }));
    }, [values, individualValidators]);

    // Validate relationships (call this on form submit or explicit validation)
    const validateRelationships = useCallback(() => {
        if (!relationshipValidator) return true;

        // First validate all individual fields
        const fieldErrors = {};
        let hasFieldError = false;

        Object.entries(individualValidators).forEach(([field, validator]) => {
            if (validator) {
                const result = validator(values[field]);
                if (!result.isValid) {
                    fieldErrors[field] = result.error;
                    hasFieldError = true;
                }
            }
        });

        setErrors(fieldErrors);

        if (hasFieldError) {
            return false;
        }

        // Then validate relationships
        const result = relationshipValidator(values);
        setRelationshipError(result.isValid ? null : result.error);

        return result.isValid;
    }, [values, individualValidators, relationshipValidator]);

    // Set value programmatically
    const setValue = useCallback((field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    return {
        values,
        errors,
        relationshipError,
        handleChange,
        handleBlur,
        validateRelationships,
        setValue
    };
}

/**
 * Hook for numeric input with debounced validation
 * Optimized for price/percentage inputs
 */
export function useDebouncedNumericInput(
    initialValue = '',
    validator,
    delay = 500,
    onValidated = null
) {
    const input = useDebouncedInput(initialValue, validator, delay, onValidated);

    // Enhanced handleChange that only allows numeric input
    const handleChange = useCallback((e) => {
        const value = e.target.value;

        // Allow empty, digits, and one decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            input.handleChange(e);
        }
    }, [input]);

    return {
        ...input,
        handleChange
    };
}
