import type { Subscription } from '../types/subscription'

/**
 * Sanitizes a string by removing control characters
 * Preserves printable unicode and whitespace necessary for CSV
 * 
 * @param field - String to sanitize
 * @returns Sanitized string without control characters
 */
function sanitizeControlCharacters(field: string): string {
  // Remove control characters (U+0000 to U+001F except \n, \r, \t)
  // Keep: \n (newline), \r (carriage return), \t (tab)
  return field.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Escapes a CSV field according to RFC 4180 standard + formula injection prevention
 * 
 * Handles:
 * - Commas, quotes, newlines, carriage returns per RFC 4180
 * - Formula injection prevention (=, +, -, @, tab at start)
 * - Control character sanitization
 * 
 * @param field - String value to escape
 * @returns Escaped field, safe for CSV format and spreadsheet apps
 */
function escapeCSVField(field: string): string {
  // Handle null/undefined
  if (field == null) {
    return ''
  }

  const str = String(field).trim()
  
  // Sanitize control characters
  const sanitized = sanitizeControlCharacters(str)
  
  // Prevent CSV/formula injection by prefixing formula indicators with single quote
  // Excel, Google Sheets treat =, +, -, @, and tab as formula starters
  let escaped = sanitized
  if (/^[=+\-@\t]/.test(escaped)) {
    escaped = `'${escaped}`
  }
  
  // RFC 4180: Check if field needs quoting (contains comma, quote, newline, or carriage return)
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
    // Wrap in quotes and escape internal quotes by doubling them
    return `"${escaped.replace(/"/g, '""')}"`
  }
  
  return escaped
}

/**
 * Formats a timestamp (milliseconds) as ISO date string (YYYY-MM-DD)
 * 
 * Safe for spreadsheet applications, universally compatible
 * Handles null/undefined by returning empty string
 * 
 * @param timestamp - Milliseconds since epoch
 * @returns ISO date string (e.g., "2026-05-11") or empty string if invalid
 */
