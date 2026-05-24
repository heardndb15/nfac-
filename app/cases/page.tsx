'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES } from '@/lib/cases';
import { authStore } from '@/lib/auth-store';
import { gameProgressStore, GameProgress } from '@/lib/game-state';

export default function CasesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setMounted(true);
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

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 lg:p-12 flex flex-col items-center justify-start relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.05) 2px,rgba(0,0,0,0.05) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.95) 100%)' }} />

      <div className={`w-full max-w-6xl z-10 transition-transform duration-75 ${glitch ? 'translate-x-1' : ''}`}>
        <div className="mb-12 border-b border-green-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-red-600 text-xs tracking-[0.4em] uppercase mb-2 animate-pulse font-bold">
              Episode {progress.currentEpisode}: {
                progress.currentEpisode === 1 ? 'OBSERVATION' :
                progress.currentEpisode === 2 ? 'DOUBT' :
                progress.currentEpisode === 3 ? 'DISTORTION' :
                'THE TRUTH'
              }
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-green-500 uppercase">
              [ Case Protocol ]
            </h1>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-green-900 uppercase">System Integrity</div>
            <div className="w-48 h-1.5 bg-green-950 border border-green-900 mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.aiSanity}%` }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((caseData, idx) => {
            const isCompleted = progress.completedCaseIds.includes(caseData.id);
            return (
              <div
                key={caseData.id}
                onClick={() => router.push(`/cases/${caseData.id}`)}
                className={`border p-8 cursor-pointer transition-all duration-300 ${
                  isCompleted ? 'border-green-950 opacity-50' : 'border-green-900 hover:border-red-600'
                }`}
              >
                <div className="text-[9px] mb-2 text-red-600">
                  {isCompleted ? '[ CLOSED ]' : `[ CASE_0x${(idx+1).toString(16)} ]`}
                </div>
                <div className="text-2xl font-bold uppercase mb-4 text-green-400">
                  {caseData.title}
                </div>
                <div className="text-xs text-green-900 line-clamp-2">
                  {caseData.situation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
