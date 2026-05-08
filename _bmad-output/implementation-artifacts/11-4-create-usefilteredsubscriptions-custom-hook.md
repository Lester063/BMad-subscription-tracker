---
story_id: "11.4"
story_key: "11-4-create-usefilteredsubscriptions-custom-hook"
epic: "11"
epic_title: "Search & Filter Subscriptions"
status: "ready-for-dev"
created: "2026-05-07"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
priority: "CRITICAL"
estimated_complexity: "medium"
estimated_effort: "2-3 hours"
---

# Story 11.4: Create useFilteredSubscriptions Custom Hook

**Epic:** Search & Filter Subscriptions (Epic 11)  
**Story ID:** 11.4  
**Status:** ready-for-dev  
**Sequence:** Fourth story in Epic 11; builds on Stories 11.1 (search state), 11.2 (SearchBar), 11.3 (CostRangeFilter)  
**Depends On:** Story 11.1 (SearchState with searchTerm, costRangeMin, costRangeMax must exist in context), Story 2.4 (useSubscriptions hook exists)  
**Blocks:** Story 11.6 (Dashboard integration must use useFilteredSubscriptions to pass filtered results), Story 11.5 (refactoring opportunity: extract filtering logic to utility)  
**Critical:** ✅ YES — Core filtering hook; enables real-time filtered results throughout app

---

## 📋 STORY REQUIREMENTS

### User Story

```
As a developer,
I want to create a `useFilteredSubscriptions()` hook with memoized filter computation,
So that filtered results are computed efficiently and components always get current filtered data.
```

### Business Value

- Provides centralized, memoized filter computation for all components
- Prevents unnecessary re-renders when unrelated state changes
- Computes filtered results in < 10ms even with 100+ subscriptions
- Separates filtering logic from component rendering logic
- Establishes foundation for Story 11.5 (extracting filtering to utility function)
- Enables Dashboard integration (Story 11.6) with efficient real-time updates

### Scope & Boundaries

✅ **In Scope:**
- Create `src/hooks/useFilteredSubscriptions.ts` custom hook
- Accept no parameters; access subscriptions and searchState from `useSubscriptions()` hook
- Implement name search filtering (case-insensitive, substring match)
- Implement cost range filtering (min ≤ cost ≤ max, inclusive bounds, null = no limit)
- Use `useMemo` to memoize filtered results array
- Only recompute when subscriptions or searchState changes (dependency array: [subscriptions, searchState])
- Return filtered Subscription[] array
- Export `useFilteredSubscriptions()` as default export
- TypeScript strict mode compliance
- JSDoc documentation for hook and return type
- Performance: < 10ms filtering time with 100 subscriptions
- Handle edge cases: empty results, no filters applied, invalid cost ranges

❌ **Out of Scope:**
- Due date filtering (will be added later when Epic 6 is available)
- Create `utils/filterSubscriptions.ts` utility function (Story 11.5)
- Refactoring to extract filtering logic into utility (Story 11.5)
- Integration into Dashboard (Story 11.6)
- Test coverage (Story 11.8)
- Debounce/throttle (handled by context dispatch frequency)

---

## ✅ ACCEPTANCE CRITERIA

### AC1: Hook Created with Memoized Computation

**Given** I need filtered subscriptions with memoized computation  
**When** I create `src/hooks/useFilteredSubscriptions.ts`  
**Then** it:
- Is a custom React hook (function name starts with `use`)
- Calls `useSubscriptions()` to access subscriptions and searchState
- Uses `useMemo` to memoize the filter computation
- Returns a Subscription[] array (memoized result)
- Has dependency array: `[subscriptions, searchState]`
- Only recomputes when subscriptions or searchState changes
- Exported as default export

**And** TypeScript strict mode shows no errors  
**And** hook is properly typed with JSDoc documentation:
```typescript
/**
 * Custom hook to compute filtered subscriptions based on search and cost range criteria
 * 
 * Uses useMemo to memoize filter computation; only recomputes when subscriptions
 * or searchState changes. Prevents unnecessary re-renders in consuming components.
 * 
 * Filter Logic:
 * - Name search: case-insensitive substring match (searchTerm)
 * - Cost range: inclusive bounds (costRangeMin ≤ cost ≤ costRangeMax)
 * - null values mean "no limit" for that filter dimension
 * 
 * Performance: Filters 100+ subscriptions in < 10ms
 * 
 * @returns {Subscription[]} Filtered array of subscriptions matching ALL criteria (AND logic)
 * @throws {Error} If used outside SubscriptionProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const filtered = useFilteredSubscriptions();
 *   return <ul>{filtered.map(s => <li key={s.id}>{s.name}</li>)}</ul>;
 * }
 * ```
 */
