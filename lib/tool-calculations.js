'use client';
/* Client-side map: slug -> pure calculate function.
   Kept separate because functions cannot cross the server/client boundary as props. */
import {
  mortgage, affordability, loanpayment, emi, compound, savingsgoal,
  debtpayoff, refinance, autoloan, paycheck, creditcard, retirement,
} from './calculations.js';

export const CALCULATORS = {
  'mortgage-calculator': mortgage,
  'home-affordability-calculator': affordability,
  'loan-payment-calculator': loanpayment,
  'emi-calculator': emi,
  'compound-interest-calculator': compound,
  'savings-goal-calculator': savingsgoal,
  'debt-payoff-calculator': debtpayoff,
  'refinance-calculator': refinance,
  'auto-loan-calculator': autoloan,
  'salary-paycheck-calculator': paycheck,
  'credit-card-payoff-calculator': creditcard,
  'retirement-savings-calculator': retirement,
};
