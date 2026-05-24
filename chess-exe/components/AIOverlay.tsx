'use client';

import { useEffect, useRef, useState } from 'react';

interface AIOverlayProps {
  dialogue: string;
  corruptionLevel: number;
  isThinking: boolean;
}

export default function AIOverlay({ dialogue, corruptionLevel, isThinking }: AIOverlayProps) {
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(false);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!dialogue) return;
    if (ivRef.current) clearInterval(ivRef.current);
    setDisplayed('');
    setTyping(true);
    let i = 0;
    ivRef.current = setInterval(() => {
      if (i < dialogue.length) {
        setDisplayed(dialogue.slice(0, i + 1));
        i++;
      } else {
        setTyping(false);
        if (ivRef.current) clearInterval(ivRef.current);
      }
    }, 35 + Math.random() * 25);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [dialogue]);

  const glowColor =
    corruptionLevel < 0.3
      ? '0 0 12px rgba(0,255,65,0.4)'
      : corruptionLevel < 0.65
      ? '0 0 14px rgba(255,165,0,0.4)'
      : '0 0 16px rgba(255,0,0,0.5)';

  const textColor =
    corruptionLevel < 0.3 ? '#00ff41' : corruptionLevel < 0.65 ? '#ffaa00' : '#ff4444';

  const label =
    corruptionLevel < 0.3 ? 'CHESS.EXE' : corruptionLevel < 0.65 ? 'ENTITY' : 'IT';

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b border-green-950 bg-black"
      style={{ boxShadow: glowColor }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-8 h-8 flex items-center justify-center border text-xs font-bold"
        style={{ borderColor: textColor, color: textColor }}
      >
        {corruptionLevel < 0.3 ? '♟' : corruptionLevel < 0.65 ? '?' : '☠'}
      </div>

      {/* Label */}
      <span className="shrink-0 text-xs font-mono" style={{ color: textColor }}>
        [{label}]
      </span>

      {/* Dialogue */}
      <div className="flex-1 font-mono text-sm min-h-5" style={{ color: textColor }}>
        {isThinking && !displayed ? (
          <span className="opacity-60 animate-pulse">Analyzing...</span>
        ) : (
          <>
            {displayed}
            {typing && <span className="animate-pulse">█</span>}
          </>
        )}
      </div>
    </div>
  );
}
