import { useState, useEffect, useCallback } from 'react';
import { getBackupMeta, getEntryCount } from '../db/db';

export interface BackupStatus {
  lastBackupAt: string | null;
  newEntriesSinceBackup: number;
  loading: boolean;
}

export function useBackupStatus(entryCount: number) {
  const [status, setStatus] = useState<BackupStatus>({
    lastBackupAt: null,
    newEntriesSinceBackup: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    const meta = await getBackupMeta();
    const currentCount = await getEntryCount();
    const newEntries = meta.lastBackupAt
      ? Math.max(0, currentCount - meta.entryCountAtBackup)
      : currentCount;
    setStatus({
      lastBackupAt: meta.lastBackupAt,
      newEntriesSinceBackup: newEntries,
      loading: false,
    });
  }, []);

  // Refresh when entry count changes (add/delete) or on mount
  useEffect(() => {
    refresh();
  }, [refresh, entryCount]);

  return { ...status, refreshBackupStatus: refresh };
}
