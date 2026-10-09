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
import { locationFormat } from './location';
import { eventFormat } from './event';
import { smsFormat } from './sms';
import { socialFormat } from './social';

/**
 * Registro central de tipos de QR.
 *
 * Cada tipo declara sus metadatos y su `definition` (campos, validación y codificación).
 * La interfaz (selector, tarjetas de la portada, rutas) se construye solo a partir de este registro:
 * para añadir un tipo basta con crear su archivo en esta carpeta y registrarlo aquí.
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

export type QrFormatGroup = 'essentials' | 'files' | 'more';

export interface QrFormatMeta {
  id: QrFormatId;
  label: string;
  description: string;
  icon: LucideIcon;
  group: QrFormatGroup;
  definition: QrFormatDefinition;
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
    description: 'Un punto en el mapa o una dirección que se abre en la app de mapas.',
    icon: MapPin,
    group: 'more',
    definition: locationFormat,
  },
  {
    id: 'event',
    label: 'Evento',
    description: 'Agrega una cita al calendario del dispositivo.',
    icon: CalendarDays,
    group: 'more',
    definition: eventFormat,
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Un mensaje de texto listo para enviar.',
    icon: MessageSquareText,
    group: 'more',
    definition: smsFormat,
  },
  {
    id: 'social',
    label: 'Redes sociales',
    description: 'El enlace a tu perfil de Instagram, TikTok, LinkedIn y más.',
    icon: Share2,
    group: 'more',
    definition: socialFormat,
  },
];

export const QR_GROUP_LABELS: Record<QrFormatGroup, string> = {
  essentials: 'Esenciales',
  files: 'Documentos y archivos',
  more: 'Más formatos',
};

export function getFormat(id: string | undefined): QrFormatMeta | undefined {
  return QR_FORMATS.find((format) => format.id === id);
}

export const DEFAULT_FORMAT_ID: QrFormatId = 'url';
