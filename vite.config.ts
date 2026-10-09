import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

interface VercelHeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

/**
 * `npm run preview` aplica las mismas cabeceras de seguridad que Vercel (vercel.json),
 * para probar la política CSP en local antes de publicar. El servidor de desarrollo no las usa:
 * Vite inyecta scripts en línea para la recarga en caliente.
 */
function vercelSiteHeaders(): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
    headers: VercelHeaderRule[];
  };
  const rule = config.headers.find((item) => item.source === '/(.*)');
  return Object.fromEntries((rule?.headers ?? []).map(({ key, value }) => [key, value]));
}

export default defineConfig({
  plugins: [react()],
  build: {
    // Las fuentes pequeñas se emiten como archivo y no como data: URI, para cumplir `font-src 'self'`.
    assetsInlineLimit: (filePath) => (/\.woff2?$/.test(filePath) ? false : undefined),
  },
  preview: { headers: vercelSiteHeaders() },
});
