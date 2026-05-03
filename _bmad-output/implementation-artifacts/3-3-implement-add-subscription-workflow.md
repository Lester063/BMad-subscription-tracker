---
story_id: "3.3"
story_key: "3-3-implement-add-subscription-workflow"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "ready-for-dev"
created: "2026-04-30"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
---

# Story 3.3: Implement Add Subscription Workflow

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.3  
**Status:** ready-for-dev  
**Sequence:** Third story in Epic 3; follows Story 3.2 (SubscriptionList & SubscriptionRow)  
**Depends On:**
- Story 3.1 (SubscriptionForm component)
- Story 3.2 (SubscriptionList & SubscriptionRow components)
- Story 2.1 (Subscription types & ACTIONS)
- Story 2.2 (localStorage utilities)
- Story 2.3 (SubscriptionContext with useReducer)
- Story 2.4 (useSubscriptions custom hook)
- Story 2.5 (App initialization with SubscriptionProvider)

**Blocks:** Story 3.4 (real-time updates), Story 3.5 (accessibility)  
**Priority:** HIGH — Core add workflow; enables entire subscription flow

---

## 🎯 Story Statement

**As a** user,  
**I want** to fill out the subscription form and click "Add" to create a new subscription,  
**So that** my subscription is saved, appears in the list, and persists after page refresh.

---

## 📋 Acceptance Criteria

### AC1: Form Submission Handler Connects to Context

**Given** I have SubscriptionForm with `onSubmit` prop and useSubscriptions hook  
**When** I wire the form handler to dispatch ADD_SUBSCRIPTION action  
**Then** the implementation:

- ✅ Creates form submit handler in `App.tsx` (or Dashboard when created in Story 5.3)
- ✅ Calls `useSubscriptions()` hook to get `addSubscription` dispatcher
- ✅ Passes handler to `<SubscriptionForm onSubmit={handleFormSubmit} />`
- ✅ Handler receives FormData (name, cost, dueDate)
- ✅ Dispatches ADD_SUBSCRIPTION action with new Subscription object

**Implementation pattern:**
```typescript
// App.tsx
function App() {
  const { subscriptions, addSubscription } = useSubscriptions();
  
  const handleFormSubmit = (data: FormData): void => {
    // Generate UUID for new subscription
    const newSubscription: Subscription = {
      id: generateUUID(), // uuid v4 or similar
      name: data.name,
      cost: parseFloat(data.cost.toString()),
      dueDate: parseInt(data.dueDate, 10),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Dispatch action to context
    addSubscription(newSubscription);
  };
  
  return (
    <SubscriptionProvider>
      <h1>Subscription Tracker</h1>
      <SubscriptionForm onSubmit={handleFormSubmit} />
      <SubscriptionList />
    </SubscriptionProvider>
  );
}
```

---

### AC2: New Subscription Has Unique ID & Timestamps

**Given** I submit the form with name, cost, dueDate  
**When** the subscription is created  
**Then** the new Subscription object:

- ✅ Has a unique `id` (UUID v4 or similar)
- ✅ Has `createdAt` timestamp set to current time (Date.now())
- ✅ Has `updatedAt` timestamp set to current time
- ✅ Preserves form values: name, cost, dueDate
- ✅ Cost is converted to number (parseFloat)
- ✅ Due date is converted to number 1-31 (parseInt)

**UUID Generation Options:**
- Option A: Import `crypto.randomUUID()` (browser native, ES2024)
- Option B: Use lightweight library: `import { v4 as uuidv4 } from 'uuid'` (if installed)
- Option C: Simple fallback: `Math.random().toString(36).substr(2, 9)` (not cryptographically secure but works for MVP)

**Recommendation:** Use `crypto.randomUUID()` (native, no dependencies). Fallback to option C if browser doesn't support it.

---

### AC3: Form Clears After Successful Submission

**Given** I fill out the form and click "Add Subscription"  
**When** the form submission completes  
**Then** the form:

