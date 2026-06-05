import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { AdminSessionProvider } from "@/app/admin/session-provider"
import { AdminSidebarWrapper } from "@/components/admin/admin-sidebar-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
        <div className={cn("dark min-h-screen bg-background font-sans antialiased")}>
            <AdminSessionProvider>
                <AdminSidebarWrapper>
                    {children}
                </AdminSidebarWrapper>
                <Toaster />
            </AdminSessionProvider>
            <Analytics />
            <SpeedInsights />
        </div>
    )
}
