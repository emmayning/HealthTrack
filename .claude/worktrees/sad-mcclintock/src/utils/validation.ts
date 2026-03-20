import type { HealthEntry } from '../types';

export interface ValidationWarning {
  field: string;
  message: string;
}

type WarningMessages = {
  [key: string]: (val: number) => string;
};

const warningMessagesEn: WarningMessages = {
  morningSystolic: (v) => `Morning systolic ${v} mmHg seems unusual`,
  morningDiastolic: (v) => `Morning diastolic ${v} mmHg seems unusual`,
  eveningSystolic: (v) => `Evening systolic ${v} mmHg seems unusual`,
  eveningDiastolic: (v) => `Evening diastolic ${v} mmHg seems unusual`,
  restingHeartRate: (v) => `Resting heart rate ${v} bpm seems unusual`,
  weight: (v) => `Weight ${v} seems unusual`,
};

const warningMessagesZh: WarningMessages = {
  morningSystolic: (v) => `晨间收缩压 ${v} mmHg 似乎异常`,
  morningDiastolic: (v) => `晨间舒张压 ${v} mmHg 似乎异常`,
  eveningSystolic: (v) => `晚间收缩压 ${v} mmHg 似乎异常`,
  eveningDiastolic: (v) => `晚间舒张压 ${v} mmHg 似乎异常`,
  restingHeartRate: (v) => `静息心率 ${v} bpm 似乎异常`,
  weight: (v) => `体重 ${v} 似乎异常`,
};

const RANGES: Record<string, [number, number]> = {
  morningSystolic: [70, 200],
  morningDiastolic: [40, 130],
  eveningSystolic: [70, 200],
  eveningDiastolic: [40, 130],
  restingHeartRate: [30, 200],
  weight: [20, 300], // kg
};

export function validateEntry(
  entry: HealthEntry,
  lang: 'en' | 'zh' = 'en'
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const msgs = lang === 'zh' ? warningMessagesZh : warningMessagesEn;

  for (const [field, [low, high]] of Object.entries(RANGES)) {
    const val = entry[field as keyof HealthEntry] as number | null;
    if (val !== null && (val < low || val > high)) {
      warnings.push({ field, message: msgs[field](val) });
    }
  }
  return warnings;
}
