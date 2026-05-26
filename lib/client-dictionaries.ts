import en from "@/data/dictionaries/en.json"
import de from "@/data/dictionaries/de.json"

export function getClientDictionary(locale: string) {
    return locale === "de" ? de : en
}
