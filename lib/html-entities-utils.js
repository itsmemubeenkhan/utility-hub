/* Pure HTML entity helpers (no DOM, so they run in both browser and node).
   Encode levels: minimal (only & < > " '), named (minimal + named entities
   for common non-ASCII chars), numeric (minimal + decimal for all
   non-ASCII), all (named where one exists, else decimal, for all non-ASCII).
   Decode handles named, decimal and hex entities, mixed content, and
   reports unknown or invalid entities as warnings instead of throwing. */

export const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', iexcl: '¡', cent: '¢', pound: '£', curren: '¤', yen: '¥',
  brvbar: '¦', sect: '§', uml: '¨', copy: '©', ordf: 'ª', laquo: '«',
  not: '¬', shy: '­', reg: '®', macr: '¯', deg: '°', plusmn: '±',
  sup2: '²', sup3: '³', acute: '´', micro: 'µ', para: '¶', middot: '·',
  cedil: '¸', sup1: '¹', ordm: 'º', raquo: '»', frac14: '¼', frac12: '½',
  frac34: '¾', iquest: '¿', Agrave: 'À', Aacute: 'Á', Acirc: 'Â',
  Atilde: 'Ã', Auml: 'Ä', Aring: 'Å', AElig: 'Æ', Ccedil: 'Ç',
  Egrave: 'È', Eacute: 'É', Ecirc: 'Ê', Euml: 'Ë', Igrave: 'Ì',
  Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï', ETH: 'Ð', Ntilde: 'Ñ',
  Ograve: 'Ò', Oacute: 'Ó', Ocirc: 'Ô', Otilde: 'Õ', Ouml: 'Ö',
  times: '×', Oslash: 'Ø', Ugrave: 'Ù', Uacute: 'Ú', Ucirc: 'Û',
  Uuml: 'Ü', Yacute: 'Ý', THORN: 'Þ', szlig: 'ß', agrave: 'à',
  aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å',
  aelig: 'æ', ccedil: 'ç', egrave: 'è', eacute: 'é', ecirc: 'ê',
  euml: 'ë', igrave: 'ì', iacute: 'í', icirc: 'î', iuml: 'ï',
  eth: 'ð', ntilde: 'ñ', ograve: 'ò', oacute: 'ó', ocirc: 'ô',
  otilde: 'õ', ouml: 'ö', divide: '÷', oslash: 'ø', ugrave: 'ù',
  uacute: 'ú', ucirc: 'û', uuml: 'ü', yacute: 'ý', thorn: 'þ',
  yuml: 'ÿ', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '‌',
  zwj: '‍', lrm: '‎', rlm: '‏', ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', sbquo: '‚', ldquo: '“', rdquo: '”',
  bdquo: '„', dagger: '†', Dagger: '‡', permil: '‰', lsaquo: '‹',
  rsaquo: '›', euro: '€', bull: '•', hellip: '…', prime: '′',
  Prime: '″', oline: '‾', frasl: '⁄', weierp: '℘', image: 'ℑ',
  real: 'ℜ', trade: '™', alefsym: 'ℵ', larr: '←', uarr: '↑',
  rarr: '→', darr: '↓', harr: '↔', crarr: '↵', lArr: '⇐',
  uArr: '⇑', rArr: '⇒', dArr: '⇓', hArr: '⇔', forall: '∀',
  part: '∂', exist: '∃', empty: '∅', nabla: '∇', isin: '∈',
  notin: '∉', ni: '∋', prod: '∏', sum: '∑', minus: '−',
  lowast: '∗', radic: '√', prop: '∝', infin: '∞', ang: '∠',
  and: '∧', or: '∨', cap: '∩', cup: '∪', int: '∫', there4: '∴',
  sim: '∼', cong: '≅', asymp: '≈', ne: '≠', equiv: '≡',
  le: '≤', ge: '≥', sub: '⊂', sup: '⊃', nsub: '⊄', sube: '⊆',
  supe: '⊇', oplus: '⊕', otimes: '⊗', perp: '⊥', sdot: '⋅',
  lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋', lang: '〈',
  rang: '〉', loz: '◊', spades: '♠', clubs: '♣', hearts: '♥',
  diams: '♦', star: '★', Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ',
  Epsilon: 'Ε', Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι',
  Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ',
  Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ',
  Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
  pi: 'π', rho: 'ρ', sigmaf: 'ς', sigma: 'σ', tau: 'τ',
  upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  thetasym: 'ϑ', upsih: 'ϒ', piv: 'ϖ',
};

const CHAR_TO_ENTITY = {};
for (const [name, ch] of Object.entries(NAMED_ENTITIES)) {
  if (!(ch in CHAR_TO_ENTITY)) CHAR_TO_ENTITY[ch] = name;
}

const MINIMAL = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

export const ENCODE_LEVELS = ['minimal', 'named', 'numeric', 'all'];

/* Encode text to HTML entities. Level controls how far encoding goes;
   the five minimal characters are always encoded. */
export function encodeHtml(text, level = 'named') {
  const s = String(text ?? '');
  let out = '';
  for (const ch of s) {
    if (MINIMAL[ch]) {
      out += MINIMAL[ch];
      continue;
    }
    const cp = ch.codePointAt(0);
    const isAscii = cp < 128;
    if (level === 'minimal' || isAscii) {
      out += ch;
      continue;
    }
    if (level === 'named' || level === 'all') {
      const name = CHAR_TO_ENTITY[ch];
      if (name) {
        out += '&' + name + ';';
        continue;
      }
    }
    if (level === 'numeric' || level === 'all') {
      out += '&#' + cp + ';';
      continue;
    }
    out += ch;
  }
  return out;
}

/* Decode HTML entities. Returns { text, warnings } where warnings lists
   unknown named entities and invalid numeric references found, each with
   its 1-based position. Unknown or invalid references are left as-is. */
