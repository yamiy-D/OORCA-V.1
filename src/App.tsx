/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HeroSection } from './components/HeroSection';
import { WhatIsOorcaSection } from './components/WhatIsOorcaSection';
import { CoreCapabilitiesSection } from './components/CoreCapabilitiesSection';
import { HowItWorksPipeline } from './components/HowItWorksPipeline';
import { EnvironmentalImpactSection } from './components/EnvironmentalImpactSection';
import { TechnologyBehindSection } from './components/TechnologyBehindSection';
import { WhyOorcaIsDifferentSection } from './components/WhyOorcaIsDifferentSection';
import { FooterSection } from './components/FooterSection';
import FloatingNavigationBubble from './components/FloatingNavigationBubble';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { SimulationPage } from './pages/SimulationPage';
import { PricingPage } from './pages/PricingPage';
import { AppLayout } from './components/layout/AppLayout';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  const scrollToTechnology = () => {
    const el = document.getElementById('technology-behind');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCapabilities = () => {
    const el = document.getElementById('core-capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPipeline = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-geist flex flex-col selection:bg-white selection:text-black">
      {/* 1. Hero Section (Page 1) */}
      <HeroSection 
        onExploreClick={scrollToTechnology}
        onPipelineClick={scrollToPipeline}
      />

      {/* 2. What is OORCA? (Page 2) */}
      <WhatIsOorcaSection />

      {/* 3. Technology Behind OORCA (Page 3) */}
      <TechnologyBehindSection />

      {/* 4. Core Intelligence Capabilities */}
      <CoreCapabilitiesSection />

      {/* 5. How OORCA Works (Forensic Pipeline) */}
      <HowItWorksPipeline />

      {/* 6. Environmental Impact */}
      <EnvironmentalImpactSection />

      {/* 7. Why OORCA Is Different */}
      <WhyOorcaIsDifferentSection />

      {/* 8. Deep-Ocean Minimal Footer */}
      <FooterSection />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/data" element={<Navigate to="/pricing" replace />} />
          <Route path="/alerts" element={<AlertCenterPage />} />
          <Route path="/dev" element={<ComingSoonPage pageType="dev" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
