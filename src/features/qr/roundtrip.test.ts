/**
 * Pruebas de ida y vuelta: el texto se codifica igual que lo hace qr-code-styling
 * (qrcode-generator, modo byte, bytes UTF-8 precalculados), se dibuja como imagen,
 * se lee con jsQR y se compara con el original.
 */
import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import jsQR from 'jsqr';
import type { ErrorCorrectionLevel } from 'qr-code-styling';
import { toUtf8BinaryString, utf8Length } from '../../utils/bytes';
import { BYTE_CAPACITY } from './capacity';
import { DEFAULT_DESIGN } from './design/defaults';
import { buildUrl } from './formats/url';
import { textFormat } from './formats/text';
import { emailFormat } from './formats/email';
import { phoneFormat } from './formats/phone';
import { whatsappFormat } from './formats/whatsapp';
import { wifiFormat } from './formats/wifi';
import { vcardFormat } from './formats/vcard';
import { fileLinkFormat } from './formats/fileLink';
import { locationFormat } from './formats/location';
import { eventFormat } from './formats/event';
import { smsFormat } from './formats/sms';
import { socialFormat } from './formats/social';

function encodeAndDecode(payload: string, level: ErrorCorrectionLevel = DEFAULT_DESIGN.errorCorrection): string | null {
  const qr = qrcode(0, level);
  qr.addData(toUtf8BinaryString(payload), 'Byte');
  qr.make();

  const modules = qr.getModuleCount();
  const scale = 4;
  const quiet = 4;
  const size = (modules + quiet * 2) * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (!qr.isDark(row, col)) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const x = (col + quiet) * scale + dx;
          const y = (row + quiet) * scale + dy;
          const i = (y * size + x) * 4;
          pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
        }
      }
    }
  }

  return jsQR(pixels, size, size)?.data ?? null;
}

function payloadOf(result: ReturnType<typeof buildUrl>) {
  if (!result.ok) throw new Error('Contenido inválido en la prueba');
  return result.payload;
}

describe('ida y vuelta: lo leído es idéntico a lo introducido', () => {
  const urls = [
    'https://ejemplo.com',
    'ejemplo.com/ruta?utm_source=qr&id=42',
    'https://es.wikipedia.org/wiki/Código_QR',
    'https://www.umariana.edu.co/',
  ];

  it.each(urls)('URL: %s', (input) => {
    const payload = payloadOf(buildUrl(input));
    expect(encodeAndDecode(payload)).toBe(payload);
  });

  const texts = [
    'Hola mundo',
    'Ñandú, pingüino, acción: áéíóú ÁÉÍÓÚ ¿¡',
    'Emojis 🦜🎉👩🏽‍💻 y símbolos € ° ±',
    'Varias\nlíneas\n\ncon espacios   al final   ',
    '日本語のテキスト и кириллица',
    '1234567890',
    'MAYUSCULAS Y NUMEROS 123',
  ];

  it.each(texts)('Texto: %j', (text) => {
    const payload = payloadOf(textFormat.build({ text }));
    expect(encodeAndDecode(payload)).toBe(payload);
  });

  const structured = [
    ['Correo', emailFormat.build({ to: 'ana@ejemplo.com', subject: 'Inscripción', body: 'Hola,\n¿cómo estás? 😊' })],
    ['Teléfono', phoneFormat.build({ country: '57', number: '300 123 4567' })],
    ['WhatsApp', whatsappFormat.build({ country: '57', number: '3001234567', message: 'Hola 👋 ¿precio & envío?' })],
    ['Wi-Fi', wifiFormat.build({ ssid: 'Café;Wi-Fi, "5G"', security: 'WPA', password: 'a:b;c\\d,e"f', hidden: true })],
    [
      'vCard',
      vcardFormat.build({
        ...vcardFormat.defaults,
        firstName: 'Ana María',
        lastName: 'Gómez',
        phone: '+57 300 123 4567',
        email: 'ana@ejemplo.com',
        org: 'Universidad; Sede',
        note: 'Línea 1\nLínea 2',
      }),
    ],
    ['Archivo', fileLinkFormat.build({ url: 'https://drive.google.com/file/d/1AbC-xyz/view?usp=sharing' })],
    ['Ubicación', locationFormat.build({ ...locationFormat.defaults, latitude: '1.2136', longitude: '-77.2811' })],
    ['Ubicación geo:', locationFormat.build({ ...locationFormat.defaults, mode: 'geo', latitude: '1.2136', longitude: '-77.2811', label: 'Plaza de Nariño' })],
    [
      'Evento',
      eventFormat.build({
        ...eventFormat.defaults,
        title: 'Taller; nivel 1, básico 🎓',
        startDate: '2026-10-20',
        startTime: '09:00',
        location: 'Aula 3, Bloque B',
        description: 'Traer portátil\nCupos limitados',
      }),
    ],
    ['SMS', smsFormat.build({ country: '57', number: '3001234567', message: 'INSCRIBIR: 2026 ñ 😊' })],
    ['Red social', socialFormat.build({ network: 'instagram', username: '@mi.cuenta' })],
  ] as const;

  it.each(structured)('%s', (_label, result) => {
    const payload = payloadOf(result);
    expect(encodeAndDecode(payload)).toBe(payload);
  });

  it('el contenido justo en el límite de capacidad se genera y se lee', () => {
    const max = BYTE_CAPACITY[DEFAULT_DESIGN.errorCorrection];
    const text = 'a'.repeat(max - 4) + 'ñá'; // 2 caracteres de 2 bytes = max bytes
    expect(utf8Length(text)).toBe(max);
    expect(encodeAndDecode(text)).toBe(text);
  });

  it.each(['L', 'M', 'Q', 'H'] as const)('nivel de corrección %s: límite de capacidad exacto', (level) => {
    const max = BYTE_CAPACITY[level];
    const text = 'ñ'.repeat(Math.floor(max / 2)) + (max % 2 ? 'a' : '');
    expect(utf8Length(text)).toBe(max);
    expect(encodeAndDecode(text, level)).toBe(text);
    expect(() => encodeAndDecode(text + 'a', level)).toThrow();
  });

  it('el contenido que supera la capacidad no se puede codificar', () => {
    const max = BYTE_CAPACITY[DEFAULT_DESIGN.errorCorrection];
    expect(() => encodeAndDecode('a'.repeat(max + 1))).toThrow();
  });
});
