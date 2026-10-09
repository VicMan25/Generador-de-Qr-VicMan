import { buildFileName } from '../../../utils/filename';
import { readString, type QrFormatDefinition } from './types';

export const textFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'text',
      label: 'Texto',
      kind: 'textarea',
      placeholder: 'Escribe un mensaje, una nota, un código de acceso…',
      required: true,
      rows: 6,
      showByteCount: true,
    },
  ],
  defaults: { text: '' },
  notices: [
    {
      tone: 'info',
      text: 'El texto se guarda dentro del código y se lee sin conexión. Cuanto más largo, más denso será el QR.',
    },
  ],
  build(values) {
    const text = readString(values, 'text');
    if (!text.trim()) return { ok: false, errors: { text: 'Escribe el texto que quieres convertir.' }, notices: [] };
    // El texto se codifica exactamente como se escribió: espacios, saltos de línea y emojis incluidos.
    return { ok: true, payload: text, notices: [] };
  },
  fileName(values) {
    const firstWords = readString(values, 'text').trim().split(/\s+/).slice(0, 4).join(' ');
    return buildFileName('texto', firstWords);
  },
};
