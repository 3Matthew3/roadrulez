"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === "/admin/login"

    if (isLoginPage) {
        // Login page: full-screen, no sidebar
        return <div className="min-h-screen">{children}</div>
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-7xl p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
