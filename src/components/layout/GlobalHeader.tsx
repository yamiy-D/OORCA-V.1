/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OorcaBrandLogo } from '../brand/OorcaBrandLogo';

export interface GlobalHeaderProps {
  pageTitle?: string;
  badgeText?: string;
  showSubtitle?: boolean;
  rightControls?: React.ReactNode;
  className?: string;
}

/**
 * Standard Global Header for OORCA views.
 * Houses official OORCA brand identity in the top-left corner,
 * ensuring consistent navigation back to Home while preserving wheel navigation.
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  pageTitle,
  badgeText = 'COMMAND VER 4.2',
  showSubtitle = true,
  rightControls,
  className = '',
}) => {
  return (
    <header 
      id="oorca-global-header"
      className={`relative z-30 h-14 sm:h-16 w-full bg-black/90 border-b border-white/10 px-6 md:px-12 flex items-center justify-between backdrop-blur-xl shrink-0 select-none font-geist ${className}`}
    >
      {/* Top Left Branding: Clickable Official OORCA Logo */}
      <div className="flex items-center gap-3.5">
        <OorcaBrandLogo size="sm" asLink />

        <div className="h-5 w-[1px] bg-white/10 hidden xs:block" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            {pageTitle ? (
              <span className="text-sm sm:text-base font-medium text-white tracking-tight">
                {pageTitle}
              </span>
            ) : (
              <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                OORCA
              </span>
            )}
            
            {badgeText && (
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] uppercase font-mono-code tracking-widest text-white/50 bg-white/5 border border-white/10 rounded">
                {badgeText}
              </span>
            )}
          </div>

          {showSubtitle && (
            <span className="hidden md:inline-block text-[10px] text-white/40 font-mono-code leading-none mt-0.5">
              Marine Environmental Intelligence & Liability Platform
            </span>
          )}
        </div>
      </div>

      {/* Right Controls / Actions */}
      {rightControls && (
        <div className="flex items-center gap-3">
          {rightControls}
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;
