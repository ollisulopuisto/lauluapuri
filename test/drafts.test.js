import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { readDrafts, saveDraft, DRAFTS_KEY, MAX_DRAFTS } from '../drafts.js'

const memory = (initial = {}, { failWrites = false } = {}) => {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      if (failWrites) throw new DOMException('full', 'QuotaExceededError')
      data[k] = String(v)
    },
  }
}

test('corrupt or truncated draft JSON reads as no drafts instead of throwing', () => {
  expect(readDrafts(memory({ [DRAFTS_KEY]: '[{"t":1,"te' }))).toEqual([])
  expect(readDrafts(memory({ [DRAFTS_KEY]: '{"not":"a list"}' }))).toEqual([])
  expect(readDrafts(memory())).toEqual([])
})

test('malformed entries are dropped, good ones kept', () => {
  const raw = JSON.stringify([{ t: 2, text: 'ok' }, null, { t: 'x', text: 'bad time' }, { t: 1 }, { t: 1, text: 'also ok' }])
  expect(readDrafts(memory({ [DRAFTS_KEY]: raw })).map((d) => d.text)).toEqual(['ok', 'also ok'])
})

test('a saved draft goes first and older ones keep their order', () => {
  const s = memory()
  saveDraft(s, 'one', 1)
  saveDraft(s, 'two', 2)
  expect(readDrafts(s).map((d) => d.text)).toEqual(['two', 'one'])
})

test('the same text twice in a row is saved once; blank text is never saved', () => {
  const s = memory()
  saveDraft(s, 'one', 1)
  saveDraft(s, 'one', 2)
  saveDraft(s, '  \n ', 3)
  expect(readDrafts(s)).toEqual([{ t: 1, text: 'one' }])
  saveDraft(s, 'two', 4)
  saveDraft(s, 'one', 5) // not the newest any more, so it is a new version
  expect(readDrafts(s).map((d) => d.text)).toEqual(['one', 'two', 'one'])
})

test('the 51st draft drops the oldest', () => {
  const s = memory()
  for (let i = 1; i <= MAX_DRAFTS + 1; i++) saveDraft(s, `draft ${i}`, i)
  const drafts = readDrafts(s)
  expect(drafts).toHaveLength(MAX_DRAFTS)
  expect(drafts[0].text).toBe(`draft ${MAX_DRAFTS + 1}`)
  expect(drafts.at(-1).text).toBe('draft 2')
})

test('a full storage keeps the old drafts and does not throw', () => {
  const s = memory({ [DRAFTS_KEY]: JSON.stringify([{ t: 1, text: 'kept' }]) }, { failWrites: true })
  expect(saveDraft(s, 'new', 2)).toEqual([{ t: 1, text: 'kept' }])
  expect(readDrafts(s)).toEqual([{ t: 1, text: 'kept' }])
})

test('the deploy workflow copies every local module index.html imports', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const deploy = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  const copied = /cp (index\.html[^\n]*) _site\//.exec(deploy)[1].split(/\s+/)
  const imported = [...html.matchAll(/from '\.\/([\w.-]+\.js)'/g)].map((m) => m[1])
  expect(imported.length).toBeGreaterThan(1)
  for (const file of imported) expect(copied, file).toContain(file)
})
