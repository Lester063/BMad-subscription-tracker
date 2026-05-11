---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-05-11T14:22:00Z'
inputDocuments: ['docs/project-context.md', 'specs/002-export-subscriptions-csv/spec.md', 'subscription-tracker/playwright.config.ts']
---

# Test Design: Story 002 - Export Subscription List as CSV

**Date:** May 11, 2026
**Author:** Lester Tuazon (via Murat, Master Test Architect)
**Status:** Draft → Ready for Implementation
**Epic:** Feature 002 - Export Subscriptions CSV
**Story:** User Story 1 - Export Dashboard View as CSV

---

## Executive Summary

**Scope:** Epic-level test design for exporting subscription list to CSV format

**Risk Summary:**

- Total risks identified: 7
- High-priority risks (≥6): 2 (special character corruption, wrong subscriptions exported)
- Critical categories: DATA (integrity), BUS (business logic)

**Coverage Summary:**

- P0 scenarios: 5 (8–10 hours)
- P1 scenarios: 5 (8–12 hours)
- P2/P3 scenarios: 4 (3–5 hours)
- **Total effort**: 30–47 hours (~1 week for 1 dev; ~3 days for 2 devs)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|-----------|
| **Excel .xlsx export** | Out of scope per spec (CSV only for v1) | Document for future roadmap; current design supports CSV only |
| **PDF export** | Out of scope | Same mitigation |
| **Export scheduling/automation** | Out of scope; user-initiated only | Can be added post-v1 |
| **Cross-browser (Firefox, Webkit)** | Optional; Chromium required for PR gate | Test on Chromium only in PR; nightly runs optional cross-browser |
| **Multi-language localization** | Out of scope; assumes English content | UTF-8 handles non-ASCII; specific i18n testing deferred |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|----------|
| **R-001** | DATA | Special character corruption: Subscription names with commas, quotes, newlines break CSV format | 2 | 3 | **6** | Unit tests cover: commas, embedded quotes, newlines; integration test opens file in Excel/Google Sheets | Dev | Sprint start |
| **R-002** | BUS | Wrong subscriptions exported: Export includes full list instead of filtered view | 2 | 3 | **6** | Integration test: apply cost filter → verify only filtered subscriptions in export; mock useSubscriptions hook | Dev | Sprint start |

### Medium-Priority Risks (Score 3–5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|-----------|-------|
| **R-003** | PERF | Large dataset timeout: Export fails or UI freezes with 1000+ subscriptions | 2 | 2 | **4** | Performance test: serialize 1000 records, measure export time vs SC-001 (target: <2s); profile if needed | Dev |
| **R-004** | TECH | UTF-8 encoding failure: File encoding causes data corruption or unreadable text | 1 | 3 | **3** | Unit test UTF-8 encoding; validate non-ASCII characters (é, ñ, 中文) preserved in output | Dev |

### Low-Priority Risks (Score ≤2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| **R-005** | BUS | Empty list behavior: No subscriptions to export; user gets no feedback | 2 | 1 | **2** | Document in acceptance criteria; E2E test verifies disabled button or message |
| **R-006** | BUS | Filename collision: Overwrite or naming issues if user exports multiple times same day | 1 | 2 | **2** | Validate filename format `subscriptions_YYYYMMDD.csv` in unit test |
| **R-007** | SEC | Sensitive data exposure: Subscription data exposed unencrypted | 1 | 2 | **2** | Verify user is authenticated; local download only (no external leaks) |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Entry Criteria

- [x] Requirements and acceptance criteria agreed (Story 1 spec complete)
- [x] Test environment available (localhost React app with localStorage)
- [x] Playwright configured and working (playwright.config.ts validates 60s timeout)
- [x] Test data factories ready to build (Faker for generating subscriptions)
- [x] Feature branch `002-export-subscriptions-csv` created
- [x] React Context and useSubscriptions hook available for testing

## Exit Criteria

- [ ] All P0 tests passing (100%)
- [ ] All P1 tests passing (≥95%)
- [ ] CSV serializer achieves ≥80% code coverage
- [ ] No open high-priority bugs (R-001, R-002 mitigated)
- [ ] Test code reviewed and merged to `test/` directory
- [ ] Performance test confirms <2s export for 1000 records
- [ ] Fixtures and factories documented for reuse in Story 2

---

## Test Coverage Plan

### P0 (Critical) — Run on every PR commit

