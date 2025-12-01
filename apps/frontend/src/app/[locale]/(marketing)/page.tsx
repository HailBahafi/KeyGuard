import { HeroSection } from './_components/landing/hero-section';
import { FeaturesGrid } from './_components/landing/features-grid';
import { HowItWorks } from './_components/landing/how-it-works';
import { SocialProof } from './_components/landing/social-proof';
import { PricingSection } from './_components/landing/pricing-section';
import { Footer } from './_components/landing/footer';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
    const t = await getTranslations('LandingPage');

    return (
        <div className="relative min-h-screen">
            {/* Fixed Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">K</span>
                        </div>
                        <span className="text-xl font-bold">KeyGuard</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.features')}
                        </a>
                        <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('howItWorks.title')}
                        </a>
                        <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.pricing')}
                        </a>
                        <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.docs')}
                        </a>
                    </nav>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

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
