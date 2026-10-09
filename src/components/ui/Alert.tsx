import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import styles from './Alert.module.css';

type Tone = 'info' | 'warning' | 'error' | 'success';

const ICONS = { info: Info, warning: TriangleAlert, error: CircleAlert, success: CircleCheck };

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const Icon = ICONS[tone];
  return (
    <div className={`${styles.alert} ${styles[tone]}`}>
      <Icon size={18} aria-hidden="true" className={styles.icon} />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
