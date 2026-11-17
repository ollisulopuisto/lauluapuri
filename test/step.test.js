// Shift-nuolinäppäimet askeltavat tavuvalintaa sanan sisällä: vasen kasvattaa
// riimiosaa tavu kerrallaan, oikea kutistaa. Logiikka on puhdas funktio rhyme.js:ssä;
// index.html vain kytkee sen näppäimeen. Hiiri ja kosketus eivät käytä tätä.
import { test, expect } from 'vitest'
import { stepSyllableSelection } from '../rhyme.js'

const text = 'Kultaista on rannalla\nSulla kaunis puu'
const at = (word, offset = 0) => text.indexOf(word) + offset
const ranStart = at('rannalla') // ran|nal|la, 8 letters, breaks at 0, 3, 6

test('a caret inside a word selects the last syllable on the first left step', () => {
  expect(stepSyllableSelection(text, ranStart + 5, ranStart + 5, 'left')).toMatchObject({ start: ranStart + 6, end: ranStart + 8, word: 'rannalla', breadth: 1 })
})

test('a caret at the word end also starts from the last syllable', () => {
  expect(stepSyllableSelection(text, ranStart + 8, ranStart + 8, 'left')).toMatchObject({ start: ranStart + 6, breadth: 1 })
})

test('a caret at the word start is left to the native behaviour (previous char)', () => {
  expect(stepSyllableSelection(text, ranStart, ranStart, 'left')).toBeNull()
})

test('a caret stepping right stays native (there is no selection to shrink)', () => {
  expect(stepSyllableSelection(text, ranStart + 5, ranStart + 5, 'right')).toBeNull()
})

test('left steps grow the selection one syllable at a time up to the whole word', () => {
  expect(stepSyllableSelection(text, ranStart + 6, ranStart + 8, 'left')).toMatchObject({ start: ranStart + 3, breadth: 2 })
  expect(stepSyllableSelection(text, ranStart + 3, ranStart + 8, 'left')).toMatchObject({ start: ranStart, breadth: 3 })
})

test('growing past the whole word hands back to the native behaviour with a backward anchor', () => {
  // The caller re-anchors the focus to the word start and does not preventDefault,
  // so the native Shift+Left keeps extending the selection past the word.
  expect(stepSyllableSelection(text, ranStart, ranStart + 8, 'left')).toEqual({ passthrough: true, start: ranStart, end: ranStart + 8 })
})

test('right steps shrink the selection one syllable at a time', () => {
  expect(stepSyllableSelection(text, ranStart, ranStart + 8, 'right')).toMatchObject({ start: ranStart + 3, breadth: 2 })
  expect(stepSyllableSelection(text, ranStart + 3, ranStart + 8, 'right')).toMatchObject({ start: ranStart + 6, breadth: 1 })
})

test('shrinking the last syllable collapses to a caret at the word end', () => {
  expect(stepSyllableSelection(text, ranStart + 6, ranStart + 8, 'right')).toMatchObject({ start: ranStart + 8, end: ranStart + 8, breadth: 0 })
})

test('a selection across words or lines is left to the native behaviour', () => {
  expect(stepSyllableSelection(text, at('on'), at('rannalla') + 3, 'left')).toBeNull()
  expect(stepSyllableSelection(text, at('rannalla') + 4, at('Sulla') + 2, 'left')).toBeNull()
})

test('a caret outside a word is left to the native behaviour', () => {
  expect(stepSyllableSelection('kala  puu', 5, 5, 'left')).toBeNull() // between two spaces
})

test('a mid-word selection that is not yet snapped still steps by whole syllables', () => {
  // Transient native state: offset 4 sits inside "nal" (break index 1, breadth 2)
  expect(stepSyllableSelection(text, ranStart + 4, ranStart + 7, 'left')).toMatchObject({ start: ranStart, end: ranStart + 8, breadth: 3 })
  expect(stepSyllableSelection(text, ranStart + 4, ranStart + 7, 'right')).toMatchObject({ start: ranStart + 6, breadth: 1 })
})

test('a one-syllable word selects whole, then passes through or collapses', () => {
  const p = at('puu')
  expect(stepSyllableSelection(text, p + 1, p + 1, 'left')).toMatchObject({ start: p, end: p + 3, breadth: 1 })
  expect(stepSyllableSelection(text, p, p + 3, 'left')).toEqual({ passthrough: true, start: p, end: p + 3 })
  expect(stepSyllableSelection(text, p, p + 3, 'right')).toMatchObject({ start: p + 3, end: p + 3, breadth: 0 })
})
