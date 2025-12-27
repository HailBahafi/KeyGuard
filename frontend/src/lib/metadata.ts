import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteConfig, localeConfig } from './seo-config';

/**
 * Page types for metadata generation
 */
export type PageType = 
    | 'home' 
    | 'login' 
    | 'dashboard' 
    | 'keys' 
    | 'devices' 
    | 'audit' 
    | 'integration' 
    | 'settings';

/**
 * Configuration for how pages should be indexed
 */
interface PageIndexConfig {
    /** Whether the page should be indexed by search engines */
    index: boolean;
    /** Whether to include in sitemap */
    includeSitemap: boolean;
}

/**
 * Indexing rules per page type
 * - Marketing pages: indexed
 * - Auth pages: noindex, no sitemap
 * - Dashboard pages: noindex (authenticated content)
 */
const pageIndexRules: Record<PageType, PageIndexConfig> = {
    home: { index: true, includeSitemap: true },
    login: { index: false, includeSitemap: false },
    dashboard: { index: false, includeSitemap: false },
    keys: { index: false, includeSitemap: false },
    devices: { index: false, includeSitemap: false },
    audit: { index: false, includeSitemap: false },
    integration: { index: false, includeSitemap: false },
    settings: { index: false, includeSitemap: false },
};

/**
 * Generate page-specific metadata with proper canonical and hreflang
 * 
 * @param locale - Current locale (en/ar)
 * @param pageType - Type of page for translations and robots config
 * @param pathname - The pathname without locale prefix (e.g., '/keys', '/dashboard')
 */
export async function generatePageMetadata(
    locale: string,
    pageType: PageType,
    pathname: string = ''
): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const baseUrl = siteConfig.url;
    const isArabic = locale === 'ar';
    
    // Build the full URL for this page
    const pagePath = pathname ? `/${locale}${pathname}` : `/${locale}`;
    const currentUrl = `${baseUrl}${pagePath}`;
    
    // Build alternate URLs for each locale
    const alternateUrls: Record<string, string> = {};
    for (const loc of localeConfig.locales) {
        const altPath = pathname ? `/${loc}${pathname}` : `/${loc}`;
        alternateUrls[loc] = `${baseUrl}${altPath}`;
    }
    // x-default points to English version
    alternateUrls['x-default'] = alternateUrls.en;
    
    // Get indexing rules for this page type
    const indexConfig = pageIndexRules[pageType];
    
    // Get page-specific title/description or fall back to site defaults
    let title: string;
    let description: string;
    
    try {
        title = t(`pages.${pageType}.title`);
        description = t(`pages.${pageType}.description`);
    } catch {
        // Fallback to site defaults if page-specific translations don't exist
        title = t('site.title');
        description = t('site.description');
    }
    
    return {
        title,
        description,
        robots: indexConfig.index 
            ? {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            }
            : {
                index: false,
                follow: false,
                googleBot: {
                    index: false,
                    follow: false,
                },
            },
        alternates: {
            canonical: currentUrl,
            languages: alternateUrls,
        },
        openGraph: indexConfig.index ? {
            type: 'website',
            locale: isArabic ? 'ar_SA' : 'en_US',
            alternateLocale: isArabic ? 'en_US' : 'ar_SA',
            url: currentUrl,
            siteName: t('site.name'),
            title,
            description,
            images: [
                {
                    url: `${baseUrl}/og-image-${locale}.png`,
                    width: 1200,
                    height: 630,
                    alt: t('site.ogImageAlt'),
                },
            ],
        } : undefined,
        twitter: indexConfig.index ? {
            card: 'summary_large_image',
            site: siteConfig.twitter,
            creator: siteConfig.twitter,
            title,
            description,
            images: [`${baseUrl}/og-image-${locale}.png`],
        } : undefined,
    };
}

/**
 * Check if a page type should be included in sitemap
 */
export function shouldIncludeInSitemap(pageType: PageType): boolean {
    return pageIndexRules[pageType].includeSitemap;
}

/**
 * Get all page types that should be in sitemap
 */
export function getSitemapPageTypes(): PageType[] {
    return (Object.keys(pageIndexRules) as PageType[]).filter(
        (type) => pageIndexRules[type].includeSitemap
    );
}
