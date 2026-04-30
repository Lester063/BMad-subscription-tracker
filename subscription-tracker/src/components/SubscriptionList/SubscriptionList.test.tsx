import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionProvider } from '../../context/SubscriptionContext';

describe('SubscriptionList', () => {
  it('renders empty state when no subscriptions exist', () => {
    render(
      <SubscriptionProvider>
        <SubscriptionList />
      </SubscriptionProvider>
    );
    
    expect(screen.getByText('No subscriptions yet.')).toBeDefined();
  });
});