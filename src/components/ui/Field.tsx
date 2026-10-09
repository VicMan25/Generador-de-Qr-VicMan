import { useState, type ReactNode } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import styles from './Field.module.css';

type InputKind = 'text' | 'url' | 'email' | 'tel' | 'password' | 'textarea' | 'select';

interface FieldProps {
  id: string;
  label: string;
  kind: InputKind;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  autoComplete?: string;
  options?: readonly { value: string; label: string }[];
  /** Contenido alineado a la derecha bajo el campo (p. ej. un contador). */
  aside?: ReactNode;
}

const INPUT_MODES: Partial<Record<InputKind, 'url' | 'email' | 'tel'>> = {
  url: 'url',
  email: 'email',
  tel: 'tel',
};

export function Field(props: FieldProps) {
  const { id, label, kind, value, onChange, onBlur, placeholder, hint, error, required, rows, autoComplete, options, aside } =
    props;
  const [revealed, setRevealed] = useState(false);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && !error && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const shared = {
    id,
    name: id,
    value,
    required,
    onBlur,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: `${styles.control} ${error ? styles.invalid : ''}`,
  };

  let control: ReactNode;
  if (kind === 'textarea') {
    control = (
      <textarea {...shared} placeholder={placeholder} rows={rows ?? 4} onChange={(event) => onChange(event.target.value)} />
    );
  } else if (kind === 'select') {
    control = (
      <div className={styles.withAddon}>
        <select {...shared} className={`${shared.className} ${styles.select}`} onChange={(event) => onChange(event.target.value)}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className={styles.selectIcon} aria-hidden="true" />
      </div>
    );
  } else {
    const isPassword = kind === 'password';
    const input = (
      <input
        {...shared}
        className={`${shared.className} ${isPassword ? styles.hasAddon : ''}`}
        type={isPassword && revealed ? 'text' : kind}
        placeholder={placeholder}
        inputMode={INPUT_MODES[kind]}
        autoComplete={autoComplete ?? 'off'}
        autoCapitalize={kind === 'text' ? undefined : 'off'}
        spellCheck={kind === 'text' ? undefined : false}
        onChange={(event) => onChange(event.target.value)}
      />
    );
    control = isPassword ? (
      <div className={styles.withAddon}>
        {input}
        <button
          type="button"
          className={styles.addon}
          onClick={() => setRevealed((current) => !current)}
          aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={revealed}
        >
          {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    ) : (
      input
    );
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>

      {control}

      {(hint || error || aside) && (
        <div className={styles.meta}>
          <div>
            {error ? (
              <p id={errorId} className={styles.error} role="alert">
                {error}
              </p>
            ) : (
              hint && (
                <p id={hintId} className={styles.hint}>
                  {hint}
                </p>
              )
            )}
          </div>
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
      )}
    </div>
  );
}
