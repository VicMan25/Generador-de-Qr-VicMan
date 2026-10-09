const encoder = new TextEncoder();

/** Número de bytes que ocupa el texto en UTF-8 (lo que realmente se guarda en el QR). */
export function utf8Length(text: string): number {
  return encoder.encode(text).length;
}

/**
 * Convierte un texto en una "cadena binaria" donde cada carácter representa un byte UTF-8.
 *
 * qr-code-styling convierte el texto a bytes con `charCode & 255`, lo que corrompe emojis
 * y cualquier carácter fuera de Latin-1. Entregándole los bytes UTF-8 ya calculados,
 * el código contiene exactamente el texto original.
 */
export function toUtf8BinaryString(text: string): string {
  let binary = '';
  for (const byte of encoder.encode(text)) binary += String.fromCharCode(byte);
  return binary;
}
