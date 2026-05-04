---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-05-04T14:30:00Z'
inputDocuments:
  - 'story-3-4-implement-subscription-display-with-real-time-updates.md'
  - 'project-context.md'
  - knowledgeFragments: ['risk-governance.md', 'probability-impact.md', 'test-levels-framework.md', 'test-priorities-matrix.md', 'network-first.md']
designLevel: 'EPIC-LEVEL'
epicNumber: '3'
storyNumber: '3.4'
---

# Test Design: Story 3.4 - Implement Subscription Display with Real-Time Updates

**Date:** 2026-05-04  
**Author:** Murat, Master Test Architect  
**Status:** Approved for Development

---

## Executive Summary

**Scope:** Epic-level test design for Story 3.4 (Add & Display Subscriptions)

**Risk Summary:**

- Total risks identified: **5**
- High-priority risks (≥6): **1** (Real-time updates performance)
- Critical categories: **TECH** (state management, component re-render)

**Coverage Summary:**

- P0 scenarios: **1** (~3–5 hours QA)
- P1 scenarios: **5** (~12–15 hours Dev + QA)
- P2/P3 scenarios: **5** (~4–8 hours Dev + QA)
- **Total effort**: ~20–30 hours (~2–3 days for Dev + QA parallel)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| Edit subscription workflow | Story 4.1, separate epic | Sorting pattern applies; no changes needed |
| Delete subscription workflow | Story 4.2, separate epic | Real-time update pattern established; no changes needed |
| Accessibility testing (WCAG 2.1) | Story 3.5, separate story | Keyboard nav + ARIA labels not in this story |
| Performance load testing (>100 subs) | Story 6+ filtering/sorting | Current scope: <50 subscriptions realistic |
| Offline support | Future story, not in AC | Storage persistence working; no special offline handling required |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|----------|
| **R-001** | **TECH** | Real-time updates fail or exceed 100ms (AC1) | 2 | 3 | **6** | E2E test with DevTools timing + assertion | QA | Before merge |
| **R-002** | **TECH** | Sort order incorrect or not applied | 1 | 3 | **3** | Unit test + E2E visual verification | Dev + QA | Sprint start |

### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|-----------|--------|
| **R-003** | **TECH** | Empty list guard missing or broken | 2 | 1 | **2** | Unit test: render with `subscriptions=[]` | Dev |
| **R-004** | **TECH** | Performance regression from sorting | 1 | 2 | **2** | E2E assertion: `<100ms` total render | QA |
| **R-005** | **TECH** | Edge case: duplicate due dates unsorted | 1 | 1 | **1** | Unit test: stable sort verification | Dev |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, state management, re-renders)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Entry Criteria

- [x] Story 3.3 (Add Subscription Workflow) implemented and tested
- [x] SubscriptionForm + SubscriptionList + SubscriptionRow components working
- [x] useSubscriptions hook stable and returning correct data
- [x] localStorage persistence tested and working
- [ ] Dev environment setup: `npm install` + `npm run dev` passing
- [ ] Test environment ready: Vitest + Playwright configured
- [ ] Acceptance criteria (AC1–AC4) reviewed by Dev + QA

## Exit Criteria

- [x] **P0 test passing**: Real-time display <100ms verified (E2E)
- [x] **P1 tests passing**: 100% pass rate for sorting + integration tests
- [x] **Code coverage**: ≥80% of SubscriptionList.tsx
- [x] **No open high-priority bugs**: All R-001 mitigations verified
- [ ] Code review completed: patterns + architecture compliance confirmed
- [ ] Manual testing: Live add/verify sort order/no flicker/success message
- [ ] Performance verified: DevTools shows <100ms re-render time

---

## Test Coverage Plan

### P0 (Critical) — Blocks Release

**Criteria:** Revenue/core UX blocking + High risk (≥6) + No workaround  
**Execution:** Every commit, required to pass before merge

