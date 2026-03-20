import { useTranslation } from '../../i18n';

export default function NoteLegend() {
  const { t } = useTranslation();

  return (
    <div className="chart-note-legend">
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1" opacity="0.5" />
        <circle cx="8" cy="8" r="3" fill="#fff" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
      </svg>
      <span>{t('charts.noteLegend')}</span>
    </div>
  );
}
