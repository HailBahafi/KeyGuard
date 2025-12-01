'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchKeys, revokeKey, ApiKey } from '@/lib/queries/keys-queries';
import { KeysTable } from './_components/keys-table';
import { KeyFilters } from './_components/key-filters';
import { CreateKeyDialog } from './_components/create-key-dialog';
import { KeyDetailsSheet } from './_components/key-details-sheet';
import { RevokeKeyDialog } from './_components/revoke-dialog';
import { RotateKeyDialog } from './_components/rotate-dialog';
import { useToast } from '@/components/ui/use-toast';

export default function KeysPage() {
    const t = useTranslations('KeyVault');
    const { toast } = useToast();

    // Data State
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        provider: 'all',
        environment: 'all',
        sort: 'recent'
    });

    // Dialog/Sheet State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [isRotateOpen, setIsRotateOpen] = useState(false);

    // Load keys
    const loadKeys = async () => {
        try {
            setLoading(true);
            const data = await fetchKeys(1, 20, {
                search: searchQuery,
                status: filters.status,
                provider: filters.provider,
                environment: filters.environment
            });
            setKeys(data.keys);
        } catch (error) {
            console.error('Failed to load keys:', error);
            toast({
                title: "Error",
                description: "Failed to load keys",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadKeys();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filters]);

    // Handlers
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: 'all',
            provider: 'all',
            environment: 'all',
            sort: 'recent'
        });
        setSearchQuery('');
    };

    const handleViewDetails = (key: ApiKey) => {
        setSelectedKey(key);
        setIsDetailsOpen(true);
    };

    const handleRotateClick = (key: ApiKey) => {
        setSelectedKey(key);
        setIsRotateOpen(true);
    };

    const handleRevokeClick = (key: ApiKey) => {
        setSelectedKey(key);
        setIsRevokeOpen(true);
    };

    const handleRevokeConfirm = async (keyId: string) => {
        try {
            await revokeKey(keyId);
            toast({
                title: "Key Revoked",
                description: "The API key has been successfully revoked."
            });
            loadKeys();
            if (selectedKey?.id === keyId) {
                setSelectedKey(prev => prev ? { ...prev, status: 'revoked' } : null);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke key",
                variant: "destructive"
            });
        }
    };

    const handleRotateConfirm = async (keyId: string) => {
        // Mock rotation
        toast({
            title: t('rotateDialog.success'),
            description: "New key generated."
        });
        loadKeys();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 me-2" />
                    {t('actions.create')}
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-10 max-w-md"
                    />
                </div>
                <KeyFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Table */}
            <KeysTable
                keys={keys}
                loading={loading}
                onViewDetails={handleViewDetails}
                onRotate={handleRotateClick}
                onRevoke={handleRevokeClick}
            />

            {/* Dialogs */}
            <CreateKeyDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onKeyCreated={loadKeys}
            />

            <KeyDetailsSheet
                apiKey={selectedKey}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                onRotate={(key) => {
                    setIsDetailsOpen(false);
                    handleRotateClick(key);
                }}
                onRevoke={(key) => {
                    setIsDetailsOpen(false);
                    handleRevokeClick(key);
                }}
            />

            <RevokeKeyDialog
                apiKey={selectedKey}
                open={isRevokeOpen}
                onOpenChange={setIsRevokeOpen}
                onConfirm={handleRevokeConfirm}
            />

            <RotateKeyDialog
                apiKey={selectedKey}
                open={isRotateOpen}
                onOpenChange={setIsRotateOpen}
                onConfirm={handleRotateConfirm}
            />
        </div>
    );
}
