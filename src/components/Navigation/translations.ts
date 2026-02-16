export const translations = {
  about: {
    en: 'About',
    de: 'Über mich',
    es: 'Sobre mí',
    fr: 'À propos',
    zh: '关于',
  },
  skills: {
    en: 'Skills',
    de: 'Fähigkeiten',
    es: 'Habilidades',
    fr: 'Compétences',
    zh: '技能',
  },
  projects: {
    en: 'Projects',
    de: 'Projekte',
    es: 'Proyectos',
    fr: 'Projets',
    zh: '项目',
  },
  hobbies: {
    en: 'Hobbies',
    de: 'Hobbys',
    es: 'Pasatiempos',
    fr: 'Loisirs',
    zh: '爱好',
  },
  contact: {
    en: 'Contact',
    de: 'Kontakt',
    es: 'Contacto',
    fr: 'Contact',
    zh: '联系',
  },
} as const;

export type NavKey = keyof typeof translations;
export type Language = keyof (typeof translations)[NavKey];

export const languages: Language[] = ['en', 'de', 'es', 'fr', 'zh'];

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
