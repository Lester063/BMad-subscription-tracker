---
story_id: "3.1"
story_key: "3-1-create-subscriptionform-component-with-react-hook-form"
epic: "3"
epic_title: "Add & Display Subscriptions"
status: "atdd-red-phase"
created: "2026-04-30"
created_by: "bmad-testarch-atdd"
phase: "RED"
description: "Red-phase acceptance test scaffolds - tests MUST fail before implementation"
---

# ATDD: Story 3.1 — SubscriptionForm Component (RED PHASE)

**Epic:** Add & Display Subscriptions (Epic 3)  
**Story ID:** 3.1  
**Phase:** RED (tests must fail before implementation)  
**Focus:** User-behavior scenarios

---

## 🎯 ATDD Phase: RED

These tests are written **before implementation** and **MUST FAIL** to validate the TDD red-green-refactor cycle.

- **RED:** Tests written, implementation missing → tests fail ✅
- **GREEN:** Implementation added → tests pass
- **REFACTOR:** Code cleaned while tests pass

---

## 📋 Test Scenarios (User Behavior Focus)

### Group 1: Form Field Interaction

```typescript
// UBS-3.1.1: User can enter a subscription name in the name field
test('should allow user to enter subscription name in name field', async ({ page }) => {
  // Navigate to the page with SubscriptionForm
  await page.goto('/');
  
  // Find the name input field
  const nameInput = page.getByLabel('Subscription Name');
  
  // User can type in the field
  await nameInput.fill('Netflix');
  
  // Verify the value is entered
  await expect(nameInput).toHaveValue('Netflix');
});

// UBS-3.1.2: User can enter a monthly cost in the cost field
test('should allow user to enter monthly cost in cost field', async ({ page }) => {
  await page.goto('/');
  
  const costInput = page.getByLabel('Monthly Cost');
  
  // User can type cost value
  await costInput.fill('15.99');
  
  // Verify the value is entered
  await expect(costInput).toHaveValue('15.99');
});

// UBS-3.1.3: User can enter a due date in the due date field
test('should allow user to enter due date (day of month) in due date field', async ({ page }) => {
  await page.goto('/');
  
  const dueDateInput = page.getByLabel('Due Date');
  
  // User can type day of month
  await dueDateInput.fill('15');
  
  // Verify the value is entered
  await expect(dueDateInput).toHaveValue('15');
});

// UBS-3.1.4: User can see placeholder text guiding input format
test('should display placeholder text in name field', async ({ page }) => {
  await page.goto('/');
  
  const nameInput = page.getByLabel('Subscription Name');
  
  // Verify placeholder text is visible
  await expect(nameInput).toHavePlaceholder('e.g., Netflix');
});

test('should display placeholder text in cost field', async ({ page }) => {
  await page.goto('/');
  
  const costInput = page.getByLabel('Monthly Cost');
  
  // Verify placeholder text is visible
  await expect(costInput).toHavePlaceholder('e.g., 15.99');
});

test('should display placeholder text in due date field', async ({ page }) => {
  await page.goto('/');
  
  const dueDateInput = page.getByLabel('Due Date');
  
  // Verify placeholder text is visible
  await expect(dueDateInput).toHavePlaceholder('e.g., 15');
});

// UBS-3.1.5: User can clear all fields using the Clear button
test('should clear all fields when user clicks Clear button', async ({ page }) => {
  await page.goto('/');
  
  // Fill in all fields
  await page.getByLabel('Subscription Name').fill('Netflix');
  await page.getByLabel('Monthly Cost').fill('15.99');
  await page.getByLabel('Due Date').fill('15');
  
  // Click the Clear button
  await page.getByRole('button', { name: 'Clear' }).click();
  
  // Verify all fields are cleared
  await expect(page.getByLabel('Subscription Name')).toHaveValue('');
  await expect(page.getByLabel('Monthly Cost')).toHaveValue('');
  await expect(page.getByLabel('Due Date')).toHaveValue('');
});
```

### Group 2: Form Submission

```typescript
// UBS-3.1.6: User can submit the form by clicking "Add Subscription" button
test('should submit form when user clicks Add Subscription button', async ({ page }) => {
  await page.goto('/');
  
  // Fill in the form
  await page.getByLabel('Subscription Name').fill('Netflix');
  await page.getByLabel('Monthly Cost').fill('15.99');
  await page.getByLabel('Due Date').fill('15');
  
  // Click submit button
  await page.getByRole('button', { name: 'Add Subscription' }).click();
  
  // Form should be submitted (callback should be called)
  // This test will fail until implementation adds the onSubmit handler
});

// UBS-3.1.7: User receives no error when submitting with valid data
test('should not show errors when submitting with valid data', async ({ page }) => {
  await page.goto('/');
  
  // Fill in valid data
  await page.getByLabel('Subscription Name').fill('Netflix');
  await page.getByLabel('Monthly Cost').fill('15.99');
  await page.getByLabel('Due Date').fill('15');
  
  // Submit the form
  await page.getByRole('button', { name: 'Add Subscription' }).click();
  
  // No error messages should appear
  await expect(page.locator('[role="alert"]')).toHaveCount(0);
});

// UBS-3.1.8: User can navigate between fields using Tab key
test('should allow keyboard navigation between fields using Tab', async ({ page }) => {
  await page.goto('/');
  
  // Start at first field
  const nameInput = page.getByLabel('Subscription Name');
  await nameInput.focus();
  
  // Press Tab to move to next field
  await page.keyboard.press('Tab');
  
  // Cost field should now be focused
  const costInput = page.getByLabel('Monthly Cost');
  await expect(costInput).toBeFocused();
  
  // Press Tab again
  await page.keyboard.press('Tab');
  
  // Due date field should now be focused
  const dueDateInput = page.getByLabel('Due Date');
  await expect(dueDateInput).toBeFocused();
});

// UBS-3.1.9: User can submit the form by pressing Enter key
test('should submit form when user presses Enter on last field', async ({ page }) => {
  await page.goto('/');
  
  // Fill in the form
  await page.getByLabel('Subscription Name').fill('Netflix');
  await page.getByLabel('Monthly Cost').fill('15.99');
  await page.getByLabel('Due Date').fill('15');
  
  // Press Enter to submit
  await page.getByLabel('Due Date').press('Enter');
  
  // Form should be submitted
  // This test will fail until implementation adds the onSubmit handler
});
```

