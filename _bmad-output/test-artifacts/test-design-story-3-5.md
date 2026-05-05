---
story_id: "3.5"
story_key: "3-5-add-keyboard-navigation-accessibility-wcag-2-1-level-a"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "test-design-generated"
created: "2026-05-05"
created_by: "Murat (Master Test Architect)"
workflow: "epic-level"
design_mode: "epic-level"
---

# Test Design: Story 3.5 — Add Keyboard Navigation & Accessibility (WCAG 2.1 Level A)

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.5  
**Status:** test-design-generated  
**Focus:** Keyboard navigation and WCAG 2.1 Level A compliance testing

---

## 🎯 Test Design Scope

This test design covers **user-facing accessibility behaviors** for keyboard navigation and WCAG 2.1 Level A compliance. We focus on testable accessibility criteria and ignore implementation details (React Hook Form, CSS class names, etc.).

**Core Accessibility Testing Areas:**
1. **Keyboard Navigation** - Tab order, focus indicators, trap-free navigation
2. **Semantic HTML** - Proper form/list semantics, heading hierarchy
3. **ARIA Labels & Live Regions** - Accessible names for buttons, form field associations, dynamic announcements
4. **Focus Management** - Visible focus indicators, success message announcements
5. **Color Contrast** - WCAG Level A minimum (4.5:1 normal text, 3:1 large text)

---

## 📋 Acceptance Criteria Mapping

| AC | Title | Test Category | Priority | Risk |
|----|-------|---------------|----------|------|
| **AC1** | Keyboard Navigation - Tab Order | E2E Keyboard | P0 | 6 |
| **AC2** | Form Labels Associated with Inputs | Component A11y | P0 | 6 |
| **AC3** | Buttons Have Accessible Names | Component A11y | P0 | 6 |
| **AC4** | List Semantics & Navigation | Component Semantic | P0 | 5 |
| **AC5** | Focus Management - Success Messages | Component A11y | P1 | 4 |
| **AC6** | Focus Indicators Visible on All Elements | E2E Visual | P0 | 6 |
| **AC7** | Semantic HTML & ARIA Labels | Component Semantic | P0 | 6 |
| **AC8** | No Keyboard Traps | E2E Keyboard | P0 | 7 |
| **AC9** | Color Contrast - WCAG Level A | Visual Audit | P1 | 5 |

---

## ⚠️ Risk Assessment Matrix

### Risk Identification & Scoring

| ID | Risk | Category | Probability | Impact | Score | Action | Mitigation |
|----|----|----------|-------------|--------|-------|--------|-----------|
| **R-001** | Keyboard trap in form (focus cannot escape) | TECH/A11y | 2 (Medium) | 3 (Critical) | **6** | MITIGATE | E2E test TAB through all elements; verify Escape key closes any modal |
| **R-002** | Form labels not announced by screen reader | SEC/A11y | 3 (High) | 3 (Critical) | **9** | **BLOCK** | Unit test each input has `aria-required`, `aria-describedby` on error; manual screen reader test |
| **R-003** | Focus indicators removed by CSS or invisible | TECH/A11y | 2 (Medium) | 3 (Critical) | **6** | MITIGATE | E2E test TAB visibility; screenshot comparison; color contrast check (3:1 minimum) |
| **R-004** | Tab order not logical (e.g., jumps form→list) | TECH/A11y | 2 (Medium) | 2 (Degraded) | **4** | MONITOR | E2E TAB sequence test; verify form completes before list items |
| **R-005** | Icon buttons missing aria-label or text | SEC/A11y | 3 (High) | 2 (Degraded) | **6** | MITIGATE | Automated a11y scan (axe-core); manual review of Edit/Delete buttons |
| **R-006** | Screen reader does not announce success message | TECH/A11y | 2 (Medium) | 2 (Degraded) | **4** | MONITOR | Component test `role="alert"` + `aria-live="polite"`; manual SR test |
| **R-007** | Color contrast insufficient (< 4.5:1) | TECH/A11y | 1 (Low) | 2 (Degraded) | **2** | DOCUMENT | WCAG contrast checker tool; automate with axe-core |

**Risk Summary:**
- **BLOCK (score 9):** 1 risk — form label accessibility (R-002) — MUST mitigate before release
- **MITIGATE (score 6):** 3 risks — keyboard trap (R-001), focus indicators (R-003), icon buttons (R-005)
- **MONITOR (score 4-5):** 2 risks — tab order (R-004), success messages (R-006)
- **DOCUMENT (score 1-3):** 1 risk — color contrast (R-007)

---

## 🧪 Test Coverage Strategy

