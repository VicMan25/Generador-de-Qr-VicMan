import { useRouteError } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import styles from './ContentPage.module.css';

/** Un módulo que no carga suele indicar una nueva publicación o una conexión interrumpida. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message);
}

export function ErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Algo salió mal');
  const chunkError = isChunkLoadError(error);

  return (
    <section className={`container ${styles.page} ${styles.centered}`} role="alert">
      <h1 className={styles.title}>{chunkError ? 'No se pudo cargar esta sección' : 'Algo salió mal'}</h1>
      <p className={styles.lede}>
        {chunkError
          ? 'Puede que haya una versión nueva del sitio o que se haya interrumpido la conexión. Recarga la página para continuar.'
          : 'Ocurrió un error inesperado. Recarga la página; tus datos no se enviaron a ningún lugar.'}
      </p>
      <Button onClick={() => window.location.reload()} icon={<RefreshCw />}>
        Recargar
      </Button>
    </section>
  );
}
