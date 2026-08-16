import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Shared style for the "back to list" link rendered above a detail page's
// title, so every route (including the two canvas routes) looks the same.
export const pageBackLinkClassName =
  'mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400';

// Width convention: "content" pages (lists, forms, detail views) are capped
// and centered; "canvas" pages (BPMN modeler, landscape diagram) need the
// full available width for panning/zooming, so they only get the padding.
export const contentWidthClassName = 'mx-auto w-full max-w-5xl px-6 pb-8';
export const canvasWidthClassName = 'mx-auto flex h-[calc(100vh-3rem)] w-full flex-col px-6 pb-8';

interface PageHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
  className?: string;
}

// The title + page-level primary action row. Item-level actions (Edit/Delete
// on a card or row) stay local to that item, not here; page-level filters
// get their own plain row below this header, not folded into it.
export function PageHeader({ title, action, back, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {back}
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
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
