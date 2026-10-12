import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { Palette, PenLine, RotateCcw } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { ContentForm } from '../features/qr/components/ContentForm';
import { DesignPanel } from '../features/qr/components/DesignPanel';
import { FormatGuide } from '../features/qr/components/FormatGuide';
import { MobileActionBar } from '../features/qr/components/MobileActionBar';
import { QrPanel } from '../features/qr/components/QrPanel';
import { TypeSelector } from '../features/qr/components/TypeSelector';
import { getCapacity } from '../features/qr/capacity';
import {
  DEFAULT_DESIGN,
  effectiveErrorCorrection,
  type ExportSettings,
  type QrDesign,
} from '../features/qr/design/defaults';
import { loadPreferences, savePreferences } from '../features/qr/design/storage';
import { DEFAULT_FORMAT_ID, getFormat, type QrFormatId } from '../features/qr/formats/registry';
import type { FieldErrors, FieldValue, FormValues } from '../features/qr/formats/types';
import { useDebouncedValue } from '../features/qr/hooks/useDebouncedValue';
import { useQrCheck } from '../features/qr/hooks/useQrCheck';
import { useQrDownload, type DownloadState } from '../features/qr/hooks/useQrDownload';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import styles from './GeneratorPage.module.css';

/** Estado opcional al llegar desde la demostración de la portada. */
export interface GeneratorLocationState {
  prefill?: { formatId: QrFormatId; values: FormValues };
}

const PREVIEW_ID = 'qr-preview';

type Tab = 'content' | 'design';
const TABS = [
  ['content', 'Contenido', PenLine],
  ['design', 'Diseño', Palette],
] as const;

/** Navegación con flechas, Inicio y Fin entre pestañas (patrón ARIA de pestañas). */
function nextTab(current: Tab, key: string): Tab | null {
  const index = TABS.findIndex(([id]) => id === current);
  if (key === 'ArrowRight') return TABS[(index + 1) % TABS.length][0];
  if (key === 'ArrowLeft') return TABS[(index - 1 + TABS.length) % TABS.length][0];
  if (key === 'Home') return TABS[0][0];
  if (key === 'End') return TABS[TABS.length - 1][0];
  return null;
}

function mobileMessage(state: DownloadState, ready: boolean, formatLabel: string): string {
  switch (state.phase) {
    case 'working':
      return 'Preparando…';
    case 'done':
      return `${formatLabel} descargado`;
    case 'unverified':
      return 'Revisa el aviso del panel';
    case 'error':
      return 'No se pudo descargar';
    default:
      return ready ? 'Tu código está listo' : 'Completa el contenido';
  }
}

