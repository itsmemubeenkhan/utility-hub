'use client';
/* Free Image Resizer: batch JPG/PNG/WebP resizing 100% in the browser
   via Canvas. Exact dimensions, width-only, height-only, percentage and
   social-media presets, with fit, crop-to-fill and stretch modes, plus
   output format and quality controls. Nothing is uploaded: files never
   leave the device. */
import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  RESIZE_PRESETS,
  computeResizeDims,
  coverSourceRect,
  resizedName,
  outputExtensionFor,
} from '@/lib/resize-utils';
import { formatBytes } from '@/lib/image-utils';

const STR = {
  en: {
    drop: 'Drop images here, or choose files',
    choose: 'Choose images',
    addMore: 'Add more images',
    clear: 'Clear all',
    formats: 'JPG, PNG, WebP and GIF (first frame). Several files at once.',
    mode: 'Resize mode',
    modePreset: 'Social preset',
    modeExact: 'Exact size',
    modeWidth: 'Width only',
    modeHeight: 'Height only',
    modePercent: 'Percentage',
    preset: 'Preset',
    presetLabels: {
      'instagram-post': 'Instagram post (1080 x 1080)',
      'instagram-story': 'Instagram story (1080 x 1920)',
      'facebook-post': 'Facebook post (1200 x 630)',
      'linkedin-banner': 'LinkedIn banner (1584 x 396)',
      'youtube-thumbnail': 'YouTube thumbnail (1280 x 720)',
      'x-post': 'X post (1600 x 900)',
      'pinterest-pin': 'Pinterest pin (1000 x 1500)',
      'profile-square': 'Profile picture (800 x 800)',
    },
    width: 'Width (px)',
    height: 'Height (px)',
    percent: 'Scale (%)',
    fitMode: 'How the image fits the box',
    fitFit: 'Fit inside (keep aspect, no crop)',
    fitFill: 'Fill box (keep aspect, crop edges)',
    fitStretch: 'Stretch to exact box',
    upscale: 'Allow enlarging smaller images',
    outFormat: 'Output format',
    fmtKeep: 'Keep original',
    fmtJpeg: 'JPEG (smallest for photos)',
    fmtPng: 'PNG (lossless, bigger)',
    fmtWebp: 'WebP (small, modern browsers)',
    quality: 'Quality',
    qualityNote: 'Only applies to JPEG and WebP. 80 to 85 is the sweet spot for photos.',
    resize: 'Resize images',
    resizing: 'Resizing...',
    download: 'Download',
    downloadAll: 'Download all resized',
    original: 'Original',
    resized: 'Resized',
    noFiles: 'Add at least one image first.',
    errorLoad: 'Could not read this image. Try a JPG, PNG or WebP file.',
    errorEncode: 'Could not encode this image in the chosen format.',
    errorDims: 'Enter valid dimensions (1 to 16000 px).',
    privacy: 'Privacy: images are processed on your device with the Canvas API. Nothing is uploaded, stored or sent to any server.',
    seeAlso: 'More tools for makers',
    siblings: [
      { href: '/tools/image-compressor', label: 'Image Compressor' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
    ],
  },
  es: {
    drop: 'Suelta imágenes aquí o elige archivos',
    choose: 'Elegir imágenes',
    addMore: 'Añadir más imágenes',
    clear: 'Limpiar todo',
    formats: 'JPG, PNG, WebP y GIF (primer cuadro). Varios archivos a la vez.',
    mode: 'Modo de cambio de tamaño',
    modePreset: 'Plantilla social',
    modeExact: 'Tamaño exacto',
    modeWidth: 'Solo ancho',
    modeHeight: 'Solo alto',
    modePercent: 'Porcentaje',
    preset: 'Plantilla',
    presetLabels: {
      'instagram-post': 'Publicación de Instagram (1080 x 1080)',
      'instagram-story': 'Historia de Instagram (1080 x 1920)',
      'facebook-post': 'Publicación de Facebook (1200 x 630)',
      'linkedin-banner': 'Banner de LinkedIn (1584 x 396)',
      'youtube-thumbnail': 'Miniatura de YouTube (1280 x 720)',
      'x-post': 'Publicación de X (1600 x 900)',
      'pinterest-pin': 'Pin de Pinterest (1000 x 1500)',
      'profile-square': 'Foto de perfil (800 x 800)',
    },
    width: 'Ancho (px)',
    height: 'Alto (px)',
    percent: 'Escala (%)',
    fitMode: 'Cómo encaja la imagen en el cuadro',
    fitFit: 'Ajustar dentro (mantener proporción, sin recorte)',
    fitFill: 'Llenar cuadro (mantener proporción, recortar bordes)',
    fitStretch: 'Estirar al cuadro exacto',
    upscale: 'Permitir agrandar imágenes más pequeñas',
    outFormat: 'Formato de salida',
    fmtKeep: 'Mantener original',
    fmtJpeg: 'JPEG (el más pequeño para fotos)',
    fmtPng: 'PNG (sin pérdida, más grande)',
    fmtWebp: 'WebP (pequeño, navegadores modernos)',
    quality: 'Calidad',
    qualityNote: 'Solo aplica a JPEG y WebP. 80 a 85 es el punto ideal para fotos.',
    resize: 'Cambiar tamaño',
    resizing: 'Cambiando tamaño...',
    download: 'Descargar',
    downloadAll: 'Descargar todas',
    original: 'Original',
    resized: 'Redimensionada',
    noFiles: 'Añade al menos una imagen primero.',
    errorLoad: 'No se pudo leer esta imagen. Prueba con un JPG, PNG o WebP.',
    errorEncode: 'No se pudo codificar esta imagen en el formato elegido.',
    errorDims: 'Escribe dimensiones válidas (1 a 16000 px).',
    privacy: 'Privacidad: las imágenes se procesan en tu dispositivo con la API Canvas. Nada se sube, guarda ni envía a ningún servidor.',
    seeAlso: 'Más herramientas para creadores',
    siblings: [
      { href: '/es/tools/compresor-de-imagenes', label: 'Compresor de Imágenes' },
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
    ],
  },
};

function loadBitmap(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('load'));
    };
    img.src = url;
  });
}

