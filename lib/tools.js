/* Tool registry: adding a new tool = adding one entry here.
   /tools/[slug] renders dynamically from this registry. */
import {
  mortgage, affordability, loanpayment, emi, compound, savingsgoal,
  debtpayoff, refinance, autoloan, paycheck, creditcard, retirement,
  studentloan, networth, budget, emergencyfund, inflation,
  roi, collegesavings, dti, salaryhourly, carafford,
  rentvsbuy, homeequity, aprapy, tip, overtime,
  k401, savingsapy, capitalgains, loancompare, paycheckdetail,
  rothvstrad, biweekly, se1099vsw2, selfemptax, quarterlytax,
  roth401k, sidehustle, pagominimo,
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
    metaTitle: 'Mortgage Calculator 2026: Real Monthly Payment [Free]',
    metaDescription:
      'Calculate your true mortgage payment with taxes, insurance & PMI. Compare rates and terms instantly. Free, no signup.',
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
    metaTitle: 'How Much House Can I Afford? Calculator 2026 [Free]',
    metaDescription:
      'Find out how much house you can afford based on your salary in 2026. Instant calculation with taxes & insurance. Free.',
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
    metaTitle: 'Loan Payment Calculator 2026: Monthly Payment + Total Interest [Free]',
    metaDescription:
      'Calculate loan payments, total interest & payoff schedule in seconds. For auto, personal & student loans. Free, no signup.',
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
    metaTitle: 'EMI Calculator 2026: Monthly Installment + Interest [Free]',
    metaDescription:
      'Calculate your EMI, total interest & payment breakdown instantly. Compare loan terms and save money. Free.',
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
    metaTitle: 'Compound Interest Calculator 2026: Grow Your Money [Free]',
    metaDescription:
      'See how your money grows with compound interest. Project savings growth over time with visual charts. Free.',
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
    metaTitle: 'Savings Goal Calculator 2026: Reach Your Target [Free]',
    metaDescription:
      'Plan your savings: find monthly savings needed to hit any goal. With compound growth projections. Free.',
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
    metaTitle: 'Debt Payoff Calculator 2026: Become Debt-Free Faster [Free]',
    metaDescription:
      'Create your debt payoff plan: snowball vs avalanche compared. See your debt-free date. Free, no signup.',
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
    metaTitle: 'Refinance Calculator 2026: Is Refinancing Worth It? [Free]',
    metaDescription:
      'Calculate refinance savings and break-even point instantly. Compare current vs new loan. Free.',
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
    metaTitle: 'Auto Loan Calculator 2026: Monthly Payment + Total Cost [Free]',
    metaDescription:
      'Calculate car loan payments, total interest & true cost. Compare terms before you buy. Free, no signup.',
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
    metaTitle: 'Paycheck Calculator 2026: Take-Home Pay After Taxes [Free]',
    metaDescription:
      'Calculate your take-home pay after federal, state & FICA taxes. Hourly, weekly, monthly. Free.',
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
    metaTitle: 'Credit Card Payoff Calculator 2026: Debt-Free Date [Free]',
    metaDescription:
      'See when you will be debt-free and how much interest you will pay. Custom payment plans. Free.',
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
    metaTitle: 'Retirement Savings Calculator 2026: On Track? [Free]',
    metaDescription:
      'Project your retirement savings growth. See if you are saving enough with inflation-adjusted goals. Free.',
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
  {
    slug: 'student-loan-calculator',
    lastReviewed: '2026-10-13',
    name: 'Student Loan Calculator',
    tagline: 'Monthly payment, total interest and the payoff boost from extra payments.',
    category: 'Loans',
    badge: 'S',
    calculate: studentloan,
    calcKey: 'studentloan',
    inputs: [
      num('amount', 'Loan amount ($)', 30000, { min: 0, step: 500 }),
      num('rate', 'Annual interest rate (%)', 6, { min: 0, max: 20, step: 0.125 }),
      num('years', 'Repayment term (years)', 10, { min: 1, max: 30, step: 1 }),
      num('extra', 'Extra payment per month ($)', 0, { min: 0, step: 25 }),
    ],
    metaTitle: 'Student Loan Calculator 2026: Payment + Payoff Plan [Free]',
    metaDescription:
      'Calculate student loan payments, total interest & payoff timeline. Compare repayment plans. Free.',
    keywords: 'student loan calculator, student loan payment calculator, student debt payoff calculator',
    explainer:
      'Student loans are often the first large debt people carry, and the standard 10-year plan is just one option. This student loan calculator shows what that standard plan really costs: your fixed monthly payment, the total interest over the life of the loan, and a year-by-year balance chart. Because federal and private student loans amortize like any other installment debt, each payment splits into interest on the remaining balance plus principal, so the early years are interest-heavy.\n\nThe extra-payment input is where the real planning happens. Adding even $50–$100 a month goes straight to principal and can shave years off the schedule while saving thousands in interest, the calculator shows your new payoff date and exact interest saved. Before refinancing, compare: a lower private-loan rate helps only if you are comfortable giving up federal protections like income-driven repayment and deferment. Use the results to pick a payment you can sustain, automate it, and direct any windfalls (tax refunds, bonuses) at the highest-rate loan first.',
    faqs: [
      { q: 'What is the standard student loan repayment plan?', a: 'Federal loans default to a 10-year standard plan with fixed monthly payments. You can switch to graduated or income-driven plans, but those usually cost more in total interest.' },
      { q: 'Do extra payments on student loans help?', a: 'Yes. Extra payments reduce principal directly, which cuts all future interest charges. Even small extras can shorten a 10-year loan by years.' },
      { q: 'Should I refinance my student loans?', a: 'Refinancing federal loans into a private loan can lower your rate, but you permanently lose federal benefits like income-driven repayment, deferment and forgiveness programs. Only refinance if the savings clearly outweigh those protections.' },
      { q: 'How is student loan interest calculated?', a: 'Most student loans use simple daily interest on the outstanding principal. Your fixed monthly payment first covers the accrued interest, and the rest reduces principal.' },
    ],
  },
  {
    slug: 'net-worth-calculator',
    lastReviewed: '2026-10-13',
    name: 'Net Worth Calculator',
    tagline: 'Add up everything you own, subtract what you owe, see where you stand.',
    category: 'Planning',
    badge: 'N',
    calculate: networth,
    calcKey: 'networth',
    inputs: [
      num('cash', 'Cash & savings ($)', 10000, { min: 0, step: 500 }),
      num('investments', 'Investments, brokerage ($)', 20000, { min: 0, step: 500 }),
      num('retirement', 'Retirement accounts ($)', 50000, { min: 0, step: 1000 }),
      num('realEstate', 'Real estate value ($)', 0, { min: 0, step: 5000 }),
      num('otherAssets', 'Other assets, car, valuables ($)', 15000, { min: 0, step: 500 }),
      num('mortgage', 'Mortgage balance ($)', 0, { min: 0, step: 1000 }),
      num('studentLoans', 'Student loan balance ($)', 25000, { min: 0, step: 500 }),
      num('creditCards', 'Credit card balances ($)', 3000, { min: 0, step: 250 }),
      num('carLoans', 'Car loan balance ($)', 12000, { min: 0, step: 500 }),
      num('otherDebts', 'Other debts ($)', 0, { min: 0, step: 250 }),
    ],
    metaTitle: 'Net Worth Calculator 2026: Track Your Wealth [Free]',
    metaDescription:
      'Calculate your net worth in seconds. Assets minus liabilities with visual breakdown. Free, no signup.',
    keywords: 'net worth calculator, calculate net worth, personal net worth',
    explainer:
      'Net worth is the single number that summarizes your entire financial life: everything you own minus everything you owe. It cuts through salary, lifestyle and appearances, two people earning the same income can have wildly different net worths depending on saving and debt habits. This net worth calculator walks you through both sides of the ledger. List your assets, cash, investments, retirement accounts, home equity at market value, vehicles, and your liabilities, mortgage, student loans, credit cards, car loans, and it computes your net worth plus your debt-to-asset ratio.\n\nTrack this number quarterly, not daily. Markets move, but the trend over years is what matters: a rising net worth means you are building wealth, a flat or falling one means spending or debt is outrunning saving. If the number is negative, do not panic, that is normal early in a career with student loans; the calculator shows exactly which debts drag hardest so you can target them. The debt-to-asset ratio adds context: under 30–40% is comfortable for most households, while anything approaching 100% means you own almost nothing free and clear yet.',
    faqs: [
      { q: 'What counts as an asset?', a: 'Anything with positive value you own: cash, savings, investments, retirement accounts, real estate at market value, vehicles and valuables. Use conservative market values, not what you paid.' },
      { q: 'Should I include my house?', a: 'Yes, include its current market value as an asset and the full remaining mortgage as a liability. The difference is your home equity.' },
      { q: 'Is a negative net worth bad?', a: 'It is common when starting out, especially with student loans. What matters is the direction: consistent saving and debt payoff should push it upward year after year.' },
      { q: 'How often should I check my net worth?', a: 'Quarterly is plenty. Monthly is fine if you enjoy it. Daily checking just adds noise from market movements.' },
    ],
  },
  {
    slug: 'budget-calculator',
    lastReviewed: '2026-10-13',
    name: 'Budget Calculator',
    videoId: '5T9-tOoWeqU',
    videoTitle: 'Budget Calculator — How to Budget Your Money (Free Tool Tutorial)',
    tagline: 'Apply the 50/30/20 rule to your income and spot budget leaks.',
    category: 'Planning',
    badge: 'B',
    calculate: budget,
    calcKey: 'budget',
    inputs: [
      num('income', 'Monthly take-home income ($)', 5000, { min: 0, step: 100 }),
      num('needs', 'Your needs spending, housing, food, transport ($)', 2400, { min: 0, step: 50 }),
      num('wants', 'Your wants spending, dining, fun, shopping ($)', 1400, { min: 0, step: 50 }),
      num('savings', 'Your savings & debt payoff ($)', 1200, { min: 0, step: 50 }),
    ],
    metaTitle: 'Budget Calculator 2026: 50/30/20 Rule Planner [Free]',
    metaDescription:
      'Plan your budget with the 50/30/20 rule. See exactly where your money goes. Free instant calculator, no signup.',
    keywords: 'budget calculator, 50/30/20 budget calculator, monthly budget planner',
    explainer:
      'The 50/30/20 rule is the simplest budget that actually works: 50% of take-home pay for needs (housing, food, transport, minimum debt payments), 30% for wants (dining out, hobbies, shopping), and 20% for savings and extra debt payoff. No spreadsheets with 40 categories, no guilt over every coffee, just three buckets. This budget calculator applies the rule to your income to set your three targets, then compares them against what you actually spend so you can see exactly which bucket is leaking.\n\nThe differences are the whole point. If needs are over 50%, the fix is usually structural, cheaper housing, a paid-off car, refinanced debt, because trimming groceries rarely closes a big gap. If wants are over 30%, that is the easiest place to cut without pain: subscriptions, impulse shopping and dining out. And if savings are under 20%, treat it as a bill: automate a transfer on payday so the money leaves before you can spend it. The rule is a starting point, not law; high-cost cities may push needs above 50%, in which case hold the 20% savings line sacred and squeeze wants instead.',
    faqs: [
      { q: 'What is the 50/30/20 budget rule?', a: 'Spend 50% of take-home pay on needs, 30% on wants, and 20% on savings and extra debt payments. It was popularized by Senator Elizabeth Warren in "All Your Worth".' },
      { q: 'Is 50/30/20 based on gross or take-home pay?', a: 'Take-home (after-tax) pay. Using gross pay understates the percentages because taxes take a cut first.' },
      { q: 'What if my housing alone is over 50%?', a: 'That is common in expensive cities. Protect the 20% savings target first, then cut wants to compensate. Long-term, consider raising income or relocating rather than normalizing it.' },
      { q: 'Do debt payments count as needs or savings?', a: 'Minimum payments are needs. Anything above the minimum counts toward the 20% savings/debt bucket, since it builds your net worth.' },
    ],
  },
  {
    slug: 'emergency-fund-calculator',
    lastReviewed: '2026-10-13',
    name: 'Emergency Fund Calculator',
    tagline: 'How big your safety net should be, and how fast you can build it.',
    category: 'Saving',
    badge: 'E',
    calculate: emergencyfund,
    calcKey: 'emergencyfund',
    inputs: [
      num('expenses', 'Essential monthly expenses ($)', 3000, { min: 0, step: 100 }),
      sel('months', 'Months of coverage', [
        { value: 3, label: '3 months (minimum)' },
        { value: 6, label: '6 months (recommended)' },
        { value: 9, label: '9 months' },
        { value: 12, label: '12 months (extra safe)' },
      ], 6),
      num('current', 'Already saved ($)', 5000, { min: 0, step: 250 }),
      num('monthly', 'You can save per month ($)', 500, { min: 0, step: 25 }),
    ],
    metaTitle: 'Emergency Fund Calculator 2026: How Much to Save [Free]',
    metaDescription:
      'Find your ideal emergency fund size based on expenses. 3-6 month target planner. Free.',
    keywords: 'emergency fund calculator, how much emergency fund, emergency savings calculator',
    explainer:
      'An emergency fund is boring on purpose: 3–6 months of essential expenses sitting in a savings account, waiting for the job loss, car breakdown or medical bill that eventually comes for everyone. It is the foundation every other financial goal stands on, without it, one surprise forces you into credit card debt at 24% APR. This emergency fund calculator sizes yours correctly: enter your true monthly essentials (housing, food, transport, insurance, minimum debt payments, not vacations or shopping), pick your coverage target, and it shows the fund size, how many months your current savings cover, and exactly how long your monthly savings take to close the gap.\n\nThree to six months is the standard range: 3 if you have a stable job and dual incomes, 6 if you are the sole earner or freelance, more if your income is volatile. Keep it in a high-yield savings account, not invested, the point is instant access, not growth. And treat it as a revolving door, not a vault: when you spend from it, rebuilding becomes your top financial priority until it is full again. The month-by-month projection shows your progress curve, which helps on the slow months when the goal still feels far away.',
    faqs: [
      { q: 'How much should be in my emergency fund?', a: '3–6 months of essential expenses. Single earners, freelancers and people with volatile income should aim for 6–12 months.' },
      { q: 'What counts as an emergency?', a: 'True surprises: job loss, medical bills, major car or home repairs. A sale, vacation or holiday gifts are not emergencies, budget for those separately.' },
      { q: 'Where should I keep my emergency fund?', a: 'A high-yield savings account: FDIC-insured, instantly accessible, and earning far more than checking. Do not invest it, you need the money available even when markets fall.' },
      { q: 'Should I save or pay off debt first?', a: 'Build a small $1,000–$2,000 starter fund first, then attack high-interest debt aggressively, then finish the full 3–6 month fund. This balances safety against interest costs.' },
    ],
  },
  {
    slug: 'inflation-calculator',
    lastReviewed: '2026-10-13',
    name: 'Inflation Calculator',
    tagline: 'See what rising prices do to your money over time.',
    category: 'Investing',
    badge: 'I',
    calculate: inflation,
    calcKey: 'inflation',
    inputs: [
      num('amount', 'Amount today ($)', 100000, { min: 0, step: 1000 }),
      num('rate', 'Annual inflation rate (%)', 3, { min: 0, max: 20, step: 0.5 }),
      num('years', 'Years', 20, { min: 1, max: 60, step: 1 }),
    ],
    metaTitle: 'Inflation Calculator 2026: What Money Was Worth [Free]',
    metaDescription:
      'See how inflation changed purchasing power over time. Historical CPI-adjusted values. Free.',
    keywords: 'inflation calculator, purchasing power calculator, inflation impact calculator',
    explainer:
      'Inflation is the quiet tax on every dollar you hold: at 3% a year, prices double roughly every 24 years, which means money stuffed under the mattress loses half its buying power in a generation. This inflation calculator makes that erosion concrete two ways. Enter an amount today and it shows what the same basket of goods will cost in the future, and what a fixed future sum (like a pension payout) will actually be worth in today\'s dollars.\n\nThe results reframe common decisions. A "safe" 1% savings account during 3% inflation guarantees losing about 2% of purchasing power yearly, which is why long-term money needs to be invested, not just saved. Salary negotiations look different too: a 2% raise during 3% inflation is a pay cut in real terms. The growth chart plots the compounding curve so you can feel how inflation, like interest, accelerates over time. Use the historical US average of about 3% for planning, but try 5–6% to stress-test your retirement plan against a bad decade.',
    faqs: [
      { q: 'What is a good inflation rate to assume?', a: 'About 3% is the long-term US average and a solid planning default. Use 2% for optimistic and 4–5% for conservative stress tests.' },
      { q: 'How does inflation affect my savings?', a: 'Cash earning less than inflation loses purchasing power every year. At 3% inflation, $10,000 in a 0% account buys only about $7,400 worth of goods after 10 years.' },
      { q: 'What is the Rule of 72?', a: 'Divide 72 by the inflation rate to estimate doubling time: at 3%, prices double in ~24 years; at 6%, in ~12 years.' },
      { q: 'Does inflation affect investments too?', a: 'Yes, which is why investors talk about "real" (inflation-adjusted) returns. Stocks have historically returned about 7% real over long periods, beating inflation comfortably.' },
    ],
  },
  {
    slug: 'roi-calculator',
    lastReviewed: '2026-10-13',
    name: 'ROI Calculator',
    tagline: 'Total return and annualized growth for any investment.',
    category: 'Investing',
    badge: 'R',
    calculate: roi,
    calcKey: 'roi',
    inputs: [
      num('initial', 'Initial investment ($)', 10000, { min: 0, step: 500 }),
      num('final', 'Final value ($)', 16000, { min: 0, step: 500 }),
      num('years', 'Years invested', 5, { min: 0.1, max: 60, step: 0.5 }),
    ],
    metaTitle: 'ROI Calculator 2026: Investment Returns [Free]',
    metaDescription:
      'Calculate return on investment for any asset. Annualized returns with visual charts. Free.',
    keywords: 'ROI calculator, return on investment calculator, annualized return calculator',
    explainer:
      'Return on investment answers the only question that matters about money you put to work: how much did it grow? The basic ROI formula is simple, (final value minus initial investment) divided by the initial investment, but it hides a trap: it ignores time. A 60% return sounds great until you learn it took 10 years. That is why this ROI calculator also computes the annualized return, the steady yearly growth rate that would produce the same result, which is the only fair way to compare investments held for different periods.\n\nUse it to sanity-check real decisions. Compare a rental property against an index fund by annualizing both. Evaluate a business investment against simply leaving the money invested. And remember what ROI leaves out: it does not account for risk, taxes, fees or inflation, a 9% annualized return with wild swings and high fees is not the same as a smooth 9%. The growth curve plots your investment on the equivalent steady path so you can visualize the compounding behind the number.',
    faqs: [
      { q: 'How is ROI calculated?', a: 'ROI = (final value − initial investment) ÷ initial investment × 100. It measures total profit as a percentage of what you put in.' },
      { q: 'What is annualized return and why does it matter?', a: 'It converts total ROI into an equivalent yearly rate: (final/initial)^(1/years) − 1. Two investments with the same total ROI can have very different annualized returns if held for different times.' },
      { q: 'What is a good ROI?', a: 'It depends on risk and time. The US stock market has averaged roughly 10% nominal (7% inflation-adjusted) per year over long periods. Anything consistently above that usually involves more risk.' },
      { q: 'Does ROI include dividends or rent?', a: 'It should. Use the total final value including all cash received (dividends, rent, distributions) plus the ending asset value, minus all costs and fees.' },
    ],
  },
  {
    slug: 'college-savings-calculator',
    lastReviewed: '2026-10-13',
    name: 'College Savings Calculator',
    tagline: 'Project future tuition costs and the monthly savings to cover them.',
    category: 'Saving',
    badge: 'C',
    calculate: collegesavings,
    calcKey: 'collegesavings',
    inputs: [
      num('costNow', 'Current annual college cost ($)', 25000, { min: 0, step: 1000 }),
      num('yearsUntil', 'Years until college starts', 10, { min: 0, max: 25, step: 1 }),
      num('inflation', 'College cost inflation (%/yr)', 5, { min: 0, max: 15, step: 0.5 }),
      num('current', 'Already saved ($)', 10000, { min: 0, step: 500 }),
      num('monthly', 'Monthly contribution ($)', 300, { min: 0, step: 25 }),
      num('rate', 'Expected investment return (%)', 7, { min: 0, max: 15, step: 0.5 }),
    ],
    metaTitle: 'College Savings Calculator 2026: 529 Plan Planner [Free]',
    metaDescription:
      'Plan college savings: monthly contributions needed for tuition goals. With growth projections. Free.',
    keywords: 'college savings calculator, 529 calculator, tuition cost calculator, education savings calculator',
    explainer:
      'College costs rise faster than general inflation, historically around 5% a year, which means a $25,000 annual price tag today becomes roughly $40,000 a year in a decade, or over $160,000 for four years. This college savings calculator puts that sticker shock into a plan: enter today\'s annual cost, years until enrollment, your assumed cost inflation, current savings and monthly contributions, and it projects the four-year bill, your savings growth, the shortfall if any, and the monthly amount needed to fully fund it.\n\nTwo levers matter most: starting early and using a 529 plan. A 529 offers tax-free growth for education expenses plus possible state tax deductions, and its investment options are built for this exact timeline. If the monthly number feels impossible, remember you do not have to cover 100%: many families target a fraction (one-third to one-half) and combine savings with cash flow during college years, scholarships and reasonable student borrowing. The shortfall figure is honest either way, it tells you the gap so you can plan around it instead of discovering it at admissions time.',
    faqs: [
      { q: 'What is a 529 plan?', a: 'A tax-advantaged account for education: investments grow tax-free and withdrawals for qualified education expenses are federal-tax-free. Many states also offer tax deductions for contributions.' },
      { q: 'How fast do college costs rise?', a: 'Historically about 5% per year, well above general inflation. Always project with cost inflation, not today\'s sticker price.' },
      { q: 'How much should I save for college?', a: 'There is no single answer, but a common target is one-third to one-half of projected costs, covered by savings, with the rest from cash flow, aid and modest borrowing.' },
      { q: 'What if I cannot save the full amount?', a: 'Prioritize retirement savings first (you cannot borrow for retirement, but students can borrow for college), then save what you can, the calculator\'s shortfall number helps you plan the gap.' },
    ],
  },
  {
    slug: 'debt-to-income-calculator',
    lastReviewed: '2026-10-13',
    name: 'Debt-to-Income Ratio Calculator',
    tagline: 'The number lenders check first, computed from your debts.',
    category: 'Loans',
    badge: 'D',
    calculate: dti,
    calcKey: 'dti',
    inputs: [
      num('income', 'Gross monthly income ($)', 6000, { min: 0, step: 100 }),
      num('housing', 'Housing payment, rent or mortgage ($)', 1500, { min: 0, step: 50 }),
      num('car', 'Car payment ($)', 400, { min: 0, step: 25 }),
      num('student', 'Student loan payment ($)', 300, { min: 0, step: 25 }),
      num('cards', 'Credit card minimum payments ($)', 200, { min: 0, step: 25 }),
      num('other', 'Other debt payments ($)', 100, { min: 0, step: 25 }),
    ],
    metaTitle: 'Debt-to-Income Ratio Calculator 2026: DTI Check [Free]',
    metaDescription:
      'Calculate your DTI ratio instantly. See if you qualify for mortgages and loans. Free.',
    keywords: 'debt to income ratio calculator, DTI calculator, DTI ratio mortgage',
    explainer:
      'Your debt-to-income ratio is the first number a mortgage underwriter looks at: total monthly debt payments divided by gross monthly income. It answers the lender\'s core question, after existing obligations, is there room for this new payment? This DTI calculator computes it exactly the way lenders do, using gross (pre-tax) income and minimum required debt payments, and shows your housing-only ratio alongside the total. It also rates your result against the thresholds that matter.\n\nThe magic number is 43%: the cutoff for a "qualified mortgage" under US lending rules, above it most mainstream lenders will not approve you. Under 36% is the comfort zone where approvals are easy and rates are best; 36–43% is workable but tight. If your ratio is too high, you have exactly two levers: raise income or cut debt payments. Paying off a car loan or credit card entirely removes its payment from the calculation, which is why killing small debts before applying can move the needle more than chipping at a large one. Run the numbers before house hunting so a pre-approval never surprises you.',
    faqs: [
      { q: 'How do lenders calculate DTI?', a: 'Total monthly debt payments (housing, car, student loans, credit card minimums, other) divided by gross monthly income, times 100. They use minimum payments, not what you actually pay.' },
      { q: 'What DTI do I need for a mortgage?', a: 'Most lenders cap DTI at 43–45% for conventional loans; FHA allows up to about 57% with compensating factors. Under 36% gets the smoothest approvals.' },
      { q: 'Does DTI use gross or net income?', a: 'Gross (pre-tax) income. Lenders want the standardized figure before taxes and deductions.' },
      { q: 'How can I lower my DTI fast?', a: 'Pay off an entire debt to remove its monthly payment from the numerator, avoid new debt, and increase income. Refinancing to a lower payment also helps.' },
    ],
  },
  {
    slug: 'salary-to-hourly-calculator',
    lastReviewed: '2026-10-13',
    name: 'Salary to Hourly Calculator',
    tagline: 'Convert between annual salary and hourly wage instantly.',
    category: 'Taxes',
    badge: '$',
    calculate: salaryhourly,
    calcKey: 'salaryhourly',
    inputs: [
      sel('mode', 'Convert from', [
        { value: 'annual', label: 'Annual salary → hourly' },
        { value: 'hourly', label: 'Hourly wage → annual' },
      ], 'annual'),
      num('amount', 'Amount ($)', 80000, { min: 0, step: 500 }),
      num('hours', 'Hours per week', 40, { min: 1, max: 100, step: 1 }),
      num('weeks', 'Weeks worked per year', 52, { min: 1, max: 52, step: 1 }),
    ],
    metaTitle: 'Salary to Hourly Calculator 2026: True Hourly Rate [Free]',
    metaDescription:
      'Convert your salary to hourly wage instantly. See your real rate after accounting for hours worked. Free.',
    keywords: 'salary to hourly calculator, hourly to salary calculator, pay conversion calculator',
    explainer:
      'Job offers come in different units, one quotes $80,000 a year, another $38 an hour, and comparing them in your head is error-prone. This salary-to-hourly calculator converts both ways with your actual schedule: set hours per week and weeks worked per year (accounting for unpaid time off), and it shows the equivalent hourly rate, annual salary, monthly and weekly pay side by side. The standard 40-hours × 52-weeks baseline gives 2,080 working hours a year, the divisor behind most conversions.\n\nThe honest comparison goes beyond the headline number. An $80,000 salary with unpaid overtime can work out to less per hour than a $38/hour job with strict 40-hour weeks. Benefits matter too: health insurance, retirement matches and paid time off can be worth 20–30% on top of base pay, so factor those in before deciding. Use the calculator when evaluating offers, negotiating freelance rates (a $75,000 salary roughly equals a $50/hour freelance rate once you add self-employment tax and unpaid admin time), or checking whether overtime is actually paying off.',
    faqs: [
      { q: 'How do you convert salary to hourly?', a: 'Divide annual salary by total working hours: hours per week × weeks per year. At 40 hrs × 52 weeks, $80,000 ÷ 2,080 = $38.46/hour.' },
      { q: 'What about unpaid time off?', a: 'Reduce weeks worked per year (e.g., 50 instead of 52 for two unpaid weeks). Fewer paid weeks means a higher true hourly rate for the same salary.' },
      { q: 'Is a salary or hourly job better?', a: 'Neither inherently. Salaried roles often include benefits and stability; hourly roles pay for every hour including overtime. Compare total compensation, not just the rate.' },
      { q: 'How do freelancers convert salary to hourly rate?', a: 'A common rule: divide the target salary by 1,000–1,200 billable hours (not 2,080), then add 25–30% for self-employment tax and benefits. A $80k salary ≈ $65–$85/hour freelance.' },
    ],
  },
  {
    slug: 'car-affordability-calculator',
    lastReviewed: '2026-10-13',
    name: 'Car Affordability Calculator',
    tagline: 'How much car your income can handle, using the 15% rule.',
    category: 'Loans',
    badge: 'C',
    calculate: carafford,
    calcKey: 'carafford',
    inputs: [
      num('income', 'Monthly take-home income ($)', 6000, { min: 0, step: 100 }),
      num('down', 'Down payment ($)', 5000, { min: 0, step: 500 }),
      num('trade', 'Trade-in value ($)', 3000, { min: 0, step: 500 }),
      num('rate', 'Loan APR (%)', 7, { min: 0, max: 30, step: 0.25 }),
      num('months', 'Loan term (months)', 60, { min: 6, max: 120, step: 6 }),
    ],
    metaTitle: 'How Much Car Can You Afford? Calculator 2026 [Free]',
    metaDescription:
      'Find your car budget with the 15% rule. Monthly payment + total cost breakdown. Free, no signup.',
    keywords: 'car affordability calculator, how much car can I afford, auto affordability calculator',
    explainer:
      'Dealerships will happily sell you more car than your budget can carry, stretching the term until the payment "fits." This car affordability calculator works backward from a sane budget instead: it caps your monthly car payment at 15% of take-home pay (the widely used affordability guideline), then converts that payment into the maximum vehicle price your down payment, trade-in, rate and term can support. The result is the most expensive car you should buy, not the most expensive loan you can get.\n\nThe 15% covers the payment only, remember insurance, fuel and maintenance sit on top, which is why many advisors push for 10% all-in. The down payment does heavy lifting: 20% down keeps you from going underwater (owing more than the car is worth) as it depreciates. And watch the term trap the calculator exposes: a 72- or 84-month loan raises the "affordable" price but piles on interest and years of negative equity. Shop with your max price in hand, negotiate the out-the-door price first, and let the financing be a separate conversation.',
    faqs: [
      { q: 'How much car can I afford?', a: 'Keep the monthly payment under 15% of take-home pay (10% is even safer once you add insurance and fuel). Put at least 20% down and keep the term at 48–60 months max.' },
      { q: 'What is the 20/4/10 rule?', a: 'Put 20% down, finance for no more than 4 years, and keep total car expenses under 10% of gross income. It is the strictest popular guideline.' },
      { q: 'Should I include insurance in the 15%?', a: 'The 15% rule covers the loan payment. Budget insurance, fuel and maintenance separately, together they often add another 5–10% of income.' },
      { q: 'Is a longer loan term okay if the payment fits?', a: 'Rarely. 72–84 month loans mean years of owing more than the car is worth plus thousands in extra interest. If you need 84 months to afford it, the car is too expensive.' },
    ],
  },
  {
    slug: 'rent-vs-buy-calculator',
    lastReviewed: '2026-10-13',
    name: 'Rent vs Buy Calculator',
    tagline: 'The true 7-year cost of renting against buying, side by side.',
    category: 'Home Loans',
    badge: 'R',
    calculate: rentvsbuy,
    calcKey: 'rentvsbuy',
    inputs: [
      num('price', 'Home price ($)', 400000, { min: 0, step: 5000 }),
      num('downPct', 'Down payment (%)', 20, { min: 0, max: 100, step: 1 }),
      num('rate', 'Mortgage rate (%)', 6.5, { min: 0, max: 20, step: 0.125 }),
      num('years', 'Loan term (years)', 30, { min: 1, max: 50, step: 1 }),
      num('rent', 'Current monthly rent ($)', 2200, { min: 0, step: 50 }),
      num('rentInc', 'Annual rent increase (%)', 3, { min: 0, max: 15, step: 0.5 }),
      num('appreciation', 'Annual home appreciation (%)', 3, { min: -5, max: 15, step: 0.5 }),
      num('stayYears', 'Years you will stay', 7, { min: 1, max: 30, step: 1 }),
      num('tax', 'Property tax ($/year)', 4800, { min: 0, step: 100 }),
      num('insurance', 'Home insurance ($/year)', 1800, { min: 0, step: 50 }),
      num('maintPct', 'Maintenance (% of price/year)', 1, { min: 0, max: 5, step: 0.25 }),
    ],
    metaTitle: 'Rent vs Buy Calculator 2026: Which Saves More? [Free]',
    metaDescription:
      'Compare renting vs buying costs over time. Break-even analysis with real numbers. Free.',
    keywords: 'rent vs buy calculator, should I rent or buy, renting vs buying calculator',
    explainer:
      'The rent-vs-buy debate is usually argued with slogans ("rent is throwing money away"), but the math is subtler. Buying builds equity and benefits from appreciation, yet it also piles on closing costs, maintenance, taxes, insurance and interest, most of which renters never pay. This rent vs buy calculator does the full accounting over your actual time horizon: it totals everything you would spend buying (down payment, closing costs, PITI payments, maintenance) minus what you recover at sale (appreciation minus the remaining loan and selling costs), and compares it against total rent paid with annual increases. The year-by-year chart shows the crossover point where buying pulls ahead, if it does.\n\nThe single biggest variable is how long you stay. Transaction costs (2% to buy, 6% to sell) punish short stays brutally; under 3–5 years, renting usually wins even in appreciating markets. Run the calculator with honest numbers: local rent growth, realistic appreciation (the long-term US average is about 3–4%), and a maintenance budget of 1% of the price per year. And remember the non-financial side: buying buys stability and control, renting buys flexibility and freedom from surprise repair bills. The calculator settles the money question so you can weigh the lifestyle one clearly.',
    faqs: [
      { q: 'Is renting really throwing money away?', a: 'Not necessarily. Rent buys housing without the costs owners pay: maintenance, property tax, insurance, interest and transaction fees. Over short periods, renting is often cheaper even before counting flexibility.' },
      { q: 'How long should I stay for buying to win?', a: 'Usually 5–7+ years, because 2% closing costs to buy and 6% to sell must be amortized. The calculator shows your exact breakeven year.' },
      { q: 'What is the 5% rule for rent vs buy?', a: 'A shortcut: multiply the home price by 5% and divide by 12. If monthly rent is below that number, renting is likely cheaper; above it, buying usually wins. Our calculator does the precise version.' },
      { q: 'Does home appreciation change the answer?', a: 'Dramatically. At 5%+ annual appreciation, buying wins much sooner; at 0–2%, renting stays competitive far longer. Use conservative appreciation assumptions.' },
    ],
  },
  {
    slug: 'home-equity-calculator',
    lastReviewed: '2026-10-13',
    name: 'Home Equity Loan Calculator',
    tagline: 'Your equity, LTV and how much you can borrow against your home.',
    category: 'Home Loans',
    badge: 'H',
    calculate: homeequity,
    calcKey: 'homeequity',
    inputs: [
      num('value', 'Current home value ($)', 500000, { min: 0, step: 5000 }),
      num('balance', 'Remaining mortgage balance ($)', 300000, { min: 0, step: 5000 }),
      num('draw', 'Amount you want to borrow ($)', 50000, { min: 0, step: 1000 }),
      num('rate', 'HELOC/loan rate (%)', 8, { min: 0, max: 25, step: 0.25 }),
      num('termYears', 'Repayment term (years)', 15, { min: 1, max: 30, step: 1 }),
    ],
    metaTitle: 'Home Equity Calculator 2026: Your Equity Value [Free]',
    metaDescription:
      'Calculate your home equity instantly. Current value minus mortgage balance. Free.',
    keywords: 'home equity calculator, HELOC calculator, home equity loan calculator, LTV calculator',
    explainer:
      'Home equity is the portion of your home you actually own: market value minus mortgage balance. As prices rise and you pay down principal, equity grows, and lenders let you borrow against it through home equity loans (lump sum, fixed rate) or HELOCs (credit line, variable rate). This home equity calculator shows your equity, your loan-to-value ratio, and the key number lenders use: how much you can borrow at the standard 80% combined loan-to-value cap, plus an estimated payment on the amount you want to draw.\n\nBorrowing against your home is cheap debt, rates run well below credit cards, but it converts unsecured spending into debt secured by your house, which is exactly why it demands respect. The best uses add value or cut higher-rate debt: renovations that raise the home value, consolidating 24% APR card balances, or education costs. The risky uses are lifestyle spending, vacations and cars, because the house is collateral if plans go sideways. Check your LTV first: under 80% total borrowing keeps the best rates and avoids PMI-like costs, and the calculator flags exactly where you stand.',
    faqs: [
      { q: 'How much can I borrow against my home?', a: 'Most lenders cap total borrowing at 80% of the home value (CLTV). Available credit = (home value × 80%) − current mortgage balance.' },
      { q: 'HELOC vs home equity loan, which is better?', a: 'A home equity loan gives a lump sum at a fixed rate, best for one-time costs. A HELOC is a revolving line with a variable rate, best for ongoing or uncertain costs like phased renovations.' },
      { q: 'Is HELOC interest tax deductible?', a: 'Only if the funds are used to buy, build or substantially improve the home securing the loan, and only within IRS limits. Consult a tax professional for your situation.' },
      { q: 'What is loan-to-value (LTV)?', a: 'Your total loan balances divided by the home value, times 100. Lenders use it to measure risk: lower LTV means better rates and more borrowing room.' },
    ],
  },
  {
    slug: 'apr-apy-converter',
    lastReviewed: '2026-10-13',
    name: 'APR to APY Converter',
    tagline: 'Convert nominal rates to true yields, both directions.',
    category: 'Investing',
    badge: '%',
    calculate: aprapy,
    calcKey: 'aprapy',
    inputs: [
      sel('mode', 'Convert from', [
        { value: 'apr2apy', label: 'APR → APY' },
        { value: 'apy2apr', label: 'APY → APR' },
      ], 'apr2apy'),
      num('rate', 'Rate (%)', 5, { min: 0, max: 50, step: 0.1 }),
      sel('compounding', 'Compounding frequency', [
        { value: 1, label: 'Annually' },
        { value: 2, label: 'Semi-annually' },
        { value: 4, label: 'Quarterly' },
        { value: 12, label: 'Monthly' },
        { value: 365, label: 'Daily' },
      ], 12),
    ],
    metaTitle: 'APR to APY Converter 2026: True Interest Rate [Free]',
    metaDescription:
      'Convert APR to APY and back instantly. See the real cost of loans and savings. Free.',
    keywords: 'APR to APY converter, APY to APR, APR vs APY calculator',
    explainer:
      'APR and APY describe the same rate two different ways, and the difference is compounding. APR is the simple nominal rate: 5% APR means 5% divided across the year before compounding. APY (annual percentage yield) includes compounding, so 5% APR compounded monthly is actually 5.12% APY, you earn slightly more because each month\'s interest starts earning its own interest. This converter translates both directions with any compounding frequency, so you can compare a monthly-compounding savings account against a daily-compounding one apples-to-apples.\n\nWhy it matters: banks advertise the bigger number. Savings accounts quote APY (the flattering one); loans quote APR (the flattering one for them). When comparing two savings accounts, APY is the number to compare, it already bakes in compounding differences. For loans, APR is more useful because it is also required to include most fees by law, making it the better shopping number. The gap between APR and APY grows with the rate and with compounding frequency, at low rates it is pennies, at credit-card rates it is meaningful money.',
    faqs: [
      { q: 'What is the difference between APR and APY?', a: 'APR is the nominal yearly rate without compounding. APY includes compounding, so it is always equal to or higher than APR at the same nominal rate.' },
      { q: 'How do you convert APR to APY?', a: 'APY = (1 + APR/n)^n − 1, where n is compounding periods per year. Our converter does it instantly for any frequency.' },
      { q: 'Which should I compare for savings accounts?', a: 'APY. It reflects compounding, so it is the true yearly yield and the fair way to compare accounts with different compounding schedules.' },
      { q: 'Does compounding frequency matter much?', a: 'Modestly. Daily vs monthly compounding on a 5% account differs by only about 0.01%. The rate itself matters far more than the frequency.' },
    ],
  },
  {
    slug: 'tip-calculator',
    lastReviewed: '2026-10-13',
    name: 'Tip Calculator',
    tagline: 'Tip, total and per-person split in one tap.',
    category: 'Planning',
    badge: 'T',
    calculate: tip,
    calcKey: 'tip',
    inputs: [
      num('bill', 'Bill amount ($)', 85.50, { min: 0, step: 0.5 }),
      num('tipPct', 'Tip (%)', 18, { min: 0, max: 100, step: 1 }),
      num('people', 'Split between people', 2, { min: 1, max: 50, step: 1 }),
    ],
    metaTitle: 'Tip Calculator 2026: Split Bills Fairly [Free]',
    metaDescription:
      'Calculate tips and split bills in seconds. Custom tip percentages with per-person breakdown. Free, no signup.',
    keywords: 'tip calculator, gratuity calculator, bill split calculator, restaurant tip calculator',
    explainer:
      'Mental math at the table is how everyone ends up overpaying or awkwardly short. This tip calculator does the whole job: enter the bill, pick your tip percentage and the number of people splitting, and it shows the tip amount, the total with tip and each person\'s share. No app download, no account, just the answer.\n\nA quick etiquette guide for the percentages: 15% is the floor for adequate table service in the US, 18–20% is the standard for good service, and 20–25%+ is for exceptional service or large parties that made the server work. Tip on the pre-tax subtotal, not the tax-included total, and tip in cash when you can so the server keeps all of it. For delivery, 15–20% with a $3–5 minimum respects the driver\'s time and vehicle costs. Splitting evenly is simplest; if someone ordered far more, settle the difference between yourselves rather than itemizing at the register.',
    faqs: [
      { q: 'What is a standard tip percentage?', a: 'In the US, 18–20% for good restaurant service, 15% minimum for adequate service, 20–25%+ for exceptional service.' },
      { q: 'Do you tip on the pre-tax or post-tax total?', a: 'Pre-tax subtotal is the standard. Tipping on the tax-included total slightly over-tips.' },
      { q: 'How do you split a bill evenly?', a: 'Add the tip to the bill total, then divide by the number of people. Our calculator does it in one step.' },
      { q: 'How much should I tip for delivery?', a: '15–20% with a $3–5 minimum is fair, accounting for the driver\'s time, gas and vehicle wear.' },
    ],
  },
  {
    slug: 'overtime-calculator',
    lastReviewed: '2026-10-13',
    name: 'Overtime Pay Calculator',
    tagline: 'Regular pay plus time-and-a-half, weekly and annual totals.',
    category: 'Taxes',
    badge: 'O',
    calculate: overtime,
    calcKey: 'overtime',
    inputs: [
      num('rate', 'Hourly rate ($)', 25, { min: 0, step: 0.5 }),
      num('regHours', 'Regular hours worked', 40, { min: 0, max: 100, step: 0.5 }),
      num('otHours', 'Overtime hours worked', 10, { min: 0, max: 80, step: 0.5 }),
      num('multiplier', 'Overtime multiplier', 1.5, { min: 1, max: 3, step: 0.25 }),
    ],
    metaTitle: 'Overtime Pay Calculator 2026: Extra Hours Pay [Free]',
    metaDescription:
      'Calculate overtime pay at time-and-a-half or double-time. Weekly totals included. Free.',
    keywords: 'overtime calculator, overtime pay calculator, time and a half calculator',
    explainer:
      'Overtime is where hourly paychecks get interesting: every hour past 40 in a week typically pays time-and-a-half, so ten overtime hours at $25/hour adds $375, not $250. This overtime pay calculator breaks it down: enter your hourly rate, regular and overtime hours, and the multiplier (1.5× is the federal standard), and it shows regular pay, overtime pay, the blended total for the week and the annualized figure if you worked those hours all year.\n\nKnow your rights behind the numbers. Under the federal Fair Labor Standards Act, non-exempt employees must receive at least 1.5× their regular rate for hours over 40 per week; some states (like California) add daily overtime rules that are even more generous. "Comp time" instead of overtime pay is illegal in most private-sector jobs. And watch the tax angle: overtime can push you into a higher withholding bracket on that paycheck, but it does not change your annual tax bracket math the way people fear, you only pay the higher rate on the extra dollars. Use the calculator to verify your pay stubs and to decide whether the extra shifts are worth your time.',
    faqs: [
      { q: 'How is overtime pay calculated?', a: 'Overtime rate = hourly rate × 1.5 (federal minimum). Overtime pay = overtime rate × overtime hours. Add regular pay for the total.' },
      { q: 'Who qualifies for overtime?', a: 'Non-exempt employees under the FLSA. Exempt (salaried) workers in qualifying roles are not entitled to overtime, though many employers pay it anyway.' },
      { q: 'Is double-time required?', a: 'Not federally, but California requires 2× after 12 hours in a day or after 8 hours on the 7th consecutive workday. Some union contracts also include it.' },
      { q: 'Does overtime push me into a higher tax bracket?', a: 'Only the extra dollars are taxed at the higher marginal rate, and withholding on a big paycheck often over-withholds. Your annual bracket math is unchanged in principle.' },
    ],
  },
  {
    slug: '401k-calculator',
    lastReviewed: '2026-10-13',
    name: '401(k) Max-Out Calculator',
    tagline: 'Are you maxing your 401(k)? Contributions, match and tax savings.',
    category: 'Investing',
    badge: '4',
    calculate: k401,
    calcKey: 'k401',
    inputs: [
      num('salary', 'Annual salary ($)', 100000, { min: 0, step: 1000 }),
      num('contribPct', 'Your contribution (% of salary)', 10, { min: 0, max: 100, step: 0.5 }),
      num('matchPct', 'Employer match (% of your contribution)', 50, { min: 0, max: 200, step: 5 }),
      num('matchCap', 'Match applies up to (% of salary)', 6, { min: 0, max: 20, step: 0.5 }),
      num('age', 'Your current age', 30, { min: 18, max: 80, step: 1 }),
      num('retireAge', 'Retirement age', 65, { min: 40, max: 90, step: 1 }),
      num('current', 'Current 401(k) balance ($)', 20000, { min: 0, step: 1000 }),
      num('rate', 'Expected annual return (%)', 8, { min: 0, max: 20, step: 0.5 }),
      num('marginalRate', 'Your marginal tax rate (%)', 22, { min: 0, max: 50, step: 1 }),
    ],
    metaTitle: '401(k) Calculator 2026: Max Out Your Retirement [Free]',
    metaDescription:
      'Free 401(k) calculator: see if you are maxing contributions, capture the full employer match, and project tax savings and retirement growth.',
    keywords: '401k calculator, 401k max contribution calculator, 401k match calculator',
    explainer:
      'The 401(k) is the highest-leverage account most workers have: pre-tax contributions cut this year\'s tax bill, growth compounds tax-deferred, and the employer match is an instant 50–100% return. Yet most people contribute far below the IRS limit ($24,500 for 2026 if you are under 50) and many do not even contribute enough to capture the full match. This 401(k) calculator answers three questions: how much are you putting in per year, how much free match money are you collecting, and what does it all grow into by retirement at your assumed return.\n\nThe priority order is simple and worth memorizing. First, contribute enough to get the entire employer match, skipping it is turning down a raise. Second, consider maxing the account ($24,500) if cash flow allows, especially in high-earning years when the tax deduction is most valuable. Third, direct overflow savings to an IRA or HSA. The tax-savings line shows what your contributions save you this year at your marginal rate, money that effectively funds part of the contribution itself. And the projection chart makes the cost of waiting visceral: every year you delay maxing out can cost six figures at retirement thanks to compounding.',
    faqs: [
      { q: 'What is the 401(k) contribution limit?', a: 'For 2026, the IRS elective deferral limit is $24,500 if you are under 50 ($31,000+ with catch-up contributions at 50+). Employer matching does not count toward your limit.' },
      { q: 'How does the employer match work?', a: 'A typical formula: the employer adds 50% of your contributions up to 6% of your salary. Contribute at least 6% and you get the full 3%-of-salary bonus.' },
      { q: 'Traditional or Roth 401(k)?', a: 'Traditional saves taxes now (good in high-earning years); Roth pays taxes now but withdrawals are tax-free in retirement (good if you expect higher taxes later or want tax diversification).' },
      { q: 'Should I max my 401(k) before other savings?', a: 'Get the full match first, always. After that, maxing the 401(k) beats taxable investing for most people; an HSA (if eligible) can beat both thanks to its triple tax advantage.' },
    ],
  },
  {
    slug: 'savings-apy-calculator',
    lastReviewed: '2026-10-13',
    name: 'High-Yield Savings Calculator',
    tagline: 'What a high APY really earns you versus a regular account.',
    category: 'Saving',
    badge: 'H',
    calculate: savingsapy,
    calcKey: 'savingsapy',
    inputs: [
      num('deposit', 'Initial deposit ($)', 10000, { min: 0, step: 500 }),
      num('apy', 'High-yield APY (%)', 4.5, { min: 0, max: 15, step: 0.1 }),
      num('regApy', 'Regular account APY (%)', 0.5, { min: 0, max: 15, step: 0.1 }),
      num('monthly', 'Monthly deposit ($)', 500, { min: 0, step: 25 }),
      num('years', 'Years', 5, { min: 1, max: 40, step: 1 }),
    ],
    metaTitle: 'High-Yield Savings Calculator 2026: APY Growth [Free]',
    metaDescription:
      'Compare high-yield savings accounts. Project growth at different APY rates. Free.',
    keywords: 'high yield savings calculator, savings APY calculator, HYSA calculator',
    explainer:
      'The gap between a regular savings account (often 0.01–0.5% APY) and a high-yield account (4%+) is one of the easiest wins in personal finance: same FDIC insurance, same liquidity, wildly different interest. This high-yield savings calculator quantifies it for your situation. Enter your deposit, both APYs, a monthly addition and the timeline, and it projects each balance year by year, showing the interest each earns and the extra dollars the high-yield account puts in your pocket.\n\nThe "extra earned" number is the whole pitch: on $10,000 with $500 monthly deposits over five years, the difference between 0.5% and 4.5% is thousands of dollars for about twenty minutes of work opening an account. High-yield accounts are typically online banks with lower overhead; your money stays FDIC-insured up to the legal limits, and transfers to your checking take a day or two. Rates move with the Fed, so the APY will drift over time, but the spread over brick-and-mortar accounts has persisted for decades. Park your emergency fund and short-term goals here; money you will not touch for years belongs in investments instead.',
    faqs: [
      { q: 'Are high-yield savings accounts safe?', a: 'Yes, if FDIC-insured (or NCUA-insured at credit unions), up to $250,000 per depositor per bank. The insurance is identical to big-bank accounts.' },
      { q: 'Why do online banks pay more?', a: 'No branches means far lower overhead, and they pass the savings to depositors as higher APYs to attract deposits.' },
      { q: 'Can the APY change?', a: 'Yes, savings APYs are variable and track the federal funds rate. Your rate will rise and fall over time, but usually stays well above traditional banks.' },
      { q: 'Should I invest instead?', a: 'For money needed within 3–5 years (emergency fund, down payment), high-yield savings wins on safety. For longer horizons, investing historically beats savings rates by a wide margin.' },
    ],
  },
  {
    slug: 'capital-gains-calculator',
    lastReviewed: '2026-10-13',
    name: 'Capital Gains Tax Calculator',
    tagline: 'Tax on your profit, long-term vs short-term, after-tax proceeds.',
    category: 'Taxes',
    badge: 'G',
    calculate: capitalgains,
    calcKey: 'capitalgains',
    inputs: [
      num('buy', 'Purchase price ($)', 10000, { min: 0, step: 500 }),
      num('sell', 'Sale price ($)', 25000, { min: 0, step: 500 }),
      sel('holding', 'Holding period', [
        { value: 'long', label: 'Long-term (over 1 year)' },
        { value: 'short', label: 'Short-term (1 year or less)' },
      ], 'long'),
      num('income', 'Your taxable income, for long-term bracket ($)', 80000, { min: 0, step: 1000 }),
      num('marginalRate', 'Your marginal rate %, for short-term (%)', 22, { min: 0, max: 50, step: 1 }),
    ],
    metaTitle: 'Capital Gains Tax Calculator 2026: What You Owe [Free]',
    metaDescription:
      'Estimate capital gains tax on stocks, crypto & property. Short vs long-term rates. Free.',
    keywords: 'capital gains tax calculator, capital gains calculator, long term capital gains tax',
    explainer:
      'Profit on an investment is not all yours: the IRS takes a cut, and how long you held the asset decides how big that cut is. Sell within a year and the gain is taxed as ordinary income at your marginal rate (up to 37%); hold longer than a year and you get the preferential long-term rates of 0%, 15% or 20% depending on income. This capital gains tax calculator computes your gain, applies the correct 2025 federal bracket for long-term holdings (or your marginal rate for short-term), and shows the tax owed and your after-tax proceeds.\n\nThe holding-period cliff is the main planning lever: selling at 366 days instead of 360 can cut the tax rate by more than half for many investors. Tax-loss harvesting is the second lever, realizing losses to offset gains, which is why December sees so much strategic selling. Note what this calculator does not cover: state capital gains taxes (up to 13%+ in some states), the 3.8% net investment income tax above certain incomes, and special cases like collectibles (28%) or depreciation recapture on real estate. Treat the result as a solid federal estimate, then confirm specifics with a tax professional before a large sale.',
    faqs: [
      { q: 'What is the long-term capital gains tax rate?', a: 'For 2025 single filers: 0% up to $48,350 of taxable income, 15% up to $533,400, and 20% above. Most middle-income investors pay 15%.' },
      { q: 'How long must I hold for long-term treatment?', a: 'More than one year. One year or less is short-term and taxed as ordinary income at your marginal rate.' },
      { q: 'Do I pay tax if I sell at a loss?', a: 'No tax on losses, and capital losses can offset capital gains plus up to $3,000 of ordinary income per year, with the rest carried forward.' },
      { q: 'Are state taxes included?', a: 'No, this estimates federal tax only. Most states tax capital gains as ordinary income, adding anywhere from 0% to over 13%.' },
    ],
  },
  {
    slug: 'loan-comparison-calculator',
    lastReviewed: '2026-10-13',
    name: 'Loan Comparison Calculator',
    tagline: 'Two loan offers head-to-head: payment, interest and total cost.',
    category: 'Loans',
    badge: 'L',
    calculate: loancompare,
    calcKey: 'loancompare',
    inputs: [
      num('amount', 'Loan amount ($)', 25000, { min: 0, step: 500 }),
      num('rateA', 'Loan A rate (%)', 7, { min: 0, max: 40, step: 0.125 }),
      num('yearsA', 'Loan A term (years)', 5, { min: 1, max: 40, step: 1 }),
      num('feeA', 'Loan A fees ($)', 0, { min: 0, step: 50 }),
      num('rateB', 'Loan B rate (%)', 5.5, { min: 0, max: 40, step: 0.125 }),
      num('yearsB', 'Loan B term (years)', 6, { min: 1, max: 40, step: 1 }),
      num('feeB', 'Loan B fees ($)', 500, { min: 0, step: 50 }),
    ],
    metaTitle: 'Loan Comparison Calculator 2026: Side-by-Side [Free]',
    metaDescription:
      'Compare up to 3 loans side-by-side. Payments, interest & total cost. Free, no signup.',
    keywords: 'loan comparison calculator, compare loan offers, which loan is better calculator',
    explainer:
      'Lenders never make comparison easy: one offers a lower rate with fees, another a higher rate with a longer term and a lower payment. The monthly payment alone cannot tell you which is cheaper, because term length and fees hide in the total. This loan comparison calculator puts two offers head-to-head on the numbers that matter: each monthly payment, each total interest bill, and each all-in cost including origination fees, then declares the winner by lowest total cost and shows both payoff curves.\n\nThe classic trap it exposes: the longer-term loan almost always has the lower payment but the higher total cost, sometimes by thousands. Fees matter too, a "low rate" with $2,000 in origination fees can lose to a slightly higher no-fee rate, especially if you might pay the loan off early (fees are sunk on day one). When comparing, also check the fine print the math cannot see: prepayment penalties, variable vs fixed rates, and what happens if you miss a payment. Use the winner as your negotiating baseline, then ask the losing lender to beat it.',
    faqs: [
      { q: 'Should I pick the loan with the lowest monthly payment?', a: 'Not necessarily. Lower payments usually mean longer terms and more total interest. Compare total cost (interest + fees), not just the payment.' },
      { q: 'How do origination fees affect the comparison?', a: 'Fees are paid upfront and never recovered, so add them to total cost. A low-rate loan with high fees often loses to a no-fee loan at a slightly higher rate.' },
      { q: 'Is a lower rate always better?', a: 'Almost, but term matters: a lower rate over a much longer term can still cost more in total interest. Our calculator combines both into one verdict.' },
      { q: 'What else should I compare besides numbers?', a: 'Prepayment penalties, fixed vs variable rates, late-payment policies, autopay discounts and lender reputation all matter beyond the math.' },
    ],
  },
  {
    slug: 'paycheck-to-paycheck-calculator',
    lastReviewed: '2026-10-13',
    name: 'Paycheck Breakdown Calculator',
    tagline: 'Where every dollar of your paycheck goes, visualized.',
    category: 'Taxes',
    badge: 'P',
    calculate: paycheckdetail,
    calcKey: 'paycheckdetail',
    inputs: [
      num('gross', 'Gross pay per paycheck ($)', 3500, { min: 0, step: 50 }),
      num('pretax', 'Pre-tax deductions, 401(k), HSA ($)', 300, { min: 0, step: 25 }),
      num('taxRate', 'Estimated tax rate (%)', 22, { min: 0, max: 50, step: 1 }),
      num('posttax', 'Post-tax deductions, insurance ($)', 150, { min: 0, step: 25 }),
      num('bills', 'Bills from this paycheck ($)', 1200, { min: 0, step: 25 }),
      num('savings', 'Savings from this paycheck ($)', 400, { min: 0, step: 25 }),
      num('debt', 'Debt payments from this paycheck ($)', 300, { min: 0, step: 25 }),
      num('spending', 'Spending money from this paycheck ($)', 500, { min: 0, step: 25 }),
    ],
    metaTitle: 'Paycheck Breakdown 2026: Where Your Money Goes [Free]',
    metaDescription:
      'See exactly where each paycheck goes. Taxes, deductions & take-home visualized. Free.',
    keywords: 'paycheck breakdown calculator, where does my paycheck go, paycheck allocation calculator',
    explainer:
      'Most people know their salary and their bank balance, but the journey between the two is a blur of deductions, taxes and auto-payments. This paycheck breakdown calculator makes it visible in two steps. First it estimates your net pay: gross minus pre-tax deductions (401(k), HSA), minus a flat estimated tax rate, minus post-tax deductions like insurance premiums. Then you allocate that net pay across bills, savings, debt payments and spending money, and it shows each slice as a percentage plus whatever is left unallocated.\n\nThe unallocated number is the diagnostic. Positive means money is leaking somewhere untracked, give it a job (usually more savings). Negative means you are budgeting more than you earn, which is how credit card balances quietly grow; cut spending or bills until it hits zero. The percentages reveal your real priorities versus your stated ones: if "spending money" dwarfs savings, no budgeting app will fix what the allocation exposes. Run it per paycheck rather than monthly if you are paid biweekly, the two-extra-paychecks months become visible bonuses instead of mystery money.',
    faqs: [
      { q: 'How is net pay different from gross pay?', a: 'Gross is your salary before anything is taken out. Net (take-home) is what remains after taxes, retirement contributions, insurance and other deductions.' },
      { q: 'What are pre-tax vs post-tax deductions?', a: 'Pre-tax deductions (401(k), HSA, some insurance) reduce your taxable income. Post-tax deductions (Roth 401(k), most insurance premiums, union dues) come out after taxes.' },
      { q: 'What should I do with unallocated money?', a: 'Give it a job: usually extra savings or debt payoff. Unallocated money tends to get spent without you noticing.' },
      { q: 'What if my allocation exceeds my net pay?', a: 'You are overspending by that amount, likely funded by savings or credit. Reduce spending or bills until allocations fit inside net pay.' },
    ],
  },
  {
    slug: 'roth-vs-traditional-ira',
    lastReviewed: '2026-10-13',
    name: 'Roth vs Traditional IRA Calculator',
    tagline: 'Which IRA wins for you? Compare after-tax retirement values side by side.',
    category: 'Retirement',
    badge: 'R',
    calculate: rothvstrad,
    calcKey: 'rothvstrad',
    inputs: [
      num('age', 'Current age', 30, { min: 18, max: 80, step: 1 }),
      num('retireAge', 'Retirement age', 65, { min: 40, max: 90, step: 1 }),
      num('contrib', 'Annual contribution ($)', 7000, { min: 0, max: 50000, step: 100 }),
      num('rate', 'Expected annual return (%)', 7, { min: 0, max: 15, step: 0.5 }),
      num('nowRate', 'Current marginal tax rate (%)', 22, { min: 0, max: 50, step: 1 }),
      num('retRate', 'Expected tax rate in retirement (%)', 22, { min: 0, max: 50, step: 1 }),
    ],
    metaTitle: 'Roth vs Traditional IRA 2026: Which Is Better? [Free]',
    metaDescription:
      'Compare Roth vs Traditional IRA for your situation. Tax implications visualized. Free.',
    keywords: 'roth vs traditional ira calculator, roth or traditional ira, which ira is better, roth ira vs traditional ira comparison',
    explainer:
      'The Roth vs Traditional question is really a bet on tax rates: pay tax now (Roth) or pay tax later (Traditional). With a Traditional IRA, contributions reduce your taxable income today, the money compounds untouched, and you pay ordinary income tax on every dollar you withdraw in retirement. With a Roth, you contribute after-tax dollars, but qualified withdrawals — contributions and all growth — are tax-free forever. This calculator runs both scenarios with your numbers: same annual contribution, same return, same timeline, then taxes each side appropriately so you compare true after-tax spending power.\n\nThe rule of thumb the math reveals: if your retirement tax rate will be lower than today\'s, Traditional usually wins; if it will be higher, Roth wins; if the rates are equal, the two tie exactly — the calculator will show a $0 difference, which surprises most people. Beyond the headline number, remember the structural differences: Roth IRAs have no required minimum distributions and let your heirs inherit tax-free, while Traditional IRAs force withdrawals starting at 73 that can push you into higher brackets. Also note the 2026 IRA contribution limit is $7,000 ($8,000 if 50+), and deductibility phases out at higher incomes — this model assumes you qualify for the full deduction.',
    faqs: [
      { q: 'Is Roth or Traditional IRA better?', a: 'It depends on tax rates. Traditional wins if your retirement tax rate is lower than today; Roth wins if it will be higher. At equal rates they tie. Roth also offers tax-free withdrawals and no required minimum distributions.' },
      { q: 'What is the IRA contribution limit?', a: 'For 2026, $7,000 per year ($8,000 if age 50 or older), across all your IRAs combined. Deductibility of Traditional contributions phases out above certain incomes if you have a workplace plan.' },
      { q: 'Can I have both a Roth and Traditional IRA?', a: 'Yes. The $7,000 limit applies across both combined, and many savers split contributions to hedge against unknown future tax rates.' },
      { q: 'When can I withdraw from a Roth IRA?', a: 'Contributions can be withdrawn anytime tax- and penalty-free. Earnings are tax-free after age 59½ if the account is at least 5 years old.' },
    ],
  },
  {
    slug: 'biweekly-mortgage-calculator',
    lastReviewed: '2026-10-13',
    name: 'Biweekly Mortgage Calculator',
    tagline: 'See how paying half your mortgage every 2 weeks shaves years off your loan.',
    category: 'Home Loans',
    badge: 'B',
    calculate: biweekly,
    calcKey: 'biweekly',
    inputs: [
      num('loan', 'Loan amount ($)', 400000, { min: 10000, step: 5000 }),
      num('rate', 'Interest rate (%)', 6.5, { min: 0, max: 20, step: 0.125 }),
      num('years', 'Loan term (years)', 30, { min: 5, max: 40, step: 1 }),
    ],
    metaTitle: 'Biweekly Mortgage Calculator 2026: Pay Off Faster [Free]',
    metaDescription:
      'See how biweekly payments cut years off your mortgage. Interest savings calculated. Free.',
    keywords: 'biweekly mortgage calculator, biweekly mortgage payments, pay mortgage off early, biweekly vs monthly mortgage',
    explainer:
      'A biweekly mortgage plan is a quiet trick: instead of one monthly payment, you pay half that amount every two weeks. Because there are 26 biweekly periods in a year, you make the equivalent of 13 monthly payments instead of 12 — that one extra payment goes straight to principal, and every extra principal dollar kills all the future interest it would have accrued. This calculator simulates both schedules payment by payment: the standard monthly amortization and the biweekly version, then shows the difference in payoff time and total interest.\n\nOn a typical $400,000 loan at 6.5%, biweekly payments erase roughly six years and over $100,000 in interest — with no change to your monthly budget rhythm, since half-payments align with biweekly paychecks. Two caveats before you celebrate: confirm your lender applies the extra amount to principal (some hold it in suspense or charge a setup fee for biweekly programs — you can replicate the effect free by adding 1/12 of your payment to each monthly payment yourself), and make sure there is no prepayment penalty. If your lender resists, the DIY extra-principal route produces nearly identical savings.',
    faqs: [
      { q: 'How do biweekly mortgage payments work?', a: 'You pay half your monthly mortgage every two weeks. With 26 biweekly periods per year, you make 13 full monthly payments instead of 12, and the extra goes to principal.' },
      { q: 'How much can biweekly payments save?', a: 'On a $400,000 30-year loan at 6.5%, biweekly payments save roughly 6 years and over $100,000 in interest. Enter your own numbers above for the exact figure.' },
      { q: 'Do lenders charge for biweekly plans?', a: 'Some charge setup or per-payment fees. You can get nearly the same result free by adding one-twelfth of your monthly payment as extra principal each month.' },
      { q: 'Will my lender apply extra payments to principal?', a: 'Most do, but confirm in writing. Some hold partial payments in a suspense account until a full payment accumulates, which delays the benefit.' },
    ],
  },
  {
    slug: '1099-vs-w2-calculator',
    lastReviewed: '2026-10-16',
    name: '1099 vs W-2 Calculator',
    tagline: 'Contractor vs employee take-home pay — which one really pays more?',
    category: 'Taxes',
    badge: '⇄',
    calculate: se1099vsw2,
    calcKey: 'se1099vsw2',
    inputs: [
      num('gross', 'Annual gross pay ($)', 100000, { min: 0, step: 1000 }),
      sel('filingStatus', 'Filing status', [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'hoh', label: 'Head of household' },
      ], 'single'),
      num('stateRate', 'State tax rate, flat estimate (%)', 5, { min: 0, max: 15, step: 0.5 }),
    ],
    metaTitle: '1099 vs W-2 Calculator 2026: Contractor vs Employee Pay [Free]',
    metaDescription:
      'Compare 1099 contractor vs W-2 take-home pay side by side. See the break-even hourly rate you must charge. Free 2026 calculator.',
    keywords: '1099 vs w2 calculator, 1099 vs w2 take home pay, contractor vs employee pay calculator, w2 to 1099 conversion calculator, how much more should a 1099 charge',
    explainer:
      'A $100,000 W-2 salary and $100,000 in 1099 income are not the same money. The W-2 employee\'s employer quietly pays half of Social Security and Medicare (7.65%) behind the scenes; the 1099 contractor pays both halves themselves through self-employment tax (15.3%), which is why equal gross pay almost always leaves the contractor with less take-home. This 1099 vs W-2 calculator runs both scenarios with 2026 tax law: enter the gross pay, filing status and a flat state rate, and it shows each side\'s federal income tax, payroll taxes and take-home pay, plus the number that matters most in negotiations — the break-even multiplier, how much more the 1099 offer must pay to match the W-2.\n\nThe multiplier is the practical output. At $100,000, a single filer typically needs the 1099 rate to be about 8–10% higher just to break even on taxes — before accounting for the benefits W-2 workers get (employer health insurance, 401(k) match, paid time off, unemployment insurance). Contractors also deduct business expenses and half of self-employment tax, which narrows the gap slightly, and the calculator accounts for that deduction. Use the break-even gross when comparing a job offer against freelance work, or flip it around: if a client offers a contract rate, divide by the multiplier to see the equivalent W-2 salary. Remember this covers taxes only; add the dollar value of benefits to the W-2 side for the full comparison.',
    faqs: [
      { q: 'How much more should a 1099 contractor charge than a W-2 employee?', a: 'Roughly 8–15% more at the same gross, just to cover the extra 7.65% in payroll taxes the employer normally pays. Add the value of benefits (health insurance, 401(k) match, PTO) and most contractors target 20–30% above the equivalent W-2 salary.' },
      { q: 'Is 1099 better than W-2 if the pay is the same?', a: 'Almost never on taxes alone — the contractor keeps less at equal gross because of self-employment tax. 1099 can still win overall through higher rates, deductible business expenses, and flexibility, but the rate needs to be higher to compensate.' },
      { q: 'What is the 1099 break-even multiplier?', a: 'The factor by which a 1099 rate must exceed a W-2 salary to produce equal take-home pay. Enter your numbers above — at $100k it is typically around 1.08x–1.10x on taxes alone.' },
      { q: 'Do 1099 contractors pay more tax than employees?', a: 'Yes, effectively. Both pay the same federal income tax on the same taxable income, but contractors pay the full 15.3% Social Security + Medicare (employees pay 7.65%, employer pays the rest). Contractors do get to deduct half of SE tax and business expenses.' },
      { q: 'What about benefits in the 1099 vs W-2 comparison?', a: 'This calculator compares taxes only. A W-2 package often includes health insurance ($5k–$20k/yr value), 401(k) match, paid leave and unemployment coverage — add those to the W-2 side before deciding.' },
    ],
  },
  {
    slug: 'self-employment-tax-calculator',
    lastReviewed: '2026-10-16',
    name: 'Self-Employment Tax Calculator',
    tagline: 'How much SE tax you owe on freelance and 1099 income.',
    category: 'Taxes',
    badge: 'SE',
    calculate: selfemptax,
    calcKey: 'selfemptax',
    inputs: [
      num('netIncome', 'Net self-employment income ($)', 75000, { min: 0, step: 1000 }),
      sel('filingStatus', 'Filing status', [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'hoh', label: 'Head of household' },
      ], 'single'),
    ],
    metaTitle: 'Self-Employment Tax Calculator 2026: SE Tax Estimator [Free]',
    metaDescription:
      'Calculate 2026 self-employment tax on 1099 income: Social Security, Medicare + income tax breakdown. Free estimator, no signup.',
    keywords: 'self employment tax calculator 2026, self employment tax calculator 1099, how much is self employment tax on 100000, se tax calculator, self employment tax vs fica',
    explainer:
      'Self-employment tax is the freelancer\'s version of FICA: because no employer is withholding payroll taxes or matching them, you pay both halves yourself — 12.4% for Social Security on the first $184,500 of net earnings plus 2.9% Medicare on everything, for a combined 15.3% applied to 92.35% of your net profit. That sits on top of ordinary federal income tax, which is why the total bite surprises first-time freelancers. This self-employment tax calculator breaks all three layers apart: enter your net self-employment income (profit after business expenses) and filing status, and it shows the Social Security portion, the Medicare portion, the deductible half that lowers your income tax, your estimated federal income tax, and the combined bill.\n\nTwo details most people miss. First, only 92.35% of net earnings is subject to SE tax — the 7.65% haircut is Congress\'s rough offset for the employer half you never got to deduct. Second, you deduct half of the SE tax from your income (not from the SE tax itself) before computing income tax, which the calculator handles automatically. The Social Security wage base ($184,500 for 2026) caps only the 12.4% portion; Medicare\'s 2.9% has no cap, and earnings above $200,000 single / $250,000 joint attract an extra 0.9%. As a rule of thumb, set aside 25–30% of every freelance dollar for taxes until you run your exact numbers here.',
    faqs: [
      { q: 'How much is self-employment tax on $100,000?', a: 'About $14,130 for 2026: 15.3% × 92.35% × $100,000. That is only the SE tax — federal (and state) income tax is additional, bringing the combined bill to roughly $25,700 for a single filer taking the standard deduction.' },
      { q: 'Why is SE tax 15.3% instead of 7.65%?', a: 'Employees pay 7.65% FICA and their employer matches it behind the scenes. Self-employed people are both, so they pay the full 15.3% — but they get to deduct the employer-equivalent half for income tax purposes.' },
      { q: 'What is the 92.35% in self-employment tax?', a: 'Only 92.35% of net earnings is subject to SE tax. The 7.65% reduction is the statutory offset for the employer share of payroll tax you pay as your own employer.' },
      { q: 'Is half of self-employment tax deductible?', a: 'Yes. You deduct one-half of your SE tax from gross income (above the line) before calculating federal income tax. It does not reduce the SE tax itself.' },
      { q: 'What is the Social Security wage base for 2026?', a: '$184,500. The 12.4% Social Security portion of SE tax stops at that amount of net earnings; the 2.9% Medicare portion has no cap.' },
    ],
  },
  {
    slug: 'quarterly-estimated-tax-calculator',
    lastReviewed: '2026-10-16',
    name: 'Quarterly Estimated Tax Calculator',
    tagline: 'How much to pay each quarter, with 2026 IRS due dates.',
    category: 'Taxes',
    badge: 'Q',
    calculate: quarterlytax,
    calcKey: 'quarterlytax',
    inputs: [
      num('seIncome', 'Expected annual self-employment income ($)', 80000, { min: 0, step: 1000 }),
      num('w2Wages', 'W-2 wages, if any ($)', 0, { min: 0, step: 1000 }),
      num('w2Withholding', 'Expected W-2 withholding ($)', 0, { min: 0, step: 100 }),
      num('priorYearTax', 'Total tax on last year\'s return ($)', 15000, { min: 0, step: 500 }),
      chk('priorHighAGI', 'Prior-year AGI was over $150,000 (110% safe harbor)'),
      sel('filingStatus', 'Filing status', [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'hoh', label: 'Head of household' },
      ], 'single'),
    ],
    metaTitle: 'Quarterly Estimated Tax Calculator 2026: Payments & Due Dates [Free]',
    metaDescription:
      'Calculate 2026 quarterly estimated tax payments with safe-harbor amounts and IRS due dates (Apr/Jun/Sep/Jan). Free calculator.',
    keywords: 'quarterly estimated tax calculator, estimated tax payment calculator 1099, irs quarterly tax due dates 2026, how to calculate quarterly estimated taxes self employed',
    explainer:
      'Nobody withholds taxes from freelance income, so the IRS expects you to pay as you go — four times a year. Miss the quarterly payments and you can owe an underpayment penalty even if you pay in full at filing time. This quarterly estimated tax calculator estimates your full 2026 federal liability (self-employment tax plus income tax), then applies the safe-harbor rule that eliminates the penalty: pay the smaller of 90% of this year\'s tax or 100% of last year\'s tax (110% if your prior-year AGI topped $150,000). Enter your expected self-employment income, any W-2 wages and withholding, last year\'s total tax, and filing status, and it returns the exact amount to send each quarter.\n\nThe four 2026 due dates are April 15, June 15, and September 15, 2026, plus January 15, 2027 — note the uneven gaps, which trip people up. W-2 withholding counts toward the safe harbor, so if you have a day job, its withholding may already cover you; the calculator subtracts it automatically. If your income is lumpy or seasonal, the IRS also allows the annualized-income method (pay based on actual quarterly earnings), which can lower early payments but requires Form 2210 Schedule AI — most steady earners are fine with four equal safe-harbor payments. Pay online at IRS Direct Pay or by EFTPS, keep confirmations, and remember state estimated taxes are a separate obligation with their own dates.',
    faqs: [
      { q: 'What are the 2026 quarterly tax due dates?', a: 'April 15, 2026 (Q1), June 15, 2026 (Q2), September 15, 2026 (Q3), and January 15, 2027 (Q4). If a date falls on a weekend or holiday, the deadline shifts to the next business day.' },
      { q: 'How do I avoid the underpayment penalty?', a: 'Pay at least 90% of the current year\'s tax or 100% of last year\'s tax (110% if prior-year AGI exceeded $150,000) through withholding plus timely quarterly payments — that is the safe harbor.' },
      { q: 'How much should I pay each quarter?', a: 'Divide your required annual estimated amount by four. Enter your expected income above — the calculator applies the safe-harbor rule and shows the per-quarter figure.' },
      { q: 'Do W-2 wages affect my quarterly payments?', a: 'Yes. W-2 withholding counts toward your total required payments, so enter expected wages and withholding above — they reduce (or can eliminate) the quarterly amounts you must send.' },
      { q: 'What happens if I miss a quarterly payment?', a: 'You may owe an underpayment penalty (interest on the shortfall for the period it was late), even if you pay everything at filing time. You can catch up at the next due date to stop additional penalty from accruing.' },
    ],
  },
  {
    slug: 'roth-vs-traditional-401k-calculator',
    lastReviewed: '2026-10-16',
    name: 'Roth vs Traditional 401(k) Calculator',
    tagline: 'Which 401(k) wins for you? Fair take-home comparison with employer match.',
    category: 'Retirement',
    badge: '401k',
    calculate: roth401k,
    calcKey: 'roth401k',
    inputs: [
      num('age', 'Current age', 30, { min: 18, max: 75, step: 1 }),
      num('retireAge', 'Retirement age', 65, { min: 40, max: 85, step: 1 }),
      num('nowRate', 'Current marginal tax rate (%)', 22, { min: 0, max: 50, step: 1 }),
      num('retRate', 'Expected tax rate in retirement (%)', 22, { min: 0, max: 50, step: 1 }),
      num('contrib', 'Annual contribution ($)', 10000, { min: 0, step: 500 }),
      num('salary', 'Annual salary ($)', 80000, { min: 0, step: 1000 }),
      num('matchPct', 'Employer match (% of your contribution)', 50, { min: 0, max: 200, step: 5 }),
      num('matchCap', 'Match applies to first (% of salary)', 6, { min: 0, max: 20, step: 0.5 }),
      num('rate', 'Expected annual return (%)', 7, { min: 0, max: 15, step: 0.5 }),
    ],
    metaTitle: 'Roth vs Traditional 401(k) Calculator 2026: Which Wins? [Free]',
    metaDescription:
      'Roth vs traditional 401(k) calculator with employer match. Fair equal-take-home comparison — see which leaves you richer at retirement. Free.',
    keywords: 'roth vs traditional 401k calculator, roth or traditional 401k calculator, should i do roth or traditional 401k calculator, roth vs traditional calculator by age',
    explainer:
      'Most Roth vs Traditional calculators cheat: they compare equal contributions, but $10,000 into a Roth costs you more take-home pay than $10,000 pre-tax into a Traditional — so the comparison is rigged from the start. This Roth vs Traditional 401(k) calculator normalizes by take-home cost: it sizes the Roth contribution so both choices shrink your paycheck by the identical amount, then grows both to retirement with your expected return. It also models the employer match correctly (match dollars always land pre-tax and get taxed at withdrawal, no matter which side you pick).\n\nThe math behind the verdict is simple once the comparison is fair. If your tax rate in retirement will be lower than today, Traditional usually wins — you dodge tax at a high rate now and pay at a low rate later. If you expect higher taxes in retirement (raises, required minimum distributions, fewer deductions), Roth pulls ahead because you lock in today\'s rate. When the rates are equal, the two tie almost exactly — the calculator will show you. Play with the retirement tax rate slider: it is the single input that flips most verdicts, which is why the honest answer to "Roth or Traditional?" is always "it depends on your future tax rate."',
    faqs: [
      { q: 'Should I choose Roth or Traditional 401(k)?', a: 'It hinges on your tax rate now vs in retirement. Higher rate now → Traditional usually wins. Higher rate in retirement → Roth usually wins. Enter both rates above — the calculator gives you a personalized verdict.' },
      { q: 'Why do most Roth vs Traditional calculators get it wrong?', a: 'They compare equal contribution dollars, but a Roth dollar costs more take-home pay than a pre-tax Traditional dollar. This calculator normalizes by take-home cost so the comparison is apples to apples.' },
      { q: 'What happens to the employer match in a Roth 401(k)?', a: 'Employer matching dollars always go into a pre-tax (Traditional) account, even if your contributions are Roth. The match grows tax-deferred and is taxed as ordinary income when you withdraw it — the calculator models this.' },
      { q: 'Is Roth better for young workers?', a: 'Often yes, because young workers are usually in lower tax brackets with decades of tax-free growth ahead. But it is not automatic — a young high earner in the 32% bracket may still favor Traditional. Run your numbers above.' },
      { q: 'What tax rate should I assume for retirement?', a: 'A common starting point is your current marginal rate minus a few points (retirees often have lower taxable income), but required minimum distributions and Social Security taxation can push it up. Try a range — the verdict slider shows how sensitive the answer is.' },
    ],
  },
  {
    slug: 'side-hustle-tax-calculator',
    lastReviewed: '2026-10-16',
    name: 'Side Hustle Tax Calculator',
    tagline: 'What your gig work really keeps after self-employment + income tax.',
    category: 'Taxes',
    badge: 'SH',
    calculate: sidehustle,
    calcKey: 'sidehustle',
    inputs: [
      num('w2Salary', 'W-2 salary ($)', 60000, { min: 0, step: 1000 }),
      num('hustleIncome', 'Side hustle gross income ($)', 15000, { min: 0, step: 500 }),
      num('hustleExpenses', 'Hustle business expenses ($)', 3000, { min: 0, step: 100 }),
      sel('filingStatus', 'Filing status', [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married filing jointly' },
        { value: 'hoh', label: 'Head of household' },
      ], 'single'),
    ],
    metaTitle: 'Side Hustle Tax Calculator 2026: Gig Worker Tax Estimator [Free]',
    metaDescription:
      'How much tax will you owe on side hustle income? SE tax + income tax, quarterly estimates, and the % to set aside per dollar. Free 2026 calculator.',
    keywords: 'side hustle tax calculator, gig worker tax calculator, doordash tax calculator, uber driver tax calculator, how much should i set aside for taxes side hustle',
    explainer:
      'Gig platforms pay you the gross and withhold exactly zero — every dollar of tax on your side hustle is yours to compute and send. This side hustle tax calculator isolates what the hustle itself costs you: enter your W-2 salary (so the calculator knows your marginal bracket), the hustle\'s gross income and business expenses, and it splits the bill into self-employment tax (15.3% on 92.35% of net profit) and the extra federal income tax the hustle stacks on top of your salary. The headline number is the "set-aside rate": the percentage of every hustle dollar to move straight to a tax savings account the moment it lands.\n\nTwo things surprise most gig workers. First, the marginal bite is bigger than it looks: a $15,000 side hustle on top of a $60,000 salary can face a ~30% effective rate once SE tax and the higher bracket combine — that $15k is really about $10.5k. Second, expenses are pure gold: every deductible dollar (mileage, phone, supplies, home-office) saves you ~30 cents in combined tax, which is why tracking beats earning when it comes to take-home. Use the quarterly estimate output to stay penalty-free, and remember state tax sits on top of these federal numbers.',
    faqs: [
      { q: 'How much should I set aside for taxes on side hustle income?', a: 'A common rule is 25–30% of gross hustle income, but it depends on your total income and expenses. Enter your numbers above — the calculator gives your exact set-aside percentage.' },
      { q: 'Do I pay self-employment tax on gig work?', a: 'Yes, on net earnings of $400 or more: 15.3% (Social Security + Medicare) on 92.35% of profit, on top of ordinary income tax. Platforms like DoorDash and Uber withhold nothing.' },
      { q: 'Do I need to pay quarterly taxes on side hustle income?', a: 'If you will owe $1,000+ beyond withholding, yes — the IRS expects quarterly estimated payments (Apr/Jun/Sep/Jan). The calculator shows the hustle portion per quarter.' },
      { q: 'What expenses can I deduct from side hustle income?', a: 'Ordinary and necessary business costs: mileage, phone/internet portion, supplies, software, home-office, professional fees. Every deductible dollar saves roughly 25–35 cents in combined tax.' },
      { q: 'Is my side hustle taxed at a higher rate than my salary?', a: 'Effectively yes at the margin: hustle dollars face SE tax (15.3%) plus income tax at your top marginal bracket, while salary dollars already had employer-paid payroll tax handled. That is why the set-aside rate surprises people.' },
    ],
  },
];

