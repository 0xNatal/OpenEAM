// Read-only, auto-laid-out rendering of a building-block graph. Loaded
// lazily — diagram-js + elkjs are non-trivial payload — so this module must
// only be imported via React.lazy (see the landscape diagram route).
import type Diagram from 'diagram-js/lib/Diagram';
import 'diagram-js/assets/diagram-js.css';
import { useEffect, useRef, useState } from 'react';
import { type DiagramEdge, type DiagramNode, layoutAndRender } from './landscape-layout';

export type { DiagramEdge, DiagramNode } from './landscape-layout';

interface LandscapeDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export default function LandscapeDiagram({ nodes, edges }: LandscapeDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || nodes.length === 0) return;

    let destroyed = false;
    let diagram: Diagram | undefined;
    setError(null);

    layoutAndRender(container, nodes, edges)
      .then((d) => {
        if (destroyed) {
          d.destroy();
          return;
        }
        diagram = d;
      })
      .catch((err: unknown) => {
        if (destroyed) return;
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      });

    // StrictMode double-invokes this effect in dev; without destroy() a
    // second diagram would stack a second canvas into the container.
    return () => {
      destroyed = true;
      diagram?.destroy();
    };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">No building blocks match this viewpoint.</p>
    );
  }

  if (error) {
    return (
      <p className="p-4 text-xs text-destructive">Could not render landscape diagram: {error}</p>
    );
  }

  // diagram-js draws dark strokes on a transparent canvas, so the surface
  // stays light in both themes for readability — same reasoning as the BPMN
  // viewer/modeler.
  return <div ref={containerRef} className="h-full w-full bg-white dark:bg-neutral-300" />;
}
