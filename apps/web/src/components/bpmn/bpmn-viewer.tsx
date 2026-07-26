// Read-only BPMN diagram display (pan + zoom, no editing). Loaded lazily —
// bpmn-js is a large dependency, so this module must only be imported via
// React.lazy (see the business process detail route).
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { useEffect, useRef, useState } from 'react';

export default function BpmnViewer({ xml }: { xml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewer = new NavigatedViewer({ container });
    let destroyed = false;

    viewer
      .importXML(xml)
      .then(() => {
        if (destroyed) return;
        const canvas = viewer.get('canvas') as { zoom: (mode: string) => void };
        canvas.zoom('fit-viewport');
      })
      .catch((err: unknown) => {
        if (destroyed) return;
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      });

    return () => {
      destroyed = true;
      viewer.destroy();
    };
  }, [xml]);

  if (error) {
    return <p className="p-4 text-xs text-destructive">Could not render BPMN diagram: {error}</p>;
  }

  // bpmn-js draws dark strokes on a transparent canvas, so the surface stays
  // light in both themes for readability. In dark mode we use a soft grey
  // panel rather than pure white to avoid a glaring box in the dark UI.
  return <div ref={containerRef} className="h-72 w-full rounded-lg bg-white dark:bg-neutral-300" />;
}
