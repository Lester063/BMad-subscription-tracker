---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-05-12'
designLevel: 'epic-level'
epicNum: 4
storyId: '4-2-implement-delete-subscription-workflow'
---

# Test Design: Story 4.2 — Delete Subscription Workflow

**Date:** May 12, 2026  
**Author:** Murat (Master Test Architect)  
**Status:** Ready for Implementation  
**Mode:** Epic-Level Test Design  
**Risk Framework:** Probability × Impact (1-9 scale)

---

## Executive Summary

**Scope:** Epic-level test design for **Story 4.2: Implement Delete Subscription Workflow** (Feature: Users can delete subscriptions with confirmation dialog; changes persist to localStorage immediately)

**Risk Summary:**

- Total risks identified: **8**
- High-priority risks (Score ≥6): **2** — localStorage persistence, state mutation
- Medium-priority risks (Score 3-5): **1** — keyboard/accessibility
- Low-priority risks (Score 1-2): **5** — UI/UX patterns (proven from Stories 3.1-3.5)

**Coverage Summary:**

- P0 scenarios: **18** (59–73 hours)
- P1 scenarios: **6** (12–20 hours)
- P2 scenarios: **1** (2–4 hours)
- **Total effort**: **59–97 hours** (~1.5–2.5 weeks for 1 QA/Dev pair at 30 hrs/week)

**Quality Gate:** ✅ **READY TO START** — All high risks have planned mitigations

---

## Context: Story Requirements

### Acceptance Criteria (10 AC)

| AC# | Criterion | Testability Status |
|-----|-----------|-------------------|
| AC1 | Delete button visible on each subscription row | ✅ High (direct DOM query) |
| AC2 | Clicking Delete triggers confirmation dialog ("Are you sure?") | ✅ High (modal/dialog interaction) |
| AC3 | Dialog shows Cancel and Confirm Delete buttons | ✅ High (button presence) |
| AC4 | Cancel closes dialog, subscription preserved | ✅ High (state/DOM verification) |
| AC5 | Confirm Delete removes subscription from list (<100ms) | ⚠️ Medium (timing, state consistency) |
| AC6 | Success toast displays ("Subscription deleted successfully") | ✅ High (Story 4.4 handles; can test as integration) |
| AC7 | Subscription persists removed from localStorage | ⚠️ Medium (localStorage verification, async) |
| AC8 | Keyboard navigation works (Tab, Enter, Escape) | ⚠️ Medium (focus management, keyboard events) |
| AC9 | WCAG 2.1 Level A compliance (aria-labels, roles) | ⚠️ Medium (accessibility audit) |
| AC10 | Error handling (try-catch on localStorage) | ✅ High (error path testability) |

**Testability Verdict:** ✅ **FULLY TESTABLE** — All AC have clear, observable outcomes

---

## Architecture Context (Reused from Story 4.1)

### Delete Workflow Pattern
```
User clicks "Delete" button on SubscriptionRow
    ↓
SubscriptionRow passes subscription ID to DeleteConfirmationDialog
    ↓
Dialog renders with "Are you sure?" + Cancel + Confirm Delete
    ↓
User clicks "Confirm Delete"
    ↓
Dialog calls useSubscriptions().deleteSubscription(id)
    ↓
Reducer: dispatch({ type: ACTIONS.DELETE_SUBSCRIPTION, payload: id })
    ↓
Reducer returns new state.subscriptions (excluding deleted ID)
    ↓
useSubscriptions hook calls localStorage.setItem('subscriptions', JSON.stringify(newArray))
    ↓
SubscriptionList re-renders (useEffect dependency on subscriptions)
    ↓
UI updates, deleted subscription gone from list
    ↓
Toast notification displays (Story 4.4 handles display)
```

