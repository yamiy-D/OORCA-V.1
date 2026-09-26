import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OorcaBrandLogo } from '../components/brand/OorcaBrandLogo';
import { 
  Radar, 
  ArrowLeft, 
  Database, 
  AlertTriangle, 
  Code2, 
  Radio
} from 'lucide-react';

interface ComingSoonPageProps {
  pageType: 'simulation' | 'data' | 'alerts' | 'dev';
}

interface PageMeta {
  title: string;
  tag: string;
  subtitle: string;
  codeName: string;
  description: string;
  modules: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const PAGE_METAS: Record<ComingSoonPageProps['pageType'], PageMeta> = {
  simulation: {
    title: 'Simulation',
    tag: 'TACTICAL HYDRODYNAMIC SIMULATION ENGINE',
    subtitle: 'Lagrangian Reverse-Current & Forward Oil Spill Trajectory Modeling',
    codeName: 'OORCA-SIM-CORPUS-V4',
    description: 'High-resolution ocean current particle trajectory engine computing 72-hour backward-in-time drift attribution and forward-impact dispersion against coastal marine sanctuaries.',
    modules: [
      'HYCOM & ECMWF Oceanic Current Field Integration',
      'Stochastic 100,000-Particle Lagrangian Dispersion',
      'Bathymetric Shoreline Entrainment Modeling',
      'Dynamic Vessel Wake Kelvin Envelope Intersect'
    ],
    icon: Radar,
  },
  data: {
    title: 'Data Dashboard',
    tag: 'ORBITAL METOCEAN & VESSEL TELEMETRY HUB',
    subtitle: 'Synchronized Multi-Sensor Orbital Data & AIS Telemetry Analytics',
    codeName: 'OORCA-DATA-GRID-X1',
    description: 'Unified geospatial data streaming pipeline assimilating real-time Sentinel-1 SAR imagery, global S-AIS/T-AIS vessel transponder streams, and NOAA MetOcean oceanic buoy sensor matrices.',
    modules: [
      'Real-Time Copernicus Sentinel-1A/B Ingestion Pipeline',
      'Global AIS Vessel Density & Blackout Anomaly Layer',
      'Wind Scatterometer & Wave Buoy Real-Time Mesh',
      'Environmental Sensitivity Index (ESI) Vector GIS'
    ],
    icon: Database,
  },
  alerts: {
    title: 'Alert Center',
    tag: 'GLOBAL MARITIME ESCALATION & INCIDENT TRIAGE',
    subtitle: 'Autonomous Risk Detection, Vessel Flagging & Legal Notification Feeds',
    codeName: 'OORCA-ALERTS-DISPATCH-9',
    description: 'Multi-criteria alert routing terminal triggering instantaneous automated escalations upon detection of synthetic radar backscatter dampening, nighttime AIS deactivations, and high-threat marine sanctuary drift vectors.',
    modules: [
      'Multi-Threshold SAR Slick Anomaly Flagging',
      'Dark Ship Transponder Deactivation Traps',
      'Direct Coastal Guard & Port State Dispatch Protocol',
      'Automated Forensic Snapshot Archiving'
    ],
    icon: AlertTriangle,
  },
  dev: {
    title: 'Developer Information',
    tag: 'DEVELOPER SPECIFICATIONS & API PROTOCOLS',
    subtitle: 'REST / GraphQL APIs, Webhooks & Cryptographic Evidence SDK',
    codeName: 'OORCA-DEV-SDK-REST-V2',
    description: 'Comprehensive technical documentation, cryptographic hash verification tools, and open standard APIs for coastal sovereign states, maritime legal authorities, and environmental defense organizations.',
    modules: [
      'Evidence Dossier SHA-256 Cryptographic Verification',
      'RESTful Satellite Anomaly Telemetry Endpoints',
      'Automated IOPC Fund Valuation Calculation API',
      'Custom Webhook Integrations for Coastal Sentry Drones'
    ],
    icon: Code2,
  },
};

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ pageType }) => {
  const navigate = useNavigate();
  const meta = PAGE_METAS[pageType];
  const IconComponent = meta.icon;

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-geist flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden selection:bg-white selection:text-black">
      {/* Background Subtle Ocean Grid */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      {/* Top Bar Navigation & Status */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3.5">
          <OorcaBrandLogo size="sm" asLink />
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-mono-code transition-all cursor-pointer backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Return to Overview</span>
            <span className="xs:hidden">Overview</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-code">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry Active
          </span>
          <span className="text-white/40">Build {meta.codeName}</span>
        </div>
      </div>

      {/* Main Center Console */}
      <div className="relative z-10 my-auto py-12 max-w-3xl w-full text-center flex flex-col items-center">
        
        {/* Module Icon in Sleek Ring */}
        <div className="relative mb-8 group">
          <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/20 shadow-2xl flex items-center justify-center text-white backdrop-blur-xl">
            <IconComponent className="w-10 h-10" />
          </div>
        </div>

        {/* Tactical Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/70 text-xs font-mono-code mb-5">
          <Radio className="w-3.5 h-3.5 text-white/70" />
          <span>{meta.tag}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl sm:text-6xl font-medium text-white tracking-tight leading-tight mb-4">
          {meta.title}
        </h1>

        {/* Coming Soon Notice */}
        <div className="my-2 inline-block">
          <span className="px-4 py-1.5 rounded-full text-xs font-mono-code uppercase tracking-widest bg-white text-black font-semibold shadow-md">
            Integration In Progress
          </span>
        </div>

        <p className="mt-5 text-sm sm:text-base text-white/70 font-mono-code max-w-xl">
          {meta.subtitle}
        </p>

        <p className="mt-3 text-sm text-white/50 max-w-xl leading-relaxed font-normal">
          {meta.description}
        </p>

        {/* Pipeline Specifications Grid */}
        <div className="w-full mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {meta.modules.map((mod, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors flex items-start gap-3 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 shrink-0" />
              <div>
                <span className="text-xs font-mono-code text-white/40 block mb-0.5">
                  SUBSYSTEM 0{idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-white/80 font-mono-code">
                  {mod}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Module Switcher Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-xl">
          {[
            { id: 'simulation', label: 'Simulation', path: '/simulation' },
            { id: 'pricing', label: 'Pricing', path: '/pricing' },
            { id: 'alerts', label: 'Alert Center', path: '/alerts' },
            { id: 'dev', label: 'Developer Info', path: '/dev' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                pageType === tab.id
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status indicator info strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono-code text-white/40 border-t border-white/10 pt-6 w-full">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span>Deployment Stage: Calibration & Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span>Navigation: Click or drag the floating radar command wheel</span>
          </div>
        </div>

      </div>

      {/* Footer System Line */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-white/40 border-t border-white/10 pt-6">
        <div>
          OORCA Protocol Terminal · Secure Marine Enclave
        </div>
        <div>
          Autonomous Sensor Refresh: 18s
        </div>
      </div>
    </div>
  );
};
