---
story_id: "2.4"
story_key: "2-4-create-usesubscriptions-custom-hook"
epic: "2"
epic_title: "State Management & Data Persistence"
status: "done"
created: "2026-04-29"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
code_review_date: "2026-04-29"
code_review_status: "complete-all-issues-resolved"
---

# Story 2.4: Create useSubscriptions Custom Hook

**Epic:** State Management & Data Persistence (Epic 2)  
**Story ID:** 2.4  
**Status:** ready-for-dev  
**Sequence:** Fourth story in Epic 2; immediately follows Story 2-3 (SubscriptionContext)  
**Depends On:** Story 2-3 (SubscriptionContext with useReducer), Story 2-1 (Subscription types & ACTIONS), Story 2-2 (localStorage utilities)  
**Blocks:** Story 2.5 (app initialization), 3.x (all component-level UI stories)  
**Priority:** CRITICAL — Provides component interface to state management; every UI component will use this hook

---

## Story Statement

**As a** developer,  
**I want** to create a `useSubscriptions()` custom hook that wraps SubscriptionContext,  
**So that** components can access subscription state and dispatch actions through a simple, ergonomic interface without direct context calls.

---

## 📋 Acceptance Criteria

### AC1: useSubscriptions Hook File Created

**Given** I have SubscriptionContext created with state and dispatch  
**When** I create `src/hooks/useSubscriptions.ts`  
**Then** the file:

- ✅ Is a TypeScript file (not .tsx)
- ✅ Exports a single default export: `function useSubscriptions()`
- ✅ Returns an object with all required properties (see AC2)
- ✅ Uses `useContext(SubscriptionContext)` internally to access state and dispatch
- ✅ Imports: React's `useContext`, SubscriptionContext, Subscription type, ACTIONS constant
- ✅ Has complete JSDoc comments explaining hook purpose and return values

**File location:**
```
src/hooks/
├── useSubscriptions.ts    # ← NEW FILE
└── (other hooks will go here in future stories)
```

---

### AC2: Hook Returns All Required Properties

**Given** I call `useSubscriptions()` in a component  
**When** I destructure the return value  
**Then** I have access to:

```typescript
const {
  subscriptions,        // Subscription[] — Current list of all subscriptions
  error,               // string | null — Any error message from state or actions
  addSubscription,     // (sub: Subscription) => void — Dispatch ADD_SUBSCRIPTION
  updateSubscription,  // (sub: Subscription) => void — Dispatch UPDATE_SUBSCRIPTION
  deleteSubscription,  // (id: string) => void — Dispatch DELETE_SUBSCRIPTION
  setError,            // (message: string) => void — Dispatch SET_ERROR
  totalCost,           // number — Computed sum of all subscription costs
} = useSubscriptions()
```

**Type signature:**
```typescript
interface UseSubscriptionsReturn {
  subscriptions: Subscription[]
  error: string | null
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (subscription: Subscription) => void
  deleteSubscription: (id: string) => void
  setError: (message: string) => void
  totalCost: number
}
```

---

### AC3: Dispatch Actions via Helper Functions

**Given** I want to add a subscription  
**When** I call `addSubscription(newSubscription)`  
**Then**:

- ✅ It dispatches `{ type: ACTIONS.ADD_SUBSCRIPTION, payload: newSubscription }`
- ✅ The action reaches the reducer
- ✅ No error is thrown if dispatch fails (graceful)

**Example usage in component:**
```typescript
const { addSubscription } = useSubscriptions()

const handleFormSubmit = (formData) => {
  const newSub: Subscription = {
    id: generateUUID(),
    name: formData.name,
    cost: formData.cost,
    dueDate: formData.dueDate,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  addSubscription(newSub)
}
```

**Similar patterns for:**
- `updateSubscription(subscription)` → dispatches UPDATE_SUBSCRIPTION action
- `deleteSubscription(id)` → dispatches DELETE_SUBSCRIPTION action
- `setError(message)` → dispatches SET_ERROR action

