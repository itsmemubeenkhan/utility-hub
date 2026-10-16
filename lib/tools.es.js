/* Spanish tool registry. Entries live in tools.es.a.js / tools.es.b.js
   (translated content); this module attaches the shared calculation
   functions from lib/calculations.js (math is locale-independent). */
import { TOOLS_ES_A } from './tools.es.a.js';
import { TOOLS_ES_B } from './tools.es.b.js';
import { TOOLS_ES_C } from './tools.es.c.js';
import {
  mortgage,
  affordability,
  loanpayment,
  emi,
  compound,
  savingsgoal,
  debtpayoff,
  refinance,
  autoloan,
  paycheck,
  creditcard,
  retirement,
  studentloan,
  networth,
  budget,
  emergencyfund,
  inflation,
  roi,
  collegesavings,
  dti,
  salaryhourly,
  carafford,
  rentvsbuy,
  homeequity,
  aprapy,
  tip,
  overtime,
  k401,
  savingsapy,
  capitalgains,
  loancompare,
  paycheckdetail,
  rothvstrad,
  biweekly,
  pagominimo,
} from './calculations.js';

const CALC = {
  mortgage,
  affordability,
  loanpayment,
  emi,
  compound,
  savingsgoal,
  debtpayoff,
  refinance,
  autoloan,
  paycheck,
  creditcard,
  retirement,
  studentloan,
  networth,
  budget,
  emergencyfund,
  inflation,
  roi,
  collegesavings,
  dti,
  salaryhourly,
  carafford,
  rentvsbuy,
  homeequity,
  aprapy,
  tip,
  overtime,
  k401,
  savingsapy,
  capitalgains,
  loancompare,
  paycheckdetail,
  rothvstrad,
  biweekly,
  pagominimo,
};

export const TOOLS_ES = [...TOOLS_ES_A, ...TOOLS_ES_B, ...TOOLS_ES_C].map((entry) => {
  const calculate = CALC[entry.calcKey];
  if (!calculate) throw new Error('Unknown calcKey: ' + entry.calcKey);
  return { ...entry, calculate };
});

export function getToolEs(slug) {
  return TOOLS_ES.find((t) => t.slug === slug);
}

export function getAllToolSlugsEs() {
  return TOOLS_ES.map((t) => t.slug);
}

/* Related calculators for a Spanish blog post: same word-overlap scoring
   as lib/tools.js relatedToolsFor, against the Spanish tool registry. */
const TOOL_STOPWORDS_ES = new Set(
  'el,la,los,las,un,una,de,del,en,que,con,por,para,como,se,sus,son,este,esta,estos,estas,ese,esa,cuando,donde,cual,quien,puede,puedes,tu,tus,hacer,hace,deberia,calculadora,calculadoras,guia,guias,explicado,diferencia,entre'.split(',')
);

function toolWordsEs(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !TOOL_STOPWORDS_ES.has(w));
}

export function relatedToolsForEs(post, limit = 3) {
  if (!post) return [];
  const postSet = new Set(toolWordsEs([post.slug, post.title, post.keywords].join(' ')));
  if (!postSet.size) return [];
  return TOOLS_ES.map((t) => {
    const tSet = new Set(toolWordsEs([t.slug, t.name, t.category, t.keywords].join(' ')));
    let score = 0;
    for (const w of postSet) if (tSet.has(w)) score += w.length > 5 ? 2 : 1;
    return { tool: t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.tool);
}
