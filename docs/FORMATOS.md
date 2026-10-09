# Formatos de codificación

Qué contiene exactamente cada tipo de QR, cómo se valida y qué limitaciones de compatibilidad tiene.
El código de cada formato está en `src/features/qr/formats/` y sus pruebas junto a él (`*.test.ts`).

## Aspectos comunes

- **Modo byte con UTF-8.** Todo el contenido se codifica en modo byte con los bytes UTF-8 del texto.
  `qr-code-styling` convierte internamente cada carácter con `charCode & 255`, lo que corrompe
  tildes fuera de Latin-1 y emojis (comprobado: sin corrección, «Ñandú» y «🦜» se leen vacíos).
  Por eso se le entrega una cadena con los bytes UTF-8 ya calculados (`src/utils/bytes.ts`).
- **Corrección de errores:** nivel M (≈15 %) por defecto; el usuario puede elegir L, M, Q o H.
  Con logotipo se fuerza H (≈30 %) y la capacidad baja a 1273 bytes.
- **Capacidad máxima (modo byte, versión 40):** L 2953 · M 2331 · Q 1663 · H 1273 bytes.
  Se muestra un medidor; a partir de 500 bytes se advierte que el código es denso.
- **Verificación de lectura:** tras cada cambio de contenido o diseño y antes de cada descarga (PNG o SVG),
  la imagen generada se lee con jsQR y se compara con el contenido esperado. Si no coincide, la descarga no se
  realiza automáticamente. jsQR lee también códigos invertidos (claro sobre oscuro), por eso esos diseños
  muestran una advertencia aparte.
- **Pruebas de ida y vuelta** (`src/features/qr/roundtrip.test.ts`): codificar → dibujar → leer → comparar,
  con tildes, eñes, emojis, saltos de línea, alfabetos no latinos y el límite exacto de capacidad.

## Enlace web (URL)

| | |
|---|---|
| Contenido | La dirección tal como se escribió, p. ej. `https://ejemplo.com/ruta?x=1` |
| Normalización | Se quitan espacios alrededor. Si no hay esquema se antepone `https://` (y se avisa). No se reescriben mayúsculas, rutas ni caracteres internacionales. |
| Rechaza | Vacío; espacios internos; esquemas distintos de http/https (`javascript:`, `data:`, `file:`, `ftp:`, `mailto:`, `tel:`…); `https:` sin `//`; dominios sin extensión. |
| Avisa | `http://` sin cifrar; direcciones locales (`localhost`, `127.*`, `192.168.*`, `10.*`); usuario o contraseña dentro del enlace. |
| Archivo | `qr-enlace-<dominio>.png` |

**Limitaciones:** el QR no garantiza que el destino sea seguro ni que siga disponible; no se comprueba
que la dirección exista (sin backend, el navegador lo impide por CORS y además expondría la URL a terceros).

## Texto libre

| | |
|---|---|
| Contenido | El texto exacto: espacios, saltos de línea y emojis incluidos. |
| Rechaza | Vacío o solo espacios. |
| Archivo | `qr-texto-<primeras-palabras>.png` |

**Limitaciones:** algunos lectores antiguos interpretan el modo byte como ISO-8859-1 si no hay indicador ECI;
las cámaras actuales de iOS y Android detectan UTF-8 correctamente. Los textos largos generan códigos densos
que requieren imprimirse a mayor tamaño.

## Correo

| | |
|---|---|
| Contenido | `mailto:ana@ejemplo.com?subject=…&body=…` (RFC 6068) |
| Codificación | Asunto y mensaje con `encodeURIComponent`. Los saltos de línea del mensaje se convierten a `%0D%0A`; los del asunto, a espacios. Los parámetros vacíos se omiten. |
| Rechaza | Destinatario vacío o sin forma `nombre@dominio.ext`; direcciones con `? & # %`, que romperían el enlace. |
| Archivo | `qr-correo-<usuario>.png` |

**Limitaciones:** abre la app de correo con el mensaje preparado; no lo envía. Algunos lectores de QR de terceros
muestran el texto en vez de abrir el correo. Se descartó el formato MATMSG por su menor compatibilidad.

## Teléfono

| | |
|---|---|
| Contenido | `tel:+573001234567` |
| Normalización | Indicativo elegido + número sin separadores. Si el número empieza por `+` o `00`, se usa tal cual. |
| Rechaza | Letras; menos de 4 dígitos nacionales; más de 15 dígitos en total (límite E.164). |
| Archivo | `qr-telefono-<número>.png` |

