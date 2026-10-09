import type { ReactNode } from 'react';
import styles from './OptionGroup.module.css';

interface Option<T extends string | number> {
  value: T;
  label: string;
  /** Representación visual opcional (p. ej. una muestra del estilo). */
  visual?: ReactNode;
}

interface OptionGroupProps<T extends string | number> {
  name: string;
  legend: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  hint?: ReactNode;
  /** `tiles` muestra cuadrículas con imagen; `pills` una fila compacta. */
  variant?: 'tiles' | 'pills';
}

/** Grupo de opciones exclusivas basado en radios nativos (accesible con teclado y lectores). */
export function OptionGroup<T extends string | number>(props: OptionGroupProps<T>) {
  const { name, legend, options, value, onChange, disabled, hint, variant = 'pills' } = props;
  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={`${styles.options} ${styles[variant]}`}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              className={styles.input}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.face}>
              {option.visual && (
                <span className={styles.visual} aria-hidden="true">
                  {option.visual}
                </span>
              )}
              <span className={styles.label}>{option.label}</span>
            </span>
          </label>
        ))}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  );
}
