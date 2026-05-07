---
story_id: "11.1"
story_key: "11-1-extend-subscriptioncontext-with-search-filter-state"
epic: "11"
epic_title: "Search & Filter Subscriptions"
status: "ready-for-dev"
created: "2026-05-07"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
priority: "CRITICAL"
estimated_complexity: "medium"
estimated_effort: "3-4 hours"
---

# Story 11.1: Extend SubscriptionContext with Search/Filter State

**Epic:** Search & Filter Subscriptions (Epic 11)  
**Story ID:** 11.1  
**Status:** ready-for-dev  
**Sequence:** First story in Epic 11; establishes foundation for all search/filter features (Stories 11.2-11.7)  
**Depends On:** Story 2.3 (SubscriptionContext exists), Story 2.4 (useSubscriptions hook exists)  
**Blocks:** Stories 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8 (all search/filter stories)  
**Critical:** ✅ YES — Foundational architectural extension; all downstream stories cannot start without this

---

## 📋 STORY REQUIREMENTS

### User Story
```
As a developer,
I want to extend SubscriptionContext with search and filter state management,
So that search/filter criteria persist during user session and update all components in real-time.
```

### Business Value
- Establishes centralized state management for search/filter features
- Enables real-time filtering across entire application with single source of truth
- Session-scoped state (not persisted to localStorage) reduces implementation complexity
- Prepares foundation for Stories 11.2-11.7 to build UI and filtering logic

### Scope & Boundaries
✅ **In Scope:**
- Extend SubscriptionContext.tsx with searchState interface
- Add 4 new reducer actions (SET_SEARCH_TERM, SET_COST_RANGE_MIN, SET_COST_RANGE_MAX, RESET_ALL_FILTERS)
- Extend SubscriptionState interface to include searchState
- Update reducer to handle new actions
- Extend useSubscriptions hook to expose search/filter dispatchers
- Verify TypeScript strict mode compliance
- NO localStorage persistence for search/filter state

❌ **Out of Scope:**
- Create SearchBar component (Story 11.2)
- Create CostRangeFilter component (Story 11.3)
- Create useFilteredSubscriptions hook (Story 11.4)
- Implement filtering logic (Story 11.5)
- UI integration into Dashboard (Story 11.6)
- Clear all filters button (Story 11.7)
- Testing (Story 11.8)

---

## ✅ ACCEPTANCE CRITERIA

### AC1: SearchState Interface Created

**Given** I need to define search/filter state structure  
**When** I extend SubscriptionContext.tsx  
**Then** I add new TypeScript interface:

```typescript
export interface SearchState {
  searchTerm: string              // Search text for subscription names
  costRangeMin: number | null     // Minimum cost filter (null = no minimum)
  costRangeMax: number | null     // Maximum cost filter (null = no maximum)
}
```

**And** the interface is exported from SubscriptionContext.tsx  
**And** TypeScript strict mode shows no errors  
**And** default values are explicitly documented:
- `searchTerm: ''` (empty string means no search active)
- `costRangeMin: null` (null means no minimum threshold)
- `costRangeMax: null` (null means no maximum threshold)

---

### AC2: SubscriptionState Extended with SearchState

**Given** I have SubscriptionState interface (from Story 2.3)  
**When** I extend it with search state  
**Then** the updated interface is:

```typescript
export interface SubscriptionState {
  subscriptions: Subscription[]
  error: string | null
  
  // NEW: Search and filter state (added by this story)
  searchState: SearchState
}
```

**And** the initialState in the reducer is updated:

```typescript
const initialState: SubscriptionState = {
  subscriptions: [],
  error: null,
  
  // NEW: Initialize search state with no filters active
  searchState: {
    searchTerm: '',
    costRangeMin: null,
    costRangeMax: null
  }
}
```

**And** existing state mutations (ADD_SUBSCRIPTION, UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION) preserve searchState unchanged:

```typescript
case ACTIONS.ADD_SUBSCRIPTION:
  const newSubs = [...state.subscriptions, action.payload]
  saveSubscriptionsToStorage(newSubs)
  return {
    subscriptions: newSubs,
    error: null,
    searchState: state.searchState  // ← PRESERVE search state
  }
```

---

### AC3: Four New Reducer Actions Created

