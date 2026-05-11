---
status: 'in-progress'
story_id: '11.6'
story_key: '11-6-integrate-searchbar-costrangefilter-into-dashboard'
test_level: 'E2E (Playwright)'
phase: 'RED (Failing Tests)'
created: '2026-05-08'
updated: '2026-05-08'
test_designer: 'Murat (Master Test Architect)'
---

# ATDD Checklist: Story 11.6 — Dashboard Integration

**Acceptance Test-Driven Development (ATDD) in Progress**

Red-phase E2E test scaffolds generated. Tests are intentionally **FAILING** until implementation complete.

---

## 📋 Red-Phase Test Scaffolds (P0 Critical)

### Generated Tests

| Test ID | Requirement | Status | Expected to FAIL | File |
|---------|-------------|--------|------------------|------|
| **P0-001** | SearchBar renders in Dashboard | 🔴 FAILING | Yes (Dashboard not created) | `story-11-6-dashboard-integration.spec.ts` |
| **P0-002** | CostRangeFilter renders in Dashboard | 🔴 FAILING | Yes (Dashboard not created) | `story-11-6-dashboard-integration.spec.ts` |
| **P0-003** | Search filtering works (real-time) | 🔴 FAILING | Yes (no filter wiring) | `story-11-6-dashboard-integration.spec.ts` |
| **P0-004** | Cost range filtering works (real-time) | 🔴 FAILING | Yes (no filter wiring) | `story-11-6-dashboard-integration.spec.ts` |
| **P0-005** | Combined filters (AND logic) work | 🔴 FAILING | Yes (no AND logic) | `story-11-6-dashboard-integration.spec.ts` |

**Total P0 Tests**: 5 | **Current Status**: 🔴 ALL FAILING (as expected in RED phase)

---

## 🎯 Test Execution Plan

### Phase 1: RED — Verify All Tests Fail (Validation Step)

**Command**:
```bash
npm test -- story-11-6-dashboard-integration.spec.ts
```

**Expected Output**:
```
FAILED  tests/e2e/story-11-6-dashboard-integration.spec.ts
  ✕ [P0-001] SearchBar renders in Dashboard layout
  ✕ [P0-002] CostRangeFilter renders in Dashboard layout
  ✕ [P0-003] Search filtering works (real-time)
  ✕ [P0-004] Cost range filtering works (real-time)
  ✕ [P0-005] Combined filters (search AND cost) work with AND logic

5 failed in 45ms
```

**Why RED is good**: Tests fail because Dashboard component doesn't exist yet. This is CORRECT behavior for TDD.

---

### Phase 2: GREEN — Implement to Pass Tests

**Developer Tasks** (from test file implementation checklist):

- [ ] Create `src/components/Dashboard/Dashboard.tsx` or update App.tsx
- [ ] Import SearchBar component
- [ ] Import CostRangeFilter component
- [ ] Import useFilteredSubscriptions hook
- [ ] Wire filter onChange handlers to context dispatchers
- [ ] Pass filtered results to SubscriptionList
- [ ] Add data-testid attributes (searchBar, costRangeFilter, dashboard)
- [ ] Handle empty state messaging correctly
- [ ] Run tests again:
  ```bash
  npm test -- story-11-6-dashboard-integration.spec.ts
  ```

**Expected Output (After Implementation)**:
```
PASSED  tests/e2e/story-11-6-dashboard-integration.spec.ts
  ✓ [P0-001] SearchBar renders in Dashboard layout
  ✓ [P0-002] CostRangeFilter renders in Dashboard layout
  ✓ [P0-003] Search filtering works (real-time)
  ✓ [P0-004] Cost range filtering works (real-time)
  ✓ [P0-005] Combined filters (search AND cost) work with AND logic

5 passed in 2.3s
```

---

### Phase 3: REFACTOR — Improve Test Robustness

Once P0 tests pass:

1. Add P1 tests (keyboard navigation, accessibility, edge cases)
2. Expand E2E coverage for P1 scenarios
3. Run full test suite with code coverage

---

## 🧪 Test Scenarios Summary

### P0-001: SearchBar Renders

**Assertion Chain**:
1. Dashboard component visible (`[data-testid="dashboard"]`)
2. SearchBar component visible (`[data-testid="search-bar"]`)
3. Search input field visible with correct placeholder
4. CSS class `.searchBar` applied

### P0-002: CostRangeFilter Renders

**Assertion Chain**:
1. Dashboard component visible
2. CostRangeFilter component visible (`[data-testid="cost-range-filter"]`)
3. Min cost input field visible
4. Max cost input field visible
5. CSS class `.costRangeFilter` applied

### P0-003: Search Filtering Works

**Assertion Chain**:
1. Initial state: 5 subscriptions visible
2. Type "netflix" in search input
3. After keystroke: only 1 subscription visible (Netflix)
4. Other subscriptions hidden (Hulu, Disney)

**Validates**:
- SearchBar onChange dispatch → setSearchTerm
- Context update → useFilteredSubscriptions recompute
- Memoization working (correct results)
- SubscriptionList re-renders with filtered data

### P0-004: Cost Range Filtering Works

**Assertion Chain**:
1. Initial state: 5 subscriptions visible
2. Set Min: $5, Max: $15
3. After filter: 3 subscriptions visible
   - Hulu ($7.99) ✅
   - Disney+ ($10.99) ✅
   - Spotify ($12.99) ✅
4. Filtered out: Netflix ($15.99), Streaming Bundle ($29.99)

