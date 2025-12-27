import { ReactNode } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import type { Metadata } from 'next';

/**
 * Auth pages should not be indexed by search engines
 */
export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">K</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">KeyGuard</span>
                    </Link>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Subtle dotted background pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center pt-16">
                <div className="w-full max-w-md px-4">
                    {/* KeyGuard Logo/Branding */}
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary-foreground">K</span>
                        </div>
                        <span className="text-2xl font-bold">KeyGuard</span>
                    </div>

                    {/* Auth Page Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
