import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingNav.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { 
    id: 'Home', 
    label: 'Home',
    path: '/', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ) 
  },
  { 
    id: 'Sim', 
    label: 'Simulation',
    path: '/simulation', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ) 
  },
  { 
    id: 'Pricing', 
    label: 'Pricing',
    path: '/pricing', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ) 
  },
  { 
    id: 'Alerts', 
    label: 'Alert Center',
    path: '/alerts', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ) 
  },
  { 
    id: 'Dev', 
    label: 'Developer Info',
    path: '/dev',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ) 
  }
];

export default function FloatingNavigationBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDraggingActive, setIsDraggingActive] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>('Home');
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const isPointerDown = useRef<boolean>(false);
  const isDragging = useRef<boolean>(false);
  const dragStartCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync active page with current route
  useEffect(() => {
    const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname);
    if (currentItem) {
      setActivePage(currentItem.id);
    }
  }, [location.pathname]);

  // Keep within bounds on window resize
  const clampPosition = useCallback((x: number, y: number) => {
    const pad = 44;
    const safeX = Math.max(pad, Math.min(window.innerWidth - pad, x));
    const safeY = Math.max(pad, Math.min(window.innerHeight - pad, y));
    return { x: safeX, y: safeY };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const savedPos = localStorage.getItem('marine-intel-nav-pos');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        setPosition(clampPosition(parsed.x, parsed.y));
      } catch {
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight - 75 });
      }
    } else {
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight - 75 });
    }

    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clampPosition]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button or touch
    isPointerDown.current = true;
    isDragging.current = false;
    dragStartCoords.current = { x: e.clientX, y: e.clientY };
    if (bubbleRef.current) {
      bubbleRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !bubbleRef.current) return;
    const dx = e.clientX - dragStartCoords.current.x;
    const dy = e.clientY - dragStartCoords.current.y;
    const distance = Math.hypot(dx, dy);

    // Only enter dragging mode if displaced by more than 8 pixels
    if (!isDragging.current && distance > 8) {
      isDragging.current = true;
      setIsDraggingActive(true);
      setIsOpen(false); 
    }

    if (isDragging.current) {
      setPosition((prev) => clampPosition(prev.x + dx, prev.y + dy));
      dragStartCoords.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    if (bubbleRef.current && bubbleRef.current.hasPointerCapture(e.pointerId)) {
      bubbleRef.current.releasePointerCapture(e.pointerId);
    }

    if (isDragging.current) {
      localStorage.setItem('marine-intel-nav-pos', JSON.stringify(position));
    } else {
      // Deterministic click toggle: immune to cursor jitter
      setIsOpen((prev) => !prev);
    }

    isDragging.current = false;
    setIsDraggingActive(false);
  };

  const handleNavigate = (e: React.MouseEvent, item: NavItem) => {
    e.stopPropagation();
    setActivePage(item.id);
    setIsOpen(false);
    navigate(item.path);
  };

  if (!isMounted) return null;

  // Semicircular arc metrics
  // If bubble is near top of screen (y < 160), fan downwards (20° to 160°)
  // Otherwise fan upwards (-160° to -20°)
  const isNearTop = position.y < 160;
  const startAngleDeg = isNearTop ? 20 : -160;
  const endAngleDeg = isNearTop ? 160 : -20;
  const RADIUS = 110; 

  return (
    <>
      {/* Click-outside backdrop to dismiss when open */}
      {isOpen && (
        <div 
          className="marine-nav-backdrop"
          onClick={() => setIsOpen(false)} 
        />
      )}

      <div 
        id="floating-marine-nav"
        className="marine-nav-wrapper" 
        style={{ left: position.x, top: position.y }}
      >
        {NAV_ITEMS.map((item, index) => {
          // Calculate dynamic angle along the semicircle arc
          const step = (endAngleDeg - startAngleDeg) / (NAV_ITEMS.length - 1);
          const currentAngleDeg = startAngleDeg + index * step;
          const angleRad = currentAngleDeg * (Math.PI / 180);

          const itemX = isOpen ? Math.cos(angleRad) * RADIUS : 0;
          const itemY = isOpen ? Math.sin(angleRad) * RADIUS : 0;

          return (
            <div
              key={item.id}
              id={`nav-item-${item.id.toLowerCase()}`}
              className={`nav-item ${activePage === item.id ? 'active' : ''} ${isOpen ? 'open' : ''}`}
              style={{
                transform: `translate(calc(-50% + ${itemX}px), calc(-50% + ${itemY}px)) scale(${isOpen ? 1 : 0})`,
                opacity: isOpen ? 1 : 0,
                transitionDelay: isOpen ? `${index * 0.04}s` : '0s'
              }}
              onClick={(e) => handleNavigate(e, item)}
              title={item.label}
            >
              <div className="nav-item-inner">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-tooltip">{item.label}</span>
              </div>
            </div>
          );
        })}

        <div
          ref={bubbleRef}
          id="marine-nav-main-bubble"
          className={`main-bubble ${isDraggingActive ? 'dragging' : ''} ${isOpen ? 'open' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title={isOpen ? "Close Command Wheel" : "Open Command Wheel (Drag anywhere to reposition)"}
        >
          {/* STEP 1: Main Radar SVG Icon (Selector 1) with High-Visibility Crisp 2px Stroke */}
          <svg 
            className={`radar-icon ${isOpen ? 'rotate' : ''}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <circle cx="12" cy="12" r="3" fill={isOpen ? "currentColor" : "none"} />
          </svg>
        </div>
      </div>
    </>
  );
}

