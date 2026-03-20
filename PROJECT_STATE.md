# PROJECT_STATE.md

> Last updated: 2026-03-19
> Purpose: Enable any new Claude Code session to understand and safely extend this project.

> **⚠️ MANDATORY RULE: Every future Claude session MUST read this file before making any changes, and MUST update it after any meaningful change.**

---

## 1. Project Overview

**HealthTrack** is a local-first personal health metrics tracker. Users log daily blood pressure (morning/evening), resting heart rate, and weight, then view trends over time via charts.

- **Target users**: Individuals tracking personal health metrics (the developer's dad — older adult monitoring BP)
- **Core features**: Daily entry logging, trend charts (7/30/90 days), human-friendly backup/restore, CSV export, bilingual UI (EN/ZH), weight unit toggle (kg/lb)
- **Not a medical app** — includes a disclaimer that this is for personal tracking only

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Build | Vite | 8.0.0 |
| Database | Dexie (IndexedDB wrapper) | 4.3.0 |
| Charts | Recharts | 3.8.0 |
| State | React hooks (no Redux/Zustand) | — |
| i18n | Custom lightweight (no i18next) | — |
| CSS | Plain CSS with CSS variables | — |
| Routing | None (single-page, state-based views) | — |

**Key constraints**: Local-first, no backend, no authentication, all data in browser IndexedDB. Mobile-first design (max-width 480px container).

---

## 3. Current Features (Implemented)

- Daily health entry form: morning BP, evening BP, resting HR, weight, notes
- One entry per date (upsert behavior — editing overwrites)
- Entry list with edit and delete
- Trend charts for BP, HR, and weight with 7/30/90 day range filter
- BP chart toggles between morning and evening view
- Weight stored internally in kg, displayed in user's preferred unit
- **Human-friendly backup/restore system** (see section 12 below)
  - "Back Up My Data" with Web Share API on mobile, download fallback on desktop
  - "Restore from Backup" with file validation and replace-with-confirmation flow
  - Backup status tracking: last backup date, new entries since backup
  - Gentle reminders when user hasn't backed up or has many new entries
- CSV export (as secondary option within data management section)
- Bilingual UI: English and Chinese (Simplified)
- Validation warnings for unusual values (doesn't block save)
- Medical disclaimer banner
- Settings panel (language, weight unit)

---

## 4. Incomplete / TODO

- No tests (unit or integration)
- No PWA manifest or service worker (not installable offline yet)
- No data visualization beyond line charts (no averages, min/max, or summary stats)
- No date range picker for entries list (shows all entries)
- No confirmation dialog before deleting entries (immediate delete)
- No dark mode
- No accessibility audit done
- Chart tooltips could show more context (e.g., notes)
- No pagination on entry list (could be slow with many entries)
- Old ExportButton and ImportButton components still exist in codebase but are no longer rendered (replaced by DataManagement); can be deleted in cleanup

---

## 5. Architecture Notes

### Data Flow
```
User Input → EntryForm (local state) → db.saveEntry() → Dexie/IndexedDB
                                                              ↓
App.tsx ← useEntries() hook ← db.getAllEntries() ← Dexie/IndexedDB
  ↓
Charts (filtered by range) + EntryList (all entries, reverse chronological)

Backup: exportBackup() → reads all entries → Web Share API or file download
Restore: file input → validateBackupFile() → confirm modal → importReplace() → refresh
Backup metadata: lastBackupAt + entryCountAtBackup → stored in Dexie settings table
```

### State Management
- **useEntries()** hook: manages `entries[]` and `loading` state; wraps Dexie CRUD
- **useSettings()** hook: manages `language` and `weightUnit`; persists to Dexie
- **useBackupStatus()** hook: manages `lastBackupAt`, `newEntriesSinceBackup`; re-computes when entry count changes
- **I18nContext**: React Context providing current language to all components
- **Component-local state**: form fields, chart range, BP view toggle, settings panel visibility, restore flow steps

### Chart Design
- All charts use Recharts `<LineChart>` with `<ResponsiveContainer>`
- BPChart: 2 lines (systolic/diastolic), toggleable morning/evening via `BPView` state
- HRChart: single line
- WeightChart: converts kg→lb for display if needed
- Common: dynamic tick intervals based on data density, custom tooltip component

### Date Handling
- All dates stored as `YYYY-MM-DD` strings
- Date is the unique key for entries (one entry per day)
- Display formatting in `src/utils/dates.ts` — locale-aware (EN: "Mar 19", ZH: "3月19日")

### Weight Handling
- **Always stored in kg** internally
- Converted to lb only for display and form input when user preference is lb
- Conversion functions in `src/utils/weight.ts`
- CSV export includes both kg and display unit columns

---

## 6. File Structure Overview

```
src/
├── components/
│   ├── Charts/
│   │   ├── BPChart.tsx         # Blood pressure chart (morning/evening toggle)
│   │   ├── HRChart.tsx         # Heart rate chart
│   │   ├── WeightChart.tsx     # Weight chart (kg/lb aware)
│   │   ├── RangeFilter.tsx     # 7/30/90 day selector
│   │   ├── ChartTooltip.tsx    # Shared custom tooltip
│   │   └── Charts.css
│   ├── DataManagement/
│   │   ├── DataManagement.tsx  # ★ Backup/Restore/CSV — main data management UI
│   │   └── DataManagement.css
│   ├── EntryForm/
│   │   ├── EntryForm.tsx       # Create/edit entry form with validation
│   │   └── EntryForm.css
│   ├── EntryList/
│   │   ├── EntryList.tsx       # Card list of entries with edit/delete
│   │   └── EntryList.css
│   ├── Settings/
│   │   ├── Settings.tsx        # Language + weight unit toggles
│   │   └── Settings.css
│   ├── Disclaimer/
│   │   ├── Disclaimer.tsx      # Medical disclaimer notice
│   │   └── Disclaimer.css
│   ├── ExportButton/           # ⚠ LEGACY — no longer rendered, replaced by DataManagement
│   │   └── ExportButton.tsx
│   └── ImportButton/           # ⚠ LEGACY — no longer rendered, replaced by DataManagement
│       ├── ImportButton.tsx
│       └── ImportButton.css
├── db/
│   └── db.ts                  # Dexie DB setup, CRUD ops, backup metadata persistence
├── hooks/
│   ├── useEntries.ts          # Entries state + DB operations
│   ├── useSettings.ts         # Settings state + persistence
│   └── useBackupStatus.ts     # ★ Backup status tracking (last backup, new entries since)
├── i18n/
│   ├── index.ts               # I18nContext + useTranslation hook
│   ├── en.ts                  # English translations (~90 keys)
│   └── zh.ts                  # Chinese translations
├── types/
│   └── index.ts               # All TypeScript interfaces and type aliases
├── utils/
│   ├── validation.ts          # Entry value range validation
│   ├── dates.ts               # Date formatting (locale-aware)
│   ├── weight.ts              # kg↔lb conversion
│   ├── csv.ts                 # CSV generation
│   └── backup.ts              # ★ Backup export (Web Share + download), validate, restore
├── App.tsx                    # Root component (orchestrates everything)
├── App.css                    # App-level styles
├── main.tsx                   # React entry point
└── index.css                  # CSS variables and base styles
```

---

## 7. How to Run the Project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser (default)
http://localhost:5173
```

Build for production:
```bash
npm run build
npm run preview
```

---

## 8. Data Model

### HealthEntry (Dexie table: `entries`)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | Auto-incremented primary key |
| date | string | `YYYY-MM-DD`, **unique index** — one entry per day |
| morningSystolic | number \| null | mmHg |
| morningDiastolic | number \| null | mmHg |
| eveningSystolic | number \| null | mmHg |
| eveningDiastolic | number \| null | mmHg |
| restingHeartRate | number \| null | bpm |
| weight | number \| null | **Always stored in kg** |
| notes | string | Free text |

### Settings (Dexie table: `settings`)
Key-value store:
- `language`: `'en'` | `'zh'`
- `weightUnit`: `'kg'` | `'lb'`
- `lastBackupAt`: ISO timestamp string (backup metadata)
- `entryCountAtBackup`: stringified number (backup metadata)

### BackupMeta (TypeScript interface, stored in settings table)
| Field | Type | Notes |
|-------|------|-------|
| lastBackupAt | string \| null | ISO timestamp of last successful backup |
| entryCountAtBackup | number | Entry count at time of last backup |

### Type Aliases
- `Language = 'en' | 'zh'`
- `WeightUnit = 'kg' | 'lb'`
- `RangeFilter = 7 | 30 | 90`
- `BPView = 'morning' | 'evening'`

---

## 9. Known Constraints / Design Decisions

| Decision | Reason |
|----------|--------|
| **Local-first, no backend** | Privacy-sensitive health data; simple deployment; works offline |
| **Dexie over localStorage** | Better performance for larger datasets; structured queries |
| **One entry per date** | Simplifies data model; users track daily metrics, not multiple per day |
| **Weight stored in kg** | Single source of truth; convert on display only |
| **BP toggle (morning/evening)** | Showing 4 lines on one chart is cluttered on mobile; toggle keeps it readable |
| **Custom i18n over i18next** | Only 2 languages, ~90 keys; no need for heavy i18n framework |
| **No router** | Single-page app with simple state-based view switching is sufficient |
| **Mobile-first (480px)** | Primary use case is quick daily logging on phone |
| **Validation warns, doesn't block** | Users may have unusual but valid readings; don't prevent saving |
| **Replace-only restore (no merge)** | Merge adds complexity and ambiguity for nontechnical users; replace-with-confirmation is safer and clearer |
| **Web Share API first, download fallback** | Share sheet is native and familiar on mobile; download works everywhere else |
| **Backup metadata in settings table** | No Dexie schema version bump needed; reuses existing key-value store |

---

## 10. Next Steps (Priority Ordered)

1. **Delete legacy ExportButton and ImportButton** — no longer used, replaced by DataManagement
2. **Add delete confirmation dialog** — prevent accidental data loss
3. **Add tests** — unit tests for utils, integration tests for hooks and components
4. **PWA support** — manifest.json + service worker for offline installability
5. **Dark mode** — respect system preference, add manual toggle
6. **Summary statistics** — averages, min/max, trends on dashboard
7. **Entry list pagination or virtual scrolling** — performance for large datasets
8. **Accessibility audit** — ARIA labels, keyboard navigation, screen reader support

---

## 11. Session Restart Instructions

### For a new Claude Code session:

**Read these files first (in order):**
1. `PROJECT_STATE.md` (this file) — full context
2. `src/types/index.ts` — data model and type aliases
3. `src/db/db.ts` — database schema and CRUD operations
4. `src/App.tsx` — how everything connects
5. `src/hooks/useEntries.ts`, `src/hooks/useSettings.ts`, `src/hooks/useBackupStatus.ts` — state management

**What NOT to change without good reason:**
- Weight is stored in kg internally — do not change storage unit
- Date format is `YYYY-MM-DD` and is the unique key — do not change
- The i18n system is intentionally lightweight — don't replace with i18next unless adding 5+ languages
- The app is intentionally local-first with no backend — don't add server dependencies
- Backup metadata is stored in the existing Dexie `settings` table — no schema version bump was needed

**How to safely extend the app:**
- New health metrics: add fields to `HealthEntry` in `types/index.ts`, update Dexie schema version in `db/db.ts` (with migration), update `EntryForm`, add chart component, add translation keys to both `en.ts` and `zh.ts`
- New language: add a new translation file in `src/i18n/`, update `Language` type, add toggle in Settings
- New chart type: follow pattern of existing charts in `src/components/Charts/`
- New utility: add to `src/utils/`, keep pure functions

**Common pitfalls:**
- Forgetting to add translation keys to **both** `en.ts` and `zh.ts`
- Forgetting to handle null values in chart data (entries have nullable fields)
- Not bumping Dexie schema version when changing the `entries` table structure
- Weight display must always go through conversion utils — never display raw kg when user preference is lb

---

## 12. Backup & Restore System

### How it works
- **DataManagement** component (`src/components/DataManagement/`) provides the full backup/restore UI
- Placed prominently in the main app view between charts and entry list — not buried in settings
- Uses plain, nontechnical language designed for the developer's dad

### Backup flow
1. User taps "Back Up My Data" (💾)
2. `exportBackup()` in `src/utils/backup.ts` builds a full JSON backup of all entries
3. If Web Share API with file support is available (most mobile browsers), opens native share sheet
4. If not available, falls back to standard file download
5. On success, records backup metadata (timestamp + entry count) to Dexie settings table
6. Filename format: `HealthTrack Backup - YYYY-MM-DD.json`

### Restore flow
1. User taps "Restore from Backup" (📂)
2. Hidden `<input type="file">` opens file picker
3. File is validated via `validateBackupFile()` — checks JSON structure, verifies entries array, checks each entry has a date string
4. Confirmation modal shows: current record count, backup record count, clear warning that current data will be replaced
5. On confirm: `importReplace()` clears all entries and bulk-inserts backup entries, then refreshes all state
6. Success/error message displayed inline

### Backup status tracking
- `useBackupStatus()` hook reads `lastBackupAt` and `entryCountAtBackup` from Dexie settings table
- Computes `newEntriesSinceBackup = currentCount - entryCountAtBackup`
- Displays "Last backup: [date]" or "Never backed up"
- Gentle reminder shown when: never backed up, or ≥7 new entries since last backup

### Browser limitations
- **Web Share API with files**: Supported on Chrome/Edge Android 93+, Safari iOS 15+. Not supported on most desktop browsers — falls back to download.
- **File download**: Works everywhere but on iOS Safari the file opens in a new tab (user must long-press to save). This is a known iOS limitation.
- **Share cancellation**: If user opens share sheet but cancels, backup is NOT recorded as completed (AbortError is caught).

---

## 13. Session Log

### 2026-03-19 — Session 1: Initial PROJECT_STATE.md
- Created PROJECT_STATE.md documenting entire codebase

### 2026-03-19 — Session 2: Human-friendly backup/restore system
**What was changed:**
- Added `BackupMeta` interface to `src/types/index.ts`
- Added `getEntryCount()`, `getBackupMeta()`, `saveBackupMeta()` to `src/db/db.ts`
- Rewrote `src/utils/backup.ts`: added Web Share API support, better file validation (`validateBackupFile()`), backup metadata recording
- Created `src/hooks/useBackupStatus.ts` — new hook for backup status tracking
- Created `src/components/DataManagement/DataManagement.tsx` — new unified backup/restore/CSV UI
- Created `src/components/DataManagement/DataManagement.css`
- Added ~20 backup-related i18n keys to both `src/i18n/en.ts` and `src/i18n/zh.ts`
- Updated `src/App.tsx`: replaced ExportButton + ImportButton with DataManagement component, integrated useBackupStatus hook

**Files touched:**
- `src/types/index.ts` (modified)
- `src/db/db.ts` (modified)
- `src/utils/backup.ts` (rewritten)
- `src/hooks/useBackupStatus.ts` (new)
- `src/components/DataManagement/DataManagement.tsx` (new)
- `src/components/DataManagement/DataManagement.css` (new)
- `src/i18n/en.ts` (modified)
- `src/i18n/zh.ts` (modified)
- `src/App.tsx` (modified)
- `PROJECT_STATE.md` (updated)

**What was NOT changed:**
- Dexie schema version — backup metadata reuses the existing settings key-value table
- ExportButton and ImportButton components — still exist in codebase but no longer rendered (can be deleted in cleanup)
- No other components modified
