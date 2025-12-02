'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Menu, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from '@/components/common/mobile-sidebar';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageSwitcher } from '@/components/common/language-switcher';

// Navigation links configuration
const navLinks = [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'keys', href: '/keys' },
    { key: 'devices', href: '/devices' },
    { key: 'audit', href: '/audit' },
    { key: 'integration', href: '/integration' },
    { key: 'settings', href: '/settings' },
];

const locales = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

// Helper to generate breadcrumbs from pathname with translations
function generateBreadcrumbs(pathname: string, locale: string, t: any) {
    // Remove locale prefix (e.g., /en, /ar)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');

    const segments = pathWithoutLocale.split('/').filter(Boolean);

    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${locale}/` + segments.slice(0, index + 1).join('/');

        // Try to translate the segment, fallback to formatted segment
        let label;
        try {
            label = t(segment) || segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch {
            label = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        return { label, href };
    });

    // Add home at the beginning
    return [{ label: t('home'), href: `/${locale}/dashboard` }, ...breadcrumbs];
}

export function ResponsiveHeader() {
    const pathname = usePathname();
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('Navigation');
    const breadcrumbs = generateBreadcrumbs(pathname, locale, t);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const switchLocale = (newLocale: string) => {
        // Replace current locale in pathname
        const segments = pathname.split('/');
        segments[1] = newLocale;
        router.push(segments.join('/'));
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Desktop: Breadcrumbs */}
                <nav className="hidden items-center gap-2 md:flex" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center gap-2">
                            {index === 0 ? (
                                <Link
                                    href={crumb.href}
                                    className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <Home className="h-4 w-4" />
                                    <span className="sr-only">{crumb.label}</span>
                                </Link>
                            ) : (
                                <>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="text-sm font-medium text-foreground">
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            href={crumb.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Mobile: Logo/Title */}
                <div className="flex items-center md:hidden">
                    <span className="text-lg font-bold tracking-tight">
                        {breadcrumbs[breadcrumbs.length - 1]?.label || 'KeyGuard'}
                    </span>
                </div>

                {/* Desktop: Theme + Language Controls */}
                <div className="hidden items-center gap-2 md:flex">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>

                {/* Mobile: Burger Menu */}
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                    <nav className="flex flex-col gap-4">
                        {/* Navigation Section */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold tracking-tight">{t('dashboard')}</h2>
                            <p className="text-sm text-muted-foreground">
                                {locale === 'en' ? 'Access all main pages' : 'الوصول إلى جميع الصفحات'}
                            </p>
                        </div>

                        {navLinks.map((link) => {
                            const isActive = pathname.includes(link.href);
                            const localizedHref = `/${locale}${link.href}`;
                            return (
                                <Link
                                    key={link.href}
                                    href={localizedHref}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        'hover:bg-muted',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-foreground'
                                    )}
                                >
                                    {t(link.key)}
                                </Link>
                            );
                        })}

                        <Separator className="my-4" />

                        {/* Theme Section */}
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold mb-3">
                                {locale === 'en' ? 'Theme' : 'المظهر'}
                            </h3>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant={theme === 'light' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setTheme('light')}
                                    className="justify-start gap-2"
                                >
                                    <Sun className="h-4 w-4" />
                                    {locale === 'en' ? 'Light' : 'فاتح'}
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setTheme('dark')}
                                    className="justify-start gap-2"
                                >
                                    <Moon className="h-4 w-4" />
                                    {locale === 'en' ? 'Dark' : 'داكن'}
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setTheme('system')}
                                    className="justify-start gap-2"
                                >
                                    <Monitor className="h-4 w-4" />
                                    {locale === 'en' ? 'System' : 'النظام'}
                                </Button>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Language Section */}
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold mb-3">
                                {locale === 'en' ? 'Language' : 'اللغة'}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {locales.map((loc) => (
                                    <Button
                                        key={loc.code}
                                        variant={locale === loc.code ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => switchLocale(loc.code)}
                                        className="justify-start gap-2"
                                    >
                                        <span>{loc.flag}</span>
                                        {loc.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </MobileSidebar>
            </div>
        </header>
    );
}
