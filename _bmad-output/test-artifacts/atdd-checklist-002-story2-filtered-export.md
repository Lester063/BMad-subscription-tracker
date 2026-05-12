---
workflowStatus: 'in-progress'
stepsCompleted: ['step-01-preflight', 'step-02-generation-mode', 'step-03-test-strategy']
lastStep: 'step-03-test-strategy'
lastSaved: '2026-05-12'
storyKey: '002-story2-filtered-export'
storyId: '002.2'
storyTitle: 'User Story 2 - Export Filtered/Searched Subscriptions'
testFramework: 'Playwright (E2E)'
testLevel: 'E2E'
tddPhase: 'RED'
---

# ATDD Checklist: Story 002.2 - Export Filtered/Searched Subscriptions

**Date:** May 12, 2026  
**Author:** Murat, Master Test Architect  
**Status:** Red Phase (TDD) — Failing Test Scaffolds  
**Framework:** Playwright E2E  
**Scope:** E2E acceptance scenarios only (P1 tests from test design)

---

## Executive Summary

**Acceptance Criteria Mapped:**
- ✅ AC1: User has applied filters/search → CSV contains only filtered subscriptions
- ✅ AC2: 5 filtered results → CSV contains exactly 5 records
- ✅ AC3: No matches → User-friendly message (no corrupt export)

**Test Scenarios Generated:**
- **S2.1**: Export with search filter active (E2E)
- **S2.2**: Export with cost range filter active (E2E)
- **S2.3**: Export with combined search + filter (E2E)
- **S2.4**: Export with no matches (empty filter) (E2E)
- **S2.10**: Performance baseline (500+ filtered rows) (E2E)

**Total Tests**: 5 E2E scenarios (all in `test.skip()` — RED PHASE)

---

## Test Strategy Mapping

| Acceptance Criterion | Test Scenario | Level | Priority | Status |
|---|---|---|---|---|
| Filtered state persists during export | S2.1, S2.2, S2.3 | E2E | P1 | 🔴 RED |
| Exact row count matches filtered results | S2.2, S2.4 | E2E | P1 | 🔴 RED |
| Empty filter shows friendly message | S2.4 | E2E | P1 | 🔴 RED |
| Export under 2 seconds (SC-001) | S2.10 | E2E | P3 | 🔴 RED |

---

## Implementation Notes

All tests below are in **RED PHASE** and use `test.skip()`. They will:

1. **Fail immediately** when run (until feature is implemented)
2. **Assert EXPECTED behavior** from acceptance criteria
3. **Scaffold test structure** for development
4. **Guide implementation** toward passing state

Each test:
- ✅ Describes user journey in plain English
- ✅ Sets up filtered state (mock/real)
- ✅ Interacts with export button
- ✅ Asserts on CSV download/message
- ✅ Uses Playwright best practices (selectors, waits, assertions)

---

## Red-Phase E2E Test Scaffolds

Below are the failing test scaffolds. All use `test.skip()` and are marked `🔴 TDD RED PHASE`.

---

### Test File: `tests/e2e/story-002-export-filtered.spec.ts`

