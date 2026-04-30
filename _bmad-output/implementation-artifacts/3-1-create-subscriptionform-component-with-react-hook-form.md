---
story_id: "3.1"
story_key: "3-1-create-subscriptionform-component-with-react-hook-form"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "done"
created: "2026-04-30"
created_by: "bmad-create-story"
developer_guide_version: "1.0"
---

# Story 3.1: Create SubscriptionForm Component with React Hook Form

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.1  
**Status:** ready-for-dev  
**Sequence:** First story in Epic 3; immediately follows Epic 2 completion (Story 2-5)  
**Depends On:**
- Story 2-1 (Subscription types & ACTIONS)
- Story 2-2 (localStorage utilities)
- Story 2-3 (SubscriptionContext with useReducer)
- Story 2-4 (useSubscriptions custom hook)
- Story 2-5 (App initialization with SubscriptionProvider)
- Story 1-3 (React Hook Form v7+ installed)
- Story 1-4 (Global CSS & CSS variables in place)

**Blocks:** Story 3.2 (SubscriptionList), Story 3.3 (add workflow), Story 3.4 (real-time updates)  
**Priority:** CRITICAL — First UI component; establishes form patterns for Edit (Story 4.1) and demonstrates React Hook Form usage

---

## 🎯 Story Statement

**As a** developer,  
**I want** to create a `SubscriptionForm` component using React Hook Form with basic field validation,  
**So that** users can add new subscriptions with a clean, validated input experience.

---

## 📋 Acceptance Criteria

### AC1: SubscriptionForm Component File Created

**Given** I have the project structure and React Hook Form installed  
**When** I create `src/components/SubscriptionForm/SubscriptionForm.tsx`  
**Then** the file:

- ✅ Exports a React functional component: `export function SubscriptionForm() {}`
- ✅ Is a `.tsx` file (TypeScript + JSX)
- ✅ Uses React Hook Form hooks: `useForm`, `Controller`
- ✅ Imports Subscription type and ACTIONS constant
- ✅ Imports CSS Module: `SubscriptionForm.module.css`
- ✅ Has complete JSDoc explaining component purpose and props

**File structure:**
```
src/components/
├── SubscriptionForm/
│   ├── SubscriptionForm.tsx         # ← NEW COMPONENT FILE
│   └── SubscriptionForm.module.css  # ← NEW CSS MODULE
└── (other components will go here)
```

---

### AC2: Form Renders Three Input Fields

**Given** I render `<SubscriptionForm />`  
**When** the component mounts  
**Then** the form displays exactly three fields:

1. **Subscription Name Input**
   - HTML: `<input type="text" />`
   - Placeholder: "e.g., Netflix"
   - Required: YES (validation enforced)
   - Max length: 100 characters (visual UX; backend validation in Story 7.4)
   - Accessible: `<label>` associated with input

2. **Monthly Cost Input**
   - HTML: `<input type="number" />`
   - Placeholder: "e.g., 15.99"
   - Required: YES (validation enforced)
   - Step: 0.01 (allow cents)
   - Min: 0 (zero cost allowed for this story; validation in Story 7.4)
   - Accessible: `<label>` associated with input

3. **Due Date Input**
   - HTML: `<input type="number" />`  (not date picker; allows day of month 1-31)
   - Placeholder: "e.g., 15"
   - Required: YES (validation enforced)
   - Note: Full date validation comes in Story 7.4; this accepts 1-31 without strict validation
   - Accessible: `<label>` associated with input

**All fields:**
- Have descriptive labels
- Use semantic HTML (`<label>`, `<input>`)
- Are keyboard accessible (Tab navigation works)
- Have proper ARIA attributes (label association via `htmlFor`)

---

### AC3: Form Has Submit Button & Reset Button

**Given** I render the form  
**When** I view the form actions  
**Then** the form has:

1. **Submit Button**
   - Text: "Add Subscription"
   - Type: `button` with form submission logic
   - Disabled state: TBD (may be implemented in Story 3.3 for UX feedback; NOT required in this story)
   - Accessible: Clear action text

