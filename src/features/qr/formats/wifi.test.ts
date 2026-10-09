import { describe, expect, it } from 'vitest';
import { escapeWifi, wifiFormat } from './wifi';
import type { BuildResult } from './types';

function payload(result: BuildResult) {
  if (!result.ok) throw new Error(`Se esperaba válido: ${JSON.stringify(result.errors)}`);
  return result.payload;
}

const base = { ssid: 'MiCasa', security: 'WPA', password: 'clave1234', hidden: false };

describe('escapeWifi', () => {
  it('escapa \\ ; , : y comillas', () => {
    expect(escapeWifi('a\\b;c,d:e"f')).toBe('a\\\\b\\;c\\,d\\:e\\"f');
  });
});

describe('Wi-Fi', () => {
  it('red WPA', () => {
    expect(payload(wifiFormat.build(base))).toBe('WIFI:T:WPA;S:MiCasa;P:clave1234;;');
  });

  it('red oculta', () => {
    expect(payload(wifiFormat.build({ ...base, hidden: true }))).toBe('WIFI:T:WPA;S:MiCasa;P:clave1234;H:true;;');
  });

  it('red abierta: sin contraseña aunque haya una escrita, y sin aviso de contraseña', () => {
    const result = wifiFormat.build({ ...base, security: 'nopass', password: 'ignorada' });
    expect(payload(result)).toBe('WIFI:T:nopass;S:MiCasa;;');
    expect(result.notices.some((n) => n.text.includes('contraseña'))).toBe(false);
    expect(wifiFormat.build(base).notices.some((n) => n.text.includes('contraseña queda'))).toBe(true);
  });

  it('escapa nombre y contraseña con caracteres especiales', () => {
    const result = wifiFormat.build({ ...base, ssid: 'Café;Wi-Fi, "5G"', password: 'a:b;c\\d,e"f' });
    expect(payload(result)).toBe('WIFI:T:WPA;S:Café\\;Wi-Fi\\, \\"5G\\";P:a\\:b\\;c\\\\d\\,e\\"f;;');
  });

  it('conserva espacios del nombre y avisa', () => {
    const result = wifiFormat.build({ ...base, ssid: ' Casa ' });
    expect(payload(result)).toBe('WIFI:T:WPA;S: Casa ;P:clave1234;;');
    expect(result.notices.some((n) => n.text.includes('espacios'))).toBe(true);
  });

  it('valida nombre y longitud de la contraseña WPA', () => {
    const empty = wifiFormat.build({ ...base, ssid: '  ' });
    expect(!empty.ok && empty.errors.ssid).toBeTruthy();
    const short = wifiFormat.build({ ...base, password: '1234567' });
    expect(!short.ok && short.errors.password).toBeTruthy();
    const long = wifiFormat.build({ ...base, password: 'x'.repeat(64) });
    expect(!long.ok && long.errors.password).toBeTruthy();
    const tooLongName = wifiFormat.build({ ...base, ssid: 'ñ'.repeat(17) }); // 34 bytes
    expect(!tooLongName.ok && tooLongName.errors.ssid).toBeTruthy();
  });

  it('WEP con longitud inusual genera, pero avisa', () => {
    const result = wifiFormat.build({ ...base, security: 'WEP', password: 'abc' });
    expect(payload(result)).toBe('WIFI:T:WEP;S:MiCasa;P:abc;;');
    expect(result.notices.some((n) => n.text.includes('WEP'))).toBe(true);
  });

  it('oculta el campo de contraseña en redes abiertas', () => {
    const passwordField = wifiFormat.fields.find((f) => f.name === 'password');
    expect(passwordField?.visibleWhen?.({ ...base, security: 'nopass' })).toBe(false);
    expect(passwordField?.visibleWhen?.(base)).toBe(true);
  });
});
