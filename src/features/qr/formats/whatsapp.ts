import { buildFileName } from '../../../utils/filename';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, normalizePhone } from '../../../utils/phone';
import { readString, type QrFormatDefinition } from './types';

/**
 * Enlace oficial `https://wa.me/<número>?text=<mensaje>`.
 * El número va en formato internacional, solo dígitos y sin "+".
 */
export const whatsappFormat: QrFormatDefinition = {
  fields: [
    { name: 'country', label: 'Indicativo', kind: 'select', options: COUNTRY_CODES, width: 'half' },
    {
      name: 'number',
      label: 'Número de WhatsApp',
      kind: 'tel',
      placeholder: '300 123 4567',
      required: true,
      width: 'half',
      autoComplete: 'tel-national',
    },
    {
      name: 'message',
      label: 'Mensaje predefinido',
      kind: 'textarea',
      placeholder: 'Opcional. Ej.: Hola, quiero más información.',
      rows: 3,
    },
  ],
  defaults: { country: DEFAULT_COUNTRY_CODE, number: '', message: '' },
  notices: [
    {
      tone: 'info',
      text: 'Abre un chat con ese número en WhatsApp (o en WhatsApp Web si la app no está instalada). El mensaje queda escrito, pero no se envía solo.',
    },
  ],
  build(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    if (!result.ok) return { ok: false, errors: { number: result.error }, notices: [] };
    const message = readString(values, 'message');
    const query = message.trim() ? `?text=${encodeURIComponent(message)}` : '';
    return { ok: true, payload: `https://wa.me/${result.digits}${query}`, notices: [] };
  },
  fileName(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    return buildFileName('whatsapp', result.ok ? result.digits : '');
  },
};
