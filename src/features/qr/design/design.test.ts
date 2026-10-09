import { afterEach, describe, expect, it, vi } from 'vitest';
import { contrastRatio } from '../../../utils/contrast';
import { buildQrOptions, DEFAULT_DESIGN, effectiveErrorCorrection, PALETTES } from './defaults';
import { assessReadability } from './readability';
import { loadPreferences, savePreferences } from './storage';

describe('contraste', () => {
  it('calcula los extremos WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('todas las paletas sugeridas tienen contraste suficiente y no están invertidas', () => {
    for (const palette of PALETTES) {
      const readability = assessReadability({ ...DEFAULT_DESIGN, ...palette });
      expect(readability.level, palette.name).toBe('ok');
      expect(readability.inverted, palette.name).toBe(false);
    }
  });

  it('detecta contraste bajo, crítico e inversión', () => {
    expect(assessReadability({ ...DEFAULT_DESIGN, foreground: '#888888', cornerColor: '#888888' }).level).toBe('low');
    expect(assessReadability({ ...DEFAULT_DESIGN, foreground: '#DDDDDD', cornerColor: '#DDDDDD' }).level).toBe(
      'critical',
    );
    const inverted = assessReadability({
      ...DEFAULT_DESIGN,
      foreground: '#FFFFFF',
      cornerColor: '#FFFFFF',
      background: '#12141A',
    });
    expect(inverted.inverted).toBe(true);
    expect(inverted.level).toBe('ok');
  });

  it('usa el peor contraste entre módulos y esquinas', () => {
    expect(assessReadability({ ...DEFAULT_DESIGN, cornerColor: '#EEEEEE' }).level).toBe('critical');
  });
});

describe('opciones del motor QR', () => {
  it('con logotipo fuerza el nivel H y oculta los módulos bajo la imagen', () => {
    const design = { ...DEFAULT_DESIGN, errorCorrection: 'L' as const, logo: 'data:image/png;base64,AAAA' };
    expect(effectiveErrorCorrection(design)).toBe('H');
    const options = buildQrOptions('hola', design, 1000, 'svg');
    expect(options.qrOptions?.errorCorrectionLevel).toBe('H');
    expect(options.imageOptions?.hideBackgroundDots).toBe(true);
    expect(options.image).toBe(design.logo);
  });

  it('sin logotipo respeta el nivel elegido y no incluye imagen', () => {
    const options = buildQrOptions('hola', { ...DEFAULT_DESIGN, errorCorrection: 'Q' }, 1000, 'canvas');
    expect(options.qrOptions?.errorCorrectionLevel).toBe('Q');
    expect(options.image).toBeUndefined();
  });
});

describe('preferencias guardadas', () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubStorage() {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    return store;
  }

  it('usa los valores por defecto si no hay almacenamiento', () => {
    expect(loadPreferences().design).toEqual(DEFAULT_DESIGN);
  });

  it('guarda el diseño sin el logotipo y lo recupera', () => {
    const store = stubStorage();
    const design = { ...DEFAULT_DESIGN, foreground: '#0B3B60', dotStyle: 'dots' as const, logo: 'data:image/png;base64,X' };
    savePreferences(design, { format: 'svg', size: 2048 });
    expect([...store.values()].join()).not.toContain('data:image');
    const loaded = loadPreferences();
    expect(loaded.design).toEqual({ ...design, logo: null });
    expect(loaded.export).toEqual({ format: 'svg', size: 2048 });
  });

  it('descarta valores manipulados o inválidos', () => {
    const store = stubStorage();
    store.set(
      'vmqr-preferences',
      JSON.stringify({ design: { foreground: 'red', dotStyle: 'estrella', logo: 'x' }, export: { size: 99999 } }),
    );
    const loaded = loadPreferences();
    expect(loaded.design.foreground).toBe(DEFAULT_DESIGN.foreground);
    expect(loaded.design.dotStyle).toBe(DEFAULT_DESIGN.dotStyle);
    expect(loaded.design.logo).toBeNull();
    expect(loaded.export.size).toBe(1024);
  });
});
