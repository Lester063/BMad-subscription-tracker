---
story_id: "3.5"
story_key: "3-5-add-keyboard-navigation-accessibility-wcag-2-1-level-a"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "ready-for-dev"
created: "2026-05-05"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
---

# Story 3.5: Add Keyboard Navigation & Accessibility (WCAG 2.1 Level A)

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.5  
**Status:** ready-for-dev  
**Sequence:** Fifth and final story in Epic 3; follows Story 3.4 (Real-Time Updates)  
**Depends On:**
- Story 3.1 (SubscriptionForm component)
- Story 3.2 (SubscriptionList & SubscriptionRow components)
- Story 3.3 (Add Subscription Workflow)
- Story 3.4 (Real-Time Display Updates)
- All Stories in Epics 1-2 (Foundation & State Management)

**Blocks:** None directly; enables Story 6.5 (Filter Controls Accessibility)  
**Priority:** HIGH — Legal/compliance requirement; core accessibility for inclusive design

---

## 🎯 Story Statement

**As a** user using keyboard navigation or assistive technology (screen reader),  
**I want** to navigate and use the subscription form and list without a mouse,  
**So that** the app is accessible to everyone regardless of ability.

---

## 📋 Acceptance Criteria

### AC1: Keyboard Navigation - Tab Order Through Form Fields

**Given** I am using keyboard-only navigation  
**When** I open the app and press Tab repeatedly  
**Then** focus moves through form fields in logical reading order:
1. Name input field (first)
2. Cost input field (second)
3. Due Date input field (third)
4. Add Subscription button (fourth)
5. Cancel button (fifth) — if visible
6. First subscription in list (if any)
7. Edit button on first subscription (if any)
8. Delete button on first subscription (if any)
9. Next subscription in list
10. ... (continues through all subscriptions)

**AND** when I reach the last focusable element and press Tab, focus wraps to the first focusable element  
**AND** Shift+Tab navigates backward through the same order

