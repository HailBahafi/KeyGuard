import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Subtle dotted background pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-4">
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
    );
}
