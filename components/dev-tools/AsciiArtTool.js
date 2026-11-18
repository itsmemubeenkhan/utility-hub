'use client';
/* ASCII Art Generator: turn an image or a word into text art.
   Image mode samples a picture through a canvas and maps each
   pixel's brightness to a character. Text mode renders the typed
   word to an offscreen canvas in a big bold font, then samples it
   through the same brightness engine, so no hand-written FIGlet
   fonts are needed. 100% in your browser, nothing is uploaded. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ACCEPTED_IMAGE_TYPES, ASCII_CHARSETS, MAX_IMAGE_BYTES,
  SAMPLE_BANNER_TEXT, asciiDimensions, asciiStats, demoPatternBrightness,
  gridToAsciiRows, pixelBrightness, rowsToText,
} from '@/lib/ascii-art-utils';

const STR = {
  en: {
    modeImage: 'Image to ASCII',
    modeText: 'Text to ASCII',
    dropHere: 'Drop an image here, paste one from the clipboard, or click to pick a file',
    filePicked: 'File',
    wrongType: 'That file is not a supported image. Use PNG, JPG, WebP or GIF.',
    tooBig: 'That image is over 10 MB. Pick a smaller file.',
    sampleImage: 'Sample image',
    sampleText: 'Sample text',
    clear: 'Clear',
    textLabel: 'Text for your banner',
    textPlaceholder: 'Type a word or short phrase...',
    widthLabel: 'Width',
    charsUnit: 'characters',
    charsetLabel: 'Character set',
    invertLabel: 'Invert (dark on light)',
    colorLabel: 'Color mode (paint each character in its pixel color)',
    monoLabel: 'Monochrome',
    brightnessLabel: 'Brightness',
    contrastLabel: 'Contrast',
    copy: 'Copy as text',
    copied: 'Copied!',
    downloadTxt: 'Download .txt',
    downloadPng: 'Download as PNG',
    emptyImage: 'Drop an image, paste one, or try the sample image to see ASCII art here.',
    emptyText: 'Type text above, or try the sample text, to see your ASCII banner here.',
    statsChars: 'characters',
    statsLines: 'lines',
    statsNonSpace: 'visible characters',
    howTitle: 'How does image to ASCII art work?',
    howNote: 'Each pixel becomes one character. Dark pixels get dense characters like @ and #, bright pixels get light ones like a dot or a space, so the picture reappears in text. Monospace characters are about twice as tall as they are wide, so the height is halved to keep the picture from stretching. Color mode paints every character in its own pixel color, which keeps photos recognizable at small sizes.',
    privacy: 'Privacy: everything runs in your browser. Your images and text are never uploaded, stored or seen by anyone else.',
    seeAlso: 'More image tools',
    siblings: [
      { href: '/tools/image-compressor', label: 'Image Compressor' },
      { href: '/tools/image-resizer', label: 'Image Resizer' },
      { href: '/tools/image-to-base64-converter', label: 'Image to Base64' },
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
    ],
  },
  es: {
    modeImage: 'Imagen a ASCII',
    modeText: 'Texto a ASCII',
    dropHere: 'Suelta una imagen aquí, pega una del portapapeles, o haz clic para elegir un archivo',
    filePicked: 'Archivo',
    wrongType: 'Ese archivo no es una imagen compatible. Usa PNG, JPG, WebP o GIF.',
    tooBig: 'Esa imagen supera los 10 MB. Elige un archivo más pequeño.',
    sampleImage: 'Imagen de ejemplo',
    sampleText: 'Texto de ejemplo',
    clear: 'Limpiar',
    textLabel: 'Texto para tu banner',
    textPlaceholder: 'Escribe una palabra o frase corta...',
    widthLabel: 'Ancho',
    charsUnit: 'caracteres',
    charsetLabel: 'Conjunto de caracteres',
    invertLabel: 'Invertir (oscuro sobre claro)',
    colorLabel: 'Modo color (pinta cada carácter con el color de su píxel)',
    monoLabel: 'Monocromo',
    brightnessLabel: 'Brillo',
    contrastLabel: 'Contraste',
    copy: 'Copiar como texto',
    copied: '¡Copiado!',
    downloadTxt: 'Descargar .txt',
    downloadPng: 'Descargar como PNG',
    emptyImage: 'Suelta una imagen, pega una, o prueba la imagen de ejemplo para ver arte ASCII aquí.',
    emptyText: 'Escribe texto arriba, o prueba el texto de ejemplo, para ver tu banner ASCII aquí.',
    statsChars: 'caracteres',
    statsLines: 'líneas',
    statsNonSpace: 'caracteres visibles',
    howTitle: '¿Cómo funciona la imagen a arte ASCII?',
    howNote: 'Cada píxel se convierte en un carácter. Los píxeles oscuros reciben caracteres densos como @ y #, los claros reciben caracteres ligeros como un punto o un espacio, así la imagen reaparece en texto. Los caracteres monoespaciados son casi el doble de altos que de anchos, así que la altura se reduce a la mitad para que la imagen no se estire. El modo color pinta cada carácter con el color de su propio píxel, lo que mantiene las fotos reconocibles en tamaños pequeños.',
    privacy: 'Privacidad: todo corre en tu navegador. Tus imágenes y tu texto nunca se suben, se guardan ni los ve nadie más.',
    seeAlso: 'Más herramientas de imagen',
    siblings: [
      { href: '/es/tools/compresor-de-imagenes', label: 'Compresor de Imágenes' },
      { href: '/es/tools/redimensionador-de-imagenes', label: 'Redimensionador de Imágenes' },
      { href: '/es/tools/convertidor-de-imagen-a-base64', label: 'Imagen a Base64' },
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de Códigos QR' },
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
const primaryBtnStyle = { ...btnStyle, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '1rem',
  boxSizing: 'border-box',
};
const labelStyle = { fontSize: '0.95rem', fontWeight: 600 };
const sliderStyle = { width: '100%', accentColor: '#2563eb' };

/* Sample a drawable (Image or canvas) into brightness/color cells. */
function sampleDrawable(drawable, srcW, srcH, targetWidth) {
  const dims = asciiDimensions(srcW, srcH, targetWidth);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(drawable, 0, 0, dims.width, dims.height);
  const data = ctx.getImageData(0, 0, dims.width, dims.height).data;
  const grid = [];
  for (let y = 0; y < dims.height; y += 1) {
    const row = [];
    for (let x = 0; x < dims.width; x += 1) {
      const i = (y * dims.width + x) * 4;
      row.push({
        b: pixelBrightness(data[i], data[i + 1], data[i + 2]),
        r: data[i],
        g: data[i + 1],
        bl: data[i + 2],
      });
    }
    grid.push(row);
  }
  return grid;
}

