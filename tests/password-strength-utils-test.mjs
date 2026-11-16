/* Node tests for lib/password-strength-utils.js. Run:
   node tests/password-strength-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  COMMON_PASSWORDS, SAMPLE_STRONG, analyzePassword, entropyBits,
  formatDuration, labelForScore, poolSize, randomStrongPassword,
} from '../lib/password-strength-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

await ok('common list holds about 100 passwords', async () => {
  assert.ok(COMMON_PASSWORDS.size >= 100, 'size ' + COMMON_PASSWORDS.size);
  for (const w of ['password', '123456', 'qwerty', 'letmein', 'admin']) {
    assert.ok(COMMON_PASSWORDS.has(w), w + ' in list');
  }
});

await ok('entropy math: pool x length', async () => {
  assert.equal(poolSize('abc'), 26);
  assert.equal(poolSize('abcABC'), 52);
  assert.equal(poolSize('abcABC1'), 62);
  assert.equal(poolSize('abcABC1!'), 94);
  assert.equal(poolSize(''), 0);
  assert.equal(entropyBits(''), 0);
  assert.ok(Math.abs(entropyBits('a') - Math.log2(26)) < 0.001);
  assert.ok(Math.abs(entropyBits('abcdefgh') - 8 * Math.log2(26)) < 0.001);
  assert.ok(Math.abs(entropyBits('Ab1!Ab1!Ab1!Ab1!') - 16 * Math.log2(94)) < 0.001);
});

await ok('labels map score bands', async () => {
  assert.equal(labelForScore(0), 'very-weak');
  assert.equal(labelForScore(19), 'very-weak');
  assert.equal(labelForScore(20), 'weak');
  assert.equal(labelForScore(39), 'weak');
  assert.equal(labelForScore(40), 'fair');
  assert.equal(labelForScore(59), 'fair');
  assert.equal(labelForScore(60), 'good');
  assert.equal(labelForScore(79), 'good');
  assert.equal(labelForScore(80), 'strong');
  assert.equal(labelForScore(89), 'strong');
  assert.equal(labelForScore(90), 'very-strong');
  assert.equal(labelForScore(100), 'very-strong');
});

await ok('"password" is Very Weak with score 5 and instant crack times', async () => {
  const r = analyzePassword('password');
  assert.equal(r.score, 5);
  assert.equal(r.label, 'very-weak');
  assert.equal(r.isCommon, true);
  assert.ok(r.warnings.some((w) => w.type === 'common'), 'common warning');
  assert.ok(r.crackTimes.every((c) => c.duration.unit === 'instant'), 'all instant');
  assert.equal(r.checklist.find((c) => c.id === 'not-common').pass, false);
  assert.ok(r.tips.some((t) => t.code === 'avoid-common'));
});

await ok('"password123" contains a common password: cracked in minutes on slow hash', async () => {
  const r = analyzePassword('password123');
  assert.equal(r.label, 'very-weak');
  assert.ok(r.warnings.some((w) => w.type === 'common-part' && w.detail === 'password'), 'contains password');
  const slow = r.crackTimes.find((c) => c.id === 'slowHash');
  assert.equal(slow.duration.unit, 'minute');
  assert.ok(slow.duration.value <= 10, 'slow hash minutes: ' + slow.duration.value);
});

await ok('"Summer2024!!" is Fair: common word + year deductions', async () => {
  const r = analyzePassword('Summer2024!!');
  assert.equal(r.label, 'fair');
  assert.ok(r.score >= 40 && r.score < 60, 'score ' + r.score + ' in Fair band');
  assert.ok(r.warnings.some((w) => w.type === 'common-part' && w.detail === 'summer'), 'summer is a common password part');
  assert.ok(r.warnings.some((w) => w.type === 'year' && w.detail === '2024'), '2024 year');
  assert.ok(Math.abs(r.entropy - 12 * Math.log2(94)) < 0.1, 'entropy ' + r.entropy);
});

await ok('random 16-char mixed string is Very Strong', async () => {
  const r = analyzePassword('K7$mQ2!vX9#pL4&wR8z');
  assert.equal(r.score, 100);
  assert.equal(r.label, 'very-strong');
  assert.equal(r.warnings.length, 0);
  assert.ok(r.checklist.every((c) => c.pass), 'all 8 checks pass');
  assert.ok(r.tips.some((t) => t.code === 'strong-keep'));
  const fast = r.crackTimes.find((c) => c.id === 'fastHash');
  assert.equal(fast.duration.unit, 'trillion-years');
});

await ok('keyboard walk and sequence detected', async () => {
  const walk = analyzePassword('qwerty99!');
  assert.ok(walk.warnings.some((w) => w.type === 'keyboard'), 'qwerty walk');
  const seq = analyzePassword('Xyzabc99!');
  assert.ok(seq.warnings.some((w) => w.type === 'sequence'), 'abc sequence');
  assert.ok(seq.score < walk.score || seq.score < 90, 'deduction applied');
});

await ok('repeated characters detected and checklist fails', async () => {
  const r = analyzePassword('aaa111BBB!');
  assert.ok(r.warnings.some((w) => w.type === 'repeat' && w.detail === 'aaa'), 'aaa repeat');
  assert.equal(r.checklist.find((c) => c.id === 'no-repeat').pass, false);
  assert.ok(r.tips.some((t) => t.code === 'break-repeat'));
});

await ok('short password caps at 30 and warns', async () => {
  const r = analyzePassword('Ab1!xyz');
  assert.ok(r.score <= 30, 'score ' + r.score);
  assert.ok(r.warnings.some((w) => w.type === 'short'));
  assert.equal(r.checklist.find((c) => c.id === 'len8').pass, false);
});

await ok('empty password scores 0 with all checklist failing except not-common', async () => {
  const r = analyzePassword('');
  assert.equal(r.score, 0);
  assert.equal(r.label, 'very-weak');
  assert.equal(r.entropy, 0);
  assert.equal(r.checklist.filter((c) => c.pass).length, 2, 'only no-repeat and not-common pass vacuously');
  assert.ok(r.checklist.find((c) => c.id === 'no-repeat').pass);
  assert.ok(r.checklist.find((c) => c.id === 'not-common').pass);
  assert.ok(r.crackTimes.every((c) => c.duration.unit === 'instant'));
});

await ok('crack-time durations format across scales', async () => {
  assert.deepEqual(formatDuration(0), { value: null, unit: 'instant' });
  assert.deepEqual(formatDuration(0.5), { value: null, unit: 'instant' });
  assert.deepEqual(formatDuration(45), { value: 45, unit: 'second' });
  assert.deepEqual(formatDuration(120), { value: 2, unit: 'minute' });
  assert.deepEqual(formatDuration(7200), { value: 2, unit: 'hour' });
  assert.deepEqual(formatDuration(172800), { value: 2, unit: 'day' });
  assert.deepEqual(formatDuration(60 * 86400), { value: 2, unit: 'month' });
  assert.deepEqual(formatDuration(2 * 365.25 * 86400), { value: 2, unit: 'year' });
  assert.deepEqual(formatDuration(250 * 365.25 * 86400), { value: 3, unit: 'century' });
  assert.deepEqual(formatDuration(5000 * 365.25 * 86400), { value: 5, unit: 'thousand-years' });
  assert.deepEqual(formatDuration(2.5e6 * 365.25 * 86400), { value: 2.5, unit: 'million-years' });
  assert.deepEqual(formatDuration(3e9 * 365.25 * 86400), { value: 3, unit: 'billion-years' });
  assert.deepEqual(formatDuration(7.9e13 * 365.25 * 86400), { value: 79, unit: 'trillion-years' });
});

await ok('crack-time scenarios use the four stated rates', async () => {
  const r = analyzePassword('Tr0ub4dor&3');
  assert.equal(r.label, 'good');
  const byId = Object.fromEntries(r.crackTimes.map((c) => [c.id, c]));
  assert.equal(byId.throttled.rate, 100);
  assert.equal(byId.unthrottled.rate, 1000);
  assert.equal(byId.slowHash.rate, 10);
  assert.equal(byId.fastHash.rate, 10000000000);
  /* Same password cracks fastest on the fast hash, slowest on bcrypt. */
  assert.ok(byId.fastHash.duration.unit === 'instant' || byId.fastHash.duration.value < 100);
});

