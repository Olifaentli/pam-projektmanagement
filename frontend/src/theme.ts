import { createTheme } from '@mui/material/styles'
import type { TaskStatusName } from './api/types'

/**
 * Gemeinsames Design der Anwendung.
 *
 * Richtung "Kontrast, gedaempft": eine farbige, dunkle Navigationsschiene als
 * einziger grossflaechig dunkler Bereich; alle Inhaltsflaechen bleiben hell.
 * Starker Kontrast wird bewusst sparsam eingesetzt - fuer Kennzahlen, den
 * aktiven Navigationseintrag und die Primaeraktion.
 */

/** Schieferblau als Leitfarbe, Petrol als Akzent. */
const SLATE = {
  main: '#2E4A66',
  light: '#456A8A',
  dark: '#1E3247',
  contrastText: '#FFFFFF',
}

const PETROL = {
  main: '#157F73',
  light: '#3FA598',
  dark: '#0C5F56',
  contrastText: '#FFFFFF',
}

/**
 * Ampelfarben der Aufgabenstatus (US-5).
 *
 * Gegenueber der Vorversion leicht entsaettigt, damit drei Statusspalten
 * nebeneinander nicht flimmern. Die Bedeutung bleibt unveraendert:
 * "Offen" neutral grau, "In Bearbeitung" warm, "Erledigt" gruen.
 *
 * main = Punkt/Balken, soft = Spaltenhintergrund, text = Beschriftung,
 * line  = Rahmen von Karten innerhalb der Spalte.
 */
export const STATUS_COLORS: Record<
  TaskStatusName,
  { main: string; soft: string; text: string; line: string }
> = {
  OPEN: { main: '#94A3B3', soft: '#EEF1F5', text: '#4A5563', line: '#E6EAEF' },
  IN_PROGRESS: { main: '#C98A3C', soft: '#FAF3E9', text: '#8A5A1C', line: '#EFE3D2' },
  DONE: { main: '#4E9B6C', soft: '#EDF4EF', text: '#256540', line: '#DEEAE1' },
}

/** Kraeftigere Variante derselben Farben - nur fuer Zahlen und Prozentwerte. */
export const STATUS_ACCENT: Record<TaskStatusName, string> = {
  OPEN: '#7A8797',
  IN_PROGRESS: '#B4691A',
  DONE: '#2C7A4B',
}

export const theme = createTheme({
  palette: {
    primary: SLATE,
    secondary: PETROL,
    background: { default: '#F5F7F9', paper: '#FFFFFF' },
    text: { primary: '#1E3247', secondary: '#5E6D7E' },
    divider: '#E3E8EE',
  },

  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    // Space Grotesk traegt Ueberschriften und Zahlen: enger, technischer,
    // deutlich unterscheidbar von der Fliesstext-Schrift.
    h1: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
      // Ziffern gleicher Breite: Kennzahlen springen beim Aktualisieren nicht.
      fontVariantNumeric: 'tabular-nums',
    },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600 },
    overline: { fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', lineHeight: 1.6 },
  },

  shape: { borderRadius: 14 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F5F7F9' },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, paddingInline: 18 },
        // Primaeraktion in Petrol statt in der Leitfarbe: sie soll sich von
        // der Navigationsschiene absetzen, nicht mit ihr verschmelzen.
        // MUI 9 kennt den frueheren Schluessel "containedPrimary" nicht mehr,
        // deshalb ueber die Variantenliste statt ueber styleOverrides.
        contained: {
          '&.MuiButton-colorPrimary': {
            backgroundColor: PETROL.main,
            '&:hover': { backgroundColor: PETROL.dark },
          },
        },
        outlined: { borderColor: '#DCE3EB', backgroundColor: '#FFFFFF', color: SLATE.main },
      },
    },

    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderColor: '#E3E8EE',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 6px 18px rgba(24, 42, 63, .07)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: { outlined: { borderColor: '#E3E8EE' } },
    },

    // Kopfleiste flach und hell - die Orientierung uebernimmt die Seitenleiste.
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E3247',
          borderBottom: '1px solid #E3E8EE',
          backgroundImage: 'none',
        },
      },
    },

    // Dunkle Navigationsschiene: der einzige grossflaechig dunkle Bereich.
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: SLATE.main, borderRight: 'none', color: '#FFFFFF' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          color: '#C2D2E1',
          '& .MuiListItemIcon-root': { color: '#7E99B3', minWidth: 34 },
          '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 500 },
          '&:hover': { backgroundColor: 'rgba(255,255,255,.07)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,.14)',
            color: '#FFFFFF',
            '&:hover': { backgroundColor: 'rgba(255,255,255,.18)' },
            '& .MuiListItemIcon-root': { color: '#7FD3C6' },
            '& .MuiListItemText-primary': { fontWeight: 600 },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          paddingInline: 16,
          borderColor: '#DCE3EB',
          '&.Mui-selected': {
            backgroundColor: '#FFFFFF',
            color: SLATE.main,
            borderColor: '#B9C6D4',
          },
        },
      },
    },

    MuiTextField: { defaultProps: { size: 'small' } },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DCE3EB' },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: '#EDF0F4' },
        bar: { borderRadius: 999 },
      },
    },

    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18 } },
    },

    MuiTableHead: {
      styleOverrides: { root: { backgroundColor: '#F5F7F9' } },
    },
  },
})
