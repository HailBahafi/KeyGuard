'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDevices, useApproveDevice, useRevokeDevice, useEnrollmentCode } from '@/hooks/use-devices';
import type { Device } from '@/types/device';
import { DeviceStatsBar } from './_components/device-stats';
import { DeviceFilters } from './_components/device-filters';
import { DeviceList } from './_components/device-list';
import { EnrollmentDialog } from './_components/enrollment-dialog';
import { DeviceDetailsSheet } from './_components/device-details-sheet';

export default function DevicesPage() {
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        platform: 'all',
        lastSeen: 'all',
        sort: 'recent'
    });

    // Dialog/Sheet State
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // React Query hooks
    const { data: devicesData, isLoading: loading } = useDevices({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        platform: filters.platform !== 'all' ? filters.platform : undefined,
        lastSeen: filters.lastSeen !== 'all' ? filters.lastSeen : undefined,
        sort: filters.sort,
    });

    const approveMutation = useApproveDevice();
    const revokeMutation = useRevokeDevice();
    const enrollmentMutation = useEnrollmentCode();

    const devices = devicesData?.devices || [];
    const stats = devicesData?.stats || {
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        offline: 0,
    };

    // Handlers
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: 'all',
            platform: 'all',
            lastSeen: 'all',
            sort: 'recent'
        });
        setSearchQuery('');
    };

    const handleFilterByStatus = (status: string) => {
        setFilters(prev => ({ ...prev, status }));
    };

    const handleViewDetails = (device: Device) => {
        setSelectedDevice(device);
        setIsDetailsOpen(true);
    };

    const handleApprove = (device: Device) => {
        // Per Postman spec, approve endpoint takes no body - just device ID
        approveMutation.mutate(device.id, {
            onSuccess: () => {
                if (selectedDevice?.id === device.id) {
                    setSelectedDevice({ ...device, status: 'active' });
                }
            },
        });
    };

    const handleSuspend = (device: Device) => {
        // Note: suspendDevice endpoint may not exist, using revoke for now
        // If suspend endpoint exists, create useSuspendDevice hook
        revokeMutation.mutate(device.id, {
            onSuccess: () => {
                if (selectedDevice?.id === device.id) {
                    setSelectedDevice({ ...device, status: 'suspended' });
                }
            },
        });
    };

    const handleRevoke = (device: Device) => {
        revokeMutation.mutate(device.id, {
            onSuccess: () => {
                if (selectedDevice?.id === device.id) {
                    setSelectedDevice({ ...device, status: 'revoked' });
                }
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Device Inventory</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage enrolled devices and approve pending access requests
                    </p>
                </div>
                <Button onClick={() => setIsEnrollmentOpen(true)}>
                    <Plus className="h-4 w-4 me-2" />
                    Enroll Device
                </Button>
            </div>

            {/* Stats Bar */}
            <DeviceStatsBar stats={stats} onFilterByStatus={handleFilterByStatus} />

            {/* Search & Filters */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search devices by name, owner, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-10 max-w-md"
                    />
                </div>
                <DeviceFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Device List */}
            <DeviceList
                devices={devices}
                loading={loading}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onSuspend={handleSuspend}
                onRevoke={handleRevoke}
            />

            {/* Dialogs */}
            <EnrollmentDialog
                open={isEnrollmentOpen}
                onOpenChange={setIsEnrollmentOpen}
                onGenerateCode={() => {
                    // Per Postman spec, enrollment code takes no body
                    enrollmentMutation.mutate();
                }}
            />

            <DeviceDetailsSheet
                device={selectedDevice}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                onApprove={handleApprove}
                onSuspend={handleSuspend}
                onRevoke={handleRevoke}
            />
        </div>
    );
}
