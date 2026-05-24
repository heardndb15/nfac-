'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, User } from '@/lib/auth-store';
import { gameProgressStore, GameProgress } from '@/lib/game-state';

const BOOT_LINES = [
  { text: '> booting system...', delay: 800, color: '#444' },
  { text: '> loading case protocol...', delay: 1000, color: '#444' },
  { text: '> anomaly detected', delay: 1200, color: '#ff4444' },
  { text: '> unauthorized user', delay: 1000, color: '#ff4444' },
  { text: '', delay: 500, color: '' },
  { text: '“You were not supposed to run this.”', delay: 1500, color: '#00ff41' },
];

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState<number[]>([]);
  const [showActions, setShowActions] = useState(false);
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

    let acc = 0;
    BOOT_LINES.forEach((_, i) => {
      acc += BOOT_LINES[i].delay;
      setTimeout(() => {
        setVisible(p => [...p, i]);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, acc);
    });

    setTimeout(() => setShowActions(true), acc + 1000);

    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120 + Math.random() * 80);
    }, 3000 + Math.random() * 3000);

    return () => clearInterval(giv);
  }, []);

  const handleLogout = () => {
    authStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)' }} />

      <AnimatePresence>
        {(visitCount > 0 || (progress?.totalChessLosses ?? 0) > 0) && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="fixed top-6 inset-x-0 flex flex-col items-center z-50 px-4 gap-2">
            <div className="border border-red-500 bg-black/80 backdrop-blur-sm px-6 py-3 text-center w-full max-w-sm">
              <div className="text-red-400 text-sm font-bold animate-pulse uppercase tracking-widest">
                ⚠ &nbsp;{progress?.totalChessLosses ? 'SYSTEM RESURRECTION' : 'RE-ENTRY DETECTED'}&nbsp; ⚠
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full max-w-2xl transition-all duration-75 ${glitch ? 'translate-x-0.5' : ''}`}>
        <div className="flex items-center gap-2 bg-green-950 bg-opacity-40 border border-green-900 border-b-0 px-3 py-1.5 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="ml-2 text-green-700 text-[10px] uppercase">CHESS.EXE — BOOT_SEQUENCE</span>
        </div>

        <div ref={scrollRef} className="border border-green-900 bg-black/90 p-8 h-64 overflow-y-auto">
          {BOOT_LINES.map((line, i) => (
            <div key={i} className="text-sm leading-8 transition-opacity duration-100" style={{ color: line.color || 'transparent', opacity: visible.includes(i) ? 1 : 0 }}>
              {line.text || '\u00A0'}
            </div>
          ))}
          {showActions && !currentUser && (
             <div className="text-green-500 mt-4 animate-pulse">“But now that you’re here… you can help.”</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm">
            {currentUser ? (
              <div className="w-full flex flex-col items-center gap-6">
                 <div className="text-green-400 font-bold tracking-widest border-b border-green-900 px-4 pb-1">SUBJECT: {currentUser.username.toUpperCase()}</div>
                 <button onClick={() => router.push('/cases')} className="w-full border-2 border-red-600 text-red-400 py-4 text-lg font-bold hover:bg-red-600 hover:text-black transition-all uppercase tracking-widest">
                    ▶ BEGIN ANALYSIS
                 </button>
                 <button onClick={handleLogout} className="text-[10px] text-gray-600 hover:text-red-500 uppercase">[ Terminate Session ]</button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-4">
                 <button onClick={() => router.push('/login')} className="border border-green-600 text-green-500 py-3 text-xs font-bold hover:bg-green-600 hover:text-black transition-all uppercase">Log In</button>
                 <button onClick={() => router.push('/register')} className="border border-green-600 text-green-500 py-3 text-xs font-bold hover:bg-green-600 hover:text-black transition-all uppercase">Register</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
