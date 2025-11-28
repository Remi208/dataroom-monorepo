import React from 'react'
import ReactDOM from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import App from './App'
import './index.css'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
            <App />
        </SnackbarProvider>
    </React.StrictMode>,
)
