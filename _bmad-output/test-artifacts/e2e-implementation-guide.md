---
title: 'E2E Test Suite — Implementation Requirements'
story: '3.3-implement-add-subscription-workflow'
generatedDate: '2026-05-04'
audience: 'Development Team'
---

# Story 3.3: E2E Test Suite — Implementation Checklist

🧪 **By:** Murat, Master Test Architect  
📅 **Generated:** 2026-05-04  
📍 **Test File:** `subscription-tracker/tests/story-3-3-e2e.spec.ts`

---

## 🎯 Quick Start

### 1. Run Tests BEFORE Implementation (Red Phase)
```bash
cd subscription-tracker
npm run test:e2e -- tests/story-3-3-e2e.spec.ts
# Expected: All 18 tests FAIL ❌ (this is correct for red phase)
```

### 2. Implement Story 3.3 Features (below)

### 3. Run Tests AFTER Implementation (Green Phase)
```bash
npm run test:e2e -- tests/story-3-3-e2e.spec.ts
# Expected: All 18 tests PASS ✅ (P0: 11, P1: 7)
```

---

## 📋 Implementation Requirements

### 🏷️ 1. Add Data-TestID Attributes to Components

**Why:** Tests use these selectors for reliability. Without them, tests will fail.

#### In SubscriptionForm Component

```tsx
// SubscriptionForm.tsx or wherever form is defined
export function SubscriptionForm() {
  return (
    <form>
      <input
        type="text"
        name="name"
        data-testid="subscription-name-input"  // ← ADD THIS
        placeholder="Service name"
        required
      />
      
      <input
        type="number"
        name="cost"
        data-testid="subscription-cost-input"  // ← ADD THIS
        placeholder="Cost"
        step="0.01"
        required
      />
      
      <input
        type="number"
        name="dueDate"
        data-testid="subscription-duedate-input"  // ← ADD THIS
        placeholder="Due date (1-31)"
        min="1"
        max="31"
        required
      />
      
      <button type="submit" data-testid="add-subscription-button">
        Add Subscription
      </button>
    </form>
  );
}
```

#### In App or Root Container

```tsx
// App.tsx
export function App() {
  return (
    <div data-testid="app-container">
      {/* Your app content */}
    </div>
  );
}
```

#### In SubscriptionList Component

```tsx
// SubscriptionList.tsx
export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();

  if (subscriptions.length === 0) {
    return (
      <div data-testid="empty-list-message">
        No subscriptions yet
      </div>
    );
  }

  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.id} data-testid="subscription-item" data-subscription-id={sub.id}>
          <span data-testid="subscription-name">{sub.name}</span>
          <span data-testid="subscription-cost">${sub.cost.toFixed(2)}</span>
          <span data-testid="subscription-duedate">{sub.dueDate}</span>
        </div>
      ))}
    </div>
  );
}
```

#### Create SuccessMessage Component

```tsx
// SuccessMessage.tsx
import { useEffect, useState } from 'react';

export function SuccessMessage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return show && (
    <div data-testid="success-message" role="alert">
      Subscription added successfully
    </div>
  );
}

// Export a hook to trigger the message from App
export function useSuccessMessage() {
  // Implementation: return method to show message
}
```

---

### 📝 2. Implement handleFormSubmit in App.tsx

**Why:** This handler connects the form to SubscriptionContext and generates UUID + timestamps.

```tsx
// App.tsx
import { v4 as uuidv4 } from 'uuid'; // npm install uuid
// OR use native: crypto.randomUUID()

export function App() {
  const { addSubscription } = useSubscriptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const cost = formData.get('cost') as string;
      const dueDate = formData.get('dueDate') as string;

      // Validate (should already be done by React Hook Form)
      if (!name || !cost || !dueDate) {
        console.warn('Form validation failed');
        return;
      }

      // Create subscription object with UUID and timestamps
      const newSubscription = {
        id: uuidv4(), // or crypto.randomUUID()
        name,
        cost: parseFloat(cost),
        dueDate: parseInt(dueDate),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Dispatch to context
      addSubscription(newSubscription);

      // Show success message (3s auto-dismiss handled by component)
      setShowSuccess(true);

      // Clear form fields
      formRef.current?.reset();

    } catch (error) {
      console.error('Error adding subscription:', error);
      // Handle error (user-friendly message)
    }
  };

  return (
    <div data-testid="app-container">
      {showSuccess && <SuccessMessage />}
      
      <SubscriptionForm 
        ref={formRef}
        onSubmit={handleFormSubmit}
      />
      
      <SubscriptionList />
    </div>
  );
}
```

**Critical Points:**
- ✅ Generate UUID using `crypto.randomUUID()` or `npm install uuid`
- ✅ Convert cost to `number` with `parseFloat()`
- ✅ Convert dueDate to `number` with `parseInt()`
- ✅ Set `createdAt` and `updatedAt` to `Date.now()`
- ✅ Call `addSubscription(newSubscription)` from hook
- ✅ Show success message
- ✅ Reset form with `formRef.current?.reset()`

---

### ✅ 3. Ensure Form Validation is Wired

**From Story 3.1:** Form validation should prevent submission if:
- ❌ Name is empty
- ❌ Cost is non-numeric (e.g., "abc")
- ❌ Due date is empty or > 31

