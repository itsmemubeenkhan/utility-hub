/* QR tool helpers — pure string building, no DOM, no dependencies.
   QR rendering itself lives in components/qr-tools (uses the `qrcode` package
   client-side). The WiFi payload format follows the widely supported
   WIFI:T:...;S:...;P:...;H:...;; scheme. */

export function escapeWifiField(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:');
}

/* encryption: 'WPA' | 'WEP' | 'nopass'. Returns the WIFI: payload string. */
export function buildWifiPayload({ ssid, password, encryption = 'WPA', hidden = false } = {}) {
  const enc = encryption === 'nopass' ? 'nopass' : encryption === 'WEP' ? 'WEP' : 'WPA';
  let p = 'WIFI:T:' + enc + ';S:' + escapeWifiField(ssid) + ';';
  if (enc !== 'nopass') p += 'P:' + escapeWifiField(password) + ';';
  if (hidden) p += 'H:true;';
  return p + ';';
}

/* Rough capacity check so the UI can warn before the encoder throws.
   Byte-mode capacities at each ECC level (QR spec, versions 1-40). */
const BYTE_CAPACITY = { L: 2953, M: 2331, Q: 1663, H: 1273 };

export function qrFits(text, ecc = 'M') {
  const len = Buffer.byteLength(String(text == null ? '' : text), 'utf8');
  return len <= (BYTE_CAPACITY[ecc] || BYTE_CAPACITY.M);
}

export function qrMaxChars(ecc = 'M') {
  return BYTE_CAPACITY[ecc] || BYTE_CAPACITY.M;
}
