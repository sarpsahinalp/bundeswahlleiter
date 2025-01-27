"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ElectionProvider } from "@/contexts/ElectionContext"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isVotePage = pathname?.startsWith("/vote")

  return (
    <html lang="en">
      <body className={inter.className}>
        <ElectionProvider>
          {isVotePage ? (
            children
          ) : (
            <div className="min-h-screen bg-gray-100">
              <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold text-gray-900 transition-colors duration-300 hover:text-blue-600">
                    German Election System
                  </h1>
                  <nav className="mt-4">
                    <ul className="flex space-x-4">
                      <li>
                        <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/analysis"
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                        >
                          Analysis
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </header>
              <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
              </main>
            </div>
          )}
        </ElectionProvider>
      </body>
    </html>
  )
}

