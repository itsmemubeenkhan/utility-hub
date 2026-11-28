'use client';
/* Credit Card Validator: check one card number or a bulk list against
   the Luhn (mod 10) checksum, detect the issuing network from the
   IIN/BIN prefix, and show the Luhn working step by step so you can see
   WHY a number passes or fails. A pass means "correctly formed" only:
   it does NOT prove the card is real, active, funded or issued. This
   tool never asks for an expiry date or a security code, and nothing
   you type leaves your browser. Use the publishers' public test
   numbers, never a real card on a site you do not trust. 100% in your
   browser, nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  validateCard,
  validateBulk,
  formatCardNumber,
  SAMPLE_VISA,
  SAMPLE_MASTERCARD,
  SAMPLE_AMEX,
  SAMPLE_DISCOVER,
  SAMPLE_JCB,
  SAMPLE_BULK,
} from '@/lib/cc-validator-utils';

const REASONS = {
  en: {
    empty: 'Empty input.',
    'illegal-character': 'Illegal character: only digits, spaces and hyphens are allowed.',
    'too-short': 'Too short: a card number has 12 to 19 digits.',
    'too-long': 'Too long: a card number has at most 19 digits.',
    'unknown-network': 'Unknown network: no issuing network matches this starting number, even though the length is in range.',
    'wrong-length': 'Wrong length for this network: {network} numbers have {lengths} digits.',
    'luhn-fail': 'Luhn check failed: the weighted sum is {sum}, which is not a multiple of 10. The correct last digit is {expected}.',
  },
  es: {
    empty: 'Entrada vacía.',
    'illegal-character': 'Carácter ilegal: solo se permiten dígitos, espacios y guiones.',
    'too-short': 'Demasiado corto: un número de tarjeta tiene de 12 a 19 dígitos.',
    'too-long': 'Demasiado largo: un número de tarjeta tiene como máximo 19 dígitos.',
    'unknown-network': 'Red desconocida: ninguna red emisora coincide con este inicio, aunque la longitud está en rango.',
    'wrong-length': 'Longitud incorrecta para esta red: los números de {network} tienen {lengths} dígitos.',
    'luhn-fail': 'Fallo la comprobación de Luhn: la suma ponderada es {sum}, que no es múltiplo de 10. El último dígito correcto es {expected}.',
  },
};

const STR = {
  en: {
    singleTitle: 'Validate one card number',
    singleLabel: 'Card number',
    singlePlaceholder: 'Type or paste a card number, spaces optional...',
    valid: 'Correctly formed',
    invalid: 'Not valid',
    honestNote: 'A pass means the number is correctly formed only. It does NOT prove the card is real, active, funded or issued. Never enter a real card number on a site you do not trust, and never enter an expiry date or security code here: this tool does not ask for them.',
    network: 'Network',
    unknownNetwork: 'Unknown network',
    length: 'Length',
    digits: 'digits',
    digitsCount: '{n} digits',
    charsCount: '{n} characters typed',
    securityCode: 'Security code',
    binLabel: 'BIN / IIN (first 6 digits)',
    iin8Label: 'IIN (first 8 digits)',
    formattedLabel: 'Grouped as typed on the card',
    luhnTitle: 'How Luhn checked it',
    luhnIntro: 'Starting from the rightmost digit, every second digit is doubled (values over 9 have their digits added). The weighted sum must be a multiple of 10.',
    luhnPos: 'From right',
    luhnDigit: 'Digit',
    luhnDoubled: 'Doubled?',
    luhnYes: 'Yes',
    luhnNo: 'No',
    luhnContribution: 'Counts as',
    luhnSum: 'Weighted sum',
    luhnRemainder: 'Remainder when divided by 10',
    luhnPass: 'Multiple of 10, so it passes.',
    luhnFail: 'Not a multiple of 10, so it fails.',
    expectedCheck: 'The last digit should be {expected}.',
    bulkTitle: 'Bulk validation',
    bulkLabel: 'Card numbers, one per line (up to 100)',
    bulkPlaceholder: '4242424242424242\n5555555555554444\n...',
    bulkCounts: '{valid} valid · {invalid} invalid · {total} total',
    bulkLine: 'Line',
    bulkNumber: 'Number',
    bulkVerdict: 'Verdict',
    bulkNetwork: 'Network',
    bulkReason: 'Reason',
    downloadCsv: 'Download .csv',
    sample: 'Test number',
    sampleVisa: 'Visa: 4242 4242 4242 4242',
    sampleMc: 'Mastercard: 5555 5555 5555 4444',
    sampleAmex: 'Amex: 3782 822463 10005',
    sampleDiscover: 'Discover: 6011 1111 1111 1117',
    sampleJcb: 'JCB: 3566 0020 2036 0505',
    sampleBulk: 'Bulk sample (5 numbers)',
    swap: 'Move to bulk',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    emptySingle: 'Type a card number above to check it. Use a publisher test number, never a real card.',
    emptyBulk: 'Paste card numbers above to validate them in bulk.',
    privacy: 'Privacy: validation, network detection and the Luhn working all run locally in your browser. Nothing you type is uploaded, stored or seen by anyone else.',
    seeAlso: 'More finance and developer tools',
    siblings: [
      { href: '/tools/pay-stub-generator', label: 'Pay Stub Generator' },
      { href: '/tools/salary-paycheck-calculator', label: 'Salary Paycheck Calculator' },
      { href: '/tools/hash-generator', label: 'Hash Generator' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder / Decoder' },
    ],
  },
  es: {
    singleTitle: 'Validar un número de tarjeta',
    singleLabel: 'Número de tarjeta',
    singlePlaceholder: 'Escribe o pega un número de tarjeta, espacios opcionales...',
    valid: 'Bien formado',
    invalid: 'No válido',
    honestNote: 'Un aprobado significa solo que el número está bien formado. NO prueba que la tarjeta sea real, activa, tenga fondos o haya sido emitida. Nunca escribas un número de tarjeta real en un sitio en el que no confíes, y nunca escribas una fecha de vencimiento ni un código de seguridad aquí: esta herramienta no los pide.',
    network: 'Red',
    unknownNetwork: 'Red desconocida',
    length: 'Longitud',
    digits: 'dígitos',
    digitsCount: '{n} dígitos',
    charsCount: '{n} caracteres escritos',
    securityCode: 'Código de seguridad',
    binLabel: 'BIN / IIN (primeros 6 dígitos)',
    iin8Label: 'IIN (primeros 8 dígitos)',
    formattedLabel: 'Agrupado como en la tarjeta',
    luhnTitle: 'Cómo lo comprobó Luhn',
    luhnIntro: 'Empezando por el dígito de la derecha, cada segundo dígito se duplica (los valores mayores de 9 suman sus dígitos). La suma ponderada debe ser múltiplo de 10.',
    luhnPos: 'Desde la derecha',
    luhnDigit: 'Dígito',
    luhnDoubled: '¿Duplicado?',
    luhnYes: 'Sí',
    luhnNo: 'No',
    luhnContribution: 'Cuenta como',
    luhnSum: 'Suma ponderada',
    luhnRemainder: 'Resto al dividir entre 10',
    luhnPass: 'Múltiplo de 10, así que pasa.',
    luhnFail: 'No es múltiplo de 10, así que falla.',
    expectedCheck: 'El último dígito debería ser {expected}.',
    bulkTitle: 'Validación masiva',
    bulkLabel: 'Números de tarjeta, uno por línea (hasta 100)',
    bulkPlaceholder: '4242424242424242\n5555555555554444\n...',
    bulkCounts: '{valid} válidos · {invalid} inválidos · {total} en total',
    bulkLine: 'Línea',
    bulkNumber: 'Número',
    bulkVerdict: 'Veredicto',
    bulkNetwork: 'Red',
    bulkReason: 'Motivo',
    downloadCsv: 'Descargar .csv',
    sample: 'Número de prueba',
    sampleVisa: 'Visa: 4242 4242 4242 4242',
    sampleMc: 'Mastercard: 5555 5555 5555 4444',
    sampleAmex: 'Amex: 3782 822463 10005',
    sampleDiscover: 'Discover: 6011 1111 1111 1117',
    sampleJcb: 'JCB: 3566 0020 2036 0505',
    sampleBulk: 'Ejemplo masivo (5 números)',
    swap: 'Mover a masiva',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    emptySingle: 'Escribe un número de tarjeta arriba para comprobarlo. Usa un número de prueba de un editor, nunca una tarjeta real.',
    emptyBulk: 'Pega números de tarjeta arriba para validarlos en masa.',
    privacy: 'Privacidad: la validación, la detección de red y el cálculo de Luhn corren localmente en tu navegador. Nada de lo que escribes se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas de finanzas y desarrollo',
    siblings: [
      { href: '/es/tools/generador-de-recibo-de-pago', label: 'Generador de Recibo de Pago' },
      { href: '/es/tools/calculadora-de-salario', label: 'Calculadora de Salario' },
      { href: '/es/tools/generador-de-hash', label: 'Generador de Hash' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
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
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const areaStyle = {
  width: '100%',
  minHeight: 110,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 };
const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #d1d5db', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', verticalAlign: 'top' };

function reasonText(lang, result) {
  if (result.valid || !result.reason) return '';
  const tpl = (REASONS[lang] || REASONS.en)[result.reason] || result.reason;
  return tpl
    .replace('{network}', result.networkName || '')
    .replace('{lengths}', (result.expectedLengths || []).join(', '))
    .replace('{sum}', result.luhn ? String(result.luhn.sum) : '')
    .replace('{expected}', result.expectedCheck ?? '');
}

export default function CcValidatorTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [bulk, setBulk] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => (input.trim() ? validateCard(input) : null), [input]);
  const bulkResult = useMemo(() => (bulk.trim() ? validateBulk(bulk) : null), [bulk]);
  const digitCount = useMemo(() => input.replace(/[^0-9]/g, '').length, [input]);

  const handleInput = (value) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 19);
    setInput(formatCardNumber(digits));
  };

  const copySingle = async () => {
    if (!result) return;
    const lines = [
      result.formatted || result.raw,
      (result.valid ? t.valid : t.invalid) + (result.networkName ? ' · ' + result.networkName : ''),
      result.valid
        ? t.network + ': ' + result.networkName + ' · ' + t.length + ': ' + result.digits + ' ' + t.digits + ' · ' + t.binLabel + ': ' + result.bin
        : reasonText(lang, result),
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadSingle = () => {
    if (!result) return;
    const lines = [
      result.formatted || result.raw,
      (result.valid ? t.valid : t.invalid) + (result.networkName ? ' · ' + result.networkName : ''),
      result.valid
        ? t.network + ': ' + result.networkName + ' · ' + t.length + ': ' + result.digits + ' ' + t.digits + ' · ' + t.binLabel + ': ' + result.bin
        : reasonText(lang, result),
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-validation-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!bulkResult) return;
    const rows = [['Number', t.bulkVerdict, t.bulkNetwork, t.bulkReason]];
    for (const r of bulkResult.results) {
      rows.push([r.line, r.valid ? t.valid : t.invalid, r.networkName || '', r.valid ? '' : reasonText(lang, r)]);
    }
    const csv = rows.map((row) => row.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv + '\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-validation-bulk-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.singleTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_VISA)} style={btnStyle}>{t.sampleVisa}</button>
        <button type="button" onClick={() => setInput(SAMPLE_MASTERCARD)} style={btnStyle}>{t.sampleMc}</button>
        <button type="button" onClick={() => setInput(SAMPLE_AMEX)} style={btnStyle}>{t.sampleAmex}</button>
        <button type="button" onClick={() => setInput(SAMPLE_DISCOVER)} style={btnStyle}>{t.sampleDiscover}</button>
        <button type="button" onClick={() => setInput(SAMPLE_JCB)} style={btnStyle}>{t.sampleJcb}</button>
        <button type="button" onClick={() => setBulk(SAMPLE_BULK)} style={btnStyle}>{t.sampleBulk}</button>
        <button
          type="button"
          onClick={() => { if (result) { setBulk((b) => (b.trim() ? b.trim() + '\n' : '') + result.cleaned); setInput(''); } }}
          disabled={!result}
          style={btnStyle}
        >
          {t.swap}
        </button>
        <button type="button" onClick={() => { setInput(''); setBulk(''); }} style={btnStyle}>{t.clear}</button>
      </div>

      <label htmlFor="cc-input" style={labelStyle}>{t.singleLabel}</label>
      <input
        id="cc-input"
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={t.singlePlaceholder}
        inputMode="numeric"
        autoComplete="off"
        style={{ ...inputStyle, marginTop: 6 }}
      />
      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '6px 0 0' }}>
        {t.digitsCount.replace('{n}', digitCount)} · {t.charsCount.replace('{n}', input.length)}
      </p>

      {result ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px', color: result.valid ? '#15803d' : '#b91c1c' }}>
            {result.valid ? '✓ ' + t.valid : '✗ ' + t.invalid}
            {result.networkName ? ' · ' + result.networkName : ''}
          </p>
          {!result.valid && (
            <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 8px' }}>{reasonText(lang, result)}</p>
          )}
          {result.valid && (
            <dl style={{ fontSize: '0.95rem', lineHeight: 1.8, margin: '0 0 8px' }}>
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.network}: </dt><dd style={{ display: 'inline', margin: 0 }}>{result.networkName}</dd></div>
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.length}: </dt><dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.digits} {t.digits}</dd></div>
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.securityCode}: </dt><dd style={{ display: 'inline', margin: 0 }}>{result.securityCode.name} ({result.securityCode.length} {t.digits})</dd></div>
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.binLabel}: </dt><dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.bin}</dd></div>
              {result.iin8 && (
                <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.iin8Label}: </dt><dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.iin8}</dd></div>
              )}
              <div><dt style={{ display: 'inline', fontWeight: 600 }}>{t.formattedLabel}: </dt><dd style={{ display: 'inline', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.formatted}</dd></div>
            </dl>
          )}
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px' }}>
            {t.honestNote}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" onClick={copySingle} style={primaryBtnStyle}>{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={downloadSingle} style={btnStyle}>{t.download}</button>
          </div>

          {result.luhn && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.luhnTitle}</h2>
              <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.luhnIntro}</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>{t.luhnPos}</th>
                      <th style={thStyle}>{t.luhnDigit}</th>
                      <th style={thStyle}>{t.luhnDoubled}</th>
                      <th style={thStyle}>{t.luhnContribution}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.luhn.steps.map((s) => (
                      <tr key={s.positionFromRight}>
                        <td style={tdStyle}>{s.positionFromRight}</td>
                        <td style={tdStyle}>{s.digit}</td>
                        <td style={tdStyle}>{s.doubled ? t.luhnYes : t.luhnNo}</td>
                        <td style={tdStyle}>{s.contribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.95rem', marginTop: 12, lineHeight: 1.7 }}>
                {t.luhnSum}: <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.luhn.sum}</strong>
                {' · '}{t.luhnRemainder}: <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.luhn.sum % 10}</strong>
                {' · '}{result.luhn.valid ? t.luhnPass : t.luhnFail}
              </p>
              {!result.valid && result.reason === 'luhn-fail' && result.expectedCheck && (
                <p style={{ fontSize: '0.95rem', marginTop: 4 }}>{t.expectedCheck.replace('{expected}', result.expectedCheck)}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 12 }}>{t.emptySingle}</p>
      )}

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.bulkTitle}</h2>
        <label htmlFor="cc-bulk" style={labelStyle}>{t.bulkLabel}</label>
        <textarea
          id="cc-bulk"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={t.bulkPlaceholder}
          style={{ ...areaStyle, marginTop: 6 }}
        />
        {bulkResult ? (
          <div>
            <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 12 }}>
              {t.bulkCounts.replace('{valid}', bulkResult.valid).replace('{invalid}', bulkResult.invalid).replace('{total}', bulkResult.total)}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t.bulkLine}</th>
                    <th style={thStyle}>{t.bulkNumber}</th>
                    <th style={thStyle}>{t.bulkVerdict}</th>
                    <th style={thStyle}>{t.bulkNetwork}</th>
                    <th style={thStyle}>{t.bulkReason}</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResult.results.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{r.line}</td>
                      <td style={{ ...tdStyle, color: r.valid ? '#15803d' : '#b91c1c', fontWeight: 600 }}>{r.valid ? '✓ ' + t.valid : '✗ ' + t.invalid}</td>
                      <td style={tdStyle}>{r.networkName || ''}</td>
                      <td style={tdStyle}>{r.valid ? '' : reasonText(lang, r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={downloadCsv} style={btnStyle}>{t.downloadCsv}</button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 12 }}>{t.emptyBulk}</p>
        )}
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 24 }}>🔒 {t.privacy}</p>

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
