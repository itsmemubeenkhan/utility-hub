/* Pure YAML <-> JSON helpers (no DOM, so they run in both browser and node).
   Built on js-yaml: YAML parsing, multi-document files (--- separated),
   anchors/aliases, and readable block-style YAML output. js-yaml follows
   the YAML 1.2 core schema, so bare yes/no/on/off stay plain strings. */

import yaml from 'js-yaml';

export const SAMPLE_YAML_K8S =
  'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\n  labels:\n    app: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: nginx:1.27\n          ports:\n            - containerPort: 80';

export const SAMPLE_YAML_COMPOSE =
  'services:\n  web:\n    image: nginx:1.27\n    ports:\n      - "80:80"\n    environment:\n      - NGINX_HOST=example.com\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - db-data:/var/lib/postgresql/data\nvolumes:\n  db-data:';

export const SAMPLE_JSON =
  '{\n  "apiVersion": "apps/v1",\n  "kind": "Deployment",\n  "metadata": {\n    "name": "web",\n    "labels": {\n      "app": "web"\n    }\n  },\n  "spec": {\n    "replicas": 3\n  }\n}';

/* Normalize a js-yaml parse error to { code, message, line, column }.
   js-yaml marks are 0-based, so line and column are shifted to 1-based. */
function normYamlError(e) {
  if (e && e.mark && typeof e.mark.line === 'number') {
    return {
      code: 'yaml-parse',
      message: e.reason || String(e.message || 'Could not parse YAML.').split('\n')[0],
      line: e.mark.line + 1,
      column: e.mark.column + 1,
    };
  }
  return {
    code: 'yaml-parse',
    message: (e && e.message ? String(e.message).split('\n')[0] : 'Could not parse YAML.'),
    line: 1,
    column: 1,
  };
}

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

/* Parse YAML into its documents. Returns { ok, docs, error }.
   A document that is empty or only comments parses to undefined and is
   treated as no document at all. */
export function parseYamlDocuments(input) {
  const src = String(input ?? '').replace(/^\uFEFF/, '');
  if (!src.trim()) {
    return { ok: false, docs: null, error: { code: 'empty', message: 'No YAML found. Paste a YAML document first.', line: 1, column: 1 } };
  }
  let docs;
  try {
    docs = yaml.loadAll(src);
  } catch (e) {
    return { ok: false, docs: null, error: normYamlError(e) };
  }
  // js-yaml returns [null] for a comment-only file, so emptiness is judged
  // on the source itself: strip comments, blank lines and document markers.
  const hasContent = src
    .split('\n')
    .map((l) => l.replace(/#.*$/, '').trim())
    .some((l) => l && l !== '---' && l !== '...');
  const real = (docs || []).filter((d) => d !== undefined);
  if (!hasContent || real.length === 0) {
    return { ok: false, docs: null, error: { code: 'empty', message: 'No YAML found. Paste a YAML document first.', line: 1, column: 1 } };
  }
  return { ok: true, docs: real, error: null };
}

/* Convert YAML to JSON. indent is 2, 4 or 0 (minified). A single document
   becomes a JSON object; multi-document input (--- separated) becomes a
   JSON array of the documents. Returns { ok, output, value, docs, error }. */
export function yamlToJson(input, indent = 2) {
  const parsed = parseYamlDocuments(input);
  if (!parsed.ok) return { ok: false, output: '', value: null, docs: null, error: parsed.error };
  const value = parsed.docs.length === 1 ? parsed.docs[0] : parsed.docs;
  let output;
  try {
    output = JSON.stringify(value, null, indent === 0 ? 0 : indent);
  } catch (e) {
    return { ok: false, output: '', value: null, docs: null, error: { code: 'stringify', message: e.message, line: 1, column: 1 } };
  }
  return { ok: true, output, value, docs: parsed.docs, error: null };
}

/* Convert JSON to readable block-style YAML. Returns { ok, output, error }.
   JSON parse errors report the position V8 gives, converted to line/column. */
export function jsonToYaml(input) {
  const src = String(input ?? '').replace(/^\uFEFF/, '');
  if (!src.trim()) {
    return { ok: false, output: '', error: { code: 'empty', message: 'No JSON found. Paste a JSON document first.', line: 1, column: 1 } };
  }
  let value;
  try {
    value = JSON.parse(src);
  } catch (e) {
    const m = /position (\d+)/.exec(e.message || '');
    const pos = m ? Number(m[1]) : 0;
    const { line, column } = lineCol(src, pos);
    return { ok: false, output: '', error: { code: 'json-parse', message: String(e.message || 'Could not parse JSON.').split('\n')[0], line, column } };
  }
  let output;
  try {
    output = yaml.dump(value, { indent: 2, lineWidth: -1 });
  } catch (e) {
    return { ok: false, output: '', error: { code: 'yaml-dump', message: e.message, line: 1, column: 1 } };
  }
  return { ok: true, output: output.replace(/\n$/, ''), error: null };
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((n, v) => n + countKeys(v), 0);
  if (value && typeof value === 'object') {
    return Object.keys(value).length + Object.values(value).reduce((n, v) => n + countKeys(v), 0);
  }
  return 0;
}

/* Count documents, keys and lines of YAML input. Returns null when the
   input does not parse. */
export function countYaml(input) {
  const parsed = parseYamlDocuments(input);
  if (!parsed.ok) return null;
  return {
    documents: parsed.docs.length,
    keys: parsed.docs.reduce((n, d) => n + countKeys(d), 0),
    lines: String(input ?? '').split('\n').length,
  };
}
