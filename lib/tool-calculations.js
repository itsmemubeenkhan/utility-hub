'use client';
/* Client-side map: slug -> pure calculate function.
   Kept separate because functions cannot cross the server/client boundary as props. */
import {
  mortgage, affordability, loanpayment, emi, compound, savingsgoal,
  debtpayoff, refinance, autoloan, paycheck, creditcard, retirement,
  studentloan, networth, budget, emergencyfund, inflation,
  roi, collegesavings, dti, salaryhourly, carafford,
  rentvsbuy, homeequity, aprapy, tip, overtime,
  k401, savingsapy, capitalgains, loancompare, paycheckdetail,
  rothvstrad, biweekly,
} from './calculations.js';

/* Map stable calculation keys to pure functions. Both locales pass the same
   calcKey, so English and Spanish slugs dispatch to the right math. */
export const CALCULATORS = {
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
};
