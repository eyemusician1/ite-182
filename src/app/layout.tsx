import type { Metadata } from 'next'
import './globals.css'
import { SWRProvider } from '@/components/shared/swr-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage lab equipment and tracking securely.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}