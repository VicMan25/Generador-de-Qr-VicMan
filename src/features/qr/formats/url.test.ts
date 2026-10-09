import { describe, expect, it } from 'vitest';
import { buildUrl, urlFormat } from './url';

function payloadOf(input: string) {
  const result = buildUrl(input);
  if (!result.ok) throw new Error(`Se esperaba válido: ${input} → ${JSON.stringify(result.errors)}`);
  return result.payload;
}

function errorOf(input: string) {
  const result = buildUrl(input);
  if (result.ok) throw new Error(`Se esperaba inválido: ${input}`);
  return result.errors.url;
}

describe('buildUrl', () => {
  it('codifica exactamente la dirección escrita', () => {
    expect(payloadOf('https://ejemplo.com/ruta?a=1&b=dos#seccion')).toBe('https://ejemplo.com/ruta?a=1&b=dos#seccion');
    expect(payloadOf('http://ejemplo.com')).toBe('http://ejemplo.com');
  });

  it('no reescribe mayúsculas, rutas ni caracteres internacionales', () => {
    expect(payloadOf('https://es.wikipedia.org/wiki/Código_QR')).toBe('https://es.wikipedia.org/wiki/Código_QR');
    expect(payloadOf('HTTPS://Ejemplo.COM/Ruta')).toBe('HTTPS://Ejemplo.COM/Ruta');
  });

  it('elimina espacios alrededor', () => {
    expect(payloadOf('  https://ejemplo.com  ')).toBe('https://ejemplo.com');
  });

  it('añade https:// cuando falta y lo avisa', () => {
    const result = buildUrl('ejemplo.com/pagina');
    expect(result.ok && result.payload).toBe('https://ejemplo.com/pagina');
    expect(result.notices.some((n) => n.text.includes('https://'))).toBe(true);
    expect(payloadOf('www.ejemplo.co')).toBe('https://www.ejemplo.co');
  });

  it('no confunde un puerto con un esquema', () => {
    expect(payloadOf('ejemplo.com:8080/panel')).toBe('https://ejemplo.com:8080/panel');
  });

  it('rechaza contenido vacío', () => {
    expect(errorOf('')).toMatch(/Escribe/);
    expect(errorOf('   ')).toMatch(/Escribe/);
  });

  it('rechaza esquemas peligrosos o ajenos', () => {
    expect(errorOf('javascript:alert(1)')).toMatch(/http/);
    expect(errorOf('data:text/html,hola')).toMatch(/http/);
    expect(errorOf('file:///C:/secreto.txt')).toMatch(/http/);
    expect(errorOf('ftp://ejemplo.com')).toMatch(/http/);
  });

  it('sugiere el tipo adecuado para correos y teléfonos', () => {
    expect(errorOf('mailto:a@b.com')).toMatch(/Correo/);
    expect(errorOf('tel:+573001234567')).toMatch(/Teléfono/);
  });

  it('rechaza direcciones mal formadas', () => {
    expect(errorOf('https://mi sitio.com')).toMatch(/espacios/);
    expect(errorOf('https:ejemplo.com')).toMatch(/\/\//);
    expect(errorOf('ejemplo')).toMatch(/dominio/);
    expect(errorOf('https://')).toBeTruthy();
  });

  it('advierte sobre http, direcciones locales y credenciales', () => {
    const http = buildUrl('http://ejemplo.com');
    expect(http.notices.some((n) => n.tone === 'warning' && n.text.includes('http://'))).toBe(true);

    const local = buildUrl('http://localhost:5173');
    expect(local.ok).toBe(true);
    expect(local.notices.some((n) => n.text.includes('local'))).toBe(true);

    const credentials = buildUrl('https://usuario:clave@ejemplo.com');
    expect(credentials.notices.some((n) => n.text.includes('contraseña'))).toBe(true);
  });
});

describe('urlFormat.fileName', () => {
  it('usa el dominio sin www', () => {
    expect(urlFormat.fileName({ url: 'https://www.Ejemplo.com/x' })).toBe('qr-enlace-ejemplo-com');
  });

  it('tiene un nombre por defecto si el enlace no es válido', () => {
    expect(urlFormat.fileName({ url: '' })).toBe('qr-enlace');
  });
});