**Limitaciones:** abre la marcación con el número; la llamada no se inicia sola. En computadores puede no hacer nada.
No se valida la numeración de cada país (p. ej. si un móvil colombiano tiene 10 dígitos).

## WhatsApp

| | |
|---|---|
| Contenido | `https://wa.me/573001234567?text=Hola%20…` |
| Normalización | Igual que Teléfono, sin el `+`. El mensaje se codifica con `encodeURIComponent` (tildes, emojis, saltos de línea). |
| Archivo | `qr-whatsapp-<número>.png` |

**Limitaciones:** no se puede comprobar que el número tenga WhatsApp. Si la app no está instalada, se abre
WhatsApp Web. En Argentina, los móviles requieren un `9` tras el indicativo (`+54 9 …`); se debe escribir
el número completo con `+`.

## Wi-Fi

| | |
|---|---|
| Contenido | `WIFI:T:WPA;S:<nombre>;P:<clave>;H:true;;` |
| Escape | `\ ; , : "` se anteponen con `\`. Ej.: `Café;5G` → `S:Café\;5G`. |
| Seguridad | `WPA` (cubre WPA, WPA2 y WPA3), `WEP`, `nopass` (sin `P:`). `H:true` solo si la red está oculta. |
| Rechaza | Nombre vacío o de más de 32 bytes; clave WPA fuera de 8–63 caracteres. Avisa de claves WEP con longitud inusual y de nombres con espacios al inicio o al final. |
| Archivo | `qr-wifi-<nombre>.png` |

**Limitaciones:** la contraseña queda legible dentro del código (se avisa). Lo leen las cámaras de iOS 11+ y
Android 10+; en computadores no suele funcionar. Las redes empresariales (WPA2-Enterprise, con usuario) no
están cubiertas porque su soporte en lectores es irregular. Un nombre de red formado solo por dígitos
hexadecimales podría interpretarse como hexadecimal en algunos lectores antiguos.

## Contacto (vCard)

| | |
|---|---|
| Contenido | vCard 3.0 (RFC 2426) con líneas separadas por CRLF |
| Propiedades | `N`, `FN`, `ORG`, `TITLE`, `TEL;TYPE=CELL`, `EMAIL;TYPE=INTERNET`, `URL`, `ADR;TYPE=WORK` (ciudad y país), `NOTE`. Solo se incluyen las que tienen valor. |
| Escape | `\` → `\\`, `,` → `\,`, `;` → `\;`, salto de línea → `\n`. |
| Rechaza | Sin nombre, apellidos ni organización; teléfono con letras; correo o web inválidos (la web usa la validación de URL). |
| Archivo | `qr-contacto-<nombre-apellidos>.png` |

**Limitaciones:** no se pliegan líneas largas (75 octetos); iOS y Android no lo necesitan. Se usa UTF-8 sin declarar
`CHARSET`, que las versiones actuales de iOS y Android interpretan bien. Cuantos más campos, más denso el código.

## Documento o archivo (por URL)

| | |
|---|---|
| Contenido | El enlace público del archivo (misma validación que Enlace web). |
| Ayudas | Detecta el tipo por la extensión (PDF, imagen, documento…), instrucciones específicas para Google Drive, Dropbox, OneDrive y GitHub, y una guía paso a paso. |
| Archivo | `qr-archivo-<nombre-del-archivo>.png` si el enlace lo incluye; si no, `qr-archivo.png`. |

**Limitaciones:** el QR contiene el enlace, no el archivo (máximo ≈3 KB). No se aloja ningún archivo y no se puede
comprobar si el enlace es público (sin servidor, CORS lo impide); se indica cómo verificarlo con una ventana de incógnito.

## Ubicación

| | |
|---|---|
| Contenido (recomendado) | `https://www.google.com/maps/search/?api=1&query=1.2136%2C-77.2811` |
| Dirección o lugar | `https://www.google.com/maps/search/?api=1&query=Universidad%20Mariana%2C%20Pasto` |
| Estándar | `geo:1.2136,-77.2811` (RFC 5870), con nombre opcional: `?q=1.2136,-77.2811(Plaza%20de%20Nari%C3%B1o)` |
| Entrada | Admite coma decimal (`1,2136`) y pegar el par «lat, lng» en el campo Latitud. |
| Rechaza | Latitud fuera de −90…90, longitud fuera de −180…180, valores no numéricos, dirección vacía. |
| Archivo | `qr-ubicacion-<nombre-o-coordenadas>.png` |

