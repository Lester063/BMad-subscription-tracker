/**
 * Story 002 - Export Filtered/Searched Subscriptions (P2)
 * 
 * User Story: "A user with search or filter criteria applied wants to export 
 * only the filtered results to CSV so they can work with a specific subset 
 * of their subscriptions."
 * 
 * Green Phase (TDD): Tests are now active and should pass with the feature
 * These tests assert EXPECTED behavior from acceptance criteria
 * Implementation should make them pass
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5173';

// ============================================================================
// SETUP & UTILITIES
// ============================================================================

/**
 * Parse CSV content and extract data lines
 * Returns array of arrays: [[row1_col1, row1_col2, ...], ...]
 */
function parseCSV(content: string): string[][] {
  const lines = content.trim().split('\n');
  return lines.map((line) => {
    // Handle quoted fields properly
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  });
}

// ============================================================================
// S2.1: Export with Search Filter Active
// ============================================================================

test('S2.1 | Export with search filter active', async ({ page }) => {
  /**
   * Acceptance Criteria 1:
   * "Given a user has applied search terms,
   *  When they click export,
   *  Then only the filtered subscriptions are included in the CSV"
   * 
   * This test:
   * 1. Loads dashboard with multiple subscriptions
   * 2. Applies search filter (e.g., "Netflix")
   * 3. Clicks export button
   * 4. Verifies CSV contains only matching subscriptions
   */

  // Setup: Navigate to dashboard
  await page.goto(BASE_URL);

  // Wait for subscriptions to load
  await page.waitForSelector('[data-testid="subscription-list"]', { timeout: 5000 });

  // Get initial subscription count (all subscriptions)
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();
  expect(allSubscriptions).toBeGreaterThan(0);

  // Action: Apply search filter for "Netflix"
  const searchInput = page.locator('input#searchbar-input');
  await searchInput.fill('Netflix');

  // Wait for filtered results to render
  await page.waitForTimeout(500); // Allow debounce/filter to complete

  // Get filtered subscription count
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();

  // Expectation: filtered results should be fewer than or equal to all results
  expect(filteredCount).toBeLessThanOrEqual(allSubscriptions);
  expect(filteredCount).toBeGreaterThan(0); // At least 1 Netflix subscription

  // Action: Click export button
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.getByRole('button', { name: /export/i });
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV file downloads with correct filename format
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract and parse CSV content
  const filePath = await download.path();
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(csvContent);

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  // Assertions:
  // 1. CSV has expected structure (contains name and cost columns)
  expect(headerRow).toContain('Subscription Name');
  expect(headerRow).toContain('Monthly Cost');

  // 2. CSV row count matches filtered subscriptions (exactly)
  expect(dataRows.length).toBe(filteredCount);

  // 3. All rows contain search term in subscription name
  const nameColumnIndex = headerRow.indexOf('Subscription Name');
  expect(nameColumnIndex).toBeGreaterThan(-1);

  dataRows.forEach((row) => {
    const subscriptionName = row[nameColumnIndex].toLowerCase();
    expect(subscriptionName).toContain('netflix');
  });
});

// ============================================================================
// S2.2: Export with Cost Range Filter Active
// ============================================================================

