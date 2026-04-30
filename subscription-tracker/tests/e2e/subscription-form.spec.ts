/**
 * ATDD Red-Phase Tests: SubscriptionForm Component
 * 
 * These tests are written BEFORE implementation.
 * They MUST FAIL until the SubscriptionForm component is created.
 * 
 * Story: 3-1-create-subscriptionform-component-with-react-hook-form
 * Phase: RED (pre-implementation)
 * Focus: User-behavior scenarios
 */

import { test, expect } from '@playwright/test';

test.describe('SubscriptionForm Component', () => {
  
  // Helper to navigate to the app
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ============================================
  // Group 1: Form Field Interaction
  // ============================================

  test('UBS-3.1.1: should allow user to enter subscription name in name field', async ({ page }) => {
    const nameInput = page.getByLabel('Subscription Name');
    await nameInput.fill('Netflix');
    await expect(nameInput).toHaveValue('Netflix');
  });

  test('UBS-3.1.2: should allow user to enter monthly cost in cost field', async ({ page }) => {
    const costInput = page.getByLabel('Monthly Cost ($)');
    await costInput.fill('15.99');
    await expect(costInput).toHaveValue('15.99');
  });

  test('UBS-3.1.3: should allow user to enter due date (day of month) in due date field', async ({ page }) => {
    const dueDateInput = page.getByLabel('Due Date (Day of Month, 1-31)');
    await dueDateInput.fill('15');
    await expect(dueDateInput).toHaveValue('15');
  });

  test('UBS-3.1.4: should display placeholder text in name field', async ({ page }) => {
    const nameInput = page.getByLabel('Subscription Name');
    await expect(nameInput).toHaveAttribute('placeholder', 'e.g., Netflix');
  });

  test('UBS-3.1.5: should clear all fields when user clicks Clear button', async ({ page }) => {
    // Fill in all fields
    await page.getByLabel('Subscription Name').fill('Netflix');
    await page.getByLabel('Monthly Cost ($)').fill('15.99');
    await page.getByLabel('Due Date (Day of Month, 1-31)').fill('15');
    
    // Click the Clear button
    await page.getByRole('button', { name: 'Clear' }).click();
    
    // Verify all fields are cleared
    await expect(page.getByLabel('Subscription Name')).toHaveValue('');
    await expect(page.getByLabel('Monthly Cost ($)')).toHaveValue('0');
    await expect(page.getByLabel('Due Date (Day of Month, 1-31)')).toHaveValue('');
  });

  // ============================================
  // Group 2: Form Submission
  // ============================================

  test('UBS-3.1.6: should submit form when user clicks Add Subscription button', async ({ page }) => {
    // Fill in the form
    await page.getByLabel('Subscription Name').fill('Netflix');
    await page.getByLabel('Monthly Cost ($)').fill('15.99');
    await page.getByLabel('Due Date (Day of Month, 1-31)').fill('15');
    
    // Click submit button - this will fail until onSubmit is implemented
    await page.getByRole('button', { name: 'Add Subscription' }).click();
    
    // Verify form was submitted (subscription appears in list)
    await expect(page.getByText('Netflix')).toBeVisible();
  });

  test('UBS-3.1.7: should not show errors when submitting with valid data', async ({ page }) => {
    // Fill in valid data
    await page.getByLabel('Subscription Name').fill('Netflix');
    await page.getByLabel('Monthly Cost ($)').fill('15.99');
    await page.getByLabel('Due Date (Day of Month, 1-31)').fill('15');
    
    // Submit the form
    await page.getByRole('button', { name: 'Add Subscription' }).click();
    
    // No error messages should appear
    const errorAlert = page.locator('[role="alert"], .error, [aria-live="assertive"]');
    await expect(errorAlert).toHaveCount(0);
  });

  test('UBS-3.1.8: should allow keyboard navigation between fields using Tab', async ({ page }) => {
    // Start at first field
    const nameInput = page.getByLabel('Subscription Name');
    await nameInput.focus();
    
    // Press Tab to move to next field
    await page.keyboard.press('Tab');
    
    // Cost field should now be focused
    const costInput = page.getByLabel('Monthly Cost ($)');
    await expect(costInput).toBeFocused();
    
    // Press Tab again
    await page.keyboard.press('Tab');
    
    // Due date field should now be focused
    const dueDateInput = page.getByLabel('Due Date (Day of Month, 1-31)');
    await expect(dueDateInput).toBeFocused();
  });

  test('UBS-3.1.9: should submit form when user presses Enter on last field', async ({ page }) => {
    // Fill in the form
    await page.getByLabel('Subscription Name').fill('Netflix');
    await page.getByLabel('Monthly Cost ($)').fill('15.99');
    const dueDateInput = page.getByLabel('Due Date (Day of Month, 1-31)');
    await dueDateInput.fill('15');
    
    // Press Enter to submit
    await dueDateInput.press('Enter');
    
    // Form should be submitted
    await expect(page.getByText('Netflix')).toBeVisible();
  });

  // ============================================
  // Group 3: Accessibility & Usability
  // ============================================

  test('UBS-3.1.10: should display label for name field', async ({ page }) => {
    await expect(page.getByText('Subscription Name')).toBeVisible();
  });

  test('UBS-3.1.11: should allow focus on name field using keyboard', async ({ page }) => {
    // Press Tab to focus first field
    await page.keyboard.press('Tab');
    
    // Name field should be focused
    await expect(page.getByLabel('Subscription Name')).toBeFocused();
  });

  test('UBS-3.1.12: should show visual focus indicator on focused elements', async ({ page }) => {
    const nameInput = page.getByLabel('Subscription Name');
    await nameInput.focus();
    
    // Focus indicator should be visible
    const outlineStyle = await nameInput.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    expect(outlineStyle).not.toBe('none');
  });

  test('UBS-3.1.13: should have proper label association for screen reader', async ({ page }) => {
    const nameInput = page.getByLabel('Subscription Name');
    
    // Input should have associated label
    await expect(nameInput).toBeAttached();
  });

  // ============================================
  // Group 4: Form Display
  // ============================================

  test('UBS-3.1.14: should display three input fields when form renders', async ({ page }) => {
    // All three fields should be visible
    await expect(page.getByLabel('Subscription Name')).toBeVisible();
    await expect(page.getByLabel('Monthly Cost ($)')).toBeVisible();
    await expect(page.getByLabel('Due Date (Day of Month, 1-31)')).toBeVisible();
  });

  test('UBS-3.1.15: should display Add Subscription submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Subscription' })).toBeVisible();
  });

  test('UBS-3.1.16: should display Clear reset button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  test('UBS-3.1.17: should display form with proper layout', async ({ page }) => {
    // Form should be visible
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Form should have proper display
    await expect(form).toHaveCSS('display', /flex|block/);
  });
});