'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { getMoveLog } from '@/lib/events';
import type { PieceDropHandlerArgs } from 'react-chessboard';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface ChessBoardProps {
  corruptionLevel: number;
  onGameOver: (won: boolean) => void;
  onDialogue: (text: string) => void;
  onLog: (text: string) => void;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;
  difficulty: number;
}

export default function ChessBoard({
  corruptionLevel,
  onGameOver,
  onDialogue,
  onLog,
  isThinking,
  setIsThinking,
  difficulty
}: ChessBoardProps) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [shake, setShake] = useState(false);
  const gameOverFired = useRef(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const doAIMove = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isGameOver() || chess.turn() !== 'b') return;

    const delay = 600 + Math.random() * 1000;

    setTimeout(() => {
      const moves = chess.moves();
      if (moves.length === 0) return;

      let moveSan;
      if (difficulty > 10) {
        moveSan = moves.find(m => m.includes('#')) || moves.find(m => m.includes('x')) || moves[0];
      } else {
        moveSan = moves[Math.floor(Math.random() * moves.length)];
      }

      const result = chess.move(moveSan);
      if (!result) return;

      setFen(chess.fen());
      onLog(getMoveLog(moveSan, !!result.captured, chess.isCheck(), corruptionLevel));

      if (!!result.captured && corruptionLevel > 0.4) triggerShake();

      setIsThinking(false);

      if (chess.isGameOver()) {
        if (!gameOverFired.current) {
          gameOverFired.current = true;
          onGameOver(false); // AI Won
        }
      }
    }, delay);
  }, [corruptionLevel, onLog, onGameOver, setIsThinking, difficulty]);

  const onPieceDrop = (args: PieceDropHandlerArgs): boolean => {
    const chess = chessRef.current;
    if (chess.turn() !== 'w' || isThinking || !args.targetSquare) return false;

    try {
      const result = chess.move({ from: args.sourceSquare, to: args.targetSquare, promotion: 'q' });
      if (!result) return false;

      setFen(chess.fen());
      onLog(getMoveLog(result.san, !!result.captured, chess.isCheck(), corruptionLevel));

      if (chess.isGameOver()) {
        if (!gameOverFired.current) {
          gameOverFired.current = true;
          onGameOver(true); // Player Won
        }
        return true;
      }

      setIsThinking(true);
      doAIMove();
      return true;
    } catch (err) {
      return false;
    }
  };

  const darkSquareStr = corruptionLevel < 0.3 ? '#0d1f0d' : corruptionLevel < 0.65 ? '#1a0e0e' : '#200505';
  const lightSquareStr = corruptionLevel < 0.3 ? '#1a3a1a' : corruptionLevel < 0.65 ? '#2d1414' : '#3a0808';

  return (
    <div className={`w-full aspect-square transition-transform duration-200 ${shake ? 'scale-[1.01]' : ''}`}>
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          darkSquareStyle: { backgroundColor: darkSquareStr },
          lightSquareStyle: { backgroundColor: lightSquareStr },
          boardStyle: {
            borderRadius: '2px',
            boxShadow: corruptionLevel > 0.5 
              ? `0 0 30px rgba(255,0,0,${corruptionLevel * 0.4})` 
              : `0 0 20px rgba(0,255,65,0.15)`,
          },
          animationDurationInMs: 200,
        }}
      />
    </div>
  );
}
