/**
 * Story 11.6 — ATDD Red-Phase E2E Tests
 * 
 * Acceptance Test-Driven Development (ATDD) for Dashboard integration.
 * 
 * These tests are written BEFORE implementation (RED PHASE).
 * They define the expected behavior and will fail until the Dashboard
 * component is implemented and wired correctly.
 * 
 * Test Scenarios:
 * - P0-001: SearchBar renders in Dashboard
 * - P0-002: CostRangeFilter renders in Dashboard
 * - P0-003: Search filtering works (real-time dispatch → filtered results)
 * - P0-004: Cost range filtering works (real-time dispatch → filtered results)
 * - P0-005: Combined filters (AND logic) work correctly
 * 
 * @file tests/e2e/story-11-6-dashboard-integration.spec.ts
 * @implements Story 11.6 Acceptance Criteria
 */

import { test, expect, Page } from '@playwright/test';

/**
 * ============================================================================
 * SETUP & FIXTURES
 * ============================================================================
 */

/**
 * Add multiple test subscriptions via localStorage (factory pattern)
 * Sets up consistent test data for all scenarios
 */
async function seedSubscriptions(page: Page, subscriptions: any[]) {
  await page.addInitScript(
    (subs) => {
      window.localStorage.setItem('subscriptions', JSON.stringify(subs));
    },
    subscriptions
  );
}

/**
 * Standard test data: 5 subscriptions with varying costs and names
 */
