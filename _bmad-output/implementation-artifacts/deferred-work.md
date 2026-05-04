# Deferred Work Items

## Deferred from: code review of 2-4-create-usesubscriptions-custom-hook (2026-04-29)

### Cost value validation (NaN/Infinity/negative)
**Source:** Code Review Edge Case Hunter  
**Severity:** Medium  
**Context:** Validating subscription cost values (range, type, sign) is the reducer's responsibility, not the hook's. The reducer already validates some subscription fields; cost validation should be added there, not in this hook.  
**Note:** Deferred to a future refactoring of the reducer's validation logic when all numeric fields are reviewed.

### Post-unmount dispatcher warnings
**Source:** Code Review Edge Case Hunter  
**Severity:** Low  
**Context:** If a dispatcher is called after the SubscriptionProvider unmounts, React will log a "mounted component" warning. This is broader architectural pattern affecting all hooks in the project, not specific to useSubscriptions.  
**Note:** Deferred to a future memory leak/cleanup refactoring when all custom hooks are reviewed.

## Deferred from: code review of 3-3-implement-add-subscription-workflow (2026-05-04)

### Cost validation (> 0)
**Source:** Code Review Edge Case Hunter  
**Severity:** Low  
**Context:** Form allows cost = 0 to be submitted, which is logically invalid (a free subscription shouldn't be tracked). However, this is a form validation concern, not a submission logic concern.  
**Note:** Deferred to Story 3.1 (SubscriptionForm component) where form validation layer should enforce cost > 0. Story 3.3 assumes valid input from the form.

### DueDate range validation (1-31)
**Source:** Code Review Edge Case Hunter  
**Severity:** Low  
**Context:** Form allows dueDate = 0 or 32 to be submitted, which are invalid day-of-month values. However, this is a form validation concern, not a submission logic concern.  
**Note:** Deferred to Story 3.1 (SubscriptionForm component) where form validation layer should enforce 1-31 range. Story 3.3 assumes valid input from the form.