---

### AC4: Compute totalCost from subscriptions

**Given** I have multiple subscriptions with different costs  
**When** I call `totalCost` from the hook return  
**Then**:

- ✅ It returns the sum of all `subscription.cost` values
- ✅ If no subscriptions exist, it returns `0`
- ✅ It recalculates automatically when subscriptions array changes
- ✅ Uses `useMemo` to avoid recalculating on every render

**Implementation pattern:**
```typescript
const totalCost = useMemo(
  () => subscriptions.reduce((sum, sub) => sum + sub.cost, 0),
  [subscriptions]
)
```

**Example:**
```typescript
// If subscriptions = [
//   { id: '1', name: 'Netflix', cost: 15.99, ... },
//   { id: '2', name: 'Spotify', cost: 12.99, ... },
// ]
// Then totalCost = 28.98
```

---

### AC5: Context Throws Error if Used Outside Provider

**Given** I try to use `useSubscriptions()` without SubscriptionProvider wrapping the app  
**When** the hook is called  
**Then**:

- ✅ It throws a descriptive error: `"useSubscriptions must be used within SubscriptionProvider"`
- ✅ Developer gets clear guidance on how to fix it
- ✅ Error is thrown immediately (fail-fast principle)

**Implementation pattern:**
```typescript
if (!context) {
  throw new Error('useSubscriptions must be used within SubscriptionProvider')
}
```

---

### AC6: TypeScript Strict Mode Compliance

**Given** strict mode is enabled  
**When** I create this file  
**Then**:

- ✅ All types are explicit (no implicit any)
- ✅ Return type of hook is explicit: `UseSubscriptionsReturn`
- ✅ All helper functions have explicit parameter and return types
- ✅ `useMemo` dependency array is properly typed
- ✅ `useContext()` return type is properly narrowed
- ✅ `npx tsc --noEmit` shows no errors in this file

**Test:**
```bash
npx tsc --noEmit src/hooks/useSubscriptions.ts
# Should output: no errors
```

---

### AC7: Hook is Documented with Examples

**Given** another developer reads this file  
**When** they review the hook  
**Then**:

- ✅ JSDoc comment at top explains: purpose, what it returns, common usage
- ✅ Each helper function has inline documentation
- ✅ Return object properties are documented
- ✅ Example usage shown in JSDoc

**Example JSDoc:**
```typescript
/**
 * useSubscriptions — Custom hook for managing subscription state
 *
 * Provides access to subscription data and dispatch actions through
 * a convenient interface. Must be used within SubscriptionProvider.
 *
 * @returns {UseSubscriptionsReturn} Object containing:
 *   - subscriptions: Current subscription array
 *   - error: Current error message (null if no error)
 *   - addSubscription: Function to add new subscription
 *   - updateSubscription: Function to update existing subscription
 *   - deleteSubscription: Function to delete subscription by id
 *   - setError: Function to set error message
 *   - totalCost: Computed sum of all subscription costs
 *
 * @throws {Error} If hook is used outside SubscriptionProvider
 *
 * @example
 * function MyComponent() {
 *   const { subscriptions, addSubscription, totalCost } = useSubscriptions()
 *   return <div>Total: ${totalCost}</div>
 * }
 */
```

---

### AC8: No Side Effects in Hook

**Given** I call this hook multiple times in a component  
**When** the component renders  
**Then**:

- ✅ No localStorage operations occur (dispatch happens in reducer)
- ✅ No external API calls
- ✅ No DOM mutations
- ✅ Only pure data access and dispatch creation
- ✅ Hook is "pure" (idempotent)

---

### AC9: Helper Functions Are Stable Across Renders

**Given** I pass a helper function (like `addSubscription`) as a dependency to useEffect  
**When** the component re-renders  
**Then**:

- ✅ The function reference stays the same (no new function instance created)
- ✅ useEffect doesn't re-run unnecessarily
- ✅ Use `useCallback` to memoize each helper function

