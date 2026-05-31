'use client';

import { useId } from 'react';
import styles from './Button.module.css';
import Spinner from './Spinner';

/**
 * Button — reusable button component with variants, sizes, and loading state.
 *
 * @param {object}  props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary'] — Visual variant.
 * @param {'sm'|'md'|'lg'}  [props.size='md']     — Button size.
 * @param {boolean} [props.loading=false]           — Show spinner and disable interactions.
 * @param {boolean} [props.disabled=false]          — Disable the button.
 * @param {boolean} [props.fullWidth=false]         — Stretch to full container width.
 * @param {React.ReactNode} [props.icon]            — Leading icon element.
 * @param {string}  [props.id]                      — DOM id. Auto-generated if omitted.
 * @param {string}  [props.type='button']           — HTML button type.
 * @param {string}  [props.className]               — Additional class names.
 * @param {React.ReactNode} props.children          — Button label.
 * @param {Function} [props.onClick]                — Click handler.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  id,
  type = 'button',
  className = '',
  children,
  onClick,
  ...rest
}) {
  const autoId = useId();
  const buttonId = id || `btn-${autoId}`;

  const spinnerSize = size === 'lg' ? 'md' : 'sm';

  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      id={buttonId}
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      aria-label={loading ? 'Loading…' : undefined}
      {...rest}
    >
      {loading && (
        <span className={styles.spinnerWrapper}>
          <Spinner size={spinnerSize} />
        </span>
      )}
      <span className={loading ? styles.contentHidden : undefined}>
        {icon && icon}
        {children}
      </span>
    </button>
  );
}
