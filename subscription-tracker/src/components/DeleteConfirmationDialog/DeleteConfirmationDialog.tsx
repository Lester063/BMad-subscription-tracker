/**
 * DeleteConfirmationDialog Component
 * Story 4.2: Implement Delete Subscription Workflow
 * 
 * A modal dialog that confirms subscription deletion before permanently removing it.
 * 
 * Features:
 * - Modal overlay with semantic HTML (role="dialog", aria-modal)
 * - Cancel and Confirm Delete buttons
 * - Keyboard navigation: Escape to cancel, Tab to navigate
 * - Focus management: Auto-focus Cancel button on open
 * - WCAG 2.1 Level A accessibility compliance
 * - Displays subscription name for clarity
 * 
 * @component
 * @requires Subscription type
 * @requires DeleteConfirmationDialog.module.css
 */

import { useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import type { Subscription } from '../../types/subscription'
import styles from './DeleteConfirmationDialog.module.css'

/**
 * Props for DeleteConfirmationDialog component
 */
export interface DeleteConfirmationDialogProps {
  /** The subscription object being deleted (displayed in confirmation message) */
  subscription: Subscription

  /** Whether the dialog is open and visible */
  isOpen: boolean

  /** Callback when Cancel button is clicked or Escape key pressed */
  onCancel: () => void

  /** Callback when Confirm Delete button is clicked */
  onConfirm: () => void

  /** Optional loading state (disables buttons during async operations) */
  isLoading?: boolean
}

/**
 * Renders a confirmation dialog for deleting a subscription
 * 
 * Displays subscription name and asks for confirmation before deletion.
 * Handles keyboard events (Escape to cancel) and manages focus.
 * 
 * @param props - Component props
 * @returns {JSX.Element | null} Dialog element or null if not open
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const [toDelete, setToDelete] = useState<Subscription | null>(null)
 * 
 * return (
 *   <>
 *     <DeleteConfirmationDialog
 *       subscription={toDelete!}
 *       isOpen={isOpen}
 *       onCancel={() => setIsOpen(false)}
 *       onConfirm={() => {
 *         deleteSubscription(toDelete!.id)
 *         setIsOpen(false)
 *       }}
 *     />
 *   </>
 * )
 * ```
 */
export function DeleteConfirmationDialog({
  subscription,
  isOpen,
  onCancel,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps): JSX.Element | null {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // AC8 + AC9: Auto-focus Cancel button when dialog opens for accessibility
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Use setTimeout to ensure focus happens after render
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // AC8: Handle Escape key to close dialog (keyboard navigation)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [isOpen, onCancel])

  // Don't render if not open (AC1 requirement: dialog appears when triggered)
  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.overlay}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={styles.dialog}
      >
        {/* AC2 + AC9: Dialog title with id for aria-labelledby */}
        <h2 id="dialog-title" className={styles.title}>
          Are you sure?
        </h2>

        {/* AC2: Confirmation message showing subscription name */}
        <p className={styles.message}>
          Delete "<strong>{subscription.name}</strong>"? This action cannot be undone.
        </p>

        {/* AC3: Cancel and Confirm Delete buttons */}
        <div className={styles.dialogActions}>
          {/* AC4: Cancel button closes dialog without side effects */}
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={isLoading}
            className={styles.buttonSecondary}
            type="button"
            aria-label="Cancel delete operation"
          >
            Cancel
          </button>

          {/* AC5: Confirm Delete button triggers deletion */}
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.buttonDanger}
            type="button"
            aria-label={`Confirm delete ${subscription.name}`}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  )
}
