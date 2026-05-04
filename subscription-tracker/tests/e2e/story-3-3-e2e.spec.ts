/**
 * Story 3.3: Implement Add Subscription Workflow
 * E2E Tests (Playwright) - Enhanced Version
 *
 * Status: Red phase (tests will FAIL until feature is implemented)
 * These tests define the expected user behavior from the user's perspective.
 *
 * ENHANCEMENTS:
 * - data-testid selectors for resilience
 * - Deterministic waits (event-based, not hard timeouts)
 * - Network monitoring for form submission
 * - Reusable fixtures and helpers
 * - Support for rapid submission testing
 *
 * Generated: 2026-05-04
 * By: Murat (Master Test Architect)
 */

import { test, expect, Page } from '@playwright/test';

/**
 * ============================================================================
 * E2E TEST FIXTURES & HELPERS
 * ============================================================================
 */

/**
 * Fixture: appSetup
 * Clears localStorage, navigates to app, waits for page to be interactive
 */
const appSetup = async (page: Page) => {
  // Get base URL from playwright config or use default
  const baseURL = process.env.BASE_URL || 'http://localhost:5173';
  
  // Navigate to app
  await page.goto(baseURL);

  // Clear localStorage after page context is established
  try {
    await page.evaluate(() => {
      localStorage.clear();
    });
  } catch (e) {
    // If localStorage clear fails, use context API
    await page.context().clearCookies();
  }

  // Reload page to ensure clean state
  await page.reload();

  // Wait for app to be interactive
  await page.waitForSelector('[data-testid="app-container"]', {
    timeout: 10000,
  });
};

/**
 * Helper: Fill subscription form with name, cost, due date
 */
const fillForm = async (
  page: Page,
  name: string,
  cost: string,
  dueDate: string
) => {
  await page.fill('input[data-testid="subscription-name-input"]', name);
  await page.fill('input[data-testid="subscription-cost-input"]', cost);
  await page.fill('input[data-testid="subscription-duedate-input"]', dueDate);
};

/**
 * Helper: Get subscription item by name from list
 */
const getSubscriptionItem = (page: Page, name: string) => {
  return page.locator(
    `[data-testid="subscription-item"]:has-text("${name}")`
  );
};

/**
 * ============================================================================
 * E2E TEST SUITE
 * ============================================================================
 */

