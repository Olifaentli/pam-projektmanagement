import { createTheme } from '@mui/material/styles'
import type { TaskStatusName } from './api/types'

/**
 * Gemeinsames Design der Anwendung.
 *
 * Ein zentrales Theme ist der Kern des Arguments fuer eine
 * Komponentenbibliothek (Lektion 6.1): Farben, Abstaende, Rundungen und
 * Typografie werden einmal festgelegt und gelten fuer jede Komponente.
 * Eine Aenderung hier wirkt sofort auf die gesamte Oberflaeche.
 */

/** Dunkles Marineblau als Leitfarbe, Petrol als Akzent. */
const NAVY = {
  main: '#123A5F',
  light: '#2E5D87',
  dark: '#0A2440',
  contrastText: '#FFFFFF',
}

const PETROL = {
  main: '#0E8074',
  light: '#3AA79B',
  dark: '#065F55',
  contrastText: '#FFFFFF',
}

/**
 * Ampelfarben der Aufgabenstatus (US-5).
 *
 * An genau einer Stelle definiert, damit dieselbe Farbe ueberall dieselbe
 * Bedeutung hat - in der Statusanzeige, im Auswahlfeld und in den
 * Spaltenkoepfen des Aufgabenboards.
 *
 * "Offen" ist bewusst grau und nicht rot: Rot signalisiert einen Fehler oder
 * eine Ueberschreitung. Eine noch nicht begonnene Aufgabe ist aber weder das
 * eine noch das andere - sie ist schlicht neutral.
 */
export const STATUS_COLORS: Record<TaskStatusName, { main: string; soft: string; text: string }> = {
  OPEN: { main: '#64748B', soft: '#EEF1F5', text: '#3E4A5A' },
  IN_PROGRESS: { main: '#D97706', soft: '#FEF3E2', text: '#96540A' },
  DONE: { main: '#15803D', soft: '#E9F6EE', text: '#116330' },
}

export const theme = createTheme({
  palette: {
    primary: NAVY,
    secondary: PETROL,
    background: { default: '#F1F4F8', paper: '#FFFFFF' },
    text: { primary: '#1A2330', secondary: '#5A6675' },
    divider: '#E2E7EE',
  },

  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },

  // Grosszuegige Rundung als durchgaengiges Gestaltungsmerkmal.
  shape: { borderRadius: 14 },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          // Grossbuchstaben wirken heute altmodisch und erschweren das Lesen
          // langer Beschriftungen wie "Zurück zur Projektliste".
          textTransform: 'none',
          borderRadius: 10,
          paddingInline: 18,
        },
      },
    },

    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderColor: '#E2E7EE',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          '&:hover': {
            borderColor: '#C9D3E0',
            boxShadow: '0 6px 20px rgba(18, 58, 95, .07)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: '#E2E7EE' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(90deg, ${NAVY.dark} 0%, ${NAVY.main} 55%, #164B78 100%)`,
          boxShadow: '0 1px 0 rgba(255,255,255,.08)',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #E2E7EE', backgroundColor: '#FFFFFF' },
      },
    },

    // Aktiver Navigationseintrag erhaelt eine deutliche, aber ruhige Markierung.
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(18, 58, 95, .09)',
            '&:hover': { backgroundColor: 'rgba(18, 58, 95, .13)' },
            '& .MuiListItemIcon-root': { color: NAVY.main },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, paddingInline: 16 },
      },
    },

    MuiTextField: { defaultProps: { size: 'small' } },

    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 10 } },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: '#E4E9F0' },
        bar: { borderRadius: 999 },
      },
    },

    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18 } },
    },

    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: '#F6F8FB' },
      },
    },
  },
})