| AC | Test Case | Test Level | Risk Link | Count | Owner | Notes |
|----|-----------|-----------|-----------|-------|-------|-------|
| AC1 | Add subscription → appears in list immediately (<100ms) | **E2E** | R-001 | 1 | QA | Measure time to DOM update; DevTools Performance tab verification |
| AC1 | No page refresh during add | **E2E** | R-001 | 1 | QA | Assert URL unchanged, form visible |
| AC1 | No loading states (spinner/skeleton) appear | **E2E** | R-001 | 1 | QA | Assert no `[role="status"]` or `.loading` elements visible |

**Test ID Format:** `3.4-P0-E2E-{seq}`  
**Total P0:** 3 test cases, **3–5 hours** (includes setup + DevTools analysis)

---

### P1 (High) — Run on PR

**Criteria:** Core scenarios + Medium/High risk (3-5) + Common workflows  
**Execution:** Every PR to feature branch, must pass before merge to main

| AC | Test Case | Test Level | Risk Link | Count | Owner | Notes |
|----|-----------|-----------|-----------|-------|-------|-------|
| AC2 | Sort subscriptions by dueDate ascending (unsorted input) | **Unit** | R-002 | 1 | Dev | 3 items (dates 20, 5, 15) → verify order (5, 15, 20) |
| AC2 | Maintain insertion order for duplicate due dates | **Unit** | R-005 | 1 | Dev | 2 items (date 15, 15) → verify Netflix before Hulu |
| AC2 | Empty list shows "No subscriptions yet" message | **Unit** | R-003 | 1 | Dev | Guard: `if (!subscriptions \|\| subscriptions.length === 0)` |
| AC1+AC2 | Add multiple subscriptions → list sorted by due date (E2E) | **E2E** | R-001, R-002 | 1 | QA | Add (date 20), then add (date 5) → Gym appears first |
| AC1+AC3 | useSubscriptions hook returns updated array after dispatch | **Integration** | R-001 | 1 | Dev | Context reducer + hook integration |
| AC1 | Form clears after subscription added | **E2E** | R-001 | 1 | QA | Input fields empty after success message |

**Test ID Format:** `3.4-P1-{LEVEL}-{seq}`  
**Total P1:** 6 test cases, **10–15 hours** (includes component setup + network-first patterns)

---

### P2 (Medium) — Run Nightly/Weekly

**Criteria:** Secondary/edge cases + Low risk (1-2) + Regression prevention  
**Execution:** Nightly CI or manual weekly

| AC | Test Case | Test Level | Risk Link | Count | Owner | Notes |
|----|-----------|-----------|-----------|-------|-------|-------|
| AC1 | Single subscription renders correctly after add | **Unit** | — | 1 | Dev | Baseline: no crash, renders name + cost + due date |
| AC2 | Component does not mutate original subscriptions array | **Unit** | — | 1 | Dev | Verify spread operator used: `[...subscriptions].sort()` |
| AC4 | Success message displays on add | **E2E** | — | 1 | QA | Assert text "Subscription added successfully" visible |
| AC4 | No visual flicker during list update | **E2E** | — | 1 | QA | Playwright DevTools: inspect DOM changes, no layout shift |
| Regression | All existing tests from Stories 3.1–3.3 still pass | **All Levels** | — | — | Dev + QA | Ensure no breaking changes |

**Test ID Format:** `3.4-P2-{LEVEL}-{seq}`  
**Total P2:** 5 test cases, **4–8 hours**

---

### P3 (Low) — On-Demand / Exploratory

**Criteria:** Nice-to-have + Benchmarks + Non-critical edge cases  
**Execution:** Sprint backlog; defer if time-constrained

| Test Case | Test Level | Notes |
|-----------|-----------|-------|
| Performance benchmark: Sort 1000+ items | **Unit** | Informational; current scope <50 items |
| Visual regression: List layout unchanged | **E2E** | Screenshots of sorted list with 3, 5, 10 items |
| Accessibility: Sort doesn't break keyboard nav | **E2E** | Keyboard Tab through sorted items; defer to Story 3.5 |

