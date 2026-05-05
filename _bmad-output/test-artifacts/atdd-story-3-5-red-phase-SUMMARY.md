---
workflow: "atdd-create"
phase: "red"
story_id: "3.5"
created: "2026-05-05"
status: "complete"
---

# ATDD Workflow Complete: Story 3.5 Red-Phase Tests

**Status:** ✅ Red-Phase Test Suite Generated & Ready for Development

**Workflow Steps Completed:**
1. ✅ Step 1: Preflight & Context Loading
2. ✅ Step 2: Generation Mode Selection (AI Generation)
3. ✅ Step 3: Test Strategy Analysis
4. ✅ Step 4B: Generate E2E Failing Test Scaffolds (RED PHASE)
5. ✅ Summary: Checklist & Developer Handoff

---

## 📋 Deliverables

### 1. E2E Playwright Test Suite (RED PHASE)
**File:** `tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts`

- **15 test scenarios** covering keyboard navigation & accessibility
- **P0 tests:** 12 (critical path)
- **P1 tests:** 3 (high priority)
- **All marked with `test.skip()`** (RED phase - expected to fail until implementation)

**Acceptance Criteria Covered:**
- ✅ AC1: Keyboard Navigation - Tab Order (7 tests)
- ✅ AC4: List Semantics & Navigation (3 tests)
- ✅ AC6: Focus Indicators Visible (3 tests)
- ✅ AC8: No Keyboard Traps (2 tests)
- ✅ AC5: Focus Management - Success Messages (1 test, P1)

### 2. ATDD Execution Checklist
**File:** `atdd-story-3-5-red-phase-checklist.md`

- Red phase explanation (why tests skip)
- Green phase activation steps (how to remove `test.skip()`)
- Implementation checklist (when to activate each test)
- Test execution strategy (run commands)
- Expected HTML structure for GREEN phase
- CSS focus indicator template

### 3. Test Design Reference
**File:** `test-design-story-3-5.md` (previously generated)

- Comprehensive test design (48 scenarios total)
- Risk assessment matrix (7 risks, 1 blocker)
- Quality gates & release criteria
- Resource estimates

---

## 🔴 RED Phase Explanation

**Why are all tests `test.skip()`?**

The ATDD (Acceptance Test-Driven Development) workflow follows TDD red-green-refactor:

1. **RED:** Write tests that describe expected behavior
   - ✅ Tests are correct and well-structured
   - ❌ Tests FAIL because features don't exist yet
   - 🔴 Mark with `test.skip()` to document intentional RED phase

2. **GREEN:** Implement features to make tests pass
   - Remove `test.skip()` incrementally as developer builds features
   - Each test turns GREEN when implementation matches expected behavior
   - Once all tests pass, feature is done

3. **REFACTOR:** Optimize code without breaking tests
   - Tests provide safety net for refactoring
   - Ensure quality and maintainability

**Example:**
```typescript
// RED PHASE: Test skipped (will fail without implementation)
test.skip('[P0] TAB moves focus to Name input field', async ({ page }) => {
  // When implemented:
  // 1. HTML form with <input id="name"> exists
  // 2. Focus management wired up
  // 3. CSS :focus styles applied
  // This test will PASS
});

// GREEN PHASE: Developer implements feature
test('[P0] TAB moves focus to Name input field', async ({ page }) => {
  // Now test runs and passes (feature implemented)
});
```

---

## 🟢 Green Phase: Developer Handoff

**When ready to implement Story 3.5:**

### Quick Start
```bash
# 1. Open the red-phase test file
cd subscription-tracker/tests/e2e
cat story-3-5-keyboard-accessibility-atdd-red.spec.ts

# 2. Identify the FIRST P0 test to implement
# Example: "TAB moves focus to Name input field"

# 3. Implement the corresponding feature in source code
# Make sure HTML structure matches expected selectors

# 4. Remove test.skip() for that test
# Change: test.skip('[P0] ...') → test('[P0] ...')

# 5. Run the test
npx playwright test tests/e2e/story-3-5-keyboard-accessibility-atdd-red.spec.ts \
  -g "TAB moves focus to Name input"

# 6. Test should now PASS (GREEN phase)

# 7. Repeat for next test until all are passing
```

### Implementation Sequence (Recommended Order)

**Day 1: Form Fields & Tab Order**
1. Create form HTML with inputs: Name, Cost, DueDate
2. Verify natural tab order (Name → Cost → DueDate → Buttons)
3. Activate & pass tests P0-001 through P0-004

