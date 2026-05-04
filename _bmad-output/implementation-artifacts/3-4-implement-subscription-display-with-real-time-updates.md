---
story_id: "3.4"
story_key: "3-4-implement-subscription-display-with-real-time-updates"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "ready-for-dev"
created: "2026-05-04"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
---

# Story 3.4: Implement Subscription Display with Real-Time Updates

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.4  
**Status:** ready-for-dev  
**Sequence:** Fourth story in Epic 3; follows Story 3.3 (Add Subscription Workflow)  
**Depends On:**
- Story 3.1 (SubscriptionForm component)
- Story 3.2 (SubscriptionList & SubscriptionRow components)
- Story 3.3 (Add Subscription Workflow)
- Story 2.1 (Subscription types & ACTIONS)
- Story 2.3 (SubscriptionContext with useReducer)
- Story 2.4 (useSubscriptions custom hook)

**Blocks:** Story 3.5 (accessibility)  
**Priority:** HIGH — Core display experience; critical for user feedback and data integrity

---

## 🎯 Story Statement

**As a** user,  
**I want** to see subscriptions update in real-time as I add them,  
**So that** I get immediate feedback that my action worked.

---

## 📋 Acceptance Criteria

### AC1: Subscriptions Display Immediately After Add (< 100ms)

**Given** I have the add form and empty subscription list  
**When** I fill out the form and click "Add Subscription"  
**Then** the subscription appears in the list immediately (< 100ms)  
**And** no page refresh is required  
**And** the list update is visible without any visual delay  

**Technical Requirement:**
- React's state update → re-render pipeline must be optimized
- useSubscriptions hook returns updated `subscriptions` from context reducer
- SubscriptionList component re-renders with new subscription via React's automatic updates
- No setTimeout, no polling, no forced delays
- React Context + useReducer + useSubscriptions hook automatically trigger re-render

**Performance Guarantee:**
The list updates happen through React's natural state change flow:
```
Form Submission → generateUUID() → create Subscription object → dispatch ADD_SUBSCRIPTION
  ↓
SubscriptionContext reducer processes action → calls saveSubscriptionsToStorage()
  ↓
State update dispatched via useReducer
  ↓
All components using useSubscriptions() re-render automatically with new subscriptions
  ↓
SubscriptionList.map() creates new SubscriptionRow for each subscription
  ↓
Browser paints new DOM (typically < 100ms on modern hardware)
```

**Testing Note:** Browser DevTools Performance tab can verify < 100ms rendering time. Visual confirmation: add a subscription and observe instant appearance in list.

---

### AC2: Subscriptions Sorted by Due Date (Earliest First)

**Given** I have multiple subscriptions with different due dates  
**When** I view the subscription list  
**Then** subscriptions are sorted by `dueDate` in ascending order  
**And** subscription with dueDate=5 appears before dueDate=15  
**And** subscription with dueDate=31 appears last  

**Implementation Pattern:**
Sorting must happen in the SubscriptionList component when rendering. The context stores subscriptions in add order, but SubscriptionList should sort before rendering:

```typescript
// SubscriptionList.tsx
export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();
  
  // Create sorted copy without mutating original
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.dueDate - b.dueDate);
  
  if (!sortedSubscriptions || sortedSubscriptions.length === 0) {
    return <p className={styles.emptyState}>No subscriptions yet.</p>;
  }
  
  return (
    <ul className={styles.list} data-testid="subscription-list">
      {sortedSubscriptions.map(sub => (
        <SubscriptionRow key={sub.id} subscription={sub} />
      ))}
    </ul>
  );
}
```

**Why Sort in SubscriptionList, Not in Context?**
- Sorting is a UI concern, not state management concern
- Filtering (Story 6) may need different sort orders; sorting in list is more flexible
- Context reducer should be pure state mutations, not presentation logic
- This follows the single-responsibility principle

**Edge Cases Handled:**
- Empty list: guard with `if (!subscriptions || subscriptions.length === 0)`
- Duplicate due dates: stable sort maintains insertion order for same date (multiple subs due on same day)
- All due dates 1-31: valid range, no special handling needed

**Data Type Validation:**
- `dueDate` must be a number (enforced by Subscription type)
- Value must be 1-31 (enforced by form validation in Story 3.1)
- Sort comparison `a.dueDate - b.dueDate` is numeric, correct order

---

### AC3: Real-Time Updates for All Subscription Operations

**Given** I have an active subscription list  
**When** I add, edit, or delete a subscription (from any component)  
**Then** the list updates immediately without page refresh  
**And** other components (cost summary in Story 5, filters in Story 6) also update in real-time  

