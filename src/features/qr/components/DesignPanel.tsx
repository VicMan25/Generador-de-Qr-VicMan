import { RotateCcw } from 'lucide-react';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { ColorInput } from '../../../components/ui/ColorInput';
import { OptionGroup } from '../../../components/ui/OptionGroup';
import {
  CORNER_CENTERS,
  CORNER_FRAMES,
  DEFAULT_DESIGN,
  DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  LOGO_SIZES,
  PALETTES,
  type QrDesign,
} from '../design/defaults';
import { assessReadability, formatRatio } from '../design/readability';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { CornerCenterSwatch, CornerFrameSwatch, DotSwatch } from './StyleSwatch';
import { LogoPicker } from './LogoPicker';
import styles from './DesignPanel.module.css';

interface DesignPanelProps {
  design: QrDesign;
  onChange: (changes: Partial<QrDesign>) => void;
  onReset: () => void;
}

export function DesignPanel({ design, onChange, onReset }: DesignPanelProps) {
  // Los avisos de contraste esperan a que el color deje de cambiar (p. ej. al arrastrar el selector),
  // para que las secciones de abajo no salten mientras se elige.
  const readability = assessReadability(useDebouncedValue(design, 350));
  const isDefault = (Object.keys(DEFAULT_DESIGN) as (keyof QrDesign)[]).every(
    (key) => design[key] === DEFAULT_DESIGN[key],
  );
  const activePalette = PALETTES.find(
    (p) => p.foreground === design.foreground && p.cornerColor === design.cornerColor && p.background === design.background,
  );

  return (
    <div className={styles.panel}>
      <section className={styles.section} aria-labelledby="design-colors">
        <h2 id="design-colors" className={styles.heading}>
          Colores
        </h2>

        <div className={styles.palettes} role="group" aria-label="Paletas sugeridas">
          {PALETTES.map((palette) => (
            <button
              key={palette.name}
              type="button"
              className={styles.palette}
              aria-pressed={palette === activePalette}
              onClick={() =>
                onChange({
                  foreground: palette.foreground,
                  cornerColor: palette.cornerColor,
                  background: palette.background,
                })
              }
            >
              <span className={styles.paletteSwatch} style={{ background: palette.background }} aria-hidden="true">
                <span style={{ background: palette.foreground }} />
                <span style={{ background: palette.cornerColor }} />
              </span>
              {palette.name}
            </button>
          ))}
        </div>

        <div className={styles.colors}>
          <ColorInput id="color-fg" label="Módulos" value={design.foreground} onChange={(v) => onChange({ foreground: v })} />
          <ColorInput id="color-corner" label="Esquinas" value={design.cornerColor} onChange={(v) => onChange({ cornerColor: v })} />
          <ColorInput id="color-bg" label="Fondo" value={design.background} onChange={(v) => onChange({ background: v })} />
        </div>

        {readability.level === 'critical' && (
          <Alert tone="error">
            Contraste muy bajo ({formatRatio(readability.ratio)}): es muy probable que el código no se pueda leer.
          </Alert>
        )}
        {readability.level === 'low' && (
          <Alert tone="warning">
            Contraste bajo ({formatRatio(readability.ratio)}). Recomendamos al menos 4:1 para una lectura fiable.
          </Alert>
        )}
        {readability.inverted && (
          <Alert tone="warning">
            El código es más claro que el fondo. Algunas cámaras y lectores no reconocen códigos invertidos: prefiere
            colores oscuros sobre fondo claro.
          </Alert>
        )}
      </section>

      <section className={styles.section} aria-labelledby="design-shapes">
        <h2 id="design-shapes" className={styles.heading}>
          Formas
        </h2>
        <OptionGroup
          name="dot-style"
          legend="Módulos"
          variant="tiles"
          value={design.dotStyle}
          onChange={(dotStyle) => onChange({ dotStyle })}
          options={DOT_STYLES.map((o) => ({ ...o, visual: <DotSwatch style={o.value} /> }))}
        />
        <div className={styles.corners}>
          <OptionGroup
            name="corner-frame"
            legend="Marco de las esquinas"
            variant="tiles"
            value={design.cornerFrame}
            onChange={(cornerFrame) => onChange({ cornerFrame })}
            options={CORNER_FRAMES.map((o) => ({ ...o, visual: <CornerFrameSwatch style={o.value} /> }))}
          />
          <OptionGroup
            name="corner-center"
            legend="Centro de las esquinas"
            variant="tiles"
            value={design.cornerCenter}
            onChange={(cornerCenter) => onChange({ cornerCenter })}
            options={CORNER_CENTERS.map((o) => ({ ...o, visual: <CornerCenterSwatch style={o.value} /> }))}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="design-logo">
        <h2 id="design-logo" className={styles.heading}>
          Logotipo
        </h2>
        <LogoPicker logo={design.logo} onChange={(logo) => onChange({ logo })} />
        {design.logo && (
          <OptionGroup
            name="logo-size"
            legend="Tamaño del logotipo"
            value={design.logoSize}
            onChange={(logoSize) => onChange({ logoSize })}
            options={LOGO_SIZES}
            hint="Si la comprobación de lectura falla, reduce el tamaño del logotipo."
          />
        )}
      </section>

      <section className={styles.section} aria-labelledby="design-advanced">
        <h2 id="design-advanced" className={styles.heading}>
          Corrección de errores
        </h2>
        <OptionGroup
          name="error-correction"
          legend="Nivel de tolerancia a daños"
          value={design.logo ? 'H' : design.errorCorrection}
          onChange={(errorCorrection) => onChange({ errorCorrection })}
          options={ERROR_CORRECTION_LEVELS}
          disabled={Boolean(design.logo)}
          hint={
            design.logo
              ? 'Con logotipo se usa siempre el nivel máximo, para compensar la zona que cubre.'
              : ERROR_CORRECTION_LEVELS.find((level) => level.value === design.errorCorrection)?.hint
          }
        />
      </section>

      <div className={styles.footer}>
        <Button variant="ghost" icon={<RotateCcw />} onClick={onReset} disabled={isDefault}>
          Restablecer diseño
        </Button>
      </div>
    </div>
  );
}
