/** Convierte un texto en un fragmento seguro para nombres de archivo: sin tildes, espacios ni símbolos. */
export function slugify(text: string, maxLength = 40): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}

/** Une partes en un nombre de archivo `qr-tipo-detalle`, omitiendo las vacías. */
export function buildFileName(...parts: string[]): string {
  return ['qr', ...parts.map((part) => slugify(part))].filter(Boolean).join('-');
}
