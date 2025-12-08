'use client';

import { useTranslations } from 'next-intl';
import { SettingsSidebar } from './_components/settings-sidebar';
import { GeneralForm } from './_components/general-form';
import { SecurityForm } from './_components/security-form';
import { NotificationsForm } from './_components/notifications-form';
import { ApiSection } from './_components/api-section';
import { BackupCard } from './_components/backup-card';
import { useSettings } from '@/hooks/use-settings';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const { data: settings, isLoading: loading } = useSettings();

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                    <aside>
                        <Skeleton className="h-64 w-full" />
                    </aside>
                    <main>
                        <Skeleton className="h-96 w-full" />
                    </main>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center p-12">
                <p className="text-muted-foreground">{t('failedToLoad')}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-1">
                    {t('subtitle')}
                </p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block">
                    <SettingsSidebar />
                </aside>

                {/* Main Content */}
                <main className="space-y-8 min-w-0">
                    <GeneralForm
                        initialData={settings.general}
                    />

                    <SecurityForm
                        initialData={settings.security}
                    />

                    <NotificationsForm />

                    <ApiSection
                        keys={settings.api.keys}
                        onUpdate={() => {
                            // Settings will auto-refetch via React Query
                        }}
                    />

                    <BackupCard lastBackupAt={settings.backup.lastBackupAt} />
                </main>
            </div>
        </div>
    );
}
