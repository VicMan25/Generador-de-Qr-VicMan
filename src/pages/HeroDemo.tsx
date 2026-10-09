import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DEFAULT_DESIGN } from '../features/qr/design/defaults';
import { buildUrl } from '../features/qr/formats/url';
import { useDebouncedValue } from '../features/qr/hooks/useDebouncedValue';
import { useQrPreview } from '../features/qr/hooks/useQrPreview';
import type { GeneratorLocationState } from './GeneratorPage';
import styles from './HomePage.module.css';

const DEMO_URL = 'https://es.wikipedia.org/wiki/Código_QR';

/** Demostración real: el código se genera en vivo y se puede escanear. */
export function HeroDemo() {
  const navigate = useNavigate();
  const [value, setValue] = useState(DEMO_URL);
  const result = buildUrl(value);
  const payload = result.ok ? result.payload : null;
  const debounced = useDebouncedValue(payload, 200);
  const containerRef = useQrPreview(payload === null ? null : debounced, DEFAULT_DESIGN, 300);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!payload) return;
    const state: GeneratorLocationState = { prefill: { formatId: 'url', values: { url: value } } };
    navigate('/crear/url', { state });
  };

  return (
    <div className={styles.demo}>
      <div className={styles.demoCard}>
        <div className={styles.demoQr} data-empty={!payload || undefined}>
          <div
            ref={containerRef}
            className={styles.demoCanvas}
            role="img"
            aria-label={payload ? `Código QR de demostración para ${payload}` : undefined}
            aria-hidden={!payload || undefined}
          />
          {payload ? (
            <span className={styles.scanLine} aria-hidden="true" />
          ) : (
            <p className={styles.demoEmpty}>Escribe un enlace válido</p>
          )}
        </div>

        <form className={styles.demoForm} onSubmit={handleSubmit}>
          <label htmlFor="demo-url" className="eyebrow">
            Pruébalo con tu enlace
          </label>
          <input
            id="demo-url"
            className={styles.demoInput}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button type="submit" disabled={!payload} iconEnd={<ArrowRight />}>
            Personalizar y descargar
          </Button>
        </form>
      </div>
      <span className={`${styles.tag} ${styles.tagOne}`} aria-hidden="true">
        WIFI:T:WPA;S:Casa;;
      </span>
      <span className={`${styles.tag} ${styles.tagTwo}`} aria-hidden="true">
        https://
      </span>
    </div>
  );
}
