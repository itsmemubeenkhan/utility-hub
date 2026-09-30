'use client';
/* Interactive calculator: form from the tool's input schema, live results, canvas charts. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { CALCULATORS } from '@/lib/tool-calculations';
import { drawDonut, drawLine, drawStacked } from '@/lib/charts';

function Field({ def, value, onChange }) {
  if (def.type === 'checkbox') {
    return (
      <div className="field">
        <label className="check-row">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          {def.label}
        </label>
      </div>
    );
  }
  if (def.type === 'select') {
    return (
      <div className="field">
        <label>{def.label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="field">
      <label>{def.label}</label>
      <input
        type="number"
        value={value}
        min={def.min}
        max={def.max}
        step={def.step || 'any'}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
      {def.hint && <div className="hint">{def.hint}</div>}
    </div>
  );
}

export default function ToolRunner({ slug, inputs }) {
  const calculate = CALCULATORS[slug];
  const initial = {};
  inputs.forEach((d) => { initial[d.key] = d.default; });
  const [values, setValues] = useState(initial);

  const result = useMemo(() => {
    try {
      return calculate(values);
    } catch (e) {
      return null;
    }
  }, [values, calculate]);

  const donutRef = useRef(null);
  const lineRef = useRef(null);
  const stackedRef = useRef(null);

  useEffect(() => {
    if (!result) return;
    if (result.donut && donutRef.current) drawDonut(donutRef.current, result.donut);
    if (result.line && lineRef.current) drawLine(lineRef.current, result.line);
    if (result.stacked && stackedRef.current) drawStacked(stackedRef.current, result.stacked);
  }, [result]);

  const setVal = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="calc-layout">
      <div className="card" aria-label="Calculator inputs">
        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>Your numbers</h2>
        {inputs.map((d) => (
          <Field key={d.key} def={d} value={values[d.key]} onChange={(v) => setVal(d.key, v)} />
        ))}
      </div>
      <div>
        {!result && <div className="warn-box">Could not compute results with these inputs.</div>}
        {result && result.warn && <div className="warn-box">Heads up: check the payoff note below; this payment may never clear the balance.</div>}
        {result && (
          <div className="results" aria-live="polite">
            {result.outputs.map((o, i) => (
              <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
                <div className="lbl">{o.label}</div>
                <div className="val">{o.value}</div>
              </div>
            ))}
          </div>
        )}
        {result && result.note && <div className="note-box">{result.note}</div>}
        {result && result.donut && (
          <div className="chart-wrap">
            <h3>Breakdown</h3>
            <canvas ref={donutRef} role="img" aria-label="Donut chart of result breakdown" />
          </div>
        )}
        {result && result.line && (
          <div className="chart-wrap">
            <h3>{result.line.title}</h3>
            <canvas ref={lineRef} role="img" aria-label={result.line.title} />
          </div>
        )}
        {result && result.stacked && (
          <div className="chart-wrap">
            <h3>{result.stacked.title}</h3>
            <canvas ref={stackedRef} role="img" aria-label={result.stacked.title} />
          </div>
        )}
      </div>
    </div>
  );
}
