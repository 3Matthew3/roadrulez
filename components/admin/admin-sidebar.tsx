"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
    LayoutDashboard,
    Globe,
    AlertCircle,
    BarChart3,
    LogOut,
    Shield,
    ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/countries", label: "Countries", icon: Globe },
    { href: "/admin/issues", label: "Issues", icon: AlertCircle },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const user = session?.user

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
            {/* Brand */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                    <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                    <p className="text-sm font-semibold">RoadRulez</p>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar
                        fallback={user?.name ?? user?.email ?? "?"}
                        size="sm"
                    />
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    {user?.role && (
                      <Badge variant="outline" className="shrink-0 text-xs capitalize">
                        {user.role.toLowerCase()}
                      </Badge>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </aside>
    )
}
