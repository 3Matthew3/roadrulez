import 'server-only';

const dictionaries = {
    en: () => import('@/data/dictionaries/en.json').then((module) => module.default),
    de: () => import('@/data/dictionaries/de.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
    if (locale === 'de') {
        return dictionaries.de();
    }
    return dictionaries.en();
};
