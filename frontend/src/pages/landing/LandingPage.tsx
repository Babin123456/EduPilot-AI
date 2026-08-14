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

interface LandingPageProps {
  isAppLoaded?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isAppLoaded = true }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!isAppLoaded) return;

    // Preserve scroll position on refresh / back navigation if browser supports it
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Trigger smooth entrance GSAP timeline for landing page elements
    const ctx = gsap.context(() => {
      // Set initial states explicitly so elements are visible even if timeline was killed
      gsap.set('#landing-navbar, .hero-badge-container, .hero-title-line, .hero-subtitle, .hero-bullets span, .hero-cta, .floating-hero-asset', {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      const tl = gsap.timeline();

      tl.from('#landing-navbar', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
      .from('.hero-badge-container', {
        scale: 0.85,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      }, '-=0.4')
      .from('.hero-title-line', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power4.out',
      }, '-=0.3')
      .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.5')
      .from('.hero-bullets span', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.4')
      .from('.hero-cta', {
        scale: 0.9,
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(1.5)',
      }, '-=0.3')
      .from('.floating-hero-asset', {
        scale: 0.92,
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, '-=0.7');
    });

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
      ctx.revert();
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(updateTicker);
    };
  }, [isAppLoaded]);


  const handleNavigate = useCallback((sectionId: string) => {
    if (sectionId === 'top') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(elem, { offset: -70, duration: 1.4 });
      } else {
        const top = elem.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071426] text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden">
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
