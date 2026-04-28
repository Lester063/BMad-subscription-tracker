---
project: BMad-subscription-tracker
created: 2026-04-28
last_updated: 2026-04-28
architecture_version: COMPLETE
implementation_ready: true
---

# Project Context: BMad Subscription Tracker

**Purpose:** Critical rules and patterns for AI agent implementation consistency.

---

## Technology Stack (REQUIRED VERSIONS)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19+ | UI framework |
| **TypeScript** | 6.0+ | Type safety |
| **Vite** | 6.0+ | Build tool |
| **React Hook Form** | 7+ | Form management |
| **Node.js** | 20.19+ or 22.12+ | Runtime |

**Critical:** Create project with exact command:
```bash
npm create vite@latest subscription-tracker -- --template react-ts
```

---

## Core Architectural Decisions (IMMUTABLE)

### 1. Data Persistence: Browser localStorage
- **What:** All subscription data stored in `localStorage['subscriptions']` as JSON
- **Format:** Array of subscription objects, never partial updates
- **Error Handling:** ALL localStorage operations wrapped in try-catch
- **Key:** `'subscriptions'` (exact spelling)

### 2. State Management: useReducer + React Context
- **Pattern:** Single SubscriptionContext with useReducer for all state mutations
- **Actions:** Only use defined action types from ACTIONS constant
- **Flow:** Components → useSubscriptions hook → Context → Reducer → localStorage
- **No direct mutation:** Never modify state directly; always dispatch actions
- **Custom Hook:** Always use `useSubscriptions()` hook, never useContext directly

### 3. Form Handling: React Hook Form + Validation
- **Library:** React Hook Form v7+ (required)
- **Validation:** Schema-based with custom validators
- **Fuzzy Matching:** `useFuzzyMatch` hook for duplicate prevention (>85% threshold)
- **Messages:** User-friendly error messages (never technical jargon)

### 4. Component Architecture: Atomic + Hooks
- **Structure:** Small, focused components with clear responsibilities
- **Hooks:** All logic in hooks; components are presentation
- **Reusability:** Components props-driven, no internal state for data
- **Performance:** Optimize with useCallback, useMemo when needed

### 5. Styling: CSS Modules + Plain CSS
- **Pattern:** Component-scoped CSS Modules (not global)
- **Naming:** BEM convention for class names (Block__Element--Modifier)
- **Colors/Spacing:** CSS variables in `global.css`
- **No:** Tailwind, styled-components, or Sass (plain CSS only)

### 6. Error Handling: Try-Catch + User Messages
- **Scope:** Wrap ALL localStorage, form submission, and API-adjacent code
- **Messages:** User-friendly, never expose technical errors
- **Logging:** Console.log for dev, silent in prod
- **Recovery:** Graceful degradation (app still works)

---

## Naming Conventions (MANDATORY)

### File Names
- **Components:** `PascalCase.tsx` (e.g., `SubscriptionForm.tsx`)
- **Hooks:** `camelCase.ts` (e.g., `useSubscriptions.ts`)
- **Utilities:** `camelCase.ts` (e.g., `fuzzyMatch.ts`)
- **CSS Modules:** Match component name (e.g., `SubscriptionForm.module.css`)
- **Types:** `camelCase.ts` (e.g., `subscription.ts`)

