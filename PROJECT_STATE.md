# PROJECT_STATE.md

> Last updated: 2026-03-20 (Session 10)
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
- **Tap-to-edit**: any saved day can be tapped in the entry list to load it into the form for editing, with clear "Updating entry for [date]" indicator
- Entry list with tappable cards, edit hints, and delete
- Trend charts for BP, HR, and weight with 7/30/90 day range filter
- BP chart toggles between morning and evening view
- Weight stored internally in kg, displayed in user's preferred unit
- **Human-friendly backup/restore system** (see section 12 below)
  - "Back Up My Data" with Web Share API on mobile, download fallback on desktop
  - "Restore from Backup" with file validation and replace-with-confirmation flow
  - Backup status tracking: last backup date, new entries since backup
  - Gentle reminders when user hasn't backed up or has many new entries
  - Post-backup guidance: honest messaging per path (share success vs. download guidance)
  - "How backup works" mini-explainer always visible in the data section
  - iOS Safari-specific guidance when detected (e.g., "Tap Share, then Save to Files")
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
- ~~Chart tooltips could show more context (e.g., notes)~~ ✅ Done (Session 10)
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
- Common: dynamic tick intervals based on data density, custom tooltip component, note indicators (ring dots + tooltip preview)

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
│   │   ├── ChartTooltip.tsx    # Shared custom tooltip (includes note preview)
│   │   ├── NoteDot.tsx         # Custom dot renderer — ring indicator for days with notes
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
- `lastBackupAt`: ISO timestamp — last **confirmed** backup (Web Share completed)
- `entryCountAtBackup`: stringified number — entry count at last confirmed backup
- `lastAttemptAt`: ISO timestamp — last backup **attempt** (download fallback)
- `lastAttemptMethod`: `'shared'` | `'downloaded'` — which method was used

### BackupMeta (TypeScript interface, stored in settings table)
| Field | Type | Notes |
|-------|------|-------|
| lastBackupAt | string \| null | ISO timestamp of last **confirmed** backup (Web Share only) |
| entryCountAtBackup | number | Entry count at time of last confirmed backup |
| lastAttemptAt | string \| null | ISO timestamp of last backup attempt (any method) |
| lastAttemptMethod | 'shared' \| 'downloaded' \| null | Which method was last used |

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
| **Honest post-backup messaging** | Download fallback cannot verify the user saved the file; shows guidance instead of false success |
| **Lightweight iOS detection** | UA-based `isLikelyIOSSafari()` — only for copy guidance, not feature gating |
| **BP and HR are integer-only** | BP is measured in whole mmHg and HR in whole bpm; `inputMode="numeric"` discourages decimal entry, `onBlur` rounds to nearest integer, `parseIntegerField` rounds at save as safety net |
| **Weight allows decimals** | Weight can be fractional (e.g., 72.5 kg); uses `inputMode="decimal"` and `parseFloat()` |

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
- Includes a "How backup works" mini-explainer with 3 numbered steps, always visible
- On iOS Safari, step 2 automatically switches to "Tap Share, then choose Save to Files"

### Backup flow — two paths with honest messaging
`exportBackup()` returns a `BackupResult`: `'shared'` | `'downloaded'` | `'cancelled'`

**Path A — Web Share API (confirmed backup):**
1. User taps "Back Up My Data" (💾)
2. Native share sheet opens → user chooses destination (Files, iCloud, WhatsApp, etc.)
3. `navigator.share()` resolves → `recordConfirmedBackup()` records both `lastBackupAt` AND `lastAttemptAt` → green success: "Backup saved successfully!"
4. If user dismisses share sheet → `AbortError` caught → "Backup was not saved" message, NO metadata recorded
5. Status line shows: "Last confirmed backup: Mar 19, 2026"

**Path B — Download fallback (unverifiable attempt):**
1. User taps "Back Up My Data" (💾)
2. Anchor-click download triggered — browser initiates a download
3. `recordDownloadAttempt()` records `lastAttemptAt` and `lastAttemptMethod='downloaded'` — but does NOT touch `lastBackupAt` or `entryCountAtBackup`
4. UI shows blue guidance banner: "Your backup file is ready" + platform-appropriate hint
5. Status line shows: "Backup file created on Mar 19. Make sure you saved it to Files or iCloud Drive."
6. "New entries since backup" counter does NOT reset — because we don't know the file was actually saved

