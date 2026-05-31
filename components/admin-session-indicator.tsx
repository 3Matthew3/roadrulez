"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, LogOut, Shield } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const STAFF_ROLES = new Set(["ADMIN", "EDITOR"])

export function AdminSessionIndicator() {
    const { data: session, status } = useSession()
    const user = session?.user
    const role = (user as { role?: string } | undefined)?.role
    const [openReviewCount, setOpenReviewCount] = useState(0)

    useEffect(() => {
        if (status !== "authenticated" || !role || !STAFF_ROLES.has(role)) return
        fetch("/api/admin/source-reviews/count")
            .then((res) => (res.ok ? res.json() : { count: 0 }))
            .then((data) => setOpenReviewCount(data.count ?? 0))
            .catch(() => setOpenReviewCount(0))
    }, [status, role])

    if (status === "loading" || !user || !role || !STAFF_ROLES.has(role)) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1.5 text-left hover:bg-violet-500/20 transition-colors">
                <Avatar fallback={user.name ?? user.email ?? "?"} size="sm" />
                <span className="hidden md:inline text-xs text-slate-200 max-w-[120px] truncate">
                    {user.name ?? user.email}
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] capitalize">
                    {role.toLowerCase()}
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{user.name ?? "Staff"}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/admin/source-reviews" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Source reviews
                        {openReviewCount > 0 && (
                            <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                                {openReviewCount}
                            </Badge>
                        )}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-400 focus:text-red-400"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