### Variable Names
- **Functions:** `camelCase` (e.g., `calculateTotalCost()`)
- **Variables:** `camelCase` (e.g., `subscriptions`, `isLoading`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_NAME_LENGTH`, `STORAGE_KEY`)
- **React Components:** `PascalCase` (e.g., `const Dashboard = () => {}`)

### Data Fields
```typescript
// Subscription object (exact structure)
{
  id: string                    // UUID
  name: string                  // Subscription name
  cost: number                  // USD amount
  dueDate: number              // Day of month (1-31)
  createdAt: number            // Timestamp
  updatedAt: number            // Timestamp
}

// State fields (camelCase)
subscriptions: Subscription[]
isLoading: boolean
error: string | null
filterPeriod: 'week' | 'month' | 'all'
```

### Action Types
```typescript
const ACTIONS = {
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_ERROR: 'SET_ERROR',
}
```
**Rule:** Only use these exact types; don't invent new ones.

### localStorage Keys
```typescript
'subscriptions'  // Array of subscription objects (JSON string)
```
**Rule:** Exact spelling, lowercase

---

## Implementation Patterns

### Pattern 1: useSubscriptions Hook
```typescript
// Usage in components (REQUIRED pattern)
function MyComponent() {
  const { subscriptions, totalCost, addSubscription } = useSubscriptions()
  // Use the hook, never useContext directly
}
```
**Rule:** Always use custom hook, never access context directly.

### Pattern 2: Reducer Actions
```typescript
// Dispatch with defined action type
dispatch({ 
  type: ACTIONS.ADD_SUBSCRIPTION, 
  payload: newSubscription 
})

// Never custom types
dispatch({ type: 'ADD_SUB', payload: data })  // ❌ WRONG
```
**Rule:** Use only ACTIONS constants.

### Pattern 3: localStorage Operations
```typescript
try {
  const data = localStorage.getItem('subscriptions')
  const subscriptions = JSON.parse(data || '[]')
  return subscriptions
} catch (error) {
  // Handle error, show user message
  setError('Could not load subscriptions')
  return []
}
```
**Rule:** ALL localStorage operations must be wrapped in try-catch.

### Pattern 4: Form Validation
```typescript
const onSubmit = async (data) => {
  try {
    // Validate with schema
    const validation = validateSubscription(data)
    if (!validation.valid) {
      setError(validation.message)  // User-friendly message
      return
    }
    // Create subscription object
    const newSub: Subscription = { ... }
    addSubscription(newSub)
  } catch (error) {
    setError('Could not save subscription')
  }
}
```
**Rule:** Validate first, show friendly message, then dispatch.

### Pattern 5: CSS Modules + BEM
```css
/* Block (component name) */
.subscriptionForm { }

/* Element (part of component) */
.subscriptionForm__input { }
.subscriptionForm__button { }

/* Modifier (variant) */
.subscriptionForm__input--error { }
.subscriptionForm__button--disabled { }
```
**Rule:** Use BEM naming with CSS Modules; never use kebab-case.

### Pattern 6: Component Structure
```typescript
function SubscriptionForm() {
  // State from hook
  const { addSubscription } = useSubscriptions()
  
  // Form logic
  const { handleSubmit, register } = useForm()
  
  // Render
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* JSX */}
    </form>
  )
}
```
**Rule:** Props-driven, stateless for data, hooks for logic.

---

## File Organization (EXACT STRUCTURE)

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── components/                 # React components
│   ├── SubscriptionForm/
│   ├── SubscriptionList/
│   └── [Other components]/
├── context/
│   └── SubscriptionContext.tsx # State + reducer
├── hooks/
│   ├── useSubscriptions.ts
│   ├── useFuzzyMatch.ts
│   └── useLocalStorage.ts
├── utils/
│   ├── fuzzyMatch.ts
│   ├── localStorageManager.ts
│   ├── subscriptionValidator.ts
│   ├── dateUtils.ts
│   └── costCalculator.ts
├── types/
│   ├── subscription.ts
│   ├── actions.ts
│   └── errors.ts
├── styles/
│   ├── global.css
│   └── variables.css
└── constants.ts
```

**Rule:** Follow this structure exactly; don't invent new directories.

---

## Critical Rules for AI Agents

### MANDATORY Rules (MUST Follow)

1. ✅ Use PascalCase for React component filenames
2. ✅ Use camelCase for functions, variables, object fields
3. ✅ Use UPPER_SNAKE_CASE for constants and action types
4. ✅ Place component styles in `.module.css` files (co-located)
5. ✅ Wrap all localStorage operations in try-catch
6. ✅ Show user-friendly error messages (never technical jargon)
7. ✅ Use custom hooks (`useSubscriptions`) instead of context directly
8. ✅ Store data with defined Subscription object structure
9. ✅ Use only defined Action types from ACTIONS constant
10. ✅ Validate all form input against schema before submission

