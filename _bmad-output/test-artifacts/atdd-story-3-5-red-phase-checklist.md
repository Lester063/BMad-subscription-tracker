---
story_id: "3.5"
story_key: "3-5-add-keyboard-navigation-accessibility-wcag-2-1-level-a"
epic: "3"
atdd_phase: "RED"
created: "2026-05-05"
created_by: "Murat (Master Test Architect)"
workflow: "atdd-create"
---

# ATDD Red-Phase Execution Checklist: Story 3.5

**Story:** Add Keyboard Navigation & Accessibility (WCAG 2.1 Level A)  
**Phase:** TDD RED (Tests written, will fail until implementation)  
**Focus:** E2E Playwright Keyboard Navigation Tests  
**Date Created:** 2026-05-05

---

## ✅ Red-Phase Test Suite Generated

**File:** `tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts`

**Test Coverage:**
- **P0 (Critical Path):** 12 tests — Tab order, focus indicators, no keyboard traps
- **P1 (High Priority):** 3 tests — Tab order validation, success messages, Enter key
- **Total:** 15 E2E test scenarios

**All tests marked with `test.skip()`** — RED phase scaffold (expected to fail until implementation)

---

## 🎯 Acceptance Criteria Mapped to Tests

| AC | Title | Tests | P0 | P1 |
|----|-------|-------|----|----|
| **AC1** | Keyboard Navigation - Tab Order | 7 tests | ✅ | ✅ |
| **AC4** | List Semantics & Navigation | 3 tests | ✅ | — |
| **AC6** | Focus Indicators Visible | 3 tests | ✅ | — |
| **AC8** | No Keyboard Traps | 2 tests | ✅ | — |
| **AC5** | Focus Management - Success Messages | 1 test | — | ✅ |

**Total Coverage:** 15 tests addressing 5 core ACs (keyboard navigation + focus management)

---

## 📋 Test Breakdown

### P0 Tests (Critical Path — 12 tests)

1. **TAB Order - Form Fields** (4 tests)
   - ✅ TAB moves focus to Name input (first field)
   - ✅ TAB navigates: Name → Cost → DueDate → Add → Cancel
   - ✅ Shift+Tab navigates backward through same order
   - ✅ TAB wraps from last element to first (focus cycling)

2. **Keyboard Trap Prevention** (2 tests)
   - ✅ TAB 20+ times consecutively - no element traps focus
   - ✅ Escape key closes modal/dialog (if present)

3. **Focus Indicators** (3 tests)
   - ✅ Focus indicator visible on Name input (outline ≥ 2px)
   - ✅ Focus indicator visible on all interactive elements
   - ✅ Focus outline has sufficient contrast (≥ 3:1 WCAG Level A)

4. **List Navigation** (2 tests)
   - ✅ Add subscription, then TAB to first list item
   - ✅ TAB through subscription list items in order

5. **Edge Cases** (1 test)
   - ✅ TAB skips invisible/hidden elements

### P1 Tests (High Priority — 3 tests)

1. **Tab Order Validation**
   - ✅ Tab order respects DOM order (no tabindex > 0)

2. **Focus Management**
   - ✅ Success message announces automatically via aria-live

3. **Alternative Input Methods**
   - ✅ Enter key submits form (alternative to clicking button)

---

## 🔴 RED Phase: Expected Failures

**Current State:** Tests are marked `test.skip()` because:
- ✅ Tests are correctly written for expected behavior
- ❌ UI implementation for Story 3.5 is not yet complete
- 🔴 Running tests now would fail due to missing DOM elements and focus handling

**Example:**
```typescript
test.skip('[P0] TAB moves focus to Name input field', async ({ page }) => {
  // RED: Will fail because:
  // 1. Form elements don't exist yet
  // 2. Tab order not implemented
  // 3. Focus management not wired up
  
  // GREEN: Will pass once:
  // 1. HTML form with proper input IDs
  // 2. Natural tab order without tabindex manipulation
  // 3. Focus-visible CSS styles added
});
```

---

## 🟢 Green Phase: Activation Steps

**For Developer - When Ready to Implement:**

### Step 1: Remove `test.skip()` Incrementally

As you implement each feature, remove the corresponding `test.skip()` to activate tests:

```typescript
// RED PHASE
test.skip('[P0] TAB moves focus to Name input field', async ({ page }) => {
  // ...
});

// GREEN PHASE (after implementation)
test('[P0] TAB moves focus to Name input field', async ({ page }) => {
  // Now runs and verifies behavior
});
```

