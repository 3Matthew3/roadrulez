import { prisma } from "@/lib/prisma"
import type { CountrySourceEntry, PublicSourceListItem } from "@/types/source"

async function getDb() {
    if (!process.env.DATABASE_URL) return null
    try {
        return prisma
    } catch {
        return null
    }
}

function mapSourceRow(source: {
    id: string
    title: string
    url: string
    publisher: string | null
    publishedDate: Date | null
    sourceType: CountrySourceEntry["sourceType"]
    trustLevel: CountrySourceEntry["trustLevel"]
    moduleKey: string | null
    notes: string | null
    checkStatus: CountrySourceEntry["checkStatus"]
    lastCheckedAt: Date | null
    country?: {
        id: string
        name: string
        iso2: string
        flag: string | null
    } | null
}): PublicSourceListItem {
    return {
        id: source.id,
        title: source.title,
        url: source.url,
        publisher: source.publisher,
        publishedDate: source.publishedDate?.toISOString() ?? null,
        sourceType: source.sourceType,
        trustLevel: source.trustLevel,
        moduleKey: source.moduleKey,
        notes: source.notes,
        checkStatus: source.checkStatus,
        lastCheckedAt: source.lastCheckedAt?.toISOString() ?? null,
        country: source.country ?? null,
    }
}

export async function getSourcesForCountry(iso2: string): Promise<CountrySourceEntry[]> {
    const db = await getDb()
    if (!db) return []

    const sources = await db.source.findMany({
        where: {
            country: { iso2: iso2.toUpperCase() },
        },
        orderBy: [{ trustLevel: "asc" }, { title: "asc" }],
    })

    return sources.map((source) => mapSourceRow(source))
}

export async function getAllPublicSources(): Promise<PublicSourceListItem[]> {
    const db = await getDb()
    if (!db) return []

    const sources = await db.source.findMany({
        where: {
            countryId: { not: null },
            country: { status: { in: ["PUBLISHED", "VERIFIED"] } },
        },
        include: {
            country: { select: { id: true, name: true, iso2: true, flag: true } },
        },
        orderBy: [{ country: { name: "asc" } }, { title: "asc" }],
    })

    return sources.map((source) => mapSourceRow(source))
}

export async function getOpenSourceReviewCount(): Promise<number> {
    const db = await getDb()
    if (!db) return 0
    return db.sourceReview.count({ where: { status: "OPEN" } })
}
