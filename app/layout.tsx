import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import Footer from '@/components/footer-home';
import { AuthProvider } from '@/components/auth-provider'
import 'katex/dist/katex.min.css';


const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MCQ Test Series Viewer',
  description: 'Browse and study MCQ questions from various coaching institutes mock tests',
  icons: {
    icon: [
      {
        url: '/favicon-96x96.png',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        rel: 'shortcut icon',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'UPSI',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  )
}
