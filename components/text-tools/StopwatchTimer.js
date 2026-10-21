'use client';
/* Stopwatch & Timer - three tabbed time tools: stopwatch with lap times,
   countdown timer with presets + end beep, and a Pomodoro focus timer.
   Everything is client-side; timing anchors on Date.now() so display
   stays accurate between ticks. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const STR = {
  en: {
    tabs: { stopwatch: 'Stopwatch', countdown: 'Countdown', pomodoro: 'Pomodoro' },
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    lap: 'Lap',
    skip: 'Skip phase',
    // stopwatch
    swHint: 'Centisecond precision. Lap records both the split and the running total.',
    lapCol: 'Lap',
    splitCol: 'Split',
    totalCol: 'Total',
    noLaps: 'Press Lap to record split times.',
    fastest: 'fastest',
    slowest: 'slowest',
    // countdown
    cdHours: 'Hours',
    cdMinutes: 'Minutes',
    cdSeconds: 'Seconds',
    cdSet: 'Set timer',
    presets: 'Quick presets',
    timesUp: "Time's up!",
    cdHint: 'Pick a preset or set hours, minutes and seconds. The timer beeps when it reaches zero.',
    // pomodoro
    pomoFocus: 'Focus',
    pomoShort: 'Short break',
    pomoLong: 'Long break',
    pomoFocusMin: 'Focus length (min)',
    pomoShortMin: 'Short break (min)',
    pomoLongMin: 'Long break (min)',
    pomoRounds: 'Focus sessions before a long break',
    session: 'Session',
    completed: 'completed',
    pomoHint: 'The classic 25/5 technique: focus hard, rest briefly, and take a long break every 4 sessions. Adjust every number to taste.',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit fullscreen',
    moreTools: 'More free tools',
    browseAll: 'Browse all free tools',
  },
  es: {
    tabs: { stopwatch: 'Cronómetro', countdown: 'Cuenta atrás', pomodoro: 'Pomodoro' },
    start: 'Iniciar',
    pause: 'Pausar',
    resume: 'Continuar',
    reset: 'Reiniciar',
    lap: 'Vuelta',
    skip: 'Saltar fase',
    swHint: 'Precisión de centésimas. Cada vuelta registra el parcial y el total acumulado.',
    lapCol: 'Vuelta',
    splitCol: 'Parcial',
    totalCol: 'Total',
    noLaps: 'Pulsa Vuelta para registrar tiempos parciales.',
    fastest: 'más rápida',
    slowest: 'más lenta',
    cdHours: 'Horas',
    cdMinutes: 'Minutos',
    cdSeconds: 'Segundos',
    cdSet: 'Fijar temporizador',
    presets: 'Ajustes rápidos',
    timesUp: '¡Tiempo cumplido!',
    cdHint: 'Elige un ajuste rápido o fija horas, minutos y segundos. El temporizador suena al llegar a cero.',
    pomoFocus: 'Enfoque',
    pomoShort: 'Descanso corto',
    pomoLong: 'Descanso largo',
    pomoFocusMin: 'Duración de enfoque (min)',
    pomoShortMin: 'Descanso corto (min)',
    pomoLongMin: 'Descanso largo (min)',
    pomoRounds: 'Sesiones de enfoque antes del descanso largo',
    session: 'Sesión',
    completed: 'completadas',
    pomoHint: 'La técnica clásica 25/5: concéntrate a fondo, descansa brevemente y toma un descanso largo cada 4 sesiones. Ajusta cada número a tu gusto.',
    fullscreen: 'Pantalla completa',
    fullscreenExit: 'Salir de pantalla completa',
    moreTools: 'Más herramientas gratis',
    browseAll: 'Ver todas las herramientas gratis',
  },
};

function pad(n, l = 2) {
  return String(n).padStart(l, '0');
}

/* Stopwatch display: MM:SS.cs, or H:MM:SS.cs past one hour. */
function fmtStopwatch(ms) {
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  return h > 0
    ? h + ':' + pad(m) + ':' + pad(s) + '.' + pad(cs)
    : pad(m) + ':' + pad(s) + '.' + pad(cs);
}

