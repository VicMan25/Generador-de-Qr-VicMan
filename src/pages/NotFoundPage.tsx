import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import styles from './ContentPage.module.css';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <section className={`container ${styles.page} ${styles.centered}`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Este código no lleva a ninguna parte</h1>
      <p className={styles.lede}>La página que buscas no existe o cambió de dirección.</p>
      <Button to="/" icon={<ArrowLeft />}>
        Volver al inicio
      </Button>
    </section>
  );
}
