'use client';
/* XML to JSON Converter: paste XML or upload a .xml/.txt file and get live
   JSON, with control over the mapping: attribute style (@name keys or a
   grouped @attributes object), the text key, root unwrap, type inference,
   indent, and namespace prefix handling. Well-formedness is validated with
   exact line/column errors, and DOCTYPE is refused outright (XXE safety).
   100% in your browser, nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { convertXmlToJson, SAMPLE_XML } from '@/lib/xml-json-utils';

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
    optionsTitle: 'Conversion options',
    attrStyleLabel: 'Attributes',
    attrPrefix: 'As @name keys',
    attrGrouped: 'Grouped under @attributes',
    textKeyLabel: 'Text key',
    unwrapLabel: 'Unwrap root element',
    inferLabel: 'Infer types (numbers and booleans)',
    indentLabel: 'JSON indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentMin: 'Minified',
    nsLabel: 'Namespace prefixes',
    nsKeep: 'Keep prefixes',
    nsStrip: 'Strip prefixes',
    inputLabel: 'XML input',
    inputPlaceholder: 'Paste your XML here, e.g. <catalog><book id="bk101"><title>XML Guide</title></book></catalog>...',
    outputLabel: 'JSON output',
    sample: 'Sample XML',
    upload: 'Upload .xml / .txt file',
    clear: 'Clear',
    copy: 'Copy JSON',
    copied: 'Copied!',
    download: 'Download .json',
    empty: 'Your JSON will appear here.',
    invalid: 'Invalid XML',
    line: 'Line',
    column: 'column',
    chars: 'characters',
    elements: 'elements',
    attributes: 'attributes',
    maxDepth: 'max depth',
    outChars: 'output characters',
    howTitle: 'How does XML map to JSON?',
    howNote: 'Every element becomes a JSON object or a plain string when it only holds text. Attributes become @name keys by default, or a single @attributes object when you pick the grouped style. Text content goes under the #text key, which you can rename, and when an element has both text and child elements, the text stays under that key next to the children. Repeated sibling elements become an array, so three <book> elements turn into one book array with three entries. CDATA sections become plain text, even when they contain markup-like characters. Comments and processing instructions are checked for well-formedness but never appear in the JSON, and values stay strings unless type inference is on, in which case 29.99 becomes a number and true becomes a boolean. Note that 007 stays a string, because a leading zero means the value is a code, not a number.',
    doctypeNote: 'XXE safety: DOCTYPE declarations are refused. They are the only place external entities can be defined, so a file that tries to load local files or remote URLs through entities is rejected before parsing.',
    privacy: 'Privacy: parsing and conversion run locally in your browser. Your XML is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/xml-formatter', label: 'XML Formatter' },
      { href: '/tools/json-to-xml-converter', label: 'JSON to XML Converter' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/yaml-to-json-converter', label: 'YAML to JSON Converter' },
    ],
  },
  es: {
    optionsTitle: 'Opciones de conversión',
    attrStyleLabel: 'Atributos',
    attrPrefix: 'Como claves @nombre',
    attrGrouped: 'Agrupados en @attributes',
    textKeyLabel: 'Clave de texto',
    unwrapLabel: 'Quitar el elemento raíz',
    inferLabel: 'Inferir tipos (números y booleanos)',
    indentLabel: 'Sangría JSON',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentMin: 'Minificado',
    nsLabel: 'Prefijos de espacio de nombres',
    nsKeep: 'Conservar prefijos',
    nsStrip: 'Quitar prefijos',
    inputLabel: 'Entrada XML',
    inputPlaceholder: 'Pega tu XML aquí, p. ej. <catalog><book id="bk101"><title>Guía XML</title></book></catalog>...',
    outputLabel: 'Salida JSON',
    sample: 'XML de ejemplo',
    upload: 'Subir archivo .xml / .txt',
    clear: 'Limpiar',
    copy: 'Copiar JSON',
    copied: '¡Copiado!',
    download: 'Descargar .json',
    empty: 'Tu JSON aparecerá aquí.',
    invalid: 'XML inválido',
    line: 'Línea',
    column: 'columna',
    chars: 'caracteres',
    elements: 'elementos',
    attributes: 'atributos',
    maxDepth: 'profundidad máx.',
    outChars: 'caracteres de salida',
    howTitle: '¿Cómo se convierte XML a JSON?',
    howNote: 'Cada elemento se convierte en un objeto JSON, o en una cadena simple cuando solo tiene texto. Los atributos se convierten en claves @nombre por defecto, o en un solo objeto @attributes si eliges el estilo agrupado. El contenido de texto va bajo la clave #text, que puedes renombrar, y cuando un elemento tiene texto y elementos hijos, el texto queda bajo esa clave junto a los hijos. Los elementos hermanos repetidos se convierten en un arreglo, así tres elementos <book> se vuelven un solo arreglo book con tres entradas. Las secciones CDATA se convierten en texto simple, aunque contengan caracteres que parecen marcado. Los comentarios y las instrucciones de procesamiento se revisan para verificar la buena formación, pero nunca aparecen en el JSON, y los valores quedan como cadenas salvo que actives la inferencia de tipos, en cuyo caso 29.99 se vuelve número y true se vuelve booleano. Ten en cuenta que 007 queda como cadena, porque un cero inicial indica que el valor es un código, no un número.',
    doctypeNote: 'Seguridad XXE: las declaraciones DOCTYPE se rechazan. Son el único lugar donde se pueden definir entidades externas, así que un archivo que intente cargar archivos locales o URLs remotas mediante entidades se rechaza antes del análisis.',
    privacy: 'Privacidad: el análisis y la conversión corren localmente en tu navegador. Tu XML nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-xml', label: 'Formateador XML' },
      { href: '/es/tools/convertidor-de-json-a-xml', label: 'Convertidor de JSON a XML' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-yaml-a-json', label: 'Convertidor de YAML a JSON' },
    ],
  },
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
const labelStyle = { fontSize: '0.95rem', fontWeight: 600 };
const areaStyle = {
  width: '100%',
  minHeight: 180,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const selectStyle = {
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: '0.9rem',
  background: '#fff',
};
const preStyle = {
  ...areaStyle,
  minHeight: 180,
  marginTop: 6,
  background: '#0f172a',
  color: '#e2e8f0',
  whiteSpace: 'pre',
  overflowX: 'auto',
};
const checkRowStyle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' };

export default function XmlToJsonTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const errStr = ERROR_STR[lang] || ERROR_STR.en;
  const [input, setInput] = useState('');
  const [attrStyle, setAttrStyle] = useState('prefix');
  const [textKey, setTextKey] = useState('#text');
  const [unwrapRoot, setUnwrapRoot] = useState(false);
  const [inferTypes, setInferTypes] = useState(false);
  const [namespaces, setNamespaces] = useState('keep');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { json: '', error: null, stats: null };
    const r = convertXmlToJson(input, { attrStyle, textKey, unwrapRoot, inferTypes, namespaces, indent });
    if (!r.ok) return { json: '', error: r.error, stats: null };
    return { json: r.json, error: null, stats: r.stats };
  }, [input, attrStyle, textKey, unwrapRoot, inferTypes, namespaces, indent]);

  const copy = async () => {
    if (!result.json) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!result.json) return;
    const blob = new Blob([result.json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
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
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.optionsTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="xmljson-attr" style={labelStyle}>{t.attrStyleLabel}</label>
          <div style={{ marginTop: 6 }}>
            <select id="xmljson-attr" value={attrStyle} onChange={(e) => setAttrStyle(e.target.value)} style={selectStyle}>
              <option value="prefix">{t.attrPrefix}</option>
              <option value="grouped">{t.attrGrouped}</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="xmljson-textkey" style={labelStyle}>{t.textKeyLabel}</label>
          <div style={{ marginTop: 6 }}>
            <input
              id="xmljson-textkey"
              value={textKey}
              onChange={(e) => setTextKey(e.target.value)}
              style={{ ...selectStyle, fontFamily: 'ui-monospace, monospace', width: 110 }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="xmljson-ns" style={labelStyle}>{t.nsLabel}</label>
          <div style={{ marginTop: 6 }}>
            <select id="xmljson-ns" value={namespaces} onChange={(e) => setNamespaces(e.target.value)} style={selectStyle}>
              <option value="keep">{t.nsKeep}</option>
              <option value="strip">{t.nsStrip}</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.indentLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setIndent(2)} style={indent === 2 ? primaryBtnStyle : btnStyle}>{t.indent2}</button>
            <button type="button" onClick={() => setIndent(4)} style={indent === 4 ? primaryBtnStyle : btnStyle}>{t.indent4}</button>
            <button type="button" onClick={() => setIndent(0)} style={indent === 0 ? primaryBtnStyle : btnStyle}>{t.indentMin}</button>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <label style={checkRowStyle}>
          <input type="checkbox" checked={unwrapRoot} onChange={(e) => setUnwrapRoot(e.target.checked)} />
          {t.unwrapLabel}
        </label>
        <label style={checkRowStyle}>
          <input type="checkbox" checked={inferTypes} onChange={(e) => setInferTypes(e.target.checked)} />
          {t.inferLabel}
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_XML)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".xml,.txt,text/xml,text/plain" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <label htmlFor="xmljson-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="xmljson-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>{t.outputLabel}</label>
        {result.error ? (
          <div style={{ marginTop: 6, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px', color: '#7f1d1d' }}>{t.invalid}</p>
            <p style={{ fontSize: '0.9rem', margin: 0, color: '#7f1d1d' }}>{errorText}</p>
          </div>
        ) : result.json ? (
          <pre style={preStyle}>{result.json}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {result.stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {input.length} · {t.elements}: {result.stats.elements} · {t.attributes}: {result.stats.attributes} · {t.maxDepth}: {result.stats.depth}
            {result.json ? ' · ' + t.outChars + ': ' + result.json.length : ''}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.json} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.json} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '24px 0 8px' }}>{t.howTitle}</h2>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.howNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>🛡️ {t.doctypeNote}</p>
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
