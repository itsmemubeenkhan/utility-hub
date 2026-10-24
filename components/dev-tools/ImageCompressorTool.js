'use client';
/* Free Image Compressor: batch JPG/PNG/WebP compression 100% in the
   browser via Canvas. Quality slider, resize limits, output format
   choice, and a target file size mode (binary quality search for lossy
   formats, scale-down search for PNG) aimed at the "photo under 100KB"
   portal use case. Nothing is uploaded: files never leave the device. */
import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  formatBytes,
  fitDimensions,
  outputExtension,
  compressedName,
  savedPercent,
  qualitySteps,
  scaleSteps,
} from '@/lib/image-utils';

const STR = {
  en: {
    drop: 'Drop images here, or choose files',
    choose: 'Choose images',
    addMore: 'Add more images',
    clear: 'Clear all',
    formats: 'JPG, PNG, WebP and GIF (first frame). Several files at once.',
    outFormat: 'Output format',
    fmtKeep: 'Keep original',
    fmtJpeg: 'JPEG (smallest for photos)',
    fmtPng: 'PNG (lossless, bigger)',
    fmtWebp: 'WebP (small, modern browsers)',
    quality: 'Quality',
    qualityNote: 'Lower quality means a smaller file. 80 to 85 is the sweet spot for photos.',
    maxSize: 'Max width / height (px)',
    maxNote: 'Images larger than this are scaled down. Leave 1920 for web use; use 800 for email and forms.',
    target: 'Target file size',
    targetOff: 'No target (use quality above)',
    target100: 'Under 100 KB (job and exam portals)',
    target200: 'Under 200 KB',
    target500: 'Under 500 KB',
    targetCustom: 'Custom target',
    targetKb: 'Custom target (KB)',
    compress: 'Compress images',
    compressing: 'Compressing...',
    download: 'Download',
    downloadAll: 'Download all compressed',
    original: 'Original',
    compressed: 'Compressed',
    saved: 'saved',
    targetMiss: 'Could not reach the target even at the smallest settings; this is the smallest version produced.',
    targetHit: 'Target reached.',
    errorLoad: 'Could not read this image. Try a JPG, PNG or WebP file.',
    errorEncode: 'Could not encode this image in the chosen format.',
    noFiles: 'Add at least one image first.',
    privacy: 'Privacy: images are processed on your device with the Canvas API. Nothing is uploaded, stored or sent to any server.',
    seeAlso: 'More tools for makers',
    siblings: [
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
    ],
  },
  es: {
    drop: 'Suelta imágenes aquí o elige archivos',
    choose: 'Elegir imágenes',
    addMore: 'Añadir más imágenes',
    clear: 'Limpiar todo',
    formats: 'JPG, PNG, WebP y GIF (primer cuadro). Varios archivos a la vez.',
    outFormat: 'Formato de salida',
    fmtKeep: 'Mantener original',
    fmtJpeg: 'JPEG (el más pequeño para fotos)',
    fmtPng: 'PNG (sin pérdida, más grande)',
    fmtWebp: 'WebP (pequeño, navegadores modernos)',
    quality: 'Calidad',
    qualityNote: 'Menos calidad significa un archivo más pequeño. 80 a 85 es el punto ideal para fotos.',
    maxSize: 'Ancho / alto máximo (px)',
    maxNote: 'Las imágenes más grandes se reducen. Deja 1920 para web; usa 800 para correo y formularios.',
    target: 'Tamaño objetivo',
    targetOff: 'Sin objetivo (usar la calidad de arriba)',
    target100: 'Menos de 100 KB (portales de empleo y exámenes)',
    target200: 'Menos de 200 KB',
    target500: 'Menos de 500 KB',
    targetCustom: 'Objetivo personalizado',
    targetKb: 'Objetivo personalizado (KB)',
    compress: 'Comprimir imágenes',
    compressing: 'Comprimiendo...',
    download: 'Descargar',
    downloadAll: 'Descargar todas las comprimidas',
    original: 'Original',
    compressed: 'Comprimida',
    saved: 'ahorrado',
    targetMiss: 'No se pudo alcanzar el objetivo ni con los ajustes mínimos; esta es la versión más pequeña producida.',
    targetHit: 'Objetivo alcanzado.',
    errorLoad: 'No se pudo leer esta imagen. Prueba con un JPG, PNG o WebP.',
    errorEncode: 'No se pudo codificar esta imagen en el formato elegido.',
    noFiles: 'Añade al menos una imagen primero.',
    privacy: 'Privacidad: las imágenes se procesan en tu dispositivo con la API Canvas. Nada se sube, guarda ni envía a ningún servidor.',
    seeAlso: 'Más herramientas para creadores',
    siblings: [
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de Códigos QR' },
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
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

async function compressOne(img, opts) {
  const { outMime, quality, maxW, maxH, targetBytes } = opts;
  const base = fitDimensions(img.naturalWidth, img.naturalHeight, maxW, maxH);
  const draw = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (outMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return c;
  };

  if (!targetBytes) {
    const blob = await encodeCanvas(draw(base.width, base.height), outMime, quality);
    return blob ? { blob, width: base.width, height: base.height, hit: true } : null;
  }

  if (outMime === 'image/png') {
    for (const s of scaleSteps()) {
      const w = Math.max(1, Math.round(base.width * s));
      const h = Math.max(1, Math.round(base.height * s));
      const blob = await encodeCanvas(draw(w, h), outMime);
      if (blob && blob.size <= targetBytes) return { blob, width: w, height: h, hit: true };
      if (blob && s === scaleSteps()[scaleSteps().length - 1]) return { blob, width: w, height: h, hit: false };
    }
    return null;
  }

  let best = null;
  for (const q of qualitySteps()) {
    const blob = await encodeCanvas(draw(base.width, base.height), outMime, q);
    if (!blob) return null;
    best = { blob, width: base.width, height: base.height, hit: blob.size <= targetBytes };
    if (blob.size <= targetBytes) return best;
  }
  for (const s of scaleSteps().slice(1)) {
    const w = Math.max(1, Math.round(base.width * s));
    const h = Math.max(1, Math.round(base.height * s));
    const blob = await encodeCanvas(draw(w, h), outMime, 0.5);
    if (!blob) return null;
    best = { blob, width: w, height: h, hit: blob.size <= targetBytes };
    if (blob.size <= targetBytes) return best;
  }
  return best;
}

let uid = 0;

export default function ImageCompressorTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [items, setItems] = useState([]);
  const [format, setFormat] = useState('original');
  const [quality, setQuality] = useState(82);
  const [maxDim, setMaxDim] = useState(1920);
  const [target, setTarget] = useState('off');
  const [customKb, setCustomKb] = useState(100);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const fresh = [];
    Array.from(list || []).forEach((file) => {
      if (!file.type || !file.type.startsWith('image/')) return;
      const id = 'img-' + uid++;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, width: img.naturalWidth, height: img.naturalHeight } : it))
        );
        URL.revokeObjectURL(url);
      };
      fresh.push({ id, file, name: file.name, size: file.size, type: file.type, preview: url, width: 0, height: 0, result: null, error: '' });
    });
    if (fresh.length) setItems((prev) => [...prev, ...fresh]);
  };

  const run = async () => {
    if (!items.length) {
      setNotice(t.noFiles);
      return;
    }
    setBusy(true);
    setNotice('');
    const targetBytes =
      target === 'off' ? 0 : target === 'custom' ? Math.max(1, customKb) * 1024 : parseInt(target, 10) * 1024;
    for (const it of items) {
      if (it.result) continue;
      try {
        const img = await loadBitmap(it.file);
        let mime = 'image/jpeg';
        if (format === 'png') mime = 'image/png';
        else if (format === 'webp') mime = 'image/webp';
        else if (format === 'original') mime = it.type === 'image/png' ? 'image/png' : it.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        const out = await compressOne(img, { outMime: mime, quality: quality / 100, maxW: maxDim, maxH: maxDim, targetBytes });
        if (!out || !out.blob) {
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, error: t.errorEncode } : x)));
          continue;
        }
        const ext = outputExtension(mime);
        const url = URL.createObjectURL(out.blob);
        setItems((prev) =>
          prev.map((x) =>
            x.id === it.id
              ? { ...x, result: { url, size: out.blob.size, width: out.width, height: out.height, name: compressedName(it.name, ext), hit: out.hit, target: !!targetBytes } }
              : x
          )
        );
      } catch (e) {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, error: t.errorLoad } : x)));
      }
    }
    setBusy(false);
  };

  const downloadOne = (res) => {
    const a = document.createElement('a');
    a.href = res.url;
    a.download = res.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadAll = () => {
    items.filter((it) => it.result).forEach((it, i) => {
      setTimeout(() => downloadOne(it.result), i * 300);
    });
  };

  const doneCount = items.filter((it) => it.result).length;

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{ border: '2px dashed #2563eb', borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer', background: '#eff6ff' }}
      >
        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.drop}</div>
        <div style={{ color: '#555', marginTop: 6 }}>{t.formats}</div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => inputRef.current && inputRef.current.click()} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #2563eb', background: '#fff', cursor: 'pointer' }}>
            {t.addMore}
          </button>
          <button type="button" onClick={() => setItems([])} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
            {t.clear}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        <label style={{ display: 'block' }}>
          <span style={{ fontWeight: 700 }}>{t.outFormat}</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ display: 'block', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}>
            <option value="original">{t.fmtKeep}</option>
            <option value="jpeg">{t.fmtJpeg}</option>
            <option value="png">{t.fmtPng}</option>
            <option value="webp">{t.fmtWebp}</option>
          </select>
        </label>

        <label style={{ display: 'block' }}>
          <span style={{ fontWeight: 700 }}>{t.quality}: {quality}%</span>
          <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} style={{ display: 'block', width: '100%', marginTop: 6 }} />
          <span style={{ color: '#555', fontSize: '0.9rem' }}>{t.qualityNote}</span>
        </label>

        <label style={{ display: 'block' }}>
          <span style={{ fontWeight: 700 }}>{t.maxSize}</span>
          <input type="number" min="100" max="8000" step="100" value={maxDim} onChange={(e) => setMaxDim(parseInt(e.target.value, 10) || 1920)} style={{ display: 'block', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }} />
          <span style={{ color: '#555', fontSize: '0.9rem' }}>{t.maxNote}</span>
        </label>

        <label style={{ display: 'block' }}>
          <span style={{ fontWeight: 700 }}>{t.target}</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ display: 'block', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}>
            <option value="off">{t.targetOff}</option>
            <option value="100">{t.target100}</option>
            <option value="200">{t.target200}</option>
            <option value="500">{t.target500}</option>
            <option value="custom">{t.targetCustom}</option>
          </select>
        </label>
        {target === 'custom' && (
          <label style={{ display: 'block' }}>
            <span style={{ fontWeight: 700 }}>{t.targetKb}</span>
            <input type="number" min="10" max="5000" value={customKb} onChange={(e) => setCustomKb(parseInt(e.target.value, 10) || 100)} style={{ display: 'block', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }} />
          </label>
        )}
      </div>

      <button type="button" onClick={run} disabled={busy} style={{ marginTop: 20, padding: '12px 22px', borderRadius: 10, border: 0, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', fontSize: '1rem' }}>
        {busy ? t.compressing : t.compress}
      </button>
      {doneCount > 1 && (
        <button type="button" onClick={downloadAll} style={{ marginTop: 20, marginLeft: 10, padding: '12px 22px', borderRadius: 10, border: '1px solid #2563eb', background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
          {t.downloadAll}
        </button>
      )}
      {notice && <p style={{ color: '#b91c1c', marginTop: 12 }}>{notice}</p>}

      {items.length > 0 && (
        <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          {items.map((it) => (
            <div key={it.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <img src={it.preview} alt={it.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, background: '#f3f4f6' }} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, wordBreak: 'break-all' }}>{it.name}</div>
                <div style={{ color: '#555', marginTop: 4 }}>
                  {t.original}: {formatBytes(it.size)}
                  {it.width > 0 ? ' · ' + it.width + ' x ' + it.height + ' px' : ''}
                </div>
                {it.result && (
                  <div style={{ marginTop: 8 }}>
                    <div>
                      {t.compressed}: {formatBytes(it.result.size)} · {it.result.width} x {it.result.height} px ·{' '}
                      <strong style={{ color: '#15803d' }}>{savedPercent(it.size, it.result.size)}% {t.saved}</strong>
                    </div>
                    {it.result.target && (
                      <div style={{ color: it.result.hit ? '#15803d' : '#b45309', marginTop: 4 }}>
                        {it.result.hit ? t.targetHit : t.targetMiss}
                      </div>
                    )}
                    <button type="button" onClick={() => downloadOne(it.result)} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 8, border: 0, background: '#15803d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                      {t.download} ({it.result.name})
                    </button>
                  </div>
                )}
                {it.error && <div style={{ color: '#b91c1c', marginTop: 8 }}>{it.error}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: '#555', marginTop: 24 }}>{t.privacy}</p>
      <div style={{ marginTop: 16 }}>
        <strong>{t.seeAlso}:</strong>{' '}
        {t.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 ? ' · ' : ''}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