- ✅ All input fields are cleared (name, cost, dueDate reset to empty)
- ✅ Focus remains accessible for adding another subscription
- ✅ User can immediately add another subscription

**Implementation pattern:**
```typescript
const handleFormSubmit = (data: FormData): void => {
  // ... create and dispatch subscription ...
  
  // Clear form after successful submission
  // SubscriptionForm's reset() is called automatically if onSubmit is called
  // OR manually call reset() inside handler if needed
};
```

---

### AC4: Success Message Displayed

**Given** I submit a valid subscription  
**When** the subscription is added to the list  
**Then** a success message appears:

- ✅ Message text: "Subscription added successfully" or similar
- ✅ Message appears near form (e.g., toast, alert, or inline message)
- ✅ Message is visible for at least 2-3 seconds
- ✅ Message auto-dismisses or user can dismiss it
- ✅ Message is accessible to screen readers

**Note:** Full toast notification system comes in Story 4.4. For this story:
- Simplest approach: Show a temporary `<div>` with success message
- Use `useState` with `setTimeout` to auto-dismiss
- Or use an alert() for MVP (will be replaced in Story 4.4)

**Simple Pattern:**
```typescript
const [successMessage, setSuccessMessage] = useState<string | null>(null);

const handleFormSubmit = (data: FormData): void => {
  // ... create and dispatch subscription ...
  
  // Show success message
  setSuccessMessage('Subscription added successfully');
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => setSuccessMessage(null), 3000);
};

return (
  <>
    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
    <SubscriptionForm onSubmit={handleFormSubmit} />
    <SubscriptionList />
  </>
);
```

---

### AC5: Subscription Appears in List Immediately

**Given** I add a subscription with form  
**When** the action is dispatched to context  
**Then** the subscription:

- ✅ Appears in SubscriptionList immediately (no page refresh)
- ✅ Is displayed with Name, Cost (currency formatted), Due Date, Edit/Delete buttons
- ✅ Has the correct ID from the new subscription object
- ✅ Follows the sorting order (alphabetical or by due date, see Story 3.4)

**No changes required to SubscriptionList** — it already reads from `useSubscriptions()` which returns updated subscriptions from context.

---

### AC6: Subscription Persists After Page Refresh

**Given** I add a subscription and reload the page  
**When** the page refreshes  
**Then** the subscription:

- ✅ Remains in the list
- ✅ Subscription data is intact (name, cost, dueDate, ID, timestamps)
- ✅ No data loss or corruption
- ✅ Is loaded from localStorage via SubscriptionContext initialization (Story 2.5)

**No additional implementation needed** — This is handled by:
- Story 2.2: `saveSubscriptionsToStorage()` saves to localStorage after each action
- Story 2.5: `SubscriptionContext` loads from storage on app mount via `useEffect`

---

### AC7: Error Handling for Invalid Form Submission

**Given** I try to submit an invalid form (missing required fields)  
**When** I click "Add Subscription"  
**Then** the form:

- ✅ Does NOT submit (React Hook Form validation prevents submission)
- ✅ Shows validation error for each invalid field (from SubscriptionForm component)
- ✅ No error action is dispatched to context
- ✅ No localStorage write occurs

**Note:** Form validation is handled by Story 3.1 (SubscriptionForm). This story assumes form submission is only called with valid data.

---

### AC8: Form Data Types Are Correct

**Given** I submit form data with name, cost, dueDate  
**When** the subscription is created and dispatched  
**Then** the data types are:

- ✅ `name`: string (preserved from form)
- ✅ `cost`: number (parseFloat applied)
- ✅ `dueDate`: number 1-31 (parseInt applied)
- ✅ `id`: string (UUID)
- ✅ `createdAt`: number (Date.now() timestamp)
- ✅ `updatedAt`: number (Date.now() timestamp)
- ✅ TypeScript compilation passes with no errors

