/* Pure ROT13 / Caesar cipher helpers (no DOM, so they run in both browser
   and node). ROT13 shifts each letter by 13 places, which is exactly half
   the alphabet, so encoding and decoding are the same operation: applying
   ROT13 twice returns the original text. A general Caesar shift moves
   letters by any shift from 0 to 25 and decodes with 26 minus the shift.
   ROT5 shifts digits by 5, ROT18 combines ROT13 letters with ROT5 digits,
   and ROT47 shifts every printable ASCII character (codes 33 to 126) by 47
   places, which is half of the 94 printable characters, so it is also its
   own inverse. Characters outside a variant's alphabet pass through
   unchanged, including accented letters, emoji and other non-ASCII text.
   The cracker tries all 25 Caesar shifts and ranks each candidate by a
   chi-squared score against English letter frequencies, minus a bonus for
   every common English word found, so the true plaintext normally ranks
   first. ROT13 is obfuscation, not encryption: anyone can reverse it. */

export const SAMPLE_ROT13 = 'Uryyb, Jbeyq!';
export const SAMPLE_SPOILER = 'Gur dhvpx oebja sbk whzcf bire gur ynml qbt.';
export const SAMPLE_CAESAR3 = 'Khoor, Zruog!';
export const SAMPLE_CRACKER =
  'Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj. Wklv lv d vhfuhw phvvdjh iru whvwlqj wkh fudfnhu.';

/* English letter frequencies in percent (standard corpus values). */
const ENGLISH_FREQ = [
  8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03,
  2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15,
  1.97, 0.07,
];

const COMMON_WORDS = new Set(
  ('the,be,to,of,and,a,in,that,have,i,it,for,not,on,with,he,as,you,do,at,' +
    'this,but,his,by,from,they,we,say,her,she,or,an,will,my,one,all,would,' +
    'there,their,what,so,up,out,if,about,who,get,which,go,me,when,make,can,' +
    'like,time,no,just,him,know,take,people,into,year,your,good,some,could,' +
    'them,see,other,than,then,now,look,only,come,its,over,think,also,back,' +
    'after,use,two,how,our,work,first,well,way,even,new,want,because,any,' +
    'these,give,day,most,us,is,was,are,were,been,has,had,hello,world,secret,' +
    'message,quick,brown,fox,jumps,over,lazy,dog,hidden,treasure,river,tree,' +
    'found,testing,cracker,decode,encoded,caesar,cipher,shift,letters').split(',')
);

/* Shift letters only, preserving case. shift is normalized mod 26. */
export function caesarShift(text, shift) {
  const s = ((Number(shift) || 0) % 26 + 26) % 26;
  if (s === 0) return String(text ?? '');
  return String(text ?? '').replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + ((ch.charCodeAt(0) - base + s) % 26));
  });
}

export function rot13(text) {
  return caesarShift(text, 13);
}

/* Shift digits only, by 5 places (self-inverse, like ROT13). */
export function rot5(text) {
  return String(text ?? '').replace(/[0-9]/g, (ch) =>
    String.fromCharCode(48 + ((ch.charCodeAt(0) - 48 + 5) % 10))
  );
}

/* ROT18: ROT13 on letters plus ROT5 on digits. */
export function rot18(text) {
  return rot5(rot13(text));
}

/* Shift every printable ASCII character (33 to 126) by 47 places. */
export function rot47(text) {
  return String(text ?? '').replace(/[!-~]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String.fromCharCode(33 + ((code - 33 + 47) % 94));
  });
}

/* Apply a variant. variant is 'caesar', 'rot13', 'rot5', 'rot18' or
   'rot47'. direction is 'encode' or 'decode'. For Caesar, decoding uses
   26 minus the shift; every other variant is its own inverse, so decode
   equals encode. */
export function transform(text, variant, shift = 13, direction = 'encode') {
  const src = String(text ?? '');
  if (variant === 'caesar') {
    const s = ((Number(shift) || 0) % 26 + 26) % 26;
    return caesarShift(src, direction === 'decode' ? (26 - s) % 26 : s);
  }
  if (variant === 'rot5') return rot5(src);
  if (variant === 'rot18') return rot18(src);
  if (variant === 'rot47') return rot47(src);
  return rot13(src);
}

/* ROT13 letter pairs for the wheel table: A pairs with N, B with O, and
   so on through M with Z. */
export function rot13Pairs() {
  const pairs = [];
  for (let i = 0; i < 13; i += 1) {
    pairs.push({ plain: String.fromCharCode(65 + i), cipher: String.fromCharCode(78 + i) });
  }
  return pairs;
}

/* Chi-squared score of a candidate plaintext against English letter
   frequencies. Lower is more English-like. */
function chiSquared(text) {
  const counts = new Array(26).fill(0);
  let total = 0;
  for (const ch of String(text)) {
    const code = ch.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) {
      counts[code - 97] += 1;
      total += 1;
    }
  }
  if (total === 0) return Infinity;
  let score = 0;
  for (let i = 0; i < 26; i += 1) {
    const expected = (total * ENGLISH_FREQ[i]) / 100;
    score += ((counts[i] - expected) * (counts[i] - expected)) / expected;
  }
  return score;
}

/* Count whole-word hits against the common-word list. */
function commonWordHits(text) {
  const words = String(text).toLowerCase().match(/[a-z]+/g) || [];
  let hits = 0;
  for (const w of words) if (COMMON_WORDS.has(w)) hits += 1;
  return hits;
}

/* Try every Caesar shift from 1 to 25 and rank the decodings, best first.
   Returns [{ shift, text, score }]. shift is the encryption shift that
   produced the ciphertext, so decoding shift 3 means the text was encoded
   with shift 3. */
export function crackCaesar(ciphertext) {
  const src = String(ciphertext ?? '');
  const results = [];
  for (let shift = 1; shift <= 25; shift += 1) {
    const text = caesarShift(src, (26 - shift) % 26);
    const score = chiSquared(text) - 40 * commonWordHits(text);
    results.push({ shift, text, score });
  }
  results.sort((a, b) => a.score - b.score);
  return results;
}
