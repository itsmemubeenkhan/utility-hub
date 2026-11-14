'use client';
/* Image to Base64 Converter: encode an image file to Base64 and
   decode Base64 back to an image. Encoding runs entirely in the
   browser with FileReader.readAsDataURL, and the optional re-encode
   redraws raster images on a canvas (JPEG/WebP with quality, or a
   capped width) before encoding, so the output can be much smaller
   than a plain encode. Pure string and byte work lives in
   lib/image-base64-utils.js and is node-tested. Supports drag-drop,
   file picker, clipboard paste, a canvas-generated sample image,
   five output snippets with per-tab copy, .txt download of the data
   URI, and a decode mode with live preview and image download. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ACCEPT_ATTR, isReencodableMime, isSupportedMime,
  formatBytes, computeStats, buildDataUri, parseDataUri,
  normalizeBase64Input, decodeBase64ToBytes, sniffMimeFromBytes,
  buildHtmlImg, buildCssBackground, buildMarkdownImage,
  downloadFilename,
} from '@/lib/image-base64-utils';

const STR = {
  en: {
    modeEncode: 'Encode image to Base64',
    modeDecode: 'Decode Base64 to image',
    dropLabel: 'Drop an image here, click to choose a file, or paste one (Ctrl+V)',
    dropHint: 'PNG, JPG, GIF, WebP, SVG, BMP, ICO. Your image never leaves your browser.',
    browse: 'Choose image',
    sample: 'Try a sample image',
    pasteHint: 'Tip: copy any image and press Ctrl+V here to paste it.',
    fileName: 'File',
    fileSize: 'Size',
    fileType: 'Type',
    dimensions: 'Dimensions',
    reencodeTitle: 'Shrink before encoding (optional)',
    formatLabel: 'Output format',
    formatOriginal: 'Keep original',
    quality: 'Quality',
    maxWidth: 'Max width (px)',
    maxWidthNone: 'No limit',
    outputs: 'Output',
    tabBase64: 'Base64',
    tabDataUri: 'Data URI',
    tabHtml: 'HTML <img>',
    tabCss: 'CSS background',
    tabMarkdown: 'Markdown',
    copy: 'Copy',
    copied: 'Copied!',
    downloadTxt: 'Download data URI (.txt)',
    empty: 'Your Base64 output will appear here.',
    statsOriginal: 'Original',
    statsBase64: 'Base64',
    statsOverhead: 'overhead',
    reencoding: 'Re-encoding...',
    reencodeFailed: 'Re-encode failed, showing the original image instead.',
    reencodeSkipped: 'SVG and ICO files cannot be re-encoded, showing the original image.',
    reencodedSize: 'Re-encoded size',
    decodeLabel: 'Base64 string or data URI',
    decodePlaceholder: 'Paste a Base64 string or a full data URI, e.g. data:image/png;base64,iVBOR...',
    decodeEmpty: 'Paste Base64 above to see the image preview.',
    decodeInvalid: 'That does not look like valid Base64. Check for missing padding (=) or extra characters.',
    decodedType: 'Detected type',
    decodedSize: 'Decoded size',
    downloadImage: 'Download image',
    preview: 'Preview',
    unknownType: 'Unknown image format',
    note: 'Base64 makes an image about 33% larger than the original file, so it is best for small images such as icons and logos. Use the re-encode option to convert to JPEG or WebP and lower the quality before encoding, and the stats line shows exactly how much you saved.',
    privacy:
      'Privacy: encoding, re-encoding and decoding run locally in your browser. Your image is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/image-compressor', label: 'Image Compressor' },
      { href: '/tools/image-resizer', label: 'Image Resizer' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
    ],
  },
  es: {
    modeEncode: 'Codificar imagen a Base64',
    modeDecode: 'Decodificar Base64 a imagen',
    dropLabel: 'Suelta una imagen aquí, haz clic para elegir un archivo, o pega una (Ctrl+V)',
    dropHint: 'PNG, JPG, GIF, WebP, SVG, BMP, ICO. Tu imagen nunca sale de tu navegador.',
    browse: 'Elegir imagen',
    sample: 'Probar una imagen de ejemplo',
    pasteHint: 'Consejo: copia cualquier imagen y presiona Ctrl+V aquí para pegarla.',
    fileName: 'Archivo',
    fileSize: 'Tamaño',
    fileType: 'Tipo',
    dimensions: 'Dimensiones',
    reencodeTitle: 'Reducir antes de codificar (opcional)',
    formatLabel: 'Formato de salida',
    formatOriginal: 'Mantener original',
    quality: 'Calidad',
    maxWidth: 'Ancho máx. (px)',
    maxWidthNone: 'Sin límite',
    outputs: 'Salida',
    tabBase64: 'Base64',
    tabDataUri: 'URI de datos',
    tabHtml: 'HTML <img>',
    tabCss: 'Fondo CSS',
    tabMarkdown: 'Markdown',
    copy: 'Copiar',
    copied: '¡Copiado!',
    downloadTxt: 'Descargar URI de datos (.txt)',
    empty: 'Tu salida Base64 aparecerá aquí.',
    statsOriginal: 'Original',
    statsBase64: 'Base64',
    statsOverhead: 'sobrecarga',
    reencoding: 'Recodificando...',
    reencodeFailed: 'La recodificación falló, se muestra la imagen original.',
    reencodeSkipped: 'Los archivos SVG e ICO no se pueden recodificar, se muestra la imagen original.',
    reencodedSize: 'Tamaño recodificado',
    decodeLabel: 'Cadena Base64 o URI de datos',
    decodePlaceholder: 'Pega una cadena Base64 o una URI de datos completa, p. ej. data:image/png;base64,iVBOR...',
    decodeEmpty: 'Pega Base64 arriba para ver la vista previa de la imagen.',
    decodeInvalid: 'Eso no parece Base64 válido. Revisa si falta el relleno (=) o sobran caracteres.',
    decodedType: 'Tipo detectado',
    decodedSize: 'Tamaño decodificado',
    downloadImage: 'Descargar imagen',
    preview: 'Vista previa',
    unknownType: 'Formato de imagen desconocido',
    note: 'Base64 hace que una imagen sea alrededor de un 33% más grande que el archivo original, así que es mejor para imágenes pequeñas como iconos y logotipos. Usa la opción de recodificación para convertir a JPEG o WebP y bajar la calidad antes de codificar, y la línea de estadísticas muestra exactamente cuánto ahorraste.',
    privacy:
      'Privacidad: la codificación, la recodificación y la decodificación corren localmente en tu navegador. Tu imagen nunca se sube, se guarda ni la ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/codificador-base64', label: 'Codificador y Decodificador Base64' },
      { href: '/es/tools/compresor-de-imagenes', label: 'Compresor de Imágenes' },
      { href: '/es/tools/redimensionador-de-imagenes', label: 'Redimensionador de Imágenes' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
    ],
  },
};

const btnStyle = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};
const areaStyle = {
  width: '100%',
  minHeight: 180,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const preStyle = {
  ...areaStyle,
  minHeight: 180,
  marginTop: 6,
  background: '#f9fafb',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};
const inputStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};
const tabStyle = (active) => ({
  ...btnStyle,
  background: active ? '#1d4ed8' : '#fff',
  color: active ? '#fff' : '#111827',
  borderColor: active ? '#1d4ed8' : '#d1d5db',
});

/* Read natural dimensions for a raster preview. SVG files without
   width and height report 0, which the caller treats as unknown. */
