import { useTranslation } from '../../i18n';
import type { Language, WeightUnit } from '../../types';
import './Settings.css';

interface Props {
  language: Language;
  weightUnit: WeightUnit;
  onLanguageChange: (lang: Language) => void;
  onWeightUnitChange: (unit: WeightUnit) => void;
}

export default function Settings({
  language,
  weightUnit,
  onLanguageChange,
  onWeightUnitChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="settings">
      <h2 className="settings-title">{t('settings.title')}</h2>
      <div className="settings-row">
        <label>{t('settings.language')}</label>
        <div className="toggle-group">
          <button
            className={language === 'en' ? 'active' : ''}
            onClick={() => onLanguageChange('en')}
          >
            English
          </button>
          <button
            className={language === 'zh' ? 'active' : ''}
            onClick={() => onLanguageChange('zh')}
          >
            中文
          </button>
        </div>
      </div>
      <div className="settings-row">
        <label>{t('settings.weightUnit')}</label>
        <div className="toggle-group">
          <button
            className={weightUnit === 'kg' ? 'active' : ''}
            onClick={() => onWeightUnitChange('kg')}
          >
            kg
          </button>
          <button
            className={weightUnit === 'lb' ? 'active' : ''}
            onClick={() => onWeightUnitChange('lb')}
          >
            lb
          </button>
        </div>
      </div>
    </div>
  );
}
