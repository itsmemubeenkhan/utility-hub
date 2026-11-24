'use client';
/* Hash Generator: MD5, SHA-1, SHA-256, SHA-384 and SHA-512 for typed
   text or a dropped file, with optional HMAC, hex or Base64 output and
   a compare mode that verifies a pasted hash. The SHA family uses Web
   Crypto (crypto.subtle), MD5 runs on the pure-JS RFC 1321 code in
   lib/hash-utils, and nothing is ever uploaded or stored. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  HASH_ALGOS, SAMPLE_TEXT, bytesToBase64, bytesToHex, detectHashAlgorithm,
  formatBytes, hmacMd5, md5, utf8ByteLength,
} from '@/lib/hash-utils';

const SHA_NAME = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
};

async function shaDigest(algo, data) {
  const buf = await window.crypto.subtle.digest(SHA_NAME[algo], data);
  return new Uint8Array(buf);
}

async function hmacSha(algo, keyBytes, data) {
  const key = await window.crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: SHA_NAME[algo] }, false, ['sign']
  );
  const sig = await window.crypto.subtle.sign('HMAC', key, data);
  return new Uint8Array(sig);
}

const STR = {
  en: {
    modeText: 'Text',
    modeFile: 'File',
    inputLabel: 'Text to hash',
    inputPlaceholder: 'Type or paste text here...',
    sample: 'Sample text',
    clear: 'Clear',
    hmacLabel: 'HMAC mode (sign with a secret key)',
    hmacKeyLabel: 'Secret key',
    hmacKeyPlaceholder: 'Type your secret key...',
    formatLabel: 'Output format',
    hex: 'Hex',
    base64: 'Base64',
    copyAll: 'Copy all hashes',
    copied: 'Copied!',
    copy: 'Copy',
    empty: 'Type text above, or drop a file, to see all five hashes.',
    fileLabel: 'File to hash',
    dropHere: 'Drop a file here, or click to pick one',
    filePicked: 'File',
    size: 'Size',
    chars: 'characters',
    bytes: 'bytes',
    compareLabel: 'Compare / verify a hash',
    comparePlaceholder: 'Paste an expected hash here...',
    match: 'MATCH: this hash matches the input.',
    noMatch: 'NO MATCH: this hash does not match the input.',
    unknownLen: 'Unrecognized hash length: not MD5, SHA-1, SHA-256, SHA-384 or SHA-512.',
    detected: 'Detected algorithm',
    noSubtle: 'Your browser does not expose Web Crypto here (it needs a secure HTTPS page), so the SHA hashes cannot run. MD5 still works.',
    computing: 'Hashing...',
    securityTitle: 'Which hash should you trust?',
    securityNote: 'MD5 and SHA-1 are broken for security: collisions can be crafted, so use them only for simple checksums. SHA-256 is the everyday default; SHA-384 and SHA-512 are stronger. Never store passwords as plain MD5 or SHA-1.',
    privacy: 'Privacy: everything runs in your browser. Your text and files are never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/password-generator', label: 'Password Generator' },
      { href: '/tools/password-strength-checker', label: 'Password Strength Checker' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder' },
      { href: '/tools/jwt-decoder', label: 'JWT Decoder' },
    ],
    summaryPrefix: 'Hashes: ',
    summarySuffix: 'Generated with the Free Hash Generator at The Utility Hub.',
  },
  es: {
    modeText: 'Texto',
    modeFile: 'Archivo',
    inputLabel: 'Texto para hashear',
    inputPlaceholder: 'Escribe o pega texto aquí...',
    sample: 'Texto de ejemplo',
    clear: 'Limpiar',
    hmacLabel: 'Modo HMAC (firmar con una clave secreta)',
    hmacKeyLabel: 'Clave secreta',
    hmacKeyPlaceholder: 'Escribe tu clave secreta...',
    formatLabel: 'Formato de salida',
    hex: 'Hex',
    base64: 'Base64',
    copyAll: 'Copiar todos los hashes',
    copied: '¡Copiado!',
    copy: 'Copiar',
    empty: 'Escribe texto arriba, o suelta un archivo, para ver los cinco hashes.',
    fileLabel: 'Archivo para hashear',
    dropHere: 'Suelta un archivo aquí, o haz clic para elegir uno',
    filePicked: 'Archivo',
    size: 'Tamaño',
    chars: 'caracteres',
    bytes: 'bytes',
    compareLabel: 'Comparar / verificar un hash',
    comparePlaceholder: 'Pega un hash esperado aquí...',
    match: 'COINCIDE: este hash coincide con la entrada.',
    noMatch: 'NO COINCIDE: este hash no coincide con la entrada.',
    unknownLen: 'Longitud de hash no reconocida: no es MD5, SHA-1, SHA-256, SHA-384 ni SHA-512.',
    detected: 'Algoritmo detectado',
    noSubtle: 'Tu navegador no expone Web Crypto aquí (necesita una página segura HTTPS), así que los hashes SHA no pueden correr. MD5 sigue funcionando.',
    computing: 'Calculando hash...',
    securityTitle: '¿En qué hash deberías confiar?',
    securityNote: 'MD5 y SHA-1 están rotos para seguridad: se pueden crear colisiones, así que úsalos solo para checksums simples. SHA-256 es el valor por defecto de todos los días; SHA-384 y SHA-512 son más fuertes. Nunca guardes contraseñas como MD5 o SHA-1 simple.',
    privacy: 'Privacidad: todo corre en tu navegador. Tu texto y tus archivos nunca se suben, se guardan ni los ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/generador-de-contrasenas-aleatorias', label: 'Generador de Contraseñas' },
      { href: '/es/tools/comprobador-de-fortaleza-de-contrasena', label: 'Comprobador de Fortaleza de Contraseña' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/decodificador-jwt', label: 'Decodificador JWT' },
    ],
    summaryPrefix: 'Hashes: ',
    summarySuffix: 'Generado con el Generador de Hash gratis de The Utility Hub.',
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
const monoStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  wordBreak: 'break-all',
  fontSize: '0.85rem',
};

export default function HashGeneratorTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [fileBuffer, setFileBuffer] = useState(null);
  const [hmacOn, setHmacOn] = useState(false);
  const [hmacKey, setHmacKey] = useState('');
  const [format, setFormat] = useState('hex');
  const [hashes, setHashes] = useState(null);
  const [computing, setComputing] = useState(false);
  const [subtleOk, setSubtleOk] = useState(true);
  const [compare, setCompare] = useState('');
  const [copied, setCopied] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const reqId = useRef(0);

  useEffect(() => {
    setSubtleOk(Boolean(window.crypto && window.crypto.subtle));
  }, []);

  /* Live hashing, debounced so typing stays smooth. A request id drops
     stale async results when the input changes mid-compute. */
  useEffect(() => {
    if (mode !== 'text') return undefined;
    if (!text) {
      setHashes(null);
      setComputing(false);
      return undefined;
    }
    setComputing(true);
    const timer = setTimeout(() => {
      const id = reqId.current + 1;
      reqId.current = id;
      computeHashes(new TextEncoder().encode(text)).then((rows) => {
        if (reqId.current !== id) return;
        setHashes(rows);
        setComputing(false);
      });
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, mode, hmacOn, hmacKey]);

  async function computeHashes(data) {
    const keyBytes = hmacOn && hmacKey ? new TextEncoder().encode(hmacKey) : null;
    const rows = [];
    for (const algo of HASH_ALGOS) {
      let digest;
      if (algo.id === 'MD5') {
        digest = keyBytes ? hmacMd5(keyBytes, data) : md5(data);
      } else if (!window.crypto || !window.crypto.subtle) {
        digest = null;
      } else if (keyBytes) {
        digest = await hmacSha(algo.id, keyBytes, data);
      } else {
        digest = await shaDigest(algo.id, data);
      }
      rows.push({
        id: algo.id,
        broken: algo.broken,
        hex: digest ? bytesToHex(digest) : null,
        base64: digest ? bytesToBase64(digest) : null,
      });
    }
    return rows;
  }

  async function onFilePicked(f) {
    if (!f) return;
    setFile(f);
    setComputing(true);
    try {
      const buf = await f.arrayBuffer();
      setFileBuffer(buf);
      const id = reqId.current + 1;
      reqId.current = id;
      const rows = await computeHashes(new Uint8Array(buf));
      if (reqId.current !== id) return;
      setHashes(rows);
    } catch {
      setHashes(null);
    } finally {
      setComputing(false);
    }
  }

  /* Recompute file hashes when HMAC settings change. */
  useEffect(() => {
    if (mode !== 'file' || !fileBuffer) return undefined;
    const id = reqId.current + 1;
    reqId.current = id;
    setComputing(true);
    computeHashes(new Uint8Array(fileBuffer)).then((rows) => {
      if (reqId.current !== id) return;
      setHashes(rows);
      setComputing(false);
    });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hmacOn, hmacKey, mode]);

  const copyText = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const displayValue = (row) => (format === 'base64' ? row.base64 : row.hex);

  const detectedAlgo = compare.trim() ? detectHashAlgorithm(compare) : null;
  let verdict = null;
  if (compare.trim() && hashes) {
    if (!detectedAlgo) verdict = 'unknown';
    else {
      const row = hashes.find((r) => r.id === detectedAlgo);
      verdict = row && row.hex && row.hex.toLowerCase() === compare.trim().toLowerCase() ? 'match' : 'nomatch';
    }
  }

  const hasInput = mode === 'text' ? text.length > 0 : Boolean(file);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setMode('text')} style={mode === 'text' ? primaryBtnStyle : btnStyle}>{t.modeText}</button>
        <button type="button" onClick={() => setMode('file')} style={mode === 'file' ? primaryBtnStyle : btnStyle}>{t.modeFile}</button>
      </div>

      {mode === 'text' ? (
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            rows={5}
            spellCheck={false}
            style={{ ...inputStyle, marginTop: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', resize: 'vertical' }}
          />
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {text.length.toLocaleString('en-US')} {t.chars} {' · ' + utf8ByteLength(text).toLocaleString('en-US')} {t.bytes}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setText(SAMPLE_TEXT)} style={btnStyle}>{t.sample}</button>
            <button type="button" onClick={() => { setText(''); setHashes(null); }} style={btnStyle}>{t.clear}</button>
          </div>
        </div>
      ) : (
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.fileLabel}</label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) onFilePicked(e.dataTransfer.files[0]); }}
            style={{
              marginTop: 6, padding: '28px 16px', textAlign: 'center', borderRadius: 10,
              border: '2px dashed ' + (dragOver ? '#2563eb' : '#d1d5db'),
              background: dragOver ? '#eff6ff' : '#f9fafb', cursor: 'pointer', color: '#374151',
            }}
          >
            {file ? (
              <span><strong>{file.name}</strong> {' · ' + formatBytes(file.size)}</span>
            ) : (
              <span>{t.dropHere}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => onFilePicked(e.target.files[0])}
          />
          {file && (
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => { setFile(null); setFileBuffer(null); setHashes(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={btnStyle}>{t.clear}</button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginTop: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={hmacOn} onChange={(e) => setHmacOn(e.target.checked)} />
          {t.hmacLabel}
        </label>
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.formatLabel}:</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => setFormat('hex')} style={format === 'hex' ? primaryBtnStyle : btnStyle}>{t.hex}</button>
          <button type="button" onClick={() => setFormat('base64')} style={format === 'base64' ? primaryBtnStyle : btnStyle}>{t.base64}</button>
        </span>
      </div>

      {hmacOn && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.hmacKeyLabel}</label>
          <input
            type="password"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder={t.hmacKeyPlaceholder}
            autoComplete="off"
            spellCheck={false}
            style={{ ...inputStyle, marginTop: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
        </div>
      )}

      {!subtleOk && (
        <p style={{ color: '#991b1b', fontSize: '0.9rem', marginTop: 16 }}>⚠️ {t.noSubtle}</p>
      )}

      {!hasInput ? (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 18 }}>{t.empty}</p>
      ) : computing && !hashes ? (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 18 }}>{t.computing}</p>
      ) : hashes ? (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{hmacOn && hmacKey ? 'HMAC' : 'Hash'}</h3>
            <button
              type="button"
              onClick={() => copyText(hashes.map((r) => (hmacOn && hmacKey ? 'HMAC-' : '') + r.id + ': ' + displayValue(r)).join('\n'), 'all')}
              style={btnStyle}
            >
              {copied === 'all' ? t.copied : t.copyAll}
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {hashes.map((row) => (
              <div key={row.id} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {(hmacOn && hmacKey ? 'HMAC-' : '') + row.id}
                    {row.broken && <span style={{ color: '#991b1b', fontSize: '0.8rem', fontWeight: 600 }}> (checksum only)</span>}
                  </strong>
                  <button type="button" onClick={() => copyText(displayValue(row), row.id)} style={{ ...btnStyle, padding: '6px 12px' }}>
                    {copied === row.id ? t.copied : t.copy}
                  </button>
                </div>
                <div style={{ ...monoStyle, marginTop: 6, color: '#111827' }}>
                  {displayValue(row) || '-'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.compareLabel}</label>
            <input
              type="text"
              value={compare}
              onChange={(e) => setCompare(e.target.value)}
              placeholder={t.comparePlaceholder}
              autoComplete="off"
              spellCheck={false}
              style={{ ...inputStyle, marginTop: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            />
            {compare.trim() && (
              <p style={{
                marginTop: 10, padding: '10px 12px', borderRadius: 8, fontWeight: 700,
                background: verdict === 'match' ? '#f0fdf4' : verdict === 'nomatch' ? '#fef2f2' : '#fefce8',
                color: verdict === 'match' ? '#166534' : verdict === 'nomatch' ? '#991b1b' : '#854d0e',
                border: '1px solid ' + (verdict === 'match' ? '#bbf7d0' : verdict === 'nomatch' ? '#fecaca' : '#fde68a'),
              }}>
                {verdict === 'match' ? '✓ ' + t.match : verdict === 'nomatch' ? '✗ ' + t.noMatch : '⚠ ' + t.unknownLen}
                {detectedAlgo && ' (' + t.detected + ': ' + detectedAlgo + ')'}
              </p>
            )}
          </div>
        </div>
      ) : null}

      <h3 style={{ fontSize: '1.05rem', marginTop: 26, marginBottom: 6 }}>{t.securityTitle}</h3>
      <p style={{ color: '#374151', fontSize: '0.92rem', marginTop: 0 }}>{t.securityNote}</p>
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
