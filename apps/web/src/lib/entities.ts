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
  bpmnXml?: string | null;
  steps: ProcessStep[];
}

export interface CapabilityResource {
  id: string;
  name: string;
  lifecyclePhase: LifecyclePhase;
  __typename: 'ArchitectureBuildingBlock' | 'SolutionBuildingBlock';
}

export interface BusinessCapabilityDetail {
  id: string;
  name: string;
  description?: string | null;
  people: NamedRef[];
  resources: CapabilityResource[];
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

export type BuildingBlockKind = 'ARCHITECTURE' | 'SOLUTION';
export type ArchitectureLevel = 'STRATEGIC' | 'SEGMENT' | 'CAPABILITY';
export type LifecyclePhase = 'PLANNED' | 'ACTIVE' | 'PHASING_OUT' | 'RETIRED';

export interface OrganizationUnitLink {
  organizationUnitId: string;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface BuildingBlock {
  id: string;
  name: string;
  description?: string | null;
  lifecyclePhase: LifecyclePhase;
  validFrom?: string | null;
  validTo?: string | null;
  architectureDomainIds: string[];
  organizationUnitLinks: OrganizationUnitLink[];
  __typename: 'ArchitectureBuildingBlock' | 'SolutionBuildingBlock';
  architectureLevel?: ArchitectureLevel | null;
}

export interface ArchitectureDomain {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface OrganizationUnit {
  id: string;
  name: string;
  parentId?: string | null;
}
