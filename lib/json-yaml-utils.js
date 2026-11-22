/* Pure JSON to YAML helpers (no DOM, so they run in both browser and node).
   Built on js-yaml: JSON is parsed with JSON.parse (exact error positions
   from V8), then dumped to readable block-style or flow-style YAML.
   js-yaml follows the YAML 1.2 core schema, so bare yes/no/on/off stay
   plain strings, and strings that YAML would misread ("123", "a: b",
   "yes") are quoted automatically so values survive a round trip. */

import yaml from 'js-yaml';

export const SAMPLE_JSON =
  '{\n' +
  '  "name": "my-app",\n' +
  '  "version": "1.4.2",\n' +
  '  "enabled": true,\n' +
  '  "features": ["auth", "billing", "search"],\n' +
  '  "limits": {\n' +
  '    "requests": 1000,\n' +
  '    "burst": 50\n' +
  '  },\n' +
  '  "owner": {\n' +
  '    "name": "Ada",\n' +
  '    "role": "admin",\n' +
  '    "active": true\n' +
  '  },\n' +
  '  "note": "yes"\n' +
  '}';

function lineCol(src, offset) {
  let line = 1;
  let lastNl = -1;
  for (let i = 0; i < offset && i < src.length; i += 1) {
    if (src[i] === '\n') {
      line += 1;
      lastNl = i;
    }
  }
  return { line, column: offset - lastNl };
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((n, v) => n + countKeys(v), 0);
  if (value && typeof value === 'object') {
    return Object.keys(value).length + Object.values(value).reduce((n, v) => n + countKeys(v), 0);
  }
  return 0;
}

/* Count the keys in a parsed JSON value. Returns null when the input does
   not parse. */
export function countJson(input) {
  const src = String(input ?? '').replace(/^\uFEFF/, '');
  if (!src.trim()) return null;
  let value;
  try {
    value = JSON.parse(src);
  } catch {
    return null;
  }
  return {
    keys: countKeys(value),
    lines: src.split('\n').length,
    chars: src.length,
  };
}

/* Convert JSON to YAML. Options: indent (2 or 4), sortKeys (alphabetical,
   recursive), flow (true for flow style {a: 1}, false for block style).
   Returns { ok, output, value, error }. JSON parse errors report the
   position V8 gives, converted to line/column. */
export function jsonToYaml(input, options = {}) {
  const { indent = 2, sortKeys = false, flow = false } = options;
  const src = String(input ?? '').replace(/^\uFEFF/, '');
  if (!src.trim()) {
    return { ok: false, output: '', value: null, error: { code: 'empty', message: 'No JSON found. Paste a JSON document first.', line: 1, column: 1 } };
  }
  let value;
  try {
    value = JSON.parse(src);
  } catch (e) {
    const m = /position (\d+)/.exec(e.message || '');
    const pos = m ? Number(m[1]) : 0;
    const { line, column } = lineCol(src, pos);
    return { ok: false, output: '', value: null, error: { code: 'json-parse', message: String(e.message || 'Could not parse JSON.').split('\n')[0], line, column } };
  }
  let output;
  try {
    output = yaml.dump(value, {
      indent: indent === 4 ? 4 : 2,
      lineWidth: -1,
      sortKeys: sortKeys === true,
      flowLevel: flow ? 0 : -1,
    });
  } catch (e) {
    return { ok: false, output: '', value: null, error: { code: 'yaml-dump', message: e.message, line: 1, column: 1 } };
  }
  return { ok: true, output: String(output).replace(/\n$/, ''), value, error: null };
}

/* Convert YAML text back to a JSON string (used by the Swap button, so a
   user can round-trip the output and check it). Returns null when the YAML
   does not parse. */
export function yamlToJsonString(input, indent = 2) {
  let value;
  try {
    value = yaml.load(String(input ?? ''));
  } catch {
    return null;
  }
  if (value === undefined) return null;
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return null;
  }
}
