---
story_id: "11.6"
story_key: "11-6-integrate-searchbar-costrangefilter-into-dashboard"
epic: "11"
epic_title: "Search & Filter Subscriptions"
status: "ready-for-dev"
created: "2026-05-08"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
priority: "CRITICAL"
estimated_complexity: "low"
estimated_effort: "1-2 hours"
---

# Story 11.6: Integrate SearchBar & CostRangeFilter into Dashboard

**Epic:** Search & Filter Subscriptions (Epic 11)  
**Story ID:** 11.6  
**Status:** ready-for-dev  
**Sequence:** Sixth story in Epic 11; integration milestone bringing together all previous components  
**Depends On:** Story 11.1 (SearchState context), Story 11.2 (SearchBar component), Story 11.3 (CostRangeFilter component), Story 11.4 (useFilteredSubscriptions hook)  
**Blocks:** Story 11.7 (Clear All Filters button needs updated layout), Story 11.8 (E2E tests verify complete search/filter workflow)  
**Critical:** ✅ YES — Activates all search/filter features for end users; enables FR8, FR9, FR10

---

## 📋 STORY REQUIREMENTS

### User Story

```
As a user,
I want to see search and cost range filter controls on the dashboard,
So that I can search subscriptions by name and filter by price range in real-time.
```

### Business Value

- **Activates** search feature (FR8: Users can search subscriptions by name with real-time filtering)
- **Activates** cost range filter feature (FR9: Users can filter subscriptions by cost range)
- **Activates** combined filtering (FR10: Users can combine search and cost filter simultaneously)
- **Completes** Epic 11 core functionality; remaining stories are enhancement/testing
- **Improves** user experience by making subscription management discoverable and efficient
- **Meets** performance requirement: filtered results compute in < 10ms (no visible lag)

### Scope & Boundaries

✅ **In Scope:**
- Integrate SearchBar component into App.tsx Dashboard layout
- Integrate CostRangeFilter component into App.tsx Dashboard layout
- Use useFilteredSubscriptions hook to compute filtered subscriptions
- Pass filtered subscriptions to SubscriptionList (replacing unfiltered subscriptions)
- Position filters above the SubscriptionList for visual hierarchy
- Update SubscriptionList.tsx to accept optional `subscriptions` prop (enhancement)
- Maintain backward compatibility: SubscriptionList still works without prop (uses hook directly)
- Real-time updates: search/filter changes immediately update the list
- Handle edge cases: empty results, no filters applied, invalid input values
- Preserve all existing functionality: Add, Edit, Delete, timestamps still work correctly
- TypeScript strict mode compliance

❌ **Out of Scope:**
- Create Dashboard wrapper component (use existing App.tsx structure)
- Cost Summary/Total Cost calculation (Epic 5)
- Due date filtering (Epic 6)
- Clear All Filters button (Story 11.7)
- Test coverage (Story 11.8)
- Toast notifications for filter changes (Story 4.4 handles form messages)
- Debounce/throttle on filter changes (context dispatch frequency sufficient)
- Filter persistence (session-only, reset on page reload)
- Visual styling improvements beyond existing CSS Modules (Story 9 handles polish)

---

## ✅ ACCEPTANCE CRITERIA

### AC1: SearchBar Component Rendered in Dashboard

**Given** I open the app  
**When** I look at the page layout  
**Then** I see:
- SearchBar component displayed above the SubscriptionList
- SearchBar has visible label "Search subscriptions"
- SearchBar has text input field with placeholder "Search by subscription name"
- SearchBar has clear button (✕) that appears when input has text
- SearchBar is fully accessible (keyboard navigation, screen reader support)

**And** the HTML structure:
```
App (Dashboard)
├── <h1>Subscription Tracker</h1>
├── {successMessage display area}
├── SubscriptionForm
├── SearchBar                    ← NEW: Integrated here
├── CostRangeFilter              ← NEW: Integrated here
└── SubscriptionList
```

**And** CSS layout flows naturally (use existing flexbox/grid from global styles)

---

### AC2: CostRangeFilter Component Rendered in Dashboard

**Given** I open the app  
**When** I look at the page layout  
**Then** I see:
- CostRangeFilter component displayed below SearchBar (or adjacent)
- CostRangeFilter has two input fields: "Minimum Cost" and "Maximum Cost"
- CostRangeFilter has clear button to reset both filters
- CostRangeFilter shows validation error if min > max (e.g., "$20 minimum but $10 maximum")
- CostRangeFilter is fully accessible (labels, aria-describedby, keyboard navigation)

