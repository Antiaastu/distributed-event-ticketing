'use client';

import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { CTASection } from './sections/CTASection';
import { Footer } from './sections/Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isLoggedIn?: boolean;
  onDashboard?: () => void;
}

export function LandingPage({ onGetStarted, onLogin, isLoggedIn, onDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <HeroSection 
        onGetStarted={onGetStarted}
        onLogin={onLogin}
        isLoggedIn={isLoggedIn}
        onDashboard={onDashboard}
      />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}