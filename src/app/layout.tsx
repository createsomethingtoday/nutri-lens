import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nutrition Facts Analyzer",
  description: "Analyze nutrition labels and chat about ingredients",
  icons: {
    icon: 'favicon.ico',
    shortcut: 'favicon.ico',
    apple: 'favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  )
} 