**Why the split:** On iOS Safari, a `.json` download often opens as a new tab of raw text. The old code recorded this as a successful backup, which was dishonest. Now only Web Share completion counts as confirmed.

### Restore flow
1. User taps "Restore from Backup" (📂)
2. Hidden `<input type="file">` opens file picker
3. File is validated via `validateBackupFile()` — checks JSON structure, verifies entries array, checks each entry has a date string
4. Confirmation modal shows: current record count, backup record count, clear warning that current data will be replaced
5. On confirm: `importReplace()` clears all entries and bulk-inserts backup entries, then refreshes all state
6. Success/error message displayed inline

### Backup status tracking
- `useBackupStatus()` hook reads all four backup metadata fields from Dexie settings table
- Computes `newEntriesSinceBackup = currentCount - entryCountAtBackup` (against **confirmed** backups only)
- Three possible status displays:
  1. Confirmed backup exists → "Last confirmed backup: Mar 19, 2026" + new entry count
  2. Only download attempt exists → amber banner: "Backup file created on Mar 19. Make sure you saved it."
  3. Neither exists → "Never backed up"
- Gentle reminder shown when: no confirmed backup, or ≥7 new entries since confirmed backup
- Reminder is suppressed when the user has a recent unconfirmed download attempt (to avoid nagging)

### iOS Safari detection
- `isLikelyIOSSafari()` in `src/utils/backup.ts` — lightweight UA check
- Used ONLY for copy selection (howStep2 text, download hint text) — never for feature gating
- Detects iPhone/iPad (including iPad masquerading as Mac on iOS 13+) + stock Safari (excludes CriOS/FxiOS/etc.)

### Browser limitations (still remaining)
- **Web Share API with files**: Supported on Chrome/Edge Android 93+, Safari iOS 15+. Not supported on most desktop browsers — falls back to download.
- **iOS Safari download fallback**: `.json` files open as raw text in a new tab. User must manually tap Share → Save to Files. The app now shows clear guidance for this, but cannot force the file to save.
- **Share cancellation**: If user opens share sheet but cancels, backup is NOT recorded as completed (AbortError is caught).
- **Download verification is impossible**: No browser API exists to confirm the user actually saved a downloaded file. Download path only records an *attempt* — not a confirmed backup. The UI shows guidance and a reminder to verify saving.

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

### 2026-03-19 — Session 3: iPhone/Safari backup UX improvements
**Why:** On iOS Safari, the download fallback opens .json as raw text in a new tab. Nontechnical users don't know what happened or how to save the file. The app was also silently claiming success when it couldn't verify the file was actually saved.

**What was changed:**

1. **`src/utils/backup.ts`** — refactored `exportBackup()` to return `BackupResult` (`'shared'` | `'downloaded'` | `'cancelled'`) instead of `void`. Made `recordBackupMeta()` exported. Added `isLikelyIOSSafari()` lightweight UA check for copy guidance.

2. **`src/components/DataManagement/DataManagement.tsx`** — complete rewrite of post-backup UX:
   - Tracks `backupStep` state (`'idle'` | `'shared'` | `'downloaded'` | `'cancelled'`)
   - Web Share path: shows green "Backup saved successfully!" (honest — share completing means user chose a destination)
   - Download path: shows blue guidance banner "Your backup file is ready" + platform-specific hint
   - iOS Safari: "On iPhone, tap the Share button and choose Save to Files"
   - Other: "Check your Downloads folder for the backup file"
   - Cancelled: shows "Backup was not saved. Tap Back Up My Data to try again."
   - Added "How backup works" numbered mini-explainer (always visible, 3 steps)
   - iOS Safari auto-switches step 2 to "Tap Share, then choose Save to Files"

3. **`src/i18n/en.ts`** — added 9 new keys: `howTitle`, `howStep1/2/2ios/3`, `sharedSuccess`, `downloadReady`, `downloadHint`, `downloadHintIOS`, `cancelled`. Changed `restoreDesc` to "Choose a backup file..."

