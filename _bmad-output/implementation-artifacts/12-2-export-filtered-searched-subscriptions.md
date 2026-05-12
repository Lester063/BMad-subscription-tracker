---
story_id: "12.2"
story_key: "12-2-export-filtered-searched-subscriptions"
epic: "12"
epic_title: "Export Subscriptions as CSV"
status: "ready-for-dev"
created: "2026-05-11"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
feature_spec: "specs/002-export-subscriptions-csv/spec.md"
acceptance_test_file: "tests/e2e/export-subscriptions.spec.ts"
depends_on: "12-1-export-dashboard-view-as-csv"
---

# Story 12.2: Export Filtered/Searched Subscriptions

**Epic:** Export Subscriptions as CSV (Epic 12)  
**Story ID:** 12.2  
**Status:** ready-for-dev  
**Priority:** P2 — Contextual export feature (MVP+ feature)  
**Depends On:** Story 12-1 (Export Dashboard View as CSV)  
**Feature Spec:** [002-export-subscriptions-csv/spec.md](../../specs/002-export-subscriptions-csv/spec.md)

---

## Story Statement

**As a** user with search filters or cost filters applied,  
**I want** to export only the filtered/searched subscriptions to a CSV file,  
**So that** I can work with a specific subset of my subscriptions (e.g., only streaming services within my budget).

---

## Acceptance Criteria

### Critical Path (Must-Have)

1. **Export Uses Current Filter State**
   - **Given** a user has applied filters or search terms (search name, cost range, due date period)
   - **When** they click the export button
   - **Then** only the subscriptions matching current filters are exported
   - **And** ALL active filters (search + cost range + due date) are applied together (AND logic)
   - **And** the exported CSV respects what the user sees on screen

2. **Export Respects All Active Filters**
   - **Given** user has applied search term "Netflix" AND cost filter $0-$20
   - **When** they click export
   - **Then** the CSV contains ONLY subscriptions matching:
     - Name contains "Netflix" (case-insensitive) AND
     - Cost is between $0 and $20
   - **And** subscriptions matching one criterion but not both are excluded

3. **Filtered Export CSV Content**
   - **Given** a filtered export is requested
   - **When** the CSV file is generated
   - **Then** the file contains:
     - Header row with 7 columns (identical to Story 12-1)
     - Row count equals exactly the number of filtered subscriptions shown on screen
     - Each row accurately represents a filtered subscription
     - Column order and formatting identical to Story 12-1

4. **Empty Filter Results Handling**
   - **Given** user has applied filters that match zero subscriptions
   - **When** they click the export button
   - **Then** instead of downloading an empty CSV, show user-friendly message:
     - "No subscriptions match your current filters. Try adjusting your search or cost range."
   - **And** the export button is disabled or shows this message
   - **And** no CSV file is generated

5. **Export Button State Reflects Filter Results**
   - **Given** user applies filters that result in 0 matching subscriptions
   - **When** they view the export button
   - **Then** the button is disabled (grayed out)
   - **And** hovering shows tooltip: "No subscriptions match current filters"
   - **When** filters are adjusted to match ≥1 subscription
   - **Then** button is re-enabled

6. **User Feedback on Filtered Export**
   - **Given** user clicks export with filters applied
   - **When** the export completes
   - **Then** success message optionally includes filter summary:
     - "Exported 5 filtered subscriptions"
     - OR simple: "Export complete" (acceptable)
   - **And** the user can see in file explorer that the file is named with current date

### Performance Requirements

7. **Export Speed (Filtered)**
   - **Given** user clicks export with filters applied (e.g., 50 subscriptions filtered from 500 total)
   - **When** the export operation runs
   - **Then** the CSV file downloads within 2 seconds from click to completion
   - **And** export time is negligible whether exporting 5 or 500 filtered results
   - **And** the app remains responsive during export

