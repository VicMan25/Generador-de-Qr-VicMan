import { describe, expect, it } from 'vitest';
import { textFormat } from './text';

describe('textFormat.build', () => {
  it('conserva el texto exacto: espacios, saltos de línea, tildes y emojis', () => {
    const text = '  Hola, ¿qué tal?\nLínea dos — ñandú 🦜\n\n';
    const result = textFormat.build({ text });
    expect(result.ok && result.payload).toBe(text);
  });

  it('rechaza texto vacío o solo con espacios', () => {
    expect(textFormat.build({ text: '' }).ok).toBe(false);
    expect(textFormat.build({ text: ' \n\t ' }).ok).toBe(false);
  });

  it('no interpreta HTML: el contenido se codifica como texto literal', () => {
    const text = '<script>alert(1)</script>';
    const result = textFormat.build({ text });
    expect(result.ok && result.payload).toBe(text);
  });
});

describe('textFormat.fileName', () => {
  it('usa las primeras palabras sin tildes ni símbolos', () => {
    expect(textFormat.fileName({ text: '¡Bienvenidos a la Feria de Ciencias 2026!' })).toBe(
      'qr-texto-bienvenidos-a-la-feria',
    );
  });

  it('funciona aunque el texto no tenga letras', () => {
    expect(textFormat.fileName({ text: '🎉🎉' })).toBe('qr-texto');
  });
});