test('S2.2 | Export with cost range filter active', async ({ page }) => {
  /**
   * Acceptance Criteria 1 (cost range variant):
   * "Given a user has applied cost range filter ($5–$20),
   *  When they click export,
   *  Then only subscriptions within the range are included in the CSV"
   * 
   * This test:
   * 1. Loads dashboard
   * 2. Applies cost range filter (min: $5, max: $20)
   * 3. Clicks export
   * 4. Verifies all CSV rows have costs within range
   */

  // Setup: Navigate to dashboard
  await page.goto(BASE_URL);

  // Wait for subscriptions
  await page.waitForSelector('[data-testid="subscription-list"]', { timeout: 5000 });

  // Get initial subscription count
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();

  // Action: Apply cost range filter ($5–$20)
  const minCostInput = page.locator('input#min-cost-input');
  const maxCostInput = page.locator('input#max-cost-input');

  await expect(minCostInput).toBeVisible();
  await expect(maxCostInput).toBeVisible();

  await minCostInput.fill('5');
  await maxCostInput.fill('20');

  // Wait for filter to apply
  await page.waitForTimeout(500);

  // Get filtered subscription count
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(filteredCount).toBeLessThanOrEqual(allSubscriptions);
  expect(filteredCount).toBeGreaterThan(0);

  // Action: Click export button
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.getByRole('button', { name: /export/i });
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV file downloads
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract and verify CSV
  const filePath = await download.path();
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(csvContent);

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  // Assertions:
  // 1. Row count matches filtered results
  expect(dataRows.length).toBe(filteredCount);

  // 2. All rows have cost within range ($5–$20)
  const costColumnIndex = headerRow.indexOf('Monthly Cost');
  expect(costColumnIndex).toBeGreaterThan(-1);

  dataRows.forEach((row) => {
    const costString = row[costColumnIndex].replace(/[^\d.]/g, ''); // Extract number
    const cost = parseFloat(costString);

    expect(cost).toBeGreaterThanOrEqual(5);
    expect(cost).toBeLessThanOrEqual(20);
  });
});

// ============================================================================
// S2.3: Export with Combined Search + Filter Active
// ============================================================================

test('S2.3 | Export with combined search + filter active', async ({ page }) => {
  /**
   * Acceptance Criteria 1 (combined filters):
   * "Given both search term AND cost range filter are active,
   *  When they click export,
   *  Then CSV contains only subscriptions matching BOTH constraints"
   * 
   * This test:
   * 1. Applies search filter (e.g., "Netflix")
   * 2. Also applies cost range filter ($5–$30)
   * 3. Clicks export
   * 4. Verifies CSV respects both constraints simultaneously
   */

  // Setup: Navigate to dashboard
  await page.goto(BASE_URL);

  // Wait for subscriptions
  await page.waitForSelector('[data-testid="subscription-list"]', { timeout: 5000 });

  // Get initial count
  const allSubscriptions = await page.locator('[data-testid="subscription-item"]').count();

  // Action 1: Apply search filter
  const searchInput = page.locator('input#searchbar-input');
  await searchInput.fill('Netflix');

  // Wait for search to apply
  await page.waitForTimeout(500);

  const searchFilteredCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(searchFilteredCount).toBeGreaterThan(0);

  // Action 2: Also apply cost range filter
  const minCostInput = page.locator('input#min-cost-input');
  const maxCostInput = page.locator('input#max-cost-input');

  await minCostInput.fill('5');
  await maxCostInput.fill('30');

  // Wait for combined filter
  await page.waitForTimeout(500);

  // Get combined filtered count
  const combinedCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(combinedCount).toBeLessThanOrEqual(searchFilteredCount);
  expect(combinedCount).toBeGreaterThan(0);

  // Action 3: Click export
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.getByRole('button', { name: /export/i });
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: CSV downloads
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

  // Extract and verify
  const filePath = await download.path();
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(csvContent);

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  // Assertions:
  // 1. Row count matches combined filtered results
  expect(dataRows.length).toBe(combinedCount);

  // 2. All rows match search term
  const nameColumnIndex = headerRow.indexOf('Subscription Name');
  expect(nameColumnIndex).toBeGreaterThan(-1);

  dataRows.forEach((row) => {
    const name = row[nameColumnIndex].toLowerCase();
    expect(name).toContain('netflix');
  });

  // 3. All rows match cost range
  const costColumnIndex = headerRow.indexOf('Monthly Cost');
  expect(costColumnIndex).toBeGreaterThan(-1);

  dataRows.forEach((row) => {
    const costString = row[costColumnIndex].replace(/[^\d.]/g, '');
    const cost = parseFloat(costString);

    expect(cost).toBeGreaterThanOrEqual(5);
    expect(cost).toBeLessThanOrEqual(30);
  });
});

// ============================================================================
// S2.4: Export with No Matches (Empty Filter Result)
// ============================================================================