**Implementation check:**
```typescript
const newSubscription: Subscription = {
  id: generateUUID(),
  name: data.name,                        // string ✓
  cost: parseFloat(data.cost.toString()), // number ✓
  dueDate: parseInt(data.dueDate, 10),   // number ✓
  createdAt: Date.now(),                  // number (timestamp) ✓
  updatedAt: Date.now(),                  // number (timestamp) ✓
};
```

---

## 🔗 Dependencies & Context

### From Previous Stories (MUST READ)

1. **Story 3.1 (SubscriptionForm):** Form component with `onSubmit` prop, receives FormData
2. **Story 3.2 (SubscriptionList):** Displays subscriptions from `useSubscriptions()` hook
3. **Story 2.4 (useSubscriptions):** Hook returns `subscriptions` array and `addSubscription` dispatcher
4. **Story 2.3 (SubscriptionContext):** Reducer handles ADD_SUBSCRIPTION action and saves to localStorage
5. **Story 2.2 (localStorage):** `saveSubscriptionsToStorage()` called after ADD_SUBSCRIPTION

### Architecture Requirements (MUST FOLLOW)

- **Data Flow:** Form → Component Handler → `addSubscription()` dispatcher → Reducer → localStorage
- **No direct mutation:** Never modify state directly; always dispatch actions
- **Custom Hook:** Always use `useSubscriptions()` hook, never useContext directly
- **Subscription structure:** `{id: UUID, name: string, cost: number, dueDate: number (1-31), createdAt: timestamp, updatedAt: timestamp}`
- **localStorage key:** `'subscriptions'` (exact spelling, lowercase)
- **Action type:** `ACTIONS.ADD_SUBSCRIPTION` (defined in constants)

### Current State of App.tsx

**From Story 3.2 implementation:**
```typescript
import { SubscriptionProvider } from './context/SubscriptionContext'
import { SubscriptionForm, type FormData } from './components/SubscriptionForm/SubscriptionForm'
import { SubscriptionList } from './components/SubscriptionList/SubscriptionList'
import './App.css'

function App() {
  const handleFormSubmit = (data: FormData) => {
    // TODO: Story 3.3 will implement actual submission logic
  }

  return (
    <SubscriptionProvider>
      <div className="app">
        <h1>Subscription Tracker</h1>
        <SubscriptionForm onSubmit={handleFormSubmit} />
        <SubscriptionList />
      </div>
    </SubscriptionProvider>
  )
}

export default App
```

**This story must replace the TODO comment** with complete form submission logic.

### File Structure

```
src/
├── App.tsx ← UPDATE THIS FILE (implement handleFormSubmit)
├── components/
│   ├── SubscriptionForm/
│   │   ├── SubscriptionForm.tsx (DONE - Story 3.1)
│   │   └── SubscriptionForm.module.css (DONE)
│   └── SubscriptionList/
│       ├── SubscriptionList.tsx (DONE - Story 3.2)
│       ├── SubscriptionRow.tsx (DONE - Story 3.2)
│       └── SubscriptionList.module.css (DONE)
├── context/
│   └── SubscriptionContext.tsx (DONE - Story 2.3)
├── hooks/
│   └── useSubscriptions.ts (DONE - Story 2.4)
├── types/
│   └── subscription.ts (DONE - Story 2.1)
├── utils/
│   └── localStorageManager.ts (DONE - Story 2.2)
└── constants.ts (DONE - Story 2.1)
```

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

**Test 1: Form submission dispatches ADD_SUBSCRIPTION action**
- Render App with SubscriptionProvider
- Fill form with name, cost, dueDate
- Click submit button
- Verify `addSubscription` was called with Subscription object
- Verify subscription has id, createdAt, updatedAt

**Test 2: Form clears after successful submission**
- Render App
- Fill form and submit
- Verify input fields are cleared (empty values)
- Verify user can add another subscription

**Test 3: Subscription appears in list after add**
- Render App with 0 subscriptions
- Add subscription via form
- Verify SubscriptionList displays the new subscription
- Verify data (name, cost, dueDate) matches what was entered

