import { useState, useEffect, useCallback } from 'react';
import { getBackupMeta, getEntryCount } from '../db/db';

export interface BackupStatus {
  /** ISO timestamp of last confirmed backup (via Web Share). Null if never confirmed. */
  lastBackupAt: string | null;
  /** Number of new entries since last *confirmed* backup. If never confirmed, equals total count. */
  newEntriesSinceBackup: number;
  /** ISO timestamp of last download attempt. Null if never attempted. */
  lastAttemptAt: string | null;
  /** Method of last attempt: 'shared' or 'downloaded'. */
  lastAttemptMethod: 'shared' | 'downloaded' | null;
  loading: boolean;
}

export function useBackupStatus(entryCount: number) {
  const [status, setStatus] = useState<BackupStatus>({
    lastBackupAt: null,
    newEntriesSinceBackup: 0,
    lastAttemptAt: null,
    lastAttemptMethod: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    const meta = await getBackupMeta();
    const currentCount = await getEntryCount();
    // "new entries" counts against confirmed backups only
    const newEntries = meta.lastBackupAt
      ? Math.max(0, currentCount - meta.entryCountAtBackup)
      : currentCount;
    setStatus({
      lastBackupAt: meta.lastBackupAt,
      newEntriesSinceBackup: newEntries,
      lastAttemptAt: meta.lastAttemptAt,
      lastAttemptMethod: meta.lastAttemptMethod,
      loading: false,
    });
  }, []);

  // Refresh when entry count changes (add/delete) or on mount
  useEffect(() => {
    refresh();
  }, [refresh, entryCount]);

  return { ...status, refreshBackupStatus: refresh };
}
