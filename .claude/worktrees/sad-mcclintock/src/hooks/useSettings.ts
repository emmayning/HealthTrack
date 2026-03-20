import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, Language, WeightUnit } from '../types';
import { getSettings, saveSetting } from '../db/db';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  weightUnit: 'kg',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await saveSetting('language', lang);
    setSettings((prev) => ({ ...prev, language: lang }));
  }, []);

  const setWeightUnit = useCallback(async (unit: WeightUnit) => {
    await saveSetting('weightUnit', unit);
    setSettings((prev) => ({ ...prev, weightUnit: unit }));
  }, []);

  return { settings, loading, setLanguage, setWeightUnit };
}
