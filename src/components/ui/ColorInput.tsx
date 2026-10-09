import { useEffect, useState } from 'react';
import { isHexColor } from '../../utils/contrast';
import styles from './ColorInput.module.css';

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** Selector de color con muestra nativa y campo hexadecimal editable. */
export function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  const [text, setText] = useState(value);

  // Sincroniza el texto cuando el color cambia desde fuera (paletas, restablecer).
  useEffect(() => setText(value), [value]);

  const commitText = (next: string) => {
    const normalized = (next.startsWith('#') ? next : `#${next}`).toUpperCase();
    setText(next);
    if (isHexColor(normalized)) onChange(normalized);
  };

  const invalid = !isHexColor((text.startsWith('#') ? text : `#${text}`).toUpperCase());

  return (
    <div className={styles.field}>
      <label htmlFor={`${id}-hex`} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${invalid ? styles.invalid : ''}`}>
        <input
          type="color"
          className={styles.swatch}
          value={value.toLowerCase()}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label={`${label}: elegir en la paleta`}
        />
        <input
          id={`${id}-hex`}
          className={styles.hex}
          value={text}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          onChange={(event) => commitText(event.target.value.trim())}
          onBlur={() => setText(value)}
        />
      </div>
    </div>
  );
}
