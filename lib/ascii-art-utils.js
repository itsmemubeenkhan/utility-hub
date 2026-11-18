/* Pure ASCII art helpers (no DOM, so they run in both browser and node).
   An ASCII art generator turns pixels into characters: each pixel's
   brightness picks one character from a ramp that runs from light
   (a space) to dark (@), so dark areas look dense and bright areas
   look empty. Everything runs client-side: images and text never
   leave the device. */

/* Character ramps, ordered light to dark. Standard is the classic
   10-step ramp, Detailed gives smoother shading, Blocks uses only
   shade blocks, Simple is a 4-step ramp for bold posters. */
export const ASCII_CHARSETS = [
  { id: 'standard', label: 'Standard', chars: ' .:-=+*#%@' },
  {
    id: 'detailed',
    label: 'Detailed',
    chars: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  },
  { id: 'blocks', label: 'Blocks', chars: ' \u2591\u2592\u2593\u2588' },
  { id: 'simple', label: 'Simple', chars: ' .#@' },
];

export function getCharset(id) {
  return ASCII_CHARSETS.find((c) => c.id === id) || ASCII_CHARSETS[0];
}

export function clampByte(v) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(255, Math.round(v)));
}

/* Perceived brightness of one pixel, 0 (black) to 255 (white),
   using the standard Rec. 601 luma weights. */
export function pixelBrightness(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* Brightness and contrast adjustment. brightness is -100..100 added
   after contrast, contrast is -100..100 around the midpoint 128. */
export function adjustPixel(value, brightness = 0, contrast = 0) {
  const c = Math.max(-100, Math.min(100, contrast));
  const factor = (259 * (c + 255)) / (255 * (259 - c));
  return clampByte(factor * (value - 128) + 128 + brightness);
}

/* Map one brightness value (0 black, 255 white) to one character.
   The ramp runs light to dark, so white maps to a space and black
   maps to the densest character. Invert flips the ramp. */
export function brightnessToChar(brightness, charsetId = 'standard', invert = false) {
  const ramp = getCharset(charsetId).chars;
  const t = Math.max(0, Math.min(255, brightness)) / 255;
  let idx = Math.round((1 - t) * (ramp.length - 1));
  if (invert) idx = ramp.length - 1 - idx;
  return ramp[idx];
}

/* Output size for an image of imgW x imgH sampled to targetWidth
   characters. Monospace characters are about twice as tall as wide,
   so rows are halved to keep the picture from looking stretched.
   Height is capped so very tall images stay usable. */
export function asciiDimensions(imgW, imgH, targetWidth) {
  const width = Math.max(10, Math.min(400, Math.round(targetWidth)));
  const height = Math.max(
    1,
    Math.min(300, Math.round((width * imgH) / imgW / 2))
  );
  return { width, height };
}

/* Convert a brightness grid (rows of numbers 0..255, or rows of
   { b, r, g, bl } cells) into rows of { ch, r, g, bl } cells. The
   component renders these as plain text or as colored spans. */
export function gridToAsciiRows(grid, charsetId = 'standard', opts = {}) {
  const { invert = false, brightness = 0, contrast = 0 } = opts;
  return grid.map((row) =>
    row.map((cell) => {
      const b = typeof cell === 'number' ? cell : cell.b;
      const adj = adjustPixel(b, brightness, contrast);
      const ch = brightnessToChar(adj, charsetId, invert);
      if (typeof cell === 'number') return { ch, r: 0, g: 0, bl: 0 };
      return { ch, r: cell.r || 0, g: cell.g || 0, bl: cell.bl || 0 };
    })
  );
}

export function rowsToText(rows) {
  return rows.map((row) => row.map((c) => c.ch).join('')).join('\n');
}

/* Count the characters and lines of finished ASCII art. */
export function asciiStats(text) {
  const lines = text ? text.split('\n').length : 0;
  const chars = text ? text.replace(/\n/g, '').length : 0;
  const nonSpace = text ? text.replace(/[\s]/g, '').length : 0;
  return { chars, lines, nonSpace };
}

/* A demo pattern (a bright circle over a dark gradient) used for the
   "sample image" button and for node tests. Returns brightness 0..255
   for the pixel at (x, y) in a w x h grid. */
export function demoPatternBrightness(x, y, w, h) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const r = Math.min(w, h) * 0.32;
  const dx = (x - cx) / r;
  const dy = (y - cy) / r;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const sky = 40 + Math.round(120 * (1 - y / Math.max(1, h - 1)));
  const circle = dist <= 1 ? 235 : 0;
  const glow = dist > 1 && dist < 1.6 ? Math.round(90 * (1.6 - dist)) : 0;
  return clampByte(Math.max(sky, circle) + glow);
}

export const SAMPLE_BANNER_TEXT = 'ASCII ART';
export const SAMPLE_TEXT = 'Hello!';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
