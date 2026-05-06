---
workflowStatus: 'complete'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
workflowMode: 'epic-level'
lastStep: 'step-05-generate-output'
nextStep: null
lastSaved: '2026-05-05'
maturaSessions: 'murat-test-design-4.1-4.3'
---

# Test Design: Stories 4.1 & 4.3 — Edit & Timestamp Workflows

**Architect:** Murat, Master Test Architect  
**Date:** May 5, 2026  
**Scope:** Epic 4 — Edit & Delete Subscriptions (Stories 4.1 and 4.3)  
**Mode:** Epic-Level Test Design  
**Stakeholders:** Development (Amelia), QA, Product (John)

---

## Executive Summary

**Stories 4.1 and 4.3 represent a focused, well-architected pair of dependent stories:**

- **Story 4.1 (Edit Subscription Workflow):** Reuses SubscriptionForm component in dual-mode (Add + Edit), pre-populates fields, implements fuzzy duplicate validation excluding the current subscription, real-time list update, keyboard navigation, accessibility compliance.
- **Story 4.3 (Update Timestamps on Edit):** Adds timestamp tracking (`updatedAt` field) while preserving `createdAt` immutability; minimal implementation footprint (one line of code change).

**Risk Level:** 🟢 **GREEN** — Moderate risks (score 6 on two items) mitigated by:
- Established test patterns from Stories 3.1, 3.2, 3.5
- Reuse of SubscriptionProvider + React Testing Library patterns
- Atomic state mutations via useReducer
- localStorage mock proven in Story 3.3

**Test Coverage Target:** 95%+ unit + integration coverage; green-phase tests auto-run in CI

**Estimated Test Implementation:** 6–8 hours (36 test cases, parallel execution via vitest)

---

## Risk Assessment Matrix

### High-Risk Items (Score ≥ 6)

| Category | Risk | P | I | Score | Status | Mitigation |
|----------|------|---|---|-------|--------|-----------|
| **TECH** | Edit mode state isolated from Add mode; form reset/clear race conditions | 2 | 3 | **6** | 🟡 Mitigatable | Unit + integration tests; test form reset with specific assertions; verify AC2 button text change |
| **TECH** | Fuzzy duplicate check excludes current subscription — subtle off-by-one logic | 2 | 3 | **6** | 🟡 Mitigatable | **Explicit AC4 test:** Edit subscription with same name should NOT error; different name must validate; excludeId must match editingSubscription.id |

### Medium-Risk Items (Score 3–5)

| Category | Risk | P | I | Score | Status | Mitigation |
|----------|------|---|---|-------|--------|-----------|
| **TECH** | Timestamp not persisted on reload (JSON serialize/deserialize) | 1 | 3 | **3** | 🟢 Covered | Integration test: edit → reload → assert timestamp persisted |
| **TECH** | createdAt accidentally mutated during edit (spread operator misuse) | 1 | 3 | **3** | 🟢 Covered | Unit test snapshot: verify createdAt === original after object spread |
| **DATA** | Storage quota exceeded; partial save with incorrect timestamp | 1 | 3 | **3** | 🟢 Covered | localStorage mock error → verify rollback (no timestamp update) |

### Low-Risk Items (Score ≤ 2)

| Category | Risk | P | I | Score | Status | Mitigation |
|----------|------|---|---|-------|--------|-----------|
| **UI** | Real-time list update timing; glitch perception | 1 | 2 | **2** | 🟢 Covered | Integration test: assert list update < 100ms |
| **UI/A11Y** | Keyboard Escape may be missed in form submission | 1 | 2 | **2** | 🟢 Covered | Keyboard nav test suite (from 3.5 patterns) |
| **DATA** | localStorage corruption on simultaneous edits (browser constraint) | 1 | 2 | **2** | 🟢 Covered | Atomic mutations via useReducer; single save per action |
| **BUS** | Component unmount during async save | 1 | 2 | **2** | 🟢 Covered | Cleanup test; verify submission completes before unmount |

**Overall Risk Rating:** 🟢 **GREEN** — All high-risk items are mitigatable via documented test coverage.

---

## Testability Assessment

### Strengths

