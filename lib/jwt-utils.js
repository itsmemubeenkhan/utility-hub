/* Pure JWT decoding helpers. No verification: decoding only reveals the
   header and payload; proving the signature needs the server's secret or
   public key, which this tool deliberately never asks for. */

function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function parseSegment(segment, label) {
  let text;
  try {
    text = base64UrlDecode(segment);
  } catch {
    throw new Error('bad-base64-' + label);
  }
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    throw new Error('bad-json-' + label);
  }
}

export function decodeJwt(rawToken) {
  if (typeof rawToken !== 'string') throw new Error('empty');
  let token = rawToken.trim();
  if (/^bearer\s+/i.test(token)) token = token.replace(/^bearer\s+/i, '');
  if (!token) throw new Error('empty');
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !p)) throw new Error('bad-shape');
  const header = parseSegment(parts[0], 'header');
  const payload = parseSegment(parts[1], 'payload');
  if (typeof header.json !== 'object' || header.json === null || Array.isArray(header.json)) {
    throw new Error('bad-json-header');
  }
  if (typeof payload.json !== 'object' || payload.json === null || Array.isArray(payload.json)) {
    throw new Error('bad-json-payload');
  }
  return {
    header: header.json,
    headerText: header.text,
    payload: payload.json,
    payloadText: payload.text,
    signature: parts[2],
    segmentCount: 3,
  };
}

export function formatClaimDate(seconds) {
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

export function tokenStatus(payload, nowMs) {
  const nowSec = Math.floor(nowMs / 1000);
  if (typeof payload.exp === 'number') {
    if (nowSec >= payload.exp) return 'expired';
    if (typeof payload.nbf === 'number' && nowSec < payload.nbf) return 'not-yet-valid';
    return 'valid';
  }
  if (typeof payload.nbf === 'number' && nowSec < payload.nbf) return 'not-yet-valid';
  return 'no-expiry';
}

export function tokenWarnings(header, payload, status) {
  const warnings = [];
  if (header.alg === 'none') warnings.push('alg-none');
  else if (!header.alg) warnings.push('alg-missing');
  if (status === 'expired') warnings.push('expired');
  if (status === 'not-yet-valid') warnings.push('not-yet-valid');
  if (status === 'no-expiry') warnings.push('no-expiry');
  return warnings;
}

export const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