4. **`src/i18n/zh.ts`** — matching Chinese translations for all 9 new keys. Changed `restoreDesc`.

5. **`src/components/DataManagement/DataManagement.css`** — added styles for `.backup-howto` section and `.backup-post-message` variants (success/guide/cancelled).

**Files touched:**
- `src/utils/backup.ts` (modified — new return type, exported recordBackupMeta, added isLikelyIOSSafari)
- `src/components/DataManagement/DataManagement.tsx` (rewritten — post-backup guidance, how-it-works section)
- `src/components/DataManagement/DataManagement.css` (modified — new styles)
- `src/i18n/en.ts` (modified — 9 new keys, 1 changed)
- `src/i18n/zh.ts` (modified — 9 new keys, 1 changed)
- `PROJECT_STATE.md` (updated)

**What was NOT changed:**
- `src/db/db.ts` — no changes needed
- `src/types/index.ts` — no changes needed
- `src/App.tsx` — no changes needed (DataManagement props unchanged)
- Dexie schema version — unchanged
- Backup metadata recording logic — still optimistic for download path (pragmatic choice, documented)

**Remaining limitations:**
- iOS Safari .json download behavior cannot be fixed from JavaScript — it's a platform limitation
- Download path records backup metadata optimistically — we can't verify the file was saved
- `isLikelyIOSSafari()` is UA-based and may break if Apple changes UA strings, but it's only used for copy guidance, not functionality

### 2026-03-19 — Session 4: Honest backup metadata (confirmed vs attempt)
**Why:** The download fallback was recording `lastBackupAt` optimistically, making the status line claim a confirmed backup existed even though the file might not have been saved (especially on iOS Safari). This gave users false confidence.

**What was changed:**

1. **`src/types/index.ts`** — expanded `BackupMeta` with two new fields: `lastAttemptAt` (ISO timestamp) and `lastAttemptMethod` ('shared' | 'downloaded' | null).

2. **`src/db/db.ts`** — `getBackupMeta()` and `saveBackupMeta()` now read/write 4 keys instead of 2. No Dexie schema version bump needed (still uses the existing key-value settings table).

3. **`src/utils/backup.ts`** — replaced single `recordBackupMeta()` with two functions:
   - `recordConfirmedBackup()` — called only on Web Share success. Updates ALL four fields including `lastBackupAt` and `entryCountAtBackup`.
   - `recordDownloadAttempt()` — called on download fallback. Updates `lastAttemptAt` and `lastAttemptMethod` ONLY. Preserves existing confirmed backup fields untouched.

4. **`src/hooks/useBackupStatus.ts`** — now exposes `lastAttemptAt` and `lastAttemptMethod` alongside existing `lastBackupAt` and `newEntriesSinceBackup`.

5. **`src/App.tsx`** — passes `lastAttemptAt` and `lastAttemptMethod` to DataManagement.

6. **`src/components/DataManagement/DataManagement.tsx`** — three-state status display:
   - Confirmed backup → "Last confirmed backup: [date]" + new entry count
   - Download attempt only → amber: "Backup file created on [date]. Make sure you saved it."
   - Neither → "Never backed up"
   - Reminder suppressed when a recent download attempt exists (avoids nagging).

7. **`src/i18n/en.ts`** — 2 new keys: `backup.lastBackupConfirmed`, `backup.attemptStatus`.

8. **`src/i18n/zh.ts`** — matching Chinese translations for 2 new keys.

9. **`src/components/DataManagement/DataManagement.css`** — added `.backup-status-attempt` style (amber background).

**Files touched:**
- `src/types/index.ts` (modified)
- `src/db/db.ts` (modified)
- `src/utils/backup.ts` (modified)
- `src/hooks/useBackupStatus.ts` (rewritten)
- `src/App.tsx` (modified)
- `src/components/DataManagement/DataManagement.tsx` (rewritten)
- `src/components/DataManagement/DataManagement.css` (modified)
- `src/i18n/en.ts` (modified)
- `src/i18n/zh.ts` (modified)
- `PROJECT_STATE.md` (updated)

**What was NOT changed:**
- Dexie schema version — still uses the existing key-value settings table
- Post-backup guidance banners from Session 3 — still shown, unchanged
- "How backup works" section — unchanged
- iOS detection logic — unchanged

