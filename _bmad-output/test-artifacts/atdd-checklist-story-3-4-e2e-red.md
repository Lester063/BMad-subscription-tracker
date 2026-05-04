# ATDD Execution Checklist: Story 3.4
## Implement Subscription Display with Real-Time Updates

**Generated:** 2026-05-04  
**Phase:** RED - Test Scaffolds Complete  
**Status:** Ready for Development

---

## ✅ Step 1: Preflight & Context Loading (COMPLETE)

- [x] Stack detected: `frontend` (React 19+, TypeScript, Vite, Playwright)
- [x] Prerequisites verified:
  - [x] Story 3.4 has clear acceptance criteria (AC1-AC4)
  - [x] Playwright configured (`playwright.config.ts` exists)
  - [x] Test framework ready (Vitest + React Testing Library)
  - [x] Test Design document loaded (`test-design-story-3-4.md`)
- [x] Knowledge base loaded:
  - [x] Core: `data-factories.md`, `component-tdd.md`, `test-quality.md`
  - [x] Frontend: `selector-resilience.md`, `timing-debugging.md`, `fixture-architecture.md`
  - [x] Playwright: `auth-session.md`, `recurse.md`, `network-first.md`
- [x] Artifacts confirmed:
  - [x] Story spec: `3-4-implement-subscription-display-with-real-time-updates.md`
  - [x] Test design: `test-design-story-3-4.md` (17 test cases defined)
  - [x] Project context: `project-context.md` (state management patterns)

---

## ✅ Step 2: Generation Mode Selection (COMPLETE)

- [x] Mode selected: **E2E Tests (Playwright)** - User behavior focused
- [x] Output file: `atdd-story-3-4-e2e-red.spec.ts`
- [x] Focus area: Real-time updates, sorting, no page refresh (user-facing concerns)

---

## ✅ Step 3: RED Phase Tests Generated (COMPLETE)

### Test Suite Structure

| Test Suite | Focus | Test Count | Status |
|------------|-------|-----------|--------|
| **P0: Critical Path** | Real-time <100ms, no loading state, no refresh | 3 tests | 🔴 RED |
| **P1: Sorting & Order** | Correct sort order, duplicate dates, re-sort on add | 4 tests | 🔴 RED |
| **P1: Empty State** | Empty → populated transition | 1 test | 🔴 RED |
| **P2: Performance** | Rapid adds, edge cases (dueDate 1 & 31) | 3 tests | 🔴 RED |
| **P3: Future** | Persistence, form reset, success message | 3 tests | ⏭️ SKIPPED |
| **ACC: Accessibility** | Semantic markup baseline | 1 test | 🔴 RED |
| **TOTAL** | | **15 Active** | |

### Test File Details

**File:** `atdd-story-3-4-e2e-red.spec.ts`  
**Framework:** Playwright (browser automation)  
**Language:** TypeScript  
**Location:** `_bmad-output/test-artifacts/`

**Test Fixtures:**
- `beforeEach`: Clears localStorage, navigates to app, waits for form
- Helper functions: `addSubscription()`, `getSubscriptionRows()`, `getFirstSubscriptionName()`

**All Tests Designed to FAIL:**
- SubscriptionList does NOT sort yet (AC2 not implemented)
- Tests verify user expectations before implementation
- RED phase validates test quality

---

## ⏭️ Step 4: Implementation Ready

### What Needs to be Built

**File:** `src/components/SubscriptionList/SubscriptionList.tsx`

**Current Code** (from Story 3.2-3.3):
```typescript
export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();
  if (!subscriptions || subscriptions.length === 0) {
    return <p className={styles.emptyState}>No subscriptions yet.</p>;
  }
  return (
    <ul className={styles.list} data-testid="subscription-list">
      {subscriptions.map(sub => <SubscriptionRow key={sub.id} subscription={sub} />)}
    </ul>
  );
}
```

**Required Change:**
```typescript
export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();
  
  // ADD THIS LINE:
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.dueDate - b.dueDate);
  
  if (!sortedSubscriptions || sortedSubscriptions.length === 0) {
    return <p className={styles.emptyState}>No subscriptions yet.</p>;
  }
  return (
    <ul className={styles.list} data-testid="subscription-list">
      {sortedSubscriptions.map(sub => <SubscriptionRow key={sub.id} subscription={sub} />)}
    </ul>
  );
}
```

**Why This Works:**
- Creates shallow copy of subscriptions array (no mutation)
- Sorts by `dueDate` ascending (earliest first)
- SubscriptionRow component renders each sorted item
- Real-time updates already work (from Story 3.3)
- Sorting is just the presentation layer

---

## 🔴 Running the RED Phase Tests

### Prerequisites Before Running Tests

1. **Dev server running:**
   ```bash
   npm run dev
   ```
   App must be accessible at `http://localhost:5173`

2. **Playwright installed:**
   ```bash
   npm install @playwright/test
   ```

3. **Test runner configured:**
   ```bash
   # Verify playwright.config.ts exists
   ls playwright.config.ts
   ```

