import type { HealthEntry } from '../types';
import { getAllEntries, saveEntry, clearAllEntries, bulkAddEntries, getEntryCount, getBackupMeta, saveBackupMeta } from '../db/db';

export interface BackupData {
  version: 1;
  appName: 'HealthTrack';
  exportedAt: string;
  entries: HealthEntry[];
}

/**
 * Result from exportBackup() so the UI can respond honestly
 * about what happened and guide the user appropriately.
 *
 * - 'shared': Web Share API completed — user chose a destination
 *   in the native share sheet. We can be confident the file was saved.
 * - 'downloaded': Fallback download link was triggered. The browser
 *   initiated a download, but we cannot verify the user actually saved
 *   it — especially on iOS Safari where .json files may open in a new
 *   tab instead of saving. The UI should show guidance, not a success claim.
 * - 'cancelled': User opened the share sheet but dismissed it.
 */
export type BackupResult = 'shared' | 'downloaded' | 'cancelled';

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

/**
 * Record a *confirmed* backup (Web Share completed successfully).
 * Updates both the confirmed timestamp and the attempt timestamp.
 */
export async function recordConfirmedBackup(): Promise<void> {
  const count = await getEntryCount();
  const now = new Date().toISOString();
  await saveBackupMeta({
    lastBackupAt: now,
    entryCountAtBackup: count,
    lastAttemptAt: now,
    lastAttemptMethod: 'shared',
  });
}

/**
 * Record a download *attempt* (fallback path).
 * Only updates the attempt fields — does NOT touch the confirmed backup fields,
 * because we cannot verify the user actually saved the downloaded file.
 */
export async function recordDownloadAttempt(): Promise<void> {
  const now = new Date().toISOString();
  // Read existing meta so we preserve confirmed backup fields
  const existing = await getBackupMeta();
  await saveBackupMeta({
    lastBackupAt: existing.lastBackupAt,
    entryCountAtBackup: existing.entryCountAtBackup,
    lastAttemptAt: now,
    lastAttemptMethod: 'downloaded',
  });
}

/**
 * Export backup file using the best available browser mechanism.
 *
 * 1. Try Web Share API with file support (mobile browsers).
 *    navigator.share() resolves only after the user picks a destination,
 *    so we can confidently record backup metadata.
 *
 * 2. Fall back to download link (desktop, older mobile browsers).
 *    The browser triggers a download, but we cannot verify the user
 *    saved the file — on iOS Safari in particular, .json files may
 *    open in a new tab rather than saving. We still record metadata
 *    (the user likely saved it), but the UI should show guidance
 *    rather than a definitive success claim.
 */
export async function exportBackup(): Promise<BackupResult> {
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
        // Share completed — user picked a destination. This is confirmed.
        await recordConfirmedBackup();
        return 'shared';
      }
    } catch (err) {
      // User cancelled the share sheet
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Other share errors (e.g. NotAllowedError): fall through to download
    }
  }

  // Fallback: trigger a download via anchor element.
  // NOTE: On iOS Safari, .json files may open in a new tab instead
  // of downloading. We cannot detect whether the user actually saved it.
  // We record this as an *attempt* only — NOT a confirmed backup.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  await recordDownloadAttempt();
  return 'downloaded';
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

/**
 * Lightweight check for iOS Safari-like environment.
 * Used only for showing helpful save guidance — not for feature gating.
 * Intentionally simple: checks for iPhone/iPad + Safari UA.
 */
export function isLikelyIOSSafari(): boolean {
  const ua = navigator.userAgent;
  // iPad on iOS 13+ reports as Macintosh but has touch
  const isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Chrome on iOS still uses WebKit but includes 'CriOS'
  // We want to detect stock Safari specifically
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}
