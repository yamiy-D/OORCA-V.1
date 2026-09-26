import React, { useState } from 'react';
import { 
  Satellite, 
  Cpu, 
  Ship, 
  Waves, 
  MapPin, 
  Scale, 
  Share2, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { TECHNOLOGY_NODES } from '../data/mockData';

export const TechnologyBehindSection: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('ai-engine');

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Satellite':
        return <Satellite className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Ship':
        return <Ship className="w-5 h-5" />;
      case 'Waves':
        return <Waves className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const activeNode = TECHNOLOGY_NODES.find((n) => n.id === activeNodeId) || TECHNOLOGY_NODES[1];

  const nodePositions: Record<string, { x: number; y: number }> = {
    'sat-intel': { x: 180, y: 90 },
    'ai-engine': { x: 420, y: 110 },
    'vessel-tracking': { x: 680, y: 90 },
    'metocean-data': { x: 660, y: 310 },
    'geospatial-engine': { x: 190, y: 310 },
    'liability-engine': { x: 430, y: 340 },
  };

  return (
    <section 
      id="technology-behind"
      className="relative w-full py-28 px-6 md:px-12 lg:px-16 bg-black text-white font-geist border-b border-white/10 overflow-hidden"
    >
      {/* Background Grids */}
      <div className="absolute inset-0 ocean-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 text-xs font-mono-code mb-5">
            <Share2 className="w-3.5 h-3.5" />
            <span>03 / Convergent Sensor & Model Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
            Technology behind OORCA.
          </h2>
          <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed">
            A unified analytical pipeline integrating remote sensing satellite data (SAR and EO imagery), slick characterisation, oceanographic and meteorological drift modeling, historic AIS traffic reconstruction, and multi-factor suspect vessel attribution.
          </p>
        </div>

        {/* Network Graph Visualizer & Interactive Node Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Center: Interactive Constellation Network Visualization */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl bg-neutral-950 border border-white/15 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-md">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between text-xs font-mono-code text-white/70 z-10">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Neural Data Topology · 6 Convergent Nodes
                </span>
                <span className="text-white/40">Latency: &lt;1.2ms</span>
              </div>

              {/* Connected Lines SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 850 440">
                {TECHNOLOGY_NODES.map((node) => {
                  const sourcePos = nodePositions[node.id];
                  if (!sourcePos) return null;
                  return node.connectedNodeIds.map((targetId) => {
                    const targetPos = nodePositions[targetId];
                    if (!targetPos) return null;
                    const isHighlit = node.id === activeNodeId || targetId === activeNodeId;
                    return (
                      <g key={`${node.id}-${targetId}`}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={isHighlit ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'}
                          strokeWidth={isHighlit ? 2 : 1}
                          strokeDasharray={isHighlit ? 'none' : '4 4'}
                          opacity={isHighlit ? 0.9 : 0.4}
                        />
                        {isHighlit && (
                          <circle r="2.5" fill="#ffffff">
                            <animateMotion
                              path={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  });
                })}
              </svg>

              {/* Render Nodes */}
              <div className="relative w-full h-full">
                {TECHNOLOGY_NODES.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  const isActive = node.id === activeNodeId;
                  const isConnected = activeNode.connectedNodeIds.includes(node.id);

                  const left = (pos.x / 850) * 100;
                  const top = (pos.y / 440) * 100;

                  return (
                    <div
                      key={node.id}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      onClick={() => setActiveNodeId(node.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    >
                      {isActive && (
                        <div className="absolute -inset-2.5 rounded-full bg-white/20 animate-ping" />
                      )}

                      {/* Node Icon Box */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                        isActive
                          ? 'bg-white text-black border-white shadow-xl scale-110'
                          : isConnected
                          ? 'bg-white/10 text-white border-white/40 shadow-md'
                          : 'bg-black/80 text-white/60 border-white/15 hover:border-white/40 hover:text-white'
                      }`}>
                        {getNodeIcon(node.icon)}
                      </div>

                      {/* Node Label Below */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded bg-black/90 border border-white/15 text-[10px] font-mono-code whitespace-nowrap text-white/70 group-hover:text-white transition-colors">
                        {node.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Instructions */}
              <div className="flex items-center justify-between text-[11px] font-mono-code text-white/40 z-10 pt-3 border-t border-white/10">
                <span>Select any node to inspect data flow</span>
                <span>Active Telemetry</span>
              </div>

            </div>
          </div>

          {/* Right: Active Node Detail Dossier Panel */}
          <div className="lg:col-span-5">
            <div className="p-7 sm:p-8 rounded-xl bg-white/[0.03] border border-white/15 shadow-xl backdrop-blur-sm">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-code text-white/50 uppercase tracking-wider">
                  {activeNode.category}
                </span>
                <span className="text-xs font-mono-code text-white/40">
                  Node #{activeNode.id}
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                  {getNodeIcon(activeNode.icon)}
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                  {activeNode.name}
                </h3>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6 font-normal">
                {activeNode.description}
              </p>

              {/* Specifications List */}
              <div className="mb-6 space-y-2">
                <span className="text-xs font-mono-code text-white/50 block uppercase tracking-wider">
                  Technical Specifications
                </span>
                {activeNode.specs.map((spec, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono-code text-white/80 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/80" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {/* Connected Streams */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs font-mono-code text-white/40 block mb-2.5">
                  Connected Data Streams
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeNode.connectedNodeIds.map((targetId) => {
                    const targetNode = TECHNOLOGY_NODES.find((n) => n.id === targetId);
                    return (
                      <button
                        key={targetId}
                        onClick={() => setActiveNodeId(targetId)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-mono-code text-white/80 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{targetNode?.name || targetId}</span>
                        <ArrowRight className="w-3 h-3 text-white/50" />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Transition CTA */}
        <div className="mt-14 flex items-center justify-start">
          <a
            href="#core-capabilities"
            className="rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 px-5 py-2.5 text-xs font-medium transition-all inline-flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:border-white/30"
          >
            <span>Proceed to Core Intelligence Engines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
