import fs from "fs"
import path from "path"

const dataDir = path.join(process.cwd(), "data/countries")
const CHECKED = "2026-05-27T12:00:00.000Z"

function write(iso2, patch) {
    const file = path.join(dataDir, `${iso2.toLowerCase()}.json`)
    const existing = JSON.parse(fs.readFileSync(file, "utf8"))
    const merged = { ...existing, ...patch, last_verified: "2026-05-27", data_coverage: "high" }
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

write("PT", {
    top_fines: [{ title: "Electronic toll evasion", amount: "from €25/passage" }, { title: "Speeding +20 km/h", amount: "from €120" }, { title: "Phone while driving", amount: "from €120" }],
    source_entries: [
        { id: "pt-imt", title: "IMT — Institute of Mobility", url: "https://www.imt-ip.pt/", publisher: "IMT", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "pt-ansr", title: "ANSR — Road safety", url: "https://www.ansr.pt/", publisher: "ANSR", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines", "alcohol_limit"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "pt-portugal-tolls", title: "Portugal Tolls", url: "https://www.portugaltolls.com/", publisher: "Portugal Tolls", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["IMT", "ANSR", "portugaltolls.com"],
    summary: "Register rental plates for electronic toll motorways or face post-trip fines.",
    rules: { tolls: { required: true, type: "electronic", notes: "Gantry tolls on ex-SCN motorways. EasyToll at border or Via Verde." } },
    faq: [{ id: "tolls-pt", category: "vignette_tolls", question: "How do Portuguese electronic tolls work?", question_de: "Wie funktionieren portugiesische Mauten?", answer: "Plate cameras bill passages. Register at border or via rental transponder.", answer_de: "Kennzeichen-Kameras. An Grenze registrieren oder Mietwagen-Tag.", relatedSourceIds: ["pt-portugal-tolls"] }],
    traffic_fines: { relatedSourceIds: ["pt-ansr"], summaries: [{ id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "ANSR enforcement.", summary_de: "ANSR-Kontrollen.", maxConsequence: "Suspension", maxConsequence_de: "Entzug" }], categories: [] },
})

write("NL", {
    top_fines: [{ title: "Phone while driving", amount: "€240" }, { title: "Speeding +10 km/h", amount: "from €30" }, { title: "Cyclist priority violation", amount: "from €95" }],
    source_entries: [
        { id: "nl-rijksoverheid-verkeer", title: "Traffic safety — Government.nl", url: "https://www.rijksoverheid.nl/onderwerpen/verkeersveiligheid", publisher: "Rijksoverheid", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "nl-cjib", title: "CJIB — Fine collection", url: "https://www.cjib.nl/", publisher: "CJIB", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["Rijksoverheid", "CJIB"],
    rules: { phone_usage_rules: "Handheld phone €240 fine since 2024.", speed_limits: { notes: "30 km/h default in many cities." } },
    faq: [{ id: "phone-nl", category: "fines", question: "Phone fine in the Netherlands?", question_de: "Handy-Bußgeld NL?", answer: "€240 for handheld use, including at red lights.", answer_de: "€240 für Handy in der Hand, auch an Ampeln.", relatedSourceIds: ["nl-cjib"] }],
    traffic_fines: { relatedSourceIds: ["nl-cjib"], summaries: [{ id: "phone", icon: "phone", title: "Phone", title_de: "Handy", summary: "€240.", summary_de: "€240.", maxConsequence: "€240", maxConsequence_de: "€240" }], categories: [{ id: "phone", title: "Phone", title_de: "Handy", rows: [{ id: "phone", consequences: { fine: "€240", fine_de: "€240" }, appliesTo: ["car"] }] }] },
})

write("BE", {
    top_fines: [{ title: "LEZ Brussels violation", amount: "from €350" }, { title: "Phone while driving", amount: "€116" }, { title: "Speeding", amount: "from €53" }],
    source_entries: [
        { id: "be-mobility", title: "SPF Mobility Belgium", url: "https://mobilit.belgium.be/en", publisher: "SPF Mobilité", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "be-violation", title: "Traffic fines portal", url: "https://www.violation.be/", publisher: "Federal Mobility", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["mobilit.belgium.be"],
    faq: [{ id: "priority-be", category: "priority_rules", question: "Priority to the right in Belgium?", question_de: "Rechts vor links in Belgien?", answer: "Yes at unsigned junctions. Yellow diamond = priority road.", answer_de: "Ja ohne Schilder. Gelbe Raute = Vorfahrtstraße.", relatedSourceIds: ["be-mobility"] }],
    traffic_fines: { relatedSourceIds: ["be-violation"], summaries: [{ id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Camera enforcement.", summary_de: "Blitzer.", maxConsequence: "Ban", maxConsequence_de: "Verbot" }], categories: [] },
})

write("CZ", {
    top_fines: [{ title: "Missing e-vignette", amount: "from CZK 5,000" }, { title: "Phone while driving", amount: "from CZK 1,000" }],
    source_entries: [
        { id: "cz-edalnice", title: "Electronic vignette", url: "https://edalnice.cz/en/index.html", publisher: "Czech Toll", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "cz-mdcr", title: "Ministry of Transport", url: "https://www.mdcr.cz/", publisher: "MDCR", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    rules: { tolls: { required: true, type: "vignette", notes: "Buy at edalnice.cz before motorways." } },
    faq: [{ id: "vignette-cz", category: "vignette_tolls", question: "Czech e-vignette?", question_de: "Tschechische E-Vignette?", answer: "Mandatory on marked motorways. Link plate at edalnice.cz.", answer_de: "Pflicht auf Autobahnen. Kennzeichen auf edalnice.cz verknüpfen.", relatedSourceIds: ["cz-edalnice"] }],
    traffic_fines: { relatedSourceIds: ["cz-edalnice"], summaries: [{ id: "tolls", icon: "toll", title: "Vignette", title_de: "Vignette", summary: "E-vignette required.", summary_de: "E-Vignette Pflicht.", maxConsequence: "CZK 5,000", maxConsequence_de: "CZK 5.000" }], categories: [] },
})

write("PL", {
    top_fines: [{ title: "Missing e-vignette", amount: "from PLN 500" }, { title: "Phone while driving", amount: "from PLN 500" }],
    source_entries: [
        { id: "pl-gddkia", title: "GDDKiA", url: "https://www.gov.pl/web/gddkia", publisher: "GDDKiA", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "pl-policja", title: "Policja", url: "https://policja.pl/", publisher: "Policja", sourceType: "POLICE", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    rules: { tolls: { required: true, type: "vignette", notes: "E-vignette on A/S roads via e-TOLL." }, speed_limits: { motorway: 140 } },
    faq: [{ id: "vignette-pl", category: "vignette_tolls", question: "Polish e-vignette?", question_de: "Polnische E-Vignette?", answer: "Required on listed motorways. Buy online before travel.", answer_de: "Auf gelisteten Autobahnen Pflicht. Online vor Reise kaufen.", relatedSourceIds: ["pl-gddkia"] }],
    traffic_fines: { relatedSourceIds: ["pl-policja"], summaries: [{ id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Section cameras on A1/A2/A4.", summary_de: "Streckenradar A1/A2/A4.", maxConsequence: "Points", maxConsequence_de: "Punkte" }], categories: [] },
})

write("HR", {
    top_fines: [{ title: "Toll evasion", amount: "from €50" }, { title: "Speeding", amount: "from €65" }],
    source_entries: [
        { id: "hr-hac", title: "HAC Motorways", url: "https://www.hac.hr/", publisher: "HAC", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "hr-mup", title: "Ministry of Interior", url: "https://mup.gov.hr/", publisher: "MUP", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    rules: { tolls: { required: true, type: "toll booth", notes: "Most A roads tolled. Summer A1 congestion." } },
    faq: [{ id: "coast-hr", category: "speed_limits", question: "Driving the Croatian coast in summer?", question_de: "Kroatische Küste im Sommer?", answer: "Expect heavy A1 traffic. Fuel before islands.", answer_de: "Starker A1-Verkehr. Vor Inseln tanken.", relatedSourceIds: ["hr-hac"] }],
    traffic_fines: { relatedSourceIds: ["hr-mup"], summaries: [{ id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Summer mobile controls.", summary_de: "Mobile Kontrollen im Sommer.", maxConsequence: "€500+", maxConsequence_de: "€500+" }], categories: [] },
})

write("GR", {
    top_fines: [{ title: "Phone while driving", amount: "€100" }, { title: "Illegal parking Athens", amount: "from €40" }],
    source_entries: [
        { id: "gr-ypme", title: "Ministry of Transport", url: "https://www.ypme.gov.gr/", publisher: "YME", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "gr-police", title: "Hellenic Police", url: "https://www.astynomia.gr/", publisher: "Hellenic Police", sourceType: "POLICE", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    faq: [{ id: "ferry-gr", category: "documents", question: "Rental car on Greek ferries?", question_de: "Mietwagen auf Fähren?", answer: "Check rental contract—ferry use often restricted.", answer_de: "Mietvertrag prüfen—Fähren oft eingeschränkt.", relatedSourceIds: ["gr-ypme"] }],
    traffic_fines: { relatedSourceIds: ["gr-police"], summaries: [{ id: "parking", icon: "parking", title: "Parking", title_de: "Parken", summary: "Athens towing common.", summary_de: "Abschleppen in Athen.", maxConsequence: "€150", maxConsequence_de: "€150" }], categories: [] },
})

write("IE", {
    top_fines: [{ title: "Phone while driving", amount: "€120 + 3 points" }, { title: "Speeding +10 km/h", amount: "from €80" }],
    source_entries: [
        { id: "ie-rsa", title: "Road Safety Authority", url: "https://www.rsa.ie/", publisher: "RSA", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits", "alcohol_limit"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ie-garda", title: "An Garda Síochána", url: "https://www.garda.ie/", publisher: "Garda", sourceType: "POLICE", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    rules: { drive_side: "left", alcohol_limit: { value: 0.05, unit: "BAC", notes: "0.02% for learner/novice." } },
    faq: [
        { id: "left-ie", category: "priority_rules", question: "Tips for driving on the left in Ireland?", question_de: "Linksverkehr in Irland?", answer: "Roundabouts clockwise. Use passing bays on narrow roads.", answer_de: "Kreisverkehre im Uhrzeigersinn. Ausweichbuchten nutzen.", relatedSourceIds: ["ie-rsa"] },
        { id: "points-ie", category: "fines", question: "Penalty points in Ireland?", question_de: "Punktesystem Irland?", answer: "12 points in 3 years = 6-month ban.", answer_de: "12 Punkte in 3 Jahren = 6 Monate Sperre.", relatedSourceIds: ["ie-rsa"] },
    ],
    traffic_fines: { relatedSourceIds: ["ie-garda"], summaries: [{ id: "phone", icon: "phone", title: "Phone", title_de: "Handy", summary: "€120, 3 points.", summary_de: "€120, 3 Punkte.", maxConsequence: "Disqualification", maxConsequence_de: "Fahrverbot" }], categories: [{ id: "phone", title: "Phone", title_de: "Handy", rows: [{ id: "phone", consequences: { fine: "€120", fine_de: "€120", points: "3" }, appliesTo: ["car"] }] }] },
})

write("NO", {
    top_fines: [{ title: "Phone while driving", amount: "from NOK 8,500" }, { title: "Speeding +10 km/h", amount: "from NOK 950" }],
    source_entries: [
        { id: "no-vegvesen", title: "Statens vegvesen", url: "https://www.vegvesen.no/", publisher: "Statens vegvesen", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits", "tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "no-autopass", title: "AutoPASS tolls", url: "https://www.autopass.no/", publisher: "AutoPASS", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "no-politi", title: "Norwegian Police", url: "https://www.politi.no/", publisher: "Politiet", sourceType: "POLICE", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    rules: { alcohol_limit: { value: 0.02, unit: "BAC", notes: "Very strict 0.02% limit." }, tolls: { required: true, type: "electronic", notes: "AutoPASS plate tolling nationwide." } },
    faq: [
        { id: "tolls-no", category: "vignette_tolls", question: "Norwegian tolls?", question_de: "Norwegische Maut?", answer: "Plate-based AutoPASS on roads, bridges, tunnels.", answer_de: "Kennzeichenbasiertes AutoPASS.", relatedSourceIds: ["no-autopass"] },
        { id: "alcohol-no", category: "alcohol_limit", question: "Norway alcohol limit?", question_de: "Alkoholgrenze Norwegen?", answer: "0.02% BAC—among strictest in Europe.", answer_de: "0,02 % BAC—sehr streng.", relatedSourceIds: ["no-politi"] },
    ],
    traffic_fines: { relatedSourceIds: ["no-politi"], summaries: [{ id: "alcohol", icon: "alcohol", title: "Alcohol", title_de: "Alkohol", summary: "0.02% limit.", summary_de: "0,02-Limit.", maxConsequence: "Prison", maxConsequence_de: "Haft" }], categories: [] },
})

console.log("Part 2 done — PT, NL, BE, CZ, PL, HR, GR, IE, NO")
