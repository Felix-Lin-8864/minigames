import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ade80',
      light: '#86efac',
      dark: '#22c55e',
      contrastText: '#0a1410',
    },
    secondary: {
      main: '#a3e635',
      light: '#bef264',
      dark: '#84cc16',
    },
    background: {
      default: '#0a1210',
      paper: '#141f1a',
    },
    text: {
      primary: '#ecfdf5',
      secondary: '#94a89e',
    },
    divider: 'rgba(74, 222, 128, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontFamily: '"Fredoka", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Fredoka", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Fredoka", "Inter", sans-serif',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a1210',
          backgroundImage:
            'radial-gradient(ellipse at 15% 0%, rgba(74, 222, 128, 0.1) 0%, transparent 45%), radial-gradient(ellipse at 85% 100%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(20, 31, 26, 0.5) 0%, transparent 70%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(14, 24, 20, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(74, 222, 128, 0.15)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 2px 8px rgba(74, 222, 128, 0.25)',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(74, 222, 128, 0.35)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(74, 222, 128, 0.12)',
          backgroundColor: 'rgba(20, 31, 26, 0.85)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(74, 222, 128, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(74, 222, 128, 0.3)',
        },
      },
    },
  },
})