**Validates**:
- CostRangeFilter onChange dispatch → setCostRangeMin/Max
- Context update → useFilteredSubscriptions recompute
- Inclusive bounds logic (≥ min, ≤ max)

### P0-005: Combined Filters (AND Logic)

**Assertion Chain**:
1. Search "streaming" → 1 result (Streaming Bundle)
2. Add cost filter Min $5, Max $15
3. Streaming Bundle ($29.99) is outside range
4. Result: 0 subscriptions
5. Empty state shows "No subscriptions match your filters"

**Validates**:
- AND logic: both filters must match
- Empty state UX messaging (filters active vs no filters)

---

## 📊 Test Data (Fixtures)

**Standard Test Subscriptions** (seeded via localStorage factory):

```typescript
const TEST_SUBSCRIPTIONS = [
  { id: 'sub-netflix', name: 'Netflix', cost: 15.99, dueDate: 15 },
  { id: 'sub-hulu', name: 'Hulu', cost: 7.99, dueDate: 20 },
  { id: 'sub-disney', name: 'Disney+', cost: 10.99, dueDate: 1 },
  { id: 'sub-streaming-bundle', name: 'Streaming Bundle', cost: 29.99, dueDate: 10 },
  { id: 'sub-spotify', name: 'Spotify Premium', cost: 12.99, dueDate: 5 },
];
```

**Factory Pattern**: `seedSubscriptions(page, TEST_SUBSCRIPTIONS)` adds data via localStorage before each test.

---

## 🛠️ Data-TestID Requirements

The following data-testid attributes are **required** for tests to pass:

| Element | data-testid | Component | Priority |
|---------|------------|-----------|----------|
| Dashboard root | `dashboard` | Dashboard | P0 |
| SearchBar wrapper | `search-bar` | SearchBar | P0 |
| CostRangeFilter wrapper | `cost-range-filter` | CostRangeFilter | P0 |
| Subscription row | `subscription-item` | SubscriptionRow | P0 (already exists) |

**Implementation Note**: Some data-testid already exist from prior stories (11-2, 11-3, 3-2). Ensure Dashboard adds the missing ones.

---

## ✅ Acceptance Criteria Mapping

Each test directly validates acceptance criteria from Story 11.6:

| Test | AC from Test Design | AC Description |
|------|-------------------|-----------------|
| P0-001 | AC1 | SearchBar renders in Dashboard |
| P0-002 | AC2 | CostRangeFilter renders in Dashboard |
| P0-003 | AC3 | Search dispatch → filtered results (< 100ms) |
| P0-004 | AC4 | Cost filter dispatch → filtered results |
| P0-005 | AC5 | Combined AND logic filtering |

---

## 🔗 Related Artifacts

| File | Purpose |
|------|---------|
| [test-design-story-11-6.md](../test-artifacts/test-design-story-11-6.md) | Complete test design (risk, coverage, quality gates) |
| [story-11-6-dashboard-integration.spec.ts](./tests/e2e/story-11-6-dashboard-integration.spec.ts) | Red-phase E2E test scaffolds (this ATDD output) |
| [useFilteredSubscriptions.ts](../src/hooks/useFilteredSubscriptions.ts) | Hook used by Dashboard (already implemented) |
| [filterSubscriptions.ts](../src/utils/filterSubscriptions.ts) | Utility used by hook (already implemented) |

---

## 📝 Dev Handoff Checklist

**For Lester Tuazon (Developer)**:

- [ ] Read test file: `tests/e2e/story-11-6-dashboard-integration.spec.ts`
- [ ] Understand each test scenario (P0-001 through P0-005)
- [ ] Run tests to verify RED phase:
  ```bash
  npm test -- story-11-6-dashboard-integration.spec.ts
  ```
- [ ] All 5 tests should FAIL with "cannot find element" or similar
- [ ] Implement Dashboard component
- [ ] Wire SearchBar + CostRangeFilter + useFilteredSubscriptions
- [ ] Add data-testid attributes
- [ ] Run tests again to verify GREEN phase (all pass)
- [ ] Run full E2E suite to check for regressions
- [ ] Commit with message: `feat: 11-6 dashboard integration (ATDD all P0 passing)`

---

## 🎯 Success Criteria

**RED Phase (Right Now)**: ✅ COMPLETE
- [x] All 5 P0 tests generated as failing scaffolds
- [x] Test scenarios clearly defined
- [x] Acceptance criteria mapped to tests
- [x] Implementation checklist provided

**GREEN Phase (After Dev Implementation)**:
- [ ] All 5 P0 tests passing
- [ ] No regressions in prior stories' tests
- [ ] Code coverage ≥ 80% for Dashboard component

**REFACTOR Phase (After P0 passes)**:
- [ ] P1 tests added (keyboard, accessibility, edge cases)
- [ ] P2 tests added (responsive, session persistence)
- [ ] Full test suite passing
- [ ] Code review complete

---

## 🧪 Murat's Notes

This RED phase ATDD approach gives you several advantages:

1. **Clarity**: Tests define exact expected behavior before coding
2. **Safety**: Green phase tests verify implementation is correct
3. **Regression Prevention**: All assertions locked in before changes
4. **Refactoring Confidence**: Tests prove nothing breaks when optimizing
5. **Documentation**: Tests read like living requirements

**Next Step**: Run the tests now to confirm RED phase is working. You should see all 5 fail. That's success. Then implement Dashboard to make them pass.

---

**Generated by**: Murat (Master Test Architect)  
**Workflow**: `bmad-testarch-atdd`  
**Phase**: RED (Acceptance Test-Driven Development)  
**Date**: 2026-05-08  
**Status**: Ready for Developer Implementation