/* Render banner text to an offscreen canvas, black on white, sized so
   the text fits, then sample it like an image. */
function textToCanvas(text) {
  const canvas = document.createElement('canvas');
  const measure = canvas.getContext('2d');
  const targetW = 900;
  let fontSize = 220;
  measure.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  const textW = measure.measureText(text).width || 1;
  if (textW > targetW) fontSize = Math.max(24, Math.floor((fontSize * targetW) / textW));
  const pad = 24;
  canvas.width = targetW + pad * 2;
  canvas.height = Math.ceil(fontSize * 1.35) + pad * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas;
}

export default function AsciiArtTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('image');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [width, setWidth] = useState(100);
  const [charset, setCharset] = useState('standard');
  const [invert, setInvert] = useState(false);
  const [colorMode, setColorMode] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  /* { drawable, w, h } for the current image, or null. */
  const sourceRef = useRef(null);

  const regenerate = () => {
    if (mode === 'image') {
      const src = sourceRef.current;
      if (!src) {
        setRows(null);
        return;
      }
      const grid = sampleDrawable(src.drawable, src.w, src.h, width);
      setRows(gridToAsciiRows(grid, charset, { invert, brightness, contrast }));
    } else {
      if (!text.trim()) {
        setRows(null);
        return;
      }
      const canvas = textToCanvas(text.trim());
      const grid = sampleDrawable(canvas, canvas.width, canvas.height, width);
      setRows(gridToAsciiRows(grid, charset, { invert, brightness, contrast }));
    }
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, text, width, charset, invert, brightness, contrast, file]);

  const loadImageFile = (f) => {
    if (!f) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
      setError(t.wrongType);
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError(t.tooBig);
      return;
    }
    setError('');
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      sourceRef.current = { drawable: img, w: img.naturalWidth, h: img.naturalHeight };
      setFile(f);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError(t.wrongType);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const loadSampleImage = () => {
    setError('');
    const w = 200;
    const h = 100;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = (y * w + x) * 4;
        const b = demoPatternBrightness(x, y, w, h);
        imgData.data[i] = b;
        imgData.data[i + 1] = b;
        imgData.data[i + 2] = b;
        imgData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    sourceRef.current = { drawable: canvas, w, h };
    setFile({ name: 'sample.png', size: 0 });
  };

  /* Clipboard paste: images pasted anywhere on the page land here. */
  useEffect(() => {
    if (mode !== 'image') return undefined;
    const onPaste = (e) => {
      const item = Array.from(e.clipboardData?.items || []).find((it) => it.type.startsWith('image/'));
      if (item) loadImageFile(item.getAsFile());
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const clearAll = () => {
    sourceRef.current = null;
    setFile(null);
    setText('');
    setRows(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const asciiText = rows ? rowsToText(rows) : '';
  const stats = asciiStats(asciiText);

  const copyText = async () => {
    if (!asciiText) return;
    try {
      await navigator.clipboard.writeText(asciiText);
      setCopied('copy');
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadTxt = () => {
    if (!asciiText) return;
    const blob = new Blob([asciiText + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!rows) return;
    const fontSize = 14;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    const charW = measure.measureText('M').width || fontSize * 0.6;
    const cols = rows[0] ? rows[0].length : 0;
    const pad = 12;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(cols * charW) + pad * 2;
    canvas.height = Math.ceil(rows.length * fontSize) + pad * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = 'top';
    rows.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = colorMode
          ? `rgb(${cell.r}, ${cell.g}, ${cell.bl})`
          : '#111827';
        ctx.fillText(cell.ch, pad + x * charW, pad + y * fontSize);
      });
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'ascii-art.png';
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setMode('image')} style={mode === 'image' ? primaryBtnStyle : btnStyle}>{t.modeImage}</button>
        <button type="button" onClick={() => setMode('text')} style={mode === 'text' ? primaryBtnStyle : btnStyle}>{t.modeText}</button>
      </div>

      {mode === 'image' ? (
        <div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadImageFile(e.dataTransfer.files[0]); }}
            style={{
              padding: '28px 16px', textAlign: 'center', borderRadius: 10,
              border: '2px dashed ' + (dragOver ? '#2563eb' : '#d1d5db'),
              background: dragOver ? '#eff6ff' : '#f9fafb', cursor: 'pointer', color: '#374151',
            }}
          >
            {file ? (
              <span><strong>{file.name}</strong>{file.size ? ' · ' + (file.size / 1024).toFixed(0) + ' KB' : ''}</span>
            ) : (
              <span>{t.dropHere}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={(e) => loadImageFile(e.target.files[0])}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={loadSampleImage} style={btnStyle}>{t.sampleImage}</button>
            <button type="button" onClick={clearAll} style={btnStyle}>{t.clear}</button>
          </div>
        </div>
      ) : (
        <div>
          <label style={labelStyle}>{t.textLabel}</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            maxLength={40}
            spellCheck={false}
            style={{ ...inputStyle, marginTop: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setText(SAMPLE_BANNER_TEXT)} style={btnStyle}>{t.sampleText}</button>
            <button type="button" onClick={clearAll} style={btnStyle}>{t.clear}</button>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: '#991b1b', fontSize: '0.9rem', marginTop: 12 }}>{error}</p>
      )}

      <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        <div>
          <label style={labelStyle}>{t.widthLabel}: {width} {t.charsUnit}</label>
          <input
            type="range"
            min={40}
            max={200}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            style={sliderStyle}
            aria-label={t.widthLabel}
          />
        </div>
        <div>
          <span style={labelStyle}>{t.charsetLabel}: </span>
          <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', marginLeft: 6 }}>
            {ASCII_CHARSETS.map((c) => (
              <button key={c.id} type="button" onClick={() => setCharset(c.id)} style={charset === c.id ? primaryBtnStyle : btnStyle}>
                {c.label}
              </button>
            ))}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
            {t.invertLabel}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={colorMode} onChange={(e) => setColorMode(e.target.checked)} />
            {colorMode ? t.colorLabel : t.monoLabel}
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t.brightnessLabel}: {brightness}</label>
            <input type="range" min={-100} max={100} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={sliderStyle} aria-label={t.brightnessLabel} />
          </div>
          <div>
            <label style={labelStyle}>{t.contrastLabel}: {contrast}</label>
            <input type="range" min={-100} max={100} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={sliderStyle} aria-label={t.contrastLabel} />
          </div>
        </div>
      </div>

      {rows ? (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              background: '#111827', borderRadius: 10, padding: 16,
              overflow: 'auto', maxHeight: 520,
            }}
          >
            <pre
              style={{
                margin: 0, color: '#f9fafb',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.72rem', lineHeight: 1.1, letterSpacing: 0,
              }}
            >
              {colorMode
                ? rows.map((row, y) => (
                    <span key={y} style={{ display: 'block' }}>
                      {row.map((cell, x) => (
                        <span key={x} style={{ color: `rgb(${cell.r}, ${cell.g}, ${cell.bl})` }}>{cell.ch}</span>
                      ))}
                    </span>
                  ))
                : asciiText}
            </pre>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 8 }}>
            {stats.chars.toLocaleString('en-US')} {t.statsChars} · {stats.lines.toLocaleString('en-US')} {t.statsLines} · {stats.nonSpace.toLocaleString('en-US')} {t.statsNonSpace}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={copyText} style={primaryBtnStyle}>{copied === 'copy' ? t.copied : t.copy}</button>
            <button type="button" onClick={downloadTxt} style={btnStyle}>{t.downloadTxt}</button>
            <button type="button" onClick={downloadPng} style={btnStyle}>{t.downloadPng}</button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 18 }}>
          {mode === 'image' ? t.emptyImage : t.emptyText}
        </p>
      )}

      <h3 style={{ fontSize: '1.05rem', marginTop: 26, marginBottom: 6 }}>{t.howTitle}</h3>
      <p style={{ color: '#374151', fontSize: '0.92rem', marginTop: 0 }}>{t.howNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 12 }}>🔒 {t.privacy}</p>

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