### Test Level Selection

| Test Level | Scope | Technologies | Focus | AC Coverage |
|-----------|-------|------|-------|------------|
| **Unit** | Individual form/list components | Vitest + React Testing Library | ARIA attributes, labels, semantic HTML | AC2, AC3, AC7 |
| **Component A11y** | Accessibility assertions | @testing-library/react + vitest | Focus, ARIA live regions, alerts | AC2, AC3, AC5, AC7 |
| **E2E Keyboard** | Full keyboard navigation | Playwright | TAB order, focus sequence, no traps | AC1, AC4, AC8 |
| **E2E Visual** | Focus indicator visibility | Playwright + screenshot | Focus outline visibility, contrast | AC6 |
| **Automated A11y Scan** | Page-level accessibility | @axe-core/playwright | WCAG violations, color contrast | AC9 |
| **Manual Screen Reader** | Real accessibility tools | NVDA/JAWS/VoiceOver | Label announcement, semantics | AC2, AC3, AC4 |

---

## 📊 Test Priority Matrix

### P0 - Critical Path (Must Pass Before Release)

| Priority | Scenario | Test Level | AC | Risk | Effort |
|----------|----------|-----------|----|----|--------|
| **P0-001** | Tab key moves focus through form fields in logical order | E2E Keyboard | AC1 | R-001 | Medium |
| **P0-002** | Tab order: Name → Cost → DueDate → Add → Cancel → List → Edit/Delete per item | E2E Keyboard | AC1 | R-001 | Medium |
| **P0-003** | Shift+Tab navigates backward through same order | E2E Keyboard | AC1 | R-001 | Medium |
| **P0-004** | No keyboard trap — focus can always escape (press Tab repeatedly 20+ times) | E2E Keyboard | AC8 | R-001 | High |
| **P0-005** | Escape key closes any modal/dialog (if present) | E2E Keyboard | AC8 | R-001 | Low |
| **P0-006** | Form labels associated via `htmlFor` + `id` attributes | Unit | AC2 | R-002 | Low |
| **P0-007** | Screen reader announces: "Name, text input, required" (or similar) | Manual + Component | AC2 | R-002 | Medium |
| **P0-008** | All buttons have descriptive accessible names (no generic "Submit" or "Delete") | Unit + Manual | AC3 | R-005 | Low |
| **P0-009** | Icon buttons (Edit, Delete) have `aria-label` with action + item name | Component A11y | AC3 | R-005 | Low |
| **P0-010** | Visible focus indicator on every interactive element (outline ≥ 2px, contrast ≥ 3:1) | E2E Visual | AC6 | R-003 | Medium |
| **P0-011** | List renders with `<ul>` + `<li>` semantics (not divs) | Unit | AC4 | — | Low |
| **P0-012** | SubscriptionList has `aria-label="Subscriptions"` for screen reader announcement | Component A11y | AC4 | — | Low |
| **P0-013** | Main content area has `role="main"` (already verified ✅) | Unit | AC7 | — | Low |
| **P0-014** | Form has semantic `<form>` element | Unit | AC7 | — | Low |
| **P0-015** | Required fields marked `aria-required="true"` | Component A11y | AC7 | R-002 | Low |

**P0 Test Count:** 15 tests | **Estimated Effort:** 2-3 days (dev + QA) | **Coverage Target:** 100% pass rate

---

### P1 - High Priority (Should Pass)

| Priority | Scenario | Test Level | AC | Risk | Effort |
|----------|----------|-----------|----|----|--------|
| **P1-001** | Success message announces automatically (role="alert" + aria-live="polite") | Component A11y | AC5 | R-006 | Medium |
| **P1-002** | Success message visible on screen for 3 seconds (not hidden below scroll) | E2E | AC5 | R-006 | Low |
| **P1-003** | Focus returns to form after success message dismissal | E2E | AC5 | R-006 | Medium |
| **P1-004** | Error messages linked to inputs via `aria-describedby` | Component A11y | AC7 | R-002 | Medium |
| **P1-005** | Heading hierarchy preserved: `<h1>` for page, `<h2>` for sections | Unit | AC7 | — | Low |
| **P1-006** | Tab order respects DOM order (no tabindex > 0) | Component A11y | AC1 | — | Medium |
| **P1-007** | Tab wraps from last element to first (focus cycling) | E2E Keyboard | AC1 | — | Medium |
| **P1-008** | Color contrast ratio ≥ 3:1 on all interactive elements (axe-core scan) | Automated A11y | AC9 | R-007 | Low |

**P1 Test Count:** 8 tests | **Estimated Effort:** 1-2 days | **Coverage Target:** ≥95% pass rate

