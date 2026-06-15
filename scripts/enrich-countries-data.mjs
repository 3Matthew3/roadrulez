/**
 * Applies structured enrichment patches to country JSON files.
 * Run: node scripts/enrich-countries-data.mjs
 */
import fs from "fs"
import path from "path"

const dataDir = path.join(process.cwd(), "data/countries")

const CHECKED = "2026-05-27T12:00:00.000Z"

function write(iso2, patch) {
    const file = path.join(dataDir, `${iso2.toLowerCase()}.json`)
    const existing = JSON.parse(fs.readFileSync(file, "utf8"))
    const merged = { ...existing, ...patch, rules: { ...existing.rules, ...patch.rules } }
    if (patch.rules) {
        merged.rules = {
            ...existing.rules,
            ...patch.rules,
            speed_limits: { ...existing.rules?.speed_limits, ...patch.rules?.speed_limits },
            alcohol_limit: { ...existing.rules?.alcohol_limit, ...patch.rules?.alcohol_limit },
            tolls: { ...existing.rules?.tolls, ...patch.rules?.tolls },
        }
    }
    fs.writeFileSync(file, `${JSON.stringify(merged, null, 4)}\n`, "utf8")
    console.log(`Enriched ${iso2}`)
}

// ─── FRANCE ───────────────────────────────────────────────────────────────────
write("FR", {
    last_verified: "2026-05-27",
    data_coverage: "high",
    top_fines: [
        { title: "Phone in hand while driving", amount: "€135 + 3 points" },
        { title: "Speeding +20 km/h in town (≤50 zone)", amount: "€135" },
        { title: "Radar detector use", amount: "up to €1,500" },
    ],
    source_entries: [
        {
            id: "fr-securite-routiere",
            title: "Sécurité Routière — Road safety portal",
            url: "https://www.securite-routiere.gouv.fr/",
            publisher: "Sécurité Routière",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "speed_limits",
            usageModuleKeys: ["speed_limits", "alcohol_limit", "priority_rules"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "fr-service-public-speed",
            title: "Speed limits and penalties (Service-Public.fr)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19460",
            publisher: "Service-Public.fr",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "speed_limits",
            usageModuleKeys: ["speed_limits"],
            notes: "Official overview of French speeding classes, points and fines.",
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "fr-service-public-fines",
            title: "Traffic fine payment (Service-Public.fr)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18509",
            publisher: "Service-Public.fr",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "fines",
            usageModuleKeys: ["fines"],
            notes: "Fine classes (1st–5th), payment deadlines via amendes.gouv.fr.",
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "fr-service-public-critair",
            title: "Crit'Air clean-air sticker",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33375",
            publisher: "Service-Public.fr",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "tolls",
            usageModuleKeys: ["tolls", "parking_rules"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "fr-amendes",
            title: "Pay a traffic fine online",
            url: "https://www.amendes.gouv.fr/",
            publisher: "Ministère de l'Intérieur",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "fines",
            usageModuleKeys: ["fines"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
    ],
    sources: ["Sécurité Routière", "Service-Public.fr", "amendes.gouv.fr"],
    faq: [
        {
            id: "priorite-a-droite",
            category: "priority_rules",
            question: "What is 'Priorité à droite' in France?",
            question_de: "Was bedeutet 'Priorité à droite' in Frankreich?",
            answer: "At unsigned intersections, traffic from your right has priority—even if your road looks like the main route. A yellow diamond sign marks a priority road where you keep right of way until the diamond ends with a strike-through.",
            answer_de: "An unbeschilderten Kreuzungen hat der Verkehr von rechts Vorfahrt—auch wenn deine Straße wie die Hauptstraße aussieht. Ein gelber Rautenschild kennzeichnet eine Vorfahrtstraße, bis das durchgestrichene Rautenschild endet.",
            relatedSourceIds: ["fr-securite-routiere", "fr-service-public-speed"],
        },
        {
            id: "critair-paris",
            category: "vignette_tolls",
            question: "Do I need a Crit'Air sticker for Paris?",
            question_de: "Brauche ich einen Crit'Air-Sticker für Paris?",
            answer: "Yes, for low-emission zones (ZFE) in Paris and many cities. Order the vignette online before driving in. Driving without a valid Crit'Air class when required can result in a €68 fine (3rd class).",
            answer_de: "Ja, für Umweltzonen (ZFE) in Paris und vielen Städten. Vignette online bestellen vor der Einfahrt. Ohne gültige Crit'Air-Klasse drohen €68 Bußgeld (3. Klasse).",
            relatedSourceIds: ["fr-service-public-critair"],
        },
        {
            id: "autoroute-tolls",
            category: "vignette_tolls",
            question: "How do French autoroute tolls (péage) work?",
            question_de: "Wie funktionieren französische Autobahn-Maut (péage)?",
            answer: "Blue 'Autoroute' signs mark toll motorways. Take a ticket at entry, pay at exit by card, cash, or télépéage tag. Keep your ticket until you leave the network.",
            answer_de: "Blaue 'Autoroute'-Schilder kennzeichnen Mautstraßen. Ticket bei Einfahrt, Bezahlung bei Ausfahrt per Karte, Bar oder télépéage. Ticket bis zur Netz-Ausfahrt aufbewahren.",
            relatedSourceIds: ["fr-securite-routiere"],
        },
        {
            id: "speed-rain",
            category: "speed_limits",
            question: "Are speed limits lower in rain in France?",
            question_de: "Gelten in Frankreich bei Regen niedrigere Tempolimits?",
            answer: "Yes. On dry motorways the default is 130 km/h; in rain it drops to 110 km/h. On dry rural roads 80 km/h applies (formerly 90). Posted signs always prevail.",
            answer_de: "Ja. Auf trockenen Autobahnen standardmäßig 130 km/h, bei Regen 110 km/h. Auf Landstraßen trocken 80 km/h. Ausgeschilderte Limits haben Vorrang.",
            relatedSourceIds: ["fr-service-public-speed", "fr-securite-routiere"],
        },
        {
            id: "phone-france",
            category: "fines",
            question: "What is the fine for using a phone while driving in France?",
            question_de: "Welches Bußgeld droht für Handy am Steuer in Frankreich?",
            answer: "Holding or using a handheld phone while driving is a 4th-class offence: €135 fine and 3 licence points. Combined with another offence (e.g. speeding), police may suspend your licence on the spot.",
            answer_de: "Handy in der Hand oder Benutzung am Steuer ist Verstoß 4. Klasse: €135 Bußgeld und 3 Punkte. Zusammen mit einem weiteren Verstoß kann die Polizei den Führerschein sofort einziehen.",
            relatedSourceIds: ["fr-service-public-speed", "fr-service-public-fines"],
        },
        {
            id: "radar-detector",
            category: "fines",
            question: "Are radar detectors legal in France?",
            question_de: "Sind Radarwarner in Frankreich erlaubt?",
            answer: "No. Radar detectors and apps that warn of fixed cameras are illegal. Fines up to €1,500, device confiscation, and possible vehicle immobilisation. Disable camera alerts in navigation apps.",
            answer_de: "Nein. Radarwarner und Apps mit Blitzwarnung sind illegal. Bußgelder bis €1.500, Beschlagnahme, Fahrzeug kann stillgelegt werden. Kamerawarnungen in Navi-Apps deaktivieren.",
            relatedSourceIds: ["fr-securite-routiere"],
        },
        {
            id: "alcohol-france",
            category: "alcohol_limit",
            question: "What is the drink-drive limit in France?",
            question_de: "Wie hoch ist die Promillegrenze in Frankreich?",
            answer: "0.05% BAC (0.5 g/l) for experienced drivers. 0.02% for bus/coach drivers and novice drivers (≤3 years). Exceeding the limit is a 4th-class offence (€135) with points; higher levels lead to criminal prosecution.",
            answer_de: "0,05 % BAC (0,5 g/l) für erfahrene Fahrer. 0,02 % für Busfahrer und Fahranfänger (≤3 Jahre). Überschreitung ist Verstoß 4. Klasse (€135) mit Punkten; höhere Werte können strafrechtliche Folgen haben.",
            relatedSourceIds: ["fr-securite-routiere", "fr-service-public-speed"],
        },
        {
            id: "speed-50-delit",
            category: "speed_limits",
            question: "When is speeding a criminal offence in France?",
            question_de: "Wann ist zu schnelles Fahren in Frankreich eine Straftat?",
            answer: "Since 29 December 2025, exceeding the limit by 50 km/h or more is a criminal offence (délit), not just a ticket. A fixed penalty of €250–€300 may apply; refusal can lead to court, up to €3,750 fine, 3 months imprisonment, and licence suspension.",
            answer_de: "Seit 29. Dezember 2025 ist ein Überschreiten um 50 km/h oder mehr eine Straftat (délit). Feste Strafe €250–€300 möglich; bei Ablehnung Gericht, bis €3.750, 3 Monate Haft und Führerscheinentzug.",
            relatedSourceIds: ["fr-service-public-speed"],
        },
        {
            id: "eu-licence-fr",
            category: "documents",
            question: "Can I drive in France with an EU licence?",
            question_de: "Kann ich in Frankreich mit EU-Führerschein fahren?",
            answer: "EU/EEA licences are accepted for tourist stays. Carry your physical licence and ID. Non-EU visitors should carry an IDP if your licence is not in French or English script.",
            answer_de: "EU/EWR-Führerscheine werden für Touristen akzeptiert. Führerschein und Ausweis mitführen. Nicht-EU-Besucher sollten einen IDP mitführen, wenn der Führerschein nicht in lateinischer Schrift ist.",
            relatedSourceIds: ["fr-securite-routiere"],
        },
        {
            id: "winter-mountain-law",
            category: "winter",
            question: "When are winter tyres required in France?",
            question_de: "Wann sind Winterreifen in Frankreich Pflicht?",
            answer: "In designated mountain zones (Loi Montagne), winter tyres or snow chains are mandatory 1 November–31 March when B26 signs apply. Check local prefecture orders for Alps and Pyrenees routes.",
            answer_de: "In Bergzonen (Loi Montagne) sind Winterreifen oder Schneeketten vom 1. November bis 31. März Pflicht, wenn B26-Schilder gelten. Lokale Anordnungen für Alpen und Pyrenäen prüfen.",
            relatedSourceIds: ["fr-securite-routiere"],
        },
    ],
    traffic_fines: {
        relatedSourceIds: ["fr-service-public-speed", "fr-service-public-fines", "fr-securite-routiere"],
        summaries: [
            {
                id: "speeding",
                icon: "speed",
                title: "Speeding",
                title_de: "Geschwindigkeit",
                summary: "France uses a points-based licence (permis à points). Fixed and mobile cameras are widespread; unmarked radar cars operate nationally.",
                summary_de: "Frankreich nutzt ein Punktesystem (permis à points). Feste und mobile Kameras sind weit verbreitet; unmarkierte Radarwagen sind im Einsatz.",
                maxConsequence: "Criminal offence from +50 km/h; licence suspension",
                maxConsequence_de: "Straftat ab +50 km/h; Führerscheinentzug",
            },
            {
                id: "phone",
                icon: "phone",
                title: "Mobile phone while driving",
                title_de: "Handy am Steuer",
                summary: "Handheld use, including holding the phone, is a 4th-class contravention.",
                summary_de: "Handygebrauch, auch in der Hand halten, ist Verstoß 4. Klasse.",
                maxConsequence: "€135 fine & 3 points",
                maxConsequence_de: "€135 Bußgeld & 3 Punkte",
            },
            {
                id: "alcohol",
                icon: "alcohol",
                title: "Alcohol offenses",
                title_de: "Alkohol am Steuer",
                summary: "Limit 0.05% BAC (0.02% for novices and professional drivers).",
                summary_de: "Grenze 0,05 % BAC (0,02 % für Fahranfänger und Berufsfahrer).",
                maxConsequence: "Criminal prosecution at high levels",
                maxConsequence_de: "Strafverfahren bei hohen Werten",
            },
        ],
        categories: [
            {
                id: "speeding",
                title: "Speeding",
                title_de: "Geschwindigkeitsüberschreitung",
                description: "Typical fixed fines (amende forfaitaire). Reduced amount if paid within 15 days where applicable. Source: Service-Public.fr F19460.",
                description_de: "Typische Pauschalstrafen. Ermäßigung bei Zahlung innerhalb 15 Tagen wo zutreffend. Quelle: Service-Public.fr F19460.",
                rows: [
                    {
                        id: "speed-under-20-outside",
                        speedOver: "+5 to +20 km/h (limit >50 km/h)",
                        consequences: { fine: "€68", fine_de: "€68", points: "1" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "speed-under-20-urban",
                        speedOver: "+5 to +20 km/h (limit ≤50 km/h)",
                        consequences: { fine: "€135", fine_de: "€135", points: "1" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "speed-20-30-urban",
                        speedOver: "+20 to +30 km/h (limit ≤50 km/h)",
                        consequences: { fine: "€135", fine_de: "€135", points: "2" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "speed-50-plus",
                        speedOver: "+50 km/h or more",
                        severe: true,
                        consequences: {
                            fine: "€250–€3,750",
                            fine_de: "€250–€3.750",
                            points: "6",
                            licenseSuspension: "possible",
                            licenseSuspension_de: "möglich",
                        },
                        appliesTo: ["car", "motorcycle"],
                    },
                ],
            },
            {
                id: "phone",
                title: "Phone use",
                title_de: "Handynutzung",
                rows: [
                    {
                        id: "phone-handheld",
                        description: "Handheld phone use while driving",
                        description_de: "Handy in der Hand am Steuer",
                        consequences: { fine: "€135", fine_de: "€135", points: "3" },
                        appliesTo: ["car", "motorcycle", "moped"],
                    },
                ],
            },
            {
                id: "alcohol",
                title: "Alcohol",
                title_de: "Alkohol",
                rows: [
                    {
                        id: "alcohol-over-limit",
                        description: "Over 0.05% BAC (experienced drivers)",
                        description_de: "Über 0,05 % BAC (erfahrene Fahrer)",
                        consequences: { fine: "€135", fine_de: "€135", points: "6" },
                        appliesTo: ["car", "motorcycle"],
                    },
                ],
            },
        ],
    },
    regional_variations: [
        {
            region_type: "city",
            region_name: "Paris",
            differences: {
                speed_limits: {
                    urban: 30,
                    rural: 70,
                    motorway: 70,
                    units: "km/h",
                    notes: "City-wide 30 km/h limit on most streets. Périphérique ring road 70 km/h.",
                },
            },
            notes: "Crit'Air ZFE mandatory. Avoid driving in central Paris if possible.",
            highlights: [
                {
                    icon: "zone",
                    title: "Crit'Air ZFE",
                    title_de: "Crit'Air Umweltzone",
                    description: "Low-emission zone covers Paris and inner suburbs. Order Crit'Air sticker before entry.",
                    description_de: "Umweltzone umfasst Paris und Innenstadt-Vororte. Crit'Air-Vignette vor Einfahrt bestellen.",
                },
            ],
        },
        {
            region_type: "city",
            region_name: "Lyon",
            notes: "Crit'Air ZFE in place. Tunnel and riverside routes can be congested.",
            highlights: [
                {
                    icon: "zone",
                    title: "Crit'Air required",
                    title_de: "Crit'Air erforderlich",
                    description: "Check your vehicle's Crit'Air class before entering the metropolitan low-emission zone.",
                    description_de: "Crit'Air-Klasse vor Einfahrt in die Metropol-Umweltzone prüfen.",
                },
            ],
        },
    ],
})

// ─── SPAIN ────────────────────────────────────────────────────────────────────
write("ES", {
    last_verified: "2026-05-27",
    data_coverage: "high",
    top_fines: [
        { title: "Mobile phone while driving", amount: "€200 + 6 points" },
        { title: "Speeding +21–30 km/h (grave)", amount: "from €300" },
        { title: "Alcohol 0.05–0.08 g/L", amount: "€500 + 4 points" },
    ],
    source_entries: [
        {
            id: "es-dgt",
            title: "DGT — Dirección General de Tráfico",
            url: "https://www.dgt.es/",
            publisher: "DGT",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "speed_limits",
            usageModuleKeys: ["speed_limits", "alcohol_limit", "priority_rules"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "es-dgt-multas",
            title: "Traffic fines — what to do",
            url: "https://www.dgt.es/nuestros-servicios/multas-y-sanciones/index.html",
            publisher: "DGT",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "fines",
            usageModuleKeys: ["fines"],
            notes: "50% discount if paid within 20 days of notification.",
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "es-dgt-sede",
            title: "DGT e-Office — Pay fines",
            url: "https://sede.dgt.gob.es/es/multas",
            publisher: "DGT",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "fines",
            usageModuleKeys: ["fines"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
        {
            id: "es-dgt-velocidad",
            title: "Speed limits in Spain",
            url: "https://www.dgt.es/nuestros-servicios/te-interesa/conducir/velocidad/",
            publisher: "DGT",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
            moduleKey: "speed_limits",
            usageModuleKeys: ["speed_limits"],
            checkStatus: "OK",
            lastCheckedAt: CHECKED,
        },
    ],
    sources: ["DGT", "sede.dgt.gob.es"],
    faq: [
        {
            id: "dgt-points",
            category: "documents",
            question: "How does the Spanish points licence work?",
            question_de: "Wie funktioniert das spanische Punktesystem?",
            answer: "Drivers start with 12 points (8 for new drivers). Serious offences deduct points; reaching zero means licence suspension. Points can be recovered through safe driving courses.",
            answer_de: "Fahrer starten mit 12 Punkten (8 für Fahranfänger). Schwere Verstöße ziehen Punkte ab; bei null droht Entzug. Punkte können durch Kurse zurückgewonnen werden.",
            relatedSourceIds: ["es-dgt", "es-dgt-multas"],
        },
        {
            id: "fine-discount-es",
            category: "fines",
            question: "Can I get a discount on Spanish traffic fines?",
            question_de: "Gibt es Rabatt auf spanische Bußgelder?",
            answer: "Yes. Pay within 20 calendar days of notification for a 50% reduction on the fine amount. Points are deducted regardless of payment timing.",
            answer_de: "Ja. Zahlung innerhalb 20 Tagen nach Zustellung bringt 50 % Ermäßigung auf den Betrag. Punkte werden unabhängig vom Zahlungszeitpunkt abgezogen.",
            relatedSourceIds: ["es-dgt-multas", "es-dgt-sede"],
        },
        {
            id: "phone-spain",
            category: "fines",
            question: "What is the fine for phone use while driving in Spain?",
            question_de: "Welches Bußgeld für Handy am Steuer in Spanien?",
            answer: "Using a handheld phone is a grave offence: €200 fine and 6 penalty points. Holding the phone counts—even at traffic lights.",
            answer_de: "Handy am Steuer ist schwerer Verstoß: €200 Bußgeld und 6 Punkte. Handy in der Hand zählt—auch an Ampeln.",
            relatedSourceIds: ["es-dgt-multas"],
        },
        {
            id: "alcohol-spain",
            category: "alcohol_limit",
            question: "What are Spain's drink-drive limits?",
            question_de: "Welche Promillegrenzen gelten in Spanien?",
            answer: "0.05% BAC for general drivers; 0.03% for novice drivers (first 2 years) and professionals. 0.05–0.08 g/L: €500 + 4 points. Above 0.12 g/L is a criminal offence. Refusing a breath test is treated as the highest category.",
            answer_de: "0,05 % BAC allgemein; 0,03 % für Fahranfänger (2 Jahre) und Berufsfahrer. 0,05–0,08 g/l: €500 + 4 Punkte. Über 0,12 g/l Straftat. Atemtest-Verweigerung wie höchste Kategorie.",
            relatedSourceIds: ["es-dgt", "es-dgt-multas"],
        },
        {
            id: "tolls-spain",
            category: "vignette_tolls",
            question: "Which Spanish motorways have tolls?",
            question_de: "Welche spanischen Autobahnen sind mautpflichtig?",
            answer: "Autopistas (AP) are often toll roads; Autovías (A) are usually free. Electronic tolls (telepeaje) operate without barriers on some routes—ensure your rental has a Via-T device or register the plate.",
            answer_de: "Autopistas (AP) oft mautpflichtig; Autovías (A) meist frei. Elektronische Maut ohne Schranken—Mietwagen braucht Via-T oder Kennzeichenregistrierung.",
            relatedSourceIds: ["es-dgt"],
        },
        {
            id: "zbe-madrid",
            category: "vignette_tolls",
            question: "What is Madrid Central / low-emission zone?",
            question_de: "Was ist Madrids Umweltzone?",
            answer: "Madrid and other cities operate ZBE (zonas de bajas emisiones). Non-compliant vehicles face fines. Register foreign plates where required before entering.",
            answer_de: "Madrid und andere Städte haben ZBE (Umweltzonen). Nicht konforme Fahrzeuge werden geahndet. Ausländische Kennzeichen ggf. vorher registrieren.",
            relatedSourceIds: ["es-dgt"],
        },
        {
            id: "v16-beacon",
            category: "mandatory_equipment",
            question: "Do I need a V16 warning beacon in Spain?",
            question_de: "Brauche ich in Spanien eine V16-Warnleuchte?",
            answer: "Since 2026 the V16 connected geolocated beacon replaces triangles on many roads. Using only triangles where V16 is required can be fined. Check DGT updates before travel.",
            answer_de: "Seit 2026 ersetzt die V16-Warnleuchte mit GPS an vielen Strecken die Warndreiecke. Nur Dreieck wo V16 Pflicht ist, kann geahndet werden. DGT-Updates vor Reise prüfen.",
            relatedSourceIds: ["es-dgt"],
        },
        {
            id: "idp-spain",
            category: "documents",
            question: "Do I need an IDP to drive in Spain?",
            question_de: "Brauche ich in Spanien einen IDP?",
            answer: "EU/EEA licences are accepted. Non-EU licences may require an International Driving Permit depending on origin; rental companies often require one. Carry passport and licence at all times.",
            answer_de: "EU/EWR-Führerscheine werden akzeptiert. Nicht-EU-Führerscheine können IDP erfordern; Mietwagenfirmen verlangen oft einen. Reisepass und Führerschein immer mitführen.",
            relatedSourceIds: ["es-dgt"],
        },
    ],
    traffic_fines: {
        relatedSourceIds: ["es-dgt-multas", "es-dgt-sede", "es-dgt"],
        summaries: [
            {
                id: "speeding",
                icon: "speed",
                title: "Speeding",
                title_de: "Geschwindigkeit",
                summary: "DGT uses fixed cameras, helicopters, and mobile units. No official tolerance buffer on limits.",
                summary_de: "DGT setzt feste Kameras, Helikopter und mobile Kontrollen ein. Kein offizieller Toleranzpuffer.",
                maxConsequence: "Criminal offence above +50 km/h; licence suspension",
                maxConsequence_de: "Straftat über +50 km/h; Führerscheinentzug",
            },
            {
                id: "phone",
                icon: "phone",
                title: "Mobile phone",
                title_de: "Handy am Steuer",
                summary: "Grave offence with 6 penalty points.",
                summary_de: "Schwerer Verstoß mit 6 Punkten.",
                maxConsequence: "€200 fine & 6 points",
                maxConsequence_de: "€200 Bußgeld & 6 Punkte",
            },
            {
                id: "alcohol",
                icon: "alcohol",
                title: "Alcohol",
                title_de: "Alkohol",
                summary: "Strict limits; refusing breath test equals highest BAC category.",
                summary_de: "Strenge Grenzen; Atemtest-Verweigerung wie höchste BAC-Kategorie.",
                maxConsequence: "Criminal prosecution above 0.12 g/L",
                maxConsequence_de: "Strafverfahren über 0,12 g/l",
            },
        ],
        categories: [
            {
                id: "speeding",
                title: "Speeding",
                title_de: "Geschwindigkeit",
                description: "Grave (grave) and very grave (muy grave) categories. 50% discount if paid within 20 days. Source: DGT.",
                description_de: "Kategorien grave und muy grave. 50 % Ermäßigung bei Zahlung innerhalb 20 Tagen. Quelle: DGT.",
                rows: [
                    {
                        id: "speed-21-30",
                        speedOver: "+21 to +30 km/h",
                        consequences: { fine: "from €300", fine_de: "ab €300", points: "4" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "speed-31-40",
                        speedOver: "+31 to +40 km/h",
                        consequences: { fine: "from €400", fine_de: "ab €400", points: "6" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "speed-50-plus",
                        speedOver: "+50 km/h or more",
                        severe: true,
                        consequences: {
                            fine: "from €500",
                            fine_de: "ab €500",
                            points: "6",
                            licenseSuspension: "up to 6 months",
                            licenseSuspension_de: "bis 6 Monate",
                        },
                        appliesTo: ["car", "motorcycle"],
                    },
                ],
            },
            {
                id: "phone",
                title: "Phone use",
                title_de: "Handynutzung",
                rows: [
                    {
                        id: "phone-handheld",
                        description: "Handheld phone while driving",
                        description_de: "Handy in der Hand am Steuer",
                        consequences: { fine: "€200", fine_de: "€200", points: "6" },
                        appliesTo: ["car", "motorcycle"],
                    },
                ],
            },
            {
                id: "alcohol",
                title: "Alcohol",
                title_de: "Alkohol",
                rows: [
                    {
                        id: "alcohol-05-08",
                        description: "0.05–0.08 g/L in blood",
                        description_de: "0,05–0,08 g/l im Blut",
                        consequences: { fine: "€500", fine_de: "€500", points: "4" },
                        appliesTo: ["car", "motorcycle"],
                    },
                    {
                        id: "alcohol-08-12",
                        description: "0.08–0.12 g/L in blood",
                        description_de: "0,08–0,12 g/l im Blut",
                        consequences: { fine: "€1,000", fine_de: "€1.000", points: "6" },
                        appliesTo: ["car", "motorcycle"],
                    },
                ],
            },
        ],
    },
    regional_variations: [
        {
            region_type: "city",
            region_name: "Madrid",
            notes: "ZBE low-emission zone. Madrid Central restricts non-resident access.",
            highlights: [
                {
                    icon: "zone",
                    title: "ZBE Madrid",
                    title_de: "Umweltzone Madrid",
                    description: "Register your vehicle category before driving into the low-emission zone.",
                    description_de: "Fahrzeugkategorie vor Einfahrt in die Umweltzone registrieren.",
                },
            ],
        },
        {
            region_type: "city",
            region_name: "Barcelona",
            notes: "ZBE covers most of the city. Foreign vehicles must register for access.",
            highlights: [
                {
                    icon: "zone",
                    title: "Barcelona ZBE",
                    title_de: "Barcelona Umweltzone",
                    description: "Check DGT and Ajuntament de Barcelona rules for foreign-plate registration.",
                    description_de: "DGT- und Stadtregeln für ausländische Kennzeichen prüfen.",
                },
            ],
        },
    ],
})

// ─── Remaining countries ────────────────────────────────────────────────────
function enrichCountry(iso2, patch) {
    write(iso2, { last_verified: "2026-05-27", data_coverage: "high", ...patch })
}

enrichCountry("CH", {
    top_fines: [
        { title: "Speeding +16 km/h in town", amount: "from CHF 250" },
        { title: "Motorway vignette missing", amount: "CHF 200 + vignette" },
        { title: "Phone while driving", amount: "from CHF 100" },
    ],
    source_entries: [
        { id: "ch-astra-vignette", title: "ASTRA — Motorway vignette", url: "https://www.astra.admin.ch/astra/en/home/management/contributions-fees/vignette.html", publisher: "ASTRA", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ch-astra-traffic", title: "ASTRA — Road traffic rules", url: "https://www.astra.admin.ch/astra/en/home.html", publisher: "ASTRA", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ch-fedpol", title: "Fedpol — Traffic enforcement", url: "https://www.fedpol.admin.ch/", publisher: "Fedpol", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["ASTRA", "Fedpol"],
    summary: "Switzerland enforces traffic rules strictly with high CHF fines. Motorway vignette mandatory.",
    rules: { tolls: { required: true, type: "vignette", notes: "Annual e-vignette required. Fine CHF 200 if missing." }, alcohol_limit: { value: 0.05, unit: "BAC", notes: "0.01% for professional/novice drivers." } },
    faq: [
        { id: "vignette-ch", category: "vignette_tolls", question: "Do I need a Swiss motorway vignette?", question_de: "Brauche ich eine Schweizer Vignette?", answer: "Yes on all motorways. Buy e-vignette online before entry.", answer_de: "Ja auf allen Autobahnen. E-Vignette vor Einfahrt online kaufen.", relatedSourceIds: ["ch-astra-vignette"] },
    ],
    traffic_fines: { relatedSourceIds: ["ch-fedpol"], summaries: [{ id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "High CHF fines.", summary_de: "Hohe CHF-Strafen.", maxConsequence: "Ban", maxConsequence_de: "Verbot" }], categories: [{ id: "speeding", title: "Speeding", title_de: "Geschwindigkeit", rows: [{ id: "vignette", description: "No vignette", description_de: "Keine Vignette", consequences: { fine: "CHF 200", fine_de: "CHF 200" }, appliesTo: ["car"] }] }] },
})

console.log("Done — enriched FR, ES, CH")