const TEST_SUBSCRIPTIONS = [
  {
    id: 'sub-netflix',
    name: 'Netflix',
    cost: 15.99,
    dueDate: 15,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sub-hulu',
    name: 'Hulu',
    cost: 7.99,
    dueDate: 20,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sub-disney',
    name: 'Disney+',
    cost: 10.99,
    dueDate: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sub-streaming-bundle',
    name: 'Streaming Bundle',
    cost: 29.99,
    dueDate: 10,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Premium',
    cost: 12.99,
    dueDate: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * ============================================================================
 * P0 CRITICAL TESTS (Red Phase - Failing until implementation)
 * ============================================================================
 */

test.describe('Story 11.6 — P0: Dashboard Integration (RED PHASE)', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data and navigate to app
    await seedSubscriptions(page, TEST_SUBSCRIPTIONS);
    await page.goto('/');
  });

  /**
   * ============================================================================
   * P0-001: SearchBar Renders in Dashboard Layout
   * ============================================================================
   * 
   * AC1 from Test Design: SearchBar component renders in Dashboard layout
   * 
   * EXPECTED BEHAVIOR:
   * - Dashboard component exists
   * - SearchBar is present in Dashboard JSX
   * - SearchBar input has correct attributes (placeholder, data-testid)
   * - CSS classes applied correctly
   * 
   * RED PHASE: This test fails because Dashboard component not yet implemented
   */
  test('[P0-001] SearchBar renders in Dashboard layout', async ({ page }) => {
    // The app should have a main layout/dashboard component
    const dashboard = page.locator('[data-testid="dashboard"]');
    await expect(dashboard).toBeVisible();

    // SearchBar component should be present
    const searchBar = page.locator('[data-testid="search-bar"]');
    await expect(searchBar).toBeVisible();

    // SearchBar should have input field
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);

    // Verify CSS class for styling
    await expect(searchBar).toHaveClass(/searchBar/);
  });

  /**
   * ============================================================================
   * P0-002: CostRangeFilter Renders in Dashboard Layout
   * ============================================================================
   * 
   * AC2 from Test Design: CostRangeFilter component renders in Dashboard layout
   * 
   * EXPECTED BEHAVIOR:
   * - Dashboard component exists
   * - CostRangeFilter is present in Dashboard
   * - Min and Max cost inputs are visible
   * - CSS classes applied correctly
   * 
   * RED PHASE: This test fails because Dashboard component not yet implemented
   */
  test('[P0-002] CostRangeFilter renders in Dashboard layout', async ({ page }) => {
    // Dashboard should exist
    const dashboard = page.locator('[data-testid="dashboard"]');
    await expect(dashboard).toBeVisible();

    // CostRangeFilter component should be present
    const costFilter = page.locator('[data-testid="cost-range-filter"]');
    await expect(costFilter).toBeVisible();

    // Min cost input should exist
    const minInput = page.locator('input[placeholder*="$0"]');
    await expect(minInput).toBeVisible();

    // Max cost input should exist
    const maxInput = page.locator('input[placeholder*="$100"]');
    await expect(maxInput).toBeVisible();

    // Verify CSS class for styling
    await expect(costFilter).toHaveClass(/costRangeFilter/);
  });

  /**
   * ============================================================================
   * P0-003: Search Filtering Works (Real-Time Dispatch → Filtered Results)
   * ============================================================================
   * 
   * AC3 from Test Design: Search input dispatch → context update → filtered
   * results (real-time)
   * 
   * SCENARIO:
   * 1. Add 3 subscriptions (Netflix, Hulu, Disney)
   * 2. Type "netflix" in SearchBar
   * 3. SubscriptionList should show ONLY Netflix
   * 4. Total time < 100ms (state coordination cycle)
   * 
   * EXPECTED BEHAVIOR:
   * - SearchBar onChange dispatches setSearchTerm('netflix') to context
   * - useFilteredSubscriptions hook recomputes (memoized)
   * - SubscriptionList receives filtered array
   * - Only Netflix row visible
   * - Hulu and Disney rows hidden/removed from DOM
   * 
   * RED PHASE: This test fails because Dashboard not wiring filters correctly
   */
  test('[P0-003] Search filtering works (real-time)', async ({ page }) => {
    // Verify initial state: all 3 subscriptions visible
    let rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(5); // All 5 test subscriptions visible

    // Type "netflix" in search input (triggers onChange → dispatch)
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.focus();
    await searchInput.fill('netflix');

    // Wait for filtered results (< 100ms expected)
    // After typing, SubscriptionList should re-render with only Netflix
    rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(1, { timeout: 5000 });

    // Verify the row is Netflix
    const netflixRow = page.locator('text=Netflix');
    await expect(netflixRow).toBeVisible();

    // Verify Hulu is NOT visible
    const huluRow = page.locator('text=Hulu');
    await expect(huluRow).not.toBeVisible();

    // Verify Disney is NOT visible
    const disneyRow = page.locator('text=Disney');
    await expect(disneyRow).not.toBeVisible();
  });

  /**
   * ============================================================================
   * P0-004: Cost Range Filtering Works (Real-Time Dispatch → Filtered Results)
   * ============================================================================
   * 
   * AC4 from Test Design: Cost filter dispatch → context update → filtered
   * results (real-time)
   * 
   * SCENARIO:
   * 1. Set cost range Min: $5, Max: $15
   * 2. SubscriptionList should show only subscriptions in that range
   * 3. Subscriptions with cost < $5 or > $15 should be hidden
   * 
   * EXPECTED BEHAVIOR:
   * - CostRangeFilter onChange dispatches setCostRangeMin(5) & setCostRangeMax(15)
   * - useFilteredSubscriptions hook recomputes
   * - Only matching subscriptions visible:
   *   - Netflix ($15.99) ❌ (exceeds max)
   *   - Hulu ($7.99) ✅
   *   - Disney+ ($10.99) ✅
   *   - Spotify Premium ($12.99) ✅
   *   - Streaming Bundle ($29.99) ❌ (exceeds max)
   * - Result: 3 subscriptions visible
   * 
   * RED PHASE: This test fails because Dashboard not wiring cost filter correctly
   */
  test('[P0-004] Cost range filtering works (real-time)', async ({ page }) => {
    // Initial state: all subscriptions visible
    let rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(5);

    // Set cost range: Min $5, Max $15
    const minInput = page.locator('input[placeholder*="$0"]').first();
    const maxInput = page.locator('input[placeholder*="$100"]').first();

    await minInput.fill('5');
    await maxInput.fill('15');

    // Wait for filter to apply
    // Should show: Hulu ($7.99), Disney+ ($10.99), Spotify ($12.99) = 3 subscriptions
    rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(3, { timeout: 5000 });

    // Verify correct subscriptions are visible
    await expect(page.locator('text=Hulu')).toBeVisible();
    await expect(page.locator('text=Disney')).toBeVisible();
    await expect(page.locator('text=Spotify')).toBeVisible();

    // Verify others are hidden
    await expect(page.locator('text=Netflix')).not.toBeVisible();
    await expect(page.locator('text=Streaming Bundle')).not.toBeVisible();
  });

  /**
   * ============================================================================
   * P0-005: Combined Filters (Search AND Cost) Work Correctly (AND Logic)
   * ============================================================================
   * 
   * AC5 from Test Design: Combined filters (search AND cost) filter correctly
   * 
   * SCENARIO:
   * 1. Search for "streaming" + set cost range $5-$15
   * 2. Only subscriptions matching BOTH criteria should be visible
   * 
   * LOGIC:
   * - Name matches "streaming": ✅ "Streaming Bundle"
   * - Cost $5-$15: ❌ "Streaming Bundle" is $29.99 (outside range)
   * - Combined AND result: NO subscriptions should match
   * 
   * Verification:
   * - Search for "streaming" AND cost range $5-$15
   * - Result: 0 subscriptions (empty state)
   * - Message: "No subscriptions match your filters" (not "No subscriptions yet")
   * 
   * RED PHASE: This test fails because (1) filters may not combine with AND logic,
   * or (2) empty state messaging not implemented
   */
  test('[P0-005] Combined filters (search AND cost) work with AND logic', async ({
    page,
  }) => {
    // Apply search filter: "streaming"
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.focus();
    await searchInput.fill('streaming');

    // Verify intermediate state: 1 subscription (Streaming Bundle)
    let rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(1);

    // Now apply cost filter: Min $5, Max $15
    const minInput = page.locator('input[placeholder*="$0"]').first();
    const maxInput = page.locator('input[placeholder*="$100"]').first();
    await minInput.fill('5');
    await maxInput.fill('15');

    // Wait for combined filter to apply
    // Streaming Bundle ($29.99) is outside range → 0 results
    rows = page.locator('[data-testid="subscription-item"]');
    await expect(rows).toHaveCount(0, { timeout: 5000 });

    // Verify correct empty state message
    // Should show "No subscriptions match your filters" (not "No subscriptions yet")
    const emptyMessage = page.locator('text=/no.*subscriptions.*match.*your.*filters/i');
    await expect(emptyMessage).toBeVisible();
  });
});

