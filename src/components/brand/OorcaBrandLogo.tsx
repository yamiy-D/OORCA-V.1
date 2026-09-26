/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface OorcaBrandLogoProps {
  /**
   * Predefined size presets or custom pixel dimensions
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Whether clicking the logo returns the user to the Home page ('/')
   * @default true
   */
  asLink?: boolean;
  /**
   * Additional custom CSS classes for the container
   */
  className?: string;
  /**
   * Display style: 'default' preserves natural drop-shadow, 'compact' tightens margins
   */
  variant?: 'default' | 'compact' | 'glow';
  /**
   * Optional accessible label
   */
  alt?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',        // 28px
  sm: 'w-9 h-9 sm:w-10 sm:h-10', // 36-40px
  md: 'w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14', // 44-56px for desktop headers
  lg: 'w-16 h-16 sm:w-20 sm:h-20', // 64-80px for dossiers/modals
  xl: 'w-24 h-24 sm:w-28 sm:h-28', // 96-112px
};

/**
 * Official OORCA Brand Identity Component
 * Single Source of Truth for branding across all views and pages.
 * Preserves exact proportions, colors, and typography of the official logo asset.
 */
export const OorcaBrandLogo: React.FC<OorcaBrandLogoProps> = ({
  size = 'md',
  asLink = true,
  className = '',
  variant = 'default',
  alt = 'OORCA — Oceanic Oil Reconnaissance, Correlation & Attribution',
}) => {
  const sizeClass = typeof size === 'string' ? SIZE_MAP[size] : '';
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const glowEffect = variant === 'glow' 
    ? 'drop-shadow-[0_0_16px_rgba(255,255,255,0.3)]' 
    : 'hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]';

  const logoElement = (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 aspect-square select-none group transition-all duration-300 ${sizeClass} ${className}`}
      style={customStyle}
    >
      <img
        src="/oorca-logo.png"
        onError={(e) => {
          // Fallback to /image.png if needed
          const target = e.currentTarget;
          if (target.src !== `${window.location.origin}/image.png`) {
            target.src = '/image.png';
          }
        }}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-[1.03] ${glowEffect}`}
        loading="eager"
      />
    </div>
  );

  if (asLink) {
    return (
      <Link 
        to="/" 
        id="nav-brand-home-link"
        className="inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg group cursor-pointer"
        title="OORCA Home — Return to Overview"
        aria-label="OORCA Home — Return to Overview"
      >
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};

export default OorcaBrandLogo;
