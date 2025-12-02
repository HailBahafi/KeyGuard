'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
    isLive: boolean;
    onToggle: () => void;
    newLogsCount?: number;
}

export function LiveIndicator({ isLive, onToggle, newLogsCount = 0 }: LiveIndicatorProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Live Badge with Pulse Animation */}
            <Badge
                className={cn(
                    "px-3 py-1 border-0 transition-all duration-200",
                    isLive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Radio className="h-3 w-3" />
                        {isLive && (
                            <span className="absolute inset-0 animate-ping">
                                <Radio className="h-3 w-3 opacity-75" />
                            </span>
                        )}
                    </div>
                    <span className="font-medium">
                        {isLive ? 'Live' : 'Paused'}
                    </span>
                </div>
            </Badge>

            {/* Pause/Resume Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="h-8"
            >
                {isLive ? (
                    <>
                        <Pause className="h-3 w-3 me-1" />
                        Pause
                    </>
                ) : (
                    <>
                        <Play className="h-3 w-3 me-1" />
                        Resume
                    </>
                )}
            </Button>

            {/* New Logs Counter (when paused) */}
            {!isLive && newLogsCount > 0 && (
                <Badge variant="outline" className="animate-pulse">
                    {newLogsCount} new {newLogsCount === 1 ? 'log' : 'logs'}
                </Badge>
            )}
        </div>
    );
}
