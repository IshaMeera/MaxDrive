import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CustomFolderProvider } from './context/CustomFolderContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomFolderProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </CustomFolderProvider>
  </StrictMode>,
)
