'use client';
/* Free Barcode Generator: Code 128, EAN-13, UPC-A, Code 39, ITF-14 and
   Codabar rendered client-side with JsBarcode. Live preview, per-format
   validation with automatic GS1 check digits, SVG/PNG download, and a
   printable product label sheet (the seller differentiator). All math
   verified in node; nothing is uploaded. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import JsBarcode from 'jsbarcode';
import { validateBarcode, BARCODE_FORMATS } from '@/lib/barcode-utils';

const STR = {
  en: {
    format: 'Barcode format',
    formats: {
      code128: 'Code 128 (anything: SKUs, serials)',
      ean13: 'EAN-13 (retail products, EU)',
      upc: 'UPC-A (retail products, US)',
      code39: 'Code 39 (warehouse, IDs)',
      itf14: 'ITF-14 (shipping cartons)',
      codabar: 'Codabar (libraries, blood banks)',
    },
    value: 'Text or number to encode',
    placeholders: {
      code128: 'e.g. SKU-2026-0042',
      ean13: 'e.g. 590123412345 (12 digits, check digit added)',
      upc: 'e.g. 03600029145 (11 digits, check digit added)',
      code39: 'e.g. WH-A-1042',
      itf14: 'e.g. 1001234567890 (13 digits, check digit added)',
      codabar: 'e.g. A12345B (start/end with A-D)',
    },
    showText: 'Show human-readable text',
    barWidth: 'Bar width',
    height: 'Bar height',
    fg: 'Bar color',
    bg: 'Background',
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    autoCheckNote: 'Check digit added automatically.',
    sheetTitle: 'Print a product label sheet',
    sheetNote: 'Type a product name and price, pick how many labels fit your sheet, then print. Each label carries the barcode above.',
    productName: 'Product name',
    price: 'Price (optional)',
    labelCount: 'Labels per sheet',
    printSheet: 'Print label sheet',
    backToTool: 'Back to the generator',
    errors: {
      empty: 'Type something to encode first.',
      'too-long': 'That is too long for this format, shorten it.',
      'digits-only': 'This format only accepts digits.',
      'code128-charset': 'Code 128 accepts letters, digits and common symbols.',
      'ean13-length': 'EAN-13 needs exactly 12 digits (check digit is added) or 13 digits.',
      'ean13-check': 'The 13th digit does not match the EAN-13 check digit. Type 12 digits and it will be added for you.',
      'upc-length': 'UPC-A needs exactly 11 digits (check digit is added) or 12 digits.',
      'upc-check': 'The 12th digit does not match the UPC-A check digit. Type 11 digits and it will be added for you.',
      'code39-charset': 'Code 39 accepts A-Z, 0-9 and - . $ / + % and spaces.',
      'itf14-length': 'ITF-14 needs exactly 13 digits (check digit is added) or 14 digits.',
      'itf14-check': 'The 14th digit does not match the ITF-14 check digit. Type 13 digits and it will be added for you.',
      'codabar-format': 'Codabar must start and end with A, B, C or D, e.g. A12345B.',
      'unknown-format': 'Unknown barcode format.',
      render: 'Could not render this barcode with the current settings.',
    },
    seeAlso: 'More code generators',
    siblings: [
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
      { href: '/tools/wifi-qr-generator', label: 'WiFi QR Generator' },
    ],
    privacy: 'Privacy: barcodes are rendered entirely in your browser. Nothing you type is uploaded or stored.',
  },
  es: {
    format: 'Formato de código de barras',
    formats: {
      code128: 'Code 128 (cualquiera: SKUs, series)',
      ean13: 'EAN-13 (productos minoristas, UE)',
      upc: 'UPC-A (productos minoristas, EE. UU.)',
      code39: 'Code 39 (almacén, identificaciones)',
      itf14: 'ITF-14 (cajas de envío)',
      codabar: 'Codabar (bibliotecas, bancos de sangre)',
    },
    value: 'Texto o número a codificar',
    placeholders: {
      code128: 'p. ej. SKU-2026-0042',
      ean13: 'p. ej. 590123412345 (12 dígitos, se añade el dígito de control)',
      upc: 'p. ej. 03600029145 (11 dígitos, se añade el dígito de control)',
      code39: 'p. ej. WH-A-1042',
      itf14: 'p. ej. 1001234567890 (13 dígitos, se añade el dígito de control)',
      codabar: 'p. ej. A12345B (empieza/termina con A-D)',
    },
    showText: 'Mostrar texto legible',
    barWidth: 'Ancho de barra',
    height: 'Altura de barra',
    fg: 'Color de barras',
    bg: 'Fondo',
    downloadSvg: 'Descargar SVG',
    downloadPng: 'Descargar PNG',
    autoCheckNote: 'Dígito de control añadido automáticamente.',
    sheetTitle: 'Imprime una hoja de etiquetas',
    sheetNote: 'Escribe el nombre del producto y el precio, elige cuántas etiquetas caben en tu hoja e imprime. Cada etiqueta lleva el código de barras de arriba.',
    productName: 'Nombre del producto',
    price: 'Precio (opcional)',
    labelCount: 'Etiquetas por hoja',
    printSheet: 'Imprimir hoja de etiquetas',
    backToTool: 'Volver al generador',
    errors: {
      empty: 'Escribe algo para codificar primero.',
      'too-long': 'Es demasiado largo para este formato, acórtalo.',
      'digits-only': 'Este formato solo acepta dígitos.',
      'code128-charset': 'Code 128 acepta letras, dígitos y símbolos comunes.',
      'ean13-length': 'EAN-13 necesita exactamente 12 dígitos (se añade el control) o 13 dígitos.',
      'ean13-check': 'El dígito 13 no coincide con el dígito de control EAN-13. Escribe 12 dígitos y se añadirá solo.',
      'upc-length': 'UPC-A necesita exactamente 11 dígitos (se añade el control) o 12 dígitos.',
      'upc-check': 'El dígito 12 no coincide con el dígito de control UPC-A. Escribe 11 dígitos y se añadirá solo.',
      'code39-charset': 'Code 39 acepta A-Z, 0-9 y - . $ / + % y espacios.',
      'itf14-length': 'ITF-14 necesita exactamente 13 dígitos (se añade el control) o 14 dígitos.',
      'itf14-check': 'El dígito 14 no coincide con el dígito de control ITF-14. Escribe 13 dígitos y se añadirá solo.',
      'codabar-format': 'Codabar debe empezar y terminar con A, B, C o D, p. ej. A12345B.',
      'unknown-format': 'Formato de código de barras desconocido.',
      render: 'No se pudo generar el código con estos ajustes.',
    },
    seeAlso: 'Más generadores de códigos',
    siblings: [
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de códigos QR' },
      { href: '/es/tools/generador-qr-wifi', label: 'Generador QR de WiFi' },
    ],
    privacy: 'Privacidad: los códigos se generan por completo en tu navegador. Nada de lo que escribes se sube ni se almacena.',
  },
};

const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 };
const fieldStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', fontFamily: 'ui-monospace, Menlo, monospace' };
const btnStyle = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db',
  background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
};

export default function BarcodeTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [format, setFormat] = useState('code128');
  const [text, setText] = useState('SKU-2026-0042');
  const [showValue, setShowValue] = useState(true);
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(90);
  const [fg, setFg] = useState('#111111');
  const [bg, setBg] = useState('#ffffff');
  const [renderError, setRenderError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetName, setSheetName] = useState('');
  const [sheetPrice, setSheetPrice] = useState('');
  const [sheetCount, setSheetCount] = useState(24);
  const [sheetSvg, setSheetSvg] = useState('');
  const svgRef = useRef(null);

  const fmt = useMemo(() => BARCODE_FORMATS.find((f) => f.id === format), [format]);
  const validation = useMemo(() => validateBarcode(format, text), [format, text]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !validation.ok) {
      if (!validation.ok) setRenderError(t.errors[validation.errorKey] || t.errors.render);
      return;
    }
    try {
      JsBarcode(svg, validation.value, {
        format: fmt.jsb,
        width: barWidth,
        height,
        displayValue: showValue,
        background: bg,
        lineColor: fg,
        margin: 12,
        fontOptions: '600',
        fontSize: 15,
      });
      setRenderError(null);
      setSheetSvg(svg.outerHTML);
    } catch {
      setRenderError(t.errors.render);
    }
  }, [validation, fmt, barWidth, height, showValue, bg, fg, t]);

  const downloadSvg = () => {
    const svg = svgRef.current;
    if (!svg || !validation.ok) return;
    const str = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'barcode-' + validation.value + '.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const downloadPng = () => {
    const svg = svgRef.current;
    if (!svg || !validation.ok) return;
    const str = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const scale = 3;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'barcode-' + validation.value + '.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  };

  const doPrint = () => {
    document.body.classList.add('barcode-printing');
    const done = () => {
      document.body.classList.remove('barcode-printing');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };

  const labels = useMemo(
    () => Array.from({ length: sheetCount }, (_, i) => i),
    [sheetCount]
  );

  return (
    <div>
      <style>{`
        @media print {
          body.barcode-printing * { visibility: hidden; }
          body.barcode-printing .barcode-print-sheet,
          body.barcode-printing .barcode-print-sheet * { visibility: visible; }
          body.barcode-printing .barcode-print-sheet {
            position: absolute; left: 0; top: 0; width: 100%;
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 10px;
          }
          body.barcode-printing .barcode-label {
            border: 1px dashed #999; border-radius: 6px; padding: 8px;
            text-align: center; break-inside: avoid;
          }
          body.barcode-printing .barcode-label svg { max-width: 100%; height: 52px; }
        }
      `}</style>

      <div style={rowStyle}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          {t.format}:{' '}
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ ...fieldStyle, fontFamily: 'inherit' }} aria-label={t.format}>
            {BARCODE_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{t.formats[f.id]}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={rowStyle}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600, flex: '1 1 280px' }}>
          {t.value}:{' '}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholders[format]}
            spellCheck={false}
            style={{ ...fieldStyle, width: '100%', maxWidth: 420 }}
            aria-label={t.value}
          />
        </label>
      </div>

      <div style={{ ...rowStyle, gap: 20 }}>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={showValue} onChange={(e) => setShowValue(e.target.checked)} />
          {t.showText}
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          {t.barWidth}:{' '}
          <input type="range" min="1" max="4" step="1" value={barWidth} onChange={(e) => setBarWidth(Number(e.target.value))} style={{ width: 90 }} aria-label={t.barWidth} />
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{barWidth}</span>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          {t.height}:{' '}
          <input type="range" min="50" max="150" step="10" value={height} onChange={(e) => setHeight(Number(e.target.value))} style={{ width: 90 }} aria-label={t.height} />
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{height}px</span>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          {t.fg}:{' '}
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 40, height: 32, border: '1px solid #d1d5db', borderRadius: 6, padding: 2, cursor: 'pointer', background: '#fff' }} aria-label={t.fg} />
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          {t.bg}:{' '}
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 40, height: 32, border: '1px solid #d1d5db', borderRadius: 6, padding: 2, cursor: 'pointer', background: '#fff' }} aria-label={t.bg} />
        </label>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, background: '#fff', marginBottom: 16, textAlign: 'center', overflowX: 'auto' }}>
        {validation.ok ? (
          <>
            <svg ref={svgRef} role="img" aria-label={'barcode ' + validation.value} />
            {validation.autoCheck && (
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8 }}>{t.autoCheckNote}</div>
            )}
          </>
        ) : (
          <>
            <svg ref={svgRef} style={{ display: 'none' }} />
            <div style={{ color: '#b91c1c', fontSize: '0.95rem', padding: '24px 0' }}>
              {t.errors[validation.errorKey] || t.errors.render}
            </div>
          </>
        )}
      </div>

      {renderError && validation.ok && (
        <div style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: 12 }}>{renderError}</div>
      )}

      <div style={{ ...rowStyle }}>
        <button type="button" onClick={downloadSvg} disabled={!validation.ok} className="btn btn-primary" style={!validation.ok ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          {t.downloadSvg}
        </button>
        <button type="button" onClick={downloadPng} disabled={!validation.ok} className="btn btn-ghost-light" style={!validation.ok ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          {t.downloadPng}
        </button>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#f9fafb', marginTop: 8 }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>{t.sheetTitle}</h2>
        <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '0 0 14px' }}>{t.sheetNote}</p>
        {!sheetOpen ? (
          <button type="button" onClick={() => setSheetOpen(true)} disabled={!validation.ok} style={{ ...btnStyle, opacity: validation.ok ? 1 : 0.5 }}>
            {t.printSheet}
          </button>
        ) : (
          <>
            <div style={rowStyle}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {t.productName}:{' '}
                <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} style={{ ...fieldStyle, width: 200 }} aria-label={t.productName} />
              </label>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {t.price}:{' '}
                <input value={sheetPrice} onChange={(e) => setSheetPrice(e.target.value)} placeholder="$9.99" style={{ ...fieldStyle, width: 120 }} aria-label={t.price} />
              </label>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {t.labelCount}:{' '}
                <select value={sheetCount} onChange={(e) => setSheetCount(Number(e.target.value))} style={fieldStyle} aria-label={t.labelCount}>
                  {[12, 24, 30, 48].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button type="button" onClick={doPrint} className="btn btn-primary">{t.printSheet}</button>
              <button type="button" onClick={() => setSheetOpen(false)} style={btnStyle}>{t.backToTool}</button>
            </div>
            <div className="barcode-print-sheet" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {labels.map((i) => (
                <div key={i} className="barcode-label" style={{ border: '1px dashed #9ca3af', borderRadius: 8, padding: 10, textAlign: 'center', background: '#fff' }}>
                  {sheetName && <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{sheetName}</div>}
                  {sheetSvg && <div dangerouslySetInnerHTML={{ __html: sheetSvg }} style={{ display: 'flex', justifyContent: 'center' }} />}
                  {sheetPrice && <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4 }}>{sheetPrice}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: '0.9rem' }}>
        <strong>{t.seeAlso}:</strong>{' '}
        {t.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </div>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 12 }}>{t.privacy}</p>
    </div>
  );
}
