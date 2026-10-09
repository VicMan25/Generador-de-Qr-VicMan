import { Download, LoaderCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import styles from './MobileActionBar.module.css';

interface MobileActionBarProps {
  imageUrl: string | null;
  message: string;
  formatLabel: string;
  canDownload: boolean;
  working: boolean;
  previewId: string;
  onDownload: () => void;
}

/** Barra inferior fija en móvil: miniatura del código y descarga siempre a mano. */
export function MobileActionBar({ imageUrl, message, formatLabel, canDownload, working, previewId, onDownload }: MobileActionBarProps) {
  const showPreview = () => document.getElementById(previewId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.thumb}
        onClick={showPreview}
        disabled={!imageUrl}
        aria-label="Ver la vista previa del código"
      >
        {imageUrl ? <img src={imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}
      </button>
      <p className={styles.text} aria-live="polite">
        {message}
      </p>
      <Button
        onClick={onDownload}
        disabled={!canDownload || working}
        icon={working ? <LoaderCircle /> : <Download />}
      >
        {formatLabel}
      </Button>
    </div>
  );
}