**Key design decision:** Download fallback no longer records a confirmed backup. The "new entries since backup" counter only resets when a Web Share completes. Download users see an amber nudge reminding them to verify they saved the file. This is honest at the cost of desktop Chrome users not getting a green confirmed status — but on desktop Chrome, downloads reliably save to the Downloads folder, and the amber copy is gentle enough to not be alarming.

### 2026-03-19 — Session 5: Integer-only BP and HR inputs
**Why:** Blood pressure (mmHg) and resting heart rate (bpm) are always whole numbers. The form was using `inputMode="decimal"` and `parseFloat()` for all fields, allowing meaningless decimals like "120.5 mmHg". Weight genuinely needs decimals (72.5 kg), so it must be handled differently.

**What was changed:**

1. **`src/components/EntryForm/EntryForm.tsx`** — three-layer defense for BP and HR fields:
   - **Layer 1 (keyboard):** Changed `inputMode="decimal"` → `inputMode="numeric"` and added `pattern="[0-9]*"` for all BP and HR inputs. On iOS this shows the numeric-only keypad (no decimal point key). On Android it shows the number keyboard. Weight field kept `inputMode="decimal"`.
   - **Layer 2 (input sanitization):** New `sanitizeIntegerInput()` function strips all non-digit characters on every keystroke via `onChange`. If a user types or pastes "120.5", it instantly becomes "1205" in the field (the dot is removed). This is intentional — the field visually never shows a decimal, making the integer-only constraint obvious.
   - **Layer 3 (save-time rounding):** New `parseIntegerField()` function uses `Math.round()` as a final safety net. If somehow a decimal got into state, it rounds to the nearest integer before saving. Weight uses `parseDecimalField()` (renamed from old `parseField()`) which preserves decimals.

**⚠️ Session 5 note:** The strip-all-non-digits approach had a critical UX flaw: `120.5` became `1205`. This was fixed in Session 6 below.

**Files touched:**
- `src/components/EntryForm/EntryForm.tsx` (modified)
- `PROJECT_STATE.md` (updated)

### 2026-03-19 — Session 6: Fix integer-only input to use rounding instead of digit-stripping
**Why:** Session 5's `sanitizeIntegerInput()` stripped all non-digit characters, causing `120.5` → `1205` and `80.2` → `802`. This changes the intended number by an order of magnitude — completely unacceptable UX.

**What was changed:**

1. **`src/components/EntryForm/EntryForm.tsx`** — replaced the strip-on-keystroke approach with a round-on-blur approach:
   - **Removed:** `sanitizeIntegerInput()` (the `replace(/[^0-9]/g, '')` function)
   - **Added:** `coerceToIntegerString()` — uses `parseFloat()` then `Math.round()` then `String()`. Converts `"120.5"` → `"121"`, `"80.2"` → `"80"`, `"abc"` → `""`.
   - **Changed `onChange`:** BP and HR fields now use plain `(e) => setter(e.target.value)` — the user can type freely including decimals.
   - **Added `onBlur`:** New `handleIntegerBlur()` calls `coerceToIntegerString()` when the user leaves the field. The field visibly snaps to the nearest integer.
   - **`parseIntegerField()` at save time:** Still rounds with `Math.round()` as a safety net (unchanged from Session 5).
   - **`inputMode="numeric"` + `pattern="[0-9]*"`:** Still present — discourages decimal entry at the keyboard level (unchanged from Session 5).
   - **Weight field:** Completely unchanged — still `inputMode="decimal"`, plain `onChange`, no `onBlur` coercion.

**Edge case behavior (Session 6):**
- `120.5` → user types it, sees `120.5` → taps another field → field becomes `121`
- `80.2` → user types it, sees `80.2` → on blur → field becomes `80`
- `120..5` → `parseFloat` reads `120` → field becomes `120`
- `98/65` pasted → `parseFloat` reads `98` → field becomes `98`
- `abc` → `parseFloat` returns `NaN` → field cleared to empty → saved as `null`
- blank → stays blank → saved as `null`
- `72.5` in weight → works fine, decimal preserved (weight has no blur coercion)

