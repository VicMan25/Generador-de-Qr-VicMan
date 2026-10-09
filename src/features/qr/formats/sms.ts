import { buildFileName } from '../../../utils/filename';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, normalizePhone } from '../../../utils/phone';
import { readString, type QrFormatDefinition } from './types';

/**
 * Mensaje de texto en formato `SMSTO:<número>:<mensaje>`, el más extendido entre lectores de QR
 * (cámaras de iOS y Android incluidas). El mensaje va sin codificar: todo lo que sigue al segundo «:» es texto.
 */
export const smsFormat: QrFormatDefinition = {
  fields: [
    { name: 'country', label: 'Indicativo', kind: 'select', options: COUNTRY_CODES, width: 'half' },
    {
      name: 'number',
      label: 'Número de destino',
      kind: 'tel',
      placeholder: '300 123 4567',
      required: true,
      width: 'half',
      autoComplete: 'tel-national',
    },
    {
      name: 'message',
      label: 'Mensaje',
      kind: 'textarea',
      placeholder: 'Opcional. Ej.: INSCRIBIR 2026',
      rows: 3,
      hint: 'Un SMS admite 160 caracteres sin tildes ni emojis, o 70 si los incluye; más largo se divide en varios.',
    },
  ],
  defaults: { country: DEFAULT_COUNTRY_CODE, number: '', message: '' },
  notices: [
    {
      tone: 'info',
      text: 'Abre la app de mensajes con el número y el texto preparados. La persona decide si lo envía (y su operador puede cobrarlo).',
    },
  ],
  build(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    if (!result.ok) return { ok: false, errors: { number: result.error }, notices: [] };
    const message = readString(values, 'message').replace(/\r\n/g, '\n');
    return { ok: true, payload: `SMSTO:+${result.digits}:${message.trim() ? message : ''}`, notices: [] };
  },
  fileName(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    return buildFileName('sms', result.ok ? result.digits : '');
  },
};
