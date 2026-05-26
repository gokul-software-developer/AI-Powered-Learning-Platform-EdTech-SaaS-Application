import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ViteQueryProvider from './providers/vite-query-provider.tsx'
import ViteReduxProvider from './providers/vite-redux-provider.tsx'
import ThemeProvider from './providers/vite-theme-provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ViteQueryProvider>
      <ViteReduxProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className='overflow-x-hidden'>
              <App />
              <Toaster />
            </div>
        </ThemeProvider>  
      </ViteReduxProvider>
    </ViteQueryProvider>
  </StrictMode>,
)
