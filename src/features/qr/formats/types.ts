/** Contrato que cumple cada tipo de QR operativo. */

export type FieldValue = string | boolean;
export type FormValues = Record<string, FieldValue>;
export type FieldErrors = Record<string, string>;

export type FieldKind = 'text' | 'url' | 'textarea' | 'email' | 'tel' | 'password' | 'select' | 'checkbox';

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
  autoComplete?: string;
  /** Muestra el conteo de bytes UTF-8 bajo el campo. */
  showByteCount?: boolean;
  /** Opciones de un campo `select`. */
  options?: readonly { value: string; label: string }[];
  /** `half` ocupa media fila en pantallas anchas. */
  width?: 'full' | 'half';
  /** Oculta el campo según el resto de valores (p. ej. la contraseña de una red abierta). */
  visibleWhen?: (values: FormValues) => boolean;
}

export interface Notice {
  tone: 'info' | 'warning';
  text: string;
}

export type BuildResult =
  | { ok: true; payload: string; notices: Notice[] }
  | { ok: false; errors: FieldErrors; notices: Notice[] };

/** Guía de ayuda que se muestra junto al formulario. */
export interface FormatGuide {
  title: string;
  steps: string[];
  tips: { title: string; text: string }[];
}

export interface QrFormatDefinition {
  fields: FieldDef[];
  defaults: FormValues;
  /** Avisos fijos del tipo (seguridad, compatibilidad, privacidad). */
  notices: Notice[];
  /** Valida los datos y, si son correctos, devuelve el texto exacto que contendrá el QR. */
  build(values: FormValues): BuildResult;
  /** Nombre de archivo sin extensión. */
  fileName(values: FormValues): string;
  guide?: FormatGuide;
}

export function readString(values: FormValues, name: string): string {
  const value = values[name];
  return typeof value === 'string' ? value : '';
}

export function readBoolean(values: FormValues, name: string): boolean {
  return values[name] === true;
}