function formatDate(timestamp: number | null | undefined): string {
  if (timestamp == null || isNaN(timestamp)) {
    return ''
  }
  try {
    return new Date(timestamp).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Calculates next billing date based on day of month
 * 
 * Validates dueDate is in valid range [1, 31]
 * Handles month-end boundary (e.g., Feb 31 → Feb 28/29)
 * 
 * If today's day >= dueDate, next billing is next month
 * Otherwise next billing is this month
 * 
 * @param dueDate - Day of month (1-31)
 * @returns Formatted date string (YYYY-MM-DD) or empty string if invalid
 */
function calculateNextBillingDate(dueDate: number | null | undefined): string {
  // Validate dueDate is a number in range [1, 31]
  if (dueDate == null || isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
    return ''
  }
  
  const today = new Date()
  const currentDay = today.getDate()
  
  // Determine year and month for next billing date
  let year = today.getFullYear()
  let month = today.getMonth()
  
  // If we've already passed the due date this month, next billing is next month
  if (currentDay >= dueDate) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }
  
  // Create date object for the billing date
  // JavaScript Date constructor automatically handles month overflow
  // e.g., new Date(2026, 1, 31) becomes March 3 (Feb 28 + 3 days)
  // So we clamp dueDate to the last valid day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  const clampedDueDate = Math.min(dueDate, lastDayOfMonth)
  
  const billingDate = new Date(year, month, clampedDueDate)
  
  return formatDate(billingDate.getTime())
}

/**
 * Validates subscription array and checks for potential issues
 * 
 * @param subscriptions - Array to validate
 * @returns True if valid, throws error if problematic
 */
function validateSubscriptions(subscriptions: any[]): boolean {
  if (!subscriptions) {
    throw new Error('Subscriptions array is null or undefined')
  }
  if (!Array.isArray(subscriptions)) {
    throw new Error('Subscriptions must be an array')
  }
  
  // Warn if exporting very large dataset (>100K rows = ~50MB)
  if (subscriptions.length > 100000) {
    console.warn(`Exporting ${subscriptions.length} subscriptions may take several seconds and consume significant memory`)
  }
  
  return true
}

/**
 * Generates CSV content string from subscription array
 * 
 * Handles proper column ordering, data formatting, escaping, validation, and UTF-8 encoding
 * Returns complete CSV with headers and all subscription rows
 * 
 * Columns (exact order from spec):
 * 1. Subscription Name
 * 2. Monthly Cost (2 decimals)
 * 3. Billing Cycle (day of month, 1-31)
 * 4. Next Billing Date (YYYY-MM-DD format)
 * 5. Date Added (YYYY-MM-DD format)
 * 6. Category (empty for now)
 * 7. Notes (empty for now)
 * 
 * @param subscriptions - Array of Subscription objects to export
 * @returns CSV string with UTF-8 encoded content
 * @throws Error if subscriptions array is invalid
 * 
 * @example
 * const csv = generateCSV([{ id: '1', name: 'Netflix', cost: 15.99, ... }])
 * // Returns: "Subscription Name,Monthly Cost,...\nNetflix,15.99,..."
 */
export function generateCSV(subscriptions: Subscription[]): string {
  // Validate input
  validateSubscriptions(subscriptions)
  
  // CSV Header row - exact column order from spec
  const headers = [
    'Subscription Name',
    'Monthly Cost',
    'Billing Cycle',
    'Next Billing Date',
    'Date Added',
    'Category',
    'Notes',
  ]
  
  // Build CSV rows from subscription data
  const rows = subscriptions.map((sub) => {
    // Validate subscription data, provide fallbacks
    const name = sub?.name ?? ''
    const cost = sub?.cost ?? 0
    const dueDate = sub?.dueDate ?? 1
    const createdAt = sub?.createdAt ?? Date.now()
    
    // Validate cost is a valid number >= 0
    const validCost = typeof cost === 'number' && !isNaN(cost) && cost >= 0 ? cost : 0
    
    return [
      escapeCSVField(name), // Column 1: Subscription Name
      validCost.toFixed(2), // Column 2: Monthly Cost (2 decimals)
      String(dueDate), // Column 3: Billing Cycle (day of month)
      calculateNextBillingDate(dueDate), // Column 4: Next Billing Date
      formatDate(createdAt), // Column 5: Date Added
      '', // Column 6: Category (empty - not in data model)
      '', // Column 7: Notes (empty - not in data model)
    ]
  })
  
  // Combine headers and rows into single CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')
  
  return csvContent
}

/**
 * Triggers browser download of CSV blob
 * 
 * Creates a Blob object, generates a download link, simulates click, and cleans up
 * Uses browser's native download capability - no server required
 * 
 * IMPORTANT: Calls URL.revokeObjectURL() immediately after download to prevent memory leaks
 * 
 * @param csvContent - CSV string content to download
 * @param filename - Filename for download (e.g., "subscriptions_20260511.csv")
 * 
 * @throws Error if Blob or URL APIs are not supported (unlikely in modern browsers)
 * 
 * @example
 * downloadCSV(csvContent, 'subscriptions_20260511.csv')
 */
export function downloadCSV(csvContent: string, filename: string): void {
  try {
    // Create Blob with UTF-8 encoding specified
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    
    // Create object URL from blob
    const url = URL.createObjectURL(blob)
    
    // Create temporary download link
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    
    // Trigger download
    link.click()
    
    // Cleanup: revoke object URL to free memory IMMEDIATELY
    // This prevents memory leaks on repeated exports
    URL.revokeObjectURL(url)
  } catch (error) {
    // If download fails, provide context for debugging
    console.error('Failed to download CSV:', {
      filename,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
    throw new Error(`Failed to download file: ${filename}`)
  }
}

/**
 * Complete export workflow: generate CSV and trigger download
 * 
 * Combines generateCSV + downloadCSV with filename generation
 * Filename format: subscriptions_YYYYMMDD.csv (e.g., subscriptions_20260511.csv)
 * 
 * @param subscriptions - Array of subscriptions to export
 * 
 * @throws Error with context about what failed (validation, generation, or download)
 * 
 * @example
 * exportSubscriptionsAsCSV(filteredSubscriptions)
 */
export function exportSubscriptionsAsCSV(subscriptions: Subscription[]): void {
  try {
    // Generate filename with current date in YYYYMMDD format
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '') // "20260511"
    const filename = `subscriptions_${dateStr}.csv`
    
    // Generate CSV content - may throw validation errors
    const csvContent = generateCSV(subscriptions)
    
    // Trigger download - may throw download errors
    downloadCSV(csvContent, filename)
  } catch (error) {
    // Re-throw with context for component error handling
    const context = {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      subscriptionsCount: subscriptions?.length ?? 0,
    }
    console.error('CSV export failed:', context)
    throw error
  }
}
