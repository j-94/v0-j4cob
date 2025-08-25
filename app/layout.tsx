import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { cn } from "@/utils/cn"
import { Inter, JetBrains_Mono } from "next/font/google"

import Link from "next/link"
import KernelPill from "@/components/KernelPill"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Claudecode Meta",
  description: "Timeline and search for Claudecode",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, jetbrainsMono.variable, "group bg-gray-950 text-gray-100 min-h-screen")}>
        <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950/80 backdrop-blur px-4 py-3">
          <Link href="/" className="font-bold">Claudecode Meta</Link>
          <form action="/search" className="flex-1 mx-4">
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-1 text-sm"
            />
          </form>
          {/* @ts-expect-error Server Component */}
          <KernelPill />
        </header>
        <main className="px-4 py-6 xl:px-16">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