**Implementation:**
- Use React Hook Form validation from Story 3.1
- Tests expect form validation to work before handleFormSubmit is called
- Button should be disabled OR form submission prevented

---

### 🔄 4. Ensure Persistence Works

**From Story 2.2-2.3:** localStorage integration must be working

**Tests verify:**
- ✅ Subscription saved to localStorage after add
- ✅ Subscription loaded from localStorage on app init
- ✅ Subscription survives page reload
- ✅ All subscription fields (name, cost, dueDate) persist correctly

**Your Job:**
- Ensure `SubscriptionContext` loads subscriptions from localStorage on mount
- Ensure `ADD_SUBSCRIPTION` action saves to localStorage
- (This should already be done from Stories 2.2-2.3)

---

## 🚀 Testing Your Implementation

### Step 1: Start Dev Server
```bash
cd subscription-tracker
npm run dev
# Should start on http://localhost:5173
```

### Step 2: Run E2E Tests in Another Terminal
```bash
npm run test:e2e -- tests/story-3-3-e2e.spec.ts
```

### Step 3: Watch Test Output

**P0 Tests (Must Pass First):**
```
✅ [P0] AC4.1: User submits form and sees success message appear
✅ [P0] AC4.2: Success message text is correct
✅ [P0] AC5.1: New subscription appears in list immediately
✅ [P0] AC5.2: Displays correct name
✅ [P0] AC5.3: Displays correct cost
✅ [P0] AC5.4: Displays correct due date
✅ [P0] AC6.1: Remains in list after page reload
✅ [P0] AC6.2: Name persists correctly
✅ [P0] AC6.3: Cost persists correctly
✅ [P0] AC6.4: Due date persists correctly
✅ [P0] AC7.1: Form NOT submitted if field missing
```

**P1 Tests (Secondary):**
```
✅ [P1] AC4.3: Success message disappears after 3 seconds
✅ [P1] AC3.1: Form fields cleared after submission
✅ [P1] AC3.2: User can add another subscription
✅ [P1] AC5.5: Multiple subscriptions without data loss
✅ [P1] AC7.2: Validation error appears
✅ [P1] AC8.1: Invalid cost rejected
✅ [P1] AC8.2: Invalid due date rejected
```

### Step 4: Debug Failed Tests

```bash
# Run with UI to see what's happening
npm run test:e2e:ui -- tests/story-3-3-e2e.spec.ts

# Run with debug mode for detailed trace
npm run test:e2e:debug -- tests/story-3-3-e2e.spec.ts
```

---

## 📋 Pre-Submission Checklist

Before pushing your code:

- [ ] All data-testid attributes added to components
- [ ] handleFormSubmit implemented and wired in App
- [ ] SuccessMessage component created with 3s timeout
- [ ] Form clears after submission (form.reset())
- [ ] UUID generation works (crypto.randomUUID() or uuid lib)
- [ ] Timestamps set correctly (Date.now())
- [ ] Data types correct (cost: number, dueDate: number)
- [ ] localStorage persistence working (from Stories 2.2-2.3)
- [ ] Form validation wired (from Story 3.1)
- [ ] All 11 P0 tests pass ✅
- [ ] All 7 P1 tests pass ✅
- [ ] No console errors
- [ ] Test execution time < 2 minutes

---

## 🎯 Success Criteria

**Your implementation is correct when:**

```
Test Suites:  1 passed, 1 total
Tests:        18 passed, 18 total
Time:         ~60-90 seconds (all 3 browsers × 18 tests)
```

**Required for Merge:**
- ✅ All P0 tests pass (11 tests)
- ✅ No console errors
- ✅ Code review passes (bmad-code-review)

**Nice to Have:**
- ✅ All P1 tests pass (7 tests)
- ✅ < 1 minute execution time

---

## 🆘 Troubleshooting

### Tests Can't Find Elements (Selector Errors)

**Problem:** `locator did not resolve`

**Solution:** Ensure data-testid attributes are added to components exactly as shown above.

```bash
# Check what's on the page
npm run test:e2e:ui -- tests/story-3-3-e2e.spec.ts
# Use Playwright Inspector to inspect elements
```

### Success Message Never Appears

**Problem:** `[data-testid="success-message"] is not visible`

**Solution:** 
1. Check that SuccessMessage component is rendered in App
2. Check that handleFormSubmit calls `setShowSuccess(true)`
3. Check that it shows after form submission, not during

### Form Doesn't Clear

**Problem:** Input values still present after submission

**Solution:**
1. Add `ref` to form: `<form ref={formRef}>`
2. Call `formRef.current?.reset()` in handleFormSubmit
3. OR use React Hook Form's `reset()` method

### Data Not Persisting After Reload

**Problem:** Subscriptions disappear after page reload

**Solution:** Ensure SubscriptionContext loads from localStorage on app init:

```tsx
// In SubscriptionContext or custom hook
useEffect(() => {
  const saved = localStorage.getItem('subscriptions');
  if (saved) {
    setSubscriptions(JSON.parse(saved));
  }
}, []);
```

---

## 📞 Questions?

Reach out to Murat (Master Test Architect) for clarifications on:
- Test expectations
- E2E automation patterns
- Playwright best practices
- Coverage completeness

---

**Generated:** 2026-05-04  
**Story:** 3.3 — Implement Add Subscription Workflow  
**Test Framework:** Playwright (E2E)  
**Status:** Ready for Implementation ✅
