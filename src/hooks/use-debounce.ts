/**
 * Returns a debounced copy of a value that only updates after `delay` ms
 * of no changes. Useful to avoid filtering/fetching on every keystroke.
 */
import { useEffect, useState } from 'react';
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
