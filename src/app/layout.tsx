import type { Metadata } from 'next'
import './globals.css'
import { SWRProvider } from '@/components/shared/swr-provider'

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
      </body>
    </html>
  )
}