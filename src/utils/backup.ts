import type { HealthEntry } from '../types';
import { getAllEntries, saveEntry, clearAllEntries, bulkAddEntries, getEntryCount, saveBackupMeta } from '../db/db';

export interface BackupData {
  version: 1;
  appName: 'HealthTrack';
  exportedAt: string;
  entries: HealthEntry[];
}

function buildFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `HealthTrack Backup - ${date}.json`;
}

function buildBackupBlob(backup: BackupData): Blob {
  const json = JSON.stringify(backup, null, 2);
  return new Blob([json], { type: 'application/json;charset=utf-8' });
}

async function buildBackupData(): Promise<BackupData> {
  const entries = await getAllEntries();
  return {
    version: 1,
    appName: 'HealthTrack',
    exportedAt: new Date().toISOString(),
    entries: entries.map(({ id: _, ...rest }) => rest as HealthEntry),
  };
}

async function recordBackupMeta(): Promise<void> {
  const count = await getEntryCount();
  await saveBackupMeta({
    lastBackupAt: new Date().toISOString(),
    entryCountAtBackup: count,
  });
}

/**
 * Try Web Share API with file support first (great on mobile).
 * Falls back to download link approach.
 */
export async function exportBackup(): Promise<void> {
  const backup = await buildBackupData();
  const blob = buildBackupBlob(backup);
  const filename = buildFilename();

  // Try Web Share API with file support (mobile browsers)
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    const file = new File([blob], filename, { type: 'application/json' });
    const shareData = { files: [file] };
    try {
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        await recordBackupMeta();
        return;
      }
    } catch (err) {
      // User cancelled share — don't record as backed up
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Other share errors: fall through to download
    }
  }

  // Fallback: standard file download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  await recordBackupMeta();
}

export function validateBackupFile(text: string): BackupData {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('NOT_JSON');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('INVALID_SHAPE');
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.entries)) {
    throw new Error('INVALID_SHAPE');
  }

  // Check each entry has at minimum a date string
  for (const entry of obj.entries) {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('INVALID_ENTRIES');
    }
    if (typeof (entry as Record<string, unknown>).date !== 'string') {
      throw new Error('INVALID_ENTRIES');
    }
  }

  return {
    version: 1,
    appName: 'HealthTrack',
    exportedAt: (obj.exportedAt as string) || '',
    entries: obj.entries as HealthEntry[],
  };
}

// Backward-compatible alias
export const parseBackupFile = validateBackupFile;

export async function importMerge(entries: HealthEntry[]): Promise<number> {
  let count = 0;
  for (const entry of entries) {
    await saveEntry(entry);
    count++;
  }
  return count;
}

export async function importReplace(entries: HealthEntry[]): Promise<number> {
  await clearAllEntries();
  await bulkAddEntries(entries);
  return entries.length;
}
