import fs from 'fs'
import path from 'path'
import { CountryData, CountryIndexItem } from '@/types/country'

const dataDirectory = path.join(process.cwd(), 'data/countries')

export async function getAllCountries(): Promise<CountryIndexItem[]> {
    try {
        const filePath = path.join(dataDirectory, 'index.json')
        const fileContents = await fs.promises.readFile(filePath, 'utf8')
        return JSON.parse(fileContents)
    } catch (error) {
        console.error("Failed to read country index:", error)
        return []
    }
}

export async function getCountryData(iso2: string, locale: string = 'en'): Promise<CountryData | null> {
    try {
        // Basic sanitization
        const code = iso2.toLowerCase().replace(/[^a-z0-9]/g, '')

        // Try localized file first if not english
        if (locale !== 'en') {
            const localFilePath = path.join(dataDirectory, `${code}.${locale}.json`)
            try {
                await fs.promises.access(localFilePath)
                const fileContents = await fs.promises.readFile(localFilePath, 'utf8')
                return JSON.parse(fileContents)
            } catch {
                // Fallback to default (english)
            }
        }

        const filePath = path.join(dataDirectory, `${code}.json`)

        // Check if exists
        try {
            await fs.promises.access(filePath)
        } catch {
            return null
        }

        const fileContents = await fs.promises.readFile(filePath, 'utf8')
        return JSON.parse(fileContents)
    } catch (error) {
        console.error(`Failed to load data for ${iso2}:`, error)
        return null
    }
}

export async function getCountryByName(nameOrCode: string, locale: string = 'en'): Promise<CountryData | null> {
    const index = await getAllCountries()
    const query = nameOrCode.toLowerCase()

    // Try by name first
    let found = index.find(p => p.name.toLowerCase() === query)

    // If not found, try by ISO2
    if (!found) {
        found = index.find(p => p.iso2.toLowerCase() === query)
    }

    // Try by Localized names if passed
    if (!found && locale !== 'en') {
        found = index.find(p => p.names && p.names[locale]?.toLowerCase() === query)
    }
    // Fallback search across all names?
    if (!found) {
        found = index.find(p => p.names && Object.values(p.names).some(n => n.toLowerCase() === query))
    }

    if (!found) return null

    // Pass locale to getCountryData
    return getCountryData(found.iso2, locale)
}
