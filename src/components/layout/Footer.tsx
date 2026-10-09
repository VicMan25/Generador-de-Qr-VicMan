import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { BrandMark } from './BrandMark';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <BrandMark />
          <p className={styles.tagline}>Códigos QR generados en tu navegador. Sin cuentas, sin bases de datos.</p>
        </div>
        <p className={styles.privacy}>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            El contenido de tus QR no sale de tu dispositivo. <Link to="/privacidad">Más sobre privacidad</Link>
          </span>
        </p>
        <p className={styles.legal}>© {new Date().getFullYear()} VicMan QR</p>
      </div>
    </footer>
  );
}
