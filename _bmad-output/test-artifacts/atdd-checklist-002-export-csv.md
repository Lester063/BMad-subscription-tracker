---
workflowStatus: 'in-progress'
totalSteps: 5
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests']
lastStep: 'step-04-generate-tests'
nextStep: 'step-05-green-phase-validation'
lastSaved: '2026-05-11T14:45:00Z'
tddPhase: 'RED'
storyKey: '002-export-csv'
storyId: 'Story 002.1'
---

# ATDD Checklist: User Story 1 - Export Dashboard View as CSV

**Date:** May 11, 2026  
**Author:** Murat, Master Test Architect  
**Status:** 🔴 RED PHASE — Red-phase test scaffolds generated; ready for implementation  
**Story:** User Story 1 - Export Dashboard View as CSV (Feature 002)

---

## Executive Summary

✅ **Red-Phase Tests Generated:** 11 E2E test scaffolds  
✅ **All tests marked `test.skip()`:** Will fail until feature is implemented  
✅ **Test coverage:** P0 Critical (4), P1 High (3), P2 Medium (3), P3 Low (1)  
✅ **Execution time:** ~5 min when green (P0+P1+P2 only)  
✅ **Ready for dev:** Implementation checklist and fixture guide provided below

---

## TDD Cycle: RED → GREEN → REFACTOR

### 🔴 RED Phase (Current)

**Status:** ✅ COMPLETE

- ✅ All tests written with `test.skip()` (failing intentionally)
- ✅ Tests assert EXPECTED behavior (not implemented yet)
- ✅ Resilient selectors used (getByRole, getByText, getByLabel)
- ✅ No hard waits or flaky patterns
- ✅ File location: `subscription-tracker/tests/e2e/export-subscriptions.spec.ts`

**Next Step:** Developer removes `test.skip()` and implements feature to make tests pass.

### 🟢 GREEN Phase (Next)

**When to start:**

1. Implement export button UI component
2. Implement CSV serializer function
3. Implement download handler
4. Remove `test.skip()` from all P0 tests
5. Run: `npm run test:e2e` → all P0 tests should PASS

**Success Criteria:**

- P0 tests: 100% pass rate (4/4)
- No timeouts
- File downloads successfully
- CSV content validates

### 🔵 REFACTOR Phase (After Green)

**When to start:** Once all P0 tests pass

1. Activate P1 tests (remove `test.skip()`)
2. Refine implementation for edge cases
3. Optimize performance if needed
4. Run full test suite: `npm run test:e2e`

---

## Test File Location & Structure

**File:** `subscription-tracker/tests/e2e/export-subscriptions.spec.ts`

**Test Count:**

| Priority | Count | Names |
|----------|-------|-------|
| P0 | 4 | Export button download, CSV format, special characters, filtered export |
| P1 | 3 | Empty list behavior, filename format, UTF-8 encoding |
| P2 | 3 | Performance (1000 records), accessibility, duplicate prevention |
| **Total** | **11** | |

**All tests use `test.skip()`** — They're ready to run but deliberately skipped until implementation is complete.

---

## Implementation Requirements (Checklist)

### Must Implement for P0 Tests to Pass

#### UI Component: Export Button

- [ ] Create `<ExportButton />` component
- [ ] Position in dashboard header, right side of "Subscription List" heading
- [ ] Button text: "Export" + icon (e.g., ⬇️ or 📥)
- [ ] Use `getByRole('button', { name: /export/i })` selector
- [ ] Button disabled when no subscriptions visible
- [ ] Button disabled during export (prevent duplicate clicks)

**Reference Test:**
- `[P0] should download CSV file when export button is clicked`
- `[P1] should disable export button or show message when no subscriptions`

#### Core Logic: CSV Serializer Function

**Location:** Suggested `src/utils/exportToCsv.ts` (pure function, testable in isolation)

```typescript
export interface ExportData {
  subscriptions: Subscription[];
}

export function serializeSubscriptionsToCsv(data: ExportData): string {
  // Convert subscriptions array to RFC 4180 CSV format
  // Must handle:
  // 1. Headers: Name, Cost, Billing Cycle, Next Billing Date, Date Added, Category, Notes
  // 2. Special character escaping (commas, quotes, newlines)
  // 3. UTF-8 encoding
  // 4. Proper CSV format (quoted fields with embedded delimiters)
  
  // Expected output:
  // "Name","Cost","Billing Cycle","Next Billing Date","Date Added","Category","Notes"
  // "Netflix","15.99","Monthly","2026-05-15","2026-04-01","Entertainment",""
  // ...
}

export function generateCsvFilename(): string {
  // Format: subscriptions_YYYYMMDD.csv
  // Example: subscriptions_20260511.csv
}
```

