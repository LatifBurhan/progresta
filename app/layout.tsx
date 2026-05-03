import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { Toaster } from '@/components/ui/toaster'
import { ToastContainer } from '@/components/notifications/ToastNotification'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Progresta - Progress & Auto-Attendance',
  description: 'Sistem Progress & Auto-Attendance untuk manajemen karyawan dan project',
  manifest: '/manifest.json?v=3',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Progresta',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/progresta.png',
    apple: '/progresta.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/progresta.png" />
        <link rel="apple-touch-icon" href="/progresta.png" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        {children}
        <Toaster />
        <ToastContainer />
      </body>
    </html>
  )
}