**Criteria**: Blocks core user journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Scenarios | Hours | Owner | Notes |
|-------------|-----------|-----------|----------------|-------|-------|-------|
| **FR-003 + FR-006**: Export button downloads CSV | E2E | R-001, R-002 | U-001, U-011 | 3 | QA | Happy path: 3+ subscriptions → export → verify file downloads with content |
| **FR-004**: CSV has correct columns | Unit | R-001 | U-002 | 1 | Dev | Serializer outputs [Name, Cost, Billing Cycle, Next Billing Date, Date Added, Category, Notes] |
| **FR-009**: Handle commas in subscription name | Unit | R-001 | U-003 | 1 | Dev | Name = "Netflix, HBO, Disney+" → CSV escapes properly → opens correctly |
| **FR-009**: Handle quotes in subscription name | Unit | R-001 | U-004 | 1 | Dev | Name = `My "Favorite" Service` → proper escaping |
| **FR-009**: Handle newlines in notes field | Unit | R-001 | U-005 | 1 | Dev | Notes with line breaks → proper escaping → opens correctly |
| **FR-005**: Export only filtered subscriptions | Integration | R-002 | U-007 | 2–3 | QA | Apply filter (cost $10–$30) → export → verify only 2/5 subscriptions in file |

**Total P0**: 8 scenarios across 6 requirements, **8–10 hours**

### P1 (High) — Run on PR to main

**Criteria**: Important features + Medium risk (3–4) + Common workflows

| Requirement | Test Level | Risk Link | Test Scenarios | Hours | Owner | Notes |
|-------------|-----------|-----------|----------------|-------|-------|-------|
| **FR-002 + FR-010**: Export button UI and state | E2E | — | U-006 | 1.5 | QA | Verify button disabled when no subscriptions; shows feedback during export |
| **FR-007**: Filename format validation | Unit | R-006 | U-008 | 0.5 | Dev | Filename = `subscriptions_YYYYMMDD.csv` |
| **FR-001**: "Subscription List" header present | E2E | — | — | 1 | QA | Header appears above search/filter controls |
| **FR-008**: UTF-8 encoding validation | Unit | R-004 | U-009 | 1 | Dev | Non-ASCII chars (é, ñ, 中文) preserved |
| **FR-013**: CSV opens in Excel/Google Sheets | E2E | R-001 | U-013 | 2–3 | QA | Download CSV → open in spreadsheet → verify layout, no corruption |
| **Prevent duplicate exports** | Integration | R-002 | U-012 | 1.5 | Dev | Rapid clicks → only 1 file generated; button disabled during processing |

**Total P1**: 6 scenarios, **7–8 hours**

### P2 (Medium) — Run nightly/weekly

**Criteria**: Secondary features + Low risk (1–2) + Edge cases

| Requirement | Test Level | Risk Link | Test Scenarios | Hours | Owner | Notes |
|-------------|-----------|-----------|----------------|-------|-------|-------|
| **FR-003 + SC-001**: Performance: 1000 subscriptions | E2E | R-003 | U-010 | 1.5 | QA | Export 1000 records → completes in <2s; UI responsive |
| **Integration**: localStorage → export | Integration | — | I-002 | 0.5 | Dev | Subscriptions from localStorage → serialized correctly → no data loss |
| **Edge case**: Empty list | E2E | R-005 | U-006 | 0.5 | QA | No subscriptions → button disabled or shows message |
| **Integration**: Context filters → export | Integration | R-002 | I-001 | 1 | Dev | useSubscriptions returns filtered list → export function receives correct data |

**Total P2**: 4 scenarios, **3.5 hours**

### P3 (Low) — Run on-demand

**Criteria**: Nice-to-have + Exploratory

| Test Scenario | Test Level | Hours | Notes |
|---------------|-----------|-------|-------|
| Cross-browser (Firefox, Webkit) | E2E | 1.5 | Optional; Chromium only for PR gate |
| Large subscription names (255+ chars) | Unit | 0.5 | Edge case: very long names don't truncate |
| Accessibility: Export button has aria-label | E2E | 0.5 | Screen reader compatibility |

**Total P3**: 3 scenarios, **2.5 hours**

---

## Test Execution Order

### Smoke Tests (<5 min) — Fastest feedback

Run these first to catch build-breaking issues:

- [ ] **U-001**: Export button exists and is clickable (30s)
- [ ] **U-002**: CSV serializer produces valid header row (45s)
- [ ] **U-011**: File downloads successfully (1 min)

**Total**: 3 scenarios, ~2 min

### P0 Tests (<10 min) — Critical path

- [ ] **U-001**: Export all subscriptions (3 subs) → verify CSV content (2 min)
- [ ] **U-002**: CSV headers correct (30s)
- [ ] **U-003**: Special chars: commas (30s)
- [ ] **U-004**: Special chars: quotes (30s)
- [ ] **U-005**: Special chars: newlines (30s)
- [ ] **U-007**: Filtered subscriptions export (cost range filter) (1.5 min)

