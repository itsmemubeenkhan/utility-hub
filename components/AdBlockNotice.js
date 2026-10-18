'use client';

import { useEffect, useState } from 'react';

const STRINGS = {
  en: {
    title: 'Please support our free tools',
    text: 'It looks like you are using an ad blocker. Our tools stay 100% free because of ads. Please disable your ad blocker for this site, or add us to your allowlist.',
    dismiss: 'Dismiss',
    reload: 'I disabled it, reload',
  },
  es: {
    title: 'Apoya nuestras herramientas gratis',
    text: 'Parece que estás usando un bloqueador de anuncios. Nuestras herramientas son 100% gratis gracias a los anuncios. Desactiva tu bloqueador para este sitio o agréganos a tu lista de permitidos.',
    dismiss: 'Cerrar',
    reload: 'Ya lo desactivé, recargar',
  },
};

function adBlockDetected() {
  try {
    // Bait element: ad blockers hide elements with ad-like class names.
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner pub_300x250 adsbygoogle';
    bait.style.cssText =
      'position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;';
    document.body.appendChild(bait);
    const baitHidden =
      bait.offsetHeight === 0 ||
      bait.offsetParent === null ||
      window.getComputedStyle(bait).display === 'none' ||
      window.getComputedStyle(bait).visibility === 'hidden';
    bait.remove();
    // Script check: the AdSense library failed to load at all.
    const scriptBlocked = typeof window.adsbygoogle === 'undefined';
    return baitHidden || scriptBlocked;
  } catch {
    return false;
  }
}

export default function AdBlockNotice({ lang = 'en' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem('uh-adblock-dismissed') === '1';
      } catch {
        dismissed = false;
      }
      if (!dismissed && adBlockDetected()) setShow(true);
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;
  const s = STRINGS[lang] || STRINGS.en;

  const dismiss = () => {
    try {
      sessionStorage.setItem('uh-adblock-dismissed', '1');
    } catch {
      /* storage unavailable */
    }
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={s.title}
      style={{
        position: 'fixed',
        left: '16px',
        right: '16px',
        bottom: '16px',
        zIndex: 9999,
        maxWidth: '560px',
        margin: '0 auto',
        background: '#111827',
        color: '#f9fafb',
        borderRadius: '14px',
        padding: '18px 20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        border: '1px solid #374151',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{s.title}</div>
      <p style={{ fontSize: '14px', lineHeight: 1.55, margin: '0 0 14px', color: '#d1d5db' }}>
        {s.text}
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {s.reload}
        </button>
        <button
          onClick={dismiss}
          style={{
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {s.dismiss}
        </button>
      </div>
    </div>
  );
}
