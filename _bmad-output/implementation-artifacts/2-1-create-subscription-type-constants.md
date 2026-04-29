---
story_id: "2.1"
story_key: "2-1-create-subscription-type-constants"
epic: "2"
epic_title: "State Management & Data Persistence"
status: "done"
created: "2026-04-29"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
implementation_date: "2026-04-29"
code_review_date: "2026-04-29"
code_review_status: "approved"
---

# Story 2.1: Create Subscription Type & Constants

**Epic:** State Management & Data Persistence (Epic 2)  
**Story ID:** 2.1  
**Status:** ready-for-dev  
**Sequence:** First story in Epic 2; follows all Epic 1 stories  
**Blocks:** Stories 2.2, 2.3, 2.4 (all depend on types and constants)  
**Priority:** CRITICAL — Establishes type definitions and constants used throughout the project

---

## Story Statement

**As a** developer,  
**I want** to create TypeScript types for Subscription objects and action constants,  
**So that** the state management layer has type safety and uses consistent action types throughout the application.

---

## Acceptance Criteria

### AC1: Subscription Type Definition

**Given** I have the project structure from Epic 1 completed  
**When** I create `src/types/subscription.ts`  
**Then** it exports a `Subscription` interface with these exact properties:

```typescript
export interface Subscription {
  id: string;              // UUID (unique identifier)
  name: string;            // Subscription name (required)
  cost: number;            // Cost in USD (required, positive)
  dueDate: number;         // Day of month: 1-31 (required)
  createdAt: number;       // Timestamp when created (required, never modified)
  updatedAt: number;       // Timestamp when last updated (required, updated on edit)
}
```

**And** the type is properly exported so other files can import it:
```typescript
import { Subscription } from '../types/subscription';
```

### AC2: Subscription Type Validation

**Given** the Subscription type is created  
**When** I review the type definition  
**Then** these requirements are met:

- ✅ `id` is `string` (will be UUID format)
- ✅ `name` is `string` (will be 1-100 chars in validation layer)
- ✅ `cost` is `number` (not string; will be positive in validation layer)
- ✅ `dueDate` is `number` (1-31, day of month; not Date object)
- ✅ `createdAt` is `number` (milliseconds since epoch; immutable)
- ✅ `updatedAt` is `number` (milliseconds since epoch; changes on edit)
- ✅ All fields are required (no optional fields `?`)

**And** the type matches the data structure documented in project-context.md

### AC3: Action Types Constants

**Given** I have the Subscription type  
**When** I create `src/constants.ts` in the project root  
**Then** it exports an `ACTIONS` constant with these exact keys:

```typescript
export const ACTIONS = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_ERROR: 'SET_ERROR',
} as const;
```

**And** each action type is a string literal (not a number or enum)  
**And** the constant is typed with `as const` to enable type inference

### AC4: Action Type Usage Pattern

**Given** the ACTIONS constant is created  
**When** I verify the pattern  
**Then** these requirements are met:

- ✅ ACTIONS is a frozen object (used with `as const`)
- ✅ Each action type is uppercase snake_case
- ✅ Action types map to reducer actions (will be used in Story 2.3)
- ✅ No additional action types are defined here (only these 5)
- ✅ Other files can import and use: `import { ACTIONS } from '../constants'`

### AC5: Global Constants

**Given** I have action types defined  
**When** I verify `src/constants.ts` includes global constants  
**Then** it also exports these constants used throughout the app:

```typescript
export const STORAGE_KEY = 'subscriptions';      // localStorage key (exact spelling)
export const FUZZY_MATCH_THRESHOLD = 0.85;       // 85% similarity for duplicate detection
export const MAX_SUBSCRIPTION_NAME_LENGTH = 100; // Maximum name length
```

**And** these constants are used consistently by:
- localStorage operations (will use STORAGE_KEY)
- Duplicate prevention (will use FUZZY_MATCH_THRESHOLD)
- Form validation (will use MAX_SUBSCRIPTION_NAME_LENGTH)

### AC6: Type Exports & Imports

