/**
 * ATDD Red-Phase E2E Tests: Story 4.2
 * ====================================
 * 
 * Story 4.2: Implement Delete Subscription Workflow
 * 
 * These tests are FAILING (RED PHASE) and will be activated by the developer
 * during the TDD red-green-refactor cycle.
 * 
 * Test Mode: User scenario-based E2E (Playwright)
 * Framework: Playwright + @playwright/test
 * Test Artifacts: Acceptance criteria coverage mapped in test-design-4.2-delete-subscription.md
 * 
 * Generated: 2026-05-12
 * Architect: Murat, Master Test Architect
 * 
 * Test Strategy: E2E ONLY (per user constraint)
 * - No Unit or Component tests generated in this ATDD run
 * - All 5 E2E scenarios focused on critical user journeys
 */

import { test, expect } from '@playwright/test';

/**
 * ============================================================================
 * STORY 4.2: DELETE SUBSCRIPTION WORKFLOW — USER SCENARIOS
 * ============================================================================
 * 
 * AC1: Delete button visible on each subscription row
 * AC2: Clicking Delete triggers confirmation dialog ("Are you sure?")
 * AC3: Dialog shows Cancel and Confirm Delete buttons
 * AC4: Cancel closes dialog, subscription preserved
 * AC5: Confirm Delete removes subscription from list (<100ms)
 * AC6: Success toast displays ("Subscription deleted successfully")
 * AC7: Subscription persists removed from localStorage
 * AC8: Keyboard navigation works (Tab, Enter, Escape)
 * AC9: WCAG 2.1 Level A compliance (aria-labels, roles)
 * AC10: Error handling (try-catch on localStorage)
 * 
 * Priority Mapping:
 * - P0: Happy path, cancel, persistence (critical path + high-risk mitigation)
 * - P1: Keyboard/accessibility, performance (accessibility standards)
 */

