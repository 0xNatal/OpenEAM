import { z } from 'zod';

// Record timestamps: exported for round-trip fidelity, optional so bundles
// created before they existed still import (the DB fills defaults).
const timestampFields = {
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
};

// Validity interval of temporal rows (ISO dates, null = unbounded).
const validityFields = {
  validFrom: z.string().nullable(),
  validTo: z.string().nullable(),
};

const enterpriseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  goal: z.string().nullable().optional(),
  ...timestampFields,
});

const businessCapabilitySchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ...timestampFields,
});

const businessProcessSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  capabilityId: z.string(),
  triggerEvent: z.string().nullable(),
  outcome: z.string().nullable(),
  // Optional so bundles exported before the diagram column existed still import.
  bpmnXml: z.string().nullable().optional(),
  ...timestampFields,
});

const processStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  processId: z.string(),
  position: z.number().int(),
  ...timestampFields,
});

const valueStreamSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ...timestampFields,
});

const valueStreamStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  valueStreamId: z.string(),
  position: z.number().int(),
  ...timestampFields,
});

const stageCapabilitySchema = z.object({
  stageId: z.string(),
  capabilityId: z.string(),
  position: z.number().int(),
});

const architectureDomainSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  ...timestampFields,
});

const organizationUnitSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  ...timestampFields,
});

const buildingBlockSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  kind: z.enum(['architecture', 'solution']),
  name: z.string(),
  description: z.string().nullable(),
  architectureLevel: z.enum(['strategic', 'segment', 'capability']).nullable(),
  lifecyclePhase: z.enum(['planned', 'active', 'phasing_out', 'retired']),
  ...validityFields,
  ...timestampFields,
});

const buildingBlockArchitectureDomainSchema = z.object({
  buildingBlockId: z.string(),
  architectureDomainId: z.string(),
});

const buildingBlockOrganizationUnitSchema = z.object({
  id: z.string(),
  buildingBlockId: z.string(),
  organizationUnitId: z.string(),
  ...validityFields,
  ...timestampFields,
});

const buildingBlockRealizationSchema = z.object({
  id: z.string(),
  architectureBuildingBlockId: z.string(),
  solutionBuildingBlockId: z.string(),
  ...validityFields,
  ...timestampFields,
});

const buildingBlockCapabilitySchema = z.object({
  id: z.string(),
  buildingBlockId: z.string(),
  capabilityId: z.string(),
  ...validityFields,
  ...timestampFields,
});

export const dataBundleSchema = z.object({
  // The enterprises this bundle carries; import replaces exactly these
  // enterprises' models and touches nothing else.
  enterprises: z.array(enterpriseSchema),
  businessCapabilities: z.array(businessCapabilitySchema),
  businessProcesses: z.array(businessProcessSchema),
  processSteps: z.array(processStepSchema),
  valueStreams: z.array(valueStreamSchema),
  valueStreamStages: z.array(valueStreamStageSchema),
  stageCapabilities: z.array(stageCapabilitySchema),
  // Optional (with defaults) so bundles exported before the landscape tables
  // existed still import.
  architectureDomains: z.array(architectureDomainSchema).default([]),
  organizationUnits: z.array(organizationUnitSchema).default([]),
  buildingBlocks: z.array(buildingBlockSchema).default([]),
  buildingBlockArchitectureDomains: z.array(buildingBlockArchitectureDomainSchema).default([]),
  buildingBlockOrganizationUnits: z.array(buildingBlockOrganizationUnitSchema).default([]),
  buildingBlockRealizations: z.array(buildingBlockRealizationSchema).default([]),
  buildingBlockCapabilities: z.array(buildingBlockCapabilitySchema).default([]),
});

export type DataBundle = z.infer<typeof dataBundleSchema>;