**Current Implementation Status:**
- ✅ Add subscription: Already working (Story 3.3 complete)
- ⚠️ Edit subscription: Not implemented yet (Story 4.1)
- ⚠️ Delete subscription: Not implemented yet (Story 4.2)

**For Story 3.4 Scope:**
Focus on **Add operation** real-time updates. The context architecture already supports edit/delete through the same mechanism:
- All mutations dispatch actions to useReducer
- useReducer triggers state update
- Components using useSubscriptions() re-render automatically
- Same pattern applies to all mutation types

**Future Stories (4.1, 4.2):**
Will use the exact same real-time pattern—no changes needed to SubscriptionList or SubscriptionRow for edit/delete to work.

---

### AC4: No Visual Flicker or Loading State Needed

**Given** I add a subscription  
**When** the action completes  
**Then** the list updates smoothly without:
- Loading spinner
- Skeleton loader
- Disabled buttons during state update
- Any visual flicker or reflow

**Why No Loading State Needed?**
React's state updates are synchronous (within a single render cycle). The entire flow:
1. Form submit → UUID generation → new Subscription object creation
2. Dispatch ADD_SUBSCRIPTION
3. Reducer processes → saves to localStorage → returns new state
4. Components re-render with new data

All happens in < 100ms, so no loading indicator needed. The update is instantaneous to the user.

**User Feedback:**
- Success message (from Story 3.3) provides feedback that action worked
- Form clearing (from Story 3.3) signals completion
- Instant list update (this story) confirms data was saved

---

## 🔍 Developer Context

### Files Being Modified

**SubscriptionList.tsx** (MODIFY)
- **Current state:** Renders subscriptions in map order (insertion order)
- **Change needed:** Sort before rendering
- **Location:** `src/components/SubscriptionList/SubscriptionList.tsx`
- **Specific changes:**
  1. Add sorting: `[...subscriptions].sort((a, b) => a.dueDate - b.dueDate)`
  2. Use sorted array in map() call
  3. Preserve empty state guard
  4. Keep all defensive checks and test coverage

**No Other Files Modified**
- SubscriptionRow: Works as-is, displays sorted items
- App.tsx: Works as-is, dispatch already triggers re-render
- SubscriptionContext: Works as-is, reducer already manages updates
- useSubscriptions hook: Works as-is, already returns updated subscriptions

---

### Current Implementation Status

**✅ Completed (Prerequisite Stories):**
- Story 3.1: SubscriptionForm component created with React Hook Form
- Story 3.2: SubscriptionList & SubscriptionRow components created
- Story 3.3: Add subscription workflow implemented
  - generateUUID() function working in App.tsx
  - handleFormSubmit() creates Subscription object with timestamps
  - Form clears after submission
  - Success message displays
  - localStorage persistence working
  - Context dispatch triggers re-render

**⚠️ Current Gap (This Story):**
- SubscriptionList does NOT sort by due date
- Subscriptions appear in add order, not due date order
- Need to implement sorting in SubscriptionList.tsx

**🧪 Test Coverage (From Story 3.3 tests):**
- `useSubscriptions()` hook returns updated array after dispatch ✅
- Form submission creates valid Subscription object ✅
- localStorage saves after ADD_SUBSCRIPTION action ✅
- SubscriptionList renders all subscriptions ✅
- Need to add: sort order verification test

---

### Code Review Insights from Story 3.3

From the code review of the previous story, these patterns were established and should be maintained:

1. **Immutability:** Use spread operators and array methods, never mutate state directly
2. **Type Safety:** Use Subscription type from `src/types/subscription.ts`, no `any` types
3. **Error Handling:** All try-catch blocks are already in place in context reducer
4. **Testing:** Unit tests verify reducer logic, E2E tests verify UI updates
5. **Performance:** useSubscriptions hook is stable (useCallback), no unnecessary re-renders
6. **Accessibility:** SubscriptionRow has proper ARIA labels (Edit/Delete buttons)

**Key Pattern to Maintain:**
```typescript
// ✅ CORRECT: Create new array, sort, use in render
const sorted = [...subscriptions].sort((a, b) => a.dueDate - b.dueDate);
return <ul>{sorted.map(sub => ...)}</ul>;

// ❌ WRONG: Mutating original array
subscriptions.sort((a, b) => ...);

// ❌ WRONG: Sorting in place then mapping
return <ul>{subscriptions.sort(...).map(...)}</ul>;
```

---

### Git History & Recent Patterns

Recent commits show:
- Story 3.3 was fully implemented and code reviewed (commit 0201c22)
- ATDD (Acceptance Test Driven Development) workflow is being used
- E2E tests with Playwright are comprehensive
- Test automation handles rapid add/delete cycles

