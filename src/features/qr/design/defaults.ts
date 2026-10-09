import type { DrawType, ErrorCorrectionLevel, Options } from 'qr-code-styling';
import { toUtf8BinaryString } from '../../../utils/bytes';

export type DotStyle = 'square' | 'rounded' | 'extra-rounded' | 'dots' | 'classy' | 'classy-rounded';
export type CornerFrameStyle = 'square' | 'extra-rounded' | 'dot';
export type CornerCenterStyle = 'square' | 'dot';
export type LogoSize = 'small' | 'medium' | 'large';
export type ExportFormat = 'png' | 'svg';

export interface QrDesign {
  foreground: string;
  cornerColor: string;
  background: string;
  dotStyle: DotStyle;
  cornerFrame: CornerFrameStyle;
  cornerCenter: CornerCenterStyle;
  errorCorrection: ErrorCorrectionLevel;
  /** Logotipo como data URL PNG procesada localmente, o null. */
  logo: string | null;
  logoSize: LogoSize;
}

export interface ExportSettings {
  format: ExportFormat;
  size: number;
}

export const DEFAULT_DESIGN: QrDesign = {
  foreground: '#12141A',
  cornerColor: '#12141A',
  background: '#FFFFFF',
  dotStyle: 'square',
  cornerFrame: 'square',
  cornerCenter: 'square',
  errorCorrection: 'M',
  logo: null,
  logoSize: 'medium',
};

export const DEFAULT_EXPORT: ExportSettings = { format: 'png', size: 1024 };

export const EXPORT_SIZES = [512, 1024, 2048, 4096] as const;

export const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: 'square', label: 'Cuadrados' },
  { value: 'rounded', label: 'Redondeados' },
  { value: 'extra-rounded', label: 'Suaves' },
  { value: 'dots', label: 'Puntos' },
  { value: 'classy', label: 'Elegante' },
  { value: 'classy-rounded', label: 'Elegante suave' },
];

export const CORNER_FRAMES: { value: CornerFrameStyle; label: string }[] = [
  { value: 'square', label: 'Cuadrado' },
  { value: 'extra-rounded', label: 'Redondeado' },
  { value: 'dot', label: 'Circular' },
];

export const CORNER_CENTERS: { value: CornerCenterStyle; label: string }[] = [
  { value: 'square', label: 'Cuadrado' },
  { value: 'dot', label: 'Circular' },
];

export const LOGO_SIZES: { value: LogoSize; label: string; ratio: number }[] = [
  { value: 'small', label: 'Pequeño', ratio: 0.25 },
  { value: 'medium', label: 'Mediano', ratio: 0.35 },
  { value: 'large', label: 'Grande', ratio: 0.45 },
];

export const ERROR_CORRECTION_LEVELS: { value: ErrorCorrectionLevel; label: string; hint: string }[] = [
  { value: 'L', label: 'Baja (7 %)', hint: 'Más capacidad, menos tolerancia a daños.' },
  { value: 'M', label: 'Media (15 %)', hint: 'Equilibrio recomendado.' },
  { value: 'Q', label: 'Alta (25 %)', hint: 'Para impresión en superficies que se desgastan.' },
  { value: 'H', label: 'Máxima (30 %)', hint: 'Necesaria con logotipo.' },
];

/** Paletas probadas con buen contraste (código oscuro sobre fondo claro). */
export const PALETTES: { name: string; foreground: string; cornerColor: string; background: string }[] = [
  { name: 'Tinta', foreground: '#12141A', cornerColor: '#12141A', background: '#FFFFFF' },
  { name: 'Señal', foreground: '#12141A', cornerColor: '#3A4BFF', background: '#FFFFFF' },
  { name: 'Océano', foreground: '#0B3B60', cornerColor: '#0B3B60', background: '#F2F8FC' },
  { name: 'Bosque', foreground: '#1D4D2F', cornerColor: '#2E7D4F', background: '#F4FAF2' },
  { name: 'Vino', foreground: '#5B1A2E', cornerColor: '#8E2443', background: '#FFF8F5' },
  { name: 'Lima', foreground: '#12141A', cornerColor: '#12141A', background: '#D4FF3A' },
];

/** Con logotipo se fuerza el nivel H para compensar los módulos ocultos. */
export function effectiveErrorCorrection(design: QrDesign): ErrorCorrectionLevel {
  return design.logo ? 'H' : design.errorCorrection;
}

/** Margen silencioso alrededor del código (proporción del tamaño total). */
const QUIET_ZONE_RATIO = 0.06;

export function buildQrOptions(payload: string, design: QrDesign, size: number, type: DrawType): Options {
  const options: Options = {
    type,
    width: size,
    height: size,
    margin: Math.round(size * QUIET_ZONE_RATIO),
    data: toUtf8BinaryString(payload),
    qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: effectiveErrorCorrection(design) },
    dotsOptions: { type: design.dotStyle, color: design.foreground },
    cornersSquareOptions: { type: design.cornerFrame, color: design.cornerColor },
    cornersDotOptions: { type: design.cornerCenter, color: design.cornerColor },
    backgroundOptions: { color: design.background },
  };

  if (design.logo) {
    options.image = design.logo;
    options.imageOptions = {
      hideBackgroundDots: true,
      imageSize: LOGO_SIZES.find((item) => item.value === design.logoSize)?.ratio ?? 0.35,
      margin: Math.max(2, Math.round(size * 0.008)),
    };
  }

  return options;
}
