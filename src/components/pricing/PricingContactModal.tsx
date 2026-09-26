/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PricingPlan, BillingCycle } from '../../types/pricing';
import { X, CheckCircle2, Shield, Send } from 'lucide-react';

interface PricingContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PricingPlan | null;
  billingCycle: BillingCycle;
}

export const PricingContactModal: React.FC<PricingContactModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle,
}) => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [orgType, setOrgType] = useState(
    selectedPlan?.id === 'ngo'
      ? 'NGO / Conservation'
      : selectedPlan?.id === 'government'
      ? 'Government / Coast Guard'
      : selectedPlan?.id === 'custom'
      ? 'Multinational Enterprise'
      : 'Vessel Owner / Operator'
  );
  const [fleetSize, setFleetSize] = useState('1 - 10 Vessels');
  const [applyNgoDiscount, setApplyNgoDiscount] = useState(selectedPlan?.id === 'ngo');
  const [estimatedTokens, setEstimatedTokens] = useState('50,000 Tokens / Month');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-geist">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-black border border-white/15 shadow-2xl p-6 sm:p-8 text-left my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Deployment Request Dispatched
            </h3>

            <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{fullName || 'Operator'}</strong>. Your commercial intelligence dossier for{' '}
              <strong className="text-white">{selectedPlan?.name || 'OORCA Intelligence'}</strong> has been logged with our maritime solutions desk.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono-code text-white/60 text-left space-y-1.5 max-w-md mx-auto">
              <div className="text-white font-semibold mb-1">TRANSMISSION SUMMARY:</div>
              <div>• Plan Selected: {selectedPlan?.name} ({billingCycle.toUpperCase()})</div>
              <div>• Organization: {organization || 'Confidential'}</div>
              <div>• Operational Category: {orgType}</div>
              {selectedPlan?.id === 'ngo' && applyNgoDiscount && (
                <div className="text-emerald-400">• Environmental Grant: 30–50% Discount Applied for Review</div>
              )}
              {selectedPlan?.id === 'custom' && (
                <div className="text-amber-400">• Token Quota Baseline: {estimatedTokens}</div>
              )}
              <div>• Response SLA: &lt; 4 Hours (Mission Priority Protocol)</div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 rounded-xl text-xs font-mono-code font-semibold text-black bg-white hover:bg-neutral-200 transition-colors cursor-pointer shadow-lg"
            >
              Return to Plans
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Title & Selected Plan Banner */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono-code text-white/50 uppercase tracking-widest mb-1.5">
                <Shield className="w-3.5 h-3.5 text-white/70" />
                <span>INTELLIGENCE INQUIRY & DEPLOYMENT</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedPlan ? `Deploy ${selectedPlan.name}` : 'Consult with OORCA'}
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Configure your maritime operational scope or request tailored commercial specifications.
              </p>
            </div>

            {/* Selected Plan Details Chip */}
            {selectedPlan && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono-code font-bold text-white">
                    {selectedPlan.name}
                  </div>
                  <div className="text-[11px] text-white/60">
                    {selectedPlan.positioning} • {selectedPlan.userLimit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {selectedPlan.isCustom
                      ? 'Token-Based'
                      : billingCycle === 'annual'
                      ? `$${(selectedPlan.annualPrice as number).toLocaleString()} / yr`
                      : `$${(selectedPlan.monthlyPrice as number).toLocaleString()} / mo`}
                  </div>
                  <div className="text-[10px] font-mono-code text-white/50 capitalize">
                    {billingCycle} billing
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Capt. Alexander Vance"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="vance@marine-defense.org"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Organization / Flag Authority *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Maritime Environmental Agency"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Operational Sector
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-white cursor-pointer text-xs"
                  >
                    <option value="NGO / Conservation">NGO / Environmental Body</option>
                    <option value="Vessel Owner / Operator">Private Vessel Owner / Fleet Operator</option>
                    <option value="Government / Coast Guard">Coast Guard / Port State Control</option>
                    <option value="Multinational Enterprise">Multinational Enterprise / Insurer</option>
                    <option value="Research / Academic">Research / Academic Institute</option>
                  </select>
                </div>
              </div>

              {/* Special options depending on plan */}
              {selectedPlan?.id === 'private' && (
                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Fleet Size to Monitor
                  </label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-white text-xs"
                  >
                    <option value="1 - 10 Vessels">1 - 10 Vessels (Included in Private Base)</option>
                    <option value="11 - 25 Vessels">11 - 25 Vessels (+$15-$25/vessel add-on)</option>
                    <option value="26 - 50 Vessels">26 - 50 Vessels</option>
                    <option value="50+ Vessels">50+ Vessels (Enterprise Fleet SLA)</option>
                  </select>
                </div>
              )}

              {selectedPlan?.id === 'custom' && (
                <div>
                  <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                    Estimated Monthly Token Quota Requirement
                  </label>
                  <select
                    value={estimatedTokens}
                    onChange={(e) => setEstimatedTokens(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-white text-xs"
                  >
                    <option value="25,000 Tokens / Month">25,000 Tokens / Month (Moderate Investigations)</option>
                    <option value="50,000 Tokens / Month">50,000 Tokens / Month (High-Volume Multi-Basin)</option>
                    <option value="100,000+ Tokens / Month">100,000+ Tokens / Month (National Scale Deployment)</option>
                  </select>
                </div>
              )}

              {selectedPlan?.id === 'ngo' && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/15 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="ngo-discount-checkbox"
                    checked={applyNgoDiscount}
                    onChange={(e) => setApplyNgoDiscount(e.target.checked)}
                    className="mt-0.5 rounded border-white/30 text-white focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="ngo-discount-checkbox" className="text-xs text-white/80 cursor-pointer">
                    <span className="font-semibold text-white">Apply for Environmental Impact Grant</span>
                    <p className="text-[11px] text-white/60 leading-normal mt-0.5">
                      Check this box if your organization is a verified 501(c)(3) or charitable non-profit eligible for our 30–50% subsidy.
                    </p>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-white/70 font-mono-code text-[11px] mb-1">
                  Operational Requirements / Coastal Corridor Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Arabian Sea EEZ corridor, Sentinel-1 high-res tasking, API webhook to sovereign VTS system..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white resize-none text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-mono-code font-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.01] active:scale-95"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Submit Intelligence Deployment Request</span>
                </button>
              </div>

              <div className="text-[10px] text-white/40 font-mono-code text-center pt-1">
                Encrypted Maritime Transport • Confidential Commercial Verification
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
