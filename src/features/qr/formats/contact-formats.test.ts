import { describe, expect, it } from 'vitest';
import { normalizePhone } from '../../../utils/phone';
import { emailFormat } from './email';
import { phoneFormat } from './phone';
import { whatsappFormat } from './whatsapp';
import type { BuildResult } from './types';

function payload(result: BuildResult) {
  if (!result.ok) throw new Error(`Se esperaba válido: ${JSON.stringify(result.errors)}`);
  return result.payload;
}

function errors(result: BuildResult) {
  if (result.ok) throw new Error(`Se esperaba inválido: ${result.payload}`);
  return result.errors;
}

describe('normalizePhone', () => {
  it('antepone el indicativo y quita separadores', () => {
    expect(normalizePhone('57', '300 123-4567')).toEqual({ ok: true, digits: '573001234567' });
    expect(normalizePhone('57', '(300) 123.45.67')).toEqual({ ok: true, digits: '573001234567' });
  });

  it('respeta un número que ya trae + o 00', () => {
    expect(normalizePhone('57', '+34 612 345 678')).toEqual({ ok: true, digits: '34612345678' });
    expect(normalizePhone('57', '0034 612 345 678')).toEqual({ ok: true, digits: '34612345678' });
  });

  it('rechaza letras, números vacíos, cortos o demasiado largos', () => {
    expect(normalizePhone('57', '').ok).toBe(false);
    expect(normalizePhone('57', '300-ABC').ok).toBe(false);
    expect(normalizePhone('57', '123').ok).toBe(false);
    expect(normalizePhone('57', '+1234567890123456').ok).toBe(false);
  });
});

describe('correo (mailto)', () => {
  it('solo destinatario', () => {
    expect(payload(emailFormat.build({ to: 'ana@ejemplo.com', subject: '', body: '' }))).toBe('mailto:ana@ejemplo.com');
  });

  it('codifica asunto y mensaje, con saltos de línea como %0D%0A', () => {
    const result = emailFormat.build({
      to: 'ana@ejemplo.com',
      subject: 'Inscripción & dudas?',
      body: 'Hola Ana,\n¿Cómo estás?',
    });
    expect(payload(result)).toBe(
      'mailto:ana@ejemplo.com?subject=Inscripci%C3%B3n%20%26%20dudas%3F&body=Hola%20Ana%2C%0D%0A%C2%BFC%C3%B3mo%20est%C3%A1s%3F',
    );
  });

  it('omite el mensaje si solo tiene espacios y quita saltos del asunto', () => {
    const result = emailFormat.build({ to: 'a@b.co', subject: 'Uno\nDos', body: '  \n ' });
    expect(payload(result)).toBe('mailto:a@b.co?subject=Uno%20Dos');
  });

  it('valida el destinatario', () => {
    expect(errors(emailFormat.build({ to: '' })).to).toBeTruthy();
    expect(errors(emailFormat.build({ to: 'ana@ejemplo' })).to).toBeTruthy();
    expect(errors(emailFormat.build({ to: 'ana ejemplo.com' })).to).toBeTruthy();
    expect(errors(emailFormat.build({ to: 'ana?x=1@ejemplo.com' })).to).toBeTruthy();
  });
});

describe('teléfono (tel:)', () => {
  it('genera el número internacional', () => {
    expect(payload(phoneFormat.build({ country: '57', number: '300 123 4567' }))).toBe('tel:+573001234567');
    expect(payload(phoneFormat.build({ country: '52', number: '55 1234 5678' }))).toBe('tel:+525512345678');
  });

  it('nombra el archivo con el número', () => {
    expect(phoneFormat.fileName({ country: '57', number: '3001234567' })).toBe('qr-telefono-573001234567');
  });

  it('marca el error en el campo del número', () => {
    expect(errors(phoneFormat.build({ country: '57', number: '' })).number).toBeTruthy();
  });
});

describe('WhatsApp (wa.me)', () => {
  it('sin mensaje', () => {
    expect(payload(whatsappFormat.build({ country: '57', number: '300 123 4567', message: '' }))).toBe(
      'https://wa.me/573001234567',
    );
  });

  it('con mensaje codificado: tildes, emojis, saltos de línea y símbolos', () => {
    const result = whatsappFormat.build({ country: '57', number: '3001234567', message: 'Hola 👋\n¿Precio & envío?' });
    expect(payload(result)).toBe(
      'https://wa.me/573001234567?text=Hola%20%F0%9F%91%8B%0A%C2%BFPrecio%20%26%20env%C3%ADo%3F',
    );
  });

  it('acepta números de otro país escritos con +', () => {
    expect(payload(whatsappFormat.build({ country: '57', number: '+1 (415) 555-0100', message: '' }))).toBe(
      'https://wa.me/14155550100',
    );
  });
});