**Total**: 6 scenarios, ~5.5 min

### P1 Tests (<15 min)

- [ ] **U-006**: Empty list behavior (1 min)
- [ ] **U-008**: Filename format (30s)
- [ ] **U-009**: UTF-8 encoding (30s)
- [ ] **U-012**: Duplicate export prevention (1 min)
- [ ] **U-013**: Open in Excel/Google Sheets (2 min)

**Total**: 5 scenarios, ~5 min

### P2/P3 Tests (<30 min)

- [ ] **U-010**: Performance: 1000 subscriptions <2s (2 min)
- [ ] **I-001 + I-002**: Context integration tests (2 min)
- [ ] **Cross-browser** (optional, nightly): Firefox, Webkit (5 min)

**Total**: 3–5 scenarios, ~9 min

**Grand Total**: ~20 min for all tests (PR gate: 10 min smoke + P0 + P1)

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Complexity | Avg Hours/Test | Total Hours | Notes |
|----------|-------|-----------|----------------|-------------|-------|
| P0 | 6 | High | 1.5 | 8–10 | Complex edge cases, file format validation |
| P1 | 5 | Medium | 1.5 | 7–8 | Standard integration, E2E flows |
| P2 | 4 | Low | 0.75 | 3–4 | Performance, edge cases |
| P3 | 3 | Low | 0.5 | 1.5–2 | Optional coverage |
| **Total** | **18** | — | — | **30–47** | **~1 week (1 dev); ~3 days (2 devs)** |

### Fixtures & Utilities Required

| Component | Type | Hours | Reusable? | Notes |
|-----------|------|-------|-----------|-------|
| **Subscription Factory** | Data Factory | 2 | ✅ Yes | Uses Faker; reusable for Story 2, search, filters |
| **CSV Serializer** | Pure Function | 3 | ✅ Yes | Core logic; testable in isolation |
| **Download Handler Fixture** | Playwright | 2 | ✅ Yes | Intercepts Blob downloads; reusable for all export tests |
| **CSV Parser (for validation)** | Test Utility | 1.5 | ✅ Yes | Reads CSV; validates structure; reusable |
| **Performance Profiler** | Custom | 1 | Partial | Measures serialization time; story-specific tuning |
| **localStorage Mock** | Test Utility | 0.5 | ✅ Yes | Already in project; verify for export tests |

**Total Infrastructure**: 10 hours (includes documentation + reusability setup)

### Prerequisites

**Test Data:**

- Subscription factory (uses Faker for cost, name, dates)
- 100-record dataset for smoke/P0/P1
- 1000-record dataset for P2 performance test

**Tooling:**

- Playwright E2E (already configured)
- Vitest for unit tests (already configured)
- CSV parser library (lightweight; e.g., `papaparse` or custom parser)

**Environment:**

- React app running on `localhost:5173` (Vite dev server)
- localStorage accessible and writable
- Chromium browser available (required); Firefox/Webkit optional for nightly

---

## Quality Gate Criteria

### Pass/Fail Thresholds

| Gate | Threshold | Action if Failed |
|------|-----------|------------------|
| **P0 pass rate** | 100% | Revert + fix |
| **P1 pass rate** | ≥95% | Revert (if critical); fix + re-run (if non-critical) |
| **P2/P3 pass rate** | ≥90% | Monitor; fix in follow-up |
| **High-risk mitigations** | 100% (R-001, R-002) | Revert + escalate |

### Coverage Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **CSV Serializer Line Coverage** | ≥80% | Critical path function; high-confidence logic |
| **Export Button E2E Coverage** | 100% | All user-visible paths (normal, empty, filtered) |
| **Data Integrity (edge cases)** | 100% | Special chars, encoding, empty fields |
| **Performance Benchmark** | <2s for 1000 records | Per SC-001 success criteria |

### Non-Negotiable Requirements

- [ ] All P0 tests passing (6/6 scenarios)
- [ ] No high-risk items (R-001, R-002) unmitigated
- [ ] Data integrity tests pass (no corruption, no truncation)
- [ ] Performance test passes (<2s baseline established)
- [ ] Code review: no hard waits, no flaky patterns in E2E tests

---

## Mitigation Plans

### R-001: Special Character Corruption in CSV (Score: 6)

**Risk**: Subscription names with commas, quotes, or newlines break CSV format; file unreadable in Excel

