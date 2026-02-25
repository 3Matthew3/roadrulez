import { PrismaClient, UserRole, CountryStatus, DrivingSide, IssuePriority } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// ── Production guard ──────────────────────────────────────────────────────────
// Seeds contain dev-only users and should never run in production.
if (process.env.NODE_ENV === "production") {
    console.warn("⚠️  Seed skipped: NODE_ENV is 'production'. Run seed only in development.");
    process.exit(0);
}

// ── Load .env.local (CLI tools don't get Next.js env loading) ────────────────
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, "utf8").replace(/\r\n/g, "\n").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (key && !process.env[key]) process.env[key] = val;
    }
}

// ── Validate required seed passwords ─────────────────────────────────────────
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const EDITOR_PASSWORD = process.env.SEED_EDITOR_PASSWORD;

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 14) {
    console.error(
        "❌ SEED_ADMIN_PASSWORD must be set and at least 14 characters.\n" +
        "   Example: set SEED_ADMIN_PASSWORD=YourStrong14PwdHere!"
    );
    process.exit(1);
}
if (!EDITOR_PASSWORD || EDITOR_PASSWORD.length < 14) {
    console.error(
        "❌ SEED_EDITOR_PASSWORD must be set and at least 14 characters.\n" +
        "   Example: set SEED_EDITOR_PASSWORD=AnotherStrong14Pwd!"
    );
    process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Users — use bcrypt cost 12 for production-strength hashing
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@roadrulez.com" },
        update: {},
        create: {
            email: "admin@roadrulez.com",
            name: "Admin User",
            passwordHash: await bcrypt.hash(ADMIN_PASSWORD!, 12),
            role: UserRole.ADMIN,
        },
    });

    const editorUser = await prisma.user.upsert({
        where: { email: "editor@roadrulez.com" },
        update: {},
        create: {
            email: "editor@roadrulez.com",
            name: "Editor User",
            passwordHash: await bcrypt.hash(EDITOR_PASSWORD!, 12),
            role: UserRole.EDITOR,
        },
    });

    console.log("✅ Users created (passwords from env vars — not logged here)");

    // Rule Modules
    const modules = [
        {
            key: "speed_limits",
            name: "Speed Limits",
            description: "Urban, rural, motorway speed limits",
            schemaHint: { urban: "number (km/h)", rural: "number (km/h)", motorway: "number (km/h)" },
        },
        {
            key: "alcohol_limit",
            name: "Alcohol Limit",
            description: "Blood alcohol content limits",
            schemaHint: { general: "number (‰)", professional: "number (‰)", new_driver: "number (‰)" },
        },
        {
            key: "seatbelt",
            name: "Seatbelt Rules",
            description: "Seatbelt requirements",
            schemaHint: { required: "boolean", children: "string" },
        },
        {
            key: "phone_usage",
            name: "Phone Usage",
            description: "Rules on mobile phone use while driving",
            schemaHint: { handheld_banned: "boolean", handsfree_allowed: "boolean" },
        },
        {
            key: "headlights",
            name: "Headlights",
            description: "Headlight requirements",
            schemaHint: { daytime_required: "boolean", notes: "string" },
        },
        {
            key: "tolls",
            name: "Tolls",
            description: "Toll systems",
            schemaHint: { type: "string", required: "boolean" },
        },
        {
            key: "mandatory_equipment",
            name: "Mandatory Equipment",
            description: "Required items in vehicle",
            schemaHint: { items: "string[]" },
        },
        {
            key: "emergency_numbers",
            name: "Emergency Numbers",
            description: "Emergency contact numbers",
            schemaHint: { police: "string", ambulance: "string", fire: "string", general: "string" },
        },
        {
            key: "winter_rules",
            name: "Winter Rules",
            description: "Winter tyre and weather rules",
            schemaHint: { winter_tyres_required: "boolean", when: "string" },
        },
        {
            key: "parking",
            name: "Parking Rules",
            description: "Parking regulations",
            schemaHint: { notes: "string" },
        },
        {
            key: "child_seats",
            name: "Child Seats",
            description: "Child restraint requirements",
            schemaHint: { required_under_age: "number", required_under_height_cm: "number" },
        },
    ];

    for (const mod of modules) {
        await prisma.ruleModule.upsert({
            where: { key: mod.key },
            update: {},
            create: mod,
        });
    }

    console.log("✅ Rule modules created");

    // Germany
    const germany = await prisma.country.upsert({
        where: { iso2: "DE" },
        update: {},
        create: {
            name: "Germany",
            iso2: "DE",
            iso3: "DEU",
            nameLocal: "Deutschland",
            continent: "Europe",
            flag: "🇩🇪",
            drivingSide: DrivingSide.RIGHT,
            summary:
                "Germany has some of Europe's most structured traffic rules. The famous Autobahn has no general speed limit, though advisory limits of 130 km/h apply. Strict drink-driving laws with 0.5‰ BAC limit (0.0‰ for new drivers). Winter tyres required in wintry conditions.",
            commonTraps: [
                "Speed cameras are everywhere (hidden & fixed).",
                "Tailgating (Drängeln) is a serious offense/criminal act.",
                "Running out of gas on the Autobahn is illegal.",
                "Right before Left priority violations.",
            ],
            rentalAndIdpNotes: "Valid domestic license usually accepted. IDP recommended for non-EU/EEA licenses.",
            dataCoverage: "high",
            localeContent: {
                de: {
                    name: "Deutschland",
                    summary:
                        "Deutschland hat einige der strukturiertesten Verkehrsregeln Europas. Auf der Autobahn gilt kein allgemeines Tempolimit, jedoch eine Richtgeschwindigkeit von 130 km/h. Striktes Alkohollimit von 0,5‰.",
                    commonTraps: [
                        "Blitzer sind überall – fest und mobil.",
                        "Drängeln gilt als Straftat.",
                        "Auf der Autobahn stehen bleiben ist verboten.",
                    ],
                    rentalAndIdpNotes:
                        "EU-Führerschein ausreichend. Für Nicht-EU-Führerscheine wird ein internationaler Führerschein empfohlen.",
                },
            },
            status: CountryStatus.VERIFIED,
            verifiedStatus: "Manually verified against ADAC and German traffic law",
            lastVerifiedAt: new Date("2025-01-15"),
            updatedById: adminUser.id,
            verifiedById: adminUser.id,
        },
    });

    // Japan
    const japan = await prisma.country.upsert({
        where: { iso2: "JP" },
        update: {},
        create: {
            name: "Japan",
            iso2: "JP",
            iso3: "JPN",
            nameLocal: "日本",
            continent: "Asia",
            flag: "🇯🇵",
            drivingSide: DrivingSide.LEFT,
            summary:
                "Japan has strict traffic laws, left-side driving, and unique road signs. Speed limits are lower than in Europe. Alcohol limit is 0.0‰. Winter tyres required in snowy regions.",
            commonTraps: [
                "No tolerance for drink-driving (0.0‰).",
                "Speed limits strictly enforced, especially in urban areas.",
                "Pedestrian crossings have priority.",
                "Parking rules are complex and strictly enforced.",
            ],
            rentalAndIdpNotes: "IDP required for most foreign drivers. Check accepted conventions.",
            dataCoverage: "medium",
            localeContent: {
                ja: {
                    name: "日本",
                    summary:
                        "日本は厳しい交通法規があり、左側通行です。飲酒運転はゼロ容認。都市部の速度制限は厳格に取り締まられます。",
                    commonTraps: [
                        "飲酒運転はゼロ容認。",
                        "都市部の速度制限は厳格に取り締まられます。",
                        "歩行者優先。",
                        "駐車規則は複雑で厳格です。",
                    ],
                    rentalAndIdpNotes:
                        "外国人運転者には国際運転免許証が必要です。",
                },
            },
            status: CountryStatus.VERIFIED,
            verifiedStatus: "Manually verified against JAF and Japanese traffic law",
            lastVerifiedAt: new Date("2025-01-15"),
            updatedById: adminUser.id,
            verifiedById: adminUser.id,
        },
    });

    // USA
    const usa = await prisma.country.upsert({
        where: { iso2: "US" },
        update: {},
        create: {
            name: "United States",
            iso2: "US",
            iso3: "USA",
            nameLocal: "United States",
            continent: "North America",
            flag: "🇺🇸",
            drivingSide: DrivingSide.RIGHT,
            summary:
                "The USA has state-specific traffic laws, right-side driving, and generally higher speed limits. Alcohol limits vary by state. Winter tyres are not mandatory except in some regions.",
            commonTraps: [
                "Speed limits vary by state and are strictly enforced.",
                "Right turn on red allowed in most states (unless posted).",
                "Stop signs must be fully obeyed.",
                "School bus rules are strict and must be followed.",
            ],
            rentalAndIdpNotes: "IDP recommended for foreign drivers. State laws may differ.",
            dataCoverage: "medium",
            localeContent: {},
            status: CountryStatus.VERIFIED,
            verifiedStatus: "Manually verified against DMV and state traffic law",
            lastVerifiedAt: new Date("2025-01-15"),
            updatedById: adminUser.id,
            verifiedById: adminUser.id,
        },
    });

    // France
    const france = await prisma.country.upsert({
        where: { iso2: "FR" },
        update: {},
        create: {
            name: "France",
            iso2: "FR",
            iso3: "FRA",
            nameLocal: "France",
            continent: "Europe",
            flag: "🇫🇷",
            drivingSide: DrivingSide.RIGHT,
            summary:
                "France has strict traffic laws, right-side driving, and mandatory equipment. Alcohol limit is 0.5‰. Speed limits are enforced by cameras. Winter tyres required in mountain regions.",
            commonTraps: [
                "Speed cameras are widespread.",
                "Priority to the right at intersections.",
                "Mandatory breathalyzer in car.",
                "Parking rules are strictly enforced.",
            ],
            rentalAndIdpNotes: "IDP recommended for non-EU drivers. Mandatory equipment required.",
            dataCoverage: "medium",
            localeContent: {
                fr: {
                    name: "France",
                    summary:
                        "La France a des lois strictes sur la circulation, conduite à droite, équipements obligatoires. Limite d'alcool à 0,5‰.",
                    commonTraps: [
                        "Radars automatiques partout.",
                        "Priorité à droite.",
                        "Éthylotest obligatoire.",
                        "Stationnement strictement contrôlé.",
                    ],
                    rentalAndIdpNotes:
                        "IDP recommandé pour les conducteurs non-UE. Équipement obligatoire.",
                },
            },
            status: CountryStatus.VERIFIED,
            verifiedStatus: "Manually verified against French traffic law",
            lastVerifiedAt: new Date("2025-01-15"),
            updatedById: adminUser.id,
            verifiedById: adminUser.id,
        },
    });

    // Spain
    const spain = await prisma.country.upsert({
        where: { iso2: "ES" },
        update: {},
        create: {
            name: "Spain",
            iso2: "ES",
            iso3: "ESP",
            nameLocal: "España",
            continent: "Europe",
            flag: "🇪🇸",
            drivingSide: DrivingSide.RIGHT,
            summary:
                "Spain has strict traffic laws, right-side driving, and mandatory equipment. Alcohol limit is 0.5‰. Speed limits are enforced by cameras. Winter tyres required in mountain regions.",
            commonTraps: [
                "Speed cameras are widespread.",
                "Priority to the right at intersections.",
                "Mandatory reflective vest and triangle.",
                "Parking rules are strictly enforced.",
            ],
            rentalAndIdpNotes: "IDP recommended for non-EU drivers. Mandatory equipment required.",
            dataCoverage: "medium",
            localeContent: {
                es: {
                    name: "España",
                    summary:
                        "España tiene leyes estrictas de tráfico, conducción a la derecha, equipamiento obligatorio. Límite de alcohol a 0,5‰.",
                    commonTraps: [
                        "Cámaras de velocidad en todas partes.",
                        "Prioridad a la derecha.",
                        "Chaleco reflectante y triángulo obligatorios.",
                        "Normas de estacionamiento estrictas.",
                    ],
                    rentalAndIdpNotes:
                        "IDP recomendado para conductores no UE. Equipamiento obligatorio.",
                },
            },
            status: CountryStatus.VERIFIED,
            verifiedStatus: "Manually verified against Spanish traffic law",
            lastVerifiedAt: new Date("2025-01-15"),
            updatedById: adminUser.id,
            verifiedById: adminUser.id,
        },
    });


    // Germany Rules
    await prisma.countryRule.upsert({
        where: { countryId_moduleKey_vehicleType: { countryId: germany.id, moduleKey: "speed_limits", vehicleType: "car" } },
        update: {},
        create: {
            countryId: germany.id,
            moduleKey: "speed_limits",
            vehicleType: "car",
            structuredValue: { urban: 50, rural: 100, motorway: null, units: "km/h" },
            textNotes: "No general speed limit on motorways (Autobahn), but 130 km/h is the recommended advisory speed. Some sections have permanent limits.",
        },
    });

    await prisma.countryRule.upsert({
        where: { countryId_moduleKey_vehicleType: { countryId: germany.id, moduleKey: "alcohol_limit", vehicleType: "" } },
        update: {},
        create: {
            countryId: germany.id,
            moduleKey: "alcohol_limit",
            vehicleType: null,
            structuredValue: { general: 0.5, professional: 0.0, new_driver: 0.0 },
            textNotes: "0.5‰ general limit; 0.0‰ for drivers under 21 or with less than 2 years licence; 0.0‰ for commercial drivers.",
        },
    });

    await prisma.countryRule.upsert({
        where: { countryId_moduleKey_vehicleType: { countryId: germany.id, moduleKey: "mandatory_equipment", vehicleType: "" } },
        update: {},
        create: {
            countryId: germany.id,
            moduleKey: "mandatory_equipment",
            vehicleType: null,
            structuredValue: { items: ["First aid kit", "Warning triangle", "High-visibility vest (1, driver)"] },
            textNotes: "Spare tyre not mandatory by law but strongly recommended.",
        },
    });

    await prisma.countryRule.upsert({
        where: { countryId_moduleKey_vehicleType: { countryId: germany.id, moduleKey: "winter_rules", vehicleType: "" } },
        update: {},
        create: {
            countryId: germany.id,
            moduleKey: "winter_rules",
            vehicleType: null,
            structuredValue: { winter_tyres_required: true, when: "Situational (ice, snow, hard frost)" },
            textNotes: "Winter tyres are required when road conditions are wintry (Situationsbezogene Winterreifenpflicht). M+S or snowflake symbol required.",
        },
    });

    await prisma.countryRule.upsert({
        where: { countryId_moduleKey_vehicleType: { countryId: germany.id, moduleKey: "emergency_numbers", vehicleType: "" } },
        update: {},
        create: {
            countryId: germany.id,
            moduleKey: "emergency_numbers",
            vehicleType: null,
            structuredValue: { police: "110", ambulance: "112", fire: "112", general: "112" },
        },
    });

    console.log("✅ Germany rules created");

    // Bavaria region
    await prisma.region.upsert({
        where: { id: "region_bavaria" },
        update: {},
        create: {
            id: "region_bavaria",
            countryId: germany.id,
            name: "Bavaria",
        },
    });

    // Sample Sources
    await prisma.source.upsert({
        where: { id: "src_adac_de" },
        update: {},
        create: {
            id: "src_adac_de",
            countryId: germany.id,
            moduleKey: "speed_limits",
            title: "ADAC Traffic Regulations Germany",
            url: "https://www.adac.de/verkehr/recht/verkehrsrecht/",
            publisher: "ADAC e.V.",
            publishedDate: new Date("2024-01-01"),
            notes: "Comprehensive guide to German traffic law",
        },
    });

    await prisma.source.upsert({
        where: { id: "src_stvo_de" },
        update: {},
        create: {
            id: "src_stvo_de",
            countryId: germany.id,
            title: "Straßenverkehrs-Ordnung (StVO)",
            url: "https://www.gesetze-im-internet.de/stvo_2013/",
            publisher: "German Federal Government",
            publishedDate: new Date("2013-04-26"),
            notes: "Official German Road Traffic Regulations",
        },
    });

    console.log("✅ Sources created");

    // Sample Issue
    await prisma.issueReport.create({
        data: {
            countryId: germany.id,
            category: "incorrect_data",
            message: "The motorway speed limit section is misleading. Some Autobahn sections have mandatory 120 km/h limits near cities.",
            contact: "user@example.com",
            status: "OPEN",
            priority: IssuePriority.MEDIUM,
            tags: ["speed", "motorway", "accuracy"],
        },
    });

    console.log("✅ Issue report created");
    console.log("\n🎉 Seed complete!");
    console.log("\n📋 Users seeded: admin@roadrulez.com, editor@roadrulez.com");
    console.log("   Passwords were read from SEED_ADMIN_PASSWORD / SEED_EDITOR_PASSWORD env vars.");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
