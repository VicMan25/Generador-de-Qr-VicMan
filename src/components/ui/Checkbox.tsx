import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function Checkbox({ id, label, checked, onChange, hint }: CheckboxProps) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.checkbox}>
        <input
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span className={styles.box} aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
        <span>{label}</span>
      </label>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
