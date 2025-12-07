import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <DashboardNav locale={locale} />

            {/* Main Content - margin based on locale direction */}
            <main className={locale === 'ar' ? "lg:me-64 pt-16 lg:pt-0" : "lg:ms-64 pt-16 lg:pt-0"}>
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
