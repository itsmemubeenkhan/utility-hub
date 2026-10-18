/* Pure text-analysis utilities shared by the Text Tools trio
   (character counter, word counter, case converter) and by the
   registry calc functions in lib/calculations.js. No DOM, no React. */

export function textStats(text) {
  const t = String(text || '');
  const chars = Array.from(t).length; // code points: emoji count as 1
  const charsNoSpaces = Array.from(t.replace(/\s/g, '')).length;
  const trimmed = t.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const sentences = trimmed
    ? trimmed.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean).length
    : 0;
  const lines = t ? t.split('\n').length : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length
    : 0;
  return { chars, charsNoSpaces, words, sentences, lines, paragraphs };
}

export function readingSeconds(words, wpm = 200) {
  return Math.round((words / wpm) * 60);
}

export function formatDuration(totalSeconds, lang = 'en') {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return lang === 'es' ? `${s} s` : `${s} sec`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} min` : `${m} min ${rest} s`;
}

const STOPWORDS = new Set(
  ('the,a,an,and,or,for,to,of,in,on,is,are,was,were,be,by,with,from,at,as,it,its,' +
    'this,that,these,those,how,what,when,where,which,who,whom,whose,can,you,your,' +
    'yours,do,does,did,done,not,no,yes,if,then,than,so,such,into,out,up,down,over,' +
    'under,will,would,should,could,have,has,had,having,been,am,i,me,my,we,our,us,' +
    'they,them,their,theirs,he,him,his,she,her,hers,it,its,we,our,ours,you,your,' +
    'el,la,los,las,un,una,unos,unas,de,del,al,en,que,con,por,para,como,cómo,se,sus,' +
    'son,es,este,esta,estos,estas,ese,esa,esos,esas,pero,mas,más,muy,sin,sobre,' +
    'entre,hasta,desde,donde,dónde,cuando,cuándo,cual,cuál,cuales,cuáles,quien,' +
    'quién,quienes,quiénes,le,les,lo,los,me,mi,mis,tu,tus,su,sus,y,o,u,ni,si,ya,' +
    'tan,tanto,hay,fue,fueron,ser,estar,esto,eso,aquello,aqui,aquí,ahí,allí'
  ).split(',')
);

export function keywordDensity(text, top = 5) {
  const t = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ');
  const words = t.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (!words.length) return [];
  const counts = new Map();
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  const total = words.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, top)
    .map(([word, count]) => ({
      word,
      count,
      pct: ((count / total) * 100).toFixed(1),
    }));
}

/* ---- Case transforms ---- */

export const CASE_MODES = [
  'upper',
  'lower',
  'title',
  'sentence',
  'alternating',
  'inverse',
];

export function convertCase(text, mode) {
  const t = String(text || '');
  switch (mode) {
    case 'upper':
      return t.toUpperCase();
    case 'lower':
      return t.toLowerCase();
    case 'title':
      return t.toLowerCase().replace(/(^|[\s\-_–—/(\["'¿¡])(\p{L})/gu, (m, pre, ch) => pre + ch.toUpperCase());
    case 'sentence': {
      const lowered = t.toLowerCase();
      return lowered.replace(/(^\s*\p{L})|([.!?…]\s*\p{L})/gu, (m) => m.toUpperCase());
    }
    case 'alternating': {
      let upper = false;
      let out = '';
      for (const ch of t) {
        if (/\p{L}/u.test(ch)) {
          out += upper ? ch.toUpperCase() : ch.toLowerCase();
          upper = !upper;
        } else {
          out += ch;
        }
      }
      return out;
    }
    case 'inverse': {
      let out = '';
      for (const ch of t) {
        const up = ch.toUpperCase();
        const lo = ch.toLowerCase();
        out += ch === up && ch !== lo ? lo : ch === lo && ch !== up ? up : ch;
      }
      return out;
    }
    default:
      return t;
  }
}
