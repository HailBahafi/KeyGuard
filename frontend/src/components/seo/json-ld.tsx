import { siteConfig } from '@/lib/seo-config';

interface JsonLdProps {
    locale: string;
}

/**
 * Organization schema for KeyGuard
 * Used on the homepage for brand visibility in search
 */
export function OrganizationJsonLd({ locale }: JsonLdProps) {
    const isArabic = locale === 'ar';
    
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'KeyGuard',
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: isArabic
            ? 'منصة أمان مفاتيح API للذكاء الاصطناعي بتقنية انعدام الثقة'
            : 'Zero-trust API key security platform for AI applications',
        sameAs: [
            siteConfig.github,
        ],
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Software Application schema for KeyGuard
 * Helps with rich snippets in search results
 * Note: No fake ratings - only factual information
 */
export function SoftwareApplicationJsonLd({ locale }: JsonLdProps) {
    const isArabic = locale === 'ar';
    
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KeyGuard',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Cross-platform',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: isArabic ? 'مجاني ومفتوح المصدر' : 'Free and open source',
        },
        description: isArabic
            ? 'حماية مفاتيح API للذكاء الاصطناعي بربط الأجهزة والتوقيعات المشفرة'
            : 'Protect AI API keys with device binding and cryptographic signatures',
        featureList: isArabic
            ? [
                'ربط الأجهزة بـ ECDSA P-256',
                'توقيع الطلبات والتحقق منها',
                'دعم متعدد المزودين (OpenAI، Anthropic، Google)',
                'نشر مستضاف ذاتياً',
                'سجلات تدقيق في الوقت الفعلي',
            ]
            : [
                'Device binding with ECDSA P-256',
                'Request signing and verification',
                'Multi-provider support (OpenAI, Anthropic, Google)',
                'Self-hosted deployment',
                'Real-time audit logs',
            ],
        license: 'https://opensource.org/licenses/MIT',
        downloadUrl: siteConfig.github,
        softwareVersion: '0.1.0',
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
