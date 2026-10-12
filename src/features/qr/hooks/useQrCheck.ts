import { useEffect, useRef, useState } from 'react';
import type { QrDesign } from '../design/defaults';
import { renderQr } from '../export/render';
import { verifyImage } from '../export/verify';

export type CheckStatus = 'idle' | 'checking' | 'match' | 'mismatch' | 'unreadable' | 'error';

/** Tamaño de la imagen usada para la comprobación y la miniatura móvil. */
const CHECK_SIZE = 480;

/**
 * Tras cada cambio de contenido o diseño, genera el PNG, lo vuelve a leer y confirma que contiene
 * exactamente `payload`. También expone una URL de esa imagen para usarla como miniatura.
 */
export function useQrCheck(payload: string | null, design: QrDesign) {
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // La miniatura anterior se libera solo cuando la nueva la sustituye, para que no se vea rota entretanto.
  const urlRef = useRef<string | null>(null);

  const replaceImage = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setImageUrl(url);
  };

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  useEffect(() => {
    if (!payload) {
      setStatus('idle');
      replaceImage(null);
      return;
    }

    let cancelled = false;
    setStatus('checking');

    renderQr(payload, design, CHECK_SIZE, 'png')
      .then(async (blob) => {
        if (cancelled) return;
        replaceImage(URL.createObjectURL(blob));
        const outcome = await verifyImage(blob, payload);
        if (!cancelled) setStatus(outcome);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [payload, design]);

  return { status, imageUrl };
}
