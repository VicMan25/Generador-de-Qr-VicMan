import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { buildQrOptions, type QrDesign } from '../design/defaults';

/**
 * Dibuja el código en SVG dentro del contenedor devuelto y lo actualiza cuando cambia el contenido o el diseño.
 * Con `payload` nulo conserva el último dibujo; la interfaz decide si lo oculta.
 */
export function useQrPreview(payload: string | null, design: QrDesign, size = 320) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!payload || !container) return;
    const options = buildQrOptions(payload, design, size, 'svg');
    if (qrRef.current) {
      qrRef.current.update(options);
    } else {
      qrRef.current = new QRCodeStyling(options);
      qrRef.current.append(container);
    }
  }, [payload, design, size]);

  return containerRef;
}
