export interface NamedRef {
  id: string;
  name: string;
}

export interface ProcessStep {
  id: string;
  name: string;
}

export interface BusinessProcess {
  id: string;
  name: string;
  description?: string | null;
  capabilityId: string;
  triggerEvent?: string | null;
  outcome?: string | null;
  steps: ProcessStep[];
}

export interface BusinessCapabilityDetail {
  id: string;
  name: string;
  description?: string | null;
  people: NamedRef[];
  resources: NamedRef[];
  information: NamedRef[];
  businessProcesses: NamedRef[];
}

export interface BusinessCapabilityWithProcesses {
  id: string;
  name: string;
  businessProcesses: NamedRef[];
}

export interface ValueStreamStage {
  id: string;
  name: string;
  capabilityIds: string[];
}

export interface ValueStream {
  id: string;
  name: string;
  description?: string | null;
  stages: ValueStreamStage[];
}
