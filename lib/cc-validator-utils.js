/* Pure credit-card-number helpers (no DOM, so they run in both browser
   and node). A card number is only ever checked for correct FORM here:
   the Luhn (mod 10) checksum, the issuing network read from its IIN/BIN
   prefix, and the per-network length rules. A pass means "correctly
   formed" only. It does NOT prove the card is real, active, funded or
   issued, and no tool here ever asks for an expiry date or a security
   code. Spaces and hyphens are display only and are stripped before any
   check. Card numbers are 12 to 19 digits (ISO/IEC 7812); anything
   shorter or longer is rejected with a named reason instead of being
   silently truncated.

   Prefix overlaps are real and are resolved in a fixed order, documented
   here rather than guessed silently: 65 is shared by Discover and
   RuPay (reported as Discover), 60 is shared by RuPay and Maestro
   (reported as RuPay), and 62 is UnionPay. Mastercard's 2221-2720
   range is checked as a numeric range, as are Discover 622126-622925
   and Mir 2200-2204. Diners Club 300-305, 36, 38 and 39 are one network.
   Amex is the only 15-digit network here and the only one with a
   4-digit security code (CID); every other network uses a 3-digit CVV.
   Grouping is 4-4-4-4 for 16-digit cards, 4-6-5 for Amex, and groups of
   4 with the remainder in the last group for other lengths. */

export const SAMPLE_VISA = '4242 4242 4242 4242';
export const SAMPLE_MASTERCARD = '5555 5555 5555 4444';
export const SAMPLE_AMEX = '3782 822463 10005';
export const SAMPLE_DISCOVER = '6011 1111 1111 1117';
export const SAMPLE_JCB = '3566 0020 2036 0505';
export const SAMPLE_BULK =
  '4242424242424242\n5555555555554444\n378282246310005\n6011111111111117\n4242424242424241';

/* Network table: key, display name, prefix test (string prefix, list of
   prefixes, or numeric range on the leading digits), allowed lengths,
   security-code name and length, digit grouping. Order matters: the
   first match wins, so the more specific networks come first. */
