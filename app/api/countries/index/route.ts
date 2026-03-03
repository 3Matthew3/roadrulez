import { NextResponse } from 'next/server'
import { getAllCountries } from '@/lib/countries'

/**
 * GET /api/countries/index
 * Returns the lightweight country index (name, iso2, names map).
 * Used by the map component to build a name → ISO2 lookup table.
 */
export async function GET() {
    const countries = await getAllCountries()

    // Return only the fields the map needs — keep response small
    const index = countries.map(c => ({
        iso2: c.iso2,
        name: c.name,
        names: c.names ?? {},
    }))

    return NextResponse.json(index, {
        headers: {
            // Cache for 1 hour — this data changes rarely
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}
