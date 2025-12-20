'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Code, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type IntegrationFlow = 'enrollment' | 'platform' | null;

interface FlowSelectorProps {
    selectedFlow: IntegrationFlow;
    onFlowSelect: (flow: IntegrationFlow) => void;
}

export function FlowSelector({ selectedFlow, onFlowSelect }: FlowSelectorProps) {
    const t = useTranslations('Integration.flowSelector');

    return (
        <section id="choose-flow" className="scroll-mt-20 mb-12">
            <div className="space-y-4 mb-8">
                <Badge className="bg-primary/10 text-primary border-0">{t('badge')}</Badge>
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-lg text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enrollment Code Flow */}
                <Card
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        selectedFlow === 'enrollment' && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => onFlowSelect('enrollment')}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10">
                                <Smartphone className="h-6 w-6 text-blue-500" />
                            </div>
                            {selectedFlow === 'enrollment' && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <CardTitle className="mt-4">{t('enrollment.title')}</CardTitle>
                        <CardDescription>{t('enrollment.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{t('enrollment.step1')}</Badge>
                                <span className="text-muted-foreground">{t('enrollment.step1Desc')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{t('enrollment.step2')}</Badge>
                                <span className="text-muted-foreground">{t('enrollment.step2Desc')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{t('enrollment.step3')}</Badge>
                                <span className="text-muted-foreground">{t('enrollment.step3Desc')}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 text-sm text-blue-700 dark:text-blue-300">
                            <strong>{t('enrollment.useCase')}:</strong> {t('enrollment.useCaseDesc')}
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Key Flow */}
                <Card
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        selectedFlow === 'platform' && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => onFlowSelect('platform')}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10">
                                <Code className="h-6 w-6 text-purple-500" />
                            </div>
                            {selectedFlow === 'platform' && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <CardTitle className="mt-4">{t('platform.title')}</CardTitle>
                        <CardDescription>{t('platform.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{t('platform.step1')}</Badge>
                                <span className="text-muted-foreground">{t('platform.step1Desc')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{t('platform.step2')}</Badge>
                                <span className="text-muted-foreground">{t('platform.step2Desc')}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-purple-500/10 text-sm text-purple-700 dark:text-purple-300">
                            <strong>{t('platform.useCase')}:</strong> {t('platform.useCaseDesc')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick links to get keys */}
            <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/ar/keys?tab=enrollment">
                    <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4 me-2" />
                        {t('getEnrollmentCode')}
                        <ArrowRight className="h-4 w-4 ms-2" />
                    </Button>
                </Link>
                <Link href="/ar/keys?tab=platform">
                    <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 me-2" />
                        {t('getPlatformKey')}
                        <ArrowRight className="h-4 w-4 ms-2" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
