import { getAustriaStateCoatUrl } from "@/lib/austria-state-coats"
import { getGermanyStateCoatUrl } from "@/lib/germany-state-coats"
import { getItalyRegionalCoatUrl } from "@/lib/italy-regional-coats"
import { getUkRegionalCoatUrl } from "@/lib/uk-regional-coats"
import { getUsRegionalCoatUrl } from "@/lib/us-regional-coats"
import type { RegionalVariation } from "@/types/country"

export function getRegionalCoatUrl(countryIso2: string, region: RegionalVariation): string | null {
    const code = countryIso2.toUpperCase()
    if (code === "AT") return getAustriaStateCoatUrl(region)
    if (code === "DE") return getGermanyStateCoatUrl(region)
    if (code === "IT") return getItalyRegionalCoatUrl(region)
    if (code === "US") return getUsRegionalCoatUrl(region)
    if (code === "GB") return getUkRegionalCoatUrl(region)
    return region.coat_of_arms_url ?? null
}
