import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { notFound } from 'next/navigation';
import { routing } from '../../../i18n/routing';
import { Toaster } from 'sonner';
import { siteConfig } from '@/lib/seo-config';
import type { Metadata } from 'next';
import '@/app/globals.css';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

/**
 * Site-wide metadata defaults
 * Page-specific metadata (canonical, title, description) is set per-page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    
    return {
        metadataBase: new URL(siteConfig.url),
        title: {
            default: t('site.title'),
            template: `%s | ${t('site.name')}`,
        },
        description: t('site.description'),
        keywords: t('site.keywords').split(',').map(k => k.trim()),
        authors: [{ name: 'KeyGuard Team' }],
        creator: 'KeyGuard',
        publisher: 'KeyGuard',
        category: 'technology',
    };
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Ensure valid locale - type assertion to match routing locales type
    if (!routing.locales.includes(locale as typeof routing.locales[number])) {
        notFound();
    }

    // Fetch messages for the specific locale
    const messages = await getMessages({ locale });

    // Determine text direction
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <head>
                {/* Google Fonts - Cairo and Tajawal for Arabic */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router requires fonts in layout.tsx, not _document.js */}
                <link 
                    href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap" 
                    rel="stylesheet" 
                />
            </head>
            <body className={locale === 'ar' ? 'font-[Cairo,Tajawal,sans-serif]' : ''}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <NextIntlClientProvider messages={messages}>
                            {children}
                            <Toaster position="top-right" richColors />
                        </NextIntlClientProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
