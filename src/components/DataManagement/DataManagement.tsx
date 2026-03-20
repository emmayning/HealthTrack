import { useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { exportBackup, validateBackupFile, importReplace } from '../../utils/backup';
import { entriesToCSV, downloadCSV } from '../../utils/csv';
import './DataManagement.css';

interface Props {
  entries: HealthEntry[];
  weightUnit: WeightUnit;
  lastBackupAt: string | null;
  newEntriesSinceBackup: number;
  onRestoreDone: () => void;
  onBackupDone: () => void;
}

type RestoreStep = 'idle' | 'confirm' | 'success' | 'error';

export default function DataManagement({
  entries,
  weightUnit,
  lastBackupAt,
  newEntriesSinceBackup,
  onRestoreDone,
  onBackupDone,
}: Props) {
  const { t, lang } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [restoreStep, setRestoreStep] = useState<RestoreStep>('idle');
  const [restoreCount, setRestoreCount] = useState(0);
  const [restoreError, setRestoreError] = useState('');
  const [pendingFileText, setPendingFileText] = useState<string | null>(null);
  const [pendingEntryCount, setPendingEntryCount] = useState(0);
  const [backing, setBacking] = useState(false);

  // Format last backup date for display
  const formatBackupDate = (iso: string): string => {
    const d = new Date(iso);
    if (lang === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleBackup = async () => {
    setBacking(true);
    try {
      await exportBackup();
      onBackupDone();
    } finally {
      setBacking(false);
    }
  };

  const handleCSV = () => {
    const csv = entriesToCSV(entries, weightUnit);
    downloadCSV(csv);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        const backup = validateBackupFile(text);
        setPendingFileText(text);
        setPendingEntryCount(backup.entries.length);
        setRestoreStep('confirm');
        setRestoreError('');
      } catch {
        setRestoreError(t('backup.restoreErrorBadFile'));
        setRestoreStep('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!pendingFileText) return;
    try {
      const backup = validateBackupFile(pendingFileText);
      const count = await importReplace(backup.entries);
      setRestoreCount(count);
      setRestoreStep('success');
      setPendingFileText(null);
      onRestoreDone();
    } catch {
      setRestoreError(t('backup.restoreErrorFailed'));
      setRestoreStep('error');
    }
  };

  const handleCancelRestore = () => {
    setRestoreStep('idle');
    setPendingFileText(null);
    setRestoreError('');
  };

  const dismissMessage = () => {
    setRestoreStep('idle');
    setRestoreError('');
  };

  // Determine if we should show a gentle reminder
  const showReminder = !lastBackupAt || newEntriesSinceBackup >= 7;

  return (
    <div className="data-mgmt">
      <h2 className="data-mgmt-title">{t('backup.sectionTitle')}</h2>

      {/* Backup status */}
      <div className="backup-status">
        <div className="backup-status-row">
          <span className="backup-status-label">{t('backup.lastBackup')}</span>
          <span className="backup-status-value">
            {lastBackupAt ? formatBackupDate(lastBackupAt) : t('backup.never')}
          </span>
        </div>
        {lastBackupAt && newEntriesSinceBackup > 0 && (
          <div className="backup-status-new">
            {t('backup.newEntries', { count: newEntriesSinceBackup })}
          </div>
        )}
      </div>

      {/* Gentle reminder */}
      {showReminder && (
        <div className="backup-reminder">
          {!lastBackupAt
            ? t('backup.reminderNever')
            : t('backup.reminderStale', { count: newEntriesSinceBackup })}
        </div>
      )}

      {/* Primary actions */}
      <button className="btn-backup" onClick={handleBackup} disabled={backing}>
        <span className="btn-backup-icon">💾</span>
        <span className="btn-backup-text">
          <strong>{t('backup.backupButton')}</strong>
          <span>{t('backup.backupDesc')}</span>
        </span>
      </button>

      <button className="btn-restore" onClick={() => fileRef.current?.click()}>
        <span className="btn-backup-icon">📂</span>
        <span className="btn-backup-text">
          <strong>{t('backup.restoreButton')}</strong>
          <span>{t('backup.restoreDesc')}</span>
        </span>
      </button>

      <input
        type="file"
        accept=".json"
        ref={fileRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* CSV export as secondary */}
      <button className="btn-csv-secondary" onClick={handleCSV}>
        {t('backup.exportCSV')}
      </button>

      {/* Confirm restore modal */}
      {restoreStep === 'confirm' && (
        <div className="restore-modal-overlay" onClick={handleCancelRestore}>
          <div className="restore-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('backup.confirmTitle')}</h3>
            <p className="restore-modal-warning">{t('backup.confirmWarning')}</p>
            <p className="restore-modal-detail">
              {t('backup.confirmDetail', {
                currentCount: entries.length,
                backupCount: pendingEntryCount,
              })}
            </p>
            <button className="btn-confirm-restore" onClick={handleConfirmRestore}>
              {t('backup.confirmYes')}
            </button>
            <button className="btn-cancel-restore" onClick={handleCancelRestore}>
              {t('backup.confirmNo')}
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {restoreStep === 'success' && (
        <div className="restore-message restore-success" onClick={dismissMessage}>
          {t('backup.restoreSuccess', { count: restoreCount })}
        </div>
      )}

      {/* Error message */}
      {restoreStep === 'error' && (
        <div className="restore-message restore-error" onClick={dismissMessage}>
          {restoreError}
        </div>
      )}
    </div>
  );
}
