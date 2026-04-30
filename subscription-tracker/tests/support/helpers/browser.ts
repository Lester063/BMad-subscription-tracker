import { Page } from '@playwright/test';

/**
 * Browser helper utilities for common operations
 */
export class BrowserHelper {
  constructor(private page: Page) {}

  /**
   * Wait for a specific element to be visible
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string) {
    return this.page.textContent(selector);
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string) {
    return !!(await this.page.$(selector));
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  /**
   * Get all console messages during test
   */
  async captureConsole() {
    const logs: string[] = [];
    this.page.on('console', (msg) => logs.push(msg.text()));
    return logs;
  }

  /**
   * Wait for localStorage to be updated with a key
   */
  async waitForLocalStorageKey(key: string, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const value = await this.page.evaluate((k) => localStorage.getItem(k), key);
      if (value) return value;
      await this.page.waitForTimeout(100);
    }
    throw new Error(`localStorage key "${key}" not found within ${timeout}ms`);
  }

  /**
   * Clear all localStorage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
