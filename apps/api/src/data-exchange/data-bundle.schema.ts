import { z } from 'zod';

const businessCapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

const businessProcessSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  capabilityId: z.string(),
  triggerEvent: z.string().nullable(),
  outcome: z.string().nullable(),
});

const processStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  processId: z.string(),
  position: z.number().int(),
});

const valueStreamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

const valueStreamStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  valueStreamId: z.string(),
  position: z.number().int(),
});

const stageCapabilitySchema = z.object({
  stageId: z.string(),
  capabilityId: z.string(),
  position: z.number().int(),
});

export const dataBundleSchema = z.object({
  businessCapabilities: z.array(businessCapabilitySchema),
  businessProcesses: z.array(businessProcessSchema),
  processSteps: z.array(processStepSchema),
  valueStreams: z.array(valueStreamSchema),
  valueStreamStages: z.array(valueStreamStageSchema),
  stageCapabilities: z.array(stageCapabilitySchema),
});

export type DataBundle = z.infer<typeof dataBundleSchema>;
