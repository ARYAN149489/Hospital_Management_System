// frontend/src/hooks/useForm.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {object} initialValues - Initial form values
 * @param {function} onSubmit - Submit handler function
 * @param {object} validationRules - Validation rules for each field
 * @returns {object} Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    if (validationRules[name]) {
      validateField(name, values[name]);
    }
  }, [values, validationRules]);

  // Validate single field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return true;

    let error = '';

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      error = rules.message || `${name} is required`;
    }

    // Min length validation
    if (!error && rules.minLength && value.length < rules.minLength) {
      error = rules.message || `${name} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (!error && rules.maxLength && value.length > rules.maxLength) {
      error = rules.message || `${name} must not exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (!error && rules.pattern && !rules.pattern.test(value)) {
      error = rules.message || `${name} format is invalid`;
    }

    // Custom validation
    if (!error && rules.validate) {
      const customError = rules.validate(value, values);
      if (customError) error = customError;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  }, [validationRules, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const rules = validationRules[name];
      const value = values[name];
      let error = '';

      // Required validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        error = rules.message || `${name} is required`;
        isValid = false;
      }

      // Min length validation
      if (!error && rules.minLength && value?.length < rules.minLength) {
        error = rules.message || `${name} must be at least ${rules.minLength} characters`;
        isValid = false;
      }

      // Max length validation
      if (!error && rules.maxLength && value?.length > rules.maxLength) {
        error = rules.message || `${name} must not exceed ${rules.maxLength} characters`;
        isValid = false;
      }

      // Pattern validation
      if (!error && rules.pattern && value && !rules.pattern.test(value)) {
        error = rules.message || `${name} format is invalid`;
        isValid = false;
      }

      // Custom validation
      if (!error && rules.validate) {
        const customError = rules.validate(value, values);
        if (customError) {
          error = customError;
          isValid = false;
        }
      }

      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set specific field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Set multiple values at once
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setFormValues,
    validateField,
    validateForm
  };
};

export default useForm;