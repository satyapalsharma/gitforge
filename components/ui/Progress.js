'use client';

import { useId } from 'react';
import styles from './Progress.module.css';

/**
 * Progress — animated progress bar with shimmer effect.
 *
 * @param {object}  props
 * @param {number}  props.value             — Current progress (0–100).
 * @param {string}  [props.label]           — Optional label text shown above the bar.
 * @param {boolean} [props.showPercentage=true] — Show percentage text.
 * @param {'sm'|'md'|'lg'} [props.size='md'] — Track height variant.
 * @param {boolean} [props.shimmer=true]    — Enable shimmer animation on the fill.
 * @param {string}  [props.className]       — Additional class names.
 * @param {string}  [props.id]              — Optional DOM id.
 */
export default function Progress({
  value = 0,
  label,
  showPercentage = true,
  size = 'md',
  shimmer = true,
  className = '',
  id,
}) {
  const autoId = useId();
  const progressId = id || `progress-${autoId}`;
  const clamped = Math.max(0, Math.min(100, value));
  const isComplete = clamped >= 100;

  const trackClass = [
    styles.track,
    size === 'sm' ? styles.trackSm : '',
    size === 'lg' ? styles.trackLg : '',
  ]
    .filter(Boolean)
    .join(' ');

  const fillClass = [
    styles.fill,
    shimmer && !isComplete ? styles.shimmer : '',
    isComplete ? styles.fillComplete : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={progressId} className={`${styles.wrapper} ${className}`}>
      {(label || showPercentage) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && (
            <span
              className={`${styles.percentage} ${isComplete ? styles.percentageComplete : ''}`}
            >
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      <div
        className={trackClass}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className={fillClass} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
