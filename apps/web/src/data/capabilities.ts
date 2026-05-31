export interface ProcessStep {
  id: string;
  name: string;
}

export interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
  capabilityId: string;
  trigger?: string;
  outcome?: string;
  steps: ProcessStep[];
}

export interface Person {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'it-system' | 'physical-asset' | 'intangible-asset';
}

export interface Information {
  id: string;
  name: string;
}

export interface BusinessCapability {
  id: string;
  name: string;
  description?: string;
  people: Person[];
  resources: Resource[];
  information: Information[];
  businessProcesses: BusinessProcess[];
}

type RawProcess = Pick<BusinessProcess, 'id' | 'name'>;
type RawCapability = Omit<BusinessCapability, 'businessProcesses'> & {
  businessProcesses: RawProcess[];
};

const RAW_BUSINESS_CAPABILITIES: RawCapability[] = [
  // Order to Cash
  {
    id: 'channel-management',
    name: 'Channel Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'receive-order-request', name: 'Receive order request' },
      { id: 'validate-customer', name: 'Validate customer' },
    ],
  },
  {
    id: 'catalog-management',
    name: 'Catalog Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'check-product-availability', name: 'Check product availability' },
      { id: 'apply-discounts', name: 'Apply discounts' },
    ],
  },
  {
    id: 'order-processing',
    name: 'Order Processing',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'create-sales-order', name: 'Create sales order' },
      { id: 'validate-order', name: 'Validate order' },
      { id: 'route-order', name: 'Route order' },
    ],
  },
  {
    id: 'credit-assessment',
    name: 'Credit Assessment',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'check-credit-limit', name: 'Check credit limit' },
      { id: 'approve-credit', name: 'Approve credit' },
    ],
  },
  {
    id: 'risk-management',
    name: 'Risk Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'assess-risk', name: 'Assess risk' },
      { id: 'flag-exceptions', name: 'Flag exceptions' },
    ],
  },
  {
    id: 'order-management',
    name: 'Order Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'receive-validate-order', name: 'Receive and validate customer order' },
      { id: 'process-payment', name: 'Process payment' },
      { id: 'generate-confirmation', name: 'Generate order confirmation' },
    ],
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'check-product-avail', name: 'Check product availability' },
      { id: 'allocate-inventory', name: 'Allocate inventory for the order' },
      { id: 'update-inventory', name: 'Update inventory levels' },
    ],
  },
  {
    id: 'delivery-management',
    name: 'Delivery Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'schedule-shipment', name: 'Schedule shipment' },
      { id: 'coordinate-logistics', name: 'Coordinate with logistics provider' },
      { id: 'track-shipment', name: 'Track shipment status' },
    ],
  },
  {
    id: 'logistics-management',
    name: 'Logistics Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'dispatch-order', name: 'Dispatch order' },
      { id: 'track-delivery', name: 'Track delivery' },
      { id: 'handle-returns', name: 'Handle returns' },
    ],
  },
  {
    id: 'billing-management',
    name: 'Billing Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'generate-invoice', name: 'Generate invoice' },
      { id: 'send-invoice', name: 'Send invoice to customer' },
    ],
  },
  {
    id: 'ar-management',
    name: 'AR Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'record-payment', name: 'Record payment receipt' },
      { id: 'reconcile-accounts', name: 'Reconcile accounts' },
      { id: 'manage-disputes', name: 'Manage disputes' },
    ],
  },
  {
    id: 'collections-management',
    name: 'Collections Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'send-reminders', name: 'Send payment reminders' },
      { id: 'process-late-payments', name: 'Process late payments' },
      { id: 'escalate-overdue', name: 'Escalate overdue accounts' },
    ],
  },

  // Hire to Retire
  {
    id: 'talent-acquisition',
    name: 'Talent Acquisition',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'post-job', name: 'Post job listing' },
      { id: 'screen-candidates', name: 'Screen candidates' },
      { id: 'conduct-interviews', name: 'Conduct interviews' },
    ],
  },
  {
    id: 'employee-setup',
    name: 'Employee Setup',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'create-profile', name: 'Create employee profile' },
      { id: 'provision-access', name: 'Provision system access' },
      { id: 'assign-equipment', name: 'Assign equipment' },
    ],
  },
  {
    id: 'training-management',
    name: 'Training Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'orientation', name: 'Conduct orientation' },
      { id: 'role-training', name: 'Role-specific training' },
    ],
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'define-okrs', name: 'Define OKRs' },
      { id: 'align-objectives', name: 'Align with team objectives' },
    ],
  },
  {
    id: 'review-cycle',
    name: 'Review Cycle',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'mid-year-review', name: 'Mid-year review' },
      { id: 'annual-review', name: 'Annual performance review' },
      { id: 'feedback-collection', name: 'Collect 360° feedback' },
    ],
  },
  {
    id: 'payroll-management',
    name: 'Payroll Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'calculate-salary', name: 'Calculate salary' },
      { id: 'process-payroll', name: 'Process payroll' },
      { id: 'manage-deductions', name: 'Manage deductions' },
    ],
  },
  {
    id: 'exit-management',
    name: 'Exit Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'exit-interview', name: 'Conduct exit interview' },
      { id: 'revoke-access', name: 'Revoke system access' },
      { id: 'process-final-pay', name: 'Process final payment' },
    ],
  },

  // Concept to Market
  {
    id: 'innovation-management',
    name: 'Innovation Management',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'gather-ideas', name: 'Gather ideas' },
      { id: 'evaluate-concepts', name: 'Evaluate concepts' },
    ],
  },
  {
    id: 'ux-design',
    name: 'UX Design',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'user-research', name: 'User research' },
      { id: 'create-prototypes', name: 'Create prototypes' },
      { id: 'usability-testing', name: 'Usability testing' },
    ],
  },
  {
    id: 'technical-design',
    name: 'Technical Design',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'architecture-design', name: 'Architecture design' },
      { id: 'api-design', name: 'API design' },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'sprint-planning', name: 'Sprint planning' },
      { id: 'implementation', name: 'Implementation' },
      { id: 'code-review', name: 'Code review' },
    ],
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'unit-testing', name: 'Unit testing' },
      { id: 'integration-testing', name: 'Integration testing' },
      { id: 'uat', name: 'User acceptance testing' },
    ],
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market',
    people: [],
    resources: [],
    information: [],
    businessProcesses: [
      { id: 'marketing-campaign', name: 'Marketing campaign' },
      { id: 'sales-enablement', name: 'Sales enablement' },
      { id: 'product-launch', name: 'Product launch event' },
    ],
  },
];

export const BUSINESS_CAPABILITIES: BusinessCapability[] = RAW_BUSINESS_CAPABILITIES.map((cap) => ({
  ...cap,
  businessProcesses: cap.businessProcesses.map((p) => ({ ...p, capabilityId: cap.id, steps: [] })),
}));

const BUSINESS_CAPABILITIES_MAP = new Map(BUSINESS_CAPABILITIES.map((c) => [c.id, c]));

export function getBusinessCapability(id: string): BusinessCapability | undefined {
  return BUSINESS_CAPABILITIES_MAP.get(id);
}