```

---

### AC2: Name Search Filtering (Case-Insensitive)

**Given** I have search term "netflix" in searchState  
**When** I call the hook  
**Then** the filtered results include:
- Subscriptions with "netflix" in the name (case-insensitive: "Netflix", "NETFLIX", "netflix" all match)
- Partial matches: "net" matches "Netflix", "flex" matches "Netflix"
- Search respects substring matching (not whole-word match)

**And** the filtering logic:
```typescript
// Pseudo-code for name search
const filteredByName = subscriptions.filter(sub => {
  if (searchState.searchTerm === '') return true; // Empty search = no filter
  return sub.name.toLowerCase().includes(searchState.searchTerm.toLowerCase().trim());
});
```

**And** example:
| searchTerm | Subscription Name | Match? |
|-----------|------------------|--------|
| "netflix" | "Netflix" | ✅ YES |
| "net" | "Netflix" | ✅ YES |
| "fix" | "Netflix" | ✅ YES |
| "hulu" | "Netflix" | ❌ NO |
| "" | "Netflix" | ✅ YES (empty search) |
| " netflix " | "Netflix" | ✅ YES (trimmed) |

---

### AC3: Cost Range Filtering (Inclusive Bounds)

**Given** I have costRangeMin and costRangeMax in searchState  
**When** I call the hook  
**Then** the filtered results include:
- Subscriptions where cost ≥ costRangeMin (if costRangeMin is not null)
- Subscriptions where cost ≤ costRangeMax (if costRangeMax is not null)
- Boundary values are included: $10.00 and $20.00 are both shown if range is [$10, $20]
- null means "no limit": costRangeMin: null = no minimum, costRangeMax: null = no maximum

**And** the filtering logic:
```typescript
// Pseudo-code for cost range filtering
const filteredByCost = subscriptions.filter(sub => {
  const hasMinFilter = searchState.costRangeMin !== null;
  const hasMaxFilter = searchState.costRangeMax !== null;
  
  const meetsMin = !hasMinFilter || sub.cost >= searchState.costRangeMin;
  const meetsMax = !hasMaxFilter || sub.cost <= searchState.costRangeMax;
  
  return meetsMin && meetsMax;
});
```

**And** example:
| costRangeMin | costRangeMax | Subscription Cost | Match? |
|-------------|-------------|------------------|--------|
| $10 | $20 | $10.00 | ✅ YES |
| $10 | $20 | $15.00 | ✅ YES |
| $10 | $20 | $20.00 | ✅ YES |
| $10 | $20 | $9.99 | ❌ NO |
| $10 | $20 | $20.01 | ❌ NO |
| null | $20 | $50.00 | ✅ YES (no min) |
| $10 | null | $5.00 | ❌ NO (below min) |
| null | null | $100 | ✅ YES (no filters) |

---

### AC4: Combined Filtering (AND Logic)

**Given** search term "streaming" AND cost range $5-$15  
**When** I call the hook  
**Then** filtered results match BOTH criteria:
- Name contains "streaming" (case-insensitive)
- **AND** cost is between $5 and $15 (inclusive)
- Subscriptions matching only ONE criterion are excluded

**And** example:
| Name | Cost | Search "streaming" | Range $5-$15 | Final Match? |
|------|------|-------------------|-------------|------------|
| "Streaming Plus" | $9.99 | ✅ YES | ✅ YES | ✅ YES (both) |
| "Streaming Plus" | $20.00 | ✅ YES | ❌ NO | ❌ NO (cost fails) |
| "Netflix" | $12.99 | ❌ NO | ✅ YES | ❌ NO (name fails) |
| "Netflix" | $5.00 | ❌ NO | ✅ YES | ❌ NO (name fails) |

---

### AC5: Edge Cases & Empty Results

**Given** various edge case scenarios  
**When** I call the hook  
**Then** it handles them correctly:

| Scenario | Input | Result |
|----------|-------|--------|
| No subscriptions | subscriptions: [] | Returns [] (empty) |
| No filters applied | searchTerm: "", costRangeMin: null, costRangeMax: null | Returns all subscriptions |
| Invalid cost range (min > max) | costRangeMin: 20, costRangeMax: 10 | Returns [] (no match) |
| Search with leading/trailing spaces | searchTerm: "  netflix  " | Spaces trimmed, still matches "Netflix" |
| Empty search string | searchTerm: "" | All subscriptions matching cost filter |
| costRangeMin = costRangeMax | costRangeMin: 10, costRangeMax: 10 | Only subscriptions with exact cost $10 |
| null subscriptions (edge) | subscriptions: null (error state) | Hook throws or returns [] gracefully |

---

### AC6: Performance < 10ms with 100 Subscriptions

**Given** 100 subscriptions loaded in context  
**When** searchState changes (user types in SearchBar or adjusts CostRangeFilter)  
**Then**:
- Filtered results recompute and update in < 10ms
- useMemo prevents re-rendering of consumer components if results haven't changed
- Multiple rapid filter changes do not cause performance degradation

**Performance validation:**
```typescript
console.time('filter-computation');
const filtered = useFilteredSubscriptions();
console.timeEnd('filter-computation');
// Expected output: filter-computation: 2.3ms (or similar, < 10ms)
```

---

### AC7: Memoization Prevents Unnecessary Re-renders

**Given** a component consumes `useFilteredSubscriptions()`  
**When** unrelated context state changes (e.g., error message set)  
**Then**:
- The hook's useMemo retains the previous filtered array (same reference)
- Consumer component's memoization (React.memo or useMemo) recognizes same array reference
- Consumer component does NOT re-render unnecessarily

**And** the hook dependency array includes ONLY:
```typescript
const filtered = useMemo(() => {
  // filtering logic
}, [subscriptions, searchState]); // Only these two, nothing else
```

---

### AC8: TypeScript Types & Strict Mode

**Given** TypeScript strict mode is enabled  
**When** I implement the hook  
**Then**:
- All return types are explicitly declared
- Subscription types are properly imported and used
- No `any` types used
- No implicit any errors
- Dependency array is properly typed

**Example type declarations:**
```typescript
import { useMemo } from 'react';
import { useSubscriptions } from './useSubscriptions';
import type { Subscription } from '../types/subscription';

