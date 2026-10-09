import { describe, expect, it } from 'vitest';
import { escapeVCard, vcardFormat } from './vcard';
import type { BuildResult, FormValues } from './types';

function payload(result: BuildResult) {
  if (!result.ok) throw new Error(`Se esperaba válido: ${JSON.stringify(result.errors)}`);
  return result.payload;
}

const values = (overrides: FormValues): FormValues => ({ ...vcardFormat.defaults, ...overrides });

describe('escapeVCard', () => {
  it('escapa \\ , ; y saltos de línea', () => {
    expect(escapeVCard('a\\b,c;d\ne\r\nf')).toBe('a\\\\b\\,c\\;d\\ne\\nf');
  });
});

describe('vCard 3.0', () => {
  it('contacto mínimo', () => {
    expect(payload(vcardFormat.build(values({ firstName: 'Ana', lastName: 'Pérez' })))).toBe(
      ['BEGIN:VCARD', 'VERSION:3.0', 'N:Pérez;Ana;;;', 'FN:Ana Pérez', 'END:VCARD'].join('\r\n'),
    );
  });

  it('contacto completo en el orden esperado y con CRLF', () => {
    const result = vcardFormat.build(
      values({
        firstName: 'Ana María',
        lastName: 'Gómez, Ruiz',
        phone: '+57 300 123-4567',
        email: 'ana@ejemplo.com',
        org: 'Universidad; Sede Pasto',
        title: 'Docente',
        website: 'ejemplo.com',
        city: 'Pasto',
        country: 'Colombia',
        note: 'Línea 1\nLínea 2',
      }),
    );
    expect(payload(result)).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Gómez\\, Ruiz;Ana María;;;',
        'FN:Ana María Gómez\\, Ruiz',
        'ORG:Universidad\\; Sede Pasto',
        'TITLE:Docente',
        'TEL;TYPE=CELL:+573001234567',
        'EMAIL;TYPE=INTERNET:ana@ejemplo.com',
        'URL:https://ejemplo.com',
        'ADR;TYPE=WORK:;;;Pasto;;;Colombia',
        'NOTE:Línea 1\\nLínea 2',
        'END:VCARD',
      ].join('\r\n'),
    );
  });

  it('acepta solo organización y la usa como nombre visible', () => {
    const result = payload(vcardFormat.build(values({ org: 'VicMan QR' })));
    expect(result).toContain('FN:VicMan QR');
    expect(result).toContain('N:;;;;');
  });

  it('valida nombre, teléfono, correo y web', () => {
    const empty = vcardFormat.build(values({}));
    expect(!empty.ok && empty.errors.firstName).toBeTruthy();
    const bad = vcardFormat.build(
      values({ firstName: 'Ana', phone: 'abc', email: 'ana@', website: 'javascript:alert(1)' }),
    );
    expect(!bad.ok && bad.errors.phone).toBeTruthy();
    expect(!bad.ok && bad.errors.email).toBeTruthy();
    expect(!bad.ok && bad.errors.website).toBeTruthy();
  });

  it('nombra el archivo con el nombre del contacto', () => {
    expect(vcardFormat.fileName(values({ firstName: 'Ana', lastName: 'Pérez' }))).toBe('qr-contacto-ana-perez');
  });
});
