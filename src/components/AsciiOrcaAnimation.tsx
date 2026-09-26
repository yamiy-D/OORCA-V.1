/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, Sparkles, Flower2 } from 'lucide-react';

interface AsciiOrcaAnimationProps {
  onLaunchSimulation?: () => void;
}

interface CharSegment {
  text: string;
  color: string;
}

// STEP 1: Pre-computed High-Fidelity ASCII Blooming Flower Generator
// Replicates the exact blooming flower video in ASCII with colored cells (white, fiery orange, red, yellow, blue)
function buildBloomingFlowerFrames(): CharSegment[][][] {
  const TOTAL_FRAMES = 18;
  const W = 52;
  const H = 22;
  const allFrames: CharSegment[][][] = [];

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    // Oscillation phase: 0 (bud) -> 1 (full bloom) -> 0 (bud)
    const rawProgress = (f / TOTAL_FRAMES) * 2 * Math.PI;
    // Smooth cosine wave: 0 at start, 1 at midpoint, 0 at end
    const p = 0.5 - 0.5 * Math.cos(rawProgress);

    const frameRows: CharSegment[][] = [];

    for (let y = 0; y < H; y++) {
      const lineCells: { char: string; color: string }[] = [];

      for (let x = 0; x < W; x++) {
        // --- Stem Geometry (Curving from bottom left x=8, y=21 up to flower base x=25, y=10) ---
        const stemStartY = 10;
        let cellChar = ' ';
        let cellColor = '#000000';
        let isStem = false;
        let isFlower = false;

        if (y >= stemStartY) {
          const u = (y - stemStartY) / Math.max(1, H - 1 - stemStartY);
          const sx = 25 - 17 * Math.pow(u, 0.95);
          const dist = x - sx;

          if (dist >= -2.2 && dist <= 2.2) {
            isStem = true;
            if (dist < -1.1) {
              cellChar = ['8', '%', '#', 'M', '&'][(x + y) % 5];
              cellColor = dist < -1.6 ? '#E11D48' : '#FF6B00'; // Red & fiery orange left rim
            } else if (dist <= 1.2) {
              cellChar = ['█', '▓', 'N', 'M', '0'][(x * 3 + y) % 5];
              cellColor = '#FFFFFF'; // Bright white stem core
            } else {
              cellChar = ['!', ':', '.'][(x + y) % 3];
              cellColor = '#222222'; // Dark right edge
            }
          }
        }

        // --- Flower Blossom Geometry ---
        if (!isStem) {
          const bx = 25;
          const by = 10;

          if (p < 0.35) {
            // Trumpet bud phase (00:00 - 00:01 in video)
            const normP = p / 0.35;
            if (x >= 23 && x <= 48 && y >= 2 && y <= 15) {
              const topEdge = 3 + Math.pow((x - 36) / 11, 2) * 4 - normP * 1.5;
              const botEdge = 14 - Math.pow((x - 33) / 13, 2) * 5 + normP * 1.5;

              if (y >= topEdge && y <= botEdge) {
                isFlower = true;
                const depth = (y - topEdge) / Math.max(1, botEdge - topEdge);

                // Inner throat hollow (dark)
                if (x >= 28 && x <= 34 && y >= 7 && y <= 11) {
                  cellChar = ' ';
                  cellColor = '#000000';
                }
                // Rightmost tip blue accent
                else if (x >= 45 && y >= 8 && y <= 10 && normP < 0.5) {
                  cellChar = ['#', 'B', '0'][(x + y) % 3];
                  cellColor = '#2563EB'; // Cobalt blue
                }
                // Fiery top rim & flared petal edges
                else if (depth < 0.22 || x > 43) {
                  const isYellow = y < topEdge + 1.2;
                  cellChar = ['8', '%', '*', '#', 'M', '0'][(x * 2 + y) % 6];
                  cellColor = isYellow ? '#FACC15' : (x > 42 ? '#E11D48' : '#FF6B00');
                }
                // Solid white petal body
                else {
                  cellChar = ['█', '▓', 'N', 'M', '0'][(x + y * 2) % 5];
                  cellColor = '#FFFFFF';
                }
              }
            }
          } else {
            // Radiant blooming petal fan phase (00:02 - 00:04 in video)
            const normP = (p - 0.35) / 0.65;
            const angles = [-2.1, -1.6, -1.1, -0.6, -0.1, 0.4];
            const lengths = [
              9 + 13 * normP,
              11 + 15 * normP,
              13 + 14 * normP,
              14 + 11 * normP,
              12 + 8 * (1 - normP * 0.3),
              9 + 5 * (1 - normP * 0.5),
            ];

            for (let i = 0; i < angles.length; i++) {
              const a = angles[i];
              const len = lengths[i];
              const px = bx + Math.cos(a) * len * 1.4;
              const py = by + Math.sin(a) * len * 0.85;

              const l2 = Math.pow(px - bx, 2) + Math.pow(py - by, 2);
              let t = ((x - bx) * (px - bx) + (y - by) * (py - by)) / l2;
              t = Math.max(0, Math.min(1, t));
              const projX = bx + t * (px - bx);
              const projY = by + t * (py - by);
              const d = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
              const petalWidth = Math.sin(t * Math.PI) * (2.6 + 1.4 * normP);

              if (d <= petalWidth) {
                isFlower = true;
                if (t > 0.8) {
                  // Petal tip with fiery orange & yellow fringe
                  const isYellow = y < 4;
                  cellChar = ['8', '%', '*', '#', 'M'][(x * 2 + y) % 5];
                  cellColor = isYellow ? '#FACC15' : '#FF6B00';
                } else if (d > petalWidth * 0.72) {
                  // Red outline
                  cellChar = ['%', '#', '*', '8'][(x + y) % 4];
                  cellColor = '#E11D48';
                } else {
                  // Solid white petal flesh
                  cellChar = ['█', '▓', 'N', 'M', '0'][(x + y * 2) % 5];
                  cellColor = '#FFFFFF';
                }
                break;
              }
            }

            // Stamen center with electric blue accents
            if (!isFlower && Math.abs(x - bx) <= 2 && Math.abs(y - by) <= 2) {
              if (Math.abs(x - bx) <= 1 && Math.abs(y - by) <= 1) {
                isFlower = true;
                cellChar = ['#', 'B', '0'][(x + y) % 3];
                cellColor = '#2563EB';
              }
            }
          }
        }

        // Ambient floating particle dots
        if (!isStem && !isFlower) {
          if ((x * 17 + y * 29 + f * 7) % 89 === 0) {
            cellChar = '.';
            cellColor = 'rgba(255, 255, 255, 0.28)';
          }
        }

        lineCells.push({ char: cellChar, color: cellColor });
      }

      // Condense consecutive cells with identical color into text segments
      const segments: CharSegment[] = [];
      let curSegment: CharSegment | null = null;

      for (const c of lineCells) {
        if (!curSegment) {
          curSegment = { text: c.char, color: c.color };
        } else if (curSegment.color === c.color) {
          curSegment.text += c.char;
        } else {
          segments.push(curSegment);
          curSegment = { text: c.char, color: c.color };
        }
      }
      if (curSegment) {
        segments.push(curSegment);
      }

      frameRows.push(segments);
    }

    allFrames.push(frameRows);
  }

  return allFrames;
}

