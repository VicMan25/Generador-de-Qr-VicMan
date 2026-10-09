import { Link } from 'react-router';
import styles from './BrandMark.module.css';

/**
 * Espacio reservado para el logotipo oficial.
 * Cuando exista, colócalo en `public/brand/` y apunta LOGO_SRC hacia él.
 */
const LOGO_SRC: string | null = null;

export function BrandMark() {
  return (
    <Link to="/" className={styles.brand} aria-label="VicMan QR, ir al inicio">
      {LOGO_SRC ? (
        <img src={LOGO_SRC} alt="" className={styles.logo} />
      ) : (
        <svg className={styles.logo} viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="6" className={styles.tile} />
          <rect x="6" y="6" width="9" height="9" rx="1.5" fill="none" className={styles.eye} strokeWidth="2.5" />
          <rect x="9.25" y="9.25" width="2.5" height="2.5" className={styles.eyeFill} />
          <rect x="18" y="6" width="3" height="3" className={styles.dot} />
          <rect x="23" y="11" width="3" height="3" className={styles.dot} />
          <rect x="6" y="18" width="3" height="3" className={styles.dot} />
          <rect x="11" y="23" width="3" height="3" className={styles.dot} />
          <rect x="18" y="18" width="8" height="8" rx="1.5" className={styles.eyeFill} />
        </svg>
      )}
      <span className={styles.wordmark} aria-hidden="true">
        VicMan<span className={styles.suffix}>QR</span>
      </span>
    </Link>
  );
}
