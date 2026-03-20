import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { todayISO } from '../../utils/dates';
import { validateEntry, type ValidationWarning } from '../../utils/validation';
import { displayWeight, toKg } from '../../utils/weight';
import './EntryForm.css';

interface Props {
  onSave: (entry: HealthEntry) => Promise<void>;
  editingEntry: HealthEntry | null;
  onCancelEdit: () => void;
  weightUnit: WeightUnit;
}

function parseField(val: string): { value: number | null; error: boolean } {
  const trimmed = val.trim();
  if (trimmed === '') return { value: null, error: false };
  const num = parseFloat(trimmed);
  if (isNaN(num)) return { value: null, error: true };
  return { value: num, error: false };
}

export default function EntryForm({ onSave, editingEntry, onCancelEdit, weightUnit }: Props) {
  const { t, lang } = useTranslation();
  const [date, setDate] = useState(todayISO());
  const [morningSys, setMorningSys] = useState('');
  const [morningDia, setMorningDia] = useState('');
  const [eveningSys, setEveningSys] = useState('');
  const [eveningDia, setEveningDia] = useState('');
  const [hr, setHr] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setMorningSys(editingEntry.morningSystolic?.toString() ?? '');
      setMorningDia(editingEntry.morningDiastolic?.toString() ?? '');
      setEveningSys(editingEntry.eveningSystolic?.toString() ?? '');
      setEveningDia(editingEntry.eveningDiastolic?.toString() ?? '');
      setHr(editingEntry.restingHeartRate?.toString() ?? '');
      setWeight(
        editingEntry.weight !== null
          ? displayWeight(editingEntry.weight, weightUnit)
          : ''
      );
      setNotes(editingEntry.notes);
      setErrors({});
      setWarnings([]);
      setSaved(false);
    }
  }, [editingEntry, weightUnit]);

  const resetForm = () => {
    setDate(todayISO());
    setMorningSys('');
    setMorningDia('');
    setEveningSys('');
    setEveningDia('');
    setHr('');
    setWeight('');
    setNotes('');
    setErrors({});
    setWarnings([]);
  };

  const handleSave = async () => {
    setSaved(false);
    const fields: Record<string, { raw: string; parsed: ReturnType<typeof parseField> }> = {
      morningSystolic: { raw: morningSys, parsed: parseField(morningSys) },
      morningDiastolic: { raw: morningDia, parsed: parseField(morningDia) },
      eveningSystolic: { raw: eveningSys, parsed: parseField(eveningSys) },
      eveningDiastolic: { raw: eveningDia, parsed: parseField(eveningDia) },
      restingHeartRate: { raw: hr, parsed: parseField(hr) },
      weight: { raw: weight, parsed: parseField(weight) },
    };

    const newErrors: Record<string, boolean> = {};
    let hasError = false;
    for (const [key, { parsed }] of Object.entries(fields)) {
      if (parsed.error) {
        newErrors[key] = true;
        hasError = true;
      }
    }
    setErrors(newErrors);
    if (hasError) return;

    const weightKg =
      fields.weight.parsed.value !== null
        ? toKg(fields.weight.parsed.value, weightUnit)
        : null;

    const entry: HealthEntry = {
      date,
      morningSystolic: fields.morningSystolic.parsed.value,
      morningDiastolic: fields.morningDiastolic.parsed.value,
      eveningSystolic: fields.eveningSystolic.parsed.value,
      eveningDiastolic: fields.eveningDiastolic.parsed.value,
      restingHeartRate: fields.restingHeartRate.parsed.value,
      weight: weightKg,
      notes,
    };

    const w = validateEntry(entry, lang);
    setWarnings(w);

    await onSave(entry);
    setSaved(true);
    if (!editingEntry) {
      resetForm();
    }
  };

  const isEditing = editingEntry !== null;

  return (
    <div className="entry-form">
      <h2>{isEditing ? t('form.editTitle') : t('form.title')}</h2>

      <div className="form-field">
        <label>{t('form.date')}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <fieldset className="bp-group">
        <legend>{t('form.morningBP')}</legend>
        <div className="bp-row-compact">
          <div className="bp-input-pair">
            <div className="bp-field">
              <label>{t('form.systolic')}</label>
              <input
                inputMode="decimal"
                value={morningSys}
                onChange={(e) => setMorningSys(e.target.value)}
                className={errors.morningSystolic ? 'error' : ''}
              />
            </div>
            <span className="bp-slash">/</span>
            <div className="bp-field">
              <label>{t('form.diastolic')}</label>
              <input
                inputMode="decimal"
                value={morningDia}
                onChange={(e) => setMorningDia(e.target.value)}
                className={errors.morningDiastolic ? 'error' : ''}
              />
            </div>
          </div>
          <span className="unit">{t('form.mmHg')}</span>
        </div>
      </fieldset>

      <fieldset className="bp-group">
        <legend>{t('form.eveningBP')}</legend>
        <div className="bp-row-compact">
          <div className="bp-input-pair">
            <div className="bp-field">
              <label>{t('form.systolic')}</label>
              <input
                inputMode="decimal"
                value={eveningSys}
                onChange={(e) => setEveningSys(e.target.value)}
                className={errors.eveningSystolic ? 'error' : ''}
              />
            </div>
            <span className="bp-slash">/</span>
            <div className="bp-field">
              <label>{t('form.diastolic')}</label>
              <input
                inputMode="decimal"
                value={eveningDia}
                onChange={(e) => setEveningDia(e.target.value)}
                className={errors.eveningDiastolic ? 'error' : ''}
              />
            </div>
          </div>
          <span className="unit">{t('form.mmHg')}</span>
        </div>
      </fieldset>

      <div className="form-field">
        <label>{t('form.restingHR')}</label>
        <div className="input-with-unit">
          <input
            inputMode="decimal"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            className={errors.restingHeartRate ? 'error' : ''}
          />
          <span className="unit">{t('form.bpm')}</span>
        </div>
      </div>

      <div className="form-field">
        <label>{t('form.weight')}</label>
        <div className="input-with-unit">
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={errors.weight ? 'error' : ''}
          />
          <span className="unit">{weightUnit}</span>
        </div>
      </div>

      <div className="form-field">
        <label>{t('form.notes')}</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="form-errors">{t('form.invalidNumber')}</div>
      )}

      {warnings.length > 0 && (
        <div className="form-warnings">
          {warnings.map((w) => (
            <div key={w.field}>{w.message}</div>
          ))}
        </div>
      )}

      {saved && <div className="form-success">{t('form.saved')}</div>}

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave}>
          {t('form.save')}
        </button>
        {isEditing && (
          <button
            className="btn-secondary"
            onClick={() => {
              onCancelEdit();
              resetForm();
            }}
          >
            {t('form.cancel')}
          </button>
        )}
      </div>
    </div>
  );
}
