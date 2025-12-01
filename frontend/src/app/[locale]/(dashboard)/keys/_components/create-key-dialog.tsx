'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, ChevronLeft, Copy, Eye, EyeOff, Shield, Key, AlertTriangle } from 'lucide-react';
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
import { createKey } from '@/lib/queries/keys-queries';
import { useToast } from '@/components/ui/use-toast';

interface CreateKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onKeyCreated: () => void;
}

const STEPS = ['basic', 'apiKey', 'security', 'review'];

export function CreateKeyDialog({ open, onOpenChange, onKeyCreated }: CreateKeyDialogProps) {
    const t = useTranslations('KeyVault.createDialog');
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [showKey, setShowKey] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<KeyFormData>({
        resolver: zodResolver(keySchema),
        defaultValues: {
            name: '',
            provider: 'openai',
            environment: 'development',
            apiKey: '',
            description: '',
            rateLimit: {
                enabled: false,
                maxPerMinute: 100
            }
        },
        mode: 'onChange'
    });

    const handleNext = async () => {
        const fields = getFieldsForStep(step);
        const isValid = await form.trigger(fields as any);

        if (isValid) {
            setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: KeyFormData) => {
        try {
            setIsSubmitting(true);
            await createKey(data);
            toast({
                title: t('success.title'),
                description: t('success.warning'),
            });
            onKeyCreated();
            onOpenChange(false);
            form.reset();
            setStep(0);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create key",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldsForStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: return ['name', 'provider', 'environment', 'description'];
            case 1: return ['apiKey'];
            case 2: return ['rateLimit'];
            default: return [];
        }
    };

    return (
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                                                <FormDescription>{t('basicInfo.keyNameHelp')}</FormDescription>
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

                        {/* Step 3: Security Settings */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="rateLimit.enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 rtl:space-x-reverse">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    {t('securitySettings.rateLimit')}
                                                </FormLabel>
                                                <FormDescription>
                                                    Limit the number of requests this key can make.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {form.watch('rateLimit.enabled') && (
                                    <FormField
                                        control={form.control}
                                        name="rateLimit.maxPerMinute"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('securitySettings.rateLimitLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {step === 3 && (
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
                                            <span className="text-muted-foreground">{t('securitySettings.rateLimit')}</span>
                                            <p className="font-medium">
                                                {form.getValues('rateLimit.enabled')
                                                    ? `${form.getValues('rateLimit.maxPerMinute')} req/min`
                                                    : 'Disabled'}
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
                                disabled={step === 0 || isSubmitting}
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
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
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
    );
}
