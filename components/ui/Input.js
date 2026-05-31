'use client';

import { useId } from 'react';
import styles from './Input.module.css';

/**
 * Input — styled input with label, error state, and icon support.
 *
 * @param {object}  props
 * @param {string}  [props.label]           — Label text displayed above the input.
 * @param {string}  [props.error]           — Error message. Renders red border + message when truthy.
 * @param {string}  [props.helperText]      — Helper text below the input (hidden when error is set).
 * @param {boolean} [props.required=false]  — Mark the field as required.
 * @param {React.ReactNode} [props.iconLeft]  — Icon element on the left side.
 * @param {React.ReactNode} [props.iconRight] — Icon element on the right side.
 * @param {string}  [props.id]              — DOM id. Auto-generated if omitted.
 * @param {string}  [props.type='text']     — Input type.
 * @param {string}  [props.placeholder]     — Placeholder text.
 * @param {string}  [props.className]       — Additional class names for the wrapper.
 * @param {string}  [props.value]           — Controlled value.
 * @param {Function} [props.onChange]       — Change handler.
 */
export default function Input({
  label,
  error,
  helperText,
  required = false,
  iconLeft,
  iconRight,
  id,
  type = 'text',
  placeholder,
  className = '',
  value,
  onChange,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || `input-${autoId}`;
  const errorId = `${inputId}-error`;

  const inputClasses = [
    styles.input,
    iconLeft ? styles.hasIconLeft : '',
    iconRight ? styles.hasIconRight : '',
    error ? styles.inputError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        <input
          id={inputId}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>

      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v3h-1v-3zm0 4h1v1h-1v-1z"
              fill="currentColor"
            />
          </svg>
          {error}
        </span>
      )}

      {!error && helperText && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
}