test.describe('Story 4.2: Delete Subscription Workflow', () => {
  /**
   * Setup: Navigate to dashboard and verify initial state
   * This runs before each test in this describe block
   */
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Seed test data with subscriptions for delete tests
    await page.evaluate(() => {
      const testData = [
        {
          id: 'netflix-001',
          name: 'Netflix',
          cost: 15.99,
          dueDate: 15,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
        {
          id: 'hulu-001',
          name: 'Hulu',
          cost: 7.99,
          dueDate: 20,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
        {
          id: 'spotify-001',
          name: 'Spotify',
          cost: 11.99,
          dueDate: 1,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
      ];
      localStorage.setItem('subscriptions', JSON.stringify(testData));
    });
    
    // Reload page to load seeded data
    await page.reload();
    
    // Wait for the app to load and subscription list to render
    await page.waitForSelector('[role="main"], [data-testid="dashboard"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="subscription-item"]', { timeout: 5000 });
  });

  /**
   * ========================================================================
   * P0 TESTS: CRITICAL PATH + HIGH-RISK MITIGATION
   * ========================================================================
   */

  /**
   * E4.2-001: HAPPY PATH — Delete subscription via UI (P0)
   * 
   * Acceptance Criteria Coverage:
   * - AC1: Delete button visible on each subscription row
   * - AC2: Clicking Delete triggers confirmation dialog
   * - AC3: Dialog shows Cancel and Confirm Delete buttons
   * - AC5: Confirm Delete removes subscription from list (<100ms)
   * - AC6: Success toast displays
   * - AC10: Error handling (implicit — no error in happy path)
   * 
   * Risk Mitigation:
   * - R4.2-001: localStorage Persistence Fails
   * - R4.2-002: Reducer State Mutation Fails
   * - R4.2-003: Performance Degradation
   * 
   * Expected Behavior:
   * 1. User sees Delete button on Netflix row
   * 2. User clicks Delete
   * 3. Confirmation dialog appears with "Are you sure?" text
   * 4. Cancel and Confirm Delete buttons visible in dialog
   * 5. User clicks Confirm Delete
   * 6. Netflix subscription removed from list (<100ms)
   * 7. Success toast notification displays
   * 
   * TDD Red Phase: This test WILL FAIL because:
   * - DeleteConfirmationDialog component doesn't exist
   * - useSubscriptions.deleteSubscription hook not implemented
   * - Reducer DELETE_SUBSCRIPTION action not wired up
   * - Success toast not integrated (Story 4.4 dependency)
   */
  test('[P0] E4.2-001: Happy path - delete subscription via UI', async ({
    page,
  }) => {
    // Arrange: Verify Netflix subscription exists in list
    const netflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') })
      .first();
    
    await expect(netflixRow).toBeVisible();

    // Get initial subscription count
    const subscriptionItems = page.locator('[data-testid="subscription-item"]');
    const initialCount = await subscriptionItems.count();
    expect(initialCount).toBe(3); // Netflix, Hulu, Spotify

    // Act 1: Click Delete button on Netflix row
    const deleteButton = netflixRow.locator('button:has-text("Delete")');
    await expect(deleteButton).toBeVisible();
    
    // Measure time to click
    await deleteButton.click();

    // Assert 1: Confirmation dialog appears
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Assert 2: Dialog contains confirmation text
    await expect(page.locator('text=Are you sure')).toBeVisible();

    // Assert 3: Cancel and Confirm Delete buttons are visible
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    const confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');
    await expect(cancelButton).toBeVisible();
    await expect(confirmDeleteButton).toBeVisible();

    // Act 2: Click Confirm Delete button
    const startTime = Date.now();
    await confirmDeleteButton.click();
    
    // Assert 4: Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 2000 });

    // Assert 5: Netflix subscription removed from list
    const endTime = Date.now();
    const deletionTime = endTime - startTime;
    
    // Verify Netflix row no longer exists
    const updatedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(updatedNetflixRow).toHaveCount(0);

    // Assert 6: Subscription count decreased
    const finalCount = await subscriptionItems.count();
    expect(finalCount).toBe(2);

    // Assert 7: Deletion completed within 100ms (React sync update)
    expect(deletionTime).toBeLessThan(100);

    // Assert 8: Success toast notification displays
    const successToast = page.locator('text=Subscription deleted successfully');
    await expect(successToast).toBeVisible({ timeout: 3000 });
  });

  /**
   * E4.2-002: CANCEL WORKFLOW — Delete, cancel, verify preservation (P0)
   * 
   * Acceptance Criteria Coverage:
   * - AC4: Cancel closes dialog, subscription preserved
   * 
   * Risk Mitigation:
   * - R4.2-005: Cancel Doesn't Work
   * - R4.2-001: localStorage Persistence Fails (implicit — no change should occur)
   * 
   * Expected Behavior:
   * 1. User sees Delete button on Netflix row
   * 2. User clicks Delete
   * 3. Confirmation dialog appears
   * 4. User clicks Cancel
   * 5. Dialog closes without deleting
   * 6. Netflix subscription still visible in list
   * 7. Refresh page and verify Netflix still exists (cancel didn't touch storage)
   * 
   * TDD Red Phase: This test WILL FAIL because:
   * - DeleteConfirmationDialog component doesn't exist
   * - Cancel button handler not implemented
   */
  test('[P0] E4.2-002: Cancel workflow - delete, cancel, preserve subscription', async ({
    page,
  }) => {
    // Arrange: Get initial subscription count
    const subscriptionItems = page.locator('[data-testid="subscription-item"]');
    const initialCount = await subscriptionItems.count();
    expect(initialCount).toBe(3);

    // Verify Netflix exists
    const netflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') })
      .first();
    await expect(netflixRow).toBeVisible();

    // Act 1: Click Delete button on Netflix row
    const deleteButton = netflixRow.locator('button:has-text("Delete")');
    await deleteButton.click();

    // Assert 1: Dialog appears
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Assert 2: Confirmation text visible
    await expect(page.locator('text=Are you sure')).toBeVisible();

    // Act 2: Click Cancel button
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    await cancelButton.click();

    // Assert 3: Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 2000 });

    // Assert 4: Netflix subscription still visible in list
    await expect(netflixRow).toBeVisible();

    // Assert 5: Subscription count unchanged
    const finalCount = await subscriptionItems.count();
    expect(finalCount).toBe(3);

    // Assert 6: localStorage unchanged (verify by refresh)
    await page.reload();
    
    // Wait for app to load after refresh
    await page.waitForSelector('[data-testid="subscription-item"]', { timeout: 5000 });

    // Verify Netflix still exists after reload
    const reloadedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(reloadedNetflixRow).toHaveCount(1);

    // Verify subscription count is still 3
    const reloadedCount = await subscriptionItems.count();
    expect(reloadedCount).toBe(3);
  });

  /**
   * E4.2-003: PERSISTENCE VERIFICATION — Delete, refresh, confirm persistence (P0)
   * 
   * Acceptance Criteria Coverage:
   * - AC7: Subscription persists removed from localStorage
   * 
   * Risk Mitigation:
   * - R4.2-001: localStorage Persistence Fails (HIGH PRIORITY)
   * - R4.2-002: Reducer State Mutation Fails (implicit — state mutation required for delete)
   * 
   * Expected Behavior:
   * 1. User sees Netflix and Hulu subscriptions
   * 2. User deletes Netflix
   * 3. Netflix removed from list
   * 4. User refreshes page (F5)
   * 5. After reload, Netflix is NOT in list (deletion persisted to localStorage)
   * 6. Hulu subscription still present
   * 7. Verify localStorage contains only Hulu and Spotify (Netflix gone)
   * 
   * TDD Red Phase: This test WILL FAIL because:
   * - Delete functionality not implemented
   * - If localStorage.setItem fails, Netflix will reappear on reload (high-risk R4.2-001)
   */
  test('[P0] E4.2-003: Persistence verification - delete, refresh, confirm persisted', async ({
    page,
  }) => {
    // Arrange: Verify Netflix subscription exists before delete
    const netflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') })
      .first();
    await expect(netflixRow).toBeVisible();

    // Verify initial count = 3
    const subscriptionItems = page.locator('[data-testid="subscription-item"]');
    const initialCount = await subscriptionItems.count();
    expect(initialCount).toBe(3);

    // Act 1: Delete Netflix
    const deleteButton = netflixRow.locator('button:has-text("Delete")');
    await deleteButton.click();

    // Confirm deletion
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });

    const confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');
    await confirmDeleteButton.click();

    // Assert 1: Netflix removed from UI
    const updatedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(updatedNetflixRow).toHaveCount(0);

    // Assert 2: Count decreased to 2
    let currentCount = await subscriptionItems.count();
    expect(currentCount).toBe(2);

    // Act 2: Refresh page to test localStorage persistence
    await page.reload();
    
    // Wait for app to re-hydrate from localStorage
    await page.waitForSelector('[data-testid="subscription-item"]', { timeout: 5000 });

    // Assert 3: After refresh, Netflix still NOT in list (deletion persisted)
    const reloadedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(reloadedNetflixRow).toHaveCount(0);

    // Assert 4: Hulu and Spotify still present
    const reloadedHuluRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Hulu') });
    const reloadedSpotifyRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Spotify') });
    await expect(reloadedHuluRow).toHaveCount(1);
    await expect(reloadedSpotifyRow).toHaveCount(1);

    // Assert 5: Final count is 2
    currentCount = await subscriptionItems.count();
    expect(currentCount).toBe(2);

    // Assert 6: Verify localStorage contents (Netflix should not be present)
    const storedSubscriptions = await page.evaluate(() => {
      const stored = localStorage.getItem('subscriptions');
      return stored ? JSON.parse(stored) : [];
    });
    
    expect(storedSubscriptions).toHaveLength(2);
    expect(storedSubscriptions.some((s: any) => s.name === 'Netflix')).toBe(false);
    expect(storedSubscriptions.some((s: any) => s.name === 'Hulu')).toBe(true);
    expect(storedSubscriptions.some((s: any) => s.name === 'Spotify')).toBe(true);
  });

  /**
   * ========================================================================
   * P1 TESTS: ACCESSIBILITY + KEYBOARD + PERFORMANCE
   * ========================================================================
   */

  /**
   * E4.2-004: KEYBOARD-ONLY DELETION WORKFLOW (P1)
   * 
   * Acceptance Criteria Coverage:
   * - AC8: Keyboard navigation works (Tab, Enter, Escape)
   * - AC9: WCAG 2.1 Level A compliance (aria-labels, roles)
   * 
   * Risk Mitigation:
   * - R4.2-006: Keyboard Navigation & Accessibility Broken
   * 
   * Expected Behavior (Keyboard-Only User):
   * 1. User tabs through page (no mouse)
   * 2. Focus reaches Netflix row's Delete button
   * 3. User presses Enter to trigger delete (no mouse click)
   * 4. Confirmation dialog appears
   * 5. Focus auto-moves to first button in dialog (Cancel)
   * 6. User tabs to Confirm Delete button
   * 7. User presses Enter to confirm
   * 8. Netflix removed from list
   * 
   * Alternative: User presses Escape to cancel instead (steps 5-8)
   * 
   * TDD Red Phase: This test WILL FAIL because:
   * - Dialog component missing, keyboard handlers not implemented
   * - Focus management (auto-focus on dialog open) not implemented
   * - Escape key handler not implemented
   * - aria-labels/roles not present
   */
  test('[P1] E4.2-004: Keyboard-only deletion - Tab, Enter, Escape navigation', async ({
    page,
  }) => {
    // Arrange: Verify Netflix subscription exists
    const netflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') })
      .first();
    await expect(netflixRow).toBeVisible();

    // Get the Delete button within Netflix row
    const deleteButton = netflixRow.locator('button:has-text("Delete")');

    // Act 1: Tab to Delete button (simulate keyboard navigation)
    // Focus the delete button directly (in real scenario, user would Tab multiple times)
    await deleteButton.focus();
    await expect(deleteButton).toBeFocused();

    // Act 2: Press Enter to trigger delete (keyboard activation)
    await page.keyboard.press('Enter');

    // Assert 1: Dialog appears
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Assert 2: Dialog is properly marked with ARIA role
    await expect(dialog).toHaveAttribute('role', 'dialog');

    // Assert 3: Focus should be in dialog (auto-focused, typically on first interactive element)
    // The dialog should trap focus and auto-focus on first button
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el?.textContent?.trim() || '';
    });
    // Should be on Cancel or Confirm Delete button
    expect(['Cancel', 'Confirm Delete'].some((text) => focusedElement.includes(text))).toBe(true);

    // Act 3: Tab to Confirm Delete button
    const confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');
    await confirmDeleteButton.focus();
    await expect(confirmDeleteButton).toBeFocused();

    // Act 4: Press Enter to confirm delete
    await page.keyboard.press('Enter');

    // Assert 4: Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 2000 });

    // Assert 5: Netflix removed from list
    const updatedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(updatedNetflixRow).toHaveCount(0);

    // === ALTERNATIVE: Test Escape key cancellation ===

    // Arrange 2: Add Netflix back via localStorage for second test
    await page.evaluate(() => {
      const testData = [
        {
          id: 'netflix-001',
          name: 'Netflix',
          cost: 15.99,
          dueDate: 15,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
        {
          id: 'hulu-001',
          name: 'Hulu',
          cost: 7.99,
          dueDate: 20,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
        {
          id: 'spotify-001',
          name: 'Spotify',
          cost: 11.99,
          dueDate: 1,
          createdAt: 1715000000000,
          updatedAt: 1715000000000,
        },
      ];
      localStorage.setItem('subscriptions', JSON.stringify(testData));
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid="subscription-item"]', { timeout: 5000 });

    // Act 5: Trigger delete again to test Escape key
    const netflixRow2 = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') })
      .first();
    const deleteButton2 = netflixRow2.locator('button:has-text("Delete")');
    
    await deleteButton2.focus();
    await page.keyboard.press('Enter');

    // Assert 6: Dialog appears for Escape test
    const dialog2 = page.locator('[role="dialog"]');
    await expect(dialog2).toBeVisible({ timeout: 3000 });

    // Act 6: Press Escape to cancel (keyboard navigation alternative)
    await page.keyboard.press('Escape');

    // Assert 7: Dialog closes without deletion
    await expect(dialog2).not.toBeVisible({ timeout: 2000 });

    // Assert 8: Netflix still in list (Escape canceled the deletion)
    const preservedNetflixRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Netflix') });
    await expect(preservedNetflixRow).toHaveCount(1);
  });

  /**
   * E4.2-005: PERFORMANCE VERIFICATION — Delete from large list (P1)
   * 
   * Acceptance Criteria Coverage:
   * - AC5: Confirm Delete removes subscription from list (<100ms)
   * - AC3: System responsive with large dataset
   * 
   * Risk Mitigation:
   * - R4.2-003: Performance Degradation with Large List
   * 
   * Expected Behavior:
   * 1. App loaded with 100+ subscriptions
   * 2. Page renders without lag (list should be performant)
   * 3. User clicks Delete on subscription #50
   * 4. Dialog appears quickly
   * 5. User confirms delete
   * 6. Deletion completes <100ms (React sync update)
   * 7. List remains responsive after deletion
   * 
   * TDD Red Phase: This test WILL FAIL because:
   * - Delete functionality not implemented
   * - Dialog component missing
   * - May also fail if rendering performance is poor (no virtualization)
   */
  test('[P1] E4.2-005: Performance verification - delete from 100+ subscriptions', async ({
    page,
  }) => {
    // Arrange: Generate 100+ subscriptions for performance testing
    await page.evaluate(() => {
      const largeDataSet = Array.from({ length: 120 }, (_, index) => ({
        id: `subscription-${index}`,
        name: `Subscription ${index + 1}`,
        cost: 10 + Math.random() * 20,
        dueDate: (index % 28) + 1,
        createdAt: 1715000000000,
        updatedAt: 1715000000000,
      }));
      localStorage.setItem('subscriptions', JSON.stringify(largeDataSet));
    });

    // Reload page with large dataset
    await page.reload();
    await page.waitForSelector('[data-testid="subscription-item"]', { timeout: 10000 });

    // Assert 1: All 120 subscriptions loaded (or virtualized, but count matches)
    const subscriptionItems = page.locator('[data-testid="subscription-item"]');
    let count = await subscriptionItems.count();
    expect(count).toBeGreaterThanOrEqual(100); // At least 100 loaded (may be virtualized)

    // Find subscription #50 in the list
    const targetRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Subscription 50') })
      .first();

    // Scroll to make subscription #50 visible if needed
    await targetRow.scrollIntoViewIfNeeded();

    // Assert 2: Target subscription visible
    await expect(targetRow).toBeVisible();

    // Act 1: Click Delete button on subscription #50
    const deleteButton = targetRow.locator('button:has-text("Delete")');
    
    const dialogStartTime = Date.now();
    await deleteButton.click();

    // Assert 3: Dialog appears quickly (<500ms)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 1000 });
    
    const dialogTime = Date.now() - dialogStartTime;
    expect(dialogTime).toBeLessThan(500); // Dialog should appear <500ms

    // Act 2: Click Confirm Delete
    const confirmStartTime = Date.now();
    const confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');
    await confirmDeleteButton.click();

    // Assert 4: Deletion completes quickly (<100ms)
    const updatedItems = page.locator('[data-testid="subscription-item"]');
    await updatedItems.filter({ has: page.locator('text=Subscription 50') }).count().then(() => {});
    
    const confirmTime = Date.now() - confirmStartTime;
    expect(confirmTime).toBeLessThan(100); // Deletion should complete <100ms

    // Assert 5: Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 2000 });

    // Assert 6: Subscription #50 removed from list
    const updatedTargetRow = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Subscription 50') });
    await expect(updatedTargetRow).toHaveCount(0);

    // Assert 7: Final count decreased by 1
    const finalCount = await subscriptionItems.count();
    expect(finalCount).toBe(count - 1);

    // Assert 8: List remains responsive (other subscriptions still visible)
    const subscription51 = page.locator('[data-testid="subscription-item"]')
      .filter({ has: page.locator('text=Subscription 51') });
    await expect(subscription51).toBeVisible();
  });
});