/* Countdown display: MM:SS, or H:MM:SS past one hour. */
function fmtCountdown(ms) {
  const totalS = Math.max(0, Math.ceil(ms / 1000));
  const s = totalS % 60;
  const m = Math.floor(totalS / 60) % 60;
  const h = Math.floor(totalS / 3600);
  return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : pad(m) + ':' + pad(s);
}

function beep(times = 3) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      const t0 = now + i * 0.28;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.25);
    }
    setTimeout(() => ctx.close(), times * 300 + 200);
  } catch {
    /* audio unavailable - visual finish state still shows */
  }
}

const PRESETS = [1, 5, 10, 15, 25, 30, 45, 60];

const displayBox = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 'clamp(2.6rem, 9vw, 4.5rem)',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textAlign: 'center',
  background: '#0f172a',
  color: '#f8fafc',
  borderRadius: 16,
  padding: '28px 16px',
  margin: '0 0 16px',
  fontVariantNumeric: 'tabular-nums',
};

export default function StopwatchTimer({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [tab, setTab] = useState('stopwatch');
  const wrapRef = useRef(null);
  const [isFs, setIsFs] = useState(false);

  /* ---------- stopwatch ---------- */
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState([]);
  const swAnchor = useRef(0);

  useEffect(() => {
    if (!swRunning) return;
    const id = setInterval(() => setSwElapsed(Date.now() - swAnchor.current), 90);
    return () => clearInterval(id);
  }, [swRunning]);

  const swStart = () => {
    swAnchor.current = Date.now() - swElapsed;
    setSwRunning(true);
  };
  const swPause = () => {
    setSwElapsed(Date.now() - swAnchor.current);
    setSwRunning(false);
  };
  const swReset = () => {
    setSwRunning(false);
    setSwElapsed(0);
    setSwLaps([]);
  };
  const swLap = () => {
    const total = swRunning ? Date.now() - swAnchor.current : swElapsed;
    const prevTotal = swLaps.length ? swLaps[swLaps.length - 1].total : 0;
    setSwLaps((l) => [...l, { n: l.length + 1, split: total - prevTotal, total }]);
  };
  const lapExtremes = (() => {
    if (swLaps.length < 2) return {};
    let f = 0, s = 0;
    swLaps.forEach((l, i) => {
      if (l.split < swLaps[f].split) f = i;
      if (l.split > swLaps[s].split) s = i;
    });
    return { f, s };
  })();

  /* ---------- countdown ---------- */
  const [cdH, setCdH] = useState(0);
  const [cdM, setCdM] = useState(5);
  const [cdS, setCdS] = useState(0);
  const [cdTotal, setCdTotal] = useState(0);
  const [cdRemain, setCdRemain] = useState(0);
  const [cdRunning, setCdRunning] = useState(false);
  const [cdDone, setCdDone] = useState(false);
  const cdEnd = useRef(0);

  useEffect(() => {
    if (!cdRunning) return;
    const id = setInterval(() => {
      const r = cdEnd.current - Date.now();
      if (r <= 0) {
        setCdRemain(0);
        setCdRunning(false);
        setCdDone(true);
        beep(3);
        clearInterval(id);
      } else {
        setCdRemain(r);
      }
    }, 200);
    return () => clearInterval(id);
  }, [cdRunning]);

  const cdArm = (ms) => {
    if (ms <= 0) return;
    setCdTotal(ms);
    setCdRemain(ms);
    setCdDone(false);
    setCdRunning(false);
  };
  const cdStart = () => {
    if (cdRemain <= 0) return;
    cdEnd.current = Date.now() + cdRemain;
    setCdRunning(true);
  };
  const cdPause = () => {
    setCdRemain(Math.max(0, cdEnd.current - Date.now()));
    setCdRunning(false);
  };
  const cdReset = () => {
    setCdRunning(false);
    setCdRemain(cdTotal);
    setCdDone(false);
  };
  const cdProgress = cdTotal > 0 ? cdRemain / cdTotal : 0;

  /* ---------- pomodoro ---------- */
  const [pFocus, setPFocus] = useState(25);
  const [pShort, setPShort] = useState(5);
  const [pLong, setPLong] = useState(15);
  const [pRounds, setPRounds] = useState(4);
  const [pPhase, setPPhase] = useState('focus');
  const [pRemain, setPRemain] = useState(25 * 60 * 1000);
  const [pRunning, setPRunning] = useState(false);
  const [pDone, setPDone] = useState(0); // completed focus sessions
  const pEnd = useRef(0);
  const pState = useRef({ pPhase, pDone, pFocus, pShort, pLong, pRounds });
  pState.current = { pPhase, pDone, pFocus, pShort, pLong, pRounds };

  const pPhaseMs = (phase) =>
    (phase === 'focus' ? pFocus : phase === 'short' ? pShort : pLong) * 60 * 1000;

  useEffect(() => {
    if (!pRunning) return;
    const id = setInterval(() => {
      const r = pEnd.current - Date.now();
      if (r > 0) {
        setPRemain(r);
        return;
      }
      // phase finished: advance
      const st = pState.current;
      beep(3);
      let next, nextDone = st.pDone;
      if (st.pPhase === 'focus') {
        nextDone = st.pDone + 1;
        next = nextDone % st.pRounds === 0 ? 'long' : 'short';
      } else {
        next = 'focus';
      }
      const ms =
        (next === 'focus' ? st.pFocus : next === 'short' ? st.pShort : st.pLong) * 60 * 1000;
      pEnd.current = Date.now() + ms;
      setPPhase(next);
      setPDone(nextDone);
      setPRemain(ms);
    }, 250);
    return () => clearInterval(id);
  }, [pRunning]);

  const pStart = () => {
    pEnd.current = Date.now() + pRemain;
    setPRunning(true);
  };
  const pPause = () => {
    setPRemain(Math.max(0, pEnd.current - Date.now()));
    setPRunning(false);
  };
  const pReset = () => {
    setPRunning(false);
    setPPhase('focus');
    setPDone(0);
    setPRemain(pFocus * 60 * 1000);
  };
  const pSkip = () => {
    const st = pState.current;
    let next, nextDone = st.pDone;
    if (st.pPhase === 'focus') {
      nextDone = st.pDone + 1;
      next = nextDone % st.pRounds === 0 ? 'long' : 'short';
    } else {
      next = 'focus';
    }
    const ms =
      (next === 'focus' ? st.pFocus : next === 'short' ? st.pShort : st.pLong) * 60 * 1000;
    if (pRunning) pEnd.current = Date.now() + ms;
    setPPhase(next);
    setPDone(nextDone);
    setPRemain(ms);
  };
  const pomoPhaseLabel =
    pPhase === 'focus' ? t.pomoFocus : pPhase === 'short' ? t.pomoShort : t.pomoLong;

  /* ---------- fullscreen ---------- */
  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) {
        await wrapRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* fullscreen unsupported - ignore */
    }
  };
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const btn = { fontSize: '0.95rem' };
  const numInput = {
    width: '100%', padding: '8px 10px', border: '1px solid var(--line)',
    borderRadius: 10, fontSize: '1rem', fontFamily: 'inherit',
  };

  return (
    <div>
      <div ref={wrapRef} style={isFs ? { background: '#fff', padding: 24, height: '100%' } : undefined}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 16px' }} role="tablist" aria-label="Timer modes">
          {['stopwatch', 'countdown', 'pomodoro'].map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={'btn ' + (tab === k ? 'btn-primary' : 'btn-secondary')}
              onClick={() => setTab(k)}
              style={btn}
            >
              {t.tabs[k]}
            </button>
          ))}
          <button type="button" className="btn btn-ghost-light" onClick={toggleFs} style={{ ...btn, marginLeft: 'auto' }}>
            {isFs ? t.fullscreenExit : t.fullscreen}
          </button>
        </div>

        {tab === 'stopwatch' && (
          <div role="tabpanel">
            <div style={displayBox} aria-live="off">{fmtStopwatch(swElapsed)}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!swRunning ? (
                <button type="button" className="btn btn-primary" onClick={swStart} style={btn}>{swElapsed > 0 ? t.resume : t.start}</button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={swPause} style={btn}>{t.pause}</button>
              )}
              <button type="button" className="btn btn-secondary" onClick={swLap} disabled={!swRunning && swElapsed === 0} style={btn}>{t.lap}</button>
              <button type="button" className="btn btn-ghost-light" onClick={swReset} style={btn}>{t.reset}</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', marginTop: 12 }}>{t.swHint}</p>
            {swLaps.length > 0 && (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '6px 8px' }}>{t.lapCol}</th>
                      <th style={{ padding: '6px 8px' }}>{t.splitCol}</th>
                      <th style={{ padding: '6px 8px' }}>{t.totalCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...swLaps].reverse().map((l) => (
                      <tr key={l.n} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                          {l.n}
                          {lapExtremes.f === l.n - 1 && <span style={{ color: '#16a34a', fontWeight: 400, fontSize: '0.8rem' }}> · {t.fastest}</span>}
                          {lapExtremes.s === l.n - 1 && <span style={{ color: '#dc2626', fontWeight: 400, fontSize: '0.8rem' }}> · {t.slowest}</span>}
                        </td>
                        <td style={{ padding: '6px 8px', fontFamily: 'ui-monospace, monospace' }}>{fmtStopwatch(l.split)}</td>
                        <td style={{ padding: '6px 8px', fontFamily: 'ui-monospace, monospace' }}>{fmtStopwatch(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {swLaps.length === 0 && (
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>{t.noLaps}</p>
            )}
          </div>
        )}

        {tab === 'countdown' && (
          <div role="tabpanel">
            <div style={{ ...displayBox, background: cdDone ? '#166534' : '#0f172a' }} aria-live="off">
              {cdDone ? t.timesUp : fmtCountdown(cdRemain)}
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', margin: '0 0 16px' }}>
              <div style={{ height: '100%', width: (cdProgress * 100).toFixed(1) + '%', background: '#0ea5e9', transition: 'width 0.25s linear' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!cdRunning ? (
                <button type="button" className="btn btn-primary" onClick={cdStart} disabled={cdRemain <= 0} style={btn}>{cdTotal > 0 && cdRemain < cdTotal ? t.resume : t.start}</button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={cdPause} style={btn}>{t.pause}</button>
              )}
              <button type="button" className="btn btn-ghost-light" onClick={cdReset} disabled={cdTotal === 0} style={btn}>{t.reset}</button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <div className="field" style={{ flex: '1 1 90px' }}>
                <label htmlFor="cd-h">{t.cdHours}</label>
                <input id="cd-h" type="number" min={0} max={23} value={cdH} onChange={(e) => setCdH(Math.max(0, Math.min(23, Number(e.target.value) || 0)))} style={numInput} />
              </div>
              <div className="field" style={{ flex: '1 1 90px' }}>
                <label htmlFor="cd-m">{t.cdMinutes}</label>
                <input id="cd-m" type="number" min={0} max={59} value={cdM} onChange={(e) => setCdM(Math.max(0, Math.min(59, Number(e.target.value) || 0)))} style={numInput} />
              </div>
              <div className="field" style={{ flex: '1 1 90px' }}>
                <label htmlFor="cd-s">{t.cdSeconds}</label>
                <input id="cd-s" type="number" min={0} max={59} value={cdS} onChange={(e) => setCdS(Math.max(0, Math.min(59, Number(e.target.value) || 0)))} style={numInput} />
              </div>
              <div className="field" style={{ alignSelf: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => cdArm((cdH * 3600 + cdM * 60 + cdS) * 1000)} style={btn}>{t.cdSet}</button>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 8px' }}>{t.presets}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => cdArm(p * 60 * 1000)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {p >= 60 ? p / 60 + 'h' : p + 'm'}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', marginTop: 12 }}>{t.cdHint}</p>
          </div>
        )}

        {tab === 'pomodoro' && (
          <div role="tabpanel">
            <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 4px' }}>
              {pomoPhaseLabel} · {t.session} {pPhase === 'focus' ? ((pDone % pRounds) + 1) : ''}/{pRounds}
            </p>
            <div style={{ ...displayBox, background: pPhase === 'focus' ? '#0f172a' : '#065f46' }} aria-live="off">
              {fmtCountdown(pRemain)}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '0 0 14px' }} aria-label={t.completed}>
              {Array.from({ length: pRounds }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: i < pDone % pRounds || (pDone > 0 && pDone % pRounds === 0 && i < pRounds && pPhase !== 'focus')
                      ? '#16a34a' : i === pDone % pRounds && pPhase === 'focus' ? '#f59e0b' : '#e2e8f0',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!pRunning ? (
                <button type="button" className="btn btn-primary" onClick={pStart} style={btn}>{t.start}</button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={pPause} style={btn}>{t.pause}</button>
              )}
              <button type="button" className="btn btn-secondary" onClick={pSkip} style={btn}>{t.skip}</button>
              <button type="button" className="btn btn-ghost-light" onClick={pReset} style={btn}>{t.reset}</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', margin: '12px 0' }}>
              {pDone} {t.session.toLowerCase()} {t.completed}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: '1 1 110px' }}>
                <label htmlFor="p-f">{t.pomoFocusMin}</label>
                <input id="p-f" type="number" min={1} max={120} value={pFocus} disabled={pRunning} onChange={(e) => { const v = Math.max(1, Math.min(120, Number(e.target.value) || 25)); setPFocus(v); if (pPhase === 'focus' && !pRunning && pDone === 0) setPRemain(v * 60 * 1000); }} style={numInput} />
              </div>
              <div className="field" style={{ flex: '1 1 110px' }}>
                <label htmlFor="p-s">{t.pomoShortMin}</label>
                <input id="p-s" type="number" min={1} max={60} value={pShort} disabled={pRunning} onChange={(e) => setPShort(Math.max(1, Math.min(60, Number(e.target.value) || 5)))} style={numInput} />
              </div>
              <div className="field" style={{ flex: '1 1 110px' }}>
                <label htmlFor="p-l">{t.pomoLongMin}</label>
                <input id="p-l" type="number" min={1} max={90} value={pLong} disabled={pRunning} onChange={(e) => setPLong(Math.max(1, Math.min(90, Number(e.target.value) || 15)))} style={numInput} />
              </div>
              <div className="field" style={{ flex: '1 1 110px' }}>
                <label htmlFor="p-r">{t.pomoRounds}</label>
                <input id="p-r" type="number" min={2} max={8} value={pRounds} disabled={pRunning} onChange={(e) => setPRounds(Math.max(2, Math.min(8, Number(e.target.value) || 4)))} style={numInput} />
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', marginTop: 12 }}>{t.pomoHint}</p>
          </div>
        )}
      </div>

      <div className="note-box" style={{ marginTop: 18 }}>
        <strong>{t.moreTools}:</strong>{' '}
        <Link href={lang === 'es' ? '/es/tools' : '/tools'}>{t.browseAll}</Link>
      </div>
    </div>
  );
}
