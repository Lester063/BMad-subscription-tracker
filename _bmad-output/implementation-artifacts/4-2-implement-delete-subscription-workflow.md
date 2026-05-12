---
story_id: "4.2"
story_key: "4-2-implement-delete-subscription-workflow"
epic: 4
epic_title: "Edit & Delete Subscriptions"
status: "done"
created: 2026-05-12
last_updated: 2026-05-12
completed: 2026-05-12
priority: "high"
estimated_complexity: "medium"
test_artifacts: "tests/e2e/story-4-2-delete-subscription.spec.ts"
---

# Story 4.2: Implement Delete Subscription Workflow

**Sprint:** Epic 4 — Edit & Delete Subscriptions  
**Status:** ✅ COMPLETE  
**Date:** May 12, 2026  
**Completed:** May 12, 2026  
**Test Architect:** Murat (via ATDD Red-Phase E2E Tests)

---

## 📋 STORY REQUIREMENTS

### User Story
```
As a user,
I want to click "Delete" on a subscription and confirm deletion,
So that I can remove subscriptions I no longer use.
```

### Business Value
- Users can remove subscriptions they no longer need
- Reduces clutter and keeps the subscription list accurate
- Confirmation dialog prevents accidental deletions (high-risk UX issue)
- Builds trust through reversible workflows

### Scope & Boundaries
✅ **In Scope:**
- Delete button visible on each subscription row (SubscriptionRow)
- Confirmation dialog component (NEW: DeleteConfirmationDialog)
- Dialog displays "Are you sure?" confirmation message
- Cancel and Confirm Delete buttons in dialog
- Cancel closes dialog without deleting (subscription preserved)
- Confirm Delete removes subscription from list (< 100ms)
- Deletion persists to localStorage (no data loss on refresh)
- Success toast notification: "Subscription deleted successfully" (Note: Story 4.4)
- Keyboard navigation support (Tab, Enter, Escape for accessibility)
- WCAG 2.1 Level A compliance (aria-labels, semantic HTML, focus management)
- Error handling for localStorage failures (try-catch + graceful degradation)

❌ **Out of Scope:**
- Toast notification system (Story 4.4 dependency)
- Undo/restore deleted subscriptions (out of MVP scope)
- Soft delete or archive workflows
- Bulk deletion operations

---

## ✅ ACCEPTANCE CRITERIA (10 ACs mapped to E2E tests)

| AC# | Criterion | E2E Test Map | Implementation Detail |
|-----|-----------|--------------|----------------------|
| **AC1** | **Delete button visible** | E4.2-001, E4.2-002, E4.2-003 | Delete button present on each SubscriptionRow, visible, clickable, styled consistently |
| **AC2** | **Delete triggers confirmation dialog** | E4.2-001, E4.2-002, E4.2-003 | Clicking Delete button opens DeleteConfirmationDialog (NEW component) |
| **AC3** | **Dialog has Cancel & Confirm Delete buttons** | E4.2-001, E4.2-002 | Dialog displays both buttons, both keyboard-accessible, visually distinct |
| **AC4** | **Cancel closes dialog, preserves subscription** | E4.2-002 | Cancel button: closes dialog without side effects, subscription list unchanged, localStorage untouched |
| **AC5** | **Confirm Delete removes subscription < 100ms** | E4.2-001, E4.2-003, E4.2-005 | Deletion completes synchronously (React state update), list re-renders within 100ms |
| **AC6** | **Success toast displays** | E4.2-001 | After deletion, toast: "Subscription deleted successfully" auto-dismisses 3s (Story 4.4 provides toast system) |
| **AC7** | **Deletion persists to localStorage** | E4.2-003 | After delete, subscription is gone from localStorage; page refresh shows deletion persisted |
| **AC8** | **Keyboard navigation works** | E4.2-004 | Tab/Enter/Escape: Tab through buttons, Enter confirms, Escape cancels; focus management on dialog open |
| **AC9** | **WCAG 2.1 Level A accessibility** | E4.2-004 | Semantic HTML, aria-labels, aria-role, color contrast, focus indicators on all interactive elements |
| **AC10** | **Error handling for localStorage** | E4.2-001-E4.2-005 | All localStorage ops wrapped in try-catch; graceful degradation; user-friendly error messages (not technical) |

