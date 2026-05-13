---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: 'None (workflow complete)'
lastSaved: '2026-05-13'
designLevel: 'Story-Level (Epic 4)'
storyId: '4-4'
storyKey: '4-4-add-success-error-messages-toast-notifications'
---

# Test Design: Story 4-4 — Add Success & Error Messages (Toast Notifications)

**Date:** May 13, 2026  
**Author:** Lester Tuazon (Murat, Master Test Architect)  
**Status:** Approved for Development  
**Epic:** 4 (Edit & Delete Subscriptions)

---

## Executive Summary

**Scope:** Story-level test design for toast notification system (success/error feedback on edit, delete, and add workflows)

**Risk Summary:**
- Total risks identified: 5
- High-priority risks (≥6): 0 (no blockers)
- Monitor-level risks: 3 (Timing, Concurrency, Accessibility)
- Categories: TECH (3), SEC (1), BUS (1)

**Coverage Summary:**
- P0 scenarios: 2 (12–18 hours)
- P1 scenarios: 6 (25–40 hours)
- P2/P3 scenarios: 4 (12–18 hours)
- **Total effort**: 49–76 hours (~1–2 weeks, single developer)

**Key Dependencies:**
- ✅ Story 4-1 (Edit workflow) — complete; expects toast notifications
- ✅ Story 4-2 (Delete workflow) — complete; expects toast notifications
- ✅ Story 2.3 (useReducer + Context) — complete; foundation for toast state

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| **Toast position/animation customization** | Out of MVP; UI polish handled in Epic 9 | Use default position (top-right); document for future Epic 9 |
| **Toast action buttons (e.g., "Undo")** | Not in AC; adds complexity to state management | Dismiss-only; undo handled by future feature |
| **Custom styling per message type** | Covered by CSS Modules + global variables | Standard success (green) + error (red) from global.css |
| **Multi-language i18n for messages** | Out of scope for MVP | Use English strings; flag for future internationalization |
| **Sound/haptic feedback on toast** | Not in requirements | Document as future accessibility enhancement |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)
None identified. ✅

### Medium-Priority Risks (Score 3–5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|----------|
| **R1** | TECH | Toast auto-dismiss timer fails or delays beyond 3s window | 2 | 2 | **4** | E2E test with fake timers; verify dismiss within 100ms of 3s; capture timing traces in test failures | Lester (QA) | Before code review |
| **R2** | TECH | Concurrent toast messages queue/overlap incorrectly under rapid edits/deletes | 2 | 2 | **4** | Unit test for queue logic under rapid dispatch; E2E test: 3+ rapid edits/deletes with assertions on message order | Lester (QA) | Before code review |
| **R3** | SEC | Toast not screen-reader accessible (aria-live, aria-atomic, role missing) → WCAG 2.1 violation | 2 | 2 | **4** | axe-core automated scan + manual ARIA verification; assertions on DOM attributes (role="status", aria-live="polite", aria-atomic="true") | Lester (QA) | Before code review |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| **R4** | BUS | Toast system doesn't integrate with 4-1/4-2 workflows (dispatch not wired) | 1 | 3 | **3** | Integration tests with both edit and delete workflows; validate dispatch chain end-to-end | Monitor |
| **R5** | TECH | React component lifecycle issues (memory leaks, unmount chaos) | 1 | 2 | **2** | Verify useEffect cleanup in React.StrictMode; test component mount/unmount cycles | Monitor |

### Risk Category Legend
- **TECH**: Technical/Architecture (flaws, integration, scalability, timing)
- **SEC**: Security (access controls, auth, accessibility, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue, feature completeness)
- **OPS**: Operations (deployment, config, monitoring)

---

## Entry Criteria

- [x] Story 4-1 (Edit workflow) complete and tested
- [x] Story 4-2 (Delete workflow) complete and tested
- [x] useReducer + SubscriptionContext available (Story 2.3)
- [x] Global CSS variables defined (Story 1.4)
- [ ] Toast component implementation started
- [ ] Test environment ready (Playwright + vitest with fake timers)
- [ ] Acceptance criteria from 4-1 & 4-2 reviewed (toast references understood)

## Exit Criteria

- [ ] All P0 tests passing (TC1, TC2: success feedback)
- [ ] All P1 tests passing or failures triaged (TC3–TC8: timing, concurrency, accessibility, errors)
- [ ] axe-core accessibility audit: 0 violations, 0 warnings for toast component
- [ ] No flaky E2E tests on toast dismissal timing
- [ ] Code review approved by one senior dev + accessibility reviewer
- [ ] Integration with 4-1 and 4-2 verified (success messages appear on edit/delete)
- [ ] P2/P3 tests deferred to nightly only (can merge without these)

---

## Project Team

| Name | Role | Testing Responsibilities |
|------|------|--------------------------|
| Lester Tuazon | QA Lead / Test Architect | Test design, P0/P1 E2E execution, accessibility verification, timing flakiness debugging |
| (Dev TBD) | Developer | Implementation, component logic, unit tests (P1), integration with 4-1/4-2 |
| (Dev TBD, optional) | Code Reviewer | WCAG 2.1 compliance spot-check, timer logic review, React lifecycle best practices |

