/* Pure URL encoding helpers (no DOM, so node can test them).
   Percent-encoding replaces characters that are unsafe in a URL, or that
   have a structural job there, with %HH sequences: space becomes %20,
   & becomes %26, ? becomes %3F, and non-ASCII text is encoded as UTF-8
   bytes first (café -> caf%C3%A9). Everything uses the browser's own
   encodeURI / encodeURIComponent, so behavior matches the platform. */

export function encodeComponent(text, { spacePlus = false } = {}) {
  let out = encodeURIComponent(String(text));
  if (spacePlus) out = out.replace(/%20/g, '+');
  return out;
}

export function encodeWhole(text, { spacePlus = false } = {}) {
  let out = encodeURI(String(text));
  if (spacePlus) out = out.replace(/%20/g, '+');
  return out;
}

/* plusAsSpace matches HTML form encoding (application/x-www-form-urlencoded),
   where a literal + in a query string means a space. A real plus sign must
   arrive as %2B to survive. */
export function decodeComponent(text, { plusAsSpace = false } = {}) {
  const s = plusAsSpace ? String(text).replace(/\+/g, ' ') : String(text);
  return decodeURIComponent(s);
}

export function decodeWhole(text, { plusAsSpace = false } = {}) {
  const s = plusAsSpace ? String(text).replace(/\+/g, ' ') : String(text);
  return decodeURI(s);
}

/* True when decoding once still leaves %HH sequences behind, which means
   the string was encoded twice (the usual cause is an encoder run over an
   already-encoded value). Decoding again resolves it; the double encoding
   itself is the bug worth fixing upstream. */
export function isDoubleEncoded(text) {
  try {
    const once = decodeURIComponent(String(text));
    return once !== String(text) && /%[0-9A-Fa-f]{2}/.test(once);
  } catch {
    return false;
  }
}

/* Accepts a full URL or a bare query string; returns decoded key/value rows
   in order, duplicates kept (URLSearchParams semantics). */
export function parseQuery(input) {
  const s = String(input || '');
  let query = s;
  const q = s.indexOf('?');
  if (q >= 0) query = s.slice(q + 1);
  const hash = query.indexOf('#');
  if (hash >= 0) query = query.slice(0, hash);
  const params = new URLSearchParams(query);
  const rows = [];
  params.forEach((value, key) => rows.push({ key, value }));
  return rows;
}

export function buildQuery(rows) {
  const params = new URLSearchParams();
  for (const row of rows || []) {
    if (row && String(row.key).length > 0) params.append(row.key, row.value || '');
  }
  return params.toString();
}

/* Splits an absolute URL into its parts with the browser's own parser.
   Throws on relative or malformed input, so callers can show a clean error. */
export function splitUrl(text) {
  const u = new URL(String(text).trim());
  return {
    protocol: u.protocol,
    host: u.host,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    params: parseQuery(u.search),
  };
}