export function decodeHtml(text) {
  const s = String(text ?? '');
  const warnings = [];
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] !== '&') {
      out += s[i];
      i += 1;
      continue;
    }
    const semi = s.indexOf(';', i + 1);
    const nextAmp = s.indexOf('&', i + 1);
    if (semi === -1 || (nextAmp !== -1 && nextAmp < semi) || semi - i > 32) {
      out += s[i];
      i += 1;
      continue;
    }
    const body = s.slice(i + 1, semi);
    if (body.startsWith('#')) {
      let cp = null;
      let valid = false;
      if (/^#x[0-9a-fA-F]+$/.test(body)) {
        cp = parseInt(body.slice(2), 16);
        valid = true;
      } else if (/^#[0-9]+$/.test(body)) {
        cp = parseInt(body.slice(1), 10);
        valid = true;
      }
      if (valid && cp >= 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff)) {
        out += String.fromCodePoint(cp);
      } else {
        warnings.push({ ref: s.slice(i, semi + 1), pos: i + 1, reason: 'invalid' });
        out += s.slice(i, semi + 1);
      }
      i = semi + 1;
      continue;
    }
    if (body && /^[A-Za-z][A-Za-z0-9]*$/.test(body) && body in NAMED_ENTITIES) {
      out += NAMED_ENTITIES[body];
    } else {
      warnings.push({ ref: s.slice(i, semi + 1), pos: i + 1, reason: 'unknown' });
      out += s.slice(i, semi + 1);
    }
    i = semi + 1;
  }
  return { text: out, warnings };
}

/* True when the text contains at least one well-formed entity reference. */
export function looksEncoded(text) {
  return /&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/.test(String(text ?? ''));
}

/* True when the text looks double-encoded, e.g. &amp;amp; or &amp;#65; */
export function looksDoubleEncoded(text) {
  return /&amp;(amp|lt|gt|quot|apos|#x?[0-9a-fA-F]+);/.test(String(text ?? ''));
}

/* Count well-formed entity references in the text. */
export function countEntities(text) {
  const m = String(text ?? '').match(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g);
  return m ? m.length : 0;
}

/* Most-used entities for the clickable reference table. */
export const COMMON_ENTITIES = [
  { char: '&', entity: '&amp;', name: 'ampersand' },
  { char: '<', entity: '&lt;', name: 'less than' },
  { char: '>', entity: '&gt;', name: 'greater than' },
  { char: '"', entity: '&quot;', name: 'double quote' },
  { char: "'", entity: '&apos;', name: 'apostrophe' },
  { char: ' ', entity: '&nbsp;', name: 'non-breaking space' },
  { char: '©', entity: '&copy;', name: 'copyright' },
  { char: '®', entity: '&reg;', name: 'registered' },
  { char: '™', entity: '&trade;', name: 'trademark' },
  { char: '€', entity: '&euro;', name: 'euro' },
  { char: '£', entity: '&pound;', name: 'pound' },
  { char: '¥', entity: '&yen;', name: 'yen' },
  { char: '¢', entity: '&cent;', name: 'cent' },
  { char: '°', entity: '&deg;', name: 'degree' },
  { char: '±', entity: '&plusmn;', name: 'plus minus' },
  { char: '×', entity: '&times;', name: 'multiplication' },
  { char: '÷', entity: '&divide;', name: 'division' },
  { char: '–', entity: '&ndash;', name: 'en dash' },
  { char: '—', entity: '&mdash;', name: 'em dash' },
  { char: '‘', entity: '&lsquo;', name: 'left single quote' },
  { char: '’', entity: '&rsquo;', name: 'right single quote' },
  { char: '“', entity: '&ldquo;', name: 'left double quote' },
  { char: '”', entity: '&rdquo;', name: 'right double quote' },
  { char: '…', entity: '&hellip;', name: 'ellipsis' },
  { char: '•', entity: '&bull;', name: 'bullet' },
  { char: '§', entity: '&sect;', name: 'section' },
  { char: '¶', entity: '&para;', name: 'paragraph' },
  { char: '†', entity: '&dagger;', name: 'dagger' },
  { char: '‡', entity: '&Dagger;', name: 'double dagger' },
  { char: '«', entity: '&laquo;', name: 'left guillemet' },
  { char: '»', entity: '&raquo;', name: 'right guillemet' },
  { char: '¡', entity: '&iexcl;', name: 'inverted exclamation' },
  { char: '¿', entity: '&iquest;', name: 'inverted question' },
  { char: '½', entity: '&frac12;', name: 'one half' },
  { char: '¼', entity: '&frac14;', name: 'one quarter' },
  { char: '¾', entity: '&frac34;', name: 'three quarters' },
  { char: '←', entity: '&larr;', name: 'left arrow' },
  { char: '→', entity: '&rarr;', name: 'right arrow' },
  { char: '↑', entity: '&uarr;', name: 'up arrow' },
  { char: '↓', entity: '&darr;', name: 'down arrow' },
  { char: '∞', entity: '&infin;', name: 'infinity' },
  { char: '≠', entity: '&ne;', name: 'not equal' },
  { char: '≤', entity: '&le;', name: 'less or equal' },
  { char: '≥', entity: '&ge;', name: 'greater or equal' },
  { char: '√', entity: '&radic;', name: 'square root' },
  { char: '∑', entity: '&sum;', name: 'summation' },
  { char: 'π', entity: '&pi;', name: 'pi' },
  { char: 'α', entity: '&alpha;', name: 'alpha' },
  { char: 'Ω', entity: '&Omega;', name: 'omega' },
  { char: '♥', entity: '&hearts;', name: 'hearts' },
  { char: '★', entity: '&star;', name: 'star' },
];
