/* Node tests for lib/yaml-utils.js.
   Run: node tests/yaml-utils-test.mjs */
import {
  parseYamlDocuments, yamlToJson, jsonToYaml, countYaml,
  SAMPLE_YAML_K8S, SAMPLE_YAML_COMPOSE, SAMPLE_JSON,
} from '../lib/yaml-utils.js';

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass += 1; } else {
    fail += 1;
    console.log('FAIL: ' + name + '\n  expected: ' + JSON.stringify(expected) + '\n  actual:   ' + JSON.stringify(actual));
  }
}

// Round-trip: Kubernetes sample YAML -> JSON -> YAML keeps the data.
const k8s = yamlToJson(SAMPLE_YAML_K8S, 2);
check('k8s converts ok', k8s.ok, true);
check('k8s kind', k8s.value.kind, 'Deployment');
check('k8s replicas', k8s.value.spec.replicas, 3);
check('k8s image', k8s.value.spec.template.spec.containers[0].image, 'nginx:1.27');
check('k8s 2-space indent', k8s.output.includes('\n  "apiVersion"'), true);
const k8sBack = jsonToYaml(k8s.output);
check('k8s round-trip ok', k8sBack.ok, true);
check('k8s round-trip kind', yamlToJson(k8sBack.output, 2).value.kind, 'Deployment');

// Compose sample parses and round-trips.
const compose = yamlToJson(SAMPLE_YAML_COMPOSE, 2);
check('compose converts ok', compose.ok, true);
check('compose db image', compose.value.services.db.image, 'postgres:16');
check('compose volume', compose.value.volumes['db-data'], null);

// Multi-document YAML becomes a JSON array.
const multi = yamlToJson('a: 1\n---\nb: 2\n---\n- x\n- y\n', 2);
check('multi-doc ok', multi.ok, true);
check('multi-doc value', multi.value, [{ a: 1 }, { b: 2 }, ['x', 'y']]);
check('multi-doc count', countYaml('a: 1\n---\nb: 2\n').documents, 2);

// Indent options: 4-space and minified.
check('4-space indent', yamlToJson('a:\n  b: 1', 4).output, '{\n    "a": {\n        "b": 1\n    }\n}');
check('minified', yamlToJson('a: 1\nb: 2', 0).output, '{"a":1,"b":2}');

// Invalid YAML throws with line info (1-based).
const bad = yamlToJson('a: 1\n b: 2');
check('invalid yaml fails', bad.ok, false);
check('invalid yaml code', bad.error.code, 'yaml-parse');
check('invalid yaml line', bad.error.line, 2);
check('invalid yaml column is number', typeof bad.error.column, 'number');

// Unclosed flow collection reports a line.
const badFlow = yamlToJson('a: [unclosed');
check('unclosed flow fails', badFlow.ok, false);
check('unclosed flow line', badFlow.error.line, 2);

// JSON -> YAML uses readable block style, not flow style.
const j2y = jsonToYaml(SAMPLE_JSON);
check('json->yaml ok', j2y.ok, true);
check('json->yaml block style', j2y.output.includes('apiVersion: apps/v1'), true);
check('json->yaml no flow braces', j2y.output.includes('{'), false);
check('json->yaml nested indent', j2y.output.includes('  name: web'), true);

// Invalid JSON reports a position.
const badJson = jsonToYaml('{"a": 1,}');
check('invalid json fails', badJson.ok, false);
check('invalid json code', badJson.error.code, 'json-parse');
check('invalid json line', badJson.error.line, 1);

// Anchors and aliases expand to plain values.
const anchored = yamlToJson('defaults: &d\n  retries: 3\njob:\n  <<: *d\n  name: build\n', 2);
check('anchor ok', anchored.ok, true);
check('anchor expands', anchored.value.job.retries, 3);
check('anchor keeps sibling', anchored.value.job.name, 'build');

// YAML 1.2 core typing: bare yes/no/on/off stay strings (not booleans).
const typing = yamlToJson('a: yes\nb: on\nc: true\nd: 42');
check('typing yes is string', typing.value.a, 'yes');
check('typing on is string', typing.value.b, 'on');
check('typing true is boolean', typing.value.c, true);
check('typing number is number', typing.value.d, 42);

// Empty input handling.
check('empty yaml fails', yamlToJson('').ok, false);
check('empty yaml code', yamlToJson('').error.code, 'empty');
check('comment-only fails', yamlToJson('# just a comment\n').ok, false);
check('empty json fails', jsonToYaml('   ').ok, false);
check('count null on invalid', countYaml('a: [unclosed'), null);
check('count keys', countYaml(SAMPLE_YAML_K8S).keys, 21);
check('count lines', countYaml('a: 1\nb: 2').lines, 2);

// parseYamlDocuments exposes the document list.
check('parse docs', parseYamlDocuments('x: 1\n---\ny: 2').docs, [{ x: 1 }, { y: 2 }]);

console.log('yaml-utils: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
