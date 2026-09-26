/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BillingCycle = 'monthly' | 'annual';

export interface PricingPlan {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number | 'Custom';
  annualPrice: number | 'Custom';
  billingModel?: string;
  positioning: string;
  targetAudience: string;
  isPopular?: boolean;
  isGovernment?: boolean;
  isCustom?: boolean;
  ctaText: string;
  features: string[];
  inheritedFrom?: string;
  userLimit: string;
  tokenDescription?: string;
  tokenOperations?: string[];
  tokenNotes?: string;
}

export interface AddOnIntelligence {
  id: string;
  title: string;
  price: string;
  pricingType: string;
  description: string;
  iconName: string;
}

export interface MatrixRow {
  category: string;
  feature: string;
  tooltip?: string;
  ngo: boolean | string;
  private: boolean | string;
  government: boolean | string;
  custom: boolean | string;
}
