import { buildFileName } from '../../../utils/filename';
import { buildUrl } from './url';
import { readString, type Notice, type QrFormatDefinition } from './types';

/**
 * Documento o archivo mediante su enlace público.
 * Un QR guarda como máximo unos 3 KB: contiene la dirección del archivo, nunca el archivo.
 * Sin servidor propio no se puede alojar el archivo ni comprobar que el enlace sea público.
 */

const FILE_TYPES: { label: string; extensions: string[] }[] = [
  { label: 'PDF', extensions: ['pdf'] },
  { label: 'imagen', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic'] },
  { label: 'documento de texto', extensions: ['doc', 'docx', 'odt', 'rtf', 'txt'] },
  { label: 'hoja de cálculo', extensions: ['xls', 'xlsx', 'ods', 'csv'] },
  { label: 'presentación', extensions: ['ppt', 'pptx', 'odp', 'key'] },
  { label: 'audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] },
  { label: 'video', extensions: ['mp4', 'mov', 'webm', 'avi'] },
  { label: 'archivo comprimido', extensions: ['zip', 'rar', '7z'] },
];

const PROVIDERS: { test: (host: string) => boolean; notice: string }[] = [
  {
    test: (host) => host === 'drive.google.com' || host === 'docs.google.com',
    notice:
      'Google Drive: en «Compartir» → «Acceso general», elige «Cualquier persona con el enlace». Si queda en «Restringido», quien escanee verá una solicitud de acceso.',
  },
  {
    test: (host) => host.endsWith('dropbox.com') || host === 'db.tt',
    notice: 'Dropbox: crea el enlace desde «Compartir» → «Copiar enlace». Los enlaces de la barra de direcciones no son públicos.',
  },
  {
    test: (host) => host === 'onedrive.live.com' || host === '1drv.ms' || host.endsWith('sharepoint.com'),
    notice:
      'OneDrive: elige «Cualquier persona con el vínculo». Las cuentas de trabajo o universidad pueden exigir iniciar sesión aunque compartas el enlace.',
  },
  {
    test: (host) => host === 'github.com' || host === 'raw.githubusercontent.com',
    notice: 'GitHub: el repositorio debe ser público para que el archivo se vea sin iniciar sesión.',
  },
];

/** Tipo de archivo según la extensión del enlace, si la tiene. */
export function detectFileType(url: string): string | null {
  let path: string;
  try {
    path = new URL(url).pathname.toLowerCase();
  } catch {
    return null;
  }
  const extension = /\.([a-z0-9]{2,5})$/.exec(path)?.[1];
  if (!extension) return null;
  return FILE_TYPES.find((type) => type.extensions.includes(extension))?.label ?? null;
}

export const fileLinkFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'url',
      label: 'Enlace público del archivo',
      kind: 'url',
      placeholder: 'https://drive.google.com/file/d/…',
      required: true,
      hint: 'Pega el enlace para compartir que te da tu servicio de almacenamiento.',
    },
  ],
  defaults: { url: '' },
  notices: [
    {
      tone: 'info',
      text: 'El código contiene el enlace, no el archivo. Si borras el archivo o cambias sus permisos, el QR dejará de funcionar.',
    },
    {
      tone: 'warning',
      text: 'Desde aquí no podemos comprobar si el enlace es público. Ábrelo en una ventana de incógnito: si se ve sin iniciar sesión, funcionará al escanearlo.',
    },
  ],
  build(values) {
    const result = buildUrl(readString(values, 'url'));
    if (!result.ok) return result;

    const notices: Notice[] = [...result.notices];
    const host = new URL(result.payload).hostname.toLowerCase();
    const provider = PROVIDERS.find((item) => item.test(host));
    if (provider) notices.push({ tone: 'info', text: provider.notice });

    const type = detectFileType(result.payload);
    if (type) notices.push({ tone: 'info', text: `Tipo de archivo detectado: ${type}.` });

    return { ok: true, payload: result.payload, notices };
  },
  fileName(values) {
    const result = buildUrl(readString(values, 'url'));
    if (!result.ok) return buildFileName('archivo');
    const lastSegment = new URL(result.payload).pathname.split('/').filter(Boolean).pop() ?? '';
    if (!/\.[a-z0-9]{2,5}$/i.test(lastSegment)) return buildFileName('archivo');
    let name = lastSegment;
    try {
      name = decodeURIComponent(lastSegment);
    } catch {
      // Secuencia % inválida: se usa el segmento sin decodificar.
    }
    return buildFileName('archivo', name.replace(/\.[^.]+$/, ''));
  },
  guide: {
    title: '¿Cómo obtener un enlace público a tu archivo?',
    steps: [
      'Sube el archivo a un servicio de almacenamiento que ya uses (Google Drive, OneDrive, Dropbox…) o a tu sitio web.',
      'Usa la opción «Compartir» y permite el acceso a «cualquier persona con el enlace».',
      'Copia ese enlace, pégalo aquí y comprueba que se abre en una ventana de incógnito.',
    ],
    tips: [
      {
        title: '¿Por qué no puedo subir el archivo aquí?',
        text: 'VicMan QR funciona sin servidores para proteger tu privacidad, así que no aloja archivos. El archivo debe vivir en un servicio que tú controles.',
      },
      {
        title: '¿Por qué no meter el archivo dentro del QR?',
        text: 'Un código QR guarda como máximo unos 3 KB. Un PDF o una foto pesan cientos o miles de veces más.',
      },
    ],
  },
};
