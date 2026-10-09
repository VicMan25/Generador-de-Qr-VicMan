import { buildFileName } from '../../../utils/filename';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, normalizePhone } from '../../../utils/phone';
import { readString, type QrFormatDefinition } from './types';

/** Formato `tel:` con número internacional (E.164). */
export const phoneFormat: QrFormatDefinition = {
  fields: [
    { name: 'country', label: 'Indicativo', kind: 'select', options: COUNTRY_CODES, width: 'half' },
    {
      name: 'number',
      label: 'Número',
      kind: 'tel',
      placeholder: '300 123 4567',
      required: true,
      width: 'half',
      autoComplete: 'tel-national',
      hint: 'Si empiezas por +, se usa el número completo que escribas.',
    },
  ],
  defaults: { country: DEFAULT_COUNTRY_CODE, number: '' },
  notices: [
    {
      tone: 'info',
      text: 'En el teléfono abre la marcación con el número listo; la llamada no se inicia sola. En computadores puede no hacer nada.',
    },
  ],
  build(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    if (!result.ok) return { ok: false, errors: { number: result.error }, notices: [] };
    return { ok: true, payload: `tel:+${result.digits}`, notices: [] };
  },
  fileName(values) {
    const result = normalizePhone(readString(values, 'country'), readString(values, 'number'));
    return buildFileName('telefono', result.ok ? result.digits : '');
  },
};
