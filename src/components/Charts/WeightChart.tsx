import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { toShortLabel } from '../../utils/dates';
import { kgToLb } from '../../utils/weight';
import ChartTooltip from './ChartTooltip';
import NoteDot from './NoteDot';

interface Props {
  entries: HealthEntry[];
  weightUnit: WeightUnit;
}

export default function WeightChart({ entries, weightUnit }: Props) {
  const { t } = useTranslation();
  const label = `${t('charts.weight')} (${weightUnit})`;

  const data = [...entries]
    .filter((e) => e.weight !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      notes: e.notes || '',
      [label]: weightUnit === 'lb' ? kgToLb(e.weight!) : e.weight,
    }));

  const tickInterval = data.length <= 7 ? 0 : data.length <= 30 ? 4 : 9;

  return (
    <div className="chart-section">
      <h3>{t('charts.weight')}</h3>
      {data.length === 0 ? (
        <p className="chart-no-data">{t('charts.noData')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={toShortLabel}
              interval={tickInterval}
              fontSize={11}
              tick={{ fill: 'var(--color-text-secondary)' }}
            />
            <YAxis fontSize={11} tick={{ fill: 'var(--color-text-secondary)' }} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey={label}
              stroke="var(--color-chart-weight)"
              strokeWidth={2}
              dot={<NoteDot stroke="var(--color-chart-weight)" />}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
