import { test, expect } from 'vitest'
import { snapSelection } from '../rhyme.js'

const text = 'Kultaista on rannalla\nSulla kaunis puu'
const at = (word, offset = 0) => text.indexOf(word) + offset
const ranStart = at('rannalla') // ran|nal|la, 8 letters

test('a collapsed selection is left alone', () => {
  expect(snapSelection(text, ranStart + 2, ranStart + 2)).toBeNull()
})

test('a selection across words or lines is left to the native behaviour', () => {
  expect(snapSelection(text, at('on'), at('rannalla') + 3)).toBeNull()
  expect(snapSelection(text, at('rannalla') + 4, at('Sulla') + 2)).toBeNull()
})

test('a start inside a syllable snaps to the nearer syllable break, and the end runs to the word end', () => {
  // offset 2 is inside "ran", nearer the break at 3 than at 0
  expect(snapSelection(text, ranStart + 2, ranStart + 4)).toMatchObject({ start: ranStart + 3, end: ranStart + 8, word: 'rannalla', breadth: 2 })
  // offset 1 is nearer the word start
  expect(snapSelection(text, ranStart + 1, ranStart + 4)).toMatchObject({ start: ranStart, end: ranStart + 8, breadth: 3 })
})

test('a start in the last syllable snaps back to that syllable, never to the word end', () => {
  expect(snapSelection(text, ranStart + 7, ranStart + 8)).toMatchObject({ start: ranStart + 6, end: ranStart + 8, breadth: 1 })
})

test('a start exactly on a break stays there', () => {
  expect(snapSelection(text, ranStart + 3, ranStart + 5)).toMatchObject({ start: ranStart + 3, breadth: 2 })
})

test('a one-syllable word selects as one syllable', () => {
  expect(snapSelection(text, at('puu'), at('puu') + 2)).toMatchObject({ start: at('puu'), end: at('puu') + 3, breadth: 1 })
})

test('selecting the whole word matches every syllable', () => {
  expect(snapSelection(text, ranStart, ranStart + 8)).toMatchObject({ start: ranStart, end: ranStart + 8, breadth: 3 })
})

test('the first syllable index uses the same syllables as syllabify', () => {
  const s = 'kauniisti' // kau|nii|sti
  expect(snapSelection(s, 3, 6)).toMatchObject({ start: 3, breadth: 2 })
})

test('a start exactly between two breaks snaps to the earlier one', () => {
  expect(snapSelection('kala', 1, 3)).toMatchObject({ start: 0, breadth: 2 }) // ka|la, offset 1 is equidistant
})