export function AsciiOrcaAnimation({ onLaunchSimulation }: AsciiOrcaAnimationProps) {
  // STEP 2: Frame Index State for Blooming Animation Cycle
  const [frameIndex, setFrameIndex] = useState(0);

  // STEP 3: Memoized Pre-Computed Animation Frames
  const flowerFrames = useMemo(() => buildBloomingFlowerFrames(), []);

  // STEP 4: Animation Timer (Cycles through blooming frames at 140ms for organic motion)
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % flowerFrames.length);
    }, 140);

    return () => clearInterval(timer);
  }, [flowerFrames.length]);

  // Current frame data
  const currentFrame = flowerFrames[frameIndex] || [];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden select-none font-mono-code bg-black">
      
      {/* Background Deep Obsidian Atmosphere */}
      <div className="absolute inset-0 bg-radial from-neutral-900/30 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 ocean-grid opacity-15 pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="relative z-10 w-full flex items-center justify-between text-[11px] text-white/70 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider text-white">ORGANIC BLOOM · ASCII ENGINE</span>
          <span className="text-[10px] text-white/40 hidden sm:inline">[MORPHING MATRIX ACTIVE]</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/50">
          <Flower2 className="w-3.5 h-3.5 text-amber-400" />
          <span>PHASE #{frameIndex + 1}/{flowerFrames.length}</span>
          <span className="text-white/20">|</span>
          <span className="text-emerald-400 font-semibold">140ms / FRAME</span>
        </div>
      </div>

      {/* STEP 5: Selected Element 2 (CSS selector 2: Central Animated ASCII Flower Canvas Container) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full my-auto py-1 overflow-hidden">
        
        {/* Subtle Ambient Radial Backlight Glow */}
        <div 
          className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-blue-500/10 blur-2xl pointer-events-none"
        />

        {/* STEP 6: Selected Element 1 (CSS selector 1: Pre Element Rendering the Animated ASCII Blooming Flower) */}
        <pre 
          id="ascii-blooming-flower-canvas"
          className="text-[8px] sm:text-[9.5px] md:text-[11px] leading-[1.08] font-mono select-none overflow-hidden drop-shadow-[0_0_14px_rgba(255,255,255,0.3)] transition-all"
          style={{
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
          }}
        >
          {currentFrame.map((row, rIdx) => (
            <div key={rIdx} className="whitespace-pre flex justify-center">
              {row.map((seg, sIdx) => (
                <span key={sIdx} style={{ color: seg.color }}>
                  {seg.text}
                </span>
              ))}
            </div>
          ))}
        </pre>

      </div>

      {/* Bottom Interactive Launch Bar */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-white/70">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white tracking-wide">Botanical Bloom Matrix</span>
          <span className="text-white/50 text-[10px]">· Real-Time ASCII Kinetic Art</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-medium transition-all group-hover:scale-105 shadow-sm">
          <span>Enter Simulation</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

    </div>
  );
}

// =========================================================================
// STEP 7: PREVIOUS ORCA ASCII FRAMES & ANIMATION (COMMENTED OUT FOR EASY UPDATE LATER)
// =========================================================================
/*
const PREVIOUS_ORCA_FRAMES = [
  `
               . : * : .
                 : . :
                    .-.
                   /   \\
                  /     \\
         .-""""-. /       \\
       .'  (o)   '         \\                   _
      /                     \\                 / \\
     :   .-.                 \\               /   ;
    /   (   )                 '.            /   /
   :     '-'                    '-._______.'   /
   |                                          /
   :                                         /
    \\       .---.                          .'
     '.    /     \\                      .-'
       '--'       '--------------------'
  `
];
*/
