---
workflowStatus: 'complete'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: 'bmad-testarch-atdd (for P0 acceptance tests)'
lastSaved: '2026-05-08'
---

# Test Design: Story 11.6 — Integrate SearchBar & CostRangeFilter into Dashboard

**Date:** 2026-05-08  
**Author:** Lester Tuazon  
**Designer:** Murat (Master Test Architect)  
**Status:** Draft

---

## Executive Summary

**Scope:** Epic-level test design for Story 11.6 (Search & Filter Subscriptions Epic)

**Story Objective:** Integrate completed SearchBar and CostRangeFilter UI components into the Dashboard, enabling users to search and filter subscriptions by name and cost in real-time.

**Risk Summary:**

- **Total risks identified**: 8
- **High-priority risks (≥6)**: 1 (R-11-6-002 dependency blocking)
- **Critical categories**: TECH (integration), ACC (accessibility), PERF (memoization)

**Coverage Summary:**

- **P0 scenarios**: 5 (18–25 hours)
- **P1 scenarios**: 5 (15–22 hours)
- **P2 scenarios**: 4 (8–15 hours)
- **P3 scenarios**: 2 (3–5 hours)
- **Total estimated effort**: 44–67 hours (~6–8 days for full test implementation)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| Due date filtering UI | Story 11.6 focuses on search + cost filters only; due date filters part of Epic 6 | Epic 6 will add separate test design when due date filter story begins |
| Test automation implementation | This document designs tests; implementation happens in `bmad-testarch-atdd` and `bmad-testarch-automate` workflows | Follow with ATDD workflow to generate failing test scaffolds |
| Clear All Filters button (Story 11-7) | Story 11-7 explicitly covers this feature | Story 11-7 test design will address |
| Performance benchmarking at scale (1000+) | Memoization validated at 100 subscriptions; scale testing deferred | Recommend spike story for scale validation if needed |
| Visual/snapshot testing for responsive design | Accessibility tests cover keyboard; responsive design handled in Epic 9 | Epic 9 (Styling & UX Polish) will add responsive design tests |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|----------|
| **R-11-6-002** | TECH | **BLOCKING:** Hook dependencies (11-4 useFilteredSubscriptions, 11-5 filterSubscriptions utility) must be fully complete before dev starts; if incomplete, story cannot execute | 2 | 3 | **6** | **BLOCKER GATE**: Run pre-dev checklist verifying 11-4 & 11-5 are "done" status in sprint-status.yaml; establish hard dependency in issue tracker | Dev Lead | Before sprint start |

### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|
| **R-11-6-001** | TECH | Integration of 3 independent components (SearchBar, CostRangeFilter, SubscriptionList) into Dashboard may have state sync issues; context dispatch → hook recompute → component re-render cycle may break | 2 | 2 | **4** | (1) Unit test each component in isolation (E2E searches for SearchBar, CostRangeFilter); (2) Integration test: full cycle test (type search → measure hook update → verify SubscriptionList re-renders < 100ms); (3) E2E snapshot test: verify component tree structure | QA Lead |
| **R-11-6-004** | TECH | SearchBar and CostRangeFilter dispatch to context (setSearchTerm, setCostRangeMin/Max); Dashboard must read filtered results and pass correct props to SubscriptionList | 1 | 3 | **3** | Integration test verifying context dispatch → useFilteredSubscriptions hook update → SubscriptionList props change; add data-testid to verify props flow | QA Lead |
| **R-11-6-003** | PERF | Real-time search/filter on every keystroke may cause excessive re-renders or layout thrashing if memoization not working correctly | 2 | 1 | **2** | (1) Leverage useMemo in 11-4 hook; (2) E2E performance test: measure re-render count (React DevTools Profiler); confirm < 5 re-renders per keystroke; (3) Monitor performance regression in CI | Dev Lead |
| **R-11-6-007** | ACC | Keyboard navigation: SearchBar clear button, CostRangeFilter inputs must be tab-accessible; Tab order must be logical (search input → clear button → cost min → cost max → buttons) | 2 | 2 | **4** | E2E accessibility test: Keyboard navigation test using Playwright (Tab key, Enter/Space to activate); verify WCAG 2.1 Level A compliance; use Axe accessibility scanner | QA Lead |
| **R-11-6-008** | TECH | Cost range validation edge case: if min > max, filtering returns 0 results; 11-3 component shows error message; Dashboard must display gracefully without breaking layout | 1 | 1 | **1** | E2E test: (1) Set min $20, max $10 → verify error message from CostRangeFilter; (2) verify SubscriptionList shows 0 results; (3) verify "No subscriptions match your filters" message displayed | QA Lead |
| **R-11-6-006** | UX | Empty state messaging: when filters match 0 subscriptions, Dashboard should show "No subscriptions match your filters" not "No subscriptions yet" | 1 | 2 | **2** | E2E test: (1) Add subscription; (2) apply filter that excludes it; (3) verify correct message displayed; (4) unit test SubscriptionList conditional logic | QA Lead |
| **R-11-6-005** | BUS | User expectations: filters should be session-only (not persisted to localStorage); project context specifies search state does NOT persist to storage; clarify in story AC if unclear | 2 | 1 | **2** | (1) Verify project-context.md confirms session-only storage; (2) E2E test: refresh page with filters active → verify filters reset to empty/null state; (3) document behavior in story AC | Product Lead |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| **R-11-6-009** | OPS | CI environment may not have Playwright configured; E2E tests may fail in CI without browser setup | 1 | 1 | **1** | Monitor: verify Playwright CI config exists (Story 10-6); escalate if E2E runner unavailable |

---

## Testability Assessment

### ✅ Strengths

1. **Atomic Components**: SearchBar (11-2 ✓ done), CostRangeFilter (11-3 ✓ done), SubscriptionList (3-2 ✓ done) are independently tested → easy to mock/stub in Dashboard integration tests
2. **Context-Driven State**: All state reads/writes flow through SubscriptionContext reducer → predictable, mockable behavior
3. **Memoization in Place**: useFilteredSubscriptions (11-4) uses useMemo → performance testable via React DevTools Profiler
4. **E2E Patterns Established**: Prior stories (3.4) have Playwright fixtures, data factories, selectors → reusable test patterns
5. **Accessibility Built-in**: SearchBar (11-2) and CostRangeFilter (11-3) already have WCAG 2.1 compliance (keyboard nav, labels, aria-*) → inheritance testing only
6. **Data-TestID Attributes**: SubscriptionList already tagged with data-testid (story 3-2) → reliable E2E selectors

### ⚠️ Testability Concerns

| Concern | Impact | Mitigation |
|---------|--------|-----------|
| **State Coordination Gap** | No existing integration test confirming (SearchBar dispatch) → (context update) → (useFilteredSubscriptions recompute) → (SubscriptionList re-render) completes in < 100ms | **Add integration test** (P1-001 below): full filter flow test with performance assertion |
| **Empty State Coverage** | Prior stories tested empty state with zero subscriptions; no test for empty state when filters match zero results | **Add E2E test** (P1-001 below): apply filters that exclude all subscriptions → verify correct message & layout |
| **Layout Stability** | No test verifying Dashboard layout doesn't shift when filter results change (collapse/expand) | **Add Playwright sizing test** (P2-002 below): measure component heights before/after filter; assert no shift |
| **Dependency Risk** | If 11-4 (useFilteredSubscriptions) or 11-5 (filterSubscriptions utility) incomplete, story cannot start | **Blocker Gate** (R-11-6-002): verify 11-4, 11-5 in "done" status before sprint start; hard dependency in issue tracker |
| **SearchBar clear button accessibility** | SearchBar (11-2) has clear button but no explicit test for keyboard activation in Dashboard context | **Add keyboard E2E test** (P1-003 below): Tab to clear button → Enter → verify search resets |

---

## Entry Criteria