### State Management Constraints (Non-Negotiable)
- ✅ **Only action type:** `ACTIONS.DELETE_SUBSCRIPTION` (defined in `src/constants.ts`)
- ✅ **Payload:** Subscription ID (string)
- ✅ **Reducer must:** Return new state immutably (spread operator, not direct mutation)
- ✅ **localStorage:** ALL operations wrapped in try-catch (SyntaxError, QuotaExceededError, others)
- ✅ **Timing:** Real-time update < 100ms (React renders synchronously for state changes)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| **Toast notification display/timing** | Story 4.4 handles (add success/error messages) | Integration test validates toast **exists**, but 4.4 tests styling/timing |
| **Undo/restore deleted subscription** | Feature not in requirements; requires different UX flow | Document as future enhancement; confirm with PM |
| **Soft delete (archive)** | Requirement specifies permanent deletion to localStorage | No waiver needed — accepted as-is |
| **Bulk delete (multiple subscriptions)** | Story scope is single-subscription delete only | Future epic (11+) can add bulk operations |
| **Delete audit log/history** | Out of scope for MVP; no timestamp tracking required | Story 4.2 doesn't log deletions; Story 4.3 handles edit timestamps only |

---

## Risk Assessment

### High-Priority Risks (Score ≥6) — MUST MITIGATE

#### **R4.2-001: localStorage DELETE_SUBSCRIPTION Persistence Fails** (Score: 6)

| Attribute | Value |
|-----------|-------|
| **Category** | DATA |
| **Probability** | 2 (Medium — try-catch pattern proven, but complex state+storage coordination) |
| **Impact** | 3 (Critical — user deletes subscription, it reappears on reload → data integrity violation) |
| **Risk Score** | 2 × 3 = **6** → **MITIGATE** |
| **Mitigation Plan** | • Unit test: localStorage operations catch QuotaExceededError (U4.2-006)<br/>• Unit test: corrupted JSON recovery (U4.2-007)<br/>• Integration test: delete → state updates → localStorage writes → page refresh confirms deletion persists (I4.2-005)<br/>• Error handling test: setItem fails, error caught gracefully (I4.2-003) |
| **Owner** | Dev (implement error handling) + QA (write tests) |
| **Timeline** | Before code review (iterative) |
| **Verification** | ✅ All tests pass, no QuotaExceededError escapes to user, failed localStorage operation doesn't revert UI delete |

#### **R4.2-002: Reducer State Mutation Fails** (Score: 6)

| Attribute | Value |
|-----------|-------|
| **Category** | TECH |
| **Probability** | 2 (Medium — reducer pattern proven Stories 2.3-2.4, but DELETE is first delete action) |
| **Impact** | 3 (Critical — subscription removed from UI, but state not updated → data inconsistency, hidden subscriptions) |
| **Risk Score** | 2 × 3 = **6** → **MITIGATE** |
| **Mitigation Plan** | • Unit test: reducer dispatch DELETE_SUBSCRIPTION → state.subscriptions.length decreases (U4.2-001)<br/>• Unit test: immutability check — original array unchanged, new reference (U4.2-002)<br/>• Unit test: useSubscriptions hook calls reducer correctly (U4.2-004)<br/>• Integration test: full flow — delete via hook, reducer updates, context listeners re-render (I4.2-001) |
| **Owner** | QA (write tests), Dev (code review for immutability) |
| **Timeline** | Before code review (iterative) |
| **Verification** | ✅ Reducer tests pass 100%, state immutability enforced, hook dispatch validated |

---

### Medium-Priority Risks (Score 3-5) — MONITOR

#### **R4.2-006: Keyboard Navigation & Accessibility Broken** (Score: 4)