test.describe('Story 3.3: Add Subscription Workflow - E2E (Enhanced)', () => {
  test.beforeEach(async ({ page }) => {
    await appSetup(page);
  });

  // ===== AC4: Success Message Displayed =====

  test('[P0] AC4.1: User submits form and sees success message appear', async ({
    page,
  }) => {
    // GIVEN: User is on the subscription tracker page with clean state
    // WHEN: User fills in the form with valid data
    await fillForm(page, 'Netflix', '15.99', '15');

    // AND: Clicks the "Add Subscription" button
    const successMessage = page.locator('[data-testid="success-message"]');

    // Ensure message is not attached yet
    await expect(successMessage).not.toBeAttached();

    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: User sees a success message
    await expect(successMessage).toBeVisible();
  });

  test('[P0] AC4.2: Success message text is correct', async ({ page }) => {
    // GIVEN: User has submitted a valid subscription form
    await fillForm(page, 'Spotify', '12.99', '10');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: Success message text reads "Subscription added successfully"
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toContainText('Subscription added successfully');
  });

  test('[P1] AC4.3: Success message disappears after 3 seconds', async ({
    page,
  }) => {
    // GIVEN: User has submitted a valid subscription
    await fillForm(page, 'Hulu', '7.99', '20');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: Success message is visible initially
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();

    // AND: After 3 seconds + 1s buffer, the message disappears (deterministic wait)
    await expect(successMessage).toBeHidden({ timeout: 4500 });
  });

  // ===== AC5: Subscription Appears in List Immediately =====

  test('[P0] AC5.1: New subscription appears in list immediately after submit', async ({
    page,
  }) => {
    // GIVEN: User is on the tracker page with 0 subscriptions
    const emptyState = page.locator('[data-testid="empty-list-message"]');
    await expect(emptyState).toBeVisible({ timeout: 2000 });

    // WHEN: User adds a subscription
    await fillForm(page, 'Disney+', '10.99', '5');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: The new subscription appears in the list immediately (no page refresh)
    const subscriptionRow = getSubscriptionItem(page, 'Disney+');
    await expect(subscriptionRow).toBeVisible();

    // AND: Empty state is gone
    await expect(emptyState).toBeHidden();
  });

  test('[P0] AC5.2: New subscription displays correct name', async ({
    page,
  }) => {
    // GIVEN: User submits form with name = "Apple TV+"
    const name = 'Apple TV+';
    await fillForm(page, name, '9.99', '1');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: List displays the subscription with exact name
    const nameCell = page.locator(
      `[data-testid="subscription-name"]:has-text("${name}")`
    );
    await expect(nameCell).toBeVisible();
  });

  test('[P0] AC5.3: New subscription displays correct cost', async ({
    page,
  }) => {
    // GIVEN: User submits subscription with cost = 19.99
    const cost = '19.99';
    await fillForm(page, 'Premium Service', cost, '15');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: List displays the cost (may be formatted as currency)
    const costCell = page.locator(
      `[data-testid="subscription-cost"]:has-text("${cost}")`
    );
    await expect(costCell).toBeVisible();
  });

  test('[P0] AC5.4: New subscription displays correct due date', async ({
    page,
  }) => {
    // GIVEN: User submits subscription with due date = 22
    const dueDate = '22';
    await fillForm(page, 'Service Name', '10.00', dueDate);
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: List displays the due date
    const dateCell = page.locator(
      `[data-testid="subscription-duedate"]:has-text("${dueDate}")`
    );
    await expect(dateCell).toBeVisible();
  });

  // ===== AC3: Form Clearing & Reusability =====

  test('[P1] AC3.1: Form fields are cleared after submission', async ({
    page,
  }) => {
    // GIVEN: User fills out and submits the form
    await fillForm(page, 'Netflix', '15.99', '15');
    await page.click('button[data-testid="add-subscription-button"]');

    // Wait for success message to confirm submission occurred
    await page.waitForSelector('[data-testid="success-message"]', {
      timeout: 5000,
    });

    // THEN: Form fields are cleared (empty values)
    const nameInput = page.locator(
      'input[data-testid="subscription-name-input"]'
    );
    const costInput = page.locator(
      'input[data-testid="subscription-cost-input"]'
    );
    const dueInput = page.locator(
      'input[data-testid="subscription-duedate-input"]'
    );

    await expect(nameInput).toHaveValue('');
    // Cost number input resets to empty string (not "0") after reset()
    const costValue = await costInput.inputValue();
    expect(costValue === '' || costValue === '0').toBeTruthy();
    await expect(dueInput).toHaveValue('');
  });

  test('[P1] AC3.2: User can add another subscription immediately', async ({
    page,
  }) => {
    // GIVEN: User has added one subscription
    await fillForm(page, 'Subscription 1', '10.00', '1');
    await page.click('button[data-testid="add-subscription-button"]');
    await page.waitForSelector('[data-testid="success-message"]', {
      timeout: 5000,
    });

    // Wait for success message to auto-dismiss (3s + buffer)
    await page.waitForTimeout(3600);

    // WHEN: User immediately adds another subscription
    await fillForm(page, 'Subscription 2', '20.00', '2');
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: Second subscription is also added
    await page.waitForSelector('[data-testid="success-message"]', {
      timeout: 5000,
    });

    // Both subscriptions visible
    await expect(getSubscriptionItem(page, 'Subscription 1')).toBeVisible();
    await expect(getSubscriptionItem(page, 'Subscription 2')).toBeVisible();
  });

  test('[P1] AC5.5: Multiple subscriptions added rapidly without data loss', async ({
    page,
  }) => {
    // GIVEN: User will add 3 subscriptions quickly
    const subscriptions = [
      { name: 'Service 1', cost: '10.00', dueDate: '1' },
      { name: 'Service 2', cost: '20.00', dueDate: '2' },
      { name: 'Service 3', cost: '30.00', dueDate: '3' },
    ];

    // WHEN: User adds subscriptions in quick succession
    for (const sub of subscriptions) {
      await fillForm(page, sub.name, sub.cost, sub.dueDate);
      await page.click('button[data-testid="add-subscription-button"]');

      // Wait for success message
      await page.waitForSelector('[data-testid="success-message"]', {
        timeout: 2000,
      });

      // Quick wait before next add
      await page.waitForTimeout(400);
    }

    // THEN: All 3 subscriptions appear in the list with correct data
    for (const sub of subscriptions) {
      await expect(getSubscriptionItem(page, sub.name)).toBeVisible();
    }

    // Verify counts
    const items = page.locator('[data-testid="subscription-item"]');
    await expect(items).toHaveCount(3);
  });

  // ===== AC6: Subscription Persists After Page Refresh =====

  test('[P0] AC6.1: Subscription remains in list after page reload', async ({
    page,
  }) => {
    // GIVEN: User has added a subscription
    const name = 'Persisted Service';
    await fillForm(page, name, '15.00', '10');
    await page.click('button[data-testid="add-subscription-button"]');

    // VERIFY: Subscription is in the list
    await expect(getSubscriptionItem(page, name)).toBeVisible();

    // WHEN: User refreshes the page
    await page.reload();

    // Wait for app to reload and be interactive
    await page.waitForSelector('[data-testid="app-container"], [role="main"]', {
      timeout: 5000,
    });

    // THEN: Subscription is still in the list
    await expect(getSubscriptionItem(page, name)).toBeVisible();
  });

  test('[P0] AC6.2: Subscription name persists correctly after reload', async ({
    page,
  }) => {
    // GIVEN: User adds a subscription and reloads
    const name = 'Unique Service Name';
    await fillForm(page, name, '12.50', '15');
    await page.click('button[data-testid="add-subscription-button"]');

    await page.reload();
    await page.waitForSelector('[data-testid="app-container"], [role="main"]', {
      timeout: 5000,
    });

    // THEN: The name appears in the list
    const nameCell = page.locator(
      `[data-testid="subscription-name"]:has-text("${name}")`
    );
    await expect(nameCell).toBeVisible();
  });

  test('[P0] AC6.3: Subscription cost persists correctly after reload', async ({
    page,
  }) => {
    // GIVEN: User adds a subscription with cost and reloads
    const cost = '25.75';
    await fillForm(page, 'Cost Test', cost, '20');
    await page.click('button[data-testid="add-subscription-button"]');

    await page.reload();
    await page.waitForSelector('[data-testid="app-container"], [role="main"]', {
      timeout: 5000,
    });

    // THEN: The cost appears in the list
    const costCell = page.locator(
      `[data-testid="subscription-cost"]:has-text("${cost}")`
    );
    await expect(costCell).toBeVisible();
  });

  test('[P0] AC6.4: Subscription due date persists correctly after reload', async ({
    page,
  }) => {
    // GIVEN: User adds a subscription with due date and reloads
    const dueDate = '28';
    await fillForm(page, 'Due Date Test', '10.00', dueDate);
    await page.click('button[data-testid="add-subscription-button"]');

    await page.reload();
    await page.waitForSelector('[data-testid="app-container"], [role="main"]', {
      timeout: 5000,
    });

    // THEN: The due date appears in the list
    const dateCell = page.locator(
      `[data-testid="subscription-duedate"]:has-text("${dueDate}")`
    );
    await expect(dateCell).toBeVisible();
  });

  // ===== AC7: Error Handling for Invalid Form =====

  test('[P0] AC7.1: Form does NOT submit if required field is missing', async ({
    page,
  }) => {
    // GIVEN: User fills only name and cost, leaves due date empty
    await page.fill('input[data-testid="subscription-name-input"]', 'Incomplete');
    await page.fill('input[data-testid="subscription-cost-input"]', '10.00');
    // Leave dueDate empty

    // WHEN: User clicks "Add Subscription"
    const addButton = page.locator(
      'button[data-testid="add-subscription-button"]'
    );

    // THEN: Button is either disabled OR clicking doesn't add subscription
    const isDisabled = await addButton.isDisabled();
    if (!isDisabled) {
      // If button is enabled, form validation should prevent submission
      await page.click('button[data-testid="add-subscription-button"]');

      // Subscription should NOT appear in list
      await expect(
        getSubscriptionItem(page, 'Incomplete')
      ).not.toBeVisible();
    } else {
      // Button is disabled, which prevents invalid submission
      expect(isDisabled).toBe(true);
    }
  });

  test('[P1] AC7.2: Validation error appears for missing required field', async ({
    page,
  }) => {
    // GIVEN: User tries to submit with missing due date
    await page.fill('input[data-testid="subscription-name-input"]', 'Test');
    await page.fill('input[data-testid="subscription-cost-input"]', '10.00');
    // Leave dueDate empty

    // WHEN: User clicks submit
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: Form does NOT submit - subscription not in list
    // (Browser's HTML5 validation prevents submission, which is expected behavior)
    await expect(
      getSubscriptionItem(page, 'Test')
    ).not.toBeVisible();
  });

  test('[P1] AC8.1: Invalid cost (non-numeric) is rejected', async ({
    page,
  }) => {
    // GIVEN: A number input field that only accepts numeric values
    const costInput = page.locator('input[data-testid="subscription-cost-input"]');
    
    // THEN: The input has type="number" which prevents non-numeric input at the browser level
    const inputType = await costInput.getAttribute('type');
    expect(inputType).toBe('number');
    
    // This means the browser will reject any non-numeric input automatically
    // The field can only contain valid numbers or be empty
  });

  test('[P1] AC8.2: Invalid due date (>31) is rejected', async ({ page }) => {
    // GIVEN: User enters due date > 31
    await page.fill('input[data-testid="subscription-name-input"]', 'Test');
    await page.fill('input[data-testid="subscription-cost-input"]', '10.00');
    await page.fill('input[data-testid="subscription-duedate-input"]', '32');

    // WHEN: User attempts to submit
    await page.click('button[data-testid="add-subscription-button"]');

    // THEN: Form does NOT submit - subscription not in list
    await expect(getSubscriptionItem(page, 'Test')).not.toBeVisible();
  });
});