**Total P3:** 3 test cases, **~2–5 hours** (optional)

---

## Execution Strategy

### Commit-Level (PR Check)

**Trigger:** Every push to feature branch  
**Duration:** ~5–7 minutes  
**Must Pass:** P0 + P1

```yaml
pr_checks:
  unit_tests:
    - 3.4-P1-UNIT-001 through UNIT-003 (sorting, guard, duplication)
    - 3.4-P2-UNIT-001, UNIT-002 (mutation guard, baseline render)
    - time: ~2–3 minutes
  integration_tests:
    - 3.4-P1-INT-001 (useSubscriptions hook)
    - time: ~1 minute
  e2e_smoke:
    - 3.4-P0-E2E-001 (real-time display)
    - time: ~3–4 minutes
  total: ~7 minutes
```

### Merge-Level (Main Branch)

**Trigger:** Before merging Story 3.4 to `main`  
**Duration:** ~12–15 minutes  
**Must Pass:** P0 (100%) + P1 (100%)

```yaml
merge_checks:
  all_pr_tests: [as above] (~7 min)
  full_e2e:
    - 3.4-P0-E2E-001 through E2E-003 (all P0)
    - 3.4-P1-E2E-001 through E2E-003 (all P1 E2E)
    - 3.4-P2-E2E-001 through E2E-002 (P2 E2E)
    - time: ~5–8 minutes
  total: ~12–15 minutes
```

### Nightly/Weekly (Full Regression)

**Trigger:** 0200 UTC daily / Friday 2200 UTC weekly  
**Duration:** ~20–30 minutes  
**Includes:** All P0–P3 + Full Epic 3 regression (Stories 3.1–3.5)

---

## Parallel Execution (CI Sharding)

**Reduce P1+P2 E2E from 8 min → 4 min:**

```yaml
shard_1: Unit tests (3.4-P1-UNIT-*, P2-UNIT-*) → ~2–3 min
shard_2: Integration tests (3.4-P1-INT-*) → ~1 min
shard_3: E2E tests (3.4-P0-E2E-*, P1-E2E-*, P2-E2E-*) → ~5–8 min
parallel_wall_time: ~8 min (bottleneck: E2E)
savings: 5 min via parallelization
```

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Complexity | Hours/Test | Total Hours | Timeline |
|----------|-------|-----------|-----------|------------|----------|
| **P0** | 3 | High (DevTools + timing) | 1.5 | **4–5 hrs** | Day 1 (QA) |
| **P1** | 6 | Medium (hooks + E2E) | 1.5–2 | **8–12 hrs** | Days 1–2 (Dev + QA parallel) |
| **P2** | 5 | Low (edge cases) | 0.5–1 | **2–5 hrs** | Day 2 (Dev + QA) |
| **P3** | 3 | Low (exploratory) | 0.25–0.5 | **1–2 hrs** | Optional (backlog) |
| **TOTAL** | **17** | — | — | **15–24 hrs** | **~2–3 days** |

### Prerequisites (Already Available)

**Test Data:**

- ✅ Subscription factory (from Story 3.3 tests)
- ✅ SubscriptionProvider wrapper for context isolation
- ✅ Test data: 3–10 test subscriptions with varied due dates

**Tooling:**

- ✅ Vitest (unit + integration)
- ✅ React Testing Library (component testing)
- ✅ Playwright (E2E + DevTools)
- ✅ Playwright DevTools Performance API (for AC1 timing measurement)

**Environment:**

- ✅ Dev server: `npm run dev` on `localhost:5173`
- ✅ Test runner: `npm test -- run`
- ✅ E2E runner: `npx playwright test`
- ✅ CI/CD: GitHub Actions (detect from `.github/workflows/`)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

