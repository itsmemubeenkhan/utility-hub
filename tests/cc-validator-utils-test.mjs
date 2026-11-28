import assert from 'node:assert/strict';
import {
  validateCard,
  validateBulk,
  detectNetwork,
  luhnSteps,
  computeCheckDigit,
  formatCardNumber,
  cleanCardNumber,
  SAMPLE_VISA,
  SAMPLE_MASTERCARD,
  SAMPLE_AMEX,
  SAMPLE_DISCOVER,
  SAMPLE_JCB,
  SAMPLE_BULK,
} from '/home/hatch/workspace/utility-hub/lib/cc-validator-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

/* Luhn vectors from the task brief. */
const PASSING = [
  ['4242424242424242', 'visa', 80],
  ['4111111111111111', 'visa', 30],
  ['378282246310005', 'amex', 60],
  ['6011111111111117', 'discover', 30],
  ['5555555555554444', 'mastercard', 60],
  ['3566002020360505', 'jcb', 50],
];
for (const [num, network, sum] of PASSING) {
  t('passes: ' + num, () => {
    const r = validateCard(num);
    assert.equal(r.valid, true);
    assert.equal(r.network, network);
    assert.equal(r.luhn.sum, sum);
    assert.equal(r.luhn.valid, true);
  });
  t('last digit changed fails: ' + num, () => {
    const bad = num.slice(0, -1) + String((Number(num[num.length - 1]) + 1) % 10);
    const r = validateCard(bad);
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'luhn-fail');
    assert.ok(r.expectedCheck);
    assert.equal(r.expectedCheck, num[num.length - 1]);
  });
}

t('Luhn steps for 4242 show the worked sum 80', () => {
  const { steps, sum, valid } = luhnSteps('4242424242424242');
  assert.equal(steps.length, 16);
  assert.equal(sum, 80);
  assert.equal(valid, true);
  const doubled = steps.filter((s) => s.doubled);
  assert.equal(doubled.length, 8);
  assert.ok(doubled.every((s) => s.digit === 4 && s.contribution === 8));
  assert.ok(steps.filter((s) => !s.doubled).every((s) => s.digit === 2 && s.contribution === 2));
});

t('computeCheckDigit rebuilds the 4242 check digit', () => {
  assert.equal(computeCheckDigit('424242424242424'), '2');
  assert.equal(computeCheckDigit('37828224631000'), '5');
  assert.equal(computeCheckDigit('abc'), null);
});

/* Network detection for all 10 networks. */
const NETWORKS = [
  ['4242424242424242', 'visa', 'Visa'],
  ['5555555555554444', 'mastercard', 'Mastercard'],
  ['2221000000000009', 'mastercard', 'Mastercard'],
  ['2720000000000005', 'mastercard', 'Mastercard'],
  ['378282246310005', 'amex', 'American Express'],
  ['6011111111111117', 'discover', 'Discover'],
  ['3566002020360505', 'jcb', 'JCB'],
  ['30000000000004', 'diners', 'Diners Club'],
  ['6200000000000005', 'unionpay', 'UnionPay'],
  ['5600000000000003', 'maestro', 'Maestro'],
  ['2200000000000004', 'mir', 'Mir'],
  ['8100000000000002', 'rupay', 'RuPay'],
];
for (const [num, key, name] of NETWORKS) {
  t('detects ' + name + ': ' + num, () => {
    assert.equal(detectNetwork(num).key, key);
    assert.equal(detectNetwork(num).name, name);
    const r = validateCard(num);
    assert.equal(r.valid, true, num + ' should be Luhn-valid');
    assert.equal(r.network, key);
  });
}

