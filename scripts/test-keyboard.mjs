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
  await select(11)
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [9, 11], 'first step selects last syllable')
  await page.waitForFunction(() => !document.querySelector('#rhyme-pop').hidden && document.querySelectorAll('[data-syl].sel').length === 1)
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [6, 11], 'second step grows by syllable')
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [3, 11], 'third step selects whole word')
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [2, 11], 'fourth step extends natively beyond word')
  await select(9, 11, 'backward')
  await input.press('Shift+ArrowRight')
  assert.deepEqual(await range(), [11, 11], 'right collapses last syllable')
  await select(6, 11, 'forward')
  await input.press('Shift+ArrowRight')
  assert.deepEqual(await range(), [9, 11], 'forward mouse-origin selection also shrinks')
  await page.locator('#mode-write').click()
  await select(11)
  await input.press('Shift+ArrowLeft')
  assert.deepEqual(await range(), [10, 11], 'write mode stays character-native')
  await page.locator('#mode-edit').click()
  await select(8)
  await input.press('Control+Shift+ArrowLeft')
  assert.deepEqual(await range(), [3, 8], 'modified word-selection remains native, not a rhyme tail')
  await select(11)
  await input.evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, isComposing: true, bubbles: true, cancelable: true })))
  assert.deepEqual(await range(), [11, 11], 'IME event does not invoke syllable stepping')
  await input.evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, keyCode: 229, bubbles: true, cancelable: true })))
  assert.deepEqual(await range(), [11, 11], 'legacy IME keyCode 229 does not invoke syllable stepping')
  // Touch handles can resume after a hardware key without a pointerdown event.
  await input.press('ArrowLeft')
  await input.evaluate(el => {
    el.dispatchEvent(new Event('touchstart', { bubbles: true }))
    el.setSelectionRange(7, 10)
    el.dispatchEvent(new Event('touchend', { bubbles: true }))
  })
  await page.waitForFunction(() => {
    const el = document.querySelector('#lyrics-input')
    return el.selectionStart === 6 && el.selectionEnd === 11
  }, null, { timeout: 2000 })
  assert.deepEqual(await range(), [6, 11], 'touch selection snaps again after hardware navigation without pointerdown')
  await select(11)
  await input.press('Shift+ArrowLeft')
  await page.waitForFunction(() => document.querySelectorAll('[data-syl].sel').length === 1)
  if (process.env.CAPTURE_PATH) await page.screenshot({ path: process.env.CAPTURE_PATH, fullPage: true })
  console.log('Browser keyboard workflow passed: growth, native overflow, shrink, forward anchor, write mode, modifiers, IME and live strip.')
} finally {
  await browser.close()
  server.close()
}
