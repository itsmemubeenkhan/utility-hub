'use client';
/* Dispatcher: registry entries with `customComponent` starting with `qr-`
   render here instead of the generic ToolRunner (QR tools need canvas
   rendering, downloads and print - richer UI than the calculator shell). */
import QRCodeGenerator from './QRCodeGenerator';
import WiFiQRGenerator from './WiFiQRGenerator';

const MAP = {
  'qr-code-generator': QRCodeGenerator,
  'qr-wifi-generator': WiFiQRGenerator,
};

export default function QRTool({ component, lang = 'en' }) {
  const C = MAP[component];
  if (!C) return null;
  return <C lang={lang} />;
}
