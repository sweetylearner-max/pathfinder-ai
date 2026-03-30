// src/theme/theme.ts
import { createTheme, alpha } from '@mui/material/styles'

const glassBg = 'rgba(255,255,255,0.05)'
const glassBorder = 'rgba(255,255,255,0.1)'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    secondary: { main: '#06B6D4', light: '#67E8F9', dark: '#0891B2' },
    background: { default: '#0F0F23', paper: '#1A1A35' },
    text:       { primary: '#F1F0FF', secondary: '#A0A0C0' },
    success:    { main: '#10B981' },
    warning:    { main: '#F59E0B' },
    error:      { main: '#EF4444' }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A0F35 50%, #0F1A35 100%)',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#7C3AED #1A1A35'
        }
      }
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: glassBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${glassBorder}`,
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: glassBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${glassBorder}`,
          backgroundImage: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(124,58,237,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.15)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 },
        contained: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            '& fieldset': { borderColor: glassBorder },
            '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#7C3AED' }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.3)',
          color: '#A78BFA'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15,15,35,0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${glassBorder}`
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            background: 'rgba(124,58,237,0.2)',
            borderLeft: '3px solid #7C3AED',
            '&:hover': { background: 'rgba(124,58,237,0.25)' }
          },
          '&:hover': { background: 'rgba(255,255,255,0.05)' }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(26,26,53,0.95)',
          backdropFilter: 'blur(30px)',
          border: `1px solid ${glassBorder}`
        }
      }
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
        }
      }
    }
  }
})

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    secondary: { main: '#06B6D4' },
    background: { default: '#F5F3FF', paper: '#FFFFFF' },
    text:       { primary: '#1E1B4B', secondary: '#6B6B9A' }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(124,58,237,0.12)',
          backgroundImage: 'none'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 },
        contained: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          boxShadow: '0 4px 15px rgba(124,58,237,0.25)'
        }
      }
    }
  }
})
