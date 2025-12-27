import { MetadataRoute } from 'next';
import { siteConfig, localeConfig } from '@/lib/seo-config';
import { getSitemapPageTypes, type PageType } from '@/lib/metadata';

/**
 * Route configuration for sitemap
 * Maps page types to their URL paths
 */
const pageRoutes: Record<PageType, string> = {
    home: '',
    login: '/login',  // Excluded via getSitemapPageTypes
    dashboard: '/dashboard',  // Excluded
    keys: '/keys',  // Excluded
    devices: '/devices',  // Excluded
    audit: '/audit',  // Excluded
    integration: '/integration',  // Excluded
    settings: '/settings',  // Excluded
};

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;
    const { locales } = localeConfig;
    
    // Only include page types that should be in sitemap (marketing pages)
    const includedPageTypes = getSitemapPageTypes();
    
    const entries: MetadataRoute.Sitemap = [];
    
    // Generate entries for each locale and included route
    for (const locale of locales) {
        for (const pageType of includedPageTypes) {
            const route = pageRoutes[pageType];
            const fullPath = `/${locale}${route}`;
            
            entries.push({
                url: `${baseUrl}${fullPath}`,
                lastModified: new Date(),
                changeFrequency: pageType === 'home' ? 'weekly' : 'monthly',
                priority: pageType === 'home' ? 1.0 : 0.8,
                alternates: {
                    languages: Object.fromEntries(
                        locales.map((l) => [l, `${baseUrl}/${l}${route}`])
                    ),
                },
            });
        }
    }
    
    return entries;
}