- [ ] **Dependency Status**: Story 11-4 (useFilteredSubscriptions hook) marked "done" in sprint-status.yaml
- [ ] **Dependency Status**: Story 11-5 (filterSubscriptions utility) marked "done" in sprint-status.yaml
- [ ] **Component Completion**: SearchBar (11-2) component deployed to codebase with all AC verified
- [ ] **Component Completion**: CostRangeFilter (11-3) component deployed to codebase with all AC verified
- [ ] **Architecture Agreement**: Dashboard layout sketch approved (search filters at top, SubscriptionList below)
- [ ] **Test Environment**: Playwright test environment available with dev server running
- [ ] **Team Availability**: Dev + QA + Product Lead available for refinement discussions

## Exit Criteria

- [ ] **All P0 tests passing** (5/5 scenarios)
- [ ] **All P1 tests passing** (5/5 scenarios; 0 flaky failures)
- [ ] **No high-risk items unmitigated** (R-11-6-002 blocker resolved)
- [ ] **Accessibility compliance verified** (Axe scanner, keyboard navigation)
- [ ] **Performance target met** (filtering 100 subscriptions < 10ms, measured via React DevTools)
- [ ] **Test coverage agreement**: ≥80% code coverage for new Dashboard integration code
- [ ] **Code review complete** (via bmad-code-review workflow)
- [ ] **Story marked "done"** in sprint-status.yaml

---

## Project Team

| Name | Role | Testing Responsibilities |
|------|------|-------------------------|
| Lester Tuazon | Developer | Implement Dashboard + component integration; run unit tests; provide performance metrics |
| QA Team (bmad-tea) | QA Lead | Design E2E tests; execute accessibility/keyboard tests; performance validation |
| Product Lead | Product Manager | Approve acceptance criteria; validate empty state UX messaging |

---

## Test Coverage Plan

### P0 (Critical) — Run on every commit / PR

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Req ID | Requirement | Test Level | Risks | Test Scenarios | Effort | Owner | Notes |
|--------|-------------|-----------|-------|---|--------|-------|-------|
| **AC1-Dashboard** | SearchBar renders in Dashboard layout | Unit | — | Render Dashboard; assert SearchBar component present; CSS classes applied | 2h | Dev | Smoke test |
| **AC2-Dashboard** | CostRangeFilter renders in Dashboard layout | Unit | — | Render Dashboard; assert CostRangeFilter component present; CSS classes applied | 2h | Dev | Smoke test |
| **AC3-Search** | Search input dispatch → context update → filtered results (real-time) | **E2E** | R-11-6-001, R-11-6-004 | Add 3 subscriptions (Netflix, Hulu, Disney); type "netflix" → verify SubscriptionList shows only Netflix; time < 100ms | 4h | QA | Critical path; measures state coordination |
| **AC4-CostFilter** | Cost filter dispatch → context update → filtered results (real-time) | **E2E** | R-11-6-001, R-11-6-004 | Add subscriptions with various costs ($5, $15, $25); set range $5-$15 → verify list shows only matching subscriptions | 4h | QA | Critical path |
| **AC5-Combined** | Combined filters (search AND cost) filter correctly | **E2E** | R-11-6-001 | Search "streaming" + range $5-$15 → only subscriptions matching BOTH criteria shown; verify AND logic | 4h | QA | Critical path |

**Total P0**: 5 scenarios | **18–25 hours**