/**
 * ============================================================================
 * IMPLEMENTATION CHECKLIST FOR DEV
 * ============================================================================
 * 
 * [ ] 1. Create Dashboard.tsx component (or update App.tsx layout)
 *        - Add [data-testid="dashboard"] to root element
 * 
 * [ ] 2. Import and render SearchBar component
 *        - Pass onSearchChange handler (dispatches setSearchTerm)
 *        - Add [data-testid="search-bar"] to SearchBar
 * 
 * [ ] 3. Import and render CostRangeFilter component
 *        - Pass onFilterChange handler (dispatches setCostRangeMin/Max)
 *        - Add [data-testid="cost-range-filter"] to CostRangeFilter
 * 
 * [ ] 4. Import useFilteredSubscriptions hook
 *        - Call hook to get filtered subscriptions
 *        - Pass filtered array to SubscriptionList
 * 
 * [ ] 5. Update SubscriptionList to receive filtered data
 *        - Show "No subscriptions match your filters" when filters active + 0 results
 *        - Keep "No subscriptions yet" for 0 subscriptions with NO filters active
 * 
 * [ ] 6. Add data-testid attributes
 *        - [data-testid="dashboard"] on root
 *        - [data-testid="search-bar"] inherited from SearchBar
 *        - [data-testid="cost-range-filter"] inherited from CostRangeFilter
 *        - [data-testid="subscription-item"] on each row (already exists from Story 3-2)
 * 
 * [ ] 7. Run tests
 *        npm test -- story-11-6-dashboard-integration.spec.ts
 *        All 5 tests should FAIL initially (RED PHASE)
 * 
 * [ ] 8. Implement Dashboard component & wire filters
 *        Run tests again → PASS (GREEN PHASE)
 * 
 * ============================================================================
 */