**Mitigation Strategy**:
1. Unit tests for CSV serializer with edge cases (7 test cases covering all special chars)
2. Integration test: export → open in Excel/Google Sheets → validate layout
3. UTF-8 encoding validation
4. Code review: ensure CSV RFC 4180 compliance (quotes escaped, CRLF line endings)

**Owner**: Dev
**Timeline**: Sprint start (Day 1–2)
**Status**: Planned
**Verification**: All 3 E2E tests pass; file opens correctly in spreadsheet apps

### R-002: Wrong Subscriptions Exported (Score: 6)

**Risk**: Export includes full list instead of filtered view; user exports wrong data

**Mitigation Strategy**:
1. Integration test: mock useSubscriptions with filtered data → verify export receives filtered data
2. E2E test: apply cost filter → export → verify only filtered records in CSV
3. Code review: verify export function accepts filtered data parameter, not raw localStorage
4. Unit test: mock context state transitions

**Owner**: Dev
**Timeline**: Sprint start (Day 1–2)
**Status**: Planned
**Verification**: Integration + E2E test pass; code review confirms data flow

---

## Assumptions and Dependencies

### Assumptions

1. **React Context stable**: SubscriptionContext and useSubscriptions hook are finalized; no breaking changes expected during test implementation
2. **localStorage available**: Browser localStorage accessible for all test users; no privacy/sandbox restrictions
3. **Modern browser APIs**: Blob and download APIs supported (Chrome/Edge 14+, Firefox 20+); no IE11 support needed
4. **Single file format**: CSV only required for v1; Excel/PDF out of scope
5. **Synchronous export**: No async delays or background jobs; immediate file generation expected
6. **User authenticated**: Export only available to authenticated users; no public/anonymous exports

### Dependencies

| Dependency | Required By | Status |
|-----------|-------------|--------|
| Story 1 implementation (export button + CSV logic) | Day 1 EOD | Not started |
| useSubscriptions hook working (with filter support) | Day 1 EOD | Assumed complete per project-context.md |
| Playwright test environment configured | Day 1 AM | ✅ Complete |
| Subscription data factory (Faker-based) | Day 1 PM | In progress |
| CSV parser utility (for validation) | Day 2 AM | Planned |

### Risks to Test Plan

- **Risk**: Export performance regression with >1000 subscriptions
  - **Impact**: Triggers timeout; test fails; feature blocked until optimized
  - **Contingency**: Profile + optimize serializer; defer P3 large datasets if time-boxed

- **Risk**: Playwright download interception unstable in CI
  - **Impact**: E2E download tests flaky in GitHub Actions
  - **Contingency**: Fall back to file system checks; validate content via API instead

- **Risk**: Subscription factory collisions in parallel tests
  - **Impact**: Tests interfere; false failures
  - **Contingency**: Ensure factory uses UUIDs + timestamps; run parallel tests with separate localstorage instances

---

## Definition of Done (DoD) for This Story

✅ **Automated Test Coverage**: 18 test scenarios across unit, integration, E2E  
✅ **High-Risk Mitigation**: R-001 and R-002 covered by test + code review  
✅ **Acceptance Criteria Validation**: All 3 acceptance scenarios covered (U-001, U-007, U-013)  
✅ **Edge Cases**: Special chars, empty list, performance, encoding all tested  
✅ **Performance Validated**: <2s export time for 1000 records verified  
✅ **Quality Gates Passed**: P0 100%, P1 ≥95%, high-risk items resolved  
✅ **CI/CD Ready**: All tests automated; run on PR + merge-to-main  
✅ **Fixtures Documented**: Subscription factory, CSV handler, download fixture reusable for Story 2  
✅ **Test Code Reviewed**: No hard waits, no flaky patterns; follows project standards  
✅ **Ready for Handoff**: Test design document + implementation checklist ready for dev sprint

---

## Follow-on Workflows

**For Development Team** (after this test design is approved):

1. **ATDD Mode**: Run `bmad-testarch-atdd` to generate failing P0 tests + implementation checklist before coding
2. **Implementation**: Dev implements export feature to make tests pass
3. **Coverage Expansion**: Run `bmad-testarch-automate` after implementation for broader P2/P3 coverage if time permits
4. **System Integration**: When Story 2 (filtered exports) is ready, reuse fixtures + factory patterns from this story

**Optional** (if full system-level test design needed):

- Run `test-design` in system-level mode to create architecture-level test strategy across all epics

---

**Test Design Complete** ✅

This document is ready for:
- QA Lead review → adjust coverage if needed
- Dev Lead review → confirm implementation feasibility
- PM sign-off → confirm acceptance criteria alignment

Next step: Implement export feature using ATDD workflow (see "Follow-on Workflows").

