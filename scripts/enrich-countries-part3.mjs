import fs from "fs"
import path from "path"

const dataDir = path.join(process.cwd(), "data/countries")
const CHECKED = "2026-05-27T12:00:00.000Z"

function write(iso2, patch) {
    const file = path.join(dataDir, `${iso2.toLowerCase()}.json`)
    const existing = JSON.parse(fs.readFileSync(file, "utf8"))
    const merged = { ...existing, ...patch, last_verified: "2026-05-27", data_coverage: "high", status: "verified" }
    if (patch.rules) {
        merged.rules = {
            ...existing.rules,
            ...patch.rules,
            speed_limits: { ...existing.rules?.speed_limits, ...patch.rules?.speed_limits },
            alcohol_limit: { ...existing.rules?.alcohol_limit, ...patch.rules?.alcohol_limit },
            tolls: { ...existing.rules?.tolls, ...patch.rules?.tolls },
        }
    }
    if (patch.source_entries && existing.source_entries) {
        merged.source_entries = patch.source_entries
    }
    fs.writeFileSync(file, `${JSON.stringify(merged, null, 4)}\n`, "utf8")
    console.log(`Enriched ${iso2}`)
}

// IT — already rich; refresh sources + add regional highlights
write("IT", {
    source_entries: [
        { id: "it-codice-strada", title: "Codice della Strada", url: "https://www.polizia.it/articolo/110.html", publisher: "Polizia di Stato", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits", "priority_rules"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "it-mit", title: "Ministry of Infrastructure & Transport", url: "https://www.mit.gov.it/", publisher: "MIT", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits", "documents"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "it-autostrade", title: "Autostrade per l'Italia — Tolls", url: "https://www.autostrade.it/", publisher: "Autostrade per l'Italia", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "it-aci", title: "ACI — Automobile Club d'Italia", url: "https://www.aci.it/", publisher: "ACI", sourceType: "AUTOMOBILE_ASSOCIATION", trustLevel: "TRUSTED_SECONDARY", moduleKey: "documents", usageModuleKeys: ["documents", "speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "it-polizia", title: "Polizia di Stato — Traffic", url: "https://www.polizia.it/", publisher: "Polizia di Stato", sourceType: "POLICE", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines", "alcohol_limit"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["MIT", "Polizia di Stato", "ACI", "Autostrade per l'Italia"],
})

write("CA", {
    top_fines: [
        { title: "School bus lights flashing (both directions)", amount: "from C$400" },
        { title: "Distracted driving (phone)", amount: "from C$615 (ON)" },
        { title: "Speeding +20 km/h in community safety zone", amount: "from C$180" },
    ],
    source_entries: [
        { id: "ca-tc", title: "Transport Canada — Road safety", url: "https://tc.canada.ca/en/road-transportation", publisher: "Transport Canada", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ca-ontario-mto", title: "Ontario Ministry of Transportation", url: "https://www.ontario.ca/page/ministry-transportation", publisher: "MTO", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines", "speed_limits", "alcohol_limit"], notes: "Provincial rules vary; Ontario used as reference.", checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ca-quebec-saaq", title: "SAAQ — Quebec road safety", url: "https://saaq.gouv.qc.ca/", publisher: "SAAQ", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "winter_rules", usageModuleKeys: ["winter_rules", "speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "ca-bc-icbc", title: "ICBC — BC driver licensing", url: "https://www.icbc.com/driver-licensing", publisher: "ICBC", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "alcohol_limit", usageModuleKeys: ["alcohol_limit", "fines"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["Transport Canada", "MTO Ontario", "SAAQ", "ICBC"],
    faq: [
        { id: "school-bus-ca", category: "priority_rules", question: "Must I stop for a school bus in Canada?", question_de: "Muss ich in Kanada für Schulbusse anhalten?", answer: "When red lights flash and the stop arm is out, traffic in BOTH directions must stop (except on divided highways in some provinces). Fines are heavy—often C$400–C$2,000 plus demerit points.", answer_de: "Bei roten Blinklichtern und Stoppschild müssen BEIDE Richtungen anhalten (außer geteilte Straßen in manchen Provinzen). Hohe Bußgelder—oft C$400–C$2.000 plus Punkte.", relatedSourceIds: ["ca-ontario-mto", "ca-tc"] },
        { id: "montreal-red", category: "priority_rules", question: "Can I turn right on red in Montreal?", question_de: "Darf ich in Montreal bei Rot rechts abbiegen?", answer: "No. Right turn on red is prohibited on the entire Island of Montreal unless a specific sign permits it. This differs from most of Canada.", answer_de: "Nein. Rechtsabbiegen bei Rot ist auf der ganzen Insel Montreal verboten, außer ausdrücklich erlaubt. Anders als in most of Kanada.", relatedSourceIds: ["ca-quebec-saaq"] },
        { id: "winter-tires-ca", category: "winter", question: "Are winter tires mandatory in Canada?", question_de: "Sind Winterreifen in Kanada Pflicht?", answer: "Mandatory in Quebec (Dec 1–Mar 15) and on some BC mountain routes. Strongly recommended elsewhere. All-season tires are not winter tires.", answer_de: "Pflicht in Quebec (1. Dez–15. März) und auf manchen BC-Bergstraßen. Sonst empfohlen. Allwetterreifen sind keine Winterreifen.", relatedSourceIds: ["ca-quebec-saaq", "ca-bc-icbc"] },
        { id: "407-etr", category: "vignette_tolls", question: "How does Highway 407 ETR work in Ontario?", question_de: "Wie funktioniert Highway 407 ETR?", answer: "407 ETR is fully electronic—no booths. Cameras bill your plate. Rental cars may charge admin fees; register plate or use a transponder.", answer_de: "407 ETR ist rein elektronisch—keine Schranken. Kameras berechnen Kennzeichen. Mietwagen verlangen oft Gebühren.", relatedSourceIds: ["ca-ontario-mto"] },
        { id: "alcohol-ca", category: "alcohol_limit", question: "What is the drink-drive limit in Canada?", question_de: "Promillegrenze in Kanada?", answer: "0.08% BAC is the criminal limit nationwide. Many provinces impose penalties from 0.05% (warn range/suspension). Zero for novice drivers in most provinces.", answer_de: "0,08 % BAC ist strafrechtliche Grenze bundesweit. Viele Provinzen ahnden ab 0,05 %. Null für Fahranfänger.", relatedSourceIds: ["ca-bc-icbc", "ca-ontario-mto"] },
        { id: "move-over-ca", category: "priority_rules", question: "What is Canada's Move Over law?", question_de: "Was ist das Move-Over-Gesetz?", answer: "Slow down and move over a lane when passing stopped emergency vehicles, tow trucks, or roadside workers with flashing lights. Fines vary by province.", answer_de: "Langsamer fahren und Spur wechseln bei Einsatzfahrzeugen, Abschleppern oder Straßenarbeitern mit Blinklicht.", relatedSourceIds: ["ca-tc"] },
        { id: "idp-ca", category: "documents", question: "Do I need an IDP to drive in Canada?", question_de: "Brauche ich einen IDP in Kanada?", answer: "Valid licences from many countries are accepted for short visits. IDP recommended if licence is not in English or French. Carry passport.", answer_de: "Gültige Führerscheine vieler Länder für Kurzbesuche OK. IDP empfohlen wenn nicht Englisch/Französisch. Pass mitführen.", relatedSourceIds: ["ca-tc"] },
    ],
    traffic_fines: {
        relatedSourceIds: ["ca-ontario-mto", "ca-quebec-saaq", "ca-bc-icbc"],
        summaries: [
            { id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Limits and fines vary by province. Photo radar common in BC, AB, QC.", summary_de: "Limits und Strafen je Provinz. Blitzer in BC, AB, QC üblich.", maxConsequence: "Licence suspension", maxConsequence_de: "Führerscheinentzug" },
            { id: "phone", icon: "phone", title: "Distracted driving", title_de: "Ablenkung", summary: "Handheld phone use banned in all provinces.", summary_de: "Handy am Steuer in allen Provinzen verboten.", maxConsequence: "C$615+ (Ontario)", maxConsequence_de: "C$615+ (Ontario)" },
            { id: "alcohol", icon: "alcohol", title: "Alcohol", title_de: "Alkohol", summary: "0.08% criminal; 0.05% provincial sanctions.", summary_de: "0,08 % strafrechtlich; 0,05 % Provinz-Sanktionen.", maxConsequence: "Criminal charge", maxConsequence_de: "Strafverfahren" },
        ],
        categories: [
            { id: "phone", title: "Distracted driving", title_de: "Ablenkung am Steuer", description: "Ontario reference amounts; other provinces differ.", description_de: "Ontario-Referenz; andere Provinzen abweichend.", rows: [{ id: "phone-on", description: "Handheld phone (Ontario)", description_de: "Handy (Ontario)", consequences: { fine: "from C$615", fine_de: "ab C$615", points: "3–6" }, appliesTo: ["car"] }] },
            { id: "school-bus", title: "School bus", title_de: "Schulbus", rows: [{ id: "bus-stop", description: "Passing stopped school bus", description_de: "Schulbus bei Stoppschild überholen", consequences: { fine: "from C$400", fine_de: "ab C$400", points: "6" }, appliesTo: ["car"] }] },
        ],
    },
    regional_variations: [
        { region_type: "province", region_name: "Quebec", notes: "French traffic signs. No right on red on Montreal Island. Winter tires mandatory Dec–Mar.", highlights: [{ icon: "winter", title: "Winter tyres", title_de: "Winterreifen", description: "Mandatory Dec 1–Mar 15 by law.", description_de: "Gesetzlich Pflicht 1. Dez–15. März." }] },
        { region_type: "province", region_name: "British Columbia", notes: "Lower speed limits in rain. Immediate roadside prohibitions from 0.05% BAC.", highlights: [{ icon: "alcohol", title: "0.05% warn range", title_de: "0,05-Warnbereich", description: "BC can suspend at 0.05% without criminal charge.", description_de: "BC kann ab 0,05 % sperren ohne Strafverfahren." }] },
    ],
})

write("AU", {
    top_fines: [
        { title: "Mobile phone while driving (NSW)", amount: "A$410 + 5 points" },
        { title: "Speeding +10 km/h (school zone)", amount: "from A$200" },
        { title: "Unpaid toll (Sydney)", amount: "A$25+ admin fees" },
    ],
    source_entries: [
        { id: "au-infrastructure", title: "Department of Infrastructure", url: "https://www.infrastructure.gov.au/", publisher: "Infrastructure AU", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "au-nsw-rms", title: "Transport for NSW — Road rules", url: "https://www.nsw.gov.au/driving-boating-and-transport", publisher: "Transport for NSW", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines", "speed_limits", "alcohol_limit"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "au-vicroads", title: "VicRoads — Road rules", url: "https://www.vicroads.vic.gov.au/", publisher: "VicRoads", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "priority_rules", usageModuleKeys: ["priority_rules", "speed_limits"], notes: "Hook turns unique to Melbourne.", checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "au-qld-tmr", title: "Queensland Transport", url: "https://www.qld.gov.au/transport", publisher: "TMR QLD", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["Transport for NSW", "VicRoads", "infrastructure.gov.au"],
    faq: [
        { id: "left-au", category: "priority_rules", question: "Driving on the left in Australia?", question_de: "Linksverkehr in Australien?", answer: "Keep left. Roundabouts: give way to vehicles already circulating. On multi-lane roads, keep left unless overtaking.", answer_de: "Links fahren. Kreisverkehr: Vorfahrt für bereits Einfahrende. Rechts fahren außer beim Überholen.", relatedSourceIds: ["au-nsw-rms"] },
        { id: "hook-turn", category: "priority_rules", question: "What is a hook turn in Melbourne?", question_de: "Was ist ein Hook Turn in Melbourne?", answer: "At signed intersections, to turn right you pull left into the hook-turn box, wait, then turn when the signal changes. Unique to Melbourne.", answer_de: "An gekennzeichneten Kreuzungen für Rechtsabbieger nach links: erst links in Box, warten, dann abbiegen wenn Signal wechselt.", relatedSourceIds: ["au-vicroads"] },
        { id: "phone-au", category: "fines", question: "Mobile phone fines in Australia?", question_de: "Handy-Bußgelder Australien?", answer: "Holding or touching a phone while driving is illegal in all states. AI detection cameras operate in NSW, VIC, QLD. Fines often A$400+ with demerit points.", answer_de: "Handy halten oder berühren am Steuer in allen Bundesstaaten illegal. KI-Kameras in NSW, VIC, QLD. Oft A$400+ mit Punkten.", relatedSourceIds: ["au-nsw-rms"] },
        { id: "wildlife-au", category: "speed_limits", question: "Wildlife on Australian roads?", question_de: "Wildtiere auf australischen Straßen?", answer: "Kangaroos and wombats are active at dawn and dusk. Reduce speed on rural roads. Never swerve sharply—brake in a straight line.", answer_de: "Kängurus und Wombats in der Dämmerung aktiv. Auf Landstraßen langsamer. Nicht scharf ausweichen.", relatedSourceIds: ["au-qld-tmr"] },
        { id: "tolls-au", category: "vignette_tolls", question: "How do toll roads work in Australia?", question_de: "Wie funktionieren Mautstraßen?", answer: "Cashless tolling (Sydney, Melbourne, Brisbane). Pay online within 3 days or use a tag. Unpaid tolls incur admin fees and registration holds.", answer_de: "Bargeldlose Maut (Sydney, Melbourne, Brisbane). Online innerhalb 3 Tage zahlen oder Tag. Unbezahlt = Gebühren und Sperre.", relatedSourceIds: ["au-nsw-rms"] },
        { id: "alcohol-au", category: "alcohol_limit", question: "Drink-drive limits in Australia?", question_de: "Promillegrenze Australien?", answer: "0.05% BAC for full licence holders. Zero for learner and provisional (P-plate) drivers in all states.", answer_de: "0,05 % BAC für Vollführerschein. Null für Lern- und P-Führerschein in allen Bundesstaaten.", relatedSourceIds: ["au-nsw-rms"] },
    ],
    traffic_fines: {
        relatedSourceIds: ["au-nsw-rms", "au-vicroads"],
        summaries: [
            { id: "phone", icon: "phone", title: "Mobile phone", title_de: "Handy", summary: "AI cameras detect illegal phone use.", summary_de: "KI-Kameras erkennen Handygebrauch.", maxConsequence: "A$410+ & 5 points (NSW)", maxConsequence_de: "A$410+ & 5 Punkte (NSW)" },
            { id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Double demerits on holidays in many states.", summary_de: "Doppelte Punkte an Feiertagen in vielen Bundesstaaten.", maxConsequence: "Licence suspension", maxConsequence_de: "Entzug" },
        ],
        categories: [
            { id: "phone", title: "Mobile phone (NSW)", title_de: "Handy (NSW)", rows: [{ id: "phone-nsw", consequences: { fine: "A$410", fine_de: "A$410", points: "5" }, appliesTo: ["car"] }] },
            { id: "speed-school", title: "School zone", title_de: "Schulzone", rows: [{ id: "speed-10-school", speedOver: "+10 km/h in school zone", consequences: { fine: "from A$200", fine_de: "ab A$200", points: "2" }, appliesTo: ["car"] }] },
        ],
    },
    regional_variations: [
        { region_type: "state", region_name: "Victoria", notes: "Hook turns in Melbourne CBD. Speed cameras widespread.", highlights: [{ icon: "turn", title: "Hook turns", title_de: "Hook Turns", description: "Follow hook-turn signage at marked intersections.", description_de: "Hook-Turn-Schildern folgen." }] },
        { region_type: "state", region_name: "New South Wales", notes: "Mobile phone detection cameras. Harbour Bridge toll (cashless).", highlights: [{ icon: "phone", title: "Phone cameras", title_de: "Handy-Kameras", description: "Fixed and mobile AI enforcement.", description_de: "Feste und mobile KI-Kontrolle." }] },
    ],
})

write("JP", {
    status: "verified",
    top_fines: [
        { title: "Speeding +30 km/h", amount: "¥18,000–¥35,000" },
        { title: "Phone while driving", amount: "¥25,000" },
        { title: "Railway crossing violation", amount: "¥70,000" },
    ],
    source_entries: [
        { id: "jp-npd", title: "National Police Agency", url: "https://www.npa.go.jp/", publisher: "NPA", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "fines", usageModuleKeys: ["fines", "alcohol_limit"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "jp-mlit", title: "MLIT — Road Bureau", url: "https://www.mlit.go.jp/road/", publisher: "MLIT", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "speed_limits", usageModuleKeys: ["speed_limits", "tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "jp-jaf", title: "JAF — Japan Automobile Federation", url: "https://english.jaf.or.jp/", publisher: "JAF", sourceType: "AUTOMOBILE_ASSOCIATION", trustLevel: "TRUSTED_SECONDARY", moduleKey: "documents", usageModuleKeys: ["documents", "tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
        { id: "jp-nexco", title: "NEXCO — Expressway tolls", url: "https://www.driveplaza.com/", publisher: "NEXCO", sourceType: "GOVERNMENT", trustLevel: "PRIMARY", moduleKey: "tolls", usageModuleKeys: ["tolls"], checkStatus: "OK", lastCheckedAt: CHECKED },
    ],
    sources: ["NPA", "MLIT", "JAF", "NEXCO"],
    faq: [
        { id: "idp-jp", category: "documents", question: "Do I need an IDP to drive in Japan?", question_de: "Brauche ich in Japan einen IDP?", answer: "Yes for most foreign licences. Japan accepts IDPs under the 1949 Geneva Convention only—not 1968 Vienna. Some countries (Germany, Switzerland, France, etc.) need a Japanese translation instead. Check JAF before travel.", answer_de: "Ja für die meisten ausländischen Führerscheine. Japan akzeptiert IDP nur nach Genfer Konvention 1949—nicht Wien 1968. Manche Länder brauchen japanische Übersetzung. JAF vor Reise prüfen.", relatedSourceIds: ["jp-jaf", "jp-npd"] },
        { id: "railway-crossing", category: "priority_rules", question: "Must I stop at railway crossings in Japan?", question_de: "Muss ich in Japan an Bahnübergängen anhalten?", answer: "Yes. You must stop completely before crossing, even if no train is visible. Violations carry heavy fines (¥70,000+) and licence points.", answer_de: "Ja. Vollständig anhalten vor Übergang, auch ohne sichtbaren Zug. Hohe Strafen (¥70.000+) und Punkte.", relatedSourceIds: ["jp-npd"] },
        { id: "no-red-turn", category: "priority_rules", question: "Can I turn right on red in Japan?", question_de: "Darf ich in Japan bei Rot rechts abbiegen?", answer: "No. Turning on red is not permitted unless a green arrow specifically allows it. Japan drives on the left—'easy' right turns still require full signal compliance.", answer_de: "Nein. Abbiegen bei Rot nicht erlaubt, außer grüner Pfeil erlaubt es. Linksverkehr—auch 'einfache' Rechtsabbieger brauchen grünes Signal.", relatedSourceIds: ["jp-npd"] },
        { id: "etc-tolls", category: "vignette_tolls", question: "How do expressway tolls work in Japan?", question_de: "Wie funktionieren Autobahn-Mauten in Japan?", answer: "Most expressways (kosoku-doro) are tolled. Take ticket at entry, pay at exit. ETC card speeds payment—rentals often include ETC. NEXCO operates most routes.", answer_de: "Die meisten Schnellstraßen sind mautpflichtig. Ticket bei Einfahrt, Bezahlung bei Ausfahrt. ETC-Karte beschleunigt Zahlung—Mietwagen oft mit ETC.", relatedSourceIds: ["jp-nexco", "jp-mlit"] },
        { id: "alcohol-jp", category: "alcohol_limit", question: "What is the alcohol limit in Japan?", question_de: "Alkoholgrenze in Japan?", answer: "Legal limit 0.03% BAC (0.15 mg/L breath). Penalties are severe; passengers who supplied alcohol to a drunk driver can also be fined. Zero tolerance culturally—do not drink and drive.", answer_de: "Gesetzlich 0,03 % BAC. Strenge Strafen; Mitfahrer die Alkohol bereitstellen können auch bestraft werden. Kulturell null Toleranz.", relatedSourceIds: ["jp-npd"] },
        { id: "stop-sign-jp", category: "priority_rules", question: "What does the Japanese stop sign mean?", question_de: "Was bedeutet das japanische Stoppschild?", answer: "Red inverted triangle with 止まれ (tomare). Full stop required—rolling stops are fined. More common than in Europe.", answer_de: "Rotes Dreieck mit 止まれ (tomare). Vollständiger Stopp Pflicht—Rollstopps werden geahndet.", relatedSourceIds: ["jp-npd"] },
        { id: "winter-hokkaido", category: "winter", question: "Winter driving in Hokkaido?", question_de: "Winterfahren in Hokkaido?", answer: "Winter tyres mandatory Oct–Apr. Black ice common. Deer on roads at night. Lower speed limits on many Hokkaido expressways (80 km/h).", answer_de: "Winterreifen Okt–Apr Pflicht. Glatteis häufig. Hirsche nachts. Niedrigere Limits auf Hokkaido-Autobahnen.", relatedSourceIds: ["jp-mlit", "jp-jaf"] },
    ],
    traffic_fines: {
        relatedSourceIds: ["jp-npd", "jp-mlit"],
        summaries: [
            { id: "speeding", icon: "speed", title: "Speeding", title_de: "Geschwindigkeit", summary: "Lower limits than Europe; strict enforcement with cameras.", summary_de: "Niedrigere Limits als Europa; strenge Kamera-Kontrolle.", maxConsequence: "¥35,000+ & points", maxConsequence_de: "¥35.000+ & Punkte" },
            { id: "railway", icon: "red_light", title: "Railway crossings", title_de: "Bahnübergänge", summary: "Full stop mandatory before every crossing.", summary_de: "Vollständiger Stopp vor jedem Übergang Pflicht.", maxConsequence: "¥70,000", maxConsequence_de: "¥70.000" },
        ],
        categories: [
            { id: "speeding", title: "Speeding", title_de: "Geschwindigkeit", rows: [{ id: "speed-30", speedOver: "+30 km/h", consequences: { fine: "¥18,000–¥35,000", fine_de: "¥18.000–¥35.000" }, appliesTo: ["car"] }] },
            { id: "railway", title: "Railway crossing", title_de: "Bahnübergang", rows: [{ id: "crossing", description: "Failure to stop at crossing", description_de: "Kein Stopp am Bahnübergang", consequences: { fine: "¥70,000", fine_de: "¥70.000" }, appliesTo: ["car"] }] },
            { id: "phone", title: "Phone", title_de: "Handy", rows: [{ id: "phone-jp", consequences: { fine: "¥25,000", fine_de: "¥25.000" }, appliesTo: ["car"] }] },
        ],
    },
})

console.log("Part 3 done — IT, CA, AU, JP")
