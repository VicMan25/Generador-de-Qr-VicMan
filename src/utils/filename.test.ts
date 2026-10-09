import { describe, expect, it } from 'vitest';
import { buildFileName, slugify } from './filename';

describe('slugify', () => {
  it('quita tildes, símbolos y espacios', () => {
    expect(slugify('  Árbol de Navidad: ¡2026!  ')).toBe('arbol-de-navidad-2026');
  });

  it('respeta la longitud máxima sin dejar guiones al final', () => {
    expect(slugify('uno dos tres cuatro', 8)).toBe('uno-dos');
  });
});

describe('buildFileName', () => {
  it('omite partes vacías', () => {
    expect(buildFileName('texto', '***')).toBe('qr-texto');
  });
});
