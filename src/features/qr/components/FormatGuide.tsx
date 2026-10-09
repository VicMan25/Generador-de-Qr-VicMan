import { HelpCircle } from 'lucide-react';
import type { FormatGuide as Guide } from '../formats/types';
import styles from './FormatGuide.module.css';

/** Guía paso a paso que acompaña a algunos tipos de QR (p. ej. documentos). */
export function FormatGuide({ guide }: { guide: Guide }) {
  return (
    <details className={styles.guide}>
      <summary className={styles.summary}>
        <HelpCircle size={18} aria-hidden="true" />
        {guide.title}
      </summary>
      <div className={styles.body}>
        <ol className={styles.steps}>
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {guide.tips.map((tip) => (
          <div key={tip.title} className={styles.tip}>
            <h3 className={styles.tipTitle}>{tip.title}</h3>
            <p>{tip.text}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
