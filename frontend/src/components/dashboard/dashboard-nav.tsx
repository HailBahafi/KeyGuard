'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
    LayoutDashboard,
    Key,
    Monitor,
    FileText,
    Code2,
    Settings,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    icon: React.ElementType;
    labelKey: string;
}

const navItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/keys', icon: Key, labelKey: 'keys' },
    { href: '/devices', icon: Monitor, labelKey: 'devices' },
    { href: '/audit', icon: FileText, labelKey: 'audit' },
    { href: '/integration', icon: Code2, labelKey: 'integration' },
    { href: '/settings', icon: Settings, labelKey: 'settings' },
];

interface DashboardNavProps {
    locale: string;
}

export function DashboardNav({ locale }: DashboardNavProps) {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Get the base path without locale
    const getBasePath = (path: string) => {
        const parts = path.split('/');
        return '/' + parts.slice(2).join('/');
    };

    const currentBasePath = getBasePath(pathname);

    const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
        const isActive = currentBasePath === item.href || currentBasePath.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
            <Link
                href={`/${locale}${item.href}`}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Sidebar - position based on locale */}
            <aside className={cn(
                "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-card",
                locale === 'ar' ? "lg:end-0 lg:border-s" : "lg:start-0 lg:border-e",
                "lg:border-border"
            )}>
                {/* Logo */}
                <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">K</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">KeyGuard</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Logo */}
                    <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">K</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">KeyGuard</span>
                    </Link>

                    {/* Mobile Menu */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-[280px]">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary-foreground">K</span>
                                        </div>
                                        KeyGuard
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Mobile Navigation */}
                                <nav className="flex flex-col gap-2 mt-6">
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.href}
                                            item={item}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    ))}
                                </nav>

                                {/* Mobile Controls */}
                                <div className="mt-8 pt-4 border-t border-border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Language</span>
                                        <LanguageSwitcher />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </>
    );
}
