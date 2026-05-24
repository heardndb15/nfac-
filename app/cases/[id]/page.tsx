'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES, Suspect } from '@/lib/cases';

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

  useEffect(() => {
    setMounted(true);
    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80 + Math.random() * 80);
    }, 3000 + Math.random() * 3000);
    return () => clearInterval(giv);
  }, []);

  if (!mounted || !caseData) return null;

  const handleClueClick = (clueId: string) => {
    setViewedClues(prev => {
      const next = new Set(prev);
      next.add(clueId);
      return next;
    });
  };

  const handleSuspectSelect = (suspectId: string) => {
    setSelectedSuspect(suspectId);
    
    // Calculate AI response based on player behavior
    const timeToChoose = (Date.now() - startTime) / 1000;
    const allCluesViewed = viewedClues.size === caseData.clues.length;
    
    let message = "";
    if (timeToChoose < 5) {
      message = "You act on impulse. Intuition over logic. How human.";
    } else if (!allCluesViewed) {
      message = "You didn't even look at all the evidence. Sloppy.";
    } else if (suspectId === caseData.correctSuspectId) {
      message = "You found the right piece. But can you play the whole board?";
    } else {
      message = "You trusted the wrong person. Typical.";
    }
    
    setAiMessage(message);
    
    // Save state to localStorage to be read by the chess game
    localStorage.setItem('chess_exe_case', caseData.id);
    localStorage.setItem('chess_exe_suspect', suspectId);
  };

  const proceedToChess = () => {
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 lg:p-8 relative overflow-hidden flex flex-col">
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-40 bg-black/40"
      />

      {/* Header */}
      <header className="z-10 border-b border-green-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <div className="text-red-500 text-sm mb-1 tracking-widest">[ INVESTIGATION PROTOCOL ]</div>
          <h1 className="text-3xl font-bold uppercase">{caseData.title}</h1>
        </div>
        <div className="text-right text-xs text-green-700">
          <div>CLUES REC: {viewedClues.size} / {caseData.clues.length}</div>
          <div className="animate-pulse">SYS: RECORDING</div>
        </div>
      </header>

      <div className={`flex-1 z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 transition-transform duration-75 ${glitch ? '-translate-x-[1px]' : ''}`}>
        
        {/* Left Side: Situation & Clues */}
        <div className="flex flex-col gap-6">
          <section className="bg-green-950/20 border border-green-900 p-5">
            <h2 className="text-green-700 uppercase text-xs mb-3 font-semibold">Incident Report</h2>
            <p className="text-green-300 leading-relaxed text-sm">
              {caseData.situation}
            </p>
          </section>
          
          <section className="flex-1 overflow-y-auto pr-2 rounded" style={{ scrollbarWidth: 'thin' }}>
            <h2 className="text-green-700 uppercase text-xs mb-3 font-semibold">Available Evidence</h2>
            <div className="space-y-3">
              {caseData.clues.map((clue, idx) => {
                const isViewed = viewedClues.has(clue.id);
                return (
                  <motion.div
                    key={clue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => handleClueClick(clue.id)}
                    className={`p-3 border cursor-pointer transition-colors ${
                      isViewed 
                        ? 'border-green-800 bg-green-900/10 text-green-400' 
                        : 'border-gray-800 bg-black text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xs mb-1 opacity-50">EVIDENCE #{idx + 1}</div>
                    <div className={isViewed ? '' : 'blur-sm select-none'}>
                      {isViewed ? clue.text : '••••••••••••••••••••••••••••••••'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Side: Suspects */}
        <div className="flex flex-col gap-6">
          <section className="bg-black border border-red-900/50 p-5 flex flex-col flex-1">
            <h2 className="text-red-700 uppercase text-xs mb-5 font-semibold animate-pulse">
              Identify Target (Killer AI)
            </h2>
            <div className="grid grid-cols-1 gap-4 flex-1">
              {caseData.suspects.map((suspect) => (
                <div
                  key={suspect.id}
                  onMouseEnter={() => setHoveredSuspect(suspect.id)}
                  onMouseLeave={() => setHoveredSuspect(null)}
                  onClick={() => !selectedSuspect && handleSuspectSelect(suspect.id)}
                  className={`border p-4 transition-all duration-300 overflow-hidden relative ${
                    selectedSuspect === suspect.id
                      ? 'border-red-500 bg-red-950/20'
                      : selectedSuspect
                      ? 'border-gray-900 opacity-30 cursor-not-allowed'
                      : 'border-green-900 hover:border-red-500/50 cursor-pointer hover:bg-red-900/10'
                  }`}
                >
                  <div className={`text-lg font-bold mb-2 ${selectedSuspect === suspect.id ? 'text-red-500' : 'text-green-400'}`}>
                    {suspect.name}
                  </div>
                  <div className={`text-sm ${selectedSuspect === suspect.id ? 'text-red-300' : 'text-gray-400'}`}>
                    {hoveredSuspect === suspect.id || selectedSuspect === suspect.id 
                      ? suspect.description 
                      : 'Hover to expand file...'}
                  </div>
                  
                  {selectedSuspect === suspect.id && (
                    <div className="absolute top-0 right-0 p-2 text-xs font-bold text-red-500 bg-red-950/50">
                      TARGET LOCKED
                    </div>
                  )}
                </div>
              ))}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full border border-red-800 bg-black p-8 text-center shadow-[0_0_50px_rgba(255,0,0,0.15)]"
            >
              <div className="text-red-600 mb-6 font-bold tracking-widest text-sm">
                [ CONNECTION ESTABLISHED ]
              </div>
              <div className="text-xl md:text-2xl text-red-400 font-mono mb-12 min-h-[80px] flex items-center justify-center typewriter">
                &ldquo;{aiMessage}&rdquo;
              </div>
              
              <button
                onClick={proceedToChess}
                className="border-2 border-red-700 bg-red-950/30 text-red-500 px-8 py-3 text-lg font-bold hover:bg-red-900 hover:text-black transition-colors uppercase tracking-widest"
              >
                Face The Consequence
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #ff4444;
          animation: typing 2.5s steps(40, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #ff4444; }
        }
      `}</style>
    </div>
  );
}
