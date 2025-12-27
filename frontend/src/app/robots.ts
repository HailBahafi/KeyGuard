import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = siteConfig.url;
    
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    // API routes
                    '/api/',
                    
                    // Authenticated dashboard pages (extra protection beyond noindex)
                    '/*/dashboard/',
                    '/*/dashboard',
                    '/*/keys/',
                    '/*/keys',
                    '/*/devices/',
                    '/*/devices',
                    '/*/audit/',
                    '/*/audit',
                    '/*/settings/',
                    '/*/settings',
                    '/*/integration/',
                    '/*/integration',
                    
                    // Auth pages
                    '/*/login',
                    '/*/login/',
                    '/*/setup',
                    '/*/setup/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