---

## 👨‍💻 DEVELOPER CONTEXT

### What This Story Extends
Story 4.2 reuses SubscriptionRow from Story 3.2 and extends the deletion capability already defined in Story 2.3 (DELETE_SUBSCRIPTION reducer action). You will:

1. **Add Delete button to SubscriptionRow** — Similar pattern to Edit button added in Story 4.1
2. **Create DeleteConfirmationDialog component** — NEW component for confirmation flow
3. **Wire dialog to deletion workflow** — Connect button click → dialog → reducer dispatch
4. **Handle localStorage persistence** — Reducer already saves; ensure try-catch around storage ops

### Component Architecture Pattern
```
App (SubscriptionProvider wrapper)
  ↓
Dashboard
  ├→ CostSummary
  ├→ SubscriptionForm (Edit mode)
  ├→ SubscriptionList
  │   └→ SubscriptionRow ← DELETE BUTTON added (Story 4.2)
  │       └→ [Click Delete] → DeleteConfirmationDialog ← NEW (Story 4.2)
  │           ├→ [Cancel] → Dialog closes, no action
  │           └→ [Confirm Delete] → Dispatch DELETE_SUBSCRIPTION → Reducer saves → List updates
  └→ Toast notification (Story 4.4 provides this)
```

### State Management Pattern (DELETE_SUBSCRIPTION already implemented)
**The reducer already handles deletion.** Story 2.3 implemented:

```typescript
// In SubscriptionContext.tsx (already done)
case ACTIONS.DELETE_SUBSCRIPTION: {
  const subscriptionId = action.payload as string
  // Validate payload is non-empty string
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    return { ...state, error: 'Invalid subscription ID' }
  }
  const updated = state.subscriptions.filter(sub => sub.id !== subscriptionId)
  const saveSuccess = saveSubscriptionsToStorage(updated)
  if (!saveSuccess) {
    return { ...state, error: 'Failed to delete subscription from storage' }
  }
  return { subscriptions: updated, error: null, searchState: state.searchState }
}
```

**Your job:** Call it correctly from the UI.

```typescript
// In useSubscriptions hook (Story 2.4, already exists)
const deleteSubscription = useCallback(
  (id: string) => {
    try {
      dispatch({ type: ACTIONS.DELETE_SUBSCRIPTION, payload: id })
    } catch (error) {
      console.error('Error dispatching DELETE_SUBSCRIPTION:', error)
    }
  },
  [dispatch]
)
```

### UI Flow (What You Build)
```
User sees subscription row
  ↓
User clicks "Delete" button
  ↓
DeleteConfirmationDialog opens (modal/overlay)
  ├→ Shows: "Are you sure?"
  ├→ Cancel button → Dialog closes (no action taken)
  └→ Confirm Delete button
      ↓
      Dispatch DELETE_SUBSCRIPTION action
      ↓
      Reducer filters out subscription, saves to localStorage
      ↓
      Context updates, list re-renders (subscription gone)
      ↓
      Toast shows: "Subscription deleted successfully" (Story 4.4)
      ↓
      Dialog closes automatically
```

### Dialog Component Pattern (NEW: DeleteConfirmationDialog)
```typescript
// src/components/DeleteConfirmationDialog/DeleteConfirmationDialog.tsx

export interface DeleteConfirmationDialogProps {
  subscription: Subscription // To show name in confirmation
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean // Optional: for handling async operations
}

export function DeleteConfirmationDialog({
  subscription,
  isOpen,
  onCancel,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps): JSX.Element | null {
  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <h2 id="dialog-title">Are you sure?</h2>
      <p>Delete "{subscription.name}"? This action cannot be undone.</p>
      
      <button onClick={onCancel} disabled={isLoading}>
        Cancel
      </button>
      <button 
        onClick={onConfirm} 
        disabled={isLoading}
        aria-label={`Confirm delete ${subscription.name}`}
      >
        Confirm Delete
      </button>
    </div>
  )
}
```