export const NETWORKS = [
  {
    key: 'visa',
    name: 'Visa',
    prefixes: ['4'],
    lengths: [13, 16, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'mastercard',
    name: 'Mastercard',
    prefixes: ['51', '52', '53', '54', '55'],
    ranges: [{ start: 2221, end: 2720, digits: 4 }],
    lengths: [16],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'amex',
    name: 'American Express',
    prefixes: ['34', '37'],
    lengths: [15],
    securityCode: { name: 'CID', length: 4 },
    grouping: [4, 6, 5],
  },
  {
    key: 'discover',
    name: 'Discover',
    prefixes: ['6011', '65'],
    ranges: [{ start: 622126, end: 622925, digits: 6 }, { start: 644, end: 649, digits: 3 }],
    lengths: [16, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'jcb',
    name: 'JCB',
    prefixes: ['35'],
    lengths: [16, 17, 18, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'diners',
    name: 'Diners Club',
    prefixes: ['300', '301', '302', '303', '304', '305', '36', '38', '39'],
    lengths: [14],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 6, 4],
  },
  {
    key: 'mir',
    name: 'Mir',
    ranges: [{ start: 2200, end: 2204, digits: 4 }],
    lengths: [16, 17, 18, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'rupay',
    name: 'RuPay',
    prefixes: ['60', '65', '81', '82', '508'],
    lengths: [16],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'unionpay',
    name: 'UnionPay',
    prefixes: ['62'],
    lengths: [16, 17, 18, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
  {
    key: 'maestro',
    name: 'Maestro',
    prefixes: ['50'],
    ranges: [{ start: 56, end: 69, digits: 2 }],
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    securityCode: { name: 'CVV', length: 3 },
    grouping: [4, 4, 4, 4],
  },
];

/* Strip spaces and hyphens, the only separators a typed card number
   ever carries. Anything else stays and is caught as illegal. */
export function cleanCardNumber(raw) {
  return String(raw ?? '').replace(/[\s-]/g, '');
}

function matchesPrefix(cleaned, network) {
  if (network.prefixes && network.prefixes.some((p) => cleaned.startsWith(p))) return true;
  if (network.ranges) {
    for (const r of network.ranges) {
      if (cleaned.length < r.digits) continue;
      const n = Number(cleaned.slice(0, r.digits));
      if (n >= r.start && n <= r.end) return true;
    }
  }
  return false;
}

/* Detect the network from the leading digits. Returns the network
   object, or null when no known prefix matches. Detection never
   depends on length: a 14-digit Visa-shaped number is still Visa,
   just the wrong length for Visa. */
export function detectNetwork(cleaned) {
  const digits = cleanCardNumber(cleaned);
  if (!digits) return null;
  for (const network of NETWORKS) {
    if (matchesPrefix(digits, network)) return network;
  }
  return null;
}

/* The Luhn working, step by step, from the rightmost digit: every
   second digit is doubled, and a doubled value over 9 has its digits
   added (equivalently, subtract 9). Returns { steps, sum, valid } where
   each step is { positionFromRight, digit, doubled, contribution }.
   A number passes when the weighted sum is a multiple of 10. */
export function luhnSteps(cleaned) {
  const digits = cleanCardNumber(cleaned);
  const steps = [];
  let sum = 0;
  for (let i = digits.length - 1, pos = 1; i >= 0; i -= 1, pos += 1) {
    const digit = Number(digits[i]);
    const doubled = pos % 2 === 0;
    let contribution = doubled ? digit * 2 : digit;
    if (contribution > 9) contribution -= 9;
    steps.push({ positionFromRight: pos, digit, doubled, contribution });
    sum += contribution;
  }
  steps.reverse();
  return { steps, sum, valid: digits.length > 0 && sum % 10 === 0 };
}

/* The check digit that would make the given leading digits pass Luhn.
   Returns '0' to '9', or null when the input is not all digits. */
export function computeCheckDigit(leadingDigits) {
  const s = cleanCardNumber(leadingDigits);
  if (!s || /[^0-9]/.test(s)) return null;
  const probe = luhnSteps(s + '0');
  return String((10 - (probe.sum % 10)) % 10);
}

/* Format digits into display groups for a network (Amex 4-6-5, most
   others groups of 4). Unknown network: groups of 4. A partial number
   is grouped as far as it goes, so this is safe to run on every
   keystroke for auto-formatting. */
export function formatCardNumber(raw, network = null) {
  const digits = cleanCardNumber(raw).replace(/[^0-9]/g, '');
  const net = network || detectNetwork(digits);
  const grouping = net ? net.grouping : [4, 4, 4, 4];
  const groups = [];
  let rest = digits;
  for (const size of grouping) {
    if (!rest) break;
    groups.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  while (rest) {
    groups.push(rest.slice(0, 4));
    rest = rest.slice(4);
  }
  return groups.join(' ');
}

/* Validate one card number string. Returns an object with:
   raw, cleaned, digits (count), valid (bool), reason (null when valid,
   else one of 'empty', 'illegal-character', 'too-short', 'too-long',
   'unknown-network', 'wrong-length', 'luhn-fail'), network (key or
   null), networkName, expectedLengths, securityCode, bin (first 6
   digits), iin8 (first 8 digits when present), formatted, luhn
   ({ steps, sum, valid }) and expectedCheck (the digit that would make
   the number pass Luhn, for luhn-fail only). A number is valid only
   when its network is known, its length fits that network, and Luhn
   passes. */
export function validateCard(raw) {
  const cleaned = cleanCardNumber(raw);
  const base = {
    raw: String(raw ?? ''),
    cleaned,
    digits: cleaned.length,
    valid: false,
    reason: null,
    network: null,
    networkName: null,
    expectedLengths: null,
    securityCode: null,
    bin: null,
    iin8: null,
    formatted: '',
    luhn: null,
    expectedCheck: null,
  };
  if (!cleaned) return { ...base, reason: 'empty' };
  if (/[^0-9]/.test(cleaned)) return { ...base, reason: 'illegal-character' };
  if (cleaned.length < 12) return { ...base, reason: 'too-short' };
  if (cleaned.length > 19) return { ...base, reason: 'too-long' };
  const network = detectNetwork(cleaned);
  const luhn = luhnSteps(cleaned);
  const filled = {
    ...base,
    bin: cleaned.slice(0, 6),
    iin8: cleaned.length >= 8 ? cleaned.slice(0, 8) : null,
    formatted: formatCardNumber(cleaned, network),
    luhn,
  };
  if (!network) {
    return { ...filled, reason: 'unknown-network', expectedCheck: luhn.valid ? null : computeCheckDigit(cleaned.slice(0, -1)) };
  }
  const netFilled = {
    ...filled,
    network: network.key,
    networkName: network.name,
    expectedLengths: network.lengths,
    securityCode: network.securityCode,
  };
  if (!network.lengths.includes(cleaned.length)) {
    return { ...netFilled, reason: 'wrong-length' };
  }
  if (!luhn.valid) {
    return { ...netFilled, reason: 'luhn-fail', expectedCheck: computeCheckDigit(cleaned.slice(0, -1)) };
  }
  return { ...netFilled, valid: true };
}

/* Validate a bulk paste: one card number per line, up to 100 lines.
   Returns { results, total, valid, invalid }. */
export function validateBulk(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 100);
  const results = lines.map((line) => ({ line, ...validateCard(line) }));
  return {
    results,
    total: results.length,
    valid: results.filter((r) => r.valid).length,
    invalid: results.filter((r) => !r.valid).length,
  };
}
