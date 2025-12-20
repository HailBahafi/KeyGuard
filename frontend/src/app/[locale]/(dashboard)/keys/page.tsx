'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, HelpCircle, Key, Code, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApiKeys, useRevokeKey, useRotateKey, type ApiKey } from '@/hooks/use-keys';
import { KeysTable } from './_components/keys-table';
import { KeyFilters } from './_components/key-filters';
import { CreateKeyDialog } from './_components/create-key-dialog';
import { KeyDetailsSheet } from './_components/key-details-sheet';
import { RevokeKeyDialog } from './_components/revoke-dialog';
import { RotateKeyDialog } from './_components/rotate-dialog';
import { PlatformKeysTab } from './_components/platform-keys-tab';
import { EnrollmentTab } from './_components/enrollment-tab';

export default function KeysPage() {
    const t = useTranslations('KeyVault');

    // Tab State
    const [activeTab, setActiveTab] = useState('provider');

    // Filter State (for provider keys tab)
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

    // React Query hooks
    const { data: keysData, isLoading: loading } = useApiKeys({
        page: 1,
        limit: 20,
        search: searchQuery || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        provider: filters.provider !== 'all' ? filters.provider : undefined,
        environment: filters.environment !== 'all' ? filters.environment : undefined,
    });

    const revokeMutation = useRevokeKey();
    const rotateMutation = useRotateKey();

    const keys = keysData?.keys || [];

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
        revokeMutation.mutate(keyId, {
            onSuccess: () => {
                setIsRevokeOpen(false);
                if (selectedKey?.id === keyId) {
                    setSelectedKey(prev => prev ? { ...prev, status: 'revoked' } : null);
                }
            },
        });
    };

    const handleRotateConfirm = async (keyId: string) => {
        rotateMutation.mutate(keyId, {
            onSuccess: () => {
                setIsRotateOpen(false);
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                {activeTab === 'provider' && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 me-2" />
                        {t('actions.create')}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="provider" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('tabs.provider')}</span>
                        <span className="sm:hidden">{t('tabs.providerShort')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{t('tabs.providerTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TabsTrigger>
                    <TabsTrigger value="platform" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('tabs.platform')}</span>
                        <span className="sm:hidden">{t('tabs.platformShort')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{t('tabs.platformTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TabsTrigger>
                    <TabsTrigger value="enrollment" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('tabs.enrollment')}</span>
                        <span className="sm:hidden">{t('tabs.enrollmentShort')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{t('tabs.enrollmentTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TabsTrigger>
                </TabsList>

                {/* Provider Keys Tab */}
                <TabsContent value="provider" className="space-y-6">
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
                </TabsContent>

                {/* Platform Keys Tab */}
                <TabsContent value="platform">
                    <PlatformKeysTab />
                </TabsContent>

                {/* Enrollment Tab */}
                <TabsContent value="enrollment">
                    <EnrollmentTab />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <CreateKeyDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
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
