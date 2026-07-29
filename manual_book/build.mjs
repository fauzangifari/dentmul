/**
 * Merender manual_book.html menjadi manual_book.pdf memakai Chrome yang
 * terpasang di komputer (lewat puppeteer-core).
 *
 * Prasyarat (sekali saja, dijalankan di folder manual_book):
 *   npm install puppeteer-core
 *
 * Lalu render ulang PDF setiap kali manual_book.html atau .css diubah:
 *   node build.mjs
 *
 * Chrome diambil dari lokasi bawaan Windows; timpa lewat variabel lingkungan
 * CHROME_PATH bila Chrome Anda terpasang di tempat lain.
 */
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const HTML = path.join(DIR, 'manual_book.html')
const PDF = path.join(DIR, 'manual_book.pdf')

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const footer = `
<div style="width:100%;font-family:'Segoe UI',sans-serif;font-size:7.5pt;color:#7c8aa5;
            padding:0 15mm;display:flex;justify-content:space-between;align-items:center;">
  <span>Manual Book DentMul · RSGM Universitas Mulawarman</span>
  <span style="font-weight:700;color:#334eac"><span class="pageNumber"></span></span>
</div>`

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--font-render-hinting=none', '--allow-file-access-from-files'],
})
const page = await browser.newPage()
await page.emulateMediaType('print')
await page.goto('file:///' + HTML.replace(/\\/g, '/'), {
  waitUntil: 'networkidle0',
  timeout: 120000,
})
// Pastikan seluruh gambar & webfont selesai dimuat sebelum dicetak.
await page.evaluate(async () => {
  await document.fonts.ready
  await Promise.all(
    [...document.images]
      .filter((i) => !i.complete)
      .map((i) => new Promise((res) => { i.onload = i.onerror = res }))
  )
})

await page.pdf({
  path: PDF,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: footer,
  margin: { top: '17mm', bottom: '20mm', left: '15mm', right: '15mm' },
})

await browser.close()

const mb = (fs.statSync(PDF).size / 1024 / 1024).toFixed(2)
console.log(`✓ manual_book.pdf (${mb} MB)`)