**Given** I have the extended SubscriptionState  
**When** I add new action types to the ACTIONS constant  
**Then** I add these 4 new entries to `src/constants.ts`:

```typescript
const ACTIONS = {
  // Existing actions (unchanged)
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_ERROR: 'SET_ERROR',
  
  // NEW: Search and filter actions (added by this story)
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_COST_RANGE_MIN: 'SET_COST_RANGE_MIN',
  SET_COST_RANGE_MAX: 'SET_COST_RANGE_MAX',
  RESET_ALL_FILTERS: 'RESET_ALL_FILTERS'
}
```

**And** all 4 new actions are exported from constants.ts  
**And** no other action types are used throughout the reducer

---

### AC4: SET_SEARCH_TERM Action Handler

**Given** I need to update search term for name searching  
**When** a component dispatches SET_SEARCH_TERM  
**Then** the reducer handles it:

```typescript
case ACTIONS.SET_SEARCH_TERM:
  return {
    ...state,
    searchState: {
      ...state.searchState,
      searchTerm: action.payload as string  // String can be empty ('')
    }
  }
```

**And** the behavior is:
- **Payload type:** `string` (the search term text)
- **Effect:** Updates `searchState.searchTerm` only, leaves min/max filters untouched
- **Persistence:** NOT saved to localStorage (session-only)
- **Validation:** No validation in reducer (components validate separately)
- **Example usage:**
  ```typescript
  dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: 'netflix' })
  // state.searchState.searchTerm becomes 'netflix'
  
  dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: '' })
  // state.searchState.searchTerm becomes '' (clears search)
  ```

**And** this action does NOT clear cost range filters:
```typescript
// Example: search is active, cost filter exists
const state = {
  searchState: { searchTerm: 'netflix', costRangeMin: 10, costRangeMax: 20 }
}

// User changes search term
dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: 'hulu' })

// Result: searchTerm updated, cost range PRESERVED
state.searchState  // { searchTerm: 'hulu', costRangeMin: 10, costRangeMax: 20 }
```

---

### AC5: SET_COST_RANGE_MIN Action Handler

**Given** I need to set minimum cost filter  
**When** a component dispatches SET_COST_RANGE_MIN  
**Then** the reducer handles it:

```typescript
case ACTIONS.SET_COST_RANGE_MIN:
  return {
    ...state,
    searchState: {
      ...state.searchState,
      costRangeMin: action.payload as number | null
    }
  }
```

**And** the behavior is:
- **Payload type:** `number | null` (numeric minimum or null to remove)
- **Effect:** Updates only `searchState.costRangeMin`, preserves search term and max
- **Persistence:** NOT saved to localStorage (session-only)
- **Validation:** No validation in reducer (components validate in AC7)
- **Example usage:**
  ```typescript
  dispatch({ type: ACTIONS.SET_COST_RANGE_MIN, payload: 10 })
  // state.searchState.costRangeMin becomes 10
  
  dispatch({ type: ACTIONS.SET_COST_RANGE_MIN, payload: null })
  // state.searchState.costRangeMin becomes null (removes minimum)
  ```

**And** accepted values are:
- ✅ `null` (no minimum — filter inactive)
- ✅ `0` (minimum of $0)
- ✅ `15.99` (decimals allowed)
- ✅ Any positive number

---

### AC6: SET_COST_RANGE_MAX Action Handler

**Given** I need to set maximum cost filter  
**When** a component dispatches SET_COST_RANGE_MAX  
**Then** the reducer handles it:

```typescript
case ACTIONS.SET_COST_RANGE_MAX:
  return {
    ...state,
    searchState: {
      ...state.searchState,
      costRangeMax: action.payload as number | null
    }
  }
```

**And** the behavior is:
- **Payload type:** `number | null` (numeric maximum or null to remove)
- **Effect:** Updates only `searchState.costRangeMax`, preserves search term and min
- **Persistence:** NOT saved to localStorage (session-only)
- **Validation:** No validation in reducer (components validate in AC7)
- **Example usage:**
  ```typescript
  dispatch({ type: ACTIONS.SET_COST_RANGE_MAX, payload: 50 })
  // state.searchState.costRangeMax becomes 50
  
  dispatch({ type: ACTIONS.SET_COST_RANGE_MAX, payload: null })
  // state.searchState.costRangeMax becomes null (removes maximum)
  ```

