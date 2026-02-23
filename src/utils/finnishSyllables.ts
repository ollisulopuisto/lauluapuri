export type StressLevel = 'primary' | 'secondary' | 'none';

const VOWELS = 'aeiouyäö';
const DIPHTHONGS = [
  'ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi',
  'au', 'eu', 'iu', 'ou',
  'ie', 'uo', 'yö',
  'ey', 'iy', 'äy', 'öy'
];

function isVowel(char: string): boolean {
  return char ? VOWELS.includes(char.toLowerCase()) : false;
}

export function syllabify(word: string): string[] {
  if (!word) return [];
  const chars = word.toLowerCase().replace(/[^a-zäö]/g, '').split('');
  const syllables: string[] = [];
  let currentSyllable = '';

  for (let i = 0; i < chars.length; i++) {
    currentSyllable += chars[i];
    
    const next = chars[i + 1];
    if (!next) break;

    if (isVowel(chars[i])) {
      let nextVowelIndex = -1;
      for (let j = i + 1; j < chars.length; j++) {
        if (isVowel(chars[j])) {
          nextVowelIndex = j;
          break;
        }
      }

      if (nextVowelIndex !== -1) {
        if (nextVowelIndex === i + 1) {
          const pair = chars[i] + chars[nextVowelIndex];
          if (chars[i] !== chars[nextVowelIndex] && !DIPHTHONGS.includes(pair)) {
            syllables.push(currentSyllable);
            currentSyllable = '';
          }
        }
      }
    } else {
      if (isVowel(next) && currentSyllable.length > 1) {
        const hasVowel = currentSyllable.split('').some(isVowel);
        if (hasVowel) {
          const lastChar = currentSyllable.slice(-1);
          syllables.push(currentSyllable.slice(0, -1));
          currentSyllable = lastChar;
        }
      }
    }
  }

  if (currentSyllable) {
    syllables.push(currentSyllable);
  }

  return syllables;
}

export function isLongSyllable(syllable: string): boolean {
  const chars = syllable.toLowerCase().split('');
  const vowels = chars.filter(isVowel);
  if (vowels.length === 0) return false;
  if (!isVowel(chars[chars.length - 1])) return true;
  if (vowels.length >= 2) return true;
  return false;
}

export function getStressPattern(syllables: string[]): StressLevel[] {
  return syllables.map((_, index) => {
    if (index === 0) return 'primary';
    if (index % 2 === 0) return 'secondary';
    return 'none';
  });
}

export function doRhyme(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false;
  const syl1 = syllabify(word1);
  const syl2 = syllabify(word2);
  
  const last1 = syl1[syl1.length - 1];
  const last2 = syl2[syl2.length - 1];

  if (!last1 || !last2) return false;

  return last1 === last2;
}
