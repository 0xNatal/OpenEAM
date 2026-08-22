import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { ValueStream, ValueStreamCapability, ValueStreamStage } from '@/lib/entities';
import { cn } from '@/lib/utils';

const ARROW = 18;

// ---------- Chevron ----------

interface ChevronProps {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function Chevron({ label, isFirst, isLast, isSelected, onClick }: ChevronProps) {
  const clipPath = isFirst
    ? `polygon(0 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, 0 100%)`
    : `polygon(${ARROW}px 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, ${ARROW}px 100%, 0 50%)`;

  return (
    <button
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
          : 'bg-violet-100 dark:bg-violet-950 text-violet-900 dark:text-violet-100 hover:bg-violet-200 dark:hover:bg-violet-900',
      )}
    >
      {label}
    </button>
  );
}

function getStageBusinessCapabilities(
  stage: ValueStreamStage | undefined,
  capabilitiesById: Map<string, ValueStreamCapability>,
): ValueStreamCapability[] {
  if (!stage) return [];
  return stage.capabilityIds.flatMap((id) => {
    const cap = capabilitiesById.get(id);
    return cap ? [cap] : [];
  });
}

// ---------- Main diagram ----------

export function ValueStreamDiagram({
  stream,
  capabilities,
}: {
  stream: ValueStream;
  capabilities: ValueStreamCapability[];
}) {
  const capabilitiesById = useMemo(
    () => new Map(capabilities.map((cap) => [cap.id, cap])),
    [capabilities],
  );

  const [selectedId, setSelectedId] = useState(stream.stages[0]?.id ?? '');
  const selectedIndex = stream.stages.findIndex((s) => s.id === selectedId);
  const selectedStage = stream.stages[selectedIndex] ?? stream.stages[0];
  const selectedCapabilities = useMemo(
    () => getStageBusinessCapabilities(selectedStage, capabilitiesById),
    [selectedStage, capabilitiesById],
  );

  // Center of the selected chevron, as a percentage of the row width — every
  // chevron is flex-1, so this needs no DOM measurement.
  const caretPosition = `${((Math.max(selectedIndex, 0) + 0.5) / stream.stages.length) * 100}%`;

  return (
    <div className="relative w-full">
      {/* Row 1 — Stages */}
      <div className="flex w-full rounded-lg overflow-hidden shadow-sm border border-violet-200 dark:border-violet-800">
        {stream.stages.map((stage, i) => (
          <Chevron
            key={stage.id}
            label={stage.name}
            isFirst={i === 0}
            isLast={i === stream.stages.length - 1}
            isSelected={stage.id === selectedId}
            onClick={() => setSelectedId(stage.id)}
          />
        ))}
      </div>

      {/* Capabilities & Processes for the selected stage, with a caret
          pointing back up to it (no DOM measurement — every chevron is the
          same width, so the caret's position is a plain percentage). */}
      <div className="relative mt-3">
        <div
          className="absolute -top-1.5 size-3 -translate-x-1/2 rotate-45 border-t border-l border-violet-200 dark:border-violet-800 bg-card"
          style={{ left: caretPosition }}
        />
        {selectedStage && (
          <div className="relative flex flex-col gap-0 rounded-xl border border-violet-200 dark:border-violet-800 bg-card overflow-hidden shadow-sm">
            <div
              className="grid gap-0 divide-x divide-violet-100 dark:divide-violet-900"
              style={{ gridTemplateColumns: `repeat(${selectedCapabilities.length}, 1fr)` }}
            >
              {selectedCapabilities.map((cap) => (
                <div key={cap.id} className="flex flex-col gap-1 px-4 py-3">
                  <Link
                    to="/capabilities/$capabilityId"
                    params={{ capabilityId: cap.id }}
                    className="text-sm font-semibold text-violet-800 dark:text-violet-200 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                  >
                    {cap.name}
                  </Link>
                  {cap.description && (
                    <p className="text-xs text-muted-foreground">{cap.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