**And** accepted values are:
- ✅ `null` (no maximum — filter inactive)
- ✅ `100` (maximum of $100)
- ✅ `99.99` (decimals allowed)
- ✅ Any positive number

---

### AC7: RESET_ALL_FILTERS Action Handler

**Given** I need to clear all search and filter criteria at once  
**When** a component dispatches RESET_ALL_FILTERS  
**Then** the reducer handles it:

```typescript
case ACTIONS.RESET_ALL_FILTERS:
  return {
    ...state,
    searchState: {
      searchTerm: '',
      costRangeMin: null,
      costRangeMax: null
    }
  }
```

**And** the behavior is:
- **Payload:** None (action.payload ignored)
- **Effect:** Resets ALL search/filter state to initial defaults
- **Persistence:** NOT saved to localStorage (session-only)
- **Validation:** No validation (simple reset)
- **Example usage:**
  ```typescript
  // Before: searchState has active filters
  // state.searchState = { searchTerm: 'netflix', costRangeMin: 5, costRangeMax: 20 }
  
  dispatch({ type: ACTIONS.RESET_ALL_FILTERS })
  
  // After: all filters cleared
  // state.searchState = { searchTerm: '', costRangeMin: null, costRangeMax: null }
  ```

**And** this action preserves subscriptions and error state:
```typescript
// Example: subscriptions and error unchanged
const state = {
  subscriptions: [/* 10 subs */],
  error: null,
  searchState: { searchTerm: 'netflix', costRangeMin: 10, costRangeMax: 20 }
}

dispatch({ type: ACTIONS.RESET_ALL_FILTERS })

// Result: Only searchState reset, subscriptions and error unchanged
{
  subscriptions: [/* still 10 subs */],
  error: null,
  searchState: { searchTerm: '', costRangeMin: null, costRangeMax: null }
}
```

---

### AC8: State Immutability & Reducer Purity

**Given** I'm implementing the reducer handlers  
**When** I update searchState  
**Then** I must maintain immutability:

```typescript
// ✅ CORRECT: Create new objects
case ACTIONS.SET_SEARCH_TERM:
  return {
    ...state,
    searchState: {
      ...state.searchState,
      searchTerm: action.payload
    }
  }

// ❌ WRONG: Mutating existing state
case ACTIONS.SET_SEARCH_TERM:
  state.searchState.searchTerm = action.payload  // Mutation — don't do this!
  return state
```

**And** all reducer handlers are pure functions:
- No side effects (no API calls, no localStorage writes for search state)
- No randomness (deterministic output for given input)
- Same input always produces same output
- No direct DOM manipulation
- No external state modification

**And** existing handlers (ADD_SUBSCRIPTION, UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION) that call `saveSubscriptionsToStorage()` are allowed (these persist subscription data only, not search state)

---

### AC9: useSubscriptions Hook Extended

**Given** I have the extended SubscriptionContext (this story) and useSubscriptions hook exists (Story 2.4)  
**When** I update the useSubscriptions hook in `src/hooks/useSubscriptions.ts`  
**Then** it now exposes search/filter dispatchers:

```typescript
export function useSubscriptions() {
  const context = useContext(SubscriptionContext)
  
  if (!context) {
    throw new Error('useSubscriptions must be used within SubscriptionProvider')
  }
  
  // Return existing properties (unchanged)
  return {
    subscriptions: context.subscriptions,
    error: context.error,
    
    // Return searchState (new for this story)
    searchState: context.searchState,
    
    // Existing dispatchers (unchanged)
    addSubscription: (sub: Subscription) => dispatch(...),
    updateSubscription: (id: string, updates: Partial<Subscription>) => dispatch(...),
    deleteSubscription: (id: string) => dispatch(...),
    setError: (msg: string) => dispatch(...),
    
    // NEW: Search/filter dispatchers (added by this story)
    setSearchTerm: (term: string) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term })
    },
    setCostRangeMin: (min: number | null) => {
      dispatch({ type: ACTIONS.SET_COST_RANGE_MIN, payload: min })
    },
    setCostRangeMax: (max: number | null) => {
      dispatch({ type: ACTIONS.SET_COST_RANGE_MAX, payload: max })
    },
    resetAllFilters: () => {
      dispatch({ type: ACTIONS.RESET_ALL_FILTERS })
    }
  }
}
```

