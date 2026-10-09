import { buildFileName } from '../../../utils/filename';
import { readString, type BuildResult, type Notice, type QrFormatDefinition } from './types';

/** Esquema al inicio del texto (`mailto:`, `https:`…). No confunde `dominio.com:8080` con un esquema. */
const SCHEME_RE = /^([a-z][a-z0-9+\-.]*):(?!\d)/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const TLD_RE = /\.[\p{L}0-9-]{2,}$/u;

const OTHER_TYPE_HINTS: Record<string, string> = {
  mailto: ' Para correos usa el tipo «Correo».',
  tel: ' Para llamadas usa el tipo «Teléfono».',
  wifi: ' Para redes inalámbricas usa el tipo «Wi-Fi».',
};

function fail(message: string): BuildResult {
  return { ok: false, errors: { url: message }, notices: [] };
}

export function buildUrl(input: string): BuildResult {
  const raw = input.trim();
  const notices: Notice[] = [];

  if (!raw) return fail('Escribe la dirección del enlace.');
  if (/\s/.test(raw)) return fail('El enlace no puede contener espacios. Revisa que hayas copiado solo la dirección.');

  let candidate = raw;
  const scheme = SCHEME_RE.exec(raw)?.[1]?.toLowerCase();

  if (!scheme) {
    candidate = `https://${raw}`;
    notices.push({ tone: 'info', text: 'Añadimos https:// al inicio del enlace.' });
  } else if (scheme !== 'http' && scheme !== 'https') {
    return fail(`Solo se admiten enlaces que empiecen por http:// o https://.${OTHER_TYPE_HINTS[scheme] ?? ''}`);
  } else if (!/^https?:\/\//i.test(raw)) {
    return fail(`Falta «//» después de «${scheme}:».`);
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return fail('La dirección no tiene un formato válido.');
  }

  const host = parsed.hostname;
  const isIp = IPV4_RE.test(host) || host.startsWith('[');
  const isLocal = host === 'localhost' || host.endsWith('.localhost');

  if (!host) return fail('Falta el dominio, por ejemplo: ejemplo.com');
  if (!isIp && !isLocal && !TLD_RE.test(host)) {
    return fail('El dominio parece incompleto. Debe incluir una extensión, por ejemplo: ejemplo.com');
  }

  if (isLocal || host.startsWith('127.') || host.startsWith('192.168.') || host.startsWith('10.')) {
    notices.push({
      tone: 'warning',
      text: 'Es una dirección local: solo abrirá en tu equipo o tu red, no desde cualquier teléfono.',
    });
  }
  if (parsed.username || parsed.password) {
    notices.push({
      tone: 'warning',
      text: 'El enlace incluye usuario o contraseña. Cualquiera que escanee el código podrá verlos.',
    });
  }
  if (parsed.protocol === 'http:') {
    notices.push({
      tone: 'warning',
      text: 'El enlace usa http:// (sin cifrar). Si el sitio lo admite, es preferible https://.',
    });
  }

  // Se codifica lo que escribió el usuario (con https:// si faltaba), sin reescribirlo.
  return { ok: true, payload: candidate, notices };
}

export const urlFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'url',
      label: 'Dirección del enlace',
      kind: 'url',
      placeholder: 'https://ejemplo.com/mi-pagina',
      hint: 'Puedes pegarla tal cual. Si no empieza por https://, lo añadimos.',
      required: true,
      autoComplete: 'url',
    },
  ],
  defaults: { url: '' },
  notices: [
    {
      tone: 'info',
      text: 'Un QR solo contiene la dirección: no garantiza que el sitio sea seguro ni que siga disponible en el futuro.',
    },
  ],
  build: (values) => buildUrl(readString(values, 'url')),
  fileName(values) {
    const result = buildUrl(readString(values, 'url'));
    if (!result.ok) return buildFileName('enlace');
    const host = new URL(result.payload).hostname.replace(/^www\./, '');
    return buildFileName('enlace', host);
  },
};