export function getTool(slug) {
  return TOOLS.find((t) => t.slug === slug);
}

export function getAllToolSlugs() {
  return TOOLS.map((t) => t.slug);
}

/* Related calculators for a blog post: scores tools by meaningful word
   overlap with the post's slug, title and keywords. Takes the post meta
   object (from lib/blog) so this module never imports blog.js. */
const TOOL_STOPWORDS = new Set(
  ('the,a,an,and,or,for,to,of,in,on,is,are,was,were,be,by,with,from,at,as,it,its,this,that,these,those,how,what,when,where,which,who,can,you,your,youre,do,does,did,should,would,could,i,we,my,our,me,vs,versus,1,2,3,calculator,calculators,guide,guides,explained,difference,between,understanding,' +
    'el,la,los,las,un,una,de,del,en,que,con,por,para,como,se,sus,son,este,esta,estos,estas,ese,esa,cuando,donde,cual,quien,puede,puedes,tu,tus,hacer,hace,deberia,calculadora,calculadoras,guia,guias,explicado,diferencia,entre'
  ).split(',')
);

function toolWords(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !TOOL_STOPWORDS.has(w));
}

export function relatedToolsFor(post, limit = 3) {
  if (!post) return [];
  const postSet = new Set(toolWords([post.slug, post.title, post.keywords].join(' ')));
  if (!postSet.size) return [];
  return TOOLS.map((t) => {
    const tSet = new Set(toolWords([t.slug, t.name, t.category, t.keywords].join(' ')));
    let score = 0;
    for (const w of postSet) if (tSet.has(w)) score += w.length > 5 ? 2 : 1;
    return { tool: t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.tool);
}

export const CATEGORIES = [...new Set(TOOLS.map((t) => t.category))];
