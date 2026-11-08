// Regression (Palette): buttons and interactive elements must have visible focus indicators
// and icon-only buttons must have accessible names via aria-label (WCAG 2.4.7, WCAG 4.1.2).
import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('buttons and interactive elements have focus-visible styling', () => {
  const rule = /\.btn:focus-visible[^{]*\{[^}]*\}/.exec(html)
  expect(rule, 'no :focus-visible rule for .btn').toBeTruthy()
  expect(rule[0]).toMatch(/outline:\s*2px\s+solid\s+var\(--action-color\)/)
})

test('icon-only buttons have accessible aria-labels', () => {
  expect(html).toMatch(/<button[^>]*id="btn-copy"[^>]*aria-label="[^"]+"/)
  expect(html).toMatch(/<button[^>]*id="zen-toggle"[^>]*aria-label="[^"]+"/)
})
