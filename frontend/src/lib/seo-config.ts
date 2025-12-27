/**
 * SEO Configuration - Central place for all SEO-related constants
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Get the site URL with proper fallback
 * - Production: NEXT_PUBLIC_SITE_URL is required
 * - Development: Falls back to localhost
 */
function getSiteUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (envUrl) {
        // Remove trailing slash if present
        return envUrl.replace(/\/$/, '');
    }
    
    if (isDev) {
        return 'http://localhost:3000';
    }
    
    // Production without URL configured - this will cause build warnings
    console.warn(
        '[SEO] NEXT_PUBLIC_SITE_URL is not set. This is required for production builds.'
    );
    return 'http://localhost:3000';
}

export const siteConfig = {
    /** 
     * Base URL for the site
     * Set NEXT_PUBLIC_SITE_URL in production
     */
    url: getSiteUrl(),
    
    /** Twitter/X handle for social cards */
    twitter: '@keyguard_dev',
    
    /** GitHub repository URL */
    github: 'https://github.com/HailBahafi/KeyGuard',
    
    /** Check if we're in development mode */
    isDev,
};

export const localeConfig = {
    defaultLocale: 'en' as const,
    locales: ['en', 'ar'] as const,
    localeNames: {
        en: 'English',
        ar: 'العربية',
    },
} as const;