### P1 (High) — Run on PR to main / nightly

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Req ID | Requirement | Test Level | Risks | Test Scenarios | Effort | Owner | Notes |
|--------|-------------|-----------|-------|---|--------|-------|-------|
| **AC6-Empty** | Empty state message when filters match 0 results | **E2E** | R-11-6-006 | Add subscription; apply filter excluding it → "No subscriptions match your filters" (not "No subscriptions yet") | 3h | QA | UX correctness |
| **AC7-ClearAll** | Clear filters button resets search/cost to null/empty; all subscriptions shown | **E2E** | — | Apply filters; click "Clear All Filters" → both filters reset; all subscriptions visible | 3h | QA | Reset UX (prep for 11-7) |
| **AC8-Keyboard** | Keyboard navigation Tab order: search input → clear button → cost min → cost max → buttons | **E2E** | R-11-6-007 | Tab through all filter controls; verify focus order logical; Enter/Space activate buttons | 4h | QA | WCAG 2.1 accessibility |
| **AC9-RealTime** | Real-time: add subscription while filters active; shows if matches, doesn't if excluded | **E2E** | R-11-6-001 | Apply filter; add matching subscription → immediately visible; add non-matching → not visible | 4h | QA | State sync + form integration |
| **AC10-Perf** | Performance: filtering 100+ subscriptions completes < 10ms | **Integration** | R-11-6-003 | Measure useFilteredSubscriptions hook time with React DevTools; 100 subscriptions → < 10ms | 3h | Dev | Perf gate; useMemo validation |

**Total P1**: 5 scenarios | **15–22 hours**

### P2 (Medium) — Run nightly / weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases + Nice-to-have

| Req ID | Requirement | Test Level | Risks | Test Scenarios | Effort | Owner | Notes |
|--------|-------------|-----------|-------|---|--------|-------|-------|
| **AC11-CostError** | Invalid cost range (min > max) shows error; SubscriptionList shows 0 results | **E2E** | R-11-6-008 | Set min $20, max $10 → error message displayed (from 11-3); SubscriptionList empty | 2h | QA | Edge case handling |
| **AC12-Layout** | Layout stability: filter results collapse/expand without visual shift | **E2E** | R-11-6-006 | Measure component heights before/after filter; assert no unexpected shift | 3h | QA | Responsive stability |
| **AC13-Accessibility** | Screen reader announces filter count; "Search results: 3 subscriptions" | **E2E** | R-11-6-007 | Axe accessibility scan on filtered list; verify aria-live announcements | 3h | QA | A11y compliance |
| **AC14-SessionOnly** | Filter state session-only: refresh page with filters → reset to empty | **E2E** | R-11-6-005 | Apply filters; refresh page (F5) → filters reset to null; all subscriptions visible | 3h | QA | Verify no localStorage persistence |

**Total P2**: 4 scenarios | **8–15 hours**

### P3 (Low) — Run on-demand / exploratory

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks + Future-proofing

| Req ID | Requirement | Test Level | Test Scenarios | Effort | Owner | Notes |
|--------|-------------|-----------|---|--------|-------|-------|
| **AC15-Mobile** | Mobile responsive: filters stack on small screens (future Epic 9) | **E2E** | Playwright viewport resize (mobile → tablet → desktop); verify filter controls accessible | 2h | QA | Exploratory; full responsive design in Epic 9 |
| **AC16-Perf-Scale** | Performance with 500+ subscriptions (spike); filtering still < 50ms | **E2E** | Generate 500 subscriptions; measure filter time; document if > 50ms as tech debt spike | 3h | Dev | Benchmark; future optimization candidate |

**Total P3**: 2 scenarios | **3–5 hours**

---

## Execution Strategy

### Phase 1: Test Design (This Document) ✅
- **Owner**: Murat (Master Test Architect)
- **Output**: This comprehensive test design document
- **Next**: Development team refines acceptance criteria; QA extracts test scenarios

### Phase 2: ATDD - Generate Failing Tests (Separate Workflow)
- **Workflow**: `bmad-testarch-atdd`
- **Input**: This test design document + Story AC
- **Output**: Failing P0 test scaffolds (E2E + Unit)
- **Owner**: QA Lead + Dev
- **Timeline**: Before dev starts (test-driven development)

### Phase 3: Implementation (Dev)
- **Owner**: Dev (Lester Tuazon)
- **Tasks**: Implement Dashboard component; integrate SearchBar + CostRangeFilter; wire useFilteredSubscriptions hook
- **Testing**: Dev runs unit tests; dev-local E2E validation
- **Timeline**: 3–4 days

