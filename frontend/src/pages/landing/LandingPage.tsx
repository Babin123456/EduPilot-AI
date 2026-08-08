import React, { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WorkflowSection } from './WorkflowSection';
import { AnalyticsSection } from './AnalyticsSection';
import { DocumentStudioSection } from './DocumentStudioSection';
import { CTASection } from './CTASection';
import { LandingFooter } from './LandingFooter';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Preserve scroll position on refresh / back navigation if browser supports it
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis with smooth scroll settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Global parallax layers driven by scroll
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach((el) => {
      const speed = parseFloat((el as HTMLElement).dataset.parallax || '0.3');
      gsap.to(el, {
        y: () => speed * ScrollTrigger.maxScroll(window) * 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(updateTicker);
    };
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      if (lenisRef.current) {
        // Offset -70 ensures section header is perfectly visible below sticky navbar
        lenisRef.current.scrollTo(elem, { offset: -70, duration: 1.4 });
      } else {
        const top = elem.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden">
      <LandingNavbar onNavigate={handleNavigate} />
      <main>
        <HeroSection onNavigate={handleNavigate} />
        <FeaturesSection onNavigate={handleNavigate} />
        <WorkflowSection />
        <AnalyticsSection />
        <DocumentStudioSection />
        <CTASection />
      </main>
      <LandingFooter onNavigate={handleNavigate} />
    </div>
  );
};

export default LandingPage;
