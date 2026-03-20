import { useTranslation } from '../../i18n';
import './Disclaimer.css';

export default function Disclaimer() {
  const { t } = useTranslation();
  return <div className="disclaimer">{t('disclaimer.text')}</div>;
}
