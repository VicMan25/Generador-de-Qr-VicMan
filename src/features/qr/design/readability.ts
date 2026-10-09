import { contrastRatio, CRITICAL_QR_CONTRAST, luminance, MIN_QR_CONTRAST } from '../../../utils/contrast';
import type { QrDesign } from './defaults';

export interface Readability {
  /** Peor contraste entre el fondo y los colores del código (módulos y esquinas). */
  ratio: number;
  level: 'ok' | 'low' | 'critical';
  /** Código más claro que el fondo: algunos lectores no lo reconocen. */
  inverted: boolean;
}

export function assessReadability(design: QrDesign): Readability {
  const ratio = Math.min(
    contrastRatio(design.foreground, design.background),
    contrastRatio(design.cornerColor, design.background),
  );
  const background = luminance(design.background);
  const inverted = luminance(design.foreground) > background || luminance(design.cornerColor) > background;
  const level = ratio < CRITICAL_QR_CONTRAST ? 'critical' : ratio < MIN_QR_CONTRAST ? 'low' : 'ok';
  return { ratio, level, inverted };
}

export function formatRatio(ratio: number): string {
  return `${ratio.toLocaleString('es', { maximumFractionDigits: 1 })}:1`;
}