✅ **Component Reusability**  
- SubscriptionForm dual-purpose pattern (Add + Edit) reduces complexity
- Patterns from Stories 3.1, 3.2 already tested and proven
- Easy to test both modes in separate describe blocks

✅ **State Management Architecture**  
- useReducer + Context isolated; easy to verify mutations
- UPDATE_SUBSCRIPTION action pre-exists from Story 2.3
- Reducer logic is pure function (deterministic, mockable)

✅ **Form Validation**  
- React Hook Form v7+ provides consistent validation interface
- Custom validators (useFuzzyMatch) are pure functions
- Pre-population via `defaultValues` is standard pattern

✅ **localStorage Integration**  
- Vitest can easily spy/mock localStorage
- JSON serialize/deserialize is deterministic
- Error scenarios (QuotaExceededError, SyntaxError) are predictable

✅ **Accessibility**  
- WCAG 2.1 Level A patterns established in Story 3.5
- Semantic HTML, aria-labels, focus indicators already in place
- No new a11y concerns for edit mode

✅ **Testing Framework**  
- Vitest + React Testing Library proven in Story 3.5
- SubscriptionProvider wrapper pattern established
- Keyboard navigation tests already written

### Concerns

🟡 **Edit Mode State Complexity**  
- Must isolate form state (editing vs. adding)
- Must verify form clears after submit
- Must test Cancel button doesn't trigger submit
- **Mitigation:** Separate describe blocks; explicit state assertions

🟡 **Fuzzy Duplicate Logic Subtlety**  
- excludeId parameter must exclude current subscription
- Different names must pass validation
- Same name must pass validation (AC4 critical)
- **Mitigation:** Three explicit test cases for AC4

🟡 **Timestamp Ordering**  
- createdAt immutable; updatedAt must change
- Multiple edits must produce increasing timestamps
- **Mitigation:** Snapshot tests; timestamp ordering assertions

**Conclusion:** No blockers. Architecture is testable. Proceed to implementation.

---

## Test Coverage Plan

### Test Pyramid Distribution

```
┌─────────────────────────────────────────────────┐
│  E2E / System (5–10%)                           │
│  Dashboard full flow: Edit → Save → Reload      │
└─────────────────────────────────────────────────┘
         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
┌─────────────────────────────────────────────────┐
│  Integration (35–40%)                           │
│  Component + hooks + context + localStorage     │
│  - Edit mode full cycle (form → list → toast)   │
│  - Timestamp persistence                        │
│  - Error handling (storage full, validation)    │
└─────────────────────────────────────────────────┘
         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
┌─────────────────────────────────────────────────┐
│  Unit (50–55%)                                  │
│  - Edit mode detection (isEditMode logic)       │
│  - Form pre-population (defaultValues)          │
│  - Button text changes (conditional render)     │
│  - Cancel flow (state management)               │
│  - Fuzzy duplicate check (excludeId logic)      │
│  - Timestamp mutations (spread operator)        │
│  - createdAt preservation                       │
│  - Keyboard navigation                          │
│  - Error messages (validation, storage)         │
└─────────────────────────────────────────────────┘
```

### Test Case Matrix: All Acceptance Criteria

#### Story 4.1: Edit Subscription Workflow (24 Test Cases)

**AC1: Pre-populated Form**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.01 | Form pre-populates name field | Unit | Render SubscriptionForm with editingSubscription prop | `screen.getByDisplayValue('Netflix')` found |
| 4.1.02 | Form pre-populates cost field | Unit | Render with existing subscription | `screen.getByDisplayValue('15.99')` found |
| 4.1.03 | Form pre-populates dueDate field | Unit | Render with existing subscription | `screen.getByDisplayValue('5')` found |
| 4.1.04 | All fields pre-populated simultaneously | Integration | Dashboard → Edit → verify all fields | All three fields display current values |

**AC2: Dynamic Submit Button Text**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.05 | Submit button says "Update" in edit mode | Unit | Render with editingSubscription prop | Button text === "Update Subscription" |
| 4.1.06 | Submit button says "Add" in add mode | Unit | Render with editingSubscription = null | Button text === "Add Subscription" |
| 4.1.07 | Button text matches form mode | Integration | Toggle between add/edit modes | Button text changes correctly each time |

