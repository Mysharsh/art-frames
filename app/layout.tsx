import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Space_Grotesk } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

const _bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
})

export const metadata: Metadata = {
  title: {
    default: "ArtFrames - Premium Poster Art",
    template: "%s | ArtFrames",
  },
  description:
    "Discover unique poster art from talented artists. Join the waitlist for exclusive launches.",
  keywords: ["poster art", "art prints", "wall art", "limited edition", "artist prints"],
  metadataBase: (() => {
    try {
      // Guard against malformed env var values (e.g. accidentally including shell logic)
      const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").split(/[\s|]+/)[0].trim()
      return new URL(raw || "https://artframes.shop")
    } catch {
      return new URL("https://artframes.shop")
    }
  })(),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ArtFrames",
    title: "ArtFrames - Premium Poster Art",
    description: "Discover unique poster art from talented artists. Join the waitlist for exclusive launches.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArtFrames - Premium Poster Art",
    description: "Discover unique poster art from talented artists.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#f7c600",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_spaceGrotesk.variable} ${_bebasNeue.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
