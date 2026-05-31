import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import type { SourceCheckStatus } from "@prisma/client"
import { extractSourceSuggestions, pickPrimarySuggestion } from "@/lib/source-patterns"
import { getCurrentFieldValue } from "@/lib/source-review-service"

const DEFAULT_BATCH_SIZE = 20
const FETCH_TIMEOUT_MS = 15000
const SNIPPET_LENGTH = 500

export function normalizeSourceContent(raw: string): string {
    return raw
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
}

export function hashSourceContent(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex")
}

async function fetchSourceContent(url: string): Promise<{ status: number; text: string }> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "RoadRulez-SourceMonitor/1.0 (+https://roadrulez.com)",
                Accept: "text/html,application/xhtml+xml,text/plain,application/pdf;q=0.9,*/*;q=0.8",
            },
            redirect: "follow",
        })

        const text = await response.text()
        return { status: response.status, text }
    } finally {
        clearTimeout(timeout)
    }
}

export type SourceCheckJobResult = {
    checked: number
    unchanged: number
    changed: number
    failed: number
    reviewsCreated: number
}

export async function runSourceCheckJob(batchSize = DEFAULT_BATCH_SIZE): Promise<SourceCheckJobResult> {
    const result: SourceCheckJobResult = {
        checked: 0,
        unchanged: 0,
        changed: 0,
        failed: 0,
        reviewsCreated: 0,
    }

    const sources = await prisma.source.findMany({
        where: { active: true },
        orderBy: [{ lastCheckedAt: "asc" }, { createdAt: "asc" }],
        take: batchSize,
        include: { country: { select: { id: true, iso2: true } } },
    })

    for (const source of sources) {
        result.checked += 1
        const oldHash = source.contentHash ?? null
        let status: SourceCheckStatus = "OK"
        let newHash: string | null = null
        let httpStatus: number | null = null
        let error: string | null = null
        let contentSnippet: string | null = null
        let diffSummary: string | null = null
        let fetchedText: string | null = null

        try {
            const { status: responseStatus, text } = await fetchSourceContent(source.url)
            httpStatus = responseStatus
            fetchedText = text

            if (responseStatus >= 400) {
                status = "FAILED"
                error = `HTTP ${responseStatus}`
                result.failed += 1
            } else {
                const normalized = normalizeSourceContent(text)
                newHash = hashSourceContent(normalized)
                contentSnippet = normalized.slice(0, SNIPPET_LENGTH)

                if (oldHash && oldHash !== newHash) {
                    status = "CHANGED"
                    diffSummary = "Source content hash changed since last check."
                    result.changed += 1
                } else if (!oldHash) {
                    status = "OK"
                    result.unchanged += 1
                } else {
                    status = "OK"
                    result.unchanged += 1
                }
            }
        } catch (err) {
            status = "FAILED"
            error = err instanceof Error ? err.message : "Unknown fetch error"
            result.failed += 1
        }

        const checkStatus =
            status === "CHANGED" ? "NEEDS_REVIEW" : status === "FAILED" ? "FAILED" : "OK"

        await prisma.$transaction(async (tx) => {
            await tx.sourceCheck.create({
                data: {
                    sourceId: source.id,
                    status,
                    oldHash,
                    newHash,
                    httpStatus,
                    error,
                    contentSnippet,
                    diffSummary,
                },
            })

            await tx.source.update({
                where: { id: source.id },
                data: {
                    lastCheckedAt: new Date(),
                    contentHash: newHash ?? source.contentHash,
                    checkStatus,
                    ...(status === "CHANGED" ? { lastChangedAt: new Date() } : {}),
                },
            })

            if (status === "CHANGED") {
                const existingOpen = await tx.sourceReview.findFirst({
                    where: { sourceId: source.id, status: "OPEN" },
                })

                if (!existingOpen) {
                    const suggestions = extractSourceSuggestions(fetchedText ?? "", source.moduleKey)
                    const primary = pickPrimarySuggestion(suggestions, source.moduleKey)
                    const currentValue =
                        primary && source.countryId
                            ? await getCurrentFieldValue(source.countryId, primary)
                            : null

                    await tx.sourceReview.create({
                        data: {
                            sourceId: source.id,
                            countryId: source.countryId,
                            moduleKey: primary?.moduleKey ?? source.moduleKey,
                            fieldName: primary?.fieldName ?? null,
                            currentValue,
                            suggestedValue: primary?.suggestedValue ?? diffSummary,
                            evidenceSnippet: contentSnippet,
                            status: "OPEN",
                        },
                    })
                    result.reviewsCreated += 1
                }
            }
        })
    }

    return result
}
