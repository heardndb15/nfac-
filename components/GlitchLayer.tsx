'use client';

import { useEffect, useState } from 'react';

interface GlitchLayerProps {
  corruptionLevel: number;
}

export default function GlitchLayer({ corruptionLevel }: GlitchLayerProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [flicker, setFlicker] = useState(1);
  const [lines, setLines] = useState<{ top: number; color: string }[]>([]);

  useEffect(() => {
    if (corruptionLevel < 0.15) return;

    const iv = setInterval(() => {
      // RGB split
      if (Math.random() < corruptionLevel * 0.5) {
        setOffset({
          x: (Math.random() - 0.5) * corruptionLevel * 10,
          y: (Math.random() - 0.5) * corruptionLevel * 4,
        });
        setTimeout(() => setOffset({ x: 0, y: 0 }), 80 + Math.random() * 60);
      }
      // Flicker
      if (Math.random() < corruptionLevel * 0.25) {
        setFlicker(0.2 + Math.random() * 0.5);
        setTimeout(() => setFlicker(1), 40 + Math.random() * 40);
      }
      // Glitch lines
      if (Math.random() < corruptionLevel * 0.4) {
        const count = Math.floor(Math.random() * 4) + 1;
        setLines(
          Array.from({ length: count }, () => ({
            top: Math.random() * 100,
            color: Math.random() > 0.5 ? 'rgba(0,255,65,0.6)' : 'rgba(255,0,0,0.6)',
          }))
        );
        setTimeout(() => setLines([]), 80 + Math.random() * 120);
      }
    }, 400 + Math.random() * 600);

    return () => clearInterval(iv);
  }, [corruptionLevel]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.13) 2px,rgba(0,0,0,0.13) 4px)',
        }}
      />

      {/* RGB chromatic aberration */}
      {corruptionLevel > 0.15 && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(255,0,0,0.04)',
              transform: `translate(${offset.x}px,${offset.y}px)`,
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,255,255,0.04)',
              transform: `translate(${-offset.x}px,${-offset.y}px)`,
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}

      {/* Flicker */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 1 - flicker }}
      />

      {/* Horizontal glitch lines */}
      {lines.map((l, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{ top: `${l.top}%`, height: '1px', backgroundColor: l.color }}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${0.35 + corruptionLevel * 0.45}) 100%)`,
        }}
      />
    </div>
  );
}
