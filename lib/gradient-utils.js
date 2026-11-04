/* Pure helpers for the CSS gradient generator. No browser APIs here, so
   these are unit-testable in node. Canvas drawing and downloads live in
   the GradientTool component. */

export const GRADIENT_TYPES = ['linear', 'radial', 'conic'];

export const RADIAL_POSITIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
];

/* 8 curated presets: id plus 2 stops each. Labels live in the component
   so this module stays locale-free. */
export const GRADIENT_PRESETS = [
  { id: 'sunset', stops: [{ color: '#FF512F', position: 0 }, { color: '#DD2476', position: 100 }] },
  { id: 'ocean', stops: [{ color: '#2193B0', position: 0 }, { color: '#6DD5ED', position: 100 }] },
  { id: 'forest', stops: [{ color: '#134E5E', position: 0 }, { color: '#71B280', position: 100 }] },
  { id: 'candy', stops: [{ color: '#FC466B', position: 0 }, { color: '#3F5EFB', position: 100 }] },
  { id: 'dusk', stops: [{ color: '#2C3E50', position: 0 }, { color: '#FD746C', position: 100 }] },
  { id: 'fire', stops: [{ color: '#F83600', position: 0 }, { color: '#F9D423', position: 100 }] },
  { id: 'mint', stops: [{ color: '#11998E', position: 0 }, { color: '#38EF7D', position: 100 }] },
  { id: 'royal', stops: [{ color: '#4776E6', position: 0 }, { color: '#8E54E9', position: 100 }] },
];

export const MIN_STOPS = 2;
export const MAX_STOPS = 5;

/* Validate a hex color and normalize it to #RRGGBB uppercase.
   Accepts #RGB, #RRGGBB, with or without the leading #. Returns null
   for anything else. */
export function normalizeHex(raw) {
  if (typeof raw !== 'string') return null;
  let h = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return '#' + h.toUpperCase();
}

export function isValidHex(raw) {
  return normalizeHex(raw) !== null;
}

