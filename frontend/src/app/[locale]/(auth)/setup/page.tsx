'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRegister } from '@/hooks/use-auth';

export default function SetupPage() {
    const t = useTranslations('Auth.setup');
    const tErrors = useTranslations('Auth.errors');
    const locale = useLocale();
    const registerMutation = useRegister();

    // Zod validation schema with password confirmation
    // Note: Backend requires username (3-30 chars, alphanumeric + underscore/hyphen)
    // organizationName is used as username for now
    const formSchema = z.object({
        organizationName: z.string()
            .min(3, { message: tErrors('minLength', { min: 3 }) })
            .max(30, { message: tErrors('maxLength', { max: 30 }) })
            .regex(/^[a-zA-Z0-9_-]+$/, {
                message: 'Organization name must contain only letters, numbers, underscores, or hyphens',
            }),
        email: z.string()
            .min(1, { message: tErrors('required') })
            .email({ message: tErrors('invalidEmail') }),
        password: z.string()
            .min(8, { message: tErrors('passwordTooShort') })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
            }),
        confirmPassword: z.string()
            .min(1, { message: tErrors('required') }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: tErrors('passwordsDontMatch'),
        path: ['confirmPassword'],
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organizationName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        // useRegister hook handles success (redirect) and error (toast) automatically
        registerMutation.mutate({
            email: data.email,
            organizationName: data.organizationName,
            password: data.password,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {t('title')}
                    </CardTitle>
                    <CardDescription>
                        {t('subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="organizationName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('orgNameLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('orgNamePlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('adminEmailLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('adminEmailPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('passwordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={t('passwordPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={t('confirmPasswordPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {registerMutation.isPending ? t('loadingButton') : t('submitButton')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        {t('hasAccount')}{' '}
                        <Link 
                            href={`/${locale}/login`}
                            className="text-primary hover:underline font-medium"
                        >
                            {t('signIn')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
