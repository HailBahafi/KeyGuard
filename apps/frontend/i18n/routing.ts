import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // All supported locales
    locales: ['en', 'ar'],

    // Default locale
    defaultLocale: 'en',

    // Locale prefix strategy
    localePrefix: 'always'
});