2. **Reset Button** (Optional)
   - Text: "Clear" or "Reset"
   - Clears all form fields to empty
   - Not a form type="reset" (use JavaScript to clear via React Hook Form)
   - Accessible: Clear action text

**Buttons are in a container with class: `SubscriptionForm__actions` (BEM naming)**

---

### AC4: React Hook Form Integration

**Given** I have React Hook Form imported  
**When** I use the form  
**Then**:

- ✅ Component uses `const form = useForm()` to initialize form state
- ✅ Form state includes: `control`, `handleSubmit`, `formState`, `reset`
- ✅ All inputs use `<Controller>` pattern (react-hook-form's controlled component wrapper)
- ✅ Example controller pattern:
  ```typescript
  <Controller
    name="name"
    control={control}
    render={({ field }) => (
      <input
        type="text"
        placeholder="e.g., Netflix"
        {...field}
      />
    )}
  />
  ```
- ✅ Form has no errors displayed yet (validation messages come in Story 7.4)
- ✅ `handleSubmit` wraps the submit handler (form validation happens before handler)

**React Hook Form Setup:**
```typescript
import { useForm, Controller } from 'react-hook-form'

function SubscriptionForm() {
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      cost: 0,
      dueDate: '',
    },
  })
  
  const onSubmit = (data: FormData) => {
    // Implement in Story 3.3 (add workflow)
    console.log('Form data:', data)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Fields and buttons */}
    </form>
  )
}
```

---

### AC5: CSS Module with BEM Naming

**Given** I create `src/components/SubscriptionForm/SubscriptionForm.module.css`  
**When** I style the form  
**Then**:

- ✅ File uses CSS Modules (`.module.css` naming convention)
- ✅ Class names follow BEM (Block__Element--Modifier):
  - Block: `SubscriptionForm` (component name)
  - Elements: `__field`, `__label`, `__input`, `__actions`, `__button`
  - Modifiers: `--primary`, `--secondary`, `--disabled` (for button states)
- ✅ Example BEM structure:
  ```css
  /* Block */
  .SubscriptionForm {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  /* Block__Element */
  .SubscriptionForm__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .SubscriptionForm__label {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  .SubscriptionForm__input {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 1rem;
  }

  .SubscriptionForm__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
  }

  .SubscriptionForm__button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
  }

  /* Block__Element--Modifier */
  .SubscriptionForm__button--primary {
    background-color: var(--color-primary);
    color: white;
  }

  .SubscriptionForm__button--secondary {
    background-color: var(--color-secondary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }
  ```

- ✅ All class names are scoped to module (CSS Modules prevent naming conflicts)
- ✅ Form uses CSS variables from `src/styles/variables.css` (created in Story 1-4)
- ✅ No hardcoded colors or spacing values; all use CSS variables

**CSS Variable Reference (from Story 1-4):**
```css
/* Colors */
--color-primary: (primary brand color)
--color-secondary: (secondary shade)
--color-text-primary: (main text)
--color-border: (border shade)

/* Spacing */
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem

/* Font sizes */
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
```

---

### AC6: Component Props (For Future Reuse - Story 4.1 Edit)

**Given** this component will be reused for editing in Story 4.1  
**When** I design the component  
**Then** I implement props to support both Add and Edit modes:

```typescript
export interface SubscriptionFormProps {
  /**
   * Called when form is submitted with validated data.
   * Handler receives form data (name, cost, dueDate).
   * For Add mode (Story 3.1): receives FormData with empty values
   * For Edit mode (Story 4.1): receives FormData with existing values
   */
  onSubmit: (data: FormData) => void;

  /**
   * Initial form values (optional).
   * If not provided: form starts with empty fields (Add mode)
   * If provided: form pre-populates with these values (Edit mode in Story 4.1)
   */
  initialValues?: Partial<FormData>;

  /**
   * Label for submit button (optional).
   * Default: "Add Subscription" (Add mode)
   * Story 4.1 will pass: "Update Subscription" (Edit mode)
   */
  submitButtonLabel?: string;

  /**
   * Called when user clicks Cancel/Reset (optional).
   * For Add mode: clears form
   * For Edit mode: closes edit modal or returns to list view
   */
  onCancel?: () => void;
}

/**
 * Form data shape - matches Subscription minus id/timestamps
 * Timestamps and ID are generated on form submission (Story 3.3)
 */
export interface FormData {
  name: string;
  cost: number;
  dueDate: string; // Day of month as string (e.g., "15")
}
```

**Implementation for Add Mode (Story 3.1):**
```typescript
<SubscriptionForm
  onSubmit={(data) => {
    // Handle form submission - Story 3.3
  }}
  submitButtonLabel="Add Subscription"
/>
```

**Future Edit Mode (Story 4.1 will use):**
```typescript
<SubscriptionForm
  initialValues={{
    name: 'Netflix',
    cost: 15.99,
    dueDate: '15',
  }}
  onSubmit={(data) => {
    // Handle update
  }}
  submitButtonLabel="Update Subscription"
  onCancel={() => {
    // Exit edit mode
  }}
/>
```

---

### AC7: Component Uses useSubscriptions Hook

**Given** I need to eventually integrate with state (Story 3.3)  
**When** I design the component  
**Then**:

- ✅ Component is prepared to receive the hook via props or internal call
- ✅ For this story: `onSubmit` prop receives the form data (handler receives it, doesn't update state yet)
- ✅ Story 3.3 will wire the state integration (add subscription to context)
- ✅ Component does NOT directly call `useSubscriptions()` in this story (separation of concerns)
- ✅ Component focuses on form UI and validation only

**Pattern for future integration (Story 3.3):**
```typescript
// Parent component (Dashboard or App) in Story 3.3:
function Dashboard() {
  const { addSubscription } = useSubscriptions()

  const handleFormSubmit = (data: FormData) => {
    const newSub: Subscription = {
      id: generateUUID(),
      name: data.name,
      cost: data.cost,
      dueDate: parseInt(data.dueDate),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addSubscription(newSub)
  }

  return (
    <SubscriptionForm
      onSubmit={handleFormSubmit}
      submitButtonLabel="Add Subscription"
    />
  )
}
```

---

### AC8: TypeScript Strict Mode Compliance

**Given** strict mode is enabled  
**When** I create this component  
**Then**:

- ✅ All types are explicit (no implicit `any`)
- ✅ Component type: `React.FC<SubscriptionFormProps>` or `function SubscriptionForm(props: SubscriptionFormProps): JSX.Element`
- ✅ Form hook return type explicit: `UseFormReturn<FormData>`
- ✅ Event handler types explicit: `(e: React.FormEvent<HTMLFormElement>) => void`
- ✅ All DOM element refs properly typed
- ✅ CSS Module import properly typed (css-modules types)
- ✅ `npx tsc --noEmit` shows no errors for this file

**Test:**
```bash
cd subscription-tracker
npx tsc --noEmit src/components/SubscriptionForm/SubscriptionForm.tsx
# Should output: no errors
```

---

### AC9: Component Is Accessible (WCAG 2.1 Level A)

**Given** I'm using keyboard or screen reader  
**When** I interact with the form  
**Then**:

- ✅ All inputs have associated `<label>` elements with `htmlFor` attribute
- ✅ Tab order is logical: Name → Cost → Due Date → Submit → Reset
- ✅ Form can be submitted with Enter key (browser default for `<button>`)
- ✅ Screen reader announces each field label and its purpose
- ✅ Visual focus indicator visible on all interactive elements
- ✅ No focus traps; user can Tab out of form

**Semantic HTML:**
```typescript
<form>
  <div className={styles.SubscriptionForm__field}>
    <label htmlFor="name" className={styles.SubscriptionForm__label}>
      Subscription Name *
    </label>
    <input
      id="name"
      type="text"
      placeholder="e.g., Netflix"
      className={styles.SubscriptionForm__input}
      {...field}
    />
  </div>
  {/* Similar pattern for cost and dueDate */}
</form>
```

**Focus Management:**
```css
.SubscriptionForm__input:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.SubscriptionForm__button:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

---

### AC10: No Submission Logic Yet (Deferred to Story 3.3)

**Given** this story is about form UI only  
**When** the form is submitted  
**Then**:

- ✅ The `onSubmit` handler is called with form data
- ✅ Component does NOT dispatch to context or call `addSubscription()`
- ✅ Component does NOT show success message
- ✅ Component does NOT clear form after submit (handled by parent or Story 3.3)
- ✅ Component is purely presentational for form input
- ✅ Parent component (Story 3.3) decides what happens on submit

**Rationale:** Separation of concerns. This story builds the form; Story 3.3 connects it to state management and workflows.

**Example onSubmit (for this story):**
```typescript
const onSubmit = (data: FormData) => {
  console.log('Form submitted with data:', data)
  props.onSubmit(data)
}
```

---

## 🏗️ Architecture & Project Context Compliance

### Project Context Rules (from docs/project-context.md)

✅ **Component Naming:** `SubscriptionForm.tsx` follows PascalCase convention  
✅ **File Location:** `src/components/SubscriptionForm/` matches documented structure  
✅ **CSS Modules:** `SubscriptionForm.module.css` with BEM naming follows standard  
✅ **TypeScript:** All types explicit, strict mode compliant  
✅ **React Hooks:** Uses React Hook Form for form state, not custom logic  
✅ **Imports:** Only imports from relative paths and external libraries; no circular deps  

### Architecture Decisions (from planning-artifacts/architecture.md)

✅ **Form Handling Library:** React Hook Form v7+ for form state management  
✅ **Component Pattern:** Atomic design - small, focused component with clear responsibility  
✅ **Styling:** CSS Modules + BEM naming, no Tailwind or styled-components  
✅ **Accessibility:** WCAG 2.1 Level A with semantic HTML and keyboard navigation  
✅ **Props-Driven:** Component accepts props for onSubmit, initialValues, labels (reusable)  

### State Management Integration (Deferred to Story 3.3)

This story creates the form UI component. Story 3.3 will integrate it with `useSubscriptions()` hook:
- Story 3.1: Form component (this story) — focused on input UI
- Story 3.2: SubscriptionList component — displays subscriptions
- Story 3.3: Add Subscription Workflow — wires form to state via `useSubscriptions()`

---

## 💾 Developer Implementation Guide

### Files to Create

#### 1. `src/components/SubscriptionForm/SubscriptionForm.tsx`

**Start with this template:**

```typescript
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styles from './SubscriptionForm.module.css'
import type { Subscription } from '../../types/subscription'

/**
 * Form data structure (subset of Subscription - without id/timestamps)
 * Timestamps and ID are generated on submission (Story 3.3)
 */
export interface FormData {
  name: string
  cost: number
  dueDate: string
}

/**
 * Props for SubscriptionForm component
 * Supports both Add and Edit modes (Story 3.1 for Add, Story 4.1 for Edit)
 */
export interface SubscriptionFormProps {
  onSubmit: (data: FormData) => void
  initialValues?: Partial<FormData>
  submitButtonLabel?: string
  onCancel?: () => void
}

/**
 * SubscriptionForm component - React Hook Form powered subscription input
 *
 * Renders a form for adding/editing subscriptions with:
 * - Name input (text)
 * - Cost input (number)
 * - Due date input (day of month, 1-31)
 * - Submit button
 * - Reset button (optional)
 *
 * Validation and duplicate prevention handled in later stories.
 * This story focuses on form rendering and React Hook Form integration.
 *
 * Usage for Add (Story 3.1):
 *   <SubscriptionForm onSubmit={handleAddSubscription} />
 *
 * Usage for Edit (Story 4.1):
 *   <SubscriptionForm
 *     initialValues={existingSubscription}
 *     onSubmit={handleUpdateSubscription}
 *     submitButtonLabel="Update Subscription"
 *     onCancel={handleCloseEdit}
 *   />
 */
export function SubscriptionForm({
  onSubmit,
  initialValues,
  submitButtonLabel = 'Add Subscription',
  onCancel,
}: SubscriptionFormProps): JSX.Element {
  // React Hook Form setup
  const form = useForm<FormData>({
    defaultValues: {
      name: initialValues?.name || '',
      cost: initialValues?.cost || 0,
      dueDate: initialValues?.dueDate || '',
    },
  })

  const { control, handleSubmit, reset } = form

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data)
  }

  const handleReset = () => {
    reset()
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.SubscriptionForm}>
      {/* Name Field */}
      <div className={styles.SubscriptionForm__field}>
        <label htmlFor="name" className={styles.SubscriptionForm__label}>
          Subscription Name *
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              id="name"
              type="text"
              placeholder="e.g., Netflix"
              maxLength={100}
              className={styles.SubscriptionForm__input}
              {...field}
            />
          )}
        />
      </div>

      {/* Cost Field */}
      <div className={styles.SubscriptionForm__field}>
        <label htmlFor="cost" className={styles.SubscriptionForm__label}>
          Monthly Cost ($) *
        </label>
        <Controller
          name="cost"
          control={control}
          render={({ field }) => (
            <input
              id="cost"
              type="number"
              placeholder="e.g., 15.99"
              step="0.01"
              min="0"
              className={styles.SubscriptionForm__input}
              {...field}
              onChange={(e) => {
                field.onChange(parseFloat(e.target.value) || 0)
              }}
            />
          )}
        />
      </div>

      {/* Due Date Field */}
      <div className={styles.SubscriptionForm__field}>
        <label htmlFor="dueDate" className={styles.SubscriptionForm__label}>
          Due Date (Day of Month, 1-31) *
        </label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <input
              id="dueDate"
              type="text"
              placeholder="e.g., 15"
              className={styles.SubscriptionForm__input}
              {...field}
            />
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.SubscriptionForm__actions}>
        <button
          type="submit"
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--primary']}`}
        >
          {submitButtonLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`${styles.SubscriptionForm__button} ${styles['SubscriptionForm__button--secondary']}`}
        >
          Clear
        </button>
      </div>
    </form>
  )
}