**And** the HTML structure places both filters above SubscriptionList:
```
App (Dashboard)
├── <h1>Subscription Tracker</h1>
├── {successMessage area}
├── SubscriptionForm
├── <section class="filters">          ← Optional: wrapper for both filters
│   ├── SearchBar
│   └── CostRangeFilter
└── SubscriptionList
```

---

### AC3: SubscriptionList Receives & Displays Filtered Subscriptions

**Given** I enter search term "netflix" in SearchBar  
**When** the input dispatches SET_SEARCH_TERM action  
**Then** the SubscriptionList updates to show only subscriptions with "netflix" in the name  
**And** the update is immediate (< 10ms, no visible lag)

**Given** I set CostRangeFilter to $10-$20  
**When** the filter dispatches SET_COST_RANGE_MIN/MAX actions  
**Then** the SubscriptionList updates to show only subscriptions between $10-$20  
**And** the update is immediate (< 10ms, no visible lag)

**Given** I have both search term AND cost range active  
**When** I view the SubscriptionList  
**Then** it shows only subscriptions matching BOTH criteria (AND logic)  
**And** results exclude subscriptions that match only one criterion

---

### AC4: useFilteredSubscriptions Hook Integrated into AppContent

**Given** I need to compute filtered subscriptions  
**When** AppContent component renders  
**Then** it:
- Imports `useFilteredSubscriptions` hook from `../../hooks/useFilteredSubscriptions`
- Calls `const filteredSubscriptions = useFilteredSubscriptions()` to get memoized filtered results
- Passes filteredSubscriptions to SubscriptionList component

**And** the integration pattern:
```typescript
// AppContent component
import { useFilteredSubscriptions } from './hooks/useFilteredSubscriptions';

function AppContent() {
  // ... existing code ...
  const filteredSubscriptions = useFilteredSubscriptions();

  return (
    <div className="app">
      <h1>Subscription Tracker</h1>
      {successMessage && ...}
      <SubscriptionForm ... />
      <SearchBar />                           {/* NEW */}
      <CostRangeFilter />                     {/* NEW */}
      <SubscriptionList subscriptions={filteredSubscriptions} onEditClick={...} />
    </div>
  );
}
```

---

### AC5: SubscriptionList Component Accepts Optional Subscriptions Prop

**Given** AppContent wants to pass filtered subscriptions  
**When** AppContent calls `<SubscriptionList subscriptions={filteredSubscriptions} />`  
**Then** SubscriptionList:
- Accepts optional `subscriptions` prop in SubscriptionListProps interface
- Uses provided subscriptions if prop is passed
- Falls back to `useSubscriptions().subscriptions` if prop is not provided (backward compatible)
- Maintains sorting by dueDate (ascending order 1-31)
- Maintains empty state handling: "No subscriptions yet."

**And** the implementation pattern:
```typescript
export interface SubscriptionListProps {
  subscriptions?: Subscription[];           // NEW: Optional subscriptions prop
  onEditClick?: (subscription: Subscription) => void;
}

export function SubscriptionList({ subscriptions: providedSubscriptions, onEditClick }: SubscriptionListProps) {
  const { subscriptions: contextSubscriptions } = useSubscriptions();
  const subscriptions = providedSubscriptions ?? contextSubscriptions;  // Use provided or fall back
  
  // Rest of component: sorting, rendering, empty state...
}
```

**And** backward compatibility:
- Old usage: `<SubscriptionList onEditClick={...} />` still works (uses hook directly)
- New usage: `<SubscriptionList subscriptions={filtered} onEditClick={...} />` works (uses prop)

---

### AC6: Search & Filter State Persists Correctly During Session

**Given** I search for "netflix" in SearchBar  
**When** I navigate between add/edit subscription workflows  
**Then** the search term remains active in SearchBar  
**And** the SubscriptionList continues to show filtered results

**Given** I set CostRangeFilter to $10-$20  
**When** I add a new subscription  
**Then** the cost filter remains active  
**And** the new subscription appears in the list only if it matches the filter criteria

**Given** I search and filter subscriptions  
**When** I refresh the page (F5 or browser reload)  
**Then** the search term and cost range reset to empty (session-only state)  
**And** all subscriptions are displayed (no persistence)

---

### AC7: Real-Time Updates on All State Changes

**Given** I have an active search and cost range filter  
**When** I add a new subscription that matches the filter criteria  
**Then** the new subscription appears in SubscriptionList immediately  
**And** no manual refresh is required

**Given** I have an active search and cost range filter  
**When** I edit an existing subscription (changing name or cost)  
**Then** the SubscriptionList updates immediately  
**And** the subscription may appear/disappear if it no longer matches filters

