import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../ProgressBar'

/** Fortschrittsanzeige (US-6). */
describe('ProgressBar', () => {
  it('zeigt Prozentwert und absolute Zahlen', () => {
    render(<ProgressBar progress={{ total: 7, open: 2, inProgress: 2, done: 3, percentDone: 43 }} />)

    expect(screen.getByText('43 %')).toBeInTheDocument()
    expect(screen.getByText(/3 von 7 Aufgaben erledigt/)).toBeInTheDocument()
  })

  it('stellt ein Projekt ohne Aufgaben als 0 Prozent dar', () => {
    render(<ProgressBar progress={{ total: 0, open: 0, inProgress: 0, done: 0, percentDone: 0 }} />)

    expect(screen.getByText('0 %')).toBeInTheDocument()
    expect(screen.getByText(/0 von 0 Aufgaben erledigt/)).toBeInTheDocument()
  })

  it('beschriftet den Balken für Screenreader', () => {
    render(<ProgressBar progress={{ total: 4, open: 1, inProgress: 1, done: 2, percentDone: 50 }} />)

    expect(
      screen.getByLabelText('Fortschritt 50 Prozent, 2 von 4 Aufgaben erledigt'),
    ).toBeInTheDocument()
  })
})
