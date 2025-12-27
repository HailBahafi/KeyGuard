'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
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

interface NavLink {
    href: string;
    labelKey: string;
}

const navLinks: NavLink[] = [
    { href: '#features', labelKey: 'footer.features' },
    { href: '#how-it-works', labelKey: 'howItWorks.title' },
    { href: '#pricing', labelKey: 'footer.pricing' },
    { href: '#docs', labelKey: 'footer.docs' },
];

export function LandingHeader() {
    const t = useTranslations('LandingPage');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">K</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">KeyGuard</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm md:text-sm lg:text-base font-medium">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t(link.labelKey)}
                        </a>
                    ))}
                </nav>

                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-foreground">K</span>
                                    </div>
                                    KeyGuard
                                </SheetTitle>
                            </SheetHeader>

                            {/* Mobile Navigation Links */}
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-md hover:bg-muted"
                                    >
                                        {t(link.labelKey)}
                                    </a>
                                ))}
                            </nav>

                            {/* Mobile Controls */}
                            <div className="mt-8 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Language</span>
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
