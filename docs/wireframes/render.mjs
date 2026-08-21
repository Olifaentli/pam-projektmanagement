/**
 * Rendert die Wireframe-SVGs zusätzlich als PNG.
 *
 * Hintergrund: Die Entwürfe entstehen als SVG (siehe wireframe.py), weil sie
 * dort verlustfrei skalieren und versionierbar bleiben. Word verarbeitet SVG
 * je nach Version unterschiedlich zuverlässig, deshalb liegt jede Seite
 * zusätzlich als PNG in doppelter Auflösung vor.
 *
 * Aufruf:  npm run wireframes
 */
import { chromium } from 'playwright'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch()

try {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 640 },
    deviceScaleFactor: 2,
  })
  const files = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort()
  for (const file of files) {
    await page.setContent(`<body style="margin:0">${readFileSync(join(dir, file), 'utf8')}</body>`)
    await page.locator('svg').screenshot({ path: join(dir, file.replace('.svg', '.png')) })
    console.log('  ✓', file.replace('.svg', '.png'))
  }
  console.log(`\n${files.length} Wireframes als PNG in docs/wireframes/`)
} finally {
  await browser.close()
}
