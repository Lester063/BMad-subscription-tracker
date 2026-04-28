---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments: 
  - "prd.md"
  - "architecture.md"
projectName: "BMad-subscription-tracker"
workflowType: 'epics-and-stories'
extractionDate: '2026-04-28'
epicDesignDate: '2026-04-28'
extractionStatus: 'epic-structure-approved'
epicApprovalNotes: 'User approved 10-epic structure with Playwright + TEA integrated quality approach'
readyForStoryCreation: true
---

# BMad-subscription-tracker - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for BMad-subscription-tracker, decomposing the requirements from the PRD and Architecture into implementable stories organized by user value and technical readiness.

---

## Requirements Inventory

### Functional Requirements

- **FR1:** Users can manually add a subscription with name, cost, and due date
- **FR2:** Users can view all subscriptions in a list with name, cost, due date, and action buttons
- **FR3:** Users can edit existing subscription details (name, cost, due date)
- **FR4:** Users can delete subscriptions with confirmation dialog
- **FR5:** Dashboard displays total monthly subscription cost prominently and updates in real-time
- **FR6:** Users can filter subscriptions by due date period (This Week, This Month, All Periods)
- **FR7:** System prevents duplicate subscriptions using fuzzy name matching (>85% threshold) with user-friendly messaging

### Non-Functional Requirements

- **NFR1:** Performance — Page load time < 2 seconds
- **NFR2:** Performance — Add/Edit/Delete operations < 500ms response time
- **NFR3:** Performance — Display 100+ subscriptions without lag
- **NFR4:** Reliability — All data persists reliably in localStorage across sessions
- **NFR5:** Security — All data stored locally (no server, cloud sync, or integrations)
- **NFR6:** Deployment — HTTPS required for all environments
- **NFR7:** Compatibility — Works on modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR8:** Usability — Responsive design (mobile-friendly, desktop-focused)
- **NFR9:** Accessibility — WCAG 2.1 Level A compliance (keyboard navigation, semantic HTML, screen readers)
- **NFR10:** Error Handling — Graceful degradation with user-friendly error messages (never technical jargon)

### Additional Technical Requirements (Architecture)

- **Starter Template:** Vite + React + TypeScript via `npm create vite@latest subscription-tracker -- --template react-ts`
- **State Management:** useReducer + React Context with single SubscriptionContext; use useSubscriptions() hook in components
- **Form Handling:** React Hook Form v7+ with schema-based validation and custom validators
- **Duplicate Prevention:** Fuzzy matching utility (useFuzzyMatch hook) with >85% similarity threshold
- **Styling:** CSS Modules + BEM naming (no Tailwind, styled-components, or Sass)
- **Error Handling:** Try-catch wrappers on ALL localStorage operations with user-friendly messages
- **Data Persistence:** localStorage key 'subscriptions' (exact spelling, lowercase) storing JSON array
- **Subscription Data Structure:** `{id: UUID, name: string, cost: number, dueDate: number (1-31), createdAt: timestamp, updatedAt: timestamp}`
- **Component Architecture:** Atomic/modular design with hooks; App → Dashboard → (CostSummary, FilterControls, SubscriptionList → SubscriptionRow)
- **File Structure:** Exact organization: src/components/, src/hooks/, src/utils/, src/types/, src/styles/
- **Action Types:** Use only ACTIONS constant with types: SET_SUBSCRIPTIONS, ADD_SUBSCRIPTION, UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, SET_ERROR
- **Naming Conventions:** PascalCase for components (SubscriptionForm.tsx), camelCase for utilities/hooks, UPPER_SNAKE_CASE for constants
- **Accessibility:** Keyboard navigation, semantic HTML, ARIA labels, color contrast, focus management

### Functional Requirement Coverage Map

| Epic | Covers FRs | Covers NFRs |
|------|-----------|-----------|
| **Epic 1: Foundation & Project Setup** | — | NFR1, NFR7 |
| **Epic 2: State Management & Data Persistence** | — | NFR4, NFR5 |
| **Epic 3: Add & Display Subscriptions** | FR1, FR2 | NFR2, NFR3, NFR9 |
| **Epic 4: Edit & Delete Subscriptions** | FR3, FR4 | NFR2 |
| **Epic 5: Cost Summary Dashboard** | FR5 | NFR1, NFR2, NFR3 |
| **Epic 6: Filtering & Organization** | FR6 | NFR2, NFR8 |
| **Epic 7: Duplicate Prevention & Validation** | FR7 | NFR10 |
| **Epic 8: Error Handling & Resilience** | — | NFR4, NFR9, NFR10 |
| **Epic 9: Styling & UX Polish** | — | NFR8, NFR9 |
| **Epic 10: Testing & Accessibility Audit** | — | NFR9 |

---

## Epic List

**Epic 1:** Foundation & Project Setup — Initialize Vite + React + TypeScript project with all configuration  
**Epic 2:** State Management & Data Persistence — Implement SubscriptionContext, useReducer, and localStorage integration  
**Epic 3:** Add & Display Subscriptions — Build form input and subscription list view with real-time updates  
**Epic 4:** Edit & Delete Subscriptions — Implement edit and delete workflows with confirmation  
**Epic 5:** Cost Summary Dashboard — Create dashboard with total monthly cost calculation and real-time updates  
**Epic 6:** Filtering & Organization — Implement due date filtering (This Week, This Month, All)  
**Epic 7:** Duplicate Prevention & Validation — Implement fuzzy matching and form validation  
**Epic 8:** Error Handling & Resilience — Wrap all operations with try-catch and user-friendly messaging  
**Epic 9:** Styling & UX Polish — Apply CSS Modules, BEM naming, responsive design, and visual polish  
**Epic 10:** Testing & Accessibility Audit — Create test suite and verify WCAG 2.1 Level A compliance  

