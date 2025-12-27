'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

// Hydration utilities for SSR compatibility
const emptySubscribe = (): (() => void) => () => {};
const getClientSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

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
    
    // Use useSyncExternalStore for hydration-safe mounting detection
    const isHydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

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
