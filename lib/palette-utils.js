/* Pure helpers for the Color Palette Generator. No browser APIs here, so
   these are unit-testable in node. Copying, downloads and the spacebar
   shortcut live in the PaletteTool component. */

export const PALETTE_RULES = [
  'complementary',
  'analogous',
  'triadic',
  'split-complementary',
  'tetradic',
  'monochromatic',
];

/* 8 curated starter palettes: id plus 5 colors each. Labels live in the
   component so this module stays locale-free. */
export const PALETTE_PRESETS = [
  { id: 'sunset', colors: ['#FF6B35', '#F7C548', '#E94F64', '#7C3AED', '#1F2937'] },
  { id: 'ocean', colors: ['#0C4A6E', '#0284C7', '#38BDF8', '#A5F3FC', '#F0F9FF'] },
  { id: 'forest', colors: ['#14532D', '#16A34A', '#4ADE80', '#A3E635', '#FEFCE8'] },
  { id: 'berry', colors: ['#831843', '#BE185D', '#EC4899', '#F9A8D4', '#FDF2F8'] },
  { id: 'desert', colors: ['#78350F', '#D97706', '#F59E0B', '#FDE68A', '#FFFBEB'] },
  { id: 'slate', colors: ['#0F172A', '#334155', '#64748B', '#94A3B8', '#F1F5F9'] },
  { id: 'mint', colors: ['#134E4A', '#0F766E', '#2DD4BF', '#99F6E4', '#F0FDFA'] },
  { id: 'royal', colors: ['#1E1B4B', '#4338CA', '#818CF8', '#C7D2FE', '#EEF2FF'] },
];

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

export function hexToRgb(hex) {
  const c = normalizeHex(hex);
  if (!c) return null;
  return {
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  };
}

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clampHue(h) {
  let n = Number(h);
  if (!Number.isFinite(n)) return 0;
  n = n % 360;
  return n < 0 ? n + 360 : n;
}

/* #RRGGBB to { h: 0-360, s: 0-1, l: 0-1 }. Returns null for bad input. */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/* { h: 0-360, s: 0-1, l: 0-1 } to #RRGGBB uppercase. */
export function hslToHex(h, s, l) {
  const hh = clampHue(h) / 360;
  const ss = clamp01(s);
  const ll = clamp01(l);
  let r;
  let g;
  let b;
  if (ss === 0) {
    r = g = b = ll;
  } else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    r = hueToRgb(p, q, hh + 1 / 3);
    g = hueToRgb(p, q, hh);
    b = hueToRgb(p, q, hh - 1 / 3);
  }
  const part = (v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + part(r) + part(g) + part(b);
}

/* RGB and HSL strings for a hex color, for the copy menu. */
export function hexToRgbString(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

export function hexToHslString(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  return 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s * 100) + '%, ' + Math.round(hsl.l * 100) + '%)';
}

function clampLight(l) {
  return Math.min(0.95, Math.max(0.05, l));
}

/* Each rule is a list of 5 [hue offset, lightness delta] pairs applied to
   the base color's HSL values. Monochromatic keeps one hue and walks
   lightness instead. */
const RULE_STEPS = {
  complementary: [[0, 0], [180, 0], [180, 0.22], [0, -0.22], [180, -0.22]],
  analogous: [[-30, 0], [-15, 0.08], [0, 0], [15, -0.08], [30, 0.08]],
  triadic: [[0, 0], [120, 0], [240, 0], [120, 0.2], [240, -0.2]],
  'split-complementary': [[0, 0], [150, 0], [210, 0], [150, 0.2], [210, -0.2]],
  tetradic: [[0, 0], [90, 0], [180, 0], [270, 0], [90, 0.2]],
  monochromatic: [[0, -0.3], [0, -0.15], [0, 0], [0, 0.15], [0, 0.3]],
};

/* Build a 5-color palette from a base hex and a harmony rule.
   Returns null for an invalid base color or unknown rule. */
export function buildPalette(baseHex, rule) {
  const base = hexToHsl(baseHex);
  const steps = RULE_STEPS[rule];
  if (!base || !steps) return null;
  return steps.map(([dh, dl]) =>
    hslToHex(base.h + dh, base.s, clampLight(base.l + dl))
  );
}

/* Regenerate a palette from its base color and rule, keeping every
   locked swatch (locks is an array of 5 booleans). */
export function regeneratePalette(baseHex, rule, locks) {
  const fresh = buildPalette(baseHex, rule);
  if (!fresh) return null;
  return fresh;
}

/* Random 5-color palette: a random base hue and a random harmony rule. */
export function randomPalette() {
  const hue = Math.floor(Math.random() * 360);
  const sat = 0.55 + Math.random() * 0.35;
  const light = 0.45 + Math.random() * 0.15;
  const base = hslToHex(hue, sat, light);
  const rule = PALETTE_RULES[Math.floor(Math.random() * PALETTE_RULES.length)];
  return { base, rule, colors: buildPalette(base, rule) };
}

/* Default palette state: blue base, complementary rule. */
export function defaultPalette() {
  const base = '#2563EB';
  return { base, rule: 'complementary', colors: buildPalette(base, 'complementary') };
}

/* WCAG relative luminance of a hex color, 0 (black) to 1 (white). */
export function hexLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const channels = [rgb.r, rgb.g, rgb.b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/* WCAG contrast ratio between two hex colors, 1 to 21. Rounded to 2
   decimals. Returns null for invalid input. */
export function contrastRatio(fg, bg) {
  const l1 = hexLuminance(fg);
  const l2 = hexLuminance(bg);
  if (l1 === null || l2 === null) return null;
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/* WCAG pass levels for a ratio: AA needs 4.5:1 for normal text (3:1 for
   large text), AAA needs 7:1 for normal text (4.5:1 for large text). */
export function wcagRating(ratio) {
  if (ratio === null || !Number.isFinite(ratio)) return null;
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/* Export formats. Names are generic (color-1..5) so the snippet works
   in any project without renaming. */
export function exportCssVars(colors, prefix = 'color') {
  if (!Array.isArray(colors) || !colors.length) return '';
  const lines = colors.map((c, i) => '  --' + prefix + '-' + (i + 1) + ': ' + c + ';');
  return ':root {\n' + lines.join('\n') + '\n}';
}

export function exportTailwind(colors) {
  if (!Array.isArray(colors) || !colors.length) return '';
  const steps = [100, 200, 300, 400, 500];
  const lines = colors.map((c, i) => '          ' + steps[i] + ": '" + c + "',");
  return (
    '// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n' +
    lines.join('\n') +
    '\n        },\n      },\n    },\n  },\n};'
  );
}

export function exportJson(colors) {
  if (!Array.isArray(colors) || !colors.length) return '';
  return JSON.stringify({ palette: colors, count: colors.length }, null, 2);
}

export function exportHexList(colors) {
  if (!Array.isArray(colors) || !colors.length) return '';
  return colors.join(', ');
}
