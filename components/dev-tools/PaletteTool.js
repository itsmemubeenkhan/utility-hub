'use client';
/* Color Palette Generator: 5-color palettes from one base color with 6
   harmony rules, lock and regenerate, curated starter palettes, a WCAG
   contrast checker and CSS, Tailwind and JSON export. Everything runs
   in the browser: nothing is uploaded, stored or sent anywhere. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PALETTE_RULES,
  PALETTE_PRESETS,
  normalizeHex,
  buildPalette,
  randomPalette,
  defaultPalette,
  hexToRgbString,
  hexToHslString,
  contrastRatio,
  wcagRating,
  exportCssVars,
  exportTailwind,
  exportJson,
  exportHexList,
} from '@/lib/palette-utils';

const STR = {
  en: {
    baseColor: 'Base color',
    invalidHex: 'Invalid HEX color.',
    rule: 'Harmony rule',
    rules: {
      complementary: 'Complementary',
      analogous: 'Analogous',
      triadic: 'Triadic',
      'split-complementary': 'Split complementary',
      tetradic: 'Tetradic',
      monochromatic: 'Monochromatic',
    },
    ruleHints: {
      complementary: 'Your base plus the color opposite it on the wheel: bold, high contrast.',
      analogous: 'Neighbors on the wheel: calm and cohesive.',
      triadic: 'Three colors spaced evenly around the wheel: vibrant but balanced.',
      'split-complementary': 'A softer take on complementary contrast.',
      tetradic: 'Two complementary pairs: rich and varied.',
      monochromatic: 'One hue, five lightness steps: clean and minimal.',
    },
    palette: 'Your palette',
    clickCopy: 'Click a swatch to copy it.',
    copyFormat: 'Copy as',
    lock: 'Lock',
    unlock: 'Unlock',
    locked: 'Locked',
    regenerate: 'Regenerate unlocked',
    regenerateHint: 'Press the spacebar to regenerate the unlocked colors.',
    random: 'Random palette',
    presets: 'Starter palettes',
    presetLabels: {
      sunset: 'Sunset', ocean: 'Ocean', forest: 'Forest', berry: 'Berry',
      desert: 'Desert', slate: 'Slate', mint: 'Mint', royal: 'Royal',
    },
    contrast: 'WCAG contrast checker',
    bgColor: 'Background',
    textColor: 'Text color',
    ratio: 'Contrast ratio',
    sampleText: 'The quick brown fox jumps over the lazy dog',
    aaNormal: 'AA normal text (4.5:1)',
    aaLarge: 'AA large text (3:1)',
    aaaNormal: 'AAA normal text (7:1)',
    aaaLarge: 'AAA large text (4.5:1)',
    pass: 'Pass',
    fail: 'Fail',
    export: 'Export palette',
    cssVars: 'CSS variables',
    tailwind: 'Tailwind config',
    json: 'JSON',
    hexList: 'HEX list',
    copy: 'Copy',
    copied: 'Copied!',
    downloadCss: 'Download .css',
    downloadJson: 'Download .json',
    privacy: 'Privacy: palettes are built on your device. Nothing is uploaded, stored or sent to any server.',
    seeAlso: 'More tools for makers',
    siblings: [
      { href: '/tools/css-gradient-generator', label: 'CSS Gradient Generator' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
    ],
  },
  es: {
    baseColor: 'Color base',
    invalidHex: 'Color HEX no válido.',
    rule: 'Regla de armonía',
    rules: {
      complementary: 'Complementaria',
      analogous: 'Análoga',
      triadic: 'Triádica',
      'split-complementary': 'Complementaria dividida',
      tetradic: 'Tetrádica',
      monochromatic: 'Monocromática',
    },
    ruleHints: {
      complementary: 'Tu base más el color opuesto en la rueda: audaz y de alto contraste.',
      analogous: 'Colores vecinos en la rueda: tranquilos y cohesivos.',
      triadic: 'Tres colores separados de forma uniforme en la rueda: vibrantes pero equilibrados.',
      'split-complementary': 'Una versión más suave del contraste complementario.',
      tetradic: 'Dos pares complementarios: ricos y variados.',
      monochromatic: 'Un solo tono, cinco pasos de luminosidad: limpio y minimalista.',
    },
    palette: 'Tu paleta',
    clickCopy: 'Haz clic en un color para copiarlo.',
    copyFormat: 'Copiar como',
    lock: 'Bloquear',
    unlock: 'Desbloquear',
    locked: 'Bloqueado',
    regenerate: 'Regenerar sin bloquear',
    regenerateHint: 'Pulsa la barra espaciadora para regenerar los colores sin bloquear.',
    random: 'Paleta aleatoria',
    presets: 'Paletas iniciales',
    presetLabels: {
      sunset: 'Atardecer', ocean: 'Océano', forest: 'Bosque', berry: 'Baya',
      desert: 'Desierto', slate: 'Pizarra', mint: 'Menta', royal: 'Real',
    },
    contrast: 'Revisor de contraste WCAG',
    bgColor: 'Fondo',
    textColor: 'Color de texto',
    ratio: 'Proporción de contraste',
    sampleText: 'El rápido zorro marrón salta sobre el perro perezoso',
    aaNormal: 'AA texto normal (4.5:1)',
    aaLarge: 'AA texto grande (3:1)',
    aaaNormal: 'AAA texto normal (7:1)',
    aaaLarge: 'AAA texto grande (4.5:1)',
    pass: 'Pasa',
    fail: 'Falla',
    export: 'Exportar paleta',
    cssVars: 'Variables CSS',
    tailwind: 'Configuración Tailwind',
    json: 'JSON',
    hexList: 'Lista HEX',
    copy: 'Copiar',
    copied: '¡Copiado!',
    downloadCss: 'Descargar .css',
    downloadJson: 'Descargar .json',
    privacy: 'Privacidad: las paletas se crean en tu dispositivo. Nada se sube, guarda ni envía a ningún servidor.',
    seeAlso: 'Más herramientas para creadores',
    siblings: [
      { href: '/es/tools/generador-de-degradados-css', label: 'Generador de Degradados CSS' },
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
    ],
  },
};

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function textColorFor(hex) {
  if (!hex) return '#0f172a';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#0f172a' : '#ffffff';
}

export default function PaletteTool({ lang = 'en' }) {
  const S = STR[lang] || STR.en;
  const initial = defaultPalette();
  const [base, setBase] = useState(initial.base);
  const [rule, setRule] = useState(initial.rule);
  const [colors, setColors] = useState(initial.colors);
  const [locks, setLocks] = useState([false, false, false, false, false]);
  const [copyFormat, setCopyFormat] = useState('hex');
  const [copied, setCopied] = useState('');
  const [notice, setNotice] = useState('');
  const [exportTab, setExportTab] = useState('css');
  const [contrastBg, setContrastBg] = useState(0);
  const [contrastText, setContrastText] = useState('#FFFFFF');

  const rebuild = (nextBase, nextRule, keepLocks) => {
    const fresh = buildPalette(nextBase, nextRule);
    if (!fresh) return;
    setColors((prev) =>
      keepLocks ? fresh.map((c, i) => (keepLocks[i] ? prev[i] : c)) : fresh
    );
  };

  const changeBase = (raw) => {
    const clean = normalizeHex(raw);
    if (!clean) {
      setNotice(S.invalidHex);
      return;
    }
    setNotice('');
    setBase(clean);
    rebuild(clean, rule, locks);
  };

  const changeRule = (nextRule) => {
    setRule(nextRule);
    rebuild(base, nextRule, locks);
  };

  const regenerate = () => {
    rebuild(base, rule, locks);
  };

  /* Spacebar regenerates the unlocked swatches, unless the user is
     typing in a field or focused on a button. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      e.preventDefault();
      regenerate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, rule, locks]);

  const applyRandom = () => {
    const r = randomPalette();
    setBase(r.base);
    setRule(r.rule);
    setColors(r.colors);
    setLocks([false, false, false, false, false]);
    setNotice('');
  };

  const applyPreset = (preset) => {
    setBase(preset.colors[0]);
    setColors(preset.colors.slice());
    setLocks([false, false, false, false, false]);
    setNotice('');
  };

  const toggleLock = (i) => {
    setLocks((prev) => prev.map((v, j) => (j === i ? !v : v)));
  };

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch (e) {
      setNotice('');
    }
  };

  const copyValueFor = (hex) => {
    if (copyFormat === 'rgb') return hexToRgbString(hex) || hex;
    if (copyFormat === 'hsl') return hexToHslString(hex) || hex;
    return hex;
  };

  const copySwatch = (hex, i) => {
    copyText(copyValueFor(hex), 'swatch-' + i);
  };

  const cssVars = exportCssVars(colors);
  const tailwind = exportTailwind(colors);
  const json = exportJson(colors);
  const hexList = exportHexList(colors);
  const exportText =
    exportTab === 'css' ? cssVars : exportTab === 'tailwind' ? tailwind : exportTab === 'json' ? json : hexList;

  const bgHex = colors[contrastBg] || '#FFFFFF';
  const ratio = contrastRatio(contrastText, bgHex);
  const rating = wcagRating(ratio);

  const field = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.95rem' };
  const label = { display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' };
  const btn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', fontWeight: 600, cursor: 'pointer' };
  const btnGhost = { ...btn, background: '#fff', color: '#0f766e' };

  return (
    <div>
      {/* Base color + rule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={label}>{S.baseColor}</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={normalizeHex(base) || '#000000'}
              onChange={(e) => changeBase(e.target.value)}
              style={{ width: 44, height: 36, padding: 2, border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer' }}
              aria-label={S.baseColor}
            />
            <input
              type="text"
              defaultValue={base}
              key={base}
              onBlur={(e) => changeBase(e.target.value)}
              style={{ ...field, width: 120, fontFamily: 'monospace' }}
              aria-label="HEX"
            />
          </div>
          {notice && <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '8px 0 0' }}>{notice}</p>}
        </div>
        <div>
          <label style={label}>{S.rule}</label>
          <select value={rule} onChange={(e) => changeRule(e.target.value)} style={field}>
            {PALETTE_RULES.map((r) => (
              <option key={r} value={r}>{S.rules[r]}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '6px 0 0' }}>{S.ruleHints[rule]}</p>
        </div>
      </div>

      {/* Rule buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {PALETTE_RULES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => changeRule(r)}
            style={{ ...(rule === r ? btn : btnGhost), padding: '6px 12px', fontSize: '0.9rem' }}
          >
            {S.rules[r]}
          </button>
        ))}
      </div>

      {/* Palette swatches */}
      <div style={{ marginBottom: 8 }}>
        <label style={label}>{S.palette}</label>
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: 160 }}>
          {colors.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => copySwatch(c, i)}
              title={c + ' - ' + S.clickCopy}
              style={{
                flex: 1, background: c, border: 0, cursor: 'pointer', padding: 12,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4,
                minHeight: 160, textAlign: 'left',
              }}
            >
              <span style={{ color: textColorFor(c), fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                {copied === 'swatch-' + i ? S.copied : c}
              </span>
              <span style={{ color: textColorFor(c), fontSize: '0.8rem', opacity: 0.85 }}>
                {locks[i] ? S.locked : copyValueFor(c) === c ? '' : copyValueFor(c)}
              </span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '8px 0 0' }}>{S.clickCopy}</p>
      </div>

      {/* Lock toggles + copy format */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        {colors.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleLock(i)}
            aria-label={(locks[i] ? S.unlock : S.lock) + ' ' + c}
            style={{ ...(locks[i] ? btn : btnGhost), padding: '6px 10px', fontSize: '0.85rem' }}
          >
            {locks[i] ? '🔒 ' + c : '🔓 ' + c}
          </button>
        ))}
        <label style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 8 }}>{S.copyFormat}</label>
        <select value={copyFormat} onChange={(e) => setCopyFormat(e.target.value)} style={{ ...field, width: 110 }}>
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </div>

      {/* Regenerate + random */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={regenerate} style={btn}>{S.regenerate}</button>
        <button type="button" onClick={applyRandom} style={btnGhost}>{S.random}</button>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: -8, marginBottom: 16 }}>{S.regenerateHint}</p>

      {/* Starter palettes */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>{S.presets}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PALETTE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              title={S.presetLabels[p.id]}
              style={{
                width: 100, height: 44, borderRadius: 8, border: '1px solid #cbd5e1',
                cursor: 'pointer', overflow: 'hidden', display: 'flex', padding: 0,
              }}
              aria-label={S.presetLabels[p.id]}
            >
              {p.colors.map((c) => (
                <span key={c} style={{ flex: 1, background: c }} />
              ))}
            </button>
          ))}
        </div>
      </div>

      {/* WCAG contrast checker */}
      <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <label style={label}>{S.contrast}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={label}>{S.bgColor}</label>
            <select value={contrastBg} onChange={(e) => setContrastBg(Number(e.target.value))} style={field}>
              {colors.map((c, i) => (
                <option key={i} value={i}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>{S.textColor}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={normalizeHex(contrastText) || '#000000'}
                onChange={(e) => setContrastText(e.target.value.toUpperCase())}
                style={{ width: 44, height: 36, padding: 2, border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer' }}
                aria-label={S.textColor}
              />
              <input
                type="text"
                defaultValue={contrastText}
                key={contrastText}
                onBlur={(e) => {
                  const clean = normalizeHex(e.target.value);
                  if (clean) setContrastText(clean);
                }}
                style={{ ...field, width: 110, fontFamily: 'monospace' }}
                aria-label="HEX"
              />
            </div>
          </div>
        </div>
        <div
          style={{
            borderRadius: 8, padding: 16, marginBottom: 12, textAlign: 'center',
            background: bgHex, color: contrastText, border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{S.sampleText}</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>{S.ratio}: {ratio !== null ? ratio.toFixed(2) + ':1' : '-'}</p>
        </div>
        {rating && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: '0.9rem' }}>
            {[
              [S.aaNormal, rating.aaNormal],
              [S.aaLarge, rating.aaLarge],
              [S.aaaNormal, rating.aaaNormal],
              [S.aaaLarge, rating.aaaLarge],
            ].map(([text, ok]) => (
              <span key={text} style={{ color: ok ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                {ok ? '✓ ' : '✗ '}{text}: {ok ? S.pass : S.fail}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Export panel */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>{S.export}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {[
            ['css', S.cssVars],
            ['tailwind', S.tailwind],
            ['json', S.json],
            ['hex', S.hexList],
          ].map(([key, text]) => (
            <button
              key={key}
              type="button"
              onClick={() => setExportTab(key)}
              style={{ ...(exportTab === key ? btn : btnGhost), padding: '6px 12px', fontSize: '0.9rem' }}
            >
              {text}
            </button>
          ))}
        </div>
        <textarea readOnly value={exportText} rows={exportTab === 'hex' ? 2 : 8} style={{ ...field, fontFamily: 'monospace', resize: 'vertical' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={() => copyText(exportText, 'export')} style={btn}>
            {copied === 'export' ? S.copied : S.copy}
          </button>
          <button type="button" onClick={() => downloadBlob(new Blob([cssVars], { type: 'text/css' }), 'palette.css')} style={btnGhost}>
            {S.downloadCss}
          </button>
          <button type="button" onClick={() => downloadBlob(new Blob([json], { type: 'application/json' }), 'palette.json')} style={btnGhost}>
            {S.downloadJson}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#475569' }}>{S.privacy}</p>
      <p style={{ fontSize: '0.95rem', marginTop: 16 }}>
        {S.seeAlso}:{' '}
        {S.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
