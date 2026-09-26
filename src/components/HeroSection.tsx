import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OorcaBrandLogo } from './brand/OorcaBrandLogo';
import { 
  Radar, 
  Satellite, 
  Waves, 
  Compass, 
  ShieldAlert, 
  ArrowRight, 
  ChevronDown, 
  Activity, 
  ArrowUpRight, 
  Play 
} from 'lucide-react';
// STEP 1: Animated ASCII Orca Component
import { AsciiOrcaAnimation } from './AsciiOrcaAnimation';

interface HeroSectionProps {
  onExploreClick: () => void;
  onPipelineClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onPipelineClick,
}) => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // STEP A: Telemetry State (Kept for easy re-enabling or telemetry reference)
  // ---------------------------------------------------------------------------
  const [activeTelemetry, setActiveTelemetry] = useState({
    sarScan: 'PASS_142_ORBITAL_SYNCHRONIZED',
    confidence: '96.4%',
    vesselsTracked: '1,248',
    currentWind: '18.2 kts NE',
    wavePeriod: '6.4s / 1.8m',
    lat: '23° 24\' 36" N',
    lng: '59° 49\' 12" E',
  });

  // STEP B: Active Mode State (Commented out / defaulted for easy update)
  // const [activeMode, setActiveMode] = useState<'RADAR' | 'SAR' | 'METOCEAN'>('RADAR');

  useEffect(() => {
    const interval = setInterval(() => {
      const randomWind = (17 + Math.random() * 2).toFixed(1);
      setActiveTelemetry((prev) => ({
        ...prev,
        currentWind: `${randomWind} kts NE`,
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handler to open the simulation page when the window is clicked
  const handleOpenSimulation = () => {
    navigate('/simulation');
  };

  return (
    <section 
      id="hero-section"
      className="relative min-h-screen w-full bg-black text-white font-geist overflow-hidden flex flex-col justify-between pt-6 pb-12 px-6 md:px-12 lg:px-16 border-b border-white/10"
    >
      {/* MotionSites Looping Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 mix-blend-luminosity z-0"
        style={{ objectPosition: '70% center' }}
      >
        <source 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* Measured Dark Contrast Scrims & Hairline Grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 z-0 pointer-events-none" />
      <div className="absolute inset-0 ocean-grid opacity-30 z-0 pointer-events-none" />

      {/* Top Navbar / Telemetry Zone (z-30) */}
      <header className="relative z-30 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <OorcaBrandLogo size="md" asLink variant="default" />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                OORCA
              </span>
              <span className="text-[11px] font-mono-code text-white/50 tracking-wider uppercase">
                Station Ver 4.2
              </span>
            </div>
            <p className="text-xs text-white/60 font-geist">
              Marine Environmental Intelligence & Liability Platform
            </p>
          </div>
        </div>

        {/* Global Sensor Readouts (Unboxed / hairline telemetry) */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-white/70">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90">Sentinel-1C Live</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-white/70" />
            <span>HYCOM Synced</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>7 Active Alerts</span>
          </div>
        </div>
      </header>

      {/* Main Hero Content (z-10) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: MotionSites Hero Staggered Typography */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-white/90 w-fit mb-5 animate-[fadeSlideUp_0.8s_ease_0.2s_both] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="tracking-wide">Autonomous Geospatial Intelligence</span>
          </div>

          {/* Heading h1: MotionSites style large leading, line breaks, tight tracking */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-[1.08] mb-6 animate-[fadeSlideUp_0.8s_ease_0.4s_both]">
            Intelligence beneath <br className="hidden sm:block" />
            the surface, <br className="hidden sm:block" />
            <span className="text-white/70">accountability above it.</span>
          </h1>

          {/* Paragraph */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/70 max-w-xl mb-8 animate-[fadeSlideUp_0.8s_ease_0.7s_both]">
            OORCA transforms satellite radar, AIS kinematics, and ocean hydrodynamic drift physics into 
            verifiable legal accountability. Autonomously detecting marine oil spills, attributing suspect vessels 
            through deliberate AIS blackouts, and calculating IOPC Fund liability.
          </p>

          {/* CTAs: MotionSites Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8 animate-[fadeSlideUp_0.8s_ease_0.9s_both]">
            <button
              id="hero-explore-cta"
              onClick={onExploreClick}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:scale-105 transition-transform inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-pipeline-cta"
              onClick={onPipelineClick}
              className="rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 px-6 py-3 text-sm font-medium transition-all inline-flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer hover:border-white/30"
            >
              <Compass className="w-4 h-4 text-white/80" />
              <span>Forensic Pipeline</span>
            </button>
          </div>

          {/* 3 Discrete Architecture Capabilities */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="py-2 flex flex-col">
              <span className="text-white/40 font-mono-code">01 / DETECTION</span>
              <span className="text-white/90 font-medium mt-0.5">Satellite SAR</span>
            </div>
            <div className="py-2 flex flex-col">
              <span className="text-white/40 font-mono-code">02 / ATTRIBUTION</span>
              <span className="text-white/90 font-medium mt-0.5">AIS Kinematics</span>
            </div>
            <div className="py-2 flex flex-col">
              <span className="text-white/40 font-mono-code">03 / DISPERSION</span>
              <span className="text-white/90 font-medium mt-0.5">Lagrangian Drift</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Precision Obsidian Command Console (Cleared & Interactive Simulation Portal) */}
        <div className="lg:col-span-6 relative">
          {/* Main interactive window container - clicking opens the simulation page */}
          <div 
            onClick={handleOpenSimulation}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenSimulation();
              }
            }}
            aria-label="Open Interactive Oil Spill Simulation Page"
            className="group cursor-pointer relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-neutral-950/95 border border-white/15 hover:border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.18)] transition-all duration-300 flex flex-col backdrop-blur-2xl text-left select-none"
            title="Click anywhere to open Simulation page"
          >
            {/* =========================================================================
                STEP 1: CONSOLE HEADER BAR (COMMENTED OUT FOR EASY UPDATE LATER)
                ========================================================================= */}
            {/*
            <div className="h-10 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-mono-code text-white/80 z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-white font-medium tracking-wider">RADAR SENSOR FEED [ARABIAN SEA]</span>
              </div>
              <div className="flex items-center gap-1.5 p-0.5 bg-black/60 rounded-md border border-white/10">
                <button 
                  onClick={() => setActiveMode('RADAR')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${activeMode === 'RADAR' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                >
                  Radar
                </button>
                <button 
                  onClick={() => setActiveMode('SAR')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${activeMode === 'SAR' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                >
                  SAR
                </button>
                <button 
                  onClick={() => setActiveMode('METOCEAN')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${activeMode === 'METOCEAN' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                >
                  Drift
                </button>
              </div>
            </div>
            */}

            {/* Clean, minimalist simulation portal top bar */}
            <div className="h-10 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-mono-code text-white/80 z-20 group-hover:bg-white/[0.08] transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-medium tracking-wider">SIMULATION SYSTEM · READY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-white/70 group-hover:text-white transition-colors">
                <span className="hidden sm:inline">Click to launch</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Cleared Visual Container with Clean Simulation Launch Portal */}
            <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              
              {/* STEP 2: Selected Element 1 (CSS selector 1: Ambient Backdrop Grid) */}
              <div className="absolute inset-0 ocean-grid opacity-30 group-hover:opacity-45 transition-opacity pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-emerald-950/20 via-transparent to-black pointer-events-none" />

              {/* =========================================================================
                  STEP 2: DENSE OCEAN COORDINATE GRID & BATHYMETRIC CONTOURS (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute inset-0 ocean-grid-dense opacity-30" />
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50,80 Q200,40 450,110 T950,90" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" />
                <path d="M-50,160 Q220,130 500,200 T1000,170" fill="none" stroke="#ffffff" strokeWidth="1" />
                <path d="M-50,260 Q180,240 440,290 T980,250" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="4 4" />
                <path d="M-50,340 Q300,310 600,370 T1050,330" fill="none" stroke="#ffffff" strokeWidth="1.2" />
              </svg>
              */}

              {/* =========================================================================
                  STEP 3: CONCENTRIC RADAR RINGS & SWEEPING BEAM (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[340px] sm:w-[400px] h-[340px] sm:h-[400px] rounded-full border border-white/10">
                  <div className="absolute inset-[18%] rounded-full border border-white/5" />
                  <div className="absolute inset-[36%] rounded-full border border-white/5" />
                  <div className="absolute inset-[54%] rounded-full border border-white/10" />
                  <div className="absolute inset-[72%] rounded-full border border-white/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
                  <div 
                    className="absolute inset-0 rounded-full animate-radar origin-center pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(255, 255, 255, 0.04) 330deg, rgba(255, 255, 255, 0.22) 360deg)',
                    }}
                  />
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 4: SATELLITE LASER SCANNER LINE (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.7)] animate-satellite-scan pointer-events-none z-10" />
              */}

              {/* =========================================================================
                  STEP 5: SIMULATED OIL SPILL SLICK ZONE (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute top-[38%] left-[42%] w-36 h-28 pointer-events-auto group cursor-pointer">
                <div className="absolute inset-0 rounded-full bg-rose-500/10 border border-rose-500/30 animate-ping-slow" />
                <svg className="w-full h-full filter drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" viewBox="0 0 140 110">
                  <defs>
                    <linearGradient id="slickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18181b" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#881337" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 20,45 Q 35,15 65,22 Q 105,30 115,55 Q 125,85 85,95 Q 45,102 25,80 Z" 
                    fill="url(#slickGrad)" 
                    stroke="#f43f5e" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2"
                  />
                  <circle cx="68" cy="54" r="14" fill="#991b1b" opacity="0.85" />
                  <circle cx="68" cy="54" r="6" fill="#f43f5e" />
                </svg>
                <div className="absolute -top-7 -left-10 px-2 py-0.5 rounded bg-black/90 border border-rose-500/60 text-[10px] font-mono-code text-rose-300 shadow-md whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Slick: 420 bbl · SAR Conf 96.4%</span>
                </div>
                <div className="absolute top-[50%] left-[80%] flex items-center gap-1 text-[10px] font-mono-code text-white/70">
                  <div className="w-10 h-[1px] bg-white/40" />
                  <span className="text-[9px]">065° NE (1.4 kt)</span>
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 6: SUSPECT VESSEL MT AURA PACIFIC & AIS HISTORICAL TRACK (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute top-[28%] left-[58%] pointer-events-auto group">
                <div className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
                  <span className="absolute w-5 h-5 rounded-full bg-amber-400/20 animate-ping" />
                  <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 border border-black shadow-[0_0_8px_#f59e0b]" />
                </div>
                <svg className="absolute -top-12 -left-28 w-36 h-20 pointer-events-none" viewBox="0 0 144 80">
                  <path 
                    d="M 5,75 Q 40,55 80,45 T 116,28" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="1.2" 
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                </svg>
                <div className="absolute top-5 -left-16 px-2.5 py-1.5 rounded-lg bg-black/90 border border-amber-500/50 text-[10px] font-mono-code text-amber-200 whitespace-nowrap shadow-xl backdrop-blur-md">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    MT AURA PACIFIC [PANAMA]
                  </div>
                  <div className="text-[9px] text-white/50">IMO 9482110 · Speed: 3.4 kts</div>
                  <div className="text-[9px] text-rose-400 font-medium">Suspicious AIS Gap: 4.2h</div>
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 7: OTHER ACTIVE AIS VESSELS (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute top-[68%] left-[24%]">
                <div className="w-2 h-2 bg-white/80 rotate-45" />
                <div className="absolute top-3 -left-8 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono-code text-white/60 whitespace-nowrap">
                  MV Nordic Trader (18.2 kt)
                </div>
              </div>
              <div className="absolute top-[18%] left-[22%]">
                <div className="w-2 h-2 bg-white/80 rotate-45" />
                <div className="absolute top-3 -left-8 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono-code text-white/60 whitespace-nowrap">
                  MT Ocean Harvest (8.6 kt)
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 8: MARINE PROTECTED SANCTUARY ZONE OVERLAY (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute bottom-5 right-5 p-2.5 rounded-lg bg-black/85 border border-white/15 text-[10px] font-mono-code text-white/80 max-w-[200px] backdrop-blur-md">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <Waves className="w-3 h-3 text-white/80" />
                  <span>MPA Sanctuary Zone</span>
                </div>
                <div className="text-[9px] text-white/50 mt-0.5">
                  Ras Al Hadd Sea Turtle Reserve
                </div>
                <div className="text-[9px] text-amber-300 font-medium mt-1">
                  Drift ETA: 28.5h
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 9: BOTTOM TELEMETRY FLOATING STRIP (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 text-[10px] font-mono-code text-white/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span>Lat: {activeTelemetry.lat}</span>
                  <span className="hidden sm:inline">Lon: {activeTelemetry.lng}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/90">Wind: {activeTelemetry.currentWind}</span>
                  <span className="hidden sm:inline text-white/60">Wave: {activeTelemetry.wavePeriod}</span>
                  <span className="text-rose-400 font-medium">Slick #AR-09</span>
                </div>
              </div>
              */}

              {/* =========================================================================
                  STEP 3: PREVIOUS SIMULATION GATEWAY HERO CONTENT (COMMENTED OUT FOR EASY UPDATE LATER)
                  ========================================================================= */}
              {/*
              <div className="relative z-10 flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1 group-hover:text-emerald-400 group-hover:fill-emerald-400 transition-colors" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono-code text-white/90 mb-3 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CLICK TO OPEN SIMULATION PAGE</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
                  Interactive Oil Spill Simulation
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mb-5">
                  Launch the real-time hydrodynamic drift engine, Lagrangian trajectory physics, and suspect vessel attribution model.
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs sm:text-sm font-medium hover:bg-neutral-200 transition-colors shadow-lg">
                  <span>Open Simulation Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              */}

              {/* STEP 4: Selected Element 2 (CSS selector 2: Animated ASCII Orca Active State) */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <AsciiOrcaAnimation onLaunchSimulation={handleOpenSimulation} />
              </div>

            </div>

            {/* =========================================================================
                STEP 10: LIVE COMMAND FOOTER BAR (COMMENTED OUT FOR EASY UPDATE LATER)
                ========================================================================= */}
            {/*
            <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs font-mono-code">
              <div className="flex items-center gap-2 text-white/50 text-[11px]">
                <Satellite className="w-3.5 h-3.5 text-white/80" />
                <span>Sentinel-1C C-SAR Band · Sub-Meter Resolution</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Attribution Score: 91.8%</span>
              </div>
            </div>
            */}

            {/* Clean footer bar indicating destination */}
            <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs font-mono-code text-white/60">
              <span className="text-[11px]">Target: /simulation</span>
              <span className="text-[11px] text-white/80 group-hover:text-emerald-400 transition-colors">
                Interactive Workspace →
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Subdued Indicator */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono-code text-white/50">
        <div className="flex items-center gap-3">
          <span className="text-white/80">01 / Overview</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-white/60">Empirical Ocean Intelligence</span>
        </div>
        <button 
          onClick={onExploreClick}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </footer>

    </section>
  );
};