---

## Test Coverage Plan

### P0 (Critical) — Run on every PR

**Criteria:** Blocks core journeys (edit/delete feedback) + User-visible outcome

| ID | Scenario | Test Level | Risk Link | Test Methods | Est. Hours | Owner |
|----|----------|-----------|-----------|--------------|-----------|-------|
| **TC1** | Toast displays on successful edit (SubscriptionForm → update) | E2E | BUS | Playwright: Click Edit, change value, submit; assert toast "Subscription updated successfully" appears | 4–6 | QA |
| **TC2** | Toast displays on successful delete (DeleteConfirmationDialog → confirm) | E2E | BUS | Playwright: Click Delete, confirm; assert toast "Subscription deleted successfully" appears | 4–6 | QA |

**Total P0:** 2 tests, **12–18 hours**

---

### P1 (High) — Run on PR to main

**Criteria:** Timing, concurrency, accessibility, error handling

| ID | Scenario | Test Level | Risk Link | Test Methods | Est. Hours | Owner |
|----|----------|-----------|-----------|--------------|-----------|-------|
| **TC3** | Toast auto-dismisses after 3 seconds (timing correctness) | E2E | R1 | vitest fake timers + Playwright; dispatch toast, verify dismissal at 3s ±100ms; assert toast removed from DOM | 6–8 | QA |
| **TC4** | Concurrent toasts queue correctly (rapid edits) | E2E | R2 | Playwright: Rapid sequence of 3+ edits; verify message order in queue; each message displays before next appears | 5–8 | QA |
| **TC5** | Toast keyboard accessible (Tab, Enter navigation) | E2E | AC8 (4-1/4-2) | Playwright: Tab through edit form, dismiss toast via keyboard; verify focus management; manual ARIA verification | 3–4 | QA |
| **TC6** | Toast has correct ARIA attributes (aria-live, role, aria-atomic) | Component | R3 | vitest + axe-core: Render toast; assert role="status", aria-live="polite", aria-atomic="true"; run axe-core scan | 4–5 | QA |
| **TC7** | Error toast displays on localStorage failure (error handling) | E2E | AC10 (4-1/4-2) | Mock localStorage.setItem to throw; verify error toast appears with user-friendly message (not tech jargon) | 3–5 | QA |
| **TC8** | `useToast()` hook exposes show/dismiss methods (ASR: dispatch architecture) | Unit | ASR | vitest: Call useToast(); assert { show, dismiss } methods exist; test dispatch logic | 2–3 | Dev |

**Total P1:** 6 tests, **25–40 hours**

---

### P2 (Medium) — Run nightly/weekly

**Criteria:** Lifecycle, UX polish, edge cases

| ID | Scenario | Test Level | Risk Link | Test Methods | Est. Hours | Owner |
|----|----------|-----------|-----------|--------------|-----------|-------|
| **TC9** | React lifecycle: cleanup prevents memory leaks | Component | R5 | vitest + React.StrictMode: Render toast 10× in succession; verify no console warnings; check useEffect cleanup called | 3–5 | Dev |
| **TC10** | User can manually dismiss toast (manual close) | E2E | Feature | Playwright: Render toast, click dismiss button, verify removed; check timer also clears | 2–3 | QA |
| **TC11** | Very long messages wrap/truncate correctly (content overflow) | Visual/Component | UX | Playwright: Render toast with 200+ char message; visual snapshot; assert no text cutoff | 2–3 | QA |

**Total P2:** 3 tests, **7–11 hours**

---

### P3 (Low) — On-demand

**Criteria:** Smoke tests, exploratory

| ID | Scenario | Test Level | Test Methods | Est. Hours | Owner |
|----|----------|-----------|--------------|-----------|-------|
| **TC12** | Toast component mounts/unmounts without errors | Component | vitest: Render/unmount 5×; assert no console errors or warnings | 1–2 | Dev |

**Total P3:** 1 test, **1–2 hours**

---

## Execution Strategy

### PR Mode (< 20 min target)
- **P0 E2E tests** (TC1, TC2): ~10–12 min
- **P1 E2E** (TC3–TC7): ~8–12 min
- **P1 Unit** (TC8): ~1–2 min
- **Total PR time: ~19–26 min** ⚠️ (slightly over 15 min; acceptable for critical feature)

### Nightly/Weekly
- **P2 tests** (TC9–TC11): ~8–12 min (visual snapshots may be slower)
- **Extended load/stress tests**: If needed for concurrency edge cases

### CI Execution
- **Main branch merges**: Full suite (P0 + P1 + P2)
- **Feature branches**: P0 + P1 (fast-fail on P0/P1; P2 warnings only)
- **Scheduled nightly**: P2/P3 + extended timing tests

---

## Quality Gates (Release Approval)

