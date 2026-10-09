import QRCodeStyling from 'qr-code-styling';
import { buildQrOptions, type ExportFormat, type QrDesign } from '../design/defaults';

/** Genera la imagen del código en memoria (PNG o SVG), sin insertarla en la página. */
export async function renderQr(payload: string, design: QrDesign, size: number, format: ExportFormat): Promise<Blob> {
  const qr = new QRCodeStyling(buildQrOptions(payload, design, size, format === 'svg' ? 'svg' : 'canvas'));
  const data = await qr.getRawData(format);
  if (!(data instanceof Blob)) throw new Error('No se pudo generar la imagen.');
  return data;
}

/** Descarga un archivo generado en el navegador. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Se libera después de que el navegador haya iniciado la descarga.
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