| Gate | Requirement | Status | Evidence |
|------|-------------|--------|----------|
| **P0 Pass Rate** | **100%** (no exceptions) | **MANDATORY** | `3.4-P0-E2E-*` all green |
| **P1 Pass Rate** | **≥95%** (waivers for 1 failure) | **MANDATORY** | `3.4-P1-*` report ≥5/6 passing |
| **P2/P3 Pass Rate** | **≥90%** (informational) | **SHOULD** | Nightly report |
| **Code Coverage** | **≥80%** for SubscriptionList.tsx | **MANDATORY** | `npm test -- coverage` |
| **High-Risk Mitigations** | **100%** complete or waived | **MANDATORY** | R-001 (real-time <100ms) verified |

### Release Gate Decision

| Scenario | Decision | Action |
|----------|----------|--------|
| P0=100% + P1≥95% + Coverage≥80% | ✅ **PASS** | Merge to main |
| P0=100% + P1=1 failure (tracked) | ⏳ **CONCERNS** | Investigate failure; waiver if non-blocking |
| P0<100% OR P1<80% OR Coverage<80% | 🚫 **FAIL** | Block merge; fix before retry |
| R-001 unmitigated (real-time>100ms) | 🚫 **FAIL** | Block merge; optimize before retry |

---

## Mitigation Plans

### R-001: Real-Time Updates Fail or Exceed 100ms (Score: 6) — CRITICAL

**Risk:** New subscription doesn't appear in list immediately, or display takes >100ms (AC1 violation)

**Why This Risk Score?**
- **Probability 2/3 (Possible):** useReducer + Context pattern established, but timing chain has multiple steps (Form → Dispatch → Reducer → Context → Re-render → DOM paint). Race conditions possible if not tested rigorously.
- **Impact 3/3 (Critical):** Core user feedback. Users see form clear but subscription not in list = user confusion, likely user clicks "Add" again (duplicate adds). Blocks story completion.

**Mitigation Strategy:**

1. **E2E Test (3.4-P0-E2E-001):** Add subscription and measure time to DOM update
   ```typescript
   // Pseudo-code
   const startTime = performance.now();
   await page.click('button:has-text("Add Subscription")');
   await page.waitForSelector('[data-testid="subscription-item"]:last-child');
   const endTime = performance.now();
   expect(endTime - startTime).toBeLessThan(100);
   ```

2. **DevTools Performance Capture:** Use Playwright to capture browser DevTools Performance tab
   ```typescript
   // Measure via DevTools
   const metrics = await page.evaluate(() => {
     const perfData = performance.getEntriesByType('measure');
     return perfData.filter(entry => entry.name.includes('render'));
   });
   ```

3. **Network-First Assertion:** Ensure no missed API calls or delayed network waits
   ```typescript
   await page.waitForFunction(() => {
     return document.querySelectorAll('[data-testid="subscription-item"]').length === 2;
   }, { timeout: 100 });
   ```

**Owner:** QA  
**Timeline:** Complete before merge (Day 1–2)  
**Status:** Planned  
**Verification:** 
- [ ] Test 3.4-P0-E2E-001 passes consistently
- [ ] DevTools shows <100ms re-render time
- [ ] No flakiness over 10 consecutive runs

---

### R-002: Sort Order Incorrect (Score: 3) — LOW PRIORITY

**Risk:** Subscriptions not sorted by dueDate, or wrong order (AC2 violation)

**Mitigation Strategy:**

1. **Unit Test (3.4-P1-UNIT-001):** Render 3 subscriptions with dates [20, 5, 15], verify rendered order is [5, 15, 20]
2. **E2E Test (3.4-P1-E2E-001):** Add subscriptions in reverse order (dueDate 20, then 5), verify Gym (dueDate 5) appears first
3. **Code Review:** Verify spread operator + sort pattern used correctly

**Owner:** Dev + QA  
**Timeline:** Sprint start  
**Status:** Planned  
**Verification:** 
- [ ] Unit test 3.4-P1-UNIT-001 passes
- [ ] E2E test 3.4-P1-E2E-001 passes

