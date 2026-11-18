import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const root = new URL('../', import.meta.url)
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname
    const data = await readFile(new URL('.' + (path === '/' ? '/index.html' : path), root))
    res.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : path.endsWith('.json') ? 'application/json' : path.endsWith('.txt') ? 'text/plain' : 'text/html')
    res.end(data)
  } catch { res.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${server.address().port}`)
  await page.locator('#mode-edit').click()
  const input = page.locator('#lyrics-input')
  await input.fill('on rannalla puu')
  const select = async (start, end = start, direction = 'none') => {
    await input.focus()
    await input.evaluate((el, [a, b, d]) => el.setSelectionRange(a, b, d), [start, end, direction])
  }
  const range = () => input.evaluate(el => [el.selectionStart, el.selectionEnd])
  const selCount = () => page.evaluate(() => document.querySelectorAll('[data-syl].sel').length)
  const popHidden = () => page.evaluate(() => document.querySelector('#rhyme-pop').hidden)
  // A caret placed in a word opens the strip with its syllables, none picked yet.
  await select(11)
  await page.waitForFunction(() => !document.querySelector('#rhyme-pop').hidden && document.querySelectorAll('[data-syl]').length === 3)
  assert.equal(await selCount(), 0, 'no rhyme part is picked before a syllable tap')
  await page.waitForFunction(() => document.querySelector('.rp-note')?.textContent === 'Napauta tavua, josta riimi alkaa')
  // Shift+Left/Right adjusts the rhyme part straight in the strip; the caret never moves.
  await input.press('Shift+ArrowLeft')
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 1)
  assert.deepEqual(await range(), [11, 11], 'shift+left keeps the caret in place')
  await input.press('Shift+ArrowLeft')
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 2)
  await input.press('Shift+ArrowRight')
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 1)
  assert.deepEqual(await range(), [11, 11], 'shift+right keeps the caret in place')
  // Tapping a syllable sets the rhyme part; tapping its leftmost edge again clears it.
  await page.locator('[data-syl="1"]').click()
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 2)
  await page.locator('[data-syl="1"]').click()
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 0)
  // A text selection stays native editing and does not drive the strip.
  await select(3, 11, 'backward')
  assert.equal(await selCount(), 0, 'a selection does not pick a rhyme part')
  // Modified and IME key events stay native.
  await select(8)
  await input.press('Control+Shift+ArrowLeft')
  assert.deepEqual(await range(), [3, 8], 'modified word-selection remains native')
  await select(11)
  await input.evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, isComposing: true, bubbles: true, cancelable: true })))
  assert.deepEqual(await range(), [11, 11], 'IME event does not adjust the rhyme part')
  await input.evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, keyCode: 229, bubbles: true, cancelable: true })))
  assert.deepEqual(await range(), [11, 11], 'legacy IME keyCode 229 does not adjust the rhyme part')
  // Write mode stays character-native and never opens the strip.
  await page.locator('#mode-write').click()
  await select(11)
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#rhyme-pop')).display), 'none', 'write mode keeps the strip hidden')
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [10, 11], 'write mode stays character-native')
  // Back in edit mode the caret opens the strip again.
  await page.locator('#mode-edit').click()
  await select(11)
  await page.waitForFunction(() => !document.querySelector('#rhyme-pop').hidden && document.querySelectorAll('[data-syl]').length === 3)
  await input.press('Shift+ArrowLeft')
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 1)
  if (process.env.CAPTURE_PATH) await page.screenshot({ path: process.env.CAPTURE_PATH, fullPage: true })
  console.log('Browser workflow passed: caret opens strip, syllable tap and shift+arrows adjust the rhyme part, selection and IME stay native, write mode untouched.')
} finally {
  await browser.close()
  server.close()
}
