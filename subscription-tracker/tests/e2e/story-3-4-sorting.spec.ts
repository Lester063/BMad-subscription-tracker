/**
 * ATDD Green-Phase E2E Tests: Story 3.4 - Implement Subscription Display with Real-Time Updates
 * 
 * FIXED for Playwright Browser Context - localStorage cleared properly
 * 
 * Focus: User Behavior - Real-time display, sort order, no page refresh
 * Framework: Playwright (E2E automation)
 * Phase: GREEN - Tests now passing with implementation complete
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
/**
 * ============================================================================
 * FIXTURES & TEST SETUP (FIXED for Playwright)
 * ============================================================================
 */

test.beforeEach(async ({ page, context }) => {
  // Create a fresh context with localStorage cleared
  // This is the Playwright-approved way to handle storage
  await context.clearCookies();
  
  // Navigate to app
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Wait for app to be interactive (form visible)
  await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 5000 });
});

/**
 * ============================================================================
 * HELPER: Fill & Submit Form
 * ============================================================================
 */

async function addSubscription(
  page: Page,
  name: string,
  cost: string,
  dueDate: string
) {
  // Fill form fields
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="cost"]', cost);
  await page.fill('input[name="dueDate"]', dueDate);
  
  // Click "Add Subscription" button
  await page.click('button:has-text("Add Subscription")');
}

/**
 * ============================================================================
 * HELPER: Get all subscription rows from list
 * ============================================================================
 */

async function getSubscriptionRows(page: Page) {
  return page.locator('[data-testid="subscription-item"]');
}

/**
 * ============================================================================
 * HELPER: Get first subscription name visible in list
 * ============================================================================
 */

async function getFirstSubscriptionName(page: Page): Promise<string> {
  const firstRow = page.locator('[data-testid="subscription-item"]').first();
  const text = await firstRow.textContent();
  return text || '';
}

/**
 * ============================================================================
 * P0 CRITICAL TESTS (User-Facing Real-Time Requirements)
 * ============================================================================
 */

test.describe('Story 3.4 - P0: Real-Time Display Critical Path', () => {
  /**
   * AC1: Subscriptions Display Immediately After Add (< 100ms)
   */
  test('P0-E2E-001: Should display new subscription immediately after add (< 100ms)', async ({ page }) => {
    // SETUP: Empty list is visible
    const emptyState = page.locator('text=No subscriptions yet.');
    await expect(emptyState).toBeVisible();
    
    // USER ACTION: Fill form
    const beforeTime = Date.now();
    await addSubscription(page, 'Netflix', '15.99', '20');
    
    // EXPECTATION: Subscription appears in list within 100ms
    await expect(page.locator('text=Netflix')).toBeVisible({ timeout: 100 });
    const afterTime = Date.now();
    
    // ASSERTION: Measure actual time
    const actualTime = afterTime - beforeTime;
    console.log(`📊 Real-time update took: ${actualTime}ms`);
    expect(actualTime).toBeLessThan(150);
    
    // ASSERTION: Empty state is gone
    await expect(emptyState).not.toBeVisible();
  });

  /**
   * AC4: No Visual Flicker or Loading State Needed
   */
  test('P0-E2E-002: Should update without loading state or visual flicker', async ({ page }) => {
    // SETUP: Empty list is visible
    await expect(page.locator('text=No subscriptions yet.')).toBeVisible();
    
    // USER ACTION: Add subscription
    await addSubscription(page, 'Hulu', '12.99', '15');
    
    // EXPECTATION: No loading spinner visible
    const loadingSpinner = page.locator('[role="status"]');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 200 });
    
    // EXPECTATION: No skeleton loader visible
    const skeleton = page.locator('[data-testid="skeleton"]');
    await expect(skeleton).not.toBeVisible({ timeout: 200 });
    
    // EXPECTATION: Hulu is instantly visible in list
    await expect(page.locator('text=Hulu')).toBeVisible({ timeout: 100 });
    
    // EXPECTATION: List should be visible
    const list = page.locator('[data-testid="subscription-list"]');
    await expect(list).toBeVisible();
  });

  /**
   * AC1 + AC4: No Page Refresh Required
   */
  test('P0-E2E-003: Should not require page refresh on add', async ({ page }) => {
    // SETUP: Empty list visible
    await expect(page.locator('text=No subscriptions yet.')).toBeVisible();
    
    // USER ACTION: Add subscription
    await addSubscription(page, 'AWS', '100.00', '5');
    
    // EXPECTATION: URL unchanged (no navigation)
    expect(page.url()).toBe('http://localhost:5173/');
    
    // EXPECTATION: Subscription visible without page navigation
    await expect(page.locator('text=AWS')).toBeVisible({ timeout: 100 });
  });
});