**Files touched:**
- `src/components/EntryForm/EntryForm.tsx` (modified)
- `PROJECT_STATE.md` (updated)

**What was NOT changed:**
- `inputMode="numeric"` and `pattern="[0-9]*"` attributes — kept from Session 5
- `parseIntegerField()` and `parseDecimalField()` — kept from Session 5
- Weight field — no changes at all
- `src/utils/validation.ts` — no changes
- Data model, DB schema — no changes

**Known caveats:**
- On iOS, `pattern="[0-9]*"` shows a numeric-only keypad with no decimal key — so the user generally can't type a decimal in the first place
- On Android, `inputMode="numeric"` may still show a decimal key on some keyboards — the `onBlur` rounding handles this
- If the user taps Save without ever blurring the field (e.g., types `120.5` then immediately taps Save), `parseIntegerField()` catches it and rounds at save time — so the stored value is always an integer
- Rounding (not truncation) was chosen consistently: `120.5` → `121`, `120.4` → `120`

### 2026-03-19 — Session 7: Improved tap-to-edit flow for daily entries
**Why:** The app already had basic edit machinery (editingEntry state, Edit button per card, form loads values). But the UX needed improvement: the Edit button was small, there was no user-facing text explaining that entries can be corrected, the form didn't clearly indicate which date was being edited, and after saving an edit the form stayed in edit mode instead of resetting.

**What already existed:**
- `App.tsx` had `editingEntry` state and `handleEdit(date)` that scrolls to form
- `EntryForm` accepted `editingEntry` prop, loaded values, showed "Edit Entry" title and Cancel button
- `EntryList` had small "Edit" buttons per card
- `db.saveEntry()` already did upsert (update if date exists)

**What was changed:**

1. **`src/components/EntryList/EntryList.tsx`** — entire card is now tappable:
   - Whole `.entry-card` gets `onClick={() => onEdit(entry.date)}` + `role="button"` + `tabIndex={0}` + keyboard handler
   - Added `.entry-card-tappable` class for tap feedback styling
   - Removed the old separate "Edit" `<button>` — replaced with a subtle "Edit" text label (`.entry-tap-hint`)
   - Delete button uses `e.stopPropagation()` so it doesn't trigger the card's edit action
   - Added `list.editHint` text below the section title: "Need to fix a number? Tap any day to edit it."

2. **`src/components/EntryForm/EntryForm.tsx`** — clearer editing state:
   - Added import of `toFullDate` for locale-aware date formatting
   - When editing, shows a blue hint: "Updating entry for March 19, 2026" (or Chinese equivalent)
   - Form gets `.entry-form-editing` class when editing → blue border to visually distinguish from new-entry mode
   - **After saving an edit**, the form now calls `onCancelEdit()` + `resetForm()` to return to new-entry mode (previously it stayed in edit mode showing the same values)

3. **`src/components/EntryList/EntryList.css`** — new styles:
   - `.list-edit-hint` — subtle secondary text below section title
   - `.entry-card-tappable` — cursor pointer, tap highlight, active state
   - `.entry-tap-hint` — small "Edit" text label per card

4. **`src/components/EntryForm/EntryForm.css`** — new styles:
   - `.entry-form-editing` — blue border when in edit mode
   - `.form-editing-hint` — blue text showing which date is being edited

5. **`src/i18n/en.ts`** — 3 new keys:
   - `form.editingDate`: "Updating entry for {date}"
   - `list.editHint`: "Need to fix a number? Tap any day to edit it."
   - `list.tapToEdit`: "Edit"

6. **`src/i18n/zh.ts`** — 3 matching Chinese keys:
   - `form.editingDate`: "正在更新{date}的记录"
   - `list.editHint`: "输错了？点击任意一天即可修改。"
   - `list.tapToEdit`: "编辑"

**Files touched:**
- `src/components/EntryList/EntryList.tsx` (rewritten — tappable cards, hint text)
- `src/components/EntryList/EntryList.css` (modified — new styles)
- `src/components/EntryForm/EntryForm.tsx` (modified — editing indicator, auto-reset after edit save)
- `src/components/EntryForm/EntryForm.css` (modified — editing border and hint styles)
- `src/i18n/en.ts` (modified — 3 new keys)
- `src/i18n/zh.ts` (modified — 3 new keys)
- `PROJECT_STATE.md` (updated)