### Phase 4: Test Automation (Comprehensive Coverage)
- **Workflow**: `bmad-testarch-automate`
- **Input**: Implemented Dashboard code + prior component tests
- **Output**: P0 + P1 + P2 automated test suite
- **Owner**: QA Lead
- **Timeline**: Parallel with dev or immediately after

### Phase 5: Code Review & QA Sign-Off
- **Workflow**: `bmad-code-review` (adversarial review)
- **Criteria**: All tests passing; performance targets met; accessibility verified
- **Owner**: QA + Tech Lead
- **Timeline**: 1–2 days

### Execution Schedule (Estimated)
```
Week 1:
  Mon–Tue: ATDD phase (failing tests)
  Wed–Fri: Dev implementation + unit testing
  
Week 2:
  Mon–Tue: Test automation (P0 + P1 + P2)
  Wed: Code review + fixes
  Thu–Fri: QA sign-off + story mark "done"

Total: ~8 days (6–10 day range accounting for blockers)
```

---

## Resource Estimates

### Test Development Effort (Ranges: Low — High)

| Priority | Scenario Count | Hours/Scenario | Total Hours | Notes |
|----------|---|---|---|---|
| **P0** | 5 | 3.6–5 | 18–25 | Complex setup, state coordination validation, E2E |
| **P1** | 5 | 3–4.4 | 15–22 | Standard E2E + keyboard a11y + performance |
| **P2** | 4 | 2–3.75 | 8–15 | Edge cases, responsive design, accessibility audit |
| **P3** | 2 | 1.5–2.5 | 3–5 | Exploratory, benchmarks |
| **Total** | **16** | **~2.75–4.2** | **44–67** | **~6–8 days full implementation** |

### Test Infrastructure

**Test Data:**
- Subscription factory (faker-based, auto-cleanup) — reuse from Story 3.3
- Search dataset (3–5 curated subscriptions with distinct names/costs) — new fixture

**Tooling:**
- Playwright (browser automation) — already installed (Story 10-1)
- Vitest (unit tests) — already installed
- React DevTools Profiler (performance measurement) — browser extension
- Axe Accessibility Scanner (npm: `@axe-core/playwright`) — new dependency

**Environment:**
- Dev server running (`npm run dev`)
- Playwright test environment provisioned
- Browser instances isolated (headless mode for CI)

### Effort Breakdown by Discipline

| Phase | Discipline | Effort (hours) | Timeline |
|-------|-----------|---|---|
| **Phase 2: ATDD** | QA + Dev | 8–12 | 1–2 days |
| **Phase 3: Dev** | Dev | 24–32 | 3–4 days |
| **Phase 4: Automation** | QA | 12–18 | 2–3 days |
| **Phase 5: Review** | QA + Tech Lead | 4–8 | 1–2 days |
| **Total** | **All** | **48–70** | **~6–10 days (wall-clock)** |

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (zero exceptions; failing P0 blocks release)
- **P1 pass rate**: ≥95% (failures require waiver + documented root cause)
- **P2 pass rate**: ≥90% (informational; not blocking)
- **P3 pass rate**: ≥80% (exploratory; not tracked for release)
- **High-risk mitigations** (R-11-6-002, R-11-6-001, R-11-6-007): 100% complete or documented waiver

### Coverage Targets

- **Critical paths** (search + cost filter): ≥85%
- **Accessibility scenarios** (keyboard, WCAG): 100%
- **Empty state logic**: ≥80%
- **Edge cases**: ≥60%
- **Overall code coverage**: ≥80% (Dashboard integration code)

### Flakiness Tolerance

- **E2E flakiness**: < 2% (0–1 flaky test per 100 runs acceptable; > 2% triggers investigation)
- **Unit flakiness**: 0% (unit tests must be deterministic)
- **Performance variance**: ≤ 10% (filtering time 9–11ms acceptable; > 11ms triggers investigation)

