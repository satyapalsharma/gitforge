'use client';

import styles from './Spinner.module.css';

/**
 * Spinner — animated loading indicator.
 *
 * @param {object}  props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']   — Visual size of the spinner.
 * @param {string}  [props.color]        — Optional CSS color override (defaults to `currentColor`).
 * @param {string}  [props.className]    — Additional class names.
 * @param {string}  [props.id]           — Optional DOM id.
 * @param {string}  [props.label='Loading'] — Accessible label for screen readers.
 */
export default function Spinner({
  size = 'md',
  color,
  className = '',
  id,
  label = 'Loading',
}) {
  return (
    <span
      id={id}
      className={`${styles.spinner} ${styles[size]} ${className}`}
      style={color ? { borderTopColor: color } : undefined}
      role="status"
      aria-label={label}
    />
  );
}
