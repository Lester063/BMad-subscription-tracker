import { test as base, expect } from '@playwright/test';
import { BrowserHelper } from '../helpers/browser';
import { TestData } from '../helpers/test-data';
import { Selectors } from '../helpers/selectors';
import { Navigation } from '../helpers/navigation';

/**
 * Extended test fixture combining all utilities
 *
 * Usage:
 * test('should add subscription', async ({ page, testData, selectors, nav, browser }) => {
 *   await nav.goto('/');
 *   await page.fill(selectors.form.nameInput, testData.subscription().name);
 * });
 */
export const test = base.extend<{
  testData: TestData;
  selectors: Selectors;
  nav: Navigation;
  browser: BrowserHelper;
}>({
  testData: async ({}, use: any) => {
    const data = new TestData();
    await use(data);
    // Cleanup after test if needed
  },

  selectors: async ({}, use: any) => {
    const selectors = new Selectors();
    await use(selectors);
  },

  nav: async ({ page }: any, use: any) => {
    const navigation = new Navigation(page);
    await use(navigation);
  },

  browser: async ({}, use: any) => {
    // Note: browser helper doesn't need page directly
    // If page is needed, it should be passed in method calls
    const helper = { /* Placeholder - can be extended */ };
    await use(helper);
  },
});

export { expect };