```typescript
/**
 * Story 002 - Export Filtered/Searched Subscriptions (P2)
 * 
 * Red Phase (TDD): All tests skip until feature implemented
 * These tests assert EXPECTED behavior from acceptance criteria
 * Implementation should make them pass (green phase)
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// S2.1: Export with Search Filter Active
// ============================================================================

test.skip('S2.1 | AC1: Export with search filter active (E2E)', async ({ page }) => {
  /**
   * User Story 2, Acceptance Criteria 1:
   * "Given a user has applied filters or search terms,
   *  When they click export,
   *  Then only the filtered/searched subscriptions are included in the CSV"
   * 
   * RED PHASE GOAL:
   * - Set up dashboard with subscriptions
   * - Apply search filter (e.g., "Netflix")
   * - Click export button
   * - Assert CSV contains only matching subscriptions
   * - Assert CSV does NOT contain non-matching subscriptions
   */

  // Setup: Navigate to dashboard
  await page.goto('/');

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]');

  // Get initial subscription count (all subscriptions)
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();
  expect(allSubscriptions).toBeGreaterThan(0);

  // Action: Apply search filter for "Netflix"
  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill('Netflix');

  // Wait for filtered results to render
  await page.waitForTimeout(300); // Allow debounce/filter to complete

  // Get filtered subscription count
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();
  
  // Expectation: filtered results should be fewer than all results
  expect(filteredCount).toBeLessThan(allSubscriptions);
  expect(filteredCount).toBeGreaterThan(0); // At least 1 Netflix subscription exists

  // Action: Click export button
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.locator('[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV file downloads
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract CSV content
  const filePath = await download.path();
  const fs = require('fs');
  const csvContent = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV to verify content
  const lines = csvContent.trim().split('\n');
  const headerLine = lines[0];
  const dataLines = lines.slice(1);

  // Assertions:
  // 1. CSV has expected structure
  expect(headerLine).toContain('Subscription Name');
  expect(headerLine).toContain('Monthly Cost');

  // 2. CSV row count matches filtered subscriptions (exactly)
  expect(dataLines.length).toBe(filteredCount);

  // 3. All rows contain search term (or close match)
  dataLines.forEach((line) => {
    // CSV might have quoted fields; basic check for Netflix in line
    expect(line.toLowerCase()).toContain('netflix');
  });

  // 4. No rows contain unrelated subscriptions (negative assertion)
  // Example: If search is "Netflix", shouldn't contain unrelated names
  dataLines.forEach((line) => {
    // This is a simplified check; adjust based on test data
    const namePart = line.split(',')[0].replace(/"/g, '');
    expect(namePart.toLowerCase()).toContain('netflix');
  });
});

// ============================================================================
// S2.2: Export with Cost Range Filter Active
// ============================================================================

test.skip('S2.2 | AC1: Export with cost range filter active (E2E)', async ({ page }) => {
  /**
   * User Story 2, Acceptance Criteria 1 (cost range variant):
   * "Given a user has applied cost range filter ($5–$20),
   *  When they click export,
   *  Then only subscriptions within the range are included in the CSV"
   */

  // Setup: Navigate to dashboard
  await page.goto('/');

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]');

  // Get initial subscription count
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();

  // Action: Apply cost range filter ($5–$20)
  const minCostInput = page.locator('[data-testid="filter-min-cost"]');
  const maxCostInput = page.locator('[data-testid="filter-max-cost"]');

  await minCostInput.fill('5');
  await maxCostInput.fill('20');

  // Wait for filter to apply
  await page.waitForTimeout(300);

  // Get filtered subscription count
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(filteredCount).toBeLessThanOrEqual(allSubscriptions);
  expect(filteredCount).toBeGreaterThan(0);

  // Action: Click export button
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.locator('[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV file downloads
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract and verify CSV
  const filePath = await download.path();
  const fs = require('fs');
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const dataLines = lines.slice(1);

  // Assertions:
  // 1. Row count matches filtered results
  expect(dataLines.length).toBe(filteredCount);

  // 2. All rows have cost within range
  dataLines.forEach((line) => {
    const parts = line.split(',');
    const costPart = parts[1]?.replace(/"/g, '').trim();
    const cost = parseFloat(costPart);
    
    expect(cost).toBeGreaterThanOrEqual(5);
    expect(cost).toBeLessThanOrEqual(20);
  });
});

// ============================================================================
// S2.3: Export with Combined Search + Filter Active
// ============================================================================

test.skip('S2.3 | AC1: Export with combined search + filter (E2E)', async ({ page }) => {
  /**
   * User Story 2, Acceptance Criteria 1 (combined filters):
   * "Given both search term AND cost range filter are active,
   *  When they click export,
   *  Then CSV contains only subscriptions matching BOTH constraints"
   */

  // Setup: Navigate to dashboard
  await page.goto('/');

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]');

  // Get initial subscription count
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();

  // Action: Apply search filter
  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill('Netflix');

  // Wait for search filter
  await page.waitForTimeout(300);

  const searchFilteredCount = await page.locator('[data-testid="subscription-item"]').count();

  // Action: Also apply cost range filter
  const minCostInput = page.locator('[data-testid="filter-min-cost"]');
  const maxCostInput = page.locator('[data-testid="filter-max-cost"]');

  await minCostInput.fill('5');
  await maxCostInput.fill('30');

  // Wait for combined filter to apply
  await page.waitForTimeout(300);

  // Get combined filtered count
  const combinedCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(combinedCount).toBeLessThanOrEqual(searchFilteredCount);
  expect(combinedCount).toBeGreaterThan(0);

  // Action: Click export
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.locator('[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV downloads
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract and verify
  const filePath = await download.path();
  const fs = require('fs');
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const dataLines = lines.slice(1);

  // Assertions:
  // 1. Row count matches combined filtered results
  expect(dataLines.length).toBe(combinedCount);

  // 2. All rows match search term
  dataLines.forEach((line) => {
    expect(line.toLowerCase()).toContain('netflix');
  });

  // 3. All rows match cost range
  dataLines.forEach((line) => {
    const parts = line.split(',');
    const costPart = parts[1]?.replace(/"/g, '').trim();
    const cost = parseFloat(costPart);

    expect(cost).toBeGreaterThanOrEqual(5);
    expect(cost).toBeLessThanOrEqual(30);
  });
});

// ============================================================================
// S2.4: Export with No Matches (Empty Filter Result)
// ============================================================================

test.skip('S2.4 | AC3: Export with no matches shows friendly message (E2E)', async ({ page }) => {
  /**
   * User Story 2, Acceptance Criteria 3:
   * "Given no subscriptions match the search criteria,
   *  When the user attempts export,
   *  Then they receive a user-friendly message indicating no data to export"
   */

  // Setup: Navigate to dashboard
  await page.goto('/');

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]');

  // Action: Apply search that matches nothing
  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill('xyznonexistentserviceabc123');

  // Wait for filter
  await page.waitForTimeout(300);

  // Verify no results shown
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(filteredCount).toBe(0);

  // Verify empty state message shown
  const emptyMessage = page.locator('[data-testid="empty-state-message"]');
  await expect(emptyMessage).toBeVisible();

  // Action: Try to click export button (should be disabled or show message)
  const exportButton = page.locator('[data-testid="export-button"]');
  
  // Assertion: Either button is disabled OR clicking shows error message
  const isDisabled = await exportButton.isDisabled();
  expect(isDisabled).toBe(true); // Button should be disabled when no results

  // OR if button is enabled, clicking should show a friendly message
  if (!isDisabled) {
    await exportButton.click();
    
    const errorMessage = page.locator('[data-testid="export-error-message"]');
    await expect(errorMessage).toBeVisible();
    
    const messageText = await errorMessage.textContent();
    expect(messageText).toContain('no data'); // Friendly message
    expect(messageText?.toLowerCase()).toContain('no'); // Indicates empty state
  }
});

// ============================================================================
// S2.10: Performance Baseline — 500+ Filtered Rows Export
// ============================================================================

test.skip('S2.10 | Performance baseline: export 500+ filtered rows in <2 seconds (E2E)', async ({ page }) => {
  /**
   * Success Criteria 1 (SC-001):
   * "Users can export their subscription list in under 2 seconds from click to download completion"
   * 
   * This test establishes baseline performance with realistic data volume.
   * Not a strict gate (P3), but documents performance characteristics.
   */

  // Setup: Navigate to dashboard
  await page.goto('/');

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]');

  // Verify we have 500+ subscriptions to test with
  // (In real scenario, this might be done via seed data or API mock)
  const subscriptionCount = await page.locator('[data-testid="subscription-item"]').count();
  
  // Skip if not enough test data; in production, seed 500+ subscriptions
  test.skip(subscriptionCount < 500, 'Need 500+ subscriptions to benchmark; seed test data');

  // Action: Measure export performance
  const startTime = Date.now();

  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.locator('[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: Download completes
  const download = await downloadPromise;
  const endTime = Date.now();
  const elapsedMs = endTime - startTime;

  // Performance assertion
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // SC-001: Should be under 2 seconds (2000 ms)
  expect(elapsedMs).toBeLessThan(2000);

  // Log performance for monitoring
  console.log(`[PERF] Export 500+ rows: ${elapsedMs}ms`);

  // Verify CSV content (basic sanity check)
  const filePath = await download.path();
  const fs = require('fs');
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const dataLines = lines.slice(1);

  expect(dataLines.length).toBeGreaterThanOrEqual(500);
});
```