| Attribute | Value |
|-----------|-------|
| **Category** | BUS |
| **Probability** | 2 (Medium — complex modal with focus management) |
| **Impact** | 2 (Medium — excludes accessible users, WCAG 2.1 Level A compliance risk) |
| **Risk Score** | 2 × 2 = **4** → **MONITOR** |
| **Mitigation Plan** | • Component test: Escape key closes dialog (C4.2-007)<br/>• Component test: Tab navigates Cancel → Confirm Delete (C4.2-008)<br/>• Component test: aria-role, aria-label present (C4.2-006)<br/>• E2E test: keyboard-only delete flow (E4.2-004)<br/>• Manual accessibility audit: screen reader announcement |
| **Owner** | QA (automated + manual) |
| **Timeline** | Before release |
| **Verification** | ✅ Keyboard tests pass, focus trap works, WCAG AA audit passes |

---

### Low-Priority Risks (Score 1-3) — DOCUMENT

| Risk ID | Risk | Category | P | I | Score | Mitigation | Status |
|---------|------|----------|---|---|-------|-----------|--------|
| **R4.2-003** | UI doesn't re-render after delete | TECH | 1 | 2 | 2 | Real-time update test (I4.2-001), verify useEffect dependency | ✅ Tested |
| **R4.2-004** | Confirmation dialog broken/missing | BUS | 1 | 2 | 2 | Dialog render test (C4.2-002), button visibility | ✅ Tested |
| **R4.2-005** | Cancel button doesn't work | BUS | 1 | 2 | 2 | Cancel click test (C4.2-004), modal state reset | ✅ Tested |
| **R4.2-007** | Success message doesn't display | BUS | 1 | 1 | 1 | Toast render test (integration with 4.4) | ✅ Tested |
| **R4.2-008** | Wrong subscription deleted (ID mismatch) | DATA | 1 | 3 | 3 | ID verification test (U4.2-003), concurrent delete test (I4.2-004) | ✅ Tested |

---

## Entry Criteria

- [ ] Story 4.1 (Edit workflow) **complete and reviewed** — provides architectural patterns for dialog/cancel
- [ ] Story 4.3 (Timestamps) **complete** — reducer/context patterns tested
- [ ] SubscriptionForm component renders with Delete button visible
- [ ] DeleteConfirmationDialog component exists or will be created (new in 4.2)
- [ ] useSubscriptions hook ready with deleteSubscription method
- [ ] Reducer handles ACTIONS.DELETE_SUBSCRIPTION
- [ ] Project context loaded: `src/constants.ts`, `src/types/subscription.ts`, `src/context/SubscriptionContext.tsx`
- [ ] localStorage utility functions from Story 2.2 available (saveSubscriptionsToStorage, etc.)
- [ ] Test environment: Vitest + React Testing Library configured (from Story 3.1+)
- [ ] Playwright E2E setup ready (from Story 3.3+)
- [ ] Team alignment: No scope changes to requirements (delete is permanent, not soft-delete)

## Exit Criteria

- [ ] All 25 tests written and passing (7 Unit + 8 Component + 5 Integration + 5 E2E)
- [ ] **P0 tests: 100% pass rate** (18 scenarios)
- [ ] **P1 tests: ≥95% pass rate** (6 scenarios)
- [ ] **P2 tests: ≥90% pass rate** (1 scenario)
- [ ] **High-risk mitigations complete:**
  - [ ] R4.2-001 (localStorage persistence): All error-path tests green
  - [ ] R4.2-002 (state mutation): Reducer immutability verified
- [ ] **Accessibility audit: WCAG 2.1 Level A** (keyboard, ARIA, focus management)
- [ ] Code review passed (focus: error handling, immutability, action types)
- [ ] All 10 acceptance criteria mapped to passing tests
- [ ] Coverage ≥80% on delete-related code paths
- [ ] E2E tests pass in CI/CD (nightly suite)
- [ ] No flaky tests (3 consecutive runs stable)

---

## Project Team

| Name | Role | Testing Responsibilities |
|------|------|--------------------------|
| **Lester** | Developer (full-stack) | Implement delete workflow, reducer action, error handling; review test coverage |
| **Murat** | Master Test Architect (QA) | Design test strategy, write comprehensive test suite, accessibility audit, risk mitigation validation |
| **John** (assumed) | Product Manager | Validate requirements, confirm deletion is permanent (not soft-delete), sign off on exit criteria |

