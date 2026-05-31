import { CAPABILITIES } from './capabilities';

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

export const BUSINESS_PROCESSES: BusinessProcess[] = CAPABILITIES.flatMap((cap) =>
  cap.processes.map((p) => ({
    id: p.id,
    name: p.name,
    capabilityId: cap.id,
    steps: [],
  })),
);

const BUSINESS_PROCESSES_MAP = new Map(BUSINESS_PROCESSES.map((p) => [p.id, p]));

export function getBusinessProcess(id: string): BusinessProcess | undefined {
  return BUSINESS_PROCESSES_MAP.get(id);
}
