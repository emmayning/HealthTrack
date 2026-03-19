import Dexie, { type Table } from 'dexie';
import type { HealthEntry, AppSettings } from '../types';

class HealthTrackDB extends Dexie {
  entries!: Table<HealthEntry, number>;
  settings!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('healthtrack-db');
    this.version(1).stores({
      entries: '++id, &date',
      settings: 'key',
    });
  }
}

const db = new HealthTrackDB();

export async function getAllEntries(): Promise<HealthEntry[]> {
  const all = await db.entries.toArray();
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveEntry(entry: HealthEntry): Promise<void> {
  const existing = await db.entries.where('date').equals(entry.date).first();
  if (existing) {
    await db.entries.update(existing.id!, {
      ...entry,
      id: existing.id,
    });
  } else {
    const { id: _, ...rest } = entry;
    await db.entries.add(rest as HealthEntry);
  }
}

export async function getEntry(date: string): Promise<HealthEntry | undefined> {
  return db.entries.where('date').equals(date).first();
}

export async function deleteEntry(date: string): Promise<void> {
  await db.entries.where('date').equals(date).delete();
}

export async function getSettings(): Promise<AppSettings> {
  const lang = await db.settings.get('language');
  const unit = await db.settings.get('weightUnit');
  return {
    language: (lang?.value as AppSettings['language']) || 'en',
    weightUnit: (unit?.value as AppSettings['weightUnit']) || 'kg',
  };
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

export async function clearAllEntries(): Promise<void> {
  await db.entries.clear();
}

export async function bulkAddEntries(entries: HealthEntry[]): Promise<void> {
  const cleaned = entries.map(({ id: _, ...rest }) => rest as HealthEntry);
  await db.entries.bulkAdd(cleaned);
}

export { db };
