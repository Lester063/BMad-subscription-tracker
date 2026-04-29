import { subscriptionReducer, SubscriptionState, SubscriptionAction } from './SubscriptionContext'
import { ACTIONS } from '../constants'
import { Subscription } from '../types/subscription'
import * as localStorageUtils from '../utils/localStorageManager'

// Mock localStorage utils
jest.mock('../utils/localStorageManager')

describe('SubscriptionContext - subscriptionReducer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSubscription: Subscription = {
    id: 'test-id-1',
    name: 'Netflix',
    cost: 15.99,
    dueDate: 15,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const mockSubscription2: Subscription = {
    id: 'test-id-2',
    name: 'Gym',
    cost: 50,
    dueDate: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  describe('Initial State', () => {
    it('should initialize with empty subscriptions and no error', () => {
      const initialState: SubscriptionState = {
        subscriptions: [],
        error: null,
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: [],
      })

      expect(nextState.subscriptions).toEqual([])
      expect(nextState.error).toBeNull()
    })
  })

  describe('SET_SUBSCRIPTIONS Action', () => {
    it('should load subscriptions from localStorage on app start', () => {
      const initialState: SubscriptionState = {
        subscriptions: [],
        error: null,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: [mockSubscription, mockSubscription2],
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState.subscriptions).toHaveLength(2)
      expect(nextState.subscriptions[0]).toEqual(mockSubscription)
      expect(nextState.subscriptions[1]).toEqual(mockSubscription2)
      expect(nextState.error).toBeNull()
    })

    it('should clear error when loading subscriptions', () => {
      const stateWithError: SubscriptionState = {
        subscriptions: [],
        error: 'Previous error',
      }

      const action: SubscriptionAction = {
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: [mockSubscription],
      }

      const nextState = subscriptionReducer(stateWithError, action)

      expect(nextState.error).toBeNull()
    })

    it('should not call saveSubscriptionsToStorage', () => {
      const initialState: SubscriptionState = {
        subscriptions: [],
        error: null,
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: [mockSubscription],
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).not.toHaveBeenCalled()
    })
  })

  describe('ADD_SUBSCRIPTION Action', () => {
    it('should add new subscription to array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const newSub: Subscription = {
        ...mockSubscription2,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: newSub,
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState.subscriptions).toHaveLength(2)
      expect(nextState.subscriptions[1]).toEqual(newSub)
    })

    it('should preserve immutability - not mutate original state', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const originalLength = initialState.subscriptions.length

      subscriptionReducer(initialState, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      // Original state should be unchanged
      expect(initialState.subscriptions.length).toBe(originalLength)
      expect(initialState.subscriptions).not.toContain(mockSubscription2)
    })

    it('should call saveSubscriptionsToStorage with updated array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).toHaveBeenCalledWith([
        mockSubscription,
        mockSubscription2,
      ])
    })

    it('should clear error on successful add', () => {
      const stateWithError: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: 'Some error',
      }

      const nextState = subscriptionReducer(stateWithError, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      expect(nextState.error).toBeNull()
    })

    it('should continue working even if saveSubscriptionsToStorage fails', () => {
      ;(localStorageUtils.saveSubscriptionsToStorage as jest.Mock).mockReturnValue(false)

      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      // State should still be updated (optimistic update)
      expect(nextState.subscriptions).toHaveLength(2)
      // No crash or error set
      expect(nextState.error).toBeNull()
    })
  })

  describe('UPDATE_SUBSCRIPTION Action', () => {
    it('should update subscription with matching id', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const updated: Subscription = {
        ...mockSubscription,
        name: 'Netflix Premium',
        cost: 19.99,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: updated,
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState.subscriptions).toHaveLength(2)
      expect(nextState.subscriptions[0].name).toBe('Netflix Premium')
      expect(nextState.subscriptions[0].cost).toBe(19.99)
      expect(nextState.subscriptions[1]).toEqual(mockSubscription2)
    })

    it('should preserve immutability - not mutate original array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const originalFirstSub = { ...initialState.subscriptions[0] }

      const updated: Subscription = {
        ...mockSubscription,
        name: 'Updated',
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: updated,
      })

      expect(initialState.subscriptions[0]).toEqual(originalFirstSub)
    })

    it('should call saveSubscriptionsToStorage with updated array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const updated: Subscription = {
        ...mockSubscription,
        name: 'Updated',
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: updated,
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).toHaveBeenCalled()
      const callArg = (localStorageUtils.saveSubscriptionsToStorage as jest.Mock)
        .mock.calls[0][0]
      expect(callArg[0].name).toBe('Updated')
    })

    it('should clear error on successful update', () => {
      const stateWithError: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: 'Error',
      }

      const nextState = subscriptionReducer(stateWithError, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: { ...mockSubscription, name: 'Updated' },
      })

      expect(nextState.error).toBeNull()
    })

    it('should not update subscription with non-matching id', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const updated: Subscription = {
        ...mockSubscription2,
        id: 'non-existent-id',
        name: 'Should Not Appear',
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: updated,
      })

      expect(nextState.subscriptions[0]).toEqual(mockSubscription)
      expect(nextState.subscriptions[0].name).not.toBe('Should Not Appear')
    })
  })

  describe('DELETE_SUBSCRIPTION Action', () => {
    it('should remove subscription with matching id', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'test-id-1',
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState.subscriptions).toHaveLength(1)
      expect(nextState.subscriptions[0]).toEqual(mockSubscription2)
    })

    it('should preserve immutability - not mutate original array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const originalLength = initialState.subscriptions.length

      subscriptionReducer(initialState, {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'test-id-1',
      })

      expect(initialState.subscriptions.length).toBe(originalLength)
    })

    it('should call saveSubscriptionsToStorage with updated array', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'test-id-1',
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).toHaveBeenCalledWith([
        mockSubscription2,
      ])
    })

    it('should clear error on successful delete', () => {
      const stateWithError: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: 'Error',
      }

      const nextState = subscriptionReducer(stateWithError, {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'test-id-1',
      })

      expect(nextState.error).toBeNull()
    })

    it('should handle deleting non-existent subscription gracefully', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'non-existent-id',
      })

      expect(nextState.subscriptions).toHaveLength(1)
      expect(nextState.subscriptions[0]).toEqual(mockSubscription)
    })
  })

  describe('SET_ERROR Action', () => {
    it('should set error message', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.SET_ERROR,
        payload: 'Storage quota exceeded',
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState.error).toBe('Storage quota exceeded')
    })

    it('should not modify subscriptions array when setting error', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.SET_ERROR,
        payload: 'Error message',
      })

      expect(nextState.subscriptions).toEqual([mockSubscription])
    })

    it('should not call saveSubscriptionsToStorage', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      subscriptionReducer(initialState, {
        type: ACTIONS.SET_ERROR,
        payload: 'Error',
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).not.toHaveBeenCalled()
    })

    it('should overwrite previous error', () => {
      const stateWithError: SubscriptionState = {
        subscriptions: [],
        error: 'Old error',
      }

      const nextState = subscriptionReducer(stateWithError, {
        type: ACTIONS.SET_ERROR,
        payload: 'New error',
      })

      expect(nextState.error).toBe('New error')
    })
  })

  describe('Invalid/Unknown Action Type', () => {
    it('should return state unchanged for unknown action type', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const action: SubscriptionAction = {
        type: 'UNKNOWN_ACTION',
        payload: {},
      }

      const nextState = subscriptionReducer(initialState, action)

      expect(nextState).toEqual(initialState)
      expect(nextState.subscriptions).toEqual(initialState.subscriptions)
    })

    it('should not call saveSubscriptionsToStorage for unknown action', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      subscriptionReducer(initialState, {
        type: 'CUSTOM_ACTION',
      })

      expect(localStorageUtils.saveSubscriptionsToStorage).not.toHaveBeenCalled()
    })
  })

  describe('Action Type Constants (No Magic Strings)', () => {
    it('should use ACTIONS.SET_SUBSCRIPTIONS constant', () => {
      const initialState: SubscriptionState = {
        subscriptions: [],
        error: null,
      }

      const action: SubscriptionAction = {
        type: ACTIONS.SET_SUBSCRIPTIONS,
        payload: [mockSubscription],
      }

      expect(action.type).toBe(ACTIONS.SET_SUBSCRIPTIONS)
      expect(action.type).not.toBe('SET_SUBSCRIPTIONS') // Should reference constant
    })

    it('should use ACTIONS.ADD_SUBSCRIPTION constant', () => {
      const action: SubscriptionAction = {
        type: ACTIONS.ADD_SUBSCRIPTION,
      }

      expect(action.type).toBe(ACTIONS.ADD_SUBSCRIPTION)
    })

    it('should use ACTIONS.UPDATE_SUBSCRIPTION constant', () => {
      const action: SubscriptionAction = {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
      }

      expect(action.type).toBe(ACTIONS.UPDATE_SUBSCRIPTION)
    })

    it('should use ACTIONS.DELETE_SUBSCRIPTION constant', () => {
      const action: SubscriptionAction = {
        type: ACTIONS.DELETE_SUBSCRIPTION,
      }

      expect(action.type).toBe(ACTIONS.DELETE_SUBSCRIPTION)
    })

    it('should use ACTIONS.SET_ERROR constant', () => {
      const action: SubscriptionAction = {
        type: ACTIONS.SET_ERROR,
      }

      expect(action.type).toBe(ACTIONS.SET_ERROR)
    })
  })

  describe('Immutability Enforcement', () => {
    it('should create new state object, not mutate original', () => {
      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const stateRef = initialState
      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      expect(nextState).not.toBe(stateRef)
      expect(initialState).toBe(stateRef)
      expect(nextState.subscriptions).not.toBe(initialState.subscriptions)
    })

    it('should preserve other subscriptions when updating one', () => {
      const thirdSub: Subscription = {
        ...mockSubscription2,
        id: 'test-id-3',
      }

      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2, thirdSub],
        error: null,
      }

      const updated: Subscription = {
        ...mockSubscription,
        name: 'Updated',
      }

      const nextState = subscriptionReducer(initialState, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: updated,
      })

      expect(nextState.subscriptions[1]).toEqual(mockSubscription2)
      expect(nextState.subscriptions[2]).toEqual(thirdSub)
    })
  })

  describe('Error Handling - No Crashes on Storage Failure', () => {
    it('ADD: should not crash if saveSubscriptionsToStorage fails', () => {
      ;(localStorageUtils.saveSubscriptionsToStorage as jest.Mock).mockReturnValue(false)

      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const result = subscriptionReducer(initialState, {
        type: ACTIONS.ADD_SUBSCRIPTION,
        payload: mockSubscription2,
      })

      expect(result.subscriptions).toHaveLength(2)
      expect(result.error).toBeNull() // No error set (graceful degradation)
    })

    it('UPDATE: should not crash if saveSubscriptionsToStorage fails', () => {
      ;(localStorageUtils.saveSubscriptionsToStorage as jest.Mock).mockReturnValue(false)

      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription],
        error: null,
      }

      const result = subscriptionReducer(initialState, {
        type: ACTIONS.UPDATE_SUBSCRIPTION,
        payload: { ...mockSubscription, name: 'Updated' },
      })

      expect(result.subscriptions[0].name).toBe('Updated')
    })

    it('DELETE: should not crash if saveSubscriptionsToStorage fails', () => {
      ;(localStorageUtils.saveSubscriptionsToStorage as jest.Mock).mockReturnValue(false)

      const initialState: SubscriptionState = {
        subscriptions: [mockSubscription, mockSubscription2],
        error: null,
      }

      const result = subscriptionReducer(initialState, {
        type: ACTIONS.DELETE_SUBSCRIPTION,
        payload: 'test-id-1',
      })

      expect(result.subscriptions).toHaveLength(1)
    })
  })
})
