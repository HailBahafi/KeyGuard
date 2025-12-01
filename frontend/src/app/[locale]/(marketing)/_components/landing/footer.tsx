'use client';

import { useTranslations } from 'next-intl';
import { Github, BookOpen, MessageCircle } from 'lucide-react';

export function Footer() {
    const t = useTranslations('LandingPage.footer');

    const sections = [
        {
            title: t('product'),
            links: [
                { label: t('features'), href: '#features' },
                { label: t('pricing'), href: '#pricing' },
                { label: t('docs'), href: '#docs' },
            ],
        },
        {
            title: t('resources'),
            links: [
                { label: t('github'), href: 'https://github.com/keyguard', icon: Github },
                { label: t('blog'), href: '#blog' },
                { label: t('docs'), href: '#docs', icon: BookOpen },
            ],
        },
        {
            title: t('company'),
            links: [
                { label: t('about'), href: '#about' },
                { label: t('contact'), href: '#contact', icon: MessageCircle },
            ],
        },
    ];

    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-lg font-bold text-primary-foreground">K</span>
                            </div>
                            <span className="text-xl font-bold">KeyGuard</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('copyright')}
                        </p>
                    </div>

                    {/* Link Sections */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-semibold mb-4">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                        >
                                            {link.icon && <link.icon className="h-4 w-4" />}
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div>
                        © {new Date().getFullYear()} KeyGuard. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#privacy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
