import { describe, it, expect } from 'vitest';
import { syllabify, isLongSyllable, getStressPattern, doRhyme } from './finnishSyllables';

describe('finnishSyllables', () => {
  // ... existing tests ...
  describe('syllabify', () => {
    it('splits basic words correctly', () => {
      expect(syllabify('laulu')).toEqual(['lau', 'lu']);
      expect(syllabify('apuri')).toEqual(['a', 'pu', 'ri']);
      expect(syllabify('suomenkielinen')).toEqual(['suo', 'men', 'kie', 'li', 'nen']);
    });

    it('handles consonant clusters', () => {
      expect(syllabify('kartta')).toEqual(['kart', 'ta']);
      expect(syllabify('sisko')).toEqual(['sis', 'ko']);
      expect(syllabify('lentokone')).toEqual(['len', 'to', 'ko', 'ne']);
    });
  });

  describe('isLongSyllable', () => {
    it('identifies short syllables', () => {
      expect(isLongSyllable('ma')).toBe(false);
      expect(isLongSyllable('ka')).toBe(false);
    });

    it('identifies long syllables (long vowel)', () => {
      expect(isLongSyllable('maa')).toBe(true);
      expect(isLongSyllable('kuu')).toBe(true);
    });

    it('identifies long syllables (diphthong)', () => {
      expect(isLongSyllable('lau')).toBe(true);
      expect(isLongSyllable('tie')).toBe(true);
    });

    it('identifies long syllables (ends in consonant)', () => {
      expect(isLongSyllable('lak')).toBe(true);
      expect(isLongSyllable('nen')).toBe(true);
    });
  });

  describe('getStressPattern', () => {
    it('assigns primary stress to first syllable', () => {
      const syllables = ['la', 'u', 'lu']; // Simplified for testing stress
      const patterns = getStressPattern(syllables);
      expect(patterns[0]).toBe('primary');
    });

    it('assigns secondary stress correctly', () => {
      const syllables = ['suo', 'men', 'kie', 'li', 'nen'];
      const patterns = getStressPattern(syllables);
      expect(patterns[0]).toBe('primary');
      expect(patterns[2]).toBe('secondary');
      expect(patterns[4]).toBe('secondary');
    });
  });

  describe('doRhyme', () => {
    it('identifies simple rhymes', () => {
      expect(doRhyme('talo', 'palo')).toBe(true);
      expect(doRhyme('ranta', 'kanta')).toBe(true);
      expect(doRhyme('kukka', 'sukka')).toBe(true);
    });

    it('identifies non-rhymes', () => {
      expect(doRhyme('talo', 'tila')).toBe(false);
      expect(doRhyme('ranta', 'rento')).toBe(false);
    });

    it('handles different word lengths', () => {
       expect(doRhyme('pukki', 'hukkasi')).toBe(false);
       expect(doRhyme('omena', 'peruna')).toBe(true); // "na" rhymes
    });
  });
});
