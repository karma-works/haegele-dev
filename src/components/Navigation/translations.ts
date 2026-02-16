export const translations = {
  about: {
    en: 'About',
    de: 'Über mich',
    es: 'Sobre mí',
    fr: 'À propos',
    ja: '自己紹介',
  },
  skills: {
    en: 'Skills',
    de: 'Fähigkeiten',
    es: 'Habilidades',
    fr: 'Compétences',
    ja: 'スキル',
  },
  projects: {
    en: 'Projects',
    de: 'Projekte',
    es: 'Proyectos',
    fr: 'Projets',
    ja: 'プロジェクト',
  },
  hobbies: {
    en: 'Hobbies',
    de: 'Hobbys',
    es: 'Pasatiempos',
    fr: 'Loisirs',
    ja: '趣味',
  },
  contact: {
    en: 'Contact',
    de: 'Kontakt',
    es: 'Contacto',
    fr: 'Contact',
    ja: '連絡先',
  },
} as const;

export type NavKey = keyof typeof translations;
export type Language = keyof (typeof translations)[NavKey];

export const languages: Language[] = ['en', 'de', 'es', 'fr', 'ja'];

export function getNextLanguage(current: Language): Language {
  const currentIndex = languages.indexOf(current);
  const nextIndex = (currentIndex + 1) % languages.length;
  return languages[nextIndex] ?? 'en';
}

export function getTranslation(key: NavKey, language: Language): string {
  return translations[key][language];
}

export function cycleTranslation(key: NavKey, currentLanguage: Language): string {
  const nextLang = getNextLanguage(currentLanguage);
  return getTranslation(key, nextLang);
}