**Given** all types and constants are created  
**When** I verify the export structure  
**Then** these imports work correctly:

```typescript
// Import type
import { Subscription } from '../types/subscription';

// Import constants
import { ACTIONS, STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH } from '../constants';

// Import action types from constants
import type { ACTIONS } from '../constants';
```

**And** no TypeScript errors appear when using these imports in other files

### AC7: TypeScript Strict Mode Compliance

**Given** strict mode is enabled from Story 1.2  
**When** I create these type files  
**Then** TypeScript compiler:
- Shows no errors on these files
- Enforces exact types (no `any` or implicit types)
- Allows strict type checking when these types are used

**And** if I intentionally introduce a type error (e.g., `const x: Subscription = { id: 'wrong' }`):
- TypeScript shows error: "Property 'name' is missing"
- Fixing the error makes it disappear

---

## Developer Context & Architecture

### Type System Foundation

This story establishes the **single source of truth** for subscription data shape throughout the entire application. Every component, hook, and utility that works with subscriptions will use this `Subscription` type.

**Why this matters:**

1. **Type Safety** — Any code that misuses subscription data (wrong property, wrong type) is caught at compile time
2. **Consistency** — All files agree on exactly what a subscription looks like
3. **Refactoring Safety** — If we ever change the data shape, TypeScript shows all places that need updates
4. **Developer Confidence** — IDE autocomplete shows all available properties

### Subscription Data Structure (From Architecture)

