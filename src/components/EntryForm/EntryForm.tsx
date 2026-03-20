import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import type { HealthEntry, WeightUnit } from '../../types';
import { todayISO, toFullDate } from '../../utils/dates';
import { validateEntry, type ValidationWarning } from '../../utils/validation';
import { displayWeight, toKg } from '../../utils/weight';
import './EntryForm.css';

interface Props {
  onSave: (entry: HealthEntry) => Promise<void>;
  editingEntry: HealthEntry | null;
  onCancelEdit: () => void;
  weightUnit: WeightUnit;
}

/** Parse a field that allows decimals (weight). */
function parseDecimalField(val: string): { value: number | null; error: boolean } {
  const trimmed = val.trim();
  if (trimmed === '') return { value: null, error: false };
  const num = parseFloat(trimmed);
  if (isNaN(num)) return { value: null, error: true };
  return { value: num, error: false };
}

/** Parse a field that must be an integer (BP, HR). Rounds to nearest integer. */
function parseIntegerField(val: string): { value: number | null; error: boolean } {
  const trimmed = val.trim();
  if (trimmed === '') return { value: null, error: false };
  const num = parseFloat(trimmed);
  if (isNaN(num)) return { value: null, error: true };
  return { value: Math.round(num), error: false };
}

/**
 * Coerce a string to an integer string on blur.
 * - "120.5" → "121"   (rounds to nearest)
 * - "80.2"  → "80"    (rounds to nearest)
 * - "120..5"→ "120"   (parseFloat stops at second dot)
 * - "98/65" → "98"    (parseFloat stops at slash)
 * - "abc"   → ""      (NaN → empty)
 * - ""      → ""      (blank stays blank)
 */
function coerceToIntegerString(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  const num = parseFloat(trimmed);
  if (isNaN(num)) return '';
  return String(Math.round(num));
}

/** Populate form fields from a HealthEntry. */
function entryToFormFields(entry: HealthEntry, weightUnit: WeightUnit) {
  return {
    date: entry.date,
    morningSys: entry.morningSystolic?.toString() ?? '',
    morningDia: entry.morningDiastolic?.toString() ?? '',
    eveningSys: entry.eveningSystolic?.toString() ?? '',
    eveningDia: entry.eveningDiastolic?.toString() ?? '',
    hr: entry.restingHeartRate?.toString() ?? '',
    weight: entry.weight !== null ? displayWeight(entry.weight, weightUnit) : '',
    notes: entry.notes ?? '',
  };
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

  // Hydrate form when editingEntry changes
  useEffect(() => {
    if (editingEntry) {
      const fields = entryToFormFields(editingEntry, weightUnit);
      setDate(fields.date);
      setMorningSys(fields.morningSys);
      setMorningDia(fields.morningDia);
      setEveningSys(fields.eveningSys);
      setEveningDia(fields.eveningDia);
      setHr(fields.hr);
      setWeight(fields.weight);
      setNotes(fields.notes);
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
    setSaved(false);
  };

  // For integer fields: let the user type freely, but round on blur.
  const handleIntegerBlur = (setter: (v: string) => void) => (e: React.FocusEvent<HTMLInputElement>) => {
    setter(coerceToIntegerString(e.target.value));
  };

  const handleSave = async () => {
    setSaved(false);
    // BP and HR use parseIntegerField (rounds as safety net)
    // Weight uses parseDecimalField (allows decimals)
    const fields: Record<string, { raw: string; parsed: ReturnType<typeof parseIntegerField> }> = {
      morningSystolic: { raw: morningSys, parsed: parseIntegerField(morningSys) },
      morningDiastolic: { raw: morningDia, parsed: parseIntegerField(morningDia) },
      eveningSystolic: { raw: eveningSys, parsed: parseIntegerField(eveningSys) },
      eveningDiastolic: { raw: eveningDia, parsed: parseIntegerField(eveningDia) },
      restingHeartRate: { raw: hr, parsed: parseIntegerField(hr) },
      weight: { raw: weight, parsed: parseDecimalField(weight) },
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

    if (editingEntry) {
      // Exit edit mode, reset form, then briefly show success
      onCancelEdit();
      resetForm();
    } else {
      resetForm();
    }
    // Set saved AFTER resetForm so it isn't cleared by resetForm
    setSaved(true);
  };

  const isEditing = editingEntry !== null;

  return (
    <div className={`entry-form${isEditing ? ' entry-form-editing' : ''}`}>
      <h2>{isEditing ? t('form.editTitle') : t('form.title')}</h2>
      {isEditing && editingEntry && (
        <div className="form-editing-hint">
          {t('form.editingDate', { date: toFullDate(editingEntry.date, lang) })}
        </div>
      )}

      <div className="form-field">
        <label>{t('form.date')}</label>
        {isEditing ? (
          <div className="date-locked">{toFullDate(date, lang)}</div>
        ) : (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
      </div>

      <fieldset className="bp-group">
        <legend>{t('form.morningBP')}</legend>
        <div className="bp-row-compact">
          <div className="bp-input-pair">
            <div className="bp-field">
              <label>{t('form.systolic')}</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={morningSys}
                onChange={(e) => setMorningSys(e.target.value)}
                onBlur={handleIntegerBlur(setMorningSys)}
                className={errors.morningSystolic ? 'error' : ''}
              />
            </div>
            <span className="bp-slash">/</span>
            <div className="bp-field">
              <label>{t('form.diastolic')}</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={morningDia}
                onChange={(e) => setMorningDia(e.target.value)}
                onBlur={handleIntegerBlur(setMorningDia)}
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
                inputMode="numeric"
                pattern="[0-9]*"
                value={eveningSys}
                onChange={(e) => setEveningSys(e.target.value)}
                onBlur={handleIntegerBlur(setEveningSys)}
                className={errors.eveningSystolic ? 'error' : ''}
              />
            </div>
            <span className="bp-slash">/</span>
            <div className="bp-field">
              <label>{t('form.diastolic')}</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={eveningDia}
                onChange={(e) => setEveningDia(e.target.value)}
                onBlur={handleIntegerBlur(setEveningDia)}
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
            inputMode="numeric"
            pattern="[0-9]*"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            onBlur={handleIntegerBlur(setHr)}
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
          {isEditing ? t('form.update') : t('form.save')}
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
