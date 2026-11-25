import assert from 'node:assert/strict';
import {
  caesarShift,
  rot13,
  rot5,
  rot18,
  rot47,
  transform,
  rot13Pairs,
  crackCaesar,
  SAMPLE_ROT13,
  SAMPLE_SPOILER,
  SAMPLE_CAESAR3,
  SAMPLE_CRACKER,
} from '/home/hatch/workspace/utility-hub/lib/rot13-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; console.log('ok - ' + name); };

// ROT13
t('ROT13 decodes the classic example', () => {
  assert.equal(rot13(SAMPLE_ROT13), 'Hello, World!');
});
t('ROT13 is its own inverse (round trip)', () => {
  const plain = 'The quick brown fox jumps over the lazy dog 123!';
  assert.equal(rot13(rot13(plain)), plain);
});
t('ROT13 preserves case and punctuation', () => {
  assert.equal(rot13('AbC xYz!'), 'NoP kLm!');
});
t('ROT13 decodes the spoiler sample', () => {
  assert.equal(rot13(SAMPLE_SPOILER), 'The quick brown fox jumps over the lazy dog.');
});

// Caesar
t('Caesar shift 3: Hello becomes Khoor', () => {
  assert.equal(caesarShift('Hello', 3), 'Khoor');
  assert.equal(caesarShift(SAMPLE_CAESAR3, 23), 'Hello, World!');
});
t('Caesar shift 0 is identity', () => {
  assert.equal(caesarShift('Hello, World!', 0), 'Hello, World!');
});
t('Caesar shift 26 wraps to 0', () => {
  assert.equal(caesarShift('Hello', 26), 'Hello');
});
t('Caesar shift 29 wraps to 3', () => {
  assert.equal(caesarShift('Hello', 29), 'Khoor');
});
t('Caesar decode inverts encode', () => {
  const plain = 'Attack at dawn, meet at the old bridge.';
  assert.equal(transform(transform(plain, 'caesar', 7, 'encode'), 'caesar', 7, 'decode'), plain);
});
t('Caesar leaves digits and punctuation alone', () => {
  assert.equal(caesarShift('Hello 123!', 3), 'Khoor 123!');
});

// ROT5 / ROT18 / ROT47
t('ROT5 shifts digits by 5', () => {
  assert.equal(rot5('0123456789'), '5678901234');
  assert.equal(rot5('Call 555-1234'), 'Call 000-6789');
});
t('ROT5 leaves letters alone', () => {
  assert.equal(rot5('Hello'), 'Hello');
});
t('ROT5 is its own inverse', () => {
  assert.equal(rot5(rot5('Phone 867-5309')), 'Phone 867-5309');
});
t('ROT18 shifts letters and digits', () => {
  assert.equal(rot18('Hello 123'), 'Uryyb 678');
});
t('ROT18 is its own inverse', () => {
  const plain = 'Meet at 9pm, room 42.';
  assert.equal(rot18(rot18(plain)), plain);
});
t('ROT47 round trip', () => {
  const plain = 'Hello, World! 123 ~ test.';
  assert.equal(rot47(rot47(plain)), plain);
});
t('ROT47 shifts printable ASCII', () => {
  assert.equal(rot47('A'), 'p');
  assert.equal(rot47('p'), 'A');
  assert.equal(rot47('Hello'), 'w6==@');
});
t('ROT47 leaves spaces and newlines alone', () => {
  assert.equal(rot47('a b\nc'), '2 3\n4');
});

// transform dispatch
t('transform handles every variant', () => {
  assert.equal(transform('Hello', 'rot13'), 'Uryyb');
  assert.equal(transform('123', 'rot5'), '678');
  assert.equal(transform('Hello 1', 'rot18'), 'Uryyb 6');
  assert.equal(transform('A', 'rot47'), 'p');
  assert.equal(transform('Hello', 'caesar', 3, 'encode'), 'Khoor');
  assert.equal(transform('Khoor', 'caesar', 3, 'decode'), 'Hello');
  assert.equal(transform('Khoor', 'caesar', 3, 'encode'), 'Nkrru');
});
t('transform decode equals encode for self-inverse variants', () => {
  assert.equal(transform('Uryyb', 'rot13', 13, 'decode'), 'Hello');
  assert.equal(transform('678', 'rot5', 5, 'decode'), '123');
});

// Non-ASCII / emoji passthrough
t('emoji and accented letters pass through unchanged', () => {
  assert.equal(rot13('café 👋 naïve'), 'pnsé 👋 anïir');
  assert.equal(caesarShift('¡Hola! 👋', 5), '¡Mtqf! 👋');
  assert.equal(rot47('café 👋'), '427é 👋');
});
t('ROT5 and ROT18 leave emoji alone', () => {
  assert.equal(rot5('🎉 2026'), '🎉 7571');
  assert.equal(rot18('🎉 Hi 2'), '🎉 Uv 7');
});

// Empty input
t('empty input returns empty for every variant', () => {
  assert.equal(rot13(''), '');
  assert.equal(caesarShift('', 5), '');
  assert.equal(rot5(''), '');
  assert.equal(rot18(''), '');
  assert.equal(rot47(''), '');
  assert.equal(transform('', 'caesar', 3), '');
});

// ROT wheel pairs
t('ROT13 wheel has 13 pairs A-N through M-Z', () => {
  const pairs = rot13Pairs();
  assert.equal(pairs.length, 13);
  assert.deepEqual(pairs[0], { plain: 'A', cipher: 'N' });
  assert.deepEqual(pairs[12], { plain: 'M', cipher: 'Z' });
  assert.equal(rot13(pairs[0].plain), pairs[0].cipher);
});

// Cracker
t('cracker tries all 25 shifts', () => {
  const results = crackCaesar('Khoor');
  assert.equal(results.length, 25);
  assert.deepEqual(results.map((r) => r.shift).sort((a, b) => a - b), Array.from({ length: 25 }, (_, i) => i + 1));
});
t('cracker ranks shift 3 first on the sample ciphertext', () => {
  const results = crackCaesar(SAMPLE_CRACKER);
  assert.equal(results[0].shift, 3);
  assert.equal(results[0].text, 'The quick brown fox jumps over the lazy dog. This is a secret message for testing the cracker.');
});
t('cracker ranks ROT13 shift 13 first', () => {
  const cipher = rot13('Congratulations, you have found the hidden treasure buried under the old oak tree near the river.');
  const results = crackCaesar(cipher);
  assert.equal(results[0].shift, 13);
});
t('cracker ranks shift 7 first on a long ciphertext', () => {
  const plain = 'The weather today is warm and sunny with a light breeze from the west, perfect for a walk in the park after lunch.';
  const results = crackCaesar(caesarShift(plain, 7));
  assert.equal(results[0].shift, 7);
  assert.equal(results[0].text, plain);
});
t('cracker on empty input returns 25 empty candidates', () => {
  const results = crackCaesar('');
  assert.equal(results.length, 25);
  assert.ok(results.every((r) => r.text === ''));
});

console.log('\nrot13-utils: ' + n + '/' + n + ' passed');