**Tests Covered:**
- `[P0] should export CSV with correct columns and no data corruption`
- `[P0] should properly escape special characters in subscription names`
- `[P1] should use correct filename format (subscriptions_YYYYMMDD.csv)`
- `[P2] should preserve UTF-8 encoding with international characters`

#### Download Handler: Trigger File Download

**Location:** Suggested `src/utils/downloadFile.ts` (triggers browser download)

```typescript
export async function downloadCsv(csvContent: string, filename: string): Promise<void> {
  // Create Blob from CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link (URL.createObjectURL)
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
}
```

**Tests Covered:**
- `[P0] should download CSV file when export button is clicked`
- `[P1] should use correct filename format`

#### Integration: Export Button → Context → Serializer

**Location:** ExportButton component logic

```typescript
export function ExportButton() {
  const { subscriptions, filteredSubscriptions } = useSubscriptions();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return; // Prevent duplicate exports
    
    setIsExporting(true);
    try {
      // Use filtered subscriptions if filter applied, otherwise all
      const data = { subscriptions: filteredSubscriptions || subscriptions };
      
      const csv = serializeSubscriptionsToCsv(data);
      const filename = generateCsvFilename();
      
      await downloadCsv(csv, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = (filteredSubscriptions || subscriptions).length === 0 || isExporting;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      aria-label="Export subscriptions to CSV file"
    >
      {isExporting ? 'Exporting...' : 'Export'} 📥
    </button>
  );
}
```

**Tests Covered:**
- `[P1] should export only filtered subscriptions when filter applied`
- `[P1] should disable export button or show message when no subscriptions`
- `[P3] should prevent duplicate exports when button clicked rapidly`

---

### Performance Requirements (P2)

#### Performance Target: <2 Seconds for 1000 Records

**Test:** `[P2] should export 1000 subscriptions in less than 2 seconds`

**Implementation Notes:**
- CSV serialization must be O(n) or better
- No unnecessary DOM operations
- Use `JSON.stringify()` for fast serialization
- Avoid regex in loops (premature optimization, do if test fails)

**Validation:**
```bash
npm run test:e2e -- --grep "1000 subscriptions"
# Expected: test completes in ~1 second
```

---

### Edge Cases to Handle

| Edge Case | Test | Implementation |
|-----------|------|----------------|
| **Empty subscriptions** | `[P1] Empty list behavior` | Disable export button or show message |
| **Commas in names** | `[P0] Special characters` | Quote and escape in CSV |
| **Quotes in names** | `[P0] Special characters` | Escape quotes: `"` → `""` |
| **Newlines in notes** | `[P0] Special characters` | Preserve within quoted fields |
| **Unicode (é, ñ, 中文)** | `[P2] UTF-8 encoding` | Use UTF-8 encoding; Blob charset |
| **Large datasets (1000 records)** | `[P2] Performance` | Optimize serialization |
| **Rapid clicks** | `[P3] Duplicate prevention` | Disable button during export |
| **Filtered view** | `[P1] Filtered export` | Export respects current filter state |

---

## Fixture & Data Strategy

### Test Subscriptions (Already in test file)

```typescript
const TEST_SUBSCRIPTIONS = [
  { id: '1', name: 'Netflix', cost: 15.99, dueDate: 15, ... },
  { id: '2', name: 'Spotify Premium', cost: 12.99, dueDate: 20, ... },
  { id: '3', name: 'Adobe Creative Cloud', cost: 54.99, dueDate: 5, ... },
];
```

### Setup Pattern (Already in test file)

```typescript
test.beforeEach(async ({ page, context }) => {
  // Inject test subscriptions into localStorage
  await context.addInitScript((subscriptions) => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, TEST_SUBSCRIPTIONS);

  // Navigate to app
  await page.goto('http://localhost:5173');
});
```

**No additional fixtures needed for red phase.**

---

## Selector Reference (Used in Tests)

| Selector | Purpose | Pattern |
|----------|---------|---------|
| `page.getByRole('button', { name: /export/i })` | Export button | Semantic, resilient |
| `page.getByRole('heading', { name: /subscription list/i })` | Dashboard header | Semantic |
| `page.locator('[data-testid="subscription-item"]')` | Subscription rows | Data attribute (testable) |
| `page.getByLabel(/cost.*min/i)` | Cost filter (min) | ARIA label |
| `page.getByLabel(/cost.*max/i)` | Cost filter (max) | ARIA label |
| `page.getByText(/no subscriptions/i)` | Empty state message | User-visible text |

**Note:** All selectors are intentionally generic (will fail until UI is built). This is TDD red phase — tests guide implementation.