**Given** I have an active search and cost range filter  
**When** I delete a subscription  
**Then** the SubscriptionList updates immediately  
**And** the total count decreases if it matched the filter criteria

---

### AC8: Empty State Handling with Active Filters

**Given** I apply a search term that matches no subscriptions  
**When** I look at the SubscriptionList  
**Then** I see "No subscriptions yet." message
**And** the SearchBar still shows my search term (not cleared)

**Given** I apply a cost range filter that matches no subscriptions  
**When** I look at the SubscriptionList  
**Then** I see "No subscriptions yet." message
**And** the CostRangeFilter still shows my filter values (not cleared)

**Given** No subscriptions in database  
**When** I view the app  
**Then** I see "No subscriptions yet." message
**And** SearchBar shows empty input
**And** CostRangeFilter shows empty input fields

---

### AC9: Performance: Filtered Results Compute Quickly

**Given** I have 100+ subscriptions in the database  
**When** I type in SearchBar or change CostRangeFilter values  
**Then** the SubscriptionList updates within 10ms (imperceptible delay)  
**And** no "loading" spinner is needed (too fast to display)

**Performance Measurement:**
- useFilteredSubscriptions with useMemo prevents unnecessary recomputation
- Only recomputes when `subscriptions` or `searchState` changes
- Filtering logic is O(n) where n = number of subscriptions
- Acceptable for n < 100

---

### AC10: All Existing Functionality Preserved

**Given** I use the Add/Edit/Delete workflows  
**When** I interact with SubscriptionForm  
**Then** form submission still works correctly  
**And** success message displays  
**And** form clears after submission

**Given** I click Edit on a subscription row  
**When** the form enters edit mode  
**Then** form pre-populates with subscription values  
**And** timestamps are preserved correctly

**Given** I click Delete on a subscription row  
**When** I confirm deletion  
**Then** subscription is removed from context  
**And** SubscriptionList updates (may show "No subscriptions yet." if no match)

**And** all TypeScript strict mode checks pass  
**And** no console errors appear (except expected error messages)

---

## 🏗️ ARCHITECTURE COMPLIANCE

### Immutable Patterns
- SubscriptionList receives subscriptions as prop (immutable from parent)
- useFilteredSubscriptions returns new array reference via Array.filter() (always new reference)
- No mutations to subscriptions or searchState in AppContent
- Dispatch actions for all state changes (via context)

### Component Architecture
- AppContent handles orchestration: filters + components
- SubscriptionList accepts subscriptions as prop (more flexible)
- SearchBar and CostRangeFilter are presentation components (stateless logic in context)
- useFilteredSubscriptions is pure computation (useMemo, no side effects)

### State Management
- Search/filter state lives in SubscriptionContext (single source of truth)
- SearchBar dispatches SET_SEARCH_TERM action
- CostRangeFilter dispatches SET_COST_RANGE_MIN/MAX actions
- useFilteredSubscriptions reads from context via useSubscriptions hook
- No local component state for filters (all via context)

### TypeScript Compliance
- SubscriptionListProps interface documents subscriptions prop (optional)
- Import statements use type imports where needed
- JSDoc comments on new integration points
- Strict mode: no any types, all values properly typed

---

## 🔍 DEVELOPER CONTEXT

### Previous Story Intelligence (11.5: filterSubscriptions Utility)

**From Story 11.5 dev notes:**
- Pure `applyFilters()` function created in `src/utils/filterSubscriptions.ts`
- Implements name search (case-insensitive substring) and cost range (inclusive bounds)
- Handles null filters correctly (null = no limit)
- Returns new array reference (immutable)
- **Potential Enhancement:** useFilteredSubscriptions could optionally use this utility (currently has inline logic)

**Learnings:**
- Filter logic is straightforward: string.includes() + numeric comparisons
- Edge cases already tested: empty results, no filters, invalid ranges
- Performance acceptable with useMemo (no benchmarking needed)

### Previous Story Intelligence (11.4: useFilteredSubscriptions Hook)

**From Story 11.4 implementation:**
- Hook already implemented and working correctly
- Uses useMemo with dependency array [subscriptions, searchState]
- Handles guards: null/undefined subscriptions → returns []
- Applies filters in order: name search, then cost range
- Performance tested: filters 100+ subscriptions < 10ms

**What This Story Uses:**
- Import useFilteredSubscriptions directly from `./hooks/useFilteredSubscriptions`
- Call it in AppContent: `const filtered = useFilteredSubscriptions()`
- Pass to SubscriptionList: `<SubscriptionList subscriptions={filtered} />`
- No changes needed to the hook (ready-to-use)

