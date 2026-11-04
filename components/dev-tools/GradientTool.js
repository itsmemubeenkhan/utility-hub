'use client';
/* CSS Gradient Generator: linear, radial and conic gradients built
   100% in the browser. Color stops, presets, live preview, copyable CSS
   and Tailwind classes, PNG/SVG downloads and share links. Nothing is
   uploaded: everything runs on the device. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GRADIENT_PRESETS,
  RADIAL_POSITIONS,
  MIN_STOPS,
  MAX_STOPS,
  normalizeHex,
  normalizeStops,
  defaultGradient,
  buildGradientCss,
  buildCssBlock,
  buildTailwindClass,
  textOnGradient,
  conicColorAt,
  buildGradientSvg,
  encodeGradientHash,
  decodeGradientHash,
} from '@/lib/gradient-utils';

const STR = {
  en: {
    type: 'Gradient type',
    typeLinear: 'Linear',
    typeRadial: 'Radial',
    typeConic: 'Conic',
    angle: 'Angle',
    direction: 'Direction presets',
    directions: {
      0: 'To top', 45: 'To top right', 90: 'To right', 135: 'To bottom right',
      180: 'To bottom', 225: 'To bottom left', 270: 'To left', 315: 'To top left',
    },
    shape: 'Shape',
    shapeEllipse: 'Ellipse',
    shapeCircle: 'Circle',
    position: 'Position',
    positions: {
      center: 'Center', top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right',
      'top left': 'Top left', 'top right': 'Top right',
      'bottom left': 'Bottom left', 'bottom right': 'Bottom right',
    },
    startAngle: 'Start angle',
    centerX: 'Center X',
    centerY: 'Center Y',
    presets: 'Presets',
    presetLabels: {
      sunset: 'Sunset', ocean: 'Ocean', forest: 'Forest', candy: 'Candy',
      dusk: 'Dusk', fire: 'Fire', mint: 'Mint', royal: 'Royal',
    },
    stops: 'Color stops',
    addStop: 'Add stop',
    removeStop: 'Remove',
    color: 'Color',
    hex: 'HEX',
    pos: 'Position',
    invalidHex: 'Invalid HEX color.',
    minStops: 'A gradient needs at least 2 stops.',
    maxStops: 'Maximum 5 stops.',
    preview: 'Live preview',
    sampleText: 'Your headline looks like this on the gradient',
    contrastDark: 'Light gradient: dark text reads best on it.',
    contrastLight: 'Dark gradient: light text reads best on it.',
    cssOutput: 'CSS code',
    copyCss: 'Copy CSS',
    copyTailwind: 'Copy Tailwind class',
    copied: 'Copied!',
    downloadPng: 'Download PNG (1200 x 630)',
    downloadSvg: 'Download SVG',
    shareLink: 'Copy share link',
    shareNote: 'The link encodes this exact gradient, so anyone opening it sees the same design.',
    privacy: 'Privacy: gradients are built on your device. Nothing is uploaded, stored or sent to any server.',
    seeAlso: 'More tools for makers',
    siblings: [
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
      { href: '/tools/image-compressor', label: 'Image Compressor' },
    ],
  },
  es: {
    type: 'Tipo de degradado',
    typeLinear: 'Lineal',
    typeRadial: 'Radial',
    typeConic: 'Cónico',
    angle: 'Ángulo',
    direction: 'Direcciones rápidas',
    directions: {
      0: 'Hacia arriba', 45: 'Hacia arriba derecha', 90: 'Hacia la derecha', 135: 'Hacia abajo derecha',
      180: 'Hacia abajo', 225: 'Hacia abajo izquierda', 270: 'Hacia la izquierda', 315: 'Hacia arriba izquierda',
    },
    shape: 'Forma',
    shapeEllipse: 'Elipse',
    shapeCircle: 'Círculo',
    position: 'Posición',
    positions: {
      center: 'Centro', top: 'Arriba', bottom: 'Abajo', left: 'Izquierda', right: 'Derecha',
      'top left': 'Arriba izquierda', 'top right': 'Arriba derecha',
      'bottom left': 'Abajo izquierda', 'bottom right': 'Abajo derecha',
    },
    startAngle: 'Ángulo inicial',
    centerX: 'Centro X',
    centerY: 'Centro Y',
    presets: 'Plantillas',
    presetLabels: {
      sunset: 'Atardecer', ocean: 'Océano', forest: 'Bosque', candy: 'Dulce',
      dusk: 'Crepúsculo', fire: 'Fuego', mint: 'Menta', royal: 'Real',
    },
    stops: 'Colores',
    addStop: 'Añadir color',
    removeStop: 'Quitar',
    color: 'Color',
    hex: 'HEX',
    pos: 'Posición',
    invalidHex: 'Color HEX no válido.',
    minStops: 'Un degradado necesita al menos 2 colores.',
    maxStops: 'Máximo 5 colores.',
    preview: 'Vista previa',
    sampleText: 'Así se ve un titular sobre el degradado',
    contrastDark: 'Degradado claro: el texto oscuro se lee mejor sobre él.',
    contrastLight: 'Degradado oscuro: el texto claro se lee mejor sobre él.',
    cssOutput: 'Código CSS',
    copyCss: 'Copiar CSS',
    copyTailwind: 'Copiar clase Tailwind',
    copied: '¡Copiado!',
    downloadPng: 'Descargar PNG (1200 x 630)',
    downloadSvg: 'Descargar SVG',
    shareLink: 'Copiar enlace para compartir',
    shareNote: 'El enlace guarda este degradado exacto, así que quien lo abra verá el mismo diseño.',
    privacy: 'Privacidad: los degradados se crean en tu dispositivo. Nada se sube, guarda ni envía a ningún servidor.',
    seeAlso: 'Más herramientas para creadores',
    siblings: [
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
      { href: '/es/tools/compresor-de-imagenes', label: 'Compresor de Imágenes' },
    ],
  },
};

const DIRECTION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function GradientTool({ lang = 'en' }) {
  const S = STR[lang] || STR.en;
  const [state, setState] = useState(defaultGradient);
  const [copied, setCopied] = useState('');
  const [notice, setNotice] = useState('');

  /* Load a shared gradient from the URL hash on first render. */
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#g=')) {
      const decoded = decodeGradientHash(hash.slice(3));
      if (decoded) setState(decoded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const built = buildGradientCss(state);
  const stops = normalizeStops(state.stops);
  const contrast = textOnGradient(state);
  const cssBlock = buildCssBlock(state);
  const tailwind = buildTailwindClass(state);

  const set = (patch) => setState((prev) => ({ ...prev, ...patch }));

  const updateStop = (i, patch) => {
    setState((prev) => {
      const next = prev.stops.map((s, j) => (j === i ? { ...s, ...patch } : s));
      return { ...prev, stops: next };
    });
  };

  const updateStopHex = (i, raw) => {
    const clean = normalizeHex(raw);
    if (clean) {
      updateStop(i, { color: clean });
      setNotice('');
    } else {
      setNotice(S.invalidHex);
    }
  };

  const addStop = () => {
    if (state.stops.length >= MAX_STOPS) {
      setNotice(S.maxStops);
      return;
    }
    setNotice('');
    const last = state.stops[state.stops.length - 1];
    const mid = Math.round((last.position + 100) / 2);
    setState((prev) => ({
      ...prev,
      stops: [...prev.stops, { color: last.color, position: Math.min(100, mid) }],
    }));
  };

  const removeStop = (i) => {
    if (state.stops.length <= MIN_STOPS) {
      setNotice(S.minStops);
      return;
    }
    setNotice('');
    setState((prev) => ({ ...prev, stops: prev.stops.filter((_, j) => j !== i) }));
  };

  const applyPreset = (preset) => {
    setState((prev) => ({ ...prev, stops: preset.stops.map((s) => ({ ...s })) }));
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

  const copyShareLink = () => {
    const url = window.location.origin + window.location.pathname + '#g=' + encodeGradientHash(state);
    copyText(url, 'share');
  };

  const downloadPng = () => {
    const W = 1200;
    const H = 630;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (state.type === 'linear') {
      const rad = (state.angle * Math.PI) / 180;
      const x0 = W * (0.5 - 0.5 * Math.sin(rad));
      const y0 = H * (0.5 + 0.5 * Math.cos(rad));
      const x1 = W * (0.5 + 0.5 * Math.sin(rad));
      const y1 = H * (0.5 - 0.5 * Math.cos(rad));
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      stops.forEach((s) => g.addColorStop(s.position / 100, s.color));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else if (state.type === 'radial') {
      const posWords = state.radialPosition.split(' ');
      const cx = posWords.includes('left') ? 0 : posWords.includes('right') ? W : W / 2;
      const cy = posWords.includes('top') ? 0 : posWords.includes('bottom') ? H : H / 2;
      const radius = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      ctx.save();
      if (state.radialShape === 'ellipse') {
        ctx.translate(cx, cy);
        ctx.scale(1, H / W);
        ctx.translate(-cx, -cy);
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      stops.forEach((s) => g.addColorStop(s.position / 100, s.color));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else {
      // Conic: draw 72 wedges with interpolated colors, matching CSS
      // exactly (from angle at the top, clockwise), without relying on
      // createConicGradient angle conventions.
      const ox = (state.conicX / 100) * W;
      const oy = (state.conicY / 100) * H;
      const r = Math.hypot(W, H) / 2;
      const from = state.conicAngle;
      for (let a = 0; a < 360; a += 5) {
        const start = ((from + a) * Math.PI) / 180;
        const end = ((from + a + 5) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + r * Math.sin(start), oy - r * Math.cos(start));
        ctx.arc(ox, oy, r, start - Math.PI / 2, end - Math.PI / 2, false);
        ctx.closePath();
        ctx.fillStyle = conicColorAt(stops, (from + a + 2.5) / 360);
        ctx.fill();
      }
    }
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'gradient-1200x630.png');
    }, 'image/png');
  };

  const downloadSvg = () => {
    const svg = buildGradientSvg(state, 1200, 630);
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'gradient.svg');
  };

  const field = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.95rem' };
  const label = { display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' };
  const btn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', fontWeight: 600, cursor: 'pointer' };
  const btnGhost = { ...btn, background: '#fff', color: '#0f766e' };

  return (
    <div>
      {/* Live preview */}
      <div
        style={{
          height: 280,
          borderRadius: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          background: built ? built.css : '#e2e8f0',
          border: '1px solid #e2e8f0',
        }}
      >
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: contrast && contrast.suggestion === 'dark' ? '#0f172a' : '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>
          {S.sampleText}
        </p>
      </div>
      {contrast && (
        <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: 0 }}>
          {contrast.suggestion === 'dark' ? S.contrastDark : S.contrastLight}
        </p>
      )}

      {/* Type + presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={label}>{S.type}</label>
          <select value={state.type} onChange={(e) => set({ type: e.target.value })} style={field}>
            <option value="linear">{S.typeLinear}</option>
            <option value="radial">{S.typeRadial}</option>
            <option value="conic">{S.typeConic}</option>
          </select>
        </div>
        {state.type === 'linear' && (
          <div>
            <label style={label}>{S.angle}: {state.angle}°</label>
            <input type="range" min="0" max="360" value={state.angle} onChange={(e) => set({ angle: Number(e.target.value) })} style={{ width: '100%' }} />
          </div>
        )}
        {state.type === 'radial' && (
          <>
            <div>
              <label style={label}>{S.shape}</label>
              <select value={state.radialShape} onChange={(e) => set({ radialShape: e.target.value })} style={field}>
                <option value="ellipse">{S.shapeEllipse}</option>
                <option value="circle">{S.shapeCircle}</option>
              </select>
            </div>
            <div>
              <label style={label}>{S.position}</label>
              <select value={state.radialPosition} onChange={(e) => set({ radialPosition: e.target.value })} style={field}>
                {RADIAL_POSITIONS.map((p) => (
                  <option key={p} value={p}>{S.positions[p]}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {state.type === 'conic' && (
          <>
            <div>
              <label style={label}>{S.startAngle}: {state.conicAngle}°</label>
              <input type="range" min="0" max="360" value={state.conicAngle} onChange={(e) => set({ conicAngle: Number(e.target.value) })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>{S.centerX}: {state.conicX}%</label>
              <input type="range" min="0" max="100" value={state.conicX} onChange={(e) => set({ conicX: Number(e.target.value) })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>{S.centerY}: {state.conicY}%</label>
              <input type="range" min="0" max="100" value={state.conicY} onChange={(e) => set({ conicY: Number(e.target.value) })} style={{ width: '100%' }} />
            </div>
          </>
        )}
      </div>

      {state.type === 'linear' && (
        <div style={{ marginBottom: 16 }}>
          <label style={label}>{S.direction}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DIRECTION_ANGLES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set({ angle: a })}
                style={{ ...(state.angle === a ? btn : btnGhost), padding: '6px 12px', fontSize: '0.9rem' }}
              >
                {S.directions[a]} ({a}°)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Presets */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>{S.presets}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GRADIENT_PRESETS.map((p) => {
            const css = buildGradientCss({ ...defaultGradient(), stops: p.stops });
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                title={S.presetLabels[p.id]}
                style={{
                  width: 64, height: 44, borderRadius: 8, border: '1px solid #cbd5e1',
                  cursor: 'pointer', background: css ? css.css : '#e2e8f0',
                }}
                aria-label={S.presetLabels[p.id]}
              />
            );
          })}
        </div>
      </div>

      {/* Stops editor */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>{S.stops}</label>
        {state.stops.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <input
              type="color"
              value={normalizeHex(s.color) || '#000000'}
              onChange={(e) => updateStop(i, { color: e.target.value.toUpperCase() })}
              style={{ width: 44, height: 36, padding: 2, border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer' }}
              aria-label={S.color}
            />
            <input
              type="text"
              defaultValue={s.color}
              key={s.color}
              onBlur={(e) => updateStopHex(i, e.target.value)}
              style={{ ...field, width: 110 }}
              aria-label={S.hex}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={s.position}
              onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
              style={{ flex: 1, minWidth: 120 }}
              aria-label={S.pos}
            />
            <span style={{ width: 44, fontSize: '0.9rem', color: '#475569' }}>{s.position}%</span>
            <button type="button" onClick={() => removeStop(i)} style={{ ...btnGhost, padding: '6px 10px', fontSize: '0.85rem' }}>
              {S.removeStop}
            </button>
          </div>
        ))}
        <button type="button" onClick={addStop} style={{ ...btnGhost, marginTop: 4 }}>
          {S.addStop}
        </button>
        {notice && <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '8px 0 0' }}>{notice}</p>}
      </div>

      {/* CSS output + actions */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>{S.cssOutput}</label>
        <textarea readOnly value={cssBlock} rows={3} style={{ ...field, fontFamily: 'monospace', resize: 'vertical' }} />
        {tailwind && (
          <input readOnly value={tailwind} style={{ ...field, fontFamily: 'monospace', marginTop: 8 }} aria-label="Tailwind class" />
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={() => copyText(cssBlock, 'css')} style={btn}>
            {copied === 'css' ? S.copied : S.copyCss}
          </button>
          <button type="button" onClick={() => copyText(tailwind, 'tw')} style={btnGhost}>
            {copied === 'tw' ? S.copied : S.copyTailwind}
          </button>
          <button type="button" onClick={downloadPng} style={btnGhost}>{S.downloadPng}</button>
          <button type="button" onClick={downloadSvg} style={btnGhost}>{S.downloadSvg}</button>
          <button type="button" onClick={copyShareLink} style={btnGhost}>
            {copied === 'share' ? S.copied : S.shareLink}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '10px 0 0' }}>{S.shareNote}</p>
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
