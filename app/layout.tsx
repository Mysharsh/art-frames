import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Space_Grotesk } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
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
  title: "ArtFrames - Premium Poster Art",
  description:
    "Discover unique poster art from talented artists. Join the waitlist for exclusive launches.",
}

export const viewport: Viewport = {
  themeColor: "#f7c600",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      </body>
    </html>
  )
}