8. **Filter Recomputation Efficiency**
   - **Given** user has filters active and clicks export
   - **When** the export hook retrieves filtered subscriptions
   - **Then** it uses the existing `useFilteredSubscriptions()` hook (no duplicate filtering logic)
   - **And** no unnecessary re-filtering occurs
   - **And** performance is identical to exporting all subscriptions (filter cost is negligible)

---

## Developer Context & Architecture

### Current Project State

**Previous Story Completed:**
- Story 12-1: Export Dashboard View as CSV — ✅ Complete
  - CSV generation utilities created in `src/utils/csvExport.ts`
  - ExportButton component created (exports all subscriptions)
  - E2E tests written (some with `test.skip()` markers for filtered scenarios)
  - All column ordering, formatting, escaping patterns established

**Existing Infrastructure Available:**
- `useFilteredSubscriptions()` hook (Epic 11, Story 11.4) — returns subscriptions filtered by:
  - Search term (name search)
  - Cost range (min/max)
  - Due date period (This Week/This Month/All)
- `SubscriptionContext` with `searchState` object containing:
  - `searchTerm: string`
  - `costRangeMin: number | null`
  - `costRangeMax: number | null`
  - `filterPeriod: 'week' | 'month' | 'all'`

**Test File Already Exists:**
- `tests/e2e/export-subscriptions.spec.ts` — Contains tests marked with `test.skip()` for filtered export scenarios
  - P0 Critical: "Exports only filtered subscriptions when filters applied"
  - P1 High: "Shows error when no subscriptions match filters"
  - Can be un-skipped once feature is implemented

---

### Architecture Compliance Requirements

#### A1: Filter Integration Pattern

**How to Access Filtered Subscriptions:**

```typescript
// In ExportButton component or a new FilteredExportButton:
const filteredSubscriptions = useFilteredSubscriptions()

// filteredSubscriptions is already computed via useMemo
// Returns: Subscription[] (respects all active filters: search + cost range + due date)
```

**Rationale:** 
- Don't duplicate filtering logic — use existing hook
- Hook already memoizes results for performance
- Ensures consistency with what user sees on screen

#### A2: Two Export Button Strategy

**Option A - Single Export Button (RECOMMENDED):**
Modify existing ExportButton to export filtered subscriptions:
```typescript
// ExportButton already receives subscriptions prop
// Change: Pass filtered subscriptions instead of all subscriptions
<ExportButton 
  subscriptions={filteredSubscriptions}  // <-- Changed from allSubscriptions
/>

// ExportButton logic:
// - If subscriptions.length === 0: disable button, show tooltip
// - If subscriptions.length > 0: enable button
// - CSV export uses subscriptions prop (already filtered or all, depending on context)
```

**Option B - Separate FilteredExportButton:**
Create new component for clarity (more work, but very clear):
```typescript
// Only render if filters are active
{hasActiveFilters && <FilteredExportButton />}
{!hasActiveFilters && <ExportButton subscriptions={allSubscriptions} />}
```

**Architecture Recommendation:** Option A is sufficient and follows DRY principle.

#### A3: Empty Filter Results Handling

**Implementation Pattern:**

```typescript
// ExportButton component
const handleExport = () => {
  if (subscriptions.length === 0) {
    // Show user-friendly message instead of exporting
    setError('No subscriptions match your current filters. Try adjusting your search or cost range.')
    return
  }
  
  // Proceed with export (reuse 12-1's csvExport utilities)
  try {
    exportSubscriptionsAsCSV(subscriptions) // from csvExport.ts
  } catch (error) {
    setError('Export failed. Please try again.')
  }
}

// Button rendering
<button 
  onClick={handleExport}
  disabled={subscriptions.length === 0}
  title={subscriptions.length === 0 ? 'No subscriptions match filters' : 'Download as CSV'}
>
  📥 Export
</button>
```

**Rationale:**
- Empty CSV files are confusing to users
- Show specific, helpful message instead of downloading empty file
- Disable button to prevent accidental clicks
- Tooltip provides context

#### A4: Reuse CSV Utilities from Story 12-1

**No New Utilities Required:**

The `src/utils/csvExport.ts` created in Story 12-1 already supports this story:

```typescript
// Story 12-1 created these functions (do NOT duplicate):
export function generateCSV(subscriptions: Subscription[]): string
export function downloadCSV(csvContent: string, filename: string): void
export function exportSubscriptionsAsCSV(subscriptions: Subscription[]): void

// This story ONLY changes what subscriptions are passed:
// Before (Story 12-1):
exportSubscriptionsAsCSV(allSubscriptions)

// Now (Story 12-2):
exportSubscriptionsAsCSV(filteredSubscriptions) // <- Different data source, same logic
```

**Key Point:** 
- Story 12-1 utilities are generic: they work with ANY subscription array
- Story 12-2 simply passes a different array (filtered instead of all)
- No changes to csvExport.ts are needed

#### A5: Component Modifications Needed

**ExportButton Component (`src/components/ExportButton/ExportButton.tsx`):**

Changes needed from Story 12-1 baseline:

```typescript
// ExportButton already receives subscriptions prop
interface ExportButtonProps {
  subscriptions: Subscription[]  // THIS NOW RECEIVES FILTERED SUBSCRIPTIONS
  onExportStart?: () => void
  onExportComplete?: () => void
}

export function ExportButton(props: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    // NEW: Check if filtered subscriptions are empty
    if (props.subscriptions.length === 0) {
      setError('No subscriptions match your current filters. Try adjusting your search or cost range.')
      return
    }

    setIsExporting(true)
    props.onExportStart?.()

    try {
      // UNCHANGED: Use existing csvExport utility
      // It works with any subscription array
      exportSubscriptionsAsCSV(props.subscriptions)
    } catch (error) {
      setError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
      props.onExportComplete?.()
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || props.subscriptions.length === 0}  // NEW: disable if empty
      title={props.subscriptions.length === 0 ? 'No subscriptions match filters' : 'Download as CSV'}
      aria-label={props.subscriptions.length === 0 
        ? 'Export disabled - no subscriptions match filters' 
        : 'Export subscription list as CSV file'}
    >
      📥 Export {isExporting && <span> (downloading...)</span>}
    </button>
  )
}
```

**App.tsx or Dashboard Component:**

Change where ExportButton is instantiated:

```typescript
// BEFORE (Story 12-1):
<ExportButton subscriptions={subscriptions} />

// NOW (Story 12-2):
const filteredSubscriptions = useFilteredSubscriptions()
<ExportButton subscriptions={filteredSubscriptions} />
```

**That's it!** The component automatically exports filtered subscriptions because it receives them.

#### A6: No New Files Required

**Files Already Exist (from Story 12-1):**
- ✅ `src/utils/csvExport.ts` — CSV generation functions
- ✅ `src/components/ExportButton/ExportButton.tsx` — Export button component
- ✅ `src/components/ExportButton/ExportButton.module.css` — Button styling

**Files to Modify (from Story 12-2):**
- 📝 `src/App.tsx` — Change ExportButton to use filtered subscriptions
- 📝 `src/components/ExportButton/ExportButton.tsx` — Add empty filter check + error state
- 📝 `tests/e2e/export-subscriptions.spec.ts` — Un-skip filtered export tests

---

### Technical Requirements

#### TR-1: Component State Enhancement

**ExportButton Needs:**

```typescript
// Add error state management
const [error, setError] = useState<string | null>(null)

// In handleExport:
if (subscriptions.length === 0) {
  setError('No subscriptions match your current filters. Try adjusting your search or cost range.')
  return
}

// Show error (via existing ErrorDisplay component or inline)
{error && <span className={styles.error}>{error}</span>}
```

#### TR-2: Integration Point

**In App.tsx or Dashboard.tsx:**

```typescript
// Import the hook (already exists from Epic 11)
import { useFilteredSubscriptions } from '../hooks/useFilteredSubscriptions'

// In component render:
const filteredSubscriptions = useFilteredSubscriptions()

// Pass to ExportButton
<ExportButton subscriptions={filteredSubscriptions} />
```