### Previous Story Intelligence (11.2 & 11.3: SearchBar & CostRangeFilter Components)

**From Story 11.2 (SearchBar):**
- Component located: `src/components/SearchBar/SearchBar.tsx`
- Dispatches SET_SEARCH_TERM action on input change
- Has clear button (✕) that sets search to empty string
- Fully accessible: label, keyboard nav, screen reader support
- Exports `export function SearchBar(props: SearchBarProps): React.ReactElement`
- Uses CSS Modules: `SearchBar.module.css` with BEM naming

**From Story 11.3 (CostRangeFilter):**
- Component located: `src/components/CostRangeFilter/CostRangeFilter.tsx`
- Dispatches SET_COST_RANGE_MIN and SET_COST_RANGE_MAX actions
- Two input fields: min and max cost
- Clear button resets both to null
- Validation error if min > max
- Fully accessible: labels, aria-describedby, keyboard nav
- Exports `export function CostRangeFilter(props: CostRangeFilterProps): React.ReactElement`
- Uses CSS Modules: `CostRangeFilter.module.css` with BEM naming

**What This Story Integrates:**
- Import SearchBar from `'./components/SearchBar/SearchBar'`
- Import CostRangeFilter from `'./components/CostRangeFilter/CostRangeFilter'`
- Render both components in App.tsx above SubscriptionList
- Position: SearchBar above CostRangeFilter (logical flow)
- No changes to these components needed (ready-to-use)

### Current App.tsx Structure

**Current layout:**
```
App (SubscriptionProvider wrapper)
└── AppContent (has hooks, state, handlers)
    ├── <h1>Subscription Tracker</h1>
    ├── {successMessage conditional display}
    ├── SubscriptionForm (takes onSubmit, disabled, errorMessage, etc.)
    └── SubscriptionList (takes onEditClick callback)
```

**Missing integrations:**
- No SearchBar
- No CostRangeFilter
- No useFilteredSubscriptions hook call
- SubscriptionList gets all unfiltered subscriptions from useSubscriptions().subscriptions

**After Story 11.6:**
```
App (SubscriptionProvider wrapper)
└── AppContent (has hooks, state, handlers)
    ├── <h1>Subscription Tracker</h1>
    ├── {successMessage conditional display}
    ├── SubscriptionForm (takes onSubmit, disabled, errorMessage, etc.)
    ├── SearchBar                        ← NEW
    ├── CostRangeFilter                  ← NEW
    └── SubscriptionList (takes subscriptions prop + onEditClick)
        Uses: filteredSubscriptions from useFilteredSubscriptions() hook
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Step 1: Update App.tsx Imports

```typescript
// Add imports at top of AppContent component or App.tsx
import { SearchBar } from './components/SearchBar/SearchBar'
import { CostRangeFilter } from './components/CostRangeFilter/CostRangeFilter'
import { useFilteredSubscriptions } from './hooks/useFilteredSubscriptions'
```

### Step 2: Update AppContent Component

Inside AppContent function:
```typescript
// After existing useSubscriptions() call, add:
const filteredSubscriptions = useFilteredSubscriptions()

// In JSX return, add SearchBar and CostRangeFilter after SubscriptionForm, before SubscriptionList:
<SearchBar />
<CostRangeFilter />

// Update SubscriptionList call to pass filteredSubscriptions:
<SubscriptionList subscriptions={filteredSubscriptions} onEditClick={handleEditClick} />
```

### Step 3: Update SubscriptionList Component

In SubscriptionList.tsx:
```typescript
// Update SubscriptionListProps interface to include optional subscriptions prop
export interface SubscriptionListProps {
  subscriptions?: Subscription[]  // NEW
  onEditClick?: (subscription: Subscription) => void
}