await ok('tips name what is missing', async () => {
  const r = analyzePassword('alllowercase');
  assert.ok(r.tips.some((t) => t.code === 'add-upper'));
  assert.ok(r.tips.some((t) => t.code === 'add-digit'));
  assert.ok(r.tips.some((t) => t.code === 'add-symbol'));
  assert.ok(!r.tips.some((t) => t.code === 'add-length'), '12 chars needs no length tip');
  const r2 = analyzePassword('abc');
  assert.ok(r2.tips.some((t) => t.code === 'add-length' && t.detail === '9'));
});

await ok('sample strong password is Very Strong; random generator returns mixed 16 chars', async () => {
  assert.equal(analyzePassword(SAMPLE_STRONG).label, 'very-strong');
  const gen = randomStrongPassword();
  assert.equal(gen.length, 16);
  assert.ok(/[a-z]/.test(gen) && /[A-Z]/.test(gen) && /[0-9]/.test(gen), 'mixed classes: ' + gen);
  assert.equal(analyzePassword(gen).label, 'very-strong');
});

await ok('date and year patterns detected', async () => {
  const r = analyzePassword('Sun12011990!');
  assert.ok(r.warnings.some((w) => w.type === 'date'), 'date warning');
  const y = analyzePassword('Hello1998!');
  assert.ok(y.warnings.some((w) => w.type === 'year' && w.detail === '1998'), 'year warning');
});

console.log(`\n${passed} tests passed`);