**AC3: Cancel Button Present**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.08 | Cancel button visible only in edit mode | Unit | Render with/without editingSubscription | Button found only when editing |
| 4.1.09 | Cancel button click calls onCancel callback | Unit | Render with onCancel prop, click button | `onCancel` called once |
| 4.1.10 | Cancel button doesn't trigger submit | Unit | Render, click cancel | Form not submitted; onCancel called instead |
| 4.1.11 | Clicking Cancel exits edit mode | Integration | Edit → click Cancel → form clears | Edit mode exits; form ready for new entry |

**AC4: Fuzzy Match Exclusion (HIGH RISK)**

| Test ID | Title | Level | Description | Assertions | Risk |
|---------|-------|-------|-------------|-----------|------|
| 4.1.12 | Same name allowed in edit mode (excludes current) | **Unit** | Edit Netflix → name stays "Netflix" → submit | **NO error** | **HIGH** 🔴 |
| 4.1.13 | Different name validates normally | Unit | Edit Netflix → change to "Hulu" → submit | Validation passes |  |
| 4.1.14 | Actual duplicate (different subscription) errors | Integration | Two subscriptions both "Netflix"; edit second to "Netflix" | Error: "already have" | |
| 4.1.15 | excludeId parameter excludes correct ID | Unit | useFuzzyMatch called with editingSubscription.id | Duplicate check skips that ID | **HIGH** 🔴 |

**AC5: Real-Time List Update**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.16 | List updates < 100ms after submit | Integration | Dashboard → edit → submit → measure time | Update time < 100ms |
| 4.1.17 | Updated subscription visible in list | Integration | Edit cost → submit → check list | List shows new cost value |
| 4.1.18 | No page refresh required | Integration | Dashboard visible throughout flow | UI updates without reload |

**AC6: Success Toast**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.19 | Success toast displays correct message | Integration | Edit → submit → check toast | Toast text === "Subscription updated successfully" |
| 4.1.20 | Toast auto-dismisses after 3 seconds | Integration | Submit → start timer → wait 3s | Toast disappears automatically |

**AC7: Timestamp Update (See Story 4.3)**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.21 | updatedAt set to current time on save | Integration | Edit → submit → check timestamp | updatedAt > original time |
| 4.1.22 | createdAt unchanged after edit | Integration | Edit → submit → check timestamp | createdAt === original value |

**AC8: Keyboard Navigation**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.23 | Tab navigation through form fields | Unit | Focus on first field → Tab → Tab → check order | Focus sequence: name → cost → dueDate |
| 4.1.24 | Escape key cancels edit mode | Unit | Edit mode → press Escape | Cancel triggered; edit mode exits |

**AC9: WCAG 2.1 Level A** (Reuse from Story 3.5)

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.A1 | All inputs have associated labels | Unit | Render form | `<label htmlFor="...">` associated with inputs |
| 4.1.A2 | aria-labels on buttons | Unit | Render form | Edit/Cancel buttons have aria-label |
| 4.1.A3 | Focus indicators visible | Unit | Form CSS | `:focus-visible` styles applied |
| 4.1.A4 | Semantic HTML structure | Unit | Component render | `<form>`, `<label>`, `<button>` tags used |

**AC10: Error Handling**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.1.E1 | Invalid input shows inline error | Unit | Submit empty name → check form state | Error message displays near field |
| 4.1.E2 | localStorage error handled gracefully | Unit | Mock localStorage.setItem fail → submit | Error toast displays; form recovers |
| 4.1.E3 | User-friendly error messages | Unit | Trigger validation error | Message is user-friendly (no technical jargon) |

---

#### Story 4.3: Update Timestamps on Edit (12 Test Cases)

**AC1: createdAt Immutable**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.01 | createdAt unchanged after edit | Unit | Object spread with ...editingSubscription | `createdAt === original` |
| 4.3.02 | createdAt snapshot test | Unit | Edit subscription → inspect object | Snapshot: createdAt field unchanged |

**AC2: updatedAt Set to Now**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.03 | updatedAt set to Date.now() on edit | Unit | Submit form → capture timestamp | `updatedAt >= beforeSubmit && updatedAt <= afterSubmit` |
| 4.3.04 | updatedAt is number type | Unit | Check object type | `typeof updatedAt === 'number'` |