/**
 * Returns filtered subscriptions based on search and cost range criteria
 */
function useFilteredSubscriptions(): Subscription[] {
  const { subscriptions, searchState } = useSubscriptions();

  const filtered = useMemo((): Subscription[] => {
    // filtering logic returns Subscription[]
  }, [subscriptions, searchState]);

  return filtered;
}

export { useFilteredSubscriptions };
export default useFilteredSubscriptions;
```

---

## 🏗️ DEVELOPER CONTEXT: CRITICAL GUARDRAILS

### Architecture Compliance

**State Management:**
- ✅ Access subscriptions via `useSubscriptions()` hook (do NOT use context directly)
- ✅ Access searchState via `useSubscriptions()` hook
- ✅ No state mutations; all filtering is pure functional logic
- ✅ Return filtered array (new array reference on each recompute)

**Filtering Logic Pattern:**
- ✅ Use array `.filter()` for clean, functional approach
- ✅ Apply multiple filters in sequence with AND logic (all criteria must match)
- ✅ Handle null values correctly (null = "no limit" for that dimension)
- ✅ Trim whitespace from search term before comparison

**Memoization Strategy:**
- ✅ Use `useMemo` with dependency array `[subscriptions, searchState]`
- ✅ Dependency array triggers recompute when either subscriptions or searchState changes
- ✅ If searchState object reference changes but values don't, useMemo still recomputes (this is OK, context is working correctly)
- ✅ Do NOT include other values in dependency array (e.g., dispatch functions)

**TypeScript & Naming:**
- ✅ Named export: `export { useFilteredSubscriptions }`
- ✅ Also export as default: `export default useFilteredSubscriptions`
- ✅ File name: `src/hooks/useFilteredSubscriptions.ts` (exact case/spelling)
- ✅ Hook name: `useFilteredSubscriptions()` (camelCase, starts with `use`, descriptive)
- ✅ Explicit return type: `Subscription[]`

**File Location & Imports:**
- ✅ Location: `src/hooks/useFilteredSubscriptions.ts` (exact path)
- ✅ Import `useSubscriptions` from `./useSubscriptions`
- ✅ Import `Subscription` type from `../types/subscription`
- ✅ Import React hooks from `react` (useMemo)

---

## 📚 PREVIOUS STORY INTELLIGENCE

### Story 11.3: Create CostRangeFilter Component (COMPLETED)

**What was delivered:**
- CostRangeFilter component with two number inputs (min/max cost)
- Real-time dispatch to `setCostRangeMin()` and `setCostRangeMax()` on input change
- Validation showing error when min > max
- CSS Module with BEM naming
- WCAG 2.1 Level A accessibility
- 48 comprehensive tests covering all ACs and edge cases

**Key learnings for 11.4:**
- Cost range filter already dispatches changes to context via setCostRangeMin/setCostRangeMax
- searchState.costRangeMin and searchState.costRangeMax are available in context
- Cost values are numbers (not strings), can be null
- Error validation happens at the component level (Story 11.3), so the filtering hook can assume data is somewhat clean

**Pattern to follow:**
- Hook accesses context via useSubscriptions() (established pattern)
- useMemo is already used in useSubscriptions for totalCost calculation (see that pattern for reference)
- Filter logic should be pure functional (no side effects)

### Story 11.2: Create SearchBar Component (COMPLETED)

**What was delivered:**
- SearchBar component with text input and clear button (✕)
- Real-time dispatch to `setSearchTerm()` on every keystroke
- Clear button appears/disappears conditionally
- CSS Module with BEM naming
- WCAG 2.1 Level A accessibility
- 31 comprehensive tests

**Key learnings for 11.4:**
- Search term is available as `searchState.searchTerm` (empty string "" = no filter)
- Search dispatches on every keystroke (real-time, no debounce)
- searchState is immutable; component receives new object reference on each change
- useMemo dependency arrays in hooks should be tight and minimal

---

## 🔧 IMPLEMENTATION NOTES

### Filtering Algorithm

The hook should implement filtering in this sequence:

```
1. Start with all subscriptions
2. Filter by name (if searchTerm is not empty)
3. Filter by cost range (if costRangeMin or costRangeMax is set)
4. Return final filtered array
```

**Pseudo-algorithm:**
```typescript
const filtered = useMemo((): Subscription[] => {
  let result = subscriptions;
  
  // Filter 1: Name search
  if (searchState.searchTerm.trim() !== '') {
    const term = searchState.searchTerm.toLowerCase().trim();
    result = result.filter(sub => sub.name.toLowerCase().includes(term));
  }
  
  // Filter 2: Cost range
  const hasMinFilter = searchState.costRangeMin !== null && searchState.costRangeMin !== undefined;
  const hasMaxFilter = searchState.costRangeMax !== null && searchState.costRangeMax !== undefined;
  
  if (hasMinFilter || hasMaxFilter) {
    result = result.filter(sub => {
      const meetsMin = !hasMinFilter || sub.cost >= searchState.costRangeMin;
      const meetsMax = !hasMaxFilter || sub.cost <= searchState.costRangeMax;
      return meetsMin && meetsMax;
    });
  }
  
  return result;
}, [subscriptions, searchState]);
```

### Why Implement Inline (Not Calling Story 11.5 Utility)

Story 11.5 hasn't been created yet and will create the `utils/filterSubscriptions.ts` utility function. For this story:
- Implement filtering logic directly in the hook
- Story 11.5 will extract this logic into a pure utility function
- Story 11.5 will refactor the hook to call the utility (optional refactoring if utility approach is cleaner)
- This approach prevents circular dependencies and staging blockers

### Integration Points (Story 11.6 Will Use This)

The hook will be used in Story 11.6 Dashboard integration like this:

```typescript
function Dashboard() {
  const filtered = useFilteredSubscriptions();
  return <SubscriptionList subscriptions={filtered} />;
}
```

So the hook MUST return a consistent filtered array that components can rely on.

---

## 📊 TESTING STRATEGY (Story 11.8 Responsibility)

This story does NOT include tests, but here are the test categories that Story 11.8 should cover:

| Category | Test Count | Examples |
|----------|-----------|----------|
| Name Search | 5 | Case-insensitive, partial match, empty search, whitespace handling |
| Cost Range | 6 | Min filter, max filter, both, boundary values, null handling |
| Combined Filters | 4 | Name + cost with various combinations |
| Edge Cases | 5 | Empty results, no filters, invalid ranges, null values |
| Performance | 1 | Verify < 10ms with 100 subscriptions |
| Memoization | 3 | Same reference on unchanged input, recompute on change |
| **Total** | **24** | (Story 11.8 may expand this) |

---

## ✅ COMPLETION CHECKLIST

Dev should verify:

- [x] Hook file created at `src/hooks/useFilteredSubscriptions.ts`
- [x] Hook uses `useSubscriptions()` to access subscriptions and searchState
- [x] Hook uses `useMemo` with correct dependency array `[subscriptions, searchState]`
- [x] Name search filtering works (case-insensitive, substring match)
- [x] Cost range filtering works (inclusive bounds, null handling)
- [x] Combined AND logic works correctly
- [x] Edge cases handled (empty results, no filters, invalid ranges, null/undefined)
- [x] Performance verified < 10ms with 100 subscriptions (all tests < 5ms)
- [x] TypeScript strict mode: no errors ✅
- [x] ESLint: no errors ✅
- [x] JSDoc documentation complete
- [x] Hook exported as default and named export
- [x] No console errors or warnings
- [x] File exactly at `src/hooks/useFilteredSubscriptions.ts`
- [x] Hook name is exactly `useFilteredSubscriptions`

---

## 📝 FILE MODIFICATIONS SUMMARY

| File | Action | Details |
|------|--------|---------|
| `src/hooks/useFilteredSubscriptions.ts` | **CREATE** | New custom hook with filtering logic (memoized, case-insensitive search, cost range filtering) |
| `src/hooks/useFilteredSubscriptions.test.tsx` | **CREATE** | Comprehensive test suite (30 tests covering all 8 acceptance criteria) |
| No other files modified | — | — |

---

## 🎯 STORY COMPLETION STATUS

**Status:** ✅ DONE - Code review complete, all patches applied  
**Test Results:** 30/30 tests passing ✅  
**TypeScript Strict Mode:** No errors ✅  
**ESLint:** No errors ✅  
**Code Review:** 2 patches applied, 3 items deferred (acknowledged)  

**Completed Actions:**
1. ✅ Developer implemented useFilteredSubscriptions hook
2. ✅ Developer created comprehensive test suite (30 tests)
3. ✅ All acceptance criteria verified via tests
4. ✅ Ran `npm test` - TypeScript strict mode compliance verified
5. ✅ Ran `npm run lint` - ESLint compliance verified
6. ✅ Code review conducted (3 review layers)
7. ✅ All 8 acceptance criteria satisfied
8. ✅ 2 patches applied (defensive checks, code style)
9. ✅ Ready for merge/integration

---

## 🔍 CODE REVIEW FINDINGS

**Review Status:** 2 patches, 3 deferred, 0 dismissed  
**Acceptance Criteria:** All 8 ACs satisfied ✅

### Patch Items (Action Required)

- [x] **[Patch] Defensive checks missing for subscription property types** [src/hooks/useFilteredSubscriptions.ts:44, 53-54]
  - ✅ FIXED: Added `typeof sub.name === 'string'` guard before `.toLowerCase()` call
  - ✅ FIXED: Added `typeof sub.cost !== 'number' || isNaN(sub.cost)` validation before comparisons
  - All 30 tests passing, TypeScript OK, ESLint OK
  - **Severity:** CRITICAL

- [x] **[Patch] Redundant null/undefined check pattern** [src/hooks/useFilteredSubscriptions.ts:48-52]
  - ✅ FIXED: Simplified to `searchState.costRangeMin != null` (loose equality)
  - Cleaner, more idiomatic JavaScript
  - **Severity:** LOW

### Deferred Items (Acknowledged, Not Blocking)

- [x] **[Defer] Invalid cost range (min > max) returns silent empty results** — Pre-existing design responsibility belongs in CostRangeFilter component (Story 11.3), not this hook. Hook logic is correct.
- [x] **[Defer] Negative/invalid cost values pass through without validation** — Domain validation should happen at data entry/persistence layer (Story 2.2), not filter layer. Out of scope for this hook.
- [x] **[Defer] NaN in cost range bounds causes filtering to fail** — Input validation belongs at form level (CostRangeFilter component, Story 11.3). Hook cannot fix invalid upstream data.

**Note:** These deferred items reflect upstream validation gaps, not issues with the hook implementation. Consider creating a story for comprehensive data validation audit in a future epic.

---

## 🤔 QUESTIONS & CLARIFICATIONS

**Q: What about due date filtering mentioned in some ACs?**  
A: Due date filtering is part of Epic 6 (not started yet). Story 11.4 focuses on name search + cost range. The hook architecture is extensible; due date filtering can be added to searchState later when Epic 6 is ready.

**Q: Should I extract filtering to a utility function now?**  
A: No. Implement inline. Story 11.5 will create the `utils/filterSubscriptions.ts` utility and refactor the hook to use it (optional refactoring).

**Q: How do I handle null/undefined safely?**  
A: Check for `!== null && !== undefined` before using values in comparisons. Treat null as "no filter" for that dimension. See AC3 for exact pattern.

**Q: Performance target is < 10ms - is that achievable?**  
A: Yes. Filter logic is O(n) with simple comparisons. 100 subscriptions typically filter in 2-5ms. memoization prevents recalculation until input changes.

---

**Story created by bmad-create-story at 2026-05-07**  
**Ultimate BMad Method context engine analysis completed**