### Integration Pattern (Update SubscriptionRow)
```typescript
// src/components/SubscriptionRow/SubscriptionRow.tsx

export interface SubscriptionRowProps {
  subscription: Subscription
  onEditClick?: (subscription: Subscription) => void
  onDeleteClick?: (subscription: Subscription) => void // NEW
}

function SubscriptionRowComponent({ 
  subscription, 
  onEditClick,
  onDeleteClick // NEW
}: SubscriptionRowProps): ReactElement | null {
  // ... existing code ...
  
  return (
    <div data-testid="subscription-item">
      <span>{name}</span>
      <span>${cost.toFixed(2)}</span>
      <span>{formatDueDate(dueDate)}</span>
      
      <button onClick={() => onEditClick?.(subscription)}>Edit</button>
      <button 
        onClick={() => onDeleteClick?.(subscription)} // NEW
        aria-label={`Delete ${name}`}
      >
        Delete
      </button>
    </div>
  )
}
```

### Dashboard/List Integration (Update SubscriptionList or parent)
```typescript
// In SubscriptionList or Dashboard where SubscriptionRow is rendered

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
const { deleteSubscription } = useSubscriptions()

const handleDeleteClick = (subscription: Subscription) => {
  setSubscriptionToDelete(subscription)
  setDeleteDialogOpen(true)
}

const handleConfirmDelete = () => {
  if (subscriptionToDelete) {
    deleteSubscription(subscriptionToDelete.id)
    setDeleteDialogOpen(false)
    setSubscriptionToDelete(null)
    // Toast notification happens via error/success state in Story 4.4
  }
}

const handleCancelDelete = () => {
  setDeleteDialogOpen(false)
  setSubscriptionToDelete(null)
}

return (
  <>
    <SubscriptionList 
      subscriptions={filteredSubscriptions}
      onDeleteClick={handleDeleteClick}
      onEditClick={handleEditClick}
    />
    
    {subscriptionToDelete && (
      <DeleteConfirmationDialog
        subscription={subscriptionToDelete}
        isOpen={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    )}
  </>
)
```

---

## 🏗️ TECHNICAL REQUIREMENTS

### Technologies & Versions (REQUIRED)
| Technology | Version | Usage |
|-----------|---------|-------|
| React | 19+ | UI framework, state management |
| TypeScript | 6.0+ | Type safety for components and callbacks |
| CSS Modules | Native | Component-scoped styling for dialog |
| Node.js | 20.19+ or 22.12+ | Runtime |

### Code Patterns to Follow

**1. Dialog Markup (Semantic HTML + Accessibility)**
```typescript
// MUST use role="dialog", aria-modal, aria-labelledby for screen readers
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="dialog-title"
  className={styles.deleteDialog}
>
  <h2 id="dialog-title">Are you sure?</h2>
  <p>This action cannot be undone.</p>
  <div className={styles.dialogActions}>
    <button onClick={onCancel}>Cancel</button>
    <button onClick={onConfirm}>Confirm Delete</button>
  </div>
</div>
```

**2. Focus Management (Accessibility)**
```typescript
// Auto-focus first button (Cancel) when dialog opens
// Use useEffect + useRef
useEffect(() => {
  if (isOpen && cancelButtonRef.current) {
    cancelButtonRef.current.focus()
  }
}, [isOpen])
```

**3. Keyboard Handling (Escape key closes)**
```typescript
useEffect(() => {
  if (!isOpen) return

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [isOpen, onCancel])
```

**4. Error Handling (Try-catch around deletion)**
```typescript
const handleConfirmDelete = async () => {
  try {
    deleteSubscription(subscriptionToDelete.id)
    setDeleteDialogOpen(false)
    // Success handling happens via context error state
  } catch (error) {
    console.error('Delete failed:', error)
    setError('Failed to delete subscription. Please try again.')
  }
}
```

