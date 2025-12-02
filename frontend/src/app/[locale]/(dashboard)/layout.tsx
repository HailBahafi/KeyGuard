import { ReactNode } from 'react';
import { ResponsiveHeader } from '@/components/common/responsive-header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <ResponsiveHeader />
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
