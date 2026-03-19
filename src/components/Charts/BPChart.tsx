import { useState } from 'react';
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
import type { HealthEntry, BPView } from '../../types';
import { toShortLabel } from '../../utils/dates';
import ChartTooltip from './ChartTooltip';

interface Props {
  entries: HealthEntry[];
}

export default function BPChart({ entries }: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<BPView>('morning');

  const sysKey = view === 'morning' ? 'morningSystolic' : 'eveningSystolic';
  const diaKey = view === 'morning' ? 'morningDiastolic' : 'eveningDiastolic';

  const data = [...entries]
    .filter((e) => e[sysKey] !== null || e[diaKey] !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      [t('charts.systolic')]: e[sysKey],
      [t('charts.diastolic')]: e[diaKey],
    }));

  const tickInterval = data.length <= 7 ? 0 : data.length <= 30 ? 4 : 9;

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3>{t('charts.bp')}</h3>
        <div className="toggle-group">
          <button
            className={view === 'morning' ? 'active' : ''}
            onClick={() => setView('morning')}
          >
            {t('charts.morning')}
          </button>
          <button
            className={view === 'evening' ? 'active' : ''}
            onClick={() => setView('evening')}
          >
            {t('charts.evening')}
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="chart-no-data">{t('charts.noData')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
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
              dataKey={t('charts.systolic')}
              stroke="var(--color-chart-sys)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey={t('charts.diastolic')}
              stroke="var(--color-chart-dia)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
