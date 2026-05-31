'use client';

import styles from './Card.module.css';

/**
 * Card — glassmorphism card with optional glow and hover effects.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children   — Card content.
 * @param {string}  [props.className]        — Additional class names.
 * @param {boolean} [props.glow=false]       — Enable gradient glow border on hover.
 * @param {boolean} [props.hoverable=false]  — Enable lift-on-hover interaction.
 * @param {string}  [props.id]               — Optional DOM id.
 * @param {object}  [props.style]            — Inline style overrides.
 */
export default function Card({
  children,
  className = '',
  glow = false,
  hoverable = false,
  id,
  style,
  ...rest
}) {
  const classNames = [
    styles.card,
    glow ? styles.glow : '',
    hoverable ? styles.hoverable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={classNames} style={style} {...rest}>
      {children}
    </div>
  );
}
