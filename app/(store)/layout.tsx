'use client'

import { AppShell } from "@/components/app-shell"

export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <AppShell>{children}</AppShell>
}