t('Mastercard 2221-2720 range edges', () => {
  assert.equal(detectNetwork('2221000000000000').key, 'mastercard');
  assert.equal(detectNetwork('2720000000000000').key, 'mastercard');
  assert.equal(detectNetwork('2220000000000000'), null);
  assert.equal(detectNetwork('2721000000000000'), null);
});
t('Discover 622126-622925 and 644-649 ranges', () => {
  assert.equal(detectNetwork('6221260000000000').key, 'discover');
  assert.equal(detectNetwork('6229250000000000').key, 'discover');
  assert.equal(detectNetwork('6440000000000000').key, 'discover');
  assert.equal(detectNetwork('6490000000000000').key, 'discover');
  assert.equal(detectNetwork('6221250000000000').key, 'unionpay');
});
t('Mir 2200-2204 range edges', () => {
  assert.equal(detectNetwork('2200000000000000').key, 'mir');
  assert.equal(detectNetwork('2204000000000000').key, 'mir');
  assert.equal(detectNetwork('2205000000000000'), null);
});
t('Amex is 15 digits only', () => {
  const r = validateCard('3782822463100050');
  assert.equal(r.network, 'amex');
  assert.equal(r.valid, false);
  assert.equal(r.reason, 'wrong-length');
  assert.deepEqual(r.expectedLengths, [15]);
  assert.deepEqual(validateCard('378282246310005').securityCode, { name: 'CID', length: 4 });
});
t('Visa 13 and 19 digit lengths accepted', () => {
  assert.equal(validateCard('4222222222222').valid, true);
  assert.equal(validateCard('4000000000000000006').valid, true);
});
t('Visa wrong length rejected', () => {
  const r = validateCard('42424242424242');
  assert.equal(r.network, 'visa');
  assert.equal(r.reason, 'wrong-length');
});
t('Diners is 14 digits', () => {
  assert.equal(validateCard('30000000000004').digits, 14);
  assert.equal(validateCard('30000000000004').valid, true);
});

/* Invalid input handling. */
t('empty input', () => assert.equal(validateCard('').reason, 'empty'));
t('letters rejected', () => assert.equal(validateCard('4242abcd42424242').reason, 'illegal-character'));
t('too short rejected', () => assert.equal(validateCard('4242424242').reason, 'too-short'));
t('too long rejected', () => assert.equal(validateCard('42424242424242424242').reason, 'too-long'));
t('unknown network with passing Luhn', () => {
  const r = validateCard('9000000000000001');
  assert.equal(r.reason, 'unknown-network');
  assert.equal(r.valid, false);
});
t('spaces and hyphens are display only', () => {
  assert.equal(validateCard('4242 4242 4242 4242').valid, true);
  assert.equal(validateCard('4242-4242-4242-4242').valid, true);
  assert.equal(cleanCardNumber('4242 4242-4242'), '424242424242');
});

/* Formatting, BIN, security code. */
t('Amex formats 4-6-5', () => assert.equal(formatCardNumber('378282246310005'), '3782 822463 10005'));
t('Visa formats 4-4-4-4', () => assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242'));
t('Diners formats 4-6-4', () => assert.equal(formatCardNumber('30000000000004'), '3000 000000 0004'));
t('partial number formats as typed', () => assert.equal(formatCardNumber('378282'), '3782 82'));
t('BIN is first 6 digits, IIN8 first 8', () => {
  const r = validateCard('4242424242424242');
  assert.equal(r.bin, '424242');
  assert.equal(r.iin8, '42424242');
  assert.equal(r.formatted, '4242 4242 4242 4242');
});
t('Visa security code is CVV 3', () => {
  assert.deepEqual(validateCard('4242424242424242').securityCode, { name: 'CVV', length: 3 });
});

/* Samples and bulk. */
t('sample constants are valid test numbers', () => {
  for (const s of [SAMPLE_VISA, SAMPLE_MASTERCARD, SAMPLE_AMEX, SAMPLE_DISCOVER, SAMPLE_JCB]) {
    assert.equal(validateCard(s).valid, true, s);
  }
});
t('bulk validates each line', () => {
  const b = validateBulk(SAMPLE_BULK);
  assert.equal(b.total, 5);
  assert.equal(b.valid, 4);
  assert.equal(b.invalid, 1);
  assert.equal(b.results[4].reason, 'luhn-fail');
});
t('bulk caps at 100 lines', () => {
  const b = validateBulk(('4242424242424242\n').repeat(150));
  assert.equal(b.total, 100);
});

console.log('cc-validator-utils: ' + n + '/' + n + ' passed');
