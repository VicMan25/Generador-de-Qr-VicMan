# VicMan QR — Plan aprobado

Registro de las decisiones aprobadas en la Fase 1. Antes de cada fase se revisa este documento;
cualquier cambio de tecnología o arquitectura se justifica y se anota aquí.

## Decisiones aprobadas

| # | Decisión |
|---|---|
| 1 | **TypeScript** en todo el proyecto. |
| 2 | **CSS Modules + variables CSS** (tokens en `src/styles/tokens.css`). Sin Tailwind. |
| 3 | Motor QR: **qr-code-styling** (PNG/SVG, estilos, logotipo). Verificación: **jsQR** con carga diferida. |
| 4 | Nombre provisional **VicMan QR**. Paleta tinta `#12141A` / papel `#F5F3EE` / lima `#D4FF3A` / azul `#3A4BFF`. |
| 5 | Interfaz solo en **español**; textos centralizados para facilitar una futura traducción. |
| 6 | Archivos locales: **solo asistente guiado**, sin botón de subida (no hay alojamiento). |
| 7 | Tipo **"Archivo por URL"** se implementa en la Fase 4. |

### Ajustes durante el desarrollo

| Fase | Cambio | Motivo |
|---|---|---|
| 3 | Comprobación de lectura (jsQR) adelantada de la Fase 5 a la 3 | Era la única forma de verificar que cada código contiene exactamente lo introducido. |
| 3 | El texto se entrega a `qr-code-styling` como bytes UTF-8 precalculados | La librería corrompía eñes fuera de Latin-1 y emojis. |
| 6 | Generador y demostración de portada cargados bajo demanda | JS inicial de 140 a 115 KB gzip. |
| 6 | Script de tema movido a `public/theme-init.js`; cabeceras CSP y de seguridad en `vercel.json` | Política CSP estricta sin scripts en línea. |
| 7 | Node 24.x (`engines` y `.nvmrc`) | React Router exige Node ≥ 22.22 y Vercel retiró Node 20 el 1/10/2026. |

## Estado

Las 7 fases están completas. Pendiente: pruebas manuales con teléfonos reales y la publicación con la cuenta del
autor (ver `docs/DESPLIEGUE.md`).

## Arquitectura

- SPA estática (React + Vite) desplegada en Vercel. Sin backend, sin base de datos, sin claves.
- Rutas: `/` (portada), `/crear/:tipo` (generador), `/privacidad`, `*` (404). `vercel.json` reescribe todo a `index.html`.
- **Registro de tipos** (`src/features/qr/formats/registry.ts`): cada tipo declara metadatos y, desde la Fase 3,
  `fields`, `validate()`, `encode()` y `fileName()`. La interfaz se construye a partir del registro.
- `encode()` son funciones puras con tests (Vitest) de ida y vuelta: codificar → decodificar → comparar.
- `localStorage` solo para preferencias (tema y, más adelante, estilo). Nunca contenido de los QR.

## Formatos de codificación

| Tipo | Contenido |
|---|---|
| URL | `https://…` (solo http/https) |
| Texto | UTF-8, con contador de bytes |
| Correo | `mailto:dir?subject=…&body=…` |
| Teléfono | `tel:+57…` |
| WhatsApp | `https://wa.me/57…?text=…` |
| Wi-Fi | `WIFI:T:WPA;S:…;P:…;H:false;;` (escapar `\ ; , : "`) |
| vCard | vCard 3.0, CRLF |
| Archivo | URL pública del archivo + guía de permisos |

## Limitación de archivos

Un QR guarda como máximo unos 3 KB: contiene el **enlace** al archivo, nunca el archivo. Sin backend
no se puede alojar ni comprobar que un enlace sea público (CORS). Se guía al usuario para publicar el archivo
en su propia nube y pegar el enlace.

## Criterios de aceptación

- **Fase 2:** compila sin errores; portada, esqueleto del generador, cabecera y pie; responsive en 360/768/1280/1920 px
  sin desplazamiento horizontal; modo oscuro; ningún botón sin función.
- **Fase 3:** URL y texto con validación, vista previa en vivo, descarga PNG, test de ida y vuelta, contador de capacidad,
  aviso de seguridad de URL.
- **Fase 4:** correo, teléfono, WhatsApp, Wi-Fi, vCard, archivo por URL; tests con casos límite; prueba con cámara real;
  `docs/FORMATOS.md`.
- **Fase 5:** colores, módulos, esquinas, logotipo, tamaño, restablecer; PNG y SVG; contraste; verificación de lectura.
- **Fase 6:** Lighthouse ≥ 90 (rendimiento y accesibilidad), teclado, ARIA, sin peticiones con datos del usuario,
  JS inicial ≤ ~150 KB gzip.
- **Fase 7:** `vercel.json`, README y `docs/DESPLIEGUE.md`; publicado en `*.vercel.app`.
