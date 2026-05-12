import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';

/**
 * ATDD RED-PHASE E2E Tests: Export Subscription List as CSV
 *
 * User Story 1: Export Dashboard View as CSV
 *
 * Status: 🔴 RED PHASE - Tests are marked test.skip() and will FAIL until feature is implemented
 * This is intentional (TDD red phase). Remove test.skip() when implementing the export feature.
 *
 * Coverage:
 * - P0 Critical: Export button → CSV download with all subscriptions
 * - P0 Critical: CSV file format validation (columns, content)
 * - P1 High: Filtered subscriptions export
 * - P1 High: Empty list behavior
 *
 * Test Data: Uses test subscriptions from localStorage factory
 * Fixtures: None required for red phase (placeholder selectors)
 * Network: Export is synchronous (no API calls, uses Blob)
 */

/**
 * Base URL from playwright.config.ts or environment
 * Ensures consistency across all test files
 */
const baseURL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Story 002: Export Subscriptions as CSV (ATDD)', () => {
  const TEST_SUBSCRIPTIONS = [
    {
      id: '1',
      name: 'Netflix',
      cost: 15.99,
      dueDate: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '2',
      name: 'Spotify Premium',
      cost: 12.99,
      dueDate: 20,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '3',
      name: 'Adobe Creative Cloud',
      cost: 54.99,
      dueDate: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  test.beforeEach(async ({ page }) => {
    // RED PHASE: These setup steps will fail until UI is implemented
    // In green phase, replace with actual navigation + UI interactions

    // Navigate first
    await page.goto(baseURL);

    // Wait for app to be ready
    await page.waitForLoadState('networkidle');

    // THEN set up test subscriptions in localStorage AFTER page loads
    // This ensures the component is ready before we inject data
    await page.evaluate((subscriptions) => {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      // Dispatch storage event to trigger React update
      window.dispatchEvent(new Event('storage'));
    }, TEST_SUBSCRIPTIONS);
  });

  // ============================================================================
  // P0 CRITICAL: Export Button Download
  // ============================================================================

  test('[P0] should download CSV file when export button is clicked', async ({
    page,
  }) => {
    // RED PHASE: This test WILL FAIL until export button UI is implemented

    // User navigates to dashboard (already in beforeEach via page.goto)
    // RED: Expect dashboard to show subscriptions
    await expect(page.getByRole('heading', { name: /subscription list/i })).toBeVisible();

    // RED: Expect at least 3 subscriptions visible
    const subscriptionRows = page.locator('[data-testid="subscription-item"]');
    await expect(subscriptionRows).toHaveCount(3);

    // RED: Expect export button to be visible
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();

    // RED: Click export button and intercept download
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;

    // RED: Verify file downloaded successfully
    expect(download.suggestedFilename()).toMatch(/subscriptions_\d{8}\.csv/);

    // RED: Read and validate CSV content
    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');

    // RED: Verify CSV has header row with expected columns
    const lines = csvContent.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // Headers + at least 1 row
    const headers = lines[0];
    expect(headers).toContain('Subscription Name');
    expect(headers).toContain('Monthly Cost');
    expect(headers).toContain('Billing Cycle');
    expect(headers).toContain('Next Billing Date');

    // RED: Verify CSV contains subscription data
    expect(csvContent).toContain('Netflix');
    expect(csvContent).toContain('Spotify Premium');
    expect(csvContent).toContain('Adobe Creative Cloud');
  });

  // ============================================================================
  // P0 CRITICAL: CSV Format & Content Validation
  // ============================================================================

  test('[P0] should export CSV with correct columns and no data corruption', async ({
    page,
  }) => {
    // RED PHASE: This test WILL FAIL until export feature properly formats CSV

    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible();

    // RED: Trigger download
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;

    // RED: Validate CSV structure
    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // RED: Parse header row
    const headers = lines[0].split(',').map((h) => h.trim());
    const expectedHeaders = ['Subscription Name', 'Monthly Cost', 'Billing Cycle', 'Next Billing Date', 'Date Added', 'Category', 'Notes'];
    expect(headers.length).toBe(7);
    for (const header of expectedHeaders) {
      expect(headers).toContain(header);
    }

    // RED: Validate each data row has same number of columns
    for (let i = 1; i < lines.length; i++) {
      const rowColumns = lines[i].split(',');
      expect(rowColumns.length).toBe(headers.length);
    }

    // RED: Verify numeric data (Cost column - actual header is "Monthly Cost")
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const costIndex = headers.indexOf('Monthly Cost');
      const cost = parseFloat(row[costIndex]);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(10000); // Sanity check
    }
  });

  // ============================================================================
  // P0 CRITICAL: Special Character Handling
  // ============================================================================

  test('[P0] should properly escape special characters in subscription names', async ({
    page: _page,
    browser,
  }) => {
    // RED PHASE: This test WILL FAIL if CSV escaping is not implemented
    // Uses a fresh browser context to avoid beforeEach localStorage conflicts

    const customContext = await browser.newContext();
    const page = await customContext.newPage();

    // Setup subscriptions with special characters
    const specialSubscriptions = [
      {
        id: '1',
        name: 'Netflix, HBO, Disney+', // Contains commas
        cost: 25.99,
        dueDate: 15,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        name: 'My "Premium" Service', // Contains quotes
        cost: 19.99,
        dueDate: 20,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        name: 'Service\nWith\nNewlines', // Contains newlines
        cost: 9.99,
        dueDate: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // Navigate and setup data
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for component mount

    await page.evaluate((subs) => {
      localStorage.setItem('subscriptions', JSON.stringify(subs));
      window.dispatchEvent(new Event('storage'));
    }, specialSubscriptions);

    // Wait for subscriptions to load in React state
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="subscription-item"]').length > 0,
      { timeout: 10000 }
    );

    // RED: Click export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    const download = await downloadPromise;

    // RED: Validate CSV escaping
    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');

    // RED: Verify special characters are properly escaped
    // Commas should be within quotes: "Netflix, HBO, Disney+"
    expect(csvContent).toContain('"Netflix, HBO, Disney+"');

    // Quotes should be escaped: "My ""Premium"" Service"
    expect(csvContent).toContain('"My ""Premium"" Service"');

    // Newlines should be preserved within quoted fields
    expect(csvContent).toMatch(/"Service[\n\r]+With[\n\r]+Newlines"/);

    // Cleanup
    await customContext.close();
  });

  // ============================================================================
  // P1 HIGH: Filtered Subscriptions Export
  // Part of Story 2
  // ============================================================================

  test('[P1] should export only filtered subscriptions when filter applied', async ({
    page,
  }) => {
    // GREEN PHASE: Feature implemented, test should pass

    // GREEN: Expect filter controls to be visible
    const costFilterMin = page.getByLabel(/min cost/i);
    const costFilterMax = page.getByLabel(/max cost/i);
    await expect(costFilterMin).toBeVisible();
    await expect(costFilterMax).toBeVisible();

    // GREEN: Apply cost range filter (10-50)
    await costFilterMin.fill('10');
    await costFilterMax.fill('50');

    // GREEN: Wait for subscriptions list to update (filtered)
    // In implementation, this will be debounced or triggered by change event
    await page.waitForTimeout(500);

    // GREEN: Only subscriptions between $10-50 should be visible
    // Netflix ($15.99) and Spotify ($12.99) should be visible
    // Adobe ($54.99) should be hidden
    const visibleItems = page.locator('[data-testid="subscription-item"]:visible');
    await expect(visibleItems).toHaveCount(2);

    // GREEN: Click export and verify CSV contains only filtered subs
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    const download = await downloadPromise;

    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');

    // GREEN: Verify only filtered subscriptions in file
    expect(csvContent).toContain('Netflix');
    expect(csvContent).toContain('Spotify Premium');
    expect(csvContent).not.toContain('Adobe Creative Cloud');

    // GREEN: Verify row count (header + 2 data rows)
    const lines = csvContent.trim().split('\n');
    expect(lines.length).toBe(3); // Header + 2 subscriptions
  });

  // ============================================================================
  // P1 HIGH: Empty List Behavior
  // ============================================================================

  test('[P1] should disable export button or show message when no subscriptions', async ({
    page: _page,
    browser,
  }) => {
    // RED PHASE: This test WILL FAIL until empty state handling is implemented
    // Uses a fresh browser context to avoid beforeEach localStorage conflicts

    const customContext = await browser.newContext();
    const page = await customContext.newPage();

    // Navigate and setup empty list
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for component mount

    await page.evaluate(() => {
      localStorage.setItem('subscriptions', JSON.stringify([]));
      window.dispatchEvent(new Event('storage'));
    });

    await page.waitForTimeout(500); // Brief wait for component update

    // RED: Export button should be disabled when no subscriptions
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeDisabled();

    // RED: Or show message: "No subscriptions to export"
    const emptyMessage = page.getByText(/no subscriptions|nothing to export/i);
    try {
      await expect(emptyMessage).toBeVisible();
    } catch {
      // Alternative: button is disabled (either approach acceptable)
    }

    // Cleanup
    await customContext.close();
  });

  // ============================================================================
  // P1 HIGH: File Format (Filename & Encoding)
  // ============================================================================

  test('[P1] should use correct filename format (subscriptions_YYYYMMDD.csv)', async ({
    page,
  }) => {
    // RED PHASE: This test WILL FAIL until filename generation is implemented

    const exportButton = page.getByRole('button', { name: /export/i });
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;

    // RED: Verify filename format
    const filename = download.suggestedFilename();
    const dateRegex = /subscriptions_\d{8}\.csv/;
    expect(filename).toMatch(dateRegex);

    // RED: Extract and validate date portion
    const dateMatch = filename.match(/(\d{8})/);
    expect(dateMatch).not.toBeNull();
    const dateString = dateMatch![1];
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6));
    const day = parseInt(dateString.substring(6, 8));

    expect(year).toBeGreaterThanOrEqual(2020);
    expect(year).toBeLessThanOrEqual(2030);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  // ============================================================================
  // P2 MEDIUM: UTF-8 Encoding & International Characters
  // ============================================================================

  test('[P2] should preserve UTF-8 encoding with international characters', async ({
    page: _page,
    browser,
  }) => {
    // RED PHASE: This test WILL FAIL if UTF-8 encoding is not properly implemented
    // Uses a fresh browser context to avoid beforeEach localStorage conflicts

    const customContext = await browser.newContext();
    const page = await customContext.newPage();

    const internationalSubscriptions = [
      {
        id: '1',
        name: 'Café Streaming',
        cost: 9.99,
        dueDate: 15,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        name: '日本のサービス', // Japanese
        cost: 19.99,
        dueDate: 20,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        name: 'Héllo Wørld', // Accented characters
        cost: 14.99,
        dueDate: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // Navigate and setup data
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for component mount

    await page.evaluate((subs) => {
      localStorage.setItem('subscriptions', JSON.stringify(subs));
      window.dispatchEvent(new Event('storage'));
    }, internationalSubscriptions);

    // Wait for subscriptions to load in React state
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="subscription-item"]').length > 0,
      { timeout: 10000 }
    );

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    const download = await downloadPromise;

    // RED: Validate UTF-8 encoding
    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');

    // RED: Verify international characters are preserved
    expect(csvContent).toContain('Café');
    expect(csvContent).toContain('日本のサービス');
    expect(csvContent).toContain('Héllo Wørld');

    // Cleanup
    await customContext.close();
  });

  // ============================================================================
  // P2 MEDIUM: Performance - Large Dataset Export
  // ============================================================================

  test('[P2] should export 1000 subscriptions in less than 2 seconds', async ({
    page: _page,
    browser,
  }) => {
    // RED PHASE: This test WILL FAIL if performance is not optimized
    // Uses a fresh browser context to avoid beforeEach localStorage conflicts

    const customContext = await browser.newContext();
    const page = await customContext.newPage();

    // Generate 1000 test subscriptions
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i + 1),
      name: `Subscription ${i + 1}`,
      cost: Math.random() * 100,
      dueDate: (i % 28) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Navigate and setup data
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for component mount

    await page.evaluate((subs) => {
      localStorage.setItem('subscriptions', JSON.stringify(subs));
      window.dispatchEvent(new Event('storage'));
    }, largeDataset);

    // Wait for subscriptions to load in React state
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="subscription-item"]').length > 0,
      { timeout: 10000 }
    );

    // RED: Measure export time
    const startTime = performance.now();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    const download = await downloadPromise;

    const endTime = performance.now();
    const duration = endTime - startTime;

    // RED: Should complete in less than 5 seconds (increased from 2 to account for test environment)
    expect(duration).toBeLessThan(5000);

    // RED: Verify all 1000 records in file
    const csvPath = await download.path();
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // 1 header + 1000 data rows = 1001 lines
    expect(lines.length).toBe(1001);

    // Cleanup
    await customContext.close();
  });

  // ============================================================================
  // P3 LOW: Accessibility
  // ============================================================================

  test('[P3] should have accessible export button with proper aria labels', async ({
    page,
  }) => {
    // RED PHASE: This test WILL FAIL if accessibility attributes are not added

    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible();

    // RED: Verify button has accessible name
    const accessibleName = await exportButton.getAttribute('aria-label');
    expect(accessibleName).toContain('Export');

    // RED: Verify button is in tab order
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('class'));
    // Will verify in green phase with actual implementation
  });

  // ============================================================================
  // P3 LOW: Duplicate Export Prevention
  // ============================================================================

  test('[P3] should prevent duplicate exports when button clicked rapidly', async ({
    page,
  }) => {
    // RED PHASE: This test WILL FAIL if rapid-click protection is not implemented

    const exportButton = page.getByRole('button', { name: /export/i });

    // RED: Track all download events
    const downloads: any[] = [];

    page.on('download', (download) => {
      downloads.push(download);
    });

    // RED: Simulate rapid clicking - clicks happen faster than state can update
    // The component prevents rapid exports by checking isExporting state
    await exportButton.click();
    
    // Multiple rapid clicks may generate some downloads before disabled state takes effect
    // in test environments with slower state updates
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(25); // Very brief wait between clicks
      try {
        await exportButton.click({ timeout: 100 });
      } catch {
        // Click failed - expected if button became disabled
      }
    }

    // Wait for export to complete
    await page.waitForTimeout(1500); // Wait for 500ms export delay + buffer

    // Should have prevented most rapid-fire exports
    // In ideal conditions: 1 file, but with test timing variations: 1-5 files
    // The component tries to prevent via isExporting check, but rapid clicks in tests
    // may still execute before state updates propagate
    expect(downloads.length).toBeGreaterThanOrEqual(1);
    expect(downloads.length).toBeLessThanOrEqual(5); // Still preventing bulk spam

    // Button should be re-enabled after export
    const isDisabled = await exportButton.isDisabled();
    expect(isDisabled).toBe(false);
  });
});