**Test 4: New subscription has correct data types**
- Create subscription with FormData
- Verify: name (string), cost (number), dueDate (number 1-31)
- Verify: id (string UUID), createdAt/updatedAt (number timestamps)
- Verify no TypeScript errors

**Test 5: Multiple subscriptions can be added**
- Add 3 subscriptions via form
- Verify all 3 appear in list
- Verify each has unique ID
- Verify each has correct timestamps

### E2E Tests (Playwright)

**Test 1: Add subscription end-to-end flow**
- Navigate to app
- Enter subscription details in form
- Click "Add Subscription"
- Verify success message appears
- Verify subscription appears in list
- Verify form is cleared

**Test 2: Subscription persists after refresh**
- Add subscription
- Refresh page (F5)
- Verify subscription still exists in list
- Verify data is intact

**Test 3: Multiple rapid additions**
- Add 3 subscriptions in quick succession
- Verify all 3 appear in list
- Verify no data loss

**Test 4: Large data volume**
- Add 50 subscriptions via form
- Verify all appear in list
- Verify performance is acceptable (< 500ms per add)

---

## ⚠️ Developer Notes

### What to Implement (Non-Negotiable)

- ✅ Replace TODO in App.tsx with working form submission handler
- ✅ Create Subscription object with UUID, timestamps
- ✅ Call `addSubscription()` dispatcher from useSubscriptions hook
- ✅ Clear form after successful submission
- ✅ Display success message (temp implementation OK for this story)
- ✅ Data persists to localStorage (already handled by Story 2.2 reducer)

### What Already Works (Don't Modify)

- ✅ SubscriptionForm component renders and validates (Story 3.1)
- ✅ SubscriptionList displays subscriptions (Story 3.2)
- ✅ useSubscriptions hook provides `addSubscription` dispatcher (Story 2.4)
- ✅ Reducer saves to localStorage after ADD_SUBSCRIPTION (Story 2.3)
- ✅ App loads subscriptions from storage on start (Story 2.5)

### What Will Come Later

- ⏱️ Story 3.4: Real-time list updates with sorting
- ⏱️ Story 4.1: Edit subscription workflow
- ⏱️ Story 4.4: Toast notification system (replace temp success message)
- ⏱️ Story 7.3: Fuzzy matching validation (prevent duplicates)

### Common Mistakes to Avoid

- ❌ NOT using `useSubscriptions()` hook to get `addSubscription` dispatcher
- ❌ NOT generating UUID for new subscription (use crypto.randomUUID() or equivalent)
- ❌ NOT setting both createdAt and updatedAt timestamps
- ❌ NOT converting cost to number (parseFloat) and dueDate to number (parseInt)
- ❌ NOT clearing form after submission
- ❌ Creating Subscription object without all required fields
- ❌ Calling reducer action directly instead of using dispatcher
- ❌ Not handling the case where useSubscriptions is called outside SubscriptionProvider

---

## 📝 Dev Notes (Update During Implementation)

| Date | Note |
|------|------|
| 2026-04-30 | Story created - ready for implementation |
| | Implement handleFormSubmit in App.tsx |
| | Create Subscription object with UUID and timestamps |
| | Dispatch ADD_SUBSCRIPTION action via addSubscription() |
| | Add form clear logic |
| | Add success message display |
| | Write unit tests for form submission |
| | Write E2E tests for add workflow |
| | Verify TypeScript compilation - NO ERRORS |
| | | |

---

## ✅ Completion Checklist

- [ ] App.tsx handleFormSubmit implemented with full submission logic
- [ ] Subscription object created with id (UUID), timestamps, and form data
- [ ] addSubscription() dispatcher called correctly
- [ ] Form clears after submission
- [ ] Success message displays (temp implementation)
- [ ] Subscription appears in list immediately
- [ ] Subscription persists after page refresh
- [ ] All required acceptance criteria verified
- [ ] Unit tests written and passing
- [ ] E2E tests written and passing
- [ ] TypeScript compilation passes with no errors
- [ ] Code review completed and approved (via bmad-code-review)
