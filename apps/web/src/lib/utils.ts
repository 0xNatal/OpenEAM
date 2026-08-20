import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Radix's <Select.Item> forbids an empty-string value (it's reserved
// internally to mean "no selection"), but this app uses '' pervasively for
// "All"/unset filter and form state. Every Select with a clearable empty
// option renders this sentinel for that item and maps it back to '' in the
// change handler, instead of each call site inventing its own.
export const SELECT_EMPTY_VALUE = '__empty__';
