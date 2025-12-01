'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuthStore } from '@/stores/use-auth-store';

export default function SetupPage() {
    const t = useTranslations('Auth.setup');
    const tErrors = useTranslations('Auth.errors');
    const router = useRouter();
    const locale = useLocale();
    const register = useAuthStore((state) => state.register);
    const [isLoading, setIsLoading] = useState(false);

    // Zod validation schema with password confirmation
    const formSchema = z.object({
        organizationName: z.string()
            .min(3, { message: tErrors('minLength', { min: 3 }) }),
        email: z.string()
            .min(1, { message: tErrors('required') })
            .email({ message: tErrors('invalidEmail') }),
        password: z.string()
            .min(8, { message: tErrors('passwordTooShort') }),
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

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            await register(data.organizationName, data.email, data.password);
            // Redirect to dashboard on success
            router.push(`/${locale}/dashboard`);
        } catch (error) {
            console.error('Setup failed:', error);
            setIsLoading(false);
        }
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
                                disabled={isLoading}
                            >
                                {isLoading ? t('loadingButton') : t('submitButton')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
