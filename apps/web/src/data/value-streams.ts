import type { Capability } from './capabilities';
import { getCapability } from './capabilities';

export type { Capability };

export interface Stage {
  id: string;
  name: string;
  capabilityIds: string[];
}

export interface ValueStream {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
}

export const VALUE_STREAMS: ValueStream[] = [
  {
    id: 'order-to-cash',
    name: 'Order to Cash',
    description:
      'End-to-end process from customer order placement through final payment collection.',
    stages: [
      {
        id: 'customer-order-placement',
        name: 'Customer Order Placement',
        capabilityIds: ['channel-management', 'catalog-management'],
      },
      { id: 'order-management', name: 'Order Management', capabilityIds: ['order-processing'] },
      {
        id: 'credit-management',
        name: 'Credit Management',
        capabilityIds: ['credit-assessment', 'risk-management'],
      },
      {
        id: 'order-fulfillment',
        name: 'Order Fulfillment',
        capabilityIds: ['order-management', 'inventory-management', 'delivery-management'],
      },
      {
        id: 'order-shipment-delivery',
        name: 'Order Shipment / Delivery',
        capabilityIds: ['logistics-management'],
      },
      { id: 'invoicing', name: 'Invoicing', capabilityIds: ['billing-management'] },
      { id: 'accounts-receivable', name: 'Accounts Receivable', capabilityIds: ['ar-management'] },
      {
        id: 'payment-collection',
        name: 'Payment Collection',
        capabilityIds: ['collections-management'],
      },
    ],
  },
  {
    id: 'hire-to-retire',
    name: 'Hire to Retire',
    description: 'Complete employee lifecycle from recruitment through offboarding.',
    stages: [
      { id: 'recruitment', name: 'Recruitment', capabilityIds: ['talent-acquisition'] },
      {
        id: 'onboarding',
        name: 'Onboarding',
        capabilityIds: ['employee-setup', 'training-management'],
      },
      {
        id: 'performance-management',
        name: 'Performance Management',
        capabilityIds: ['goal-setting', 'review-cycle'],
      },
      {
        id: 'compensation',
        name: 'Compensation & Benefits',
        capabilityIds: ['payroll-management'],
      },
      { id: 'offboarding', name: 'Offboarding', capabilityIds: ['exit-management'] },
    ],
  },
  {
    id: 'concept-to-market',
    name: 'Concept to Market',
    description: 'Product development lifecycle from ideation through market launch.',
    stages: [
      { id: 'ideation', name: 'Ideation', capabilityIds: ['innovation-management'] },
      {
        id: 'product-design',
        name: 'Product Design',
        capabilityIds: ['ux-design', 'technical-design'],
      },
      { id: 'development', name: 'Development', capabilityIds: ['engineering'] },
      { id: 'testing', name: 'Testing & QA', capabilityIds: ['quality-assurance'] },
      { id: 'launch', name: 'Market Launch', capabilityIds: ['go-to-market'] },
    ],
  },
];

export function getValueStream(id: string): ValueStream | undefined {
  return VALUE_STREAMS.find((vs) => vs.id === id);
}

export function getStageCapabilities(stage: Stage): Capability[] {
  return stage.capabilityIds.flatMap((id) => {
    const cap = getCapability(id);
    return cap ? [cap] : [];
  });
}
