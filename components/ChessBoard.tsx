'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { getAIMove, generateDialogue, type BehaviorState, type PlayerProfile } from '@/lib/aiEngine';
import { getMoveLog, getTimestamp } from '@/lib/events';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface ChessBoardProps {
  corruptionLevel: number;
  profile: PlayerProfile;
  behavior: BehaviorState;
  onMove: (move: { san: string; wasCapture: boolean; wasCheck: boolean; fen: string }) => void;
  onDialogue: (text: string) => void;
  onLog: (text: string) => void;
  onGameOver: (result: string) => void;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;
}

export default function ChessBoard({
  corruptionLevel,
  profile,
  behavior,
  onMove,
  onDialogue,
  onLog,
  onGameOver,
  isThinking,
  setIsThinking,
}: ChessBoardProps) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [shake, setShake] = useState(false);
  const moveStartRef = useRef<number>(Date.now());
  const gameOverFired = useRef(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const doAIMove = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isGameOver() || chess.turn() !== 'b') return;

    // Occasional "horror" delay at high corruption
    const delay = corruptionLevel > 0.6 && Math.random() < 0.3
      ? 2000 + Math.random() * 2000
      : 400 + Math.random() * 800;

    setTimeout(() => {
      if (chess.turn() !== 'b' || chess.isGameOver()) return;
      const moveSan = getAIMove(chess, corruptionLevel);
      if (!moveSan) return;

      const result = chess.move(moveSan);
      if (!result) return;

      const wasCapture = !!result.captured;
      const wasCheck = chess.isCheck();

      if (wasCapture && corruptionLevel > 0.4) triggerShake();

      setFen(chess.fen());
      onLog(getMoveLog(moveSan, wasCapture, wasCheck, corruptionLevel));

      // Generate dialogue after AI move
      if (Math.random() < 0.4 + corruptionLevel * 0.3) {
        setTimeout(() => {
          onDialogue(generateDialogue(profile, behavior, corruptionLevel));
        }, 600);
      }

      setIsThinking(false);
      moveStartRef.current = Date.now();

      if (chess.isGameOver()) {
        if (!gameOverFired.current) {
          gameOverFired.current = true;
          const r = chess.isCheckmate() ? 'AI wins by checkmate' : 'Draw';
          onGameOver(r);
        }
      }
    }, delay);
  }, [corruptionLevel, profile, behavior, onMove, onDialogue, onLog, onGameOver, setIsThinking]);

  const onPieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      const chess = chessRef.current;
      if (chess.turn() !== 'w' || isThinking) return false;

      const moveTimeMs = Date.now() - moveStartRef.current;

      let result;
      try {
        result = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      } catch (err) {
        return false;
      }
      if (!result) return false;

      const wasCapture = !!result.captured;
      const wasCheck = chess.isCheck();

      setFen(chess.fen());
      onLog(getMoveLog(result.san, wasCapture, wasCheck, corruptionLevel));
      onMove({ san: result.san, wasCapture, wasCheck, fen: chess.fen() });

      if (chess.isGameOver()) {
        if (!gameOverFired.current) {
          gameOverFired.current = true;
          const r = chess.isCheckmate() ? 'Player wins' : 'Draw';
          onGameOver(r);
        }
        return true;
      }

      setIsThinking(true);
      moveStartRef.current = Date.now();
      doAIMove();
      return true;
    },
    [isThinking, corruptionLevel, onMove, onLog, onGameOver, doAIMove, setIsThinking]
  );

  // Corruption visual: slight board tilt at high corruption
  const boardRotation = corruptionLevel > 0.8 && Math.random() < 0.05 ? `rotate(${(Math.random() - 0.5) * 1.5}deg)` : 'none';

  const darkSquare =
    corruptionLevel < 0.3
      ? '#0d1f0d'
      : corruptionLevel < 0.65
      ? '#1a0e0e'
      : '#200505';

  const lightSquare =
    corruptionLevel < 0.3
      ? '#1a3a1a'
      : corruptionLevel < 0.65
      ? '#2d1414'
      : '#3a0808';

  return (
    <div
      className={`w-full aspect-square transition-transform duration-200 ${shake ? 'scale-[1.01]' : ''}`}
      style={{ transform: boardRotation }}
    >
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        arePiecesDraggable={!isThinking}
        isDraggablePiece={({ piece }) => piece && piece[0] === 'w' && !isThinking}
        customDarkSquareStyle={{ backgroundColor: darkSquare }}
        customLightSquareStyle={{ backgroundColor: lightSquare }}
        customBoardStyle={{
          borderRadius: '2px',
          boxShadow:
            corruptionLevel > 0.5
              ? `0 0 30px rgba(255,0,0,${corruptionLevel * 0.4})`
              : `0 0 20px rgba(0,255,65,0.15)`,
        }}
        animationDuration={200}
      />
    </div>
  );
}
