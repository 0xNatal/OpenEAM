import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const optionClassName = 'rounded-md px-3 py-1.5 text-xs font-medium transition-colors';

// Table and Diagram are peer views of the same landscape data, not a
// parent/child drill-down — so navigation between them is a two-way toggle,
// not a forward button paired with a back link.
export function LandscapeViewToggle({ active }: { active: 'table' | 'diagram' }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <Link
        to="/landscape"
        className={cn(
          optionClassName,
          active === 'table'
            ? 'bg-background text-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Table
      </Link>
      <Link
        to="/landscape/diagram"
        className={cn(
          optionClassName,
          active === 'diagram'
            ? 'bg-background text-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Diagram
      </Link>
    </div>
  );
}
