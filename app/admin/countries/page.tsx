"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, Plus, Search, Filter, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    VERIFIED: "outline",
    PUBLISHED: "default",
}

type Country = {
    id: string
    name: string
    iso2: string
    flag: string | null
    drivingSide: "LEFT" | "RIGHT"
    status: "DRAFT" | "VERIFIED" | "PUBLISHED"
    lastVerifiedAt: string | null
    updatedAt: string
    updatedBy: { name: string | null; email: string } | null
    _count: { rules: number; sources: number; issues: number }
}

export default function CountriesPage() {
    const router = useRouter()
    const [countries, setCountries] = useState<Country[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [sideFilter, setSideFilter] = useState<string>("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [total, setTotal] = useState(0)

    const fetchCountries = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
        if (sideFilter && sideFilter !== "all") params.set("drivingSide", sideFilter)
        params.set("limit", "50")

        const res = await fetch(`/api/admin/countries?${params}`)
        const data = await res.json()
        setCountries(data.countries ?? [])
        setTotal(data.pagination?.total ?? 0)
        setLoading(false)
    }, [search, statusFilter, sideFilter])

    useEffect(() => {
        const t = setTimeout(fetchCountries, 300)
        return () => clearTimeout(t)
    }, [fetchCountries])

    const columns: ColumnDef<Country>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
                    Country <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{row.original.flag ?? "🏳"}</span>
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">{row.original.iso2}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={statusColors[row.original.status] as any}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "drivingSide",
            header: "Side",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.drivingSide}</span>
            ),
        },
        {
            id: "coverage",
            header: "Content",
            cell: ({ row }) => (
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{row.original._count.rules} rules</span>
                    <span>·</span>
                    <span>{row.original._count.sources} sources</span>
                    {row.original._count.issues > 0 && (
                        <>
                            <span>·</span>
                            <span className="text-yellow-500">{row.original._count.issues} issues</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "lastVerifiedAt",
            header: "Last Verified",
            cell: ({ row }) =>
                row.original.lastVerifiedAt
                    ? format(new Date(row.original.lastVerifiedAt), "dd MMM yyyy")
                    : <span className="text-muted-foreground text-xs">Never</span>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/countries/${row.original.id}`}>
                        Edit <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: countries,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Countries</h1>
                    <p className="text-muted-foreground">{total} countries total</p>
                </div>
                <Button asChild>
                    <Link href="/admin/countries/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Country
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search countries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sideFilter} onValueChange={setSideFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Driving side" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Both sides</SelectItem>
                        <SelectItem value="LEFT">Left-hand</SelectItem>
                        <SelectItem value="RIGHT">Right-hand</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map((h) => (
                                        <TableHead key={h.id}>
                                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer"
                                        onClick={() => router.push(`/admin/countries/${row.original.id}`)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            {!loading && countries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                                        No countries found. Try adjusting your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
