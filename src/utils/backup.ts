import type { HealthEntry } from '../types';
import { getAllEntries, saveEntry, clearAllEntries, bulkAddEntries } from '../db/db';

export interface BackupData {
  version: 1;
  exportedAt: string;
  entries: HealthEntry[];
}

export async function exportBackup(): Promise<void> {
  const entries = await getAllEntries();
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: entries.map(({ id: _, ...rest }) => rest as HealthEntry),
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hearttrack-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(text: string): BackupData {
  const data = JSON.parse(text);
  if (!data.version || !Array.isArray(data.entries)) {
    throw new Error('Invalid backup file format');
  }
  return data as BackupData;
}

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
