import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import { theme } from './theme/theme'
import { WordDictionaryProvider } from './dictionary/WordDictionaryProvider'
import { StatsProvider } from './stats/StatsProvider'
import { WalletProvider } from './wallet/WalletProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WordDictionaryProvider>
        <WalletProvider>
          <StatsProvider>
            <App />
          </StatsProvider>
        </WalletProvider>
      </WordDictionaryProvider>
    </ThemeProvider>
  </StrictMode>,
)
