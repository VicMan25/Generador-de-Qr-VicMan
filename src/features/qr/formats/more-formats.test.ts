import { describe, expect, it } from 'vitest';
import { addDays, addMinutes, escapeICal, eventFormat } from './event';
import { locationFormat, parseCoordinates } from './location';
import { smsFormat } from './sms';
import { buildSocial, socialFormat } from './social';
import type { BuildResult, FormValues } from './types';

function payload(result: BuildResult) {
  if (!result.ok) throw new Error(`Se esperaba válido: ${JSON.stringify(result.errors)}`);
  return result.payload;
}

function errors(result: BuildResult) {
  if (result.ok) throw new Error(`Se esperaba inválido: ${result.payload}`);
  return result.errors;
}

describe('ubicación', () => {
  const loc = (overrides: FormValues) => locationFormat.build({ ...locationFormat.defaults, ...overrides });

  it('Google Maps con coordenadas', () => {
    expect(payload(loc({ latitude: '1.2136', longitude: '-77.2811' }))).toBe(
      'https://www.google.com/maps/search/?api=1&query=1.2136%2C-77.2811',
    );
  });

  it('acepta coma decimal y el par pegado en latitud', () => {
    expect(parseCoordinates('1,2136', '-77,2811')).toEqual({ lat: '1.2136', lng: '-77.2811' });
    expect(parseCoordinates('1.2136, -77.2811', '')).toEqual({ lat: '1.2136', lng: '-77.2811' });
    expect(parseCoordinates('1.2136,-77.2811', '')).toEqual({ lat: '1.2136', lng: '-77.2811' });
    expect(payload(loc({ latitude: '4.711 -74.0721' }))).toContain('query=4.711%2C-74.0721');
  });

  it('formato geo: con y sin nombre', () => {
    expect(payload(loc({ mode: 'geo', latitude: '1.2136', longitude: '-77.2811' }))).toBe('geo:1.2136,-77.2811');
    expect(payload(loc({ mode: 'geo', latitude: '1.2136', longitude: '-77.2811', label: 'Plaza de Nariño' }))).toBe(
      'geo:1.2136,-77.2811?q=1.2136,-77.2811(Plaza%20de%20Nari%C3%B1o)',
    );
  });

  it('búsqueda por dirección', () => {
    expect(payload(loc({ mode: 'address', address: 'Universidad Mariana, Pasto' }))).toBe(
      'https://www.google.com/maps/search/?api=1&query=Universidad%20Mariana%2C%20Pasto',
    );
    expect(errors(loc({ mode: 'address', address: ' ' })).address).toBeTruthy();
  });

  it('valida rangos y formato', () => {
    expect(errors(loc({ latitude: '91', longitude: '0' })).latitude).toMatch(/-90 y 90/);
    expect(errors(loc({ latitude: '0', longitude: '-180.5' })).longitude).toMatch(/-180 y 180/);
    expect(errors(loc({ latitude: 'norte', longitude: '0' })).latitude).toBeTruthy();
    expect(errors(loc({ latitude: '', longitude: '' })).longitude).toBeTruthy();
  });
});

