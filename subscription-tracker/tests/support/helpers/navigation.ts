import { Page } from '@playwright/test';

/**
 * Navigation helper for consistent route handling
 */
export class Navigation {
  constructor(private page: Page) {}

  /**
   * Navigate to home page
   */
  async goto(path = '/') {
    await this.page.goto(path);
    // Wait for app to stabilize
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Go to subscriptions page
   */
  async toHome() {
    await this.goto('/');
  }

  /**
   * Get current URL path
   */
  async currentPath() {
    return this.page.url();
  }

  /**
   * Wait for URL to contain a string
   */
  async waitForUrl(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern);
  }
}
