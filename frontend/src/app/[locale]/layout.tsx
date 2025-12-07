import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { notFound } from 'next/navigation';
import { routing } from '../../../i18n/routing';
import { Toaster } from 'sonner';
import '@/app/globals.css';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure valid locale
    if (!routing.locales.includes(locale as any)) {
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



