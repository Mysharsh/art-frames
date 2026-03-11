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
    default: "Posterwaala - Premium Metal Posters",
    template: "%s | Posterwaala",
  },
  description:
    "Discover unique metal poster art from talented artists. Join the waitlist for exclusive launches.",
  keywords: ["poster art", "metal posters", "wall art", "limited edition", "artist prints", "posterwaala"],
  metadataBase: (() => {
    try {
      // Guard against malformed env var values (e.g. accidentally including shell logic)
      const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").split(/[\s|]+/)[0].trim()
      return new URL(raw || "https://posterwaala.com")
    } catch {
      return new URL("https://posterwaala.com")
    }
  })(),
  verification: {
    google: "1_y-XILbZqEyS0eo2965GpAEnB8WlSuneYAbYwYY-VQ",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Posterwaala",
    title: "Posterwaala - Premium Metal Posters",
    description: "Discover unique metal poster art from talented artists. Join the waitlist for exclusive launches.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Posterwaala - Premium Metal Posters",
    description: "Discover unique metal poster art from talented artists.",
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