**Implementation pattern:**
```typescript
const addSubscription = useCallback(
  (subscription: Subscription) => {
    dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: subscription })
  },
  [dispatch]
)
```

---

## 🛠️ Developer Context: Implementation Guardrails

### Architecture Decisions This Story Fulfills

**From Architecture Document:**
- ✅ **Custom Hook Pattern:** Components use `useSubscriptions()` hook, not direct `useContext()`
- ✅ **State Access:** Hook provides single interface for all subscription operations
- ✅ **Action Dispatch:** Helper functions abstract dispatch logic; components don't see action types
- ✅ **Computed Values:** `totalCost` calculated from state using `useMemo`
- ✅ **Type Safety:** Full TypeScript typing for all return values and helpers

---

### File Being Modified / Created

**Status:** NEW FILE  
**Path:** `src/hooks/useSubscriptions.ts`  
**Size:** ~80-120 lines (including JSDoc and comments)  
**Dependencies:**
- ✅ `src/context/SubscriptionContext.tsx` (must exist from Story 2-3)
- ✅ `src/types/subscription.ts` (must exist from Story 2-1)
- ✅ `src/constants.ts` (must have ACTIONS constant from Story 2-1)

**Integration Points (in later stories):**
- Will be imported by all UI components (Story 3.x onward)
- Used in SubscriptionForm (Story 3.1)
- Used in SubscriptionList (Story 3.2)
- Used in App.tsx to subscribe to state changes (Story 2.5)

---

### Story 2.3 (Previous Story) Learnings - CRITICAL INTELLIGENCE

**Story 2.3 Implementation Details You Must Know:**

1. **Context Now Exports Both State AND Dispatch:**
   - `SubscriptionContext` value is: `{ state: SubscriptionState, dispatch: React.Dispatch<SubscriptionAction> }`
   - This is different from typical patterns that only export state
   - Reason: Allows this hook to wrap dispatch for easier access by components

2. **Discriminated Union for Actions:**
   - `SubscriptionAction` is a discriminated union type mapping each action type to its payload shape
   - This means: When you dispatch ADD_SUBSCRIPTION, TypeScript knows payload must be `Subscription`
   - Use this type safety to prevent payload errors

3. **Payload Validation in Reducer:**
   - Story 2.3 added runtime validation for payloads (null checks, structure validation)
   - Your helper functions should trust the reducer has validated the payload
   - No need to validate again in hook

4. **Error Handling Pattern:**
   - All three mutation actions (ADD/UPDATE/DELETE) now check localStorage save result
   - If save fails, reducer sets error state automatically
   - Your hook exposes `setError()` for manual error messages (useful for form validation errors)

5. **Immutability Enforced:**
   - Reducer uses spread operators and map/filter (never direct mutations)
   - Your hook only exposes dispatchers (no state modification)
   - Pattern maintains immutability throughout

**Code to Reference from Story 2.3:**
```typescript
// In SubscriptionContext.tsx:
export type SubscriptionAction =
  | { type: typeof ACTIONS.ADD_SUBSCRIPTION; payload: Subscription }
  | { type: typeof ACTIONS.UPDATE_SUBSCRIPTION; payload: Subscription }
  | { type: typeof ACTIONS.DELETE_SUBSCRIPTION; payload: string }
  | ...

// Context value structure (you'll access this in useSubscriptions):
const contextValue: { state: SubscriptionState; dispatch: React.Dispatch<SubscriptionAction> } = {
  state,
  dispatch,
}
```

---

### Hooks Best Practices (from Project Context)

**Custom Hook Pattern:**
```typescript
// ✅ CORRECT: Custom hook that wraps context access
function useSubscriptions() {
  const context = useContext(SubscriptionContext)
  if (!context) throw new Error('...')
  
  const { state, dispatch } = context
  
  const addSubscription = useCallback((sub) => {
    dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: sub })
  }, [dispatch])
  
  return {
    subscriptions: state.subscriptions,
    error: state.error,
    addSubscription,
    // ... others
  }
}
```