| Gate | Criteria | Status | Owner |
|------|----------|--------|-------|
| **P0 Pass Rate** | 100% (TC1, TC2 must pass; zero failures) | ✅ Mandatory | QA + Dev |
| **P1 Pass Rate** | ≥ 95% (max 1 flaky test; retry once before failure) | ✅ Mandatory | QA + Dev |
| **P2 Pass Rate** | ≥ 90% (can defer edge cases to hotfix) | ⚠️ Monitor | QA |
| **Risk Mitigation** | All MONITOR risks (R1, R2, R3) mitigated with test evidence | ✅ Mandatory | QA + Architect |
| **Accessibility (axe-core)** | 0 violations, 0 warnings on toast component | ✅ Mandatory | QA + Accessibility Reviewer |
| **Timing Flakiness** | No flaky dismissal tests; all timing assertions within 100ms window | ✅ Mandatory | QA |
| **Code Review** | Approved by one senior dev + accessibility reviewer | ✅ Mandatory | Dev Lead + Reviewer |
| **Integration Verified** | Success messages confirm on 4-1 (edit) + 4-2 (delete) workflows | ✅ Mandatory | QA + Dev |

---

## Key Test Scenarios (Detailed)

### P0: Success Feedback (TC1, TC2)

**TC1 — Edit Success Toast:**
```gherkin
Feature: Edit subscription displays success toast
  Scenario: User edits subscription and sees success message
    Given: Dashboard displays subscriptions
    When: User clicks Edit on a subscription
    And: Modifies name/cost/date in form
    And: Clicks "Update Subscription" button
    Then: Toast appears with text "Subscription updated successfully"
    And: Toast remains visible for 3 seconds
    And: List updates to show edited values
    And: Form clears and edit mode exits
```

**TC2 — Delete Success Toast:**
```gherkin
Feature: Delete subscription displays success toast
  Scenario: User deletes subscription and sees success message
    Given: Dashboard displays subscriptions
    When: User clicks Delete on a subscription
    And: Confirms deletion in dialog
    Then: Toast appears with text "Subscription deleted successfully"
    And: Subscription removed from list
    And: Toast remains visible for 3 seconds
```

### P1: Timing & Concurrency (TC3, TC4)

**TC3 — Timer Accuracy:**
```
Test Strategy:
  1. Use vitest.useFakeTimers('modern')
  2. Dispatch toast action (SHOW_TOAST)
  3. Assert DOM contains toast element at t=0ms
  4. Advance timers by 3000ms
  5. Assert DOM no longer contains toast (removed via auto-dismiss)
  6. Verify setTimeout cleanup called (no dangling timers)
```

**TC4 — Concurrent Queue:**
```
Test Strategy:
  1. Rapidly dispatch 3 SHOW_TOAST actions (no delay)
  2. Verify toast 1 displays at t=0ms
  3. Verify toast 2 displays at t=3s (after toast 1 auto-dismissed)
  4. Verify toast 3 displays at t=6s
  5. Assert messages appear in correct order (queue FIFO)
```

### P1: Accessibility (TC6)

**TC6 — ARIA Attributes:**
```javascript
// Pseudo-code for test
test('toast has correct accessibility attributes', () => {
  const { container } = render(<Toast message="Test" type="success" />);
  const toastElement = container.querySelector('[role="status"]');
  
  // Assertions
  expect(toastElement).toHaveAttribute('role', 'status');
  expect(toastElement).toHaveAttribute('aria-live', 'polite');
  expect(toastElement).toHaveAttribute('aria-atomic', 'true');
  
  // axe-core scan
  const results = await axe(container);
  expect(results.violations).toHaveLength(0);
  expect(results.incomplete).toHaveLength(0);
});
```

---

## Assumptions & Dependencies

1. **Toast Component Architecture**: Assumes `useToast()` hook + Context-based dispatch (per project standards)
2. **Story 4-1 & 4-2**: Completion of edit/delete workflows; integration points already identified in their acceptance criteria
3. **Playwright & vitest**: Tooling already in place (from prior epics)
4. **React 19+ with Strict Mode**: Ensures lifecycle safety testing
5. **Global CSS Variables**: Colors (success green, error red) defined in `global.css` (Story 1.4)

---

## Next Steps (Handoff to Developer)

1. **Create story file** `4-4-add-success-error-messages-toast-notifications.md` in implementation artifacts
2. **Implement toast component** and `useToast()` hook using coverage plan (P0 → P1 → P2 priority)
3. **Run test suite** before code review (target < 20 min PR time)
4. **Accessibility review** with axe-core + manual ARIA verification
5. **Integrate with 4-1 & 4-2** workflows; verify success messages display
6. **Code review** approval by senior dev + accessibility reviewer
7. **Merge to main** once all quality gates pass

---

## References

- **Story 4-1:** Edit Subscription Workflow (AC6 expects success toast)
- **Story 4-2:** Delete Subscription Workflow (AC6 expects success toast)
- **Project Context:** [docs/project-context.md](docs/project-context.md) — React 19, TypeScript, Vite, useReducer + Context
- **WCAG 2.1 Level A:** Accessibility standard (live regions, semantic HTML, focus management)
- **Test Framework:** Playwright E2E + vitest unit tests (with fake timers)

---

**Workflow Complete.** ✅
