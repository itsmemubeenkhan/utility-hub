/* Pure helpers for the image resizer tool. No browser APIs here, so
   these are unit-testable in node. Canvas drawing lives in the
   ImageResizerTool component. */

/* Social and common-size presets: name keys are resolved to labels in
   the component, so this module stays locale-free. */
export const RESIZE_PRESETS = [
  { id: 'instagram-post', w: 1080, h: 1080 },
  { id: 'instagram-story', w: 1080, h: 1920 },
  { id: 'facebook-post', w: 1200, h: 630 },
  { id: 'linkedin-banner', w: 1584, h: 396 },
  { id: 'youtube-thumbnail', w: 1280, h: 720 },
  { id: 'x-post', w: 1600, h: 900 },
  { id: 'pinterest-pin', w: 1000, h: 1500 },
  { id: 'profile-square', w: 800, h: 800 },
];

export const MAX_DIMENSION = 16000;

function clampDim(v) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, MAX_DIMENSION);
}

/* Compute output dimensions for an image of w x h.
   mode: 'fit' (inside targetW x targetH, aspect kept),
         'fill' (cover targetW x targetH, aspect kept, cropped),
         'stretch' (exactly targetW x targetH),
         'width' (targetW wide, height follows aspect),
         'height' (targetH tall, width follows aspect),
         'percent' (scale both dims by percent).
   allowUpscale false (default) never grows the image. */
export function computeResizeDims(w, h, opts = {}) {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return null;
  const { mode = 'fit', allowUpscale = false } = opts;
  const cap = (scale) => (allowUpscale ? scale : Math.min(1, scale));
  if (mode === 'percent') {
    const p = Number(opts.percent);
    if (!Number.isFinite(p) || p <= 0 || p > 800) return null;
    const scale = cap(p / 100);
    return {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
    };
  }
  if (mode === 'width') {
    const tw = clampDim(opts.targetW);
    if (!tw) return null;
    const scale = cap(tw / w);
    return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
  }
  if (mode === 'height') {
    const th = clampDim(opts.targetH);
    if (!th) return null;
    const scale = cap(th / h);
    return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
  }
  const tw = clampDim(opts.targetW);
  const th = clampDim(opts.targetH);
  if (!tw || !th) return null;
  if (mode === 'stretch') return { width: tw, height: th };
  // fit and fill both output the target box; the component differs in
  // how it draws (letterboxed scale vs cover crop).
  if (mode === 'fill') return { width: tw, height: th };
  const scale = cap(Math.min(tw / w, th / h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/* Source rectangle to draw for cover (fill) mode: the largest centered
   crop of the source with the target aspect ratio. */
export function coverSourceRect(w, h, tw, th) {
  const targetAspect = tw / th;
  const srcAspect = w / h;
  if (srcAspect > targetAspect) {
    const sw = Math.round(h * targetAspect);
    return { sx: Math.round((w - sw) / 2), sy: 0, sw, sh: h };
  }
  const sh = Math.round(w / targetAspect);
  return { sx: 0, sy: Math.round((h - sh) / 2), sw: w, sh };
}

export function resizedName(name, w, h, ext) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  return base + '-' + w + 'x' + h + '.' + ext;
}

export function outputExtensionFor(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}