**AC3: Timestamps Persist**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.05 | Timestamps persist through JSON serialize/deserialize | Unit | JSON.stringify + parse | Numbers remain numbers; values unchanged |
| 4.3.06 | Timestamps persist on page reload | Integration | Edit → localStorage save → reload → check value | Timestamp value === edited value |

**AC4: Multiple Edits Create New Timestamps**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.07 | Second edit creates newer timestamp | Integration | Edit 1 → save (ts1) → delay 10ms → edit 2 → save (ts2) | ts2 > ts1 |
| 4.3.08 | Timestamps increase monotonically | Integration | Edit N times, capture each timestamp | Each timestamp >= previous |

**AC5: Error Prevents Timestamp Update**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.09 | localStorage error rolls back timestamp | Unit | Mock localStorage fail → attempt edit → capture state | updatedAt not changed; error displayed |

**AC6: Reducer Handles Timestamped Objects**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.10 | UPDATE_SUBSCRIPTION stores timestamp | Unit | Dispatch with timestamped object → check state | State contains updated timestamp |

**AC7: No Timestamp Display in UI**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.11 | Timestamps never displayed to user | Integration | Edit → save → check UI | Timestamp value not rendered anywhere |

**AC8: Backwards Compatible**

| Test ID | Title | Level | Description | Assertions |
|---------|-------|-------|-------------|-----------|
| 4.3.12 | All Story 4.1 tests still pass | Integration | Run full test suite for 4.1 | 24/24 tests pass (no regressions) |

---

## Test Implementation Roadmap

### Phase 1: Unit Tests (2–3 hours)

**Setup (30 min):**
- Create `SubscriptionForm.test.tsx` (if new)
- Create `SubscriptionContext.test.tsx` (add tests to existing)
- Establish test helper: `renderWithSubscriptions()`

**Execution (1.5–2 hours):**
- Test 4.1: Edit mode detection, pre-population, button text, cancel flow (12 tests)
- Test 4.3: Timestamp mutations, createdAt preservation, reducer logic (6 tests)
- Test error handling, validation (4 tests)

**Acceptance:** 95%+ coverage, all tests pass locally

---

### Phase 2: Integration Tests (2–3 hours)

**Setup (30 min):**
- Create `Dashboard.integration.test.tsx` (if new)
- Mock localStorage with Vitest
- Set up timer assertions for AC5 (< 100ms)

**Execution (1.5–2 hours):**
- Test edit flow: row → form → submit → list update (4 tests)
- Test success toast and auto-dismiss (2 tests)
- Test timestamp persistence across reload (2 tests)
- Test error scenarios (localStorage fail, validation) (2 tests)
- Test keyboard navigation, accessibility (2 tests)

**Acceptance:** All 12 integration tests pass; green-phase CI tests pass

---

### Phase 3: QA Review & Burn-In (1–2 hours)

**Manual Verification:**
- Smoke test: Edit subscription → verify list updates
- Smoke test: Cancel button → verify form clears
- Smoke test: Reload → verify timestamps persisted
- Keyboard navigation: Tab, Escape, Enter
- Browser DevTools: Check localStorage after edit

**Automated Burn-In (CI):**
- Run full test suite 3x in parallel (Vitest sharding)
- Run selective tests on Story 4.1/4.3 diffs
- Generate coverage report

---

## Test File Structure

```
src/
  components/
    SubscriptionForm/
      SubscriptionForm.test.tsx          ← APPEND: Edit mode tests (AC1–AC10)
  hooks/
    useSubscriptions.test.tsx            ← APPEND: UPDATE_SUBSCRIPTION tests
  context/
    SubscriptionContext.test.tsx         ← APPEND: Timestamp logic tests
  __tests__/
    integration/
      Dashboard.integration.test.tsx     ← CREATE: Full edit cycle flow
      Edit-and-Timestamps.integration.test.tsx ← CREATE: Story 4.1 + 4.3 together
```

---

## Definition of Done: Test Coverage

### Acceptance Gates

