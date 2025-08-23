
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6B4EFF' },
    secondary: { main: '#00D4FF' },
    background: { default: '#F7F7FB', paper: '#FFFFFF' }
  },
  typography: {
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 30px rgba(0,0,0,0.06)' } } }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
