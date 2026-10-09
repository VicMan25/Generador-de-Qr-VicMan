import { describe, expect, it } from 'vitest';
import { detectFileType, fileLinkFormat } from './fileLink';

describe('documento o archivo por URL', () => {
  it('codifica el enlace exacto', () => {
    const result = fileLinkFormat.build({ url: 'https://ejemplo.com/docs/Programa%20Feria.pdf' });
    expect(result.ok && result.payload).toBe('https://ejemplo.com/docs/Programa%20Feria.pdf');
  });

  it('detecta el tipo por la extensión', () => {
    expect(detectFileType('https://a.com/x/informe.PDF')).toBe('PDF');
    expect(detectFileType('https://a.com/foto.jpeg?v=2')).toBe('imagen');
    expect(detectFileType('https://a.com/notas.xlsx')).toBe('hoja de cálculo');
    expect(detectFileType('https://drive.google.com/file/d/abc/view')).toBeNull();
  });

  it('da instrucciones según el servicio', () => {
    const drive = fileLinkFormat.build({ url: 'https://drive.google.com/file/d/abc123/view?usp=sharing' });
    expect(drive.notices.some((n) => n.text.startsWith('Google Drive'))).toBe(true);
    const onedrive = fileLinkFormat.build({ url: 'https://1drv.ms/b/s!abc' });
    expect(onedrive.notices.some((n) => n.text.startsWith('OneDrive'))).toBe(true);
  });

  it('hereda la validación de enlaces', () => {
    const result = fileLinkFormat.build({ url: 'file:///C:/Users/ana/informe.pdf' });
    expect(!result.ok && result.errors.url).toBeTruthy();
  });

  it('usa el nombre del archivo en la descarga', () => {
    expect(fileLinkFormat.fileName({ url: 'https://ejemplo.com/docs/Programa%20Feria.pdf' })).toBe(
      'qr-archivo-programa-feria',
    );
    expect(fileLinkFormat.fileName({ url: 'https://drive.google.com/file/d/abc/view' })).toBe('qr-archivo');
    expect(fileLinkFormat.fileName({ url: 'https://ejemplo.com/mal%E0.pdf' })).toBe('qr-archivo-mal-e0');
  });
});
