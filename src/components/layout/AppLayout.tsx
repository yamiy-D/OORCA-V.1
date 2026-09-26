/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingNavigationBubble from '../FloatingNavigationBubble';
import { GlobalHeader } from './GlobalHeader';

/**
 * Shared Application Layout
 * Ensures global branding, official OORCA logo, and floating wheel navigation
 * are consistently present across existing and future pages.
 */
export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Pages that render their own specialized headers:
  const hasCustomHeader = ['/', '/simulation', '/pricing', '/alerts', '/data', '/dev'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white font-geist flex flex-col selection:bg-white selection:text-black">
      {/* Draggable futuristic command-center floating navigation bubble (wheel navigation) */}
      <FloatingNavigationBubble />

      {/* Default Global Header for any other page */}
      {!hasCustomHeader && (
        <GlobalHeader 
          pageTitle="OORCA Intelligence System" 
          badgeText="STATION VER 4.2"
        />
      )}

      {/* Page Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