**Technical Requirement:**
- All interactive elements (`<input>`, `<button>`, `<a>`, etc.) must be in DOM focus order
- Use native HTML semantics (no tabindex manipulation unless necessary for special cases)
- tabindex="0" permitted only for custom interactive elements
- tabindex="-1" permitted for elements that should be hidden from keyboard navigation
- No elements should have tabindex > 0 (don't break natural tab order)
- Verify with browser DevTools: Tab key reveals focus outline on each element

**Testing:**
- Open app with keyboard only
- Press Tab 15+ times and verify order
- Use Shift+Tab to navigate backward
- Verify focus outline is visible on every element
- No elements "trapped" where focus cannot escape

---

### AC2: Form Labels Properly Associated with Inputs

**Given** I am using a screen reader  
**When** I navigate to each form input field  
**Then** the screen reader announces the field label before the input:
- "Name, text input" (or similar screen reader output)
- "Cost, number input"
- "Due Date, number input" (or "Due Date, spin button" depending on input type)

**AND** if a field has validation error, the error message is announced as part of the field description  
**AND** required field indicators are announced (e.g., "Name, text input, required")

**Technical Requirement:**
```html
<!-- ✅ CORRECT: Explicit association -->
<label htmlFor="name-input">Name</label>
<input id="name-input" type="text" required />

<!-- ✅ CORRECT: Required field indication -->
<label htmlFor="name-input">
  Name <span aria-label="required">*</span>
</label>

<!-- ❌ WRONG: No association -->
<label>Name</label>
<input type="text" />

<!-- ❌ WRONG: Using placeholder instead of label -->
<input type="text" placeholder="Enter name" />
```

- Each form `<input>` must have an associated `<label>` element
- Association via `htmlFor` (label) and `id` (input) attributes
- Required fields marked with `aria-required="true"` or `required` attribute
- Error messages linked via `aria-describedby`
- No relying on placeholder text as label (placeholder disappears when typing)

**Testing:**
- Open form in screen reader (NVDA, JAWS, VoiceOver)
- Tab through each field and verify label is announced
- Check that "required" status is announced
- Introduce validation error and verify error message is announced

---

### AC3: Buttons Have Accessible Names

**Given** I am using a screen reader  
**When** I navigate to any button  
**Then** the screen reader announces a descriptive button name:
- "Add Subscription" (not just "Submit")
- "Edit" or "Edit subscription 123" (more specific is better)
- "Delete" or "Delete subscription 123"
- "Cancel" or "Clear form"

**AND** if a button contains only an icon (e.g., edit/delete icons), the button has aria-label:  
```html
<!-- ✅ CORRECT: Icon button with aria-label -->
<button aria-label="Edit Netflix subscription">
  <EditIcon />
</button>

<!-- ✅ CORRECT: Text button (no aria-label needed) -->
<button>Edit</button>

<!-- ❌ WRONG: Icon with no accessible name -->
<button>
  <EditIcon />
</button>
```

**Technical Requirement:**
- All `<button>` elements must have accessible name via:
  - Button text content, OR
  - `aria-label` attribute (if icon button), OR
  - `aria-labelledby` (if label comes from other element)
- Button purpose must be clear to screen reader user
- Action buttons should indicate what will happen (e.g., "Delete" not just "X")

**Testing:**
- Screen reader announces all button names clearly
- Button text/label describes the action
- Icon buttons have aria-label

---

### AC4: List Semantics & Navigation

**Given** I am using a screen reader  
**When** I reach the subscription list  
**Then** the screen reader announces:
- "List" (indicating it's a `<ul>`)
- Number of items: "15 items" or similar
- Each item announced as "List item 1, Netflix, $15.99, due 20th" (or similar)

**AND** I can press arrow keys to navigate between items (native list behavior)  
**AND** Edit/Delete buttons in each list item are keyboard accessible

**Technical Requirement:**
```html
<!-- ✅ CORRECT: Proper list semantics -->
<ul className={styles.list} aria-label="Subscriptions">
  <li>
    <div className={styles.row}>
      {/* Subscription content */}
      <button aria-label="Edit Netflix">Edit</button>
      <button aria-label="Delete Netflix">Delete</button>
    </div>
  </li>
</ul>

<!-- ❌ WRONG: Divs instead of ul/li -->
<div className={styles.list}>
  <div className={styles.row}>
    {/* Subscription content */}
  </div>
</div>
```

- SubscriptionList must render `<ul>` (not `<div>`)
- Each subscription rendered as `<li>` (not `<div>`)
- List should have `aria-label` describing its purpose: `aria-label="Subscriptions"` or `aria-label="15 subscriptions"`
- Supports native screen reader list navigation (arrow keys)

**Testing:**
- Screen reader announces "List with 5 items" or similar
- Screen reader announces each list item with subscription details
- Buttons within list items are keyboard accessible

---

### AC5: Focus Management - Success Messages

**Given** I submit the form successfully  
**When** the success message appears  
**Then** the screen reader announces it automatically (without needing to navigate to it)  
**AND** sighted keyboard-only users can see the success message has appeared
**AND** the message disappears after 3 seconds (or remains visible until dismissed)

**Technical Implementation:**
```html
<!-- ✅ CORRECT: Announce message to screen reader -->
<div className="success-message" role="alert" aria-live="polite">
  Subscription added successfully
</div>

<!-- ❌ WRONG: Message not announced -->
<div className="success-message">
  Subscription added successfully
</div>
```

- Success message must have:
  - `role="alert"` (announces important, time-sensitive information)
  - `aria-live="polite"` (announces without interrupting current screen reader output)
- Message appears visually in viewport (not hidden below scroll)
- Auto-dismisses after 3 seconds OR has close button
- Focus should return to form for next action (implicit in current flow)

**Testing:**
- Submit form with screen reader active
- Verify "Subscription added successfully" is announced
- Message is visible on screen
- Message disappears after 3 seconds

---

### AC6: Focus Indicators - Visible on All Interactive Elements

**Given** I am using keyboard navigation  
**When** an element receives focus (via Tab or arrow keys)  
**Then** a visible focus indicator appears around the element:
- Color contrast ≥ 3:1 with adjacent colors (WCAG Level A requirement)
- Outline or border that's ≥ 2px wide
- Not removed or hidden by CSS (`outline: none` is forbidden)

**Current State:**
App.tsx already has `role="alert"` and `aria-live="polite"` on success message ✅

**Technical Requirement:**
```css
/* ✅ CORRECT: Visible focus indicator */
button:focus,
input:focus,
a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ❌ WRONG: Hidden focus indicator */
button:focus {
  outline: none;
}

button:focus {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1); /* Too subtle, insufficient contrast */
}
```

- Browser default focus outline (outline: auto) is sufficient (Chrome, Firefox, Safari all provide good defaults)
- If customizing focus outline, ensure:
  - 2px+ width
  - High contrast (3:1 minimum, 4.5:1 preferred)
  - Not obscured by other elements
- Can use `outline` CSS property or `box-shadow` (but shadow alone may not be sufficient)
- Check contrast in DevTools: use focus and measure color ratio

**Testing:**
- Use keyboard (Tab, arrow keys) to navigate entire app
- Verify focus indicator is visible on EVERY interactive element
- Measure contrast ratio of focus indicator (use DevTools, WebAIM contrast checker)
- Ensure indicator is ≥ 2px and clearly visible

---

### AC7: Semantic HTML & ARIA Labels

**Given** the subscription tracker uses proper semantic HTML  
**When** a screen reader navigates the page  
**Then** the structure is announced correctly:
- Main content area announced as "main" (already present: `role="main"` in App.tsx ✅)
- Form announced as `<form>` or has `role="form"`
- Headings use `<h1>`, `<h2>`, etc. (hierarchy preserved)
- Lists use `<ul>` / `<li>` semantics

**AND** error messages are properly associated with form fields:
```html
<!-- ✅ CORRECT: Error linked to input -->
<label htmlFor="name">Name (required) <span aria-label="required">*</span></label>
<input 
  id="name" 
  type="text" 
  aria-required="true"
  aria-describedby="name-error"
  invalid={hasError}
/>
{hasError && <span id="name-error" role="alert">Name is required</span>}

<!-- ✅ CORRECT: Descriptive headings -->
<h1>Subscription Tracker</h1> {/* Page title */}
<h2>Add Subscription</h2>  {/* Form section */}
<h2>Your Subscriptions</h2> {/* List section */}
```

**Technical Requirement:**
- Main app container has `role="main"` (already present ✅)
- Form has semantic `<form>` element or `role="form"`
- Headings use proper hierarchy (`<h1>` for page title, `<h2>` for sections)
- Error messages linked to inputs via `aria-describedby`
- Inputs marked `aria-required="true"` when required
- No excessive ARIA (rely on semantic HTML first)

**Testing:**
- Use accessibility tree viewer in DevTools
- Screen reader announces page structure correctly
- Heading hierarchy makes sense
- Form fields properly labeled

---

### AC8: No Keyboard Traps

**Given** I am navigating with keyboard  
**When** I Tab through all elements  
**Then** I am never unable to leave an element (no "keyboard traps")  
**AND** focus can always escape using Tab, Shift+Tab, or Escape key

**Current Implementation:**
SubscriptionForm uses standard React Hook Form controls (no custom modals or traps expected)

**Testing:**
- Tab through entire app
- Verify you can always reach the next/previous element
- If a modal/dialog opens, Escape key should close it
- No elements should "capture" focus and prevent escape

---

### AC9: Color Contrast - WCAG Level A

**Given** all text is visible on its background  
**When** measuring color contrast  
**Then** contrast ratio is ≥ 4.5:1 for normal text and ≥ 3:1 for large text

**Technical Requirement:**
- Normal text (< 18px): 4.5:1 contrast minimum
- Large text (≥ 18px): 3:1 contrast minimum
- This includes:
  - Form labels
  - Button text
  - Subscription list text
  - Error messages
  - Focus indicators

**Current CSS (global.css):**
Should define primary text color with sufficient contrast to background color.

**Testing:**
- Use WebAIM contrast checker: https://webaim.org/resources/contrastchecker/
- Measure text color vs. background color for all UI elements
- Fix any failures (unlikely with standard dark-on-light or light-on-dark schemes)

---

## 🔍 Developer Context

### Files Being Modified

**SubscriptionForm.tsx** (MODIFY)
- **Current state:** Uses React Hook Form, some ARIA labels present
- **Changes needed:**
  1. Wrap form in `<form>` semantic element (not `<div>`)
  2. Add proper `<label>` elements for each input with `htmlFor` association
  3. Add `aria-required="true"` to required fields
  4. Add `aria-label` to Cancel/Reset buttons if needed
  5. Ensure tabindex is not set to values > 0 (preserve natural tab order)
- **Location:** `src/components/SubscriptionForm/SubscriptionForm.tsx`

**SubscriptionList.tsx** (MODIFY)
- **Current state:** Uses `<ul>` semantics ✅, but may need aria-label
- **Changes needed:**
  1. Add `aria-label="Subscriptions"` to the `<ul>` element
  2. Ensure each item is `<li>` (already done ✅)
  3. Verify buttons within rows have accessible names
- **Location:** `src/components/SubscriptionList/SubscriptionList.tsx`

**SubscriptionRow.tsx** (MODIFY)
- **Current state:** Renders Edit/Delete buttons
- **Changes needed:**
  1. Add `aria-label` to Edit button: `aria-label="Edit Netflix"`
  2. Add `aria-label` to Delete button: `aria-label="Delete Netflix"`
  3. Or use text labels ("Edit", "Delete") instead of icon-only buttons
  4. Ensure buttons are keyboard accessible (native `<button>` elements)
- **Location:** `src/components/SubscriptionRow/SubscriptionRow.tsx`

**App.tsx** (VERIFY - no changes likely needed)
- **Current state:** Already has `role="main"`, `role="alert"`, `aria-live="polite"` ✅
- **Status:** Mostly compliant already
- **Possible enhancement:** Add descriptive heading `<h1>Subscription Tracker</h1>`

**SubscriptionForm.module.css, SubscriptionList.module.css, SubscriptionRow.module.css** (VERIFY)
- **Changes needed:** Ensure focus indicators are visible (check :focus and :focus-visible states)
- **Add if missing:**
  ```css
  button:focus,
  input:focus,
  a:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
  ```

**No Other Files Modified**
- useSubscriptions hook: No changes needed
- SubscriptionContext: No changes needed
- Types: No changes needed

---

### Current Implementation Status

**✅ Completed (Prerequisite Stories):**
- Story 3.1-3.4: Form, list, add workflow, real-time updates all implemented
- Basic semantic HTML structure in place (App.tsx has role="main")
- React Hook Form integrated (provides some built-in accessibility)
- Success message has role="alert" and aria-live="polite" ✅

**⚠️ Gaps to Address (This Story):**
- Form inputs may lack explicit `<label>` associations
- SubscriptionRow buttons may lack descriptive aria-labels
- Focus indicators may not be customized or visible enough
- Form element not wrapped in semantic `<form>` tag
- SubscriptionList `<ul>` may lack aria-label

**🧪 Test Coverage (From Stories 3.1-3.4):**
- Unit tests verify form submission works ✅
- E2E tests verify add/display workflow ✅
- Need to add: accessibility-specific tests
  - Focus navigation order
  - Screen reader announcements
  - Color contrast verification
  - Keyboard-only navigation

---

### Code Review Insights from Story 3.4

From the previous story code review, these patterns are established:

1. **Semantic HTML:** Use `<ul>`, `<li>`, `<form>`, `<label>` instead of divs
2. **ARIA Attributes:** Use role, aria-label, aria-live where semantic HTML is insufficient
3. **Type Safety:** TypeScript enforced throughout
4. **Pattern Consistency:** Follow existing component structure
5. **Test Coverage:** Every acceptance criterion has corresponding test

**Key Pattern to Maintain:**
```html
<!-- ✅ CORRECT: Semantic + ARIA combined -->
<form onSubmit={handleSubmit}>
  <label htmlFor="name-input">Name <span aria-label="required">*</span></label>
  <input 
    id="name-input" 
    type="text" 
    aria-required="true"
    aria-describedby={error ? "name-error" : undefined}
  />
  {error && <span id="name-error" role="alert">{error}</span>}
  
  <button type="submit" aria-label="Add Subscription">Add</button>
</form>

<!-- ❌ WRONG: Divs instead of semantic HTML -->
<div onClick={handleSubmit}>
  <div>Name</div>
  <div contentEditable>Enter name</div>
  <div onClick={addSubscription}>Add</div>
</div>
```

---

### Git History & Accessibility Patterns

Recent commits show:
- Story 3.4 added sorting without breaking accessibility ✅
- Components use semantic HTML where possible
- React Hook Form provides baseline accessibility

**Lessons from Recent Work:**
1. Native elements (input, button) have built-in accessibility
2. Semantic HTML (ul/li, form, label) is preferred over ARIA
3. ARIA should enhance, not replace, semantic HTML
4. Focus management must work across all browsers
5. Testing must include keyboard-only navigation

**For Story 3.5:**
Focus on completing accessibility by:
- Adding missing `<label>` elements
- Adding aria-labels to icon buttons
- Ensuring focus indicators are visible
- Testing with keyboard and screen reader

---

## 🏗️ Architecture Compliance

### Accessibility Standards (from Project Context)

**WCAG 2.1 Level A Requirements:**
✅ Keyboard navigation — all functions available via keyboard  
✅ Focus visible — focus indicator visible on all interactive elements  
✅ Semantic HTML — proper use of form, label, button, list elements  
✅ Screen reader support — inputs labeled, buttons named, structure announced  
✅ Color contrast — 4.5:1 for normal text (verify in CSS)  

**Project Context Reference:**
From `docs/project-context.md`:
> **6. Error Handling: Try-Catch + User Messages**
> - Scope: Wrap ALL localStorage, form submission, and API-adjacent code
> - Messages: User-friendly, never expose technical errors
> - Logging: Console.log for dev, silent in prod
> - Recovery: Graceful degradation (app still works)

> **Naming Conventions: Variable Names**
> - Functions: `camelCase` (e.g., `calculateTotalCost()`)
> - Variables: `camelCase` (e.g., `subscriptions`, `isLoading`)

> **Component Architecture: Atomic + Hooks**
> - Structure: Small, focused components with clear responsibilities
> - Hooks: All logic in hooks; components are presentation
> - Reusability: Components props-driven, no internal state for data

---

### No Architectural Violations

✅ All changes maintain existing state management patterns  
✅ No new external dependencies needed  
✅ Semantic HTML and ARIA are browser-native, zero-cost additions  
✅ Focus management uses native browser APIs  
✅ CSS-only focus indicator enhancement (no JS required)  

---

## 🧪 Testing Strategy - TDD Red/Green/Refactor

### Phase 1: RED - Write Accessibility Tests

Create comprehensive accessibility test suite covering all ACs:

**Unit Tests (SubscriptionForm.test.tsx, SubscriptionList.test.tsx):**
```typescript
describe('SubscriptionForm Accessibility', () => {
  it('should have label for name input with htmlFor association', () => {
    const { getByLabelText } = render(<SubscriptionForm onSubmit={jest.fn()} />);
    const nameInput = getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('id');
  });

  it('should mark required fields with aria-required', () => {
    const { getByLabelText } = render(<SubscriptionForm onSubmit={jest.fn()} />);
    const nameInput = getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
  });

  it('should have accessible names for all buttons', () => {
    const { getByRole } = render(<SubscriptionForm onSubmit={jest.fn()} />);
    const submitButton = getByRole('button', { name: /add subscription/i });
    expect(submitButton).toBeInTheDocument();
  });
});

describe('SubscriptionList Accessibility', () => {
  it('should render as semantic list with aria-label', () => {
    const { container } = render(<SubscriptionList />);
    const list = container.querySelector('ul');
    expect(list).toHaveAttribute('aria-label', 'Subscriptions');
  });

  it('should use li elements for list items', () => {
    const { container } = render(<SubscriptionList />);
    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThan(0);
  });
});
```

**E2E Tests (tests/e2e/story-3-5-accessibility.spec.ts):**
```typescript
test.describe('Story 3.5: Keyboard Navigation', () => {
  test('should navigate through form fields with Tab key', async ({ page }) => {
    await page.goto('/');
    
    // Focus starts somewhere
    const nameInput = page.locator('input[aria-label="Name"]');
    await nameInput.focus();
    
    // Tab moves to cost input
    await page.keyboard.press('Tab');
    const costInput = page.locator('input[aria-label="Cost"]');
    await expect(costInput).toBeFocused();
    
    // Tab moves to due date input
    await page.keyboard.press('Tab');
    const dateInput = page.locator('input[aria-label="Due Date"]');
    await expect(dateInput).toBeFocused();
    
    // Tab moves to submit button
    await page.keyboard.press('Tab');
    const submitButton = page.locator('button:has-text("Add Subscription")');
    await expect(submitButton).toBeFocused();
  });

  test('should show visible focus indicator on Tab', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    // Check that focused element has visible outline
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
      };
    });
    
    expect(focusedElement.outlineWidth).not.toBe('0px');
  });

  test('should announce success message to screen reader', async ({ page }) => {
    // This requires axe-core or manual ARIA verification
    // Verify role="alert" is present on success message
    await page.fill('input[aria-label="Name"]', 'Netflix');
    await page.fill('input[aria-label="Cost"]', '15.99');
    await page.fill('input[aria-label="Due Date"]', '20');
    
    await page.click('button:has-text("Add Subscription")');
    
    const alert = page.locator('[role="alert"]');
    await expect(alert).toHaveText(/subscription added/i);
    await expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Use axe-core to check contrast
    // This is a code-level check, not a visual test
    const axeResults = await checkA11y(page);
    expect(axeResults.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
  });
});
```

---

### Phase 2: GREEN - Implement Accessibility Fixes

Make minimal, focused changes to pass all tests:

1. Add `<form>` semantic element wrapper
2. Add `<label htmlFor>` associations for form inputs
3. Add `aria-required="true"` to required inputs
4. Add `aria-label` to buttons (Edit, Delete)
5. Add `aria-label` to SubscriptionList `<ul>`
6. Verify focus indicator CSS is present and visible
7. Run tests and verify all pass

---

### Phase 3: REFACTOR - Clean & Optimize

Code review checklist:
- ✅ No excessive ARIA (semantic HTML preferred)
- ✅ All labels associated with inputs
- ✅ All buttons have accessible names
- ✅ Focus order is logical and natural
- ✅ No keyboard traps
- ✅ Focus indicators visible
- ✅ Proper heading hierarchy (h1, h2)
- ✅ List semantics correct (ul > li)
- ✅ Error messages linked to fields (aria-describedby)
- ✅ Type safety maintained (TypeScript strict mode)
- ✅ No regressions (full test suite passes)

---

## 📚 Technical Details & Implementation Guide

### Common Accessibility Patterns (Ready-to-Use)

#### Pattern 1: Form with Labeled Inputs
```typescript
export function SubscriptionForm() {
  return (
    <form onSubmit={handleSubmit} aria-label="Add Subscription">
      <div>
        <label htmlFor="name-input">
          Name
          <span aria-label="required">*</span>
        </label>
        <input
          id="name-input"
          type="text"
          aria-required="true"
          aria-describedby={nameError ? "name-error" : undefined}
          {...register('name')}
        />
        {nameError && (
          <span id="name-error" role="alert">
            {nameError.message}
          </span>
        )}
      </div>

      <button type="submit">Add Subscription</button>
    </form>
  );
}
```

#### Pattern 2: Icon Button with aria-label
```typescript
<button aria-label="Edit Netflix">
  <EditIcon />
</button>
```

#### Pattern 3: Semantic List with aria-label
```typescript
<ul aria-label="Subscriptions" role="list">
  {subscriptions.map(sub => (
    <li key={sub.id} role="listitem">
      <div>{sub.name}</div>
      <div>{sub.cost}</div>
      <button aria-label={`Edit ${sub.name}`}>Edit</button>
      <button aria-label={`Delete ${sub.name}`}>Delete</button>
    </li>
  ))}
</ul>
```

#### Pattern 4: Visible Focus Indicator
```css
/* Global focus styles */
button:focus,
input:focus,
a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Or using :focus-visible for only keyboard focus (Firefox/Chrome) */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

### Resources & References

**WCAG 2.1 Level A Success Criteria:**
- SC 1.4.3: Contrast (Minimum) — Color contrast ≥ 4.5:1
- SC 2.1.1: Keyboard — All functions accessible via keyboard
- SC 2.1.2: No Keyboard Trap — No element traps keyboard focus
- SC 2.4.3: Focus Order — Logical tab order
- SC 2.4.7: Focus Visible — Focus indicator visible on all elements
- SC 3.2.1: On Focus — No unexpected changes on focus
- SC 3.3.1: Error Identification — Error messages associated with inputs
- SC 4.1.2: Name, Role, Value — Proper ARIA labels and semantic HTML

**Testing Tools:**
- Browser DevTools Accessibility Inspector
- axe DevTools browser extension
- NVDA (free screen reader for Windows)
- JAWS (commercial screen reader)
- WebAIM contrast checker: https://webaim.org/resources/contrastchecker/

**Documentation:**
- MDN Web Docs: Web Accessibility (https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- WebAIM: Web Accessibility In Mind (https://webaim.org/)
- ARIA Authoring Practices Guide (APG) (https://www.w3.org/WAI/ARIA/apg/)

---

## ✅ Completion Checklist

Before marking story as "done":

- [ ] All AC1-AC9 acceptance criteria met
- [ ] Unit tests written and passing
- [ ] E2E tests written and passing
- [ ] Keyboard-only navigation tested manually
- [ ] Screen reader tested with NVDA or similar
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast verified (≥ 4.5:1 normal, ≥ 3:1 large)
- [ ] No keyboard traps (Tab moves forward, Shift+Tab backward)
- [ ] Form labels properly associated
- [ ] All buttons have accessible names
- [ ] List uses semantic `<ul>` and `<li>`
- [ ] Error messages linked to form fields
- [ ] No regressions (full test suite passes)
- [ ] Type safety maintained (no `any` types)
- [ ] Code review passed
- [ ] Story documentation complete

---

## 🎯 Success Criteria Summary

**User Perspective:**
✅ Can navigate entire app using only keyboard  
✅ Can use screen reader to navigate and interact  
✅ Receives immediate audio feedback on actions  
✅ Never confused about what element has focus  
✅ All text is readable (sufficient contrast)  

**Developer Perspective:**
✅ Semantic HTML used (form, label, button, ul/li)  
✅ ARIA attributes used only where needed  
✅ Focus management works across browsers  
✅ Accessibility tests included in test suite  
✅ TypeScript strict mode maintained  
✅ No external dependencies added  
✅ Follows project conventions  

**Epic 3 Completion:**
✅ Story 3.1: Form created  
✅ Story 3.2: List created  
✅ Story 3.3: Add workflow implemented  
✅ Story 3.4: Real-time updates working  
✅ Story 3.5: Accessibility complete  

**Ready for:** Story 4.1 (Edit workflow), Story 6.2 (Filter controls with accessibility)

---

**Story Created:** 2026-05-05  
**By:** Amelia (Senior Software Engineer) via BMad Method  
**Status:** ready-for-dev  
**Confidence Level:** High — Epic 3 delivers complete, accessible add & display functionality
