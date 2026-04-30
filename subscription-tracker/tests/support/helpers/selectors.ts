/**
 * Centralized selector definitions
 *
 * Using data-testid attributes promotes:
 * - Test resilience (not tied to CSS/HTML structure)
 * - Component-driven design
 * - Better accessibility integration
 *
 * Usage:
 * await page.fill(selectors.form.nameInput, 'Netflix');
 */
export class Selectors {
  // Form selectors
  form = {
    nameInput: '[data-testid="subscription-name"]',
    typeSelect: '[data-testid="subscription-type"]',
    costInput: '[data-testid="subscription-cost"]',
    billingCycleSelect: '[data-testid="billing-cycle"]',
    notesTextarea: '[data-testid="subscription-notes"]',
    submitButton: '[data-testid="submit-button"]',
    cancelButton: '[data-testid="cancel-button"]',
  };

  // List/Display selectors
  list = {
    container: '[data-testid="subscription-list"]',
    item: '[data-testid="subscription-item"]',
    row: (id?: string) => `[data-testid="subscription-row${id ? `-${id}` : ''}"]`,
    deleteButton: (id: string) => `[data-testid="delete-subscription-${id}"]`,
    editButton: (id: string) => `[data-testid="edit-subscription-${id}"]`,
  };

  // Cost summary selectors
  costSummary = {
    container: '[data-testid="cost-summary"]',
    totalCost: '[data-testid="total-cost"]',
    monthlyCost: '[data-testid="monthly-cost"]',
    yearlyCost: '[data-testid="yearly-cost"]',
  };

  // Filter/Control selectors
  filters = {
    container: '[data-testid="filter-controls"]',
    typeFilter: '[data-testid="filter-type"]',
    sortBy: '[data-testid="sort-by"]',
    dateRangeStart: '[data-testid="date-range-start"]',
    dateRangeEnd: '[data-testid="date-range-end"]',
  };

  // Error/Message selectors
  messages = {
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    validationError: (field: string) => `[data-testid="error-${field}"]`,
  };

  // Modal/Dialog selectors
  modal = {
    confirmDialog: '[data-testid="confirm-dialog"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelButton: '[data-testid="cancel-button"]',
  };
}