### Step 2: Run Tests to Verify Implementation

```bash
# Run ONE test to verify it passes
npx playwright test tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts \
  -g "TAB moves focus to Name input"

# Run all P0 tests
npx playwright test tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts \
  -g "\[P0\]"

# Run entire suite
npx playwright test tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts
```

### Step 3: Implementation Checklist (Per Test Activation)

| AC | Implementation Task | When to Activate Test | Verification |
|----|------------------|-----|--------|
| AC1 | Add form inputs with proper IDs | Add Name, Cost, DueDate inputs | P0-001 test passes |
| AC1 | Verify natural tab order (no tabindex > 0) | After form complete | P0-002 test passes |
| AC1 | Implement Shift+Tab navigation | Form working bidirectionally | P0-003 test passes |
| AC1 | Add focus cycling | Tab from last → first | P0-004 test passes |
| AC6 | Add focus outline CSS (:focus pseudo-class) | Visual focus styles added | P0-009, P0-010 tests pass |
| AC8 | Test no keyboard traps | After full form + list integration | P0-005, P0-006 tests pass |
| AC4 | Render subscription list with `<ul>/<li>` | List appears | P0-011, P0-012 tests pass |
| AC5 | Add `role="alert"` + `aria-live="polite"` to success message | Success message wired | P1-002 test passes |
| AC1 | Support Enter key form submission | Form submission logic | P1-003 test passes |

---

## 📊 Test Execution Strategy

### Current Phase (RED)

```bash
# View red-phase tests (they're skipped)
npx playwright test tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts \
  --reporter=list

# Output: 15 tests skipped (as expected in RED phase)
```

### Implementation Phase (GREEN)

1. **Developer removes `test.skip()` for one feature**
2. **Developer implements that feature**
3. **Test runs and verifies implementation**
4. **Repeat until all tests pass**

### Completion Phase (REFACTOR)

- All tests passing ✅
- Optimize test selectors and waits if needed
- Consolidate duplicate setup logic
- Mark story 3.5 as DONE

---

## 🔗 Related Documents

- **Test Design:** [test-design-story-3-5.md](../_bmad-output/test-artifacts/test-design-story-3-5.md)
- **Story Spec:** [3-5-add-keyboard-navigation-accessibility-wcag-2-1-level-a.md](.../implementation-artifacts/3-5-add-keyboard-navigation-accessibility-wcag-2-1-level-a.md)
- **ATDD Workflow:** This checklist

---

## 📝 Developer Notes

### Key Selectors Used

```typescript
const NAME_INPUT = 'input[id="name"]';
const COST_INPUT = 'input[id="cost"]';
const DUE_DATE_INPUT = 'input[id="due-date"]';
const ADD_BUTTON = 'button:has-text("Add Subscription")';
const CANCEL_BUTTON = 'button:has-text("Cancel")';
const SUBSCRIPTION_LIST = 'ul[data-testid="subscription-list"]';
```

**Update these if your HTML IDs/selectors are different.**

### Expected HTML Structure (for GREEN phase)

```html
<form>
  <label for="name">Name</label>
  <input id="name" type="text" aria-required="true" />
  
  <label for="cost">Cost</label>
  <input id="cost" type="number" aria-required="true" />
  
  <label for="due-date">Due Date</label>
  <input id="due-date" type="number" aria-required="true" />
  
  <button>Add Subscription</button>
  <button>Cancel</button>
</form>

<ul data-testid="subscription-list">
  <li><!-- subscription item --></li>
</ul>

<div role="alert" aria-live="polite">
  <!-- Success message appears here -->
</div>
```

### CSS for Focus Indicators

```css
input:focus,
button:focus {
  outline: 2px solid #0066cc; /* P0 requirement: 2px minimum */
  outline-offset: 2px;
}
```

---

## ✅ Next Steps

1. **Review this test file** with the team
2. **Verify selectors match your HTML** (update if needed)
3. **During implementation, remove `test.skip()`** incrementally
4. **Run tests to verify** each feature works
5. **Mark story 3.5 DONE** when all 15 tests pass

---

## 📞 Support

- Questions about ATDD workflow? See SKILL.md
- Need to modify test selectors? Update the constants at the top of the file
- Tests not matching your implementation? Adjust the HTML structure or selectors

---

**ATDD Red-Phase Test Suite Complete** ✅

*Next Step: Developer implements features → GREEN phase → REFACTOR phase → Story Done*

*Generated by Murat, Master Test Architect*  
*BMad Test Architecture Framework v6.5.0*  
*2026-05-05*