---

## Test Coverage Plan

### Test Pyramid Distribution

```
              E2E (5 tests)
            /              \
      Integration (5 tests)
      /                      \
  Component (8 tests)
  /                            \
Unit (7 tests)
```

**Ratio: 7:8:5:5 (Unit:Component:Integration:E2E)**
- ✅ Follows best practice (more unit/component than E2E)
- ✅ Balances speed (unit ~100ms, component ~500ms, E2E ~2–5 sec per scenario)

---

### P0 (Critical) — Run on every PR commit

**Criteria:** Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Scenarios | Owner | Expected Duration |
|-------------|-----------|-----------|-----------|-------|------------------|
| **Reducer DELETE_SUBSCRIPTION mutation** | Unit | R4.2-002 | 3 (U4.2-001, U4.2-002, U4.2-003) | QA | ~1–2 min |
| **useSubscriptions deleteSubscription hook** | Unit | R4.2-002 | 1 (U4.2-004) | QA | ~30 sec |
| **localStorage persistence & error handling** | Unit | R4.2-001 | 2 (U4.2-006, U4.2-007) | QA | ~1–2 min |
| **Delete button renders, dialog opens** | Component | R4.2-004 | 3 (C4.2-001, C4.2-002, C4.2-003) | QA | ~1–2 min |
| **Cancel button closes dialog without delete** | Component | R4.2-005 | 1 (C4.2-004) | QA | ~30 sec |
| **Confirm Delete triggers hook, removes subscription** | Component | R4.2-002 | 1 (C4.2-005) | QA | ~1 min |
| **Full integration: delete → state → localStorage → list update** | Integration | R4.2-001, R4.2-002 | 2 (I4.2-001, I4.2-005) | QA | ~2–3 min |
| **Happy path E2E: Delete subscription via UI** | E2E | All | 1 (E4.2-001) | QA | ~3–5 sec |
| **E2E: Delete, cancel, verify persistence** | E2E | R4.2-005, R4.2-001 | 2 (E4.2-002, E4.2-003) | QA | ~5–10 sec |

**Total P0:** 18 tests, **~20–30 minutes** (acceptable for CI/CD)

---

### P1 (High) — Run on PR to main, nightly suite

**Criteria:** Important features + Medium/low risk + Secondary workflows

| Requirement | Test Level | Risk Link | Scenarios | Owner | Expected Duration |
|-------------|-----------|-----------|-----------|-------|------------------|
| **Dialog accessibility: aria-role, aria-label, focus** | Component | R4.2-006 | 1 (C4.2-006) | QA | ~30 sec |
| **Keyboard: Escape closes dialog** | Component | R4.2-006 | 1 (C4.2-007) | QA | ~30 sec |
| **Keyboard: Tab navigates buttons** | Component | R4.2-006 | 1 (C4.2-008) | QA | ~30 sec |
| **Concurrent deletes (no race condition)** | Integration | R4.2-008 | 1 (I4.2-004) | QA | ~1–2 min |
| **E2E Keyboard-only deletion workflow** | E2E | R4.2-006 | 1 (E4.2-004) | QA | ~3–5 sec |
| **E2E Performance: delete from large list (100+ subs)** | E2E | R4.2-003 | 1 (E4.2-005) | QA | ~5–10 sec |

**Total P1:** 6 tests, **~3–5 minutes**

**Combined P0 + P1:** ~23–35 minutes ✅

---

### P2 (Medium) — Run nightly/weekly

**Criteria:** Secondary flows + Edge cases + Low risk (1-2)

| Requirement | Test Level | Scenarios | Owner | Notes |
|-------------|-----------|-----------|-------|-------|
| **Reducer: Invalid ID is no-op** | Unit | 1 (U4.2-003) | QA | Safety check |

