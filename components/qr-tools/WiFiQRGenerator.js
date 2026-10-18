'use client';
/* WiFi QR Generator - share WiFi without spelling the password.
   Differentiator vs the thin rankers: printable guest sign, hidden-network
   support, open-network mode, and SVG download. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { buildWifiPayload, qrFits } from '@/lib/qr-tools';

const STR = {
  en: {
    ssidLabel: 'WiFi network name (SSID)',
    ssidPlaceholder: 'MyHomeWiFi',
    passLabel: 'WiFi password',
    passPlaceholder: 'Your WiFi password',
    show: 'Show',
    hide: 'Hide',
    encLabel: 'Security type',
    encOptions: [
      { value: 'WPA', label: 'WPA / WPA2 (most common)' },
      { value: 'WEP', label: 'WEP (old routers)' },
      { value: 'nopass', label: 'Open network (no password)' },
    ],
    hiddenLabel: 'Hidden network (SSID not broadcast)',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    printSign: 'Print guest sign',
    empty: 'Enter your WiFi name above and a scannable QR code appears here.',
    tooLong: 'Those details are too long for a QR code - shorten the network name or password.',
    scanTitle: 'Scan to join WiFi',
    signLine: 'Point your phone camera at the code to connect automatically. No typing needed.',
    seeAlso: 'More code tools',
    siblings: [
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
      { href: '/tools/character-counter', label: 'Character Counter' },
    ],
  },
  es: {
    ssidLabel: 'Nombre de la red WiFi (SSID)',
    ssidPlaceholder: 'MiWiFiCasa',
    passLabel: 'Contraseña del WiFi',
    passPlaceholder: 'Tu contraseña del WiFi',
    show: 'Ver',
    hide: 'Ocultar',
    encLabel: 'Tipo de seguridad',
    encOptions: [
      { value: 'WPA', label: 'WPA / WPA2 (lo más común)' },
      { value: 'WEP', label: 'WEP (routers viejos)' },
      { value: 'nopass', label: 'Red abierta (sin contraseña)' },
    ],
    hiddenLabel: 'Red oculta (el SSID no se transmite)',
    downloadPng: 'Descargar PNG',
    downloadSvg: 'Descargar SVG',
    printSign: 'Imprimir cartel para invitados',
    empty: 'Escribe el nombre de tu WiFi arriba y aparece un QR escaneable.',
    tooLong: 'Esos datos son demasiado largos para un QR - acorta el nombre de la red o la contraseña.',
    scanTitle: 'Escanea para unirte al WiFi',
    signLine: 'Apunta la cámara de tu teléfono al código para conectarte automáticamente. Sin escribir nada.',
    seeAlso: 'Más herramientas de códigos',
    siblings: [
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de códigos QR' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
    ],
  },
};

export default function WiFiQRGenerator({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [enc, setEnc] = useState('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [printUrl, setPrintUrl] = useState('');
  const canvasRef = useRef(null);

  const payload = useMemo(
    () => buildWifiPayload({ ssid, password, encryption: enc, hidden }),
    [ssid, password, enc, hidden]
  );
  const canRender = ssid.trim().length > 0 && qrFits(payload, 'M');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canRender) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPrintUrl('');
      return;
    }
    let alive = true;
    QRCode.toCanvas(canvas, payload, {
      width: 280, margin: 2, errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch(() => {});
    QRCode.toDataURL(payload, {
      width: 1024, margin: 3, errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((url) => {
      if (alive) setPrintUrl(url);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [payload, canRender]);

  const downloadPng = async () => {
    if (!canRender) return;
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 1024, margin: 2, errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'wifi-qr-code.png';
    a.click();
  };

  const downloadSvg = async () => {
    if (!canRender) return;
    const svg = await QRCode.toString(payload, {
      type: 'svg', errorCorrectionLevel: 'M', margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wifi-qr-code.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
    borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit',
  };

  return (
    <div>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #wifi-print-sign, #wifi-print-sign * { visibility: visible !important; }
        #wifi-print-sign { display: block !important; position: absolute; left: 0; top: 0; width: 100%; text-align: center; padding-top: 60px; }
      }`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="field">
          <label>{t.ssidLabel}</label>
          <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder={t.ssidPlaceholder} style={inputStyle} />
        </div>
        <div className="field">
          <label>{t.passLabel}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passPlaceholder}
              disabled={enc === 'nopass'}
              style={{ ...inputStyle, opacity: enc === 'nopass' ? 0.5 : 1 }}
            />
            <button type="button" className="btn btn-ghost-light" onClick={() => setShowPass((v) => !v)} style={{ whiteSpace: 'nowrap' }}>
              {showPass ? t.hide : t.show}
            </button>
          </div>
        </div>
        <div className="field">
          <label>{t.encLabel}</label>
          <select value={enc} onChange={(e) => setEnc(e.target.value)} style={{ ...inputStyle, padding: '10px 12px', borderRadius: 10 }}>
            {t.encOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input id="wifi-hidden" type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} style={{ width: 18, height: 18 }} />
          <label htmlFor="wifi-hidden" style={{ margin: 0 }}>{t.hiddenLabel}</label>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
        {canRender ? (
          <canvas ref={canvasRef} style={{ width: 280, height: 280, maxWidth: '100%', border: '1px solid var(--line)', borderRadius: 12 }} />
        ) : (
          <>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <p style={{ color: 'var(--muted)', margin: '40px 0' }}>{ssid.trim() ? t.tooLong : t.empty}</p>
          </>
        )}
        {canRender && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={downloadPng}>{t.downloadPng}</button>
            <button type="button" className="btn btn-ghost-light" onClick={downloadSvg}>{t.downloadSvg}</button>
            <button type="button" className="btn btn-ghost-light" onClick={() => window.print()}>{t.printSign}</button>
          </div>
        )}
      </div>

      {/* Printable guest sign - hidden on screen, shown when printing */}
      <div id="wifi-print-sign" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>{t.scanTitle}</h1>
        <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>{ssid}</p>
        {printUrl && <img src={printUrl} alt="WiFi QR code" style={{ width: 420, height: 420 }} />}
        <p style={{ fontSize: '1rem', color: '#444', marginTop: 16, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>{t.signLine}</p>
      </div>

      <p style={{ marginTop: 22, fontSize: '0.95rem' }}>
        <strong>{t.seAlso}:</strong>{' '}
        {t.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
