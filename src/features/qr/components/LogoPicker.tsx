import { useId, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LOGO_MAX_BYTES, LOGO_TYPES, rasterizeImage } from '../../../utils/image';
import styles from './LogoPicker.module.css';

interface LogoPickerProps {
  logo: string | null;
  onChange: (logo: string | null) => void;
}

/** Carga de logotipo: la imagen se procesa en el navegador y nunca sale del dispositivo. */
export function LogoPicker({ logo, onChange }: LogoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);

    if (!LOGO_TYPES.includes(file.type)) {
      setError('Formato no admitido. Usa PNG, JPG, WEBP o SVG.');
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setError('La imagen supera 2 MB. Usa una versión más ligera.');
      return;
    }

    setBusy(true);
    try {
      onChange(await rasterizeImage(file));
    } catch {
      setError('No se pudo leer la imagen. Prueba con otro archivo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.picker}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={LOGO_TYPES.join(',')}
        className="visually-hidden"
        onChange={handleFile}
        tabIndex={-1}
      />

      {logo ? (
        <div className={styles.current}>
          <img src={logo} alt="Logotipo seleccionado" className={styles.thumb} />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} icon={<ImagePlus />}>
              Cambiar
            </Button>
            <Button variant="ghost" onClick={() => onChange(null)} icon={<Trash2 />}>
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          className={styles.upload}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          icon={busy ? <LoaderCircle /> : <ImagePlus />}
        >
          {busy ? 'Procesando…' : 'Subir logotipo'}
        </Button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.hint}>PNG, JPG, WEBP o SVG de hasta 2 MB. Se procesa en tu navegador y no se guarda.</p>
    </div>
  );
}
