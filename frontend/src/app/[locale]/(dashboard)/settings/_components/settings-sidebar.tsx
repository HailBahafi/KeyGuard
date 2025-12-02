'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Settings, Shield, Bell, Key, Database, Webhook } from 'lucide-react';

interface Section {
    id: string;
    title: string;
    icon: any;
}

const sections: Section[] = [
    { id: 'general', title: 'General', icon: Settings },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'api', title: 'API Keys', icon: Key },
    { id: 'backup', title: 'Backup', icon: Database },
];

export function SettingsSidebar() {
    const [activeSection, setActiveSection] = useState<string>('general');

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
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="sticky top-6 space-y-1">
            {sections.map((section) => {
                const Icon = section.icon;
                return (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                            'hover:bg-muted',
                            activeSection === section.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {section.title}
                    </button>
                );
            })}
        </nav>
    );
}
