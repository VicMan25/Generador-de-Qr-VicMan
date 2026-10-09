import { buildFileName } from '../../../utils/filename';
import { isValidEmail } from '../../../utils/validators';
import { readString, type FieldErrors, type QrFormatDefinition } from './types';

/**
 * Formato `mailto:` (RFC 6068). Es el más compatible: lo abren iOS, Android y los programas de correo.
 * Asunto y mensaje se codifican como parámetros; los saltos de línea del mensaje van como %0D%0A.
 */
export const emailFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'to',
      label: 'Correo del destinatario',
      kind: 'email',
      placeholder: 'nombre@ejemplo.com',
      required: true,
      autoComplete: 'email',
    },
    { name: 'subject', label: 'Asunto', kind: 'text', placeholder: 'Opcional' },
    { name: 'body', label: 'Mensaje', kind: 'textarea', placeholder: 'Opcional', rows: 4 },
  ],
  defaults: { to: '', subject: '', body: '' },
  notices: [
    {
      tone: 'info',
      text: 'Al escanearlo se abre la app de correo con el mensaje preparado. La persona decide si lo envía.',
    },
  ],
  build(values) {
    const to = readString(values, 'to').trim();
    const subject = readString(values, 'subject').replace(/[\r\n]+/g, ' ').trim();
    const body = readString(values, 'body').replace(/\r?\n/g, '\r\n');
    const errors: FieldErrors = {};

    if (!to) errors.to = 'Escribe el correo del destinatario.';
    else if (!isValidEmail(to)) errors.to = 'Revisa el correo: debe tener la forma nombre@dominio.com';
    if (Object.keys(errors).length) return { ok: false, errors, notices: [] };

    const params: string[] = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body.trim()) params.push(`body=${encodeURIComponent(body)}`);
    const payload = `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
    return { ok: true, payload, notices: [] };
  },
  fileName: (values) => buildFileName('correo', readString(values, 'to').split('@')[0] ?? ''),
};
