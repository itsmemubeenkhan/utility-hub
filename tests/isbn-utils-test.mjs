import assert from 'node:assert/strict';
import {
  cleanIsbn,
  detectType,
  computeIsbn10CheckDigit,
  computeIsbn13CheckDigit,
  validateIsbn,
  convertIsbn10To13,
  convertIsbn13To10,
  convertIsbn,
  lookupGroup,
  splitIsbn13,
  validateBulk,
  SAMPLE_ISBN13,
  SAMPLE_ISBN10,
  SAMPLE_ISBN10_X,
} from '/home/hatch/workspace/utility-hub/lib/isbn-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

/* Cleaning and type detection. */
t('clean strips hyphens and spaces, uppercases x', () => {
  assert.equal(cleanIsbn('978-0-06-112008-4'), '9780061120084');
  assert.equal(cleanIsbn('0 8044 2957x'), '080442957X');
});
t('detectType 10 and 13', () => {
  assert.equal(detectType('0306406152'), 'isbn10');
  assert.equal(detectType('9780061120084'), 'isbn13');
  assert.equal(detectType('12345'), null);
});

/* Check-digit computation (the vectors from the task brief). */
t('ISBN-10 check digit 006112008 -> 1', () => assert.equal(computeIsbn10CheckDigit('006112008'), '1'));
t('ISBN-10 check digit 030640615 -> 2', () => assert.equal(computeIsbn10CheckDigit('030640615'), '2'));
t('ISBN-10 check digit 013468599 -> 7', () => assert.equal(computeIsbn10CheckDigit('013468599'), '7'));
t('ISBN-10 check digit 080442957 -> X', () => assert.equal(computeIsbn10CheckDigit('080442957'), 'X'));
t('ISBN-13 check digit 978006112008 -> 4', () => assert.equal(computeIsbn13CheckDigit('978006112008'), '4'));
t('ISBN-13 check digit 978030640615 -> 7', () => assert.equal(computeIsbn13CheckDigit('978030640615'), '7'));
t('ISBN-13 check digit 978013468599 -> 1', () => assert.equal(computeIsbn13CheckDigit('978013468599'), '1'));
t('check-digit fns reject wrong lengths', () => {
  assert.equal(computeIsbn10CheckDigit('123'), null);
  assert.equal(computeIsbn13CheckDigit('123'), null);
  assert.equal(computeIsbn10CheckDigit('00611200A'), null);
});

/* Verified valid ISBNs. */
t('9780061120084 valid ISBN-13 (To Kill a Mockingbird)', () => {
  const v = validateIsbn('9780061120084');
  assert.equal(v.valid, true);
  assert.equal(v.type, 'isbn13');
  assert.equal(v.converted, '0061120081');
});
t('0306406152 valid ISBN-10', () => {
  const v = validateIsbn('0306406152');
  assert.equal(v.valid, true);
  assert.equal(v.type, 'isbn10');
  assert.equal(v.converted, '9780306406157');
});
t('9780134685991 valid ISBN-13 (Effective Java)', () => {
  const v = validateIsbn('9780134685991');
  assert.equal(v.valid, true);
  assert.equal(v.converted, '0134685997');
});
t('080442957X valid ISBN-10 with X check digit', () => {
  const v = validateIsbn('080442957X');
  assert.equal(v.valid, true);
  assert.equal(v.type, 'isbn10');
});
t('hyphenated input validates', () => {
  assert.equal(validateIsbn('978-0-06-112008-4').valid, true);
  assert.equal(validateIsbn('0-306-40615-2').valid, true);
});
t('lowercase x validates', () => assert.equal(validateIsbn('080442957x').valid, true));

