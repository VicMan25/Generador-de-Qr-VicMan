import { buildFileName } from '../../../utils/filename';
import { isValidEmail } from '../../../utils/validators';
import { buildUrl } from './url';
import { readString, type FieldErrors, type QrFormatDefinition } from './types';

/**
 * Tarjeta de contacto vCard 3.0 (RFC 2426), la versión con mejor compatibilidad en iOS y Android.
 * Líneas separadas por CRLF; los valores escapan \ , ; y los saltos de línea.
 */

export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n');
}

const PHONE_RE = /^\+?[\d\s\-.()]{4,}$/;

export const vcardFormat: QrFormatDefinition = {
  fields: [
    { name: 'firstName', label: 'Nombre', kind: 'text', width: 'half', autoComplete: 'given-name' },
    { name: 'lastName', label: 'Apellidos', kind: 'text', width: 'half', autoComplete: 'family-name' },
    {
      name: 'phone',
      label: 'Teléfono',
      kind: 'tel',
      width: 'half',
      placeholder: '+57 300 123 4567',
      hint: 'Incluye el indicativo (+57…) para que funcione desde cualquier país.',
    },
    { name: 'email', label: 'Correo', kind: 'email', width: 'half', placeholder: 'nombre@ejemplo.com' },
    { name: 'org', label: 'Empresa u organización', kind: 'text', width: 'half', autoComplete: 'organization' },
    { name: 'title', label: 'Cargo', kind: 'text', width: 'half', autoComplete: 'organization-title' },
    { name: 'website', label: 'Sitio web', kind: 'url', placeholder: 'ejemplo.com' },
    { name: 'city', label: 'Ciudad', kind: 'text', width: 'half' },
    { name: 'country', label: 'País', kind: 'text', width: 'half' },
    { name: 'note', label: 'Nota', kind: 'textarea', rows: 2, placeholder: 'Opcional' },
  ],
  defaults: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    org: '',
    title: '',
    website: '',
    city: '',
    country: '',
    note: '',
  },
  notices: [
    {
      tone: 'info',
      text: 'Al escanearlo, el teléfono ofrece guardar el contacto. Cuantos más campos completes, más denso será el código.',
    },
  ],
  build(values) {
    const get = (name: string) => readString(values, name).trim();
    const [firstName, lastName, phone, email, org, title, website, city, country] = [
      'firstName',
      'lastName',
      'phone',
      'email',
      'org',
      'title',
      'website',
      'city',
      'country',
    ].map(get);
    const note = readString(values, 'note').trim();
    const errors: FieldErrors = {};

    if (!firstName && !lastName && !org) {
      errors.firstName = 'Escribe al menos un nombre, unos apellidos o una organización.';
    }
    if (phone && !PHONE_RE.test(phone)) errors.phone = 'Usa solo números, espacios, guiones y el signo +.';
    if (email && !isValidEmail(email)) errors.email = 'Revisa el correo: debe tener la forma nombre@dominio.com';

    let url = '';
    if (website) {
      const result = buildUrl(website);
      if (result.ok) url = result.payload;
      else errors.website = result.errors.url ?? 'Revisa la dirección del sitio web.';
    }

    if (Object.keys(errors).length) return { ok: false, errors, notices: [] };

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || org;
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
      `FN:${escapeVCard(fullName)}`,
    ];
    if (org) lines.push(`ORG:${escapeVCard(org)}`);
    if (title) lines.push(`TITLE:${escapeVCard(title)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone.replace(/[^\d+]/g, '')}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    if (url) lines.push(`URL:${url}`);
    if (city || country) lines.push(`ADR;TYPE=WORK:;;;${escapeVCard(city)};;;${escapeVCard(country)}`);
    if (note) lines.push(`NOTE:${escapeVCard(note)}`);
    lines.push('END:VCARD');

    return { ok: true, payload: lines.join('\r\n'), notices: [] };
  },
  fileName(values) {
    const name = [readString(values, 'firstName'), readString(values, 'lastName')].join(' ').trim();
    return buildFileName('contacto', name || readString(values, 'org'));
  },
};
