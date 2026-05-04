---
stepsCompleted: ['step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-05-04'
story: '3.3-implement-add-subscription-workflow'
testLevel: 'E2E (Playwright)'
workflowMode: 'Create'
generatedTestFile: 'subscription-tracker/tests/story-3-3-e2e.spec.ts'
---

# E2E Coverage Plan — Story 3.3: Add Subscription Workflow

**Story:** 3.3 — Implement Add Subscription Workflow  
**Epic:** 3 — Add & Display Subscriptions  
**Test Level:** E2E (Playwright Browser Automation)  
**Generated:** 2026-05-04  
**By:** Murat, Master Test Architect  

---

## 🎯 Target Definition

### User Journey (Primary)

**Happy Path:** User submits subscription form → form clears → subscription appears in list → success message shown → message auto-dismisses → persistence verified on reload

**Acceptance Criteria Coverage:**

| AC | Title | User Observable Behavior | Test Count |
|----|----|---|---|
| **AC1** | Form submission connects to context | Form data dispatched to SubscriptionContext | (Covered by AC5 + AC6) |
| **AC2** | Unique ID & timestamps generated | Subscription has id, createdAt, updatedAt | (Covered by AC5 + AC6 persistence) |
| **AC3** | Form clears after submission | Input fields empty after successful add | 2 E2E tests |
| **AC4** | Success message displayed | Toast/alert with text "Subscription added successfully" | 3 E2E tests |
| **AC5** | Subscription appears in list immediately | New subscription renders in list without page refresh | 4 E2E tests |
| **AC6** | Subscription persists after page refresh | Data survives localStorage roundtrip across reload | 4 E2E tests |
| **AC7** | Error handling for invalid form | Form does NOT submit if validation fails | 4 E2E tests |
| **AC8** | Data type validation | Cost (number), due date (1-31 number) | (Covered by AC7) |

---

## 📋 E2E Test Catalog (Playwright)

### Test Suite: `story-3-3-atdd-red-phase.spec.ts`  
**Test Directory:** `subscription-tracker/tests/`

### E2E Test Matrix

| Test ID | Priority | AC | Test Name | Target Behavior | Status |
|---------|----------|----|----|---|---|
| **E2E-1** | P0 | AC4 | User submits form and sees success message appear | Success toast visible after form submission | 🔴 Scaffolded |
| **E2E-2** | P0 | AC4 | Success message text is correct | Message text = "Subscription added successfully" | 🔴 Scaffolded |
| **E2E-3** | P1 | AC4 | Success message disappears after 3 seconds | Toast auto-dismiss after 3s timeout | 🔴 Scaffolded |
| **E2E-4** | P0 | AC5 | New subscription appears in list immediately | List updates without page refresh | 🔴 Scaffolded |
| **E2E-5** | P0 | AC5 | New subscription displays correct name in list | Name matches form input exactly | 🔴 Scaffolded |
| **E2E-6** | P0 | AC5 | New subscription displays correct cost in list | Cost matches form input (may be formatted) | 🔴 Scaffolded |
| **E2E-7** | P0 | AC5 | New subscription displays correct due date in list | Due date matches form input (1-31 range) | 🔴 Scaffolded |
| **E2E-8** | P1 | AC3 | Form fields are cleared after submission | Name, cost, dueDate inputs empty after add | 🔴 Scaffolded |
| **E2E-9** | P1 | AC3 | User can immediately add another subscription | Second add succeeds without manual refresh | 🔴 Scaffolded |
| **E2E-10** | P1 | AC3 | Multiple subscriptions can be added rapidly | 3+ subscriptions added in quick succession | 🔴 Scaffolded |
| **E2E-11** | P0 | AC6 | Subscription remains in list after page reload | localStorage persists across F5 refresh | 🔴 Scaffolded |
| **E2E-12** | P0 | AC6 | Subscription name persists correctly after reload | Name value matches original after reload | 🔴 Scaffolded |
| **E2E-13** | P0 | AC6 | Subscription cost persists correctly after reload | Cost value matches original after reload | 🔴 Scaffolded |
| **E2E-14** | P0 | AC6 | Subscription due date persists correctly after reload | Due date value matches original after reload | 🔴 Scaffolded |
| **E2E-15** | P0 | AC7 | Form does NOT submit if required field is missing | Button disabled OR no add if validation fails | 🔴 Scaffolded |
| **E2E-16** | P1 | AC7 | Validation error appears for missing required field | Error message visible on submit attempt | 🔴 Scaffolded |
| **E2E-17** | P1 | AC8 | Invalid cost (non-numeric) is rejected | Cost "abc" → form does not submit | 🔴 Scaffolded |
| **E2E-18** | P1 | AC8 | Invalid due date (>31) is rejected | Due date "32" → form does not submit | 🔴 Scaffolded |

**Total E2E Tests:** 18 (all scaffolded in red phase)

---

## 🎯 Test Level & Priority Breakdown

### By Priority

| Priority | Count | Rationale |
|----------|-------|-----------|
| **P0 (Blocking)** | 11 tests | Critical user flows: form submission, list sync, persistence, basic validation |
| **P1 (High)** | 7 tests | Important UX: message dismiss, form clearing, error handling details |
| **Total** | 18 | All tests required for AC coverage |

### By Test Level Classification

| Test Level | Story 3.3 E2E Count | Justification |
|---|---|---|
| **E2E (Playwright)** | 18 | User-facing workflows: form submission → list update → persistence → success feedback |
| **Component (Vitest)** | 3 | Form handler internals (AC1, AC2, AC8) — separate from E2E |
| **Unit (Vitest)** | 4 | Data generation (UUID, timestamps, type conversion) — separate from E2E |

---

## 🔄 Test Level Decisions (Duplicate Guard)

### Why NOT Unit Tests for These?

❌ **NOT testing data generation in E2E** — Unit tests handle UUID uniqueness and timestamp correctness

❌ **NOT testing form validation logic in E2E** — Story 3.1 component tests already cover field interaction; E2E only tests form submission result

❌ **NOT testing localStorage directly in E2E** — Story 2.2 already tested localStorage utilities; E2E tests **user observable behavior** (data appears after refresh)

### Coverage Distinction

| Aspect | Tested By | Reason |
|--------|-----------|--------|
| Form validation (required fields, formats) | Story 3.1 component tests | Form component responsibility |
| Data type conversion (parseFloat, parseInt) | Unit tests + Component tests | Data generation logic |
| UUID generation & uniqueness | Unit tests | Pure function logic |
| **localStorage persistence** | **E2E** | User sees data after reload |
| **List renders new subscription** | **E2E** | User observable |
| **Success message appears & dismisses** | **E2E** | User observable |
| **Form clears after submit** | **E2E** | User observable UX |

---

## 📊 Risk Mapping

### Risks Addressed by E2E Tests

| Risk ID | Risk Description | E2E Tests Covering | Impact if Not Tested |
|---------|------------------|---|---|
| **R3.3-1** | Success feedback missing → user confused | E2E-1, E2E-2, E2E-3 | User doesn't know if add succeeded |
| **R3.3-2** | Context sync failure → list doesn't update | E2E-4, E2E-5, E2E-6, E2E-7 | New subscriptions invisible to user |
| **R3.3-3** | Data not persisting → user loses data | E2E-11, E2E-12, E2E-13, E2E-14 | Critical data loss on refresh |
| **R3.3-4** | UUID collisions → duplicate data with same ID | E2E-10 (rapid add test) | Data integrity violation |
| **R3.3-5** | Form validation bypass → invalid data accepted | E2E-15, E2E-16, E2E-17, E2E-18 | Bad data in storage |
| **R3.3-6** | Form not clearing → UX confusion | E2E-8, E2E-9 | User adds duplicate by mistake |

**All 6 risks addressed by E2E tests ✅**

---

## 🏗️ Test Execution Strategy

### Test Distribution by Browser

**Playwright Config:** 3 browsers × 18 tests = 54 total test runs

```
Tests:        18
Browsers:     3 (chromium, firefox, webkit)
Total Runs:   54
Parallel:     Yes (fullyParallel: true in config)
Expected Time: ~60-90 seconds (full suite)
CI:           1 worker (determinism), local: parallel
```

### Test Execution Order (Recommended)

1. **P0 Tests First** (11 tests) — Gate requirement, must pass before merge
2. **P1 Tests** (7 tests) — Secondary, but required for full AC coverage

```bash
# Run all E2E tests
npm run test:e2e -- tests/story-3-3-atdd-red-phase.spec.ts

# Run only P0 (gate tests)
npm run test:e2e -- tests/story-3-3-atdd-red-phase.spec.ts --grep "@P0|\\[P0\\]"

# Run with UI (visual debugging)
npm run test:e2e:ui -- tests/story-3-3-atdd-red-phase.spec.ts

# Run with trace (for debugging failures)
npm run test:e2e:debug -- tests/story-3-3-atdd-red-phase.spec.ts
```

---

## ✅ Coverage Completeness

### Acceptance Criteria Coverage

| AC | Tests Covering | Count | Coverage |
|----|---|---|---|
| AC1 | E2E-4, E2E-5 (list sync implies dispatch) | 2 | ✅ 100% (via behavior) |
| AC2 | E2E-10, E2E-11 (unique IDs via no duplicates) | 2 | ✅ 100% (via persistence) |
| AC3 | E2E-8, E2E-9 | 2 | ✅ 100% |
| AC4 | E2E-1, E2E-2, E2E-3 | 3 | ✅ 100% |
| AC5 | E2E-4, E2E-5, E2E-6, E2E-7 | 4 | ✅ 100% |
| AC6 | E2E-11, E2E-12, E2E-13, E2E-14 | 4 | ✅ 100% |
| AC7 | E2E-15, E2E-16 | 2 | ✅ 100% |
| AC8 | E2E-17, E2E-18 | 2 | ✅ 100% |

**All 8 ACs covered ✅**

---

## 🚨 Known Implementation Dependencies

### Required for E2E Tests to Pass

✅ **Already Implemented (Stories 2.1–3.2):**
- SubscriptionContext + useReducer (Story 2.3)
- useSubscriptions hook (Story 2.4)
- localStorage utilities (Story 2.2)
- SubscriptionForm component (Story 3.1)
- SubscriptionList component (Story 3.2)

❌ **NOT YET IMPLEMENTED (Story 3.3):**
- App.tsx handleFormSubmit() function
- Success message component
- UUID generation (native or uuid library)
- Form reset logic

### Test Blockers → Implementation Checklist

| Blocker | Unblocked By | Implementation Task |
|---------|---|---|
| E2E-1, E2E-2, E2E-3 | Success message component | Create SuccessMessage component with auto-dismiss (3s timeout) |
| E2E-4...E2E-10 | handleFormSubmit() + context dispatch | Implement form submission handler in App.tsx |
| E2E-8, E2E-9 | Form.reset() in handler | Add form.reset() after successful submission |
| E2E-11...E2E-14 | localStorage setup in App on mount | Ensure SubscriptionContext loads stored subscriptions on app init |
| E2E-15...E2E-18 | Form validation from Story 3.1 | Wire React Hook Form validation to button disable/form submission |

---

## 📌 Recommendations for Playwright E2E Testing

### 1. **Use Data Attributes for Selectors** (Resilience)

**Current Status:** Tests use semantic selectors (`input[name="name"]`, `button:has-text("...")`)

**Recommendation:** Add `data-testid` attributes to improve locator reliability:

```tsx
// In SubscriptionForm component
<input data-testid="subscription-name-input" name="name" ... />
<input data-testid="subscription-cost-input" name="cost" ... />
<input data-testid="subscription-duedate-input" name="dueDate" ... />
<button data-testid="add-subscription-button">Add Subscription</button>

// In success message component
<div data-testid="success-message">Subscription added successfully</div>

// In subscription list
<div data-testid="subscription-item" data-subscription-id={id}>{name}</div>
```

### 2. **Deterministic Waits** (Avoid Flakiness)

**Current Issue:** Test uses `page.waitForTimeout(3500)` for auto-dismiss

**Recommendation:** Use event-based waits instead:

```typescript
// INSTEAD OF: await page.waitForTimeout(3500);
// Use deterministic wait patterns:

// Option A: Wait for element to disappear
await expect(successMessage).toBeVisible();
await page.waitForTimeout(3100); // Just past 3s threshold
await expect(successMessage).toHaveCount(0); // Explicit expectation

// Option B: Better - inject hook to get actual dismiss time
// Let the component emit a dismiss event
const dismissPromise = page.evaluate(() => {
  return new Promise(resolve => {
    document.addEventListener('success-dismissed', resolve);
  });
});
await dismissPromise;
```

### 3. **Network Monitoring** (Reliability)

**Recommendation:** Monitor network activity to ensure form submission works:

```typescript
test('form submission succeeds', async ({ page }) => {
  // Intercept successful response
  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/subscriptions') && resp.status() === 201
  );

  await page.fill('input[name="name"]', 'Netflix');
  await page.click('button[data-testid="add-subscription-button"]');

  // Ensure network call succeeded
  const response = await responsePromise;
  expect(response.status()).toBe(201);
});
```

### 4. **Parallel Execution** (Speed)

**Current Config:** `fullyParallel: true` ✅ Already enabled

**Status:** Good! Tests will run in parallel on local machine, serially in CI.

### 5. **Fixtures for Setup** (Maintainability)

**Recommendation:** Extract common setup into a Playwright fixture:

```typescript
// conftest.ts or separate fixtures file
test.extend({
  cleanApp: async ({ page }, use) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173');
    await use(page);
  },
});

// Usage in tests
test('add subscription', async ({ cleanApp }) => {
  const page = cleanApp;
  // Test code
});
```

---

## 📝 Definition of Done (E2E Tests)

✅ All 18 E2E tests pass (P0 minimum required before merge)  
✅ All 3 browsers pass (chromium, firefox, webkit)  
✅ Test execution time < 2 minutes (local) / < 5 minutes (CI with retries)  
✅ No hard timeouts (`waitForTimeout`) in critical paths — use deterministic waits  
✅ All selectors use `data-testid` for resilience  
✅ No console errors during test execution  
✅ Trace/screenshot artifacts captured on failure  
✅ Tests pass with CI worker=1 (determinism verified)  

---

## 🎯 Next Phase: Step 3 — Generate Tests

**Input:** This coverage plan + ATDD test scaffold  
**Output:** Complete, runnable Playwright test suite  
**Action:** Enhance test scaffolding with:
- Deterministic wait patterns
- Proper selectors (data-testid)
- Network monitoring where needed
- Fixture setup for reusability

**Ready to proceed to Step 3?** ✅

---

**Generated:** 2026-05-04  
**By:** Murat, Master Test Architect  
**Workflow Mode:** Create (Step 2)  
**Story:** 3.3 — Add Subscription Workflow