/* Invalid cases with exact reasons. */
t('empty reason', () => assert.equal(validateIsbn('').reason, 'empty'));
t('wrong length reason', () => assert.equal(validateIsbn('97800611200').reason, 'wrong-length'));
t('illegal character reason', () => assert.equal(validateIsbn('97800611200A4').reason, 'illegal-character'));
t('X anywhere but last in ISBN-10', () => {
  assert.equal(validateIsbn('X306406152').reason, 'illegal-x-position');
  assert.equal(validateIsbn('0306X06152').reason, 'illegal-x-position');
});
t('wrong ISBN-13 prefix', () => {
  const v = validateIsbn('9770061120084');
  assert.equal(v.valid, false);
  assert.equal(v.reason, 'wrong-prefix');
});
t('ISBN-13 checksum failure names the correct digit', () => {
  const v = validateIsbn('9780061120085');
  assert.equal(v.valid, false);
  assert.equal(v.reason, 'checksum');
  assert.equal(v.expectedCheck, '4');
  assert.equal(v.actualCheck, '5');
});
t('ISBN-10 checksum failure names the correct digit', () => {
  const v = validateIsbn('0306406153');
  assert.equal(v.valid, false);
  assert.equal(v.reason, 'checksum');
  assert.equal(v.expectedCheck, '2');
  assert.equal(v.actualCheck, '3');
});

/* Conversion. */
t('convert 10 -> 13', () => assert.equal(convertIsbn10To13('0306406152'), '9780306406157'));
t('convert 13 -> 10 (978)', () => assert.equal(convertIsbn13To10('9780061120084'), '0061120081'));
t('convert 13 -> 10 (979) returns null, no invented form', () => {
  assert.equal(convertIsbn13To10('9791090636071'), null);
});
t('convertIsbn both ways', () => {
  assert.equal(convertIsbn('0306406152'), '9780306406157');
  assert.equal(convertIsbn('9780134685991'), '0134685997');
  assert.equal(convertIsbn('not-an-isbn'), null);
});
t('979 ISBN-13 can still be valid', () => {
  assert.equal(validateIsbn('9791090636071').valid, true);
});

/* Registration groups. */
t('group 0 English (9780061120084)', () => {
  const g = lookupGroup('9780061120084');
  assert.equal(g.group, '0');
  assert.equal(g.area, 'English language');
});
t('group 3 German', () => assert.equal(lookupGroup('978-3-16-148410-0').area, 'German language'));
t('group 4 Japan', () => assert.equal(lookupGroup('978-4-06-293842-6').area, 'Japan'));
t('group 89 Korea', () => assert.equal(lookupGroup('9788912345679').area, 'Korea'));
t('group 979-10 France', () => assert.equal(lookupGroup('9791090636071').area, 'France'));
t('group 979-8 United States', () => assert.equal(lookupGroup('9798986782188').area, 'United States'));
t('unknown group returns null, never guessed', () => {
  assert.equal(lookupGroup('9789200000003'), null);
});
t('invalid ISBN has no group', () => assert.equal(lookupGroup('9780061120085'), null));

/* Prefix/group split. */
t('splitIsbn13 9780061120084', () => {
  const s = splitIsbn13('9780061120084');
  assert.equal(s.prefix, '978');
  assert.equal(s.group, '0');
  assert.equal(s.groupArea, 'English language');
  assert.equal(s.remainder, '061120084');
});
t('splitIsbn13 rejects ISBN-10', () => assert.equal(splitIsbn13('0306406152'), null));

/* Bulk validation. */
t('bulk: mixed sample, counts right', () => {
  const b = validateBulk('9780061120084\n0306406152\n9780134685991\n080442957X\n9780061120085');
  assert.equal(b.total, 5);
  assert.equal(b.valid, 4);
  assert.equal(b.invalid, 1);
  assert.equal(b.results[4].reason, 'checksum');
});
t('bulk caps at 100 lines', () => {
  const text = Array.from({ length: 120 }, () => '9780061120084').join('\n');
  assert.equal(validateBulk(text).total, 100);
});
t('bulk skips blank lines', () => {
  assert.equal(validateBulk('9780061120084\n\n0306406152\n').total, 2);
});

/* Samples exported for the component. */
t('samples are valid', () => {
  assert.equal(validateIsbn(SAMPLE_ISBN13).valid, true);
  assert.equal(validateIsbn(SAMPLE_ISBN10).valid, true);
  assert.equal(validateIsbn(SAMPLE_ISBN10_X).valid, true);
});

console.log('isbn-utils: ' + n + '/' + n + ' passed');
