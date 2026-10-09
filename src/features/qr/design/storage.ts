import { isHexColor } from '../../../utils/contrast';
import {
  CORNER_CENTERS,
  CORNER_FRAMES,
  DEFAULT_DESIGN,
  DEFAULT_EXPORT,
  DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  EXPORT_SIZES,
  LOGO_SIZES,
  type ExportSettings,
  type QrDesign,
} from './defaults';

/**
 * Preferencias de diseño y exportación en el almacenamiento local.
 * Nunca se guarda el contenido de los códigos ni el logotipo.
 */

const STORAGE_KEY = 'vmqr-preferences';

interface StoredPreferences {
  design: Omit<QrDesign, 'logo'>;
  export: ExportSettings;
}

const oneOf = <T>(list: readonly { value: T }[], value: unknown, fallback: T): T =>
  list.some((item) => item.value === value) ? (value as T) : fallback;

const color = (value: unknown, fallback: string) =>
  typeof value === 'string' && isHexColor(value) ? value : fallback;

export function loadPreferences(): { design: QrDesign; export: ExportSettings } {
  let stored: Partial<StoredPreferences> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredPreferences>;
  } catch {
    // Almacenamiento no disponible o dañado: se usan los valores por defecto.
  }
  const d = (stored.design ?? {}) as Partial<QrDesign>;
  const e = (stored.export ?? {}) as Partial<ExportSettings>;

  return {
    design: {
      foreground: color(d.foreground, DEFAULT_DESIGN.foreground),
      cornerColor: color(d.cornerColor, DEFAULT_DESIGN.cornerColor),
      background: color(d.background, DEFAULT_DESIGN.background),
      dotStyle: oneOf(DOT_STYLES, d.dotStyle, DEFAULT_DESIGN.dotStyle),
      cornerFrame: oneOf(CORNER_FRAMES, d.cornerFrame, DEFAULT_DESIGN.cornerFrame),
      cornerCenter: oneOf(CORNER_CENTERS, d.cornerCenter, DEFAULT_DESIGN.cornerCenter),
      errorCorrection: oneOf(ERROR_CORRECTION_LEVELS, d.errorCorrection, DEFAULT_DESIGN.errorCorrection),
      logo: null,
      logoSize: oneOf(LOGO_SIZES, d.logoSize, DEFAULT_DESIGN.logoSize),
    },
    export: {
      format: e.format === 'svg' ? 'svg' : 'png',
      size: EXPORT_SIZES.includes(e.size as (typeof EXPORT_SIZES)[number]) ? (e.size as number) : DEFAULT_EXPORT.size,
    },
  };
}

export function savePreferences(design: QrDesign, exportSettings: ExportSettings) {
  const stored: StoredPreferences = { design: { ...design, logo: undefined } as Omit<QrDesign, 'logo'>, export: exportSettings };
  try {
    // JSON.stringify omite `logo: undefined`.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Sin almacenamiento: las preferencias solo duran esta sesión.
  }
}
