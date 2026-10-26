'use client';
/* Read-only embed code box with a copy button, shown on a tool page so
   bloggers can lift the widget (and its attribution link) in one click. */
import { useState } from 'react';

export default function EmbedSnippet({ snippet }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable (permissions/insecure context): the textarea
         below stays selectable so the code can still be copied manually. */
    }
  }

  return (
    <div>
      <textarea
        readOnly
        value={snippet}
        rows={4}
        onFocus={(e) => e.target.select()}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '1px solid var(--line)',
          borderRadius: 10,
          fontSize: '0.82rem',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          background: '#f8fafc',
          color: '#334155',
          resize: 'vertical',
        }}
      />
      <button
        type="button"
        onClick={copy}
        style={{
          marginTop: 10,
          padding: '10px 20px',
          background: 'var(--blue)',
          color: '#fff',
          border: 0,
          borderRadius: 10,
          fontWeight: 700,
          fontSize: '0.92rem',
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy embed code'}
      </button>
    </div>
  );
}