---

### P2 - Medium Priority (Nice to Have)

| Priority | Scenario | Test Level | AC | Risk | Effort |
|----------|----------|-----------|----|----|--------|
| **P2-001** | Tab order skips hidden elements (e.g., empty state message) | E2E Keyboard | AC1 | — | Low |
| **P2-002** | Focus outline color customizable without removing (not outline: none) | E2E Visual | AC6 | — | Low |
| **P2-003** | Placeholder text does not substitute for `<label>` element | Unit | AC2 | — | Low |
| **P2-004** | Click handlers also respond to Enter/Space keys (buttons) | E2E Keyboard | AC3 | — | Medium |
| **P2-005** | Screen reader announces button purpose (not just "Button") | Manual | AC3 | — | Low |

**P2 Test Count:** 5 tests | **Estimated Effort:** 1-2 days | **Coverage Target:** ≥90% pass rate

---

### P3 - Low Priority (Test if Time Permits)

| Priority | Scenario | Test Level | AC | Risk | Effort |
|----------|----------|-----------|----|----|--------|
| **P3-001** | Keyboard shortcut hints available (e.g., "Press Tab to navigate") | E2E | — | — | Low |
| **P3-002** | Font size adjustable without breaking layout | Manual | — | — | Medium |
| **P3-003** | Dark mode support (if implemented) | E2E Visual | — | — | Medium |

**P3 Test Count:** 3 tests | **Estimated Effort:** 1+ days | **Coverage Target:** Best effort

---

## 📈 Coverage Plan by Test Type

### Unit Tests (Vitest + React Testing Library)

**Target:** 90%+ coverage of component ARIA attributes and semantic HTML

```
SubscriptionForm.tsx
  ├─ Renders <form> element
  ├─ Each input has <label htmlFor="...">
  ├─ Name input has aria-required="true"
  ├─ Cost input has aria-required="true"
  ├─ DueDate input has aria-required="true"
  ├─ Buttons have accessible names (not empty)
  └─ Error messages have aria-describedby linking

SubscriptionList.tsx
  ├─ Renders <ul> (not <div>)
  ├─ Each item is <li>
  ├─ List has aria-label="Subscriptions"
  ├─ Edit button has aria-label="Edit [subscription name]"
  └─ Delete button has aria-label="Delete [subscription name]"

App.tsx
  ├─ Main content has role="main"
  ├─ Success message has role="alert" + aria-live="polite"
  └─ Headings use proper semantic tags (<h1>, <h2>)
```

**Test Framework:** Vitest + @testing-library/react
**Assertion Library:** `@testing-library/jest-dom` with custom ARIA matchers
**Files to Create:** `tests/unit/a11y-*.spec.ts` (3-4 test suites)

---

### E2E Keyboard Navigation Tests (Playwright)

**Target:** 100% coverage of AC1 (tab order), AC8 (no traps), AC6 (focus visible)

```
story-3-5-keyboard-navigation.spec.ts
  ├─ Test Group: "Tab Order - Form Fields"
  │  ├─ TAB 1x → focus on Name input
  │  ├─ TAB 1x → focus on Cost input
  │  ├─ TAB 1x → focus on DueDate input
  │  ├─ TAB 1x → focus on Add button
  │  ├─ TAB 1x → focus on Cancel button
  │  ├─ TAB 1x → focus on first list item
  │  └─ ...continue through all items
  │
  ├─ Test Group: "Reverse Tab Order (Shift+Tab)"
  │  └─ Reverse navigation through same sequence
  │
  ├─ Test Group: "No Keyboard Traps"
  │  ├─ TAB 20+ times in a row (verify focus cycles)
  │  ├─ No element traps focus
  │  └─ Escape key functional where applicable
  │
  └─ Test Group: "Focus Indicators"
     ├─ Focus outline visible on every TAB
     ├─ Outline contrast ≥ 3:1
     └─ Outline not removed by CSS
```

**Test Framework:** Playwright with native keyboard simulation
**Command:** `await page.keyboard.press('Tab')`
**Focus Detection:** `await expect(element).toBeFocused()`
**Files to Create:** `tests/e2e/story-3-5-keyboard-navigation.spec.ts`
**Estimated Tests:** 12-15 E2E keyboard tests

---

### Component Accessibility Tests (React Testing Library + Axe)

**Target:** 100% WCAG Level A violations eliminated

