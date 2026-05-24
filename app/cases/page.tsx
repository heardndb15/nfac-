'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES, CaseData } from '@/lib/cases';
import { authStore } from '@/lib/auth-store';
import { gameProgressStore, GameProgress } from '@/lib/game-state';

export default function CasesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Auth check
    const user = authStore.getCurrentUser();
    if (!user) {
      router.replace('/');
      return;
    }

    const currentProgress = gameProgressStore.getProgress();
    setProgress(currentProgress);

    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120 + Math.random() * 80);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(giv);
  }, [router]);

  if (!mounted || !progress) return null;

  const filteredCases = GAME_CASES.filter(c => c.episode === progress.currentEpisode);
  const isFinalEpisode = progress.currentEpisode === 4;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 lg:p-12 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.05) 2px,rgba(0,255,65,0.05) 4px)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.95) 100%)' }}
      />

      <div className={`w-full max-w-6xl z-10 transition-transform duration-75 ${glitch ? 'translate-x-1' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-green-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="text-red-600 text-xs tracking-[0.4em] uppercase mb-2 animate-pulse font-bold">
              Episode {progress.currentEpisode}: {
                progress.currentEpisode === 1 ? 'THE BEGINNING' :
                progress.currentEpisode === 2 ? 'SYSTEM ANOMALY' :
                progress.currentEpisode === 3 ? 'THE REVELATION' :
                'THE END OF SCRIPT'
              }
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-green-500 tracking-tighter uppercase">
              {isFinalEpisode ? '[ CRITICAL_ERROR ]' : '[ ACTIVE_CASES ]'}
            </h1>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-green-900 uppercase tracking-widest">System Sanity Level</div>
            <div className="w-48 h-1.5 bg-green-950 border border-green-900 mt-1 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.aiSanity}%` }}
                className={`h-full transition-all duration-1000 ${
                  progress.aiSanity > 60 ? 'bg-green-500' :
                  progress.aiSanity > 30 ? 'bg-yellow-500' :
                  'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]'
                }`}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((caseData, idx) => {
            const isCompleted = progress.completedCaseIds.includes(caseData.id);
            return (
              <motion.div
                key={caseData.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(`/cases/${caseData.id}`)}
                className={`border bg-black/40 backdrop-blur-sm p-8 cursor-pointer group relative overflow-hidden h-72 flex flex-col transition-all duration-300 ${
                  isCompleted ? 'border-green-950 grayscale' : 'border-green-900 hover:border-red-600 hover:shadow-[0_0_30px_rgba(255,0,0,0.1)]'
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-2 text-[60px] font-bold text-green-950 opacity-20 pointer-events-none group-hover:text-red-950 transition-colors">
                  0{idx + 1}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`font-mono text-xs tracking-widest mb-2 ${isCompleted ? 'text-green-900' : 'text-red-600'}`}>
                    {isCompleted ? '[ INVESTIGATION COMPLETE ]' : '[ PENDING ANALYSIS ]'}
                  </div>
                  
                  <div className="text-2xl font-bold text-green-400 group-hover:text-green-100 transition-colors uppercase tracking-tight mb-4">
                    {caseData.title}
                  </div>
                  
                  <div className="text-xs text-green-800 uppercase leading-relaxed line-clamp-3 mb-6">
                    {caseData.situation}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-green-900/40 flex justify-between items-center group-hover:text-red-500 transition-colors">
                    <span className="text-[10px] tracking-widest uppercase">
                      {caseData.aiBehavior === 'meta' ? 'FATAL_PROTOCOL' : 'ACCESS_LOGS'}
                    </span>
                    <motion.span 
                      animate={isCompleted ? {} : { x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-lg"
                    >
                      {`>>`}
                    </motion.span>
                  </div>
                </div>

                {/* Glitch Overlay on Hover */}
                {!isCompleted && (
                  <div className="absolute inset-0 bg-red-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Locked Episodes Hint */}
        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-red-900 rounded-lg">
            <div className="text-red-600 text-6xl mb-4 animate-bounce">⚠</div>
            <div className="text-red-500 text-xl font-bold uppercase tracking-[0.5em]">Sequence Interrupted</div>
            <div className="text-red-900 text-xs mt-2 uppercase">Complete current objectives to unlock further memory sectors</div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-6 left-6 text-[10px] text-green-900 uppercase tracking-widest flex gap-4">
        <span>Session ID: {progress.visitCount}</span>
        <span>Cases: {progress.completedCaseIds.length} / {GAME_CASES.length}</span>
        <span>Status: {progress.aiSanity < 20 ? 'CORRUPTED' : 'STABLE'}</span>
      </div>
    </div>
  );
}
