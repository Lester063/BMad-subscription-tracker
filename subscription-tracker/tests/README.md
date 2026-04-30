# E2E Testing Guide — Subscription Tracker

This directory contains end-to-end tests using **Playwright**, a modern browser automation framework optimized for testing complex web applications with excellent CI/CD integration.

---

## Table of Contents

1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Architecture](#architecture)
4. [Best Practices](#best-practices)
5. [CI/CD Integration](#cicd-integration)
6. [Knowledge Base](#knowledge-base)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites

- **Node.js:** 20.19+ (see `.nvmrc`)
- **npm:** 9.0+
- **Browser:** Chromium, Firefox, Safari (auto-installed by Playwright)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Key variables:**
- `BASE_URL`: Application URL for tests (default: `http://localhost:5173`)
- `TEST_ENV`: Environment context (local, staging, production)
- `CI`: Set to `true` in CI environments for deterministic settings

---

## Running Tests

### Local Development (Interactive)

```bash
# Run all tests with UI mode (recommended)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/subscription-management.spec.ts

# Run tests matching pattern
npx playwright test --grep "should add a new subscription"
```

### Headed Mode (See Browser)

```bash
# Run with browser visible (excellent for debugging)
npx playwright test --headed

# Single-threaded headed for easier debugging
npx playwright test --headed --workers=1
```

### Debug Mode

```bash
# Interactive Inspector: pause, step through, inspect elements
npm run test:e2e:debug

# Or with specific file
npx playwright test tests/e2e/subscription-management.spec.ts --debug
```

### CI Mode (Headless)

```bash
# Run in CI configuration (no parallelism, all retries)
CI=true npm run test:e2e
```

### View Report

```bash
# Generate and open HTML report
npm run test:e2e:report
```

---

## Architecture

### Directory Structure

```
tests/
├── e2e/
│   ├── subscription-management.spec.ts     # Main test suite
│   └── page-object.example.spec.ts         # Page object pattern example
├── support/
│   ├── fixtures/
│   │   └── index.ts                        # Composed fixtures
│   ├── helpers/
│   │   ├── browser.ts                      # Browser utilities
│   │   ├── test-data.ts                    # Test data factories
│   │   ├── selectors.ts                    # Centralized selectors
│   │   └── navigation.ts                   # Navigation helpers
│   └── page-objects/                       # Optional: Page Object classes
└── README.md                               # This file
```

### Fixture Composition

Tests use **composed fixtures** to avoid repetition and promote consistency:

```typescript
test('example', async ({ page, testData, selectors, nav, browser }) => {
  // testData:   Generate realistic test data with Faker
  // selectors:  Centralized data-testid selector map
  // nav:        Navigation helpers (goto, waitForUrl)
  // browser:    Browser utilities (waitForElement, localStorage)
});
```

### Test Data Factories

The `TestData` factory generates realistic, overridable data:

```typescript
// Single subscription
const sub = testData.subscription({ name: 'Netflix', cost: 19.99 });

// Multiple subscriptions
const subs = testData.subscriptions(5);

// Form input data
const formData = testData.subscriptionFormData();
```

### Selector Strategy

**Always use `data-testid` attributes** for resilience:

```typescript
// ✅ GOOD: Resilient to CSS/HTML refactoring
await page.fill('[data-testid="subscription-name"]', 'Netflix');

// ❌ AVOID: Brittle, breaks with style changes
await page.fill('form > div.name-field > input', 'Netflix');

// ✅ USE HELPERS: Even cleaner
await page.fill(selectors.form.nameInput, 'Netflix');
```

---

## Best Practices

### 1. Test Isolation

Each test must be independent:

```typescript
test.beforeEach(async ({ browser }) => {
  // Clear localStorage and state before each test
  await browser.clearLocalStorage();
});
```

### 2. Given/When/Then Structure

Make test intent clear:

```typescript
test('should add subscription', async ({ page, testData, selectors, nav }) => {
  // GIVEN: User navigates to home
  await nav.toHome();
  
  // WHEN: User fills form and submits
  const formData = testData.subscriptionFormData();
  await page.fill(selectors.form.nameInput, formData.name);
  await page.click(selectors.form.submitButton);
  
  // THEN: Subscription appears in list
  const listItem = page.locator('[data-testid="subscription-item"]').first();
  await expect(listItem).toContainText(formData.name);
});
```

### 3. Wait for Stability

Never use arbitrary `waitForTimeout()` — always wait for specific conditions:

```typescript
// ✅ GOOD: Wait for element to appear
await page.waitForSelector('[data-testid="subscription-item"]');
const count = await page.locator('[data-testid="subscription-item"]').count();

// ✅ GOOD: Wait for text content
await expect(page.locator('h1')).toContainText('Dashboard');

// ✅ GOOD: Wait for network to stabilize
await page.waitForLoadState('networkidle');

// ❌ AVOID: Brittle sleep
await page.waitForTimeout(5000); // Flaky!
```

### 4. localStorage Testing

Test data persistence patterns:

```typescript
// Seed localStorage before test
await page.evaluate((value) => {
  localStorage.setItem('subscriptions', value);
}, JSON.stringify(existingData));

// Verify changes persisted
const stored = await browser.waitForLocalStorageKey('subscriptions', 5000);
expect(stored).toContain('Netflix');
```

### 5. Error Handling

Validate error messages clearly:

```typescript
// Submit invalid form
await page.click(selectors.form.submitButton);

// Expect validation error
const errorMsg = page.locator(selectors.messages.validationError('name'));
await expect(errorMsg).toContainText('Name is required');
```

### 6. Multi-Browser Testing

Playwright tests run against Chrome, Firefox, and Safari by default:

```bash
# Run all browsers
npm run test:e2e

# Run specific browser
npx playwright test --project=firefox
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24.11.0'
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Determinism Checklist

For reliable CI tests:

- ✅ Always wait for elements/network instead of using timeouts
- ✅ Test in isolation (clear localStorage, cookies, indexedDB)
- ✅ Use `data-testid` attributes instead of brittle selectors
- ✅ Mock or intercept external APIs
- ✅ Set `fullyParallel: false` in CI if tests share resources
- ✅ Capture traces/screenshots on failure for debugging

---

## Knowledge Base

### Key References

For deeper understanding of testing patterns, see:

- **Fixture Patterns**: [`fixture-architecture.md`](#) — Composable fixtures and reuse rules
- **Data Factories**: [`data-factories.md`](#) — Factory patterns, seeding, cleanup discipline
- **Network Resilience**: [`network-first.md`](#) — Intercept-before-navigate, deterministic waits
- **Selector Resilience**: [`selector-resilience.md`](#) — Robust selector strategies
- **Timing & Debugging**: [`timing-debugging.md`](#) — Race condition identification
- **Playwright CLI**: [`playwright-cli.md`](#) — Token-efficient debugging for AI agents

### Related Test Levels

- **Unit Tests** (Vitest): `src/**/*.test.ts` — Isolated component and hook logic
- **Integration Tests** (Vitest): `src/**/*.test.tsx` — Component + Context interactions
- **E2E Tests** (Playwright): `tests/e2e/**` — Full user workflows (you are here)

---

## Troubleshooting

### Tests Fail Inconsistently (Flakiness)

**Problem:** Tests pass locally but fail in CI, or fail intermittently.

**Solutions:**
1. Check for hard-coded timeouts (`waitForTimeout`) — replace with explicit waits
2. Verify `data-testid` attributes exist in React components
3. Run locally with CI settings: `CI=true npm run test:e2e`
4. Enable tracing: Check `playwright-report/` for failure traces

### Browser Won't Install

```bash
# Reinstall browsers
npx playwright install

# With system dependencies (Linux)
npx playwright install --with-deps
```

### Tests Timeout

**Check:**
1. Is the dev server running? (`npm run dev`)
2. Is BASE_URL correct in `.env`?
3. Check browser console for errors: `npm run test:e2e:debug`

### localStorage Not Persisting

Ensure tests wait for state updates:

```typescript
await page.waitForLoadState('networkidle');
const stored = await browser.waitForLocalStorageKey('subscriptions');
```

### Can't Find Element

**Debug Steps:**
1. Run in headed mode: `npm run test:e2e -- --headed`
2. Pause test: Add `await page.pause()` to inspect page state
3. Run with Inspector: `npm run test:e2e:debug`
4. Check that `data-testid` attributes exist in React components

---

## Contributing

When adding new tests:

1. Follow **Given/When/Then** structure
2. Use `data-testid` selectors via `Selectors` helper
3. Clear state in `test.beforeEach`
4. Document complex workflows with comments
5. Run locally: `npm run test:e2e:ui`
6. Verify in CI with: `CI=true npm run test:e2e`

---

## Resources

- [Playwright Official Docs](https://playwright.dev)
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Debugging Tips](https://playwright.dev/docs/debug)
- [Best Practices](https://playwright.dev/docs/best-practices)