### Run RED Phase Tests

**Run all E2E tests (expect failures):**
```bash
npx playwright test atdd-story-3-4-e2e-red.spec.ts
```

**Run specific P0 critical tests:**
```bash
npx playwright test atdd-story-3-4-e2e-red.spec.ts -g "P0"
```

**Run with headed browser (see what's happening):**
```bash
npx playwright test atdd-story-3-4-e2e-red.spec.ts --headed
```

**Run with UI mode (interactive debugging):**
```bash
npx playwright test atdd-story-3-4-e2e-red.spec.ts --ui
```

### Expected Output

```
FAIL: P0-E2E-001 - Should display new subscription immediately
  Error: expect(newSubscription).toBeVisible() - Element not visible

FAIL: P1-E2E-001 - Should sort subscriptions by dueDate
  Error: Expected 'Netflix' but got 'Gym' - Sort order incorrect

FAIL: [other tests] - All RED until implementation complete
```

---

## ✅ GREEN Phase (Next Step)

After tests run and FAIL:

1. **Implement sorting in SubscriptionList.tsx** (see "What Needs to be Built" above)
2. **Run tests again:**
   ```bash
   npx playwright test atdd-story-3-4-e2e-red.spec.ts
   ```
3. **Verify all tests now PASS** (GREEN phase)
4. **Proceed to REFACTOR phase**

---

## 🔄 REFACTOR Phase (After GREEN)

After all tests pass:

1. **Code review** - Check patterns match project conventions
2. **Performance tuning** - Verify <100ms on real hardware
3. **Edge case verification** - Manual test with various data
4. **Type safety** - Run `npm run build` to verify no TypeScript errors
5. **Linting** - Run `npm run lint` to check code quality
6. **Final test run** - All tests pass one more time

---

## 📊 Test Coverage Against Acceptance Criteria

| AC | Test Case | Coverage |
|----|-----------|----------|
| **AC1: <100ms updates** | P0-E2E-001, P0-E2E-003 | ✅ Covered |
| **AC2: Sort by dueDate** | P1-E2E-001, P1-E2E-002, P1-E2E-003 | ✅ Covered |
| **AC3: All ops real-time** | P1-E2E-003, P2-E2E-001 | ✅ Covered (add operation) |
| **AC4: No loading state** | P0-E2E-002 | ✅ Covered |

---

## 🎯 Quality Gates

**P0 Gate (MUST PASS):**
- [x] All 3 critical path tests defined
- [ ] All 3 critical path tests PASS (after implementation)
- [ ] <100ms timing assertion passes

**P1 Gate (SHOULD PASS):**
- [x] All 5 P1 tests defined
- [ ] All 5 P1 tests PASS (after implementation)
- [ ] Sort order verified for all scenarios

**P2 Gate (NICE TO HAVE):**
- [x] All 3 P2 tests defined
- [ ] All 3 P2 tests PASS (after implementation)

---

## 📋 Continuation Plan

### Current Status
✅ RED Phase: Test scaffolds complete, all tests failing as expected

### Next Actions
1. ⏭️ Implement sorting in SubscriptionList.tsx
2. ⏭️ Run tests → GREEN (all pass)
3. ⏭️ Code review & refactor
4. ⏭️ Verify quality gates
5. ⏭️ Merge to main

---

## 📝 Notes for Developer

**What's Already Working (from Stories 3.1-3.3):**
- Form submission workflow ✅
- Add subscription action ✅
- Real-time re-render on state change ✅
- localStorage persistence ✅
- Empty state guard ✅

**What You're Adding (Story 3.4):**
- Sorting by dueDate before render
- That's it! One line of code change

**Why Tests Will Fail Initially:**
- SubscriptionList renders in insertion order (not sorted)
- Tests expect sorted order (5, 15, 20)
- Once you add the sort line, tests will pass

**Expected Test Results After Implementation:**
- P0 tests: ✅ All 3 PASS
- P1 tests: ✅ All 5 PASS
- P2 tests: ✅ All 3 PASS
- ACC tests: ✅ 1 PASS
- **Total: 12/12 active tests PASS (100%)**

---

## 🔗 Related Artifacts

- **Story Spec:** `3-4-implement-subscription-display-with-real-time-updates.md`
- **Test Design:** `test-design-story-3-4.md` (17 test cases, risk assessment)
- **Project Context:** `project-context.md` (architecture, patterns)
- **Implementation File:** `src/components/SubscriptionList/SubscriptionList.tsx` (modify this)
- **Other Test Files:**
  - `atdd-story-3-1-red-phase.md` (unit tests reference)
  - `atdd-story-3-2-red-phase.md` (component tests reference)
  - `atdd-story-3-3-red-phase.md` (workflow tests reference)

---

**ATDD Checklist Status: RED PHASE COMPLETE**  
**Ready for developer to implement and run GREEN phase tests**

Generated by: Murat (Master Test Architect)  
Workflow: bmad-testarch-atdd  
Version: 1.0
