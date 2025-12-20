import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import "../globals.css"

export const metadata: Metadata = {
  title: "OOTDay - AI Fashion Assistant",
  description: "Discover personalized outfits with AI-powered fashion recommendations",
  generator: "v0.app",
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <div className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
      <NextIntlClientProvider messages={messages}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </NextIntlClientProvider>
    </div>
  )
}