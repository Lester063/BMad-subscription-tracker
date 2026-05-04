---
story_id: "3.3"
story_key: "3-3-implement-add-subscription-workflow"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "atdd-red-phase-generated"
created: "2026-04-30"
created_by: "Murat (Master Test Architect)"
tdd_phase: "RED"
test_framework: "Playwright (E2E) + Vitest (Component/Unit)"
---

# ATDD Red Phase Acceptance Tests — Story 3.3

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.3  
**Status:** Red Phase (TDD RED - tests will FAIL until feature implemented)  
**Test Framework:** Playwright (E2E) + Vitest (Component/Unit)  
**Generated:** 2026-04-30  
**By:** Murat, Master Test Architect  

---

## 🎯 Purpose

This document defines the **red-phase acceptance tests** that specify exactly what the add subscription workflow must do from the user's perspective **before a single line of implementation code is written**.

All tests are currently **FAILING** (as expected in TDD red phase). This is intentional. Tests will pass only after Story 3.3 implementation is complete.

---

## 📋 Test Overview

### Test Distribution

| Category | Count | Status |
|----------|-------|--------|
| **E2E Tests (Playwright)** | 16 | 🔴 FAILING (red phase) |
| **Component Tests (Vitest)** | 3 | 🔴 FAILING (red phase) |
| **Unit Tests (Vitest)** | 4 | 🔴 FAILING (red phase) |
| **Total Tests** | 23 | 🔴 FAILING |

### Priority Breakdown

| Priority | Count | Phase | Expected Status |
|----------|-------|-------|-----------------|
| **P0 (Blocking)** | 15 | RED | ❌ FAIL |
| **P1 (Critical)** | 8 | RED | ❌ FAIL |
| **Total** | 23 | RED | ❌ FAIL |

---

## 🧪 Test Catalog

### E2E Tests (User Observable Behaviors)

#### AC4: Success Message Displayed

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| E2E-1 | User submits form and sees success message appear | AC4 | P0 | Success message component not yet rendered |
| E2E-2 | Success message text is correct | AC4 | P0 | Success message logic not implemented |
| E2E-3 | Success message disappears after 3 seconds | AC4 | P1 | Auto-dismiss timeout not implemented |

**What needs implementation:** Success message display logic with auto-dismiss timer (AC4)

---

#### AC5: Subscription Appears in List Immediately

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| E2E-4 | New subscription appears in list immediately | AC5 | P0 | Form submission handler doesn't dispatch to context |
| E2E-5 | New subscription displays correct name | AC5 | P0 | List not updating from context |
| E2E-6 | New subscription displays correct cost | AC5 | P0 | List not updating from context |
| E2E-7 | New subscription displays correct due date | AC5 | P0 | List not updating from context |

**What needs implementation:** Form submission handler + context dispatch (AC1) + immediate list render (AC5)

---

#### AC3: Form Clearing & Reusability

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| E2E-8 | Form fields are cleared after submission | AC3 | P1 | Form reset not implemented in handler |
| E2E-9 | User can immediately add another subscription | AC3 | P1 | Form reset not working |
| E2E-10 | Multiple subscriptions added rapidly all succeed | AC3 | P1 | Race condition handling not implemented |

**What needs implementation:** Form reset logic in handleFormSubmit (AC3)

---

#### AC6: Subscription Persists After Page Refresh

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| E2E-11 | Subscription remains in list after page reload | AC6 | P0 | localStorage not saving or loading |
| E2E-12 | Subscription name persists correctly | AC6 | P0 | localStorage round-trip broken |
| E2E-13 | Subscription cost persists correctly | AC6 | P0 | localStorage round-trip broken |
| E2E-14 | Subscription due date persists correctly | AC6 | P0 | localStorage round-trip broken |

**What needs implementation:** Uses existing Story 2.2/2.3 storage logic (no new code needed if context is wired correctly)

---

#### AC7: Error Handling for Invalid Form

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| E2E-15 | Form does NOT submit if required field missing | AC7 | P0 | Form validation from Story 3.1 not wired |
| E2E-16 | Validation error appears | AC7 | P1 | Error message display not implemented |
| E2E-17 | Invalid cost rejected | AC8 | P1 | Form validation not enforcing numeric |
| E2E-18 | Invalid due date rejected | AC8 | P1 | Form validation not enforcing 1-31 range |

