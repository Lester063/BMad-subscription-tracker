---
story_id: "3.2"
story_key: "3-2-create-subscriptionlist-subscriptionrow-components"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "review"
created: "2026-04-30"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
---

# Story 3.2: Create SubscriptionList & SubscriptionRow Components

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.2  
**Status:** review  
**Sequence:** Second story in Epic 3; follows Story 3.1 (SubscriptionForm)  
**Depends On:**
- Story 3-1 (SubscriptionForm component)
- Story 2-1 (Subscription types & ACTIONS)
- Story 2-2 (localStorage utilities)
- Story 2-3 (SubscriptionContext with useReducer)
- Story 2-4 (useSubscriptions custom hook)
- Story 2-5 (App initialization with SubscriptionProvider)

**Blocks:** Story 3-3 (add workflow), Story 3-4 (real-time updates)  
**Priority:** HIGH — Core display component; establishes list patterns for filtering (Epic 6)

---

## 🎯 Story Statement

**As a** developer,  
**I want** to create SubscriptionList and SubscriptionRow components,  
**So that** subscriptions are displayed in a clean, organized list format.

---

## 📋 Acceptance Criteria

### AC1: SubscriptionList Component File Created

**Given** I have the project structure and useSubscriptions hook available  
**When** I create `src/components/SubscriptionList/SubscriptionList.tsx`  
**Then** the file:

- ✅ Exports a React functional component: `export function SubscriptionList() {}`
- ✅ Is a `.tsx` file (TypeScript + JSX)
- ✅ Uses `useSubscriptions()` hook to get subscriptions
- ✅ Imports Subscription type from `src/types/subscription.ts`
- ✅ Imports CSS Module: `SubscriptionList.module.css`
- ✅ Has complete JSDoc explaining component purpose

**File structure:**
```
src/components/
├── SubscriptionForm/          # ← Story 3.1 (DONE)
│   ├── SubscriptionForm.tsx
│   └── SubscriptionForm.module.css
├── SubscriptionList/          # ← THIS STORY
│   ├── SubscriptionList.tsx   # ← NEW COMPONENT FILE
│   └── SubscriptionList.module.css
└── SubscriptionRow/            # ← ALSO IN THIS STORY
    ├── SubscriptionRow.tsx    # ← NEW COMPONENT FILE
    └── SubscriptionRow.module.css
```

---

### AC2: SubscriptionList Renders SubscriptionRow Items

**Given** I render `<SubscriptionList />` with subscriptions in state  
**When** the component mounts with data  
**Then** the list:

- ✅ Maps over `subscriptions` array from useSubscriptions
- ✅ Renders a `<SubscriptionRow />` for each subscription
- ✅ Passes individual subscription object as prop to each row
- ✅ Uses unique `subscription.id` as React key for list items

**Implementation pattern:**
```typescript
// SubscriptionList.tsx
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionRow } from '../SubscriptionRow/SubscriptionRow';
import styles from './SubscriptionList.module.css';

export function SubscriptionList() {
  const { subscriptions } = useSubscriptions();
  
  return (
    <ul className={styles.list}>
      {subscriptions.map(sub => (
        <SubscriptionRow key={sub.id} subscription={sub} />
      ))}
    </ul>
  );
}
```

---

### AC3: SubscriptionRow Displays Subscription Data

**Given** I render a `<SubscriptionRow />` with a subscription object  
**When** the component receives the subscription prop  
**Then** each row displays exactly four pieces of information:

1. **Subscription Name**
   - Display: Text content (e.g., "Netflix")
   - Semantic: `<li>` list item with proper class

2. **Monthly Cost**
   - Display: Currency format (e.g., "$15.99")
   - Format: Use `Intl.NumberFormat` for consistent currency
   - Note: Currency formatting will be standardized in Story 5.5

3. **Due Date**
   - Display: Day of month (e.g., "Due: 15th" or "Due: Day 15")
   - Format: Ordinal suffix (1st, 2nd, 3rd, 4th, etc.) or "Day X"

4. **Action Buttons**
   - file_path button: Triggers edit workflow (Story 4-1)
   - Delete button: Triggers delete workflow (Story 4-2)
   - Both buttons must be present (even if non-functional this story)

**Implementation pattern:**
```typescript
// SubscriptionRow.tsx
interface SubscriptionRowProps {
  subscription: Subscription;
}

export function SubscriptionRow({ subscription }: SubscriptionRowProps) {
  const costFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(subscription.cost);
  
  return (
    <li className={styles.row}>
      <span className={styles.name}>{subscription.name}</span>
      <span className={styles.cost}>{costFormatted}</span>
      <span className={styles.dueDate}>Due: {subscription.dueDate}</span>
      <div className={styles.actions}>
        <button className={styles.editBtn}>Edit</button>
        <button className={styles.deleteBtn}>Delete</button>
      </div>
    </li>
  );
}
```

---

### AC4: Empty State Displayed When No Subscriptions

**Given** I render `<SubscriptionList />` with empty subscriptions array  
**When** `subscriptions.length === 0`  
**Then** the component:

- ✅ Displays a friendly empty state message: "No subscriptions yet."
- ✅ Uses semantic HTML (e.g., `<p>` or `<div>` with message)
- ✅ Does NOT render an empty `<ul>` or list container
- ✅ Message is accessible and screen-reader friendly

**Implementation pattern:**
```typescript
if (subscriptions.length === 0) {
  return <p className={styles.emptyState}>No subscriptions yet.</p>;
}
```

---

