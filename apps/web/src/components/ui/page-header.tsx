import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Shared style for the "back to list" link rendered above a detail page's
// title, so every route (including the two canvas routes) looks the same.
export const pageBackLinkClassName =
  'mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground';

// Width convention: "content" pages (lists, forms, detail views) are capped
// and centered; "canvas" pages (BPMN modeler, landscape diagram) need the
// full available width for panning/zooming, so they only get the padding.
// <main> (app-shell.tsx) carries no padding of its own — these classes are
// each page's sole source of spacing, so it's never stacked on top of
// another layer.
export const contentWidthClassName = 'mx-auto w-full max-w-5xl px-6 pb-8';
export const canvasWidthClassName = 'mx-auto flex h-screen w-full flex-col px-6 pb-8';

// True edge-to-edge: no padding at all, for the one view meant to feel
// maximal rather than merely wide — canvasWidthClassName is still the
// right choice for other canvas pages (e.g. the BPMN modeler).
export const fullBleedCanvasClassName = 'flex h-screen w-full flex-col';

interface PageHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
  className?: string;
}

// The title + page-level primary action row. Item-level actions (Edit/Delete
// on a card or row) stay local to that item, not here; page-level filters
// get their own plain row below this header, not folded into it.
//
// Sticks to the top of the page on scroll, like Claude's own headers. The
// top padding lives here (not on <main>) so the breathing room above the
// title survives being stuck at the very top of the viewport instead of
// only existing before the first scroll. The gradient below it (rather
// than a border) fades scrolling content out instead of clipping it on a
// hard edge.
export function PageHeader({ title, action, back, className }: PageHeaderProps) {
  return (
    <div className={cn('sticky top-0 z-10 mb-10 bg-background pt-4', className)}>
      {back}
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-10 bg-gradient-to-b from-background from-40% to-transparent"
      />
    </div>
  );
}

// The "titled card with a list of items" shape shared by capability and
// business-process detail pages (was duplicated as local Quadrant/Section
// components).
export function TitledCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}
