import { buildFileName } from '../../../utils/filename';
import { readBoolean, readString, type FieldErrors, type FormValues, type QrFormatDefinition } from './types';

/**
 * Evento de calendario en formato iCalendar (RFC 5545), bloque `BEGIN:VEVENT` … `END:VEVENT`,
 * que es el que reconocen los lectores de QR. Las horas se guardan como "hora local flotante"
 * (sin zona horaria): el evento aparece a esa hora en el reloj de quien lo escanea.
 */

/** Escapa texto según RFC 5545: \ ; , y saltos de línea. */
export function escapeICal(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const compactDate = (date: string) => date.replace(/-/g, '');
const compactDateTime = (date: string, time: string) => `${compactDate(date)}T${time.replace(':', '')}00`;

/** Suma días a una fecha AAAA-MM-DD sin depender de la zona horaria. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const result = new Date(Date.UTC(y, m - 1, d + days));
  return result.toISOString().slice(0, 10);
}

/** Suma minutos a fecha + hora locales y devuelve [fecha, hora]. */
export function addMinutes(date: string, time: string, minutes: number): [string, string] {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const result = new Date(Date.UTC(y, m - 1, d, h, min + minutes));
  return [result.toISOString().slice(0, 10), result.toISOString().slice(11, 16)];
}

function isRealDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

const timed = (values: FormValues) => values.allDay !== true;

export const eventFormat: QrFormatDefinition = {
  fields: [
    { name: 'title', label: 'Título del evento', kind: 'text', placeholder: 'Feria de Ciencias 2026', required: true },
    { name: 'allDay', label: 'Evento de todo el día', kind: 'checkbox' },
    { name: 'startDate', label: 'Fecha de inicio', kind: 'date', required: true, width: 'half' },
    { name: 'startTime', label: 'Hora de inicio', kind: 'time', required: true, width: 'half', visibleWhen: timed },
    {
      name: 'endDate',
      label: 'Fecha de fin',
      kind: 'date',
      width: 'half',
      hint: 'Opcional. Si la dejas vacía, termina el mismo día.',
    },
    {
      name: 'endTime',
      label: 'Hora de fin',
      kind: 'time',
      width: 'half',
      hint: 'Opcional. Por defecto, una hora después.',
      visibleWhen: timed,
    },
    { name: 'location', label: 'Lugar', kind: 'text', placeholder: 'Opcional' },
    { name: 'description', label: 'Descripción', kind: 'textarea', rows: 3, placeholder: 'Opcional' },
  ],
  defaults: {
    title: '',
    allDay: false,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    description: '',
  },
  notices: [
    {
      tone: 'info',
      text: 'La cámara de iPhone y Google Lens ofrecen «Añadir al calendario». Algunos lectores solo muestran el texto del evento.',
    },
    {
      tone: 'info',
      text: 'La hora se guarda sin zona horaria: el evento aparece a esa hora local en el teléfono de quien lo escanea.',
    },
  ],
  build(values) {
    const title = readString(values, 'title').trim();
    const allDay = readBoolean(values, 'allDay');
    const startDate = readString(values, 'startDate');
    const startTime = readString(values, 'startTime');
    let endDate = readString(values, 'endDate');
    let endTime = readString(values, 'endTime');
    const location = readString(values, 'location').trim();
    const description = readString(values, 'description').trim();
    const errors: FieldErrors = {};

    if (!title) errors.title = 'Escribe el título del evento.';
    if (!isRealDate(startDate)) errors.startDate = 'Elige la fecha de inicio.';
    if (!allDay && !TIME_RE.test(startTime)) errors.startTime = 'Elige la hora de inicio.';
    if (endDate && !isRealDate(endDate)) errors.endDate = 'La fecha de fin no es válida.';
    if (!allDay && endTime && !TIME_RE.test(endTime)) errors.endTime = 'La hora de fin no es válida.';
    if (Object.keys(errors).length) return { ok: false, errors, notices: [] };

    const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeICal(title)}`];

    if (allDay) {
      const lastDay = endDate || startDate;
      if (lastDay < startDate) return { ok: false, errors: { endDate: 'El evento no puede terminar antes de empezar.' }, notices: [] };
      // En iCalendar, DTEND de un evento de día completo es el día siguiente al último (exclusivo).
      lines.push(`DTSTART;VALUE=DATE:${compactDate(startDate)}`, `DTEND;VALUE=DATE:${compactDate(addDays(lastDay, 1))}`);
    } else {
      // El error se marca en el campo que la persona escribió (los errores solo se muestran en campos usados).
      const errorField = endDate && endDate < startDate ? 'endDate' : 'endTime';
      if (!endDate && !endTime) [endDate, endTime] = addMinutes(startDate, startTime, 60);
      endDate ||= startDate;
      endTime ||= startTime;
      if (`${endDate}T${endTime}` <= `${startDate}T${startTime}`) {
        return { ok: false, errors: { [errorField]: 'El evento debe terminar después de empezar.' }, notices: [] };
      }
      lines.push(`DTSTART:${compactDateTime(startDate, startTime)}`, `DTEND:${compactDateTime(endDate, endTime)}`);
    }

    if (location) lines.push(`LOCATION:${escapeICal(location)}`);
    if (description) lines.push(`DESCRIPTION:${escapeICal(description)}`);
    lines.push('END:VEVENT');

    return { ok: true, payload: lines.join('\r\n'), notices: [] };
  },
  fileName: (values) => buildFileName('evento', readString(values, 'title')),
};