### AC5: Performance - Handle 100+ Subscriptions Without Lag

**Given** I have 100+ subscriptions in localStorage  
**When** the list renders  
**Then** the UI remains responsive:

- ✅ List renders within 100ms (requirement from NFR2)
- ✅ No blocking operations on main thread
- ✅ Simple, efficient DOM structure
- ✅ No unnecessary re-renders (React.memo if needed)

**Performance considerations:**
- Use `React.memo` on SubscriptionRow to prevent unnecessary re-renders
- Avoid inline function definitions in map callback
- Consider `useCallback` for event handlers if needed

---

### AC6: CSS Module Styling Applied

**Given** I create the component files  
**When** I create `SubscriptionList.module.css` and `SubscriptionRow.module.css`  
**Then** the styles:

- ✅ Use CSS Modules (BEM naming convention)
- ✅ Follow project patterns from Story 3-1
- ✅ Are scoped to components (no global pollution)
- ✅ Follow the visual design from global CSS variables

**BEM naming pattern:**
```css
/* SubscriptionList.module.css */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.emptyState {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--spacing-lg);
}
```

```css
/* SubscriptionRow.module.css */
.row {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.name {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.cost {
  color: var(--color-success);
  margin-right: var(--spacing-lg);
}

.dueDate {
  color: var(--color-text-muted);
  margin-right: var(--spacing-lg);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}
```

---

## 🔗 Dependencies & Context

### From Previous Stories (MUST READ)

1. **Story 3-1 (SubscriptionForm):** Established component patterns, CSS Module usage, form field structure
2. **Story 2-4 (useSubscriptions):** Provides `subscriptions` array via hook
3. **Story 2-1 (Subscription types):** `Subscription` interface with `id`, `name`, `cost`, `dueDate`, `createdAt`, `updatedAt`

### Architecture Requirements (MUST FOLLOW)

- **Data Flow:** Components → useSubscriptions hook → Context → Reducer → localStorage
- **No direct mutation:** Never modify state directly; always dispatch actions
- **Custom Hook:** Always use `useSubscriptions()` hook, never useContext directly
- **localStorage key:** `'subscriptions'` (exact spelling, lowercase)
- **Subscription structure:** `{id: UUID, name: string, cost: number, dueDate: number (1-31), createdAt: timestamp, updatedAt: timestamp}`

### File Structure Requirements

```
src/components/
├── SubscriptionForm/
│   ├── SubscriptionForm.tsx
│   └── SubscriptionForm.module.css
├── SubscriptionList/
│   ├── SubscriptionList.tsx    # NEW
│   └── SubscriptionList.module.css  # NEW
└── SubscriptionRow/
    ├── SubscriptionRow.tsx    # NEW
    └── SubscriptionRow.module.css  # NEW
```

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

1. **SubscriptionList renders empty state when no subscriptions**
2. **SubscriptionList maps and renders SubscriptionRow for each subscription**
3. **SubscriptionRow displays all four fields (name, cost, dueDate, actions)**
4. **SubscriptionRow formats cost as currency**
5. **SubscriptionRow formats due date appropriately**

### E2E Tests (Playwright)

1. **Empty state displays when no subscriptions exist**
2. **List displays subscription data correctly after adding subscription**
3. **Performance: 100+ subscriptions render without lag**

---

## ⚠️ Developer Notes

### What to Preserve (Non-Negotiable)

- The useSubscriptions hook must be used (NOT direct context access)
- Edit/Delete buttons must be present even if non-functional this story
- Empty state must show when subscriptions array is empty
- CSS Modules must be used (NOT inline styles or global CSS)

### What Will Come Later

- Edit button functionality (Story 4-1)
- Delete button functionality (Story 4-2)
- Real-time updates after add (Story 3-4)
- Sorting by due date (Story 3-4)
- Filtering controls (Epic 6)
- Currency formatting standardization (Story 5-5)

### Common Mistakes to Avoid

- ❌ NOT using useSubscriptions hook (must use hook, not context directly)
- ❌ NOT creating SubscriptionRow as separate component (must be modular)
- ❌ NOT using CSS Modules (must follow BEM pattern from Story 3-1)
- ❌ NOT handling empty state (must show "No subscriptions yet.")
- ❌ NOT using subscription.id as React key (must use unique key)

---

## 📝 Dev Notes (Update During Implementation)

| Date | Note |
|------|------|
| 2026-04-30 | Story created - ready for implementation |
| 2026-04-30 | Implemented SubscriptionList.tsx with useSubscriptions hook |
| 2026-04-30 | Implemented SubscriptionList.module.css with BEM naming |
| 2026-04-30 | Implemented SubscriptionRow.tsx with memo optimization |
| 2026-04-30 | Implemented SubscriptionRow.module.css with BEM naming |
| 2026-04-30 | Added unit test for empty state - PASSING |
| 2026-04-30 | TypeScript compilation - NO ERRORS |
| | |
| | |

---

## ✅ Completion Checklist

- [x] SubscriptionList.tsx created with useSubscriptions hook
- [x] SubscriptionList.module.css created with BEM naming
- [x] SubscriptionRow.tsx created with subscription prop
- [x] SubscriptionRow.module.css created with BEM naming
- [x] Empty state displays "No subscriptions yet."
- [x] All four data fields displayed (name, cost, dueDate, actions)
- [x] Edit/Delete buttons present (non-functional this story)
- [x] Unit tests written and passing
- [ ] E2E tests written and passing
- [ ] Code review completed (Story 3-1 patterns followed)