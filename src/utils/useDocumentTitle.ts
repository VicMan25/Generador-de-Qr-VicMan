import { useEffect } from 'react';

const BASE_TITLE = 'VicMan QR';

/** Fija el título de la pestaña. Sin argumento usa el título principal del sitio. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : `${BASE_TITLE} — Estudio de códigos QR`;
  }, [title]);
}