```
story-3-5-accessibility.spec.ts
  ├─ Test Suite: "Form Field Labels"
  │  ├─ Each input has associated label
  │  ├─ Label text announces with screen reader
  │  ├─ Required fields marked aria-required
  │  └─ Error messages linked via aria-describedby
  │
  ├─ Test Suite: "Button Accessible Names"
  │  ├─ "Add Subscription" button clearly labeled
  │  ├─ "Cancel" button clearly labeled
  │  ├─ Edit buttons have aria-label="Edit [name]"
  │  └─ Delete buttons have aria-label="Delete [name]"
  │
  ├─ Test Suite: "List Semantics"
  │  ├─ List renders as <ul>
  │  ├─ Items render as <li>
  │  ├─ List has aria-label
  │  └─ Screen reader announces "List with N items"
  │
  ├─ Test Suite: "Focus Management"
  │  ├─ Success message announces automatically
  │  ├─ Success message has role="alert"
  │  ├─ Success message has aria-live="polite"
  │  └─ Focus visible after interaction
  │
  ├─ Test Suite: "Semantic HTML"
  │  ├─ Form is <form> element (not <div>)
  │  ├─ Headings use proper hierarchy
  │  ├─ Main content has role="main"
  │  └─ Heading hierarchy preserved
  │
  └─ Test Suite: "Axe-Core WCAG Scan"
     ├─ Page load → axe.analyze()
     ├─ Violations array is empty
     └─ Color contrast violations: 0
```

**Test Framework:** Vitest + @testing-library/react + @axe-core/playwright
**Command:** `const results = await new AxeBuilder({ page }).analyze();`
**Files to Create:** `tests/unit/story-3-5-accessibility.spec.ts`
**Estimated Tests:** 12-15 component a11y tests

---

### Automated Accessibility Scanning (Axe-Core)

**Target:** 0 WCAG Level A violations on every render

```javascript
// Playwright E2E test helper
async function auditAccessibility(page) {
  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast']) // Optional: separate test
    .analyze();

  expect(results.violations).toEqual([]); // No violations
  expect(results.passes.length).toBeGreaterThan(10); // Some passes
}

// Run in each test:
await page.goto('http://localhost:5173');
await auditAccessibility(page);

// Add subscription
await fillForm(page, { name: 'Netflix', cost: 15.99, dueDate: 15 });
await page.click('button:has-text("Add Subscription")');

// Audit after addition
await auditAccessibility(page);
```

**Integration:** Call in `afterEach` hook to scan entire page
**Files to Create:** `tests/e2e/story-3-5-accessibility-scan.spec.ts`
**Estimated Tests:** 3-5 automated scans

---

### Manual Screen Reader Testing (Not Automated)

**Scope:** Verification that screen readers announce correctly (NVDA, JAWS, VoiceOver)

**Test Cases:**
1. Tab to each form input → verify label announcement
2. Add subscription → verify success message announcement
3. List appears → verify "List with N items" announcement
4. Navigate list → verify each item details announced

**Execution:** Manual testing with NVDA (Windows) or VoiceOver (macOS)
**Documentation:** Screenshot/video of NVDA output for each AC
**Frequency:** At least once before release (can be conducted once for P0 AC2)

---

## 🎯 Quality Gates & Exit Criteria

### Release Gate (MUST PASS)

- ✅ All **P0 tests pass** (15/15 tests) — 100% pass rate
- ✅ All **P1 tests pass** (8/8 tests) — 100% pass rate
- ✅ **Axe-core violations = 0** (automated scan)
- ✅ **Manual screen reader test** confirms label announcements
- ✅ **Risk R-002 (BLOCK)** fully mitigated with documented test evidence
- ✅ **No keyboard traps** verified (TAB 20+ times in full app)
- ✅ **Focus indicators visible** on all interactive elements

### Quality Metrics

| Metric | Target | P0 | P1 | P2 | P3 |
|--------|--------|----|----|----|----|
| **Pass Rate** | 100% | 100% | ≥95% | ≥90% | Best effort |
| **Coverage** | WCAG Level A | 100% | 95% | 90% | 80% |
| **Axe Violations** | 0 | 0 | 0 | 0 | <5 |
| **Risk Mitigation** | Full | R-002 ✓ | R-001, R-003, R-005 | R-004, R-006 | R-007 |

---

## 📋 Test Execution Checklist

### Pre-Execution (Preflight)

- [ ] All source files reviewed for ARIA attributes
- [ ] Project builds without errors
- [ ] Playwright installed and `playwright.config.ts` verified
- [ ] Test database/fixtures set up
- [ ] Browser versions targeted (Chromium, Firefox, Safari if applicable)

### Test Execution Order

1. **Unit Tests** (WCAG semantic HTML + ARIA attributes)
   - Command: `npm run test:unit tests/unit/a11y-*.spec.ts`
   - Expected: All pass
   - Time: ~5 minutes

