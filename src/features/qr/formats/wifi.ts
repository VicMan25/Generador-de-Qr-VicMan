import { buildFileName } from '../../../utils/filename';
import { utf8Length } from '../../../utils/bytes';
import { readBoolean, readString, type FieldErrors, type Notice, type QrFormatDefinition } from './types';

/**
 * Formato de red inalámbrica: `WIFI:T:<tipo>;S:<nombre>;P:<clave>;H:true;;`
 * Es el formato que reconocen las cámaras de iOS (11+) y Android (10+).
 */

export const WIFI_SECURITY = [
  { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
  { value: 'WEP', label: 'WEP (antiguo)' },
  { value: 'nopass', label: 'Sin contraseña (red abierta)' },
] as const;

/** Escapa los caracteres especiales del formato: \ ; , : " */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function buildWifiPayload(ssid: string, security: string, password: string, hidden: boolean): string {
  const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`];
  if (security !== 'nopass') parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

const hasPassword = (values: Record<string, unknown>) => values.security !== 'nopass';

export const wifiFormat: QrFormatDefinition = {
  fields: [
    {
      name: 'ssid',
      label: 'Nombre de la red (SSID)',
      kind: 'text',
      placeholder: 'MiCasa_5G',
      required: true,
      hint: 'Escríbelo exactamente igual, respetando mayúsculas y espacios.',
    },
    { name: 'security', label: 'Seguridad', kind: 'select', options: WIFI_SECURITY },
    {
      name: 'password',
      label: 'Contraseña',
      kind: 'password',
      required: true,
      autoComplete: 'off',
      visibleWhen: hasPassword,
    },
    { name: 'hidden', label: 'Es una red oculta (no aparece en la lista de redes)', kind: 'checkbox' },
  ],
  defaults: { ssid: '', security: 'WPA', password: '', hidden: false },
  notices: [
    {
      tone: 'info',
      text: 'Compatible con la cámara de iOS 11+ y Android 10+. En computadores no suele funcionar.',
    },
  ],
  build(values) {
    const ssid = readString(values, 'ssid');
    const security = readString(values, 'security') || 'WPA';
    const password = readString(values, 'password');
    const hidden = readBoolean(values, 'hidden');
    const errors: FieldErrors = {};
    const notices: Notice[] = [];

    if (security !== 'nopass') {
      notices.push({
        tone: 'warning',
        text: 'La contraseña queda dentro del código en texto legible: cualquiera que lo escanee o lo fotografíe puede verla. Compártelo solo donde corresponda.',
      });
    }

    if (!ssid.trim()) errors.ssid = 'Escribe el nombre de la red.';
    else if (utf8Length(ssid) > 32) errors.ssid = 'El nombre de una red Wi-Fi tiene como máximo 32 bytes.';

    if (security === 'WPA') {
      if (!password) errors.password = 'Escribe la contraseña de la red.';
      else if (password.length < 8 || password.length > 63) {
        errors.password = 'Las contraseñas WPA tienen entre 8 y 63 caracteres.';
      }
    } else if (security === 'WEP') {
      if (!password) errors.password = 'Escribe la contraseña de la red.';
      else if (![5, 10, 13, 26].includes(password.length)) {
        notices.push({
          tone: 'warning',
          text: 'Las claves WEP suelen tener 5 o 13 caracteres (o 10 o 26 hexadecimales). Revisa que sea correcta.',
        });
      }
    }

    if (ssid !== ssid.trim()) {
      notices.push({ tone: 'warning', text: 'El nombre de la red empieza o termina con espacios. Verifica que sea así.' });
    }

    if (Object.keys(errors).length) return { ok: false, errors, notices };
    return { ok: true, payload: buildWifiPayload(ssid, security, password, hidden), notices };
  },
  fileName: (values) => buildFileName('wifi', readString(values, 'ssid')),
};
