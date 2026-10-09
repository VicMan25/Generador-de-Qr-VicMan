# VicMan QR

Estudio de códigos QR que funciona completamente en el navegador: sin registro, sin servidores y sin base de datos.

## Funcionalidades

- **8 tipos de QR:** enlace web, texto, correo, teléfono, WhatsApp, Wi-Fi, contacto (vCard 3.0) y documento por URL.
- **Validación en vivo** con mensajes claros y avisos de seguridad (esquemas peligrosos, `http://`, contraseñas legibles…).
- **Personalización:** colores con control de contraste, 6 estilos de módulos, esquinas, logotipo y nivel de corrección de errores.
- **Comprobación de lectura:** cada código se vuelve a leer en el navegador y se compara con el contenido antes de descargarlo.
- **Exportación** en PNG (512–4096 px) o SVG vectorial.
- **Privacidad:** todo se procesa localmente; solo se recuerdan preferencias de diseño, nunca el contenido.
- Diseño responsive con tema claro y oscuro.

## Tecnología

React 19 · TypeScript · Vite · React Router · CSS Modules · [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) ·
[jsQR](https://github.com/cozmo/jsQR) · Vitest. Despliegue estático en Vercel.

## Desarrollo

Requisitos: Node.js 24 (ver `.nvmrc`).

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm test           # pruebas (codificación y lectura de ida y vuelta)
npm run build      # comprobación de tipos + compilación en dist/
npm run preview    # sirve la compilación con las cabeceras de seguridad de Vercel
```

## Estructura

```
src/
├─ pages/              Portada, generador, privacidad, error y 404
├─ components/layout/  Cabecera, pie, marca y tema
├─ components/ui/      Botón, campo, color, opciones, avisos…
├─ features/qr/
│  ├─ formats/         Un archivo por tipo de QR (validar + codificar) y su registro
│  ├─ design/          Diseño por defecto, contraste y preferencias
│  ├─ export/          Generación de PNG/SVG y verificación de lectura
│  ├─ hooks/           Vista previa, comprobación y descarga
│  └─ components/      Formulario, panel de diseño, vista previa…
├─ utils/              Bytes UTF-8, teléfonos, contraste, imágenes, nombres de archivo
└─ styles/             Tokens del sistema visual y estilos globales
docs/                  Plan, formatos, pruebas y despliegue
public/brand/          Espacio para el logotipo oficial
```

Para añadir un tipo de QR (ubicación, SMS, evento…): crea su archivo en `src/features/qr/formats/`, con `fields`,
`build()` y `fileName()`, y asígnalo como `definition` en `registry.ts`. La interfaz se genera sola.

## Documentación

- [`docs/PLAN.md`](docs/PLAN.md) — decisiones de arquitectura.
- [`docs/FORMATOS.md`](docs/FORMATOS.md) — contenido exacto de cada tipo y limitaciones de compatibilidad.
- [`docs/PRUEBAS.md`](docs/PRUEBAS.md) — pruebas, Lighthouse, seguridad y dependencias.
- [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md) — publicación paso a paso en GitHub y Vercel.