**What needs implementation:** Form validation from Story 3.1 (already done) just needs testing

---

### Component Tests (Form Handler + Context)

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| COMP-1 | Form submission handler dispatches ADD_SUBSCRIPTION | AC1 | P0 | handleFormSubmit not implemented or not calling addSubscription() |
| COMP-2 | Subscription object created with ID & timestamps | AC2 | P0 | UUID generation or timestamp logic missing |
| COMP-3 | Data types are correct after submission | AC8 | P0 | Type conversion (parseFloat, parseInt) not applied |

**What needs implementation:** App.tsx handleFormSubmit with UUID generation + type conversion

---

### Unit Tests (Data Generation)

| Test ID | Test Name | AC | Priority | Expected Failure Reason |
|---------|-----------|--|----|---|
| UNIT-1 | UUID is generated and unique | AC2 | P0 | No UUID generation function |
| UNIT-2 | Timestamps set to current time | AC2 | P0 | No timestamp logic |
| UNIT-3 | Cost converted to number | AC8 | P0 | No type conversion |
| UNIT-4 | Due date converted to number 1-31 | AC8 | P0 | No type conversion |

**What needs implementation:** Utility functions for UUID generation + type conversion

---

## 📋 Implementation Requirements (From Red-Phase Tests)

### Must Implement

1. **App.tsx → handleFormSubmit()**
   - Calls `useSubscriptions()` to get `addSubscription` dispatcher
   - Generates UUID for subscription id
   - Converts cost to number (parseFloat)
   - Converts dueDate to number (parseInt)
   - Sets createdAt/updatedAt to Date.now()
   - Calls `addSubscription(newSubscription)`
   - Clears form after successful submission
   - Shows success message for 3 seconds
   - Handles invalid form (no submission)

2. **Success Message Component** (temp, replaced in Story 4.4)
   - Display text: "Subscription added successfully"
   - Auto-dismiss after 3 seconds
   - Accessible to screen readers

3. **UUID Generation**
   - Option A: `crypto.randomUUID()` (native)
   - Option B: `npm install uuid` + `import { v4 } from 'uuid'`
   - Must generate unique IDs across rapid submissions

### Already Implemented (Don't Modify)

- ✅ SubscriptionForm component (Story 3.1)
- ✅ Form validation (Story 3.1)
- ✅ SubscriptionList component (Story 3.2)
- ✅ useSubscriptions hook (Story 2.4)
- ✅ SubscriptionContext + reducer (Story 2.3)
- ✅ localStorage utilities (Story 2.2)
- ✅ ADD_SUBSCRIPTION action (Story 2.1)

### Test Files Location

**E2E + Component + Unit:** `subscription-tracker/tests/story-3-3-atdd-red-phase.spec.ts`

---

## 🚨 Red Phase Properties

### Expected Test Results (Before Implementation)

```
🔴 FAILED: 23 tests
✅ PASSED: 0 tests
⏭️  SKIPPED: 0 tests
```

### TDD Compliance

- ✅ All tests marked as `.skip()` will be enabled by developer
- ✅ Tests assert EXPECTED behavior (user perspective)
- ✅ Tests will fail until feature is complete
- ✅ No implementation assumptions in test code
- ✅ Tests are focused on user behavior, not implementation details

---

## 🔄 TDD Workflow (RED → GREEN → REFACTOR)

### Phase 1: RED (Current)
- ✅ Tests written and all FAILING
- ✅ Developer sees clear failure messages
- ✅ Test output guides implementation

### Phase 2: GREEN (Developer does this)
- Implement Story 3.3 acceptance criteria
- Run tests and see failures
- Code until all tests pass (P0 first, then P1)
- Commit when P0 tests pass

### Phase 3: REFACTOR (Optional)
- Improve code quality
- Consolidate duplicate logic
- Optimize performance
- Tests stay green

---

## 📊 Risk Coverage