#### TR-3: CSV Output Identical to Story 12-1

The CSV file format is IDENTICAL to Story 12-1:
- Same 7 columns
- Same column order
- Same formatting rules
- Same special character escaping
- Same UTF-8 encoding
- Same filename pattern: `subscriptions_YYYYMMDD.csv`

Only difference: **Row count reflects filtered subscriptions, not total.**

#### TR-4: Edge Cases

| Scenario | Behavior | Acceptance |
|----------|----------|-----------|
| 0 filters active, 5 subscriptions total | Export all 5 | CSV has 5 rows + header |
| Search "Netflix" → 1 match, 5 total | Export 1 | CSV has 1 row + header |
| Search "Netflix" → 0 matches | Show error, disable button | No CSV generated |
| Cost filter $0-$10 → 3 match, 10 total | Export 3 | CSV has 3 rows + header |
| Cost $0-$10 AND Search "HBO" → 1 match | Export 1 | CSV has 1 row + header |
| Due date filter "This Week" → 2 match | Export 2 | CSV has 2 rows + header |
| All filters active → 0 matches | Show error, disable button | No CSV generated |

#### TR-5: Error Messages (User-Friendly)

**When Filters Match 0 Subscriptions:**
```
"No subscriptions match your current filters. Try adjusting your search or cost range."
```

**When Export Fails:**
```
"Export failed. Please try again."
```

**Success Message (Optional):**
```
"Exported 5 subscriptions" 
OR 
"Export complete"
```

---

## Testing Strategy

### Acceptance Test File (ATDD)

**Status:** 🔴 RED → 🟢 GREEN (tests exist, marked with `test.skip()`)

**File:** `tests/e2e/export-subscriptions.spec.ts`

**Filtered Export Test Cases to Un-skip:**

```typescript
// P0 Critical: Filtered export basic functionality
test.skip('Exports only filtered subscriptions when search filter applied', async ({ page, context }) => {
  // Setup: Add multiple subscriptions
  // Action: Search for one subscription
  // Assert: Export CSV contains only 1 row (+ header)
})

test.skip('Exports only filtered subscriptions when cost range applied', async ({ page, context }) => {
  // Setup: Add subscriptions with different costs
  // Action: Apply cost filter $10-$20
  // Assert: Export CSV contains only subscriptions in range
})

test.skip('Exports only filtered subscriptions when multiple filters applied (AND logic)', async ({ page, context }) => {
  // Setup: Add diverse subscriptions
  // Action: Apply search "Netflix" AND cost filter $0-$20
  // Assert: CSV contains only "Netflix" subscriptions AND within cost range
})

// P1 High: Empty filter results
test.skip('Shows error message when no subscriptions match filters', async ({ page, context }) => {
  // Setup: Add subscriptions
  // Action: Search for non-existent subscription
  // Assert: Error message appears, export button disabled, no CSV generated
})

test.skip('Disables export button when filters result in 0 matches', async ({ page, context }) => {
  // Setup: Add subscriptions
  // Action: Apply filters that match nothing
  // Assert: Export button disabled with appropriate title/aria-label
})

// P1 High: Re-enabling button
test.skip('Re-enables export button when filters are adjusted to match subscriptions', async ({ page, context }) => {
  // Setup: Apply filters matching 0 subscriptions
  // Assert: Button disabled
  // Action: Adjust filters to match 1+ subscription
  // Assert: Button enabled
})
```

**How to Run Tests:**

```bash
# Run only filtered export tests:
npm run test:e2e -- export-subscriptions.spec.ts -g "Exports only filtered"

# Run all export tests:
npm run test:e2e -- export-subscriptions.spec.ts

# Run with UI:
npm run test:e2e:ui
```

**Test Turning Green Checklist:**
- [ ] ExportButton component enhanced with empty check
- [ ] App.tsx/Dashboard passes `filteredSubscriptions` to ExportButton
- [ ] `test.skip()` removed from filtered export tests
- [ ] All tests pass

---

