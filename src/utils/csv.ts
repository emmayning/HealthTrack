import type { HealthEntry, WeightUnit } from '../types';

function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function entriesToCSV(entries: HealthEntry[], weightUnit: WeightUnit): string {
  const showDisplayWeight = weightUnit === 'lb';
  const headers = [
    'date',
    'morningSystolic',
    'morningDiastolic',
    'eveningSystolic',
    'eveningDiastolic',
    'restingHeartRate',
    'weightKg',
    ...(showDisplayWeight ? ['displayWeight', 'displayWeightUnit'] : []),
    'notes',
  ];

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

export function downloadCSV(csv: string, filename = 'hearttrack-export.csv') {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
