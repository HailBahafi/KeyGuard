'use client';

import { useTranslations } from 'next-intl';
import { MoreVertical, Copy, RotateCw, Trash2, Eye, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ApiKey } from '@/hooks/use-keys';
import { useToast } from '@/components/ui/use-toast';

interface KeyActionsMenuProps {
    apiKey: ApiKey;
    onViewDetails: (key: ApiKey) => void;
    onRotate: (key: ApiKey) => void;
    onRevoke: (key: ApiKey) => void;
}

export function KeyActionsMenu({ apiKey, onViewDetails, onRotate, onRevoke }: KeyActionsMenuProps) {
    const t = useTranslations('KeyVault.actions');
    const { toast } = useToast();

    const handleCopy = () => {
        // In a real app, we might need to fetch the full key first if not available
        // For now, we'll simulate copying the masked value or a placeholder
        const valueToCopy = apiKey.maskedValue || apiKey.id || '';
        if (valueToCopy) {
            navigator.clipboard.writeText(valueToCopy);
        }
        toast({
            title: t('copied'),
            duration: 2000,
        });
    };

    const isRevoked = apiKey.status === 'revoked';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('create')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewDetails(apiKey)}>
                    <Eye className="me-2 h-4 w-4" />
                    {t('viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} disabled={isRevoked}>
                    <Copy className="me-2 h-4 w-4" />
                    {t('copy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRotate(apiKey)} disabled={isRevoked}>
                    <RotateCw className="me-2 h-4 w-4" />
                    {t('rotate')}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isRevoked}>
                    <Edit className="me-2 h-4 w-4" />
                    {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onRevoke(apiKey)}
                    disabled={isRevoked}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="me-2 h-4 w-4" />
                    {t('revoke')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
