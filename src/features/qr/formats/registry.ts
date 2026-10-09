import {
  CalendarDays,
  Contact,
  FileText,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Share2,
  Type,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { QrFormatDefinition } from './types';
import { urlFormat } from './url';
import { textFormat } from './text';
import { emailFormat } from './email';
import { phoneFormat } from './phone';
import { whatsappFormat } from './whatsapp';
import { wifiFormat } from './wifi';
import { vcardFormat } from './vcard';
import { fileLinkFormat } from './fileLink';

/**
 * Registro central de tipos de QR.
 *
 * Cada tipo declara sus metadatos aquí. Los tipos operativos añaden `definition`
 * (campos, validación y codificación); los demás se muestran como "Próximamente".
 * La interfaz (selector, tarjetas de la portada, rutas) se construye solo a partir de este registro.
 */

export type QrFormatId =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'wifi'
  | 'vcard'
  | 'file'
  | 'location'
  | 'event'
  | 'sms'
  | 'social';

export type QrFormatGroup = 'essentials' | 'files' | 'upcoming';

export interface QrFormatMeta {
  id: QrFormatId;
  label: string;
  description: string;
  icon: LucideIcon;
  group: QrFormatGroup;
  /** Presente solo cuando el generador de este tipo está operativo. */
  definition?: QrFormatDefinition;
}

export const QR_FORMATS: readonly QrFormatMeta[] = [
  {
    id: 'url',
    label: 'Enlace web',
    description: 'Dirige a cualquier página, tienda, portafolio o formulario.',
    icon: Link2,
    group: 'essentials',
    definition: urlFormat,
  },
  {
    id: 'text',
    label: 'Texto libre',
    description: 'Un mensaje, una nota o un código que se lee sin conexión.',
    icon: Type,
    group: 'essentials',
    definition: textFormat,
  },
  {
    id: 'email',
    label: 'Correo',
    description: 'Prepara un correo con destinatario, asunto y mensaje.',
    icon: Mail,
    group: 'essentials',
    definition: emailFormat,
  },
  {
    id: 'phone',
    label: 'Teléfono',
    description: 'Inicia una llamada con un solo escaneo.',
    icon: Phone,
    group: 'essentials',
    definition: phoneFormat,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Abre un chat con un número y un mensaje opcional.',
    icon: MessageCircle,
    group: 'essentials',
    definition: whatsappFormat,
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    description: 'Comparte tu red sin dictar la contraseña.',
    icon: Wifi,
    group: 'essentials',
    definition: wifiFormat,
  },
  {
    id: 'vcard',
    label: 'Contacto',
    description: 'Una tarjeta de contacto lista para guardar en el teléfono.',
    icon: Contact,
    group: 'essentials',
    definition: vcardFormat,
  },
  {
    id: 'file',
    label: 'Documento o archivo',
    description: 'PDF, imagen u otro archivo publicado en la nube mediante su enlace.',
    icon: FileText,
    group: 'files',
    definition: fileLinkFormat,
  },
  {
    id: 'location',
    label: 'Ubicación',
    description: 'Coordenadas que se abren en la app de mapas.',
    icon: MapPin,
    group: 'upcoming',
  },
  {
    id: 'event',
    label: 'Evento',
    description: 'Agrega una cita al calendario del dispositivo.',
    icon: CalendarDays,
    group: 'upcoming',
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Un mensaje de texto listo para enviar.',
    icon: MessageSquareText,
    group: 'upcoming',
  },
  {
    id: 'social',
    label: 'Redes sociales',
    description: 'Tus perfiles en un único código.',
    icon: Share2,
    group: 'upcoming',
  },
];

export const QR_GROUP_LABELS: Record<QrFormatGroup, string> = {
  essentials: 'Esenciales',
  files: 'Documentos y archivos',
  upcoming: 'Más adelante',
};

export function getFormat(id: string | undefined): QrFormatMeta | undefined {
  return QR_FORMATS.find((format) => format.id === id);
}

export const DEFAULT_FORMAT_ID: QrFormatId = 'url';
