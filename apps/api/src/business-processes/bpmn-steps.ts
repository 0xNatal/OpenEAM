import { BpmnModdle, type ModdleElement } from 'bpmn-moddle';

const TASK_TYPES =
  /^bpmn:(Task|UserTask|ServiceTask|ManualTask|ScriptTask|BusinessRuleTask|SendTask|ReceiveTask|CallActivity|SubProcess)$/;

// Parses BPMN 2.0 XML (rejecting anything that is not valid BPMN) and returns
// the named tasks of all contained processes in execution order: a
// breadth-first walk along sequence flows starting at the start events.
// Elements not reachable from a start event are appended in document order.
// Unnamed tasks are skipped — they carry no useful step label.
export async function extractStepNames(bpmnXml: string): Promise<string[]> {
  const moddle = new BpmnModdle();
  const { rootElement } = await moddle.fromXML(bpmnXml);
  const processes = (rootElement.rootElements ?? []).filter((el) => el.$type === 'bpmn:Process');
  return processes.flatMap(orderedStepNames);
}

function orderedStepNames(process: ModdleElement): string[] {
  const elements = process.flowElements ?? [];

  const outgoing = new Map<ModdleElement, ModdleElement[]>();
  for (const el of elements) {
    if (el.$type === 'bpmn:SequenceFlow' && el.sourceRef && el.targetRef) {
      const targets = outgoing.get(el.sourceRef) ?? [];
      targets.push(el.targetRef);
      outgoing.set(el.sourceRef, targets);
    }
  }

  const visited = new Set<ModdleElement>();
  const ordered: ModdleElement[] = [];
  const queue = elements.filter((el) => el.$type === 'bpmn:StartEvent');
  while (queue.length > 0) {
    const el = queue.shift();
    if (!el || visited.has(el)) continue;
    visited.add(el);
    ordered.push(el);
    queue.push(...(outgoing.get(el) ?? []));
  }
  for (const el of elements) {
    if (!visited.has(el)) ordered.push(el);
  }

  return ordered
    .filter((el) => TASK_TYPES.test(el.$type))
    .map((el) => el.name?.trim())
    .filter((name): name is string => Boolean(name));
}
