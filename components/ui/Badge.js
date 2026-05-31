'use client';

import styles from './Badge.module.css';

/**
 * Badge — small tag component for labels and statuses.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children                    — Badge label text.
 * @param {'default'|'success'|'warning'|'info'} [props.variant='default'] — Color variant.
 * @param {boolean} [props.dot=false]                         — Show a leading dot indicator.
 * @param {string}  [props.className]                         — Additional class names.
 * @param {string}  [props.id]                                — Optional DOM id.
 */
export default function Badge({
  children,
  variant = 'default',
  dot = false,
  className = '',
  id,
  ...rest
}) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span id={id} className={classNames} {...rest}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
