// Minimal diagram-js renderer for building blocks and their edges.
// diagram-js's CoreModule only paints bare rects/lines with no text, so this
// draws a rounded box (colored by ABB vs SBB) with a centered, truncated
// label, plus styled connections distinguishing realization links from
// typed relationships.

import type EventBus from 'diagram-js/lib/core/EventBus';
import type { ConnectionLike, ShapeLike } from 'diagram-js/lib/core/Types';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, attr as svgAttr, create as svgCreate } from 'tiny-svg';
import type { DiagramEdge, DiagramNode } from './landscape-layout';

const ARROW_MARKER_ID = 'landscape-diagram-arrow';

const NODE_COLORS: Record<DiagramNode['kind'], { stroke: string; fill: string }> = {
  architecture: { stroke: '#2563eb', fill: '#eff6ff' },
  solution: { stroke: '#16a34a', fill: '#f0fdf4' },
};

const EDGE_COLORS: Record<DiagramEdge['kind'], string> = {
  realization: '#6b7280',
  depends_on: '#d97706',
  data_flow: '#7c3aed',
};

function truncate(label: string, max = 22): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

// diagram-js doesn't inject an arrowhead marker definition for us — add one
// to the canvas's root <svg> once, on first render.
export function ensureArrowMarker(container: HTMLElement): void {
  const svg = container.querySelector('svg');
  if (!svg || svg.querySelector(`#${ARROW_MARKER_ID}`)) return;

  const defs = svgCreate('defs');
  const marker = svgCreate('marker', {
    id: ARROW_MARKER_ID,
    viewBox: '0 0 10 10',
    refX: 9,
    refY: 5,
    markerWidth: 7,
    markerHeight: 7,
    orient: 'auto-start-reverse',
  });
  const path = svgCreate('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#9ca3af' });
  svgAppend(marker, path);
  svgAppend(defs, marker);
  svg.insertBefore(defs, svg.firstChild);
}

class LandscapeRenderer extends BaseRenderer {
  static $inject = ['eventBus'];

  constructor(eventBus: EventBus) {
    super(eventBus, 2000);
  }

  override canRender(): boolean {
    return true;
  }

  override drawShape(parentGfx: SVGElement, shape: ShapeLike): SVGElement {
    const node = (shape as unknown as { businessObject: DiagramNode }).businessObject;
    const colors = NODE_COLORS[node.kind];

    const rect = svgCreate('rect', {
      width: shape.width,
      height: shape.height,
      rx: 6,
      ry: 6,
      stroke: colors.stroke,
      strokeWidth: 1.5,
      fill: colors.fill,
    });
    svgAppend(parentGfx, rect);

    const text = svgCreate('text');
    svgAttr(text, {
      x: (shape.width ?? 0) / 2,
      y: (shape.height ?? 0) / 2,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': 12,
      fill: '#1f2937',
    });
    text.textContent = truncate(node.label);
    const title = svgCreate('title');
    title.textContent = node.label;
    svgAppend(text, title);
    svgAppend(parentGfx, text);

    return rect;
  }

  override drawConnection(parentGfx: SVGElement, connection: ConnectionLike): SVGElement {
    const edge = (connection as unknown as { businessObject: DiagramEdge }).businessObject;
    const points = (connection.waypoints ?? []).map((p) => `${p.x},${p.y}`).join(' ');

    const line = svgCreate('polyline', {
      points,
      fill: 'none',
      stroke: EDGE_COLORS[edge.kind],
      strokeWidth: 1.5,
      'marker-end': `url(#${ARROW_MARKER_ID})`,
    });
    if (edge.kind === 'realization') {
      svgAttr(line, { 'stroke-dasharray': '4,3' });
    }
    svgAppend(parentGfx, line);

    return line;
  }
}

export default {
  __init__: ['landscapeRenderer'],
  landscapeRenderer: ['type', LandscapeRenderer],
};
