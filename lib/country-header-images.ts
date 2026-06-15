const img = (id: string) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&q=80`

/** Generic NYC placeholders used in early seed data — not country-specific. */
export const GENERIC_HEADER_PLACEHOLDER_IDS = [
    "photo-1449824913935-59a10b8d2000",
    "photo-1514565131-fce0801e5785",
]

/** IDs confirmed to return HTTP 200 from images.unsplash.com (see scripts/verify-header-images.mjs). */
export const VERIFIED_HEADER_IMAGE_IDS = new Set([
    "photo-1469854523086-cc02fe5d8800",
    "photo-1469474968028-56623f02e42e",
    "photo-1485738422979-f5c462d49f74",
    "photo-1490806843957-31f4c9a91c65",
    "photo-1493976040374-85c8e12f0c0e",
    "photo-1500916434205-0c77489c6cf7",
    "photo-1501466044931-62695aada8e9",
    "photo-1502602898657-3e91760cbb34",
    "photo-1503899036084-c55cdd92da26",
    "photo-1506744038136-46273834b3fb",
    "photo-1506905925346-21bda4d32df4",
    "photo-1507525428034-b723cf961d3e",
    "photo-1508804185872-d7badad00f7d",
    "photo-1511735111819-9a3f7709049c",
    "photo-1512453979798-5ea266f8880c",
    "photo-1513635269975-59663e0ac1ad",
    "photo-1515542622106-78bda8ba0e5b",
    "photo-1516026672322-bc52d61a55d5",
    "photo-1516550893923-42d28e5677af",
    "photo-1520503922584-590e8f7a90d7",
    "photo-1523531294919-4bcd7c65e216",
    "photo-1523906834658-6e24ef2386f9",
    "photo-1542051841857-5f90071e7989",
    "photo-1551632811-561732d1e306",
    "photo-1552832230-c0197dd311b5",
    "photo-1560969184-10fe8719e047",
    "photo-1564013799919-ab600027ffc6",
    "photo-1565463694786-7fa5cf426096",
    "photo-1582832172472-c1ce8ec9c3fb",
    "photo-1589482763339-cfd30237316a",
    "photo-1603884652342-2b6992a1a9ff",
    "photo-1745186487192-09eccb385169",
    "photo-1772824953680-4c96be92e88b",
    "photo-1770850186337-d6fdf280d06d",
    "photo-1780305807025-e3f5019482c0",
])

const ROAD = img("photo-1469854523086-cc02fe5d8800")
const MOUNTAINS = img("photo-1506905925346-21bda4d32df4")
const ALPS = img("photo-1469474968028-56623f02e42e")
const BEACH = img("photo-1507525428034-b723cf961d3e")

export function isVerifiedHeaderImage(url?: string): boolean {
    if (!url) return false
    return [...VERIFIED_HEADER_IMAGE_IDS].some((id) => url.includes(id))
}

export function hasGenericPrimaryHeaderImage(images?: string[]): boolean {
    if (!images?.length) return true
    return GENERIC_HEADER_PLACEHOLDER_IDS.some((id) => images[0].includes(id))
}

export function shouldReplaceHeaderImages(images?: string[]): boolean {
    if (!images?.length) return true
    if (hasGenericPrimaryHeaderImage(images)) return true
    return !isVerifiedHeaderImage(images[0])
}

/** Verified hero photos per country (Unsplash). */
export const COUNTRY_HEADER_IMAGES: Record<string, string[]> = {
    AD: [MOUNTAINS, ALPS],
    AE: [img("photo-1512453979798-5ea266f8880c"), BEACH],
    AL: [BEACH, ALPS],
    AR: [img("photo-1503899036084-c55cdd92da26"), BEACH],
    AT: [
        img("photo-1516550893923-42d28e5677af"),
        img("photo-1582832172472-c1ce8ec9c3fb"),
        img("photo-1520503922584-590e8f7a90d7"),
        img("photo-1565463694786-7fa5cf426096"),
    ],
    AU: [BEACH, img("photo-1507525428034-b723cf961d3e")],
    BA: [ALPS, MOUNTAINS],
    BE: [img("photo-1513635269975-59663e0ac1ad"), ROAD],
    BG: [ALPS, MOUNTAINS],
    BR: [BEACH, img("photo-1503899036084-c55cdd92da26")],
    BY: [img("photo-1516026672322-bc52d61a55d5"), MOUNTAINS],
    CA: [MOUNTAINS, img("photo-1506744038136-46273834b3fb")],
    CH: [MOUNTAINS, ALPS],
    CN: [img("photo-1508804185872-d7badad00f7d"), img("photo-1493976040374-85c8e12f0c0e")],
    CY: [BEACH, img("photo-1564013799919-ab600027ffc6")],
    CZ: [img("photo-1515542622106-78bda8ba0e5b"), ROAD],
    DE: [
        img("photo-1560969184-10fe8719e047"),
        img("photo-1551632811-561732d1e306"),
        MOUNTAINS,
    ],
    DK: [img("photo-1516026672322-bc52d61a55d5"), BEACH],
    EE: [img("photo-1516026672322-bc52d61a55d5"), ROAD],
    ES: [
        img("photo-1780305807025-e3f5019482c0"),
        img("photo-1745186487192-09eccb385169"),
        img("photo-1772824953680-4c96be92e88b"),
        img("photo-1564013799919-ab600027ffc6"),
    ],
    FI: [img("photo-1516026672322-bc52d61a55d5"), MOUNTAINS],
    FR: [
        img("photo-1502602898657-3e91760cbb34"),
        img("photo-1564013799919-ab600027ffc6"),
        ROAD,
    ],
    GB: [
        img("photo-1513635269975-59663e0ac1ad"),
        img("photo-1511735111819-9a3f7709049c"),
        ROAD,
    ],
    GR: [BEACH, img("photo-1564013799919-ab600027ffc6")],
    HR: [BEACH, img("photo-1772824953680-4c96be92e88b")],
    HU: [img("photo-1515542622106-78bda8ba0e5b"), ROAD],
    ID: [BEACH, img("photo-1493976040374-85c8e12f0c0e")],
    IE: [BEACH, img("photo-1513635269975-59663e0ac1ad")],
    IN: [img("photo-1493976040374-85c8e12f0c0e"), img("photo-1508804185872-d7badad00f7d")],
    IS: [MOUNTAINS, img("photo-1516026672322-bc52d61a55d5")],
    IT: [
        img("photo-1523906834658-6e24ef2386f9"),
        img("photo-1552832230-c0197dd311b5"),
        img("photo-1523531294919-4bcd7c65e216"),
        img("photo-1515542622106-78bda8ba0e5b"),
    ],
    JP: [img("photo-1490806843957-31f4c9a91c65"), img("photo-1542051841857-5f90071e7989")],
    KR: [img("photo-1542051841857-5f90071e7989"), img("photo-1493976040374-85c8e12f0c0e")],
    LI: [MOUNTAINS, ALPS],
    LT: [img("photo-1516026672322-bc52d61a55d5"), ROAD],
    LU: [ROAD, img("photo-1513635269975-59663e0ac1ad")],
    LV: [img("photo-1516026672322-bc52d61a55d5"), ROAD],
    MC: [BEACH, img("photo-1772824953680-4c96be92e88b")],
    MD: [ROAD, img("photo-1516026672322-bc52d61a55d5")],
    ME: [BEACH, ALPS],
    MK: [ALPS, MOUNTAINS],
    MT: [BEACH, img("photo-1564013799919-ab600027ffc6")],
    MX: [img("photo-1503899036084-c55cdd92da26"), BEACH],
    NL: [img("photo-1513635269975-59663e0ac1ad"), ROAD],
    NO: [MOUNTAINS, img("photo-1516026672322-bc52d61a55d5")],
    PL: [ROAD, img("photo-1515542622106-78bda8ba0e5b")],
    PT: [img("photo-1564013799919-ab600027ffc6"), BEACH],
    RO: [ROAD, img("photo-1515542622106-78bda8ba0e5b")],
    RS: [ALPS, ROAD],
    SE: [img("photo-1516026672322-bc52d61a55d5"), MOUNTAINS],
    SI: [MOUNTAINS, ALPS],
    SK: [img("photo-1515542622106-78bda8ba0e5b"), ROAD],
    TH: [BEACH, img("photo-1493976040374-85c8e12f0c0e")],
    TW: [img("photo-1542051841857-5f90071e7989"), img("photo-1493976040374-85c8e12f0c0e")],
    UA: [ROAD, img("photo-1516026672322-bc52d61a55d5")],
    US: [
        img("photo-1501466044931-62695aada8e9"),
        img("photo-1485738422979-f5c462d49f74"),
        img("photo-1506744038136-46273834b3fb"),
        img("photo-1500916434205-0c77489c6cf7"),
    ],
    XK: [ALPS, MOUNTAINS],
    ZA: [BEACH, img("photo-1469474968028-56623f02e42e")],
}

export function getCountryHeaderImages(iso2: string): string[] {
    return COUNTRY_HEADER_IMAGES[iso2.toUpperCase()] ?? [ROAD, MOUNTAINS]
}
