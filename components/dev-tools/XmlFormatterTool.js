'use client';
/* XML Formatter & Validator: pretty-print, minify, validate well-formedness
   with exact line/column errors, and convert XML to JSON. DOCTYPE is
   refused outright (XXE safety). Everything runs in the browser; nothing
   is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  formatXml, minifyXml, xmlToJson, countXml,
  tokenizeXml, SAMPLE_XML,
} from '@/lib/xml-utils';

const ERROR_STR = {
  en: {
    doctype: 'DOCTYPE declarations are not allowed, because they can define external entities (XXE). Remove the DOCTYPE and try again.',
    'mismatched-close': 'Closing tag does not match its opening tag.',
    'unclosed-tag': 'Element opened here is never closed.',
    'unclosed-comment': 'Comment is never closed with -->',
    'unclosed-cdata': 'CDATA section is never closed with ]]>',
    'unclosed-pi': 'Processing instruction is never closed with ?>',
    'invalid-entity': 'Invalid entity reference. A bare & must be written as &amp;, or use a named or numeric reference like &#169;',
    'invalid-char': 'Invalid character in this position.',
    'multiple-roots': 'Content after the root element is not allowed. An XML document has exactly one root element.',
    'no-root': 'No root element found. An XML document needs exactly one root element.',
    'invalid-name': 'Invalid element or attribute name.',
    'duplicate-attr': 'The same attribute appears twice on one element.',
    'missing-quote': 'Attribute value needs single or double quotes.',
    'missing-eq': 'Attribute needs an = sign and a quoted value.',
    'unclosed-attr': 'Attribute value is never closed with a matching quote.',
    'unexpected-eof': 'Document ends inside a tag.',
    'invalid-markup': 'Invalid markup at this position.',
    'cdata-end': 'The sequence ]]> is not allowed in character content.',
    'decl-not-first': 'An <?xml ...?> declaration is only allowed at the very start of the document.',
    'invalid-comment': 'Comments must not contain -- inside them.',
    'invalid-pi': 'Processing instruction has an invalid target name.',
  },
  es: {
    doctype: 'Las declaraciones DOCTYPE no están permitidas, porque pueden definir entidades externas (XXE). Quita el DOCTYPE e inténtalo de nuevo.',
    'mismatched-close': 'La etiqueta de cierre no coincide con su etiqueta de apertura.',
    'unclosed-tag': 'El elemento abierto aquí nunca se cierra.',
    'unclosed-comment': 'El comentario nunca se cierra con -->',
    'unclosed-cdata': 'La sección CDATA nunca se cierra con ]]>',
    'unclosed-pi': 'La instrucción de procesamiento nunca se cierra con ?>',
    'invalid-entity': 'Referencia de entidad inválida. Un & solo debe escribirse como &amp;, o usa una referencia con nombre o numérica como &#169;',
    'invalid-char': 'Carácter inválido en esta posición.',
    'multiple-roots': 'No se permite contenido después del elemento raíz. Un documento XML tiene exactamente un elemento raíz.',
    'no-root': 'No se encontró un elemento raíz. Un documento XML necesita exactamente un elemento raíz.',
    'invalid-name': 'Nombre de elemento o atributo inválido.',
    'duplicate-attr': 'El mismo atributo aparece dos veces en un elemento.',
    'missing-quote': 'El valor del atributo necesita comillas simples o dobles.',
    'missing-eq': 'El atributo necesita un signo = y un valor entre comillas.',
    'unclosed-attr': 'El valor del atributo nunca se cierra con la comilla correspondiente.',
    'unexpected-eof': 'El documento termina dentro de una etiqueta.',
    'invalid-markup': 'Marcado inválido en esta posición.',
    'cdata-end': 'La secuencia ]]> no está permitida en el contenido de texto.',
    'decl-not-first': 'Una declaración <?xml ...?> solo está permitida al principio del documento.',
    'invalid-comment': 'Los comentarios no deben contener -- dentro de ellos.',
    'invalid-pi': 'La instrucción de procesamiento tiene un nombre de destino inválido.',
  },
};

const STR = {
  en: {
    modeFormat: 'Format',
    modeMinify: 'Minify',
    modeValidate: 'Validate',
    modeJson: 'XML to JSON',
    indentLabel: 'Indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    inputLabel: 'XML input',
    inputPlaceholder: 'Paste your XML here, e.g. <note><to>Ana</to><body>Hello</body></note>...',
    outputLabel: 'Output',
    sample: 'Sample XML',
    upload: 'Upload .xml file',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    downloadXml: 'Download .xml',
    downloadJson: 'Download .json',
    empty: 'Your result will appear here.',
    valid: 'Valid XML. Well-formed and ready to use.',
    invalid: 'Invalid XML',
    line: 'Line',
    column: 'column',
    chars: 'characters',
    elements: 'elements',
    attributes: 'attributes',
    maxDepth: 'max depth',
    lines: 'lines',
    outChars: 'output characters',
    doctypeNote: 'XXE safety: DOCTYPE declarations are refused. They are the only place external entities can be defined, so a file that tries to load local files or remote URLs through entities is rejected before parsing.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/jwt-decoder', label: 'JWT Decoder' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
    ],
    privacy:
      'Privacy: formatting, validation and conversion run locally in your browser. Your XML is never uploaded, stored or seen by anyone else.',
  },
  es: {
    modeFormat: 'Formatear',
    modeMinify: 'Minificar',
    modeValidate: 'Validar',
    modeJson: 'XML a JSON',
    indentLabel: 'Sangría',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentTab: 'Tabulación',
    inputLabel: 'Entrada XML',
    inputPlaceholder: 'Pega tu XML aquí, p. ej. <note><to>Ana</to><body>Hola</body></note>...',
    outputLabel: 'Salida',
    sample: 'XML de ejemplo',
    upload: 'Subir archivo .xml',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    downloadXml: 'Descargar .xml',
    downloadJson: 'Descargar .json',
    empty: 'Tu resultado aparecerá aquí.',
    valid: 'XML válido. Bien formado y listo para usar.',
    invalid: 'XML inválido',
    line: 'Línea',
    column: 'columna',
    chars: 'caracteres',
    elements: 'elementos',
    attributes: 'atributos',
    maxDepth: 'profundidad máx.',
    lines: 'líneas',
    outChars: 'caracteres de salida',
    doctypeNote: 'Seguridad XXE: las declaraciones DOCTYPE se rechazan. Son el único lugar donde se pueden definir entidades externas, así que un archivo que intente cargar archivos locales o URLs remotas mediante entidades se rechaza antes del análisis.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/decodificador-jwt', label: 'Decodificador JWT' },
      { href: '/es/tools/codificador-base64', label: 'Codificador y Decodificador Base64' },
    ],
    privacy:
      'Privacidad: el formato, la validación y la conversión corren localmente en tu navegador. Tu XML nunca se sube, se guarda ni lo ve nadie más.',
  },
};

const TOKEN_COLORS = {
  decl: '#7c3aed',
  pi: '#7c3aed',
  tag: '#1d4ed8',
  attr: '#b45309',
  value: '#047857',
  text: '#111827',
  comment: '#6b7280',
  cdata: '#0e7490',
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
const areaStyle = {
  width: '100%',
  minHeight: 160,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const preStyle = {
  ...areaStyle,
  minHeight: 160,
  marginTop: 6,
  background: '#f9fafb',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

export default function XmlFormatterTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const errStr = ERROR_STR[lang] || ERROR_STR.en;
  const [mode, setMode] = useState('format');
  const [indent, setIndent] = useState('  ');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null, stats: null, isJson: false };
    if (mode === 'json') {
      const r = xmlToJson(input);
      if (!r.ok) return { output: '', error: r.error, stats: null, isJson: true };
      return { output: JSON.stringify(r.value, null, 2), error: null, stats: countXml(input), isJson: true };
    }
    if (mode === 'minify') {
      const r = minifyXml(input);
      if (!r.ok) return { output: '', error: r.error, stats: null, isJson: false };
      return { output: r.output, error: null, stats: countXml(input), isJson: false };
    }
    const r = formatXml(input, indent);
    if (!r.ok) return { output: '', error: r.error, stats: null, isJson: false };
    return { output: r.output, error: null, stats: countXml(input), isJson: false };
  }, [input, mode, indent]);

  const tokens = useMemo(
    () => (result.output && !result.isJson ? tokenizeXml(result.output) : []),
    [result.output, result.isJson],
  );

  const copy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!result.output) return;
    const ext = result.isJson ? 'json' : 'xml';
    const blob = new Blob([result.output], { type: result.isJson ? 'application/json' : 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xml-output.' + ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(file);
    e.target.value = '';
  };

  const errorText = result.error
    ? (errStr[result.error.code] || result.error.message) +
      ' (' + t.line + ' ' + result.error.line + ', ' + t.column + ' ' + result.error.column + ')'
    : null;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('format')} style={mode === 'format' ? primaryBtnStyle : btnStyle}>{t.modeFormat}</button>
        <button type="button" onClick={() => setMode('minify')} style={mode === 'minify' ? primaryBtnStyle : btnStyle}>{t.modeMinify}</button>
        <button type="button" onClick={() => setMode('validate')} style={mode === 'validate' ? primaryBtnStyle : btnStyle}>{t.modeValidate}</button>
        <button type="button" onClick={() => setMode('json')} style={mode === 'json' ? primaryBtnStyle : btnStyle}>{t.modeJson}</button>
        <button type="button" onClick={() => setInput(SAMPLE_XML)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".xml,text/xml" onChange={onFile} style={{ display: 'none' }} />
      </div>

      {mode === 'format' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.indentLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setIndent('  ')} style={indent === '  ' ? primaryBtnStyle : btnStyle}>{t.indent2}</button>
            <button type="button" onClick={() => setIndent('    ')} style={indent === '    ' ? primaryBtnStyle : btnStyle}>{t.indent4}</button>
            <button type="button" onClick={() => setIndent('\t')} style={indent === '\t' ? primaryBtnStyle : btnStyle}>{t.indentTab}</button>
          </div>
        </div>
      )}

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {result.error ? (
          <div style={{ marginTop: 6, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px', color: '#7f1d1d' }}>{t.invalid}</p>
            <p style={{ fontSize: '0.9rem', margin: 0, color: '#7f1d1d' }}>{errorText}</p>
          </div>
        ) : result.output ? (
          <>
            {mode === 'validate' && (
              <p style={{ color: '#047857', fontWeight: 700, fontSize: '0.9rem', margin: '6px 0 0' }}>✓ {t.valid}</p>
            )}
            <pre style={preStyle}>
              {result.isJson
                ? result.output
                : tokens.map((tok, i) => (
                    <span key={i} style={{ color: TOKEN_COLORS[tok.type] || '#111827' }}>{tok.text}</span>
                  ))}
            </pre>
          </>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {result.stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {input.length} · {t.elements}: {result.stats.elements} · {t.attributes}: {result.stats.attributes} · {t.maxDepth}: {result.stats.maxDepth}
            {result.output ? ' · ' + t.outChars + ': ' + result.output.length : ''}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.output} style={btnStyle}>{result.isJson ? t.downloadJson : t.downloadXml}</button>
        </div>
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>🛡️ {t.doctypeNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>🔒 {t.privacy}</p>

      <div style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.seeAlso}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {t.siblings.map((s) => (
            <Link key={s.href} href={s.href} style={{ ...btnStyle, textDecoration: 'none', color: '#1d4ed8' }}>{s.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