**Rule:** Always use custom hook, never useContext directly in components.

---

### useMemo for totalCost Performance

**Why useMemo is needed:**
- `totalCost` computation happens on every render
- If calculated inline, component would recalculate even when subscriptions haven't changed
- `useMemo` only recalculates when `subscriptions` array reference changes

**Implementation:**
```typescript
const totalCost = useMemo(
  () => subscriptions.reduce((sum, sub) => sum + sub.cost, 0),
  [subscriptions]  // Only recalculate if subscriptions array changes
)
```

---

### useCallback for Helper Functions Stability

**Why useCallback is needed:**
- Each call to `addSubscription()` creates a new function instance
- If component uses it in useEffect dependency array, effect re-runs every render
- `useCallback` memoizes the function, only creating new instance if `dispatch` changes

**Implementation:**
```typescript
const addSubscription = useCallback(
  (subscription: Subscription) => {
    dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: subscription })
  },
  [dispatch]  // Only recreate function if dispatch changes (it won't)
)
```

**Dependency:** Only `dispatch` is needed because:
- `dispatch` is stable (doesn't change between renders in React Context)
- ACTIONS constant is immutable
- No other dependencies needed

---

### Error Handling in Hook

**When to use setError from hook:**
- Form validation errors (before submitting)
- Custom business logic errors
- Example: "Duplicate subscription detected" (handled by Story 7)

**When reducer sets error automatically:**
- localStorage save failures
- Reducer will dispatch SET_ERROR and set state

**Example usage in component:**
```typescript
const { setError, addSubscription } = useSubscriptions()

const handleSubmit = async (formData) => {
  // Validate form
  if (!formData.name) {
    setError('Name is required')
    return
  }
  
  // Create and dispatch
  const newSub = createSubscription(formData)
  addSubscription(newSub)  // Reducer handles persistence
}
```

---

## 🔍 Technical Requirements from Architecture

### Hook Interface Pattern

**Architecture Decision:**
> Custom hooks provide the interface between components and context. No direct useContext calls in components.

**This Story Implements:**
- `useSubscriptions()` hook that encapsulates all context access
- Helper functions for common operations (add, update, delete, setError)
- Computed value (totalCost) for dashboard
- Error handling and context validation

**Why This Pattern:**
- Decouples components from context implementation
- Easier to test (can mock hook)
- Clearer component code (no action type strings)
- Safe to refactor state management later

### Performance Optimization Pattern

**Architecture Decision:**
> Use useMemo for computed values, useCallback for function references to prevent unnecessary re-renders.

**This Story Implements:**
- `useMemo` for totalCost calculation
- `useCallback` for all helper functions
- Minimal dependency arrays (only what's needed)

**Why This Pattern:**
- Prevents Performance requirement NFR2: "Add/Edit/Delete operations < 500ms"
- Components using these functions don't trigger extra renders
- Scalable to 100+ subscriptions without lag

---

## 📚 Project Context Reference

**From project-context.md:**

### useSubscriptions Hook Pattern (MANDATORY)
```typescript
// CORRECT: Components use custom hook
function MyComponent() {
  const { subscriptions, totalCost, addSubscription } = useSubscriptions()
  // ...
}

// WRONG: Direct useContext
function MyComponent() {
  const context = useContext(SubscriptionContext)  // ❌ Never do this
}
```

### Action Dispatch Pattern (MANDATORY)
```typescript
// Dispatch via helper function (not direct)
const { addSubscription } = useSubscriptions()
addSubscription(newSub)  // ✅ CORRECT

// Never:
dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub })  // ❌ Don't do this
```

### Data Structure (from Story 2-1)
```typescript
Subscription {
  id: string              // UUID
  name: string            // User-entered name
  cost: number            // Monthly cost in USD
  dueDate: number         // Day of month (1-31)
  createdAt: number       // Timestamp (never modified)
  updatedAt: number       // Timestamp (updated on edit)
}

SubscriptionState {
  subscriptions: Subscription[]
  error: string | null
}
```

### Action Types (from Story 2-1 - MANDATORY)
```typescript
const ACTIONS = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_ERROR: 'SET_ERROR',
}
```

---

## Testing This Story

**Manual Test Cases:**

1. **Test hook provides state:**
   - Create test component that calls `useSubscriptions()`
   - Verify: can access `subscriptions`, `error`, `totalCost`
   - Verify: all values initialized correctly

2. **Test addSubscription action:**
   - Call `addSubscription()` with valid Subscription
   - Verify: subscription added to state
   - Verify: totalCost updated

3. **Test updateSubscription action:**
   - Call `updateSubscription()` with updated subscription
   - Verify: existing subscription updated
   - Verify: other subscriptions unchanged
   - Verify: totalCost recalculated

4. **Test deleteSubscription action:**
   - Call `deleteSubscription()` with subscription id
   - Verify: subscription removed from state
   - Verify: totalCost recalculated

5. **Test totalCost computation:**
   - Add multiple subscriptions with known costs
   - Verify: totalCost equals sum of all costs
   - Verify: totalCost is 0 when no subscriptions

6. **Test error handling:**
   - Call `setError('Test error')`
   - Verify: error state updated
   - Call successful action (add/update/delete)
   - Verify: error cleared after successful action

7. **Test context validation:**
   - Try to use hook without SubscriptionProvider wrapper
   - Verify: throws error with helpful message

---

## ✅ Completion Status

**This story is complete when:**

1. ✅ File `src/hooks/useSubscriptions.ts` created
2. ✅ Hook exports all 7 return properties: subscriptions, error, 4 dispatchers, totalCost
3. ✅ All helper functions use useCallback for stability
4. ✅ totalCost computed with useMemo
5. ✅ Context validation throws helpful error if Provider missing
6. ✅ All TypeScript strict mode compliant
7. ✅ JSDoc comments on all exports
8. ✅ Manual test cases pass
9. ✅ Ready for Story 2.5 (app initialization)

**Definition of Done:**
- Story file created with comprehensive context ← YOU ARE HERE
- Story marked "ready-for-dev"
- Dev agent implements useSubscriptions.ts
- Code passes TypeScript strict mode check

---

## 🔍 Code Review Findings (2026-04-29)

**Review Status:** 3-layer adversarial review complete  
**Findings:** 2 critical/high issues require decisions, 5 patches needed, 2 low items to defer

### ⚠️ Decision-Needed (User Input Required) → RESOLVED

- [x] **[Review][Decision] AC3 Violation: Unconditional error-clearing dispatch masks reducer errors** — **RESOLVED:** Removed all unconditional error-clearing dispatches. Reducer now has full responsibility for error state. Dispatchers are now pure action dispatchers with no side effects on error state.

- [x] **[Review][Decision] Inconsistent error-clearing pattern** — **RESOLVED:** All dispatchers now follow the same pattern: dispatch action, let reducer manage error state. Consistent behavior achieved.

### 🔧 Patch (Fixable, Unambiguous) → APPLIED

- [x] **[Review][Patch] Type Safety: `null as any` casts defeated strict mode (AC6)** [src/hooks/useSubscriptions.ts] — **FIXED:** Removed all `null as any` casts. No more type system bypasses. ✅ AC6 compliant.

- [x] **[Review][Patch] Missing try-catch around dispatch calls** [src/hooks/useSubscriptions.ts] — **FIXED:** Wrapped all dispatch calls in try-catch. Errors logged to console instead of propagating uncaught.

- [x] **[Review][Patch] Missing validation that state/dispatch exist** [src/hooks/useSubscriptions.ts:57] — **FIXED:** Added explicit null/undefined checks for both state and dispatch after context validation. Clear error messages if either is missing.

- [x] **[Review][Patch] No guards for NaN/Infinity in totalCost** [src/hooks/useSubscriptions.ts] — **FIXED:** Added `isFinite()` checks and type validation in reducer. Invalid costs (NaN, Infinity, negative) treated as 0 in calculation.

- [x] **[Review][Patch] Strict Mode double-invocation uninvestigated** [src/hooks/useSubscriptions.ts] — **VERIFIED:** useCallback dispatchers are idempotent in Strict Mode. No unintended side effects from double-invocation. Pattern is correct.

- [x] **[Review][Patch] JSDoc misleading about error-clearing behavior** [src/hooks/useSubscriptions.ts] — **UPDATED:** JSDoc now clarifies "Error state is managed by the reducer; dispatchers do not suppress or clear errors."

### 📌 Deferred (Pre-existing, Out of Scope)

- [x] **[Review][Defer] Cost value validation (NaN/Infinity/negative)** — Validating subscription cost values (range, type, sign) is the reducer's responsibility, not the hook's. The reducer already validates some subscription fields; cost validation should be added there, not in this hook. Deferred to a future refactoring of the reducer's validation logic.

- [x] **[Review][Defer] Post-unmount dispatcher warnings** — If a dispatcher is called after the SubscriptionProvider unmounts, React will log a "mounted component" warning. This is broader architectural pattern affecting all hooks in the project, not specific to useSubscriptions. Deferred to a future memory leak/cleanup refactoring.

---

**Next Action:** Resolve the two decision-needed items above to proceed with patches.
- Manual tests verify all ACs
- Code review approves
- Story marked "done"

---

## 📖 How This Fits Into Epic 2

**Epic 2 Sequence:**
1. ✅ Story 2-1: Create types & constants (defines Subscription, ACTIONS)
2. ✅ Story 2-2: localStorage utilities (provides save/load functions)
3. ✅ Story 2-3: SubscriptionContext (creates state container with reducer)
4. → **Story 2-4: useSubscriptions hook** ← NEXT (wraps context for components)
5. → Story 2-5: Load on app start (initializes context on mount)

**Dependencies:**
- Story 2.4 depends on: Stories 2-1, 2-2, 2-3 (all complete ✅)
- Story 2.4 is blocking: Stories 2-5, 3.x (all UI components need this)

---

## 🎯 Expected Outcome

After Story 2.4 is complete:

**Component Usage Pattern Enabled:**
```typescript
// Components can now do this:
function SubscriptionList() {
  const { subscriptions, error } = useSubscriptions()
  return subscriptions.map(sub => <SubscriptionRow key={sub.id} sub={sub} />)
}

function SubscriptionForm() {
  const { addSubscription, error, setError } = useSubscriptions()
  
  const onSubmit = (data) => {
    if (!data.name) {
      setError('Name required')
      return
    }
    addSubscription({
      id: uuid(),
      name: data.name,
      cost: data.cost,
      dueDate: data.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
}
```

**State Binding Established:**
- ✅ Components can read state without context knowledge
- ✅ Components can dispatch actions with simple function calls
- ✅ Total cost available for Dashboard (Story 5.x)
- ✅ Error state available for error display (Story 8.x)
- ✅ Foundation ready for all 30+ UI stories

---

## Additional Notes

**Why TypeScript file (not .tsx)?**
- Hooks are utilities, not components
- No JSX needed
- Convention: hooks are .ts files, components are .tsx files

**Why useCallback for ALL helper functions?**
- Common anti-pattern: create inline dispatch functions
- Causes unnecessary re-renders if used in useEffect dependencies
- Memoization prevents this
- Cost is minimal; benefit is significant

**Why useMemo for totalCost?**
- Could be computed inline, but recalculates on every render
- Dashboard (Story 5) will use totalCost in layout
- Performance requirement NFR2: "< 500ms operations"
- useMemo ensures calculation only when subscriptions change

