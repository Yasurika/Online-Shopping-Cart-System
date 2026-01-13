// Form Validation Module
const FormValidation = (() => {
    // Validation Rules
    const rules = {
        required: (value) => {
            return value && value.trim() !== '';
        },

        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },

        password: (value) => {
            return value && value.length >= 8;
        },

        strongPassword: (value) => {
            const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return strongRegex.test(value);
        },

        phone: (value) => {
            const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
            return phoneRegex.test(value);
        },

        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },

        zipcode: (value) => {
            const zipcodeRegex = /^[0-9]{5,10}$/;
            return zipcodeRegex.test(value);
        },

        number: (value) => {
            return !isNaN(value) && value !== '';
        },

        integer: (value) => {
            return Number.isInteger(Number(value));
        },

        decimal: (value, places = 2) => {
            const decimalRegex = new RegExp(`^\\d+(\\.\\d{1,${places}})?$`);
            return decimalRegex.test(value);
        },

        min: (value, min) => {
            return value && value.length >= min;
        },

        max: (value, max) => {
            return value && value.length <= max;
        },

        minValue: (value, min) => {
            return Number(value) >= min;
        },

        maxValue: (value, max) => {
            return Number(value) <= max;
        },

        match: (value, otherValue) => {
            return value === otherValue;
        },

        date: (value) => {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return dateRegex.test(value) && !isNaN(new Date(value).getTime());
        },

        creditCard: (value) => {
            const creditCardRegex = /^[0-9]{13,19}$/;
            return creditCardRegex.test(value.replace(/\s/g, ''));
        },

        username: (value) => {
            const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
            return usernameRegex.test(value);
        },

        custom: (value, fn) => {
            return fn(value);
        }
    };

    // Error Messages
    const messages = {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        password: 'Password must be at least 8 characters',
        strongPassword: 'Password must contain uppercase, lowercase, numbers and special characters',
        phone: 'Please enter a valid phone number',
        url: 'Please enter a valid URL',
        zipcode: 'Please enter a valid zip code',
        number: 'Please enter a valid number',
        integer: 'Please enter a whole number',
        decimal: 'Please enter a valid decimal number',
        min: (min) => `Must be at least ${min} characters`,
        max: (max) => `Must not exceed ${max} characters`,
        minValue: (min) => `Must be at least ${min}`,
        maxValue: (max) => `Must not exceed ${max}`,
        match: 'Values do not match',
        date: 'Please enter a valid date',
        creditCard: 'Please enter a valid credit card number',
        username: 'Username must be 3-16 characters (alphanumeric and underscore only)',
        custom: 'This field is invalid'
    };

    // Form Validation
    const validateForm = (formSelector, config = {}) => {
        const form = document.querySelector(formSelector);
        if (!form) return false;

        let isValid = true;
        const fields = form.querySelectorAll('[data-validate]');

        fields.forEach(field => {
            const result = validateField(field);
            if (!result.valid) {
                isValid = false;
            }
        });

        return isValid;
    };

    // Field Validation
    const validateField = (field) => {
        const validationRules = field.getAttribute('data-validate').split('|');
        let isValid = true;
        let errorMessage = '';

        for (const rule of validationRules) {
            let ruleName = rule;
            let ruleValue = null;

            if (rule.includes(':')) {
                [ruleName, ruleValue] = rule.split(':');
            }

            if (!validateRule(field.value, ruleName, ruleValue)) {
                isValid = false;
                errorMessage = ruleValue ? messages[ruleName](ruleValue) : messages[ruleName];
                break;
            }
        }

        updateFieldStatus(field, isValid, errorMessage);
        return { valid: isValid, message: errorMessage };
    };

    // Validate Single Rule
    const validateRule = (value, ruleName, ruleValue) => {
        if (!rules[ruleName]) {
            console.warn(`Validation rule "${ruleName}" not found`);
            return true;
        }

        if (ruleValue) {
            return rules[ruleName](value, ruleValue);
        } else {
            return rules[ruleName](value);
        }
    };

    // Update Field Status
    const updateFieldStatus = (field, isValid, errorMessage = '') => {
        const group = field.closest('.form-group');
        if (!group) return;

        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            group.classList.remove('is-invalid');
            group.classList.add('is-valid');

            const feedback = group.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            group.classList.remove('is-valid');
            group.classList.add('is-invalid');

            let feedback = group.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback show';
                group.appendChild(feedback);
            }
            feedback.textContent = errorMessage;
        }
    };

    // Setup Form Validation
    const setupFormValidation = (formSelector, options = {}) => {
        const form = document.querySelector(formSelector);
        if (!form) return;

        const fields = form.querySelectorAll('[data-validate]');

        fields.forEach(field => {
            // Real-time validation on blur
            if (options.realTime !== false) {
                field.addEventListener('blur', () => {
                    validateField(field);
                });

                // Optional: Real-time validation on input with debounce
                if (options.onInput) {
                    let timeout;
                    field.addEventListener('input', () => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            validateField(field);
                        }, 500);
                    });
                }
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            if (!validateForm(formSelector)) {
                e.preventDefault();
                if (options.onError) {
                    options.onError('Please fix the validation errors');
                }
            } else {
                if (options.onSuccess) {
                    e.preventDefault();
                    options.onSuccess(form);
                }
            }
        });
    };

    // Check if field has errors
    const hasErrors = (formSelector) => {
        const form = document.querySelector(formSelector);
        if (!form) return false;

        const invalidFields = form.querySelectorAll('.is-invalid');
        return invalidFields.length > 0;
    };

    // Clear all validation
    const clearValidation = (formSelector) => {
        const form = document.querySelector(formSelector);
        if (!form) return;

        form.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });

        form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.textContent = '';
        });

        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('is-valid', 'is-invalid');
        });
    };

    // Reset form validation
    const resetValidation = (formSelector) => {
        clearValidation(formSelector);
        const form = document.querySelector(formSelector);
        if (form) form.reset();
    };

    // Add custom validation rule
    const addRule = (ruleName, validationFn, errorMessage) => {
        rules[ruleName] = validationFn;
        messages[ruleName] = errorMessage;
    };

    // Get form data
    const getFormData = (formSelector) => {
        const form = document.querySelector(formSelector);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    };

    // Validate specific field
    const validateFieldByName = (formSelector, fieldName) => {
        const form = document.querySelector(formSelector);
        if (!form) return { valid: false };

        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return { valid: false };

        return validateField(field);
    };

    // Public API
    return {
        validateForm,
        validateField,
        validateFieldByName,
        setupFormValidation,
        hasErrors,
        clearValidation,
        resetValidation,
        addRule,
        getFormData,
        updateFieldStatus,
        rules,
        messages
    };
})();

// Initialize form validation on page load
document.addEventListener('DOMContentLoaded', () => {
    // Auto-setup forms with data-form-validate attribute
    const forms = document.querySelectorAll('[data-form-validate]');
    forms.forEach(form => {
        FormValidation.setupFormValidation(form, {
            realTime: true,
            onInput: true,
            onSuccess: (form) => {
                console.log('Form is valid');
            },
            onError: (message) => {
                console.error(message);
            }
        });
    });
});