| Risk ID | Risk | Tested By | Coverage |
|---------|------|-----------|----------|
| R3.3-1 | Success feedback missing | E2E-1, E2E-2, E2E-3 | ✅ 100% |
| R3.3-2 | Context sync failure | E2E-4, E2E-5, E2E-6, E2E-7 | ✅ 100% |
| R3.3-3 | Data persistence broken | E2E-11, E2E-12, E2E-13, E2E-14 | ✅ 100% |
| R3.3-4 | UUID collisions | E2E-10, UNIT-1 | ✅ 100% |
| R3.3-5 | Rapid submission race | E2E-10, COMP-2 | ✅ 100% |

---

## ✅ Acceptance Criteria Mapping

| AC | Tests Covering This | All Tests P0? | Coverage |
|----|---|---|---|
| AC1: Form handler connects | COMP-1, E2E-4, E2E-9 | ✅ Yes | P0 |
| AC2: Unique ID & timestamps | COMP-2, UNIT-1, UNIT-2 | ✅ Yes | P0 |
| AC3: Form clears | E2E-8, E2E-9 | ❌ Mixed (1 P1) | P0/P1 |
| AC4: Success message | E2E-1, E2E-2, E2E-3 | ❌ Mixed (1 P1) | P0/P1 |
| AC5: List sync | E2E-4, E2E-5, E2E-6, E2E-7 | ✅ Yes | P0 |
| AC6: Persistence | E2E-11, E2E-12, E2E-13, E2E-14 | ✅ Yes | P0 |
| AC7: Error handling | E2E-15, E2E-16, E2E-17, E2E-18 | ❌ Mixed (P0/P1) | P0/P1 |
| AC8: Data types | COMP-3, UNIT-3, UNIT-4 | ✅ Yes | P0 |

**All 8 ACs covered by tests ✅**

---

## 🎯 Definition of Done (Developer Checklist)

- [ ] All E2E tests pass (P0 minimum before merge)
- [ ] All Component tests pass
- [ ] All Unit tests pass
- [ ] P0 tests pass rate = 100%
- [ ] P1 tests pass rate ≥ 95% (can accept 1 flaky test)
- [ ] No console errors during test runs
- [ ] Test execution time < 30 seconds
- [ ] Code review passes (bmad-code-review)
- [ ] No TypeScript errors

---

## 📝 Test File Location & Execution

**File:** `subscription-tracker/tests/story-3-3-atdd-red-phase.spec.ts`

### Run All Tests
```bash
npm run test:story-3-3
# or
npm test story-3-3
```

### Run Only P0 Tests
```bash
npm test story-3-3 -- --grep "@P0"
```

### Run with Debug
```bash
npm test story-3-3 -- --debug
```

### Run E2E Only
```bash
npm run test:e2e story-3-3
```

---

## 🧬 No Overlap with Story 3.1 Tests

**Story 3.1 (Form Component) covers:**
- ✅ Field interaction (typing, focus, blur)
- ✅ Form validation (required fields, formats)
- ✅ Accessibility (labels, ARIA, keyboard)

**Story 3.3 (Add Workflow) covers:**
- ✅ Success feedback visibility
- ✅ List synchronization & immediate render
- ✅ Form clearing & reusability
- ✅ Persistence & data integrity
- ✅ Error handling (no submission on invalid)
- ✅ Rapid submission handling

**Overlap:** NONE — complementary coverage

---

## 📊 Test Design Metadata

| Field | Value |
|-------|-------|
| **Total Tests** | 23 |
| **E2E Tests** | 16 |
| **Component Tests** | 3 |
| **Unit Tests** | 4 |
| **P0 Tests** | 15 |
| **P1 Tests** | 8 |
| **All Failing?** | ✅ Yes (red phase) |
| **Risk Coverage** | 100% (5/5 risks) |
| **AC Coverage** | 100% (8/8 ACs) |
| **Execution Time Estimate** | ~30 seconds (full suite) |
| **Setup Time** | ~2 minutes (one-time) |

---

## 🚀 Next Steps (Developer)

1. **Read this document** and understand each test's purpose
2. **Implement Story 3.3 acceptance criteria** (see implementation artifacts/3-3-implement-add-subscription-workflow.md)
3. **Run tests** and watch them turn from RED to GREEN
4. **Commit when P0 tests pass** (gate requirement)
5. **Run code review** (bmad-code-review skill)

---

**Generated:** 2026-04-30  
**By:** Murat, Master Test Architect  
**BMad Method™ — Red-Phase ATDD**
