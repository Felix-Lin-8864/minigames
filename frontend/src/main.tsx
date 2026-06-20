import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import { theme } from './theme/theme'
import { WordDictionaryProvider } from './dictionary/WordDictionaryProvider'
import { StatsProvider } from './stats/StatsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WordDictionaryProvider>
        <StatsProvider>
          <App />
        </StatsProvider>
      </WordDictionaryProvider>
    </ThemeProvider>
  </StrictMode>,
)
