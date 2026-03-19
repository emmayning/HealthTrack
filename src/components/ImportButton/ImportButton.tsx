import { useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import { parseBackupFile, importMerge, importReplace } from '../../utils/backup';
import './ImportButton.css';

interface Props {
  onImportDone: () => void;
}

export default function ImportButton({ onImportDone }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [fileText, setFileText] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileText(reader.result as string);
      setShowModal(true);
      setMessage('');
    };
    reader.readAsText(file);
    // Reset so the same file can be selected again
    e.target.value = '';
  };

  const doImport = async (mode: 'merge' | 'replace') => {
    if (!fileText) return;
    try {
      const backup = parseBackupFile(fileText);
      let count: number;
      if (mode === 'merge') {
        count = await importMerge(backup.entries);
      } else {
        count = await importReplace(backup.entries);
      }
      setMessage(t('import.success', { count }));
      setShowModal(false);
      setFileText(null);
      onImportDone();
    } catch {
      setMessage(t('import.error'));
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
        {t('import.backup')}
      </button>

      {message && <div className="import-message">{message}</div>}

      {showModal && (
        <div className="import-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('import.selectMode')}</h3>
            <button className="btn-primary import-option" onClick={() => doImport('merge')}>
              <strong>{t('import.merge')}</strong>
              <span>{t('import.mergeDesc')}</span>
            </button>
            <button
              className="btn-primary import-option import-option-danger"
              onClick={() => doImport('replace')}
            >
              <strong>{t('import.replace')}</strong>
              <span>{t('import.replaceDesc')}</span>
            </button>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              {t('import.cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
