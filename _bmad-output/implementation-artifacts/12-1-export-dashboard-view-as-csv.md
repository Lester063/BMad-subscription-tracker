---
story_id: "12.1"
story_key: "12-1-export-dashboard-view-as-csv"
epic: "12"
epic_title: "Export Subscriptions as CSV"
status: "ready-for-dev"
created: "2026-05-11"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
feature_spec: "specs/002-export-subscriptions-csv/spec.md"
acceptance_test_file: "tests/e2e/export-subscriptions.spec.ts"
---

# Story 12.1: Export Dashboard View as CSV

**Epic:** Export Subscriptions as CSV (Epic 12)  
**Story ID:** 12.1  
**Status:** ready-for-dev  
**Priority:** P1 — Core value proposition (MVP feature)  
**Feature Spec:** [002-export-subscriptions-csv/spec.md](../../specs/002-export-subscriptions-csv/spec.md)

---

## Story Statement

**As a** user with multiple subscriptions,  
**I want** to export my current subscription list to a CSV file format,  
**So that** I can analyze, organize, or backup my subscription data outside the application (spreadsheet applications, data analysis, record-keeping).

---

## Acceptance Criteria

### Critical Path (Must-Have)

1. **Export Button Visibility & Placement**
   - **Given** a user is viewing the dashboard with subscriptions
   - **When** they look at the subscription list section
   - **Then** they see a "Subscription List" header above the search/filter controls
   - **And** an export button with an icon is positioned on the right side of that header
   - **And** the button is clearly labeled "Export" or has visible export icon

2. **CSV Download Mechanism**
   - **Given** the user clicks the export button
   - **When** the export completes
   - **Then** a CSV file is automatically downloaded to their default downloads folder
   - **And** the filename follows the format: `subscriptions_YYYYMMDD.csv` (e.g., `subscriptions_20260511.csv`)
   - **And** the file is not named with timestamp/milliseconds—only the date

3. **CSV Columns & Content**
   - **Given** the CSV file is downloaded
   - **When** the user opens it in a spreadsheet application (Excel, Google Sheets, etc.)
   - **Then** the CSV contains exactly 7 columns in this order:
     - `Subscription Name` — The subscription name as entered by user
     - `Monthly Cost` — Cost as a number (e.g., 15.99)
     - `Billing Cycle` — The billing cycle (expected: numeric day of month, 1-31)
     - `Next Billing Date` — Calculated next billing date (formatted readable date)
     - `Date Added` — When the subscription was created (readable date format)
     - `Category` — Currently empty/not used (include column for future expansion)
     - `Notes` — Currently empty/not used (include column for future expansion)
   - **And** each row contains the subscription data accurately with no truncation or corruption
   - **And** the file is encoded in UTF-8 for maximum compatibility

4. **All Subscriptions Exported**
   - **Given** the subscription list contains multiple subscriptions
   - **When** the export completes
   - **Then** the CSV includes 100% of visible subscriptions (no missing or duplicated records)
   - **And** the row count matches exactly what the user sees on screen

5. **CSV Format Compliance**
   - **Given** a CSV file is generated
   - **When** the file is analyzed
   - **Then** it follows standard CSV format (RFC 4180)
   - **And** special characters (commas, quotes, newlines) are properly escaped
   - **And** quoted fields contain their literal content (e.g., `"Netflix, HBO & Disney+"` → single field)
   - **And** the file opens without warnings in Excel, Google Sheets, and other standard spreadsheet applications

6. **Export Button State Management**
   - **Given** the user clicks the export button
   - **When** the file generation is in progress (< 2 second process)
   - **Then** the button is disabled to prevent duplicate export requests
   - **And** the button re-enables once the file download completes
   - **And** the user sees visual feedback (e.g., button text changes or spinner appears)

### Performance Requirements

7. **Export Speed**
   - **Given** the user clicks the export button
   - **When** the export operation runs
   - **Then** the CSV file downloads within 2 seconds from click to completion
   - **And** the operation does not freeze or slow the UI
   - **And** the app remains responsive during export