**And** all dispatchers are properly typed  
**And** the hook still throws error if used outside SubscriptionProvider  
**And** TypeScript strict mode shows no errors

---

### AC10: No localStorage Persistence for Search State

**Given** I'm implementing search/filter state management  
**When** any search/filter action is dispatched  
**Then**:

- ✅ Search/filter state updates in memory (React context)
- ✅ Changes visible immediately to all subscribed components
- ❌ NO localStorage.getItem for search state
- ❌ NO localStorage.setItem for search state
- ❌ NO localStorage.removeItem for search state
- ❌ Search state does NOT survive page refresh (session-only)

**And** this is documented in code comments:

```typescript
// Search and filter state are session-only (not persisted)
// Rationale: Temporary UI state; users expect filters to reset on new session
// Subscriptions persist, but filter criteria do not
export interface SearchState {
  searchTerm: string              // Session-only
  costRangeMin: number | null     // Session-only
  costRangeMax: number | null     // Session-only
}
```

**And** only Subscription data persists:

```typescript
// Subscription data DOES persist (saveSubscriptionsToStorage called on mutations)
case ACTIONS.ADD_SUBSCRIPTION:
  const updated = [...state.subscriptions, action.payload]
  saveSubscriptionsToStorage(updated)  // ← Subscriptions persist
  return { ...state, subscriptions: updated, searchState: state.searchState }
  // searchState is preserved but NOT persisted
```

---

### AC11: TypeScript Strict Mode Compliance

**Given** I've extended SubscriptionContext and updated useSubscriptions  
**When** I run TypeScript compiler  
**Then**:

```bash
npm run build
# Expected: No errors, zero warnings in tsconfig strict mode
# Strict mode enabled: strict: true (all checks active)
```

**And** no `@ts-ignore` comments needed  
**And** all types are properly inferred or explicitly declared  
**And** useContext type is properly narrowed  
**And** action payloads have correct types  
**And** Dispatch type properly reflects new actions

---

### AC12: Backward Compatibility

**Given** I'm extending existing Context  
**When** I add searchState to SubscriptionState  
**Then**:

- ✅ Existing code using `state.subscriptions` still works
- ✅ Existing code using `state.error` still works
- ✅ Existing dispatchers (addSubscription, etc.) still work
- ✅ No breaking changes to existing components
- ✅ Existing tests still pass

**And** initialState properly initializes searchState:

```typescript
const initialState: SubscriptionState = {
  subscriptions: [],
  error: null,
  searchState: {  // NEW field properly initialized
    searchTerm: '',
    costRangeMin: null,
    costRangeMax: null
  }
}
```

**And** when existing action handlers (ADD_SUBSCRIPTION, etc.) return state, they preserve searchState:

```typescript
case ACTIONS.ADD_SUBSCRIPTION:
  // ...
  return {
    subscriptions: updated,
    error: null,
    searchState: state.searchState  // ← Preserved
  }
```

---

## 👨‍💻 DEVELOPER CONTEXT

### What This Story Extends
This story extends Story 2.3 (SubscriptionContext with useReducer) by adding a new search/filter state layer. It's similar to AC2 but specifically for search/filter features.

**Current SubscriptionContext structure (from Story 2.3):**
```typescript
interface SubscriptionState {
  subscriptions: Subscription[]
  error: string | null
}
```

**After this story, it becomes:**
```typescript
interface SubscriptionState {
  subscriptions: Subscription[]      // Existing: subscription data
  error: string | null               // Existing: error state
  searchState: SearchState            // NEW: search/filter state
}

interface SearchState {
  searchTerm: string                  // NEW: name search text
  costRangeMin: number | null         // NEW: minimum cost filter
  costRangeMax: number | null         // NEW: maximum cost filter
}
```

### State Flow Architecture
```
User Input (SearchBar, CostRangeFilter components)
        ↓
dispatch({ type: SET_SEARCH_TERM, payload: ... })
        ↓
subscriptionReducer (this story: extends reducer with new cases)
        ↓
context.Provider (state updated)
        ↓
useSubscriptions hook (returns new searchState + dispatchers)
        ↓
Components re-render with new filter values (Stories 11.4-11.6)
        ↓
useFilteredSubscriptions hook (Story 11.4: applies filters to subscriptions)
        ↓
SubscriptionList displays filtered results
```

