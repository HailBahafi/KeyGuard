import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { AuthGuard } from '@/components/auth/auth-guard';
import type { Metadata } from 'next';

/**
 * Dashboard pages should not be indexed by search engines
 * They contain authenticated user content
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
export default async function DashboardLayout({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <AuthGuard>
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
        </AuthGuard>
    );
}

