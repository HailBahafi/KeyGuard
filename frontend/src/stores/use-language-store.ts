// Language Preference Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'typescript' | 'python' | 'go' | 'curl';

interface LanguageStore {
    language: Language;
    setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: 'typescript',
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'keyguard-language-preference',
        }
    )
);