**Lessons from Story 3.3:**
1. Reducer must be bullet-proof (lots of test coverage)
2. Type validation is critical (Subscription shape must be exact)
3. localStorage error handling prevents crashes
4. Form reset must happen after success
5. Tests verify all edge cases (empty storage, corrupted data, rapid operations)

**For Story 3.4:**
Don't break these patterns. The change is purely presentation (sorting), not state management.

---

## 🏗️ Architecture Compliance

### State Management Pattern (From Project Context)

**Immutable State Updates:**
✅ SubscriptionList will use spread operator to create sorted copy
✅ Original subscriptions array remains untouched
✅ Follows React best practices

**Context Flow:**
✅ App.tsx → useSubscriptions() hook → SubscriptionContext reducer
✅ Reducer returns updated state
✅ useSubscriptions() returns new subscriptions array
✅ Components re-render automatically

**No Violations:**
- Not mutating context state directly ✅
- Not using custom hooks directly on context ✅
- All dispatch actions use ACTIONS constants ✅
- Error handling already in place ✅

---

### Component Architecture

**Atomic Components:**
✅ SubscriptionList: Small, focused, single responsibility (display sorted list)
✅ SubscriptionRow: Displays single item (no change needed)
✅ App.tsx: Handles dispatch (no change needed)

**Hooks Pattern:**
✅ useSubscriptions() hook accessed from SubscriptionList
✅ Hook returns stable subscriptions reference
✅ Component memoization in SubscriptionRow prevents unnecessary re-renders

---

### CSS Modules & Styling

No new styles needed for this story. The sorting is purely a data ordering change.

Current CSS in SubscriptionList.module.css already handles:
- `.list` — ul styling
- `.emptyState` — empty message styling
- `.row` — li styling (in SubscriptionRow)

---

### Testing Requirements (From Project Context & Story 3.3 patterns)

**Unit Tests:**
- SubscriptionList renders sorted subscriptions in correct order
- Sorting works with single subscription (no change)
- Sorting works with 2+ subscriptions
- Empty list still shows empty state
- Duplicate due dates maintain insertion order (stable sort)

**E2E Tests (Playwright):**
- Add subscription → appears in list immediately
- Add multiple subscriptions → list sorted by due date
- Verify no page refresh needed
- Verify performance < 100ms (browser DevTools)

**Test Patterns from Story 3.3:**
- Use `data-testid` attributes for element selection
- Use `screen.getByTestId()` for queries
- Use `waitFor()` for async operations
- Test renders with SubscriptionProvider wrapper

---

## 🧪 Testing Strategy

### Unit Test: SubscriptionList Sorting

```typescript
import { render, screen } from '@testing-library/react';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { SubscriptionList } from './SubscriptionList';
import type { Subscription } from '../../types/subscription';

describe('SubscriptionList - Sorting (Story 3.4)', () => {
  it('should sort subscriptions by dueDate in ascending order', () => {
    const subs: Subscription[] = [
      { id: '1', name: 'Netflix', cost: 15.99, dueDate: 20, createdAt: 0, updatedAt: 0 },
      { id: '2', name: 'Gym', cost: 50, dueDate: 5, createdAt: 0, updatedAt: 0 },
      { id: '3', name: 'AWS', cost: 100, dueDate: 15, createdAt: 0, updatedAt: 0 },
    ];
    
    // Render with unsorted subscriptions in context
    render(
      <SubscriptionProvider initialSubscriptions={subs}>
        <SubscriptionList />
      </SubscriptionProvider>
    );
    
    // Verify rendered order is sorted by dueDate
    const rows = screen.getAllByTestId('subscription-item');
    expect(rows[0]).toHaveTextContent('Gym');    // dueDate: 5
    expect(rows[1]).toHaveTextContent('AWS');    // dueDate: 15
    expect(rows[2]).toHaveTextContent('Netflix'); // dueDate: 20
  });

  it('should maintain insertion order for subscriptions with same dueDate', () => {
    const subs: Subscription[] = [
      { id: '1', name: 'Netflix', cost: 15.99, dueDate: 15, createdAt: 0, updatedAt: 0 },
      { id: '2', name: 'Hulu', cost: 12.99, dueDate: 15, createdAt: 100, updatedAt: 100 },
    ];
    
    render(
      <SubscriptionProvider initialSubscriptions={subs}>
        <SubscriptionList />
      </SubscriptionProvider>
    );
    
    // Netflix comes first (inserted first), Hulu second (same dueDate)
    const rows = screen.getAllByTestId('subscription-item');
    expect(rows[0]).toHaveTextContent('Netflix');
    expect(rows[1]).toHaveTextContent('Hulu');
  });
});
```

