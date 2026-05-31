import type { BusinessProcess, ProcessStep } from './capabilities';
import { BUSINESS_CAPABILITIES } from './capabilities';

export type { BusinessProcess, ProcessStep };

export const BUSINESS_PROCESSES: BusinessProcess[] = BUSINESS_CAPABILITIES.flatMap(
  (cap) => cap.businessProcesses,
);

const BUSINESS_PROCESSES_MAP = new Map(BUSINESS_PROCESSES.map((p) => [p.id, p]));

export function getBusinessProcess(id: string): BusinessProcess | undefined {
  return BUSINESS_PROCESSES_MAP.get(id);
}