### Reducer Architecture Pattern
This story follows the same pattern established in Story 2.3:

**Pattern:**
```typescript
function subscriptionReducer(state, action) {
  switch(action.type) {
    case ACTION_TYPE:
      // 1. Compute new state
      // 2. Call saveSubscriptionsToStorage() if needed
      // 3. Return new state object (immutable)
    default:
      return state  // Invalid actions return unchanged state
  }
}
```

**This story adds:**
- 4 new case blocks (SET_SEARCH_TERM, SET_COST_RANGE_MIN, SET_COST_RANGE_MAX, RESET_ALL_FILTERS)
- No localStorage persistence for any of these (unlike subscription mutations)
- Immutability maintained through spread operators and new object creation

### Hook Extension Pattern
The useSubscriptions hook (Story 2.4) is extended to expose new dispatchers:

**Pattern:**
```typescript
export function useSubscriptions() {
  const context = useContext(SubscriptionContext)
  
  return {
    // Existing: data accessors
    subscriptions: context.subscriptions,
    error: context.error,
    
    // Existing: action dispatchers
    addSubscription: (sub) => dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: sub }),
    
    // NEW: search/filter data accessors (this story)
    searchState: context.searchState,
    
    // NEW: search/filter dispatchers (this story)
    setSearchTerm: (term) => dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term }),
    // ... etc
  }
}
```

**Benefit:** Components can import useSubscriptions() once and get everything they need:
```typescript
// In SearchBar component (Story 11.2)
const { searchState, setSearchTerm } = useSubscriptions()
// That's it — no need for separate useContext calls
```

### Previous Story Intelligence (Story 2.3)
From Story 2.3 (SubscriptionContext), key learnings:

1. **Always use ACTIONS constant for action types** — Never hardcode strings like `'ADD_SUBSCRIPTION'`
2. **Preserve state immutability** — Use spread operators, don't mutate
3. **Call saveSubscriptionsToStorage() only for subscription mutations** — Not for UI state
4. **Initialize state with all fields** — Don't lazy-initialize; set defaults upfront
5. **Error handling in reducer** — Catch errors in side effects (localStorage), don't crash
6. **Type safety** — Use TypeScript interfaces for state and actions; no `any` types

### Files Modified by This Story
| File | Change | Impact |
|------|--------|--------|
| `src/context/SubscriptionContext.tsx` | Extend SubscriptionState, add SearchState interface, add 4 action handlers to reducer | Core state management |
| `src/constants.ts` | Add 4 new action types to ACTIONS | Action dispatching throughout app |
| `src/hooks/useSubscriptions.ts` | Add searchState accessor, add 4 new dispatchers | Hook-based access in components |

**No other files are modified** (UI components come in Stories 11.2+)

### Testing Strategy (Story 11.8 will implement)
This story's reducer logic will be tested by:

```typescript
// tests/context/SubscriptionContext.test.ts
describe('subscriptionReducer - Search/Filter Actions', () => {
  test('SET_SEARCH_TERM updates search term only', () => {
    const initialState = { subscriptions: [], error: null, searchState: {...} }
    const action = { type: ACTIONS.SET_SEARCH_TERM, payload: 'netflix' }
    const result = subscriptionReducer(initialState, action)
    expect(result.searchState.searchTerm).toBe('netflix')
    expect(result.searchState.costRangeMin).toBe(null)  // unchanged
  })
  
  test('RESET_ALL_FILTERS clears all criteria', () => {
    // ... test
  })
  // ... more tests
})
```

---

## 🏗️ TECHNICAL REQUIREMENTS

### Technologies & Versions (REQUIRED)
| Technology | Version | Usage |
|-----------|---------|-------|
| React | 19+ | Context API, useContext, useReducer |
| TypeScript | 6.0+ | Type safety, interfaces, strict mode |
| Node.js | 20.19+ or 22.12+ | Runtime, npm |

### Code Patterns to Follow

**1. Action Type References (CRITICAL)**
```typescript
// ✅ CORRECT: Use ACTIONS constant
import { ACTIONS } from '../constants'

dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: 'netflix' })

// ❌ WRONG: Hardcoded strings
dispatch({ type: 'SET_SEARCH_TERM', payload: 'netflix' })
dispatch({ type: 'setSearchTerm', payload: 'netflix' })
```