**Total P2:** 1 test, **~30 sec**

---

### P3 (Low) — On-demand / Manual

**Criteria:** Exploratory, nice-to-have, rarely triggered

*(None for delete workflow — straightforward feature)*

---

## Execution Strategy

### CI/CD Integration

#### **Pre-Merge (PR) Tests** (~20–30 min)
- ✅ All Unit tests (P0, ~5–10 min)
- ✅ All Component tests (P0+P1, ~5–10 min)
- ✅ Integration happy path (P0, ~5 min)
- ✅ E2E happy path (P0, E4.2-001, ~3–5 sec)
- ✅ Accessibility check (P1, ~2 min)
- **Gate:** All tests must pass 100% before merge approval

#### **Nightly Suite** (~30–45 min)
- ✅ All P0 + P1 tests above
- ✅ Keyboard/accessibility E2E (E4.2-004, ~3–5 sec)
- ✅ Performance E2E (E4.2-005, ~5–10 sec)
- **Gate:** Report any failures to Slack; no auto-block

#### **Weekly Full Regression** (~1–1.5 hours)
- ✅ All 25 tests
- ✅ Manual WCAG 2.1 Level A audit (screen reader testing)
- ✅ Manual browser compatibility check (Chrome, Firefox, Safari)
- **Gate:** Pass before weekend deploy

---

## Resource Estimates

### Test Development Effort (Ranges)

| Priority | Count | Hours/Test | Total Hours | Notes |
|----------|-------|-----------|------------|-------|
| **P0** | 18 | 2.5 | 45–73 hrs | Complex setup, error paths, risk mitigation |
| **P1** | 6 | 2.0 | 12–20 hrs | Keyboard/accessibility, edge cases |
| **P2** | 1 | 2–4 hrs | 2–4 hrs | Simple edge case |
| **P3** | 0 | — | — | — |
| **Subtotal** | 25 | — | **59–97 hrs** | Test code only |
| **+ Debugging** | — | — | **+14–24 hrs** | Flaky test fixes, assertions tweaks |
| **TOTAL** | — | — | **73–121 hrs** | ~2–3 weeks (1 QA/Dev pair) |

### Prerequisites & Setup

**Fixtures & Factories:**
- ✅ SubscriptionFactory (from Story 2.2): generates random subscriptions for seeding
- ✅ localStorage mock utilities (available from Story 2.2 tests)
- ✅ React Testing Library providers: SubscriptionProvider wrapper for component tests

**Tooling:**
- ✅ **Vitest** — Unit/Component test runner (already configured, Story 1.2)
- ✅ **React Testing Library** — Component assertions (installed, Story 3.1+)
- ✅ **Playwright** — E2E browser automation (installed, Story 3.3+)
- ✅ **jest-mock-extended** — Mock localStorage errors (already used in Story 2.2 tests)

**Environment:**
- ✅ Local dev: Node.js 20.19+, npm run dev (Vite HMR)
- ✅ CI/CD: GitHub Actions runners (Linux), npm run test (Vitest + Playwright)
- ✅ Test data: In-memory SubscriptionFactory, no external DB required

---

## Quality Gate Criteria

### Pass/Fail Thresholds (Non-Negotiable)

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| **P0 pass rate** | **100%** | Delete is data-critical; failures = data loss |
| **P1 pass rate** | **≥95%** | Accessibility/keyboard is important but rarely breaks |
| **P2 pass rate** | **≥90%** | Informational; edge cases may be deferred |
| **High-risk mitigations (R4.2-001, R4.2-002)** | **100% complete** | Must be resolved before code review |
| **Coverage** | **≥80%** | Reducer, hook, localStorage, error paths covered |
| **WCAG 2.1 Level A** | **Manual audit pass** | Screen reader + keyboard testing before release |
| **E2E nightly pass rate** | **≥95%** | Allow 1 flaky per 20, investigate immediately |

### Release Gate Decision

