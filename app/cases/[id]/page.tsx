'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES } from '@/lib/cases';
import { gameProgressStore } from '@/lib/game-state';
import { aiEngine } from '@/lib/aiEngine';

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = typeof params.id === 'string' ? params.id : '';
  const caseData = GAME_CASES.find(c => c.id === caseId);

  const [mounted, setMounted] = useState(false);
  const [viewedClues, setViewedClues] = useState<Set<string>>(new Set());
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [glitch, setGlitch] = useState(false);
  const [hoveredSuspect, setHoveredSuspect] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const p = gameProgressStore.getProgress();
    setProgress(p);

    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80 + Math.random() * 80);
    }, 4500 + Math.random() * 4500);

    return () => clearInterval(giv);
  }, [caseData]);

  if (!mounted || !caseData) return null;

  const handleClueClick = (clueId: string) => {
    setViewedClues(prev => {
      const next = new Set(prev);
      next.add(clueId);
      return next;
    });
  };

  const handleSuspectSelect = (suspectId: string) => {
    const duration = Date.now() - startTime;
    setSelectedSuspect(suspectId);
    
    const isCorrect = suspectId === caseData.correctSuspectId;
    gameProgressStore.recordDecision(duration, isCorrect);
    
    const speed = duration < 10000 ? 'fast' : 'slow';
    const message = aiEngine.generateDialogue({
      episode: caseData.episode,
      corruption: (100 - (progress?.aiSanity || 100)) / 100,
      speed
    });

    setAiMessage(message);
    
    localStorage.setItem('chess_exe_case', caseData.id);
    localStorage.setItem('chess_exe_suspect', suspectId);
  };

  const proceedToChess = () => {
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 lg:p-8 relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.05) 2px,rgba(0,255,65,0.05) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40 bg-black/60" />
      
      <AnimatePresence>
        {glitch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white opacity-5 mix-blend-difference pointer-events-none"
          />
        )}
      </AnimatePresence>

      <header className="z-10 border-b border-green-900/40 pb-6 mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 text-red-500 text-xs tracking-[0.5em] mb-2 uppercase">
            <span className="animate-pulse">●</span> [ EPISODE {caseData.episode} ]
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase text-green-500 tracking-tighter">
            {caseData.title}
          </h1>
        </div>
      </header>

      <div className={`flex-1 z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 transition-all duration-75 ${glitch ? 'translate-x-1' : ''}`}>
        <div className="flex flex-col gap-8">
          <section className="bg-green-950/10 border-l-4 border-green-900 p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-green-800 mb-4 font-bold">Corpus Delicti</h2>
            <p className="text-green-300 leading-relaxed italic">
              &ldquo;{caseData.situation}&rdquo;
            </p>
          </section>
          
          <section className="flex-1 space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-green-800 mb-2 font-bold">Evidence</h2>
            {caseData.clues.map((clue, idx) => {
              const isViewed = viewedClues.has(clue.id);
              let processedText = clue.text;
              
              if (caseData.id === 'case-7' && progress) {
                const avgSpeed = progress.stats.decisionSpeeds.length 
                  ? Math.round(progress.stats.decisionSpeeds.reduce((a:any,b:any)=>a+b,0)/progress.stats.decisionSpeeds.length) 
                  : 450;
                processedText = processedText.replace('{speed}', avgSpeed.toString());
                processedText = processedText.replace('{losses}', progress.totalChessLosses.toString());
              }

              return (
                <div
                  key={clue.id}
                  onClick={() => handleClueClick(clue.id)}
                  className={`p-4 border cursor-pointer transition-colors ${
                    isViewed ? 'border-green-600/30' : 'border-gray-900 text-gray-700'
                  }`}
                >
                  <div className={`transition-all duration-500 ${isViewed ? '' : 'blur-md opacity-20'}`}>
                    {isViewed ? processedText : 'DATA_NODE_ENCRYPTED'}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section className="bg-black border border-red-950 p-8 flex flex-col flex-1">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-900 mb-8 font-bold">Target Selection</h2>
            <div className="space-y-4 flex-1">
              {caseData.suspects.map((suspect) => (
                <div
                  key={suspect.id}
                  onClick={() => !selectedSuspect && handleSuspectSelect(suspect.id)}
                  className={`border-l-4 p-5 transition-all duration-300 ${
                    selectedSuspect === suspect.id ? 'border-red-600 bg-red-950/20' : 'border-green-950 bg-black cursor-pointer'
                  }`}
                >
                  <div className="text-xl font-bold mb-1 text-green-500">{suspect.name.toUpperCase()}</div>
                  <div className="text-[11px] text-green-900">{suspect.description}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {aiMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
            <div className="max-w-3xl w-full border-y border-red-900 bg-black py-12 px-8 text-center">
              <div className="text-xl text-red-500 font-mono mb-16">{aiMessage}</div>
              <button
                onClick={() => { if (selectedSuspect) proceedToChess(); else setAiMessage(null); }}
                className="border-2 border-red-600 text-red-500 px-12 py-4 font-bold"
              >
                {selectedSuspect ? 'INITIATE' : 'ACKNOWLEDGE'}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
