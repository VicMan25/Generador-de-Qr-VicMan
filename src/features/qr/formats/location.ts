import { buildFileName } from '../../../utils/filename';
import { readString, type FieldErrors, type FormValues, type QrFormatDefinition } from './types';

/**
 * Ubicación geográfica. Tres variantes:
 * - `maps`: enlace de Google Maps a unas coordenadas. Funciona en cualquier teléfono (recomendado).
 * - `address`: enlace de Google Maps que busca una dirección o un lugar.
 * - `geo`: URI estándar `geo:lat,lng` (RFC 5870). Lo abren las apps de mapas en Android; iOS no lo reconoce.
 */

export const LOCATION_MODES = [
  { value: 'maps', label: 'Coordenadas · Google Maps (recomendado)' },
  { value: 'address', label: 'Dirección o lugar · Google Maps' },
  { value: 'geo', label: 'Coordenadas · formato geo: (Android)' },
] as const;

const MAPS_SEARCH = 'https://www.google.com/maps/search/?api=1&query=';
const NUMBER_RE = /^[+-]?\d{1,3}(\.\d+)?$/;

const usesCoordinates = (values: FormValues) => values.mode !== 'address';

/** Admite coma decimal (1,2136) y el par «lat, lng» pegado en el campo de latitud. */
export function parseCoordinates(latInput: string, lngInput: string): { lat: string; lng: string } {
  let lat = latInput.trim();
  let lng = lngInput.trim();
  const pair = /^([+-]?\d+(?:[.,]\d+)?)\s*[,;\s]\s*([+-]?\d+(?:[.,]\d+)?)$/.exec(lat);
  if (!lng && pair && /[;\s]|\.\d+,|,\s/.test(lat)) {
    lat = pair[1];
    lng = pair[2];
  }
  return { lat: lat.replace(',', '.'), lng: lng.replace(',', '.') };
}

function validateCoordinate(value: string, limit: number, name: string): string | null {
  if (!value) return `Escribe la ${name}.`;
  if (!NUMBER_RE.test(value)) return `La ${name} debe ser un número decimal, p. ej. 1.2136`;
  if (Math.abs(Number(value)) > limit) return `La ${name} debe estar entre -${limit} y ${limit}.`;
  return null;
}

export const locationFormat: QrFormatDefinition = {
  fields: [
    { name: 'mode', label: 'Tipo de enlace', kind: 'select', options: LOCATION_MODES },
    {
      name: 'latitude',
      label: 'Latitud',
      kind: 'text',
      placeholder: '1.2136',
      width: 'half',
      required: true,
      hint: 'Puedes pegar «latitud, longitud» aquí.',
      visibleWhen: usesCoordinates,
    },
    {
      name: 'longitude',
      label: 'Longitud',
      kind: 'text',
      placeholder: '-77.2811',
      width: 'half',
      required: true,
      visibleWhen: usesCoordinates,
    },
    {
      name: 'address',
      label: 'Dirección o nombre del lugar',
      kind: 'text',
      placeholder: 'Universidad Mariana, Pasto',
      required: true,
      visibleWhen: (values) => values.mode === 'address',
    },
    {
      name: 'label',
      label: 'Nombre del lugar',
      kind: 'text',
      placeholder: 'Opcional',
      hint: 'Solo lo muestran algunas apps de mapas en Android.',
      visibleWhen: (values) => values.mode === 'geo',
    },
  ],
  defaults: { mode: 'maps', latitude: '', longitude: '', address: '', label: '' },
  notices: [
    {
      tone: 'info',
      text: 'Al escanear un enlace de Google Maps, el teléfono abre ese servicio. Generar el código no envía nada a Google.',
    },
  ],
  build(values) {
    const mode = readString(values, 'mode') || 'maps';

    if (mode === 'address') {
      const address = readString(values, 'address').trim();
      if (!address) return { ok: false, errors: { address: 'Escribe una dirección o el nombre del lugar.' }, notices: [] };
      return { ok: true, payload: `${MAPS_SEARCH}${encodeURIComponent(address)}`, notices: [] };
    }

    const { lat, lng } = parseCoordinates(readString(values, 'latitude'), readString(values, 'longitude'));
    const errors: FieldErrors = {};
    const latError = validateCoordinate(lat, 90, 'latitud');
    const lngError = validateCoordinate(lng, 180, 'longitud');
    if (latError) errors.latitude = latError;
    if (lngError) errors.longitude = lngError;
    if (Object.keys(errors).length) return { ok: false, errors, notices: [] };

    if (mode === 'geo') {
      const label = readString(values, 'label').trim();
      const query = label ? `?q=${lat},${lng}(${encodeURIComponent(label)})` : '';
      return {
        ok: true,
        payload: `geo:${lat},${lng}${query}`,
        notices: [{ tone: 'warning', text: 'El formato geo: no lo abre la cámara de iPhone. Para todos los teléfonos, usa Google Maps.' }],
      };
    }

    return { ok: true, payload: `${MAPS_SEARCH}${lat}%2C${lng}`, notices: [] };
  },
  fileName(values) {
    if (values.mode === 'address') return buildFileName('ubicacion', readString(values, 'address'));
    const { lat, lng } = parseCoordinates(readString(values, 'latitude'), readString(values, 'longitude'));
    return buildFileName('ubicacion', readString(values, 'label') || `${lat} ${lng}`);
  },
  guide: {
    title: '¿Cómo obtengo las coordenadas de un lugar?',
    steps: [
      'Abre Google Maps (web o app) y busca el lugar.',
      'En el computador, haz clic derecho sobre el punto exacto; en el teléfono, mantén pulsado hasta que aparezca un marcador.',
      'Copia los números que aparecen (p. ej. «1.2136, -77.2811») y pégalos en el campo Latitud.',
    ],
    tips: [
      {
        title: '¿Coordenadas o dirección?',
        text: 'Las coordenadas llevan siempre al punto exacto. Una dirección depende de cómo la interprete el buscador de mapas.',
      },
    ],
  },
};
