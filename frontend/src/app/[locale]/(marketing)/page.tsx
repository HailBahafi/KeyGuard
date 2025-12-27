import { HeroSection } from './_components/landing/hero-section';
import { FeaturesGrid } from './_components/landing/features-grid';
import { HowItWorks } from './_components/landing/how-it-works';
import { StatsSection } from './_components/landing/stats-section';
import { PricingSection } from './_components/landing/pricing-section';
import { Footer } from './_components/landing/footer';
import { LandingHeader } from './_components/landing/landing-header';
import { generatePageMetadata } from '@/lib/metadata';
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return generatePageMetadata(locale, 'home', '');
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params;

    return (
        <div className="relative min-h-screen bg-background">
            {/* JSON-LD Structured Data */}
            <OrganizationJsonLd locale={locale} />
            <SoftwareApplicationJsonLd locale={locale} />

            {/* Responsive Header */}
            <LandingHeader />

            {/* Main Content */}
            <main className="pt-16">
                <HeroSection />
                <StatsSection />
                <FeaturesGrid />
                <HowItWorks />
                <PricingSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
