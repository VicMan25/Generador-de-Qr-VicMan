/**
 * Validación práctica de correo: algo@dominio.extensión, sin espacios.
 * Excluye `? & # %`, que romperían un enlace `mailto:` y no aparecen en direcciones reales.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@?&#%]+@[^\s@?&#%]+\.[^\s@?&#%.]{2,}$/.test(value);
}
