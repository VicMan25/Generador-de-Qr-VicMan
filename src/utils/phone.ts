/** Indicativos más usados en la región. El valor son solo los dígitos del código de país. */
export const COUNTRY_CODES = [
  { value: '57', label: 'Colombia (+57)' },
  { value: '52', label: 'México (+52)' },
  { value: '54', label: 'Argentina (+54)' },
  { value: '56', label: 'Chile (+56)' },
  { value: '51', label: 'Perú (+51)' },
  { value: '593', label: 'Ecuador (+593)' },
  { value: '58', label: 'Venezuela (+58)' },
  { value: '591', label: 'Bolivia (+591)' },
  { value: '595', label: 'Paraguay (+595)' },
  { value: '598', label: 'Uruguay (+598)' },
  { value: '55', label: 'Brasil (+55)' },
  { value: '506', label: 'Costa Rica (+506)' },
  { value: '507', label: 'Panamá (+507)' },
  { value: '502', label: 'Guatemala (+502)' },
  { value: '503', label: 'El Salvador (+503)' },
  { value: '504', label: 'Honduras (+504)' },
  { value: '505', label: 'Nicaragua (+505)' },
  { value: '53', label: 'Cuba (+53)' },
  { value: '1', label: 'EE. UU., Canadá, R. Dominicana, P. Rico (+1)' },
  { value: '34', label: 'España (+34)' },
  { value: '351', label: 'Portugal (+351)' },
  { value: '33', label: 'Francia (+33)' },
  { value: '39', label: 'Italia (+39)' },
  { value: '49', label: 'Alemania (+49)' },
  { value: '44', label: 'Reino Unido (+44)' },
] as const;

export const DEFAULT_COUNTRY_CODE = '57';

export type PhoneResult = { ok: true; digits: string } | { ok: false; error: string };

/**
 * Combina indicativo y número en formato internacional (solo dígitos, sin "+").
 * Si el número ya empieza por "+" o "00", se usa tal cual e ignora el indicativo elegido.
 * Admite espacios, guiones, puntos y paréntesis como separadores.
 */
export function normalizePhone(countryCode: string, input: string): PhoneResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: 'Escribe el número de teléfono.' };
  if (!/^\+?[\d\s\-.()]+$/.test(raw)) {
    return { ok: false, error: 'Usa solo números. Puedes separarlos con espacios o guiones.' };
  }

  const digits = raw.replace(/\D/g, '');
  let international: string;
  if (raw.startsWith('+')) international = digits;
  else if (digits.startsWith('00')) international = digits.slice(2);
  else international = `${countryCode}${digits}`;

  const national = international.length - (raw.startsWith('+') || digits.startsWith('00') ? 0 : countryCode.length);
  if (national < 4) return { ok: false, error: 'El número es demasiado corto.' };
  // E.164: máximo 15 dígitos incluyendo el indicativo.
  if (international.length > 15) return { ok: false, error: 'El número es demasiado largo para un teléfono internacional.' };

  return { ok: true, digits: international };
}
