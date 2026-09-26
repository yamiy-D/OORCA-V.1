/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface UseDraggableOptions {
  initialPosition?: { x: number; y: number };
  onFocus?: () => void;
}

export function useDraggablePanel({
  initialPosition = { x: 20, y: 20 },
  onFocus,
}: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<{ x: number; y: number }>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    startX: 0,
    startY: 0,
    originX: initialPosition.x,
    originY: initialPosition.y,
  });

  const clampPosition = useCallback((x: number, y: number) => {
    const panel = panelRef.current;
    const parent = panel?.parentElement;
    
    const parentWidth = parent ? parent.clientWidth : window.innerWidth;
    const parentHeight = parent ? parent.clientHeight : window.innerHeight;
    const panelWidth = panel ? panel.offsetWidth : 360;
    const panelHeight = panel ? panel.offsetHeight : 240;

    const minX = 8;
    const maxX = Math.max(minX, parentWidth - panelWidth - 8);
    const minY = 8;
    const maxY = Math.max(minY, parentHeight - panelHeight - 8);

    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  }, []);

  // Clamp on initial mount once dimensions are measured
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    }, 50);
    return () => clearTimeout(timeout);
  }, [clampPosition]);

  // Clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Don't drag if user clicked interactive elements
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('a') ||
      target.closest('[data-no-drag="true"]')
    ) {
      return;
    }

    e.preventDefault();
    onFocus?.();
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  }, [position, onFocus]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const rawX = dragStartRef.current.originX + deltaX;
    const rawY = dragStartRef.current.originY + deltaY;

    const clamped = clampPosition(rawX, rawY);
    setPosition(clamped);
  }, [isDragging, clampPosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  }, [isDragging]);

  return {
    panelRef,
    position,
    setPosition,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
