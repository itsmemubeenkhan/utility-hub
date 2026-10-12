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