**What was NOT changed:**
- `src/App.tsx` — handleEdit/handleCancelEdit/editingEntry logic unchanged
- `src/db/db.ts` — saveEntry upsert behavior unchanged
- Data model, types — unchanged
- Backup/restore — unchanged
- BP/HR integer-only behavior — unchanged
- One-entry-per-day constraint — unchanged

**The edit flow is now:**
1. User scrolls to entry list, sees "Need to fix a number? Tap any day to edit it."
2. User taps any entry card (the whole card is the tap target, not just a tiny button)
3. Page scrolls to the top, form shows blue border + "Updating entry for March 19, 2026"
4. User corrects values, taps Save
5. Entry is saved (upsert), form shows "Entry saved!", then resets to new-entry mode
6. User can also tap Cancel to discard changes and return to new-entry mode

### 2026-03-19 — Session 8: Fix edit form hydration, lock date during editing
**Why:** When tapping a saved entry to edit, the form's date and header changed correctly but the BP/HR/weight input fields appeared empty instead of pre-filled with the saved values. Also, the date picker was editable during editing which could accidentally create/overwrite a different day's entry.

**Root causes found and fixed:**

1. **`resetForm()` didn't clear `saved` state.** After saving an edit, Session 7's code called `setSaved(true)` then `onCancelEdit()` then `resetForm()`. But `resetForm()` didn't call `setSaved(false)`. This meant `saved=true` persisted into the next state transition, creating a confusing render cycle where the "Entry saved!" message was visible with empty fields during the transition into edit mode.

2. **`setSaved(true)` was called BEFORE `resetForm()`.** When `resetForm()` then cleared all fields, React batched the `saved=true` with the field clears, creating a render where the success message showed alongside empty fields. On the next edit tap, the useEffect would hydrate the fields and clear `saved`, but the intermediate render could flash empty fields.

3. **No date locking during edit mode.** The date picker was editable while editing, allowing the user to accidentally change dates and overwrite a different day's data.

**What was changed:**

1. **`src/components/EntryForm/EntryForm.tsx`** — multiple fixes:
   - **`resetForm()` now clears `saved`** — added `setSaved(false)` to resetForm so the success message doesn't leak across state transitions
   - **`setSaved(true)` moved to AFTER `resetForm()`** — in handleSave, the save order is now: `onSave` → `onCancelEdit` + `resetForm` → `setSaved(true)`. This ensures the success message only appears after all fields are in their final state.
   - **Date field locked during editing** — when `isEditing` is true, the date `<input type="date">` is replaced with a read-only `<div className="date-locked">` showing the formatted date. The user cannot accidentally change which day they're editing.
   - **Save button says "Update Entry" during editing** — uses `form.update` key instead of `form.save` to clearly distinguish editing from creating
   - **Extracted `entryToFormFields()` helper** — makes hydration logic explicit and reusable

2. **`src/components/EntryForm/EntryForm.css`** — added `.date-locked` style (looks like a disabled input)

3. **`src/i18n/en.ts`** — 1 new key: `form.update`: "Update Entry"

4. **`src/i18n/zh.ts`** — 1 new key: `form.update`: "更新记录"

**Files touched:**
- `src/components/EntryForm/EntryForm.tsx` (modified)
- `src/components/EntryForm/EntryForm.css` (modified)
- `src/i18n/en.ts` (modified)
- `src/i18n/zh.ts` (modified)
- `PROJECT_STATE.md` (updated)

**The edit flow is now:**
1. User taps any entry card in the list
2. Page scrolls to top. Form shows blue border + "Updating entry for March 19, 2026"
3. All fields are pre-filled with that day's saved values (blanks stay blank)
4. Date field is locked (displayed as read-only text, not an editable picker)
5. User corrects values, taps "Update Entry"
6. Entry is saved, form resets to new-entry mode, "Entry saved!" briefly shown
7. Or user taps Cancel → form resets without saving

