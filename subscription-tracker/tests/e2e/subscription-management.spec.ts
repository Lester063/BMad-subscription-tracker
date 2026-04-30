import { test, expect } from '../support/fixtures/index';

/**
 * Example Test Suite: Subscription Management
 *
 * Demonstrates:
 * - Fixture composition (testData, selectors, nav, browser)
 * - Given/When/Then structure
 * - data-testid selector strategy
 * - localStorage observation
 * - Factory-based test data
 */

test.describe('Subscription Management', () => {
  test.beforeEach(async ({ page, browser }) => {
    // Clear localStorage before each test
    await browser.clearLocalStorage();
  });

  test('should display empty state when no subscriptions exist', async ({
    page,
    nav,
    browser,
  }) => {
    // Given: User navigates to home page
    await nav.toHome();

    // When: Page loads
    // Then: Empty state message is visible
    const listContainer = page.locator('[data-testid="subscription-list"]');
    await expect(listContainer).toContainText(/no subscriptions|empty/i);
  });

  test('should add a new subscription', async ({ page, testData, selectors, nav, browser }) => {
    // Given: User navigates to home page
    await nav.toHome();
    const formData = testData.subscriptionFormData({
      name: 'Netflix Premium',
      cost: '19.99',
    });

    // When: User fills form and submits
    await page.fill(selectors.form.nameInput, formData.name);
    await page.selectOption(selectors.form.typeSelect, 'streaming');
    await page.fill(selectors.form.costInput, formData.cost);
    await page.selectOption(selectors.form.billingCycleSelect, 'monthly');
    await page.click(selectors.form.submitButton);

    // Then: Subscription appears in list
    await page.waitForSelector('[data-testid="subscription-item"]');
    const listItem = page.locator('[data-testid="subscription-item"]').first();
    await expect(listItem).toContainText('Netflix Premium');
    await expect(listItem).toContainText('19.99');

    // And: Subscription is persisted in localStorage
    const stored = await browser.waitForLocalStorageKey('subscriptions');
    expect(stored).toContain('Netflix Premium');
  });

  test('should display total cost correctly', async ({ page, testData, selectors, nav }) => {
    // Given: Multiple subscriptions are stored in localStorage
    const subscriptions = testData.subscriptions(2, undefined);
    const storageValue = JSON.stringify(subscriptions);
    await page.evaluate((value) => localStorage.setItem('subscriptions', value), storageValue);

    // When: User navigates to home
    await nav.toHome();
    await page.waitForSelector(selectors.costSummary.totalCost);

    // Then: Total cost is calculated correctly
    const expectedTotal = subscriptions.reduce((sum: number, sub: any) => sum + sub.cost, 0);
    const totalElement = page.locator(selectors.costSummary.totalCost);
    const totalText = await totalElement.textContent();
    expect(totalText).toContain(expectedTotal.toFixed(2));
  });

  test('should load subscriptions from localStorage on app start', async ({
    page,
    browser,
    nav,
    testData,
    selectors,
  }) => {
    // Given: Subscriptions are already stored in localStorage
    const existingSubscription = testData.subscription({ name: 'Spotify' });
    const storageValue = JSON.stringify([existingSubscription]);

    await page.evaluate((value) => localStorage.setItem('subscriptions', value), storageValue);

    // When: App loads
    await nav.toHome();
    await page.waitForSelector('[data-testid="subscription-item"]');

    // Then: Stored subscription is displayed
    const listItem = page.locator('[data-testid="subscription-item"]').first();
    await expect(listItem).toContainText('Spotify');
  });

  test('should handle form validation errors', async ({ page, testData, selectors, nav }) => {
    // Given: User navigates to form
    await nav.toHome();

    // When: User submits form without required fields
    await page.click(selectors.form.submitButton);

    // Then: Validation errors appear
    const nameError = page.locator(selectors.messages.validationError('name'));
    await expect(nameError).toBeVisible();
  });

  test('should maintain state across page refresh', async ({
    page,
    testData,
    selectors,
    nav,
    browser,
  }) => {
    // Given: User adds a subscription
    await nav.toHome();
    const formData = testData.subscriptionFormData({
      name: 'HBO Max',
    });
    await page.fill(selectors.form.nameInput, formData.name);
    await page.click(selectors.form.submitButton);
    await page.waitForSelector('[data-testid="subscription-item"]');

    // When: Page is refreshed
    await page.reload();

    // Then: Subscription still appears after reload
    await page.waitForSelector('[data-testid="subscription-item"]');
    const listItem = page.locator('[data-testid="subscription-item"]').first();
    await expect(listItem).toContainText('HBO Max');
  });
});
