# Pruebas y optimización (Fase 6)

Registro de lo verificado antes de publicar. Fecha: 9 de octubre de 2026.

## Pruebas automáticas — `npm test`

109 pruebas (Vitest) en 10 archivos:

| Archivo | Cubre |
|---|---|
| `formats/url.test.ts` | Normalización, esquemas peligrosos (`javascript:`, `data:`, `file:`), puertos, dominios, avisos |
| `formats/text.test.ts` | Texto exacto (espacios, saltos, emojis), HTML literal, nombres de archivo |
| `formats/contact-formats.test.ts` | Teléfono (E.164), correo (`mailto:` RFC 6068), WhatsApp (`wa.me`) |
| `formats/wifi.test.ts` | Escape `\ ; , : "`, redes abiertas y ocultas, longitudes WPA/WEP, SSID de 32 bytes |
| `formats/vcard.test.ts` | vCard 3.0 completa con CRLF, escape, validaciones |
| `formats/fileLink.test.ts` | Detección de tipo, avisos por servicio, nombres de archivo |
| `formats/more-formats.test.ts` | Ubicación (Google Maps, `geo:`, dirección, rangos), evento (iCalendar, todo el día, medianoche, fechas imposibles), SMS (`SMSTO:`), redes sociales (9 redes, enlaces pegados) |
| `design/design.test.ts` | Contraste WCAG, paletas, logotipo → nivel H, preferencias guardadas sin logotipo |
| `roundtrip.test.ts` | **Ida y vuelta** para los 12 tipos: codificar → dibujar → leer con jsQR → comparar; límite exacto de capacidad en L/M/Q/H |
| `utils/filename.test.ts` | Nombres de archivo seguros |

`qrcode-generator` está fijado en la versión 1.5.2, la misma que incluye `qr-code-styling`, para que las pruebas
reproduzcan exactamente la codificación de producción.

## Pruebas en navegador (Chrome, compilación de producción)

- **Los 12 tipos:** relleno y lectura verificada; descarga en PNG y SVG con nombre coherente (los 8 iniciales con
  descarga interceptada; ubicación, evento, SMS y redes sociales verificados en pantalla).
- **Validaciones:** contenido vacío, `javascript:`, capacidad superada (descarga bloqueada), avisos de `http://`, `localhost`.
- **Diseño:** paletas, formas, logotipo (fuerza H), contraste bajo/crítico (lectura fallida → descarga bloqueada), código invertido (aviso).
- **Preferencias:** se conservan al recargar, sin logotipo; «Restablecer diseño».
- **Responsive:** 360, 390, 768, 1366 px sin desplazamiento horizontal; barra móvil sin tapar el pie.
- **Teclado:** pestañas Contenido/Diseño con flechas, Inicio y Fin (patrón ARIA); radios nativos en las opciones;
  ningún control sin nombre accesible.
- **Privacidad:** registro de red durante el uso del generador con una contraseña Wi-Fi: solo peticiones `GET` a archivos
  estáticos propios. Ningún dato del usuario sale del navegador. Sin servicios externos (fuentes incluidas en el proyecto).
- **CSP:** con las mismas cabeceras que Vercel (`npm run preview` las aplica), sin violaciones: demostración, logotipo,
  verificación, exportación PNG y SVG, cambio de tema.

## Lighthouse 12.8 (compilación de producción, `npm run preview`)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Portada, móvil | 92 | 100 | 100 | 100 |
| Generador, móvil | 93 | 100 | 100 | 100 |
| Portada, escritorio | 100 | 100 | 100 | 100 |

Móvil (red 4G lenta simulada): FCP ≈ 2,5 s, LCP ≈ 2,7 s, TBT ≤ 30 ms, CLS ≤ 0,01.

## Optimización aplicada

| Cambio | Efecto |
|---|---|
| Generador como ruta diferida (`lazy`) y demostración de la portada con `React.lazy` | JS inicial: 140 → **115 KB gzip** |
| jsQR solo al verificar | 47 KB gzip fuera de la carga inicial |
| Espacio reservado para la demostración | Sin saltos de diseño (CLS ≈ 0) |
| Comprobación de lectura con retardo (250–300 ms) y reducida a ≤ 1024 px | Sin bloqueos al escribir o arrastrar un color |
| Caché `immutable` de un año para `/assets/*` | Visitas repetidas instantáneas |
| Fuentes emitidas como archivos (no `data:`) | Compatibles con `font-src 'self'` |

## Seguridad

- Cabeceras en `vercel.json`: `Content-Security-Policy` (sin scripts en línea ni orígenes externos),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- El script de tema está en `public/theme-init.js` para que la CSP no necesite `'unsafe-inline'` en scripts.
- `style-src 'unsafe-inline'` es necesario: React y `qr-code-styling` usan atributos `style`.
- Contenido del usuario siempre como texto (React escapa); nunca `dangerouslySetInnerHTML`.
- Logotipos rasterizados a PNG en el navegador: un SVG subido no conserva scripts.
- Página de error para fallos inesperados o módulos que no cargan (p. ej. tras una nueva publicación).

## Dependencias

Producción: `react`, `react-dom`, `react-router`, `qr-code-styling`, `jsqr`, `lucide-react` y 3 fuentes `@fontsource-variable`.
Desarrollo: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react(-dom)`, `vitest`, `qrcode-generator` (solo pruebas).
`npm audit`: 0 vulnerabilidades. Sin base de datos, backend ni claves.

## Pendiente de verificación manual

- Escanear con teléfonos reales (iOS y Android) los 12 tipos, en especial Wi-Fi, vCard con tildes, eventos
  (que se añadan a la hora correcta) y diseños con logotipo grande.
- jsQR es más tolerante que algunas cámaras: una lectura verificada es buena señal, no una garantía.