### 2026-03-20 — Session 9: Auto-fill form when date matches existing entry
**Why:** When a user changed the date picker to a date with existing data (visible in the chart), the form stayed empty. The user expected the form to auto-populate with the existing data for that date, similar to the tap-to-edit flow. This made it awkward to review or update past entries by browsing dates.

**What was changed:**

1. **`src/App.tsx`** — passes `entries` array to `EntryForm` as a new prop.

2. **`src/components/EntryForm/EntryForm.tsx`** — added date-aware auto-fill:
   - New `entries` prop in `Props` interface
   - New `autoEditEntry` local state (HealthEntry | null) — tracks date-picker-initiated edits separately from `editingEntry` (tap-initiated edits)
   - New `useEffect` watching `date` and `entries`: when date matches an existing entry, populates fields via `entryToFormFields()` and sets `autoEditEntry`; when no match, clears data fields
   - `isEditing` derived from `editingEntry || autoEditEntry` — both flows show edit styling (blue border, "Update Entry" button)
   - `isDateLocked` only true for `editingEntry` (tap-to-edit) — date picker stays editable during auto-fill so users can browse freely between dates
   - Save handler clears `autoEditEntry` and resets form after saving

**Behavior:**
- Change date picker to a date with saved data → form auto-fills, shows blue edit border, "Update Entry" + "Cancel" buttons
- Change to a date with no data → form clears back to empty create mode
- Tap entry in list → still locks date (existing behavior preserved)
- Date picker remains editable during auto-fill mode

**Files touched:**
- `src/App.tsx` (modified — 1 new prop)
- `src/components/EntryForm/EntryForm.tsx` (modified — ~25 lines added)
- `PROJECT_STATE.md` (updated)

### 2026-03-20 — Session 10: Note indicators on charts
**Why:** Users could add notes to daily entries, but there was no way to tell from the charts which days had notes. Users had to click through dates manually to discover notes. This made notes hard to find and reduced their usefulness.

**What was changed:**

1. **`src/components/Charts/NoteDot.tsx`** (NEW) — custom Recharts dot renderer:
   - For data points without notes: renders a standard white-filled dot (r=3, stroke=line color)
   - For data points with notes: adds a subtle outer ring (r=6, 1px stroke, same line color at 40% opacity) around the standard dot
   - Pure SVG — consistent rendering across all devices/browsers

2. **`src/components/Charts/BPChart.tsx`** — added `notes` field to chart data mapping, replaced `dot={{ r: 3 }}` with `dot={<NoteDot />}` on both systolic and diastolic lines.

3. **`src/components/Charts/HRChart.tsx`** — same changes as BPChart (notes in data, NoteDot for dot prop).

4. **`src/components/Charts/WeightChart.tsx`** — same changes as BPChart.

5. **`src/components/Charts/ChartTooltip.tsx`** — enhanced to show note preview:
   - Reads notes from `payload[0]?.payload?.notes`
   - When notes exist, shows truncated preview (max 60 chars) at bottom of tooltip in italic
   - Separated by a subtle border line from the data values

6. **`src/components/Charts/Charts.css`** — added `.tooltip-note` style (italic, secondary color, border-top separator, max-width 200px, word-wrap).

**Visual behavior:**
- **Ring indicator**: Subtle outer ring on chart dots for days with notes — visible but not cluttering
- **Tooltip preview**: Hovering/tapping a data point with notes shows a truncated italic preview below the values
- **Mobile**: Ring renders identically (pure SVG). Tooltip shows on tap via existing Recharts behavior.
- **Desktop**: Tooltip shows on hover. Same ring indicator.

**Limitations:**
- Ring only appears on data points that exist in each chart. If a day has notes but no BP data, the BP chart won't show a ring for that day.
- Notes longer than 60 characters are truncated with "…" in the tooltip.

**Files touched:**
- `src/components/Charts/NoteDot.tsx` (new — ~30 lines)
- `src/components/Charts/BPChart.tsx` (modified)
- `src/components/Charts/HRChart.tsx` (modified)
- `src/components/Charts/WeightChart.tsx` (modified)
- `src/components/Charts/ChartTooltip.tsx` (modified)
- `src/components/Charts/Charts.css` (modified)
- `PROJECT_STATE.md` (updated)
