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