## Implementation Guardrails (What NOT to Do)

❌ **DO NOT:**
- Create duplicate CSV generation functions — reuse `csvExport.ts` from Story 12-1
- Add new filter logic — reuse `useFilteredSubscriptions()` hook
- Duplicate error handling — use existing ErrorDisplay pattern
- Export ALL subscriptions when filters are active — always respect current state
- Forget to disable button when 0 subscriptions match filters
- Show "Exported 0 subscriptions" — instead show error message
- Change CSV format or column order — must be identical to 12-1
- Add external dependencies — use browser Blob + Url APIs (same as 12-1)

✅ **DO:**
- Pass filtered subscriptions to ExportButton (from `useFilteredSubscriptions()`)
- Check `subscriptions.length === 0` and show error before exporting
- Reuse all utility functions from Story 12-1 without modification
- Use existing styling and accessibility patterns
- Test with E2E tests (un-skip existing test cases)
- Show user-friendly error when no subscriptions match filters
- Verify export respects ALL active filters (search AND cost AND due date)
- Keep export button disabled until filters match 1+ subscription

---

## Previous Story Intelligence (Story 12-1)

### Learnings & Code Patterns Established

**CSV Export Utilities (DO NOT CHANGE):**
```typescript
// src/utils/csvExport.ts - already created, reuse completely
export function generateCSV(subscriptions: Subscription[]): string {
  // Handles:
  // - 7 column order (exact spec)
  // - Special character escaping (RFC 4180)
  // - Currency formatting
  // - Date formatting
  // - UTF-8 encoding
}

export function downloadCSV(csvContent: string, filename: string): void {
  // Handles:
  // - Blob creation
  // - createObjectURL
  // - Browser download
  // - Cleanup
}

export function exportSubscriptionsAsCSV(subscriptions: Subscription[]): void {
  // Orchestrates:
  // - CSV generation
  // - Filename generation (YYYYMMDD format)
  // - Download trigger
}
```

**ExportButton Component (EXTEND):**
- Story 12-1: Exported all subscriptions
- Story 12-2: Modify to export filtered subscriptions
- Key change: Add `if (subscriptions.length === 0) return with error`
- Reuse all styling and accessibility from 12-1

**Column Output (IDENTICAL TO 12-1):**

| Order | Header | Source | Format |
|-------|--------|--------|--------|
| 1 | Subscription Name | `name` | String |
| 2 | Monthly Cost | `cost` | Number ($X.XX) |
| 3 | Billing Cycle | `dueDate` | Number (1-31) |
| 4 | Next Billing Date | calculated | Date (YYYY-MM-DD) |
| 5 | Date Added | `createdAt` | Date (YYYY-MM-DD) |
| 6 | Category | N/A | Empty (for future) |
| 7 | Notes | N/A | Empty (for future) |

---

## Detailed Implementation Steps

### Step 1: Enhance ExportButton Component

**File:** `src/components/ExportButton/ExportButton.tsx`

**What to Change:**
1. Add error state to component
2. Add check for empty subscriptions array
3. Show error message if no subscriptions match filters
4. Disable button if subscriptions.length === 0
5. Update aria-label to reflect filter state

**Code Pattern:**
```typescript
// Add after existing state
const [error, setError] = useState<string | null>(null)

// In handleExport (before existing try block)
if (props.subscriptions.length === 0) {
  setError('No subscriptions match your current filters. Try adjusting your search or cost range.')
  return
}

// In render (new button attribute)
disabled={isExporting || props.subscriptions.length === 0}

// Optional: Add error display below button
{error && (
  <div className={styles.errorMessage} role="alert">
    {error}
  </div>
)}
```

### Step 2: Update Integration Point (App.tsx or Dashboard.tsx)

**File:** `src/App.tsx` or `src/components/Dashboard/Dashboard.tsx`

**What to Change:**
1. Import `useFilteredSubscriptions` hook
2. Call hook to get filtered subscriptions
3. Pass filtered subscriptions to ExportButton instead of all subscriptions

