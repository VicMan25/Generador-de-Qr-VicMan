import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  CloudOff,
  Download,
  EyeOff,
  Palette,
  PenLine,
  ServerOff,
  UserX,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { QR_FORMATS, QR_GROUP_LABELS, type QrFormatGroup } from '../features/qr/formats/registry';
import styles from './HomePage.module.css';
import { useDocumentTitle } from '../utils/useDocumentTitle';

// La demostración usa el motor QR; se carga aparte para que la portada aparezca antes.
const HeroDemo = lazy(() => import('./HeroDemo').then((module) => ({ default: module.HeroDemo })));

const GROUP_ORDER: QrFormatGroup[] = ['essentials', 'files', 'more'];

const STEPS = [
  {
    icon: PenLine,
    title: 'Elige y escribe',
    text: 'Selecciona el tipo de QR y completa los datos. Validamos cada campo mientras escribes.',
  },
  {
    icon: Palette,
    title: 'Dale tu estilo',
    text: 'Colores, formas de los módulos y de las esquinas, y tu logotipo, sin perder legibilidad.',
  },
  {
    icon: Download,
    title: 'Descarga',
    text: 'Exporta la imagen directamente desde tu navegador, lista para imprimir o compartir.',
  },
];

const PRIVACY_POINTS = [
  { icon: ServerOff, title: 'Sin servidores', text: 'El código se genera en tu dispositivo, no en la nube.' },
  { icon: UserX, title: 'Sin registro', text: 'No hay cuentas, correos ni contraseñas que entregar.' },
  { icon: EyeOff, title: 'Sin rastreo', text: 'Tus textos, redes Wi-Fi y contactos no se guardan ni se envían.' },
];

export function HomePage() {
  useDocumentTitle();
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Estudio de códigos QR</p>
            <h1 className={styles.heroTitle}>
              Códigos QR que nacen <mark className={styles.highlight}>en tu navegador</mark>.
            </h1>
            <p className={styles.lede}>
              Enlaces, textos, redes Wi-Fi, contactos y documentos convertidos en códigos listos para escanear.
              Sin registro, sin servidores y sin rastreo.
            </p>
            <div className={styles.heroActions}>
              <Button to="/crear" size="lg" iconEnd={<ArrowRight />}>
                Crear mi QR
              </Button>
              <Button to={{ hash: '#tipos' }} size="lg" variant="secondary">
                Ver tipos de QR
              </Button>
            </div>
            <ul className={styles.trust} aria-label="Características">
              <li>
                <CloudOff size={16} aria-hidden="true" /> Procesado local
              </li>
              <li>
                <UserX size={16} aria-hidden="true" /> Sin cuenta
              </li>
              <li>
                <Download size={16} aria-hidden="true" /> Gratis
              </li>
            </ul>
          </div>
          <Suspense fallback={<div className={styles.demoPlaceholder} aria-hidden="true" />}>
            <HeroDemo />
          </Suspense>
        </div>
      </section>

      <section id="tipos" className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Tipos de QR</p>
            <h2 className={styles.sectionTitle}>Un código para cada situación</h2>
            <p className={styles.sectionLede}>
              Cada tipo usa el formato estándar que reconocen las cámaras de iOS y Android.
            </p>
          </header>

          {GROUP_ORDER.map((group) => (
            <div key={group} className={styles.group}>
              <h3 className={styles.groupTitle}>{QR_GROUP_LABELS[group]}</h3>
              <ul className={styles.cards}>
                {QR_FORMATS.filter((format) => format.group === group).map((format) => {
                  const Icon = format.icon;
                  return (
                    <li key={format.id}>
                      <Link to={`/crear/${format.id}`} className={styles.card}>
                        <span className={styles.cardIcon} aria-hidden="true">
                          <Icon size={22} />
                        </span>
                        <span className={styles.cardText}>
                          <span className={styles.cardTitle}>{format.label}</span>
                          <span className={styles.cardDescription}>{format.description}</span>
                        </span>
                        <ArrowRight className={styles.cardArrow} size={18} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className={styles.sectionTitle}>Tres pasos, cero esperas</h2>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <Icon className={styles.stepIcon} size={28} aria-hidden="true" />
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`container ${styles.privacy}`}>
          <div className={styles.privacyCopy}>
            <p className="eyebrow">Privacidad</p>
            <h2 className={styles.sectionTitle}>Lo que escribes se queda contigo</h2>
            <p className={styles.sectionLede}>
              Generar un QR no requiere enviar tu información a ningún lugar. Todo el proceso ocurre en esta pestaña
              de tu navegador.
            </p>
            <Link to="/privacidad" className={styles.textLink}>
              Leer los detalles <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className={styles.privacyList}>
            {PRIVACY_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className={styles.privacyItem}>
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <h3 className={styles.privacyTitle}>{point.title}</h3>
                    <p className={styles.privacyText}>{point.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>¿Listo para tu primer código?</h2>
          <Button to="/crear" size="lg" iconEnd={<ArrowRight />}>
            Empezar ahora
          </Button>
        </div>
      </section>
    </>
  );
}