test('S2.4 | Export with no matches shows friendly message', async ({ page }) => {
  /**
   * Acceptance Criteria 3:
   * "Given no subscriptions match the search criteria,
   *  When the user attempts export,
   *  Then they receive a user-friendly message indicating no data to export"
   * 
   * This test:
   * 1. Applies a search that matches no subscriptions
   * 2. Verifies empty state message is shown
   * 3. Verifies export button is disabled or shows error
   */

  // Setup: Navigate to dashboard
  await page.goto(BASE_URL);

  // Wait for subscriptions
  await page.waitForSelector('[data-testid="subscription-list"]', { timeout: 5000 });

  // Action: Apply search that matches nothing
  const searchInput = page.locator('input#searchbar-input');
  await searchInput.fill('xyznonexistentserviceabc123xyz');

  // Wait for filter
  await page.waitForTimeout(500);

  // Verify no results shown
  const filteredCount = await page.locator('[data-testid="subscription-item"]').count();
  expect(filteredCount).toBe(0);

  // Verify empty state message is visible
  const emptyMessage = page.locator('[data-testid="empty-list-message"]');
  await expect(emptyMessage).toBeVisible();

  // Verify export button is disabled (should not allow export of empty list)
  const exportButton = page.getByRole('button', { name: /export/i });

  // Either button is disabled OR clicking shows error
  const isDisabled = await exportButton.isDisabled();

  if (isDisabled) {
    // Button is disabled when no results — good UX
    expect(isDisabled).toBe(true);
  } else {
    // If button is enabled, clicking should show friendly error message
    await exportButton.click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 2000 });

    const messageText = await errorMessage.textContent();
    expect(messageText).toBeTruthy();
    expect(messageText?.toLowerCase()).toMatch(/no|empty|results/);
  }
});

// ============================================================================
// S2.10: Performance Baseline — 500+ Filtered Rows Export
// ============================================================================

test('S2.10 | Performance baseline: export 500+ filtered rows in <2 seconds', async ({ page }) => {
  /**
   * Success Criteria 1 (SC-001):
   * "Users can export their subscription list in under 2 seconds 
   * from click to download completion"
   * 
   * This test:
   * 1. Verifies sufficient test data (500+ subscriptions)
   * 2. Measures export performance
   * 3. Asserts export completes within 2 seconds (SC-001)
   * 4. Documents baseline performance metrics
   */

  // Setup: Navigate to dashboard
  await page.goto(BASE_URL);

  // Wait for subscriptions
  await page.waitForSelector('[data-testid="subscription-list"]', { timeout: 5000 });

  // Verify we have enough subscriptions to test with
  const subscriptionCount = await page.locator('[data-testid="subscription-item"]').count();

  // Skip if not enough test data
  test.skip(
    subscriptionCount < 500,
    `Need 500+ subscriptions to benchmark; only ${subscriptionCount} available. ` +
      'Seed test database with more test data or adjust threshold.'
  );

  // Performance measurement
  const startTime = Date.now();

  // Action: Click export
  const downloadPromise = page.waitForEvent('download');
  const exportButton = page.getByRole('button', { name: /export/i });
  await expect(exportButton).toBeVisible();
  await exportButton.click();

  // Assertion: Download completes within 2 seconds (SC-001)
  const download = await downloadPromise;
  const endTime = Date.now();
  const elapsedMs = endTime - startTime;

  expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);
  expect(elapsedMs).toBeLessThan(2000); // SC-001: under 2 seconds

  // Log performance for monitoring
  console.log(`[PERF] Export ${subscriptionCount} rows: ${elapsedMs}ms`);

  // Verify CSV content (sanity check — not all rows, just first few)
  const filePath = await download.path();
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(csvContent);
  const dataRows = rows.slice(1);

  expect(dataRows.length).toBe(subscriptionCount);

  // Verify CSV structure intact
  expect(rows[0]).toContain('Subscription Name');
  expect(rows[0]).toContain('Monthly Cost');
});
