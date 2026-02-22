import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { cn } from "@/lib/utils"
import { AdminSessionProvider } from "@/app/admin/session-provider"
import { AdminSidebarWrapper } from "@/components/admin/admin-sidebar-wrapper"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "RoadRulez Admin",
    description: "Internal admin panel",
    robots: "noindex, nofollow",
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
                <AdminSessionProvider>
                    <AdminSidebarWrapper>
                        {children}
                    </AdminSidebarWrapper>
                    <Toaster />
                </AdminSessionProvider>
            </body>
        </html>
    )
}
