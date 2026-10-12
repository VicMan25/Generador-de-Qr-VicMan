import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { buildQrOptions, type QrDesign } from '../design/defaults';

/**
 * Dibuja el código en SVG dentro del contenedor devuelto y lo actualiza cuando cambia el contenido o el diseño.
 * El nuevo dibujo se prepara fuera de la página y sustituye al anterior solo cuando está completo,
 * para que la vista previa no parpadee ni quede vacía mientras se escribe.
 * Con `payload` nulo conserva el último dibujo; la interfaz decide si lo oculta.
 */
export function useQrPreview(payload: string | null, design: QrDesign, size = 320) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!payload || !container) return;

    let cancelled = false;
    const qr = new QRCodeStyling(buildQrOptions(payload, design, size, 'svg'));
    qr.getRawData('svg')
      .then(async (data) => {
        if (cancelled || !(data instanceof Blob)) return;
        const markup = await data.text();
        if (cancelled) return;
        const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
        container.replaceChildren(document.importNode(svg, true));
      })
      .catch(() => {
        // Si falla, se mantiene el dibujo anterior; la comprobación de lectura informa del problema.
      });

    return () => {
      cancelled = true;
    };
  }, [payload, design, size]);

  return containerRef;
}
