## Defect: Input Fields are not being cleared after updating the subscription

# Steps to Replicate:
Given I am on the http://localhost:5173/
When I click the edit button on one of the subscription
And I made a changes
And I click the Update Subscription button
Then a success message is displayed
And the list is updated with the new data
But the input on the edit form are not cleared

## Refer on the Story 4-1-implement-edit-subscription-workflow.md

# Acceptance Test
As a User, I want to clear the input fields when the update is success

Given I am on the http://localhost:5173/
When I click the edit button on one of the subscription
And I made a changes
And I click the Update Subscription button
Then a success message is displayed
And the list is updated with the new data
And the Subscription Name * field is emptied
And Monthly Cost ($) * field is 0
And the Due Date (Day of Month, 1-31) * field is emptied