---

### R-003: Empty List Guard Missing (Score: 2) — OPTIONAL

**Risk:** SubscriptionList crashes or renders wrong element when list empty

**Mitigation:** Unit test 3.4-P1-UNIT-003 renders with `subscriptions=[]`, asserts "No subscriptions yet" text visible

**Owner:** Dev  
**Status:** Planned

---

### R-004: Performance Regression (Score: 2) — OPTIONAL

**Risk:** Sort + re-render takes >100ms due to added overhead

**Mitigation:** E2E assertion in 3.4-P0-E2E-001 already covers; spread operator + sort on <50 items negligible cost

**Owner:** QA  
**Status:** Covered by existing test

---

### R-005: Duplicate Due Dates Unsorted (Score: 1) — FYI

**Risk:** Multiple subscriptions with same dueDate render in wrong insertion order

**Mitigation:** Unit test 3.4-P1-UNIT-002 verifies stable sort (JavaScript sort is stable by default)

**Owner:** Dev  
**Status:** Planned

---

## Test Case Checklist

### Unit Tests (To Be Written by Dev)

- [ ] **3.4-P1-UNIT-001**: Sort order ascending (dates 20, 5, 15 → 5, 15, 20)
- [ ] **3.4-P1-UNIT-002**: Stable sort (duplicate dates maintain insertion order)
- [ ] **3.4-P1-UNIT-003**: Empty list guard + "No subscriptions yet" message
- [ ] **3.4-P2-UNIT-001**: Single subscription renders correctly
- [ ] **3.4-P2-UNIT-002**: Spread operator prevents mutation of original array

### Integration Tests (To Be Written by Dev)

- [ ] **3.4-P1-INT-001**: useSubscriptions hook returns updated subscriptions after dispatch

### E2E Tests (To Be Written by QA)

- [ ] **3.4-P0-E2E-001**: Add subscription → appears <100ms (with DevTools timing)
- [ ] **3.4-P0-E2E-002**: No page refresh during add
- [ ] **3.4-P0-E2E-003**: No loading states visible (spinner/skeleton)
- [ ] **3.4-P1-E2E-001**: Add multiple → list sorted by due date (visual verification)
- [ ] **3.4-P1-E2E-002**: Form clears after add success
- [ ] **3.4-P1-E2E-003**: Success message displays
- [ ] **3.4-P2-E2E-001**: No visual flicker during update
- [ ] **3.4-P2-E2E-002**: Valid order persists across page reload (localStorage integration)

---

## Assumptions and Dependencies

### Assumptions

1. ✅ Story 3.3 (Add Subscription Workflow) is fully implemented and tested
2. ✅ SubscriptionList component exists at `src/components/SubscriptionList/SubscriptionList.tsx`
3. ✅ useSubscriptions hook stable and returns array of Subscription objects
4. ✅ React Context + useReducer pattern established and working
5. ✅ localStorage persistence already tested in Story 3.3
6. ✅ Form submission triggers dispatch → context update → component re-render (synchronous)
7. ✅ Project uses data-testid attributes for E2E element selection

### Dependencies

| Dependency | Status | Required By | Notes |
|------------|--------|-------------|-------|
| Story 3.3 implementation | ✅ Complete | Before testing | Add subscription workflow must work |
| Subscription factory | ✅ Available | Day 1 | Reuse from Story 3.3 tests |
| SubscriptionProvider wrapper | ✅ Available | Day 1 | Context testing pattern established |
| Vitest + React Testing Library | ✅ Installed | Day 1 | From Story 3.1 setup |
| Playwright | ✅ Installed | Day 1 | E2E testing framework |
| Dev environment (npm run dev) | ✅ Ready | Day 1–2 | localhost:5173 must be accessible |

### Risks to Plan