**Limitaciones:** `geo:` lo abren las apps de mapas en Android, pero la cámara de iPhone no; por eso el modo por defecto
es el enlace de Google Maps, que funciona en cualquier teléfono (abre la app o la web de Google Maps al escanear;
generar el código no contacta con Google). La búsqueda por dirección depende de cómo la interprete Google Maps.
No se ofrece «usar mi ubicación»: requeriría el permiso de geolocalización, que la política de seguridad del sitio
desactiva por privacidad.

## Evento

| | |
|---|---|
| Contenido | Bloque iCalendar (RFC 5545) `BEGIN:VEVENT` … `END:VEVENT` con CRLF |
| Propiedades | `SUMMARY`, `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION` (solo las que tienen valor). |
| Horas | Hora local «flotante» (`20261020T143000`, sin `Z`): el evento aparece a esa hora en el reloj de quien escanea. Sin hora de fin, dura 1 hora. |
| Todo el día | `DTSTART;VALUE=DATE:20261020` y `DTEND` = día siguiente al último (exclusivo, como exige el estándar). |
| Escape | `\` → `\`, `;` → `\;`, `,` → `\,`, salto de línea → `\n`. |
| Rechaza | Sin título o fecha de inicio; fechas imposibles (30 de febrero); fin anterior o igual al inicio. |
| Archivo | `qr-evento-<título>.png` |

**Limitaciones:** la cámara de iPhone y Google Lens ofrecen «Añadir al calendario»; otros lectores pueden mostrar
solo el texto. Sin zona horaria, un evento en línea con asistentes de otros países se verá a la misma hora local en
cada país. No se incluyen recordatorios ni repeticiones (no los soportan bien los lectores).

## SMS

| | |
|---|---|
| Contenido | `SMSTO:+573001234567:Mensaje` |
| Codificación | Número internacional como en Teléfono. El mensaje va tal cual (todo lo que sigue al segundo `:` es texto). Sin mensaje: `SMSTO:+57…:`. |
| Archivo | `qr-sms-<número>.png` |

**Limitaciones:** abre la app de mensajes con todo preparado; la persona decide si lo envía y el operador puede cobrarlo.
Se eligió `SMSTO:` frente a `sms:` (RFC 5724) porque es el formato más reconocido por lectores de QR, incluida la
cámara de iOS. Un SMS admite 160 caracteres GSM (70 si lleva tildes o emojis); más largo se divide en varios.

## Redes sociales

| | |
|---|---|
| Contenido | Enlace al perfil: Instagram, TikTok, Facebook, X, LinkedIn, YouTube, Threads, Telegram o GitHub. |
| Entrada | Usuario con o sin `@` (p. ej. `@mi.cuenta` → `https://www.instagram.com/mi.cuenta/`) o el enlace completo del perfil. |
| Rechaza | Usuario vacío, con espacios o con caracteres que esa red no permite; enlaces de otra red distinta de la elegida. |
| Archivo | `qr-<red>-<usuario>.png` |

**Limitaciones:** un código QR contiene un solo enlace. Para reunir varias redes hace falta una página que las agrupe
(un servicio de «enlaces en la biografía» o una web propia) y generar el QR con su dirección; VicMan QR no aloja esas
páginas. No se comprueba que el perfil exista. Los formatos de dirección de cada red pueden cambiar con el tiempo.

## Personalización y exportación

| Opción | Detalle |
|---|---|
| Colores | Módulos, esquinas y fondo (hexadecimal o selector). 6 paletas probadas. |
| Contraste | Razón WCAG entre el fondo y el color más claro del código. Aviso por debajo de 4:1; alerta crítica por debajo de 2,5:1; aviso aparte si el código es más claro que el fondo. |
| Formas | Módulos: cuadrados, redondeados, suaves, puntos, elegante, elegante suave. Esquinas: marco cuadrado, redondeado o circular; centro cuadrado o circular. |
| Logotipo | PNG, JPG, WEBP o SVG de hasta 2 MB. Se convierte localmente a PNG de máx. 512 px (un SVG subido no conserva scripts). Tamaños: 25 %, 35 % o 45 % del código; los módulos bajo la imagen se ocultan. |
| Exportación | PNG de 512, 1024, 2048 o 4096 px; SVG vectorial (el logotipo va embebido como PNG). |
| Preferencias | Diseño y exportación se recuerdan en `localStorage` (clave `vmqr-preferences`), sin el logotipo ni el contenido. Valores manipulados se descartan. |

**Limitaciones:** jsQR es más tolerante que algunas cámaras; una verificación correcta es una buena señal, no una
garantía absoluta. Para impresión, conviene probar el código final con el teléfono. Los degradados no se incluyeron
porque dificultan la lectura y complican el control de contraste.
