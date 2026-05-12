---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: null
lastSaved: '2026-05-12'
mode: 'epic-level'
epicScope: 'Story 002 - Export Subscriptions CSV'
userStory: 'User Story 2 - Export Filtered/Searched Subscriptions'
---

# Test Design: Story 002.2 - Export Filtered/Searched Subscriptions to CSV

**Date:** May 12, 2026  
**Author:** Murat, Master Test Architect  
**Status:** Draft → Ready for Review

---

## Executive Summary

**Scope:** Epic-level test design for User Story 2 (Priority: P2) — Export filtered/searched subscriptions to CSV

**Risk Summary:**

- Total risks identified: 5
- **High-priority risks (≥6)**: 2 (DATA integrity, STATE capture)
- **Critical categories**: DATA, BUS (user data loss scenarios)

**Coverage Summary:**

- P0 scenarios: 2 tests (risk mitigation) — **~20–30 hours**
- P1 scenarios: 5 tests (core acceptance) — **~25–40 hours**
- P2 scenarios: 2 tests (edge cases) — **~10–15 hours**
- P3 scenarios: 1 test (performance) — **~5–10 hours**
- **Total effort**: **~60–95 hours** (~2–3 weeks for 1 developer)

---

## Story Context & Assumptions

### What We're Testing

**User Story 2**: "A user with search or filter criteria applied wants to export only the filtered results to CSV so they can work with a specific subset of their subscriptions."

**Acceptance Scenarios (from Spec)**:
1. Given search/filter applied → CSV contains only filtered subscriptions
2. Given 5 filtered results → CSV contains exactly 5 records
3. Given no matches → User-friendly message, no corrupt export

**Key Functional Requirements**:
- FR-005: Export only subscriptions matching current view state (search + filters)
- FR-009: Handle edge cases gracefully (empty lists, special chars, null values)
- SC-003: 100% of visible subscriptions accurately included (no missing/duplicate records)
- SC-004: Special characters properly escaped (data integrity maintained)

### Story Dependencies

- **Story 1 (P1)**: Export Dashboard View as CSV — foundational export logic, already tested
- **Story 11**: Search/Filter state management — SubscriptionContext, useFilteredSubscriptions hook
- **Existing fixtures**: CSV serialization helpers, subscription data factories from Story 1

### Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| **Other export formats** (Excel, JSON) | P1 feature scope: CSV only | Document as future enhancement |
| **Export scheduling** (recurring exports) | Out of Story 2 scope | Add to backlog if requested |
| **Large datasets (10,000+)** | Business assumes <1000 | Baseline perf at 500; note scalability limits |
| **Server-side export** | Browser-native download API sufficient | Monitor if users request server-side later |

---

