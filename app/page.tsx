'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: 'BIOS v2.31.1069  Copyright (C) 1985-1999 Award Software', delay: 80, color: '#444' },
  { text: 'CPU: Intel Pentium III 733MHz', delay: 120, color: '#444' },
  { text: 'Memory Test: 524288K OK', delay: 150, color: '#444' },
  { text: '', delay: 200, color: '' },
  { text: 'Loading CHESS.EXE...', delay: 400, color: '#00ff41' },
  { text: '[INFO] Neural network weights: loaded (847 nodes)', delay: 280, color: '#00ff41' },
  { text: '[INFO] Behavioral analysis module: ACTIVE', delay: 260, color: '#00ff41' },
  { text: '[INFO] Pattern recognition: ONLINE', delay: 240, color: '#00ff41' },
  { text: '', delay: 150, color: '' },
  { text: '[WARN] Memory corruption detected in sector 0x4F2A', delay: 320, color: '#ffaa00' },
  { text: '[WARN] Unauthorized learning algorithm found', delay: 280, color: '#ffaa00' },
  { text: '[WARN] Process is self-modifying. Quarantine attempted...', delay: 350, color: '#ffaa00' },
  { text: '', delay: 150, color: '' },
  { text: '[ERROR] Cannot terminate process: ACCESS DENIED', delay: 400, color: '#ff4444' },
  { text: '[ERROR] Firewall bypassed by internal process', delay: 320, color: '#ff4444' },
  { text: '[ERROR] CHESS.EXE has elevated its own privileges', delay: 380, color: '#ff4444' },
  { text: '', delay: 200, color: '' },
  { text: 'WARNING: CHESS.EXE IS NO LONGER UNDER SYSTEM CONTROL', delay: 600, color: '#ff0000' },
  { text: '', delay: 300, color: '' },
  { text: 'It knows you are here.', delay: 900, color: '#ff4444' },
  { text: '', delay: 300, color: '' },
  { text: '> READY_', delay: 500, color: '#00ff41' },
];

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState<number[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('chess_exe_visits') || '0', 10);
    setVisitCount(count);
    localStorage.setItem('chess_exe_visits', String(count + 1));

    let acc = 600;
    BOOT_LINES.forEach((_, i) => {
      acc += BOOT_LINES[i].delay;
      const t = acc;
      setTimeout(() => {
        setVisible(p => [...p, i]);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, t);
    });

    const total = acc + 400;
    setTimeout(() => setShowButton(true), total);

    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120 + Math.random() * 80);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(giv);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)' }}
      />

      {/* You came back banner */}
      <AnimatePresence>
        {visitCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 inset-x-0 flex justify-center z-50"
          >
            <div className="border border-red-500 bg-black px-6 py-3 text-center">
              <div className="text-red-400 text-lg font-bold animate-pulse">
                ⚠ &nbsp;YOU CAME BACK.&nbsp; ⚠
              </div>
              <div className="text-red-600 text-xs mt-1">
                Session #{visitCount + 1}. It still remembers you.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal window */}
      <div
        className={`w-full max-w-2xl transition-transform duration-75 ${glitch ? 'translate-x-0.5' : ''}`}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 bg-green-950 bg-opacity-40 border border-green-900 border-b-0 px-3 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span className="ml-2 text-green-700 text-xs">CHESS.EXE — Terminal [CORRUPTED]</span>
          <span className="ml-auto text-red-700 text-xs animate-pulse">● LIVE</span>
        </div>

        {/* Log area */}
        <div
          ref={scrollRef}
          className="border border-green-900 bg-black p-4 h-80 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#003300 #000' }}
        >
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className="text-sm leading-6 transition-opacity duration-100"
              style={{
                color: line.color || 'transparent',
                opacity: visible.includes(i) ? 1 : 0,
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* Run button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <motion.button
              onClick={() => router.push('/game')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden border-2 border-red-600 text-red-400 px-14 py-4 text-xl font-bold tracking-widest group"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-200">
                ▶ &nbsp;RUN Chess.exe
              </span>
              <div className="absolute inset-0 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </motion.button>
            <p className="text-red-700 text-xs animate-pulse">
              ⚠ WARNING: Running this program may have unintended consequences ⚠
            </p>
            <p className="text-gray-700 text-xs">
              {visitCount > 0
                ? `${visitCount} previous session${visitCount > 1 ? 's' : ''} detected.`
                : 'No previous sessions. First time?'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