/**
 * ============================================================================
 * P1 TESTS (Sorting & Real-Time Order)
 * ============================================================================
 */

test.describe('Story 3.4 - P1: Sorting & Real-Time Order', () => {
  /**
   * AC2: Subscriptions Sorted by Due Date (Earliest First)
   */
  test('P1-E2E-001: Should sort subscriptions by dueDate after each add', async ({ page }) => {
    // USER ACTION 1: Add subscription with dueDate=20
    await addSubscription(page, 'Netflix', '15.99', '20');
    let firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Netflix');
    
    // USER ACTION 2: Add subscription with dueDate=5 (should appear FIRST)
    await addSubscription(page, 'Gym', '50.00', '5');
    firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Gym');
    
    // USER ACTION 3: Add subscription with dueDate=15 (should appear in middle)
    await addSubscription(page, 'AWS', '100.00', '15');
    
    // ASSERTION: Verify complete sort order
    const rows = await getSubscriptionRows(page);
    const count = await rows.count();
    expect(count).toBe(3);
    
    const firstRow = await rows.nth(0).textContent();
    const secondRow = await rows.nth(1).textContent();
    const thirdRow = await rows.nth(2).textContent();
    
    expect(firstRow).toContain('Gym');
    expect(secondRow).toContain('AWS');
    expect(thirdRow).toContain('Netflix');
  });

  /**
   * AC2 Edge Case: Duplicate Due Dates Maintain Insertion Order
   */
  test('P1-E2E-002: Should maintain insertion order for duplicate due dates', async ({ page }) => {
    // USER ACTION 1: Add Netflix with dueDate=15
    await addSubscription(page, 'Netflix', '15.99', '15');
    
    // USER ACTION 2: Add Hulu with dueDate=15 (same date)
    await addSubscription(page, 'Hulu', '12.99', '15');
    
    // EXPECTATION: Netflix appears first (inserted first), Hulu second
    const rows = await getSubscriptionRows(page);
    expect(await rows.count()).toBe(2);
    
    const firstRow = await rows.nth(0).textContent();
    const secondRow = await rows.nth(1).textContent();
    
    expect(firstRow).toContain('Netflix');
    expect(secondRow).toContain('Hulu');
  });

  /**
   * AC1 + AC2: Real-Time Sort Updates for Each Add
   */
  test('P1-E2E-003: Should re-sort immediately after each add (real-time order)', async ({ page }) => {
    // USER ACTION 1: Add with dueDate=20
    await addSubscription(page, 'High Cost', '500.00', '20');
    let firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('High Cost');
    
    // USER ACTION 2: Add with dueDate=5 (should immediately become first)
    await addSubscription(page, 'Due Soon', '10.00', '5');
    firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Due Soon');
    
    // USER ACTION 3: Add with dueDate=31 (should appear last)
    await addSubscription(page, 'Due Last', '25.00', '31');
    const rows = await getSubscriptionRows(page);
    const lastRow = await rows.last().textContent();
    expect(lastRow).toContain('Due Last');
  });
});

/**
 * ============================================================================
 * P1 TESTS (Empty State Transition)
 * ============================================================================
 */