---

## 📊 Requirements Extraction Status

✅ **Functional Requirements:** 7 FRs extracted from PRD  
✅ **Non-Functional Requirements:** 10 NFRs extracted from PRD  
✅ **Technical Requirements:** Complete set from Architecture document  
✅ **Coverage Map:** All requirements mapped to epics  
✅ **Project Documents:** PRD and Architecture analyzed; no UX Design specification provided  

---

## Epic List

### Epic 1: Foundation & Project Setup
Initialize Vite + React + TypeScript project with proper configuration, dependencies, and file structure.
**User Outcome:** Dev environment ready; project runs successfully at http://localhost:5173
**FRs Covered:** (Infrastructure enabler)
**NFRs Addressed:** NFR1 (performance setup), NFR7 (browser compatibility)

### Epic 2: State Management & Data Persistence
Implement SubscriptionContext with useReducer, localStorage integration, and data loading on app start.
**User Outcome:** User data persists reliably across sessions; app state is managed through context
**FRs Covered:** (Infrastructure enabler—supports all FRs)
**NFRs Addressed:** NFR4 (reliability), NFR5 (security/local storage)

### Epic 3: Add & Display Subscriptions (Core User Value)
Users can manually add subscriptions via form and view all subscriptions in a list with real-time updates.
**User Outcome:** User can see all subscriptions in one place; can add new ones in < 30 seconds
**FRs Covered:** FR1 (add subscription), FR2 (view subscriptions)
**NFRs Addressed:** NFR2 (< 500ms operations), NFR3 (handle 100+ subscriptions), NFR9 (accessibility)

### Epic 4: Edit & Delete Subscriptions
Users can modify or remove subscriptions with confirmation dialogs; changes persist immediately.
**User Outcome:** User can update incorrect entries and cleanly remove unwanted subscriptions
**FRs Covered:** FR3 (edit subscription), FR4 (delete subscription)
**NFRs Addressed:** NFR2 (< 500ms operations), NFR10 (error handling)

### Epic 5: Financial Dashboard - Total Cost Summary
Display total monthly subscription cost prominently on dashboard; update in real-time as subscriptions change.
**User Outcome:** User can answer "How much am I spending?" at a glance (core PRD need)
**FRs Covered:** FR5 (total monthly cost summary)
**NFRs Addressed:** NFR1 (< 2 second load), NFR2 (real-time updates), NFR8 (responsive design)

### Epic 6: Filtering & Organization
Implement filter controls for due date periods (This Week, This Month, All Periods) with responsive UI.
**User Outcome:** User can answer "What's due when?" and organize subscriptions by payment schedule
**FRs Covered:** FR6 (filter by due date)
**NFRs Addressed:** NFR8 (responsive design), NFR9 (keyboard accessible)

### Epic 7: Duplicate Prevention & Validation
Implement fuzzy name matching to prevent user errors; add form-level validation with user-friendly messages.
**User Outcome:** User can't accidentally add duplicate subscriptions; form provides helpful guidance
**FRs Covered:** FR7 (duplicate prevention with fuzzy matching)
**NFRs Addressed:** NFR10 (error handling with friendly messages), NFR9 (accessibility)

### Epic 8: Error Handling & Resilience
Wrap all localStorage, form, and app operations with try-catch; provide user-friendly error messages.
**User Outcome:** App handles errors gracefully; user gets helpful guidance instead of technical errors
**FRs Covered:** (Cross-cutting—supports all operations)
**NFRs Addressed:** NFR4 (reliability), NFR10 (error messaging), NFR5 (graceful degradation)

### Epic 9: Styling & UX Polish
Apply CSS Modules + BEM naming; implement responsive design; ensure visual hierarchy and accessibility polish.
**User Outcome:** App is visually polished, responsive on desktop/tablet/mobile, and intuitive to use
**FRs Covered:** (Cross-cutting—enhances all features)
**NFRs Addressed:** NFR8 (responsive), NFR9 (visual accessibility/contrast), NFR1 (performance with optimized styles)

### Epic 10: Testing & Accessibility Audit (Integrated throughout)
Implement Playwright test suite with TDD/TEA methodology for every story; verify WCAG 2.1 Level A compliance as features ship.
**User Outcome:** Each feature is tested as built; accessibility verified continuously; code quality gates automated
**Approach:** Every story includes acceptance test scaffolds written BEFORE implementation; Playwright integration tests; accessibility checks built into CI
**NFRs Addressed:** NFR9 (accessibility), all NFRs (quality gates)

---

## Requirements Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| **FR1** | Epic 3 | Add Subscription via manual entry form |
| **FR2** | Epic 3 | View all subscriptions in list with real-time updates |
| **FR3** | Epic 4 | Edit subscription details (name, cost, due date) |
| **FR4** | Epic 4 | Delete subscription with confirmation dialog |
| **FR5** | Epic 5 | Display total monthly cost prominently |
| **FR6** | Epic 6 | Filter subscriptions by due date period |
| **FR7** | Epic 7 | Prevent duplicates with fuzzy name matching (>85%) |

✅ **All 7 FRs mapped to specific epics**
✅ **All 10 NFRs addressed across epics**
✅ **Epic structure approved by user**
✅ **Integrated quality approach (Playwright + TEA) confirmed**

## Next Steps

Approved epic structure saved. Proceeding to Step 3: Detailed Story Creation.

