// Minimal typings for bpmn-moddle, which ships without TypeScript
// declarations. Only the surface used by bpmn-steps.ts is declared.
declare module 'bpmn-moddle' {
  export interface ModdleElement {
    $type: string;
    id: string;
    name?: string;
    rootElements?: ModdleElement[];
    flowElements?: ModdleElement[];
    sourceRef?: ModdleElement;
    targetRef?: ModdleElement;
  }

  export class BpmnModdle {
    fromXML(xml: string): Promise<{ rootElement: ModdleElement; warnings: unknown[] }>;
  }
}