### Group 3: Accessibility & Usability

```typescript
// UBS-3.1.10: User can see a label for each input field
test('should display label for name field', async ({ page }) => {
  await page.goto('/');
  
  // Label should be visible
  await expect(page.getByText('Subscription Name')).toBeVisible();
});

test('should display label for cost field', async ({ page }) => {
  await page.goto('/');
  
  // Label should be visible
  await expect(page.getByText('Monthly Cost')).toBeVisible();
});

test('should display label for due date field', async ({ page }) => {
  await page.goto('/');
  
  // Label should be visible
  await expect(page.getByText('Due Date')).toBeVisible();
});

// UBS-3.1.11: User can focus on each field using keyboard
test('should allow focus on name field using keyboard', async ({ page }) => {
  await page.goto('/');
  
  // Press Tab to focus first field
  await page.keyboard.press('Tab');
  
  // Name field should be focused
  await expect(page.getByLabel('Subscription Name')).toBeFocused();
});

test('should allow focus on cost field using keyboard', async ({ page }) => {
  await page.goto('/');
  
  // Tab through to cost field
  await page.keyboard.press('Tab'); // name
  await page.keyboard.press('Tab'); // cost
  
  // Cost field should be focused
  await expect(page.getByLabel('Monthly Cost')).toBeFocused();
});

test('should allow focus on due date field using keyboard', async ({ page }) => {
  await page.goto('/');
  
  // Tab through to due date field
  await page.keyboard.press('Tab'); // name
  await page.keyboard.press('Tab'); // cost
  await page.keyboard.press('Tab'); // due date
  
  // Due date field should be focused
  await expect(page.getByLabel('Due Date')).toBeFocused();
});

// UBS-3.1.12: User sees visual focus indicator on focused elements
test('should show visual focus indicator on name field when focused', async ({ page }) => {
  await page.goto('/');
  
  const nameInput = page.getByLabel('Subscription Name');
  await nameInput.focus();
  
  // Focus indicator should be visible (outline or similar)
  await expect(nameInput).toHaveCSS('outline-style', 'solid');
});

// UBS-3.1.13: Screen reader announces field labels correctly
test('should have proper label association for screen reader', async ({ page }) => {
  await page.goto('/');
  
  const nameInput = page.getByLabel('Subscription Name');
  
  // Input should have associated label
  await expect(nameInput).toBeAttached();
  
  // Label should have htmlFor association
  const label = page.getByText('Subscription Name');
  await expect(label).toHaveAttribute('for', /name/);
});
```

### Group 4: Form Display

```typescript
// UBS-3.1.14: Form displays three input fields when component renders
test('should display three input fields when form renders', async ({ page }) => {
  await page.goto('/');
  
  // All three fields should be visible
  await expect(page.getByLabel('Subscription Name')).toBeVisible();
  await expect(page.getByLabel('Monthly Cost')).toBeVisible();
  await expect(page.getByLabel('Due Date')).toBeVisible();
});

// UBS-3.1.15: Form displays "Add Subscription" submit button
test('should display Add Subscription submit button', async ({ page }) => {
  await page.goto('/');
  
  // Submit button should be visible
  await expect(page.getByRole('button', { name: 'Add Subscription' })).toBeVisible();
});

// UBS-3.1.16: Form displays "Clear" reset button
test('should display Clear reset button', async ({ page }) => {
  await page.goto('/');
  
  // Clear button should be visible
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
});

// UBS-3.1.17: Form has proper visual layout and spacing
test('should display form with proper layout', async ({ page }) => {
  await page.goto('/');
  
  // Form should be visible
  const form = page.locator('form');
  await expect(form).toBeVisible();
  
  // Form should have proper dimensions
  await expect(form).toHaveCSS('display', 'flex');
});
```

---

## 🏗️ Test File Structure

```
subscription-tracker/tests/e2e/
├── subscription-form.spec.ts    # ← RED PHASE TESTS (this file)
└── ... (other test files)
```

---

## ⚠️ Expected Behavior

| Phase | Status | Description |
|-------|--------|-------------|
| **RED** | ❌ FAIL | Tests written, SubscriptionForm component not yet created |
| **GREEN** | ✅ PASS | After implementation, all tests pass |
| **REFACTOR** | ✅ PASS | Code cleaned, tests still pass |

---

## 📊 ATDD Metadata

| Field | Value |
|-------|-------|
| **Story** | 3.1: Create SubscriptionForm Component |
| **Phase** | RED (pre-implementation) |
| **Test Framework** | Playwright |
| **Total Scenarios** | 17 user behavior tests |
| **Priority** | P0 (High) |

---

**Generated:** 2026-04-30  
**By:** Murat (Master Test Architect)  
**BMad Method™** — Red-phase acceptance tests ready for TDD cycle