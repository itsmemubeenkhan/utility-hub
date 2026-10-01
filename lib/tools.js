/* Tool registry: adding a new tool = adding one entry here.
   /tools/[slug] renders dynamically from this registry. */
import {
  mortgage, affordability, loanpayment, emi, compound, savingsgoal,
  debtpayoff, refinance, autoloan, paycheck, creditcard, retirement,
} from './calculations.js';

const num = (key, label, dflt, opts = {}) => ({ key, label, type: 'number', default: dflt, ...opts });
const sel = (key, label, options, dflt) => ({ key, label, type: 'select', options, default: dflt });
const chk = (key, label, dflt) => ({ key, label, type: 'checkbox', default: dflt });

export const TOOLS = [
  {
    slug: 'mortgage-calculator',
    lastReviewed: '2026-10-01',
    name: 'Mortgage Calculator',
    tagline: 'Estimate your monthly mortgage payment with taxes, insurance and PMI.',
    category: 'Home Loans',
    badge: 'M',
    calculate: mortgage,
    calcKey: 'mortgage',
    inputs: [
      num('homePrice', 'Home price ($)', 400000, { min: 0, step: 1000 }),
      num('downPayment', 'Down payment ($)', 80000, { min: 0, step: 1000 }),
      num('rate', 'Interest rate (%)', 6.5, { min: 0, max: 20, step: 0.125 }),
      num('years', 'Loan term (years)', 30, { min: 1, max: 50, step: 1 }),
      num('tax', 'Property tax ($/year)', 4800, { min: 0, step: 100 }),
      num('insurance', 'Home insurance ($/year)', 1800, { min: 0, step: 50 }),
      chk('includePmi', 'Include PMI estimate (< 20% down)', true),
    ],
    metaTitle: 'Mortgage Calculator: Monthly Payment, Taxes & PMI Estimate',
    metaDescription:
      'Free mortgage calculator: estimate your monthly payment including principal, interest, property taxes, home insurance and PMI. See total interest and payoff schedule.',
    keywords: 'mortgage calculator, monthly mortgage payment, home loan calculator, PMI calculator',
    explainer:
      'A mortgage payment is more than principal and interest. Lenders quote the P&I figure, but your actual check each month also covers property taxes and homeowners insurance, and if your down payment is under 20%, private mortgage insurance (PMI) until you build enough equity. This mortgage calculator shows the full picture: enter the home price, down payment, rate and term, plus annual tax and insurance figures, and it breaks your payment into each component so you can see exactly where the money goes.\n\nThe amortization engine underneath uses the standard loan formula, then walks through every payment to total up lifetime interest and draw your remaining balance year by year. Two numbers deserve special attention: total interest, which on a 30-year loan can nearly equal the price of the house itself, and the effect of rate, even a half-point difference changes your payment by tens of thousands over the loan. Use the results to compare loan offers apples-to-apples, decide whether a 15-year term is affordable, or see how a larger down payment kills PMI and shrinks interest. These are estimates for planning, not a loan offer, actual payments depend on your lender\'s exact terms.',
    faqs: [
      { q: 'How is a monthly mortgage payment calculated?', a: 'The principal-and-interest portion uses the amortization formula: M = P × r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r the monthly rate, and n the number of payments. Taxes, insurance and PMI are added on top.' },
      { q: 'What is PMI and when do I pay it?', a: 'Private mortgage insurance protects the lender when your down payment is under 20%. It typically costs 0.5–1% of the loan per year, added to your monthly payment, and drops off once you reach about 20% equity.' },
      { q: 'Does a 15-year mortgage save money?', a: 'Yes, dramatically. Rates are usually lower and you pay interest for half the time, often cutting total interest by 60% or more. The tradeoff is a much higher monthly payment.' },
      { q: 'Should I include property tax and insurance?', a: 'Absolutely. Most lenders escrow taxes and insurance into your monthly payment, so excluding them understates what you will actually pay each month, sometimes by 25% or more.' },
    ],
  },
  {
    slug: 'home-affordability-calculator',
    lastReviewed: '2026-10-01',
    name: 'Home Affordability Calculator',
    tagline: 'Find out how much house your income can comfortably support.',
    category: 'Home Loans',
    badge: 'H',
    calculate: affordability,
    calcKey: 'affordability',
    inputs: [
      num('income', 'Annual household income ($)', 80000, { min: 0, step: 1000 }),
      num('debtPayments', 'Monthly debt payments ($)', 500, { min: 0, step: 25 }),
      num('rate', 'Mortgage rate (%)', 6.5, { min: 0, max: 20, step: 0.125 }),
      num('years', 'Loan term (years)', 30, { min: 1, max: 50, step: 1 }),
      num('downPct', 'Down payment (%)', 20, { min: 0, max: 100, step: 1 }),
    ],
    metaTitle: 'Home Affordability Calculator: How Much House Can I Afford?',
    metaDescription:
      'How much house can you afford? Enter your income, debts and rate to get a realistic max home price using the 28/36 lender rule.',
    keywords: 'home affordability calculator, how much house can I afford, house price based on income',
    explainer:
      'Falling in love with a house you cannot comfortably afford is one of the most expensive mistakes in personal finance. Lenders answer "how much can I borrow" with the 28/36 rule: spend no more than 28% of gross monthly income on housing (front-end ratio) and no more than 36% on all debts combined including housing (back-end ratio). This home affordability calculator applies both limits, converts the stricter one into a loan amount at your rate and term, then grosses it up by your down payment into a maximum home price.\n\nThe chart shows how the answer moves as you stretch the income ratio, useful when deciding how conservative to be. Remember that the rule is a ceiling, not a target: taxes, insurance, maintenance (budget roughly 1% of the home value per year) and HOA dues all sit on top of the mortgage. In high-cost areas, many buyers also weigh the back-end ratio more heavily because student loans or car payments eat the budget fast. Use this calculator before you browse listings, not after, it keeps your search honest and your offer letters credible.',
    faqs: [
      { q: 'What is the 28/36 rule?', a: 'A traditional lending guideline: housing costs should not exceed 28% of gross monthly income, and total debt payments (housing plus car loans, student loans, minimum card payments) should not exceed 36%.' },
      { q: 'Does this include property taxes and insurance?', a: 'The ratios apply to total housing cost, which lenders define as PITI: principal, interest, taxes and insurance. Our calculator converts the payment limit to a price; budget taxes and insurance inside that payment.' },
      { q: 'Can I afford more if I have no other debts?', a: 'Yes, with zero other debts, the back-end ratio equals the front-end ratio, so you qualify for the full 28% housing budget. Existing debts are what usually drag the number down.' },
      { q: 'Is the maximum price the price I should pay?', a: 'No. It is the most a lender would likely approve. Most financial planners suggest staying 10–20% below the maximum to leave room for maintenance, savings and life surprises.' },
    ],
  },
  {
    slug: 'loan-payment-calculator',
    lastReviewed: '2026-10-01',
    name: 'Loan Payment Calculator',
    tagline: 'Monthly payment, total interest and payoff timeline for any loan.',
    category: 'Loans',
    badge: 'L',
    calculate: loanpayment,
    calcKey: 'loanpayment',
    inputs: [
      num('amount', 'Loan amount ($)', 25000, { min: 0, step: 500 }),
      num('rate', 'Annual interest rate (%)', 8, { min: 0, max: 40, step: 0.125 }),
      num('years', 'Term (years)', 5, { min: 0, max: 40, step: 1 }),
      num('months', 'Extra months', 0, { min: 0, max: 11, step: 1 }),
    ],
    metaTitle: 'Loan Payment Calculator: Monthly Payment & Total Interest',
    metaDescription:
      'Calculate the monthly payment, total interest and payoff schedule for any loan, personal, student or business. Free and instant.',
    keywords: 'loan payment calculator, personal loan calculator, loan amortization calculator',
    explainer:
      'Every loan boils down to three numbers: how much you borrow, the rate, and how long you take to repay. This loan payment calculator turns those three inputs into the two numbers that matter for your budget, the monthly payment and the total interest you will pay over the life of the loan. It works for personal loans, student loans, business loans and any other amortizing debt: each payment is split into interest (charged on the remaining balance) and principal, so early payments are mostly interest and later ones mostly principal.\n\nTwo insights usually surprise people. First, stretching the term drops the payment but explodes total interest, doubling the term can nearly double what you pay in interest. Second, even small extra payments attack principal directly and can shave months off the schedule. The balance chart shows the payoff curve so you can see exactly when the loan starts shrinking fast. Use the calculator to compare offers (a lower rate beats a longer term almost every time), to check whether a payment fits your budget before you sign, and to plan extra payments that cut interest.',
    faqs: [
      { q: 'How do lenders split my payment between interest and principal?', a: 'Each month the lender charges interest on the remaining balance, and the rest of your fixed payment reduces principal. That is why early payments are interest-heavy and the split shifts toward principal over time.' },
      { q: 'Is a longer loan term better?', a: 'It lowers the monthly payment but raises total interest substantially. Only choose a longer term if the shorter term\'s payment genuinely does not fit your budget.' },
      { q: 'Do extra payments really help?', a: 'Yes. Extra payments go straight to principal, which reduces every future interest charge. Even $50 extra per month can cut months off a typical loan.' },
      { q: 'What is an amortization schedule?', a: 'A month-by-month table showing each payment\'s interest/principal split and the remaining balance. Our chart visualizes the same payoff curve.' },
    ],
  },
  {
    slug: 'emi-calculator',
    lastReviewed: '2026-10-01',
    name: 'EMI Calculator',
    tagline: 'Compute equated monthly installments and lifetime interest cost.',
    category: 'Loans',
    badge: 'E',
    calculate: emi,
    calcKey: 'emi',
    inputs: [
      num('amount', 'Loan amount ($)', 25000, { min: 0, step: 500 }),
      num('rate', 'Annual interest rate (%)', 7, { min: 0, max: 40, step: 0.125 }),
      num('years', 'Tenure (years)', 5, { min: 1, max: 40, step: 1 }),
    ],
    metaTitle: 'EMI Calculator: Monthly Installment & Interest Breakdown',
    metaDescription:
      'Free EMI calculator: find your equated monthly installment, total interest and principal-vs-interest breakup over the loan tenure.',
    keywords: 'EMI calculator, equated monthly installment calculator, loan EMI',
    explainer:
      'EMI, equated monthly installment, is the fixed amount you pay every month until a loan is fully repaid. It is the standard repayment structure for home loans, car loans and personal loans in the US, India, the UK and beyond. The math is identical to loan amortization: a formula converts your loan amount, annual rate and tenure into one flat monthly figure, with each installment split between interest on the outstanding balance and principal reduction.\n\nThis EMI calculator goes beyond the monthly number. The cumulative chart tracks how much principal you have repaid versus how much interest you have paid at each year, the crossover point where principal finally overtakes interest is eye-opening on long loans. The donut shows the lifetime split: on a 30-year loan at typical rates, interest can exceed half of everything you pay. Before you commit, compare a shorter tenure (higher EMI, far less interest) against a longer one, and check whether a part-prepayment early in the loan, when the interest portion is largest, makes sense for you.',
    faqs: [
      { q: 'What does EMI stand for?', a: 'Equated Monthly Installment, a fixed monthly payment that covers both interest and principal until the loan is repaid.' },
      { q: 'Is EMI the same as a loan payment?', a: 'Yes, mathematically. EMI is simply the term commonly used for the fixed monthly payment on an amortizing loan.' },
      { q: 'Why is my EMI mostly interest at first?', a: 'Interest is charged on the outstanding balance, which is largest at the start. As principal shrinks, the interest portion of each EMI falls and the principal portion grows.' },
      { q: 'Should I choose a shorter tenure?', a: 'If you can afford the higher EMI, yes, you pay dramatically less interest overall and become debt-free sooner.' },
    ],
  },
  {
    slug: 'compound-interest-calculator',
    lastReviewed: '2026-10-01',
    name: 'Compound Interest Calculator',
    tagline: 'Watch your money grow, contributions plus compounding returns.',
    category: 'Investing',
    badge: 'C',
    calculate: compound,
    calcKey: 'compound',
    inputs: [
      num('principal', 'Initial investment ($)', 10000, { min: 0, step: 500 }),
      num('monthlyAdd', 'Monthly contribution ($)', 500, { min: 0, step: 25 }),
      num('rate', 'Annual return (%)', 8, { min: 0, max: 30, step: 0.5 }),
      num('years', 'Years to grow', 20, { min: 1, max: 60, step: 1 }),
      sel('freq', 'Compounding frequency', [
        { value: 'annually', label: 'Annually' },
        { value: 'semiannually', label: 'Semi-annually' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'daily', label: 'Daily' },
      ], 'monthly'),
    ],
    metaTitle: 'Compound Interest Calculator: Growth With Contributions',
    metaDescription:
      'See how compound interest grows your savings over time. Add monthly contributions, adjust the return rate and compare compounding frequencies.',
    keywords: 'compound interest calculator, investment growth calculator, compounding calculator',
    explainer:
      'Compound interest is interest earning interest, and it is the single most powerful force in long-term investing. Each period, your balance grows by the return rate, and the next period\'s growth is calculated on that larger balance. Add regular contributions and the effect becomes dramatic: over 20–30 years, investment growth can dwarf everything you actually put in. This compound interest calculator models exactly that, letting you set an initial amount, a monthly contribution, an assumed annual return and the compounding frequency.\n\nPlay with the two levers that matter most: time and contributions. Starting ten years earlier usually beats earning a higher return, because compounding needs time to do its heavy lifting, the growth curve stays flat for years, then bends sharply upward. Monthly contributions matter even more than most people expect; they are the fuel the compounding engine burns. The frequency setting (monthly vs daily) changes results only slightly, banks love advertising daily compounding, but the return rate and your savings habit decide 99% of the outcome. Treat the rate as a long-term average, not a promise: markets fluctuate, and this calculator shows the smooth mathematical path, not the bumpy real one.',
    faqs: [
      { q: 'What is compound interest in simple terms?', a: 'You earn returns not just on your original money but on all previously earned returns too. Over time, growth accelerates because each year\'s gains become part of next year\'s base.' },
      { q: 'Does compounding frequency matter much?', a: 'Barely. The difference between monthly and daily compounding is tiny compared to the difference made by your return rate, contribution amount and time invested.' },
      { q: 'What return rate should I assume?', a: 'For long-term US stock market investing, 7–10% nominal (before inflation) is the historical range. Use 6–7% for a conservative plan and remember to subtract inflation for real purchasing power.' },
      { q: 'Is it better to invest a lump sum or monthly?', a: 'Both work. A lump sum invested earlier gets more compounding time; monthly contributions build the habit and smooth out market timing. Our calculator shows either path.' },
    ],
  },
  {
    slug: 'savings-goal-calculator',
    lastReviewed: '2026-10-01',
    name: 'Savings Goal Calculator',
    tagline: 'How much to save each month to hit any target on time.',
    category: 'Saving',
    badge: 'S',
    calculate: savingsgoal,
    calcKey: 'savingsgoal',
    inputs: [
      num('goal', 'Savings goal ($)', 50000, { min: 0, step: 1000 }),
      num('starting', 'Already saved ($)', 5000, { min: 0, step: 500 }),
      num('rate', 'Annual interest (%)', 5, { min: 0, max: 20, step: 0.25 }),
      num('years', 'Years to save', 5, { min: 1, max: 50, step: 1 }),
    ],
    metaTitle: 'Savings Goal Calculator: Monthly Deposit Needed',
    metaDescription:
      'How much must you save each month to reach your goal? Enter the target, timeline and interest rate for your required monthly deposit.',
    keywords: 'savings goal calculator, how much to save per month, savings plan calculator',
    explainer:
      'Big goals, a house down payment, a wedding, a sabbatical fund, feel abstract until you convert them into a monthly number. That is what a savings goal calculator does: it works backward from your target amount and deadline to tell you exactly how much to set aside each month, accounting for the interest your savings earn along the way. Because your deposits also compound, the required monthly amount is always less than simply dividing the goal by the number of months, the longer your timeline and the better your rate, the bigger the discount.\n\nUse the inputs to stress-test your plan. Push the deadline out two years and watch the monthly number fall; raise the rate (say, by using a high-yield savings account instead of checking) and see the same effect. If the monthly figure is more than you can afford, you have three honest options: extend the timeline, raise the target\'s priority by cutting elsewhere, or shrink the goal. The projected curve shows your balance climbing year by year, which is useful motivation, and a reality check that the last stretch, when compounding kicks in hardest, does a surprising share of the work.',
    faqs: [
      { q: 'How does the calculator find my monthly deposit?', a: 'It solves the future-value-of-annuity formula in reverse: given your goal, starting amount, rate and months, it finds the deposit that grows to exactly your target.' },
      { q: 'Does interest really lower my monthly savings?', a: 'Yes. Earnings on your growing balance do part of the work, so higher rates and longer timelines both reduce the required deposit.' },
      { q: 'What if I cannot afford the monthly amount?', a: 'Extend the timeline, increase the interest rate with a better account, reduce the goal, or start with a larger initial deposit, the calculator shows each tradeoff instantly.' },
      { q: 'Should I use a high-yield savings account?', a: 'For goals under 3–5 years, yes, you keep the money safe and FDIC-insured while earning far more than a checking account. For longer horizons, investing may beat savings rates.' },
    ],
  },
  {
    slug: 'debt-payoff-calculator',
    lastReviewed: '2026-10-01',
    name: 'Debt Payoff Calculator',
    tagline: 'Your debt-free date, total interest and the fastest payoff plan.',
    category: 'Debt',
    badge: 'D',
    calculate: debtpayoff,
    calcKey: 'debtpayoff',
    inputs: [
      num('balance', 'Total debt balance ($)', 15000, { min: 0, step: 500 }),
      num('rate', 'Average APR (%)', 18, { min: 0, max: 40, step: 0.5 }),
      num('payment', 'Monthly payment ($)', 400, { min: 0, step: 25 }),
    ],
    metaTitle: 'Debt Payoff Calculator: Debt-Free Date & Interest Cost',
    metaDescription:
      'When will you be debt-free? Enter your balance, APR and monthly payment to see your payoff date and total interest. Free debt payoff calculator.',
    keywords: 'debt payoff calculator, when will I be debt free, debt payoff planner',
    explainer:
      'Minimum payments are designed to keep you in debt, not get you out, on a high-APR balance they can stretch repayment over a decade while you pay multiples of what you borrowed in interest. This debt payoff calculator cuts through that: enter your balance, average APR and the monthly amount you can actually pay, and it simulates month-by-month payoff to give you a debt-free date, the total interest you will pay, and a year-by-year balance chart.\n\nThe single most important insight is the payment threshold: your payment must exceed the monthly interest charge or the balance never shrinks, the calculator warns you explicitly if you are below it. Above that line, every extra dollar has an outsized effect because it goes straight to principal and kills future interest. Try bumping your payment by $50 or $100 and watch years fall off the timeline. If you carry multiple debts, run each through separately, then attack them highest-APR-first (the avalanche method) for the mathematically fastest payoff, or smallest-balance-first (snowball) if quick wins keep you motivated.',
    faqs: [
      { q: 'Why does my balance barely move with minimum payments?', a: 'Most of a minimum payment covers that month\'s interest, leaving little for principal. At 18–24% APR, minimums can take 10+ years to clear a balance.' },
      { q: 'What happens if my payment is less than the monthly interest?', a: 'The balance grows instead of shrinking, negative amortization. You must pay more than the monthly interest charge to make any progress.' },
      { q: 'Snowball or avalanche, which is better?', a: 'Avalanche (highest APR first) costs the least in interest. Snowball (smallest balance first) gives faster psychological wins. Both beat minimum payments by years.' },
      { q: 'Should I consolidate my debt first?', a: 'If you can get a lower-rate consolidation loan or 0% balance transfer and you will not run the cards back up, consolidation can cut total interest significantly.' },
    ],
  },
  {
    slug: 'refinance-calculator',
    lastReviewed: '2026-10-01',
    name: 'Refinance Calculator',
    tagline: 'Is refinancing worth it? Compare payments, savings and breakeven.',
    category: 'Home Loans',
    badge: 'R',
    calculate: refinance,
    calcKey: 'refinance',
    inputs: [
      num('balance', 'Remaining loan balance ($)', 350000, { min: 0, step: 1000 }),
      num('oldRate', 'Current interest rate (%)', 7.25, { min: 0, max: 20, step: 0.125 }),
      num('remainingYears', 'Years left on current loan', 25, { min: 1, max: 50, step: 1 }),
      num('newRate', 'New interest rate (%)', 6, { min: 0, max: 20, step: 0.125 }),
      num('newTermYears', 'New loan term (years)', 30, { min: 1, max: 50, step: 1 }),
      num('closingCost', 'Closing costs ($)', 6000, { min: 0, step: 250 }),
    ],
    metaTitle: 'Refinance Calculator: Savings, Breakeven & New Payment',
    metaDescription:
      'Should you refinance? Compare your current mortgage against new terms: monthly savings, lifetime interest and the breakeven point on closing costs.',
    keywords: 'refinance calculator, mortgage refinance calculator, refinancing breakeven',
    explainer:
      'Refinancing trades your current mortgage for a new one, usually to grab a lower rate, but sometimes to shorten the term or tap equity. The pitch always highlights the lower monthly payment; the catch is closing costs, typically 2–5% of the loan, which you pay upfront. This refinance calculator does the full comparison: it computes your current payment, the new payment, the monthly savings, and, critically, the breakeven point, the number of months of savings needed to recover the closing costs.\n\nThe breakeven number is the whole decision. If you will sell or move before breakeven, refinancing loses money despite the lower rate. Also watch the term trap: refinancing a 25-year-remaining loan into a fresh 30-year loan lowers the payment but can increase lifetime interest even at a lower rate, the calculator shows total interest for both loans so you can see it. A good rule of thumb: refinance when the rate drops enough that breakeven lands well inside how long you plan to stay, and consider a shorter new term if the payment still fits your budget.',
    faqs: [
      { q: 'What is the breakeven point?', a: 'Closing costs divided by monthly savings, the months it takes for the refinance to pay for itself. You must keep the loan past breakeven to come out ahead.' },
      { q: 'How much lower must rates be to refinance?', a: 'The old 1% rule is outdated. Run the numbers: with low closing costs, even a 0.5% drop can work if you stay long enough; with high costs, you may need 1% or more.' },
      { q: 'Does refinancing restart my loan term?', a: 'Often, yes, a new 30-year loan resets the clock. You can choose a 15- or 20-year term instead to avoid paying interest for extra years.' },
      { q: 'What are typical closing costs?', a: 'Usually 2–5% of the loan amount: origination fees, appraisal, title insurance and prepaid items. Some lenders offer "no-closing-cost" refinances that roll costs into a slightly higher rate.' },
    ],
  },
  {
    slug: 'auto-loan-calculator',
    lastReviewed: '2026-10-01',
    name: 'Auto Loan Calculator',
    tagline: 'Monthly car payment with down payment, trade-in and loan term.',
    category: 'Loans',
    badge: 'A',
    calculate: autoloan,
    calcKey: 'autoloan',
    inputs: [
      num('price', 'Vehicle price ($)', 35000, { min: 0, step: 500 }),
      num('downPayment', 'Down payment ($)', 5000, { min: 0, step: 500 }),
      num('tradeIn', 'Trade-in value ($)', 3000, { min: 0, step: 500 }),
      num('rate', 'APR (%)', 7, { min: 0, max: 30, step: 0.25 }),
      num('months', 'Loan term (months)', 60, { min: 6, max: 120, step: 6 }),
    ],
    metaTitle: 'Auto Loan Calculator: Monthly Car Payment Estimator',
    metaDescription:
      'Estimate your monthly car payment with down payment, trade-in value, APR and term. See total interest and the true cost of the vehicle.',
    keywords: 'auto loan calculator, car payment calculator, car loan calculator',
    explainer:
      'Dealerships love talking monthly payment because it hides the total price, a longer term makes any car feel affordable while quietly adding thousands in interest. This auto loan calculator reverses that: enter the vehicle price, down payment, trade-in value, APR and term, and it shows the real monthly payment, the loan amount you are actually financing, total interest, and the true all-in cost of the car.\n\nThree numbers decide whether a car deal is good. First, the loan amount: every dollar of down payment or trade-in is a dollar you never pay interest on. Second, the APR: dealer-arranged financing is often marked up, so compare it against your bank or credit union before you sign. Third, the term: 84-month loans keep payments low but leave you owing more than the car is worth for years (negative equity), and you pay far more interest. The balance chart shows the payoff curve, if it stays high for years, the term is too long. Negotiate the price first, the financing second, and never let the monthly payment be the only number you discuss.',
    faqs: [
      { q: 'How much car can I afford?', a: 'A common guideline: total car costs under 15% of take-home pay, with at least 20% down and a term of 48 months or less. Use the calculator to test payments against your budget.' },
      { q: 'Is a longer auto loan term bad?', a: 'It lowers the payment but raises total interest and keeps you upside-down (owing more than the car\'s value) longer. 60 months is the sweet spot for most buyers; avoid 84 months if possible.' },
      { q: 'Should I put money down on a car?', a: 'Yes. A solid down payment reduces the amount financed, lowers your payment and interest, and protects you from negative equity as the car depreciates.' },
      { q: 'Dealer financing or bank loan?', a: 'Get pre-approved by your bank or credit union first, then let the dealer try to beat it. Walking in with a rate in hand removes their biggest profit lever.' },
    ],
  },
  {
    slug: 'salary-paycheck-calculator',
    lastReviewed: '2026-10-01',
    name: 'Salary Paycheck Calculator',
    tagline: 'US take-home pay after federal, FICA and state taxes.',
    category: 'Taxes',
    badge: '$',
    calculate: paycheck,
    calcKey: 'paycheck',
    inputs: [
      num('salary', 'Annual salary ($)', 80000, { min: 0, step: 1000 }),
      sel('frequency', 'Pay frequency', [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly' },
        { value: 'semimonthly', label: 'Semi-monthly' },
        { value: 'monthly', label: 'Monthly' },
      ], 'biweekly'),
      num('stateRate', 'State tax rate, flat estimate (%)', 5, { min: 0, max: 15, step: 0.5 }),
    ],
    metaTitle: 'Salary Paycheck Calculator: US Take-Home Pay After Taxes',
    metaDescription:
      'How much of your salary do you actually take home? Estimate federal income tax, FICA and state tax per paycheck. Free US paycheck calculator.',
    keywords: 'paycheck calculator, take home pay calculator, salary after taxes calculator, US tax calculator',
    explainer:
      'Your salary is not your paycheck. Between federal income tax, Social Security and Medicare (FICA), and state taxes, a meaningful slice of every dollar never reaches your bank account, and the gap surprises almost everyone the first time they see it itemized. This salary paycheck calculator estimates your US take-home pay: enter your annual salary, pay frequency and a flat state rate, and it walks through the federal tax brackets, applies FICA, and shows gross vs net per paycheck plus your effective tax rate.\n\nA few things worth understanding in the results. Federal income tax is marginal, only the dollars inside each bracket are taxed at that bracket\'s rate, so "moving into a higher bracket" never costs you money overall. FICA is flat (6.2% Social Security up to the wage base, 1.45% Medicare on everything) and your employer matches it behind the scenes. The state line is a rough flat estimate because real state taxes range from zero (Texas, Florida) to over 10% (California) with their own brackets and deductions. Treat this as a planning estimate: actual withholding depends on your W-4, pre-tax 401(k) and HSA contributions, and local taxes.',
    faqs: [
      { q: 'Why is my paycheck less than salary ÷ pay periods?', a: 'Federal income tax, FICA (Social Security + Medicare) and state/local taxes are withheld first. Pre-tax deductions like 401(k) and health premiums reduce it further.' },
      { q: 'What is a marginal tax bracket?', a: 'Income is taxed in layers: the first chunk at 10%, the next at 12%, and so on. Only income inside a bracket is taxed at that rate, earning more never reduces your take-home pay.' },
      { q: 'What is FICA?', a: 'Federal Insurance Contributions Act tax: 6.2% for Social Security (up to an annual wage base) plus 1.45% for Medicare on all earnings. Your employer pays a matching amount.' },
      { q: 'How accurate is this estimate?', a: 'It is a solid planning estimate using single-filer federal brackets and a flat state rate. Real withholding varies with your W-4, filing status, pre-tax deductions and your state\'s actual tax code.' },
    ],
  },
  {
    slug: 'credit-card-payoff-calculator',
    lastReviewed: '2026-10-01',
    name: 'Credit Card Payoff Calculator',
    tagline: 'How fast you can kill credit card debt, and what it costs.',
    category: 'Debt',
    badge: '¢',
    calculate: creditcard,
    calcKey: 'creditcard',
    inputs: [
      num('balance', 'Card balance ($)', 8000, { min: 0, step: 250 }),
      num('rate', 'APR (%)', 24, { min: 0, max: 40, step: 0.5 }),
      num('payment', 'Monthly payment ($)', 250, { min: 0, step: 25 }),
    ],
    metaTitle: 'Credit Card Payoff Calculator: Debt-Free Date & Interest',
    metaDescription:
      'How long to pay off your credit card? Enter balance, APR and monthly payment to see your debt-free date and total interest. Free calculator.',
    keywords: 'credit card payoff calculator, pay off credit card calculator, credit card debt calculator',
    explainer:
      'Credit card debt at 20–30% APR is the most expensive common debt in America, and minimum payments are engineered to maximize what the issuer earns from you. This credit card payoff calculator shows the alternative: enter your balance, APR and the monthly payment you can commit to, and it simulates the payoff month by month, giving you a debt-free date, total interest paid, and a balance chart that makes progress visible.\n\nThe math is unforgiving and motivating in equal measure. At 24% APR, an $8,000 balance paid at $250/month takes over four years and costs nearly $4,000 in interest; bump the payment to $400 and you finish in about two years, saving roughly half the interest. That is the power of paying more than the minimum when the rate is high, every extra dollar skips future interest compounding against you. The calculator also warns you if your payment does not even cover monthly interest, the trap that keeps balances growing forever. Use it to set a fixed payoff payment, automate it, and stop adding new charges while you attack the balance.',
    faqs: [
      { q: 'How long will it take to pay off my credit card?', a: 'It depends on balance, APR and payment. At typical rates, minimum payments take 7–15 years; a fixed aggressive payment can clear the same balance in 1–3 years.' },
      { q: 'How much interest will I pay?', a: 'Enter your numbers above, at 24% APR, interest often totals 30–50% of the original balance when paying minimums, but drops fast as you raise the payment.' },
      { q: 'Should I do a balance transfer?', a: 'A 0% introductory APR transfer can save hundreds if you pay the balance off before the promo ends and avoid the transfer fee trap. Do not use it as an excuse to spend more.' },
      { q: 'Is it better to save or pay off card debt?', a: 'Almost always pay the card first: a guaranteed 24% return by avoiding interest beats any savings account or typical investment return.' },
    ],
  },
  {
    slug: 'retirement-savings-calculator',
    lastReviewed: '2026-10-01',
    name: 'Retirement Savings Calculator',
    tagline: 'Project your 401(k) growth with contributions and employer match.',
    category: 'Investing',
    badge: 'R2',
    calculate: retirement,
    calcKey: 'retirement',
    inputs: [
      num('current', 'Current savings ($)', 25000, { min: 0, step: 1000 }),
      num('monthly', 'Your monthly contribution ($)', 800, { min: 0, step: 25 }),
      num('rate', 'Expected annual return (%)', 8, { min: 0, max: 20, step: 0.5 }),
      num('years', 'Years until retirement', 30, { min: 1, max: 60, step: 1 }),
      num('salary', 'Annual salary, for match calc ($)', 100000, { min: 0, step: 1000 }),
      num('match', 'Employer match (%)', 50, { min: 0, max: 200, step: 5 }),
      num('matchCapPct', 'Match applies up to (% of salary)', 6, { min: 0, max: 20, step: 0.5 }),
    ],
    metaTitle: 'Retirement Savings Calculator: 401(k) Growth Projection',
    metaDescription:
      'Project your retirement savings with monthly contributions, employer 401(k) match and compound growth. See contributions vs growth over time.',
    keywords: 'retirement calculator, 401k calculator, retirement savings calculator',
    explainer:
      'Retirement feels distant until you see the numbers: small monthly contributions, compounded over decades, routinely grow into seven figures. This retirement savings calculator projects your nest egg from your current savings, monthly contribution, expected return and years to retirement, and it includes the part too many people leave on the table, the employer 401(k) match. Enter your salary, your employer\'s match formula (for example, 50% of your contributions up to 6% of salary), and the calculator adds that free money into every month of the projection.\n\nThe stacked chart tells the real story: early on, your contributions are most of the balance; later, investment growth takes over and dwarfs what you put in. That crossover is why starting early beats contributing more later, a 25-year-old contributing modestly usually ends up ahead of a 40-year-old contributing aggressively. The match deserves special attention: not contributing enough to capture the full match is an instant pay cut, often worth thousands per year. Treat the return as a long-term average (7–8% nominal is a common planning assumption for stock-heavy portfolios), remember inflation will erode purchasing power, and revisit the plan yearly as salary and goals change.',
    faqs: [
      { q: 'How does the employer 401(k) match work?', a: 'A common formula: your employer adds 50% of what you contribute, up to 6% of your salary. Contribute at least enough to get the full match, it is an instant 50–100% return.' },
      { q: 'How much should I save for retirement?', a: 'A widely used rule: save 15% of gross income (including the employer match) starting in your 20s. Fidelity suggests having 10x your final salary saved by age 67.' },
      { q: 'What return should I assume?', a: 'For a stock-heavy portfolio, 7–8% nominal annual return is a common long-term planning assumption. Use lower figures as you near retirement and shift toward bonds.' },
      { q: 'Does inflation matter?', a: 'Yes, at 3% inflation, prices double roughly every 24 years. Subtract expected inflation from your nominal return to think in today\'s dollars.' },
    ],
  },
];

export function getTool(slug) {
  return TOOLS.find((t) => t.slug === slug);
}

export function getAllToolSlugs() {
  return TOOLS.map((t) => t.slug);
}

export const CATEGORIES = [...new Set(TOOLS.map((t) => t.category))];
