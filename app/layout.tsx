import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'

import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'NOSTROMO // Crew Station Terminal',
  description: 'Nostromo Class M Freighter - Crew information and system status terminal',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#00ff41',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  )
}
