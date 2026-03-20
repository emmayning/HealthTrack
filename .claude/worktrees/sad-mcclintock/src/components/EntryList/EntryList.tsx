import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { toShortLabel } from '../../utils/dates';
import { displayWeight } from '../../utils/weight';
import './EntryList.css';

interface Props {
  entries: HealthEntry[];
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
  weightUnit: WeightUnit;
}

export default function EntryList({ entries, onEdit, onDelete, weightUnit }: Props) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <h2>{t('list.title')}</h2>
        <p className="list-empty">{t('list.empty')}</p>
      </div>
    );
  }

  const handleDelete = (date: string) => {
    if (window.confirm(t('list.confirmDelete'))) {
      onDelete(date);
    }
  };

  return (
    <div className="entry-list">
      <h2>{t('list.title')}</h2>
      <div className="list-cards">
        {entries.map((entry) => (
          <div key={entry.date} className="entry-card">
            <div className="entry-card-header">
              <span className="entry-date">{toShortLabel(entry.date)}</span>
              <div className="entry-actions">
                <button className="btn-sm" onClick={() => onEdit(entry.date)}>
                  {t('list.edit')}
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => handleDelete(entry.date)}
                >
                  {t('list.delete')}
                </button>
              </div>
            </div>
            <div className="entry-card-body">
              {(entry.morningSystolic !== null || entry.morningDiastolic !== null) && (
                <div className="entry-metric">
                  <span className="metric-label">{t('list.morningBP')}</span>
                  <span className="metric-value">
                    {entry.morningSystolic ?? '—'}/{entry.morningDiastolic ?? '—'}
                  </span>
                </div>
              )}
              {(entry.eveningSystolic !== null || entry.eveningDiastolic !== null) && (
                <div className="entry-metric">
                  <span className="metric-label">{t('list.eveningBP')}</span>
                  <span className="metric-value">
                    {entry.eveningSystolic ?? '—'}/{entry.eveningDiastolic ?? '—'}
                  </span>
                </div>
              )}
              {entry.restingHeartRate !== null && (
                <div className="entry-metric">
                  <span className="metric-label">{t('list.hr')}</span>
                  <span className="metric-value">{entry.restingHeartRate} bpm</span>
                </div>
              )}
              {entry.weight !== null && (
                <div className="entry-metric">
                  <span className="metric-label">{t('list.weight')}</span>
                  <span className="metric-value">
                    {displayWeight(entry.weight, weightUnit)} {weightUnit}
                  </span>
                </div>
              )}
              {entry.notes && (
                <div className="entry-notes">{entry.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