| Risk | Impact | Contingency |
|------|--------|-------------|
| Real-time display flaky in CI | Test passes locally but fails in CI (race condition) | Add network-first waits; use HAR recordings if flaky |
| Performance varies on CI runner (slower hardware) | 100ms threshold exceeded on CI but not local | Measure on CI runner specifically; adjust threshold if needed |
| Story 3.3 regression in this sprint | Add/display workflow breaks | Run full Epic 3 regression before merge |
| E2E test timeout (browser launch slow) | E2E suite takes >15 min | Parallel sharding; consider headless+pooling |

---

## Interworking & Regression

| Component | Impact | Regression Scope |
|-----------|--------|------------------|
| **SubscriptionContext** | Real-time updates depend on context reducer | Story 3.3 tests (ADD_SUBSCRIPTION action) must still pass |
| **SubscriptionForm** | Form submission triggers context dispatch | Story 3.1 tests (form validation) must still pass |
| **localStorage** | Sorting happens after data loaded from storage | Story 3.3 tests (persistence + load on app start) must still pass |
| **useSubscriptions hook** | Hook returns array used by SubscriptionList | Stories 2.3–2.4 tests (hook behavior) must still pass |
| **App.tsx** | App renders SubscriptionList + dispatch logic | Full app integration test (smoke) must pass |

---

## Sign-Off & Approval

**Test Design Approved By:**

- [ ] **Product Manager (John):** Acceptance criteria understood; P0 priorities agreed
- [ ] **Tech Lead (Winston):** Architecture compliance verified; no blocking concerns
- [ ] **QA Lead (Murat):** Risk assessment and coverage strategy approved
- [ ] **Dev Lead (Amelia):** Unit test approach and integration points reviewed

**Comments:**

> **Murat's Assessment:** This story is straightforward and **low-risk overall** despite the AC1 real-time performance requirement. The sorting logic is deterministic, component isolation is clean, and state management pattern is proven in Story 3.3. The only meaningful risk is **R-001 (real-time display <100ms)**, which is entirely testable and verified via E2E. Gate is clear: **P0 must pass before merge**. Recommend dev starts with unit tests (Day 1), then QA validates E2E performance (Day 2). **Confidence: HIGH.**

---

## Next Steps (Post-Approval)

1. **Dev Action:** Write unit + integration tests (3.4-P1-UNIT-* + 3.4-P1-INT-*)
2. **QA Action:** Write E2E tests (3.4-P0-E2E-* + 3.4-P1-E2E-* + 3.4-P2-E2E-*)
3. **Dev Action:** Implement SubscriptionList sorting logic
4. **Dev + QA:** Run tests, verify all P0 + P1 passing
5. **Code Review:** Verify patterns, coverage, performance
6. **Merge:** Execute pre-merge gate (12–15 min); confirm all tests pass
7. **Post-Merge:** Run nightly regression; monitor for flakiness

---

## Knowledge Base References

- `risk-governance.md` — Risk classification framework and gate decisions
- `probability-impact.md` — 1-3 probability/impact scale and automation
- `test-levels-framework.md` — Unit vs Integration vs E2E decision criteria
- `test-priorities-matrix.md` — P0–P3 prioritization and coverage targets
- `network-first.md` — Playwright network interception and deterministic waits

---

## Related Documents

- **PRD:** [prd.md](_bmad-output/planning-artifacts/prd.md)
- **Epic 3:** [epics.md](_bmad-output/planning-artifacts/epics.md)
- **Story 3.4:** [3-4-implement-subscription-display-with-real-time-updates.md](_bmad-output/implementation-artifacts/3-4-implement-subscription-display-with-real-time-updates.md)
- **Architecture:** [architecture.md](_bmad-output/planning-artifacts/architecture.md)
- **Story 3.3 Tests:** [Existing test suite for add subscription workflow]

---

**Generated by:** Murat — Master Test Architect & Quality Advisor  
**Workflow:** `bmad-testarch-test-design`  
**Version:** 6.5 (BMad TEA Module)  
**Timestamp:** 2026-05-04T14:30:00Z
