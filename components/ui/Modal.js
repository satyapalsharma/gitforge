'use client';

import { useRef, useCallback, useEffect } from 'react';
import styles from './Modal.module.css';

/**
 * Modal — dialog component using the native HTML <dialog> element.
 *
 * @param {object}  props
 * @param {boolean} props.open               — Whether the modal is open.
 * @param {Function} props.onClose           — Called when the modal should close.
 * @param {string}  [props.title]            — Optional header title.
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] — Width variant.
 * @param {React.ReactNode} [props.footer]   — Optional footer content (e.g. buttons).
 * @param {React.ReactNode} props.children   — Modal body content.
 * @param {string}  [props.className]        — Additional class names.
 * @param {string}  [props.id]               — Optional DOM id.
 */
export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  children,
  className = '',
  id,
}) {
  const dialogRef = useRef(null);
  const closingRef = useRef(false);

  // Open / close the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open && !closingRef.current) {
      closeWithAnimation();
    }
  }, [open]);

  const closeWithAnimation = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || closingRef.current) return;

    closingRef.current = true;
    dialog.classList.add(styles.dialogClosing);

    const onEnd = () => {
      dialog.classList.remove(styles.dialogClosing);
      dialog.close();
      closingRef.current = false;
      dialog.removeEventListener('animationend', onEnd);
    };

    dialog.addEventListener('animationend', onEnd);
  }, []);

  // Handle native close (Escape key, form method=dialog, etc.)
  const handleCancel = useCallback(
    (e) => {
      e.preventDefault();
      onClose?.();
    },
    [onClose],
  );

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === dialogRef.current) {
        onClose?.();
      }
    },
    [onClose],
  );

  const dialogClasses = [
    styles.dialog,
    size !== 'md' ? styles[size] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <dialog
      ref={dialogRef}
      id={id || 'modal-dialog'}
      className={dialogClasses}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button
              id="modal-close-btn"
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