2. **Component A11y Tests** (Accessibility assertions)
   - Command: `npm run test:unit tests/unit/story-3-5-accessibility.spec.ts`
   - Expected: All pass
   - Time: ~5 minutes

3. **E2E Keyboard Tests** (Tab order, focus, no traps)
   - Command: `npx playwright test tests/e2e/story-3-5-keyboard-navigation.spec.ts`
   - Expected: All pass
   - Time: ~10 minutes

4. **E2E Accessibility Scan** (Axe violations)
   - Command: `npx playwright test tests/e2e/story-3-5-accessibility-scan.spec.ts`
   - Expected: 0 violations
   - Time: ~5 minutes

5. **Manual Screen Reader Test** (NVDA/VoiceOver)
   - Manual steps for AC2 verification
   - Time: ~15 minutes

**Total Estimated Test Time:** 45-50 minutes

---

## 📚 Files Modified & Dependencies

### Files to Modify

| File | Changes | Effort | Risk |
|------|---------|--------|------|
| `src/components/SubscriptionForm/SubscriptionForm.tsx` | Add `<form>`, proper `<label>`, `aria-required`, `aria-describedby` | Medium | Medium |
| `src/components/SubscriptionList/SubscriptionList.tsx` | Add `aria-label`, verify `<li>` semantics | Low | Low |
| `src/App.tsx` | Verify `role="main"`, headings hierarchy | Low | Low |

### Test Files to Create

| File | Scope | Test Count |
|------|-------|-----------|
| `tests/unit/a11y-form.spec.ts` | Form ARIA + labels | 6-8 tests |
| `tests/unit/a11y-list.spec.ts` | List semantics | 4-5 tests |
| `tests/unit/story-3-5-accessibility.spec.ts` | Component a11y assertions | 12-15 tests |
| `tests/e2e/story-3-5-keyboard-navigation.spec.ts` | E2E keyboard nav | 12-15 tests |
| `tests/e2e/story-3-5-accessibility-scan.spec.ts` | Axe-core scans | 3-5 tests |

**Total New Tests:** 37-48 tests

---

## 🚀 Resource Estimates

| Role | Task | Effort | Days |
|------|------|--------|------|
| **Developer** | Modify SubscriptionForm (ARIA labels, semantic HTML) | 4-6 hours | 0.5-1 day |
| **Developer** | Modify SubscriptionList (aria-label) | 1-2 hours | 0.25 day |
| **QA/Test Architect** | Create unit a11y tests | 4-6 hours | 0.5-1 day |
| **QA/Test Architect** | Create E2E keyboard nav tests | 6-8 hours | 0.75-1 day |
| **QA/Test Architect** | Create accessibility scan tests | 2-3 hours | 0.25-0.5 day |
| **QA** | Manual screen reader testing | 2-3 hours | 0.25 day |
| **QA** | Code review + test execution | 2-3 hours | 0.25 day |

**Total Effort:** 21-31 hours (2.5-4 days with parallelization)
**Parallel Execution:** Dev + QA can work in parallel (dev on source, QA on tests)
**Optimized Timeline:** 2-3 days (one sprint cycle)

---

## 📊 Test Design Metadata

| Field | Value |
|-------|-------|
| **Design Date** | 2026-05-05 |
| **Designer** | Murat (Master Test Architect) |
| **Mode** | Epic-Level |
| **Total Test Scenarios** | 48 (P0:15 + P1:8 + P2:5 + P3:3 + Automated:12) |
| **Test Levels** | Unit (18-20), Component A11y (12-15), E2E Keyboard (12-15), E2E Visual (3-5), Automated Scan (3-5), Manual (varies) |
| **Key Risks** | R-002 (BLOCK), R-001 (MITIGATE), R-003 (MITIGATE), R-005 (MITIGATE) |
| **Quality Gate** | P0=100%, P1≥95%, Axe violations=0, R-002 fully mitigated |
| **Estimated Duration** | 2-3 days (dev + QA parallel) |
| **Framework** | Vitest, React Testing Library, Playwright, Axe-Core |
| **Reference Docs** | Story 3.5 spec, WCAG 2.1 Level A, project-context.md |

---

**Test Design Ready for Implementation** ✅

Next Steps:
1. → Review this design with team
2. → Create test files from templates
3. → Execute Step 4 (Coverage Plan) if needed
4. → Proceed to Step 5 (Generate Test Suites)

---

*Generated by Murat, Master Test Architect*  
*BMad Test Architecture Framework v6.5.0*