## Risk Assessment Matrix

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|---|---|---|---|---|---|---|
| **R-001** | **DATA** | CSV corruption: special chars (quotes, commas, newlines in subscription names) not escaped properly; opens wrong in Excel/Sheets; data integrity violated | **2** (edge case in implementation) | **3** (user loses trust, compliance issue) | **6** | **Unit test** for `escapeCSVField()` function; **Integration test** with actual CSV parse-back; test data factory with special-char subscriptions; byte-level validation | QA | Before P2 closes |
| **R-002** | **BUS** | State capture failure: Export button captures stale/wrong filter state; exports all subscriptions instead of filtered; silent data loss (user doesn't know data is wrong) | **2** (context state complexity) | **3** (user exports wrong data, data loss perception) | **6** | **Integration test** mocking SubscriptionContext with filtered state; verify CSV row count matches filtered.length; test hook injection pattern; assert filtered subscriptions in output | Dev + QA | Before P2 closes |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation |
|---------|----------|---|---|---|---|---|
| **R-003** | **PERF** | Export timeout: 1000+ rows, slow JSON.stringify → browser hangs; SC-001 violated (>2 sec) | **1** (unlikely on modern infra) | **2** (user frustration, retry) | **2** | **E2E perf test** at 500+ rows, measure time, document baseline; identify stringify bottleneck; note scalability limit |
| **R-004** | **TECH** | CSV format incompatibility: RFC 4180 standard not followed; breaks in older Excel versions | **1** (stable standard) | **2** (some users can't open) | **2** | **Manual test** in Excel, Google Sheets, Apple Numbers; document tool compatibility matrix |
| **R-005** | **OPS** | Browser download fails (disk full, permissions error, network glitch); no user feedback | **1** (OS-level, not our code) | **2** (user must retry) | **2** | **Mock download API failure** in E2E; test error messaging; document user-facing error recovery |

### Risk Category Legend

- **DATA**: Data integrity, loss, corruption
- **BUS**: Business logic, user impact
- **TECH**: Technical/architecture decisions
- **PERF**: Performance, SLA violations
- **OPS**: Operations, deployment, monitoring

---

## Entry Criteria

- [ ] User Story 2 spec agreed upon (acceptance scenarios finalized)
- [ ] Story 1 (Export All) implementation and tests PASSING (reuse fixtures)
- [ ] Search/Filter implementation complete (useFilteredSubscriptions hook stable)
- [ ] SubscriptionContext and localStorage integration confirmed working
- [ ] Test environment (local dev + CI) provisioned
- [ ] React Testing Library + Vitest setup confirmed (existing from Story 1)
- [ ] Playwright E2E tests configured and running (existing from Story 1)

## Exit Criteria

- [ ] **All P0 tests passing** (Risk R-001 + R-002 mitigations verified)
- [ ] **All P1 tests passing** (Core acceptance scenarios green)
- [ ] **P2/P3 tests passing or deferred** (Edge cases + perf baseline captured)
- [ ] **Story 1 regression tests still passing** (No export-all breakage)
- [ ] **Coverage ≥85%** (all user stories + error paths covered)
- [ ] **No open high-severity bugs** blocking release
- [ ] **Risk R-001 + R-002 closed** (owned by dev lead)

---

## Test Coverage Plan

### P0 (Critical) — Risk Mitigation, Gates Release

**Criteria**: Blocks core acceptance + High risk (≥6) + No workaround

| Test ID | Scenario | Test Level | Risk Link | Description | Effort |
|---------|----------|---|---|---|---|
| **S2.5** | **Filter state captured at export time** | INTEGRATION | **R-002** 🚨 | Mock SubscriptionContext with filtered state; dispatch filter action; click export; verify CSV row count = filtered.length (NOT all.length) | 20 min |
| **S2.6** | **CSV escaping with special characters** | UNIT | **R-001** 🚨 | Filtered subscriptions with special chars ("Netflix, Inc.", "Premium (Monthly)", "Line\nBreak"); call escapeCSVField(); assert RFC 4180 escaping; parse back to JSON without loss | 15 min |

**Total P0**: **2 tests**, **~35 min**, **~25–30 hours** (implementation + test code)

---

### P1 (High) — Core Acceptance Scenarios, Run on PR

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Test ID | Scenario | Test Level | Description | Effort |
|---------|----------|---|---|---|
| **S2.1** | **Export with search filter active** | E2E | User searches for "Netflix", clicks export, CSV contains only matching rows (FC-005) | 30 min |
| **S2.2** | **Export with cost range filter active** | E2E | User filters $5–$20 range, clicks export, CSV respects cost boundary, other subscriptions excluded | 30 min |
| **S2.3** | **Export with combined search + filter** | E2E | Both search term AND cost range active; export respects both constraints simultaneously | 40 min |
| **S2.4** | **Export with no matches (empty filter)** | E2E | Filter/search yields 0 results; user gets friendly message (FR-009) instead of corrupt CSV; button disabled or message shown | 25 min |
| **S2.9** | **CSV byte-level validation** | UNIT | Filtered CSV parses correctly back to objects; no data loss; column order stable; numeric types preserved | 15 min |

**Total P1**: **5 tests**, **~140 min**, **~25–40 hours** (test + setup)

---

### P2 (Medium) — Edge Cases, Run Nightly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Test ID | Scenario | Test Level | Description | Effort |
|---------|----------|---|---|---|
| **S2.7** | **Filter boundary: $0 cost** | UNIT | Subscription with cost=0 included/excluded correctly in filter, exported accurately | 10 min |
| **S2.8** | **Filter boundary: exact match threshold** | UNIT | Subscription at exact filter boundary ($5.00 in $5–$20 range) included correctly in CSV | 10 min |

**Total P2**: **2 tests**, **~20 min**, **~10–15 hours** (test + data setup)

---

### P3 (Low) — Performance Baseline, On-Demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Test ID | Scenario | Test Level | Description | Effort |
|---------|----------|---|---|---|
| **S2.10** | **Performance: export 500+ filtered rows** | E2E | 500+ subscriptions filtered; export completes in <2 sec (SC-001); measure stringify time; document baseline | 25 min |

**Total P3**: **1 test**, **~25 min**, **~5–10 hours** (perf measurement + doc)

---

## Execution Strategy

### Phase 1: Local Development (Dev + QA in Parallel)

**Week 1: P0 + P1 Implementation**

1. **Implement Story 2 feature** (dev) — filter state capture, export button wiring
2. **Implement P0 tests** (QA) — test R-001 + R-002 mitigations in isolation
3. **Run P0 tests on feature** → Pass/Fail determines phase 2 go-no-go
4. **Implement P1 tests** (QA) — full acceptance scenario E2E + unit tests
5. **Verify no Story 1 regressions** (QA)

**Exit gate**: P0 + P1 at ≥95% pass rate

### Phase 2: Nightly/Pre-Release (QA Focus)

1. **Implement P2 edge case tests** (QA)
2. **Run P3 performance test** (QA) — baseline established
3. **Final regression sweep** — all stories 1–2 passing

### CI/CD Execution Order

**On every PR** (GitHub Actions):
- Run S2.1, S2.2, S2.3, S2.4, S2.5, S2.6, S2.9 (~15 min)
- Fail PR if any P0/P1 test fails

**Nightly**:
- Run S2.7, S2.8, S2.10 (~10 min)
- Alert if perf degradation detected

### Parallel Execution

- Playwright E2E: `workers: 4` (Vitest default)
- Vitest unit/integration: `workers: auto`

---

## Resource Estimates

### Test Development Effort (Ranges)

| Priority | Count | Est. Hours/Test | Total Hours | Notes |
|----------|-------|---|---|---|
| **P0** 🚨 | 2 | 10–15 | **20–30** | Complex setup (hook injection, state mocking), risk mitigation focus |
| **P1** | 5 | 5–8 | **25–40** | Standard E2E + unit coverage, reuse Story 1 fixtures |
| **P2** | 2 | 5–7 | **10–15** | Simple unit tests, boundary validation |
| **P3** | 1 | 5–10 | **5–10** | Performance measurement, baselines |
| **TOTAL** | **10** | **~6 avg** | **~60–95** | **~2–3 weeks** (1 dev) |

### Prerequisites

**Test Data Factories**:
- `subscriptionsWithSpecialChars()` — data with quotes, commas, newlines
- `filteredSubscriptions(searchTerm, costRange)` — parameterized fixture for S2.1–4

**Test Fixtures**:
- `mockFilteredSubscriptionsHook(state)` — inject filter state into component (S2.5)
- `downloadPromise()` — wait for CSV download (existing from Story 1, reused)

**Tooling**:
- Vitest + React Testing Library (existing)
- Playwright (existing)
- `@testing-library/user-event` for input simulation

**Environment**:
- Local dev machine + CI (GitHub Actions)
- No external services required (all mocked)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

| Metric | Threshold | Criteria |
|--------|-----------|----------|
| **P0 pass rate** | **100%** | No exceptions; both R-001 + R-002 tests must pass before release |
| **P1 pass rate** | **≥95%** | At least 4 of 5 core scenarios passing; failures require triage |
| **P2/P3 pass rate** | **≥90%** | Informational; edge cases and perf can be re-tested post-release if needed |
| **High-risk mitigations** | **100% complete** | R-001 + R-002 mitigation plans executed and verified before release |
| **Story 1 regressions** | **0** | Export-all tests must still pass; no breakage from Story 2 changes |

### Coverage Targets

- **Acceptance scenarios**: ≥100% (all user stories covered)
- **Error paths**: ≥80% (empty list, null values, special chars)
- **Business logic**: ≥85% (filter state capture, CSV generation)
- **Edge cases**: ≥70% (boundary conditions, data transformations)

### Non-Negotiable Requirements

- [ ] All P0 tests pass (risk mitigations verified)
- [ ] No high-risk (≥6) items unmitigated or waived
- [ ] All acceptance scenarios (S2.1–4) passing
- [ ] CSV data integrity validated (S2.6, S2.9 passing)
- [ ] No Story 1 regressions (export-all tests green)

---

## Mitigation Plans

### R-001: DATA — CSV Special Character Escaping (Score: 6)

**Mitigation Strategy**:
1. **Unit test** (`S2.6`): Test `escapeCSVField()` function with edge cases:
   - Subscription name: `"Netflix, Inc."` → CSV: `"""Netflix, Inc."""`
   - Subscription name: `"Premium (Monthly)"` → CSV: `"Premium (Monthly)"`
   - Notes field with newline: `"Renewal\nin March"` → CSV: `"""Renewal\nin March"""`
   - Empty string, null, undefined → handle gracefully
2. **Integration test**: Parse exported CSV back to JSON; assert no data loss
3. **Data factory**: Add `subscriptionsWithSpecialChars()` to test-data.ts

**Owner**: QA Lead (test design) + Dev Lead (implementation)  
**Timeline**: Week 1 (P0 gate decision)  
**Status**: Planned  
**Verification**: S2.6 passes; CSV opens correctly in Excel + Google Sheets; byte-level round-trip validation passes

---

### R-002: BUS — Filter State Capture (Score: 6)

**Mitigation Strategy**:
1. **Integration test** (`S2.5`): 
   - Mock SubscriptionContext with filtered state (e.g., 5 of 20 subscriptions match)
   - Dispatch filter action (`FILTER_SUBSCRIPTIONS`)
   - Click export button
   - Assert: CSV row count = 5 (not 20)
   - Assert: CSV contains only filtered subscription IDs
2. **Test hook injection pattern**: Use React Testing Library's `render()` with custom provider wrapper
3. **Mock subscription data**: Create filtered dataset in test setup

**Owner**: Dev Lead (state management) + QA Lead (test verification)  
**Timeline**: Week 1 (P0 gate decision)  
**Status**: Planned  
**Verification**: S2.5 passes; filtered state correctly captured in CSV; E2E tests (S2.1–4) validate user-facing behavior

---

## Assumptions and Dependencies

### Assumptions

1. **Filter state is synchronous**: SubscriptionContext updates happen immediately on dispatch (no async delays)
2. **CSV generation is in-memory**: No server-side processing; all data available in browser
3. **Download API works**: Modern browser `<a href="blob:" download>` mechanism is reliable (no special network conditions)
4. **Test data is stable**: Faker-based factories produce consistent, reproducible data within tests
5. **Story 1 (export all) is complete**: CSV serialization logic already exists and is tested; Story 2 reuses it

### Dependencies

| Dependency | Required By | Status |
|---|---|---|
| **Story 1 (Export All CSV)** implementation + tests | Start P0 tests | ✅ Complete (per spec) |
| **Search/Filter hooks** (useFilteredSubscriptions) | Start P1 tests | ✅ Per project roadmap |
| **SubscriptionContext** with useReducer | Start P0 tests | ✅ Existing |
| **React Testing Library setup** | P0 implementation | ✅ Existing |
| **Playwright E2E setup** | P1 implementation | ✅ Existing |
| **Test data factories** (subscription, special chars) | Develop in Week 1 | ⏳ In progress |

### Risks to Test Plan

**Risk**: Implementation delay on filter state capture → P0 gate missed  
**Contingency**: Defer P1 E2E tests until P0 core is working; run mock-only tests in parallel  

**Risk**: Special character dataset incomplete → S2.6 insufficient coverage  
**Contingency**: Add manual test matrix (Excel + Google Sheets round-trip) as verification step

---

## Fixture & Data Architecture

### Data Factories

```typescript
// tests/support/helpers/test-data.ts

// Existing (Story 1)
export const defaultSubscription = () => ({ ... })
export const subscriptions = (count: number) => [...]

// New for Story 2
export const subscriptionsWithSpecialChars = () => [
  { name: "Netflix, Inc.", cost: 15.99, ... },
  { name: "Adobe Creative "Cloud"", cost: 54.99, ... },  // nested quotes
  { name: "Renewal\nReminder", cost: 0, ... },  // newline
  { name: "Price: $9.99 (Monthly)", cost: 9.99, ... },  // parentheses
]

export const filteredSubscriptions = (searchTerm?: string, costRange?: [number, number]) => {
  // Return dataset pre-filtered for S2.1–4 E2E tests
}
```

### Test Hooks & Mocks

```typescript
// tests/support/fixtures/index.ts (extend existing)

export const mockFilteredSubscriptionsHook = (filteredData: Subscription[]) => {
  // Mock useFilteredSubscriptions hook for integration tests
  // Used in S2.5 to verify state capture
}

export const csvFixture = {
  escapeField: (value: string) => escapeCSVField(value),
  parseBack: (csv: string) => parseCsvToJson(csv),
  validateRoundTrip: (original: any[], csv: string) => { ... }
}
```

---

## Roadmap After Story 2

- **Story 3**: Sorting filtered subscriptions (depends on S2.1–4 passing)
- **Story 4**: Bulk operations on filtered results (depends on filter state stability)
- **Future**: Export scheduling, other formats (Excel, PDF) — defer to next phase

---

## Approvals & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Test Architect | Murat | 2026-05-12 | ✏️ Draft |
| Dev Lead | — | — | ⏳ Pending |
| QA Lead | — | — | ⏳ Pending |
| PM/Product | — | — | ⏳ Pending |

---

**Test Design Complete** ✅  
**Next Step**: Run `*atdd` workflow to generate failing P0 acceptance tests, or proceed directly to `*automate` for broader test coverage implementation.
