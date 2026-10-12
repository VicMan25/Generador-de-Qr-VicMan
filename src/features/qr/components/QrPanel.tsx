import { CircleAlert, CircleCheck, Download, LoaderCircle, QrCode } from 'lucide-react';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { OptionGroup } from '../../../components/ui/OptionGroup';
import type { CapacityInfo } from '../capacity';
import { EXPORT_SIZES, type ExportSettings, type QrDesign } from '../design/defaults';
import { assessReadability, formatRatio } from '../design/readability';
import type { CheckStatus } from '../hooks/useQrCheck';
import type { DownloadState } from '../hooks/useQrDownload';
import { useQrPreview } from '../hooks/useQrPreview';
import styles from './QrPanel.module.css';

const CHECK_MESSAGES: Record<Exclude<CheckStatus, 'idle'>, string> = {
  checking: 'Comprobando lectura…',
  match: 'Lectura verificada',
  mismatch: 'El código leído no coincide con el contenido',
  unreadable: 'No se pudo leer el código generado',
  error: 'No se pudo comprobar la lectura',
};

const FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
] as const;

const SIZE_OPTIONS = EXPORT_SIZES.map((size) => ({ value: size, label: `${size} px` }));

interface QrPanelProps {
  /** Contenido mostrado (con retardo); nulo si los datos no son válidos. */
  previewPayload: string | null;
  /** Contenido actual, usado para descargar. */
  payload: string | null;
  design: QrDesign;
  capacity: CapacityInfo | null;
  checkStatus: CheckStatus;
  exportSettings: ExportSettings;
  onExportChange: (changes: Partial<ExportSettings>) => void;
  downloadState: DownloadState;
  onDownload: () => void;
  onForceSave: () => void;
  /** Motivo por el que no se puede generar aunque haya contenido (p. ej. capacidad superada). */
  blockedReason?: string;
}

export function QrPanel(props: QrPanelProps) {
  const {
    previewPayload,
    payload,
    design,
    capacity,
    checkStatus,
    exportSettings,
    onExportChange,
    downloadState,
    onDownload,
    onForceSave,
    blockedReason,
  } = props;
  const containerRef = useQrPreview(previewPayload, design);
  const readability = assessReadability(design);
  const hasPreview = previewPayload !== null;
  const working = downloadState.phase === 'working';
  const failed = checkStatus === 'mismatch' || checkStatus === 'unreadable' || checkStatus === 'error';
  const formatLabel = exportSettings.format.toUpperCase();

  return (
    <div className={styles.panel}>
      <div className={styles.frame} data-empty={!hasPreview || undefined}>
        <div
          ref={containerRef}
          className={styles.canvas}
          role="img"
          aria-label={hasPreview ? 'Vista previa del código QR' : undefined}
          aria-hidden={!hasPreview || undefined}
        />
        {!hasPreview && (
          <div className={styles.placeholder}>
            <QrCode size={56} strokeWidth={1.25} aria-hidden="true" />
            <p>{blockedReason ?? 'Completa el contenido para ver tu código'}</p>
          </div>
        )}
      </div>

      <div className={styles.statusRow}>
        <p className={styles.check} data-status={checkStatus} role="status" aria-live="polite">
          {checkStatus === 'checking' && <LoaderCircle size={16} className={styles.spin} aria-hidden="true" />}
          {checkStatus === 'match' && <CircleCheck size={16} aria-hidden="true" />}
          {failed && <CircleAlert size={16} aria-hidden="true" />}
          <span>
            {checkStatus === 'idle'
              ? blockedReason
                ? 'No se puede generar'
                : 'Sin contenido todavía'
              : CHECK_MESSAGES[checkStatus]}
          </span>
        </p>
        <span className={styles.contrast} data-level={readability.level} title="Contraste entre el código y el fondo">
          Contraste {formatRatio(readability.ratio)}
        </span>
      </div>

      {failed && (
        <Alert tone="error">
          Ajusta el diseño: aumenta el contraste, reduce el logotipo o usa formas más simples.
        </Alert>
      )}

      {capacity && (
        <div className={styles.capacity}>
          <div className={styles.capacityLabel}>
            <span>Capacidad usada</span>
            <span>
              {capacity.bytes.toLocaleString('es')} / {capacity.max.toLocaleString('es')} bytes
            </span>
          </div>
          <div
            className={styles.meter}
            role="meter"
            aria-label="Capacidad usada"
            aria-valuemin={0}
            aria-valuemax={capacity.max}
            aria-valuenow={Math.min(capacity.bytes, capacity.max)}
            data-level={capacity.exceeded ? 'over' : capacity.dense ? 'dense' : 'ok'}
          >
            <span style={{ width: `${Math.max(capacity.ratio * 100, 1.5)}%` }} />
          </div>
        </div>
      )}

      <div className={styles.exportOptions}>
        <OptionGroup
          name="export-format"
          legend="Formato"
          options={FORMAT_OPTIONS}
          value={exportSettings.format}
          onChange={(format) => onExportChange({ format })}
        />
        {exportSettings.format === 'png' ? (
          <label className={styles.sizeField}>
            <span className={styles.sizeLabel}>Tamaño</span>
            <select
              className={styles.sizeSelect}
              value={exportSettings.size}
              onChange={(event) => onExportChange({ size: Number(event.target.value) })}
            >
              {SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className={styles.svgNote}>Vectorial: se amplía sin perder nitidez. Ideal para imprenta.</p>
        )}
      </div>

      <Button
        size="lg"
        className={styles.download}
        onClick={onDownload}
        disabled={!payload || working}
        icon={working ? <LoaderCircle className={styles.spin} /> : <Download />}
      >
        {working ? 'Preparando…' : `Descargar ${formatLabel}`}
      </Button>

      <div aria-live="polite">
        {downloadState.phase === 'done' && (
          <Alert tone="success">
            Descargado como <strong>{downloadState.fileName}</strong>.
          </Alert>
        )}
        {downloadState.phase === 'error' && <Alert tone="error">{downloadState.message}</Alert>}
        {downloadState.phase === 'unverified' && (
          <Alert tone="warning">
            <p>No pudimos confirmar que la imagen se lea correctamente, así que no la descargamos.</p>
            <button type="button" className={styles.inlineAction} onClick={onForceSave}>
              Descargar de todos modos
            </button>
          </Alert>
        )}
      </div>

      {/* Siempre presente para que el panel no cambie de alto al aparecer o desaparecer el contenido. */}
      <details className={styles.inspector}>
        <summary>Ver contenido codificado</summary>
        <pre className={styles.payload}>{previewPayload ?? 'Sin contenido todavía.'}</pre>
      </details>
    </div>
  );
}