**5. Modal Overlay (Visual Feedback)**
```css
/* DeleteConfirmationDialog.module.css */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialogActions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.dialogActions button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

## 🏗️ ARCHITECTURE COMPLIANCE

### File Organization
```
src/
  components/
    SubscriptionRow/
      SubscriptionRow.tsx           ← MODIFY: Add onDeleteClick prop + button
      SubscriptionRow.module.css    ← No changes needed
      SubscriptionRow.test.tsx      ← ADD: Test Delete button handler
    DeleteConfirmationDialog/       ← NEW FOLDER
      DeleteConfirmationDialog.tsx  ← CREATE: Dialog component
      DeleteConfirmationDialog.module.css ← CREATE: Dialog styles
      DeleteConfirmationDialog.test.tsx   ← CREATE: Dialog tests
    SubscriptionList/
      SubscriptionList.tsx          ← MODIFY: Manage dialog state, pass props
  hooks/
    useSubscriptions.ts             ← NO CHANGES (deleteSubscription already exists)
  context/
    SubscriptionContext.tsx         ← NO CHANGES (DELETE_SUBSCRIPTION already implemented)
  types/
    subscription.ts                 ← NO CHANGES
  constants.ts                      ← NO CHANGES (ACTIONS.DELETE_SUBSCRIPTION exists)
```

### CSS Module Conventions
- Component-scoped CSS Modules (DeleteConfirmationDialog.module.css)
- BEM naming: `deleteDialog__overlay`, `deleteDialog__buttons`, `deleteDialog__button--primary`
- CSS variables for colors, spacing (from global.css)
- NO inline styles, NO Tailwind, NO styled-components

### Naming Conventions (MANDATORY)

**Components:**
- `DeleteConfirmationDialog.tsx`
- Function: `export function DeleteConfirmationDialog() {}`

**Props:**
- `subscription: Subscription` (object being deleted)
- `isOpen: boolean` (dialog visibility)
- `onCancel: () => void` (close without action)
- `onConfirm: () => void` (confirm deletion)

**Functions/Variables:**
- `handleDeleteClick()` (user clicks Delete button)
- `handleConfirmDelete()` (user confirms deletion)
- `handleCancelDelete()` (user cancels)
- `subscriptionToDelete` (state holding subscription)

**Constants:**
- `ACTIONS.DELETE_SUBSCRIPTION` (already defined)
- `STORAGE_KEY = 'subscriptions'` (already defined)

---

## 📦 LIBRARY & FRAMEWORK REQUIREMENTS

### React Hooks (Native)
**Already available — no new installs needed**

**Usage in DeleteConfirmationDialog:**
```typescript
import { useState, useEffect, useRef } from 'react'

export function DeleteConfirmationDialog({ isOpen, onCancel, onConfirm }: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-focus cancel button when dialog opens (accessibility)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])
}
```

### SubscriptionContext & useSubscriptions (Already Exists)
```typescript
// Already available from Story 2.3 + 2.4
const { deleteSubscription } = useSubscriptions()

// Call it when confirming deletion:
deleteSubscription(subscriptionId)
```

### CSS Variables (Already Defined)
**From Story 1.4 (global.css):**
- `--color-primary`, `--color-danger`, `--color-text`, `--color-bg`
- `--spacing-sm`, `--spacing-md`, `--spacing-lg`

**Usage in DeleteConfirmationDialog.module.css:**
```css
.dialog {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--spacing-lg);
}

