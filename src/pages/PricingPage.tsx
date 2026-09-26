/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/pricingData';
import { BillingCycle, PricingPlan } from '../types/pricing';
import { PricingHeader } from '../components/pricing/PricingHeader';
import { PricingHero } from '../components/pricing/PricingHero';
import { PricingCard } from '../components/pricing/PricingCard';
import { NgoDiscountNotice } from '../components/pricing/NgoDiscountNotice';
import { AddOnIntelligenceSection } from '../components/pricing/AddOnIntelligenceSection';
import { ValuePhilosophySection } from '../components/pricing/ValuePhilosophySection';
import { IntelligencePipelineFlow } from '../components/pricing/IntelligencePipelineFlow';
import { FeatureMatrixTable } from '../components/pricing/FeatureMatrixTable';
import { PricingFinalCta } from '../components/pricing/PricingFinalCta';
import { PricingContactModal } from '../components/pricing/PricingContactModal';
import { FooterSection } from '../components/FooterSection';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PricingPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlanForModal(plan);
    setIsModalOpen(true);
  };

  const handleOpenGeneralConsultation = () => {
    setSelectedPlanForModal(PRICING_PLANS.find((p) => p.id === 'custom') || PRICING_PLANS[0]);
    setIsModalOpen(true);
  };

  const handleApplyNgoGrant = () => {
    setSelectedPlanForModal(PRICING_PLANS.find((p) => p.id === 'ngo') || null);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-geist flex flex-col selection:bg-white selection:text-black">
      {/* Background Ocean Grids and Atmospheric Light Field */}
      <div className="fixed inset-0 ocean-grid opacity-20 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Pricing Header Bar with Logo and Breadcrumbs */}
      <PricingHeader onOpenConsultation={handleOpenGeneralConsultation} />

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Section 1: Hero with Eyebrow, Main Heading & Interactive Billing Toggle */}
        <PricingHero
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
        />

        {/* Section 2: Main Pricing Cards Grid (4 Plans) */}
        <section id="pricing-plans-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
        </section>

        {/* Section 3: NGO Discount Notice (Environmental Impact Program) */}
        <NgoDiscountNotice onApplyDiscount={handleApplyNgoGrant} />

        {/* Section 4: Add-On Intelligence Section */}
        <AddOnIntelligenceSection />

        {/* Section 5: Value-Based Pricing Explanation (Why OORCA is priced differently) */}
        <ValuePhilosophySection />

        {/* Section 6: Intelligence Infrastructure Architecture (Pipeline Flow) */}
        <IntelligencePipelineFlow />

        {/* Section 7: Pricing Comparison / Feature Matrix */}
        <FeatureMatrixTable />

        {/* Section 8: Final Call to Action */}
        <PricingFinalCta onTalkToOorca={handleOpenGeneralConsultation} />
      </main>

      {/* Footer Section */}
      <FooterSection />

      {/* Interactive Deployment & Consultation Modal */}
      <PricingContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlanForModal}
        billingCycle={billingCycle}
      />
    </div>
  );
};

export default PricingPage;
