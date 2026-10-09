import { FileWarning, HardDrive, Link2, ShieldCheck } from 'lucide-react';
import styles from './ContentPage.module.css';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export function PrivacyPage() {
  useDocumentTitle('Privacidad');
  return (
    <article className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">Privacidad</p>
        <h1 className={styles.title}>Tus datos no salen de tu navegador</h1>
        <p className={styles.lede}>
          VicMan QR es una aplicación estática: no tiene servidor propio ni base de datos. Esto es lo que ocurre con
          la información que escribes.
        </p>
      </header>

      <section className={styles.block}>
        <ShieldCheck className={styles.blockIcon} aria-hidden="true" />
        <div>
          <h2 className={styles.blockTitle}>Generación local</h2>
          <p>
            El código QR se calcula y se dibuja en tu dispositivo. Textos, contraseñas Wi-Fi, contactos y enlaces no
            se envían a ningún servidor para generarlo.
          </p>
        </div>
      </section>

      <section className={styles.block}>
        <HardDrive className={styles.blockIcon} aria-hidden="true" />
        <div>
          <h2 className={styles.blockTitle}>Qué se guarda</h2>
          <p>
            Solo tus preferencias: el tema (claro u oscuro) y el diseño y formato de exportación que elegiste, en el
            almacenamiento local de este navegador. Puedes borrarlas limpiando los datos del sitio. El contenido de tus
            códigos y tu logotipo no se guardan: el logotipo se procesa en memoria y desaparece al cerrar la pestaña.
          </p>
        </div>
      </section>

      <section className={styles.block}>
        <Link2 className={styles.blockIcon} aria-hidden="true" />
        <div>
          <h2 className={styles.blockTitle}>Sobre los enlaces</h2>
          <p>
            Un QR solo contiene la dirección que escribiste. Generarlo no garantiza que el sitio de destino sea
            seguro ni que siga disponible en el futuro. Revisa el enlace antes de compartirlo.
          </p>
        </div>
      </section>

      <section className={styles.block}>
        <FileWarning className={styles.blockIcon} aria-hidden="true" />
        <div>
          <h2 className={styles.blockTitle}>Sobre los documentos y archivos</h2>
          <p>
            Un código QR almacena como máximo unos pocos kilobytes, así que contiene el <strong>enlace</strong> al
            archivo, no el archivo en sí. El documento debe estar publicado en un servicio que tú elijas (por ejemplo,
            tu nube personal) con permisos de acceso público. VicMan QR no aloja archivos.
          </p>
        </div>
      </section>
    </article>
  );
}
