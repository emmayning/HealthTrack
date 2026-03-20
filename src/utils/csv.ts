import type { HealthEntry, WeightUnit, Language } from '../types';

function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

const HEADERS_EN = ['date', 'morningSystolic', 'morningDiastolic', 'eveningSystolic', 'eveningDiastolic', 'restingHeartRate', 'weightKg', 'notes'] as const;
const HEADERS_ZH = ['日期', '收缩压（早）', '舒张压（早）', '收缩压（晚）', '舒张压（晚）', '心率（次/分钟）', '体重（kg）', '备注'] as const;
const DISPLAY_WEIGHT_HEADERS_EN = ['displayWeight', 'displayWeightUnit'] as const;
const DISPLAY_WEIGHT_HEADERS_ZH = ['显示体重', '体重单位'] as const;

export function entriesToCSV(entries: HealthEntry[], weightUnit: WeightUnit, language: Language = 'en'): string {
  const showDisplayWeight = weightUnit === 'lb';
  const isZh = language === 'zh';
  const base = isZh ? HEADERS_ZH : HEADERS_EN;
  const dwHeaders = isZh ? DISPLAY_WEIGHT_HEADERS_ZH : DISPLAY_WEIGHT_HEADERS_EN;
  const headers = showDisplayWeight
    ? [...base.slice(0, 7), ...dwHeaders, base[7]]
    : [...base];

  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      const cols = [
        e.date,
        e.morningSystolic ?? '',
        e.morningDiastolic ?? '',
        e.eveningSystolic ?? '',
        e.eveningDiastolic ?? '',
        e.restingHeartRate ?? '',
        e.weight ?? '',
        ...(showDisplayWeight
          ? [e.weight !== null ? kgToLb(e.weight) : '', 'lb']
          : []),
        notes,
      ];
      return cols.join(',');
    });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(csv: string, filename = 'healthtrack-export.csv') {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
