// Minimal diagram-js renderer for building blocks, business capabilities,
// and the edges between them.
//
// Visual grammar:
// - Shape: pill = business capability, cylinder = a block whose primary
//   domain is Data, rectangle = everything else.
// - Color: architecture domain (business/data/application/technology),
//   loosely following ArchiMate's own layer palette — not ABB vs SBB, which
//   moves to the hover tooltip instead so domain and kind don't compete for
//   the same visual channel. A block's domain is many-to-many in the data
//   model; this renders only the first/primary one.
// - Containers (hosted_on parents, e.g. Azure holding Kubernetes): dashed
//   outline, near-transparent fill, label pinned to the top-left so nested
//   children stay visible through it, rather than the centered-label solid
//   fill leaf blocks get.
import type EventBus from 'diagram-js/lib/core/EventBus';
import type { ConnectionLike, ShapeLike } from 'diagram-js/lib/core/Types';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, attr as svgAttr, create as svgCreate } from 'tiny-svg';
import type { DiagramEdge, DiagramNode } from './landscape-layout';

const ARROW_MARKER_ID = 'landscape-diagram-arrow';

type DomainCategory = 'business' | 'data' | 'application' | 'technology';

// Loosely follows ArchiMate's layer colors (business=yellow, application=
// blue, technology=green); data isn't a distinct ArchiMate layer, so this
// picks a teal that reads as its own thing without clashing.
const DOMAIN_COLORS: Record<DomainCategory, { stroke: string; fill: string }> = {
  business: { stroke: '#a16207', fill: '#fef9c3' },
  data: { stroke: '#0f766e', fill: '#ccfbf1' },
  application: { stroke: '#2563eb', fill: '#eff6ff' },
  technology: { stroke: '#15803d', fill: '#dcfce7' },
};

// Custom/renamed architecture domains (this app doesn't enforce the 4
// default names as a fixed enum) fall back to neutral grey.
const UNCLASSIFIED_COLOR = { stroke: '#6b7280', fill: '#f3f4f6' };

// Best-effort classification by domain name, matching the 4 default
// architecture domains this app seeds (see examples/*.json) — a substring
// match rather than an exact one so "Data Architecture" still matches if a
// user tweaks the wording.
function classifyDomain(domainName: string | undefined): DomainCategory | undefined {
  if (!domainName) return undefined;
  const lower = domainName.toLowerCase();
  if (lower.includes('business')) return 'business';
  if (lower.includes('data')) return 'data';
  if (lower.includes('application')) return 'application';
  if (lower.includes('technology')) return 'technology';
  return undefined;
}

// hosted_on never reaches drawConnection — it becomes nesting, not a line
// (see landscape-layout.ts's buildContainmentTree) — but the map stays
// exhaustive so a future edge kind can't silently render with no color.
// Dashed = structural ("realizes/serves"), solid = runtime interaction;
// data_flow is drawn heavier since "what moves where" is the point of it.
const EDGE_STYLES: Record<DiagramEdge['kind'], { stroke: string; dashed: boolean; width: number }> =
  {
    realization: { stroke: '#6b7280', dashed: true, width: 1.5 },
    serves: { stroke: '#a16207', dashed: true, width: 1.5 },
    depends_on: { stroke: '#d97706', dashed: false, width: 1.5 },
    data_flow: { stroke: '#0f766e', dashed: false, width: 2.5 },
    hosted_on: { stroke: 'transparent', dashed: false, width: 0 },
  };

function truncate(label: string, max = 22): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

type RenderableNode = DiagramNode & { isContainer?: boolean };

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

function drawRoundedRect(
  parentGfx: SVGElement,
  width: number,
  height: number,
  colors: { stroke: string; fill: string },
  isContainer: boolean,
): SVGElement {
  const rect = svgCreate('rect', {
    width,
    height,
    rx: 6,
    ry: 6,
    stroke: colors.stroke,
    strokeWidth: 1.5,
    fill: isContainer ? 'rgba(255,255,255,0.35)' : colors.fill,
  });
  if (isContainer) {
    svgAttr(rect, { 'stroke-dasharray': '5,3' });
  }
  svgAppend(parentGfx, rect);
  return rect;
}

