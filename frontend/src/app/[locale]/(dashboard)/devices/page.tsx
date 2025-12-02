'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    fetchDevices,
    approveDevice,
    suspendDevice,
    revokeDevice
} from '@/lib/queries/device-queries';
import { Device, DeviceStats } from '@/types/device';
import { DeviceStatsBar } from './_components/device-stats';
import { DeviceFilters } from './_components/device-filters';
import { DeviceList } from './_components/device-list';
import { EnrollmentDialog } from './_components/enrollment-dialog';
import { DeviceDetailsSheet } from './_components/device-details-sheet';

export default function DevicesPage() {
    const { toast } = useToast();

    // Data State
    const [devices, setDevices] = useState<Device[]>([]);
    const [stats, setStats] = useState<DeviceStats>({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        offline: 0
    });
    const [loading, setLoading] = useState(true);

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

    // Load devices
    const loadDevices = async () => {
        try {
            setLoading(true);
            const data = await fetchDevices(1, 50, {
                search: searchQuery,
                status: filters.status,
                platform: filters.platform,
                lastSeen: filters.lastSeen,
                sort: filters.sort
            });
            setDevices(data.devices);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to load devices:', error);
            toast({
                title: 'Error',
                description: 'Failed to load devices',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadDevices();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [searchQuery, filters]);

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

    const handleApprove = async (device: Device) => {
        try {
            await approveDevice(device.id);
            toast({
                title: 'Device Approved',
                description: `${device.name} has been approved and can now access the system.`
            });
            loadDevices();

            // Update selected device if it's the one being modified
            if (selectedDevice?.id === device.id) {
                setSelectedDevice({ ...device, status: 'active' });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to approve device',
                variant: 'destructive'
            });
        }
    };

    const handleSuspend = async (device: Device) => {
        try {
            await suspendDevice(device.id);
            toast({
                title: 'Device Suspended',
                description: `${device.name} has been suspended and can no longer access the system.`,
                variant: 'destructive'
            });
            loadDevices();

            if (selectedDevice?.id === device.id) {
                setSelectedDevice({ ...device, status: 'suspended' });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to suspend device',
                variant: 'destructive'
            });
        }
    };

    const handleRevoke = async (device: Device) => {
        try {
            await revokeDevice(device.id);
            toast({
                title: 'Device Revoked',
                description: `Access for ${device.name} has been permanently revoked.`,
                variant: 'destructive'
            });
            loadDevices();

            if (selectedDevice?.id === device.id) {
                setSelectedDevice({ ...device, status: 'revoked' });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to revoke device',
                variant: 'destructive'
            });
        }
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