### Non-Negotiable Requirements

- [ ] All P0 tests pass (5/5)
- [ ] No high-risk (≥6) items unmitigated (R-11-6-002 blocker gate in place)
- [ ] Accessibility compliance verified (WCAG 2.1 Level A: keyboard nav, screen reader, color contrast)
- [ ] Performance target met (filtering 100+ subscriptions < 10ms measured via React DevTools)
- [ ] Code review approved (adversarial review via bmad-code-review workflow)
- [ ] Story marked "done" with all AC verified

---

## Mitigation Plans

### R-11-6-002: Hook Dependency Blocking (Score: 6) — CRITICAL

**Description**: Stories 11-4 (useFilteredSubscriptions) and 11-5 (filterSubscriptions utility) must be complete before 11-6 dev starts; if incomplete, story cannot execute.

**Mitigation Strategy**:
1. **Pre-Sprint Checklist** (before sprint planning): Verify 11-4 and 11-5 marked "done" in sprint-status.yaml
2. **Hard Dependency Gate**: Add issue tracker dependency link: 11-6 blocks on 11-4 + 11-5
3. **Daily Standup Review**: Check blocker status daily; escalate if dependencies at risk
4. **Contingency**: If 11-4 or 11-5 slip, defer 11-6 to next sprint or parallelize with careful coordination

**Owner**: Dev Lead  
**Timeline**: Before sprint start + daily monitoring  
**Status**: Planned  
**Verification**: Sprint board shows 11-4 & 11-5 in "done"; 11-6 can proceed

---

### R-11-6-001: State Coordination Test Gap (Score: 4)

**Description**: No existing integration test confirming (SearchBar dispatch) → (context update) → (useFilteredSubscriptions recompute) → (SubscriptionList re-render) completes in < 100ms.

**Mitigation Strategy**:
1. **Add P0 Integration Test** (AC3 below): Full filter flow test measuring end-to-end latency
2. **React DevTools Profiler**: Measure hook recompute time during E2E test
3. **Add performance assertion**: Assert < 100ms total cycle
4. **E2E Snapshot**: Capture component tree before/after filter to verify structural change

**Owner**: QA Lead  
**Timeline**: During ATDD phase (Phase 2)  
**Status**: Planned  
**Verification**: Test P0-001 passing; latency logged and reviewed

---

### R-11-6-007: Keyboard Navigation (Score: 4)

**Description**: SearchBar clear button, CostRangeFilter inputs must be tab-accessible; tab order must be logical.

**Mitigation Strategy**:
1. **Add P1 Keyboard Test** (AC8 below): Tab through all filter controls; verify focus order
2. **Axe Accessibility Scanner**: Run on Dashboard page; verify WCAG 2.1 Level A
3. **Screen Reader Testing**: Test with NVDA/JAWS (or simulated in Playwright)
4. **Inheritance Testing**: SearchBar (11-2) and CostRangeFilter (11-3) already WCAG-compliant; test inheritance in Dashboard context

**Owner**: QA Lead  
**Timeline**: During ATDD + Automation phases  
**Status**: Planned  
**Verification**: P1-003 keyboard test passing; Axe scan 0 violations

---

---

## Assumptions and Dependencies

### Assumptions

1. **Context Usage**: All state reads from SubscriptionContext via `useSubscriptions()` hook; no direct context access
2. **Memoization in Place**: useFilteredSubscriptions (11-4) correctly implements useMemo; recomputes only when subscriptions or searchState changes
3. **Component Isolation**: SearchBar (11-2) and CostRangeFilter (11-3) are fully functional independently; Dashboard only needs to wire props/callbacks
4. **Filtering Logic**: Pure logic in filterSubscriptions utility (11-5) handles name search (case-insensitive, substring), cost range (inclusive bounds), AND logic
5. **Session-Only Storage**: Search state does NOT persist to localStorage (per project context); filters reset on page refresh
6. **No Due Date Filters**: Story 11-6 does not include due date filtering UI; that comes with Epic 6 (different filter dimension)
7. **Dashboard Exists**: Dashboard component exists or will be created as part of 11-6 implementation (currently may be App.tsx layout)

