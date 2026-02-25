/**
 * Global application constants
 */

export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Check if a string is a valid locale */
export function isValidLocale(locale: unknown): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