.buttonDanger {
  background: var(--color-danger);
  color: white;
  padding: var(--spacing-md);
}
```

---

## 📂 FILE STRUCTURE REQUIREMENTS

### Files to CREATE (3 total)
1. **`src/components/DeleteConfirmationDialog/DeleteConfirmationDialog.tsx`**
   - Component with props: `subscription`, `isOpen`, `onCancel`, `onConfirm`
   - Modal dialog with semantic HTML (role="dialog", aria-modal)
   - Two buttons: Cancel, Confirm Delete
   - Keyboard handlers: Escape closes, Tab cycles through buttons
   - Focus management: Auto-focus Cancel button

2. **`src/components/DeleteConfirmationDialog/DeleteConfirmationDialog.module.css`**
   - Overlay styling (fixed position, semi-transparent backdrop)
   - Dialog box styling (centered, white background, shadow)
   - Button group layout (flex, right-aligned)
   - Focus/hover states for accessibility
   - Use BEM naming: `.deleteDialog__overlay`, `.deleteDialog__button--primary`

3. **`src/components/DeleteConfirmationDialog/DeleteConfirmationDialog.test.tsx`**
   - Tests for rendering, props, callbacks
   - Tests for keyboard navigation (Escape key)
   - Tests for accessibility attributes (role, aria-modal, aria-labelledby)
   - Tests for focus management

### Files to MODIFY (3 total)
1. **`src/components/SubscriptionRow/SubscriptionRow.tsx`**
   - Add prop: `onDeleteClick?: (subscription: Subscription) => void`
   - Add Delete button next to Edit button
   - Button click: `onClick={() => onDeleteClick?.(subscription)}`
   - Aria-label: `aria-label={`Delete ${name}`}`

2. **`src/components/SubscriptionList/SubscriptionList.tsx`** (or parent container)
   - Manage dialog state: `const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)`
   - Track subscription to delete: `const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)`
   - Handlers: `handleDeleteClick()`, `handleConfirmDelete()`, `handleCancelDelete()`
   - Render `<DeleteConfirmationDialog />` conditionally
   - Pass `onDeleteClick` to `<SubscriptionList>`

3. **`src/components/SubscriptionRow/SubscriptionRow.test.tsx`**
   - Add tests for Delete button visibility
   - Add tests for Delete button click triggers `onDeleteClick` callback
   - Add tests for aria-label on Delete button

### Files NOT to Modify
- `src/context/SubscriptionContext.tsx` — DELETE_SUBSCRIPTION reducer already complete
- `src/hooks/useSubscriptions.ts` — `deleteSubscription()` already exists
- `src/types/subscription.ts` — Subscription interface complete
- `src/constants.ts` — ACTIONS.DELETE_SUBSCRIPTION already defined
- `vite.config.ts`, `tsconfig.json`, `package.json` — No new dependencies

---

## 🧪 TESTING REQUIREMENTS

### Testing Framework & Setup
- **Framework:** Playwright (E2E tests in `tests/e2e/story-4-2-delete-subscription.spec.ts`)
- **Rendering:** React Testing Library (Unit tests)
- **Setup Pattern:** SubscriptionProvider wrapper (established in Story 3.5)

### E2E Tests (RED PHASE — Already Written, Waiting for Implementation)
**Location:** `tests/e2e/story-4-2-delete-subscription.spec.ts`

**Test Architect:** Murat (Master Test Architect)  
**Test Approach:** ATDD (Acceptance Test-Driven Development)

**Tests to Pass (5 Priority Tests):**

1. **[P0] E4.2-001: Happy path — delete subscription via UI**
   - Verify Delete button visible on Netflix row
   - Click Delete → dialog appears with "Are you sure?"
   - Dialog has Cancel and Confirm Delete buttons
   - Click Confirm Delete → Netflix removed from list (< 100ms)
   - Success toast: "Subscription deleted successfully"

2. **[P0] E4.2-002: Cancel workflow — delete, cancel, preserve subscription**
   - Click Delete on Netflix
   - Dialog appears
   - Click Cancel
   - Dialog closes, Netflix still visible
   - Refresh page → Netflix still exists (localStorage unchanged)

3. **[P0] E4.2-003: Persistence verification — delete, refresh, confirm persisted**
   - Delete Netflix
   - List shows Netflix removed
   - Refresh page
   - After reload, Netflix NOT in list (deletion persisted to localStorage)
   - Hulu and Spotify still present

4. **[P1] E4.2-004: Keyboard-only deletion — Tab, Enter, Escape navigation**
   - Tab to Netflix Delete button
   - Press Enter → Dialog opens
   - Tab to Confirm Delete button (or Escape to cancel)
   - Press Enter → Netflix deleted
   - Alternative: Press Escape → Dialog closes without deleting

5. **[P1] E4.2-005: Performance verification — delete from 100+ subscriptions**
   - App loaded with 100+ subscriptions
   - Click Delete on subscription #50
   - Dialog appears quickly
   - Confirm delete → deletion completes < 100ms
   - List remains responsive

### Unit Tests (Component Level)

**DeleteConfirmationDialog.test.tsx:**
```typescript
describe('DeleteConfirmationDialog', () => {
  test('renders when isOpen is true', () => {
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={true}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={false}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  test('calls onCancel when Cancel button clicked', () => {
    const onCancel = jest.fn()
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={true}
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  test('calls onConfirm when Confirm Delete button clicked', () => {
    const onConfirm = jest.fn()
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={true}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByText('Confirm Delete'))
    expect(onConfirm).toHaveBeenCalled()
  })

  test('closes dialog when Escape key pressed', () => {
    const onCancel = jest.fn()
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={true}
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  test('has proper accessibility attributes', () => {
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        isOpen={true}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'dialog-title')
  })
})
```

**SubscriptionRow.test.tsx (Add tests):**
```typescript
test('Delete button calls onDeleteClick when clicked', () => {
  const onDeleteClick = jest.fn()
  render(
    <SubscriptionRow
      subscription={mockSubscription}
      onDeleteClick={onDeleteClick}
    />
  )
  fireEvent.click(screen.getByText('Delete'))
  expect(onDeleteClick).toHaveBeenCalledWith(mockSubscription)
})

test('Delete button has aria-label for accessibility', () => {
  render(<SubscriptionRow subscription={mockSubscription} />)
  const deleteButton = screen.getByLabelText(`Delete ${mockSubscription.name}`)
  expect(deleteButton).toBeInTheDocument()
})
```

---

## 📖 PREVIOUS STORY INTELLIGENCE (Story 4.1: Edit Workflow)

### Key Learnings from Story 4.1
- **Dialog Pattern:** Story 4.1 used a form-in-modal for edit. Story 4.2 uses a simpler confirmation dialog.
- **State Management:** Story 4.1 managed edit state with `setEditingSubscription(null | Subscription)`. Story 4.2 uses similar pattern: `setDeleteDialogOpen` + `setSubscriptionToDelete`.
- **Accessibility:** Story 4.1 added keyboard nav and aria attributes. Story 4.2 follows same pattern: auto-focus, Escape key, semantic HTML.
- **Error Handling:** Story 4.1 showed that all reducer actions (UPDATE_SUBSCRIPTION) have error handling. Deletion already has this in DELETE_SUBSCRIPTION reducer.
- **Component Reuse:** Story 4.1 reused SubscriptionForm. Story 4.2 creates NEW DeleteConfirmationDialog component (simpler, purpose-specific).

### Code Patterns Already Established
```typescript
// Pattern from Story 4.1: Callback passing
interface SubscriptionRowProps {
  subscription: Subscription
  onEditClick?: (subscription: Subscription) => void // Story 4.1
  onDeleteClick?: (subscription: Subscription) => void // Story 4.2 — same pattern
}

// Pattern from Story 4.1: State management in parent
const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
// Story 4.2 follows same pattern:
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
```

---

## 🔧 LATEST TECH INFORMATION

### React 19 Dialog Patterns (Current Best Practices)
- **No Dialog API Requirement:** React 19 doesn't require the native `<dialog>` element; `<div role="dialog">` is sufficient and more compatible.
- **useRef + useEffect for Focus:** Standard approach for focus management in React (no new libraries needed).
- **Keyboard Handling:** `useEffect` with `addEventListener` is the recommended pattern for keyboard events.
- **Modal Overlay Pattern:** CSS fixed positioning with `z-index` is standard; no CSS library needed.

### TypeScript Strict Mode Patterns (Story 1.2)
- All props must be explicitly typed
- Callbacks use `() => void` or specific return types
- Conditional rendering uses discriminated unions or null checks
- Null checks: `if (!isOpen) return null` (pattern used in other components)

### localStorage Error Handling (Story 2.2)
- Already handled by `saveSubscriptionsToStorage()` utility
- Returns `boolean`: `true` if success, `false` if failed
- All errors caught and converted to user-friendly messages in reducer
- No need for new error handling logic in Story 4.2

---

## 📚 PROJECT CONTEXT REFERENCE

### Architecture Decisions Relevant to This Story
1. **Data Persistence:** localStorage (Story 2.2) — deletion must persist
2. **State Management:** useReducer + Context (Story 2.3) — DELETE_SUBSCRIPTION action already implemented
3. **Form Handling:** React Hook Form (Story 1.3) — not needed for dialog (simple confirmation)
4. **Styling:** CSS Modules + BEM (Story 1.4) — use for DeleteConfirmationDialog
5. **Error Handling:** Try-catch + user-friendly messages (Story 8+) — apply to deletion

### Subscription Data Structure
```typescript
interface Subscription {
  id: string                    // UUID (e.g., "sub-12345")
  name: string                  // User-provided name (e.g., "Netflix")
  cost: number                  // Monthly cost in USD
  dueDate: number              // Day of month (1-31)
  createdAt: number            // Timestamp (never changes)
  updatedAt: number            // Timestamp (updated on edits)
}
```

### File Naming Conventions
- **Components:** PascalCase (DeleteConfirmationDialog.tsx)
- **Hooks:** camelCase (useSubscriptions.ts)
- **Utilities:** camelCase (localStorageManager.ts)
- **CSS Modules:** Match component (DeleteConfirmationDialog.module.css)
- **Types:** camelCase (subscription.ts)

### Accessibility Standards (WCAG 2.1 Level A)
- Semantic HTML: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Keyboard navigation: Tab, Enter, Escape
- Focus management: Auto-focus first button, visible focus indicators
- Color contrast: Minimum 4.5:1 for text on background
- Screen reader support: All buttons have labels (aria-label or text content)

---

## ✅ STORY COMPLETION STATUS

**Status:** Ready for Development  
**All Artifacts Complete:** Yes  
- ✅ User story statement defined
- ✅ 10 Acceptance criteria mapped to E2E tests  
- ✅ Component architecture documented
- ✅ State management pattern provided (DELETE_SUBSCRIPTION already exists)
- ✅ File structure and modification list provided
- ✅ Testing requirements defined (E2E + unit tests)
- ✅ Code patterns established from previous stories
- ✅ Architecture compliance requirements listed
- ✅ TypeScript strict mode guidelines provided
- ✅ Accessibility requirements documented

**Dependencies:** 
- ✅ Story 2.3: DELETE_SUBSCRIPTION reducer action (COMPLETE)
- ✅ Story 2.4: useSubscriptions hook with deleteSubscription (COMPLETE)
- ✅ Story 3.2: SubscriptionRow component (COMPLETE)
- ⏳ Story 4.4: Toast notification system (needed for success message display after deletion)

**Next Steps for Developer:**
1. Review E2E test file: `tests/e2e/story-4-2-delete-subscription.spec.ts`
2. Create DeleteConfirmationDialog component (3 files: .tsx, .module.css, .test.tsx)
3. Add Delete button and onDeleteClick prop to SubscriptionRow
4. Manage dialog state in SubscriptionList or parent Dashboard component
5. Run E2E tests in RED phase to verify all ACs pass
6. Pair with Story 4.4 (toast notifications) for complete success feedback
7. Run full test suite and code review before marking complete

**Dev Agent Confidence:** HIGH  
All context provided, no ambiguity, clear acceptance criteria, E2E tests ready, previous patterns established.
