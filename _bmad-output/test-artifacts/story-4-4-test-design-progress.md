---
workflowStatus: 'in-progress'
totalSteps: 5
stepsCompleted: ['step-03-risk-and-testability']
lastStep: 'step-03-risk-and-testability'
nextStep: 'step-04-coverage-plan'
lastSaved: '2026-05-13'
projectContext: 'BMad-subscription-tracker'
storyId: '4-4-add-success-error-messages-toast-notifications'
storyTitle: 'Add Success & Error Messages (Toast Notifications)'
epicId: '4'
epicTitle: 'Edit & Delete Subscriptions'
---

# Test Design: Story 4-4 (Toast Notifications)

## Story Context

**Status:** Backlog (Story 4-1 & 4-2 complete; both depend on 4-4)

**User Story:**
```
As a user,
I want success and error messages to appear as toast notifications,
So that I get clear feedback on subscription operations (add, edit, delete).
```

**Scope:**
- Toast component displays success/error messages
- Auto-dismisses after 3 seconds
- Accessible (WCAG 2.1 Level A, aria-live, role attributes)
- Integrates with edit workflow (4-1) and delete workflow (4-2)
- Handles concurrent toasts (queue/priority logic)

**Out of Scope:**
- Undo workflows
- Toast position/animation customization
- Toast action buttons (dismiss only)

---

## Risk Assessment (Step 3)

### All Identified Risks

| Risk ID | Category | Title | P | I | Score | Action | Mitigation Strategy |
|---------|----------|-------|---|---|-------|--------|---------------------|
| **R1** | TECH | Toast auto-dismiss fails or delays | 2 | 2 | **4** | MONITOR | E2E: verify dismiss within 100ms of 3s timer; capture timing traces |
| **R2** | TECH | Concurrent toasts queue/overlap incorrectly | 2 | 2 | **4** | MONITOR | Unit: queue logic under concurrent dispatch; E2E: rapid edits/deletes |
| **R3** | SEC | Toast not screen-reader accessible (WCAG) | 2 | 2 | **4** | MONITOR | axe-core + manual ARIA checks; aria-live, aria-atomic, role attributes |
| **R4** | BUS | Toast system doesn't integrate with 4-1/4-2 | 1 | 3 | **3** | DOCUMENT | Validate dispatch wiring; integration tests with both workflows |
| **R5** | TECH | React lifecycle issues (memory leaks, unmount) | 1 | 2 | **2** | DOCUMENT | useEffect cleanup verification; test in React.StrictMode |

### Risk Summary

- ✅ **No blockers** (score < 9)
- ⚠️ **Two MONITOR risks (R1, R2):** Timing and concurrency require disciplined E2E + unit coverage
- 🟢 **Low residual risk** with proper test design

---

## Testability Assessment (Story-Level)

### Controllability
- ✅ **High:** Mock toast dispatch via Context; seed state with custom hook
- ✅ **useReducer action dispatch** is deterministic and testable

### Observability
- ✅ **High:** Toast state observable via React DevTools; assertions on DOM presence/absence
- ✅ **Timing:** Capture timestamps in tests; measure auto-dismiss delay

### Reliability
- ✅ **High:** Toast logic isolated in custom hook; no external API dependencies
- ⚠️ **Timing tests** need retry logic for flakiness tolerance

### ASRs (Architecturally Significant Requirements)

| ASR | Type | Justification |
|-----|------|---------------|
| **Context-based toast dispatch** | ACTIONABLE | Ensure useToast hook exposes `show(msg, type)` and `dismiss()` methods; wire to reducer |
| **3-second auto-dismiss timer** | ACTIONABLE | Use setTimeout; cleanup on unmount; test with fake timers (vitest.useFakeTimers) |
| **Accessibility (aria-live, role)** | ACTIONABLE | Toast must have `role="status"`, `aria-live="polite"`, `aria-atomic="true"` |
| **Queue vs Single** | FYI | Decide: show all toasts simultaneously or queue one at a time? Current spec implies queue (3s dismiss → next shows) |

---

## Coverage Plan (Step 4)

### Test Coverage Matrix

| ID | Scenario | Requirement | Test Level | Priority | Rationale |
|----|----------|-------------|-----------|----------|-----------|
| **TC1** | Toast displays on successful edit | AC6 (4-1): "Subscription updated successfully" | E2E | **P0** | Core workflow; both 4-1 & 4-2 depend on this |
| **TC2** | Toast displays on successful delete | AC6 (4-2): "Subscription deleted successfully" | E2E | **P0** | Core workflow; user-visible feedback required |
| **TC3** | Toast auto-dismisses after 3 seconds | R1 (Risk): Timing criticality | E2E | **P1** | Timing risk (score=4); verify dismiss within 100ms window |
| **TC4** | Concurrent edits show correct message order | R2 (Risk): Concurrent queue correctness | E2E | **P1** | Concurrency risk (score=4); rapid operations edge case |
| **TC5** | Toast is keyboard accessible (Tab, Enter) | 4-1 AC8 + 4-2 AC8: Keyboard nav | E2E | **P1** | WCAG 2.1 Level A requirement |
| **TC6** | Toast has aria-live, aria-atomic, role attributes | R3 (Risk): Screen reader accessibility | Component | **P1** | WCAG compliance; accessibility risk (score=4) |
| **TC7** | Error toast displays on localStorage failure | AC10 (4-1 & 4-2): Error handling | E2E | **P1** | Graceful degradation; error paths critical |
| **TC8** | Toast `useToast` hook exposes show/dismiss methods | ASR: Context-based dispatch | Unit | **P1** | Architectural requirement; testability foundation |
| **TC9** | useEffect cleanup prevents memory leaks | R5 (Risk): Lifecycle issues | Component | **P2** | React.StrictMode verification; tech debt prevention |
| **TC10** | Toast dismisses on user click (manual dismiss) | Feature: Manual close option | E2E | **P2** | Secondary flow; user control |
| **TC11** | Very long messages wrap/truncate correctly | UX: Content overflow | Visual | **P2** | Edge case; CSS robustness |
| **TC12** | Toast component mounts/unmounts correctly | Component lifecycle | Component | **P3** | Smoke test; error boundaries |

