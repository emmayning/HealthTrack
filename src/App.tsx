import { useState, useMemo, useCallback } from 'react';
import { I18nContext } from './i18n';
import { useEntries } from './hooks/useEntries';
import { useSettings } from './hooks/useSettings';
import { useBackupStatus } from './hooks/useBackupStatus';
import { daysAgoISO } from './utils/dates';
import type { HealthEntry, RangeFilter as RangeFilterType } from './types';
import Disclaimer from './components/Disclaimer/Disclaimer';
import Settings from './components/Settings/Settings';
import EntryForm from './components/EntryForm/EntryForm';
import EntryList from './components/EntryList/EntryList';
import RangeFilter from './components/Charts/RangeFilter';
import BPChart from './components/Charts/BPChart';
import HRChart from './components/Charts/HRChart';
import WeightChart from './components/Charts/WeightChart';
import NoteLegend from './components/Charts/NoteLegend';
import DataManagement from './components/DataManagement/DataManagement';
import './components/Charts/Charts.css';
import './App.css';

export default function App() {
  const { entries, loading, save, remove, refresh } = useEntries();
  const { settings, setLanguage, setWeightUnit } = useSettings();
  const { lastBackupAt, newEntriesSinceBackup, lastAttemptAt, lastAttemptMethod, refreshBackupStatus } = useBackupStatus(entries.length);
  const [range, setRange] = useState<RangeFilterType>(30);
  const [editingEntry, setEditingEntry] = useState<HealthEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const filteredEntries = useMemo(() => {
    const cutoff = daysAgoISO(range);
    return entries.filter((e) => e.date >= cutoff);
  }, [entries, range]);

  const handleEdit = useCallback(
    (date: string) => {
      const entry = entries.find((e) => e.date === date) || null;
      setEditingEntry(entry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [entries]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleRestoreDone = useCallback(async () => {
    await refresh();
    await refreshBackupStatus();
  }, [refresh, refreshBackupStatus]);

  const handleBackupDone = useCallback(async () => {
    await refreshBackupStatus();
  }, [refreshBackupStatus]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <I18nContext.Provider value={settings.language}>
      <div className="app">
        <header className="app-header">
          <div>
            <h1 className="app-title">HealthTrack</h1>
          </div>
          <button
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            {showSettings ? '\u2715' : '\u2699'}
          </button>
        </header>

        <Disclaimer />

        {showSettings && (
          <Settings
            language={settings.language}
            weightUnit={settings.weightUnit}
            onLanguageChange={setLanguage}
            onWeightUnitChange={setWeightUnit}
          />
        )}

        <EntryForm
          onSave={save}
          entries={entries}
          editingEntry={editingEntry}
          onCancelEdit={handleCancelEdit}
          weightUnit={settings.weightUnit}
        />

        <div className="charts-section">
          <RangeFilter value={range} onChange={setRange} />
          <NoteLegend />
          <BPChart entries={filteredEntries} />
          <HRChart entries={filteredEntries} />
          <WeightChart entries={filteredEntries} weightUnit={settings.weightUnit} />
        </div>

        <DataManagement
          entries={entries}
          weightUnit={settings.weightUnit}
          lastBackupAt={lastBackupAt}
          newEntriesSinceBackup={newEntriesSinceBackup}
          lastAttemptAt={lastAttemptAt}
          lastAttemptMethod={lastAttemptMethod}
          onRestoreDone={handleRestoreDone}
          onBackupDone={handleBackupDone}
        />

        <EntryList
          entries={entries}
          onEdit={handleEdit}
          onDelete={remove}
          weightUnit={settings.weightUnit}
        />
      </div>
    </I18nContext.Provider>
  );
}
