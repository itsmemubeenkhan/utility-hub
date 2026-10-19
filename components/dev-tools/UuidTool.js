'use client';
/* UUID Generator: RFC 4122 v4 UUIDs via crypto.randomUUID(), bulk mode
   (1-500), uppercase / no-hyphens options, copy and download as .txt. */
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STR = {
  en: {
    count: 'How many',
    uppercase: 'Uppercase',
    noHyphens: 'Remove hyphens',
    generate: 'Generate',
    copyAll: 'Copy all',
    copied: 'Copied!',
    download: 'Download .txt',
    empty: 'Press Generate to create UUIDs.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/password-generator', label: 'Password Generator' },
    ],
    privacy:
      'Privacy: UUIDs are generated locally in your browser with crypto.randomUUID(), a cryptographically secure source. Nothing is uploaded or stored.',
  },
  es: {
    count: 'Cantidad',
    uppercase: 'Mayúsculas',
    noHyphens: 'Quitar guiones',
    generate: 'Generar',
    copyAll: 'Copiar todos',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    empty: 'Presiona Generar para crear UUIDs.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/generador-de-contrasenas-aleatorias', label: 'Generador de contraseñas' },
    ],
    privacy:
      'Privacidad: los UUIDs se generan localmente en tu navegador con crypto.randomUUID(), una fuente criptográficamente segura. Nada se sube ni se almacena.',
  },
};

const COUNTS = [1, 10, 25, 50, 100, 250, 500];

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

export default function UuidTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      let u = crypto.randomUUID();
      if (noHyphens) u = u.replace(/-/g, '');
      if (uppercase) u = u.toUpperCase();
      out.push(u);
    }
    setUuids(out);
    setCopied(false);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!uuids.length) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          {t.count}:{' '}
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }}
          >
            {COUNTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.uppercase}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.noHyphens}
        </label>
        <button type="button" style={primaryBtnStyle} onClick={generate}>{t.generate}</button>
      </div>

      {uuids.length > 0 ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" onClick={copyAll} style={{ ...btnStyle, padding: '6px 12px' }}>{copied ? t.copied : t.copyAll}</button>
            <button type="button" onClick={download} style={{ ...btnStyle, padding: '6px 12px' }}>{t.download}</button>
          </div>
          <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, maxHeight: 420, overflow: 'auto' }}>
            {uuids.join('\n')}
          </pre>
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t.empty}</p>
      )}

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>🔒 {t.privacy}</p>

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