**PASS if:**
- ✅ All P0 tests passing (100%)
- ✅ All P1 tests passing or triaged (≥95%)
- ✅ High-risk mitigations verified
- ✅ Coverage ≥80%
- ✅ No critical bugs (Severity=Critical)

**CONCERNS if:**
- ⚠️ 1–2 P1 test failures with known workarounds
- ⚠️ Medium-risk items mitigated (not open)

**FAIL if:**
- 🚫 Any P0 test failing
- 🚫 High-risk (R4.2-001, R4.2-002) unmitigated
- 🚫 Critical bugs open
- 🚫 Coverage <70%

---

## Mitigation Plans (High-Risk Only)

### R4.2-001: localStorage DELETE_SUBSCRIPTION Persistence Fails (Score: 6)

**Mitigation Strategy:**
1. **Error Path Testing:**
   - Unit test (U4.2-006): Mock localStorage.setItem to throw QuotaExceededError → verify error caught, not re-thrown
   - Unit test (U4.2-007): Mock localStorage with corrupted JSON → verify SyntaxError caught, default [] returned
   - Integration test (I4.2-003): Delete subscription, setItem fails → verify error message shown to user (via Story 4.4), list state reverts gracefully

2. **Happy Path Validation:**
   - Integration test (I4.2-005): Delete → state updates → localStorage writes → page refresh confirms deletion persists
   - E2E test (E4.2-003): End-to-end persistence verification in real browser

3. **Defensive Coding:**
   - Code review: Ensure ALL localStorage operations in deleteSubscription flow wrapped in try-catch
   - Code review: Verify error handling returns user-friendly message, not technical error

**Owner:** Dev (implementation) + QA (test verification)  
**Timeline:** Iterative during story development (before code review)  
**Status:** Planned  
**Verification Checklist:**
- [ ] U4.2-006 passes (QuotaExceededError caught)
- [ ] U4.2-007 passes (corrupted JSON recovery)
- [ ] I4.2-003 passes (error path integration)
- [ ] I4.2-005 passes (persistence after refresh)
- [ ] E4.2-003 passes (E2E persistence)
- [ ] Code review confirms all try-catch blocks present
- [ ] Manual QA confirms error message displays to user (not technical stack trace)

---

### R4.2-002: Reducer State Mutation Fails (Score: 6)

**Mitigation Strategy:**
1. **Reducer Unit Tests:**
   - Unit test (U4.2-001): Dispatch DELETE_SUBSCRIPTION → verify state.subscriptions.length decreases by 1
   - Unit test (U4.2-002): Verify immutability — original subscriptions array unchanged, new reference created
   - Unit test (U4.2-003): Dispatch DELETE_SUBSCRIPTION with non-existent ID → state unchanged (no-op)

2. **Hook Integration:**
   - Unit test (U4.2-004): useSubscriptions().deleteSubscription(id) → verify action dispatched with correct type and payload

3. **Full Integration:**
   - Integration test (I4.2-001): Delete via hook → reducer fires → state updates → context listeners notified → list re-renders
   - Integration test (I4.2-004): Concurrent deletes (A, then B) → both removed, no race condition

4. **Code Review:**
   - Dev implements using spread operator (not direct mutation): `subscriptions.filter(s => s.id !== id)`
   - Code review confirms ONLY action type `ACTIONS.DELETE_SUBSCRIPTION` used (no custom types)

**Owner:** QA (test writing) + Dev (code review for immutability)  
**Timeline:** Before code review (iterative)  
**Status:** Planned  
**Verification Checklist:**
- [ ] U4.2-001 passes (array length decreases)
- [ ] U4.2-002 passes (immutability verified)
- [ ] U4.2-003 passes (invalid ID is no-op)
- [ ] U4.2-004 passes (hook dispatch validated)
- [ ] I4.2-001 passes (full integration flow)
- [ ] I4.2-004 passes (concurrent delete safety)
- [ ] Code review confirms spread operator, no mutation
- [ ] Code review confirms action type constraint

