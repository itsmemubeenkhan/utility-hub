'use client';
/* ISBN Validator and Converter: validate ISBN-10 and ISBN-13 numbers
   one at a time or in bulk (up to 100 lines), convert between formats,
   compute a missing check digit, look up the registration group, and
   preview the EAN-13 barcode of any valid ISBN-13. Copy and .txt/.csv
   download included. 100% in your browser, nothing is uploaded. A 979
   ISBN-13 has no ISBN-10 form, and the tool says so instead of
   inventing one. Full hyphenation needs the publisher range table,
   which this tool does not ship. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import JsBarcode from 'jsbarcode';
import {
  validateIsbn,
  validateBulk,
  computeIsbn10CheckDigit,
  computeIsbn13CheckDigit,
  lookupGroup,
  splitIsbn13,
  SAMPLE_ISBN13,
  SAMPLE_ISBN10,
  SAMPLE_ISBN10_X,
  SAMPLE_BULK,
} from '@/lib/isbn-utils';

const REASONS = {
  en: {
    empty: 'Empty input.',
    'wrong-length': 'Wrong length: an ISBN must have 10 or 13 characters (hyphens and spaces do not count).',
    'illegal-character': 'Illegal character: only digits are allowed, plus X as the last character of an ISBN-10.',
    'illegal-x-position': 'Illegal X: the letter X is only allowed as the last character of an ISBN-10.',
    'wrong-prefix': 'Wrong ISBN-13 prefix: an ISBN-13 must start with 978 or 979.',
    checksum: 'Checksum failure: the correct check digit is {expected}, not {actual}.',
  },
  es: {
    empty: 'Entrada vacía.',
    'wrong-length': 'Longitud incorrecta: un ISBN debe tener 10 o 13 caracteres (guiones y espacios no cuentan).',
    'illegal-character': 'Carácter ilegal: solo se permiten dígitos, más X como último carácter de un ISBN-10.',
    'illegal-x-position': 'X ilegal: la letra X solo se permite como último carácter de un ISBN-10.',
    'wrong-prefix': 'Prefijo ISBN-13 incorrecto: un ISBN-13 debe empezar con 978 o 979.',
    checksum: 'Fallo de suma de control: el dígito de control correcto es {expected}, no {actual}.',
  },
};

const STR = {
  en: {
    singleTitle: 'Validate one ISBN',
    singleLabel: 'ISBN',
    singlePlaceholder: 'Paste an ISBN-10 or ISBN-13, hyphens optional...',
    valid: 'Valid',
    invalid: 'Invalid',
    format: 'Format',
    isbn10: 'ISBN-10',
    isbn13: 'ISBN-13',
    canonical: 'Canonical digits',
    convertedLabel: 'Converted form',
    noConvert: 'This 979 ISBN-13 has no ISBN-10 form.',
    groupLabel: 'Registration group',
    groupUnknown: 'Group not in our table.',
    splitLabel: 'Prefix / group split',
    splitNote: 'Full hyphenation needs the publisher range table, which this tool does not include.',
    barcodeTitle: 'EAN-13 barcode preview',
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    checkTitle: 'Check-digit calculator',
    checkLabel: 'First digits',
    checkPlaceholder: '9 digits for ISBN-10, 12 digits for ISBN-13',
    checkResult10: 'ISBN-10 check digit',
    checkResult13: 'ISBN-13 check digit',
    checkHint: 'Enter the first 9 digits to get the ISBN-10 check digit (X when the value is 10), or the first 12 digits for the ISBN-13 check digit.',
    bulkTitle: 'Bulk validation',
    bulkLabel: 'ISBNs, one per line (up to 100)',
    bulkPlaceholder: '9780061120084\n0306406152\n...',
    bulkCounts: '{valid} valid · {invalid} invalid · {total} total',
    bulkLine: 'Line',
    bulkIsbn: 'ISBN',
    bulkVerdict: 'Verdict',
    bulkReason: 'Reason',
    downloadCsv: 'Download .csv',
    sample: 'Sample',
    sampleIsbn13: 'ISBN-13: 9780061120084',
    sampleIsbn10: 'ISBN-10: 0306406152',
    sampleIsbn10X: 'ISBN-10 with X: 080442957X',
    sampleBulk: 'Bulk sample (5 ISBNs)',
    swap: 'Swap',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    emptySingle: 'Type an ISBN above to check it.',
    emptyBulk: 'Paste ISBNs above to validate them in bulk.',
    privacy: 'Privacy: validation, conversion, check-digit calculation, group lookup and barcode rendering run locally in your browser. Nothing you type is uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/barcode-generator', label: 'Barcode Generator' },
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
      { href: '/tools/hash-generator', label: 'Hash Generator' },
    ],
  },
  es: {
    singleTitle: 'Validar un ISBN',
    singleLabel: 'ISBN',
    singlePlaceholder: 'Pega un ISBN-10 o ISBN-13, guiones opcionales...',
    valid: 'Válido',
    invalid: 'Inválido',
    format: 'Formato',
    isbn10: 'ISBN-10',
    isbn13: 'ISBN-13',
    canonical: 'Dígitos canónicos',
    convertedLabel: 'Forma convertida',
    noConvert: 'Este ISBN-13 con prefijo 979 no tiene forma ISBN-10.',
    groupLabel: 'Grupo de registro',
    groupUnknown: 'Grupo no está en nuestra tabla.',
    splitLabel: 'División prefijo / grupo',
    splitNote: 'La guionización completa necesita la tabla de rangos de editoriales, que esta herramienta no incluye.',
    barcodeTitle: 'Vista previa del código de barras EAN-13',
    downloadSvg: 'Descargar SVG',
    downloadPng: 'Descargar PNG',
    checkTitle: 'Calculadora de dígito de control',
    checkLabel: 'Primeros dígitos',
    checkPlaceholder: '9 dígitos para ISBN-10, 12 dígitos para ISBN-13',
    checkResult10: 'Dígito de control ISBN-10',
    checkResult13: 'Dígito de control ISBN-13',
    checkHint: 'Escribe los primeros 9 dígitos para obtener el dígito de control ISBN-10 (X cuando el valor es 10), o los primeros 12 dígitos para el dígito de control ISBN-13.',
    bulkTitle: 'Validación masiva',
    bulkLabel: 'ISBN, uno por línea (hasta 100)',
    bulkPlaceholder: '9780061120084\n0306406152\n...',
    bulkCounts: '{valid} válidos · {invalid} inválidos · {total} en total',
    bulkLine: 'Línea',
    bulkIsbn: 'ISBN',
    bulkVerdict: 'Veredicto',
    bulkReason: 'Motivo',
    downloadCsv: 'Descargar .csv',
    sample: 'Ejemplo',
    sampleIsbn13: 'ISBN-13: 9780061120084',
    sampleIsbn10: 'ISBN-10: 0306406152',
    sampleIsbn10X: 'ISBN-10 con X: 080442957X',
    sampleBulk: 'Ejemplo masivo (5 ISBN)',
    swap: 'Intercambiar',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    emptySingle: 'Escribe un ISBN arriba para comprobarlo.',
    emptyBulk: 'Pega ISBN arriba para validarlos en masa.',
    privacy: 'Privacidad: la validación, la conversión, el cálculo del dígito de control, la consulta de grupo y el dibujo del código de barras corren localmente en tu navegador. Nada de lo que escribes se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas de desarrollo',
    siblings: [
      { href: '/es/tools/generador-de-codigos-de-barras', label: 'Generador de Códigos de Barras' },
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de Códigos QR' },
      { href: '/es/tools/generador-de-hash', label: 'Generador de Hash' },
    ],
  },
};

const btnStyle = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};
const primaryBtnStyle = { ...btnStyle, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
const labelStyle = { fontSize: '0.95rem', fontWeight: 600 };
const areaStyle = {
  width: '100%',
  minHeight: 110,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 };
const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #d1d5db', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', verticalAlign: 'top' };

function reasonText(lang, result) {
  if (result.valid || !result.reason) return '';
  const tpl = (REASONS[lang] || REASONS.en)[result.reason] || result.reason;
  return tpl.replace('{expected}', result.expectedCheck ?? '').replace('{actual}', result.actualCheck ?? '');
}

export default function IsbnTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [bulk, setBulk] = useState('');
  const [checkInput, setCheckInput] = useState('');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const result = useMemo(() => (input.trim() ? validateIsbn(input) : null), [input]);
  const group = useMemo(() => (result && result.valid ? lookupGroup(result.cleaned) : null), [result]);
  const split = useMemo(() => (result && result.valid && result.type === 'isbn13' ? splitIsbn13(result.cleaned) : null), [result]);
  const bulkResult = useMemo(() => (bulk.trim() ? validateBulk(bulk) : null), [bulk]);
  const checkResult = useMemo(() => {
    const digits = checkInput.replace(/[^0-9]/g, '');
    if (digits.length === 9) return { kind: 'isbn10', digit: computeIsbn10CheckDigit(digits) };
    if (digits.length === 12) return { kind: 'isbn13', digit: computeIsbn13CheckDigit(digits) };
    return null;
  }, [checkInput]);

  const barcodeValue = result && result.valid && result.type === 'isbn13' ? result.cleaned : null;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !barcodeValue) return;
    try {
      JsBarcode(svg, barcodeValue, {
        format: 'EAN13',
        width: 2,
        height: 90,
        displayValue: true,
        background: '#ffffff',
        lineColor: '#111111',
        margin: 12,
        fontOptions: '600',
        fontSize: 15,
      });
    } catch {
      /* invalid barcode value; validation already guards this */
    }
  }, [barcodeValue]);

  const copySingle = async () => {
    if (!result) return;
    const lines = [
      result.raw,
      (result.valid ? t.valid : t.invalid) + ' ' + (result.type === 'isbn10' ? t.isbn10 : result.type === 'isbn13' ? t.isbn13 : ''),
      result.valid && result.converted ? t.convertedLabel + ': ' + result.converted : reasonText(lang, result),
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadSingle = () => {
    if (!result) return;
    const lines = [
      result.raw,
      (result.valid ? t.valid : t.invalid) + ' ' + (result.type === 'isbn10' ? t.isbn10 : result.type === 'isbn13' ? t.isbn13 : ''),
      result.valid && result.converted ? t.convertedLabel + ': ' + result.converted : reasonText(lang, result),
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isbn-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!bulkResult) return;
    const rows = [['ISBN', t.bulkVerdict, t.bulkReason]];
    for (const r of bulkResult.results) {
      rows.push([r.line, r.valid ? t.valid : t.invalid, r.valid ? '' : reasonText(lang, r)]);
    }
    const csv = rows.map((row) => row.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv + '\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isbn-bulk-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBarcodeSvg = () => {
    const svg = svgRef.current;
    if (!svg || !barcodeValue) return;
    const str = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'isbn-' + barcodeValue + '.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const downloadBarcodePng = () => {
    const svg = svgRef.current;
    if (!svg || !barcodeValue) return;
    const str = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const scale = 3;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'isbn-' + barcodeValue + '.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.singleTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_ISBN13)} style={btnStyle}>{t.sampleIsbn13}</button>
        <button type="button" onClick={() => setInput(SAMPLE_ISBN10)} style={btnStyle}>{t.sampleIsbn10}</button>
        <button type="button" onClick={() => setInput(SAMPLE_ISBN10_X)} style={btnStyle}>{t.sampleIsbn10X}</button>
        <button type="button" onClick={() => setBulk(SAMPLE_BULK)} style={btnStyle}>{t.sampleBulk}</button>
        <button type="button" onClick={() => { if (result && result.converted) setInput(result.converted); }} disabled={!result || !result.converted} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => { setInput(''); setBulk(''); setCheckInput(''); }} style={btnStyle}>{t.clear}</button>
      </div>

      <label htmlFor="isbn-input" style={labelStyle}>{t.singleLabel}</label>
      <input
        id="isbn-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.singlePlaceholder}
        style={{ ...inputStyle, marginTop: 6 }}
      />

      {result ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px', color: result.valid ? '#15803d' : '#b91c1c' }}>
            {result.valid ? '✓ ' + t.valid : '✗ ' + t.invalid}
            {result.type ? ' · ' + (result.type === 'isbn10' ? t.isbn10 : t.isbn13) : ''}
          </p>
          {!result.valid && (
            <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 8px' }}>{reasonText(lang, result)}</p>
          )}
          {result.valid && (
            <dl style={{ fontSize: '0.95rem', lineHeight: 1.8, margin: '0 0 8px' }}>
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.canonical}: </dt><dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.cleaned}</dd></div>
              <div>
                <dt style={{ display: 'inline', fontWeight: 600 }}>{t.convertedLabel}: </dt>
                <dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {result.converted || t.noConvert}
                </dd>
              </div>
              <div>
                <dt style={{ display: 'inline', fontWeight: 600 }}>{t.groupLabel}: </dt>
                <dd style={{ display: 'inline', margin: 0 }}>{group ? group.group + ' - ' + group.area : t.groupUnknown}</dd>
              </div>
              {split && (
                <div>
                  <dt style={{ display: 'inline', fontWeight: 600 }}>{t.splitLabel}: </dt>
                  <dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {split.prefix}-{split.group}-{split.remainder}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {split && <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '0 0 8px' }}>{t.splitNote}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" onClick={copySingle} style={btnStyle}>{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={downloadSingle} style={btnStyle}>{t.download}</button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 12 }}>{t.emptySingle}</p>
      )}

      {barcodeValue && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.barcodeTitle}</h2>
          <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={downloadBarcodeSvg} style={btnStyle}>{t.downloadSvg}</button>
            <button type="button" onClick={downloadBarcodePng} style={btnStyle}>{t.downloadPng}</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.checkTitle}</h2>
        <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.checkHint}</p>
        <label htmlFor="isbn-check" style={labelStyle}>{t.checkLabel}</label>
        <input
          id="isbn-check"
          value={checkInput}
          onChange={(e) => setCheckInput(e.target.value)}
          placeholder={t.checkPlaceholder}
          style={{ ...inputStyle, marginTop: 6 }}
        />
        {checkResult && (
          <p style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12 }}>
            {checkResult.kind === 'isbn10' ? t.checkResult10 : t.checkResult13}:{' '}
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{checkResult.digit}</span>
          </p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.bulkTitle}</h2>
        <label htmlFor="isbn-bulk" style={labelStyle}>{t.bulkLabel}</label>
        <textarea
          id="isbn-bulk"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={t.bulkPlaceholder}
          style={{ ...areaStyle, marginTop: 6 }}
        />
        {bulkResult ? (
          <div>
            <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 12 }}>
              {t.bulkCounts.replace('{valid}', bulkResult.valid).replace('{invalid}', bulkResult.invalid).replace('{total}', bulkResult.total)}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t.bulkLine}</th>
                    <th style={thStyle}>{t.bulkIsbn}</th>
                    <th style={thStyle}>{t.bulkVerdict}</th>
                    <th style={thStyle}>{t.bulkReason}</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResult.results.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{r.line}</td>
                      <td style={{ ...tdStyle, color: r.valid ? '#15803d' : '#b91c1c', fontWeight: 600 }}>{r.valid ? '✓ ' + t.valid : '✗ ' + t.invalid}</td>
                      <td style={tdStyle}>{r.valid ? '' : reasonText(lang, r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={downloadCsv} style={btnStyle}>{t.downloadCsv}</button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 12 }}>{t.emptyBulk}</p>
        )}
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 24 }}>🔒 {t.privacy}</p>

      <div style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.seeAlso}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {t.siblings.map((s) => (
            <Link key={s.href} href={s.href} style={{ ...btnStyle, textDecoration: 'none', color: '#1d4ed8' }}>{s.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