| Gate | Criterion | Target | Status |
|------|-----------|--------|--------|
| **Unit Coverage** | SubscriptionForm edit mode coverage | ≥95% | 🟢 Green |
| **Unit Coverage** | Timestamp logic (4.3) | ≥95% | 🟢 Green |
| **Integration Coverage** | Edit → List → Toast flow | 100% | 🟢 Green |
| **Integration Coverage** | Timestamp persistence | 100% | 🟢 Green |
| **High-Risk AC Tests** | AC4 (fuzzy duplicate) | 3 explicit tests | 🟢 Green |
| **Accessibility Tests** | WCAG 2.1 Level A | Reuse 3.5 patterns | 🟢 Green |
| **Regression Tests** | Story 3.1, 3.2, 3.5 still pass | 100% | 🟢 Green |
| **Green-Phase CI** | Automated test suite passes | All green | 🟢 Green |

### Test Execution Checklist

- [ ] Unit tests pass locally: `npm run test:unit`
- [ ] Integration tests pass locally: `npm run test:integration`
- [ ] Coverage report generated: `npm run test:coverage`
- [ ] No console errors or warnings
- [ ] localStorage mocks clean (no state leakage between tests)
- [ ] Vitest sharding works (parallel execution)
- [ ] CI green-phase tests pass
- [ ] Code review approved (run `CR` with Amelia)
- [ ] Manual smoke tests pass (local browser)
- [ ] Merge to main branch

---

## Knowledge Fragments & Resources

### Core Fragments Loaded

1. **fixture-architecture.md** — Composable fixture patterns; SubscriptionProvider reuse
2. **data-factories.md** — Subscription factory for test setup
3. **test-levels.md** — Unit vs. integration criteria
4. **test-priorities.md** — P0 (high-risk ACs) prioritization
5. **risk-governance.md** — Risk scoring framework
6. **test-quality.md** — Definition of Done criteria
7. **selector-resilience.md** — Robust selectors for form elements
8. **overview.md** (Playwright Utils) — Component testing patterns

### Extended Fragments

1. **component-tdd.md** — Red → green → refactor cycle
2. **error-handling.md** — Scoped try-catch patterns
3. **timing-debugging.md** — Race condition debugging for AC5 (< 100ms)

### Knowledge Not Loaded (Not Needed)

- Pact.js (backend contract testing — not relevant)
- Feature flags (no feature flagging in scope)
- Email auth (not in scope)
- Webhook testing (not in scope)

---

## Risk Mitigation Summary

### High-Risk Items: Mitigation Actions

**Risk 1: Edit Mode State Isolation (Score 6)**

- ✅ **Mitigation:** Three separate describe blocks in unit tests
  - Describe block: "Add Mode"
  - Describe block: "Edit Mode"
  - Describe block: "Mode Transitions"
- ✅ **Test Cases:** 4.1.01–4.1.11 cover all transitions
- ✅ **Acceptance:** Must pass Code Review

**Risk 2: Fuzzy Duplicate Exclusion (Score 6)**

- ✅ **Mitigation:** Three explicit AC4 test cases
  - **4.1.12 (CRITICAL):** Same name allowed in edit mode — must NOT error
  - **4.1.15 (CRITICAL):** excludeId parameter must exclude current subscription
  - **4.1.14:** Different subscription with same name must error
- ✅ **Implementation Requirement:** useFuzzyMatch must accept `excludeId` parameter
- ✅ **Test Assertion:** Verify `id !== editingSubscriptionId` in fuzzy check

### Residual Risks (After Mitigation)

All high-risk items are **mitigated to GREEN** status via explicit test coverage. No blockers.

---

## Conclusion & Recommendations

### Readiness Assessment

**Status:** 🟢 **READY TO IMPLEMENT**

**Justification:**
1. ✅ Comprehensive test plan covers all 18 ACs
2. ✅ High-risk items (score 6) have explicit mitigation tests
3. ✅ Established patterns from Stories 3.1, 3.2, 3.5 reduce implementation risk
4. ✅ Test framework (Vitest + RTL) proven and stable
5. ✅ No external dependencies or blockers
6. ✅ Estimated 6–8 hours to implement 36 test cases

### Next Steps

1. **Dev Phase:** Amelia implements Story 4.1 using `DS` (Dev Story) skill with this test plan as context
2. **Test Implementation:** Implement 36 test cases alongside feature code
3. **Code Review:** Run `CR` (Code Review) with Amelia to verify tests + code
4. **QA Smoke Test:** Manual verification of edit flow, timestamps, keyboard navigation
5. **Merge:** Green-phase CI passes → merge to main