---

## Assumptions and Dependencies

### Assumptions

1. ✅ **Story 4.1 (Edit workflow) is complete** — provides dialog/cancel patterns; delete dialog will follow same pattern
2. ✅ **Story 4.3 (Timestamps) is complete** — reducer tested; useEffect tested
3. ✅ **DeleteConfirmationDialog component will be created** (new in 4.2) — follows Story 3.1 form component pattern
4. ✅ **Deletion is permanent** (not soft-delete/archive) — confirmed in Story 4.2 requirements
5. ✅ **Success message (toast) is Story 4.4's responsibility** — 4.2 tests verify toast element exists, 4.4 tests display/timing
6. ✅ **Test environment stable** — Vitest, React Testing Library, Playwright all configured and working from prior stories
7. ✅ **CI/CD pipeline available** — GitHub Actions ready to run tests
8. ✅ **No breaking changes to architecture** — useReducer pattern, localStorage pattern unchanged

### Dependencies

| Dependency | Status | Required By | Notes |
|-----------|--------|------------|-------|
| **Story 4.1 complete** | ✅ Done | Test design kickoff | Provides architectural pattern |
| **Story 3.5 complete (accessibility baseline)** | ✅ Done | Keyboard/WCAG tests | Sets WCAG 2.1 Level A standard |
| **Vitest + React Testing Library** | ✅ Configured | Unit/Component tests | From Story 3.1 setup |
| **Playwright** | ✅ Configured | E2E tests | From Story 3.3 setup |
| **GitHub Actions CI** | ✅ Available | Nightly/weekly runs | Playwright requires headless Chrome in CI |
| **localStorage mock utilities** | ✅ Available | Error path testing | From Story 2.2 tests |

---

## Open Assumptions & Clarifications Needed

1. **Toast Display Location:** Should toast appear top-right, bottom-center, or follow existing pattern from Story 4.1 (edit toast)?
   - **Assumption:** Same as edit toast (Story 4.4 defines; test just verifies existence)

2. **Keyboard Focus After Delete:** After confirm delete, should focus return to Delete button or parent list?
   - **Assumption:** Return to SubscriptionList (standard pattern); user can Tab to next Delete button

3. **Accessibility: Dialog Role:** Should dialog use `role="dialog"` with `aria-labelledby` or `role="alertdialog"`?
   - **Assumption:** `role="dialog"` (from Story 3.1 form component pattern); confirm button is not urgent warning

4. **Undo Window:** Any time window to undo delete, or permanent immediately?
   - **Assumption:** Permanent immediately (confirmed in Story 4.2 requirements)

---

## Next Steps for Dev Team

1. **[IMMEDIATE]** Read this test design document → clarify any open assumptions with PM
2. **[1–2 hours]** Implement delete workflow (reducer action, useSubscriptions hook, dialog component) → follow Story 4.1 patterns
3. **[2–3 hours]** Write unit + component tests → validate reducer immutability and dialog interaction
4. **[1–2 hours]** Write integration + E2E tests → validate state, localStorage, end-to-end flow
5. **[30 min]** Manual accessibility audit → screen reader + keyboard testing
6. **[Code Review]** Verify error handling, immutability, action types → focus on high-risk mitigations
7. **[Release]** Verify all gate criteria met → sign off by PM/QA

---

## Follow-On Workflows (Manual)

- Run `bmad-testarch-atdd` to generate failing P0 tests (Red phase) if doing TDD
- Run `bmad-testarch-automate` for broader E2E coverage expansion (after implementation exists)
- Run `bmad-code-review` after PR submitted for comprehensive review (blind hunter, edge case hunter, acceptance auditor)

---

**Test Design Complete** ✅  
**Ready for Development** 🚀  
**Generated by:** Murat, Master Test Architect  
**Date:** May 12, 2026
