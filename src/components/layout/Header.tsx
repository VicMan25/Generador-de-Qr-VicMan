import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Menu, QrCode, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

const SECTION_LINKS = [
  { hash: '#tipos', label: 'Tipos de QR' },
  { hash: '#como-funciona', label: 'Cómo funciona' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Cierra el menú móvil al navegar.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <BrandMark />

        <nav id="main-nav" className={`${styles.nav} ${menuOpen ? styles.open : ''}`} aria-label="Principal">
          <ul className={styles.links}>
            {SECTION_LINKS.map((link) => (
              <li key={link.hash}>
                <Link to={{ pathname: '/', hash: link.hash }} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <NavLink to="/privacidad" className={styles.link}>
                Privacidad
              </NavLink>
            </li>
          </ul>
          <Button to="/crear" icon={<QrCode />} className={styles.cta}>
            Crear QR
          </Button>
        </nav>

        <div className={styles.tools}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
