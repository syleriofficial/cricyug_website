import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://cricyug.netlify.app'),
  title: 'CricYug - Live Cricket Scores, News and Match Center',
  description: 'Follow live cricket scores, fixtures, team profiles, player form, news and match insights on CricYug.',
  keywords: ['cricket', 'live scores', 'Syleri predictions', 'cricket news', 'IPL', 'T20', 'ODI', 'Test cricket'],
  generator: 'CricYug',
  openGraph: {
    title: 'CricYug - Live Cricket Scores, News and Match Center',
    description: 'Follow live cricket scores, fixtures, team profiles, player form, news and match insights on CricYug.',
    url: 'https://cricyug.netlify.app',
    siteName: 'CricYug',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CricYug - Live Cricket Scores, News and Match Center',
    description: 'Follow live cricket scores, fixtures, team profiles, player form, news and match insights on CricYug.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#E3363E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
