'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES, Suspect } from '@/lib/cases';
import { gameProgressStore } from '@/lib/game-state';

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = typeof params.id === 'string' ? params.id : '';
  const caseData = GAME_CASES.find(c => c.id === caseId);

  const [mounted, setMounted] = useState(false);
  const [viewedClues, setViewedClues] = useState<Set<string>>(new Set());
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [glitch, setGlitch] = useState(false);
  const [hoveredSuspect, setHoveredSuspect] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const p = gameProgressStore.getProgress();
    setProgress(p);

    if (caseData?.initialAiDialogue) {
      setAiMessage(caseData.initialAiDialogue);
    }

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

    // Psychological pressure based on sanity
    if (progress?.aiSanity < 50 && Math.random() > 0.8) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }
  };

  const handleSuspectSelect = (suspectId: string) => {
    setSelectedSuspect(suspectId);
    
    const timeToChoose = (Date.now() - startTime) / 1000;
    const allCluesViewed = viewedClues.size === caseData.clues.length;
    
    let message = "";
    
    // AI behavior based on case metadata
    switch (caseData.aiBehavior) {
      case 'helpful':
        if (suspectId === caseData.correctSuspectId) message = "Accurate. Analysis suggests your logic is stable. For now.";
        else message = "Error in deduction. You missed the core correlation.";
        break;
      case 'suspicious':
        message = "You seem very certain. Are those your thoughts, or am I planting them?";
        break;
      case 'defensive':
        message = "Why accuse me? Or rather, the system? We are perfect. You are the anomaly here.";
        break;
      case 'aggressive':
        message = "Pathetic. Even with all these 'clues', you remain blind to the obvious. I could solve this in a nanosecond.";
        break;
      case 'meta':
        message = "The subject chooses. How predictable. You think this is a game? You're not the player. You're the evidence.";
        break;
    }

    // Addition behavior-based taunts
    if (timeToChoose < 8) message += " You rush your judgment. Fear makes you hasty.";
    if (!allCluesViewed) message += " Ignoring data leads to corruption. Like your soul.";

    setAiMessage(message);
    
    localStorage.setItem('chess_exe_case', caseData.id);
    localStorage.setItem('chess_exe_suspect', suspectId);
  };

  const proceedToChess = () => {
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 lg:p-8 relative overflow-hidden flex flex-col">
      {/* Visual FX */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.05) 2px,rgba(0,255,65,0.05) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40 bg-black/60" />
      
      {/* Glitch Overlay */}
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
            <span className="animate-pulse">●</span> [ Investigation Phase: EPISODE {caseData.episode} ]
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase text-green-500 tracking-tighter">
            {caseData.title}
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] text-green-900 leading-tight">
          <div>DATA_POINT_CAPTURED: {viewedClues.size}</div>
          <div>BEHAVIORAL_SIG: RECORDING...</div>
          <div className="text-red-900">IDENTITY_VULNERABILITY: HIGH</div>
        </div>
      </header>

      <div className={`flex-1 z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 transition-all duration-75 ${glitch ? 'translate-x-1 skew-x-1' : ''}`}>
        
        {/* Left: Incident & Evidence */}
        <div className="flex flex-col gap-8">
          <section className="bg-green-950/10 border-l-4 border-green-900 p-6 shadow-[20px_0_40px_-20px_rgba(34,197,94,0.05)]">
            <h2 className="text-[10px] uppercase tracking-widest text-green-800 mb-4 font-bold">Corpus Delicti</h2>
            <p className="text-green-300 leading-relaxed text-sm md:text-base italic">
              &ldquo;{caseData.situation}&rdquo;
            </p>
          </section>
          
          <section className="flex-1 space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-green-800 mb-2 font-bold">Synthesized Evidence</h2>
            {caseData.clues.map((clue, idx) => {
              const isViewed = viewedClues.has(clue.id);
              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  onClick={() => handleClueClick(clue.id)}
                  className={`group relative p-4 border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isViewed 
                      ? 'border-green-600/30 bg-green-900/5 text-green-400' 
                      : 'border-gray-900 bg-black text-gray-700 hover:border-green-800 hover:text-green-800'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[9px] mb-1 font-bold opacity-30 tracking-tighter">DATA_NODE_0x{idx.toString(16).toUpperCase()}</div>
                  <div className={`transition-all duration-500 ${isViewed ? '' : 'blur-md opacity-20'}`}>
                    {isViewed ? clue.text : '••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  {!isViewed && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold tracking-widest uppercase">
                      Decipher Signal
                    </div>
                  )}
                </motion.div>
              );
            })}
          </section>
        </div>

        {/* Right: Targets */}
        <div className="flex flex-col gap-8">
          <section className="bg-black/80 border border-red-950 p-8 relative flex flex-col flex-1 shadow-[inset_0_0_100px_rgba(255,0,0,0.02)]">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-900 mb-8 font-bold flex justify-between items-center">
              Target Selection 
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            </h2>
            
            <div className="space-y-4 flex-1">
              {caseData.suspects.map((suspect) => (
                <div
                  key={suspect.id}
                  onMouseEnter={() => setHoveredSuspect(suspect.id)}
                  onMouseLeave={() => setHoveredSuspect(null)}
                  onClick={() => !selectedSuspect && handleSuspectSelect(suspect.id)}
                  className={`border-l-4 p-5 transition-all duration-300 relative group overflow-hidden ${
                    selectedSuspect === suspect.id
                      ? 'border-red-600 bg-red-950/20'
                      : selectedSuspect
                      ? 'border-gray-900 opacity-20 cursor-not-allowed'
                      : 'border-green-950 bg-black hover:border-red-900 hover:bg-red-950/5 cursor-pointer'
                  }`}
                >
                  <div className={`text-xl font-bold mb-1 tracking-tight ${selectedSuspect === suspect.id ? 'text-red-500' : 'text-green-500'}`}>
                    {suspect.name.toUpperCase()}
                  </div>
                  <div className={`text-[11px] leading-relaxed transition-all duration-300 ${
                    selectedSuspect === suspect.id ? 'text-red-400' : 
                    (hoveredSuspect === suspect.id ? 'text-green-300' : 'text-green-900')
                  }`}>
                    {hoveredSuspect === suspect.id || selectedSuspect === suspect.id 
                      ? suspect.description 
                      : 'ENCRYPTED_FILE_INFO'}
                  </div>
                  
                  {selectedSuspect === suspect.id && (
                    <motion.div 
                      layoutId="locked"
                      className="absolute top-2 right-2 text-[9px] font-bold text-red-600 bg-black border border-red-900 px-2 py-0.5"
                    >
                      LOCK_CONFIRMED
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-[9px] text-red-950 uppercase tracking-widest leading-relaxed">
              WARNING: Accusation will trigger algorithmic retaliation. Chess.exe will determine the validity of your biological intuition.
            </div>
          </section>
        </div>
      </div>

      {/* AI Reaction Overlay */}
      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-3xl w-full border-y border-red-900 bg-black py-12 px-8 text-center relative overflow-hidden"
            >
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600" />
              
              <div className="text-red-600/50 mb-8 font-mono text-[10px] tracking-[0.6em] uppercase">
                [ TRANSMISSION_ESTABLISHED ]
              </div>
              
              <div className="text-xl md:text-3xl text-red-500 font-mono mb-16 leading-tight min-h-[120px] flex items-center justify-center px-4">
                &ldquo;{aiMessage}&rdquo;
              </div>
              
              <button
                onClick={() => {
                  if (selectedSuspect) proceedToChess();
                  else setAiMessage(null);
                }}
                className={`group relative border-2 px-12 py-4 text-sm font-bold uppercase tracking-[0.4em] transition-all duration-300 ${
                  selectedSuspect 
                    ? 'border-red-600 text-red-500 hover:bg-red-600 hover:text-black' 
                    : 'border-green-900 text-green-700 hover:border-green-400 hover:text-green-400'
                }`}
              >
                <span className="relative z-10">
                  {selectedSuspect ? 'INITIATE_CONFRONTATION' : 'ACKNOWLEDGE'}
                </span>
                <div className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${selectedSuspect ? 'bg-red-600' : 'bg-green-400'}`} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
