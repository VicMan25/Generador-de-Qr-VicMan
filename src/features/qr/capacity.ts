import type { ErrorCorrectionLevel } from 'qr-code-styling';
import { utf8Length } from '../../utils/bytes';

/** Capacidad máxima en modo byte (versión 40) para cada nivel de corrección de errores. */
export const BYTE_CAPACITY: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

/** A partir de este tamaño el código es tan denso que conviene advertirlo. */
export const DENSE_PAYLOAD_BYTES = 500;

export interface CapacityInfo {
  bytes: number;
  max: number;
  ratio: number;
  exceeded: boolean;
  dense: boolean;
}

export function getCapacity(payload: string, level: ErrorCorrectionLevel): CapacityInfo {
  const bytes = utf8Length(payload);
  const max = BYTE_CAPACITY[level];
  return {
    bytes,
    max,
    ratio: Math.min(bytes / max, 1),
    exceeded: bytes > max,
    dense: bytes > DENSE_PAYLOAD_BYTES,
  };
}