// Update component function signature and logic:
export function SubscriptionList({ subscriptions: providedSubscriptions, onEditClick }: SubscriptionListProps) {
  const { subscriptions: contextSubscriptions } = useSubscriptions()
  const subscriptions = providedSubscriptions ?? contextSubscriptions  // Use provided or fallback
  
  // Rest of component continues unchanged
}
```

### Step 4: Layout Considerations

- SearchBar and CostRangeFilter should stack vertically or display horizontally depending on screen size
- Both components use CSS Modules (already have responsive styling from Stories 11.2 & 11.3)
- No additional global CSS changes needed (existing layout sufficient)
- Optional: Add `<section class="filters">` wrapper for semantic structure
- Consider flex container: `display: flex; gap: 1rem; flex-wrap: wrap;` for responsive layout

### Step 5: Testing Before Completion

- [ ] SearchBar displays correctly and responds to input
- [ ] CostRangeFilter displays correctly and responds to input
- [ ] Typing in SearchBar filters subscriptions immediately
- [ ] Changing CostRangeFilter filters subscriptions immediately
- [ ] Both filters work together (AND logic)
- [ ] Empty results show "No subscriptions yet."
- [ ] Add/Edit/Delete workflows still work with filters active
- [ ] No console errors
- [ ] TypeScript strict mode: no errors
- [ ] Refresh page: filters reset, all subscriptions show

---

## 📝 TECHNICAL REQUIREMENTS

### File Modifications
- **App.tsx** - Add imports, update AppContent JSX, add hook call
- **SubscriptionList.tsx** - Update props interface, add optional subscriptions parameter

### File Reads (No Modifications)
- **SearchBar.tsx** - Read to understand component interface
- **CostRangeFilter.tsx** - Read to understand component interface
- **useFilteredSubscriptions.ts** - Read to understand hook interface

### New Files Created
- None (all components and hooks already exist)

### TypeScript Strict Mode
- All imports properly typed
- subscriptions prop in SubscriptionListProps properly typed as `Subscription[] | undefined`
- No new type errors introduced

### Testing Strategy
- Manual: Open app, type in SearchBar, verify results
- Manual: Change CostRangeFilter values, verify results
- Manual: Use both filters together, verify AND logic
- Manual: Add/Edit/Delete with active filters, verify operations still work
- Manual: Refresh page, verify filters reset
- Automated: Story 11.8 will create E2E tests for this workflow

---

## 🎯 DELIVERABLES

### Code Changes
1. **App.tsx**: Imports, useFilteredSubscriptions hook call, JSX integration
2. **SubscriptionList.tsx**: Props interface update, optional subscriptions parameter

### Verification
- [ ] App runs without errors
- [ ] SearchBar visible and functional
- [ ] CostRangeFilter visible and functional
- [ ] Real-time filtering works (< 10ms latency)
- [ ] Empty results handled gracefully
- [ ] Session state works correctly (filters reset on refresh)
- [ ] All existing functionality preserved
- [ ] TypeScript strict mode: no errors

### Documentation
- JSDoc comments updated if needed
- This story file serves as complete implementation guide

---

## ⚠️ COMMON PITFALLS & GUARDS

1. **Forget to pass `subscriptions` prop to SubscriptionList**
   - Guard: Import useFilteredSubscriptions and call it before JSX
   - Guard: Update SubscriptionList props to accept subscriptions parameter

2. **Update SubscriptionList but forget backward compatibility**
   - Guard: Use optional prop with fallback: `providedSubscriptions ?? contextSubscriptions`
   - Guard: Ensure old code still works: `<SubscriptionList onEditClick={...} />`

3. **Render components but filters don't show**
   - Guard: Verify imports are correct: `import { SearchBar } from './components/SearchBar/SearchBar'`
   - Guard: Verify components render in correct JSX position (after form, before list)

4. **Filters not updating SubscriptionList**
   - Guard: Verify useFilteredSubscriptions hook is called in AppContent
   - Guard: Verify filtered results passed to SubscriptionList: `subscriptions={filteredSubscriptions}`

5. **Performance issues or lag**
   - Guard: useFilteredSubscriptions uses useMemo (already optimized)
   - Guard: No additional debounce needed (context updates are fast enough)

6. **TypeScript errors on subscriptions prop**
   - Guard: Update SubscriptionListProps interface to include `subscriptions?: Subscription[]`
   - Guard: Use const assertion in function param: `{ subscriptions: providedSubscriptions }`

---

## 📚 SUCCESS CRITERIA SUMMARY

✅ **SearchBar component integrated and functional**  
✅ **CostRangeFilter component integrated and functional**  
✅ **useFilteredSubscriptions hook integrated and computing filtered results**  
✅ **SubscriptionList receives filtered subscriptions via prop**  
✅ **Real-time filtering works with < 10ms latency**  
✅ **Combined search + cost range filters (AND logic) work correctly**  
✅ **Empty results handled gracefully**  
✅ **Session state correct (filters reset on page refresh)**  
✅ **All existing Add/Edit/Delete functionality preserved**  
✅ **TypeScript strict mode: zero errors**  
✅ **No console errors**  

---

**Developer: You now have everything needed to implement this story flawlessly. All components exist, all interfaces are documented, and the integration pattern is clear. Execute with confidence!**
