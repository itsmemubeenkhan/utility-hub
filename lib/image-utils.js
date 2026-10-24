/* Pure helpers for the image compressor tool. No browser APIs here, so
   these are unit-testable in node. Canvas encoding lives in the
   ImageCompressorTool component. */

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const text = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return text + ' ' + units[i];
}

/* Fit inside maxW x maxH without ever upscaling. Returns integer dims. */
export function fitDimensions(w, h, maxW, maxH) {
  const mw = Math.max(1, maxW || 1);
  const mh = Math.max(1, maxH || 1);
  const scale = Math.min(1, mw / w, mh / h);
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export function outputExtension(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export function compressedName(name, ext) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  return base + '-compressed.' + ext;
}

export function savedPercent(orig, next) {
  if (!orig || orig <= 0) return 0;
  return Math.max(0, Math.round((1 - next / orig) * 100));
}

/* Target-size search plan: quality steps for lossy formats, scale steps
   for PNG (quality is ignored for PNG). Pure so the component stays thin. */
export function qualitySteps() {
  return [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
}

export function scaleSteps() {
  return [1, 0.85, 0.7, 0.55, 0.4, 0.3];
}
