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
import type { HealthEntry } from '../../types';
import { toShortLabel } from '../../utils/dates';
import ChartTooltip from './ChartTooltip';
import NoteDot from './NoteDot';

interface Props {
  entries: HealthEntry[];
}

export default function HRChart({ entries }: Props) {
  const { t } = useTranslation();

  const data = [...entries]
    .filter((e) => e.restingHeartRate !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      notes: e.notes || '',
      [t('charts.hr')]: e.restingHeartRate,
    }));

  const tickInterval = data.length <= 7 ? 0 : data.length <= 30 ? 4 : 9;

  return (
    <div className="chart-section">
      <h3>{t('charts.hr')}</h3>
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
              dataKey={t('charts.hr')}
              stroke="var(--color-chart-hr)"
              strokeWidth={2}
              dot={<NoteDot stroke="var(--color-chart-hr)" />}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
