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

/* ---- Lorem ipsum generator ----
   Themed placeholder-text word banks + paragraph assembly.
   Pure functions: no DOM, no React. */

export const LOREM_THEME_KEYS = ['classic', 'startup', 'coffee', 'pirate'];

const LOREM_WORDS = {
  classic:
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium totam rem aperiam eaque ab illo inventore veritatis quasi architecto beatae vitae dicta explicabo nemo enim ipsam voluptatem quia voluptas aspernatur odit aut fugit consequuntur magni dolores eos ratione sequi nesciunt neque porro quisquam dolorem numquam eius modi tempora incidunt magnam quaerat'.split(
      ' '
    ),
  startup:
    'disrupt synergy pivot scale leverage ecosystem blockchain saas platform growth hacking mvp unicorn series funding runway burn rate kpi churn retention onboarding funnel conversion agile sprint scrum backlog roadmap feature deploy iterate test analytics cohort dashboard api sdk webhook cloud native microservice devops container serverless edge latency algorithm machine learning neural network model dataset training token prompt agent workflow automation integration marketplace network effects viral loop freemium upsell product market fit traction cohort cohort'.split(
      ' '
    ),
  coffee:
    'espresso latte cappuccino macchiato mocha americano cortado flat white ristretto lungo barista roast brew pour over french press moka pot chemex aeropress cold brew nitro arabica robusta single origin blend light medium dark roast crema grind coarse fine bloom extraction tamp portafilter steam wand milk froth microfoam latte art rosetta tulip heart notes chocolate caramel citrus floral nutty earthy bright balanced body acidity sweetness finish cupping aroma fragrance'.split(
      ' '
    ),
  pirate:
    'ahoy matey treasure ship captain crew deck mast sail rigging anchor harbor port starboard bow stern keel hull plank crow nest lookout spyglass map compass chart course voyage adventure island cove lagoon reef storm tempest wave tide wind gale thunder lightning cannon pistol cutlass dagger hook peg leg eye patch parrot rum grog doubloon gold silver jewel chest booty plunder pillage raid board mutiny scurvy bilge keelhaul davy jones locker kraken mermaid siren skull crossbones jolly roger flag hoist avast arr belay shiver timbers'.split(
      ' '
    ),
};

const LOREM_OPENER =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const LOREM_LENGTH_WORDS = {
  short: [4, 8],
  medium: [8, 14],
  long: [12, 20],
};

function pickWords(words, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(words[Math.floor(Math.random() * words.length)]);
  }
  return out;
}

/* Returns an array of paragraph strings. */
export function generateLorem(theme = 'classic', paragraphs = 3, length = 'medium', startWithOpener = true) {
  const key = LOREM_THEME_KEYS.includes(theme) ? theme : 'classic';
  const words = LOREM_WORDS[key];
  const n = Math.max(1, Math.min(10, Number(paragraphs) || 3));
  const [wMin, wMax] = LOREM_LENGTH_WORDS[length] || LOREM_LENGTH_WORDS.medium;
  const out = [];
  for (let p = 0; p < n; p++) {
    const sentences = [];
    const nSent = 4 + Math.floor(Math.random() * 3); // 4-6 sentences per paragraph
    for (let s = 0; s < nSent; s++) {
      if (p === 0 && s === 0 && key === 'classic' && startWithOpener) {
        sentences.push(LOREM_OPENER);
        continue;
      }
      const wCount = wMin + Math.floor(Math.random() * (wMax - wMin + 1));
      const ws = pickWords(words, wCount);
      ws[0] = ws[0].charAt(0).toUpperCase() + ws[0].slice(1);
      sentences.push(ws.join(' ') + '.');
    }
    out.push(sentences.join(' '));
  }
  return out;
}
