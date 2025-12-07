import { HeroSection } from './_components/landing/hero-section';
import { FeaturesGrid } from './_components/landing/features-grid';
import { HowItWorks } from './_components/landing/how-it-works';
import { SocialProof } from './_components/landing/social-proof';
import { PricingSection } from './_components/landing/pricing-section';
import { Footer } from './_components/landing/footer';
import { LandingHeader } from './_components/landing/landing-header';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'LandingPage' });

    return (
        <div className="relative min-h-screen">
            {/* Responsive Header */}
            <LandingHeader />

            {/* Main Content */}
            <main className="pt-16">
                <HeroSection />
                <SocialProof />
                <FeaturesGrid />
                <HowItWorks />
                <PricingSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
