import { Checkbox } from '../../../components/ui/Checkbox';
import { Field } from '../../../components/ui/Field';
import { utf8Length } from '../../../utils/bytes';
import {
  readBoolean,
  readString,
  type FieldErrors,
  type FieldValue,
  type FormValues,
  type QrFormatDefinition,
} from '../formats/types';
import styles from './ContentForm.module.css';

interface ContentFormProps {
  formatId: string;
  definition: QrFormatDefinition;
  values: FormValues;
  errors: FieldErrors;
  onChange: (name: string, value: FieldValue) => void;
  onBlur: (name: string) => void;
}

/** Formulario generado a partir de los campos que declara cada tipo de QR. */
export function ContentForm({ formatId, definition, values, errors, onChange, onBlur }: ContentFormProps) {
  const fields = definition.fields.filter((field) => !field.visibleWhen || field.visibleWhen(values));

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()} noValidate>
      {fields.map((field) => {
        const id = `${formatId}-${field.name}`;
        const className = field.width === 'half' ? styles.half : styles.full;

        if (field.kind === 'checkbox') {
          return (
            <div key={field.name} className={className}>
              <Checkbox
                id={id}
                label={field.label}
                hint={field.hint}
                checked={readBoolean(values, field.name)}
                onChange={(checked) => onChange(field.name, checked)}
              />
            </div>
          );
        }

        const value = readString(values, field.name);
        return (
          <div key={field.name} className={className}>
            <Field
              id={id}
              label={field.label}
              kind={field.kind}
              value={value}
              onChange={(next) => onChange(field.name, next)}
              onBlur={() => onBlur(field.name)}
              placeholder={field.placeholder}
              hint={field.hint}
              error={errors[field.name]}
              required={field.required}
              rows={field.rows}
              autoComplete={field.autoComplete}
              options={field.options}
              aside={field.showByteCount ? `${utf8Length(value).toLocaleString('es')} bytes` : undefined}
            />
          </div>
        );
      })}
    </form>
  );
}
