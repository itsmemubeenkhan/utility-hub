/* Barcode validation + GS1 check-digit helpers (pure JS, no DOM).
   The React component imports these; the math is unit-tested in node.
   JsBarcode renders the bars; everything correctness-critical lives here. */

export const BARCODE_FORMATS = [
  { id: 'code128', jsb: 'CODE128', maxLen: 48 },
  { id: 'ean13', jsb: 'EAN13', maxLen: 13 },
  { id: 'upc', jsb: 'UPC', maxLen: 12 },
  { id: 'code39', jsb: 'CODE39', maxLen: 43 },
  { id: 'itf14', jsb: 'ITF14', maxLen: 14 },
  { id: 'codabar', jsb: 'codabar', maxLen: 22 },
];

/* GS1 mod-10 check digit. `digits` = the payload WITHOUT the check digit
   (12 for EAN-13, 11 for UPC-A, 13 for ITF-14). Weights from the right:
   odd positions x3, even positions x1; check = (10 - sum%10) % 10. */
export function gs1CheckDigit(digits) {
  const s = String(digits || '');
  if (!/^\d+$/.test(s) || s.length === 0) return null;
  let sum = 0;
  const rev = s.split('').reverse();
  for (let i = 0; i < rev.length; i += 1) {
    sum += Number(rev[i]) * (i % 2 === 0 ? 3 : 1);
  }
  return String((10 - (sum % 10)) % 10);
}

const CODE39_RE = /^[A-Z0-9 \-. $/+%]*$/;
const CODABAR_RE = /^[A-D][0-9\-$\/:\.+]*[A-D]$/;

/* validateBarcode(formatId, raw) -> { ok, value } | { ok:false, errorKey }
   `value` is the exact string to hand to JsBarcode (check digits appended
   or uppercased as needed). errorKey is looked up in the component STR. */
export function validateBarcode(formatId, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { ok: false, errorKey: 'empty' };

  if (formatId === 'code128') {
    if (text.length > 48) return { ok: false, errorKey: 'too-long' };
    if (!/^[\x20-\x7E]*$/.test(text)) return { ok: false, errorKey: 'code128-charset' };
    return { ok: true, value: text };
  }

  if (formatId === 'ean13') {
    if (!/^\d+$/.test(text)) return { ok: false, errorKey: 'digits-only' };
    if (text.length === 12) return { ok: true, value: text + gs1CheckDigit(text), autoCheck: true };
    if (text.length === 13) {
      const want = gs1CheckDigit(text.slice(0, 12));
      if (text[12] !== want) return { ok: false, errorKey: 'ean13-check' };
      return { ok: true, value: text };
    }
    return { ok: false, errorKey: 'ean13-length' };
  }

  if (formatId === 'upc') {
    if (!/^\d+$/.test(text)) return { ok: false, errorKey: 'digits-only' };
    if (text.length === 11) return { ok: true, value: text + gs1CheckDigit(text), autoCheck: true };
    if (text.length === 12) {
      const want = gs1CheckDigit(text.slice(0, 11));
      if (text[11] !== want) return { ok: false, errorKey: 'upc-check' };
      return { ok: true, value: text };
    }
    return { ok: false, errorKey: 'upc-length' };
  }

  if (formatId === 'code39') {
    const upper = text.toUpperCase();
    if (upper.length > 43) return { ok: false, errorKey: 'too-long' };
    if (!CODE39_RE.test(upper)) return { ok: false, errorKey: 'code39-charset' };
    return { ok: true, value: upper };
  }

  if (formatId === 'itf14') {
    if (!/^\d+$/.test(text)) return { ok: false, errorKey: 'digits-only' };
    if (text.length === 13) return { ok: true, value: text + gs1CheckDigit(text), autoCheck: true };
    if (text.length === 14) {
      const want = gs1CheckDigit(text.slice(0, 13));
      if (text[13] !== want) return { ok: false, errorKey: 'itf14-check' };
      return { ok: true, value: text };
    }
    return { ok: false, errorKey: 'itf14-length' };
  }

  if (formatId === 'codabar') {
    const upper = text.toUpperCase();
    if (upper.length > 22) return { ok: false, errorKey: 'too-long' };
    if (!CODABAR_RE.test(upper)) return { ok: false, errorKey: 'codabar-format' };
    return { ok: true, value: upper };
  }

  return { ok: false, errorKey: 'unknown-format' };
}
