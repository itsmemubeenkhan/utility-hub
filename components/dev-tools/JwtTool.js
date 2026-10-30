'use client';
/* JWT Decoder: paste a token, read its header and payload, check expiry and
   spot alg none risks. Decoding only, no signature verification, and
   everything runs in the browser; nothing is uploaded. */
import { useState } from 'react';
import Link from 'next/link';
import { decodeJwt, formatClaimDate, tokenStatus, tokenWarnings, SAMPLE_TOKEN } from '@/lib/jwt-utils';

const TIME_CLAIMS = new Set(['exp', 'iat', 'nbf', 'auth_time']);

const STR = {
  en: {
    tokenLabel: 'JWT token',
    tokenPlaceholder: 'Paste a token: header.payload.signature',
    decode: 'Decode token',
    loadSample: 'Load sample token',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied!',
    empty: 'Your decoded token will appear here. Paste a token and press Decode, or load the sample token to see how it works.',
    errorPrefix: 'Could not decode: ',
    errors: {
      empty: 'Paste a token first.',
      'bad-shape': 'A JWT has exactly three parts separated by dots: header.payload.signature.',
      'bad-base64-header': 'The header part is not valid Base64URL.',
      'bad-base64-payload': 'The payload part is not valid Base64URL.',
      'bad-json-header': 'The header does not decode to a JSON object.',
      'bad-json-payload': 'The payload does not decode to a JSON object.',
    },
    statusLabel: 'Token status',
    status: {
      valid: 'Valid (not expired)',
      expired: 'Expired',
      'not-yet-valid': 'Not yet valid',
      'no-expiry': 'No expiry claim (exp) found',
    },
    headerTitle: 'Header',
    payloadTitle: 'Payload',
    signatureTitle: 'Signature (display only)',
    signatureNote: 'The signature proves the token was not altered, but this tool does not verify it. Verification needs the server secret or public key and belongs on the server.',
    claimsTitle: 'Claims',
    claimKey: 'Claim',
    claimValue: 'Value',
    claimHuman: 'Human-readable',
    warningsTitle: 'Warnings',
    warnings: {
      'alg-none': 'alg is "none": this token is unsigned. Never trust an unsigned token.',
      'alg-missing': 'No alg in the header: the signing algorithm is unknown.',
      expired: 'This token is expired (exp is in the past).',
      'not-yet-valid': 'This token is not yet valid (nbf is in the future).',
      'no-expiry': 'No exp claim: this token never expires unless the server rejects it another way.',
    },
    noWarnings: 'No warnings: the header names an algorithm, and the token carries an expiry claim.',
    copyHeader: 'Copy header JSON',
    copyPayload: 'Copy payload JSON',
    privacy: 'Privacy: decoding runs locally in your browser. Your token is never uploaded, stored or logged. Still, prefer a test token over a live production token.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/unix-timestamp-converter', label: 'Unix Timestamp Converter' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
    ],
  },
  es: {
    tokenLabel: 'Token JWT',
    tokenPlaceholder: 'Pega un token: header.payload.signature',
    decode: 'Decodificar token',
    loadSample: 'Cargar token de ejemplo',
    clear: 'Limpiar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    empty: 'Tu token decodificado aparecerá aquí. Pega un token y pulsa Decodificar, o carga el token de ejemplo para ver cómo funciona.',
    errorPrefix: 'No se pudo decodificar: ',
    errors: {
      empty: 'Pega un token primero.',
      'bad-shape': 'Un JWT tiene exactamente tres partes separadas por puntos: header.payload.signature.',
      'bad-base64-header': 'La parte del header no es Base64URL válido.',
      'bad-base64-payload': 'La parte del payload no es Base64URL válido.',
      'bad-json-header': 'El header no decodifica a un objeto JSON.',
      'bad-json-payload': 'El payload no decodifica a un objeto JSON.',
    },
    statusLabel: 'Estado del token',
    status: {
      valid: 'Válido (no expirado)',
      expired: 'Expirado',
      'not-yet-valid': 'Aún no válido',
      'no-expiry': 'Sin claim de expiración (exp)',
    },
    headerTitle: 'Header',
    payloadTitle: 'Payload',
    signatureTitle: 'Firma (solo lectura)',
    signatureNote: 'La firma prueba que el token no fue alterado, pero esta herramienta no la verifica. La verificación necesita el secreto o la llave pública del servidor y pertenece al servidor.',
    claimsTitle: 'Claims',
    claimKey: 'Claim',
    claimValue: 'Valor',
    claimHuman: 'Legible',
    warningsTitle: 'Advertencias',
    warnings: {
      'alg-none': 'alg es "none": este token no está firmado. Nunca confíes en un token sin firma.',
      'alg-missing': 'Sin alg en el header: el algoritmo de firma es desconocido.',
      expired: 'Este token expiró (exp está en el pasado).',
      'not-yet-valid': 'Este token aún no es válido (nbf está en el futuro).',
      'no-expiry': 'Sin claim exp: este token nunca expira a menos que el servidor lo rechace de otra forma.',
    },
    noWarnings: 'Sin advertencias: el header nombra un algoritmo y el token tiene un claim de expiración.',
    copyHeader: 'Copiar header JSON',
    copyPayload: 'Copiar payload JSON',
    privacy: 'Privacidad: la decodificación corre localmente en tu navegador. Tu token nunca se sube, guarda ni registra. Aun así, prefiere un token de prueba sobre un token de producción en vivo.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/convertidor-de-timestamp-unix', label: 'Convertidor de Timestamp Unix' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
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
  fontSize: '0.9rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

export default function JwtTool({ lang }) {
  const s = STR[lang] || STR.en;
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = () => {
    setError(''); setCopied(false);
    try {
      const decoded = decodeJwt(token);
      const status = tokenStatus(decoded.payload, Date.now());
      setResult({ ...decoded, status, warnings: tokenWarnings(decoded.header, decoded.payload, status) });
    } catch (e) {
      setResult(null);
      setError(s.errorPrefix + (s.errors[e.message] || e.message));
    }
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  const statusColor = result
    ? result.status === 'valid' ? '#15803d' : result.status === 'expired' ? '#dc2626' : '#b45309'
    : '#334155';

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.tokenLabel}</label>
      <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder={s.tokenPlaceholder}
        style={{ ...inputStyle, minHeight: 110, resize: 'vertical', wordBreak: 'break-all' }} spellCheck={false} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={run} style={primaryBtnStyle}>{s.decode}</button>
        <button type="button" onClick={() => { setToken(SAMPLE_TOKEN); setError(''); setResult(null); }} style={btnStyle}>{s.loadSample}</button>
        <button type="button" onClick={() => { setToken(''); setError(''); setResult(null); }} style={btnStyle}>{s.clear}</button>
      </div>

      {error && <p style={{ color: '#dc2626', fontWeight: 600, marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <div className="card" style={{ borderLeft: `4px solid ${statusColor}` }}>
            <strong>{s.statusLabel}: </strong>
            <span style={{ color: statusColor, fontWeight: 700 }}>{s.status[result.status]}</span>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>{s.warningsTitle}</h3>
            {result.warnings.length === 0
              ? <p style={{ margin: 0, color: '#334155' }}>{s.noWarnings}</p>
              : <ul style={{ margin: 0, paddingLeft: 20 }}>{result.warnings.map((w) => (
                <li key={w} style={{ color: '#dc2626', fontWeight: 600 }}>{s.warnings[w]}</li>
              ))}</ul>}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>{s.headerTitle}</h3>
            <pre style={{ margin: 0, overflowX: 'auto', fontSize: '0.9rem' }}>{pretty(result.header)}</pre>
            <button type="button" onClick={() => copyText(pretty(result.header))} style={{ ...btnStyle, marginTop: 10, padding: '6px 12px', fontSize: '0.85rem' }}>
              {copied ? s.copied : s.copyHeader}
            </button>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>{s.payloadTitle}</h3>
            <pre style={{ margin: 0, overflowX: 'auto', fontSize: '0.9rem' }}>{pretty(result.payload)}</pre>
            <button type="button" onClick={() => copyText(pretty(result.payload))} style={{ ...btnStyle, marginTop: 10, padding: '6px 12px', fontSize: '0.85rem' }}>
              {copied ? s.copied : s.copyPayload}
            </button>
          </div>

          <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{s.claimsTitle}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 8 }}>{s.claimKey}</th>
                  <th style={{ padding: 8 }}>{s.claimValue}</th>
                  <th style={{ padding: 8 }}>{s.claimHuman}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.payload).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{k}</td>
                    <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </td>
                    <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>
                      {TIME_CLAIMS.has(k) && typeof v === 'number' ? (formatClaimDate(v) || '') : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>{s.signatureTitle}</h3>
            <p style={{ fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all', margin: 0 }}>{result.signature}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 0 }}>{s.signatureNote}</p>
          </div>
        </div>
      )}

      {!result && !error && <p style={{ color: '#64748b', marginTop: 16 }}>{s.empty}</p>}

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 20 }}>{s.privacy}</p>
      <div style={{ marginTop: 16 }}>
        <strong>{s.seeAlso}:</strong>{' '}
        {s.siblings.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
