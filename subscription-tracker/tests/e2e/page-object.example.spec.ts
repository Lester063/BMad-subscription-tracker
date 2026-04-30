import { test, expect } from '../support/fixtures/index';

/**
 * Example Page Object Pattern
 *
 * This demonstrates how to organize selectors and actions
 * into reusable, maintainable components
 */

class SubscriptionPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async addSubscription(data: { name: string; type: string; cost: string }) {
    await this.page.fill('[data-testid="subscription-name"]', data.name);
    await this.page.selectOption('[data-testid="subscription-type"]', data.type);
    await this.page.fill('[data-testid="subscription-cost"]', data.cost);
    await this.page.click('[data-testid="submit-button"]');
    await this.page.waitForSelector('[data-testid="subscription-item"]');
  }

  async getSubscriptionCount() {
    return this.page.locator('[data-testid="subscription-item"]').count();
  }

  async getTotalCost() {
    return this.page.textContent('[data-testid="total-cost"]');
  }

  async deleteSubscription(index = 0) {
    const deleteButtons = this.page.locator('[data-testid^="delete-subscription-"]');
    await deleteButtons.nth(index).click();
  }
}

test.describe('Subscription Page Object Example', () => {
  test('should work with page object pattern', async ({ page, testData }) => {
    const subscriptionPage = new SubscriptionPage(page);
    const formData = testData.subscriptionFormData();

    // Use page object for cleaner test code
    await subscriptionPage.goto();
    await subscriptionPage.addSubscription({
      name: formData.name,
      type: 'software',
      cost: formData.cost,
    });

    const count = await subscriptionPage.getSubscriptionCount();
    expect(count).toBeGreaterThan(0);
  });
});
