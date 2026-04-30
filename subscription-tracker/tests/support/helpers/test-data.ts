import { faker } from '@faker-js/faker';

/**
 * Subscription type constants matching project-context.md
 */
export type SubscriptionType =
  | 'streaming'
  | 'software'
  | 'fitness'
  | 'news'
  | 'gaming'
  | 'education'
  | 'other';

/**
 * Test data factories using Faker
 *
 * Usage:
 * const subscription = testData.subscription({
 *   name: 'Premium Netflix',
 *   cost: 19.99
 * });
 */
export class TestData {
  private subscriptionTypes: SubscriptionType[] = [
    'streaming',
    'software',
    'fitness',
    'news',
    'gaming',
    'education',
    'other',
  ];

  /**
   * Generate a realistic subscription object
   */
  subscription(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      name: overrides?.name || faker.company.name() + ' Premium',
      type: overrides?.type || faker.helpers.arrayElement(this.subscriptionTypes),
      cost: overrides?.cost || faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
      currency: overrides?.currency || 'USD',
      billingCycle: overrides?.billingCycle || faker.helpers.arrayElement(['monthly', 'yearly']),
      startDate: overrides?.startDate || new Date().toISOString(),
      notes: overrides?.notes || faker.lorem.sentence(),
      ...overrides,
    };
  }

  /**
   * Generate multiple subscriptions
   */
  subscriptions(count = 3, overrides?: Partial<any>) {
    return Array.from({ length: count }, () => this.subscription(overrides));
  }

  /**
   * Generate form input data
   */
  subscriptionFormData(overrides?: Partial<any>) {
    const sub = this.subscription(overrides);
    return {
      name: sub.name,
      type: sub.type,
      cost: sub.cost.toString(),
      billingCycle: sub.billingCycle,
      notes: sub.notes,
    };
  }

  /**
   * Generate random valid cost
   */
  randomCost() {
    return faker.number.float({ min: 1, max: 99.99, fractionDigits: 2 });
  }

  /**
   * Generate random subscription name
   */
  randomName() {
    return faker.company.name() + ' ' + faker.commerce.productAdjective();
  }
}
