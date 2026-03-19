import type { WeightUnit } from '../types';

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function displayWeight(kg: number | null, unit: WeightUnit): string {
  if (kg === null) return '';
  if (unit === 'lb') return String(kgToLb(kg));
  return String(kg);
}

export function toKg(value: number, fromUnit: WeightUnit): number {
  if (fromUnit === 'lb') return lbToKg(value);
  return value;
}
