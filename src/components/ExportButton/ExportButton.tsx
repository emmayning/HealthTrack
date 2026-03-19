import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { entriesToCSV, downloadCSV } from '../../utils/csv';
import { exportBackup } from '../../utils/backup';

interface Props {
  entries: HealthEntry[];
  weightUnit: WeightUnit;
}

export default function ExportButton({ entries, weightUnit }: Props) {
  const { t } = useTranslation();

  const handleCSV = () => {
    const csv = entriesToCSV(entries, weightUnit);
    downloadCSV(csv);
  };

  const handleBackup = async () => {
    await exportBackup();
  };

  return (
    <div className="export-buttons">
      <button className="btn-secondary" onClick={handleCSV}>
        {t('export.csv')}
      </button>
      <button className="btn-secondary" onClick={handleBackup}>
        {t('export.backup')}
      </button>
    </div>
  );
}
