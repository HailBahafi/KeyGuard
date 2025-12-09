'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
    sections: Array<{
        id: string;
        titleKey: string;
        subsections?: Array<{ id: string; titleKey: string }>;
    }>;
}

export function Sidebar({ sections }: SidebarProps) {
    const t = useTranslations('Integration.sections');
    const tPage = useTranslations('Integration');
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        // Intersection Observer to track active section
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -70% 0px',
            }
        );

        // Observe all sections
        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);

            section.subsections?.forEach((subsection) => {
                const subElement = document.getElementById(subsection.id);
                if (subElement) observer.observe(subElement);
            });
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground mb-3">{tPage('onThisPage')}</h2>
            {sections.map((section) => (
                <div key={section.id}>
                    <button
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                            'w-full text-start text-sm py-2 px-3 rounded-md transition-colors',
                            'hover:bg-muted',
                            activeSection === section.id
                                ? 'text-primary font-medium bg-primary/10'
                                : 'text-muted-foreground'
                        )}
                    >
                        {t(section.titleKey)}
                    </button>
                    {section.subsections && (
                        <div className="ms-3 space-y-1 mt-1">
                            {section.subsections.map((subsection) => (
                                <button
                                    key={subsection.id}
                                    onClick={() => scrollToSection(subsection.id)}
                                    className={cn(
                                        'w-full text-start text-xs py-1.5 px-3 rounded-md transition-colors flex items-center gap-1',
                                        'hover:bg-muted',
                                        activeSection === subsection.id
                                            ? 'text-primary font-medium'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                                    {t(subsection.titleKey)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

