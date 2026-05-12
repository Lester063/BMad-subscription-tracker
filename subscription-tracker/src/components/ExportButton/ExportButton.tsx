import { useState, useEffect, useRef } from 'react'
import type { Subscription } from '../../types/subscription'
import { exportSubscriptionsAsCSV } from '../../utils/csvExport'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  subscriptions: Subscription[]
  onExportStart?: () => void
  onExportComplete?: () => void
}

/**
 * ExportButton Component - Allows users to download subscriptions as CSV file
 * 
 * Features:
 * - Disabled state during export (prevents duplicate requests)
 * - Visual feedback with loading indicator
 * - Error handling with user-friendly messages
 * - Accessible: aria-label, aria-busy, live region for errors
 * - Respects filtered subscriptions (exports only what's visible to user)
 * - Proper cleanup on unmount to prevent memory leaks
 * 
 * Download behavior:
 * - Uses browser's native Blob + URL.createObjectURL API
 * - No external dependencies
 * - No server required
 * - Filename format: subscriptions_YYYYMMDD.csv
 * 
 * @param props.subscriptions - Array of subscriptions to export (should be filtered)
 * @param props.onExportStart - Optional callback when export begins
 * @param props.onExportComplete - Optional callback when export completes
 */
export function ExportButton({
  subscriptions,
  onExportStart,
  onExportComplete,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup on unmount to prevent "state update on unmounted component" warnings
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Safely update state only if component is still mounted
  const safeSetIsExporting = (value: boolean) => {
    if (isMountedRef.current) {
      setIsExporting(value)
    }
  }

  const safeSetError = (errorMsg: string | null) => {
    if (isMountedRef.current) {
      setError(errorMsg)
    }
  }

  // Validate subscriptions prop
  const validSubscriptions = subscriptions ?? []
  const isDisabled = validSubscriptions.length === 0 || isExporting

  const handleExport = () => {
    // Prevent rapid re-exports - check both isExporting state and validSubscriptions
    if (isExporting) {
      return; // Already exporting, ignore subsequent clicks
    }

    // Prevent exports with no data
    if (validSubscriptions.length === 0) {
      safeSetError('No subscriptions to export')
      return
    }

    try {
      safeSetIsExporting(true)
      safeSetError(null)
      onExportStart?.()

      // Perform export
      exportSubscriptionsAsCSV(validSubscriptions)

      // Add small delay to keep button disabled during download
      // Prevents rapid-click duplicate exports
      // Button will remain disabled for 500ms, providing user feedback
      setTimeout(() => {
        safeSetIsExporting(false)
        
        // Separate callback execution from export error handling
        // If callback throws, don't show export error message
        try {
          onExportComplete?.()
        } catch (callbackError) {
          console.error('Export complete callback failed:', callbackError)
          // Don't set error state - export succeeded, only callback failed
        }
      }, 500)
    } catch (err) {
      // Graceful error handling with context
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      console.error('CSV export error:', {
        error: errorMessage,
        subscriptionsCount: validSubscriptions.length,
        timestamp: new Date().toISOString(),
        fullError: err,
      })
      
      safeSetError('Export failed. Please try again.')
      safeSetIsExporting(false)
    }
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleExport}
        disabled={isDisabled}
        aria-label={
          validSubscriptions.length === 0
            ? 'Export button disabled - no subscriptions to export'
            : isExporting
              ? 'Exporting subscriptions to CSV file'
              : 'Export subscription list as CSV file'
        }
        aria-busy={isExporting}
        title={
          validSubscriptions.length === 0
            ? 'No subscriptions to export'
            : 'Download your subscriptions as a CSV file'
        }
        className={`${styles.button} ${isExporting ? styles['button--loading'] : ''}`}
      >
        <span className={styles.icon}>📥</span>
        <span className={styles.label}>
          {isExporting ? 'Exporting...' : 'Export'}
        </span>
      </button>

      {error && (
        <div 
          className={styles.error}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {error}
        </div>
      )}
    </div>
  )
}
