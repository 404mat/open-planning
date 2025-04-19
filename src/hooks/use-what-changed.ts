import { useEffect, useRef } from 'react';

export function useWhatChanged(deps: Record<string, unknown>, label = 'Deps') {
  const prev = useRef<Record<string, string>>({});

  useEffect(() => {
    const changedKeys: string[] = [];

    for (const key of Object.keys(deps)) {
      const newVal = JSON.stringify(deps[key]);
      const oldVal = prev.current[key];

      if (oldVal !== newVal) {
        changedKeys.push(key);
        console.log(`[${label}] ${key} changed:`);
        console.log(`  before:`, oldVal ? JSON.parse(oldVal) : undefined);
        console.log(`  after :`, deps[key]);
        prev.current[key] = newVal;
      }
    }
  }, Object.values(deps));
}