### Pattern Violations (What to FIX)

| Violation | Fix |
|-----------|-----|
| File named `subscription_form.tsx` | Rename to `SubscriptionForm.tsx` |
| Direct `useContext(SubscriptionContext)` | Use `useSubscriptions()` hook instead |
| `localStorage` without try-catch | Add try-catch wrapper |
| Error: `"QuotaExceededError: DOM Exception"` | Change to: `"Storage limit reached. Delete subscriptions."` |
| Custom action: `{ type: 'ADD_SUB', ... }` | Use: `{ type: ACTIONS.ADD_SUBSCRIPTION, ... }` |
| Direct state mutation in component | Dispatch action through reducer instead |
| Global CSS classes | Use CSS Modules with BEM naming |
| Field not in Subscription interface | Add to types/subscription.ts first |

---

## Performance Requirements

- **Load time:** < 2 seconds (Vite + React optimizations)
- **Operations:** < 500ms (form submit, CRUD operations)
- **Rendering:** Efficient re-renders (useCallback, useMemo when needed)
- **Storage:** < 10MB (localStorage limit; ~1MB for 100 subscriptions)

---

## Testing Patterns (Future)

```
tests/
├── components/
│   └── SubscriptionForm.test.tsx
├── hooks/
│   └── useSubscriptions.test.ts
├── utils/
│   └── fuzzyMatch.test.ts
└── integration/
    └── subscriptionFlow.test.tsx
```

**Pattern:** Test files co-located with source; filename.test.ts

---

## Accessibility Requirements (WCAG 2.1 Level A)

- ✅ Keyboard navigation enabled (Tab, Enter, Escape)
- ✅ Semantic HTML (<form>, <button>, <label>)
- ✅ ARIA labels for dynamic content
- ✅ Color contrast meets standards
- ✅ Error messages associated with form fields
- ✅ Focus management on form submit

---

## Development Workflow

### Starting Development
```bash
npm create vite@latest subscription-tracker -- --template react-ts
cd subscription-tracker
npm install
npm run dev  # Starts at http://localhost:5173
```

### Build for Production
```bash
npm run build     # Creates dist/ folder
npm run preview   # Test production build locally
```

### Component Development Order
1. SubscriptionContext + useSubscriptions hook
2. SubscriptionForm with validation
3. SubscriptionList display
4. CostSummary aggregation
5. FilterControls filtering
6. Dashboard orchestration
7. Styling with CSS Modules

---

## TypeScript Configuration

- **Strict Mode:** Enabled (tsconfig.json)
- **Target:** ESNext
- **Module:** ESNext
- **Lib:** ES2020, DOM, DOM.Iterable
- **JSX:** React-JSX

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- No IE11 support

---

## Deployment

- **Static Hosting:** Netlify, Vercel, GitHub Pages, AWS S3
- **Build Output:** `dist/` folder (Vite creates this)
- **HTTPS:** Required (browser localStorage + localStorage rules)
- **No Backend:** All data local to user

---

## Common Questions for AI Agents

**Q: Should I create a custom action type?**  
A: No. Use only the defined ACTIONS constants. Contact maintainer if new action type needed.

**Q: Where should I put this utility function?**  
A: In `src/utils/` folder with `camelCase` naming.

**Q: Can I use global CSS?**  
A: No. Use CSS Modules for component styles; only `global.css` for reset/variables.

**Q: Should I check localStorage before every component render?**  
A: No. Load once on app start in SubscriptionContext; subscribe through useSubscriptions hook.

**Q: Can I add a new dependency?**  
A: Only after discussion. Prefer built-in React/TypeScript features.

**Q: How do I show an error to the user?**  
A: Use user-friendly message in try-catch; set error state that renders in UI.

---

## References

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev)
- [React Hook Form Docs](https://react-hook-form.com)
- [Architecture Decision Document](../planning-artifacts/architecture.md)

---

**This project context is COMPLETE and ready for implementation.**  
All AI agents should follow these patterns without exception.
