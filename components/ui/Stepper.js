'use client';

import styles from './Stepper.module.css';

const DEFAULT_STEPS = [
  'Connect GitHub',
  'Setup Skills',
  'Select Projects',
  'Review & Estimate',
  'Generate',
];

/**
 * Stepper — horizontal stepper for multi-step flows.
 *
 * @param {object}  props
 * @param {number}  props.activeStep          — Zero-based index of the current active step.
 * @param {string[]} [props.steps]            — Array of step labels. Defaults to 5 GitForge steps.
 * @param {Function} [props.onStepClick]      — Called with step index when a completed step is clicked.
 * @param {string}  [props.className]         — Additional class names.
 * @param {string}  [props.id]                — Optional DOM id.
 */
export default function Stepper({
  activeStep = 0,
  steps = DEFAULT_STEPS,
  onStepClick,
  className = '',
  id,
}) {
  return (
    <nav
      id={id || 'stepper-nav'}
      className={`${styles.stepper} ${className}`}
      aria-label="Progress steps"
    >
      {steps.map((label, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isLast = index === steps.length - 1;

        const circleClass = [
          styles.circle,
          isActive ? styles.circleActive : '',
          isCompleted ? styles.circleCompleted : '',
        ]
          .filter(Boolean)
          .join(' ');

        const labelClass = [
          styles.label,
          isActive ? styles.labelActive : '',
          isCompleted ? styles.labelCompleted : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={index} className={styles.step}>
            <button
              id={`stepper-step-${index}`}
              className={circleClass}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              onClick={() => isCompleted && onStepClick?.(index)}
              disabled={!isCompleted}
              type="button"
              style={{
                cursor: isCompleted ? 'pointer' : 'default',
              }}
            >
              {isCompleted ? (
                <svg
                  className={styles.checkmark}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>

            <span className={labelClass}>{label}</span>

            {!isLast && (
              <div
                className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
