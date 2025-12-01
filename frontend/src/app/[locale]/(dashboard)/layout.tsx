import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            {/* Dashboard Layout - Can add sidebar, navbar, etc. later */}
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