export function GeneratorPage() {
  const { formatId } = useParams();
  const location = useLocation();
  const format = getFormat(formatId);
  const definition = format?.definition;
  useDocumentTitle(format ? `Crear QR · ${format.label}` : undefined);

  // Los datos de cada tipo se conservan al cambiar de tipo, para no empezar de cero.
  const [valuesByFormat, setValuesByFormat] = useState<Partial<Record<QrFormatId, FormValues>>>(() => {
    const prefill = (location.state as GeneratorLocationState | null)?.prefill;
    return prefill ? { [prefill.formatId]: prefill.values } : {};
  });
  const [touchedByFormat, setTouchedByFormat] = useState<Partial<Record<QrFormatId, string[]>>>(() => {
    const prefill = (location.state as GeneratorLocationState | null)?.prefill;
    return prefill ? { [prefill.formatId]: Object.keys(prefill.values) } : {};
  });

  // El diseño y la exportación se comparten entre tipos y se recuerdan en este navegador (sin el logotipo).
  const [preferences] = useState(loadPreferences);
  const [design, setDesign] = useState<QrDesign>(preferences.design);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(preferences.export);
  const [tab, setTab] = useState<Tab>('content');

  useEffect(() => savePreferences(design, exportSettings), [design, exportSettings]);

  const values = (format && valuesByFormat[format.id]) ?? definition?.defaults;
  const result = useMemo(() => (definition && values ? definition.build(values) : null), [definition, values]);
  // Avisos y errores siguen al resultado «asentado» (cuando se deja de escribir) para que el formulario
  // no crezca y encoja con cada tecla. Se asocia al tipo para no mostrar avisos de otro tipo al cambiar.
  const resultEntry = useMemo(() => ({ formatId: format?.id, result }), [format?.id, result]);
  const settledEntry = useDebouncedValue(resultEntry, 450);
  const settledResult = settledEntry.formatId === format?.id ? settledEntry.result : result;
  const capacity = result?.ok ? getCapacity(result.payload, effectiveErrorCorrection(design)) : null;
  // El medidor de capacidad se muestra siempre (vacío si no hay contenido) para que el panel no cambie de alto.
  const capacityDisplay = capacity ?? getCapacity('', effectiveErrorCorrection(design));
  const payload = result?.ok && !capacity?.exceeded ? result.payload : null;
  const debouncedPayload = useDebouncedValue(payload, 250);
  const previewPayload = payload === null ? null : debouncedPayload;
  // La comprobación de lectura (más costosa) espera a que el diseño deje de cambiar, p. ej. al arrastrar un color.
  const checkedDesign = useDebouncedValue(design, 300);

  const check = useQrCheck(previewPayload, checkedDesign);
  const { state: downloadState, download, forceSave, reset } = useQrDownload();

  // Un aviso de descarga deja de ser válido en cuanto cambia el contenido, el diseño o el formato.
  useEffect(() => reset(), [payload, design, exportSettings, reset]);

  const handleDesignChange = useCallback((changes: Partial<QrDesign>) => {
    setDesign((current) => ({ ...current, ...changes }));
  }, []);

  const handleExportChange = useCallback((changes: Partial<ExportSettings>) => {
    setExportSettings((current) => ({ ...current, ...changes }));
  }, []);

  const handleChange = useCallback(
    (name: string, value: FieldValue) => {
      if (!format || !definition) return;
      setValuesByFormat((current) => ({
        ...current,
        [format.id]: { ...(current[format.id] ?? definition.defaults), [name]: value },
      }));
    },
    [format, definition],
  );

  const handleBlur = useCallback(
    (name: string) => {
      if (!format) return;
      setTouchedByFormat((current) => {
        const touched = current[format.id] ?? [];
        return touched.includes(name) ? current : { ...current, [format.id]: [...touched, name] };
      });
    },
    [format],
  );

  // Solo los tipos operativos tienen generador; el resto redirige al tipo por defecto.
  if (!format || !definition || !values) {
    return <Navigate to={`/crear/${DEFAULT_FORMAT_ID}`} replace />;
  }

  const Icon = format.icon;
  const touched = touchedByFormat[format.id] ?? [];
  // Un error desaparece en cuanto se corrige, pero solo aparece cuando se deja de escribir.
  const settledErrors = settledResult && !settledResult.ok ? settledResult.errors : {};
  const visibleErrors: FieldErrors =
    result && !result.ok
      ? Object.fromEntries(
          Object.entries(result.errors).filter(([field]) => touched.includes(field) && settledErrors[field]),
        )
      : {};
  const hasContent = Object.keys(values).some((key) => values[key] !== definition.defaults[key]);

  const handleDownload = () => {
    if (payload) void download(payload, definition.fileName(values), design, exportSettings);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = nextTab(tab, event.key);
    if (!next) return;
    event.preventDefault();
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const handleClear = () => {
    setValuesByFormat((current) => ({ ...current, [format.id]: undefined }));
    setTouchedByFormat((current) => ({ ...current, [format.id]: [] }));
  };

  return (
    <div className={`container ${styles.page}`}>
      <aside className={styles.selector}>
        <TypeSelector activeId={format.id} />
      </aside>

      <section className={styles.workspace} aria-labelledby="workspace-title">
        <header className={styles.workspaceHeader}>
          <span className={styles.formatIcon} aria-hidden="true">
            <Icon size={22} />
          </span>
          <div>
            <h1 id="workspace-title" className={styles.title}>
              {format.label}
            </h1>
            <p className={styles.description}>{format.description}</p>
          </div>
        </header>

        <>
            <div className={styles.tabs} role="tablist" aria-label="Secciones del generador" onKeyDown={handleTabKeyDown}>
              {TABS.map(([id, label, TabIcon]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls={`panel-${id}`}
                  tabIndex={tab === id ? 0 : -1}
                  className={styles.tab}
                  onClick={() => setTab(id)}
                >
                  <TabIcon size={18} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div
              id="panel-design"
              role="tabpanel"
              aria-labelledby="tab-design"
              hidden={tab !== 'design'}
              className={styles.tabPanel}
            >
              <DesignPanel design={design} onChange={handleDesignChange} onReset={() => setDesign(DEFAULT_DESIGN)} />
            </div>

            <div
              id="panel-content"
              role="tabpanel"
              aria-labelledby="tab-content"
              hidden={tab !== 'content'}
              className={styles.tabPanel}
            >
              {definition.guide && <FormatGuide guide={definition.guide} />}

              <ContentForm
                formatId={format.id}
                definition={definition}
                values={values}
                errors={visibleErrors}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              {capacity?.exceeded && (
                <Alert tone="error">
                  El contenido ocupa {capacity.bytes.toLocaleString('es')} bytes y el máximo es{' '}
                  {capacity.max.toLocaleString('es')}. Acórtalo para generar el código.
                </Alert>
              )}
              {capacity?.dense && !capacity.exceeded && (
                <Alert tone="warning">
                  Contenido extenso: el código será muy denso. Imprímelo a buen tamaño y comprueba que tu teléfono lo lea.
                </Alert>
              )}

              <div className={styles.notices}>
                {[...(settledResult?.notices ?? []), ...definition.notices].map((notice) => (
                  <Alert key={notice.text} tone={notice.tone}>
                    {notice.text}
                  </Alert>
                ))}
              </div>

              <div className={styles.formActions}>
                <Button variant="ghost" icon={<RotateCcw />} onClick={handleClear} disabled={!hasContent}>
                  Borrar contenido
                </Button>
              </div>
            </div>
        </>
      </section>

      <aside id={PREVIEW_ID} className={styles.preview} aria-label="Vista previa y descarga">
        <QrPanel
            previewPayload={previewPayload}
            payload={payload}
            design={design}
            capacity={capacityDisplay}
            checkStatus={check.status}
            exportSettings={exportSettings}
            onExportChange={handleExportChange}
            downloadState={downloadState}
            onDownload={handleDownload}
            onForceSave={forceSave}
            blockedReason={capacity?.exceeded ? 'El contenido supera la capacidad máxima de un código QR' : undefined}
          />
      </aside>

      <MobileActionBar
          imageUrl={check.imageUrl}
          message={mobileMessage(downloadState, payload !== null, exportSettings.format.toUpperCase())}
          formatLabel={exportSettings.format.toUpperCase()}
          canDownload={payload !== null}
          working={downloadState.phase === 'working'}
          previewId={PREVIEW_ID}
          onDownload={handleDownload}
        />
    </div>
  );
}
