export interface Process {
  id: string;
  name: string;
}

export interface Capability {
  id: string;
  name: string;
  processes: Process[];
}

export interface Stage {
  id: string;
  name: string;
  capabilities: Capability[];
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
        capabilities: [
          {
            id: 'channel-management',
            name: 'Channel Management',
            processes: [
              { id: 'receive-order-request', name: 'Receive order request' },
              { id: 'validate-customer', name: 'Validate customer' },
            ],
          },
          {
            id: 'catalog-management',
            name: 'Catalog Management',
            processes: [
              { id: 'check-product-availability', name: 'Check product availability' },
              { id: 'apply-discounts', name: 'Apply discounts' },
            ],
          },
        ],
      },
      {
        id: 'order-management',
        name: 'Order Management',
        capabilities: [
          {
            id: 'order-processing',
            name: 'Order Processing',
            processes: [
              { id: 'create-sales-order', name: 'Create sales order' },
              { id: 'validate-order', name: 'Validate order' },
              { id: 'route-order', name: 'Route order' },
            ],
          },
        ],
      },
      {
        id: 'credit-management',
        name: 'Credit Management',
        capabilities: [
          {
            id: 'credit-assessment',
            name: 'Credit Assessment',
            processes: [
              { id: 'check-credit-limit', name: 'Check credit limit' },
              { id: 'approve-credit', name: 'Approve credit' },
            ],
          },
          {
            id: 'risk-management',
            name: 'Risk Management',
            processes: [
              { id: 'assess-risk', name: 'Assess risk' },
              { id: 'flag-exceptions', name: 'Flag exceptions' },
            ],
          },
        ],
      },
      {
        id: 'order-fulfillment',
        name: 'Order Fulfillment',
        capabilities: [
          {
            id: 'order-management-cap',
            name: 'Order Management',
            processes: [
              { id: 'receive-validate-order', name: 'Receive and validate customer order' },
              { id: 'process-payment', name: 'Process payment' },
              { id: 'generate-confirmation', name: 'Generate order confirmation' },
            ],
          },
          {
            id: 'inventory-management',
            name: 'Inventory Management',
            processes: [
              { id: 'check-product-avail', name: 'Check product availability' },
              { id: 'allocate-inventory', name: 'Allocate inventory for the order' },
              { id: 'update-inventory', name: 'Update inventory levels' },
            ],
          },
          {
            id: 'delivery-management',
            name: 'Delivery Management',
            processes: [
              { id: 'schedule-shipment', name: 'Schedule shipment' },
              { id: 'coordinate-logistics', name: 'Coordinate with logistics provider' },
              { id: 'track-shipment', name: 'Track shipment status' },
            ],
          },
        ],
      },
      {
        id: 'order-shipment-delivery',
        name: 'Order Shipment / Delivery',
        capabilities: [
          {
            id: 'logistics',
            name: 'Logistics Management',
            processes: [
              { id: 'dispatch-order', name: 'Dispatch order' },
              { id: 'track-delivery', name: 'Track delivery' },
              { id: 'handle-returns', name: 'Handle returns' },
            ],
          },
        ],
      },
      {
        id: 'invoicing',
        name: 'Invoicing',
        capabilities: [
          {
            id: 'billing',
            name: 'Billing Management',
            processes: [
              { id: 'generate-invoice', name: 'Generate invoice' },
              { id: 'send-invoice', name: 'Send invoice to customer' },
            ],
          },
        ],
      },
      {
        id: 'accounts-receivable',
        name: 'Accounts Receivable',
        capabilities: [
          {
            id: 'ar-management',
            name: 'AR Management',
            processes: [
              { id: 'record-payment', name: 'Record payment receipt' },
              { id: 'reconcile-accounts', name: 'Reconcile accounts' },
              { id: 'manage-disputes', name: 'Manage disputes' },
            ],
          },
        ],
      },
      {
        id: 'payment-collection',
        name: 'Payment Collection',
        capabilities: [
          {
            id: 'collections',
            name: 'Collections Management',
            processes: [
              { id: 'send-reminders', name: 'Send payment reminders' },
              { id: 'process-late-payments', name: 'Process late payments' },
              { id: 'escalate-overdue', name: 'Escalate overdue accounts' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hire-to-retire',
    name: 'Hire to Retire',
    description: 'Complete employee lifecycle from recruitment through offboarding.',
    stages: [
      {
        id: 'recruitment',
        name: 'Recruitment',
        capabilities: [
          {
            id: 'talent-acquisition',
            name: 'Talent Acquisition',
            processes: [
              { id: 'post-job', name: 'Post job listing' },
              { id: 'screen-candidates', name: 'Screen candidates' },
              { id: 'conduct-interviews', name: 'Conduct interviews' },
            ],
          },
        ],
      },
      {
        id: 'onboarding',
        name: 'Onboarding',
        capabilities: [
          {
            id: 'employee-setup',
            name: 'Employee Setup',
            processes: [
              { id: 'create-profile', name: 'Create employee profile' },
              { id: 'provision-access', name: 'Provision system access' },
              { id: 'assign-equipment', name: 'Assign equipment' },
            ],
          },
          {
            id: 'training',
            name: 'Training Management',
            processes: [
              { id: 'orientation', name: 'Conduct orientation' },
              { id: 'role-training', name: 'Role-specific training' },
            ],
          },
        ],
      },
      {
        id: 'performance-management',
        name: 'Performance Management',
        capabilities: [
          {
            id: 'goal-setting',
            name: 'Goal Setting',
            processes: [
              { id: 'define-okrs', name: 'Define OKRs' },
              { id: 'align-objectives', name: 'Align with team objectives' },
            ],
          },
          {
            id: 'review-cycle',
            name: 'Review Cycle',
            processes: [
              { id: 'mid-year-review', name: 'Mid-year review' },
              { id: 'annual-review', name: 'Annual performance review' },
              { id: 'feedback-collection', name: 'Collect 360° feedback' },
            ],
          },
        ],
      },
      {
        id: 'compensation',
        name: 'Compensation & Benefits',
        capabilities: [
          {
            id: 'payroll',
            name: 'Payroll Management',
            processes: [
              { id: 'calculate-salary', name: 'Calculate salary' },
              { id: 'process-payroll', name: 'Process payroll' },
              { id: 'manage-deductions', name: 'Manage deductions' },
            ],
          },
        ],
      },
      {
        id: 'offboarding',
        name: 'Offboarding',
        capabilities: [
          {
            id: 'exit-management',
            name: 'Exit Management',
            processes: [
              { id: 'exit-interview', name: 'Conduct exit interview' },
              { id: 'revoke-access', name: 'Revoke system access' },
              { id: 'process-final-pay', name: 'Process final payment' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'concept-to-market',
    name: 'Concept to Market',
    description: 'Product development lifecycle from ideation through market launch.',
    stages: [
      {
        id: 'ideation',
        name: 'Ideation',
        capabilities: [
          {
            id: 'innovation-management',
            name: 'Innovation Management',
            processes: [
              { id: 'gather-ideas', name: 'Gather ideas' },
              { id: 'evaluate-concepts', name: 'Evaluate concepts' },
            ],
          },
        ],
      },
      {
        id: 'product-design',
        name: 'Product Design',
        capabilities: [
          {
            id: 'ux-design',
            name: 'UX Design',
            processes: [
              { id: 'user-research', name: 'User research' },
              { id: 'create-prototypes', name: 'Create prototypes' },
              { id: 'usability-testing', name: 'Usability testing' },
            ],
          },
          {
            id: 'technical-design',
            name: 'Technical Design',
            processes: [
              { id: 'architecture-design', name: 'Architecture design' },
              { id: 'api-design', name: 'API design' },
            ],
          },
        ],
      },
      {
        id: 'development',
        name: 'Development',
        capabilities: [
          {
            id: 'engineering',
            name: 'Engineering',
            processes: [
              { id: 'sprint-planning', name: 'Sprint planning' },
              { id: 'implementation', name: 'Implementation' },
              { id: 'code-review', name: 'Code review' },
            ],
          },
        ],
      },
      {
        id: 'testing',
        name: 'Testing & QA',
        capabilities: [
          {
            id: 'quality-assurance',
            name: 'Quality Assurance',
            processes: [
              { id: 'unit-testing', name: 'Unit testing' },
              { id: 'integration-testing', name: 'Integration testing' },
              { id: 'uat', name: 'User acceptance testing' },
            ],
          },
        ],
      },
      {
        id: 'launch',
        name: 'Market Launch',
        capabilities: [
          {
            id: 'go-to-market',
            name: 'Go-to-Market',
            processes: [
              { id: 'marketing-campaign', name: 'Marketing campaign' },
              { id: 'sales-enablement', name: 'Sales enablement' },
              { id: 'product-launch', name: 'Product launch event' },
            ],
          },
        ],
      },
    ],
  },
];

export function getValueStream(id: string): ValueStream | undefined {
  return VALUE_STREAMS.find((vs) => vs.id === id);
}