### Timeline Estimate

- **Development + Testing:** 6–8 hours (parallel implementation)
- **Code Review:** 1–2 hours
- **CI + QA:** 0.5–1 hour
- **Total:** 8–11 hours (1–2 days)

---

## Appendix: Test Pattern Examples

### Pattern 1: Edit Mode Unit Test

```typescript
describe('SubscriptionForm - Edit Mode', () => {
  test('AC1: Pre-populates form with subscription values', () => {
    const existing = {
      id: 'sub-1',
      name: 'Netflix',
      cost: 15.99,
      dueDate: 5,
      createdAt: 100,
      updatedAt: 100,
    }
    
    render(
      <SubscriptionProvider>
        <SubscriptionForm editingSubscription={existing} />
      </SubscriptionProvider>
    )
    
    expect(screen.getByDisplayValue('Netflix')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  test('AC4: Fuzzy match excludes current subscription', async () => {
    const existing = {
      id: 'sub-1',
      name: 'Netflix',
      cost: 15.99,
      dueDate: 5,
      createdAt: 100,
      updatedAt: 100,
    }
    
    render(
      <SubscriptionProvider initialSubscriptions={[existing]}>
        <SubscriptionForm editingSubscription={existing} />
      </SubscriptionProvider>
    )
    
    // Try to submit with same name (should NOT error)
    await userEvent.click(screen.getByRole('button', { name: /update/i }))
    
    expect(screen.queryByText(/already have/i)).not.toBeInTheDocument()
  })
})
```

### Pattern 2: Integration Test — Edit + List Update

```typescript
describe('Edit Subscription - Full Flow', () => {
  test('AC5 + AC6: Real-time list update + success toast', async () => {
    const subscription = {
      id: 'sub-1',
      name: 'Netflix',
      cost: 15.99,
      dueDate: 5,
      createdAt: 1000,
      updatedAt: 1000,
    }
    
    render(
      <SubscriptionProvider initialSubscriptions={[subscription]}>
        <Dashboard />
      </SubscriptionProvider>
    )
    
    // Click edit
    await userEvent.click(screen.getByRole('button', { name: /edit netflix/i }))
    
    // Change cost
    await userEvent.clear(screen.getByLabelText(/cost/i))
    await userEvent.type(screen.getByLabelText(/cost/i), '19.99')
    
    // Submit and measure
    const startTime = performance.now()
    await userEvent.click(screen.getByRole('button', { name: /update/i }))
    const endTime = performance.now()
    
    // Verify toast
    expect(screen.getByText(/subscription updated successfully/i)).toBeInTheDocument()
    
    // Verify list updated quickly
    expect(endTime - startTime).toBeLessThan(100)
    expect(screen.getByText('19.99')).toBeInTheDocument()
  })
})
```

### Pattern 3: Timestamp Test (AC1 + AC2)

```typescript
describe('Story 4.3 - Timestamps', () => {
  test('AC1 + AC2: createdAt immutable, updatedAt updated', async () => {
    const subscription = {
      id: 'sub-1',
      name: 'Netflix',
      cost: 15.99,
      dueDate: 5,
      createdAt: 1000,
      updatedAt: 1000,
    }
    
    const beforeEdit = Date.now()
    
    render(
      <SubscriptionProvider initialSubscriptions={[subscription]}>
        <SubscriptionForm editingSubscription={subscription} />
      </SubscriptionProvider>
    )
    
    await userEvent.click(screen.getByRole('button', { name: /update/i }))
    
    const afterEdit = Date.now()
    
    // Verify via context (or localStorage if using integration)
    const updated = getStateFromContext() // Implementation-specific
    
    expect(updated.createdAt).toBe(1000)  // Unchanged
    expect(updated.updatedAt).toBeGreaterThanOrEqual(beforeEdit)
    expect(updated.updatedAt).toBeLessThanOrEqual(afterEdit)
  })
})
```

---

**Document Generated:** May 5, 2026  
**Prepared By:** Murat, Master Test Architect  
**Quality Gate:** Ready for Development ✅
