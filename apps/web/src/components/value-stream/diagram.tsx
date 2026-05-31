import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ValueStream } from '@/data/value-streams';
import { getStageBusinessCapabilities } from '@/data/value-streams';
import { cn } from '@/lib/utils';

const ARROW = 18;

// ---------- Chevron ----------

interface ChevronProps {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
  refCallback: (el: HTMLButtonElement | null) => void;
}

function Chevron({ label, isFirst, isLast, isSelected, onClick, refCallback }: ChevronProps) {
  const clipPath = isFirst
    ? `polygon(0 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, 0 100%)`
    : `polygon(${ARROW}px 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, ${ARROW}px 100%, 0 50%)`;

  return (
    <button
      ref={refCallback}
      type="button"
      onClick={onClick}
      style={{
        clipPath,
        marginLeft: isFirst ? 0 : -ARROW,
        paddingLeft: isFirst ? 12 : ARROW + 8,
        paddingRight: isLast ? 12 : ARROW + 8,
        zIndex: isSelected ? 20 : 'auto',
      }}
      className={cn(
        'relative flex flex-1 items-center justify-center min-h-[56px] py-3 text-[13px] font-medium text-center leading-snug transition-colors duration-150 cursor-pointer select-none',
        isSelected
          ? 'bg-violet-600 text-white'
          : 'bg-violet-100 text-violet-900 hover:bg-violet-200',
      )}
    >
      {label}
    </button>
  );
}

// ---------- Mini chevron strip (for overview cards) ----------

export function MiniChevronStrip({ stages }: { stages: string[] }) {
  const D = 10;
  return (
    <div className="flex overflow-hidden">
      {stages.map((name, i) => {
        const isFirst = i === 0;
        const isLast = i === stages.length - 1;
        const clipPath = isFirst
          ? `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%)`
          : `polygon(${D}px 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, ${D}px 100%, 0 50%)`;
        return (
          <div
            key={name}
            title={name}
            style={{
              clipPath,
              marginLeft: isFirst ? 0 : -D,
              paddingLeft: isFirst ? 6 : D + 4,
              paddingRight: isLast ? 6 : D + 4,
              opacity: 0.85 - i * (0.5 / stages.length),
            }}
            className="flex-1 h-6 bg-violet-500 flex items-center min-w-0"
          >
            <span className="text-white text-[9px] font-medium truncate leading-none">{name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Connector SVG ----------

interface ConnectorPoint {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

function ConnectorSvg({
  points,
  width,
  height,
}: {
  points: ConnectorPoint[];
  width: number;
  height: number;
}) {
  if (!points.length || !width || !height) return null;

  const paths = points.map(({ fromX, fromY, toX, toY }) => {
    const midY = fromY + (toY - fromY) * 0.5;
    return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  });

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      width={width}
      height={height}
    >
      {paths.map((d, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable order, no reorder
        <path key={i} d={d} fill="none" stroke="rgb(139,92,246)" strokeWidth={2} />
      ))}
      {points.map(({ toX, toY }, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable order, no reorder
        <circle key={i} cx={toX} cy={toY} r={4} fill="rgb(139,92,246)" />
      ))}
    </svg>
  );
}

// ---------- Main diagram ----------

export function ValueStreamDiagram({ stream }: { stream: ValueStream }) {
  const [selectedId, setSelectedId] = useState(stream.stages[0]?.id ?? '');
  const selectedStage = useMemo(
    () => stream.stages.find((s) => s.id === selectedId) ?? stream.stages[0],
    [stream.stages, selectedId],
  );
  const selectedCapabilities = useMemo(
    () => (selectedStage ? getStageBusinessCapabilities(selectedStage) : []),
    [selectedStage],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const capRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [connectors, setConnectors] = useState<ConnectorPoint[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    setSvgSize({ w: cr.width, h: cr.height });

    const stageEl = stageRefs.current[selectedId];
    if (!stageEl) return;
    const sr = stageEl.getBoundingClientRect();
    const fromX = sr.left + sr.width / 2 - cr.left;
    const fromY = sr.bottom - cr.top;

    const pts: ConnectorPoint[] = [];
    for (const cap of selectedCapabilities) {
      const capEl = capRefs.current[cap.id];
      if (!capEl) continue;
      const capr = capEl.getBoundingClientRect();
      pts.push({
        fromX,
        fromY,
        toX: capr.left + capr.width / 2 - cr.left,
        toY: capr.top - cr.top,
      });
    }
    setConnectors(pts);
  }, [selectedId, selectedCapabilities]);

  // Measure after selection changes (DOM has updated by then)
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Remeasure on resize
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={containerRef} className="relative w-full">
      <ConnectorSvg points={connectors} width={svgSize.w} height={svgSize.h} />

      {/* Row 1 — Stages */}
      <div className="relative z-10 flex w-full rounded-lg overflow-hidden shadow-sm border border-violet-200">
        {stream.stages.map((stage, i) => (
          <Chevron
            key={stage.id}
            label={stage.name}
            isFirst={i === 0}
            isLast={i === stream.stages.length - 1}
            isSelected={stage.id === selectedId}
            onClick={() => setSelectedId(stage.id)}
            refCallback={(el) => {
              stageRefs.current[stage.id] = el;
            }}
          />
        ))}
      </div>

      {/* Gap — connectors travel through here */}
      <div className="h-12" />

      {/* Row 2+3 — Capabilities & Processes */}
      {selectedStage && (
        <div className="relative z-10 flex flex-col gap-0 rounded-xl border border-violet-200 bg-white overflow-hidden shadow-sm">
          {/* Row label */}
          <div className="flex items-center gap-3 px-5 py-3 bg-violet-50 border-b border-violet-100">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
              {selectedStage.name}
            </span>
          </div>

          {/* Capability columns */}
          <div
            className="grid gap-0 divide-x divide-violet-100"
            style={{ gridTemplateColumns: `repeat(${selectedCapabilities.length}, 1fr)` }}
          >
            {selectedCapabilities.map((cap) => (
              <div
                key={cap.id}
                ref={(el) => {
                  capRefs.current[cap.id] = el;
                }}
                className="flex flex-col"
              >
                {/* Capability name */}
                <div className="px-4 py-3 border-b border-violet-100 bg-white">
                  <Link
                    to="/capabilities/$capabilityId"
                    params={{ capabilityId: cap.id }}
                    className="text-sm font-semibold text-violet-800 hover:text-violet-600 hover:underline"
                  >
                    {cap.name}
                  </Link>
                </div>

                {/* Business Processes */}
                <div className="flex flex-col gap-2 p-4 bg-violet-50/40">
                  {cap.businessProcesses.map((proc) => (
                    <div
                      key={proc.id}
                      className="rounded-md border border-violet-100 bg-white px-3 py-2 text-xs text-slate-700 shadow-xs"
                    >
                      {proc.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