8. **Scalability**
   - **Given** a subscription list with 1-1000+ entries
   - **When** the export is triggered
   - **Then** the operation completes successfully without timeout or lag
   - **And** no data is lost or corrupted regardless of list size

---

## Developer Context & Architecture

### Current Project State

**Project:** BMad-subscription-tracker  
**Current Implementation Status:** Mid-development (Epics 1-11 mostly complete)
- Epic 1-5: ✅ Complete (Foundation, State Management, Add/Display, Edit/Delete, Cost Summary)
- Epic 11: ✅ Complete (Search & Filter implemented)
- Epic 4.2 & 11.7: 🔄 In-progress (Delete workflow, Clear filters)
- Epics 6-10: ⏸️ Backlog (Filtering, Duplicate Prevention, Error Handling, Styling, Testing)

**Key Architectural Patterns Already Established:**

1. **State Management Pattern (from Epic 2)**
   ```typescript
   // Context provides: addSubscription, updateSubscription, deleteSubscription, subscriptions
   const { subscriptions, addSubscription, updateSubscription } = useSubscriptions()
   ```

2. **Data Type (from Epic 2)**
   ```typescript
   export interface Subscription {
     id: string;              // UUID
     name: string;            // User-entered subscription name
     cost: number;            // Cost in USD
     dueDate: number;         // Day of month (1-31)
     createdAt: number;       // Timestamp in milliseconds
     updatedAt: number;       // Timestamp in milliseconds
   }
   ```

3. **Component Architecture (from Epics 3-5)**
   - Atomic design with functional components and hooks
   - Components live in `src/components/` with folder-per-component pattern
   - Each component: `ComponentName.tsx`, `ComponentName.module.css` (if styled), optional `.test.ts`
   - Example: `/src/components/SearchBar/SearchBar.tsx`

4. **Filter Pattern (from Epic 11)**
   ```typescript
   // Custom hook for filtered subscriptions
   const filteredSubscriptions = useFilteredSubscriptions()
   // Returns: Subscription[] (respects current search + cost range filters)
   ```

5. **localStorage Utility Pattern (from Epic 2)**
   ```typescript
   // In src/utils/localStorageManager.ts
   export function saveSubscriptionsToStorage(subscriptions: Subscription[]): boolean
   export function loadSubscriptionsFromStorage(): Subscription[]
   ```

6. **CSS Organization (from Architecture)**
   - CSS Modules for component-scoped styling
   - BEM naming convention: `.block__element--modifier`
   - Example: `.exportButton__icon--loading` or `.csvDownload__header`
   - Global CSS in `src/index.css`; component CSS in `src/components/ComponentName/ComponentName.module.css`

---

### Architecture Compliance Requirements

**This story MUST follow these architectural decisions (non-negotiable):**

#### A1: Data Flow

**Export Button Placement & Integration:**
- Button lives in the Dashboard (likely in `src/App.tsx` or new `Dashboard.tsx`)
- Button sits alongside "Subscription List" heading (must integrate with existing heading markup)
- Button has access to `filteredSubscriptions` (already available from `useFilteredSubscriptions()` hook)
- **Key Point:** Export the FILTERED subscriptions, not all subscriptions (respects current search + cost filters)

**Rationale:** Users expect export to match what they see on screen. If they've filtered to "Netflix only," export should only contain Netflix.

#### A2: CSV Generation Pattern

**Client-side generation (no server):**
```typescript
// CSV generation is 100% client-side via Blob + URL.createObjectURL
// Pattern from browser APIs (no external CSV library required)

// 1. Create CSV string manually
const csvContent = `Name,Cost,Billing Cycle\nNetflix,15.99,15\n...`

// 2. Create Blob
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

// 3. Create download link
const link = document.createElement('a')
link.setAttribute('href', URL.createObjectURL(blob))
link.setAttribute('download', filename)
link.click()

// 4. Cleanup
URL.revokeObjectURL(link.href)
```

**Why This Pattern?**
- Zero external dependencies (no `papaparse` or `csv-writer` needed)
- Browser-native APIs (supported in all modern browsers)
- Aligns with project constraint: no backend, all client-side
- Meets performance requirement: instant download, no API call latency

