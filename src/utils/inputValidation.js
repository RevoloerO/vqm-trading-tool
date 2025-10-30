/**
 * Centralized Input Validation Utilities
 * Single source of truth for all input validation
 * Prevents redundant validation logic across components
 */

/**
 * Validate numeric input (price, percentage, etc.)
 * @param {string|number} value - Input value to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid, error, value }
 */
export function validateNumericInput(value, options = {}) {
    const {
        required = false,
        min = null,
        max = null,
        allowZero = false,
        allowNegative = false,
        fieldName = 'Value'
    } = options;

    // Handle empty values
    if (value === '' || value === null || value === undefined) {
        if (required) {
            return {
                isValid: false,
                error: `${fieldName} is required`,
                value: null
            };
        }
        return { isValid: true, error: null, value: null };
    }

    // Convert to number
    const num = parseFloat(value);

    // Check if it's a valid number
    if (isNaN(num)) {
        return {
            isValid: false,
            error: `${fieldName} must be a valid number`,
            value: null
        };
    }

    // Check for infinity
    if (!isFinite(num)) {
        return {
            isValid: false,
            error: `${fieldName} must be a finite number`,
            value: null
        };
    }

    // Check zero
    if (num === 0 && !allowZero) {
        return {
            isValid: false,
            error: `${fieldName} must be greater than zero`,
            value: null
        };
    }

    // Check negative
    if (num < 0 && !allowNegative) {
        return {
            isValid: false,
            error: `${fieldName} cannot be negative`,
            value: null
        };
    }

    // Check min
    if (min !== null && num < min) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${min}`,
            value: null
        };
    }

    // Check max
    if (max !== null && num > max) {
        return {
            isValid: false,
            error: `${fieldName} must be at most ${max}`,
            value: null
        };
    }

    return {
        isValid: true,
        error: null,
        value: num
    };
}

/**
 * Validate price input
 */
export function validatePrice(value, fieldName = 'Price') {
    return validateNumericInput(value, {
        required: true,
        min: 0.01,
        max: 1000000,
        fieldName
    });
}

/**
 * Validate percentage input
 */
export function validatePercentage(value, fieldName = 'Percentage', maxPercent = 100) {
    return validateNumericInput(value, {
        required: true,
        min: 0.01,
        max: maxPercent,
        fieldName
    });
}

/**
 * Validate account size input
 */
export function validateAccountSize(value) {
    return validateNumericInput(value, {
        required: true,
        min: 100,
        max: 100000000,
        fieldName: 'Account size'
    });
}

/**
 * Validate risk percentage
 */
export function validateRiskPercent(value, maxRisk = 10) {
    const result = validateNumericInput(value, {
        required: true,
        min: 0.1,
        max: maxRisk,
        fieldName: 'Risk percentage'
    });

    // Add warning for high risk
    if (result.isValid && result.value > 5) {
        return {
            ...result,
            warning: `Risk of ${result.value}% is considered high`
        };
    }

    return result;
}

/**
 * Validate gap percentage
 */
export function validateGapPercent(value) {
    const result = validateNumericInput(value, {
        required: true,
        min: 0,
        max: 100,
        allowZero: true,
        fieldName: 'Gap percentage'
    });

    // Add warning for gaps > 2%
    if (result.isValid && result.value > 2) {
        return {
            ...result,
            warning: `Gap of ${result.value}% exceeds 2% - Higher risk entry`
        };
    }

    return result;
}

/**
 * Validate all fields are filled
 */
export function validateAllFieldsFilled(fields, fieldNames) {
    const missing = [];

    Object.entries(fields).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
            missing.push(fieldNames[key] || key);
        }
    });

    if (missing.length > 0) {
        return {
            isValid: false,
            error: `Please fill in: ${missing.join(', ')}`,
            missingFields: missing
        };
    }

    return {
        isValid: true,
        error: null,
        missingFields: []
    };
}

/**
 * Batch validate multiple fields
 */
export function validateFields(fields, validators) {
    const errors = {};
    const values = {};
    let hasErrors = false;

    Object.entries(fields).forEach(([key, value]) => {
        const validator = validators[key];
        if (validator) {
            const result = validator(value);
            if (!result.isValid) {
                errors[key] = result.error;
                hasErrors = true;
            } else {
                values[key] = result.value;
            }
        }
    });

    return {
        isValid: !hasErrors,
        errors,
        values
    };
}
