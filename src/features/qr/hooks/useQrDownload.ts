import { useCallback, useState } from 'react';
import type { ExportSettings, QrDesign } from '../design/defaults';
import { renderQr, saveBlob } from '../export/render';
import { verifyImage } from '../export/verify';

export type DownloadState =
  | { phase: 'idle' }
  | { phase: 'working' }
  | { phase: 'done'; fileName: string }
  | { phase: 'unverified'; blob: Blob; fileName: string }
  | { phase: 'error'; message: string };

/**
 * Genera el archivo final, comprueba que se lee correctamente y lo descarga.
 * Si la lectura falla, no descarga y deja la decisión al usuario.
 */
export function useQrDownload() {
  const [state, setState] = useState<DownloadState>({ phase: 'idle' });

  const download = useCallback(
    async (payload: string, baseName: string, design: QrDesign, settings: ExportSettings) => {
      const fileName = `${baseName}.${settings.format}`;
      setState({ phase: 'working' });
      try {
        const blob = await renderQr(payload, design, settings.size, settings.format);
        const outcome = await verifyImage(blob, payload);
        if (outcome !== 'match') {
          setState({ phase: 'unverified', blob, fileName });
          return;
        }
        saveBlob(blob, fileName);
        setState({ phase: 'done', fileName });
      } catch {
        setState({ phase: 'error', message: 'No se pudo generar la imagen. Inténtalo de nuevo.' });
      }
    },
    [],
  );

  const forceSave = useCallback(() => {
    if (state.phase !== 'unverified') return;
    saveBlob(state.blob, state.fileName);
    setState({ phase: 'done', fileName: state.fileName });
  }, [state]);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, download, forceSave, reset };
}
