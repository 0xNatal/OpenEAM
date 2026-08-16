// elkjs -> diagram-js glue: computes an automatic layout for a filtered
// building-block graph, then renders it into a bare diagram-js canvas (no
// palette/selection/modeling — pan/zoom only). Split out of the React
// wrapper so the pure data logic (edge filtering, layout) is testable
// without a DOM.

import CoreModule from 'diagram-js/lib/core';
import Diagram from 'diagram-js/lib/Diagram';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js';
import LandscapeRendererModule, { ensureArrowMarker } from './landscape-renderer';

export interface DiagramNode {
  id: string;
  label: string;
  kind: 'architecture' | 'solution';
}

export type DiagramEdgeKind = 'realization' | 'depends_on' | 'data_flow';

export interface DiagramEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: DiagramEdgeKind;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;

// Drops edges whose source or target isn't among the given nodes — a
// relationship or realization link can point at a block that the current
// viewpoint filter excluded, which would otherwise produce a dangling
// connection. Exported for unit testing without a DOM.
export function filterDanglingEdges(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramEdge[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  return edges.filter((e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));
}

async function computeLayout(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
): Promise<{ nodes: ElkNode[]; edges: ElkExtendedEdge[] }> {
  const elk = new ELK();
  const result = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    },
    children: nodes.map((n) => ({ id: n.id, width: NODE_WIDTH, height: NODE_HEIGHT })),
    edges: edges.map((e) => ({ id: e.id, sources: [e.sourceId], targets: [e.targetId] })),
  });
  return { nodes: result.children ?? [], edges: result.edges ?? [] };
}

// Builds and mounts a diagram-js canvas laid out by elk into `container`.
// Returns the live Diagram instance so the caller can destroy it on
// unmount/re-run, mirroring bpmn-viewer.tsx's lifecycle discipline.
export async function layoutAndRender(
  container: HTMLElement,
  nodes: DiagramNode[],
  rawEdges: DiagramEdge[],
): Promise<Diagram> {
  const edges = filterDanglingEdges(nodes, rawEdges);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edgeById = new Map(edges.map((e) => [e.id, e]));

  const layout = await computeLayout(nodes, edges);

  const diagram = new Diagram({
    canvas: { container },
    modules: [CoreModule, ZoomScrollModule, MoveCanvasModule, LandscapeRendererModule],
  });

  const canvas = diagram.get('canvas') as {
    addShape: (shape: unknown) => void;
    addConnection: (connection: unknown, parent: unknown) => void;
    getRootElement: () => unknown;
    getContainer: () => HTMLElement;
    zoom: (mode: string) => void;
  };
  const elementFactory = diagram.get('elementFactory') as {
    createShape: (attrs: Record<string, unknown>) => unknown;
    createConnection: (attrs: Record<string, unknown>) => unknown;
  };

  const shapesById = new Map<string, unknown>();
  for (const laidOutNode of layout.nodes) {
    if (!laidOutNode.id) continue;
    const original = nodeById.get(laidOutNode.id);
    if (!original) continue;
    const shape = elementFactory.createShape({
      id: laidOutNode.id,
      x: laidOutNode.x ?? 0,
      y: laidOutNode.y ?? 0,
      width: laidOutNode.width ?? NODE_WIDTH,
      height: laidOutNode.height ?? NODE_HEIGHT,
      businessObject: original,
    });
    canvas.addShape(shape);
    shapesById.set(laidOutNode.id, shape);
  }

  for (const laidOutEdge of layout.edges) {
    if (!laidOutEdge.id) continue;
    const original = edgeById.get(laidOutEdge.id);
    if (!original) continue;
    const source = shapesById.get(original.sourceId);
    const target = shapesById.get(original.targetId);
    if (!source || !target) continue;

    // elk returns routed edges as `sections` (startPoint/bendPoints/endPoint),
    // not a flat list of points — a common gotcha when wiring elk into a
    // renderer that expects plain waypoints.
    const section = laidOutEdge.sections?.[0];
    const waypoints = section
      ? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
      : [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ];

    const connection = elementFactory.createConnection({
      id: laidOutEdge.id,
      waypoints,
      source,
      target,
      businessObject: original,
    });
    canvas.addConnection(connection, canvas.getRootElement());
  }

  ensureArrowMarker(canvas.getContainer());
  canvas.zoom('fit-viewport');

  return diagram;
}