### E2E Test: Real-Time Update (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('should display new subscription immediately in sorted order', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add first subscription (dueDate: 20)
  await page.fill('input[name="name"]', 'Netflix');
  await page.fill('input[name="cost"]', '15.99');
  await page.fill('input[name="dueDate"]', '20');
  await page.click('button:has-text("Add Subscription")');
  
  // Verify appears in list
  await expect(page.locator('text=Netflix')).toBeVisible();
  
  // Add second subscription (dueDate: 5 — should appear FIRST)
  await page.fill('input[name="name"]', 'Gym');
  await page.fill('input[name="cost"]', '50');
  await page.fill('input[name="dueDate"]', '5');
  await page.click('button:has-text("Add Subscription")');
  
  // Verify sort order: Gym (5) before Netflix (20)
  const rows = page.locator('[data-testid="subscription-item"]');
  const firstRowText = await rows.first().textContent();
  const secondRowText = await rows.nth(1).textContent();
  
  expect(firstRowText).toContain('Gym');
  expect(secondRowText).toContain('Netflix');
});
```

---

## 🚀 Implementation Checklist

### Before Starting
- [ ] Review SubscriptionList.tsx current implementation
- [ ] Verify useSubscriptions() hook works and returns correct subscriptions
- [ ] Check that SubscriptionRow component renders correctly
- [ ] Run existing tests: `npm test -- run`

### Implementation Steps (Red-Green-Refactor)

**Step 1: RED - Write failing test**
- [ ] Add unit test for sort order (see Testing Strategy above)
- [ ] Run test: `npm test -- run src/components/SubscriptionList/SubscriptionList.test.tsx`
- [ ] Verify test fails (subscriptions not sorted)

**Step 2: GREEN - Implement sorting**
- [ ] Modify SubscriptionList.tsx:
  - [ ] Add line: `const sortedSubscriptions = [...subscriptions].sort((a, b) => a.dueDate - b.dueDate);`
  - [ ] Change `.map()` to iterate over `sortedSubscriptions` instead of `subscriptions`
  - [ ] Preserve empty state guard
- [ ] Run test: `npm test -- run`
- [ ] Verify test passes

**Step 3: REFACTOR - Polish & verify**
- [ ] Review code for readability
- [ ] Verify no console errors: `npm run dev` → check browser console
- [ ] Run full test suite: `npm test -- run`
- [ ] All tests pass ✅

**Step 4: E2E Validation**
- [ ] Run dev server: `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Manually test:
  - [ ] Add subscription with dueDate: 20 → appears in list
  - [ ] Add subscription with dueDate: 5 → appears FIRST
  - [ ] Add subscription with dueDate: 15 → appears in middle
  - [ ] Verify no page refresh
  - [ ] Verify no visual flicker
  - [ ] Verify success message appears

**Step 5: Code Review**
- [ ] Self-review: Does code follow project patterns?
- [ ] Run type check: `npm run build`
- [ ] Run linter: `npm run lint`
- [ ] Fix any issues

**Step 6: Verification**
- [ ] All unit tests pass
- [ ] E2E tests pass (if automated)
- [ ] Manual testing complete
- [ ] No console errors or warnings
- [ ] Performance verified (< 100ms updates)

---

## 📝 Key Implementation Notes

### The Single Line Change (Simplified View)

```typescript
// BEFORE (Story 3.2-3.3):
{subscriptions.map(sub => <SubscriptionRow key={sub.id} subscription={sub} />)}

// AFTER (Story 3.4):
{[...subscriptions].sort((a, b) => a.dueDate - b.dueDate).map(sub => <SubscriptionRow key={sub.id} subscription={sub} />)}
```

### Why This Is Sufficient

