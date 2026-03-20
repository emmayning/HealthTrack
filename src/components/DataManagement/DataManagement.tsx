import { useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { exportBackup, validateBackupFile, importReplace, isLikelyIOSSafari } from '../../utils/backup';
import type { BackupResult } from '../../utils/backup';
import { entriesToCSV, downloadCSV } from '../../utils/csv';
import './DataManagement.css';

interface Props {
  entries: HealthEntry[];
  weightUnit: WeightUnit;
  /** ISO timestamp of last *confirmed* backup (Web Share). Null = never confirmed. */
  lastBackupAt: string | null;
  /** New entries since last confirmed backup. */
  newEntriesSinceBackup: number;
  /** ISO timestamp of last download attempt. Null = never attempted. */
  lastAttemptAt: string | null;
  /** Method of last attempt: 'shared' | 'downloaded' | null. */
  lastAttemptMethod: 'shared' | 'downloaded' | null;
  onRestoreDone: () => void;
  onBackupDone: () => void;
}

type RestoreStep = 'idle' | 'confirm' | 'success' | 'error';
type BackupStep = 'idle' | 'shared' | 'downloaded' | 'cancelled';

export default function DataManagement({
  entries,
  weightUnit,
  lastBackupAt,
  newEntriesSinceBackup,
  lastAttemptAt,
  lastAttemptMethod,
  onRestoreDone,
  onBackupDone,
}: Props) {
  const { t, lang } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  // Backup state
  const [backupStep, setBackupStep] = useState<BackupStep>('idle');
  const [backing, setBacking] = useState(false);

  // Restore state
  const [restoreStep, setRestoreStep] = useState<RestoreStep>('idle');
  const [restoreCount, setRestoreCount] = useState(0);
  const [restoreError, setRestoreError] = useState('');
  const [pendingFileText, setPendingFileText] = useState<string | null>(null);
  const [pendingEntryCount, setPendingEntryCount] = useState(0);

  const formatBackupDate = (iso: string): string => {
    const d = new Date(iso);
    if (lang === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // --- Backup ---

  const handleBackup = async () => {
    setBacking(true);
    setBackupStep('idle');
    try {
      const result: BackupResult = await exportBackup();
      setBackupStep(result);
      if (result === 'shared' || result === 'downloaded') {
        onBackupDone();
      }
    } finally {
      setBacking(false);
    }
  };

  const dismissBackupMessage = () => setBackupStep('idle');

  // --- CSV ---

  const handleCSV = () => {
    const csv = entriesToCSV(entries, weightUnit);
    downloadCSV(csv);
  };

  // --- Restore ---

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

  const dismissRestoreMessage = () => {
    setRestoreStep('idle');
    setRestoreError('');
  };

  // Is this likely an iOS Safari fallback scenario?
  const iosHint = isLikelyIOSSafari();

  // --- Status line logic ---
  // We have two tiers of backup knowledge:
  // 1. Confirmed backup (lastBackupAt) — Web Share completed, user chose a destination.
  // 2. Download attempt (lastAttemptAt + method='downloaded') — file was offered but we can't verify saving.
  // The UI distinguishes these clearly.

  const hasConfirmedBackup = !!lastBackupAt;
  const hasUnconfirmedAttempt = !hasConfirmedBackup && lastAttemptAt && lastAttemptMethod === 'downloaded';

  // Show reminder when: never backed up (confirmed), or ≥7 new entries since confirmed backup.
  // But if the user has an unconfirmed download attempt, soften the tone.
  const showReminder = !hasConfirmedBackup || newEntriesSinceBackup >= 7;

  return (
    <div className="data-mgmt">
      <h2 className="data-mgmt-title">{t('backup.sectionTitle')}</h2>

      {/* Backup status line */}
      <div className="backup-status">
        {hasConfirmedBackup ? (
          <>
            <div className="backup-status-row">
              <span className="backup-status-label">{t('backup.lastBackupConfirmed')}</span>
              <span className="backup-status-value">{formatBackupDate(lastBackupAt)}</span>
            </div>
            {newEntriesSinceBackup > 0 && (
              <div className="backup-status-new">
                {t('backup.newEntries', { count: newEntriesSinceBackup })}
              </div>
            )}
          </>
        ) : hasUnconfirmedAttempt ? (
          <div className="backup-status-attempt">
            {t('backup.attemptStatus', { date: formatBackupDate(lastAttemptAt!) })}
          </div>
        ) : (
          <div className="backup-status-row">
            <span className="backup-status-label">{t('backup.lastBackup')}</span>
            <span className="backup-status-value">{t('backup.never')}</span>
          </div>
        )}
      </div>

      {/* Gentle reminder */}
      {showReminder && !hasUnconfirmedAttempt && (
        <div className="backup-reminder">
          {!hasConfirmedBackup
            ? t('backup.reminderNever')
            : t('backup.reminderStale', { count: newEntriesSinceBackup })}
        </div>
      )}

      {/* How backup works — short, visual, always visible */}
      <div className="backup-howto">
        <div className="backup-howto-title">{t('backup.howTitle')}</div>
        <ol className="backup-howto-steps">
          <li>{t('backup.howStep1')}</li>
          <li>{t(iosHint ? 'backup.howStep2ios' : 'backup.howStep2')}</li>
          <li>{t('backup.howStep3')}</li>
        </ol>
      </div>

      {/* ---- Primary actions ---- */}

      <button className="btn-backup" onClick={handleBackup} disabled={backing}>
        <span className="btn-backup-icon">💾</span>
        <span className="btn-backup-text">
          <strong>{t('backup.backupButton')}</strong>
          <span>{t('backup.backupDesc')}</span>
        </span>
      </button>

      {/* Post-backup messages — shown after tapping backup */}
      {backupStep === 'shared' && (
        <div className="backup-post-message backup-post-success" onClick={dismissBackupMessage}>
          ✅ {t('backup.sharedSuccess')}
        </div>
      )}

      {backupStep === 'downloaded' && (
        <div className="backup-post-message backup-post-guide" onClick={dismissBackupMessage}>
          <div className="backup-post-guide-title">{t('backup.downloadReady')}</div>
          <div className="backup-post-guide-hint">
            {t(iosHint ? 'backup.downloadHintIOS' : 'backup.downloadHint')}
          </div>
        </div>
      )}

      {backupStep === 'cancelled' && (
        <div className="backup-post-message backup-post-cancelled" onClick={dismissBackupMessage}>
          {t('backup.cancelled')}
        </div>
      )}

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

      {/* CSV export — secondary */}
      <button className="btn-csv-secondary" onClick={handleCSV}>
        {t('backup.exportCSV')}
      </button>

      {/* ---- Restore modal ---- */}
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

      {/* Restore result messages */}
      {restoreStep === 'success' && (
        <div className="restore-message restore-success" onClick={dismissRestoreMessage}>
          ✅ {t('backup.restoreSuccess', { count: restoreCount })}
        </div>
      )}
      {restoreStep === 'error' && (
        <div className="restore-message restore-error" onClick={dismissRestoreMessage}>
          {restoreError}
        </div>
      )}
    </div>
  );
}