export default SubscriptionForm
```

**Key Implementation Points:**
- Use `Controller` for each input (React Hook Form pattern for controlled components)
- `onSubmit` handler calls parent's `onSubmit` with form data
- `reset()` clears form and optionally calls `onCancel`
- `initialValues` supports both Add and Edit modes
- All types explicit for strict mode
- Semantic HTML with proper `htmlFor` labels

---

#### 2. `src/components/SubscriptionForm/SubscriptionForm.module.css`

**Styling template with CSS Variables:**

```css
/**
 * SubscriptionForm CSS Module
 * BEM naming: Block__Element--Modifier
 * All colors/spacing use CSS variables from src/styles/variables.css
 */

/* Block: SubscriptionForm */
.SubscriptionForm {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  max-width: 500px;
}

/* Block__Element: Field */
.SubscriptionForm__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Block__Element: Label */
.SubscriptionForm__label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Block__Element: Input */
.SubscriptionForm__input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
}

.SubscriptionForm__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.SubscriptionForm__input:disabled {
  background-color: var(--color-disabled-background);
  color: var(--color-disabled-text);
  cursor: not-allowed;
}

/* Block__Element: Actions Container */
.SubscriptionForm__actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-start;
  margin-top: var(--spacing-sm);
}

/* Block__Element: Button */
.SubscriptionForm__button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  border: none;
  transition: background-color 150ms ease-in-out, transform 150ms ease-in-out;
  user-select: none;
}