function drawPill(
  parentGfx: SVGElement,
  width: number,
  height: number,
  colors: { stroke: string; fill: string },
): SVGElement {
  const rect = svgCreate('rect', {
    width,
    height,
    rx: height / 2,
    ry: height / 2,
    stroke: colors.stroke,
    strokeWidth: 1.5,
    fill: colors.fill,
  });
  svgAppend(parentGfx, rect);
  return rect;
}

// Classic two-arc "database" icon: a body path with rounded top/bottom
// edges, plus a top ellipse drawn over it to read as the cylinder's lid.
function drawCylinder(
  parentGfx: SVGElement,
  width: number,
  height: number,
  colors: { stroke: string; fill: string },
): SVGElement {
  const rx = width / 2;
  const ry = Math.min(10, height * 0.2);
  const body = svgCreate('path', {
    d: `M 0,${ry} L 0,${height - ry} A ${rx},${ry} 0 0 0 ${width},${height - ry} L ${width},${ry} A ${rx},${ry} 0 0 0 0,${ry} Z`,
    stroke: colors.stroke,
    strokeWidth: 1.5,
    fill: colors.fill,
  });
  svgAppend(parentGfx, body);
  const lid = svgCreate('ellipse', {
    cx: rx,
    cy: ry,
    rx,
    ry,
    stroke: colors.stroke,
    strokeWidth: 1.5,
    fill: colors.fill,
  });
  svgAppend(parentGfx, lid);
  return body;
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
    const node = (shape as unknown as { businessObject: RenderableNode }).businessObject;
    const width = shape.width ?? 0;
    const height = shape.height ?? 0;

    // Business capabilities aren't assigned to a domain themselves — they
    // *are* the business layer, so they always get the business color.
    const category = node.kind === 'capability' ? 'business' : classifyDomain(node.domainName);
    const colors = category ? DOMAIN_COLORS[category] : UNCLASSIFIED_COLOR;

    let mainEl: SVGElement;
    if (node.kind === 'capability') {
      mainEl = drawPill(parentGfx, width, height, colors);
    } else if (category === 'data') {
      mainEl = drawCylinder(parentGfx, width, height, colors);
    } else {
      mainEl = drawRoundedRect(parentGfx, width, height, colors, Boolean(node.isContainer));
    }

    const text = svgCreate('text');
    svgAttr(
      text,
      node.isContainer
        ? { x: 10, y: 16, 'text-anchor': 'start', 'font-size': 11, 'font-weight': 600 }
        : {
            x: width / 2,
            y: height / 2,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-size': 12,
          },
    );
    svgAttr(text, { fill: '#1f2937' });
    text.textContent = truncate(node.label);
    const title = svgCreate('title');
    title.textContent =
      node.kind === 'capability'
        ? `${node.label} (Business Capability)`
        : `${node.label} (${node.kind === 'architecture' ? 'Architecture' : 'Solution'} Building Block)`;
    svgAppend(text, title);
    svgAppend(parentGfx, text);

    return mainEl;
  }

  override drawConnection(parentGfx: SVGElement, connection: ConnectionLike): SVGElement {
    const edge = (connection as unknown as { businessObject: DiagramEdge }).businessObject;
    const style = EDGE_STYLES[edge.kind];
    const points = (connection.waypoints ?? []).map((p) => `${p.x},${p.y}`).join(' ');

    const line = svgCreate('polyline', {
      points,
      fill: 'none',
      stroke: style.stroke,
      strokeWidth: style.width,
      'marker-end': `url(#${ARROW_MARKER_ID})`,
    });
    if (style.dashed) {
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
