// Regression (Palette): the main editor must keep a visible focus style.
// The textarea ships with outline:none, so an explicit :focus rule is the
// only thing keeping keyboard focus visible (WCAG 2.4.7).
import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('#lyrics-input has an explicit :focus rule restoring a visible outline', () => {
  const rule = /#lyrics-input:focus\s*\{[^}]*\}/.exec(html)
  expect(rule, 'no :focus rule for #lyrics-input').toBeTruthy()
  expect(rule[0]).toMatch(/outline:\s*[^;]*solid/)
})