**2. State Immutability Pattern**
```typescript
// ✅ CORRECT: Create new objects
case ACTIONS.SET_SEARCH_TERM:
  return {
    ...state,                              // Shallow copy of entire state
    searchState: {
      ...state.searchState,                // Shallow copy of searchState
      searchTerm: action.payload           // Update only this field
    }
  }

// ❌ WRONG: Mutating existing objects
case ACTIONS.SET_SEARCH_TERM:
  state.searchState.searchTerm = action.payload
  return state

// ❌ WRONG: Not spreading upper state
case ACTIONS.SET_SEARCH_TERM:
  return {
    searchState: {
      searchTerm: action.payload,
      costRangeMin: state.searchState.costRangeMin,
      costRangeMax: state.searchState.costRangeMax
    }
    // Missing subscriptions and error fields!
  }
```

**3. Hook Pattern for Dispatchers**
```typescript
// ✅ CORRECT: Hide dispatch complexity in hook
export function useSubscriptions() {
  const context = useContext(SubscriptionContext)
  const [, dispatch] = useState(() => getDispatch(context)) // Or store dispatch
  
  return {
    searchState: context.searchState,
    setSearchTerm: (term: string) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term })
    }
    // Component uses: const { setSearchTerm } = useSubscriptions()
    //                 setSearchTerm('netflix')  ← Simple API
  }
}

// ❌ WRONG: Exposing raw dispatch to components
return {
  dispatch  // Components must know action types
}
// Component uses: dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: 'netflix' })
```

### Project Architecture Context

