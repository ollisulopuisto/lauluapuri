import { test, expect, describe } from 'vitest'
import { syllabify, wordAt, findRhymes, prepareWords } from '../rhyme.js'

const words = prepareWords([
  'kannalla', 'rannalla', 'sannalla', 'pannulla', 'kallio', 'valio', 'hallio',
  'kaunis', 'saunis', 'laulu', 'kaulus', 'talo', 'kala', 'kana', 'katu', 'kissa',
  'mänty', 'käntty', 'pöytä', 'syöttö', 'koira', 'poika', 'löytä', 'pouta', 'kuu', 'suu', 'tie', 'työ',
])
const rhymes = (word, opts) => findRhymes(words, word, opts).map((r) => r.word)

describe('wordAt', () => {
  test('finds the word under the caret, including at its edges', () => {
    const text = 'Kultaista on rannalla\nSulla kaunis'
    expect(wordAt(text, 3)).toEqual({ start: 0, end: 9, word: 'Kultaista' })
    expect(wordAt(text, 9)).toEqual({ start: 0, end: 9, word: 'Kultaista' })
    expect(wordAt(text, 14)).toEqual({ start: 13, end: 21, word: 'rannalla' })
  })
  test('does not run across a line break and returns null on whitespace-only spots', () => {
    expect(wordAt('yksi\nkaksi', 4).word).toBe('yksi')
    expect(wordAt('yksi  kaksi', 5)).toBeNull()
    expect(wordAt('', 0)).toBeNull()
  })
  test('handles ä and ö as letters', () => {
    expect(wordAt('söpö käpy', 2).word).toBe('söpö')
  })
})

describe('full rhyme', () => {
  test('breadth 2 needs the last two syllables to match from the vowel on', () => {
    expect(rhymes('kannalla', { tier: 'full', breadth: 2 }).sort()).toEqual(['rannalla', 'sannalla'])
  })
  test('breadth 1 matches by the last vowel group, so it is looser', () => {
    const r = rhymes('kannalla', { tier: 'full', breadth: 1 })
    expect(r).toEqual(expect.arrayContaining(['rannalla', 'pannulla', 'kala', 'kana']))
    expect(r).not.toContain('talo')
  })
  test('long vowels and diphthongs are kept whole (kuu/suu, tie/työ do not rhyme)', () => {
    expect(rhymes('kuu', { tier: 'full', breadth: 1 })).toEqual(['suu'])
    expect(rhymes('tie', { tier: 'full', breadth: 1 })).toEqual([])
  })
  test('consonant endings must match (kaunis, saunis)', () => {
    expect(rhymes('kaunis', { tier: 'full', breadth: 2 })).toEqual(['saunis'])
  })
  test('ä/ö words only rhyme with ä/ö words', () => {
    expect(rhymes('pöytä', { tier: 'full', breadth: 2 })).toEqual(['löytä'])
  })
  test('never suggests the word itself, regardless of case', () => {
    expect(rhymes('Kannalla', { tier: 'full', breadth: 2 })).not.toContain('kannalla')
  })
  test('a short word with high breadth falls back to its whole length instead of matching nothing', () => {
    expect(rhymes('kuu', { tier: 'full', breadth: 3 })).toEqual(['suu'])
  })
})

describe('assonance', () => {
  test('matches the vowels of the last syllables, ignoring consonants', () => {
    expect(rhymes('kala', { tier: 'assonance', breadth: 2 }).sort()).toEqual(['kana', 'kannalla', 'rannalla', 'sannalla'])
  })
  test('does not match different vowels', () => {
    expect(rhymes('kala', { tier: 'assonance', breadth: 2 })).not.toContain('talo')
  })
})

describe('alliteration', () => {
  test('matches the first letters; breadth sets how many', () => {
    expect(rhymes('kala', { tier: 'alliteration', breadth: 1 })).toContain('kissa')
    expect(rhymes('kala', { tier: 'alliteration', breadth: 1 })).not.toContain('talo')
    expect(rhymes('kala', { tier: 'alliteration', breadth: 2 }).sort()).toEqual(['kallio', 'kana', 'kannalla', 'katu', 'kaulus', 'kaunis'])
  })
})

describe('rhythm filter and sorting', () => {
  test('rhythm filter keeps only words with the same long/short pattern', () => {
    const r = rhymes('kannalla', { tier: 'full', breadth: 1, rhythm: true })
    expect(r).toContain('rannalla')
    expect(r).not.toContain('kala')
  })
  test('results are sorted by closeness of syllable count to the word', () => {
    const r = findRhymes(words, 'kannalla', { tier: 'full', breadth: 1 })
    const counts = r.map((x) => syllabify(x.word).length)
    const diffs = counts.map((c) => Math.abs(c - 3))
    expect(diffs).toEqual([...diffs].sort((a, b) => a - b))
  })
})