---

### Test Priorities & Execution Strategy

#### **P0 Tests (Must Pass Before Release)**
- TC1, TC2: Success feedback on core workflows (edit, delete)
- **Level:** E2E (both workflows via UI)
- **Execution:** All PRs
- **Pass Rate:** 100%

#### **P1 Tests (Should Pass; Blocks Release if Failed)**
- TC3, TC4, TC5, TC6, TC7, TC8: Timing, accessibility, error handling
- **Level:** E2E + Component + Unit
- **Execution:** All PRs
- **Pass Rate:** ≥ 95%

#### **P2 Tests (Nice to Have; Can Defer)**
- TC9, TC10, TC11: Lifecycle, manual dismiss, UX polish
- **Level:** Component + Visual
- **Execution:** Nightly or weekly
- **Pass Rate:** ≥ 90%

#### **P3 Tests (Exploratory; Document If Skipped)**
- TC12: Smoke test
- **Level:** Component
- **Execution:** Manual or spot-check
- **Pass Rate:** N/A (informational)

---

### Execution Strategy

**PR Mode (< 15 min target):**
- All P0 E2E tests (TC1, TC2) — ~3–5 min
- P1 E2E tests (TC3–TC7) — ~8–10 min
- P1 Unit/Component (TC8) — ~1–2 min
- **Total PR time: ~12–17 min**

**Nightly/Weekly:**
- P2 Component/Visual (TC9–TC11) — can be slower; visual regression snapshots
- Extended timing/load tests (if needed)

**CI Execution:**
- Run full suite (P0 + P1 + P2) on `main` branch merges
- Fast-fail on P0/P1; P2 failures are warnings

---

### Resource Estimates (Development + QA Review)

| Priority | Scenarios | Effort Range | Notes |
|----------|-----------|--------------|-------|
| **P0** | TC1, TC2 | 12–18 hours | Core workflows; implementation + test + integration with 4-1/4-2 |
| **P1** | TC3–TC8 | 25–40 hours | Timing tests, accessibility, error handling; requires fake timers, mocking, axe-core |
| **P2** | TC9–TC11 | 10–15 hours | Lifecycle, UX polish, visual regression setup |
| **P3** | TC12 | 2–3 hours | Smoke test only |
| **Total** | All | **49–76 hours** | ~1–2 weeks (single developer, full-time focus) |

**Timeline Estimate:** ~6–10 business days (including code review and iteration)

---

### Quality Gates (Release Decision Criteria)

| Gate | Criteria | Status |
|------|----------|--------|
| **P0 Pass Rate** | 100% (no failures allowed) | ✅ Must pass |
| **P1 Pass Rate** | ≥ 95% (allow 1 flaky; retry once) | ✅ Must pass |
| **P2 Pass Rate** | ≥ 90% (can defer edge cases to hotfix) | ⚠️ Monitor |
| **Coverage Target** | ≥ 80% (lines + branches) | ✅ Measured |
| **Risk Mitigation** | All MONITOR risks (R1, R2, R3) mitigated | ✅ Must complete |
| **Accessibility** | axe-core + manual ARIA audit pass | ✅ Mandatory |
| **Code Review** | Approved by one senior dev + accessibility reviewer | ✅ Required |

---

---

## Completion Report (Step 5)

**Workflow Status:** ✅ COMPLETE

**Output Files Generated:**
1. [test-design-story-4-4.md](test-design-story-4-4.md) — Final test design document

**Key Outputs:**
- ✅ Risk Assessment: 5 risks identified; 0 blockers; 3 MONITOR-level (score ≥4)
- ✅ Coverage Matrix: 12 test scenarios (TC1–TC12) across P0, P1, P2, P3
- ✅ Resource Estimates: 49–76 hours (~1–2 weeks, single developer)
- ✅ Quality Gates: P0=100%, P1≥95%, P2≥90%, axe-core 0 violations
- ✅ Execution Strategy: <20 min PR time (P0+P1); P2 nightly; full suite on main merge

**Critical Assumptions to Validate:**
1. Toast state managed via useReducer + Context (per project standards)
2. Stories 4-1 & 4-2 complete and awaiting toast system integration
3. Global CSS variables (success green, error red) available
4. Playwright + vitest with fake timers ready for test execution

---

**Workflow delivered. Handing off to developer for story implementation.******