**From project-context.md:**
- **State Management:** useReducer + React Context (exact pattern we're extending)
- **Component Architecture:** Atomic + Hooks (all logic in hooks, components are presentation)
- **Naming Conventions:** 
  - Files: PascalCase for components (.tsx), camelCase for hooks/utils (.ts)
  - Constants: UPPER_SNAKE_CASE (ACTIONS constant already follows this)
  - Action types: UPPER_SNAKE_CASE (SET_SEARCH_TERM, not setSearchTerm)
- **No direct mutations:** Always dispatch actions through Context
- **Error Handling:** Wrap ALL localStorage operations in try-catch (this story: no localStorage for search state)

---

## 🚀 IMPLEMENTATION WORKFLOW

### Step 1: Update ACTIONS Constant
```bash
# File: src/constants.ts
# Add 4 new entries to ACTIONS object
SET_SEARCH_TERM: 'SET_SEARCH_TERM'
SET_COST_RANGE_MIN: 'SET_COST_RANGE_MIN'
SET_COST_RANGE_MAX: 'SET_COST_RANGE_MAX'
RESET_ALL_FILTERS: 'RESET_ALL_FILTERS'
```

**Verify:**
- All 4 constants present
- Spelling matches reducer case blocks exactly
- Exported from constants.ts
- No typos or case mismatches

### Step 2: Extend SubscriptionContext Types
```bash
# File: src/context/SubscriptionContext.tsx

# Add SearchState interface with 3 fields
# Extend SubscriptionState to include searchState: SearchState
# Update initialState object with searchState initialization
```

**Verify:**
- SearchState interface defined
- SubscriptionState includes searchState field
- initialState sets searchState with defaults
- TypeScript shows no errors

### Step 3: Add Reducer Action Handlers
```bash
# File: src/context/SubscriptionContext.tsx

# Add 4 case blocks to subscriptionReducer:
  case ACTIONS.SET_SEARCH_TERM:
    # Spread state and searchState, update only searchTerm
    
  case ACTIONS.SET_COST_RANGE_MIN:
    # Spread state and searchState, update only costRangeMin
    
  case ACTIONS.SET_COST_RANGE_MAX:
    # Spread state and searchState, update only costRangeMax
    
  case ACTIONS.RESET_ALL_FILTERS:
    # Return new searchState with all defaults
```

**Verify:**
- All 4 cases present
- Each maintains immutability (spreads objects)
- No localStorage writes for search state
- Existing handlers still preserve searchState

### Step 4: Update useSubscriptions Hook
```bash
# File: src/hooks/useSubscriptions.ts

# Add to return object:
searchState: context.searchState                          # Data accessor
setSearchTerm: (term) => dispatch(...)                   # Dispatcher
setCostRangeMin: (min) => dispatch(...)                 # Dispatcher
setCostRangeMax: (max) => dispatch(...)                 # Dispatcher
resetAllFilters: () => dispatch(...)                     # Dispatcher
```

**Verify:**
- All 4 dispatchers present
- searchState accessor returns context.searchState
- Dispatchers have correct signatures
- TypeScript shows no errors

### Step 5: Test & Verify
```bash
cd {project-root}/subscription-tracker

# Build & type check
npm run build

# Should output: "Build completed successfully"
# Should show: "TypeScript compilation: 0 errors"
```

**Verify:**
- No TypeScript errors
- No console warnings
- Build succeeds
- All files compile

---

## ✅ DEFINITION OF DONE

**Story 11.1 is complete when:**

1. ✅ `src/constants.ts` has 4 new ACTIONS (SET_SEARCH_TERM, SET_COST_RANGE_MIN, SET_COST_RANGE_MAX, RESET_ALL_FILTERS)
2. ✅ `src/context/SubscriptionContext.tsx`:
   - SearchState interface exported
   - SubscriptionState includes searchState field
   - initialState properly initializes searchState
   - 4 new case blocks in reducer (one for each action)
   - All handlers maintain immutability
   - No localStorage writes for search state
3. ✅ `src/hooks/useSubscriptions.ts` exports:
   - searchState accessor
   - setSearchTerm, setCostRangeMin, setCostRangeMax, resetAllFilters dispatchers
   - All properly typed
4. ✅ `npm run build` succeeds with zero TypeScript errors
5. ✅ No breaking changes to existing code (backward compatible)
6. ✅ Code follows project conventions (PascalCase files, camelCase functions, UPPER_SNAKE_CASE actions)
7. ✅ Comments document that search/filter state is session-only (not persisted)
8. ✅ Story file created in implementation-artifacts (ready for next story)

---

## 📚 REFERENCE DOCUMENTATION

### File Locations
- **Constants:** [src/constants.ts](../subscription-tracker/src/constants.ts)
- **Context:** [src/context/SubscriptionContext.tsx](../subscription-tracker/src/context/SubscriptionContext.tsx)
- **Hook:** [src/hooks/useSubscriptions.ts](../subscription-tracker/src/hooks/useSubscriptions.ts)

### Related Stories
- **Previous (depends on):** [Story 2.3 - Create SubscriptionContext](./2-3-create-subscriptioncontext-with-usereducer.md)
- **Previous (depends on):** [Story 2.4 - Create useSubscriptions Hook](./2-4-create-usesubscriptions-custom-hook.md)
- **Next:** [Story 11.2 - Create SearchBar Component](./11-2-create-searchbar-component.md)
- **Next:** [Story 11.3 - Create CostRangeFilter Component](./11-3-create-costrangefilter-component.md)

### Project Context
- **Architecture:** [architecture.md](../planning-artifacts/architecture.md)
- **Project Context:** [project-context.md](../../docs/project-context.md)
- **Naming Conventions:** See project-context.md § Naming Conventions

### Key Learning from Previous Stories
From Story 2.3 (SubscriptionContext):
- Always use ACTIONS constant; never hardcode action strings
- Maintain immutability with spread operators
- Initialize all state fields upfront
- Only saveSubscriptionsToStorage() on subscription mutations, not UI state

---

## 🎯 SUCCESS METRICS

**Developer Success:**
- Story completed without TypeScript errors
- No breaking changes to existing components
- Code follows established patterns (Story 2.3 precedent)
- All acceptance criteria met

**Component Readiness:**
- SearchBar component (Story 11.2) can immediately dispatch `setSearchTerm()`
- CostRangeFilter component (Story 11.3) can immediately dispatch `setCostRangeMin()`/`setCostRangeMax()`
- useFilteredSubscriptions hook (Story 11.4) can read from `useSubscriptions().searchState`

**Code Quality:**
- TypeScript strict mode: 0 errors
- Immutability maintained throughout
- No side effects in reducer
- Session-only state (not persisted) is properly documented

---

**Story Status: READY FOR DEVELOPMENT**

Developer can now begin implementation. All context, dependencies, and acceptance criteria are defined. Next: Developer runs Story 11.1 implementation, then proceeds to Stories 11.2-11.7 for UI components and filtering logic.