function clampPos(p) {
  const n = Number(p);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/* Normalize a stop list: drop invalid colors, clamp positions to 0-100,
   sort by position. Returns [] when fewer than 2 valid stops remain. */
export function normalizeStops(stops) {
  if (!Array.isArray(stops)) return [];
  const clean = stops
    .map((s) => {
      const color = normalizeHex(s && s.color);
      if (!color) return null;
      return { color, position: clampPos(s.position) };
    })
    .filter(Boolean)
    .sort((a, b) => a.position - b.position);
  return clean.length >= MIN_STOPS ? clean : [];
}

function stopListCss(stops) {
  return stops.map((s) => s.color + ' ' + s.position + '%').join(', ');
}

/* Default gradient state (sunset preset, linear 135deg). */
export function defaultGradient() {
  return {
    type: 'linear',
    angle: 135,
    radialShape: 'ellipse',
    radialPosition: 'center',
    conicAngle: 0,
    conicX: 50,
    conicY: 50,
    stops: GRADIENT_PRESETS[0].stops.map((s) => ({ ...s })),
  };
}

/* Build the CSS for a gradient state. Returns { css, fallback } where
   css is the full gradient function and fallback is the first stop's
   color (for a background-color fallback line). Returns null when the
   state has fewer than 2 valid stops. */
export function buildGradientCss(state) {
  if (!state || !GRADIENT_TYPES.includes(state.type)) return null;
  const stops = normalizeStops(state.stops);
  if (stops.length < MIN_STOPS) return null;
  const list = stopListCss(stops);
  let css;
  if (state.type === 'linear') {
    const angle = Math.min(360, Math.max(0, Math.round(Number(state.angle) || 0)));
    css = 'linear-gradient(' + angle + 'deg, ' + list + ')';
  } else if (state.type === 'radial') {
    const shape = state.radialShape === 'circle' ? 'circle' : 'ellipse';
    const pos = RADIAL_POSITIONS.includes(state.radialPosition) ? state.radialPosition : 'center';
    css = 'radial-gradient(' + shape + ' at ' + pos + ', ' + list + ')';
  } else {
    const from = Math.min(360, Math.max(0, Math.round(Number(state.conicAngle) || 0)));
    const x = clampPos(state.conicX);
    const y = clampPos(state.conicY);
    css = 'conic-gradient(from ' + from + 'deg at ' + x + '% ' + y + '%, ' + list + ')';
  }
  return { css, fallback: stops[0].color };
}

/* Full copy-ready CSS block: fallback line plus the gradient line. */
export function buildCssBlock(state) {
  const built = buildGradientCss(state);
  if (!built) return '';
  return 'background-color: ' + built.fallback + ';\nbackground: ' + built.css + ';';
}

/* Tailwind arbitrary-value class, e.g.
   bg-[linear-gradient(135deg,#FF512F_0%,#DD2476_100%)]
   (spaces become underscores, the only escaping Tailwind needs here). */
export function buildTailwindClass(state) {
  const built = buildGradientCss(state);
  if (!built) return '';
  return 'bg-[' + built.css.replace(/\s+/g, '_') + ']';
}

/* WCAG relative luminance of a hex color, 0 (black) to 1 (white). */
export function hexLuminance(hex) {
  const color = normalizeHex(hex);
  if (!color) return null;
  const channels = [1, 3, 5].map((i) => {
    const v = parseInt(color.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/* Text-on-gradient advice: average the stops' luminance. Above 0.5 the
   gradient reads light, so dark text wins, and vice versa. */
export function textOnGradient(state) {
  const stops = normalizeStops(state && state.stops);
  if (!stops.length) return null;
  const avg = stops.reduce((sum, s) => sum + hexLuminance(s.color), 0) / stops.length;
  return { luminance: Math.round(avg * 1000) / 1000, suggestion: avg > 0.5 ? 'dark' : 'light' };
}

function hexToRgb(hex) {
  const c = normalizeHex(hex);
  return { r: parseInt(c.slice(1, 3), 16), g: parseInt(c.slice(3, 5), 16), b: parseInt(c.slice(5, 7), 16) };
}

function rgbToHex({ r, g, b }) {
  const part = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0').toUpperCase();
  return '#' + part(r) + part(g) + part(b);
}

/* Interpolate between two hex colors, t in 0..1. */
export function mixHex(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

/* Color at a point around a conic gradient: fraction in 0..1 maps onto
   the stop positions, wrapping past the last stop back to the first. */
export function conicColorAt(stops, fraction) {
  const clean = normalizeStops(stops);
  if (!clean.length) return null;
  let f = ((fraction % 1) + 1) % 1;
  const pts = clean.map((s) => s.position / 100);
  for (let i = 0; i < clean.length; i++) {
    const next = clean[(i + 1) % clean.length];
    const start = pts[i];
    const end = i === clean.length - 1 ? pts[0] + 1 : pts[i + 1];
    if (f >= start && f <= end) {
      const t = end === start ? 0 : (f - start) / (end - start);
      return mixHex(clean[i].color, next.color, t);
    }
  }
  return clean[0].color;
}

function svgStops(stops) {
  return stops
    .map((s) => '    <stop offset="' + s.position + '%" stop-color="' + s.color + '" />')
    .join('\n');
}

function radialPositionXY(pos) {
  const parts = (pos || 'center').split(' ');
  const xWord = parts.includes('left') ? 0 : parts.includes('right') ? 100 : 50;
  const yWord = parts.includes('top') ? 0 : parts.includes('bottom') ? 100 : 50;
  return { x: xWord, y: yWord };
}

/* Standalone SVG file for a gradient state. Linear and radial map to
   native SVG gradients; conic (which SVG has no element for) is drawn
   as 72 wedge paths with interpolated colors, so the file renders
   anywhere. Returns null for invalid states. */
export function buildGradientSvg(state, width = 1200, height = 630) {
  const stops = normalizeStops(state && state.stops);
  if (!state || !GRADIENT_TYPES.includes(state.type) || stops.length < MIN_STOPS) return null;
  const w = Math.max(1, Math.round(Number(width) || 1200));
  const h = Math.max(1, Math.round(Number(height) || 630));
  let defs = '';
  let fill = '';
  if (state.type === 'linear') {
    const rad = ((Number(state.angle) || 0) * Math.PI) / 180;
    const sx = 0.5 - 0.5 * Math.sin(rad);
    const sy = 0.5 + 0.5 * Math.cos(rad);
    const ex = 0.5 + 0.5 * Math.sin(rad);
    const ey = 0.5 - 0.5 * Math.cos(rad);
    defs =
      '  <defs>\n    <linearGradient id="g" x1="' + sx.toFixed(4) + '" y1="' + sy.toFixed(4) +
      '" x2="' + ex.toFixed(4) + '" y2="' + ey.toFixed(4) + '">\n' + svgStops(stops) +
      '\n    </linearGradient>\n  </defs>';
    fill = '<rect width="100%" height="100%" fill="url(#g)" />';
  } else if (state.type === 'radial') {
    const pos = radialPositionXY(RADIAL_POSITIONS.includes(state.radialPosition) ? state.radialPosition : 'center');
    const shape = state.radialShape === 'circle' ? 'circle' : 'ellipse';
    const transform =
      shape === 'ellipse'
        ? ' gradientTransform="translate(' + pos.x / 100 + ' ' + pos.y / 100 + ') scale(1 0.75) translate(' + -pos.x / 100 + ' ' + -pos.y / 100 + ')"'
        : '';
    defs =
      '  <defs>\n    <radialGradient id="g" cx="' + pos.x + '%" cy="' + pos.y + '%" r="75%"' + transform + '>\n' +
      svgStops(stops) + '\n    </radialGradient>\n  </defs>';
    fill = '<rect width="100%" height="100%" fill="url(#g)" />';
  } else {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.hypot(w, h) / 2;
    const from = Number(state.conicAngle) || 0;
    const ox = (clampPos(state.conicX) / 100) * w;
    const oy = (clampPos(state.conicY) / 100) * h;
    const step = 5;
    const paths = [];
    for (let a = 0; a < 360; a += step) {
      const start = ((from + a) * Math.PI) / 180;
      const end = ((from + a + step) * Math.PI) / 180;
      const x1 = ox + r * Math.sin(start);
      const y1 = oy - r * Math.cos(start);
      const x2 = ox + r * Math.sin(end);
      const y2 = oy - r * Math.cos(end);
      const color = conicColorAt(stops, (from + a + step / 2) / 360);
      paths.push(
        '  <path d="M ' + ox.toFixed(1) + ' ' + oy.toFixed(1) + ' L ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
        ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' Z" fill="' + color + '" />'
      );
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">\n' +
      paths.join('\n') + '\n</svg>'
    );
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">\n' +
    defs + '\n  ' + fill + '\n</svg>'
  );
}

/* Share-link encoding: the whole state as URL-safe base64 JSON, so a
   link like /tools/css-gradient-generator#g=<hash> restores the gradient
   on load. Works in node (Buffer) and browsers (btoa/atob). */
function b64Encode(str) {
  if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf8').toString('base64url');
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64Decode(str) {
  if (typeof Buffer !== 'undefined') return Buffer.from(str, 'base64url').toString('utf8');
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

export function encodeGradientHash(state) {
  try {
    return b64Encode(JSON.stringify(state));
  } catch (e) {
    return '';
  }
}

export function decodeGradientHash(hash) {
  try {
    const parsed = JSON.parse(b64Decode(String(hash || '').trim()));
    if (!parsed || !GRADIENT_TYPES.includes(parsed.type)) return null;
    const stops = normalizeStops(parsed.stops);
    if (stops.length < MIN_STOPS) return null;
    return {
      type: parsed.type,
      angle: Math.min(360, Math.max(0, Math.round(Number(parsed.angle) || 0))),
      radialShape: parsed.radialShape === 'circle' ? 'circle' : 'ellipse',
      radialPosition: RADIAL_POSITIONS.includes(parsed.radialPosition) ? parsed.radialPosition : 'center',
      conicAngle: Math.min(360, Math.max(0, Math.round(Number(parsed.conicAngle) || 0))),
      conicX: clampPos(parsed.conicX),
      conicY: clampPos(parsed.conicY),
      stops,
    };
  } catch (e) {
    return null;
  }
}
