import { NavLink } from 'react-router';
import { QR_FORMATS, type QrFormatId } from '../formats/registry';
import styles from './TypeSelector.module.css';

/**
 * Selector de tipos de QR.
 * Escritorio: lista vertical. Tableta y móvil: fila de chips con desplazamiento horizontal.
 */
export function TypeSelector({ activeId }: { activeId: QrFormatId }) {
  return (
    <nav className={styles.selector} aria-label="Tipos de QR">
      <p className={`eyebrow ${styles.heading}`}>Tipo de QR</p>
      <ul className={styles.list}>
        {QR_FORMATS.map((format) => {
          const Icon = format.icon;
          return (
            <li key={format.id}>
              <NavLink
                to={`/crear/${format.id}`}
                className={styles.item}
                aria-current={format.id === activeId ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span className={styles.label}>{format.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
