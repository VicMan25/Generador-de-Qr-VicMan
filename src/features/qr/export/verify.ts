/**
 * Comprobación práctica de lectura: decodifica la imagen generada con jsQR
 * (cargado solo cuando se necesita) y compara el resultado con el contenido esperado.
 */

export type VerifyOutcome = 'match' | 'mismatch' | 'unreadable';

/** Lado máximo analizado: las imágenes grandes se reducen para que la lectura sea rápida. */
const MAX_DECODE_SIZE = 1024;

async function loadDrawable(blob: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  if (blob.type.includes('svg')) {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  }
  const bitmap = await createImageBitmap(blob);
  return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
}

export async function decodeImage(blob: Blob): Promise<string | null> {
  const [{ default: jsQR }, drawable] = await Promise.all([import('jsqr'), loadDrawable(blob)]);
  try {
    const scale = Math.min(1, MAX_DECODE_SIZE / Math.max(drawable.width, drawable.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(drawable.width * scale);
    canvas.height = Math.round(drawable.height * scale);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('El navegador no permite analizar la imagen.');
    context.drawImage(drawable.source, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
  } finally {
    drawable.release();
  }
}

export async function verifyImage(blob: Blob, expected: string): Promise<VerifyOutcome> {
  const decoded = await decodeImage(blob);
  if (decoded === null) return 'unreadable';
  return decoded === expected ? 'match' : 'mismatch';
}