---

## Test Execution Checklist

### ✅ All Tests in RED PHASE (test.skip())

- [ ] **S2.1**: Search filter + export — Fails until filter-aware export implemented
- [ ] **S2.2**: Cost range filter + export — Fails until filter-aware export implemented
- [ ] **S2.3**: Combined filters + export — Fails until both filters respected in export
- [ ] **S2.4**: No matches + message — Fails until empty state handling added
- [ ] **S2.10**: Performance baseline — Skipped if <500 test rows; documents baseline once implemented

### 🔴 TDD Red Phase Status

All tests:
- ✅ Use `test.skip()` — Will be activated when feature is ready for testing
- ✅ Assert EXPECTED behavior from acceptance criteria
- ✅ Will FAIL when run (until feature implemented)
- ✅ Guide implementation toward green phase

### 📋 Handoff to Development

**For Dev Lead:**
1. Review test assertions to understand expected behavior
2. Implement Story 2 feature using tests as specification
3. Activate tests (remove `.skip()`) when feature is code-complete
4. Run tests in development to verify green phase
5. Commit test file and implementation together

**For QA Lead:**
1. Review test coverage after implementation
2. Add P0/P2/P3 tests as needed (integration, unit, edge cases)
3. Run full test suite in CI before merge to main

---

## Resources

**Framework & Patterns:**
- Playwright: [https://playwright.dev](https://playwright.dev)
- Best practices: `{project-root}/subscription-tracker/tests/e2e/` (existing Story 1-4 tests)
- Data factories: `{project-root}/subscription-tracker/tests/support/helpers/test-data.ts`

**Next Steps:**
1. Create test file: `tests/e2e/story-002-export-filtered.spec.ts`
2. Copy scaffolds from above into that file
3. Dev implements Story 2 feature
4. Activate tests: Remove `.skip()` from each test
5. Run `npm run test:e2e` to verify tests pass (green phase)

---

**ATDD RED PHASE COMPLETE** ✅  
**Status**: Ready for implementation  
**Next Workflow**: Run feature implementation, then activate tests for green phase
