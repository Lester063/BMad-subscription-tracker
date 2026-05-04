/**
 * ATDD Red-Phase E2E Tests: Story 3.4 - Implement Subscription Display with Real-Time Updates
 * 
 * Focus: User Behavior - Real-time display, sort order, no page refresh
 * Framework: Playwright (E2E automation)
 * Phase: RED - Tests currently failing, awaiting implementation
 * 
 * User Journey Being Tested:
 * 1. User opens app with empty list
 * 2. User fills form (name, cost, dueDate)
 * 3. User clicks "Add Subscription"
 * 4. EXPECTATION: Subscription appears in list immediately (<100ms)
 * 5. EXPECTATION: List is sorted by dueDate (earliest first)
 * 6. EXPECTATION: No page refresh, no loading state, smooth update
 */

import { test, expect, Page } from '@playwright/test';

/**
 * ============================================================================
 * FIXTURES & TEST SETUP
 * ============================================================================
 */

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.evaluate(() => localStorage.clear());
  
  // Navigate to app
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Wait for app to be interactive (form visible)
  await page.locator('input[name="name"]').waitFor({ state: 'visible' });
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
   * 
   * USER STORY:
   * User fills form with Netflix subscription (name, cost, dueDate)
   * User clicks "Add Subscription"
   * EXPECTED: Netflix appears in list immediately (< 100ms)
   * USER PERCEPTION: Instant feedback that action worked
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
    console.log(`\n📊 Real-time update took: ${actualTime}ms`);
    expect(actualTime).toBeLessThan(150); // Allow 50ms buffer for test overhead
    
    // ASSERTION: Empty state is gone
    await expect(emptyState).not.toBeVisible();
  });

  /**
   * AC4: No Visual Flicker or Loading State Needed
   * 
   * USER STORY:
   * User adds subscription
   * EXPECTED: Smooth update with no loading spinner, no skeleton, no visual flicker
   * USER PERCEPTION: Professional, polished experience
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
    
    // EXPECTATION: List should be visible (not hidden by modal/overlay)
    const list = page.locator('[data-testid="subscription-list"]');
    await expect(list).toBeVisible();
  });

  /**
   * AC1 + AC4: No Page Refresh Required
   * 
   * USER STORY:
   * User adds subscription
   * EXPECTED: Page does NOT refresh, URL stays the same, no flicker
   * USER PERCEPTION: Seamless in-place update
   */
  test('P0-E2E-003: Should not require page refresh on add', async ({ page }) => {
    // SETUP: Track page load count
    let pageLoadCount = 0;
    page.on('load', () => {
      pageLoadCount++;
    });
    
    // SETUP: Empty list visible
    await expect(page.locator('text=No subscriptions yet.')).toBeVisible();
    
    // USER ACTION: Add subscription
    await addSubscription(page, 'AWS', '100.00', '5');
    
    // EXPECTATION: Page did NOT reload
    expect(pageLoadCount).toBe(1); // Only initial load, no additional refreshes
    
    // EXPECTATION: URL unchanged
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
   * 
   * USER STORY:
   * User has multiple subscriptions with different due dates
   * User adds them in random order
   * EXPECTED: List is always sorted by dueDate (ascending: 5, 15, 20)
   * USER PERCEPTION: Subscriptions are organized by urgency/priority
   */
  test('P1-E2E-001: Should sort subscriptions by dueDate after each add', async ({ page }) => {
    // USER ACTION 1: Add subscription with dueDate=20
    await addSubscription(page, 'Netflix', '15.99', '20');
    let firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Netflix');
    
    // USER ACTION 2: Add subscription with dueDate=5 (should appear FIRST)
    await addSubscription(page, 'Gym', '50.00', '5');
    firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Gym'); // Gym should now be first (dueDate 5 < 20)
    
    // USER ACTION 3: Add subscription with dueDate=15 (should appear in middle)
    await addSubscription(page, 'AWS', '100.00', '15');
    
    // ASSERTION: Verify complete sort order: Gym (5), AWS (15), Netflix (20)
    const rows = await getSubscriptionRows(page);
    const count = await rows.count();
    expect(count).toBe(3);
    
    const firstRow = await rows.nth(0).textContent();
    const secondRow = await rows.nth(1).textContent();
    const thirdRow = await rows.nth(2).textContent();
    
    expect(firstRow).toContain('Gym');    // dueDate: 5
    expect(secondRow).toContain('AWS');   // dueDate: 15
    expect(thirdRow).toContain('Netflix'); // dueDate: 20
  });

  /**
   * AC2 Edge Case: Duplicate Due Dates Maintain Insertion Order
   * 
   * USER STORY:
   * User adds subscriptions with SAME due date
   * EXPECTED: Subscriptions with same dueDate maintain insertion order (stable sort)
   * USER PERCEPTION: Predictable behavior when multiple items have same date
   */
  test('P1-E2E-002: Should maintain insertion order for duplicate due dates', async ({ page }) => {
    // USER ACTION 1: Add Netflix with dueDate=15
    await addSubscription(page, 'Netflix', '15.99', '15');
    
    // USER ACTION 2: Add Hulu with dueDate=15 (same date, different name)
    await addSubscription(page, 'Hulu', '12.99', '15');
    
    // EXPECTATION: Netflix appears first (inserted first), Hulu second (inserted after)
    const rows = await getSubscriptionRows(page);
    expect(await rows.count()).toBe(2);
    
    const firstRow = await rows.nth(0).textContent();
    const secondRow = await rows.nth(1).textContent();
    
    expect(firstRow).toContain('Netflix'); // Inserted first
    expect(secondRow).toContain('Hulu');   // Inserted second (stable sort)
  });

  /**
   * AC1 + AC2: Real-Time Sort Updates for Each Add
   * 
   * USER STORY:
   * User adds subscriptions in "wrong" order (20, then 5)
   * EXPECTED: List re-sorts immediately after each add
   * USER PERCEPTION: List always shows correct priority order
   */
  test('P1-E2E-003: Should re-sort immediately after each add (real-time order)', async ({ page }) => {
    // USER ACTION 1: Add with dueDate=20
    await addSubscription(page, 'High Cost', '500.00', '20');
    let firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('High Cost'); // Only item, appears first
    
    // USER ACTION 2: Add with dueDate=5 (should immediately become first)
    await addSubscription(page, 'Due Soon', '10.00', '5');
    firstName = await getFirstSubscriptionName(page);
    expect(firstName).toContain('Due Soon'); // Should now be first (real-time re-sort)
    
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
   * 
   * USER STORY:
   * User opens app with no subscriptions
   * User adds first subscription
   * EXPECTED: Empty state disappears, subscription appears in list
   * USER PERCEPTION: App transitions smoothly from empty to populated
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
   * 
   * USER STORY:
   * User rapidly adds multiple subscriptions
   * EXPECTED: Each add updates list immediately, no lag or missed updates
   * USER PERCEPTION: Responsive UI even with fast input
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
    expect(firstRow).toContain('Sub 1');  // dueDate: 5
    expect(lastRow).toContain('Sub 5');   // dueDate: 25
  });

  /**
   * Edge Case: Subscription with dueDate=1 (earliest possible)
   * 
   * USER STORY:
   * User adds subscription due on day 1
   * EXPECTED: Appears first in list
   * USER PERCEPTION: Urgent items are prioritized
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
   * 
   * USER STORY:
   * User adds subscription due on day 31
   * EXPECTED: Appears last in list
   * USER PERCEPTION: Far-future items are deprioritized
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
 * P3 TESTS (Nice-to-Have / Future Enhancements)
 * ============================================================================
 */

test.describe('Story 3.4 - P3: Future Enhancements', () => {
  /**
   * Future: Persistence Check
   * 
   * USER STORY:
   * User adds subscriptions
   * User refreshes page
   * EXPECTED: Subscriptions persist in same sorted order
   * 
   * NOTE: This is blocked on Story 2.2 (localStorage utilities)
   * but included here for completeness
   */
  test.skip('P3-E2E-001: Should persist subscriptions across page refresh', async ({ page }) => {
    // USER ACTION: Add subscriptions
    await addSubscription(page, 'Netflix', '15.99', '20');
    await addSubscription(page, 'Gym', '50.00', '5');
    
    // USER ACTION: Refresh page
    await page.reload({ waitUntil: 'networkidle' });
    
    // EXPECTATION: Subscriptions still visible in same order
    const rows = await getSubscriptionRows(page);
    expect(await rows.count()).toBe(2);
    
    const firstRow = await rows.nth(0).textContent();
    expect(firstRow).toContain('Gym'); // Still sorted by dueDate
  });

  /**
   * Future: Form Reset After Add
   * 
   * USER STORY:
   * User adds subscription
   * EXPECTED: Form clears after add (empty fields ready for next input)
   * 
   * NOTE: This is from Story 3.3 (form reset)
   * included here for E2E completeness
   */
  test.skip('P3-E2E-002: Should reset form after successful add', async ({ page }) => {
    // USER ACTION: Add subscription
    await addSubscription(page, 'Netflix', '15.99', '20');
    
    // EXPECTATION: Form fields are empty
    const nameField = page.locator('input[name="name"]');
    const costField = page.locator('input[name="cost"]');
    const dueDateField = page.locator('input[name="dueDate"]');
    
    expect(await nameField.inputValue()).toBe('');
    expect(await costField.inputValue()).toBe('');
    expect(await dueDateField.inputValue()).toBe('');
  });

  /**
   * Future: Success Message Display
   * 
   * USER STORY:
   * User adds subscription
   * EXPECTED: Success message displays confirming add
   * 
   * NOTE: This is from Story 3.3 (success feedback)
   * included here for E2E completeness
   */
  test.skip('P3-E2E-003: Should show success message on add', async ({ page }) => {
    // USER ACTION: Add subscription
    await addSubscription(page, 'Netflix', '15.99', '20');
    
    // EXPECTATION: Success message visible
    const successMessage = page.locator('text=Subscription added successfully');
    await expect(successMessage).toBeVisible({ timeout: 500 });
  });
});

/**
 * ============================================================================
 * ACCESSIBILITY TESTS (P1 - Story 3.5 will expand this)
 * ============================================================================
 */

test.describe('Story 3.4 - Accessibility Baseline (Story 3.5 will expand)', () => {
  /**
   * WCAG: List Structure
   * 
   * USER WITH SCREEN READER:
   * Subscription list should be marked up as semantic `<ul>` with `<li>` items
   * Each item should have proper ARIA labels
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