function encodeCanvas(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('encode'));
    }, mime, quality);
  });
}

export default function ImageResizerTool({ lang = 'en' }) {
  const S = STR[lang] || STR.en;
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('preset');
  const [presetId, setPresetId] = useState('instagram-post');
  const [targetW, setTargetW] = useState(1080);
  const [targetH, setTargetH] = useState(1080);
  const [percent, setPercent] = useState(50);
  const [fitMode, setFitMode] = useState('fit');
  const [upscale, setUpscale] = useState(false);
  const [outFormat, setOutFormat] = useState('keep');
  const [quality, setQuality] = useState(85);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addFiles = (list) => {
    const picked = Array.from(list || []).filter((f) => f.type.startsWith('image/'));
    if (!picked.length) return;
    setFiles((prev) => [
      ...prev,
      ...picked.map((file) => ({ file, status: 'ready', out: null, error: '' })),
    ]);
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.out) URL.revokeObjectURL(f.out.url);
    });
    setFiles([]);
    setError('');
  };

  const boxDims = () => {
    if (mode === 'preset') {
      const p = RESIZE_PRESETS.find((x) => x.id === presetId) || RESIZE_PRESETS[0];
      return { w: p.w, h: p.h };
    }
    return { w: Number(targetW), h: Number(targetH) };
  };

  const resizeAll = async () => {
    if (!files.length) {
      setError(S.noFiles);
      return;
    }
    setError('');
    setBusy(true);
    const box = boxDims();
    const updated = [];
    for (const item of files) {
      try {
        const img = await loadBitmap(item.file);
        const ow = img.naturalWidth;
        const oh = img.naturalHeight;
        let dims = null;
        let drawMode = 'fit';
        if (mode === 'preset' || mode === 'exact') {
          drawMode = fitMode;
          dims = computeResizeDims(ow, oh, {
            mode: fitMode === 'fit' ? 'fit' : fitMode,
            targetW: box.w,
            targetH: box.h,
            allowUpscale: upscale,
          });
        } else if (mode === 'width') {
          dims = computeResizeDims(ow, oh, { mode: 'width', targetW: Number(targetW), allowUpscale: upscale });
        } else if (mode === 'height') {
          dims = computeResizeDims(ow, oh, { mode: 'height', targetH: Number(targetH), allowUpscale: upscale });
        } else {
          dims = computeResizeDims(ow, oh, { mode: 'percent', percent: Number(percent), allowUpscale: upscale });
        }
        if (!dims) {
          updated.push({ ...item, status: 'error', error: S.errorDims });
          continue;
        }
        const canvas = document.createElement('canvas');
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext('2d');
        if (drawMode === 'fill') {
          const r = coverSourceRect(ow, oh, dims.width, dims.height);
          ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, dims.width, dims.height);
        } else {
          ctx.drawImage(img, 0, 0, dims.width, dims.height);
        }
        let mime = item.file.type;
        if (outFormat !== 'keep') mime = 'image/' + outFormat;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) mime = 'image/jpeg';
        const blob = await encodeCanvas(canvas, mime, quality / 100);
        const url = URL.createObjectURL(blob);
        updated.push({
          ...item,
          status: 'done',
          out: {
            url,
            width: dims.width,
            height: dims.height,
            size: blob.size,
            name: resizedName(item.file.name, dims.width, dims.height, outputExtensionFor(mime)),
          },
          origW: ow,
          origH: oh,
        });
      } catch (e) {
        updated.push({ ...item, status: 'error', error: e.message === 'load' ? S.errorLoad : S.errorEncode });
      }
    }
    setFiles(updated);
    setBusy(false);
  };

  const downloadAll = () => {
    files.filter((f) => f.out).forEach((f, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = f.out.url;
        a.download = f.out.name;
        a.click();
      }, i * 300);
    });
  };

  const field = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.95rem' };
  const label = { display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' };

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{ border: '2px dashed #94a3b8', borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>{S.drop}</p>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{S.formats}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <p style={{ fontSize: '0.9rem', color: '#475569' }}>
          {files.length} {lang === 'es' ? 'imagen(es) lista(s)' : 'image(s) loaded'}
          {' · '}
          <button type="button" onClick={clearAll} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: 600 }}>
            {S.clear}
          </button>
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={label}>{S.mode}</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={field}>
            <option value="preset">{S.modePreset}</option>
            <option value="exact">{S.modeExact}</option>
            <option value="width">{S.modeWidth}</option>
            <option value="height">{S.modeHeight}</option>
            <option value="percent">{S.modePercent}</option>
          </select>
        </div>
        {mode === 'preset' && (
          <div>
            <label style={label}>{S.preset}</label>
            <select value={presetId} onChange={(e) => setPresetId(e.target.value)} style={field}>
              {RESIZE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{S.presetLabels[p.id]}</option>
              ))}
            </select>
          </div>
        )}
        {(mode === 'exact') && (
          <>
            <div>
              <label style={label}>{S.width}</label>
              <input type="number" min="1" max="16000" value={targetW} onChange={(e) => setTargetW(e.target.value)} style={field} />
            </div>
            <div>
              <label style={label}>{S.height}</label>
              <input type="number" min="1" max="16000" value={targetH} onChange={(e) => setTargetH(e.target.value)} style={field} />
            </div>
          </>
        )}
        {mode === 'width' && (
          <div>
            <label style={label}>{S.width}</label>
            <input type="number" min="1" max="16000" value={targetW} onChange={(e) => setTargetW(e.target.value)} style={field} />
          </div>
        )}
        {mode === 'height' && (
          <div>
            <label style={label}>{S.height}</label>
            <input type="number" min="1" max="16000" value={targetH} onChange={(e) => setTargetH(e.target.value)} style={field} />
          </div>
        )}
        {mode === 'percent' && (
          <div>
            <label style={label}>{S.percent}</label>
            <input type="number" min="1" max="800" value={percent} onChange={(e) => setPercent(e.target.value)} style={field} />
          </div>
        )}
        {(mode === 'preset' || mode === 'exact') && (
          <div>
            <label style={label}>{S.fitMode}</label>
            <select value={fitMode} onChange={(e) => setFitMode(e.target.value)} style={field}>
              <option value="fit">{S.fitFit}</option>
              <option value="fill">{S.fitFill}</option>
              <option value="stretch">{S.fitStretch}</option>
            </select>
          </div>
        )}
        <div>
          <label style={label}>{S.outFormat}</label>
          <select value={outFormat} onChange={(e) => setOutFormat(e.target.value)} style={field}>
            <option value="keep">{S.fmtKeep}</option>
            <option value="jpeg">{S.fmtJpeg}</option>
            <option value="png">{S.fmtPng}</option>
            <option value="webp">{S.fmtWebp}</option>
          </select>
        </div>
        <div>
          <label style={label}>{S.quality}: {quality}%</label>
          <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%' }} />
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{S.qualityNote}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: 4 }}>
          <label style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={upscale} onChange={(e) => setUpscale(e.target.checked)} /> {S.upscale}
          </label>
        </div>
      </div>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <button
        type="button"
        onClick={resizeAll}
        disabled={busy}
        style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', marginRight: 10 }}
      >
        {busy ? S.resizing : S.resize}
      </button>
      {files.some((f) => f.out) && (
        <button
          type="button"
          onClick={downloadAll}
          style={{ background: '#fff', color: '#0f766e', border: '1px solid #0f766e', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
        >
          {S.downloadAll}
        </button>
      )}

      {files.map((f, i) => (
        <div key={i} className="card" style={{ marginTop: 16 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 600 }}>{f.file.name}</p>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#475569' }}>
            {S.original}: {f.origW ? f.origW + ' x ' + f.origH : '...'} · {formatBytes(f.file.size)}
            {f.out && (
              <> · {S.resized}: {f.out.width} x {f.out.height} · {formatBytes(f.out.size)}</>
            )}
          </p>
          {f.status === 'error' && <p style={{ color: '#b91c1c' }}>{f.error}</p>}
          {f.out && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img src={f.out.url} alt={f.out.name} style={{ maxWidth: 320, maxHeight: 240, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <a
                href={f.out.url}
                download={f.out.name}
                style={{ background: '#0f766e', color: '#fff', borderRadius: 8, padding: '8px 16px', fontWeight: 600, textDecoration: 'none' }}
              >
                {S.download}
              </a>
            </div>
          )}
        </div>
      ))}

      <p style={{ marginTop: 16, fontSize: '0.85rem', color: '#64748b' }}>{S.privacy}</p>
      <p style={{ fontSize: '0.9rem' }}>
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
