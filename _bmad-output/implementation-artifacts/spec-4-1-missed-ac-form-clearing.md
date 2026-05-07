---
title: 'Story 4.1 Missed AC - Form Fields Not Cleared After Update'
type: 'bugfix'
created: '2026-05-06'
status: 'in-review'
baseline_commit: 'afa50836398e571e6357966712cb890fcff185c1'
context: ['{project-root}/docs/project-context.md', '{project-root}/_bmad-output/implementation-artifacts/4-1-implement-edit-subscription-workflow.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After successfully updating a subscription in edit mode, the form input fields remain populated with the updated values instead of clearing. Add mode clears correctly. This violates the missed AC from Story 4.1: "Form fields cleared after successful update" (edit mode only).

**Approach:** Modify the edit mode success path in `handleFormSubmit()` to explicitly pass empty default values to React Hook Form's `reset()` function. Add mode already works correctly and requires no change.

## Boundaries & Constraints

**Always:**
- Form must clear after *successful* submission only in edit mode (not on validation errors)
- Form clearing applies to all three fields: name, cost, dueDate
- Edit mode must exit (editingSubscription state set to null)
- Success message must display before/alongside form clearing
- Use React Hook Form's native `reset()` API
- Add mode clears correctly already — no changes needed to Add path

**Ask First:**
- None

**Never:**
- Do not clear form on validation errors
- Do not break existing Add mode (new subscription) functionality
- Do not change the form's defaultValues structure

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| **Edit mode - successful submit (DEFECT)** | Form pre-filled with existing values, user changes name/cost/dueDate, clicks "Update Subscription" | Form clears (name='', cost=0, dueDate=''), success message displays, edit mode exits | N/A |
| **Edit mode - cancel** | User in edit mode clicks "Cancel" | Form clears, edit mode exits, no success message | N/A |
| **Edit mode - validation error** | User in edit mode submits invalid data | Form retains values, error message displays, form does not clear | Show inline error |

</frozen-after-approval>

## Code Map

- `src/App.tsx` -- Main form submission handler; calls `formRef.current?.reset()` after successful submit
- `src/components/SubscriptionForm/SubscriptionForm.tsx` -- Form component with ref-based reset implementation

## Tasks & Acceptance

**Execution:**
- [ ] `src/App.tsx` -- Modify `handleFormSubmit()` to pass explicit empty values to `reset()` for both Add and Edit success paths -- Ensures form consistently clears regardless of previous state
- [ ] `src/components/Subscripthe edit mode success path in `handleFormSubmit()` to pass explicit empty values `{ name: '', cost: 0, dueDate: '' }` to `reset()` -- Fixes form clearing in edit mode only

**Acceptance Criteria:**
- Given user is in Edit mode with form pre-populated, when form submits successfully with updates, then all input fields (name, cost, dueDate) are cleared to empty/default state
- Given user is in Edit mode and submits invalid data, when validation error occurs, then form retains current values and does not clear
- Verify: Add mode continues to work correctly (already clearing properly)
## Spec Change Log

**2026-05-06 — Implementation Complete & Verified:**
- Modified `SubscriptionFormRef` interface to accept optional reset values
- Updated `useImperativeHandle` in SubscriptionForm to pass values through to `reset()`
- Modified App.tsx edit mode success path to call `reset({ name: '', cost: 0, dueDate: '' })`
- E2E test results: All 13 tests passing (8 Story 4.1 + 3 Story 4.3 + 2 Defect tests)
- No regressions: Add mode continues to clear correctly, all AC tests pass

## Design Notes

### Why the Bug Occurs

React Hook Form's `reset()` function, when called without arguments, resets the form to the `defaultValues` passed to `useForm()` at component initialization. These default values are computed once from the `initialValues` prop at mount time. 
 (Edit Mode Only)

In edit mode, the form's `defaultValues` are set to the pre-populated subscription values via the `initialValues` prop. React Hook Form's `reset()` function, when called without arguments, resets to these captured `defaultValues` — not to an empty state. This is why the form retains the updated values instead of clearing.

Add mode works because its `initialValues` are undefined, so `defaultValues` start as empty.

### The Fix

Modify the edit mode success path to pass explicit empty values to `reset()`:

```typescript
// In handleFormSubmit, edit mode success branch:
if (editingSubscription) {
  updateSubscription(updatedSubscription)
  
  // Fix: Pass explicit empty values
  formRef.current?.reset({
    name: '',
    cost: 0,
    dueDate: '',
  })
  
  setEditingSubscription(null)
  setSuccessMessage('Subscription updated successfully')
}
```

This ensures the edit mode success path clears the form to a predictable empty state after upd
**Commands:**
- `npm run test:unit -- SubscriptionForm.test.tsx` -- All unit tests pass, including form clearing tests
- `npm run test:e2e -- --project=chromium tests/e2e/stories-4.1-4.3-edit-and-timestamps.spec.ts --grep "DEFECT"` -- E2E tests for defect confirm form clears after update and cancel

**Manual checks (if no CLI):**
- Add mode: Fill form → Submit → Verify all fields clear to empty/default
- Edit mode: Click Edit → Verify form pre-populates → Change values → Submit → Verify all fields clear to empty/default
