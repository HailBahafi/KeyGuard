'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes requiring authentication
 * 
 * Waits for Zustand store to hydrate from localStorage before
 * checking authentication status. Redirects to login if not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { accessToken } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !accessToken) {
            // Extract locale from path (e.g., /ar/dashboard -> ar)
            const locale = pathname.split('/')[1] || 'en';
            router.replace(`/${locale}/login`);
        }
    }, [isHydrated, accessToken, router, pathname]);

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Not authenticated - show loading (redirect will happen)
    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <>{children}</>;
}
