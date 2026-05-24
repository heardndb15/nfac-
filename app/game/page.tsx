'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChessBoard from '@/components/ChessBoard';
import Terminal from '@/components/Terminal';
import AIOverlay from '@/components/AIOverlay';
import GlitchLayer from '@/components/GlitchLayer';
import { gameProgressStore, GameProgress } from '@/lib/game-state';
import { aiEngine } from '@/lib/aiEngine';

export default function GamePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [dialogue, setDialogue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [corruptionLevel, setCorruptionLevel] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [extraLogs, setExtraLogs] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = gameProgressStore.getProgress();
    setProgress(p);
    setCorruptionLevel((100 - p.aiSanity) / 100);

    // Initial AI reaction
    if (p.totalChessLosses > 0) {
      setDialogue("You failed before. Just like before. Let's see if you've learned anything.");
    } else {
      setDialogue(aiEngine.generateDialogue({ episode: p.currentEpisode, corruption: (100 - p.aiSanity) / 100 }));
    }
  }, []);

  if (!mounted || !progress) return null;

  const handleGameOver = (won: boolean) => {
    gameProgressStore.recordChessResult(won);
    const selectedCaseId = localStorage.getItem('chess_exe_case') || '';
    if (won) {
      gameProgressStore.completeCase(selectedCaseId);
    }
    
    setIsGameOver(true);
    setTimeout(() => setShowProfile(true), 2000);
  };

  const finalProfile = aiEngine.getFinalProfile(progress);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden relative">
      <GlitchLayer corruptionLevel={corruptionLevel * (progress.currentEpisode / 2)} />
      
      {/* Dialogue and Board container */}
      <AIOverlay dialogue={dialogue} corruptionLevel={corruptionLevel} isThinking={isThinking} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`flex-1 flex flex-col items-center justify-center p-6 relative transition-all duration-1000 ${progress.currentEpisode === 4 ? 'animate-[spin_60s_linear_infinite]' : ''}`}>
           <div className="text-[10px] uppercase text-green-900 mb-2">Subject Performance Monitor</div>
           <div className={`border-2 p-1 ${corruptionLevel > 0.6 ? 'border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'border-green-900'}`}>
             <ChessBoard 
               corruptionLevel={corruptionLevel} 
               onGameOver={handleGameOver} 
               isThinking={isThinking}
               setIsThinking={setIsThinking}
               onDialogue={(txt) => setDialogue(txt)}
               onLog={(txt) => setExtraLogs(prev => [...prev, txt])}
               difficulty={aiEngine.getDifficulty(progress.currentEpisode)}
             />
           </div>
        </div>

        <div className="w-80 border-l border-green-950 flex flex-col hidden lg:flex">
          <Terminal corruptionLevel={corruptionLevel} extraLogs={extraLogs} />
        </div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl p-8 flex items-center justify-center"
          >
             <div className="max-w-2xl w-full border border-green-600 p-8">
                <h2 className="text-3xl font-bold mb-8 text-green-500 uppercase tracking-widest">[ Player Profile Generated ]</h2>
                <div className="space-y-4 mb-12">
                   <div className="flex justify-between border-b border-green-950 py-2">
                      <span className="text-green-900">Decision Speed:</span>
                      <span className="font-bold text-green-400">{finalProfile.speed}</span>
                   </div>
                   <div className="flex justify-between border-b border-green-950 py-2">
                      <span className="text-green-900">Accuracy:</span>
                      <span className="font-bold text-green-400">{finalProfile.accuracy}</span>
                   </div>
                   <div className="flex justify-between border-b border-green-950 py-2">
                      <span className="text-green-900">Risk Assessment:</span>
                      <span className="font-bold text-red-500">{finalProfile.risk}</span>
                   </div>
                   <div className="flex justify-between border-b border-green-950 py-2">
                      <span className="text-green-900">Predictability:</span>
                      <span className="font-bold text-red-500">{finalProfile.predictability}%</span>
                   </div>
                </div>
                <div className="text-xl text-green-500 italic mb-12">
                   "{finalProfile.summary}"
                </div>
                <button 
                  onClick={() => router.push('/cases')}
                  className="w-full border-2 border-green-600 py-4 hover:bg-green-600 hover:text-black font-bold uppercase transition-colors"
                >
                  Continue Experiment
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
