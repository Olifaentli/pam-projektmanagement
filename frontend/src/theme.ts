import { createTheme } from '@mui/material/styles'

/**
 * Gemeinsames Design der Anwendung.
 *
 * Ein zentrales Theme ist der Kern des Arguments fuer eine
 * Komponentenbibliothek (Lektion 6.1): Farben, Abstaende und Typografie
 * werden einmal festgelegt und gelten fuer jede Komponente.
 */
export const theme = createTheme({
  palette: {
    primary: { main: '#1f4e79' },
    secondary: { main: '#b45309' },
    background: { default: '#f4f6f8' },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.35rem', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
  },
})
