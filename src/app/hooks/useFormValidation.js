'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * @param {Object} rules - Validation rules { fieldName: { required: boolean, message: string } }
 * @returns {Object} - { errors, validate, clearErrors, clearFieldError, getFieldClass }
 */
export function useFormValidation(rules = {}) {
  const [errors, setErrors] = useState({});

  // Validate all fields or specific fields
  const validate = useCallback((formData, fieldsToValidate = null) => {
    const newErrors = {};
    const fieldsToCheck = fieldsToValidate || Object.keys(rules);

    fieldsToCheck.forEach((field) => {
      const rule = rules[field];
      if (!rule) return;

      const value = formData[field];

      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || `${field} is required`;
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        newErrors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `${field} is invalid`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Get input class based on error state
  const getFieldClass = useCallback((field, baseClass = '') => {
    const errorClass = errors[field] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : '';
    return `${baseClass} ${errorClass}`.trim();
  }, [errors]);

  return {
    errors,
    validate,
    clearErrors,
    clearFieldError,
    getFieldClass,
  };
}

/**
 * Reusable error message component
 */
export function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-red-600">{error}</p>
  );
}

