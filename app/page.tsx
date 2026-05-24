'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, User } from '@/lib/auth-store';
import { gameProgressStore, GameProgress } from '@/lib/game-state';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = authStore.getCurrentUser();
    setCurrentUser(user);

    const prog = gameProgressStore.getProgress();
    setProgress(prog);

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

  const handleLogout = () => {
    authStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)' }}
      />

      {/* Messages banner */}
      <AnimatePresence>
        {(visitCount > 0 || (progress?.totalChessLosses ?? 0) > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 inset-x-0 flex flex-col items-center z-50 px-4 gap-2"
          >
            <div className="border border-red-500 bg-black/80 backdrop-blur-sm px-6 py-3 text-center w-full max-w-sm shadow-[0_0_20px_rgba(255,0,0,0.1)]">
              <div className="text-red-400 text-sm font-bold animate-pulse uppercase tracking-widest">
                ⚠ &nbsp;{progress?.totalChessLosses ? 'SYSTEM RESURRECTION' : 'RE-ENTRY DETECTED'}&nbsp; ⚠
              </div>
              <div className="text-red-600 text-[10px] mt-1 uppercase tracking-tighter">
                {progress?.totalChessLosses 
                  ? `Subject failed ${progress.totalChessLosses} times. Memory integrity verified.`
                  : `Session #${visitCount + 1}. Data integrity compromised.`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal window */}
      <div
        className={`w-full max-w-2xl transition-all duration-75 ${glitch ? 'translate-x-0.5 skew-x-1' : ''}`}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 bg-green-950 bg-opacity-40 border border-green-900 border-b-0 px-3 py-1.5 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span className="ml-2 text-green-700 text-[10px] uppercase tracking-widest">CHESS.EXE — BOOT_SEQUENCE</span>
          <span className="ml-auto text-red-700 text-[10px] animate-pulse">● UNSAFE</span>
        </div>

        {/* Log area */}
        <div
          ref={scrollRef}
          className="border border-green-900 bg-black/90 p-4 h-80 overflow-y-auto shadow-[0_0_20px_rgba(0,255,65,0.05)]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#003300 #000' }}
        >
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className="text-xs leading-6 transition-opacity duration-100"
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

      {/* Main Actions Container */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm"
          >
            {currentUser ? (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-green-800">Verified Subject</span>
                  <div className="text-green-400 font-bold tracking-widest text-lg border-b border-green-900 px-4 pb-1">
                    {currentUser.username.toUpperCase()}
                  </div>
                  <span className="text-[9px] text-green-700 mt-1">{currentUser.agentId}</span>
                </div>

                <motion.button
                  onClick={() => router.push('/cases')}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(255,0,0,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden border-2 border-red-600 text-red-400 py-4 text-lg font-bold tracking-[0.2em] group"
                >
                  <span className="relative z-10 group-hover:text-black transition-colors duration-200 uppercase">
                    ▶ Launch Execution
                  </span>
                  <div className="absolute inset-0 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </motion.button>

                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.3em]"
                >
                  [ Terminate Session ]
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="text-yellow-600 text-[10px] uppercase tracking-[0.3em] animate-pulse mb-2">
                  Identity Verification Required
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => router.push('/login')}
                    className="border border-green-600 text-green-500 py-3 text-xs font-bold tracking-widest hover:bg-green-600 hover:text-black transition-all uppercase"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="border border-green-600 text-green-500 py-3 text-xs font-bold tracking-widest hover:bg-green-600 hover:text-black transition-all uppercase"
                  >
                    Register
                  </button>
                </div>
                
                <div className="text-gray-800 text-[9px] text-center px-4 leading-relaxed uppercase tracking-tighter">
                  Guest access restricted. <br/> System requires mandatory behavior tracking profile for data harvesting.
                </div>
              </div>
            )}

            <div className="text-red-900 text-[9px] uppercase tracking-widest text-center opacity-50 px-8">
              ⚠ Unauthorised use of CHESS.EXE will result in irreversible cognitive restructuring ⚠
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
