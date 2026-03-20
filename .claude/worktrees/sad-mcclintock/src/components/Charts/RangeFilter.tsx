import { useTranslation } from '../../i18n';
import type { RangeFilter as RangeFilterType } from '../../types';

interface Props {
  value: RangeFilterType;
  onChange: (range: RangeFilterType) => void;
}

const RANGES: RangeFilterType[] = [7, 30, 90];

export default function RangeFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  const labels: Record<number, string> = {
    7: t('charts.7d'),
    30: t('charts.30d'),
    90: t('charts.90d'),
  };

  return (
    <div className="range-filter">
      {RANGES.map((r) => (
        <button
          key={r}
          className={value === r ? 'active' : ''}
          onClick={() => onChange(r)}
        >
          {labels[r]}
        </button>
      ))}
    </div>
  );
}