### Dependencies

| Dependency | Status | Required By | Mitigation |
|-----------|--------|------------|-----------|
| **Story 11-4**: useFilteredSubscriptions hook completed | ⚠️ In Progress | Before 11-6 dev start | Blocker gate + daily standup review |
| **Story 11-5**: filterSubscriptions utility completed | ⚠️ In Progress | Before 11-6 dev start | Blocker gate + daily standup review |
| **Story 11-2**: SearchBar component deployed | ✅ Done | Immediate | Code available in codebase |
| **Story 11-3**: CostRangeFilter component deployed | ✅ Done | Immediate | Code available in codebase |
| **Playwright Setup**: Browser automation framework | ✅ Ready | Immediate (Story 10-1) | Already configured |
| **React DevTools**: Performance profiling | ✅ Ready | P1 phase | Browser extension available |
| **Axe Accessibility**: A11y scanning | ⚠️ Pending | P2 phase | Add npm dependency: `@axe-core/playwright` |

### Risks to Plan

| Risk | Impact | Contingency |
|------|--------|-----------|
| **Blocker 11-4 slip**: useFilteredSubscriptions not complete by sprint start | 11-6 cannot start; sprint goal at risk | Defer 11-6 to next sprint; parallelize with risk (likely to fail) |
| **Performance regression**: Filtering time > 10ms | Story AC violated; requires optimization before release | Spike investigation; consider caching/indexing strategy; may require architecture change |
| **Accessibility blocker**: Keyboard nav fails; Axe finds violations | Story cannot ship until fixed; impacts WCAG compliance | Add a11y dev to team; prioritize fixes; document waiver if needed |
| **Flaky E2E tests**: Race conditions between dispatch and re-render | Test suite unstable; CI false failures | Add wait conditions; use Playwright best practices (waitForSelector, explicit waits); refactor if timing still fragile |

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope | Owner |
|-------------------|--------|------------------|-------|
| **SubscriptionContext** | State mutations (search, cost filters) dispatch through context | Existing reducer tests must pass; verify no side effects on ADD/UPDATE/DELETE actions | Dev |
| **useSubscriptions hook** | New search/filter dispatchers must work alongside existing dispatchers | Unit tests for hook coverage; verify error handling | Dev |
| **SubscriptionList** | Receives filtered results from Dashboard; must handle empty state correctly | Prior SubscriptionList tests must still pass; add new empty state variant | QA |
| **SearchBar component** | Integrated into Dashboard; dispatch integration verified | Prior SearchBar unit tests must still pass; add Dashboard integration test | QA |
| **CostRangeFilter component** | Integrated into Dashboard; dispatch integration verified | Prior CostRangeFilter unit tests must still pass; add Dashboard integration test | QA |
| **App/Dashboard layout** | Parent component orchestrating filters + list | Integration with existing form/list layout; ensure no visual regressions | QA |

---

## Implementation Approach: Test-Driven Development (TDD)

### Phase 2: ATDD - Write Failing Tests First

```
1. Extract P0 test scenarios from this design
2. Write failing tests (unit + E2E) BEFORE implementation
3. Generate test scaffolds using bmad-testarch-atdd workflow
4. Commit failing tests to git (red phase)
```

### Phase 3: Development - Implement to Pass Tests

```
1. Implement Dashboard component
2. Wire SearchBar + CostRangeFilter into Dashboard layout
3. Integrate useFilteredSubscriptions hook
4. Connect context dispatchers to filter control onChange handlers
5. Add data-testid attributes for E2E
6. Run tests to turn red → green
```

### Phase 4: Automation - Expand Coverage

```
1. Add P1 + P2 test scenarios (keyboard, accessibility, edge cases)
2. Expand automation using bmad-testarch-automate workflow
3. Run full suite; achieve ≥80% coverage
```

