'use client';
/* QR Code Generator - free, no signup, client-side.
   Differentiators vs the thin rankers: SVG + PNG download, custom colors,
   error-correction choice, and an honest capacity warning. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { qrFits, qrMaxChars } from '@/lib/qr-tools';

const STR = {
  en: {
    contentLabel: 'Text or link to encode',
    placeholder: 'https://example.com  -  or any text',
    sizeLabel: 'Download size',
    eccLabel: 'Error correction',
    eccHint: 'Higher levels survive damage (logos, print wear) but hold less data.',
    eccNames: { L: 'Low (7%)', M: 'Medium (15%)', Q: 'High (25%)', H: 'Highest (30%)' },
    fgLabel: 'QR color',
    bgLabel: 'Background',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    copy: 'Copy text',
    copied: 'Copied!',
    empty: 'Type something above and your QR code appears here instantly.',
    tooLong: 'Too long for a QR code at this error-correction level.',
    tooLongFix: 'Shorten the text or pick a lower error-correction level.',
    maxNote: 'Max about {n} characters at this level.',
    seeAlso: 'More code tools',
    siblings: [
      { href: '/tools/wifi-qr-generator', label: 'WiFi QR Generator' },
      { href: '/tools/character-counter', label: 'Character Counter' },
    ],
  },
  es: {
    contentLabel: 'Texto o enlace para codificar',
    placeholder: 'https://ejemplo.com  -  o cualquier texto',
    sizeLabel: 'Tamaño de descarga',
    eccLabel: 'Corrección de errores',
    eccHint: 'Niveles más altos resisten daños (logos, desgaste) pero guardan menos datos.',
    eccNames: { L: 'Baja (7%)', M: 'Media (15%)', Q: 'Alta (25%)', H: 'Máxima (30%)' },
    fgLabel: 'Color del QR',
    bgLabel: 'Fondo',
    downloadPng: 'Descargar PNG',
    downloadSvg: 'Descargar SVG',
    copy: 'Copiar texto',
    copied: '¡Copiado!',
    empty: 'Escribe algo arriba y tu código QR aparece aquí al instante.',
    tooLong: 'Demasiado largo para un QR con este nivel de corrección.',
    tooLongFix: 'Acorta el texto o elige un nivel de corrección más bajo.',
    maxNote: 'Máximo aprox. {n} caracteres con este nivel.',
    seeAlso: 'Más herramientas de códigos',
    siblings: [
      { href: '/es/tools/generador-qr-wifi', label: 'Generador QR de WiFi' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
    ],
  },
};

const SIZES = [256, 512, 1024];

export default function QRCodeGenerator({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [text, setText] = useState('');
  const [size, setSize] = useState(512);
  const [ecc, setEcc] = useState('M');
  const [fg, setFg] = useState('#0f172a');
  const [bg, setBg] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const canvasRef = useRef(null);

  const fits = useMemo(() => qrFits(text, ecc), [text, ecc]);
  const canRender = text.trim().length > 0 && fits;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canRender) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    let alive = true;
    setRenderError(false);
    QRCode.toCanvas(canvas, text, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: ecc,
      color: { dark: fg, light: bg },
    }).catch(() => {
      if (alive) setRenderError(true);
    });
    return () => {
      alive = false;
    };
  }, [text, ecc, fg, bg, canRender]);

  const downloadPng = async () => {
    if (!canRender) return;
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecc,
      color: { dark: fg, light: bg },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qr-code.png';
    a.click();
  };

  const downloadSvg = async () => {
    if (!canRender) return;
    const svg = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: ecc,
      margin: 2,
      color: { dark: fg, light: bg },
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      <div className="field">
        <label>{t.contentLabel}</label>
        <textarea
          value={text}
          rows={3}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
            borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 4 }}>
        <div className="field">
          <label>{t.sizeLabel}</label>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10 }}>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s} x {s} px</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{t.eccLabel}</label>
          <select value={ecc} onChange={(e) => setEcc(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10 }}>
            {Object.entries(t.eccNames).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="hint">{t.eccHint}</div>
        </div>
        <div className="field">
          <label>{t.fgLabel}</label>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: '100%', height: 42, padding: 4, border: '1px solid var(--line)', borderRadius: 10, background: '#fff' }} />
        </div>
        <div className="field">
          <label>{t.bgLabel}</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: '100%', height: 42, padding: 4, border: '1px solid var(--line)', borderRadius: 10, background: '#fff' }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
        {canRender && !renderError ? (
          <canvas ref={canvasRef} style={{ width: 280, height: 280, maxWidth: '100%', border: '1px solid var(--line)', borderRadius: 12 }} />
        ) : (
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        )}
        {!canRender && (
          <p style={{ color: 'var(--muted)', margin: '40px 0' }}>
            {text.trim() ? t.tooLong + ' ' + t.tooLongFix : t.empty}
            {text.trim() && !fits && <><br />{t.maxNote.replace('{n}', qrMaxChars(ecc).toLocaleString())}</>}
          </p>
        )}
        {renderError && <p style={{ color: '#dc2626' }}>{t.tooLong} {t.tooLongFix}</p>}
        {canRender && !renderError && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={downloadPng}>{t.downloadPng}</button>
            <button type="button" className="btn btn-ghost-light" onClick={downloadSvg}>{t.downloadSvg}</button>
            <button type="button" className="btn btn-ghost-light" onClick={onCopy}>{copied ? t.copied : t.copy}</button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 22, fontSize: '0.95rem' }}>
        <strong>{t.seAlso}:</strong>{' '}
        {t.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
