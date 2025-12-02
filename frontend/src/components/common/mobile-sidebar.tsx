'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Side Panel */}
            <div
                className={cn(
                    'fixed top-0 start-0 z-[9999] h-full w-[280px] sm:w-[320px]',
                    'bg-background border-e border-border shadow-lg',
                    'transform transition-transform duration-300 ease-in-out',
                    'overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 end-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Close menu"
                >
                    <X className="h-4 w-4" />
                </Button>

                {/* Content */}
                <div className="p-6 pt-16">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
