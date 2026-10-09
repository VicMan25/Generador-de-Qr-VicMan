import { buildFileName } from '../../../utils/filename';
import { buildUrl } from './url';
import { readString, type BuildResult, type QrFormatDefinition } from './types';

/**
 * Enlace al perfil en una red social a partir del nombre de usuario.
 * Un QR contiene un único enlace: para varios perfiles se necesita una página que los reúna.
 */

interface Network {
  value: string;
  label: string;
  domains: string[];
  profile: (user: string) => string;
  /** Formato admitido del nombre de usuario. */
  pattern: RegExp;
}

export const SOCIAL_NETWORKS: Network[] = [
  {
    value: 'instagram',
    label: 'Instagram',
    domains: ['instagram.com'],
    profile: (u) => `https://www.instagram.com/${u}/`,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    domains: ['tiktok.com'],
    profile: (u) => `https://www.tiktok.com/@${u}`,
    pattern: /^[A-Za-z0-9._]{2,24}$/,
  },
  {
    value: 'facebook',
    label: 'Facebook',
    domains: ['facebook.com', 'fb.com'],
    profile: (u) => `https://www.facebook.com/${u}`,
    pattern: /^[A-Za-z0-9.]{5,50}$/,
  },
  {
    value: 'x',
    label: 'X (Twitter)',
    domains: ['x.com', 'twitter.com'],
    profile: (u) => `https://x.com/${u}`,
    pattern: /^[A-Za-z0-9_]{1,15}$/,
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    domains: ['linkedin.com'],
    profile: (u) => `https://www.linkedin.com/in/${u}/`,
    pattern: /^[A-Za-z0-9-]{3,100}$/,
  },
  {
    value: 'youtube',
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be'],
    profile: (u) => `https://www.youtube.com/@${u}`,
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
  },
  {
    value: 'threads',
    label: 'Threads',
    domains: ['threads.com', 'threads.net'],
    profile: (u) => `https://www.threads.com/@${u}`,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
  },
  {
    value: 'telegram',
    label: 'Telegram',
    domains: ['t.me', 'telegram.me'],
    profile: (u) => `https://t.me/${u}`,
    pattern: /^[A-Za-z0-9_]{5,32}$/,
  },
  {
    value: 'github',
    label: 'GitHub',
    domains: ['github.com'],
    profile: (u) => `https://github.com/${u}`,
    pattern: /^[A-Za-z0-9-]{1,39}$/,
  },
];

const findNetwork = (value: string) => SOCIAL_NETWORKS.find((network) => network.value === value) ?? SOCIAL_NETWORKS[0];

const belongsTo = (host: string, network: Network) =>
  network.domains.some((domain) => host === domain || host.endsWith(`.${domain}`));

export function buildSocial(networkValue: string, input: string): BuildResult {
  const network = findNetwork(networkValue);
  const raw = input.trim();
  const fail = (message: string): BuildResult => ({ ok: false, errors: { username: message }, notices: [] });

  if (!raw) return fail(`Escribe tu usuario de ${network.label}.`);

  // Si pegan el enlace completo del perfil, se usa tal cual cuando pertenece a la red elegida.
  const lower = raw.toLowerCase();
  const looksLikeUrl = raw.includes('/') || SOCIAL_NETWORKS.some((n) => n.domains.some((d) => lower.includes(d)));
  if (looksLikeUrl) {
    const url = buildUrl(raw);
    if (!url.ok) return fail(url.errors.url ?? 'El enlace no es válido.');
    const host = new URL(url.payload).hostname.toLowerCase();
    if (!belongsTo(host, network)) return fail(`El enlace no es de ${network.label}. Revisa la red elegida.`);
    return { ok: true, payload: url.payload, notices: url.notices };
  }

  const user = raw.replace(/^@/, '');
  if (!network.pattern.test(user)) {
    return fail(`Ese nombre de usuario no tiene el formato de ${network.label}. Revisa que no tenga espacios ni símbolos.`);
  }
  return { ok: true, payload: network.profile(user), notices: [] };
}

export const socialFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'network',
      label: 'Red social',
      kind: 'select',
      options: SOCIAL_NETWORKS.map(({ value, label }) => ({ value, label })),
    },
    {
      name: 'username',
      label: 'Usuario o enlace del perfil',
      kind: 'text',
      placeholder: '@miusuario',
      required: true,
      hint: 'Escribe tu usuario (con o sin @) o pega el enlace completo de tu perfil.',
    },
  ],
  defaults: { network: 'instagram', username: '' },
  notices: [
    {
      tone: 'info',
      text: 'Un código QR contiene un solo enlace. Para reunir varias redes, crea una página de enlaces en un servicio que elijas y genera el QR con su dirección (tipo «Enlace web»).',
    },
  ],
  build: (values) => buildSocial(readString(values, 'network'), readString(values, 'username')),
  fileName(values) {
    const network = findNetwork(readString(values, 'network'));
    const user = readString(values, 'username').trim().replace(/^@/, '');
    return buildFileName(network.value, user.includes('/') ? '' : user);
  },
};