**Source:** [docs/project-context.md#data-fields](../../../docs/project-context.md#data-fields)

```typescript
{
  id: string                    // UUID
  name: string                  // Subscription name
  cost: number                  // USD amount
  dueDate: number              // Day of month (1-31)
  createdAt: number            // Timestamp
  updatedAt: number            // Timestamp
}
```

**Why these fields?**

- **id** — Unique identifier for each subscription (generated with UUID library in Story 2.2+)
- **name** — What the user enters (e.g., "Netflix", "Gym Membership")
- **cost** — Monthly cost in dollars (stored as number, not string; validation adds constraints)
- **dueDate** — Day of month (1-31) when user is charged (determines filtering logic)
- **createdAt** — Never changes; used for audit trail and sorting
- **updatedAt** — Changes every time subscription is modified; shows when user last updated it

**Why `number` for dueDate (not `Date`)?**

- User enters day of month (1-31), not a full date
- Storing as number is simpler: filtering for "this month" is just comparing numbers
- Date objects would overcomplicate: "what year?" + timezone handling
- localStorage serialization is simpler with primitives

**Why separate createdAt and updatedAt?**

- Audit trail: know when subscription was created vs. when it was last changed
- UI enhancement: can show "created 6 months ago" vs. "updated yesterday"
- Subscription tracking: can detect inactive subscriptions
- Story 4.3 specifically updates `updatedAt` on edit while preserving `createdAt`

### Action Types (Reducer Actions)

**Source:** [docs/project-context.md#action-types](../../../docs/project-context.md#action-types)

```typescript
const ACTIONS = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_ERROR: 'SET_ERROR',
}
```

**When are these used?**

- **SET_SUBSCRIPTIONS** — Load all subscriptions from localStorage on app start (Story 2.5)
- **ADD_SUBSCRIPTION** — User submits form to create new subscription (Story 3.3)
- **UPDATE_SUBSCRIPTION** — User edits existing subscription (Story 4.1)
- **DELETE_SUBSCRIPTION** — User confirms deletion (Story 4.2)
- **SET_ERROR** — Any operation sets error message for display (Story 8.1+)

**Pattern rule:** Only these 5 action types should ever be used. Creating new action types later is a sign the architecture needs discussion.

### Global Constants Usage

**Source:** [docs/project-context.md#naming-conventions](../../../docs/project-context.md#naming-conventions)

| Constant | Value | Used By | Why |
|----------|-------|---------|-----|
| **STORAGE_KEY** | `'subscriptions'` | localStorage operations (Story 2.2) | Single source of truth; prevents typos |
| **FUZZY_MATCH_THRESHOLD** | `0.85` | Duplicate prevention (Story 7.2) | If similarity > 85%, flag as potential duplicate |
| **MAX_SUBSCRIPTION_NAME_LENGTH** | `100` | Form validation (Story 7.4) | Prevents excessively long names; good UX |

**Why constants instead of magic strings/numbers?**

- Single source of truth: if threshold needs to change, update one place
- Self-documenting: `FUZZY_MATCH_THRESHOLD` is clearer than `0.85` scattered in code
- Prevents typos: `'subscriptions'` is typed in one place, used via constant elsewhere
- Easier testing: mock constants in tests

### Type Safety Benefits for This Project

**Example 1: Preventing Name Collisions**

Without type, you might accidentally use `dueDay` instead of `dueDate`:
```typescript
// ❌ Without type - silently fails
const sub = { id: '123', name: 'Netflix', cost: 9.99, dueDay: 15 }; // Wrong!
```

With type, TypeScript catches it:
```typescript
// ✅ With type - compiler error
const sub: Subscription = { id: '123', name: 'Netflix', cost: 9.99, dueDay: 15 };
// Error: Property 'dueDate' is missing
```

**Example 2: Preventing Property Access Errors**

Without type, you might try to access a property that doesn't exist:
```typescript
// ❌ Without type - fails at runtime
function getMonth(sub: any) {
  return sub.dueMonth; // Typo! Should be dueDate
}
```

With type, TypeScript catches it:
```typescript
// ✅ With type - compiler error
function getMonth(sub: Subscription) {
  return sub.dueMonth; // Error: Property 'dueMonth' does not exist
}
```

---

## Critical Implementation Notes

### Current State (After Epic 1)

After completing all Epic 1 stories, your project has:
- ✅ Vite + React + TypeScript initialized
- ✅ TypeScript strict mode enabled
- ✅ Project directory structure created
- ✅ Global CSS setup (Story 1.4)
- ✅ React Hook Form installed (Story 1.3)
- ⏭️ NO types defined yet
- ⏭️ NO constants defined yet
- ⏭️ NO state management yet

### What This Story DOES

1. ✅ **Create Subscription type** — `src/types/subscription.ts`
2. ✅ **Create action constants** — `src/constants.ts` (ACTIONS)
3. ✅ **Create global constants** — `src/constants.ts` (STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH)
4. ✅ **Verify TypeScript compilation** — No errors with strict mode

### What This Story DOES NOT DO

- ❌ NOT implementing state management (that's Story 2.3, 2.4)
- ❌ NOT creating localStorage operations (that's Story 2.2)
- ❌ NOT creating components (that's Epic 3)
- ❌ NOT using these types yet (they're just definitions; usage comes in following stories)

### Dependencies & Prerequisites

**Must be completed before this story:**
- ✅ Epic 1: All stories (project structure, TypeScript config)

**This story must be completed before:**
- Story 2.2: localStorage utility functions (uses STORAGE_KEY constant)
- Story 2.3: SubscriptionContext (uses Subscription type and ACTIONS)
- Story 2.4: useSubscriptions hook (uses Subscription type)
- All subsequent stories (all depend on these types)

---

## Implementation Checklist

### Step 1: Create Subscription Type File

**File:** `src/types/subscription.ts`

**Purpose:** Define the shape of a Subscription object

**Content:**
```typescript
/**
 * Subscription represents a single subscription tracked by the user.
 * 
 * All fields are required (no optional fields).
 * Timestamps are milliseconds since epoch (use Date.now() to set them).
 * 
 * Example:
 * {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Netflix",
 *   cost: 15.99,
 *   dueDate: 15,
 *   createdAt: 1730204400000,
 *   updatedAt: 1730204400000
 * }
 */
export interface Subscription {
  id: string;              // UUID (unique identifier)
  name: string;            // Subscription name (required, 1-100 chars after validation)
  cost: number;            // Cost in USD (required, positive number after validation)
  dueDate: number;         // Day of month: 1-31 (required)
  createdAt: number;       // Timestamp when created (milliseconds, immutable)
  updatedAt: number;       // Timestamp when last updated (milliseconds, changes on edit)
}
```

**Verification:**
```bash
# Run TypeScript compiler to verify no errors
npm run build
# or
npx tsc --noEmit
```

Expected: No errors

---

### Step 2: Create Constants File

**File:** `src/constants.ts` (in project root, same level as src/)

**Purpose:** Define all constants used throughout the application

**Content:**
```typescript
/**
 * Application Constants
 * 
 * Single source of truth for magic strings, numbers, and configuration values
 * used throughout the subscription tracker.
 * 
 * These are frozen objects/values (immutable at runtime) and use string literals
 * for type safety with TypeScript's 'as const' operator.
 */

// ============================================================================
// ACTION TYPES (used by SubscriptionContext reducer in Story 2.3)
// ============================================================================

/**
 * Redux-style action types for the subscription state reducer.
 * 
 * Use only these action types when dispatching to SubscriptionContext.
 * Never create custom action types.
 * 
 * Usage in reducer (Story 2.3):
 *   dispatch({ type: ACTIONS.ADD_SUBSCRIPTION, payload: newSubscription })
 * 
 * Usage in useSubscriptions hook (Story 2.4):
 *   dispatch({ type: ACTIONS.DELETE_SUBSCRIPTION, payload: subscriptionId })
 */
export const ACTIONS = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',       // Load all subscriptions from storage
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',         // Create new subscription
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',   // Edit existing subscription
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',   // Remove subscription
  SET_ERROR: 'SET_ERROR',                       // Set error message for display
} as const;

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

/**
 * localStorage key for persisting subscriptions
 * 
 * Value: exactly 'subscriptions' (lowercase, no prefix)
 * 
 * Used by (Story 2.2):
 *   localStorage.getItem(STORAGE_KEY)
 *   localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
 */
export const STORAGE_KEY = 'subscriptions';

// ============================================================================
// FORM & VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum length for subscription name
 * 
 * Value: 100 characters
 * 
 * Used by (Story 7.4):
 *   Form validation: maxLength constraint
 *   Error message: "Name must be 100 characters or less"
 */
export const MAX_SUBSCRIPTION_NAME_LENGTH = 100;

/**
 * Threshold for fuzzy name matching (duplicate prevention)
 * 
 * Value: 0.85 (85% similarity)
 * 
 * When user tries to add "Netflix", app checks existing subscriptions:
 *   - If "Netflix" matches existing subscription 85%+ similar, warn user
 *   - Threshold prevents false positives (e.g., "Netflix" vs "Hulu" = ~50%)
 *   - Threshold allows typos (e.g., "Netflx" vs "Netflix" = ~95%)
 * 
 * Used by (Story 7.2):
 *   useFuzzyMatch hook: compare new name against existing names
 *   Duplicate prevention validation: flag warnings
 */
export const FUZZY_MATCH_THRESHOLD = 0.85;
```

**Verification:**
```bash
# Run TypeScript compiler to verify no errors
npm run build
# or
npx tsc --noEmit
```

Expected: No errors

---

### Step 3: Verify Imports Work Correctly

**Test in your IDE or create temporary test file:**

```typescript
// Test import from types
import { Subscription } from './src/types/subscription';

// Test import from constants
import { ACTIONS, STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH } from './src/constants';

// Test type usage
const testSub: Subscription = {
  id: '123',
  name: 'Netflix',
  cost: 15.99,
  dueDate: 15,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Test constant usage
const key = STORAGE_KEY; // Should be 'subscriptions'
const threshold = FUZZY_MATCH_THRESHOLD; // Should be 0.85
const actionType = ACTIONS.ADD_SUBSCRIPTION; // Should be 'ADD_SUBSCRIPTION'

console.log('All imports working correctly!');
```

**Expected result:**
- No TypeScript errors
- IDE autocomplete suggests properties and methods
- All imports resolve correctly

---

### Step 4: Run Final Verification

**Command:**
```bash
npm run build
```

**Expected output:**
```
vite v6.x.x building for production...
✓ 15 modules transformed.
dist/index.html    0.45 kB
dist/assets/index-xxx.js  180.32 kB
dist/assets/index-xxx.css 2.10 kB
✓ built in 1.23s
```

**Verification:**
- ✅ Build completes with no errors
- ✅ dist/ folder is created
- ✅ TypeScript compiler shows no issues
- ✅ No warnings about unused types or constants

---

## Code Organization

### File Structure After This Story

```
subscription-tracker/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── subscription.ts              ← NEW: Subscription interface
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── src/
│   └── constants.ts                    ← NEW: Action types and constants
├── public/
├── vite.config.ts
├── tsconfig.json
├── package.json
└── index.html
```

---

## Testing & Validation

### Manual Verification

After creating the files, verify:

1. **Files exist:**
   ```bash
   ls -la src/types/subscription.ts    # Should exist
   ls -la src/constants.ts              # Should exist
   ```

2. **Imports work:**
   ```typescript
   // In any component or utility file, try importing:
   import { Subscription } from '../types/subscription';
   import { ACTIONS, STORAGE_KEY } from '../constants';
   ```
   Expected: No red squiggles in IDE; autocomplete works

3. **TypeScript compilation:**
   ```bash
   npm run build    # Should complete successfully
   ```
   Expected: No errors

4. **Type safety:**
   ```typescript
   // Try this in a file and watch TypeScript catch the error:
   const bad: Subscription = { name: 'Netflix' }; // Missing properties!
   ```
   Expected: Red squiggle; error message lists missing properties

---

## Files Modified/Created

| File | Type | Purpose | Status |
|------|------|---------|--------|
| `src/types/subscription.ts` | ✨ NEW | Subscription type definition | Create |
| `src/constants.ts` | ✨ NEW | Global constants and action types | Create |
| `tsconfig.json` | 📝 NO CHANGE | Already configured in Story 1.2 | Verify |
| `package.json` | 📝 NO CHANGE | No new dependencies needed | Verify |

---

## Tasks & Subtasks

### Task 1: Create Subscription Type File

- [x] Create `src/types/subscription.ts`
  - [x] Export `Subscription` interface with all 6 properties (id, name, cost, dueDate, createdAt, updatedAt)
  - [x] Add JSDoc comments explaining each field
  - [x] Verify TypeScript compilation with `npm run build`
  - [x] Verify imports work in IDE with no errors

### Task 2: Create Constants File

- [x] Create `src/constants.ts`
  - [x] Export `ACTIONS` constant with 5 action types (typed with `as const`)
  - [x] Export `STORAGE_KEY = 'subscriptions'`
  - [x] Export `FUZZY_MATCH_THRESHOLD = 0.85`
  - [x] Export `MAX_SUBSCRIPTION_NAME_LENGTH = 100`
  - [x] Add JSDoc comments explaining each constant's purpose and usage
  - [x] Verify TypeScript compilation with `npm run build`

### Task 3: Verify Type Exports & Imports

- [x] Test import: `import { Subscription } from '../types/subscription'` — no errors
- [x] Test import: `import { ACTIONS, STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH } from '../constants'` — no errors
- [x] IDE autocomplete works for all imports

### Task 4: Run Final Build & Validation

- [x] Run `npm run build` — completes successfully with no errors
- [x] No TypeScript strict mode violations
- [x] All acceptance criteria satisfied

---

## Acceptance Criteria Checklist

- [x] AC1: Subscription type created in `src/types/subscription.ts` with all 6 required properties
- [x] AC2: Subscription type properties have correct TypeScript types (string, number, etc.)
- [x] AC3: ACTIONS constant created in `src/constants.ts` with 5 action types
- [x] AC4: ACTIONS is typed with `as const` for type inference
- [x] AC5: Global constants (STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH) exported from `src/constants.ts`
- [x] AC6: All imports work correctly (no TypeScript errors)
- [x] AC7: TypeScript strict mode compilation shows no errors
- [x] Build completes successfully with `npm run build`
- [x] No red squiggles in IDE for the created files

---

## File List

**Files Created:**
- [x] `src/types/subscription.ts` — NEW (42 lines, Subscription interface with 6 properties)
- [x] `src/constants.ts` — NEW (81 lines, ACTIONS object + STORAGE_KEY + FUZZY_MATCH_THRESHOLD + MAX_SUBSCRIPTION_NAME_LENGTH)

**Build artifacts (auto-generated):**
- `dist/` — Generated on `npm run build`

---

## Change Log

- 2026-04-29 (Implementation): Created Subscription type and application constants
  - `src/types/subscription.ts`: Interface with 6 required properties (id, name, cost, dueDate, createdAt, updatedAt)
  - `src/constants.ts`: ACTIONS constant (5 action types), STORAGE_KEY, FUZZY_MATCH_THRESHOLD, MAX_SUBSCRIPTION_NAME_LENGTH
  - TypeScript strict mode: ✅ No errors
  - Build verification: ✅ Passed

---

## Dev Agent Record

### Implementation Plan

**Approach:** Red-green-refactor with TypeScript strict mode compliance

**Implementation Strategy:**
1. Create `src/types/subscription.ts` with Subscription interface defining all required fields
2. Create `src/constants.ts` with ACTIONS enum-like constant and validation/storage constants
3. Use `as const` on ACTIONS for proper TypeScript type inference
4. Add comprehensive JSDoc comments for developer guidance
5. Verify no TypeScript errors with strict mode enabled

**Technical Decisions:**
- Used interface (not type) for Subscription to allow proper extension in future stories
- Used `as const` on ACTIONS object for literal type inference
- Stored dueDate as `number` (1-31) not Date object per architecture decision
- Included separate createdAt/updatedAt for audit trail capability

### Completion Notes

✅ **Story 2.1 Complete**: All tasks finished, all acceptance criteria satisfied

**What was implemented:**
1. ✅ Subscription type interface with 6 properties: id, name, cost, dueDate, createdAt, updatedAt
2. ✅ ACTIONS constant with 5 action types: SET_SUBSCRIPTIONS, ADD_SUBSCRIPTION, UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, SET_ERROR
3. ✅ Global constants: STORAGE_KEY ('subscriptions'), FUZZY_MATCH_THRESHOLD (0.85), MAX_SUBSCRIPTION_NAME_LENGTH (100)
4. ✅ All files properly documented with JSDoc comments
5. ✅ TypeScript strict mode: No errors detected
6. ✅ Type imports/exports: Working correctly with full IDE autocomplete support

**Validation Results:**
- ✅ TypeScript compilation: No errors (checked with `npx tsc --noEmit`)
- ✅ All 7 acceptance criteria satisfied
- ✅ All 4 tasks with all subtasks marked complete
- ✅ Type safety: Interface enforces all 6 properties required (no optional fields)
- ✅ Import pattern verified: Both type and constant imports work without errors

**Files Modified/Created:** 2 new files, 0 modified, 0 deleted

---

## Next Steps (After This Story)

1. **Story 2.2:** Create localStorage utility functions (uses STORAGE_KEY constant)
2. **Story 2.3:** Create SubscriptionContext with useReducer (uses Subscription type and ACTIONS)
3. **Story 2.4:** Create useSubscriptions hook (uses Subscription type and exports from context)
4. **Story 2.5:** Load subscriptions from storage on app start (uses localStorage utilities)

---

## References

- **Project Context:** [docs/project-context.md](../../../docs/project-context.md#data-fields)
- **Architecture Decision:** [planning-artifacts/architecture.md](../../../_bmad-output/planning-artifacts/architecture.md)
- **Epic Overview:** [Epic 2: State Management & Data Persistence](../planning-artifacts/epics.md#epic-2-state-management--data-persistence)
- **Previous Story:** [Story 1.4: Create Global CSS Setup](1-4-create-global-css-setup-css-variables.md)

---

**Story Created:** 2026-04-29  
**Developer Guide Version:** 1.0  
**Status:** ready-for-dev — All context loaded; ready for implementation