### Phase 5: Code Review & Sign-Off

```
1. Run adversarial code review (bmad-code-review)
2. Fix issues; re-run tests
3. QA sign-off; story marked "done"
```

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: {To be assigned} Date: ____
- [ ] Tech Lead: {To be assigned} Date: ____
- [ ] QA Lead: Murat (Master Test Architect) Date: 2026-05-08 ✅

**Comments:**

> **Murat's Sign-Off**: This test design establishes a defensible, risk-based approach to validating the SearchBar + CostRangeFilter integration into the Dashboard. The blocker gate on 11-4 & 11-5 is non-negotiable—those hooks must be complete before dev starts, or story execution fails. The P0 coverage focuses on state coordination (search + cost filtering) and the critical dispatch → context → re-render cycle. P1 adds keyboard accessibility (WCAG 2.1 compliance) and real-time integration. P2 captures edge cases (invalid ranges, empty states, session-only persistence). Performance validation via React DevTools Profiler ensures memoization is working as intended. Recommend following TDD (ATDD phase before dev) to lock in acceptance criteria early. Total estimated effort: 44–67 hours over 6–8 days wall-clock.

---

## Appendix

### Knowledge Base References

- **Risk Framework**: `risk-governance.md` (TECH/SEC/PERF/DATA/BUS/OPS categories)
- **Probability-Impact Model**: 1–3 scale (1=low, 2=medium, 3=high); Score = P × I
- **Test Level Selection**: `test-levels-framework.md` (Unit vs Component vs E2E decision rules)
- **Prioritization**: `test-priorities-matrix.md` (P0=blocking+high-risk, P1=important, P2=secondary, P3=exploratory)

### Related Documents

- **PRD**: [Epic 11: Search & Filter Subscriptions](../_bmad-output/planning-artifacts/epics.md#epic-11)
- **Epic Breakdown**: [Epic 11 Detailed Stories](../_bmad-output/planning-artifacts/epics.md#epic-11-search--filter)
- **Architecture**: [BMad Subscription Tracker Architecture](../_bmad-output/planning-artifacts/architecture.md)
- **Prior Story Tests**: [Story 3.4 Test Design](./test-design-story-3-4.md) (reference for E2E patterns)
- **Project Context**: [Project Rules & Conventions](./docs/project-context.md)

### Story Implementation Files (Reference)

| File | Story | Status |
|------|-------|--------|
| `11-1-extend-subscriptioncontext-with-search-filter-state.md` | 11.1 | ✅ Done |
| `11-2-create-searchbar-component.md` | 11.2 | ✅ Done |
| `11-3-create-costrangefilter-component.md` | 11.3 | ✅ Done |
| `11-4-create-usefilteredsubscriptions-custom-hook.md` | 11.4 | ⚠️ Ready-for-dev |
| `11-5-create-filtersubscriptions-utility-function.md` | 11.5 | ⚠️ Ready-for-dev |
| `11-6-integrate-searchbar-costrangefilter-into-dashboard.md` | **11.6** | 📋 **This Story** |

### Next Steps

1. **Immediate**: Verify 11-4 & 11-5 completion status; establish blocker gate
2. **Next Sprint**: Invoke `bmad-testarch-atdd` workflow to generate failing P0 test scaffolds
3. **Dev Phase**: Implement Dashboard + integration; run tests red → green
4. **Automation**: Invoke `bmad-testarch-automate` for P1 + P2 coverage expansion
5. **Review**: Run `bmad-code-review` workflow before marking story "done"

---

---

**Generated by**: Murat (Master Test Architect) — BMad TEA Agent, Test Design Workflow v5.0  
**Workflow**: `bmad-testarch-test-design` (Epic-Level Mode)  
**Template**: `test-design-template.md`  
**Project**: BMad-subscription-tracker  
**Version**: 1.0 (Draft)  
**Last Updated**: 2026-05-08  
**Next Review**: Upon completion of 11-4 & 11-5 dependencies