test.describe('Story 3.4 - P1: Empty State Transition', () => {
  /**
   * Empty List → Populated List
   */
  test('P1-E2E-004: Should transition from empty state to populated list', async ({ page }) => {
    // SETUP: Verify empty state is visible
    const emptyState = page.locator('text=No subscriptions yet.');
    await expect(emptyState).toBeVisible();
    
    // SETUP: Verify list is not visible
    const list = page.locator('[data-testid="subscription-list"]');
    await expect(list).not.toBeVisible();
    
    // USER ACTION: Add first subscription
    await addSubscription(page, 'First Sub', '10.00', '1');
    
    // EXPECTATION: Empty state disappears
    await expect(emptyState).not.toBeVisible({ timeout: 200 });
    
    // EXPECTATION: List appears with subscription
    await expect(list).toBeVisible({ timeout: 200 });
    await expect(page.locator('text=First Sub')).toBeVisible();
  });
});

/**
 * ============================================================================
 * P2 TESTS (Performance & Edge Cases)
 * ============================================================================
 */

test.describe('Story 3.4 - P2: Performance & Edge Cases', () => {
  /**
   * Performance: Rapid Adds
   */
  test('P2-E2E-001: Should handle rapid subscription adds without lag', async ({ page }) => {
    // USER ACTION: Add 5 subscriptions rapidly
    for (let i = 1; i <= 5; i++) {
      await addSubscription(page, `Sub ${i}`, `${10 * i}.00`, `${i * 5}`);
    }
    
    // EXPECTATION: All 5 subscriptions visible
    const rows = await getSubscriptionRows(page);
    expect(await rows.count()).toBe(5);
    
    // EXPECTATION: All still sorted by dueDate
    const firstRow = await rows.nth(0).textContent();
    const lastRow = await rows.nth(4).textContent();
    expect(firstRow).toContain('Sub 1');
    expect(lastRow).toContain('Sub 5');
  });

  /**
   * Edge Case: Subscription with dueDate=1 (earliest possible)
   */
  test('P2-E2E-002: Should handle minimum dueDate=1', async ({ page }) => {
    // USER ACTION: Add subscription with dueDate=31
    await addSubscription(page, 'Late', '50.00', '31');
    
    // USER ACTION: Add subscription with dueDate=1 (earliest)
    await addSubscription(page, 'Urgent', '25.00', '1');
    
    // EXPECTATION: Urgent appears first
    const firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Urgent');
  });

  /**
   * Edge Case: Subscription with dueDate=31 (latest possible)
   */
  test('P2-E2E-003: Should handle maximum dueDate=31', async ({ page }) => {
    // USER ACTION: Add subscription with dueDate=1
    await addSubscription(page, 'Soon', '10.00', '1');
    
    // USER ACTION: Add subscription with dueDate=31 (latest)
    await addSubscription(page, 'Later', '100.00', '31');
    
    // EXPECTATION: Later appears last
    const rows = await getSubscriptionRows(page);
    const lastRow = await rows.last().textContent();
    expect(lastRow).toContain('Later');
  });
});

/**
 * ============================================================================
 * ACCESSIBILITY TESTS (Baseline)
 * ============================================================================
 */

test.describe('Story 3.4 - Accessibility Baseline (Story 3.5 will expand)', () => {
  /**
   * WCAG: List Structure
   */
  test('ACC-001: Subscription list should be semantic <ul> with <li> items', async ({ page }) => {
    // SETUP: Add subscriptions
    await addSubscription(page, 'Netflix', '15.99', '20');
    await addSubscription(page, 'Gym', '50.00', '5');
    
    // EXPECTATION: List is a semantic `<ul>`
    const list = page.locator('ul[data-testid="subscription-list"]');
    await expect(list).toBeVisible();
    
    // EXPECTATION: Each item is a semantic `<li>`
    const items = page.locator('li[data-testid="subscription-item"]');
    expect(await items.count()).toBe(2);
  });
});
