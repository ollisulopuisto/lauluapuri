// The rhyme suggestions are a slim two-row strip: desktop header of the analysis
// panel, mobile fixed to the bottom edge; ?popup keeps the old floating popup.
// Tapping a word opens its syllables; selection stays plain native editing.
import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('strip is the default layout and ?popup opts out', () => {
  expect(html).toContain("const stripMode = !location.search.includes('popup')")
})

test('desktop: the strip is a static header of the analysis panel', () => {
  const rule = /body\.rhyme-strip #rhyme-pop \{[^}]*\}/.exec(html)
  expect(rule, 'no strip rule').toBeTruthy()
  expect(rule[0]).toMatch(/position:\s*static/)
  expect(html).toContain('<div class="panel-side">')
  expect(html).toMatch(/<div class="panel-side">\s*<div id="rhyme-pop"/)
})

test('mobile: the strip is fixed to the bottom edge, above the keyboard offset', () => {
  const rule = /@media \(max-width: 850px\) \{[\s\S]*?body\.rhyme-strip #rhyme-pop \{[^}]*\}/.exec(html)
  expect(rule, 'no mobile strip rule').toBeTruthy()
  expect(rule[0]).toMatch(/position:\s*fixed/)
  expect(rule[0]).toMatch(/bottom:\s*var\(--kb/)
})

test('the strip is two rows: syllables first, rhymes scroll horizontally below', () => {
  expect(html).toContain('</div><div class="rp-chips">${chipsHtml(status)}</div>')
  const chips = /body\.rhyme-strip #rhyme-pop \.rp-chips \{[^}]*\}/.exec(html)
  expect(chips[0]).toMatch(/overflow-x:\s*auto/)
  expect(chips[0]).toMatch(/flex-wrap:\s*nowrap/)
})

test('no rhyme part is picked until a syllable is tapped', () => {
  expect(html).toContain('Napauta tavua, josta riimi alkaa')
  expect(html).toMatch(/rs = \{ tier: 'full', breadth: 0/)
})

test('the strip follows the caret, not the selection', () => {
  expect(html).toContain("document.addEventListener('selectionchange', followCaret)")
  expect(html).not.toContain('snapSelection')
  expect(html).not.toContain('stepSyllableSelection')
  expect(html).not.toContain("input.addEventListener('dblclick'")
})

test('the strip leaves room under the page so the last lines stay reachable', () => {
  expect(html).toMatch(/body\.rhyme-strip:has\(#rhyme-pop:not\(\[hidden\]\)\)\s*\{[^}]*padding-bottom/)
})

test('write mode still hides the rhyme UI', () => {
  expect(html).toMatch(/body\.write-mode[^{]*#rhyme-pop[^{]*\{[^}]*display:\s*none/)
})

test('the zen button is hidden while the strip is open, so it cannot cover the strip', () => {
  expect(html).toMatch(/body\.rhyme-strip:has\(#rhyme-pop:not\(\[hidden\]\)\) #zen-toggle\s*\{[^}]*display:\s*none/)
})

test('syllable selection: touch-action none and in-place updates during a drag', () => {
  expect(html).toMatch(/\.rp-syls \{[^}]*touch-action:\s*none/)
  // A re-render under the dragging finger would drop the pointer: the drag handler must not call renderPopup.
  const drag = /function dragSyllables[\s\S]*?\n        \}\n/.exec(html)[0]
  expect(drag).not.toContain('renderPopup')
  expect(drag).toContain('findRhymes')
})

test('the strip no longer has a separate syllable-count row', () => {
  expect(html).toMatch(/stripMode \? '' : `<span class="rp-note">Tavuja:/)
})

test('shift+arrows adjust the rhyme part without touching the selection', () => {
  const keys = /input\.addEventListener\('keydown', \(e\) => \{\s*if \(!stripMode[\s\S]*?\n        \}\);/.exec(html)
  expect(keys, 'no shift-arrow handler').toBeTruthy()
  expect(keys[0]).toContain('e.preventDefault()')
  expect(keys[0]).toContain("e.key === 'ArrowLeft' ? 1 : -1")
  expect(keys[0]).not.toContain('setSelectionRange')
})
