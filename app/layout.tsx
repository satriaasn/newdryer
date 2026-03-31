import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dryer Monitoring System | Industrial IoT Dashboard',
  description: 'Production-grade dryer monitoring and analytics dashboard powered by Supabase and Next.js.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary"
      )}>
        {children}
      </body>
    </html>
  )
}
