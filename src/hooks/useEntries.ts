import { useState, useEffect, useCallback } from 'react';
import type { HealthEntry } from '../types';
import { getAllEntries, saveEntry, deleteEntry } from '../db/db';

export function useEntries() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getAllEntries();
    setEntries(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (entry: HealthEntry) => {
      await saveEntry(entry);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (date: string) => {
      await deleteEntry(date);
      await refresh();
    },
    [refresh]
  );

  return { entries, loading, save, remove, refresh };
}
