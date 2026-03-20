export interface HealthEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  morningSystolic: number | null;
  morningDiastolic: number | null;
  eveningSystolic: number | null;
  eveningDiastolic: number | null;
  restingHeartRate: number | null;
  weight: number | null; // always stored in kg
  notes: string;
}

export type WeightUnit = 'kg' | 'lb';
export type Language = 'en' | 'zh';
export type RangeFilter = 7 | 30 | 90;
export type BPView = 'morning' | 'evening';

export interface AppSettings {
  language: Language;
  weightUnit: WeightUnit;
}

export interface BackupMeta {
  /** ISO timestamp of last *confirmed* backup (Web Share completed). Null if never confirmed. */
  lastBackupAt: string | null;
  /** Entry count at time of last confirmed backup. Used to compute "new entries since backup". */
  entryCountAtBackup: number;
  /** ISO timestamp of last backup *attempt* via download fallback. Null if never attempted. */
  lastAttemptAt: string | null;
  /** Which method was last used: 'shared' (confirmed) or 'downloaded' (unverifiable). */
  lastAttemptMethod: 'shared' | 'downloaded' | null;
}