describe('evento (iCalendar)', () => {
  const ev = (overrides: FormValues) => eventFormat.build({ ...eventFormat.defaults, ...overrides });

  it('evento con hora: fin por defecto una hora después', () => {
    expect(payload(ev({ title: 'Feria de Ciencias', startDate: '2026-10-20', startTime: '14:30' }))).toBe(
      ['BEGIN:VEVENT', 'SUMMARY:Feria de Ciencias', 'DTSTART:20261020T143000', 'DTEND:20261020T153000', 'END:VEVENT'].join(
        '\r\n',
      ),
    );
  });

  it('evento completo con escape de texto', () => {
    const result = ev({
      title: 'Taller; nivel 1, básico',
      startDate: '2026-10-20',
      startTime: '09:00',
      endDate: '2026-10-21',
      endTime: '12:00',
      location: 'Aula 3, Bloque B',
      description: 'Traer portátil\nCupos limitados',
    });
    expect(payload(result)).toBe(
      [
        'BEGIN:VEVENT',
        'SUMMARY:Taller\\; nivel 1\\, básico',
        'DTSTART:20261020T090000',
        'DTEND:20261021T120000',
        'LOCATION:Aula 3\\, Bloque B',
        'DESCRIPTION:Traer portátil\\nCupos limitados',
        'END:VEVENT',
      ].join('\r\n'),
    );
  });

  it('evento de todo el día: DTEND exclusivo', () => {
    const oneDay = payload(ev({ title: 'Día libre', allDay: true, startDate: '2026-12-31' }));
    expect(oneDay).toContain('DTSTART;VALUE=DATE:20261231');
    expect(oneDay).toContain('DTEND;VALUE=DATE:20270101');
    const twoDays = payload(ev({ title: 'Congreso', allDay: true, startDate: '2026-02-28', endDate: '2026-03-01' }));
    expect(twoDays).toContain('DTEND;VALUE=DATE:20260302');
  });

  it('cruza la medianoche al sumar la hora por defecto', () => {
    expect(addMinutes('2026-12-31', '23:30', 60)).toEqual(['2027-01-01', '00:30']);
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('valida campos obligatorios, fechas imposibles y el orden', () => {
    const empty = errors(ev({}));
    expect(empty.title && empty.startDate && empty.startTime).toBeTruthy();
    expect(errors(ev({ title: 'X', startDate: '2026-02-30', startTime: '10:00' })).startDate).toBeTruthy();
    expect(
      errors(ev({ title: 'X', startDate: '2026-10-20', startTime: '10:00', endTime: '09:00' })).endTime,
    ).toBeTruthy();
    expect(
      errors(ev({ title: 'X', startDate: '2026-10-20', startTime: '10:00', endDate: '2026-10-19' })).endDate,
    ).toBeTruthy();
    expect(errors(ev({ title: 'X', allDay: true, startDate: '2026-10-20', endDate: '2026-10-19' })).endDate).toBeTruthy();
  });

  it('escapeICal', () => {
    expect(escapeICal('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });
});

describe('SMS (SMSTO)', () => {
  it('con y sin mensaje', () => {
    expect(payload(smsFormat.build({ country: '57', number: '300 123 4567', message: '' }))).toBe('SMSTO:+573001234567:');
    expect(payload(smsFormat.build({ country: '57', number: '3001234567', message: 'INSCRIBIR: 2026 ñ' }))).toBe(
      'SMSTO:+573001234567:INSCRIBIR: 2026 ñ',
    );
  });

  it('valida el número', () => {
    expect(errors(smsFormat.build({ country: '57', number: 'abc', message: '' })).number).toBeTruthy();
  });

  it('nombra el archivo con el número', () => {
    expect(smsFormat.fileName({ country: '57', number: '3001234567' })).toBe('qr-sms-573001234567');
  });
});

describe('redes sociales', () => {
  it('construye el enlace del perfil, con o sin @', () => {
    expect(payload(buildSocial('instagram', '@mi.cuenta'))).toBe('https://www.instagram.com/mi.cuenta/');
    expect(payload(buildSocial('tiktok', 'mi.cuenta'))).toBe('https://www.tiktok.com/@mi.cuenta');
    expect(payload(buildSocial('x', '@VicMan_QR'))).toBe('https://x.com/VicMan_QR');
    expect(payload(buildSocial('linkedin', 'ana-perez-123'))).toBe('https://www.linkedin.com/in/ana-perez-123/');
    expect(payload(buildSocial('youtube', 'canal'))).toBe('https://www.youtube.com/@canal');
    expect(payload(buildSocial('github', 'octocat'))).toBe('https://github.com/octocat');
    expect(payload(buildSocial('telegram', 'vicman_qr'))).toBe('https://t.me/vicman_qr');
  });

  it('un usuario con punto no se confunde con un enlace', () => {
    expect(payload(buildSocial('instagram', 'juan.me'))).toBe('https://www.instagram.com/juan.me/');
  });

  it('acepta el enlace completo si es de la red elegida', () => {
    expect(payload(buildSocial('instagram', 'https://www.instagram.com/mi.cuenta/'))).toBe(
      'https://www.instagram.com/mi.cuenta/',
    );
    expect(payload(buildSocial('x', 'twitter.com/usuario'))).toBe('https://twitter.com/usuario');
    expect(errors(buildSocial('instagram', 'https://www.tiktok.com/@otro')).username).toMatch(/no es de Instagram/);
  });

  it('rechaza usuarios vacíos o con espacios y símbolos', () => {
    expect(errors(buildSocial('instagram', '')).username).toBeTruthy();
    expect(errors(buildSocial('instagram', 'mi cuenta')).username).toBeTruthy();
    expect(errors(buildSocial('x', 'nombre-demasiado-largo-para-x')).username).toBeTruthy();
  });

  it('nombra el archivo con red y usuario', () => {
    expect(socialFormat.fileName({ network: 'instagram', username: '@Mi.Cuenta' })).toBe('qr-instagram-mi-cuenta');
  });
});
