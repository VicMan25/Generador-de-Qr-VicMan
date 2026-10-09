# Publicación en GitHub y Vercel

Guía para publicar VicMan QR gratis, sin dominio propio, con el plan **Hobby** de Vercel.
Requisitos verificados el 9 de octubre de 2026 en la documentación de Vercel (enlaces al final).

## 0. Antes de empezar

| Necesitas | Detalle |
|---|---|
| Cuenta de GitHub | Gratuita: <https://github.com/signup> |
| Cuenta de Vercel (Hobby) | Gratuita; se crea con tu cuenta de GitHub. **El plan Hobby es solo para uso personal no comercial** (sin cobros, anuncios ni venta de productos). |
| Git | Ya instalado en este equipo (2.55). |
| Node.js 24 | Solo para desarrollar en local. Vercel usa Node **24.x**, fijado en `package.json` (`"engines": { "node": "24.x" }`) y en `.nvmrc`. |

El proyecto ya está preparado:

- `vercel.json` define el comando de compilación (`npm run build`), la carpeta de salida (`dist`), la redirección de rutas
  a `index.html` (para que `/crear/wifi` funcione al recargar) y las cabeceras de seguridad y caché.
- No hay variables de entorno, claves, base de datos ni funciones de servidor.
- El repositorio Git local ya existe con un primer commit en la rama `main`.

Comprobación local previa (opcional):

```bash
npm install
npm test          # 85 pruebas
npm run build     # debe terminar con «✓ built»
npm run preview   # http://localhost:4173 con las mismas cabeceras que Vercel
```

## 1. Crear el repositorio en GitHub

1. Entra en <https://github.com/new>.
2. **Repository name:** `vicman-qr` (o el que prefieras).
3. Elige **Public** o **Private** (ambos funcionan con Vercel Hobby).
4. **No** marques «Add a README», «.gitignore» ni «license»: el proyecto ya los tiene y crearían un conflicto.
5. Pulsa **Create repository** y copia la URL HTTPS, p. ej. `https://github.com/TU_USUARIO/vicman-qr.git`.

> El repositorio debe pertenecer a tu cuenta personal: los proyectos Hobby no pueden conectarse a repositorios de una
> organización de GitHub.

## 2. Subir el código

En una terminal, dentro de la carpeta del proyecto:

```bash
git remote add origin https://github.com/TU_USUARIO/vicman-qr.git
git push -u origin main
```

La primera vez, Git for Windows abre una ventana del navegador para iniciar sesión en GitHub (Git Credential Manager).
Recarga la página del repositorio: deberías ver `src/`, `docs/`, `package.json`, `vercel.json`…

## 3. Conectar GitHub con Vercel

1. Entra en <https://vercel.com/signup> y elige **Continue with GitHub**.
2. Selecciona el plan **Hobby**.
3. En el panel, pulsa **Add New… → Project**.
4. En **Import Git Repository**, si no aparece `vicman-qr`, pulsa **Adjust GitHub App Permissions** y concede acceso a
   ese repositorio (puedes limitarlo solo a él).
5. Pulsa **Import** junto a `vicman-qr`.

## 4. Configuración de compilación

En la pantalla **Configure Project** revisa (no hace falta cambiar nada):

| Campo | Valor |
|---|---|
| Framework Preset | **Vite** (detectado automáticamente) |
| Root Directory | `./` |
| Build Command | `npm run build` (definido en `vercel.json`) |
| Output Directory | `dist` (definido en `vercel.json`) |
| Install Command | por defecto (`npm install`) |
| Environment Variables | ninguna |

`npm run build` comprueba los tipos con TypeScript y compila con Vite; si hay un error de tipos, el despliegue falla
en lugar de publicar una versión rota.

## 5. Publicar

Pulsa **Deploy**. La compilación tarda alrededor de un minuto. Al terminar, Vercel muestra la dirección pública,
del tipo `https://vicman-qr.vercel.app` (o con un sufijo si el nombre ya está ocupado). Puedes cambiar el subdominio en
**Settings → Domains** siempre que termine en `.vercel.app`.

## 6. Verificar el despliegue

- [ ] La portada carga y la demostración muestra un QR.
- [ ] Abre directamente `https://TU-PROYECTO.vercel.app/crear/wifi` y recarga: debe cargar el generador, no un 404.
- [ ] Genera un QR de cada tipo y descarga PNG y SVG.
- [ ] Escanéalo con la cámara del teléfono.
- [ ] En el navegador: DevTools → Network → documento → **Response Headers** incluye `content-security-policy`
      y `x-frame-options: DENY`.
- [ ] DevTools → Console: sin errores.
- [ ] `https://TU-PROYECTO.vercel.app/robots.txt` responde con `User-agent: *`.
- [ ] Opcional: Lighthouse (DevTools → Lighthouse) en modo móvil.

## 7. Actualizar el sitio

Cada `push` a `main` publica automáticamente una nueva versión:

```bash
git add .
git commit -m "Describe el cambio"
git push
```

- Las ramas distintas de `main` generan una **vista previa** con su propia URL, sin tocar el sitio principal.
- En **Deployments** puedes ver el registro de cada compilación y volver a una versión anterior
  (**Instant Rollback** / **Promote to Production**).
- Si cambias el logotipo: copia el archivo a `public/brand/` y sigue `public/brand/README.md`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| La compilación falla por la versión de Node | Vercel debe usar 24.x. `package.json` ya lo fija; revisa que nadie lo haya cambiado y que **Settings → Build and Deployment → Node.js Version** no contradiga. |
| 404 al recargar una ruta como `/crear/url` | Falta `vercel.json` en la raíz del repositorio o se modificó la regla `rewrites`. |
| Pantalla «No se pudo cargar esta sección» justo tras publicar | Se cargó un archivo de la versión anterior. Pulsar «Recargar» lo resuelve. |
| El QR se ve pero no se descarga | Revisa la consola: una extensión del navegador puede bloquear descargas generadas en la página. |
| Error de CSP en la consola | Si añades scripts, estilos o fuentes de otro dominio, debes permitirlos en `Content-Security-Policy` de `vercel.json` (y probar con `npm run preview`). |

## Límites del plan Hobby relevantes

100 despliegues por día, 100 GB de transferencia al mes y 1 000 000 de peticiones al CDN al mes. Un sitio estático como
este está muy por debajo. Si se supera un límite en Hobby, la función queda en pausa hasta que pasen 30 días.

## Fuentes

- Vite en Vercel (SPA y `rewrites`): <https://vercel.com/docs/frameworks/frontend/vite>
- Configuración de `vercel.json` (`headers`, `rewrites`, `buildCommand`): <https://vercel.com/docs/project-configuration/vercel-json>
- Configurar una compilación: <https://vercel.com/docs/builds/configure-a-build>
- Versiones de Node.js: <https://vercel.com/docs/functions/runtimes/node-js/node-js-versions>
- Retiro de Node.js 20 (1 de octubre de 2026): <https://vercel.com/changelog/node-js-20-is-being-deprecated>
- Plan Hobby: <https://vercel.com/docs/plans/hobby> · Límites: <https://vercel.com/docs/limits> ·
  Uso justo: <https://vercel.com/docs/limits/fair-use-guidelines>
