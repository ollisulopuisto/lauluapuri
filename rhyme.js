// Lauluapurin tavutus- ja riimilogiikka. Selain ja testit käyttävät samaa tiedostoa.
export const VOWELS = 'aeiouyäö';
const DIPHTHONGS = new Set(['ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi', 'au', 'eu', 'iu', 'ou', 'ie', 'uo', 'yö', 'ey', 'iy', 'äy', 'öy']);
export const isVowel = (c) => c ? VOWELS.includes(c.toLowerCase()) : false;

// Optimized syllabification: direct indexing without allocating char arrays,
// O(1) diphthong set lookups, and state tracking to avoid repetitive vowel scans.
export function syllabify(word) {
    if (!word) return [];
    const clean = word.toLowerCase().replace(/[^a-zäö]/g, '');
    const len = clean.length;
    if (len === 0) return [];
    const syllables = [];
    let current = '', currentHasVowel = false;
    for (let i = 0; i < len; i++) {
        const ch = clean[i];
        current += ch;
        const chIsVowel = isVowel(ch);
        if (chIsVowel) currentHasVowel = true;
        const next = i + 1 < len ? clean[i + 1] : '';
        if (!next) break;
        if (chIsVowel) {
            if (isVowel(next) && ch !== next && !DIPHTHONGS.has(ch + next)) {
                syllables.push(current); current = ''; currentHasVowel = false;
            }
        } else if (isVowel(next) && current.length > 1 && currentHasVowel) {
            syllables.push(current.slice(0, -1)); current = ch; currentHasVowel = false;
        }
    }
    if (current) syllables.push(current);
    return syllables;
}

export const isLong = (s) => { const v = s.toLowerCase().split('').filter(isVowel); return v.length > 0 && (!isVowel(s.slice(-1)) || v.length >= 2); };
export const getStress = (syls) => syls.map((_, i) => i === 0 ? 'primary' : (i % 2 === 0 ? 'secondary' : 'none'));
export const getRhymePart = (s) => { const idx = s.split('').findIndex(isVowel); return idx === -1 ? s : s.slice(idx); };
export const getRhymeScore = (syls1, syls2) => {
    if (!syls1.length || !syls2.length) return 0;
    let score = 0; const len = Math.min(syls1.length, syls2.length);
    for (let i = 1; i <= len; i++) {
        const s1 = syls1[syls1.length - i], s2 = syls2[syls2.length - i];
        if (i < len) { if (s1 === s2) score++; else { if (score > 0) return score; if (i === 1 && getRhymePart(s1) === getRhymePart(s2)) score++; else return 0; }
        } else { if (getRhymePart(s1) === getRhymePart(s2)) score++; else return score; }
    }
    return score;
};

// --- Riimihaku ---
const LETTER = /[A-Za-zÄÖäö]/

// Sana kursorin kohdalla (tai heti sen jälkeen/edellä). Ei ylitä rivinvaihtoa.
export function wordAt(text, pos) {
    let start = pos, end = pos
    while (start > 0 && LETTER.test(text[start - 1])) start--
    while (end < text.length && LETTER.test(text[end])) end++
    return start === end ? null : { start, end, word: text.slice(start, end) }
}

// Tavutetaan sanalista kerran, jotta haku on vain suodatus.
export const prepareWords = (list) => list.map((word) => {
    const syls = syllabify(word)
    return { word, syls, pattern: syls.map((s) => isLong(s) ? '-' : 'u').join('') }
})

const keyOf = { // laajuus b = montako viimeistä tavua (tai sanan alkukirjainta) täsmää
    full: (w, b) => { const n = Math.min(b, w.syls.length); return getRhymePart(w.syls[w.syls.length - n]) + w.syls.slice(w.syls.length - n + 1).join('') },
    assonance: (w, b) => w.syls.slice(-b).join('').replace(/[^aeiouyäö]/g, ''),
    alliteration: (w, b) => w.word.slice(0, b),
}

export function findRhymes(words, word, { tier = 'full', breadth = 2, rhythm = false } = {}) {
    const target = prepareWords([word.toLowerCase()])[0]
    const key = keyOf[tier](target, breadth)
    if (!key) return []
    return words
        .filter((w) => w.word !== target.word && keyOf[tier](w, breadth) === key && (!rhythm || w.pattern === target.pattern))
        .map((w) => ({ word: w.word, diff: Math.abs(w.syls.length - target.syls.length) }))
        .sort((a, b) => a.diff - b.diff || a.word.length - b.word.length || a.word.localeCompare(b.word, 'fi'))
}

// Napautus tavurajoihin: valinnan alku siirtyy lähimmälle tavuvälille ja loppu sanan loppuun,
// koska riimi täsmää aina sanan lopusta. Palauttaa null, jos valinta on tyhjä tai ylittää sanan.
// Kun inside on tosi, alku on se tavu, jonka sisällä se on (kaksoisnapsautus), ei lähin raja.
export function snapSelection(text, start, end, inside = false) {
    if (start >= end) return null
    const hit = wordAt(text, start)
    if (!hit || end > hit.end) return null
    const syls = syllabify(hit.word)
    const breaks = syls.map((_, i) => syls.slice(0, i).join('').length) // jokaisen tavun alku
    const at = start - hit.start
    const i = inside
        ? breaks.reduce((best, b, j) => b <= at ? j : best, 0)
        : breaks.reduce((best, b, j) => Math.abs(b - at) < Math.abs(breaks[best] - at) ? j : best, 0)
    return { start: hit.start + breaks[i], end: hit.end, word: hit.word, wordStart: hit.start, breadth: syls.length - i }
}
