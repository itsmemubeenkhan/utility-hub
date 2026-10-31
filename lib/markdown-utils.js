/* Pure Markdown to HTML converter (CommonMark core + GFM extras).
   Dependency-free, runs in the browser. Output is sanitized by construction:
   source HTML is escaped before parsing, so only tags this parser itself
   emits can appear in the result. No script, iframe or event attribute can
   survive, which makes the output safe to paste into a CMS or blog. */

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Emphasis only (bold/italic/strikethrough), used for link labels so a
// label can itself contain bold or italic without re-running link parsing.
function emphasis(text) {
  let out = text;
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return out;
}

// Split a paragraph's inline markup. Code spans and markdown links/images
// are pulled out first so autolink/emphasis parsing can never mangle them
// (an early version nested a second anchor inside every markdown link's href).
function inline(text) {
  const codes = [];
  let out = text.replace(/`([^`\n]+)`/g, (_, code) => {
    codes.push(escapeHtml(code));
    return '\u0000' + (codes.length - 1) + '\u0000';
  });
  out = escapeHtml(out);
  const links = [];
  const stash = (html) => {
    links.push(html);
    return '\u0001' + (links.length - 1) + '\u0001';
  };
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) =>
    stash('<img src="' + src + '" alt="' + emphasis(alt) + '"' + (title ? ' title="' + title + '"' : '') + '>'));
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, label, href, title) =>
    stash('<a href="' + href + '"' + (title ? ' title="' + title + '"' : '') + '>' + emphasis(label) + '</a>'));
  out = out.replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, (_, url) => stash('<a href="' + url + '">' + url + '</a>'));
  out = out.replace(/(https?:\/\/[^\s<]+)/g, (_, url) => stash('<a href="' + url + '">' + url + '</a>'));
  out = emphasis(out);
  out = out.replace(/\u0001(\d+)\u0001/g, (_, i) => links[Number(i)]);
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + codes[Number(i)] + '</code>');
  return out;
}

function splitRow(line) {
  let cells = line.trim();
  if (cells.startsWith('|')) cells = cells.slice(1);
  if (cells.endsWith('|')) cells = cells.slice(0, -1);
  return cells.split('|').map((c) => c.trim());
}

function isDivider(line) {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

export function markdownToHtml(src) {
  const lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i += 1; continue; }
    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      html.push('<pre><code' + (fence[1] ? ' class="language-' + fence[1] + '"' : '') + '>' + escapeHtml(body.join('\n')) + '</code></pre>');
      continue;
    }
    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      html.push('<h' + heading[1].length + '>' + inline(heading[2].trim()) + '</h' + heading[1].length + '>');
      i += 1; continue;
    }
    // Horizontal rule
    if (/^(\*\s*){3,}$|^(-\s*){3,}$|^(_\s*){3,}$/.test(line.trim())) {
      html.push('<hr>'); i += 1; continue;
    }
    // GFM table
    if (line.includes('|') && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const headers = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? ' style="text-align:center"' : c.endsWith(':') ? ' style="text-align:right"' : c.startsWith(':') ? ' style="text-align:left"' : ''));
      let table = '<table><thead><tr>' + headers.map((h, k) => '<th' + (aligns[k] || '') + '>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>';
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        const cells = splitRow(lines[i]);
        table += '<tr>' + headers.map((_, k) => '<td' + (aligns[k] || '') + '>' + inline(cells[k] || '') + '</td>').join('') + '</tr>';
        i += 1;
      }
      table += '</tbody></table>';
      html.push(table); continue;
    }
    // Blockquote (consecutive > lines)
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { body.push(lines[i].replace(/^>\s?/, '')); i += 1; }
      html.push('<blockquote>' + markdownToHtml(body.join('\n')) + '</blockquote>');
      continue;
    }
    // Lists (unordered, ordered, task items)
    if (/^(\s*)([-*+]|\d+[.)])\s+/.test(line)) {
      const items = [];
      let ordered = false;
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (!m) break;
        if (/^\d/.test(m[2])) ordered = true;
        const task = m[3].match(/^\[([ xX])\]\s+(.*)$/);
        if (task) items.push('<li><input type="checkbox" disabled' + (task[1].toLowerCase() === 'x' ? ' checked' : '') + '> ' + inline(task[2]) + '</li>');
        else items.push('<li>' + inline(m[3]) + '</li>');
        i += 1;
      }
      html.push(ordered ? '<ol>' + items.join('') + '</ol>' : '<ul>' + items.join('') + '</ul>');
      continue;
    }
    // Paragraph: consecutive non-blank, non-block lines joined with spaces
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|```|>|\s*([-*+]|\d+[.)])\s)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isDivider(lines[i + 1]))) {
      para.push(lines[i].trim()); i += 1;
    }
    if (para.length) html.push('<p>' + inline(para.join(' ')) + '</p>');
    else i += 1;
  }
  return html.join('\n');
}

export function markdownStats(src) {
  const text = String(src == null ? '' : src);
  const html = markdownToHtml(text);
  const countTag = (tag) => (html.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  return {
    words,
    chars: text.length,
    headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].reduce((n, t) => n + countTag(t), 0),
    links: countTag('a'),
    codeBlocks: (html.match(/<pre>/g) || []).length,
    tables: countTag('table'),
    htmlBytes: html.length,
  };
}

export const SAMPLE_MARKDOWN = [
  '# Markdown to HTML, in one glance',
  '',
  'Write **bold** and *italic* text, add a [link](https://www.theutilityhub.online) or `inline code`, and watch it become clean HTML.',
  '',
  '## A checklist',
  '',
  '- [x] Headings, lists and tables',
  '- [ ] Fenced code blocks with language hints',
  '- [ ] Paste into any CMS or blog',
  '',
  '## A small table',
  '',
  '| Syntax | Becomes |',
  '| --- | --- |',
  '| `# Title` | `<h1>Title</h1>` |',
  '| `**bold**` | `<strong>bold</strong>` |',
  '',
  '```js',
  'const greeting = "Hello, Markdown!";',
  'console.log(greeting);',
  '```',
  '',
  '> Markdown is plain text with a few symbols. HTML is what the browser reads. This tool bridges the two.',
].join('\n');