**Source:** [Architecture: Client-side only, no server required](../../_bmad-output/planning-artifacts/architecture.md#data-architecture)

#### A3: Filename Generation

**Pattern:**
```typescript
// Get current date in YYYYMMDD format
const today = new Date()
const dateStr = today.toISOString().split('T')[0].replace(/-/g, '') // "20260511"
const filename = `subscriptions_${dateStr}.csv`
```

**Requirements:**
- Format: `subscriptions_YYYYMMDD.csv` (exact)
- No milliseconds, no seconds, no time portion
- No special characters beyond underscore and dot
- Consistent naming for easy user file organization

#### A4: Special Character Handling (CSV Escaping)

**Standard CSV escaping rules (RFC 4180):**

```typescript
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Wrap in quotes and escape internal quotes
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

// Examples:
// "Netflix" → Netflix (no escaping needed)
// "Netflix, HBO & Disney+" → "Netflix, HBO & Disney+" (wrap in quotes)
// 'He said "Yes"' → "He said ""Yes""" (escape quotes)
// "Service\nWith\nNewlines" → "Service\nWith\nNewlines" (keep literal newlines)
```

**Why Correct Escaping Matters:**
- Without escaping: commas break CSV parsing (user's spreadsheet misaligns columns)
- Quote escaping: `"` → `""` is the CSV standard (not `\"`)
- Newlines: RFC 4180 allows literal newlines in quoted fields (don't replace with spaces)

**Source:** [Acceptance Criteria: Special characters properly escaped](../../specs/002-export-subscriptions-csv/spec.md#edge-cases)

#### A5: Column Order & Data Mapping

**Exact column order (from spec):**

| Column # | CSV Header | Source | Format | Example |
|----------|-----------|--------|--------|---------|
| 1 | `Subscription Name` | `subscription.name` | String, as-is | `Netflix` |
| 2 | `Monthly Cost` | `subscription.cost` | Number with 2 decimals | `15.99` |
| 3 | `Billing Cycle` | `subscription.dueDate` | Numeric day (1-31) | `15` |
| 4 | `Next Billing Date` | Calculated from `dueDate` | Readable date format | `May 15, 2026` or `2026-05-15` |
| 5 | `Date Added` | `subscription.createdAt` (timestamp in ms) | Readable date format | `May 11, 2026` or `2026-05-11` |
| 6 | `Category` | N/A (not in current data model) | Empty string (for now) | `` (blank) |
| 7 | `Notes` | N/A (not in current data model) | Empty string (for now) | `` (blank) |

**Date Formatting:**
- Use `toLocaleDateString()` for user's locale, OR
- Use ISO format `YYYY-MM-DD` for universal compatibility
- **Recommendation:** ISO format (`2026-05-11`) is safest for spreadsheets
- Apply consistently across both "Next Billing Date" and "Date Added"

```typescript
// Helper function
function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0] // "2026-05-11"
}

// Usage in CSV generation
const dateAdded = formatDate(subscription.createdAt)
const nextBillingDate = calculateNextBillingDate(subscription.dueDate)
```

#### A6: UTF-8 Encoding

**Requirement:**
```typescript
// When creating Blob, specify UTF-8 charset
const blob = new Blob([csvContent], {
  type: 'text/csv;charset=utf-8;'
})
```

**Why Explicit UTF-8?**
- Ensures special characters (é, ñ, 中文, emojis) are preserved
- Universal compatibility across Excel, Google Sheets, and other apps
- Required by spec for maximum compatibility

#### A7: Error Handling

**Graceful Degradation Pattern (from Architecture):**

If any error occurs during export:
1. Catch the error silently (don't throw to console)
2. Show user-friendly message: `"Export failed. Please try again."`
3. Re-enable export button immediately
4. Log error to console for debugging (dev only)

```typescript
try {
  // Generate CSV
  // Create blob
  // Trigger download
} catch (error) {
  console.error('CSV export error:', error) // Dev debugging
  setError('Export failed. Please try again.') // User message
} finally {
  setIsExporting(false) // Re-enable button
}
```

**Why This Pattern?**
- Never show technical errors to users (required by spec: "never technical jargon")
- Users always get a recoverable state
- Developers can debug via console during development

---

### Technical Requirements

#### TR-1: Files to Create/Modify

**NEW FILES:**
- [ ] `src/utils/csvExport.ts` — CSV generation utility functions
- [ ] `src/components/ExportButton/ExportButton.tsx` — Export button component
- [ ] `src/components/ExportButton/ExportButton.module.css` — Button styling

**MODIFIED FILES:**
- [ ] `src/App.tsx` — Add ExportButton, add "Subscription List" heading (if not present)

**EXISTING TESTS (RED PHASE):**
- `tests/e2e/export-subscriptions.spec.ts` — Already written (skip markers in place)
  - Remove `test.skip()` when implementing feature
  - All 7 test cases will turn GREEN once export is implemented

#### TR-2: Component Interface

**ExportButton Component:**
```typescript
interface ExportButtonProps {
  subscriptions: Subscription[]  // Data to export (filtered subscriptions)
  onExportStart?: () => void    // Optional: Called when export begins
  onExportComplete?: () => void // Optional: Called when export finishes
}

export function ExportButton(props: ExportButtonProps) {
  // Implementation
}
```

**Usage in App.tsx:**
```typescript
<ExportButton 
  subscriptions={filteredSubscriptions}
  onExportStart={() => setIsExporting(true)}
  onExportComplete={() => setIsExporting(false)}
/>
```

#### TR-3: CSV Utility Functions

**csvExport.ts should export:**

```typescript
/**
 * Generates CSV content string from subscription array
 * Handles escaping, formatting, column ordering per spec
 * 
 * @param subscriptions - Array of subscriptions to export
 * @returns CSV string with headers and rows
 */
export function generateCSV(subscriptions: Subscription[]): string

/**
 * Triggers browser download of CSV blob
 * Creates blob, generates download link, cleans up
 * 
 * @param csvContent - CSV string content
 * @param filename - Filename for download (e.g., "subscriptions_20260511.csv")
 */
export function downloadCSV(csvContent: string, filename: string): void

/**
 * Complete export workflow: generate + download
 * 
 * @param subscriptions - Array to export
 * @throws Error if CSV generation or download fails
 */
export function exportSubscriptionsAsCSV(subscriptions: Subscription[]): void
```

#### TR-4: Styling Requirements

**Button Styling (CSS Modules):**
```typescript
// src/components/ExportButton/ExportButton.module.css

.button {
  /* Base button styling */
  /* Must align with existing project button styles from previous epics */
}

.button--loading {
  /* Disabled state while exporting */
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  /* Icon styling (if using icon) */
}
```

**Integration with Dashboard:**
- Button positioned to the right of "Subscription List" heading
- Use existing color palette from `src/index.css` (CSS variables)
- Button disabled state matches existing patterns (likely from SubscriptionForm buttons)

**Check existing patterns:**
- How are buttons styled in `src/components/SubscriptionForm/SubscriptionForm.module.css`?
- What CSS variables are defined in `src/index.css`?
- Copy consistent patterns for export button

#### TR-5: Accessibility Requirements

**WCAG 2.1 Level A Compliance (from architecture):**

```typescript
<button
  aria-label="Export subscription list as CSV file"  // Screen reader label
  onClick={handleExport}
  disabled={isExporting}
  title="Download your subscriptions as a CSV file" // Tooltip
>
  📥 Export {isExporting && <span> (downloading...)</span>}
</button>
```

**Requirements:**
- Button must have accessible label (either visible text or `aria-label`)
- Disabled state properly communicated to screen readers
- Icon (if used) should not be the only content; button must have text
- Keyboard navigable: accessible via Tab key, activatable via Enter/Space

---

### Implementation Guardrails (What NOT to Do)

❌ **DO NOT:**
- Add external dependencies (no `papaparse`, `csv-writer`, etc.) — use browser Blob + Url APIs
- Use complex state management (Zustand, Redux, etc.) — use local component state + hook patterns
- Export ALL subscriptions—always export filtered subscriptions (resp current search/filters)
- Use `window.location` for file download — use blob + `createObjectURL` pattern
- Hardcode filenames — always generate with current date
- Forget special character escaping — test with names like `"Netflix, HBO & Disney+"`
- Show technical errors to users — always show friendly message
- Block UI during export — show loading state on button, keep app responsive

✅ **DO:**
- Follow the csvExport.ts utility pattern (one file, multiple export functions)
- Use filtered subscriptions from `useFilteredSubscriptions()` hook
- Test with the existing E2E test file (export-subscriptions.spec.ts)
- Match button styling to existing components (SearchBar, CostRangeFilter)
- Include aria-labels and keyboard accessibility
- Handle edge case: empty list (show error or disable button)
- Make export instant (< 2 seconds) — no API calls

---

## Testing Strategy

### Acceptance Test File (ATDD Red Phase)

**Status:** 🔴 RED — Tests exist but are skipped (`test.skip()`)

**File:** `tests/e2e/export-subscriptions.spec.ts`

**What's Included:**
- P0 Critical: Export button → CSV download with filename validation
- P0 Critical: CSV format & column validation  
- P0 Critical: Special character escaping (commas, quotes, newlines)
- P1 High: Empty list handling
- P1 High: Filtered subscriptions export (User Story 2 context)

**Turning Tests Green:**
1. Remove `test.skip()` from each test case
2. Implement the feature following this story's requirements
3. Run `npm run test:e2e` (or `npm run test:e2e:ui`)
4. All tests should turn GREEN

**Key Test Assertions to Watch:**
```typescript
// Filename format
expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/)

// Column headers
expect(headers).toContain('Subscription Name')
expect(headers).toContain('Monthly Cost')
// ... etc for all 7 columns

// CSV row structure
expect(rowColumns.length).toBe(headers.length) // Each row has 7 columns

// Special characters
expect(csvContent).toContain('"Netflix, HBO & Disney+"')
```

### Manual Testing Checklist

Before marking complete, verify:

- [ ] Export button visible on dashboard with clear label
- [ ] Button is right-aligned next to "Subscription List" heading
- [ ] Clicking export downloads CSV file immediately
- [ ] Filename follows `subscriptions_YYYYMMDD.csv` format
- [ ] CSV opens in Excel without warnings or misaligned columns
- [ ] CSV opens in Google Sheets with data intact
- [ ] All 7 columns present in correct order
- [ ] Special characters properly displayed in spreadsheet
- [ ] 100% of visible subscriptions included (count matches list)
- [ ] Button disabled during export, re-enables after download
- [ ] Works with filtered subscriptions (apply search filter, export, verify only filtered items in CSV)
- [ ] Works with empty list (show friendly message or keep button disabled)
- [ ] Works with large lists (100+ subscriptions, no lag or timeout)
- [ ] Keyboard accessible: Tab to button, Enter to export
- [ ] Screen reader announces button purpose

---

## Success Criteria

### Measurable Outcomes (from Feature Spec)

- **SC-001:** Users can export their entire subscription list in under 2 seconds from click to download completion ✓
- **SC-002:** Exported CSV files open successfully in Excel, Google Sheets, and other standard spreadsheet applications ✓
- **SC-003:** 100% of visible subscriptions accurately included in export (no missing or duplicated records) ✓
- **SC-004:** Special characters (commas, quotes, line breaks) properly escaped; data integrity maintained in spreadsheet apps ✓
- **SC-005:** Zero data loss during export (no truncation, corruption, or encoding issues) ✓
- **SC-006:** Export functionality works for subscription lists ranging from 1 to 1000+ entries without timeout or performance degradation ✓

### Code Quality Indicators

- [ ] All acceptance criteria met and tested
- [ ] CSV utility functions well-documented with JSDoc comments
- [ ] ExportButton component has clear prop types and usage examples
- [ ] Error handling present for edge cases (network, blob creation, etc.)
- [ ] Accessibility: button labeled, keyboard navigable, screen reader compatible
- [ ] No console errors or warnings during development
- [ ] E2E tests pass (after removing test.skip())
- [ ] Code follows existing project patterns (CSS Modules, component structure, naming)

---

## Edge Cases & Handling

| Edge Case | Requirement | Implementation Note |
|-----------|-------------|---------------------|
| **Empty subscription list** | Show message or disable button | If `filteredSubscriptions.length === 0`, disable export button with title "No subscriptions to export" |
| **Special characters in name** | CSV escaping required | Use RFC 4180 escaping: wrap in quotes, escape internal quotes as `""` |
| **Very large list (1000+)** | No timeout, responsive UI | Client-side generation should complete instantly; show loading state if needed |
| **Browser lacks Blob API** | Graceful fallback or error | Modern browsers all support; throw friendly error if unsupported |
| **localStorage corrupted** | Handle gracefully | Export shows empty list or error; doesn't crash app |
| **CSV filename collision** | Same date, multiple exports | OK to have multiple `subscriptions_20260511.csv` files; browser handles via downloads folder |
| **Null/missing cost** | Handle in CSV | Show as 0 or empty string (subscription data model always has cost, so unlikely) |
| **Date formatting** | Consistent, readable format | Use ISO format (`YYYY-MM-DD`) for universal compatibility |

---

## Developer Checklist

**Before Starting Implementation:**

- [ ] Read this story completely (you're here!)
- [ ] Review the feature spec: [specs/002-export-subscriptions-csv/spec.md](../../specs/002-export-subscriptions-csv/spec.md)
- [ ] Review existing test file: `tests/e2e/export-subscriptions.spec.ts`
- [ ] Understand current components (SearchBar, CostRangeFilter) structure
- [ ] Check existing button patterns in SubscriptionForm component
- [ ] Review CSV standard RFC 4180 escaping rules (linked in TR-4)

**During Implementation:**

- [ ] Create `src/utils/csvExport.ts` with utility functions
- [ ] Create `src/components/ExportButton/` folder with component + styles
- [ ] Integrate ExportButton into App.tsx alongside subscription list heading
- [ ] Test with filtered subscriptions (apply search + cost filter, verify export respects filters)
- [ ] Test special characters (add test subscription with `Netflix, HBO & Disney+`)
- [ ] Test empty list scenario

**Before Marking Complete (Code Review):**

- [ ] Run `npm run test:e2e` — all export tests pass (after removing skip)
- [ ] Manual verification checklist above completed
- [ ] Code follows project patterns (CSS Modules, component structure)
- [ ] Accessibility verified (keyboard + screen reader)
- [ ] Error messages user-friendly (no tech jargon)
- [ ] Button disabled state during export
- [ ] Performance: export completes instantly (< 2 seconds)

---

## References

- **Feature Specification:** [specs/002-export-subscriptions-csv/spec.md](../../specs/002-export-subscriptions-csv/spec.md)
- **Architecture Decision:** [_bmad-output/planning-artifacts/architecture.md](../../_bmad-output/planning-artifacts/architecture.md)
- **Project Context:** [docs/project-context.md](../../docs/project-context.md)
- **Acceptance Tests (ATDD Red):** `tests/e2e/export-subscriptions.spec.ts`
- **Previous Story (Search/Filter):** Story 11-6 (integrate searchbar + filter into dashboard)
- **CSV Standard (RFC 4180):** https://tools.ietf.org/html/rfc4180

---

## Story Completion Status

**Status:** 🟢 ready-for-dev  
**Completion Criteria Met:**
- ✅ User story statement defined
- ✅ Acceptance criteria clear and testable (from spec)
- ✅ Architectural compliance documented
- ✅ Technical requirements specified with code examples
- ✅ Testing strategy provided (ATDD test file exists)
- ✅ File structure and patterns documented
- ✅ Developer guardrails and edge cases covered
- ✅ Success criteria measurable and verifiable

**Developer Ready To Start:** YES — All context provided for flawless implementation