The real-time update (AC1) is already working because:
1. ✅ Form submission calls `addSubscription()` from useSubscriptions hook
2. ✅ Hook dispatches ADD_SUBSCRIPTION action to context reducer
3. ✅ Reducer updates state and saves to localStorage
4. ✅ SubscriptionContext triggers re-render via useReducer
5. ✅ SubscriptionList re-renders automatically (React's state change)
6. ✅ NEW: With sorting, re-render now displays subscriptions in correct order

**No changes to:**
- Context reducer (already works)
- Dispatch mechanism (already works)
- useSubscriptions hook (already works)
- Form submission (already works)
- localStorage saving (already works)

---

### Why Sorting in SubscriptionList, Not Context

| Aspect | Sorting in List | Sorting in Context |
|--------|-----------------|-------------------|
| **Responsibility** | Presentation (list view concern) | State management (pure mutations) |
| **Flexibility** | Can sort differently per view (filtering, future sort options) | Locked to one sort order |
| **Performance** | Sort on each render (tiny dataset, no perf impact) | Sort on state change (same perf, wrong concern) |
| **Testability** | Test in component tests | Test in context tests |
| **Principle** | Single responsibility ✅ | Separation of concerns ✅ |

---

### Edge Cases Covered

| Case | Handling |
|------|----------|
| Empty list | Guard: `if (!subscriptions \|\| subscriptions.length === 0)` |
| Single subscription | Sort works (no change), displays correctly |
| Duplicate due dates | Stable sort maintains insertion order |
| Invalid dueDate | Form validation (Story 3.1) prevents invalid values |
| Null/undefined subscriptions | Hook returns `[]` if context fails, guard catches empty |

---

## 📊 Acceptance Criteria Mapping

| AC | Implementation | Testing | Status |
|----|----------------|---------|--------|
| **AC1: < 100ms updates** | React state change flow (already working) | E2E test, DevTools Performance | ✅ Ready |
| **AC2: Sort by dueDate** | `[...subs].sort((a,b) => a.dueDate - b.dueDate)` | Unit test verify order | ✅ Ready |
| **AC3: All operations real-time** | Pattern works for add; applies to edit/delete in Stories 4.1, 4.2 | Will be tested then | ✅ Ready |
| **AC4: No loading state** | Synchronous React update, no delays needed | Visual inspection, DevTools | ✅ Ready |

---

## 🎓 Learning Resources

**Why Real-Time Updates Work in React:**
- React's `useReducer` is synchronous—state updates happen in the same render cycle
- Components using `useContext` re-render automatically when context value changes
- The `useSubscriptions` hook returns the same reference, but subscriptions array is new
- Browser DOM is painted after all state updates complete

**Sorting Algorithm:**
- JavaScript's `Array.sort()` is stable (preserves insertion order for equal elements)
- Numeric sort: `a - b` (ascending), `b - a` (descending)
- For dueDate (1-31): `a.dueDate - b.dueDate` gives correct order

**Performance Notes:**
- Spread operator `[...array]` creates shallow copy (subscriptions are objects, not nested)
- Sort on 100 items < 1ms (negligible)
- React reconciliation < 16ms per frame (60fps target)
- Total update < 100ms easily achievable

---

## ✅ Story Completion Criteria

Story 3.4 is complete when:
1. ✅ SubscriptionList.tsx modified to sort by dueDate
2. ✅ All unit tests pass (including new sort order test)
3. ✅ All E2E tests pass (real-time update verification)
4. ✅ Manual testing: Add multiple subscriptions, verify sort order
5. ✅ No console errors or warnings
6. ✅ Code review passed (patterns maintained)
7. ✅ Performance verified (< 100ms updates)

**Success Metrics:**
- List displays in correct due date order ✅
- New subscriptions appear immediately ✅
- No page refresh needed ✅
- All existing tests still pass ✅

---

## 🔗 Next Steps

After Story 3.4 Complete:
1. **Story 3.5:** Keyboard navigation & accessibility (WCAG 2.1 Level A)
2. **Story 4.1:** Edit subscription workflow (will use same real-time pattern)
3. **Story 4.2:** Delete subscription workflow (will use same real-time pattern)
4. **Story 5.1+:** Cost summary dashboard (will use same context updates)

All future stories build on the real-time update foundation created here.

---

## 📋 Project Context Reference

**From project-context.md (loaded at story creation):**

- **Data Persistence:** Browser localStorage with key `'subscriptions'` (exact spelling)
- **State Management:** useReducer + React Context, SubscriptionContext.tsx
- **Component Architecture:** Atomic components, hooks-first pattern
- **Styling:** CSS Modules + BEM naming (SubscriptionList.module.css)
- **Naming:** Components are PascalCase files (SubscriptionList.tsx), no Tailwind/Sass
- **Error Handling:** Try-catch on localStorage operations (already in context)
- **Testing:** Unit tests (Vitest) + E2E tests (Playwright)
- **Subscription Type:** id (UUID), name, cost, dueDate (1-31), createdAt, updatedAt

All patterns established in Stories 1-3 continue unchanged.

---

**Ultimate context engine analysis completed — comprehensive developer guide created.**

**Status:** ready-for-dev  
**Confidence:** HIGH — Single file change, clear requirements, pattern established from previous stories  
**Risk:** LOW — No breaking changes, additive feature, previous stories provide solid foundation