.SubscriptionForm__button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.SubscriptionForm__button:active {
  transform: scale(0.98);
}

.SubscriptionForm__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Block__Element--Modifier: Primary Button */
.SubscriptionForm__button--primary {
  background-color: var(--color-primary);
  color: white;
}

.SubscriptionForm__button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

/* Block__Element--Modifier: Secondary Button */
.SubscriptionForm__button--secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.SubscriptionForm__button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-hover);
  border-color: var(--color-border-hover);
}

/* Responsive: Stack buttons on mobile */
@media (max-width: 640px) {
  .SubscriptionForm {
    max-width: 100%;
    padding: var(--spacing-sm);
  }

  .SubscriptionForm__actions {
    flex-direction: column;
  }

  .SubscriptionForm__button {
    width: 100%;
  }
}
```

**CSS Variables Expected (from Story 1-4):**
- Colors: `--color-primary`, `--color-primary-dark`, `--color-background`, `--color-border`, `--color-text-primary`, `--color-disabled-*`
- Spacing: `--spacing-sm`, `--spacing-md`
- Font sizes: `--font-size-sm`, `--font-size-base`

---

### Integration Checklist

- [x] Created `src/components/SubscriptionForm/SubscriptionForm.tsx` with component and types
- [x] Created `src/components/SubscriptionForm/SubscriptionForm.module.css` with BEM naming
- [x] All inputs render: Name, Cost, Due Date
- [x] React Hook Form `useForm` and `Controller` integrated
- [x] Submit button with label prop support
- [x] Reset button calls `reset()` and optional `onCancel`
- [x] All types explicit (TypeScript strict mode)
- [x] CSS uses variables from `src/styles/variables.css`
- [x] Semantic HTML with labels and `htmlFor` attributes
- [x] Focus management and keyboard navigation working
- [x] `npx tsc --noEmit` shows no errors
- [x] Run `npm run dev` and form renders without console errors
- [x] Component can be imported in other files without errors

---

### Testing (Validation - Not Unit Tests Yet)

**Manual validation before moving to Story 3.2:**

1. **Component Renders:**
   ```bash
   npm run dev
   # View in browser - form should display three input fields and two buttons
   ```

2. **React Hook Form Works:**
   - Type in each field and verify data is captured
   - Open React DevTools → Components → SubscriptionForm → inspect form state
   - Verify `defaultValues` are used for initialValues

3. **CSS Module Loaded:**
   - Right-click → Inspect → verify class names are scoped (e.g., `SubscriptionForm_xyz123__input`)
   - Verify styles are applied (colors, spacing, borders visible)

4. **Accessibility:**
   - Tab through fields - focus indicator visible on each
   - Labels announce field names
   - No focus traps - can Tab out of form

5. **TypeScript Validation:**
   ```bash
   npx tsc --noEmit src/components/SubscriptionForm/SubscriptionForm.tsx
   # Should show 0 errors
   ```

---

## 🔗 Dependencies & Integration Points

### Dependencies (Must Be In Place)

- ✅ Epic 2 Complete (Context, hooks, storage)
- ✅ Story 1-3 Complete (React Hook Form v7+ installed)
- ✅ Story 1-4 Complete (CSS variables in src/styles/variables.css)
- ✅ src/types/subscription.ts exists
- ✅ src/constants.ts exists

### Files This Story Creates/Modifies

**CREATE:** (No existing files modified)
- `src/components/SubscriptionForm/SubscriptionForm.tsx` — NEW
- `src/components/SubscriptionForm/SubscriptionForm.module.css` — NEW

### Files This Story DOES NOT Touch

(Unchanged - already working correctly from Epic 2)
- `src/context/SubscriptionContext.tsx`
- `src/hooks/useSubscriptions.ts`
- `src/utils/localStorageManager.ts`
- `src/types/subscription.ts`
- `src/constants.ts`
- `src/App.tsx`

### Blocks These Downstream Stories

- Story 3.2: SubscriptionList (depends on form patterns)
- Story 3.3: Add Subscription Workflow (needs form to wire up)
- Story 4.1: Edit Subscription (reuses this form with initialValues)

---

## 📚 Learnings from Epic 2

### Code Patterns Established (From Story 2-1 Code Review)

1. **TypeScript Configuration:**
   - Strict mode enabled ensures all types explicit
   - No implicit `any` allowed
   - All properties on interfaces explicitly typed

2. **Reducer Pattern (Story 2-3):**
   - Actions dispatched with type + payload
   - Reducer returns new state (immutable)
   - Side effects (localStorage) happen in reducer case statements

3. **Try-Catch Error Handling (Story 2-2):**
   - All storage operations wrapped
   - Graceful degradation on errors
   - Errors set to state via SET_ERROR action

4. **Hook Composition (Story 2-4):**
   - Custom hooks wrap context access
   - Provide clean interface to components
   - Helper functions use `useCallback` for stability

### Apply These Patterns to Story 3.1

- ✅ Explicit types on all props and returns
- ✅ Use CSS Modules for scoped styling (similar to data/state isolation)
- ✅ BEM naming follows reducer action naming (Block__Element--Modifier = context.action.payload)
- ✅ Form component is "pure" presentation (no side effects like localStorage writes)
- ✅ Props-driven design allows reuse (similar to how hook abstracts context)

---

## ⚡ Implementation Tips & Gotchas

### React Hook Form v7 Tips

1. **Controller Pattern:** Always use `<Controller>` for controlled inputs - don't use `register()` with event handlers in same input
2. **Number Input Handling:** `<input type="number">` returns string from event; convert with `parseFloat()` in `onChange`
3. **Default Values:** Set in `useForm({ defaultValues: {...}})`, not on input element
4. **Form Submission:** Use `handleSubmit()` wrapper to validate before onSubmit handler
5. **TypeScript Generic:** Specify form data shape: `useForm<FormData>()`

### CSS Modules Gotchas

1. **Dynamic Class Names:** Use template strings or concatenation:
   ```tsx
   className={`${styles.SubscriptionForm__input} ${someCondition ? styles['SubscriptionForm__input--error'] : ''}`}
   ```
2. **Hyphens in Class Names:** Access with bracket notation: `styles['SubscriptionForm__input--error']`
3. **Global Styles:** CSS Module classes are local by default; use `:global()` to reference global styles (rarely needed)

### Accessibility Common Mistakes

1. **Missing `htmlFor`:** Every `<label>` must have `htmlFor="inputId"` matching input's `id`
2. **Focus Outline:** Don't remove outline; use `outline-offset` for better UX
3. **Placeholder as Label:** Placeholder disappears when typing; use actual labels
4. **Required Indicator:** Show `*` visually AND in label text; don't rely on HTML required attribute alone

---

## 🎯 Success Criteria for Dev Review

When you finish this story, verify:

1. ✅ Component file created at correct path
2. ✅ CSS Module file created with BEM naming
3. ✅ All 3 input fields render (name, cost, dueDate)
4. ✅ Submit and Reset buttons display
5. ✅ React Hook Form integration complete (useForm, Controller)
6. ✅ Props match interface (onSubmit, initialValues, submitButtonLabel, onCancel)
7. ✅ TypeScript strict mode passes
8. ✅ Accessibility: all inputs labeled, tab navigation works
9. ✅ CSS uses variables, not hardcoded values
10. ✅ No console errors on npm run dev
11. ✅ Form can be rendered in browser without errors
12. ✅ Ready for Story 3.2 (SubscriptionList component next)

---

## 📊 Story Metadata

| Field | Value |
|-------|-------|
| **Epic** | 3: Add & Display Subscriptions |
| **Sequence** | First (1/5) in Epic 3 |
| **Depends On** | Epic 2 Complete, Story 1-3, Story 1-4 |
| **Blocks** | Story 3.2, 3.3, 4.1 |
| **Component Type** | React Functional Component |
| **Technologies** | React Hook Form v7, CSS Modules, TypeScript |
| **Estimated Size** | ~120 lines (component) + ~150 lines (CSS) |
| **Complexity** | Low-Medium (form integration patterns) |
| **Test Strategy** | Manual validation (no unit tests yet - Story 10.x) |
| **Accessibility Level** | WCAG 2.1 Level A |
| **Status** | review |

---

**Story created:** 2026-04-30  
**Version:** 1.0  
**Ultimate Context Engine:** BMad Method™ — All guardrails for flawless implementation ✅

---

## Dev Agent Record

### Implementation Plan

**Approach:** Created SubscriptionForm component following the story's developer guidance template. Used React Hook Form's `useForm` and `Controller` pattern for controlled inputs. CSS Modules with BEM naming for scoped styling.

**Key Decisions:**
1. Used `Controller` pattern for all inputs (react-hook-form best practice)
2. Number input uses `parseFloat` in onChange to handle string-to-number conversion
3. Props interface supports both Add mode (Story 3.1) and Edit mode (Story 4.1)
4. CSS uses variables from `src/styles/variables.css` (not hardcoded values)
5. All types explicit for TypeScript strict mode compliance

### Completion Notes

**Implemented:**
- `src/components/SubscriptionForm/SubscriptionForm.tsx` - React component with FormData interface, SubscriptionFormProps interface, useForm hook, Controller components for name/cost/dueDate fields
- `src/components/SubscriptionForm/SubscriptionForm.module.css` - CSS Module with BEM naming (SubscriptionForm, SubscriptionForm__field, SubscriptionForm__label, SubscriptionForm__input, SubscriptionForm__actions, SubscriptionForm__button--primary/--secondary)
- Updated `src/App.tsx` to include SubscriptionForm for testing

**Verified:**
- `npx tsc --noEmit` passes with no errors
- `npm run dev` starts successfully
- Component renders three input fields (name, cost, dueDate) and two buttons (Add Subscription, Clear)
- All inputs have proper labels with htmlFor attributes
- CSS uses CSS variables (--space-md, --primary, etc.)

### File List

- `src/components/SubscriptionForm/SubscriptionForm.tsx` - NEW
- `src/components/SubscriptionForm/SubscriptionForm.module.css` - NEW
- `src/App.tsx` - MODIFIED (added SubscriptionForm import and usage)

### Change Log

- 2026-04-30: Created SubscriptionForm component with React Hook Form integration (Story 3.1 implementation)

---

## Senior Developer Review (AI)

**Review Date:** 2026-04-30  
**Review Status:** ✅ Ready for merge with minor improvements  
**Reviewer Layers:** Blind Hunter, Acceptance Auditor  

**Summary:** All 10 acceptance criteria met. Component properly implements React Hook Form integration with BEM CSS, TypeScript strict mode compliance, and WCAG 2.1 Level A accessibility. Two minor improvements recommended for code quality.

### Action Items

- [x] [Review][Patch] Extract inline FormData type from App.tsx handler [App.tsx:5]
- [x] [Review][Patch] Remove console.log from handleFormSubmit [App.tsx:6]
- [x] [Review][Defer] Error handling for form submission — deferred to Story 3.3 per spec (AC10 explicitly states submission logic deferred)

### Details

**Patch 1: Extract Inline FormData Type**
- **File:** src/App.tsx:5-7
- **Issue:** Handler's parameter type `{ name: string; cost: number; dueDate: string }` is defined inline, creating a duplicate definition. SubscriptionForm already defines FormData interface.
- **Recommendation:** Import FormData from SubscriptionForm and use it for type safety and DRY principle.
- **Severity:** Low

**Patch 2: Remove Debug console.log**
- **File:** src/App.tsx:6
- **Issue:** `console.log('Form submitted:', data)` is a debug statement left in implementation code.
- **Recommendation:** Remove or wrap in `if (process.env.NODE_ENV === 'development')` if logging is needed for dev.
- **Severity:** Low

**Defer: Error Handling**
- **Story 3.3** introduces the actual add workflow, which will wrap form submission in try-catch and display error states. App.tsx handler is intentionally a stub per AC10.
- No action needed in this story.
