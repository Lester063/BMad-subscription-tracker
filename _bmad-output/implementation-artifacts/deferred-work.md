# Deferred Work Items

## Deferred from: Code Review of Story 11.4 — Create useFilteredSubscriptions Custom Hook (2026-05-08)

### Data Validation Strategy — Upstream Responsibility
**Source:** Code Review — Blind Hunter, Edge Case Hunter  
**Severity:** MEDIUM  
**Context:** Invalid cost values (negative, NaN, Infinity) and invalid ranges (min > max) pass through the filtering hook without validation or error. The hook's implementation is correct (logic properly handles these cases), but validation gaps indicate architectural issues upstream.  
**Details:**
- **Issue 1:** costRangeMin > costRangeMax returns silent empty results instead of validation error
- **Issue 2:** Negative cost values pass through filters (domain validation gap)
- **Issue 3:** NaN in cost range bounds causes incorrect filtering behavior

**Recommended Action:** Prioritize data validation in future epics:
1. **Form-level (CostRangeFilter, Story 11.3):** Validate min ≤ max before dispatch
2. **Persistence-level (localStorage utilities, Story 2.2):** Validate subscription data structure when loading
3. **Future audit:** Consider comprehensive schema validation in Epic 8 (Error Handling & Resilience)

**Note:** Current hook implementation is sound. These deferred items reflect upstream validation gaps, not defects in the hook itself. All 8 ACs satisfied.

---

## Deferred from: code review of 11-2-create-searchbar-component (2026-05-07)

### Unicode emoji grapheme cluster handling
**Source:** Code Review Edge Case Hunter  
**Severity:** Low  
**Context:** JavaScript `.length` counts UTF-16 code units, not visual graphemes. Multi-codepoint emoji (e.g., 👨‍👩‍👧‍👦) render as single character but have `.length > 1`. Clear button visibility check (`searchState.searchTerm.length > 0`) works correctly, but the internal representation is semantically imprecise.  
**Note:** This is a JavaScript language limitation. Fixing would require grapheme cluster library dependency. Functionally correct (button appears when user has typed anything). Deferred to future Unicode handling audit when internationalization is reviewed across the project.

### Password manager autoComplete bypass
**Source:** Code Review Edge Case Hunter  
**Severity:** Low  
**Context:** Some password managers (1Password, Dashlane) ignore `autoComplete="off"` and inject password suggestions into search input anyway. Users could accidentally see passwords if they use autofill in the search field.  
**Note:** This is browser/extension behavior, not a component defect. Component correctly sets `autoComplete="off"`. Cannot be fixed in HTML/CSS/JS. Deferred to future security audit if password manager injection becomes a reported issue.

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