**Code Pattern:**
```typescript
import { useFilteredSubscriptions } from '../hooks/useFilteredSubscriptions'

// In component body
const filteredSubscriptions = useFilteredSubscriptions()

// In render
<ExportButton 
  subscriptions={filteredSubscriptions}  // <- Changed
  onExportStart={() => {/* ... */}}
  onExportComplete={() => {/* ... */}}
/>
```

### Step 3: Un-skip E2E Tests

**File:** `tests/e2e/export-subscriptions.spec.ts`

**What to Change:**
1. Remove `test.skip()` from filtered export test cases
2. Run tests to verify they pass

**Verification:**
```bash
npm run test:e2e -- export-subscriptions.spec.ts
# Should see: ✅ All tests pass (or ❌ failures to fix)
```

### Step 4: Manual Testing Checklist

- [ ] With NO filters applied: Export downloads all subscriptions
- [ ] With search "Netflix": Export contains only Netflix subscriptions
- [ ] With cost filter $0-$10: Export contains only subscriptions in range
- [ ] With search + cost filter: Export respects both (AND logic)
- [ ] With filters matching 0 subscriptions: Error message shown, button disabled, no CSV
- [ ] With filters matching 1 subscription: Export works correctly
- [ ] Button transitions from disabled → enabled when filters adjusted
- [ ] CSV filename always in format `subscriptions_YYYYMMDD.csv`
- [ ] CSV opens correctly in Excel and Google Sheets
- [ ] Special characters (commas, quotes) properly escaped in filtered export

---

## Edge Cases & Gotchas

| Edge Case | Scenario | Expected Behavior | Gotcha |
|-----------|----------|-------------------|--------|
| **Empty Result** | Search matches 0 subs | Show error, disable button | Don't export empty CSV |
| **Single Result** | Filters match only 1 sub | Export 1-row + header CSV | Ensure count is correct |
| **All Match** | Filters active but match all subs | Export all rows | Verify filtering is working |
| **Filters Clear** | User clears all filters | Export all subscriptions | Reuse of hook ensures this works |
| **Special Chars** | Subscription name has commas | Properly escaped in CSV | Test with "Netflix, HBO & Disney+" |
| **Large Number** | 1000+ filtered results | Download completes in <2s | No UI blocking |
| **Filter Change Mid-Export** | User changes filters while exporting | Export uses snapshot at click time | No race condition |
| **Rapid Clicks** | User clicks export button multiple times | Only one download initiates | Button disabled during export |

---

## Definition of Done

- [ ] ExportButton component updated to check for empty subscriptions
- [ ] Error state added and error message displayed when no matches
- [ ] Export button disabled when subscriptions.length === 0
- [ ] Integration point (App.tsx/Dashboard.tsx) passes filtered subscriptions
- [ ] All filtered export E2E tests un-skipped and passing (GREEN)
- [ ] Manual testing completed (checklist above)
- [ ] CSV output verified in Excel/Google Sheets with special characters
- [ ] Accessibility verified (aria-labels, button states, error messages)
- [ ] Performance verified (export < 2s, no UI blocking)
- [ ] No new dependencies added
- [ ] No duplicate utility functions created
- [ ] Code follows project conventions (PascalCase components, camelCase utils, CSS Modules + BEM)
- [ ] Story marked as "done" in sprint-status.yaml
- [ ] No breaking changes to Story 12-1 export functionality

---

## Questions for Clarification

*None at this time. Story 12-1 has established all patterns and infrastructure needed.*

---

## Success Criteria

**The feature is complete when:**

✅ Users can export their current filtered subscription list to a CSV file  
✅ Export respects all active filters (search + cost range + due date period)  
✅ CSV file is identical in format to Story 12-1 export  
✅ Empty filter results show user-friendly error instead of empty CSV  
✅ Export button is disabled when no subscriptions match current filters  
✅ All filtered export E2E tests pass  
✅ Performance meets <2 second requirement  
✅ Accessibility (WCAG 2.1 Level A) maintained  

