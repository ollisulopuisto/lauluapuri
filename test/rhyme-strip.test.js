// The rhyme suggestions are a slim strip on the bottom edge by default, so they
// never cover the text being written; ?popup keeps the old floating popup.
import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('strip is the default layout and ?popup opts out', () => {
  expect(html).toContain("const stripMode = !location.search.includes('popup')")
})

test('the strip is fixed to the bottom edge, above the keyboard offset', () => {
  const rule = /body\.rhyme-strip #rhyme-pop \{[^}]*\}/.exec(html)
  expect(rule, 'no strip rule').toBeTruthy()
  expect(rule[0]).toMatch(/position:\s*fixed/)
  expect(rule[0]).toMatch(/bottom:\s*var\(--kb/)
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
