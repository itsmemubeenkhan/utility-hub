'use client';
/* Markdown Table Generator: an editable spreadsheet-style grid that emits
   a padded GFM Markdown table, with a live rendered preview. Paste CSV,
   TSV or an existing Markdown table to fill the grid, set per-column
   alignment, then copy the Markdown or download it as a .md file.
   100% in your browser, nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ALIGNMENTS, DEFAULT_GRID, gridToHtml, gridToMarkdown, parseDelimited,
  parseMarkdownTable, tableStats,
} from '@/lib/markdown-table-utils';

const STR = {
  en: {
    gridTitle: 'Your table',
    headerRow: 'Header row',
    alignLabel: 'Align',
    alignLeft: 'Left',
    alignCenter: 'Center',
    alignRight: 'Right',
    addRow: 'Add row',
    addColumn: 'Add column',
    removeRow: 'Remove last row',
    removeColumn: 'Remove last column',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    sample: 'Sample table',
    clear: 'Clear',
    pasteTitle: 'Paste data into the grid',
    pasteLabel: 'Paste CSV, TSV, spreadsheet cells, or an existing Markdown table',
    pastePlaceholder: 'Name, Role, City\nAda Lovelace, Programmer, London\n\nor an existing Markdown table:\n| Name | Role |\n| --- | --- |\n| Ada | Programmer |',
    importCsv: 'Import CSV / TSV',
    importMarkdown: 'Import Markdown table',
    importCsvEmpty: 'Nothing to import: paste some CSV or TSV data first.',
    importMdFail: 'No Markdown table found. Paste a table with a header row and a --- separator row.',
    markdownTitle: 'Markdown output',
    previewTitle: 'Live preview',
    copy: 'Copy Markdown',
    copied: 'Copied!',
    download: 'Download .md',
    statsRows: 'rows',
    statsCols: 'columns',
    statsChars: 'characters',
    statsFilled: 'filled cells',
    howTitle: 'How do Markdown tables work?',
    howNote: 'A Markdown table is plain text: the first line is the header, the second line is a row of dashes that separates it from the body, and pipes separate the columns. The dash row also sets alignment: :--- aligns left, :---: centers, and ---: aligns right. Pipes inside a cell are escaped as \\| so they do not split the cell. This tool pads every column so the raw text stays readable, and the preview shows exactly how GitHub, GitLab and most Markdown renderers will display it.',
    privacy: 'Privacy: everything runs in your browser. Your table data is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/markdown-to-html', label: 'Markdown to HTML' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV' },
      { href: '/tools/yaml-to-json-converter', label: 'YAML to JSON' },
      { href: '/tools/json-to-xml-converter', label: 'JSON to XML' },
    ],
  },
  es: {
    gridTitle: 'Tu tabla',
    headerRow: 'Fila de encabezado',
    alignLabel: 'Alinear',
    alignLeft: 'Izquierda',
    alignCenter: 'Centro',
    alignRight: 'Derecha',
    addRow: 'Agregar fila',
    addColumn: 'Agregar columna',
    removeRow: 'Quitar última fila',
    removeColumn: 'Quitar última columna',
    deleteRow: 'Eliminar fila',
    deleteColumn: 'Eliminar columna',
    sample: 'Tabla de ejemplo',
    clear: 'Limpiar',
    pasteTitle: 'Pega datos en la cuadrícula',
    pasteLabel: 'Pega CSV, TSV, celdas de hoja de cálculo, o una tabla Markdown existente',
    pastePlaceholder: 'Nombre, Rol, Ciudad\nAda Lovelace, Programadora, Londres\n\no una tabla Markdown existente:\n| Nombre | Rol |\n| --- | --- |\n| Ada | Programadora |',
    importCsv: 'Importar CSV / TSV',
    importMarkdown: 'Importar tabla Markdown',
    importCsvEmpty: 'Nada que importar: pega primero algunos datos CSV o TSV.',
    importMdFail: 'No se encontró una tabla Markdown. Pega una tabla con una fila de encabezado y una fila separadora ---.',
    markdownTitle: 'Salida Markdown',
    previewTitle: 'Vista previa',
    copy: 'Copiar Markdown',
    copied: '¡Copiado!',
    download: 'Descargar .md',
    statsRows: 'filas',
    statsCols: 'columnas',
    statsChars: 'caracteres',
    statsFilled: 'celdas con datos',
    howTitle: '¿Cómo funcionan las tablas Markdown?',
    howNote: 'Una tabla Markdown es texto plano: la primera línea es el encabezado, la segunda línea es una fila de guiones que lo separa del cuerpo, y las barras verticales separan las columnas. La fila de guiones también fija la alineación: :--- alinea a la izquierda, :---: centra, y ---: alinea a la derecha. Las barras dentro de una celda se escapan como \\| para que no dividan la celda. Esta herramienta rellena cada columna para que el texto se lea bien, y la vista previa muestra exactamente cómo la mostrarán GitHub, GitLab y la mayoría de los renderizadores Markdown.',
    privacy: 'Privacidad: todo corre en tu navegador. Los datos de tu tabla nunca se suben, se guardan ni los ve nadie más.',
    seeAlso: 'Más herramientas de desarrollo',
    siblings: [
      { href: '/es/tools/convertidor-de-markdown-a-html', label: 'Markdown a HTML' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'JSON a CSV' },
      { href: '/es/tools/convertidor-de-yaml-a-json', label: 'YAML a JSON' },
      { href: '/es/tools/convertidor-de-json-a-xml', label: 'JSON a XML' },
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
const smallBtnStyle = { ...btnStyle, padding: '6px 10px', fontSize: '0.85rem' };
const labelStyle = { fontSize: '0.95rem', fontWeight: 600 };
const cellInputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};
const selectStyle = {
  padding: '6px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: '0.85rem',
  background: '#fff',
};

export default function MarkdownTableTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [grid, setGrid] = useState(() => DEFAULT_GRID.map((r) => [...r]));
  const [alignments, setAlignments] = useState(['left', 'left', 'left']);
  const [paste, setPaste] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const gridRef = useRef(null);

  const cols = grid.length ? grid[0].length : 0;
  const markdown = useMemo(() => gridToMarkdown(grid, alignments), [grid, alignments]);
  const previewHtml = useMemo(() => gridToHtml(grid, alignments), [grid, alignments]);
  const stats = useMemo(() => tableStats(grid, markdown), [grid, markdown]);

  const setCell = (r, c, value) => {
    setGrid((g) => g.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)));
  };

  const focusCell = (r, c) => {
    const el = gridRef.current && gridRef.current.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
    if (el) el.focus();
  };

  const onCellKeyDown = (e, r, c) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (r + 1 < grid.length) focusCell(r + 1, c);
      else focusCell(0, c);
    }
  };

  const addRow = () => setGrid((g) => [...g, Array(cols).fill('')]);
  const addColumn = () => {
    setGrid((g) => g.map((row) => [...row, '']));
    setAlignments((a) => [...a, 'left']);
  };
  const removeRow = () => {
    if (grid.length <= 1) return;
    setGrid((g) => g.slice(0, -1));
  };
  const removeColumn = () => {
    if (cols <= 1) return;
    setGrid((g) => g.map((row) => row.slice(0, -1)));
    setAlignments((a) => a.slice(0, -1));
  };
  const deleteRow = (r) => {
    if (grid.length <= 1) return;
    setGrid((g) => g.filter((_, i) => i !== r));
  };
  const deleteColumn = (c) => {
    if (cols <= 1) return;
    setGrid((g) => g.map((row) => row.filter((_, i) => i !== c)));
    setAlignments((a) => a.filter((_, i) => i !== c));
  };
  const setAlignment = (c, value) => {
    setAlignments((a) => a.map((x, i) => (i === c ? value : x)));
  };

  const loadSample = () => {
    setGrid(DEFAULT_GRID.map((r) => [...r]));
    setAlignments(['left', 'left', 'left']);
    setNotice('');
  };
  const clearGrid = () => {
    setGrid([['', '', '']]);
    setAlignments(['left', 'left', 'left']);
    setNotice('');
  };

  const importCsv = () => {
    const parsed = parseDelimited(paste);
    if (!parsed) {
      setNotice(t.importCsvEmpty);
      return;
    }
    setGrid(parsed);
    setAlignments(Array(parsed[0].length).fill('left'));
    setNotice('');
    setPaste('');
  };
  const importMarkdown = () => {
    const parsed = parseMarkdownTable(paste);
    if (!parsed) {
      setNotice(t.importMdFail);
      return;
    }
    setGrid(parsed.grid);
    setAlignments(parsed.alignments);
    setNotice('');
    setPaste('');
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice('Copy failed in this browser. Select the output below and copy it manually.');
    }
  };
  const downloadMd = () => {
    const blob = new Blob([markdown + '\n'], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-table.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.gridTitle}</h2>
      <p style={{ margin: '0 0 12px', color: '#4b5563', fontSize: '0.95rem' }}>
        {t.headerRow} · Tab / Enter {lang === 'es' ? 'para moverte entre celdas' : 'to move between cells'}
      </p>

      <div ref={gridRef} style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} style={{ padding: '4px 6px', textAlign: 'left', verticalAlign: 'bottom' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                    {t.alignLabel} {c + 1}
                  </label>
                  <span style={{ display: 'flex', gap: 4 }}>
                    <select
                      aria-label={`${t.alignLabel} ${c + 1}`}
                      value={alignments[c] || 'left'}
                      onChange={(e) => setAlignment(c, e.target.value)}
                      style={selectStyle}
                    >
                      {ALIGNMENTS.map((a) => (
                        <option key={a} value={a}>
                          {a === 'left' ? t.alignLeft : a === 'center' ? t.alignCenter : t.alignRight}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => deleteColumn(c)} title={t.deleteColumn} style={smallBtnStyle} aria-label={t.deleteColumn}>
                      ×
                    </button>
                  </span>
                </th>
              ))}
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r} style={r === 0 ? { background: '#eff6ff' } : undefined}>
                {row.map((cell, c) => (
                  <td key={c} style={{ padding: 4 }}>
                    <input
                      data-r={r}
                      data-c={c}
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onKeyDown={(e) => onCellKeyDown(e, r, c)}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                      style={{
                        ...cellInputStyle,
                        fontWeight: r === 0 ? 600 : 400,
                        background: r === 0 ? '#eff6ff' : '#fff',
                      }}
                    />
                  </td>
                ))}
                <td style={{ padding: 4 }}>
                  <button type="button" onClick={() => deleteRow(r)} title={t.deleteRow} style={smallBtnStyle} aria-label={t.deleteRow}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <button type="button" onClick={addRow} style={btnStyle}>{t.addRow}</button>
        <button type="button" onClick={addColumn} style={btnStyle}>{t.addColumn}</button>
        <button type="button" onClick={removeRow} style={btnStyle}>{t.removeRow}</button>
        <button type="button" onClick={removeColumn} style={btnStyle}>{t.removeColumn}</button>
        <button type="button" onClick={loadSample} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={clearGrid} style={btnStyle}>{t.clear}</button>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.pasteTitle}</h2>
      <label htmlFor="mdtable-paste" style={labelStyle}>{t.pasteLabel}</label>
      <textarea
        id="mdtable-paste"
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder={t.pastePlaceholder}
        rows={6}
        style={{ ...cellInputStyle, fontFamily: 'ui-monospace, monospace', marginTop: 6 }}
      />
      {notice && <p role="alert" style={{ color: '#b91c1c', fontSize: '0.95rem', margin: '8px 0 0' }}>{notice}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0 20px' }}>
        <button type="button" onClick={importCsv} style={primaryBtnStyle}>{t.importCsv}</button>
        <button type="button" onClick={importMarkdown} style={btnStyle}>{t.importMarkdown}</button>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.markdownTitle}</h2>
      <pre
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: 16,
          borderRadius: 10,
          overflowX: 'auto',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          margin: '0 0 12px',
          whiteSpace: 'pre',
        }}
      >
        {markdown}
      </pre>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <button type="button" onClick={copyMarkdown} style={primaryBtnStyle}>{copied ? t.copied : t.copy}</button>
        <button type="button" onClick={downloadMd} style={btnStyle}>{t.download}</button>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.previewTitle}</h2>
      <div
        className="mdtable-preview"
        style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 10, padding: 16, marginBottom: 12 }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
      <style>{`.mdtable-preview table{border-collapse:collapse;width:100%}.mdtable-preview th,.mdtable-preview td{border:1px solid #d1d5db;padding:8px 12px;text-align:left}.mdtable-preview th{background:#f3f4f6;font-weight:600}`}</style>

      <p style={{ fontSize: '0.95rem', color: '#4b5563', margin: '0 0 20px' }}>
        {stats.rows} {t.statsRows} · {stats.columns} {t.statsCols} · {stats.filledCells} {t.statsFilled} · {stats.chars} {t.statsChars}
      </p>

      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.howTitle}</h2>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.howNote}</p>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 20px' }}>{t.privacy}</p>

      <h2 style={{ fontSize: '1.05rem', margin: '0 0 8px' }}>{t.seeAlso}</h2>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.95rem', lineHeight: 1.9 }}>
        {t.siblings.map((s) => (
          <li key={s.href}>
            <Link href={s.href}>{s.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
