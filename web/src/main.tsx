import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import App from '@/App'
import { Toaster } from '@/components/ui/sonner'
import { FinsdkProvider } from '@/providers/finsdk-provider'
import '@/index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FinsdkProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </FinsdkProvider>
    </ThemeProvider>
  </StrictMode>,
)