**Day 2: Focus Management & Visual Indicators**
1. Add CSS focus styles (outline: 2px solid #0066cc)
2. Implement focus indicator visibility
3. Activate & pass tests P0-009, P0-010

**Day 2-3: List Integration & Keyboard Traps**
1. Render subscription list with `<ul>/<li>`
2. Implement TAB navigation into list items
3. Verify no keyboard traps (TAB 20+ times cycles)
4. Activate & pass tests P0-005 through P0-012

**Day 3: Success Messages & Alt Input Methods**
1. Add success message with `role="alert"` + `aria-live="polite"`
2. Implement Enter key form submission
3. Activate & pass tests P1-001 through P1-003

---

## 📊 Test Coverage Map

| Test ID | Test Name | AC | Priority | Implementation Target |
|---------|-----------|----|----|----------------------|
| P0-001 | TAB to Name input | AC1 | P0 | Form input creation |
| P0-002 | TAB order Name→Cost→DueDate→Add→Cancel | AC1 | P0 | HTML tab order |
| P0-003 | Shift+Tab backward navigation | AC1 | P0 | Browser native (verify) |
| P0-004 | TAB wraps first→last | AC1 | P0 | Focus cycle implementation |
| P0-005 | TAB 20+ times, no trap | AC8 | P0 | Full integration test |
| P0-006 | Escape closes modal | AC8 | P0 | Modal/dialog handling |
| P0-009 | Focus outline on Name | AC6 | P0 | CSS :focus styles |
| P0-010 | Focus outline on all elements | AC6 | P0 | CSS :focus global |
| P0-011 | List renders `<ul>/<li>` | AC4 | P0 | HTML semantics |
| P0-012 | TAB through list items | AC4 | P0 | Focus management in list |
| P0-007 | Focus outline contrast ≥3:1 | AC6 | P0 | CSS color values |
| P1-001 | Tab order respects DOM | AC1 | P1 | Validate no tabindex>0 |
| P1-002 | Success message aria-live | AC5 | P1 | Success message markup |
| P1-003 | Enter key submits form | AC1 | P1 | Form submission logic |

---

## 🔧 Selector Configuration

**If your HTML structure is different, update these constants in the test file:**

```typescript
// Current selectors (match these or update)
const NAME_INPUT = 'input[id="name"]';
const COST_INPUT = 'input[id="cost"]';
const DUE_DATE_INPUT = 'input[id="due-date"]';
const ADD_BUTTON = 'button:has-text("Add Subscription")';
const CANCEL_BUTTON = 'button:has-text("Cancel")';
const SUBSCRIPTION_LIST = 'ul[data-testid="subscription-list"]';
```

**Update if your IDs/classes are different:**
```typescript
// Example: If your inputs use different IDs
const NAME_INPUT = 'input[id="subscription-name"]'; // Update this
const COST_INPUT = 'input[id="subscription-cost"]'; // Update this
// etc.
```

---

## ✅ Quality Assurance Checklist

**Before Implementation:**
- [ ] Read this entire document
- [ ] Review test file: `story-3-5-keyboard-accessibility-atdd-red.spec.ts`
- [ ] Verify selectors match your HTML IDs (or update selectors)
- [ ] Understand TDD red-green-refactor workflow
- [ ] Review expected HTML structure section below

**During Implementation:**
- [ ] Start with P0 tests (critical path)
- [ ] Remove `test.skip()` incrementally
- [ ] Run tests frequently to verify progress
- [ ] Ensure all 15 tests pass before marking DONE

**Before Story Completion:**
- [ ] All 15 tests pass (green)
- [ ] Code review approved
- [ ] Manual keyboard navigation verification
- [ ] Mark story 3.5 DONE in sprint tracking

---

## Expected HTML Structure (Implementation Reference)

**Form Section:**
```html
<form id="subscription-form" aria-label="Add Subscription">
  <div class="form-group">
    <label for="name">Subscription Name *</label>
    <input 
      id="name" 
      type="text" 
      required 
      aria-required="true"
      placeholder="e.g., Netflix"
    />
  </div>
  
  <div class="form-group">
    <label for="cost">Monthly Cost ($) *</label>
    <input 
      id="cost" 
      type="number" 
      step="0.01" 
      required 
      aria-required="true"
      placeholder="e.g., 15.99"
    />
  </div>
  
  <div class="form-group">
    <label for="due-date">Due Date (Day of Month) *</label>
    <input 
      id="due-date" 
      type="number" 
      min="1" 
      max="31" 
      required 
      aria-required="true"
      placeholder="e.g., 20"
    />
  </div>
  
  <div class="form-actions">
    <button type="submit" class="btn btn-primary">Add Subscription</button>
    <button type="reset" class="btn btn-secondary">Cancel</button>
  </div>
</form>
```

**List Section:**
```html
<section>
  <h2>Your Subscriptions</h2>
  <ul data-testid="subscription-list" aria-label="Subscriptions">
    <li>
      <div class="subscription-row">
        <span>Netflix - $15.99 - Due 20th</span>
        <button aria-label="Edit Netflix">Edit</button>
        <button aria-label="Delete Netflix">Delete</button>
      </div>
    </li>
  </ul>
</section>
```

**Success Message:**
```html
<div id="success-message" role="alert" aria-live="polite" style="display: none;">
  Subscription added successfully!
</div>
```

---

## 📞 Questions?

- **ATDD Workflow:** See `.agents/skills/bmad-testarch-atdd/SKILL.md`
- **Test Design Details:** See `test-design-story-3-5.md`
- **Playwright Reference:** https://playwright.dev/docs/intro
- **WCAG 2.1 Level A:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 🎉 Ready for Development

**Next Steps:**
1. Developer implements Story 3.5 features
2. Remove `test.skip()` incrementally
3. Run tests to verify implementation
4. All 15 tests pass → Story DONE
5. Move to next epic/story

---

**ATDD RED-PHASE COMPLETE** ✅

*Test file ready for developer*  
*Checklist ready for implementation*  
*All 15 E2E tests scaffolded and documented*

*Generated by Murat, Master Test Architect*  
*BMad Test Architecture Framework v6.5.0*  
*2026-05-05*
