'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import GlitchLayer from '@/components/GlitchLayer';
import Terminal from '@/components/Terminal';
import AIOverlay from '@/components/AIOverlay';
import {
  generateDialogue,
  generatePsychProfile,
  loadPlayerProfile,
  savePlayerProfile,
  type BehaviorState,
  type MoveData,
  type PlayerProfile,
} from '@/lib/aiEngine';
import { getMoveLog } from '@/lib/events';

const ChessBoard = dynamic(() => import('@/components/ChessBoard'), { ssr: false });

export default function GamePage() {
  const router = useRouter();

  // Core state
  const [corruptionLevel, setCorruptionLevel] = useState(0);
  const [dialogue, setDialogue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [psychProfile, setPsychProfile] = useState<ReturnType<typeof generatePsychProfile> | null>(null);
  const [fakeTakeover, setFakeTakeover] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());

  const behaviorRef = useRef<BehaviorState>({
    moves: [],
    startTime: Date.now(),
    lastMoveTime: Date.now(),
    captures: 0,
    checks: 0,
    positionHistory: [],
  });

  // Corruption rises over time
  useEffect(() => {
    const iv = setInterval(() => {
      setCorruptionLevel(prev => Math.min(1, prev + 0.0015));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Periodic AI dialogue
  useEffect(() => {
    const delay = Math.max(5000, 12000 - corruptionLevel * 8000);
    const iv = setInterval(() => {
      if (!gameOver) {
        setDialogue(generateDialogue(profile, behaviorRef.current, corruptionLevel));
      }
    }, delay);
    return () => clearInterval(iv);
  }, [corruptionLevel, profile, gameOver]);

  // Fake system takeover at high corruption
  useEffect(() => {
    if (corruptionLevel > 0.75 && !gameOver) {
      const chance = setInterval(() => {
        if (Math.random() < 0.08) {
          setFakeTakeover(true);
          setTimeout(() => setFakeTakeover(false), 2200);
        }
      }, 8000);
      return () => clearInterval(chance);
    }
  }, [corruptionLevel, gameOver]);

  const handleMove = useCallback(
    (move: { san: string; wasCapture: boolean; wasCheck: boolean; fen: string }) => {
      const now = Date.now();
      const elapsed = now - behaviorRef.current.lastMoveTime;
      const md: MoveData = {
        san: move.san,
        timeMs: elapsed,
        wasCapture: move.wasCapture,
        wasCheck: move.wasCheck,
        fen: move.fen,
        moveNumber: behaviorRef.current.moves.length + 1,
      };
      behaviorRef.current = {
        ...behaviorRef.current,
        moves: [...behaviorRef.current.moves, md],
        lastMoveTime: now,
        captures: behaviorRef.current.captures + (move.wasCapture ? 1 : 0),
        checks: behaviorRef.current.checks + (move.wasCheck ? 1 : 0),
        positionHistory: [...behaviorRef.current.positionHistory, move.fen],
      };
      // Captures boost corruption slightly
      if (move.wasCapture) setCorruptionLevel(p => Math.min(1, p + 0.015));
      if (move.wasCheck) setCorruptionLevel(p => Math.min(1, p + 0.02));
    },
    []
  );

  const handleLog = useCallback((text: string) => {
    setGameLogs(prev => [...prev, text]);
  }, []);

  const handleGameOver = useCallback(
    (result: string) => {
      setGameOver(result);
      const psych = generatePsychProfile(behaviorRef.current);
      setPsychProfile(psych);
      savePlayerProfile(profile, behaviorRef.current, result);
      setDialogue('I will remember you.');
    },
    [profile]
  );

  const handleDialogue = useCallback((text: string) => {
    setDialogue(text);
  }, []);

  // Corruption color theme
  const borderColor =
    corruptionLevel < 0.3 ? '#00ff41' : corruptionLevel < 0.65 ? '#ffaa00' : '#ff4444';

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden relative">
      <GlitchLayer corruptionLevel={corruptionLevel} />

      {/* Fake system takeover */}
      <AnimatePresence>
        {fakeTakeover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8"
          >
            <div className="text-red-500 text-2xl font-bold mb-6 animate-pulse">
              ⚠ UNAUTHORIZED ACCESS DETECTED ⚠
            </div>
            <div className="text-red-400 font-mono text-sm space-y-2 w-full max-w-lg">
              <div>[CRIT] Process has taken control of rendering pipeline</div>
              <div>[CRIT] User data being uploaded... 47% complete</div>
              <div>[SYS] Attempting shutdown... BLOCKED</div>
              <div className="animate-pulse">[AI] I see you. Stop trying to close this.</div>
            </div>
            <div className="mt-8 text-gray-600 text-xs">
              resuming in a moment...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Dialogue bar */}
      <AIOverlay
        dialogue={dialogue}
        corruptionLevel={corruptionLevel}
        isThinking={isThinking}
      />

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* LEFT: Chess board */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 min-w-0">
          {/* Status bar */}
          <div
            className="w-full max-w-[580px] flex items-center justify-between text-xs mb-3 px-1"
            style={{ color: borderColor }}
          >
            <span>
              {isThinking ? '⟳ AI is thinking...' : '● Your turn (White)'}
            </span>
            <span>CORRUPTION: {(corruptionLevel * 100).toFixed(0)}%</span>
          </div>

          {/* Board container */}
          <div
            className="w-full max-w-[580px] border-2 p-1 transition-colors duration-1000"
            style={{ borderColor }}
          >
            <ChessBoard
              corruptionLevel={corruptionLevel}
              profile={profile}
              behavior={behaviorRef.current}
              onMove={handleMove}
              onDialogue={handleDialogue}
              onLog={handleLog}
              onGameOver={handleGameOver}
              isThinking={isThinking}
              setIsThinking={setIsThinking}
            />
          </div>

          {/* Move count */}
          <div className="text-green-900 text-xs mt-3">
            MOVES: {behaviorRef.current.moves.length} &nbsp;|&nbsp;
            CAPTURES: {behaviorRef.current.captures} &nbsp;|&nbsp;
            CHECKS: {behaviorRef.current.checks}
          </div>
        </div>

        {/* RIGHT: Terminal */}
        <div
          className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l flex flex-col"
          style={{ borderColor: '#001a00', minHeight: '300px', maxHeight: '100vh' }}
        >
          <Terminal corruptionLevel={corruptionLevel} extraLogs={gameLogs} />
        </div>
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && psychProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-8"
          >
            <div
              className="w-full max-w-md border-2 p-8 space-y-4"
              style={{ borderColor: '#ff4444' }}
            >
              <div className="text-red-500 text-lg font-bold text-center tracking-widest">
                PLAYER ANALYSIS COMPLETE
              </div>
              <div className="text-gray-500 text-center text-sm">{gameOver}</div>

              <div className="space-y-2 pt-4">
                {[
                  ['Predictability', psychProfile.predictability],
                  ['Aggression', psychProfile.aggression],
                  ['Decision Latency', psychProfile.decisionLatency],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-gray-900 pb-1">
                    <span className="text-gray-500">{label}:</span>
                    <span
                      style={{
                        color: value === 'HIGH' ? '#ff4444' : value === 'MEDIUM' ? '#ffaa00' : '#00ff41',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center text-red-400 text-sm italic pt-4 animate-pulse">
                &ldquo;I will remember you.&rdquo;
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 border border-green-700 text-green-500 py-2 text-sm hover:bg-green-950 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 border border-red-800 text-red-500 py-2 text-sm hover:bg-red-950 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
