'use client';
/* Hex to RGB Color Converter: hex <-> rgb/hsl two-way conversion, alpha
   slider, copy-to-clipboard CSS snippets, and a 9-step tints/shades
   brand-palette generator. All math verified in node; runs fully local. */
import { useMemo, useState } from 'react';
import Link from 'next/link';

function normHex(raw) {
  let h = String(raw || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return /^[0-9a-fA-F]{6}$/.test(h) ? '#' + h.toLowerCase() : null;
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function mixChan(c, target, amt) { return Math.round(c + (target - c) * amt); }
function palette(base, steps = 9) {
  const out = [];
  for (let i = 0; i < steps; i += 1) {
    const amt = Math.abs(i / (steps - 1) - 0.5) * 2; // 1 at ends, 0 center
    const target = i < steps / 2 ? 255 : 0;
    out.push(rgbToHex(mixChan(base.r, target, amt), mixChan(base.g, target, amt), mixChan(base.b, target, amt)));
  }
  return out;
}

const STR = {
  en: {
    hexLabel: 'HEX color',
    picker: 'Pick a color',
    orRgb: 'Or start from RGB values',
    rgb: 'RGB',
    hsl: 'HSL',
    hexOut: 'HEX',
    cssOut: 'CSS snippets',
    copy: 'Copy',
    copied: 'Copied!',
    alpha: 'Opacity',
    paletteTitle: 'Brand palette from this color',
    paletteNote: 'Nine steps from white through your color to black: tints on the left, shades on the right. Click any swatch to copy its HEX.',
    invalid: 'Not a valid hex code. Use 3 or 6 hex digits, e.g. #2563eb.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
      { href: '/tools/lorem-ipsum-generator', label: 'Lorem Ipsum Generator' },
    ],
    privacy: 'Privacy: conversion happens entirely in your browser. Nothing is uploaded or stored.',
  },
  es: {
    hexLabel: 'Color HEX',
    picker: 'Elige un color',
    orRgb: 'O empieza desde valores RGB',
    rgb: 'RGB',
    hsl: 'HSL',
    hexOut: 'HEX',
    cssOut: 'Fragmentos CSS',
    copy: 'Copiar',
    copied: '¡Copiado!',
    alpha: 'Opacidad',
    paletteTitle: 'Paleta de marca desde este color',
    paletteNote: 'Nueve pasos desde el blanco hasta tu color y hasta el negro: matices claros a la izquierda, oscuros a la derecha. Haz clic en cualquier muestra para copiar su HEX.',
    invalid: 'No es un código hex válido. Usa 3 o 6 dígitos hex, por ejemplo #2563eb.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
      { href: '/es/tools/generador-de-lorem-ipsum', label: 'Generador de Lorem Ipsum' },
    ],
    privacy: 'Privacidad: la conversión ocurre por completo en tu navegador. Nada se sube ni se almacena.',
  },
};

const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 };
const fieldStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', fontFamily: 'ui-monospace, Menlo, monospace', width: 130 };
const btnStyle = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db',
  background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
};
const outCard = {
  border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px',
  background: '#f9fafb', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.9rem',
};

async function copyText(text, setCopied) {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch { /* clipboard unavailable */ }
}

export default function HexColorTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [hexText, setHexText] = useState('#2563eb');
  const [alpha, setAlpha] = useState(100);
  const [copiedKey, setCopiedKey] = useState(null);
  const setCopied = (key) => setCopiedKey(key);

  const valid = normHex(hexText);
  const rgb = valid ? hexToRgb(valid) : null;
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const a = (alpha / 100).toFixed(2);
  const pal = useMemo(() => (rgb ? palette(rgb) : []), [rgb]);

  const outputs = rgb ? [
    { key: 'hex', label: t.hexOut, value: valid.toUpperCase() },
    { key: 'rgb', label: t.rgb, value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'rgba', label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` },
    { key: 'hsl', label: t.hsl, value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ] : [];

  const setFromRgb = (r, g, b) => setHexText(rgbToHex(r, g, b));

  return (
    <div>
      <div style={rowStyle}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          {t.hexLabel}:{' '}
          <input value={hexText} onChange={(e) => setHexText(e.target.value)} style={fieldStyle} spellCheck={false} maxLength={7} aria-label={t.hexLabel} />
        </label>
        <label style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          {t.picker}:{' '}
          <input
            type="color"
            value={valid || '#2563eb'}
            onChange={(e) => setHexText(e.target.value)}
            style={{ width: 44, height: 40, border: '1px solid #d1d5db', borderRadius: 8, padding: 2, cursor: 'pointer', background: '#fff' }}
            aria-label={t.picker}
          />
        </label>
        {valid && (
          <div style={{ width: 56, height: 40, borderRadius: 8, border: '1px solid #d1d5db', background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` }} aria-hidden="true" />
        )}
      </div>

      {valid ? (
        <>
          <div style={{ ...rowStyle, alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>{t.orRgb}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['R', rgb.r], ['G', rgb.g], ['B', rgb.b]].map(([ch, val]) => (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{ch}</span>
                    <input
                      type="number" min="0" max="255" value={val}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                        setFromRgb(ch === 'R' ? v : rgb.r, ch === 'G' ? v : rgb.g, ch === 'B' ? v : rgb.b);
                      }}
                      style={{ ...fieldStyle, width: 76 }}
                      aria-label={`${t.rgb} ${ch}`}
                    />
                  </label>
                ))}
              </div>
            </div>
            <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>{t.alpha}: {alpha}%</div>
              <input type="range" min="0" max="100" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} style={{ width: 140, accentColor: '#2563eb' }} aria-label={t.alpha} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 8 }}>
            {outputs.map((o) => (
              <div key={o.key} style={outCard}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>{o.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span>{o.value}</span>
                  <button type="button" onClick={() => copyText(o.value, () => setCopied(o.key))} style={{ ...btnStyle, padding: '4px 10px' }}>
                    {copiedKey === o.key ? t.copied : t.copy}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', margin: '22px 0 6px' }}>{t.paletteTitle}</h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 10 }}>{t.paletteNote}</p>
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 6 }}>
            {pal.map((c) => (
              <button
                key={c} type="button" title={c.toUpperCase()}
                onClick={() => copyText(c.toUpperCase(), () => setCopied('pal-' + c))}
                style={{ flex: 1, height: 64, background: c, border: 0, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'ui-monospace, Menlo, monospace', color: pal.indexOf(c) < 4 ? '#111827' : '#f9fafb' }}
              >
                {copiedKey === 'pal-' + c ? '✓' : c.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{t.invalid}</p>
      )}

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>🔒 {t.privacy}</p>

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
