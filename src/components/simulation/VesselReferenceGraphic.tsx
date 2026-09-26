/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getVesselHeatmapSvgHtml } from '../../utils/vesselHeatmapGraphic';

interface VesselReferenceGraphicProps {
  headingDeg?: number;
  width?: number;
  height?: number;
  showBreachIndicator?: boolean;
}

/**
 * Exact vector replica of the reference vessel with red-orange thermal dispersion heatmap:
 * - High-concentration red core hugging the hull
 * - Intermediate red-orange transition
 * - Outer orange ruffled sheen contour
 * - High-contrast crisp white hull contour
 * - Internal steel cargo tank bays and ruptured Tank #3
 */
export function VesselReferenceGraphic({
  headingDeg = 45,
  width = 180,
  height = 100,
}: VesselReferenceGraphicProps) {
  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      dangerouslySetInnerHTML={{ __html: getVesselHeatmapSvgHtml(headingDeg, width, height) }}
    />
  );
}