---

## Running the Tests

### Step 1: Remove `test.skip()` from P0 Tests (Green Phase)

**File:** `subscription-tracker/tests/e2e/export-subscriptions.spec.ts`

Find and remove `test.skip()` from these tests:

```bash
# Before (RED phase):
test.skip('[P0] should download CSV file when...', ...)

# After (GREEN phase):
test('[P0] should download CSV file when...', ...)
```

### Step 2: Run Tests Locally

```bash
cd subscription-tracker

# Run just export tests
npm run test:e2e -- tests/e2e/export-subscriptions.spec.ts

# Run all E2E tests
npm run test:e2e

# Watch mode (recommended during development)
npm run test:e2e -- --watch
```

### Step 3: Monitor Test Output

```
✅ P0 Tests (Critical)
  ✓ should download CSV file when export button is clicked
  ✓ should export CSV with correct columns and no data corruption
  ✓ should properly escape special characters in subscription names
  ✓ should export only filtered subscriptions when filter applied

✅ P1 Tests (High)
  ✓ should disable export button or show message when no subscriptions
  ✓ should use correct filename format (subscriptions_YYYYMMDD.csv)
  ✓ should preserve UTF-8 encoding with international characters

✅ P2 Tests (Medium)
  ✓ should export 1000 subscriptions in less than 2 seconds
  ⊘ [P3] should have accessible export button with proper aria labels (skipped)
  ⊘ [P3] should prevent duplicate exports when button clicked rapidly (skipped)

✅ P3 Tests (Low - Optional)
  Run later with: npm run test:e2e -- --grep "P3"
```

---

## Definition of Done (DoD) for This Story

**Red Phase (ATDD Tests Complete):** ✅

- [x] 11 red-phase E2E tests generated
- [x] All tests marked `test.skip()`
- [x] Tests assert expected UI behavior
- [x] Resilient selectors used (getByRole, getByText)
- [x] Test file location: `tests/e2e/export-subscriptions.spec.ts`
- [x] Implementation guide provided

**Green Phase (Dev Implementation):**

- [ ] ExportButton UI component created
- [ ] CSV serializer function implemented
- [ ] Download handler implemented
- [ ] Export button integrated with dashboard
- [ ] All P0 tests passing (100%)
- [ ] All P1 tests passing (≥95%)
- [ ] Edge cases handled (special chars, UTF-8, filters)
- [ ] Performance validated (<2s for 1000 records)

**Refactor Phase (Quality):**

- [ ] Test code reviewed (no hard waits, no flaky patterns)
- [ ] Code coverage ≥80% (CSV serializer)
- [ ] P2/P3 tests activated and passing
- [ ] Cross-browser validation (Chromium, Firefox, Webkit)
- [ ] Fixtures and factories documented for reuse

---

## Key Takeaways

### For the Developer

1. **Read the red-phase tests first** — They define expected behavior
2. **Implement incrementally** — Get P0 tests passing first, then P1, then P2
3. **Use the implementation checklist above** — It guides what needs to be built
4. **Watch for edge cases** — Special character handling and performance are critical
5. **Keep tests maintainable** — Selectors should be resilient to UI changes

### For the QA/Tech Lead

1. **Red phase is intentional** — Tests fail until feature is implemented
2. **Remove `test.skip()` when ready** — This activates tests for green phase
3. **Monitor performance** — P2 performance test validates <2s export time
4. **Code review** — Check for flaky patterns (hard waits, conditionals, random data)
5. **Fixtures are reusable** — Subscription factory patterns can be used in Story 2

---

## Next Steps

1. **Dev Review:** Developer reads ATDD checklist + test file
2. **Clarification:** Ask questions if any requirements are unclear
3. **Implementation:** Build export feature using checklist as guide
4. **Activation:** Remove `test.skip()` from tests when ready
5. **Green Phase:** Run tests and iterate until all pass
6. **Quality Gate:** Run full test suite before merge

---

## Appendix: Full Test File Reference

**File:** `subscription-tracker/tests/e2e/export-subscriptions.spec.ts`

**Total Lines:** ~450  
**Test Scenarios:** 11  
**Approximate Runtime (when green):** 5 minutes (P0+P1 only)

**Test Priorities:**

- **P0 Critical** (must pass before merge): 4 tests
- **P1 High** (should pass before merge): 3 tests
- **P2 Medium** (nice-to-have): 3 tests
- **P3 Low** (exploratory): 1 test

---

**🔴 RED PHASE COMPLETE** ✅

**Ready for Green Phase Implementation** 🎯

**Test Design Document:** [test-design-002-export-csv.md](_bmad-output/test-artifacts/test-design-002-export-csv.md)

