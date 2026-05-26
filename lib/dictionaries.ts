import 'server-only';

const dictionaries = {
    en: () => import('@/data/dictionaries/en.json').then((module) => module.default),
    de: () => import('@/data/dictionaries/de.json').then((module) => module.default),
    es: () => import('@/data/dictionaries/es.json').then((module) => module.default),
    ja: () => import('@/data/dictionaries/ja.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
    if (locale === 'de') return dictionaries.de();
    if (locale === 'es') return dictionaries.es();
    if (locale === 'ja') return dictionaries.ja();
    return dictionaries.en();
};
