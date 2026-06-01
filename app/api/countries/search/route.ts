import { NextRequest, NextResponse } from 'next/server'
import { getSearchCountries } from '@/lib/countries'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim().toLowerCase() || ''
    const lang = searchParams.get('lang') || 'en'

    if (!query) {
        return NextResponse.json([])
    }

    const countries = await getSearchCountries()

    const results = countries.filter(c => {
        // Check English name
        if (c.name.toLowerCase().includes(query)) return true
        // Check ISO code
        if (c.iso2.toLowerCase().includes(query)) return true
        // Check localized names
        if (c.names) {
            return Object.values(c.names).some(n => n.toLowerCase().includes(query))
        }
        return false
    })

    // Map results to localized format for frontend
    const localizedResults = results.map(c => {
        const localizedName = c.names?.[lang] || c.names?.['en'] || c.name

        return {
            name: {
                common: localizedName,
                official: localizedName
            },
            flags: {
                svg: `https://flagcdn.com/${c.iso2.toLowerCase()}.svg`,
                alt: `Flag of ${localizedName}`
            },
            cca2: c.iso2,
            routeKey: c.iso2
        }
    })

    return NextResponse.json(localizedResults.slice(0, 5))
}
