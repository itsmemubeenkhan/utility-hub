'use client';
/* Pay Stub Generator - free, no signup, client-side.
   Differentiators vs the thin rankers: overtime at 1.5x with auto FICA
   (6.2% Social Security + 1.45% Medicare), YTD columns, a printable stub,
   and an honest disclaimer that it is for personal records only. */
import { useMemo, useState } from 'react';
import Link from 'next/link';

const STR = {
  en: {
    secDetails: 'Pay details',
    secEarnings: 'Earnings',
    secDeductions: 'Deductions',
    secYtd: 'Year-to-date (optional)',
    employer: 'Employer name',
    employee: 'Employee name',
    periodStart: 'Pay period start',
    periodEnd: 'Pay period end',
    payDate: 'Pay date',
    frequency: 'Pay frequency',
    freqNames: { weekly: 'Weekly', biweekly: 'Biweekly', semimonthly: 'Semi-monthly', monthly: 'Monthly' },
    payType: 'Pay type',
    payTypeNames: { hourly: 'Hourly', salary: 'Salary' },
    rate: 'Hourly rate ($)',
    hours: 'Regular hours',
    otHours: 'Overtime hours',
    otMult: 'Overtime multiplier',
    salary: 'Salary per pay period ($)',
    bonus: 'Bonus ($)',
    commission: 'Commission ($)',
    otherEarn: 'Other earnings ($)',
    fed: 'Federal income tax ($)',
    state: 'State income tax ($)',
    ssAuto: 'Auto-calc Social Security (6.2%)',
    ss: 'Social Security ($)',
    medAuto: 'Auto-calc Medicare (1.45%)',
    med: 'Medicare ($)',
    retirement: 'Retirement / 401(k) ($)',
    health: 'Health insurance ($)',
    otherDed: 'Other deductions ($)',
    ytdGross: 'YTD gross pay ($)',
    ytdDed: 'YTD deductions ($)',
    stubTitle: 'Your pay stub',
    earnings: 'Earnings',
    deductions: 'Deductions',
    rateCol: 'Rate',
    hoursCol: 'Hours',
    current: 'Current',
    ytd: 'YTD',
    regular: 'Regular pay',
    overtime: 'Overtime pay',
    bonusRow: 'Bonus',
    commissionRow: 'Commission',
    otherEarnRow: 'Other earnings',
    grossPay: 'Gross pay',
    fedRow: 'Federal income tax',
    stateRow: 'State income tax',
    ssRow: 'Social Security',
    medRow: 'Medicare',
    retirementRow: 'Retirement',
    healthRow: 'Health insurance',
    otherDedRow: 'Other',
    totalDed: 'Total deductions',
    netPay: 'Net pay (take-home)',
    print: 'Print stub',
    copy: 'Copy summary',
    copied: 'Copied!',
    disclaimerNote: 'For personal records and income estimates only - not a legal payroll document.',
    seeAlso: 'More pay tools',
    siblings: [
      { href: '/tools/salary-paycheck-calculator', label: 'Salary Paycheck Calculator' },
      { href: '/tools/overtime-calculator', label: 'Overtime Pay Calculator' },
    ],
  },
  es: {
    secDetails: 'Datos del pago',
    secEarnings: 'Ingresos',
    secDeductions: 'Deducciones',
    secYtd: 'Acumulado del año (opcional)',
    employer: 'Nombre del empleador',
    employee: 'Nombre del empleado',
    periodStart: 'Inicio del período',
    periodEnd: 'Fin del período',
    payDate: 'Fecha de pago',
    frequency: 'Frecuencia de pago',
    freqNames: { weekly: 'Semanal', biweekly: 'Quincenal', semimonthly: 'Dos veces al mes', monthly: 'Mensual' },
    payType: 'Tipo de pago',
    payTypeNames: { hourly: 'Por hora', salary: 'Salario' },
    rate: 'Tarifa por hora ($)',
    hours: 'Horas regulares',
    otHours: 'Horas extra',
    otMult: 'Multiplicador de horas extra',
    salary: 'Salario por período ($)',
    bonus: 'Bono ($)',
    commission: 'Comisión ($)',
    otherEarn: 'Otros ingresos ($)',
    fed: 'Impuesto federal ($)',
    state: 'Impuesto estatal ($)',
    ssAuto: 'Calcular Seguro Social auto (6.2%)',
    ss: 'Seguro Social ($)',
    medAuto: 'Calcular Medicare auto (1.45%)',
    med: 'Medicare ($)',
    retirement: 'Jubilación / 401(k) ($)',
    health: 'Seguro médico ($)',
    otherDed: 'Otras deducciones ($)',
    ytdGross: 'Ingresos brutos del año ($)',
    ytdDed: 'Deducciones del año ($)',
    stubTitle: 'Tu recibo de pago',
    earnings: 'Ingresos',
    deductions: 'Deducciones',
    rateCol: 'Tarifa',
    hoursCol: 'Horas',
    current: 'Actual',
    ytd: 'Año',
    regular: 'Pago regular',
    overtime: 'Horas extra',
    bonusRow: 'Bono',
    commissionRow: 'Comisión',
    otherEarnRow: 'Otros ingresos',
    grossPay: 'Pago bruto',
    fedRow: 'Impuesto federal',
    stateRow: 'Impuesto estatal',
    ssRow: 'Seguro Social',
    medRow: 'Medicare',
    retirementRow: 'Jubilación',
    healthRow: 'Seguro médico',
    otherDedRow: 'Otros',
    totalDed: 'Total deducciones',
    netPay: 'Pago neto',
    print: 'Imprimir recibo',
    copy: 'Copiar resumen',
    copied: '¡Copiado!',
    disclaimerNote: 'Solo para registros personales y estimaciones - no es un documento legal de nómina.',
    seeAlso: 'Más herramientas de pago',
    siblings: [
      { href: '/es/tools/calculadora-de-salario', label: 'Calculadora de salario' },
      { href: '/es/tools/calculadora-de-horas-extra', label: 'Calculadora de horas extra' },
    ],
  },
};

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function fmt(n, lang) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n);
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function PayStubTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [form, setForm] = useState({
    employer: '', employee: '', periodStart: '', periodEnd: '', payDate: todayISO(),
    frequency: 'biweekly', payType: 'hourly',
    rate: '25', hours: '80', otHours: '0', otMult: '1.5', salary: '2000',
    bonus: '0', commission: '0', otherEarn: '0',
    fed: '0', state: '0', ssAuto: true, ss: '0', medAuto: true, med: '0',
    retirement: '0', health: '0', otherDed: '0',
    ytdGross: '', ytdDed: '',
  });
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const c = useMemo(() => {
    const rate = num(form.rate);
    const hours = num(form.hours);
    const otHours = num(form.otHours);
    const otMult = num(form.otMult) || 1.5;
    const regularPay = form.payType === 'hourly' ? rate * hours : num(form.salary);
    const overtimePay = form.payType === 'hourly' ? rate * otHours * otMult : 0;
    const bonus = num(form.bonus), commission = num(form.commission), otherEarn = num(form.otherEarn);
    const gross = regularPay + overtimePay + bonus + commission + otherEarn;
    const ss = form.ssAuto ? gross * 0.062 : num(form.ss);
    const med = form.medAuto ? gross * 0.0145 : num(form.med);
    const deds = [
      { label: t.fedRow, amt: num(form.fed) },
      { label: t.stateRow, amt: num(form.state) },
      { label: t.ssRow, amt: ss },
      { label: t.medRow, amt: med },
      { label: t.retirementRow, amt: num(form.retirement) },
      { label: t.healthRow, amt: num(form.health) },
      { label: t.otherDedRow, amt: num(form.otherDed) },
    ];
    const totalDed = deds.reduce((s, d) => s + d.amt, 0);
    const net = gross - totalDed;
    return { regularPay, overtimePay, bonus, commission, otherEarn, gross, deds, totalDed, net, rate, hours, otHours };
  }, [form, t]);

  const onPrint = () => window.print();

  const onCopy = async () => {
    const lines = [
      `${t.grossPay}: ${fmt(c.gross, lang)}`,
      `${t.totalDed}: ${fmt(c.totalDed, lang)}`,
      `${t.netPay}: ${fmt(c.net, lang)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, fontSize: '1rem' };
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 };
  const th = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line)', fontSize: '0.82rem', color: 'var(--muted)', textTransform: 'uppercase' };
  const td = { padding: '8px 10px', borderBottom: '1px solid var(--line)', fontSize: '0.95rem' };
  const money = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

  const hasYtd = form.ytdGross !== '' || form.ytdDed !== '';

  return (
    <div>
      <style>{`@media print { body * { visibility: hidden; } .paystub-print, .paystub-print * { visibility: visible; } .paystub-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; } }`}</style>

      <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>{t.secDetails}</h3>
      <div style={grid2}>
        <div className="field"><label>{t.employer}</label><input type="text" value={form.employer} onChange={set('employer')} style={inputStyle} /></div>
        <div className="field"><label>{t.employee}</label><input type="text" value={form.employee} onChange={set('employee')} style={inputStyle} /></div>
        <div className="field"><label>{t.periodStart}</label><input type="date" value={form.periodStart} onChange={set('periodStart')} style={inputStyle} /></div>
        <div className="field"><label>{t.periodEnd}</label><input type="date" value={form.periodEnd} onChange={set('periodEnd')} style={inputStyle} /></div>
        <div className="field"><label>{t.payDate}</label><input type="date" value={form.payDate} onChange={set('payDate')} style={inputStyle} /></div>
        <div className="field"><label>{t.frequency}</label>
          <select value={form.frequency} onChange={set('frequency')} style={inputStyle}>
            {Object.entries(t.freqNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <h3 style={{ fontSize: '1.05rem', margin: '18px 0 12px' }}>{t.secEarnings}</h3>
      <div style={grid2}>
        <div className="field"><label>{t.payType}</label>
          <select value={form.payType} onChange={set('payType')} style={inputStyle}>
            {Object.entries(t.payTypeNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {form.payType === 'hourly' ? (
          <>
            <div className="field"><label>{t.rate}</label><input type="number" min="0" step="0.01" value={form.rate} onChange={set('rate')} style={inputStyle} /></div>
            <div className="field"><label>{t.hours}</label><input type="number" min="0" step="0.5" value={form.hours} onChange={set('hours')} style={inputStyle} /></div>
            <div className="field"><label>{t.otHours}</label><input type="number" min="0" step="0.5" value={form.otHours} onChange={set('otHours')} style={inputStyle} /></div>
            <div className="field"><label>{t.otMult}</label><input type="number" min="1" step="0.1" value={form.otMult} onChange={set('otMult')} style={inputStyle} /></div>
          </>
        ) : (
          <div className="field"><label>{t.salary}</label><input type="number" min="0" step="0.01" value={form.salary} onChange={set('salary')} style={inputStyle} /></div>
        )}
        <div className="field"><label>{t.bonus}</label><input type="number" min="0" step="0.01" value={form.bonus} onChange={set('bonus')} style={inputStyle} /></div>
        <div className="field"><label>{t.commission}</label><input type="number" min="0" step="0.01" value={form.commission} onChange={set('commission')} style={inputStyle} /></div>
        <div className="field"><label>{t.otherEarn}</label><input type="number" min="0" step="0.01" value={form.otherEarn} onChange={set('otherEarn')} style={inputStyle} /></div>
      </div>

      <h3 style={{ fontSize: '1.05rem', margin: '18px 0 12px' }}>{t.secDeductions}</h3>
      <div style={grid2}>
        <div className="field"><label>{t.fed}</label><input type="number" min="0" step="0.01" value={form.fed} onChange={set('fed')} style={inputStyle} /></div>
        <div className="field"><label>{t.state}</label><input type="number" min="0" step="0.01" value={form.state} onChange={set('state')} style={inputStyle} /></div>
        <div className="field"><label>{t.ss}</label><input type="number" min="0" step="0.01" value={form.ssAuto ? (c.gross * 0.062).toFixed(2) : form.ss} onChange={set('ss')} disabled={form.ssAuto} style={{ ...inputStyle, opacity: form.ssAuto ? 0.65 : 1 }} />
          <div className="hint"><label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 400, margin: 0 }}><input type="checkbox" checked={form.ssAuto} onChange={set('ssAuto')} /> {t.ssAuto}</label></div>
        </div>
        <div className="field"><label>{t.med}</label><input type="number" min="0" step="0.01" value={form.medAuto ? (c.gross * 0.0145).toFixed(2) : form.med} onChange={set('med')} disabled={form.medAuto} style={{ ...inputStyle, opacity: form.medAuto ? 0.65 : 1 }} />
          <div className="hint"><label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 400, margin: 0 }}><input type="checkbox" checked={form.medAuto} onChange={set('medAuto')} /> {t.medAuto}</label></div>
        </div>
        <div className="field"><label>{t.retirement}</label><input type="number" min="0" step="0.01" value={form.retirement} onChange={set('retirement')} style={inputStyle} /></div>
        <div className="field"><label>{t.health}</label><input type="number" min="0" step="0.01" value={form.health} onChange={set('health')} style={inputStyle} /></div>
        <div className="field"><label>{t.otherDed}</label><input type="number" min="0" step="0.01" value={form.otherDed} onChange={set('otherDed')} style={inputStyle} /></div>
      </div>

      <h3 style={{ fontSize: '1.05rem', margin: '18px 0 12px' }}>{t.secYtd}</h3>
      <div style={grid2}>
        <div className="field"><label>{t.ytdGross}</label><input type="number" min="0" step="0.01" value={form.ytdGross} onChange={set('ytdGross')} style={inputStyle} /></div>
        <div className="field"><label>{t.ytdDed}</label><input type="number" min="0" step="0.01" value={form.ytdDed} onChange={set('ytdDed')} style={inputStyle} /></div>
      </div>

      <div className="card paystub-print" style={{ marginTop: 26, border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.stubTitle}</div>
            {form.employer && <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{form.employer}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--muted)' }}>
            {form.employee && <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>{form.employee}</div>}
            {(form.periodStart || form.periodEnd) && <div>{form.periodStart} - {form.periodEnd}</div>}
            {form.payDate && <div>{t.payDate}: {form.payDate}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.earnings}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={th}></th>
                {form.payType === 'hourly' && <th style={{ ...th, textAlign: 'right' }}>{t.rateCol}</th>}
                {form.payType === 'hourly' && <th style={{ ...th, textAlign: 'right' }}>{t.hoursCol}</th>}
                <th style={{ ...th, textAlign: 'right' }}>{t.current}</th>
                {hasYtd && <th style={{ ...th, textAlign: 'right' }}>{t.ytd}</th>}
              </tr></thead>
              <tbody>
                <tr><td style={td}>{t.regular}</td>
                  {form.payType === 'hourly' && <td style={money}>{fmt(c.rate, lang)}</td>}
                  {form.payType === 'hourly' && <td style={money}>{c.hours}</td>}
                  <td style={money}>{fmt(c.regularPay, lang)}</td>
                  {hasYtd && <td style={money}>{form.ytdGross !== '' ? fmt(num(form.ytdGross) + c.regularPay, lang) : '-'}</td>}</tr>
                {form.payType === 'hourly' && c.overtimePay > 0 && (
                  <tr><td style={td}>{t.overtime}</td><td style={money}>{fmt(c.rate * (num(form.otMult) || 1.5), lang)}</td><td style={money}>{c.otHours}</td><td style={money}>{fmt(c.overtimePay, lang)}</td>{hasYtd && <td style={money}>-</td>}</tr>
                )}
                {c.bonus > 0 && <tr><td style={td}>{t.bonusRow}</td>{form.payType === 'hourly' && <><td style={money}>-</td><td style={money}>-</td></>}<td style={money}>{fmt(c.bonus, lang)}</td>{hasYtd && <td style={money}>-</td>}</tr>}
                {c.commission > 0 && <tr><td style={td}>{t.commissionRow}</td>{form.payType === 'hourly' && <><td style={money}>-</td><td style={money}>-</td></>}<td style={money}>{fmt(c.commission, lang)}</td>{hasYtd && <td style={money}>-</td>}</tr>}
                {c.otherEarn > 0 && <tr><td style={td}>{t.otherEarnRow}</td>{form.payType === 'hourly' && <><td style={money}>-</td><td style={money}>-</td></>}<td style={money}>{fmt(c.otherEarn, lang)}</td>{hasYtd && <td style={money}>-</td>}</tr>}
                <tr><td style={{ ...td, fontWeight: 700, borderBottom: 0 }}>{t.grossPay}</td>{form.payType === 'hourly' && <><td style={{ ...td, borderBottom: 0 }}></td><td style={{ ...td, borderBottom: 0 }}></td></>}<td style={{ ...money, fontWeight: 700, borderBottom: 0 }}>{fmt(c.gross, lang)}</td>{hasYtd && <td style={{ ...money, fontWeight: 700, borderBottom: 0 }}>{form.ytdGross !== '' ? fmt(num(form.ytdGross) + c.gross, lang) : '-'}</td>}</tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.deductions}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}></th><th style={{ ...th, textAlign: 'right' }}>{t.current}</th>{hasYtd && <th style={{ ...th, textAlign: 'right' }}>{t.ytd}</th>}</tr></thead>
              <tbody>
                {c.deds.map((d) => (
                  <tr key={d.label}><td style={td}>{d.label}</td><td style={money}>{fmt(d.amt, lang)}</td>{hasYtd && <td style={money}>-</td>}</tr>
                ))}
                <tr><td style={{ ...td, fontWeight: 700, borderBottom: 0 }}>{t.totalDed}</td><td style={{ ...money, fontWeight: 700, borderBottom: 0 }}>{fmt(c.totalDed, lang)}</td>{hasYtd && <td style={{ ...money, fontWeight: 700, borderBottom: 0 }}>{form.ytdDed !== '' ? fmt(num(form.ytdDed) + c.totalDed, lang) : '-'}</td>}</tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 12, background: 'var(--sky, #e0f2fe)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{t.netPay}</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>{fmt(c.net, lang)}</span>
        </div>
        <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>{t.disclaimerNote}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={onPrint}>{t.print}</button>
        <button type="button" className="btn btn-ghost-light" onClick={onCopy}>{copied ? t.copied : t.copy}</button>
      </div>

      <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.seeAlso}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {t.siblings.map((s) => (
            <Link key={s.href} href={s.href} className="btn btn-ghost-light" style={{ textDecoration: 'none' }}>{s.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
