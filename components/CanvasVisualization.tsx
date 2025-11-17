'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Point, Particle } from '@/lib/pso-engine';

interface CanvasVisualizationProps {
  points: Point[];
  particles: Particle[];
  globalBest: number[];
  showParticles: boolean;
  showGlobalBest: boolean;
  animationSpeed: number;
  isPlaying: boolean;
  className?: string;
}

interface ParticleTrail {
  x: number;
  y: number;
  alpha: number;
}

export const CanvasVisualization: React.FC<CanvasVisualizationProps> = ({
  points,
  particles,
  globalBest,
  showParticles,
  showGlobalBest,
  animationSpeed,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(60);
  const particleTrails = useRef<Map<number, ParticleTrail[]>>(new Map());
  const lastFrameTime = useRef(Date.now());
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    const warehouseIdx = points.findIndex(p => p.isWarehouse);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Calculate FPS
      frameCount.current++;
      const now = Date.now();
      if (now - lastFrameTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate bounds for scaling
      const padding = 50;
      const xValues = points.map(p => p.x);
      const yValues = points.map(p => p.y);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      
      const scaleX = (width - 2 * padding) / (maxX - minX || 1);
      const scaleY = (height - 2 * padding) / (maxY - minY || 1);
      const scale = Math.min(scaleX, scaleY);

      const toCanvasX = (x: number) => padding + (x - minX) * scale;
      const toCanvasY = (y: number) => padding + (y - minY) * scale;

      // Draw particle trails (fading)
      if (showParticles && isPlaying) {
        particleTrails.current.forEach((trails, particleIdx) => {
          const updatedTrails = trails.filter(trail => {
            trail.alpha *= 0.95; // Fade out
            return trail.alpha > 0.01;
          });
          
          updatedTrails.forEach(trail => {
            ctx.fillStyle = `rgba(147, 51, 234, ${trail.alpha})`;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          
          particleTrails.current.set(particleIdx, updatedTrails);
        });
      }

      // Draw global best route
      if (showGlobalBest && globalBest.length > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        
        // Start from warehouse
        if (warehouseIdx >= 0) {
          const warehouse = points[warehouseIdx];
          ctx.moveTo(toCanvasX(warehouse.x), toCanvasY(warehouse.y));
          
          // Draw path through all points
          globalBest.forEach(idx => {
            const point = points[idx];
            ctx.lineTo(toCanvasX(point.x), toCanvasY(point.y));
          });
          
          // Return to warehouse
          ctx.lineTo(toCanvasX(warehouse.x), toCanvasY(warehouse.y));
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw particles
      if (showParticles) {
        particles.forEach((particle, particleIdx) => {
          const route = [warehouseIdx, ...particle.position, warehouseIdx];
          
          // Draw particle route (faint)
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          route.forEach((pointIdx, i) => {
            if (pointIdx < 0 || pointIdx >= points.length) return;
            const point = points[pointIdx];
            const x = toCanvasX(point.x);
            const y = toCanvasY(point.y);
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          
          ctx.stroke();

          // Draw particle position (current point in route)
          if (isPlaying) {
            const currentRouteIdx = Math.floor((Date.now() * animationSpeed / 1000) % route.length);
            const pointIdx = route[currentRouteIdx];
            
            if (pointIdx >= 0 && pointIdx < points.length) {
              const point = points[pointIdx];
              const x = toCanvasX(point.x);
              const y = toCanvasY(point.y);
              
              // Add to trail
              if (!particleTrails.current.has(particleIdx)) {
                particleTrails.current.set(particleIdx, []);
              }
              particleTrails.current.get(particleIdx)!.push({ x, y, alpha: 0.6 });
              
              // Limit trail length
              const trails = particleTrails.current.get(particleIdx)!;
              if (trails.length > 20) {
                trails.shift();
              }
              
              // Draw particle
              ctx.fillStyle = '#8b5cf6';
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
              
              // Outer glow
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(x, y, 7, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        });
      }

      // Draw delivery points
      points.forEach((point, idx) => {
        const x = toCanvasX(point.x);
        const y = toCanvasY(point.y);

        if (point.isWarehouse) {
          // Warehouse - special styling
          ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          
          // Draw star shape
          const spikes = 5;
          const outerRadius = 12;
          const innerRadius = 6;
          
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Label
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('WAREHOUSE', x, y + 25);
        } else {
          // Regular delivery point
          ctx.fillStyle = '#3b82f6';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Point number
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(idx), x, y);
        }
      });

      // Draw FPS counter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`${fps} FPS`, width - 10, 10);

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();
    
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [points, particles, globalBest, showParticles, showGlobalBest, animationSpeed, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}
    />
  );
};
