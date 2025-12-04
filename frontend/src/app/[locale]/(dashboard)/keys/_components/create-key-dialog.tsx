'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, ChevronLeft, Eye, EyeOff, Shield, Key, AlertTriangle, Copy } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { keySchema, KeyFormData } from '@/lib/validations/key-schema';
import { useCreateKey } from '@/hooks/use-keys';
import { toast } from 'sonner';

interface CreateKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STEPS = ['basic', 'apiKey', 'review'];

export function CreateKeyDialog({ open, onOpenChange }: CreateKeyDialogProps) {
    const t = useTranslations('KeyVault.createDialog');
    const createKeyMutation = useCreateKey();
    const [step, setStep] = useState(0);
    const [showKey, setShowKey] = useState(false);
    const [rawKey, setRawKey] = useState<string | null>(null);
    const [showRawKeyDialog, setShowRawKeyDialog] = useState(false);

    const form = useForm<KeyFormData>({
        resolver: zodResolver(keySchema),
        defaultValues: {
            name: '',
            provider: 'openai',
            environment: 'development',
            apiKey: '',
            description: '',
            expiration: 'never',
        },
        mode: 'onChange'
    });

    const handleNext = async () => {
        const fields = getFieldsForStep(step);
        // Type assertion needed because getFieldsForStep returns string[] but trigger expects field paths
        const isValid = await form.trigger(fields as Parameters<typeof form.trigger>[0]);

        if (isValid) {
            setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const calculateExpiresAt = (expiration: string): string | undefined => {
        if (expiration === 'never') return undefined;
        const daysMap: Record<string, number> = {
            '30days': 30,
            '60days': 60,
            '90days': 90,
            '1year': 365
        };
        const days = daysMap[expiration];
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    };

    const onSubmit = async (data: KeyFormData) => {
        createKeyMutation.mutate(
            {
                name: data.name,
                provider: data.provider,
                environment: data.environment || 'development',
                description: data.description,
                expiresAt: calculateExpiresAt(data.expiration || 'never'),
            },
            {
                onSuccess: (response) => {
                    // Capture rawKey if present (only shown once!)
                    if (response.rawKey) {
                        setRawKey(response.rawKey);
                        setShowRawKeyDialog(true);
                    }
                    // Close create dialog and reset
                    onOpenChange(false);
                    form.reset();
                    setStep(0);
                },
            }
        );
    };

    const getFieldsForStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: return ['name', 'provider', 'environment', 'description', 'expiration'];
            case 1: return ['apiKey'];
            default: return [];
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                        <DialogDescription>
                            {t(`steps.${STEPS[step]}`)}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between px-2 mb-4">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${i <= step ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'
                                    }`}>
                                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <Form {...form}>
                        <form className="space-y-6">

                            {/* Step 1: Basic Info */}
                            {step === 0 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('basicInfo.keyName')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t('basicInfo.keyNamePlaceholder')} {...field} />
                                                    </FormControl>
                                                    {/* <FormDescription>{t('basicInfo.keyNameHelp')}</FormDescription> */}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="provider"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('basicInfo.provider')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('basicInfo.providerPlaceholder')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="openai">OpenAI</SelectItem>
                                                            <SelectItem value="anthropic">Anthropic</SelectItem>
                                                            <SelectItem value="google">Google (Gemini)</SelectItem>
                                                            <SelectItem value="azure">Azure OpenAI</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="environment"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('basicInfo.environment')}</FormLabel>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex gap-4"
                                                >
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                        <RadioGroupItem value="production" id="prod" />
                                                        <Label htmlFor="prod">{t('basicInfo.environments.production')}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                        <RadioGroupItem value="development" id="dev" />
                                                        <Label htmlFor="dev">{t('basicInfo.environments.development')}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                        <RadioGroupItem value="staging" id="staging" />
                                                        <Label htmlFor="staging">{t('basicInfo.environments.staging')}</Label>
                                                    </div>
                                                </RadioGroup>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('basicInfo.description')}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder={t('basicInfo.descriptionPlaceholder')} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expiration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiration</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select expiration" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="30days">30 Days</SelectItem>
                                                        <SelectItem value="60days">60 Days</SelectItem>
                                                        <SelectItem value="90days">90 Days</SelectItem>
                                                        <SelectItem value="1year">1 Year</SelectItem>
                                                        <SelectItem value="never">Never</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>When this API key will expire</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: API Key Value */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <Tabs defaultValue="paste" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="paste">{t('apiKeyValue.pasteExisting')}</TabsTrigger>
                                            <TabsTrigger value="generate">{t('apiKeyValue.generatePlaceholder')}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="paste" className="space-y-4 mt-4">
                                            <FormField
                                                control={form.control}
                                                name="apiKey"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('apiKeyValue.apiKeyLabel')}</FormLabel>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input
                                                                    type={showKey ? "text" : "password"}
                                                                    placeholder={t('apiKeyValue.apiKeyPlaceholder')}
                                                                    {...field}
                                                                    className="pe-10"
                                                                />
                                                            </FormControl>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute end-0 top-0 h-full px-3 hover:bg-transparent"
                                                                onClick={() => setShowKey(!showKey)}
                                                            >
                                                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Alert>
                                                <Shield className="h-4 w-4" />
                                                <AlertTitle>Security Notice</AlertTitle>
                                                <AlertDescription>
                                                    {t('apiKeyValue.securityNotice')}
                                                </AlertDescription>
                                            </Alert>
                                        </TabsContent>
                                        <TabsContent value="generate">
                                            <div className="p-4 border rounded-md bg-muted/50 text-center">
                                                <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    KeyGuard will generate a secure placeholder key for testing purposes.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() => form.setValue('apiKey', `sk-generated-${Math.random().toString(36).substring(7)}`)}
                                                >
                                                    Generate Key
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="rounded-md border p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">{t('basicInfo.keyName')}</span>
                                                <p className="font-medium">{form.getValues('name')}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">{t('basicInfo.provider')}</span>
                                                <p className="font-medium capitalize">{form.getValues('provider')}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">{t('basicInfo.environment')}</span>
                                                <p className="font-medium capitalize">{form.getValues('environment')}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Expiration</span>
                                                <p className="font-medium">
                                                    {(() => {
                                                        const exp = form.getValues('expiration');
                                                        const labels: Record<string, string> = {
                                                            '30days': '30 Days',
                                                            '60days': '60 Days',
                                                            '90days': '90 Days',
                                                            '1year': '1 Year',
                                                            'never': 'Never'
                                                        };
                                                        return labels[exp || 'never'] || 'Never';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                                        <AlertTitle className="text-yellow-800 dark:text-yellow-500">Confirm Creation</AlertTitle>
                                        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                                            Please verify all settings before creating the key.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <DialogFooter className="flex justify-between sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={step === 0 || createKeyMutation.isPending}
                                >
                                    <ChevronLeft className="w-4 h-4 me-2" />
                                    {t('buttons.back')}
                                </Button>

                                {step < STEPS.length - 1 ? (
                                    <Button type="button" onClick={handleNext}>
                                        {t('buttons.next')}
                                        <ChevronRight className="w-4 h-4 ms-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={form.handleSubmit(onSubmit)}
                                        disabled={createKeyMutation.isPending}
                                    >
                                        {createKeyMutation.isPending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2" />
                                        ) : (
                                            <Check className="w-4 h-4 me-2" />
                                        )}
                                        {t('buttons.create')}
                                    </Button>
                                )}
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Raw Key Dialog - Shown only once after creation */}
            <Dialog open={showRawKeyDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowRawKeyDialog(false);
                    setRawKey(null);
                    toast.success('API key created', {
                        description: 'Your new API key has been generated successfully.',
                    });
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            Copy Your API Key
                        </DialogTitle>
                        <DialogDescription>
                            ⚠️ This is the only time you'll see this key. Make sure to copy it now!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            <AlertTitle className="text-amber-800 dark:text-amber-500">Important</AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-400">
                                For security reasons, we can't show this key again. Store it somewhere safe!
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Your API Key</label>
                            <div className="relative">
                                <div className="flex items-center p-3 rounded-lg bg-muted border border-border font-mono text-sm break-all">
                                    {rawKey}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 end-1"
                                    onClick={async () => {
                                        if (rawKey) {
                                            await navigator.clipboard.writeText(rawKey);
                                            toast.success('Copied!', {
                                                description: 'API key copied to clipboard.',
                                            });
                                        }
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => {
                            setShowRawKeyDialog(false);
                            setRawKey(null);
                            toast.success('API key created', {
                                description: 'Your new API key has been generated successfully.',
                            });
                        }}>
                            I've Copied the Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

