/**
 * Erzeugt die Screenshots für die Dokumentation der Fallstudie.
 *
 * Reproduzierbar statt von Hand abfotografiert: Der Ablauf meldet sich mit
 * definierten Konten an, ruft jede Seite auf und speichert sie in einheitlicher
 * Auflösung. Ändert sich die Oberfläche, genügt ein erneuter Lauf.
 *
 * Voraussetzung: Backend auf :8080 und Vite auf :5173 laufen, Seed-Daten sind
 * eingespielt.
 *
 * Aufruf:  node docs/screenshots/capture.mjs
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.PAM_BASE_URL ?? 'http://localhost:5173'
const PASSWORT = 'Passwort123!'
const VIEWPORT = { width: 1440, height: 900 }

async function login(page, email) {
  await page.goto(`${BASE}/login`)
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort').fill(PASSWORT)
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10000 })
}

async function shot(page, name) {
  // Mauszeiger aus dem Weg räumen: bleibt er über einem Element stehen,
  // landet dessen Tooltip oder Hover-Zustand mit auf der Aufnahme.
  await page.mouse.move(0, 0)
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true })
  console.log('  ✓', `${name}.png`)
}

const browser = await chromium.launch()

try {
  // 1. Anmeldeseite (US-7)
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'de-DE' })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/login`)
    await shot(page, '01-anmeldung')

    // Fehlerfall: falsche Zugangsdaten
    await page.getByLabel('E-Mail').fill('admin@musterfirma.de')
    await page.getByLabel('Passwort').fill('falsch')
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await page.getByText('E-Mail oder Passwort ist falsch.').waitFor({ timeout: 5000 })
    await shot(page, '02-anmeldung-fehler')
    await ctx.close()
  }

  // 2. Sicht der Projektleitung
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'de-DE' })
    const page = await ctx.newPage()
    await login(page, 'leitung@musterfirma.de')
    await shot(page, '03-uebersicht-projektleitung')

    await page.getByRole('button', { name: 'Projekte' }).click()
    await page.waitForURL('**/projects')
    await shot(page, '04-projektliste')

    await page.getByRole('button', { name: 'Projekt anlegen' }).click()
    await page.getByLabel('Projektname').waitFor()
    await shot(page, '05-projekt-anlegen')
    await page.getByRole('button', { name: 'Abbrechen' }).click()

    await page.getByText('Webshop-Relaunch Kunde Nordlicht').click()
    await page.waitForURL(/\/projects\/\d+/)
    await shot(page, '06-projektdetail-aufgabenboard')

    await page.getByRole('button', { name: 'Mitarbeitende' }).click()
    await page.getByText('Mitarbeitende zuordnen').waitFor()
    await shot(page, '07-mitarbeitende-zuordnen')
    await page.getByRole('button', { name: 'Abbrechen' }).click()

    await page.getByRole('button', { name: 'Aufgabe anlegen' }).click()
    await page.getByLabel('Titel').waitFor()
    await shot(page, '08-aufgabe-anlegen')
    await ctx.close()
  }

  // 3. Sicht der Administration (US-1)
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'de-DE' })
    const page = await ctx.newPage()
    await login(page, 'admin@musterfirma.de')
    await page.getByRole('button', { name: 'Benutzerverwaltung' }).click()
    await page.waitForURL('**/admin/users')
    await shot(page, '09-benutzerverwaltung')

    await page.getByRole('button', { name: 'Benutzer anlegen' }).click()
    await page.getByLabel('Vorname').waitFor()
    await shot(page, '10-benutzer-anlegen')
    await ctx.close()
  }

  // 4. Sicht Mitarbeitende: eingeschränkte Projektliste, keine Administration (US-8)
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'de-DE' })
    const page = await ctx.newPage()
    await login(page, 'dev3@musterfirma.de')
    await page.goto(`${BASE}/projects`)
    await shot(page, '11-projektliste-mitarbeitende')

    // Direktaufruf eines fremden Projekts wird abgewiesen
    await page.goto(`${BASE}/projects/1`)
    await page.waitForTimeout(1200)
    await shot(page, '12-zugriff-verweigert')
    await ctx.close()
  }

  console.log('\nAlle Screenshots liegen in docs/screenshots/')
} finally {
  await browser.close()
}
