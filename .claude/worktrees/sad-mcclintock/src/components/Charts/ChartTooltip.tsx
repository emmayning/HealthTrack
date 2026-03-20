import { toFullDate } from '../../utils/dates';
import { useTranslation } from '../../i18n';

interface Payload {
  name?: string;
  value?: number;
  color?: string;
}

interface Props {
  active?: boolean;
  payload?: Payload[];
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: Props) {
  const { lang } = useTranslation();
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{toFullDate(label ?? '', lang)}</div>
      {payload.map((item) => (
        <div key={item.name} className="tooltip-row">
          <span
            className="tooltip-dot"
            style={{ background: item.color }}
          />
          <span className="tooltip-label">{item.name}: </span>
          <span className="tooltip-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
