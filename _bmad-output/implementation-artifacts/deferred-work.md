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
