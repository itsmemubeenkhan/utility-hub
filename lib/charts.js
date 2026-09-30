'use client';
/* Canvas chart helpers — no libraries. Ported from the verified FinanceScout build. */

function setupCanvas(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600;
  const h = canvas.clientHeight || 320;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export function drawDonut(canvas, spec) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx } = s;
  const vals = spec.values.filter((x) => x > 0);
  const labs = spec.labels.filter((_, i) => spec.values[i] > 0);
  const cols = spec.colors;
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  const cx = s.w / 2, cy = s.h / 2 - 10;
  const R = Math.min(s.w, s.h) / 2 - 40, r = R * 0.55;
  let a0 = -Math.PI / 2;
  vals.forEach((val, i) => {
    const a1 = a0 + (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, a1);
    ctx.arc(cx, cy, r, a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = cols[i % cols.length];
    ctx.fill();
    a0 = a1;
  });
  ctx.font = '13px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  const ly = cy + R + 18;
  labs.forEach((lab, i) => {
    const pct = Math.round((vals[i] / total) * 100);
    const txt = lab + ' ' + pct + '%';
    const x = cx - (labs.length * 130) / 2 + i * 130;
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(x, ly - 6, 12, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(txt, x + 18, ly);
  });
}

export function drawLine(canvas, spec) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx } = s;
  const vals = spec.values, labs = spec.labels;
  const pad = { l: 70, r: 16, t: 20, b: 40 };
  const W = s.w - pad.l - pad.r, H = s.h - pad.t - pad.b;
  const mx = niceMax(Math.max(...vals));
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  for (let g = 0; g <= 4; g++) {
    const y = pad.t + H - (H * g) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + W, y);
    ctx.stroke();
    const v = (mx * g) / 4;
    ctx.fillText(v >= 1000 ? '$' + Math.round(v / 1000) + 'k' : '$' + Math.round(v), 8, y + 4);
  }
  const xy = (i) => [
    pad.l + (W * i) / Math.max(1, vals.length - 1),
    pad.t + H - (H * vals[i]) / mx,
  ];
  ctx.beginPath();
  vals.forEach((_, i) => {
    const p = xy(i);
    if (i) ctx.lineTo(p[0], p[1]);
    else ctx.moveTo(p[0], p[1]);
  });
  ctx.lineTo(xy(vals.length - 1)[0], pad.t + H);
  ctx.lineTo(xy(0)[0], pad.t + H);
  ctx.closePath();
  ctx.fillStyle = 'rgba(56,189,248,.18)';
  ctx.fill();
  ctx.beginPath();
  vals.forEach((_, i) => {
    const p = xy(i);
    if (i) ctx.lineTo(p[0], p[1]);
    else ctx.moveTo(p[0], p[1]);
  });
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#475569';
  const step = Math.ceil(labs.length / 8);
  labs.forEach((lab, i) => {
    if (i % step === 0 || i === labs.length - 1) ctx.fillText(lab, xy(i)[0] - 12, pad.t + H + 16);
  });
}

export function drawStacked(canvas, spec) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx } = s;
  const labs = spec.labels, series = spec.series;
  const pad = { l: 70, r: 16, t: 20, b: 40 };
  const W = s.w - pad.l - pad.r, H = s.h - pad.t - pad.b;
  let allMax = 0;
  series.forEach((sr) => sr.values.forEach((val) => { if (val > allMax) allMax = val; }));
  const mx = niceMax(allMax);
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  for (let g = 0; g <= 4; g++) {
    const y = pad.t + H - (H * g) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + W, y);
    ctx.stroke();
    const v = (mx * g) / 4;
    ctx.fillText(v >= 1000 ? '$' + Math.round(v / 1000) + 'k' : '$' + Math.round(v), 8, y + 4);
  }
  const order = series.slice().reverse();
  order.forEach((sr) => {
    ctx.beginPath();
    sr.values.forEach((val, i) => {
      const x = pad.l + (W * i) / Math.max(1, sr.values.length - 1);
      const y = pad.t + H - (H * val) / mx;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.strokeStyle = sr.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
  ctx.font = '12px system-ui, sans-serif';
  series.forEach((sr, i) => {
    const x = pad.l + i * 190;
    ctx.fillStyle = sr.color;
    ctx.fillRect(x, s.h - 18, 12, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(sr.name, x + 18, s.h - 11);
  });
}
