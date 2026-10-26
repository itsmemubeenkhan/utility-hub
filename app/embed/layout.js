import '../globals.css';

/* Embed routes (/embed/*) are iframed by third-party sites, so they render
   their own bare <html>/<body> with no site header, nav or footer.
   Middleware excludes /embed from the locale rewrite, and the root layout
   passes children straight through, so this layout owns the document. */
export const metadata = {
  metadataBase: new URL('https://www.theutilityhub.online'),
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#fff' }}>{children}</body>
    </html>
  );
}