function loadDimensions(dataUri) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUri;
  });
}

function readFileAsDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });
}

/* Redraw a raster image on a canvas at the target format, quality
   and width cap, then return its new data URI and size. Returns
   null when the browser cannot load or encode the image. */
function reencodeImage(dataUri, { format, quality, maxWidth }) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = maxWidth > 0 && img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          const reader = new FileReader();
          reader.onload = () => resolve({ dataUri: String(reader.result || ''), width: w, height: h, size: blob.size });
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }, format, quality);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUri;
  });
}

/* Generate a small sample PNG in the browser: a gradient with
   shapes and a label, so the tool works with no file at hand. */
function makeSampleImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 320, 180);
  grad.addColorStop(0, '#1d4ed8');
  grad.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(70, 90, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(150, 55, 120, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('Sample', 150, 150);
  return canvas.toDataURL('image/png');
}

export default function ImageBase64Tool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('encode');
  const [file, setFile] = useState(null);
  const [encoded, setEncoded] = useState(null);
  const [reencoding, setReencoding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [opts, setOpts] = useState({ format: 'original', quality: 0.8, maxWidth: 0 });
  const [tab, setTab] = useState('base64');
  const [copied, setCopied] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');
  const fileRef = useRef(null);

  const setOpt = (key, value) => setOpts((o) => ({ ...o, [key]: value }));

  const takeFile = async (f) => {
    if (!f) return;
    try {
      const dataUri = await readFileAsDataUri(f);
      const parsed = parseDataUri(dataUri);
      const mime = parsed.ok ? parsed.mime : (f.type || 'application/octet-stream');
      const dims = await loadDimensions(dataUri);
      setFile({ name: f.name || 'image', mime, size: f.size, dataUri, width: dims.width, height: dims.height });
    } catch {
      /* unreadable file, keep the previous one */
    }
  };

  /* Re-encode whenever the file or the shrink options change. The
     original data URI is used when no shrink is requested, when the
     format cannot be redrawn (SVG, ICO), or when re-encode fails. */
  useEffect(() => {
    let alive = true;
    if (!file) { setEncoded(null); setReencoding(false); return; }
    const wantsShrink = opts.format !== 'original' || opts.maxWidth > 0;
    if (!wantsShrink || !isReencodableMime(file.mime)) {
      setEncoded({
        dataUri: file.dataUri, width: file.width, height: file.height,
        size: file.size, reencoded: false,
        skipped: wantsShrink && !isReencodableMime(file.mime),
      });
      return;
    }
    setReencoding(true);
    const format = opts.format === 'original' ? file.mime : opts.format;
    reencodeImage(file.dataUri, { format, quality: opts.quality, maxWidth: opts.maxWidth })
      .then((res) => {
        if (!alive) return;
        if (res) {
          setEncoded({ dataUri: res.dataUri, width: res.width, height: res.height, size: res.size, reencoded: true });
        } else {
          setEncoded({ dataUri: file.dataUri, width: file.width, height: file.height, size: file.size, reencoded: false, failed: true });
        }
      })
      .finally(() => { if (alive) setReencoding(false); });
    return () => { alive = false; };
  }, [file, opts.format, opts.quality, opts.maxWidth]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    takeFile(f);
  };

  const onPaste = (e) => {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    for (const item of items) {
      if (item.kind === 'file') {
        e.preventDefault();
        takeFile(item.getAsFile());
        return;
      }
    }
    for (const item of items) {
      if (item.kind === 'string' && item.type === 'text/plain') {
        item.getAsString((text) => {
          const parsed = parseDataUri(String(text || '').trim());
          if (parsed.ok && isSupportedMime(parsed.mime)) {
            e.preventDefault();
            loadDimensions(text.trim()).then((dims) => {
              setFile({ name: 'pasted-image', mime: parsed.mime, size: parsed.base64.length, dataUri: text.trim(), width: dims.width, height: dims.height });
            });
          }
        });
        return;
      }
    }
  };

  const onSample = async () => {
    const dataUri = makeSampleImage();
    const dims = await loadDimensions(dataUri);
    const parsed = parseDataUri(dataUri);
    setFile({ name: 'sample.png', mime: 'image/png', size: parsed.ok ? parsed.base64.length : 0, dataUri, width: dims.width, height: dims.height });
  };

  const altName = file ? file.name.replace(/\.[^.]+$/, '') || 'image' : 'image';
  const base64Part = encoded ? encoded.dataUri.split(',').slice(1).join(',') : '';
  const stats = encoded ? computeStats(file.size, base64Part.length) : null;
  const outputs = encoded ? {
    base64: base64Part,
    dataUri: encoded.dataUri,
    html: buildHtmlImg(encoded.dataUri, altName),
    css: buildCssBackground(encoded.dataUri),
    markdown: buildMarkdownImage(encoded.dataUri, altName),
  } : null;
  const currentOutput = outputs ? outputs[tab] : '';

  const copy = async () => {
    if (!currentOutput) return;
    try {
      await navigator.clipboard.writeText(currentOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadTxt = () => {
    if (!encoded) return;
    const blob = new Blob([encoded.dataUri], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-base64.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const decoded = useMemo(() => {
    if (!decodeInput.trim()) return null;
    const norm = normalizeBase64Input(decodeInput);
    if (!norm.ok) return { ok: false, error: norm.error };
    const bytes = decodeBase64ToBytes(norm.base64);
    if (!bytes) return { ok: false, error: 'invalid-base64' };
    const sniffed = sniffMimeFromBytes(bytes);
    const mime = norm.mime && norm.mime !== 'application/octet-stream' ? norm.mime : sniffed;
    return {
      ok: true,
      mime: mime || 'application/octet-stream',
      unknown: !mime,
      size: bytes.length,
      bytes,
      dataUri: buildDataUri(mime || 'application/octet-stream', norm.base64),
    };
  }, [decodeInput]);

  const downloadDecoded = () => {
    if (!decoded || !decoded.ok) return;
    const blob = new Blob([decoded.bytes], { type: decoded.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename(decoded.mime, 'decoded-image');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setMode('encode')} style={tabStyle(mode === 'encode')}>{t.modeEncode}</button>
        <button type="button" onClick={() => setMode('decode')} style={tabStyle(mode === 'decode')}>{t.modeDecode}</button>
      </div>

      {mode === 'encode' && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onPaste={onPaste}
            onClick={() => fileRef.current && fileRef.current.click()}
            style={{
              border: '2px dashed ' + (dragging ? '#1d4ed8' : '#d1d5db'),
              background: dragging ? '#eff6ff' : '#f9fafb',
              borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer',
            }}
          >
            <p style={{ margin: '0 0 6px', fontWeight: 700 }}>{t.dropLabel}</p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{t.dropHint}</p>
            <p style={{ margin: '10px 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{t.pasteHint}</p>
          </div>
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} onChange={(e) => { takeFile(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.browse}</button>
            <button type="button" onClick={onSample} style={btnStyle}>{t.sample}</button>
            {file && (
              <button type="button" onClick={() => setFile(null)} style={btnStyle}>✕</button>
            )}
          </div>

          {file && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                <img src={encoded ? encoded.dataUri : file.dataUri} alt={altName} style={{ maxWidth: 220, maxHeight: 180, borderRadius: 10, border: '1px solid #e5e7eb', objectFit: 'contain' }} />
                <div style={{ fontSize: '0.92rem', lineHeight: 1.8 }}>
                  <div><strong>{t.fileName}:</strong> {file.name}</div>
                  <div><strong>{t.fileType}:</strong> {file.mime}</div>
                  <div><strong>{t.fileSize}:</strong> {formatBytes(file.size)}</div>
                  {file.width > 0 && (
                    <div><strong>{t.dimensions}:</strong> {file.width} × {file.height} px</div>
                  )}
                  {encoded && encoded.reencoded && (
                    <div><strong>{t.reencodedSize}:</strong> {formatBytes(encoded.size)}</div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 14, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }}>
                <p style={{ fontWeight: 700, margin: '0 0 10px', fontSize: '0.95rem' }}>{t.reencodeTitle}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', alignItems: 'flex-end' }}>
                  <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {t.formatLabel}
                    <select value={opts.format} onChange={(e) => setOpt('format', e.target.value)} style={{ ...inputStyle, width: 150 }}>
                      <option value="original">{t.formatOriginal}</option>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/webp">WebP</option>
                      <option value="image/png">PNG</option>
                    </select>
                  </label>
                  {(opts.format === 'image/jpeg' || opts.format === 'image/webp') && (
                    <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {t.quality}: {Math.round(opts.quality * 100)}%
                      <input type="range" min="0.1" max="1" step="0.05" value={opts.quality} onChange={(e) => setOpt('quality', Number(e.target.value))} style={{ width: 150 }} />
                    </label>
                  )}
                  <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {t.maxWidth}
                    <input type="number" min="0" step="50" value={opts.maxWidth} placeholder={t.maxWidthNone} onChange={(e) => setOpt('maxWidth', Math.max(0, Number(e.target.value) || 0))} style={{ ...inputStyle, width: 130 }} />
                  </label>
                </div>
                {reencoding && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '10px 0 0' }}>{t.reencoding}</p>}
                {encoded && encoded.failed && <p style={{ color: '#b45309', fontSize: '0.85rem', margin: '10px 0 0' }}>{t.reencodeFailed}</p>}
                {encoded && encoded.skipped && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '10px 0 0' }}>{t.reencodeSkipped}</p>}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputs}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => setTab('base64')} style={tabStyle(tab === 'base64')}>{t.tabBase64}</button>
                  <button type="button" onClick={() => setTab('dataUri')} style={tabStyle(tab === 'dataUri')}>{t.tabDataUri}</button>
                  <button type="button" onClick={() => setTab('html')} style={tabStyle(tab === 'html')}>{t.tabHtml}</button>
                  <button type="button" onClick={() => setTab('css')} style={tabStyle(tab === 'css')}>{t.tabCss}</button>
                  <button type="button" onClick={() => setTab('markdown')} style={tabStyle(tab === 'markdown')}>{t.tabMarkdown}</button>
                </div>
                {currentOutput ? (
                  <pre style={preStyle}>{currentOutput}</pre>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
                )}
                {stats && (
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
                    {t.statsOriginal}: {formatBytes(stats.originalBytes)}
                    {' · ' + t.statsBase64 + ': ' + formatBytes(stats.base64Length)}
                    {' · ' + stats.overheadPct + '% ' + t.statsOverhead}
                    {' · ' + stats.base64Length.toLocaleString() + ' characters'}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={copy} disabled={!currentOutput} style={btnStyle}>{copied ? t.copied : t.copy}</button>
                  <button type="button" onClick={downloadTxt} disabled={!encoded} style={btnStyle}>{t.downloadTxt}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'decode' && (
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.decodeLabel}</label>
          <textarea
            value={decodeInput}
            onChange={(e) => setDecodeInput(e.target.value)}
            placeholder={t.decodePlaceholder}
            style={{ ...areaStyle, marginTop: 6 }}
          />
          {decoded && !decoded.ok && (
            <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: 8 }}>{t.decodeInvalid}</p>
          )}
          {decoded && decoded.ok && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>{t.preview}</p>
              <img src={decoded.dataUri} alt="Decoded image" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, border: '1px solid #e5e7eb', objectFit: 'contain' }} />
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 8 }}>
                {t.decodedType}: {decoded.unknown ? t.unknownType : decoded.mime}
                {' · ' + t.decodedSize + ': ' + formatBytes(decoded.size)}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={downloadDecoded} style={btnStyle}>{t.downloadImage}</button>
              </div>
            </div>
          )}
          {!decoded && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.decodeEmpty}</p>
          )}
        </div>
      )}

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>⚡ {t.note}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>🔒 {t.privacy}</p>

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
