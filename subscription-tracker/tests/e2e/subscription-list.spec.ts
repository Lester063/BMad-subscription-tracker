// filepath: tests/e2e/subscription-list.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SubscriptionList Display (ATDD - Story 3.2)', () => {
  
  test('[P0] should display empty state when no subscriptions exist', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Verify empty state message is visible
    await expect(page.getByText('No subscriptions yet.')).toBeVisible();
    
    // Verify no list container renders when empty
    const listContainer = page.locator('ul');
    const count = await listContainer.count();
    expect(count).toBe(0);
  });
  
  test('[P0] should display subscription name in list', async ({ page }) => {
    // Setup: Add subscription via localStorage (data factory)
    await page.addInitScript(() => {
      window.localStorage.setItem('subscriptions', JSON.stringify([
        {
          id: 'test-sub-1',
          name: 'Netflix',
          cost: 15.99,
          dueDate: 15,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]));
    });
    
    // Navigate to the application
    await page.goto('/');
    
    // Verify subscription name appears in the list
    await expect(page.getByText('Netflix')).toBeVisible();
  });
  
  test('[P0] should display subscription cost in currency format', async ({ page }) => {
    // Setup: Add subscription with known cost
    await page.addInitScript(() => {
      window.localStorage.setItem('subscriptions', JSON.stringify([
        {
          id: 'test-sub-2',
          name: 'Spotify',
          cost: 9.99,
          dueDate: 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]));
    });
    
    await page.goto('/');
    
    // Verify cost is formatted as currency (e.g., $9.99)
    await expect(page.getByText('$9.99')).toBeVisible();
  });
  
  test('[P0] should display due date with proper formatting', async ({ page }) => {
    // Setup: Add subscription with known due date
    await page.addInitScript(() => {
      window.localStorage.setItem('subscriptions', JSON.stringify([
        {
          id: 'test-sub-3',
          name: 'Disney+',
          cost: 13.99,
          dueDate: 15,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]));
    });
    
    await page.goto('/');
    
    // Verify due date displays with ordinal (e.g., "Due: 15th")
    await expect(page.getByText(/Due: 15/)).toBeVisible();
  });
  
  test('[P1] should display edit button on each row', async ({ page }) => {
    // Setup: Add a subscription
    await page.addInitScript(() => {
      window.localStorage.setItem('subscriptions', JSON.stringify([
        {
          id: 'test-sub-4',
          name: 'HBO Max',
          cost: 15.99,
          dueDate: 20,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]));
    });
    
    await page.goto('/');
    
    // Verify edit button is visible
    await expect(page.getByRole('button', { name: /Edit/i })).toBeVisible();
  });
  
  test('[P1] should display delete button on each row', async ({ page }) => {
    // Setup: Add a subscription
    await page.addInitScript(() => {
      window.localStorage.setItem('subscriptions', JSON.stringify([
        {
          id: 'test-sub-5',
          name: 'Amazon Prime',
          cost: 14.99,
          dueDate: 25,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]));
    });
    
    await page.goto('/');
    
    // Verify delete button is visible
    await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
  });
  
  test('[P0] should render 100+ subscriptions within 100ms', async ({ page }) => {
    // Setup: Seed 100+ subscriptions
    const subscriptions = Array.from({ length: 100 }, (_, i) => ({
      id: `test-sub-${i}`,
      name: `Subscription ${i + 1}`,
      cost: 9.99 + (i * 0.01),
      dueDate: (i % 31) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    
    await page.addInitScript((subs) => {
      window.localStorage.setItem('subscriptions', JSON.stringify(subs));
    }, subscriptions);
    
    await page.goto('/');
    
    // Measure render time
    const startTime = Date.now();
    
    // Verify list renders all items
    const rows = page.locator('li');
    await expect(rows).toHaveCount(100);
    
    const renderTime = Date.now() - startTime;
    
    // Performance requirement: render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});