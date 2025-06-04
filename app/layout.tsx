import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { cn } from "@/utils/cn"
import { Inter, JetBrains_Mono } from "next/font/google"

import Header from "@/components/Header"

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
  title: "j4cob - AI Tools Directory",
  description: "Discover the best AI tools for your workflow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, jetbrainsMono.variable, "group bg-gray-950 text-gray-100")}>
        <Header />
        <main className="px-4 py-6 xl:px-16">{children}</main>
      </body>
    </html>
  )
}
